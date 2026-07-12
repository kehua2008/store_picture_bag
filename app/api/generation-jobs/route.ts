import { NextResponse } from "next/server";
import { estimateGenerationJobCredits, estimateGenerationJobOutputCount, serializeGenerationJob } from "../../../src/domain/jobs/generationJobService";
import type { ProductAnalysis } from "../../../src/domain/suites/productAnalysis";
import { buildProductAnalysisDraft } from "../../../src/domain/suites/productAnalysis";
import { buildSuiteCreativePlan } from "../../../src/domain/suites/suiteCreativePlan";
import type { SuitePlanItem } from "../../../src/domain/suites/suitePresets";
import { createGenerationJobSchema } from "../../../src/server/schemas";
import { customModelRepository, generationJobService, rechargeOrderRepository } from "../../../src/server/services";
import { findTopSellerStylePreset } from "../../../src/domain/prompts/topSellerStylePresets";
import { getAuthContextFromRequest } from "../../../src/server/auth";

const maxImageUploadCount = 12;
const maxImageUploadBytes = 8 * 1024 * 1024;
const maxGenerationOutputCount = 12;

export async function GET(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") === "all" ? "all" : "mine";
  const jobs = generationJobService
    .listJobsForCustomer(auth.user.id)
    .filter((job) => {
      if (scope === "mine" && job.createdByActorId && job.createdByActorId !== auth.actor.actorId) return false;
      const updatedAfter = url.searchParams.get("updatedAfter");
      if (!updatedAfter) return true;
      const cutoff = new Date(updatedAfter).getTime();
      if (!Number.isFinite(cutoff)) return true;
      return new Date(job.updatedAt ?? job.createdAt).getTime() > cutoff;
    })
    .map((job) => serializeGenerationJob(job));

  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (auth.user.status !== "active") return NextResponse.json({ error: "account_suspended" }, { status: 403 });

  const formData = await request.formData().catch(() => undefined);
  if (!formData) {
    return NextResponse.json({ error: "invalid_multipart_request" }, { status: 400 });
  }

  const parsed = createGenerationJobSchema.safeParse({
    platform: formData.get("platform"),
    category: formData.get("category"),
    productCategoryId: formData.get("productCategoryId") || undefined,
    productCategoryLabel: formData.get("productCategoryLabel") || undefined,
    scene: formData.get("scene"),
    sceneVariant: formData.get("sceneVariant"),
    size: formData.get("size"),
    modelProfile: formData.get("modelProfile"),
    count: formData.get("count") ?? "1",
    imageTypeCounts: parseJsonObject(formData.get("imageTypeCounts")),
    specId: formData.get("specId"),
    imageTypeId: formData.get("imageTypeId") || undefined,
    imageTypeIds: formData.getAll("imageTypeIds").map(String).filter(Boolean),
    productGroupingMode: formData.get("productGroupingMode") || "per_image",
    productReferenceRoles: formData.getAll("productSlotRoles").map(String).filter(Boolean),
    outfitSelectionMode: formData.get("outfitSelectionMode") || "all",
    outfitItemCount: formData.get("outfitItemCount") || undefined,
    targetWidth: formData.get("targetWidth") || undefined,
    targetHeight: formData.get("targetHeight") || undefined,
    customSpecName: formData.get("customSpecName") || undefined,
    modelMode: formData.get("modelMode") || "model",
    modelGender: formData.get("modelGender") || undefined,
    modelAgeRange: formData.get("modelAgeRange") || undefined,
    modelSkinTone: formData.get("modelSkinTone") || undefined,
    modelHairStyle: formData.get("modelHairStyle") || undefined,
    customModelId: formData.get("customModelId") || undefined,
    posterTitle: formData.get("posterTitle") || undefined,
    posterSubtitle: formData.get("posterSubtitle") || undefined,
    posterBullets: formData.getAll("posterBullets").map(String).filter(Boolean),
    posterTemplateId: formData.get("posterTemplateId") || undefined,
    moduleCopies: formData.getAll("moduleCopies").map(parseJsonValue).filter(Boolean),
    suiteModuleConfigs: formData.getAll("suiteModuleConfigs").map(parseJsonValue).filter(Boolean),
    topSellerStyleId: formData.get("topSellerStyleId") || undefined,
    topSellerStyleIds: formData.getAll("topSellerStyleIds").map(String).filter(Boolean),
    customStyleIds: formData.getAll("customStyleIds").map(String).filter(Boolean),
    customStyleLabels: formData.getAll("customStyleLabels").map(String).filter(Boolean),
    customStylePrompts: formData.getAll("customStylePrompts").map(String).filter(Boolean),
    photoMetadataMode: formData.get("photoMetadataMode") || "none",
    userPrompt: formData.get("userPrompt") || formData.get("merchantPrompt") || undefined,
    merchantPrompt: formData.get("merchantPrompt") || formData.get("userPrompt") || undefined,
    generationMode: formData.get("generationMode") || "single",
    suitePresetId: formData.get("suitePresetId") || undefined,
    suiteSurface: formData.get("suiteSurface") || undefined,
    suiteItemIds: formData.getAll("suiteItemIds").map(String).filter(Boolean),
    productAnalysis: formData.get("productAnalysis") || undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_generation_job_request",
        issues: parsed.error.issues
      },
      { status: 400 }
    );
  }

  const files = formData.getAll("images").filter(isImageFileLike);
  const productColorGroupIds = formData.getAll("productColorGroupIds").map(String);
  const productColorGroupLabels = formData.getAll("productColorGroupLabels").map(String);
  const styleReferenceFiles = formData.getAll("styleReferenceImages").filter(isImageFileLike);
  const modelReferenceFile = formData.getAll("modelReferenceImage").find(isImageFileLike);
  const merchantInfoFile = formData.getAll("merchantInfoImage").find(isImageFileLike);
  const hasMerchantInfoGraphic = parsed.data.imageTypeIds?.includes("detail_merchant_info_graphic") || parsed.data.imageTypeId === "detail_merchant_info_graphic";
  const normalImageTypeIds = (parsed.data.imageTypeIds?.length ? parsed.data.imageTypeIds : parsed.data.imageTypeId ? [parsed.data.imageTypeId] : [])
    .filter((id) => id !== "detail_merchant_info_graphic");

  if (normalImageTypeIds.length > 0 && files.length === 0) {
    return NextResponse.json({ error: "missing_image_upload" }, { status: 400 });
  }

  if (hasMerchantInfoGraphic && !merchantInfoFile) {
    return NextResponse.json({ error: "missing_merchant_info_image" }, { status: 400 });
  }

  if (files.length > maxImageUploadCount) {
    return NextResponse.json({
      error: "too_many_images",
      max: maxImageUploadCount,
      message: `单次最多上传 ${maxImageUploadCount} 张图片，请拆成多次生成。`
    }, { status: 400 });
  }

  const uploadedImageFiles: Array<FormDataEntryValue | undefined> = [...files, ...styleReferenceFiles, modelReferenceFile, merchantInfoFile];
  const oversizedFile = uploadedImageFiles
    .filter((file): file is File => Boolean(file) && isImageFileLike(file as FormDataEntryValue))
    .find((file) => file.size > maxImageUploadBytes);
  if (oversizedFile) {
    return NextResponse.json({
      error: "image_file_too_large",
      filename: oversizedFile.name,
      maxBytes: maxImageUploadBytes,
      message: `图片 ${oversizedFile.name} 超过 8MB，请压缩后再上传。`
    }, { status: 400 });
  }

  const customModel = parsed.data.customModelId ? await customModelRepository.findById(parsed.data.customModelId) : undefined;
  if (parsed.data.customModelId && (!customModel || customModel.customerId !== auth.user.id)) {
    return NextResponse.json({ error: "custom_model_not_found" }, { status: 400 });
  }

  const suiteData = parsed.data as typeof parsed.data & { suiteItems?: unknown; productAnalysisData?: unknown };
  const suiteItems = Array.isArray(suiteData.suiteItems) ? suiteData.suiteItems as SuitePlanItem[] : undefined;
  const productAnalysis = parsed.data.generationMode === "suite"
    ? resolveProductAnalysis({
        value: suiteData.productAnalysisData,
        category: parsed.data.category,
        categoryLabel: parsed.data.productCategoryLabel,
        sourceFilenames: files.map((file) => file.name)
      })
    : undefined;
  const styleLabels = (parsed.data.topSellerStyleIds?.length ? parsed.data.topSellerStyleIds : parsed.data.topSellerStyleId ? [parsed.data.topSellerStyleId] : [])
    .map((id) => findTopSellerStylePreset(id)?.label)
    .filter((item): item is string => Boolean(item))
    .concat(parsed.data.customStyleLabels ?? []);
  const suiteCreativePlan = parsed.data.generationMode === "suite" && suiteItems && productAnalysis
    ? buildSuiteCreativePlan({
        platform: parsed.data.platform,
        category: parsed.data.category,
        surface: parsed.data.suiteSurface ?? "main",
        suiteItems,
        productAnalysis,
        styleLabels,
        userPrompt: parsed.data.merchantPrompt ?? parsed.data.userPrompt
      })
    : undefined;
  const imageTypeIds = parsed.data.imageTypeIds?.length
    ? parsed.data.imageTypeIds
    : parsed.data.imageTypeId
      ? [parsed.data.imageTypeId]
      : [];

  const pricingPlan = await rechargeOrderRepository.pricingPlanForCustomer(auth.user.id);
  const jobOptions = {
    ...parsed.data,
    imageTypeId: imageTypeIds[0],
    imageTypeIds,
    userPrompt: parsed.data.userPrompt ?? parsed.data.merchantPrompt,
    merchantPrompt: parsed.data.merchantPrompt ?? parsed.data.userPrompt,
    productGroupingMode: parsed.data.productGroupingMode,
    targetWidth: parsed.data.targetWidth ?? 1024,
    targetHeight: parsed.data.targetHeight ?? 1536,
    customModelName: customModel?.name,
    ...(modelReferenceFile && !customModel
      ? {
          customModelId: "uploaded-model-reference",
          customModelName: modelReferenceFile.name
        }
      : {}),
    suiteItems,
    productAnalysis,
    suiteCreativePlan,
    billingImageCreditsPerUnit: pricingPlan.imageCreditsPerUnit
  };
  const reservedCredits = estimateGenerationJobCredits({ options: jobOptions, sourceImageCount: files.length, merchantInfoImageCount: merchantInfoFile ? 1 : 0, pricingPlan });
  const plannedOutputCount = estimateGenerationJobOutputCount({ options: jobOptions, sourceImageCount: files.length, merchantInfoImageCount: merchantInfoFile ? 1 : 0 });
  if (plannedOutputCount > maxGenerationOutputCount) {
    return NextResponse.json({
      error: "too_many_generation_outputs",
      max: maxGenerationOutputCount,
      planned: plannedOutputCount,
      message: `本次计划生成 ${plannedOutputCount} 张，超过单次上限 ${maxGenerationOutputCount} 张，请拆成多次生成。`
    }, { status: 400 });
  }
  const account = await rechargeOrderRepository.account(auth.user.id);
  if (account.balanceCredits < reservedCredits) {
    return NextResponse.json({ error: "insufficient_credits", requiredCredits: reservedCredits, account }, { status: 402 });
  }

  const job = generationJobService.createJob({
    customerId: auth.user.id,
    createdByActorId: auth.actor.actorId,
    createdByActorName: auth.actor.actorName,
    reservedCredits,
    options: {
      ...jobOptions
    },
    modelReferenceImage: customModel
      ? {
          id: customModel.id,
          filename: customModel.filename,
          mimeType: customModel.mimeType,
          file: customModel.file
        }
      : modelReferenceFile
        ? {
            id: `model-${crypto.randomUUID()}`,
            filename: modelReferenceFile.name,
            mimeType: modelReferenceFile.type || "application/octet-stream",
            file: modelReferenceFile
          }
      : undefined,
    merchantInfoImage: merchantInfoFile
      ? {
          id: `merchant-info-${crypto.randomUUID()}`,
          filename: merchantInfoFile.name,
          mimeType: merchantInfoFile.type || "application/octet-stream",
          file: merchantInfoFile
        }
      : undefined,
    sourceImages: files.map((file, index) => ({
      id: `src-${crypto.randomUUID()}`,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      file,
      role: parsed.data.productReferenceRoles?.[index],
      colorGroupId: productColorGroupIds[index] || undefined,
      colorGroupLabel: productColorGroupLabels[index] || undefined
    })),
    styleReferenceImages: styleReferenceFiles.map((file) => ({
      id: `style-${crypto.randomUUID()}`,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      file
    }))
  });

  try {
    await rechargeOrderRepository.reserveGenerationCredits({
      customerId: auth.user.id,
      generationJobId: job.id,
      credits: reservedCredits,
      actorId: auth.actor.actorId,
      actorName: auth.actor.actorName,
      reason: "创建生图任务冻结预计积分"
    });
  } catch (error) {
    await generationJobService.cancelJob(job.id).catch(() => undefined);
    if (isInsufficientCreditsError(error)) {
      const account = await rechargeOrderRepository.account(auth.user.id);
      return NextResponse.json({ error: "insufficient_credits", requiredCredits: reservedCredits, account }, { status: 402 });
    }
    return NextResponse.json({ error: "credit_reservation_failed" }, { status: 500 });
  }

  void generationJobService.runJob(job.id).catch(() => {
    void generationJobService.cancelJob(job.id).catch(() => undefined);
  });

  return NextResponse.json({ job: serializeGenerationJob(job) }, { status: 202 });
}

function isInsufficientCreditsError(error: unknown): boolean {
  return error instanceof Error && error.message === "insufficient_credits";
}

function resolveProductAnalysis(input: {
  value: unknown;
  category: Parameters<typeof buildProductAnalysisDraft>[0]["category"];
  categoryLabel?: string;
  sourceFilenames: string[];
}): ProductAnalysis {
  if (typeof input.value === "object" && input.value !== null) {
    const parsed = input.value as ProductAnalysis;
    if (parsed.visualUnderstanding) return parsed;
    return {
      ...buildProductAnalysisDraft({
        category: input.category,
        categoryLabel: input.categoryLabel,
        sourceFilenames: input.sourceFilenames
      }),
      ...parsed
    };
  }

  return buildProductAnalysisDraft({
    category: input.category,
    categoryLabel: input.categoryLabel,
    sourceFilenames: input.sourceFilenames
  });
}

function isImageFileLike(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value &&
    Number(value.size) > 0
  );
}

function parseJsonValue(value: FormDataEntryValue): unknown {
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function parseJsonObject(value: FormDataEntryValue | null): Record<string, unknown> | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined;
  } catch {
    return undefined;
  }
}
