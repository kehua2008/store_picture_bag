import { z } from "zod";
import {
  apparelCategories,
  findPlatformSpec,
  findSpecImageType,
  modelAgeRanges,
  modelGenders,
  modelHairStyles,
  modelModes,
  modelProfiles,
  legacyModelSkinToneMap,
  modelSkinTones,
  platforms,
  resolveProviderSizeForTarget,
  sceneVariants,
  scenes,
  sizePresets,
  specsForPlatform,
  type SizePreset
} from "../domain/apparel/options";
import { buildProductAnalysisDraft } from "../domain/suites/productAnalysis";
import { buildSuitePlan, findSuitePreset } from "../domain/suites/suitePresets";
import type { SuitePresetId, SuiteSurface } from "../domain/suites/suitePresets";
import { findTopSellerStylePreset, topSellerStylePresetIds } from "../domain/prompts/topSellerStylePresets";

const moduleCopySchema = z.object({
  suiteItemId: z.string().trim().min(1).max(120).optional(),
  imageTypeId: z.string().trim().min(1).max(80),
  imageTypeLabel: z.string().trim().min(1).max(40),
  title: z.string().trim().max(18),
  subtitle: z.string().trim().max(28),
  bullets: z.array(z.string().trim().max(8)).max(2),
  templateId: z.enum(["clean-corner", "side-editorial", "bottom-card", "detail-callout"]),
  detailNotes: z.string().trim().max(500).optional()
});

const suiteModuleConfigSchema = z.object({
  suiteItemId: z.string().trim().min(1).max(120),
  baseSuiteItemId: z.string().trim().min(1).max(120).optional(),
  imageTypeId: z.string().trim().min(1).max(80).optional(),
  role: z.string().trim().min(1).max(80).optional(),
  label: z.string().trim().min(1).max(40).optional(),
  enabled: z.boolean().optional(),
  outputCount: z.coerce.number().int().min(0).max(3).optional(),
  selectedColorGroupIds: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  detailNotes: z.string().trim().max(500).optional(),
  colorShotRequests: z.array(z.object({
    colorGroupId: z.string().trim().min(1).max(80),
    colorLabel: z.string().trim().min(1).max(40),
    count: z.coerce.number().int().min(0).max(3),
    shots: z.array(z.string().trim().min(1).max(20)).max(3)
  })).max(20).optional()
});

export const categorySchema = z.enum(["top", "bottom", "shoes"]);
export const assetTypeSchema = z.enum(["main_scene", "main_side_back", "detail", "white_bg", "sku_color"]);

export const referenceImageSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  dataUrl: z.string().optional()
});

export const productInputSchema = z.object({
  category: categorySchema,
  title: z.string().min(1),
  color: z.string().min(1),
  material: z.string().optional(),
  season: z.string().optional(),
  style: z.string().optional(),
  sellingPoints: z.array(z.string()).optional(),
  skuColors: z.array(z.string()).optional()
});

export const createGenerationJobSchema = z.object({
  platform: z.enum(platforms),
  category: z.enum(apparelCategories),
  productCategoryId: z.string().trim().min(1).max(80).optional(),
  productCategoryLabel: z.string().trim().min(1).max(40).optional(),
  scene: z.enum(scenes),
  sceneVariant: z.enum(sceneVariants),
  size: z.enum(sizePresets),
  modelProfile: z.enum(modelProfiles),
  count: z.coerce.number().int().min(1).max(99),
  imageTypeCounts: z.record(z.string(), z.coerce.number().int()).optional(),
  specId: z.string().min(1),
  imageTypeId: z.string().min(1).optional(),
  imageTypeIds: z.array(z.string().min(1)).optional(),
  productGroupingMode: z.enum(["per_image", "single_product_multi_angle", "outfit_combo"]).default("per_image"),
  productReferenceRoles: z.array(z.enum(["top_outerwear", "bottom", "shoes", "hat_accessory", "bag", "other"])).optional(),
  outfitSelectionMode: z.enum(["all", "random_count"]).default("all"),
  outfitItemCount: z.coerce.number().int().min(2).max(6).optional(),
  targetWidth: z.coerce.number().int().min(200).max(5000).optional(),
  targetHeight: z.coerce.number().int().min(200).max(5000).optional(),
  customSpecName: z.string().trim().min(1).max(40).optional(),
  modelMode: z.enum(modelModes).default("model"),
  modelGender: z.enum(modelGenders).optional(),
  modelAgeRange: z.enum(modelAgeRanges).optional(),
  modelSkinTone: z.preprocess((value) => typeof value === "string" ? legacyModelSkinToneMap[value] ?? value : value, z.enum(modelSkinTones)).optional(),
  modelHairStyle: z.enum(modelHairStyles).optional(),
  customModelId: z.string().trim().min(1).optional(),
  posterTitle: z.string().trim().max(18).optional(),
  posterSubtitle: z.string().trim().max(28).optional(),
  posterBullets: z.array(z.string().trim().max(8)).optional(),
  posterTemplateId: z.enum(["clean-corner", "side-editorial", "bottom-card", "detail-callout"]).optional(),
  moduleCopies: z.array(moduleCopySchema).optional(),
  suiteModuleConfigs: z.array(suiteModuleConfigSchema).optional(),
  topSellerStyleId: z.enum(topSellerStylePresetIds).optional(),
  topSellerStyleIds: z.array(z.enum(topSellerStylePresetIds)).optional(),
  customStyleIds: z.array(z.string().trim().min(1).max(120)).max(8).optional(),
  customStyleLabels: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  customStylePrompts: z.array(z.string().trim().min(1).max(2048)).max(8).optional(),
  photoMetadataMode: z.enum(["none", "simulated"]).default("none"),
  userPrompt: z.string().trim().max(3000).optional(),
  merchantPrompt: z.string().trim().max(3000).optional(),
  generationMode: z.enum(["single", "suite"]).default("single"),
  suitePresetId: z.enum(["basic-5", "standard-7", "detail-9", "detail-basic-conversion", "detail-women-editorial", "detail-functional"]).optional(),
  suiteSurface: z.enum(["main", "detail"]).optional(),
  suiteItemIds: z.array(z.string().min(1)).optional(),
  productAnalysis: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.imageTypeCounts) {
    value.imageTypeCounts = Object.fromEntries(Object.entries(value.imageTypeCounts).map(([key, count]) => {
      const normalized = Number.isFinite(count) && count >= 1 ? Math.min(99, Math.trunc(count)) : 1;
      return [key, normalized];
    }));
  }
  const imageTypeIds = value.imageTypeIds?.length ? value.imageTypeIds : value.imageTypeId ? [value.imageTypeId] : [];
  const styleIds = value.topSellerStyleIds?.length ? value.topSellerStyleIds : value.topSellerStyleId ? [value.topSellerStyleId] : [];
  if (styleIds.some((id) => !findTopSellerStylePreset(id))) {
    ctx.addIssue({ code: "custom", message: "unknown_top_seller_style", path: ["topSellerStyleId"] });
    return;
  }
  if (styleIds.length) {
    value.topSellerStyleId = styleIds[0];
    value.topSellerStyleIds = Array.from(new Set(styleIds));
  }
  if (value.customStyleIds?.length && value.customStylePrompts?.length && value.customStyleIds.length !== value.customStylePrompts.length) {
    ctx.addIssue({ code: "custom", message: "custom_style_metadata_mismatch", path: ["customStyleIds"] });
    return;
  }
  if (value.customStyleLabels?.length && value.customStylePrompts?.length && value.customStyleLabels.length !== value.customStylePrompts.length) {
    ctx.addIssue({ code: "custom", message: "custom_style_metadata_mismatch", path: ["customStyleLabels"] });
    return;
  }
  if (value.generationMode === "suite") {
    const presetId = value.suitePresetId ?? "standard-7";
    const requestedSpec = findPlatformSpec(value.specId, value.platform);
    const suiteSurface = value.suiteSurface ?? (requestedSpec?.assetGroup === "detail" ? "detail" : "main");
    const preset = findSuitePreset(presetId);
    if (!preset) {
      ctx.addIssue({ code: "custom", message: "unknown_suite_preset", path: ["suitePresetId"] });
      return;
    }

    const fullPlan = buildSuitePlan(value.platform, presetId as SuitePresetId, suiteSurface as SuiteSurface, value.category, value.productCategoryId);
    const moduleConfigsById = new Map(value.suiteModuleConfigs?.map((config) => [config.suiteItemId, config]));
    const requestedIds = value.suiteItemIds?.length ? value.suiteItemIds : fullPlan.map((item) => item.id);
    const suiteItems = requestedIds.map((id, index) => {
      const direct = fullPlan.find((item) => item.id === id);
      if (direct) return { ...direct, order: index + 1 };
      const config = moduleConfigsById.get(id);
      const base = config?.baseSuiteItemId ? fullPlan.find((item) => item.id === config.baseSuiteItemId) : undefined;
      return base ? { ...base, id, order: index + 1, label: config?.label ?? base.label } : undefined;
    });
    if (suiteItems.some((item) => !item)) {
      ctx.addIssue({ code: "custom", message: "unknown_suite_item", path: ["suiteItemIds"] });
      return;
    }

    const firstItem = suiteItems[0]!;
    const firstSpec = findPlatformSpec(firstItem.specId, value.platform);
    const firstImageType = firstSpec ? findSpecImageType(firstSpec, firstItem.imageTypeId) : undefined;
    if (!firstSpec || !firstImageType) {
      ctx.addIssue({ code: "custom", message: "unknown_suite_image_type", path: ["suitePresetId"] });
      return;
    }

    const size = resolveProviderSizeForTarget(firstSpec.targetWidth, firstSpec.targetHeight);
    value.size = size.preset as SizePreset;
    value.specId = firstSpec.id;
    value.imageTypeId = firstItem.imageTypeId;
    value.imageTypeIds = suiteItems.map((item) => item!.imageTypeId);
    value.targetWidth = firstSpec.targetWidth;
    value.targetHeight = firstSpec.targetHeight;
    value.scene = firstImageType.scene;
    value.sceneVariant = firstImageType.sceneVariant;
    value.suiteSurface = suiteSurface as SuiteSurface;
    (value as typeof value & { suiteItems?: unknown; productAnalysisData?: unknown }).suiteItems = suiteItems;
    (value as typeof value & { productAnalysisData?: unknown }).productAnalysisData = parseProductAnalysis(value.productAnalysis) ?? buildProductAnalysisDraft({ category: value.category });
    if (value.modelMode === "no_model") value.modelProfile = "product_only";
    return;
  }

  if (imageTypeIds.length === 0) {
    ctx.addIssue({ code: "custom", message: "missing_image_type_ids", path: ["imageTypeIds"] });
    return;
  }

  if (value.specId === "custom") {
    if (!value.targetWidth || !value.targetHeight) {
      ctx.addIssue({ code: "custom", message: "custom_spec_requires_target_width_and_height", path: ["targetWidth"] });
      return;
    }
    const platformImageTypes = specsForPlatform(value.platform).flatMap((spec) => spec.imageTypes);
    const invalidType = imageTypeIds.find((id) => !platformImageTypes.some((type) => type.id === id));
    if (invalidType) {
      ctx.addIssue({ code: "custom", message: "unknown_spec_image_type", path: ["imageTypeIds"] });
      return;
    }
    const size = resolveProviderSizeForTarget(value.targetWidth, value.targetHeight);
    value.size = size.preset as SizePreset;
    value.imageTypeId = imageTypeIds[0];
    value.imageTypeIds = imageTypeIds;
    return;
  }

  const spec = findPlatformSpec(value.specId, value.platform);
  if (!spec) {
    ctx.addIssue({ code: "custom", message: "unknown_platform_spec", path: ["specId"] });
    return;
  }

  const imageTypes = imageTypeIds.map((id) => findSpecImageType(spec, id));
  if (imageTypes.some((item) => !item)) {
    ctx.addIssue({ code: "custom", message: "unknown_spec_image_type", path: ["imageTypeId"] });
    return;
  }
  const imageType = imageTypes[0]!;

  const size = resolveProviderSizeForTarget(spec.targetWidth, spec.targetHeight);
  value.size = size.preset as SizePreset;
  value.imageTypeId = imageTypeIds[0];
  value.imageTypeIds = imageTypeIds;
  value.targetWidth = spec.targetWidth;
  value.targetHeight = spec.targetHeight;
  value.scene = imageType.scene;
  value.sceneVariant = imageType.sceneVariant;

  if (value.modelMode === "no_model") {
    value.modelProfile = "product_only";
  }
});

function parseProductAnalysis(value?: string) {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export const qualityCheckSchema = z.object({
  category: categorySchema,
  assetType: assetTypeSchema,
  metadata: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    mimeType: z.string(),
    fileSizeBytes: z.number().int().nonnegative(),
    dpi: z.number().optional(),
    colorMode: z.enum(["rgb", "cmyk", "unknown"]).optional(),
    whitePixelRatio: z.number().min(0).max(1).optional(),
    subjectOccupancy: z.number().min(0).max(1).optional(),
    detectedForbiddenElements: z.array(z.string()).optional()
  })
});

export const createVideoJobSchema = z.object({
  prompt: z.string().trim().min(1).max(3000),
  images: z.array(z.string().trim().min(1)).max(6).default([]),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5", "3:4"]).default("16:9"),
  outputResolution: z.enum(["480p", "720p"]).default("480p"),
  durationSeconds: z.coerce.number().int().min(1).max(15).default(5),
  generateAudio: z.boolean().optional(),
  referenceStrength: z.enum(["light", "medium", "heavy"]).default("medium"),
  referenceAssetId: z.string().trim().max(120).optional(),
  model: z.string().trim().min(1).max(80).optional(),
  enhancePrompt: z.boolean().default(true),
  enableUpsample: z.boolean().default(true),
  metadata: z.object({
    category: z.string().trim().max(40).optional(),
    videoType: z.string().trim().max(80).optional(),
    platform: z.string().trim().max(80).optional(),
    style: z.string().trim().max(80).optional(),
    captionMode: z.string().trim().max(80).optional(),
    musicMode: z.enum(["ai_music", "upload_music", "music_url", "none"]).optional(),
    voiceoverMode: z.enum(["none", "ai_voiceover", "script_voiceover", "upload_voiceover"]).optional(),
    subtitleMode: z.enum(["none", "ai_subtitle", "script_subtitle"]).optional(),
    musicAudioUrl: z.string().trim().max(1200).optional(),
    voiceoverAudioUrl: z.string().trim().max(1200).optional(),
    voiceoverScript: z.string().trim().max(1200).optional(),
    subtitleScript: z.string().trim().max(1200).optional(),
    outputQuality: z.string().trim().max(20).optional(),
    duration: z.string().trim().max(20).optional(),
    rewriteMode: z.string().trim().max(40).optional(),
    referenceSourceType: z.string().trim().max(80).optional(),
    referenceLink: z.string().trim().max(500).optional(),
    referenceStrength: z.enum(["light", "medium", "heavy"]).optional(),
    referenceProcessingMode: z.enum(["none", "single_frame", "multi_frame", "full_video"]).optional(),
    referenceAssetStatus: z.enum(["pending", "resolved", "failed"]).optional(),
    referenceSceneMode: z.enum(["product_only", "handheld_product", "model_wearing", "talking_head", "mixed"]).optional(),
    referenceMotionMode: z.enum(["static_display", "slow_pan", "hand_operation", "walking_show", "fast_cut"]).optional(),
    referenceTextMode: z.enum(["none", "light_caption", "dense_caption"]).optional(),
    resolvedReferenceVideoUrl: z.string().trim().max(1200).optional(),
    referenceFrameCount: z.coerce.number().int().min(0).max(8).optional(),
    referenceUploadStatus: z.string().trim().max(80).optional(),
    referenceParseError: z.string().trim().max(300).optional(),
    referenceAudioLink: z.string().trim().max(1200).optional(),
    generationGoals: z.array(z.string().trim().max(40)).max(8).optional(),
    productName: z.string().trim().max(80).optional(),
    audience: z.string().trim().max(80).optional(),
    offer: z.string().trim().max(80).optional()
  }).optional()
});

export const videoPromptWriterSchema = z.object({
  mode: z.enum(["draft", "revise"]),
  brief: z.string().trim().max(1000).optional(),
  currentScript: z.string().trim().max(4000).optional(),
  revision: z.string().trim().max(1000).optional(),
  productImages: z.array(z.string().trim().min(1).max(8_000_000)).min(1).max(3),
  productAnalysis: z.object({
    itemText: z.string().trim().max(120).optional(),
    summary: z.string().trim().max(500).optional(),
    assetLine: z.string().trim().max(500).optional()
  }).optional(),
  platform: z.string().trim().min(1).max(80),
  videoType: z.string().trim().min(1).max(80),
  durationSeconds: z.coerce.number().int().min(1).max(15),
  outputResolution: z.enum(["480p", "720p"]),
  musicMode: z.enum(["ai_music", "upload_music", "music_url", "none"]).optional(),
  voiceoverMode: z.enum(["none", "ai_voiceover", "script_voiceover", "upload_voiceover"]).optional(),
  subtitleMode: z.enum(["none", "ai_subtitle", "script_subtitle"]).optional(),
  voiceoverScript: z.string().trim().max(1200).optional(),
  subtitleScript: z.string().trim().max(1200).optional()
}).superRefine((value, ctx) => {
  if (value.mode === "revise") {
    if (!value.currentScript?.trim()) {
      ctx.addIssue({ code: "custom", message: "current_script_required", path: ["currentScript"] });
    }
    if (!value.revision?.trim()) {
      ctx.addIssue({ code: "custom", message: "revision_required", path: ["revision"] });
    }
  }
});

export const createVideoUpscaleTaskSchema = z.object({
  sourceType: z.enum(["videoJob", "upload"]),
  sourceVideoJobId: z.string().trim().max(140).optional(),
  sourceAssetId: z.string().trim().max(140).optional(),
  sourceVideoUrl: z.string().trim().max(1200).optional(),
  sourcePreviewUrl: z.string().trim().max(1200).optional(),
  sourceResolution: z.string().trim().max(40).optional(),
  targetResolution: z.enum(["720p", "1080p", "2k", "4k"]),
  durationSeconds: z.coerce.number().int().min(1).max(15).optional()
});
