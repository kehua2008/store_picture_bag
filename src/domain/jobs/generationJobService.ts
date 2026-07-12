import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { buildApparelPromptRecipe } from "../prompts/apparelRecipe";
import { simulatePhotoMetadata } from "../images/photoMetadata";
import { findTopSellerStylePreset } from "../prompts/topSellerStylePresets";
import type { GeneratedImage, ImageProvider, ProviderError } from "../provider/types";
import type { ReferenceImageInput } from "../vipshop/types";
import { findPlatformSpec, findSpecImageType, imageTypeForCategory, specsForPlatform } from "../apparel/options";
import type { ProductAnalysis } from "../suites/productAnalysis";
import type { SuiteCreativePlan, SuiteCreativePlanItem } from "../suites/suiteCreativePlan";
import { findPlatformImageType, type GenerationMode, type SuitePlanItem, type SuiteSurface } from "../suites/suitePresets";
import type {
  ApparelCategory,
  ApparelScene,
  CommercePlatform,
  ModelMode,
  ModelProfile,
  ModelAgeRange,
  ModelGender,
  ModelHairStyle,
  ModelSkinTone,
  SceneVariant,
  SizePreset
} from "../apparel/options";
import { persistentDataDir } from "../../server/storagePaths";
import { imageCreditsForUnit, type CreditRechargePlan } from "../billing/creditPlans";

export type GenerationJobStatus = "running" | "succeeded" | "partial_failed" | "failed" | "canceled";
export type ProductGroupingMode = "per_image" | "single_product_multi_angle" | "outfit_combo";
export type PhotoMetadataMode = "none" | "simulated";
export type ProductReferenceRole = "top_outerwear" | "bottom" | "shoes" | "hat_accessory" | "bag" | "other";
export type OutfitSelectionMode = "all" | "random_count";
export const maxGenerationConcurrency = normalizePositiveInteger(Number(process.env.GENERATION_JOB_CONCURRENCY), 1);
export const maxActiveGenerationRuns = normalizePositiveInteger(Number(process.env.GENERATION_JOB_ACTIVE_RUNS), 2);
export const generationJobRetentionMs = 24 * 60 * 60 * 1000;
const merchantInfoGraphicImageTypeId = "detail_merchant_info_graphic";

export interface GenerationJobOptions {
  platform: CommercePlatform;
  category: ApparelCategory;
  productCategoryId?: string;
  productCategoryLabel?: string;
  scene: ApparelScene;
  sceneVariant: SceneVariant;
  size: SizePreset;
  modelProfile: ModelProfile;
  count: number;
  imageTypeCounts?: Record<string, number>;
  specId: string;
  imageTypeId: string;
  imageTypeIds: string[];
  productGroupingMode?: ProductGroupingMode;
  productReferenceRoles?: ProductReferenceRole[];
  outfitSelectionMode?: OutfitSelectionMode;
  outfitItemCount?: number;
  merchantPrompt?: string;
  targetWidth: number;
  targetHeight: number;
  customSpecName?: string;
  modelMode: ModelMode;
  modelGender?: ModelGender;
  modelAgeRange?: ModelAgeRange;
  modelSkinTone?: ModelSkinTone;
  modelHairStyle?: ModelHairStyle;
  customModelId?: string;
  customModelName?: string;
  posterTitle?: string;
  posterSubtitle?: string;
  posterBullets?: string[];
  posterTemplateId?: string;
  moduleCopies?: Array<{
    suiteItemId?: string;
    imageTypeId: string;
    imageTypeLabel: string;
    title: string;
    subtitle: string;
    bullets: string[];
    templateId: string;
    detailNotes?: string;
  }>;
  suiteModuleConfigs?: SuiteModuleConfig[];
  topSellerStyleId?: string;
  topSellerStyleIds?: string[];
  customStyleIds?: string[];
  customStyleLabels?: string[];
  customStylePrompts?: string[];
  photoMetadataMode?: PhotoMetadataMode;
  userPrompt?: string;
  generationMode?: GenerationMode;
  suitePresetId?: string;
  suiteSurface?: SuiteSurface;
  suiteItems?: SuitePlanItem[];
  productAnalysis?: ProductAnalysis;
  suiteCreativePlan?: SuiteCreativePlan;
  billingImageCreditsPerUnit?: number;
}

export interface SourceImage {
  id: string;
  filename: string;
  mimeType: string;
  file: Blob;
  role?: ProductReferenceRole;
  colorGroupId?: string;
  colorGroupLabel?: string;
}

export interface SourceImageGroup {
  id: string;
  label?: string;
  images: SourceImage[];
}

export interface SuiteModuleConfig {
  suiteItemId: string;
  baseSuiteItemId?: string;
  imageTypeId?: string;
  role?: string;
  label?: string;
  enabled?: boolean;
  outputCount?: number;
  selectedColorGroupIds?: string[];
  detailNotes?: string;
  colorShotRequests?: Array<{
    colorGroupId: string;
    colorLabel: string;
    count: number;
    shots: string[];
  }>;
}

export interface GenerationJob {
  id: string;
  mode: "image_edit";
  options: GenerationJobOptions;
  customerId?: string;
  createdByActorId?: string;
  createdByActorName?: string;
  reservedCredits?: number;
  chargedCredits?: number;
  sourceImages: SourceImage[];
  sourceImageGroups: SourceImageGroup[];
  status: GenerationJobStatus;
  progress: {
    completed: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  modelReferenceImage?: SourceImage;
  merchantInfoImage?: SourceImage;
  styleReferenceImages?: SourceImage[];
  prompt: {
    summary: string;
    identityLock: string;
    body: string;
    negativePrompt: string;
    targetWidth: number;
    targetHeight: number;
    providerSize: string;
  };
  results: GeneratedImage[];
  failures: GenerationJobFailure[];
  suiteCreativePlan?: SuiteCreativePlan;
  error?: ProviderError;
}

export interface GenerationJobFailure {
  order: number;
  expectedCount: number;
  sourceFilename: string;
  imageTypeId: string;
  imageTypeLabel: string;
  suiteItemId?: string;
  suiteOrder?: number;
  suiteRole?: SuitePlanItem["role"];
  suiteLabel?: string;
  visualMode?: SuitePlanItem["visualMode"];
  colorPolicy?: SuitePlanItem["colorPolicy"];
  modelPolicy?: SuitePlanItem["modelPolicy"];
  sourcePolicy?: SuitePlanItem["sourcePolicy"];
  textPolicy?: SuitePlanItem["textPolicy"];
  topSellerStyleId?: string;
  topSellerStyleLabel?: string;
  customStyleId?: string;
  customStyleLabel?: string;
  error: ProviderError;
}

export interface SerializableGenerationJob extends Omit<GenerationJob, "sourceImages" | "sourceImageGroups" | "modelReferenceImage" | "merchantInfoImage" | "styleReferenceImages"> {
  sourceImages: Array<Pick<SourceImage, "id" | "filename" | "mimeType" | "role" | "colorGroupId" | "colorGroupLabel">>;
  sourceImageGroups: Array<{
    id: string;
    label?: string;
    images: Array<Pick<SourceImage, "id" | "filename" | "mimeType" | "role" | "colorGroupId" | "colorGroupLabel">>;
  }>;
  modelReferenceImage?: Pick<SourceImage, "id" | "filename" | "mimeType">;
  merchantInfoImage?: Pick<SourceImage, "id" | "filename" | "mimeType">;
  styleReferenceImages?: Array<Pick<SourceImage, "id" | "filename" | "mimeType">>;
}

export interface GenerationJobRepository {
  save(job: GenerationJob): GenerationJob;
  findById(id: string): GenerationJob | undefined;
  all(): GenerationJob[];
  findByCustomerId(customerId: string): GenerationJob[];
  delete(id: string): boolean;
  deleteOlderThan(cutoffTime: number): GenerationJob[];
}

export class InMemoryGenerationJobRepository implements GenerationJobRepository {
  private readonly jobs = new Map<string, GenerationJob>();

  save(job: GenerationJob): GenerationJob {
    const normalized = normalizeGenerationJobResultCount(job);
    this.jobs.set(normalized.id, normalized);
    return normalized;
  }

  findById(id: string): GenerationJob | undefined {
    return this.jobs.get(id);
  }

  all(): GenerationJob[] {
    return Array.from(this.jobs.values());
  }

  findByCustomerId(customerId: string): GenerationJob[] {
    return this.all()
      .filter((job) => job.customerId === customerId)
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt ?? left.createdAt).getTime();
        const rightTime = new Date(right.updatedAt ?? right.createdAt).getTime();
        return rightTime - leftTime;
      });
  }

  delete(id: string): boolean {
    return this.jobs.delete(id);
  }

  deleteOlderThan(cutoffTime: number): GenerationJob[] {
    const deleted: GenerationJob[] = [];
    this.jobs.forEach((job, id) => {
      const retentionTime = retentionTimestamp(job);
      if (Number.isFinite(retentionTime) && retentionTime < cutoffTime) {
        this.jobs.delete(id);
        deleted.push(job);
      }
    });
    return deleted;
  }
}

interface GenerationJobData {
  jobs: PersistedGenerationJob[];
}

type PersistedGenerationJob = Omit<GenerationJob, "sourceImages" | "sourceImageGroups" | "modelReferenceImage" | "merchantInfoImage" | "styleReferenceImages"> & {
  sourceImages: Array<Pick<SourceImage, "id" | "filename" | "mimeType" | "role" | "colorGroupId" | "colorGroupLabel">>;
  sourceImageGroups: Array<{
    id: string;
    label?: string;
    images: Array<Pick<SourceImage, "id" | "filename" | "mimeType" | "role" | "colorGroupId" | "colorGroupLabel">>;
  }>;
  modelReferenceImage?: Pick<SourceImage, "id" | "filename" | "mimeType">;
  merchantInfoImage?: Pick<SourceImage, "id" | "filename" | "mimeType">;
  styleReferenceImages?: Array<Pick<SourceImage, "id" | "filename" | "mimeType">>;
};

export class FileGenerationJobRepository implements GenerationJobRepository {
  private readonly dataFile: string;
  private readonly cache = new Map<string, GenerationJob>();
  private loaded = false;

  constructor(options: { dataDir?: string } = {}) {
    this.dataFile = path.join(options.dataDir ?? persistentDataDir(), "generation-jobs.json");
  }

  save(job: GenerationJob): GenerationJob {
    this.loadIntoCache();
    const normalized = normalizeGenerationJobResultCount(job);
    const materialized = materializeGenerationJobResults(normalized);
    this.cache.set(materialized.id, materialized);
    this.persistCache();
    return materialized;
  }

  findById(id: string): GenerationJob | undefined {
    this.loadIntoCache();
    return this.cache.get(id);
  }

  all(): GenerationJob[] {
    this.loadIntoCache();
    return Array.from(this.cache.values());
  }

  findByCustomerId(customerId: string): GenerationJob[] {
    return this.all()
      .filter((job) => job.customerId === customerId)
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt ?? left.createdAt).getTime();
        const rightTime = new Date(right.updatedAt ?? right.createdAt).getTime();
        return rightTime - leftTime;
      });
  }

  delete(id: string): boolean {
    this.loadIntoCache();
    const deleted = this.cache.delete(id);
    if (deleted) this.persistCache();
    return deleted;
  }

  deleteOlderThan(cutoffTime: number): GenerationJob[] {
    this.loadIntoCache();
    const deleted: GenerationJob[] = [];
    this.cache.forEach((job, id) => {
      const retentionTime = retentionTimestamp(job);
      if (Number.isFinite(retentionTime) && retentionTime < cutoffTime) {
        this.cache.delete(id);
        deleted.push(job);
      }
    });
    if (deleted.length) this.persistCache();
    return deleted;
  }

  private loadIntoCache(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = readFileSync(this.dataFile, "utf8");
      const parsed = JSON.parse(raw) as Partial<GenerationJobData>;
      const jobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
      for (const job of jobs) {
        if (!job?.id) continue;
        this.cache.set(job.id, rehydrateGenerationJob(job));
      }
    } catch {
      // Missing or malformed persistence file starts as an empty job list.
    }
  }

  private persistCache(): void {
    const data: GenerationJobData = {
      jobs: Array.from(this.cache.values()).map(persistGenerationJob)
    };
    try {
      mkdirSync(path.dirname(this.dataFile), { recursive: true });
      const tempFile = `${this.dataFile}.${process.pid}.${Date.now()}.tmp`;
      writeFileSync(tempFile, JSON.stringify(data, null, 2));
      renameSync(tempFile, this.dataFile);
    } catch {
      // Persistence failure should not block in-memory generation.
    }
  }
}

function retentionTimestamp(job: Pick<GenerationJob, "createdAt" | "updatedAt">): number {
  const updatedTime = new Date(job.updatedAt ?? "").getTime();
  if (Number.isFinite(updatedTime)) return updatedTime;
  return new Date(job.createdAt).getTime();
}

function persistGenerationJob(job: GenerationJob): PersistedGenerationJob {
  const materialized = materializeGenerationJobResults(job);
  return {
    ...materialized,
    sourceImages: materialized.sourceImages.map(stripSourceImageFile),
    sourceImageGroups: materialized.sourceImageGroups.map((group) => ({
      id: group.id,
      label: group.label,
      images: group.images.map(stripSourceImageFile)
    })),
    modelReferenceImage: materialized.modelReferenceImage ? stripSourceImageFile(materialized.modelReferenceImage) : undefined,
    merchantInfoImage: materialized.merchantInfoImage ? stripSourceImageFile(materialized.merchantInfoImage) : undefined,
    styleReferenceImages: materialized.styleReferenceImages?.map(stripSourceImageFile)
  };
}

function materializeGenerationJobResults(job: GenerationJob): GenerationJob {
  return {
    ...job,
    results: job.results.map(materializeGeneratedImage)
  };
}

function materializeGeneratedImage(image: GeneratedImage): GeneratedImage {
  if (!image.base64) return image;

  const safeId = image.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const extension = extensionForMimeType(image.mimeType);
  const filename = `${safeId}.${extension}`;
  const imageDir = path.join(persistentDataDir(), "generated-images");

  try {
    mkdirSync(imageDir, { recursive: true });
    writeFileSync(path.join(imageDir, filename), Buffer.from(image.base64, "base64"));
    return {
      ...image,
      base64: "",
      url: image.url ?? `/generated-images/${filename}`
    };
  } catch {
    return image;
  }
}

function extensionForMimeType(mimeType: GeneratedImage["mimeType"]): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function rehydrateGenerationJob(job: PersistedGenerationJob): GenerationJob {
  return normalizeGenerationJobResultCount({
    ...job,
    sourceImages: job.sourceImages.map(rehydrateSourceImage),
    sourceImageGroups: job.sourceImageGroups.map((group) => ({
      id: group.id,
      label: group.label,
      images: group.images.map(rehydrateSourceImage)
    })),
    modelReferenceImage: job.modelReferenceImage ? rehydrateSourceImage(job.modelReferenceImage) : undefined,
    merchantInfoImage: job.merchantInfoImage ? rehydrateSourceImage(job.merchantInfoImage) : undefined,
    styleReferenceImages: job.styleReferenceImages?.map(rehydrateSourceImage),
    failures: job.failures ?? []
  });
}

function stripSourceImageFile(image: SourceImage): Pick<SourceImage, "id" | "filename" | "mimeType" | "role" | "colorGroupId" | "colorGroupLabel"> {
  return {
    id: image.id,
    filename: image.filename,
    mimeType: image.mimeType,
    role: image.role,
    colorGroupId: image.colorGroupId,
    colorGroupLabel: image.colorGroupLabel
  };
}

function rehydrateSourceImage(image: Pick<SourceImage, "id" | "filename" | "mimeType" | "role" | "colorGroupId" | "colorGroupLabel">): SourceImage {
  return {
    ...image,
    file: new Blob([], { type: image.mimeType })
  };
}

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.trunc(value));
}

export class GenerationJobService {
  private readonly activeRuns = new Set<string>();

  constructor(
    private readonly repository: GenerationJobRepository,
    private readonly provider: ImageProvider,
    private readonly billing?: {
      onSucceeded?: (job: GenerationJob) => Promise<void> | void;
      onFailed?: (job: GenerationJob) => Promise<void> | void;
      onCanceled?: (job: GenerationJob) => Promise<void> | void;
    }
  ) {}

  createJob(input: { options: GenerationJobOptions; sourceImages: SourceImage[]; modelReferenceImage?: SourceImage; merchantInfoImage?: SourceImage; styleReferenceImages?: SourceImage[]; customerId?: string; createdByActorId?: string; createdByActorName?: string; reservedCredits?: number }): GenerationJob {
    this.cleanupExpiredJobs();
    const now = new Date().toISOString();
    const recipe = buildApparelPromptRecipe(input.options);
    const plannedItems = plannedGenerationItems(input.options);
    const sourceImageGroups = buildSourceImageGroups(input.sourceImages, input.options.productGroupingMode);
    const merchantInfoSourceImageGroup = buildMerchantInfoSourceImageGroup(input.merchantInfoImage);
    const tasks = buildPlannedGenerationTasks(sourceImageGroups, plannedItems, merchantInfoSourceImageGroup);
    const total = tasks.reduce((sum, task) => sum + plannedItemCount(task.plannedItem), 0);

    return this.repository.save({
      id: `job-${crypto.randomUUID()}`,
      mode: "image_edit",
      options: input.options,
      customerId: input.customerId,
      createdByActorId: input.createdByActorId,
      createdByActorName: input.createdByActorName,
      reservedCredits: input.reservedCredits,
      sourceImages: input.sourceImages,
      sourceImageGroups,
      modelReferenceImage: input.modelReferenceImage,
      merchantInfoImage: input.merchantInfoImage,
      styleReferenceImages: input.styleReferenceImages ?? [],
      status: "running",
      progress: { completed: 0, total },
      createdAt: now,
      updatedAt: now,
      prompt: {
        summary: recipe.userVisibleSummary,
        identityLock: recipe.identityLock,
        body: recipe.providerPrompt,
        negativePrompt: recipe.negativePrompt,
        targetWidth: recipe.target.width,
        targetHeight: recipe.target.height,
        providerSize: `${recipe.target.width}x${recipe.target.height}`
      },
      results: [],
      failures: [],
      suiteCreativePlan: input.options.suiteCreativePlan
    });
  }

  async runJob(id: string): Promise<GenerationJob | undefined> {
    const job = this.repository.findById(id);
    if (!job) return undefined;
    if (job.status !== "running") return job;
    if (this.activeRuns.has(id)) return job;
    if (this.activeRuns.size >= maxActiveGenerationRuns) return job;

    const plannedItems = plannedGenerationItems(job.options);
    const tasks = buildPlannedGenerationTasks(job.sourceImageGroups, plannedItems, buildMerchantInfoSourceImageGroup(job.merchantInfoImage));
    logGenerationMemory("start", job, { taskCount: tasks.length });
    const resultsByOrder = groupExistingResultsByTaskOrder(job.results, tasks);
    const failuresByOrder = new Map<number, GenerationJobFailure>(job.failures.map((failure) => [failure.order, failure]));
    let nextTaskIndex = 0;

    const collectResults = () => Array.from(resultsByOrder.entries())
      .sort(([left], [right]) => left - right)
      .flatMap(([, images]) => images)
      .slice(0, job.progress.total);
    const collectFailures = () => Array.from(failuresByOrder.entries())
      .sort(([left], [right]) => left - right)
      .map(([, failure]) => failure);

    this.activeRuns.add(id);
    try {
      const runWorker = async () => {
        while (true) {
          const task = tasks[nextTaskIndex];
          nextTaskIndex += 1;
          if (!task) return;
          if (resultsByOrder.has(task.order) || failuresByOrder.has(task.order)) continue;

          const currentJob = this.repository.findById(id);
          if (!currentJob || currentJob.status === "canceled") return;

          const generated = await this.runPlannedGenerationTask(job, task);
          const latestJob = this.repository.findById(id);
          if (!latestJob || latestJob.status === "canceled") return;

          if (!generated.ok) {
            failuresByOrder.set(task.order, buildGenerationFailure(job, task, generated.error));
            const results = collectResults();
            this.repository.save({
              ...latestJob,
              results,
              failures: collectFailures(),
              progress: { ...latestJob.progress, completed: results.length },
              updatedAt: new Date().toISOString()
            });
            continue;
          }

          resultsByOrder.set(task.order, generated.value.map(materializeGeneratedImage));
          const results = collectResults();
          this.repository.save({
            ...latestJob,
            results,
            failures: collectFailures(),
            progress: { completed: results.length, total: latestJob.progress.total },
            updatedAt: new Date().toISOString()
          });
        }
      };

      await Promise.all(Array.from({ length: Math.min(maxGenerationConcurrency, tasks.length) }, () => runWorker()));

      const latestJob = this.repository.findById(id);
      if (!latestJob || latestJob.status === "canceled") return latestJob;

      const results = collectResults();
      const failures = collectFailures();
      const chargedCredits = estimateGeneratedImageCredits(results, latestJob.options.billingImageCreditsPerUnit);
      const finalStatus: GenerationJobStatus = results.length > 0
        ? (failures.length ? "partial_failed" : "succeeded")
        : "failed";
      const settlementJob = {
        ...latestJob,
        status: finalStatus,
        progress: { completed: results.length, total: latestJob.progress.total },
        updatedAt: new Date().toISOString(),
        results,
        failures,
        chargedCredits,
        error: failures[0]?.error
      };
      this.repository.save({ ...settlementJob, status: "running" });
      try {
        if (results.length > 0) {
          await this.billing?.onSucceeded?.(settlementJob);
        } else {
          await this.billing?.onFailed?.(settlementJob);
        }
      } finally {
        this.repository.save(settlementJob);
      }
      logGenerationMemory("finish", settlementJob, { taskCount: tasks.length });
      return this.repository.findById(id);
    } finally {
      this.activeRuns.delete(id);
    }
  }

  private async runPlannedGenerationTask(job: GenerationJob, task: PlannedGenerationTask): Promise<{ ok: true; value: GeneratedImage[] } | { ok: false; error: ProviderError }> {
    const { plannedItem, sourceImageGroup } = task;
    const primarySourceImage = sourceImageGroup.images[0];
    if (!primarySourceImage) return { ok: true, value: [] };
    const styleReferenceImages = resolveStyleReferenceImages(job, plannedItem);

    const imageTypeId = plannedItem.imageTypeId;
    const resolved = resolveImageType(job.options, imageTypeId, plannedItem.specId);
    const imageType = resolved?.imageType ? imageTypeForCategory(resolved.imageType, job.options.category, job.options.productCategoryId) : undefined;
    const spec = resolved?.spec;
    const targetWidth = plannedItem.targetWidth ?? spec?.targetWidth ?? job.options.targetWidth;
    const targetHeight = plannedItem.targetHeight ?? spec?.targetHeight ?? job.options.targetHeight;
    const taskOptions = optionsForSuitePolicy(optionsForPlannedItem(job.options, imageTypeId), plannedItem);
    const typeRecipe = buildApparelPromptRecipe({
      ...taskOptions,
      specId: plannedItem.specId ?? spec?.id ?? job.options.specId,
      imageTypeId,
      scene: imageType?.scene ?? job.options.scene,
      sceneVariant: imageType?.sceneVariant ?? job.options.sceneVariant,
      targetWidth,
      targetHeight,
      topSellerStyleId: plannedItem.topSellerStyleId,
      moduleCopy: moduleCopyForPlannedItem(job.options, plannedItem),
      customStylePrompts: plannedItem.customStylePrompt ? [plannedItem.customStylePrompt] : undefined,
      styleReferenceCount: styleReferenceImages.length,
      suiteRole: plannedItem.suiteRole,
      productAnalysis: job.options.productAnalysis,
      suiteCreativeItem: plannedItem.suiteCreativeItem,
      suiteModuleConfig: plannedItem.suiteModuleConfig,
      colorGroupLabel: plannedItem.colorGroupLabel,
      shotLabel: plannedItem.shotLabel,
      styleVariationIndex: plannedItem.styleVariationIndex,
      styleVariationTotal: plannedItem.styleVariationTotal
    });
    const referenceImage: ReferenceImageInput = {
      id: primarySourceImage.id,
      filename: primarySourceImage.filename,
      mimeType: primarySourceImage.mimeType,
      file: primarySourceImage.file
    };
    const generated = await this.provider.generate({
      recipe: typeRecipe,
      referenceImage,
      referenceImages: [
        ...sourceImageGroup.images.map((item) => ({
          id: item.id,
          filename: item.filename,
          mimeType: item.mimeType,
          file: item.file
        })),
        ...styleReferenceImages.map((item) => ({
          id: item.id,
          filename: item.filename,
          mimeType: item.mimeType,
          file: item.file
        }))
      ],
      modelReferenceImage: isMerchantInfoGraphicImageType(imageTypeId) || taskOptions.modelMode === "no_model" ? undefined : job.modelReferenceImage,
      n: plannedItemCount(plannedItem)
    });

    if (!generated.ok) return generated;

    const generatedImages = job.options.photoMetadataMode === "simulated"
      ? await Promise.all(generated.value.map((image) => simulatePhotoMetadata(image)))
      : generated.value;

    return {
      ok: true,
      value: generatedImages.slice(0, plannedItemCount(plannedItem)).map((image, index) => ({
        ...image,
        id: uniqueGeneratedImageId(image.id, task.order, imageTypeId, index),
        generationOrder: task.order,
        sourceFilename: sourceImageGroup.images.map((item) => item.filename).join(" + "),
        imageTypeId,
        imageTypeLabel: imageType?.label ?? imageTypeId,
        suiteItemId: plannedItem.suiteItemId,
        suiteOrder: plannedItem.suiteOrder,
        suiteRole: plannedItem.suiteRole,
        suiteLabel: plannedItem.suiteLabel,
        topSellerStyleId: plannedItem.topSellerStyleId,
        topSellerStyleLabel: plannedItem.topSellerStyleLabel,
        customStyleId: plannedItem.customStyleId,
        customStyleLabel: plannedItem.customStyleLabel,
        suiteCreativeItem: plannedItem.suiteCreativeItem
      }))
    };
  }

  getJob(id: string): GenerationJob | undefined {
    this.cleanupExpiredJobs();
    return this.repository.findById(id);
  }

  listJobsForCustomer(customerId: string): GenerationJob[] {
    this.cleanupExpiredJobs();
    return this.repository.findByCustomerId(customerId);
  }

  async runDueJobs(): Promise<GenerationJob[]> {
    this.cleanupExpiredJobs();
    const runningJobs = this.repository.all().filter((job) => job.status === "running");
    const results: GenerationJob[] = [];
    for (const job of runningJobs) {
      const result = await this.runJob(job.id);
      if (result) results.push(result);
    }
    return results;
  }

  async cancelJob(id: string): Promise<GenerationJob | undefined> {
    this.cleanupExpiredJobs();
    const job = this.repository.findById(id);
    if (!job) return undefined;
    if (job.status !== "running") return job;

    const pending = this.repository.save({
      ...job,
      updatedAt: new Date().toISOString()
    });
    const canceled = { ...pending, status: "canceled" as const, updatedAt: new Date().toISOString() };
    try {
      await this.billing?.onCanceled?.(pending);
    } finally {
      this.repository.save(canceled);
    }
    return this.repository.findById(id);
  }

  cleanupExpiredJobs(now = Date.now()): GenerationJob[] {
    return this.repository.deleteOlderThan(now - generationJobRetentionMs);
  }

  private async settleFailedJob(id: string, error: ProviderError): Promise<void> {
    const latest = this.repository.findById(id);
    if (!latest) return;
    const failed = {
      ...latest,
      status: "failed" as const,
      updatedAt: new Date().toISOString(),
      error
    };
    try {
      await this.billing?.onFailed?.(latest);
    } finally {
      this.repository.save(failed);
    }
  }
}

function uniqueGeneratedImageId(id: string, taskOrder: number, imageTypeId: string, index: number): string {
  return `${id}-${taskOrder}-${imageTypeId}-${index}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function resolveStyleReferenceImages(job: GenerationJob, plannedItem: PlannedGenerationItem): SourceImage[] {
  const styleImages = job.styleReferenceImages ?? [];
  if (!styleImages.length || !plannedItem.customStylePrompt) return [];
  if (styleImages.length === 1) return styleImages;

  const index = plannedItem.styleReferenceImageIndex;
  if (typeof index === "number" && index >= 0 && index < styleImages.length) {
    return [styleImages[index]!];
  }

  return styleImages;
}

export function serializeGenerationJob(job: GenerationJob): SerializableGenerationJob {
  const normalized = normalizeGenerationJobResultCount(job);
  return {
    ...normalized,
    sourceImages: normalized.sourceImages.map(({ id, filename, mimeType, role, colorGroupId, colorGroupLabel }) => ({ id, filename, mimeType, role, colorGroupId, colorGroupLabel })),
    sourceImageGroups: normalized.sourceImageGroups.map((group) => ({
      id: group.id,
      label: group.label,
      images: group.images.map(({ id, filename, mimeType, role, colorGroupId, colorGroupLabel }) => ({ id, filename, mimeType, role, colorGroupId, colorGroupLabel }))
    })),
    modelReferenceImage: normalized.modelReferenceImage
      ? {
          id: normalized.modelReferenceImage.id,
          filename: normalized.modelReferenceImage.filename,
          mimeType: normalized.modelReferenceImage.mimeType
        }
      : undefined,
    merchantInfoImage: normalized.merchantInfoImage
      ? {
          id: normalized.merchantInfoImage.id,
          filename: normalized.merchantInfoImage.filename,
          mimeType: normalized.merchantInfoImage.mimeType
        }
      : undefined,
    styleReferenceImages: normalized.styleReferenceImages?.map(({ id, filename, mimeType }) => ({ id, filename, mimeType }))
  };
}

function normalizeGenerationJobResultCount<T extends GenerationJob>(job: T): T {
  const total = Math.max(0, job.progress.total);
  if (job.results.length <= total && job.progress.completed <= total) return job;

  const results = job.results.slice(0, total);
  return {
    ...job,
    results,
    progress: {
      ...job.progress,
      completed: Math.min(job.progress.completed, results.length, total)
    }
  };
}

function buildGenerationFailure(job: GenerationJob, task: PlannedGenerationTask, error: ProviderError): GenerationJobFailure {
  const { plannedItem, sourceImageGroup } = task;
  const resolved = resolveImageType(job.options, plannedItem.imageTypeId, plannedItem.specId);
  const imageType = resolved?.imageType ? imageTypeForCategory(resolved.imageType, job.options.category, job.options.productCategoryId) : undefined;

  return {
    order: task.order,
    expectedCount: plannedItemCount(plannedItem),
    sourceFilename: sourceImageGroup.images.map((item) => item.filename).join(" + "),
    imageTypeId: plannedItem.imageTypeId,
    imageTypeLabel: imageType?.label ?? plannedItem.imageTypeId,
    suiteItemId: plannedItem.suiteItemId,
    suiteOrder: plannedItem.suiteOrder,
    suiteRole: plannedItem.suiteRole,
    suiteLabel: plannedItem.suiteLabel,
    topSellerStyleId: plannedItem.topSellerStyleId,
    topSellerStyleLabel: plannedItem.topSellerStyleLabel,
    customStyleId: plannedItem.customStyleId,
    customStyleLabel: plannedItem.customStyleLabel,
    error
  };
}

function groupExistingResultsByTaskOrder(results: GeneratedImage[], tasks: PlannedGenerationTask[]): Map<number, GeneratedImage[]> {
  const taskOrders = new Set(tasks.map((task) => task.order));
  const grouped = new Map<number, GeneratedImage[]>();
  results.forEach((result, index) => {
    const order = typeof result.generationOrder === "number" && taskOrders.has(result.generationOrder)
      ? result.generationOrder
      : inferTaskOrderFromGeneratedImage(result, index, taskOrders);
    grouped.set(order, [...(grouped.get(order) ?? []), result]);
  });
  return grouped;
}

function inferTaskOrderFromGeneratedImage(result: GeneratedImage, index: number, taskOrders: Set<number>): number {
  const escapedImageType = escapeRegExp(result.imageTypeId ?? "");
  const match = escapedImageType ? result.id.match(new RegExp(`-(\\d+)-${escapedImageType}-\\d+$`)) : undefined;
  const parsed = match ? Number.parseInt(match[1] ?? "", 10) : undefined;
  if (typeof parsed === "number" && Number.isInteger(parsed) && taskOrders.has(parsed)) return parsed;
  return index;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface PlannedGenerationItem {
  imageTypeId: string;
  count?: number;
  specId?: string;
  targetWidth?: number;
  targetHeight?: number;
  suiteItemId?: string;
  suiteOrder?: number;
  suiteRole?: SuitePlanItem["role"];
  suiteLabel?: string;
  visualMode?: SuitePlanItem["visualMode"];
  colorPolicy?: SuitePlanItem["colorPolicy"];
  modelPolicy?: SuitePlanItem["modelPolicy"];
  sourcePolicy?: SuitePlanItem["sourcePolicy"];
  textPolicy?: SuitePlanItem["textPolicy"];
  topSellerStyleId?: string;
  topSellerStyleLabel?: string;
  customStyleId?: string;
  customStyleLabel?: string;
  customStylePrompt?: string;
  styleReferenceImageIndex?: number;
  suiteCreativeItem?: SuiteCreativePlanItem;
  suiteModuleConfig?: SuiteModuleConfig;
  colorGroupId?: string;
  colorGroupLabel?: string;
  shotLabel?: string;
  styleVariationIndex?: number;
  styleVariationTotal?: number;
}

interface PlannedGenerationTask {
  order: number;
  sourceImageGroup: SourceImageGroup;
  plannedItem: PlannedGenerationItem;
}

function buildSourceImageGroups(sourceImages: SourceImage[], mode?: ProductGroupingMode): SourceImageGroup[] {
  if (sourceImages.length === 0) return [];
  if (mode === "single_product_multi_angle" || mode === "outfit_combo") {
    return [
      {
        id: mode === "outfit_combo" ? "outfit-1" : "product-1",
        images: sourceImages
      }
    ];
  }

  return sourceImages.map((image, index) => ({
    id: `product-${index + 1}`,
    images: [image]
  }));
}

function buildMerchantInfoSourceImageGroup(merchantInfoImage?: SourceImage): SourceImageGroup | undefined {
  if (!merchantInfoImage) return undefined;
  return {
    id: "merchant-info-1",
    images: [merchantInfoImage]
  };
}

function buildPlannedGenerationTasks(sourceImageGroups: SourceImageGroup[], plannedItems: PlannedGenerationItem[], merchantInfoSourceImageGroup?: SourceImageGroup): PlannedGenerationTask[] {
  const tasks: PlannedGenerationTask[] = [];
  const normalItems = plannedItems.filter((item) => !isMerchantInfoGraphicImageType(item.imageTypeId));
  const allSourceGroup = sourceImageGroups[0];
  if (normalItems.every((item) => !item.suiteItemId)) {
    for (const sourceImageGroup of sourceImageGroups) {
      if (!sourceImageGroup.images[0]) continue;
      for (const plannedItem of normalItems) {
        tasks.push({
          order: tasks.length,
          sourceImageGroup,
          plannedItem
        });
      }
    }
  } else {
    for (const plannedItem of normalItems) {
      if (!plannedItem.suiteItemId) {
        for (const sourceImageGroup of sourceImageGroups) {
          if (!sourceImageGroup.images[0]) continue;
          tasks.push({
            order: tasks.length,
            sourceImageGroup,
            plannedItem
          });
        }
        continue;
      }

      const sourceImageGroup = sourceImageGroupForPlannedItem(sourceImageGroups, plannedItem, merchantInfoSourceImageGroup);
      if (sourceImageGroup?.images[0]) {
        tasks.push({
          order: tasks.length,
          sourceImageGroup,
          plannedItem
        });
      }
    }
  }
  if (merchantInfoSourceImageGroup?.images[0]) {
    for (const plannedItem of plannedItems.filter((item) => isMerchantInfoGraphicImageType(item.imageTypeId))) {
      tasks.push({
        order: tasks.length,
        sourceImageGroup: merchantInfoSourceImageGroup,
        plannedItem
      });
    }
  }
  if (!tasks.length && allSourceGroup?.images[0]) {
    for (const plannedItem of normalItems) {
      tasks.push({
        order: tasks.length,
        sourceImageGroup: allSourceGroup,
        plannedItem
      });
    }
  }
  return tasks;
}

function sourceImageGroupForPlannedItem(sourceImageGroups: SourceImageGroup[], plannedItem: PlannedGenerationItem, merchantInfoSourceImageGroup?: SourceImageGroup): SourceImageGroup | undefined {
  if (plannedItem.sourcePolicy === "merchant_info" && merchantInfoSourceImageGroup?.images[0]) return merchantInfoSourceImageGroup;

  if (plannedItem.colorGroupId) {
    const colorImages = sourceImageGroups.flatMap((group) => group.images).filter((image) => image.colorGroupId === plannedItem.colorGroupId);
    if (colorImages.length) {
      return {
        id: `color-${plannedItem.colorGroupId}`,
        label: plannedItem.colorGroupLabel,
        images: colorImages
      };
    }
  }

  const selectedColorGroupIds = plannedItem.suiteModuleConfig?.selectedColorGroupIds?.filter(Boolean) ?? [];
  if (selectedColorGroupIds.length) {
    const selectedImages = sourceImageGroups
      .flatMap((group) => group.images)
      .filter((image) => image.colorGroupId && selectedColorGroupIds.includes(image.colorGroupId));
    if (selectedImages.length) {
      return {
        id: `selected-${selectedColorGroupIds.join("-")}`.slice(0, 120),
        label: selectedColorGroupIds.join(" / "),
        images: selectedImages
      };
    }
  }

  return sourceImageGroups[0];
}

function isMerchantInfoGraphicImageType(imageTypeId: string): boolean {
  return imageTypeId === merchantInfoGraphicImageTypeId;
}

function optionsForPlannedItem(options: GenerationJobOptions, imageTypeId: string): GenerationJobOptions {
  if (!isMerchantInfoGraphicImageType(imageTypeId)) return options;
  return {
    ...options,
    modelMode: "no_model",
    modelProfile: "product_only",
    modelGender: undefined,
    modelAgeRange: undefined,
    modelSkinTone: undefined,
    modelHairStyle: undefined,
    customModelId: undefined,
    customModelName: undefined
  };
}

function optionsForSuitePolicy(options: GenerationJobOptions, plannedItem: PlannedGenerationItem): GenerationJobOptions {
  const modelPolicy = plannedItem.modelPolicy;
  const visualMode = plannedItem.visualMode;
  const mustBeProductOnly = modelPolicy === "never" || visualMode === "product_only" || visualMode === "detail_closeup" || visualMode === "info_graphic";
  if (!mustBeProductOnly) return options;
  return {
    ...options,
    modelMode: "no_model",
    modelProfile: "product_only",
    modelGender: undefined,
    modelAgeRange: undefined,
    modelSkinTone: undefined,
    modelHairStyle: undefined,
    customModelId: undefined,
    customModelName: undefined
  };
}

function plannedGenerationItems(options: GenerationJobOptions): PlannedGenerationItem[] {
  const styleItems = plannedStyleItems(options);
  const attachStyles = (items: PlannedGenerationItem[]) => {
    const styledItems = items.flatMap((item) => styleItems.map((style) => ({ ...item, ...style })));
    const topSellerCounts = new Map<string, number>();
    const totalByStyleId = new Map<string, number>();
    for (const item of styledItems) {
      if (!item.topSellerStyleId) continue;
      totalByStyleId.set(item.topSellerStyleId, (totalByStyleId.get(item.topSellerStyleId) ?? 0) + 1);
    }
    return styledItems.map((item) => {
      if (!item.topSellerStyleId) return item;
      const index = topSellerCounts.get(item.topSellerStyleId) ?? 0;
      topSellerCounts.set(item.topSellerStyleId, index + 1);
      return {
        ...item,
        styleVariationIndex: index,
        styleVariationTotal: totalByStyleId.get(item.topSellerStyleId)
      };
    });
  };

  if (options.generationMode === "suite" && options.suiteItems?.length) {
    const creativeItemsBySuiteItemId = new Map(options.suiteCreativePlan?.items.map((item) => [item.suiteItemId, item]));
    const moduleConfigsBySuiteItemId = new Map(options.suiteModuleConfigs?.map((config) => [config.suiteItemId, config]));
    const plannedItems = options.suiteItems.flatMap((item) => {
      const moduleConfig = moduleConfigsBySuiteItemId.get(item.id);
      if (moduleConfig?.enabled === false) return [];
      const baseItem: PlannedGenerationItem = {
        imageTypeId: item.imageTypeId,
        count: countForSuiteItem(options, item, moduleConfig),
        specId: item.specId,
        targetWidth: item.targetWidth,
        targetHeight: item.targetHeight,
        suiteItemId: item.id,
        suiteOrder: item.order,
        suiteRole: item.role,
        suiteLabel: item.label,
        visualMode: item.visualMode,
        colorPolicy: item.colorPolicy,
        modelPolicy: item.modelPolicy,
        sourcePolicy: item.sourcePolicy,
        textPolicy: item.textPolicy,
        suiteCreativeItem: creativeItemsBySuiteItemId.get(moduleConfig?.baseSuiteItemId ?? item.id) ?? creativeItemsBySuiteItemId.get(item.id),
        suiteModuleConfig: moduleConfig
      };

      if (item.role !== "model_fit" || !moduleConfig?.colorShotRequests?.length) return [baseItem];

      return moduleConfig.colorShotRequests.flatMap((request) => {
        const count = clampSuiteModuleCount(request.count, 0, 3);
        const shots = request.shots.length ? request.shots : defaultModelShotLabels;
        return Array.from({ length: count }, (_, index) => {
          const shotLabel = shots[index] ?? `第${index + 1}张`;
          return {
            ...baseItem,
            count: 1,
            suiteLabel: `${item.label} · ${request.colorLabel}${shotLabel ? ` ${shotLabel}` : ""}`,
            colorGroupId: request.colorGroupId,
            colorGroupLabel: request.colorLabel,
            shotLabel
          };
        });
      });
    });
    return attachStyles(plannedItems);
  }

  const imageTypeIds = options.imageTypeIds.length ? options.imageTypeIds : [options.imageTypeId];
  return attachStyles(imageTypeIds.map((imageTypeId) => ({
    imageTypeId,
    count: countForImageType(options, imageTypeId),
    specId: options.specId,
    targetWidth: options.targetWidth,
    targetHeight: options.targetHeight
  })));
}

export function estimateGenerationJobCredits(input: { options: GenerationJobOptions; sourceImageCount: number; merchantInfoImageCount?: number; pricingPlan?: CreditRechargePlan }): number {
  const sourceGroupCount = input.options.productGroupingMode === "single_product_multi_angle" || input.options.productGroupingMode === "outfit_combo"
    ? (input.sourceImageCount > 0 ? 1 : 0)
    : input.sourceImageCount;
  return plannedGenerationItems(input.options).reduce((sum, item) => {
    const groupCount = isMerchantInfoGraphicImageType(item.imageTypeId)
      ? (input.merchantInfoImageCount ? 1 : 0)
      : sourceGroupCount;
    return sum + groupCount * creditsForImageType(item.imageTypeId, input.pricingPlan?.imageCreditsPerUnit ?? input.options.billingImageCreditsPerUnit) * plannedItemCount(item);
  }, 0);
}

export function estimateGenerationJobOutputCount(input: { options: GenerationJobOptions; sourceImageCount: number; merchantInfoImageCount?: number }): number {
  const sourceGroupCount = input.options.productGroupingMode === "single_product_multi_angle" || input.options.productGroupingMode === "outfit_combo"
    ? (input.sourceImageCount > 0 ? 1 : 0)
    : input.sourceImageCount;
  return plannedGenerationItems(input.options).reduce((sum, item) => {
    const groupCount = isMerchantInfoGraphicImageType(item.imageTypeId)
      ? (input.merchantInfoImageCount ? 1 : 0)
      : sourceGroupCount;
    return sum + groupCount * plannedItemCount(item);
  }, 0);
}

export function estimateGeneratedImageCredits(results: GeneratedImage[], imageCreditsPerUnit?: number): number {
  return results.reduce((sum, image) => sum + creditsForImageType(image.imageTypeId ?? "", imageCreditsPerUnit), 0);
}

const defaultModelShotLabels = ["正面", "侧面", "背面"];

function countForImageType(options: GenerationJobOptions, imageTypeId: string): number {
  const raw = options.imageTypeCounts?.[imageTypeId] ?? options.count;
  const value = Math.trunc(Number(raw));
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(99, value);
}

function countForSuiteItem(options: GenerationJobOptions, item: SuitePlanItem, moduleConfig?: SuiteModuleConfig): number {
  if (item.role === "model_fit" && moduleConfig?.colorShotRequests?.length) return 1;
  return clampSuiteModuleCount(moduleConfig?.outputCount ?? countForImageType(options, item.imageTypeId), 1, 3);
}

function clampSuiteModuleCount(value: unknown, min: number, max: number): number {
  const count = Math.trunc(Number(value));
  if (!Number.isFinite(count)) return min;
  return Math.min(max, Math.max(min, count));
}

function plannedItemCount(item: Pick<PlannedGenerationItem, "count">): number {
  const value = Math.trunc(Number(item.count ?? 1));
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(99, value);
}

function logGenerationMemory(stage: "start" | "finish", job: GenerationJob, extra: { taskCount: number }): void {
  const memory = typeof process !== "undefined" && typeof process.memoryUsage === "function"
    ? process.memoryUsage()
    : undefined;
  const rssMb = memory ? Math.round(memory.rss / 1024 / 1024) : undefined;
  console.info("[generation-memory]", {
    stage,
    jobId: job.id,
    status: job.status,
    plannedTotal: job.progress.total,
    completed: job.progress.completed,
    sourceImages: job.sourceImages.length,
    taskCount: extra.taskCount,
    concurrency: maxGenerationConcurrency,
    rssMb
  });
}

function moduleCopyForPlannedItem(options: GenerationJobOptions, plannedItem: PlannedGenerationItem): NonNullable<GenerationJobOptions["moduleCopies"]>[number] | undefined {
  const bySuiteItem = plannedItem.suiteItemId
    ? options.moduleCopies?.find((copy) => copy.suiteItemId === plannedItem.suiteItemId)
    : undefined;
  return bySuiteItem ?? options.moduleCopies?.find((copy) => copy.imageTypeId === plannedItem.imageTypeId);
}

function creditsForImageType(imageTypeId: string, imageCreditsPerUnit?: number): number {
  if (Number.isFinite(imageCreditsPerUnit) && imageCreditsPerUnit && imageCreditsPerUnit > 0) {
    return imageCreditsForUnit(imageTypeId, imageCreditsPerUnit);
  }
  if (imageTypeId === "detail_header_poster") return 45;
  if (imageTypeId.startsWith("detail_")) return 36;
  return 30;
}

function plannedStyleItems(options: GenerationJobOptions): Array<Pick<PlannedGenerationItem, "topSellerStyleId" | "topSellerStyleLabel" | "customStyleId" | "customStyleLabel" | "customStylePrompt" | "styleReferenceImageIndex">> {
  const ids = options.topSellerStyleIds?.length ? options.topSellerStyleIds : options.topSellerStyleId ? [options.topSellerStyleId] : [];
  const topSellerStyles = ids.map((id) => {
    const preset = findTopSellerStylePreset(id);
    return {
      topSellerStyleId: preset?.id,
      topSellerStyleLabel: preset?.label
    };
  });

  const customStyles = (options.customStylePrompts ?? []).map((prompt, index) => ({
    customStyleId: options.customStyleIds?.[index] ?? `custom-style-${index + 1}`,
    customStyleLabel: options.customStyleLabels?.[index] ?? `自定义风格${index + 1}`,
    customStylePrompt: prompt,
    styleReferenceImageIndex: index
  }));

  const styles = [...topSellerStyles, ...customStyles];
  return styles.length ? styles : [{}];
}

function resolveImageType(options: GenerationJobOptions, imageTypeId: string, specId = options.specId) {
  const spec = findPlatformSpec(specId, options.platform);
  if (spec) {
    const imageType = findSpecImageType(spec, imageTypeId);
    if (imageType) return { spec, imageType };
  }
  return findPlatformImageType(options.platform, imageTypeId);
}
