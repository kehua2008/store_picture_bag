import { createWriteStream, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { creditsForRule, type CreditRechargePlan } from "../billing/creditPlans";
import { estimateVideoDraftCost, type VideoCostStatus } from "../billing/videoCosts";
import type { ProviderError } from "../provider/types";
import type { CreateVideoInput, CreatedVideoTask, VideoTaskStatusUpdate, YunwuVideoProvider } from "../provider/yunwuVideoProvider";
import { persistentDataDir } from "../../server/storagePaths";
import type { ReferenceAssetStatus, ReferenceProcessingMode, ReferenceStrength } from "../video/referenceResolver";

export type VideoJobStatus = "running" | "submitted" | "succeeded" | "failed" | "canceled";
export const videoJobRetentionMs = 24 * 60 * 60 * 1000;
export const videoRetryDelaysMs = [15_000, 30_000, 60_000, 120_000, 300_000, 600_000] as const;
export const videoPollDelaysMs = [10_000, 15_000, 20_000, 30_000, 45_000, 60_000] as const;

export interface VideoSourceAsset {
  id: string;
  filename: string;
  mimeType: string;
  path: string;
  publicUrl?: string;
}

export interface VideoResultAsset {
  url?: string;
  localUrl?: string;
  filename?: string;
  mimeType?: string;
  path?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface VideoProviderUsage {
  provider: string;
  model: string;
  taskId: string;
  totalTokens?: number;
  completionTokens?: number;
  requestedResolution?: string;
  actualResolution?: string;
  requestedDurationSeconds?: number;
  actualDurationSeconds?: number;
  ratio?: string;
  generateAudio?: boolean;
  serviceTier?: string;
  rawUsage?: Record<string, unknown>;
  actualCostCny?: number;
  pricePerMillionTokensCny?: number;
  costStatus: VideoCostStatus;
}

export interface VideoUpscaleUsage {
  provider: string;
  model: string;
  taskId: string;
  sourceResolution?: string;
  targetResolution: "720p" | "1080p" | "2k" | "4k";
  durationSeconds?: number;
  totalTokens?: number;
  actualCostCny?: number;
  rawUsage?: Record<string, unknown>;
  costStatus: VideoCostStatus;
}

export interface VideoUpscaleTask {
  id: string;
  status: "unavailable" | "running" | "submitted" | "succeeded" | "failed";
  targetResolution: "720p" | "1080p" | "2k" | "4k";
  createdAt: string;
  updatedAt: string;
  result?: VideoResultAsset;
  usage?: VideoUpscaleUsage;
  error?: ProviderError;
}

export interface VideoJob {
  id: string;
  mode: "video";
  customerId: string;
  createdByActorId?: string;
  createdByActorName?: string;
  reservedCredits: number;
  chargedCredits?: number;
  status: VideoJobStatus;
  progress: {
    completed: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  prompt: string;
  input: CreateVideoInput;
  sourceImageCount: number;
  sourceAssets: VideoSourceAsset[];
  attemptCount: number;
  pollCount: number;
  nextAttemptAt?: string;
  nextPollAt?: string;
  lastError?: ProviderError;
  providerTask?: CreatedVideoTask;
  providerUsage?: VideoProviderUsage;
  providerMismatch?: boolean;
  requestedResolution?: string;
  actualResolution?: string;
  requestedDurationSeconds?: number;
  actualDurationSeconds?: number;
  referenceStrength?: ReferenceStrength;
  referenceProcessingMode?: ReferenceProcessingMode;
  referenceAssetStatus?: ReferenceAssetStatus;
  referenceFrameCount?: number;
  referenceVideoUrl?: string;
  referenceUploadStatus?: string;
  referenceParseError?: string;
  upscaleTasks?: VideoUpscaleTask[];
  result?: VideoResultAsset;
  error?: ProviderError;
}

export interface SerializableVideoJob extends Omit<VideoJob, "input" | "sourceAssets"> {
  input: Omit<CreateVideoInput, "images"> & {
    images: string[];
  };
  sourceAssets: Array<Omit<VideoSourceAsset, "path">>;
  result?: Omit<VideoResultAsset, "path">;
}

export interface VideoJobRepository {
  save(job: VideoJob): VideoJob;
  findById(id: string): VideoJob | undefined;
  all(): VideoJob[];
  findByCustomerId(customerId: string): VideoJob[];
  deleteOlderThan(cutoffTime: number): VideoJob[];
}

interface VideoJobData {
  jobs: PersistedVideoJob[];
}

type PersistedVideoJob = Omit<VideoJob, "input"> & {
  input: Omit<CreateVideoInput, "images"> & {
    images: string[];
  };
};

export class InMemoryVideoJobRepository implements VideoJobRepository {
  private readonly jobs = new Map<string, VideoJob>();

  save(job: VideoJob): VideoJob {
    this.jobs.set(job.id, job);
    return job;
  }

  findById(id: string): VideoJob | undefined {
    return this.jobs.get(id);
  }

  all(): VideoJob[] {
    return Array.from(this.jobs.values()).sort(sortByUpdatedDesc);
  }

  findByCustomerId(customerId: string): VideoJob[] {
    return this.all()
      .filter((job) => job.customerId === customerId)
  }

  deleteOlderThan(cutoffTime: number): VideoJob[] {
    const deleted: VideoJob[] = [];
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

export class FileVideoJobRepository implements VideoJobRepository {
  private readonly dataFile: string;
  private readonly cache = new Map<string, VideoJob>();
  private loaded = false;

  constructor(options: { dataDir?: string } = {}) {
    this.dataFile = path.join(options.dataDir ?? persistentDataDir(), "video-jobs.json");
  }

  save(job: VideoJob): VideoJob {
    this.loadIntoCache();
    this.cache.set(job.id, job);
    this.persistCache();
    return job;
  }

  findById(id: string): VideoJob | undefined {
    this.loadIntoCache();
    return this.cache.get(id);
  }

  all(): VideoJob[] {
    this.loadIntoCache();
    return Array.from(this.cache.values()).sort(sortByUpdatedDesc);
  }

  findByCustomerId(customerId: string): VideoJob[] {
    return this.all()
      .filter((job) => job.customerId === customerId)
  }

  deleteOlderThan(cutoffTime: number): VideoJob[] {
    this.loadIntoCache();
    const deleted: VideoJob[] = [];
    this.cache.forEach((job, id) => {
      const retentionTime = retentionTimestamp(job);
      if (Number.isFinite(retentionTime) && retentionTime < cutoffTime) {
        this.cache.delete(id);
        deleted.push(job);
        deleteVideoSourceAssets(job);
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
      const parsed = JSON.parse(raw) as Partial<VideoJobData>;
      const jobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
      for (const job of jobs) {
        if (!job?.id) continue;
        this.cache.set(job.id, rehydrateVideoJob(job));
      }
    } catch {
      // Missing or malformed persistence file starts as an empty job list.
    }
  }

  private persistCache(): void {
    const data: VideoJobData = {
      jobs: Array.from(this.cache.values()).map(persistVideoJob)
    };
    try {
      mkdirSync(path.dirname(this.dataFile), { recursive: true });
      const tempFile = `${this.dataFile}.${process.pid}.${Date.now()}.tmp`;
      writeFileSync(tempFile, JSON.stringify(data, null, 2));
      renameSync(tempFile, this.dataFile);
    } catch {
      // Persistence failure should not block in-memory task progress.
    }
  }
}

export class VideoJobService {
  private readonly activeRuns = new Set<string>();

  constructor(
    private readonly repository: VideoJobRepository,
    private readonly provider: Pick<YunwuVideoProvider, "create" | "get">,
    private readonly billing?: {
      onSubmitted?: (job: VideoJob) => Promise<void> | void;
      onFailed?: (job: VideoJob) => Promise<void> | void;
      onCanceled?: (job: VideoJob) => Promise<void> | void;
    },
    private readonly options: { dataDir?: string } = {}
  ) {}

  createJob(input: { customerId: string; videoInput: CreateVideoInput; reservedCredits: number; requestUrl?: string; createdByActorId?: string; createdByActorName?: string }): VideoJob {
    this.cleanupExpiredJobs();
    const now = new Date().toISOString();
    const id = `video-${crypto.randomUUID()}`;
    const sourceAssets = materializeVideoSourceAssets(id, input.videoInput.images ?? [], this.options.dataDir, input.requestUrl);
    return this.repository.save({
      id,
      mode: "video",
      customerId: input.customerId,
      createdByActorId: input.createdByActorId,
      createdByActorName: input.createdByActorName,
      reservedCredits: input.reservedCredits,
      status: "running",
      progress: { completed: 0, total: 1 },
      createdAt: now,
      updatedAt: now,
      prompt: input.videoInput.prompt,
      input: {
        ...input.videoInput,
        images: []
      },
      sourceImageCount: input.videoInput.images?.length ?? 0,
      sourceAssets,
      requestedResolution: input.videoInput.outputResolution ?? "480p",
      requestedDurationSeconds: normalizeVideoDurationSeconds(input.videoInput.durationSeconds),
      referenceStrength: normalizeReferenceStrength(metadataString(input.videoInput.metadata, "referenceStrength") ?? input.videoInput.referenceStrength),
      referenceProcessingMode: normalizeReferenceProcessingMode(metadataString(input.videoInput.metadata, "referenceProcessingMode")),
      referenceAssetStatus: normalizeReferenceAssetStatus(metadataString(input.videoInput.metadata, "referenceAssetStatus")),
      referenceFrameCount: metadataNumber(input.videoInput.metadata, "referenceFrameCount"),
      referenceVideoUrl: metadataString(input.videoInput.metadata, "resolvedReferenceVideoUrl"),
      referenceUploadStatus: metadataString(input.videoInput.metadata, "referenceUploadStatus"),
      referenceParseError: metadataString(input.videoInput.metadata, "referenceParseError"),
      upscaleTasks: [],
      attemptCount: 0,
      pollCount: 0
    });
  }

  async runJob(id: string, options: { force?: boolean; now?: number } = {}): Promise<VideoJob | undefined> {
    const job = this.repository.findById(id);
    if (!job) return undefined;
    if (job.status === "running" && !options.force && !isVideoJobDue(job, options.now ?? Date.now())) return job;
    if (job.status === "submitted" && !options.force && !isVideoPollDue(job, options.now ?? Date.now())) return job;
    if (job.status !== "running" && job.status !== "submitted") return job;
    if (this.activeRuns.has(id)) return job;

    this.activeRuns.add(id);
    try {
      if (job.status === "submitted") return this.pollSubmittedJob(job, options.now ?? Date.now());

      const images = hydrateVideoSourceImages(job);
      if (!images.length) {
        return this.failJob(job, {
          code: "provider_bad_request",
          message: "Video source image data is missing.",
          retryable: false
        });
      }

      const attemptCount = job.attemptCount + 1;
      const result = await this.provider.create({
        ...job.input,
        images,
        metadata: {
          ...job.input.metadata,
          sourceImageUrls: job.sourceAssets.map((asset) => asset.publicUrl).filter((item): item is string => Boolean(item))
        }
      });
      const latest = this.repository.findById(id);
      if (!latest || latest.status !== "running") return latest;

      if (!result.ok) {
        if (shouldRetryVideoError(result.error, attemptCount)) {
          const delayed = scheduleRetry(latest, result.error, attemptCount, options.now ?? Date.now());
          this.repository.save(delayed);
          return this.repository.findById(id);
        }
        return this.failJob({ ...latest, attemptCount, lastError: result.error }, result.error);
      }

      const submitted = {
        ...latest,
        status: "submitted" as const,
        progress: { completed: 0, total: 1 },
        updatedAt: new Date().toISOString(),
        attemptCount,
        nextAttemptAt: undefined,
        lastError: undefined,
        providerTask: result.value,
        chargedCredits: latest.reservedCredits
      };
      try {
        await this.billing?.onSubmitted?.(submitted);
      } finally {
        this.repository.save(submitted);
      }
      return this.repository.findById(id);
    } finally {
      this.activeRuns.delete(id);
    }
  }

  getJob(id: string): VideoJob | undefined {
    this.cleanupExpiredJobs();
    return this.repository.findById(id);
  }

  listJobsForCustomer(customerId: string): VideoJob[] {
    this.cleanupExpiredJobs();
    return this.repository.findByCustomerId(customerId);
  }

  async runDueJobs(now = Date.now()): Promise<VideoJob[]> {
    this.cleanupExpiredJobs(now);
    const dueJobs = this.repository.all().filter((job) =>
      (job.status === "running" && isVideoJobDue(job, now)) ||
      (job.status === "submitted" && isVideoPollDue(job, now))
    );
    const results: VideoJob[] = [];
    for (const job of dueJobs) {
      const result = await this.runJob(job.id, { now });
      if (result) results.push(result);
    }
    return results;
  }

  async cancelJob(id: string): Promise<VideoJob | undefined> {
    this.cleanupExpiredJobs();
    const job = this.repository.findById(id);
    if (!job) return undefined;
    if (job.status !== "running" && job.status !== "submitted") return job;

    const canceled = { ...job, status: "canceled" as const, updatedAt: new Date().toISOString() };
    try {
      if (!job.chargedCredits) await this.billing?.onCanceled?.(job);
    } finally {
      this.repository.save(canceled);
    }
    return this.repository.findById(id);
  }

  cleanupExpiredJobs(now = Date.now()): VideoJob[] {
    return this.repository.deleteOlderThan(now - videoJobRetentionMs);
  }

  private async failJob(job: VideoJob, error: ProviderError): Promise<VideoJob | undefined> {
    const failed = {
      ...job,
      status: "failed" as const,
      progress: { completed: 0, total: 1 },
      updatedAt: new Date().toISOString(),
      error
    };
    try {
      await this.billing?.onFailed?.(job);
    } finally {
      this.repository.save(failed);
    }
    return this.repository.findById(job.id);
  }

  private async pollSubmittedJob(job: VideoJob, now: number): Promise<VideoJob | undefined> {
    if (!job.providerTask) return this.failJob(job, {
      code: "provider_unknown",
      message: "Video provider task data is missing.",
      retryable: true
    });

    const result = await this.provider.get(job.providerTask);
    const latest = this.repository.findById(job.id);
    if (!latest || latest.status !== "submitted") return latest;

    const pollCount = latest.pollCount + 1;
    if (!result.ok) {
      const delayed = schedulePoll(latest, pollCount, now, result.error);
      this.repository.save(delayed);
      return this.repository.findById(job.id);
    }

    if (isProviderVideoFailure(result.value)) {
      return this.failJob({ ...latest, pollCount, providerTask: result.value }, result.value.error ?? {
        code: "provider_unknown",
        message: "Video provider reported task failure.",
        retryable: false
      });
    }

    if (isProviderVideoSuccess(result.value)) {
      const storedResult = await materializeVideoResult(latest.id, result.value.outputUrl, this.options.dataDir);
      const providerUsage = buildVideoProviderUsage(latest, result.value);
      const succeeded = {
        ...latest,
        status: "succeeded" as const,
        progress: { completed: 1, total: 1 },
        updatedAt: new Date().toISOString(),
        pollCount,
        nextPollAt: undefined,
        lastError: undefined,
        providerTask: result.value,
        providerUsage,
        providerMismatch: hasProviderMismatch(providerUsage),
        actualResolution: providerUsage.actualResolution,
        actualDurationSeconds: providerUsage.actualDurationSeconds,
        result: storedResult
      };
      this.repository.save(succeeded);
      return this.repository.findById(job.id);
    }

    const delayed = schedulePoll({
      ...latest,
      providerTask: result.value
    }, pollCount, now);
    this.repository.save(delayed);
    return this.repository.findById(job.id);
  }
}

export function serializeVideoJob(job: VideoJob): SerializableVideoJob {
  const result = job.result ? omitVideoResultPath(job.result) : undefined;
  return {
    ...job,
    sourceAssets: job.sourceAssets.map(({ id, filename, mimeType, publicUrl }) => ({ id, filename, mimeType, publicUrl })),
    result: job.result ? result : undefined,
    upscaleTasks: job.upscaleTasks?.map((task) => ({
      ...task,
      result: task.result ? omitVideoResultPath(task.result) : undefined
    })),
    input: {
      ...job.input,
      images: job.sourceImageCount ? [`${job.sourceImageCount} source image(s) omitted`] : []
    }
  };
}

function omitVideoResultPath(result: VideoResultAsset): Omit<VideoResultAsset, "path"> {
  const { path: _path, ...safeResult } = result;
  return safeResult;
}

export function estimateVideoJobCredits(input: Pick<CreateVideoInput, "images" | "metadata" | "outputResolution" | "generateAudio"> & { durationSeconds?: number; pricingPlan?: CreditRechargePlan }): number {
  const durationSeconds = normalizeVideoDurationSeconds(input.durationSeconds ?? parseDurationSeconds(metadataString(input.metadata, "duration")));
  const outputResolution = input.outputResolution ?? normalizeResolutionLabel(metadataString(input.metadata, "outputQuality"));
  const baseCredits = estimateDraftCredits(outputResolution, durationSeconds, input.pricingPlan?.videoCreditsPerUnit);
  const referenceCredits = estimateReferenceCredits(input.metadata);
  const imageCount = input.images?.length ?? 0;
  const extraImageCredits = Math.max(0, imageCount - 1) * 30;
  return baseCredits + referenceCredits + extraImageCredits;
}

function retentionTimestamp(job: Pick<VideoJob, "createdAt" | "updatedAt">): number {
  const updatedTime = new Date(job.updatedAt ?? "").getTime();
  if (Number.isFinite(updatedTime)) return updatedTime;
  return new Date(job.createdAt).getTime();
}

function persistVideoJob(job: VideoJob): PersistedVideoJob {
  return {
    ...job,
    result: job.result,
    input: {
      ...job.input,
      images: job.sourceImageCount ? [`${job.sourceImageCount} source image(s) omitted`] : []
    }
  };
}

function rehydrateVideoJob(job: PersistedVideoJob): VideoJob {
  return {
    ...job,
    sourceAssets: job.sourceAssets ?? [],
    upscaleTasks: job.upscaleTasks ?? [],
    attemptCount: job.attemptCount ?? 0,
    pollCount: job.pollCount ?? 0,
    input: {
      ...job.input,
      images: []
    }
  };
}

function sortByUpdatedDesc(left: VideoJob, right: VideoJob): number {
  const leftTime = new Date(left.updatedAt ?? left.createdAt).getTime();
  const rightTime = new Date(right.updatedAt ?? right.createdAt).getTime();
  return rightTime - leftTime;
}

function parseDurationSeconds(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.match(/\d+/);
  if (!match) return undefined;
  return Number(match[0]);
}

function normalizeVideoDurationSeconds(value?: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.max(1, Math.min(15, Math.trunc(value as number)));
}

function normalizeResolutionLabel(value?: string): "480p" | "720p" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "720p" || normalized === "720") return "720p";
  return "480p";
}

function estimateDraftCredits(resolution: "480p" | "720p", durationSeconds: number, videoCreditsPerUnit?: number): number {
  const baseCredits = videoCreditsPerUnit ?? creditsForRule("short-video");
  const durationMultiplier = durationSeconds > 0 ? 1 : 1;
  const resolutionMultiplier = resolution === "720p" ? 1 : 1;
  return Math.ceil(baseCredits * durationMultiplier * resolutionMultiplier);
}

function estimateReferenceCredits(metadata: CreateVideoInput["metadata"]): number {
  const processingMode = normalizeReferenceProcessingMode(metadataString(metadata, "referenceProcessingMode"));
  if (processingMode === "single_frame") return 20;
  if (processingMode === "multi_frame") return 50;
  if (processingMode === "full_video") return 80;
  return 0;
}

function metadataString(metadata: CreateVideoInput["metadata"], key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

function metadataNumber(metadata: CreateVideoInput["metadata"], key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeReferenceStrength(value?: string): ReferenceStrength | undefined {
  if (value === "light" || value === "medium" || value === "heavy") return value;
  return undefined;
}

function normalizeReferenceProcessingMode(value?: string): ReferenceProcessingMode | undefined {
  if (value === "none" || value === "single_frame" || value === "multi_frame" || value === "full_video") return value;
  return undefined;
}

function normalizeReferenceAssetStatus(value?: string): ReferenceAssetStatus | undefined {
  if (value === "pending" || value === "resolved" || value === "failed") return value;
  return undefined;
}

function buildVideoProviderUsage(job: VideoJob, task: VideoTaskStatusUpdate): VideoProviderUsage {
  const raw = task.raw && typeof task.raw === "object" ? task.raw as Record<string, unknown> : {};
  const rawUsage = objectAt(raw, "usage");
  const totalTokens = numberAt(rawUsage, "total_tokens");
  const completionTokens = numberAt(rawUsage, "completion_tokens");
  const requestedResolution = job.input.outputResolution ?? job.requestedResolution ?? "480p";
  const actualResolution = stringAt(raw, "resolution");
  const requestedDurationSeconds = normalizeVideoDurationSeconds(job.input.durationSeconds ?? job.requestedDurationSeconds);
  const actualDurationSeconds = numberAt(raw, "duration");
  const generateAudio = booleanAt(raw, "generate_audio") ?? job.input.generateAudio;
  const cost = estimateVideoDraftCost({
    model: task.model,
    resolution: actualResolution ?? requestedResolution,
    durationSeconds: actualDurationSeconds ?? requestedDurationSeconds,
    generateAudio,
    totalTokens
  });

  return {
    provider: task.provider,
    model: task.model,
    taskId: task.id,
    totalTokens,
    completionTokens,
    requestedResolution,
    actualResolution,
    requestedDurationSeconds,
    actualDurationSeconds,
    ratio: stringAt(raw, "ratio"),
    generateAudio,
    serviceTier: stringAt(raw, "service_tier"),
    rawUsage,
    ...cost
  };
}

function hasProviderMismatch(usage: VideoProviderUsage): boolean {
  const requestedResolution = usage.requestedResolution?.toLowerCase();
  const actualResolution = usage.actualResolution?.toLowerCase();
  const resolutionMismatch = Boolean(requestedResolution && actualResolution && requestedResolution !== actualResolution);
  const durationMismatch = Boolean(
    usage.requestedDurationSeconds &&
    usage.actualDurationSeconds &&
    usage.requestedDurationSeconds !== usage.actualDurationSeconds
  );
  return resolutionMismatch || durationMismatch;
}

function objectAt(value: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const nested = value[key];
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested as Record<string, unknown> : undefined;
}

function numberAt(value: Record<string, unknown> | undefined, key: string): number | undefined {
  const item = value?.[key];
  return typeof item === "number" && Number.isFinite(item) ? item : undefined;
}

function stringAt(value: Record<string, unknown>, key: string): string | undefined {
  const item = value[key];
  return typeof item === "string" && item.trim() ? item : undefined;
}

function booleanAt(value: Record<string, unknown>, key: string): boolean | undefined {
  const item = value[key];
  return typeof item === "boolean" ? item : undefined;
}

function isVideoJobDue(job: VideoJob, now: number): boolean {
  if (!job.nextAttemptAt) return true;
  const nextAttemptTime = new Date(job.nextAttemptAt).getTime();
  return !Number.isFinite(nextAttemptTime) || nextAttemptTime <= now;
}

function isVideoPollDue(job: VideoJob, now: number): boolean {
  if (!job.nextPollAt) return true;
  const nextPollTime = new Date(job.nextPollAt).getTime();
  return !Number.isFinite(nextPollTime) || nextPollTime <= now;
}

function shouldRetryVideoError(error: ProviderError, attemptCount: number): boolean {
  if (!error.retryable) return false;
  if (error.code !== "provider_rate_limited" && error.code !== "provider_timeout" && error.code !== "provider_unknown") return false;
  return attemptCount <= videoRetryDelaysMs.length;
}

function scheduleRetry(job: VideoJob, error: ProviderError, attemptCount: number, now: number): VideoJob {
  const delay = videoRetryDelaysMs[Math.min(attemptCount - 1, videoRetryDelaysMs.length - 1)] ?? videoRetryDelaysMs[videoRetryDelaysMs.length - 1];
  return {
    ...job,
    attemptCount,
    lastError: error,
    nextAttemptAt: new Date(now + delay).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function schedulePoll(job: VideoJob, pollCount: number, now: number, error?: ProviderError): VideoJob {
  const delay = videoPollDelaysMs[Math.min(pollCount - 1, videoPollDelaysMs.length - 1)] ?? videoPollDelaysMs[videoPollDelaysMs.length - 1];
  return {
    ...job,
    pollCount,
    lastError: error,
    nextPollAt: new Date(now + delay).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function isProviderVideoSuccess(task: VideoTaskStatusUpdate): boolean {
  const status = task.status.toLowerCase();
  return Boolean(task.outputUrl) && ["succeeded", "success", "completed", "complete", "done", "finished", "finish"].some((item) => status.includes(item));
}

function isProviderVideoFailure(task: VideoTaskStatusUpdate): boolean {
  const status = task.status.toLowerCase();
  return ["failed", "failure", "canceled", "cancelled", "error"].some((item) => status.includes(item));
}

function materializeVideoSourceAssets(jobId: string, images: string[], dataDir = persistentDataDir(), requestUrl?: string): VideoSourceAsset[] {
  const sourceDir = path.join(dataDir, "video-sources", safePathSegment(jobId));
  const assets: VideoSourceAsset[] = [];
  for (let index = 0; index < images.length; index += 1) {
    const parsed = parseDataUrl(images[index]);
    if (!parsed) continue;
    mkdirSync(sourceDir, { recursive: true });
    const id = `source-${index + 1}`;
    const filename = `${id}.${extensionForMimeType(parsed.mimeType)}`;
    const filePath = path.join(sourceDir, filename);
    writeFileSync(filePath, parsed.buffer);
    assets.push({
      id,
      filename,
      mimeType: parsed.mimeType,
      path: filePath,
      publicUrl: publicVideoSourceUrl(jobId, filename, requestUrl)
    });
  }
  return assets;
}

function publicVideoSourceUrl(jobId: string, filename: string, requestUrl?: string): string | undefined {
  const configured = process.env.APP_PUBLIC_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = configured || (requestUrl ? new URL(requestUrl).origin : undefined);
  if (!base) return undefined;
  return `${base.replace(/\/$/, "")}/video-sources/${encodeURIComponent(safePathSegment(jobId))}/${encodeURIComponent(filename)}`;
}

function hydrateVideoSourceImages(job: VideoJob): string[] {
  if (job.input.images?.some((image) => image.startsWith("data:"))) return job.input.images;
  return job.sourceAssets
    .map((asset) => {
      try {
        const bytes = readFileSync(asset.path);
        return `data:${asset.mimeType};base64,${bytes.toString("base64")}`;
      } catch {
        return undefined;
      }
    })
    .filter((item): item is string => Boolean(item));
}

function parseDataUrl(value: string): { mimeType: string; buffer: Buffer } | undefined {
  const match = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return undefined;
  return {
    mimeType: match[1] ?? "image/png",
    buffer: Buffer.from(match[2] ?? "", "base64")
  };
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function deleteVideoSourceAssets(job: VideoJob): void {
  const firstAssetPath = job.sourceAssets[0]?.path;
  if (!firstAssetPath) return;
  try {
    rmSync(path.dirname(firstAssetPath), { recursive: true, force: true });
  } catch {
    // Source cleanup is best-effort.
  }
}

async function materializeVideoResult(jobId: string, outputUrl: string | undefined, dataDir = persistentDataDir()): Promise<VideoResultAsset> {
  const createdAt = new Date().toISOString();
  if (!outputUrl) return { createdAt };

  const filename = `${safePathSegment(jobId)}.${extensionForVideoUrl(outputUrl)}`;
  const resultPath = path.join(dataDir, "generated-videos", filename);
  try {
    mkdirSync(path.dirname(resultPath), { recursive: true });
    const stored = await storeVideoResult(outputUrl, resultPath);
    return {
      url: outputUrl,
      localUrl: `/generated-videos/${filename}`,
      filename,
      mimeType: stored.mimeType,
      path: resultPath,
      sizeBytes: stored.sizeBytes,
      createdAt
    };
  } catch {
    return {
      url: outputUrl,
      mimeType: contentTypeForVideoUrl(outputUrl),
      createdAt
    };
  }
}

async function storeVideoResult(url: string, outputPath: string): Promise<{ sizeBytes: number; mimeType: string }> {
  if (url.startsWith("data:video/")) {
    const parsed = parseDataUrl(url);
    if (!parsed) throw new Error("invalid_video_data_url");
    writeFileSync(outputPath, parsed.buffer);
    return { sizeBytes: parsed.buffer.length, mimeType: parsed.mimeType };
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error("video_download_failed");
  if (!response.body) throw new Error("video_download_empty_body");
  await pipeline(Readable.fromWeb(response.body as unknown as NodeReadableStream), createWriteStream(outputPath));
  const declaredSizeBytes = Number(response.headers.get("content-length"));
  const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || contentTypeForVideoUrl(url);
  return {
    sizeBytes: Number.isFinite(declaredSizeBytes) && declaredSizeBytes >= 0 ? declaredSizeBytes : statSync(outputPath).size,
    mimeType
  };
}

function extensionForVideoUrl(url: string): string {
  if (/\.mov(\?|#|$)/i.test(url)) return "mov";
  if (/\.webm(\?|#|$)/i.test(url)) return "webm";
  if (/\.m3u8(\?|#|$)/i.test(url)) return "m3u8";
  return "mp4";
}

function contentTypeForVideoUrl(url: string): string {
  if (/\.mov(\?|#|$)/i.test(url)) return "video/quicktime";
  if (/\.webm(\?|#|$)/i.test(url)) return "video/webm";
  if (/\.m3u8(\?|#|$)/i.test(url)) return "application/vnd.apple.mpegurl";
  return "video/mp4";
}

function safePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
