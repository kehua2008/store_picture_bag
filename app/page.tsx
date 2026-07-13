"use client";

import { type DragEvent, FormEvent, type KeyboardEvent, type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  modelProfileLabels,
  modelAgeRangeLabels,
  modelAgeRanges,
  modelGenderLabels,
  modelGenderProfiles,
  modelGenders,
  modelHairStyleLabels,
  modelHairStyles,
  modelSkinToneLabels,
  modelSkinTones,
  platformLabels,
  imageTypesForCategory,
  resolveProviderSizeForTarget,
  sceneVariantLabels,
  specsForPlatform,
  type ApparelCategory,
  type CommercePlatform,
  type ModelAgeRange,
  type ModelGender,
  type ModelHairStyle,
  type ModelMode,
  type ModelProfile,
  type ModelSkinTone,
  type PlatformImageTypePreset,
  type PlatformSpecPreset,
  type SceneVariant,
  type SizePreset
} from "../src/domain/apparel/options";
import {
  defaultPosterCopy,
  normalizePosterCopy,
  posterTemplatePresets,
  type PosterCopy,
  type PosterTemplateId
} from "../src/domain/posters/posterComposer";
import { topSellerStylePresets, topSellerStylePresetsForCategory, type TopSellerStylePresetId } from "../src/domain/prompts/topSellerStylePresets";
import { buildSuitePlan, suitePresets, type SuitePlanItem, type SuitePresetId } from "../src/domain/suites/suitePresets";
import type { ProductGroupingMode, ProductReferenceRole, OutfitSelectionMode } from "../src/domain/jobs/generationJobService";

type JobStatus = "running" | "succeeded" | "partial_failed" | "failed" | "canceled";

type GenerationJobView = {
  id: string;
  mode: "image_edit";
  customerId?: string;
  reservedCredits?: number;
  chargedCredits?: number;
  createdAt: string;
  updatedAt: string;
  options: {
    platform: CommercePlatform;
    category: ApparelCategory;
    productCategoryId?: string;
    productCategoryLabel?: string;
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
    posterTitle?: string;
    posterSubtitle?: string;
    posterBullets?: string[];
    posterTemplateId?: string;
    topSellerStyleId?: string;
    topSellerStyleIds?: TopSellerStylePresetId[];
    customStyleIds?: string[];
    customStyleLabels?: string[];
    customStylePrompts?: string[];
    photoMetadataMode?: "none" | "simulated";
    userPrompt?: string;
    generationMode?: "single" | "suite";
    suitePresetId?: string;
    suiteSurface?: "main" | "detail";
  };
  sourceImages: Array<{ id: string; filename: string; mimeType: string; role?: ProductReferenceRole; colorGroupId?: string; colorGroupLabel?: string }>;
  sourceImageGroups?: Array<{ id: string; label?: string; images: Array<{ id: string; filename: string; mimeType: string; role?: ProductReferenceRole; colorGroupId?: string; colorGroupLabel?: string }> }>;
  styleReferenceImages?: Array<{ id: string; filename: string; mimeType: string }>;
  status: JobStatus;
  progress: { completed: number; total: number };
  prompt: {
    summary: string;
    body: string;
    negativePrompt: string;
  };
  results: Array<{
    id: string;
    base64: string;
    url?: string;
    mimeType: string;
    sourceFilename?: string;
    imageTypeId?: string;
    imageTypeLabel?: string;
    suiteItemId?: string;
    suiteOrder?: number;
    suiteRole?: string;
    suiteLabel?: string;
    topSellerStyleId?: TopSellerStylePresetId;
    topSellerStyleLabel?: string;
    customStyleId?: string;
    customStyleLabel?: string;
  }>;
  failures?: Array<{
    order: number;
    expectedCount: number;
  sourceFilename: string;
  imageTypeId: string;
  imageTypeLabel: string;
  suiteOrder?: number;
  suiteLabel?: string;
    topSellerStyleLabel?: string;
    customStyleLabel?: string;
    error: { code: string; message: string; retryable: boolean };
  }>;
  error?: { code: string; message: string; retryable: boolean };
};

type VideoJobStatus = "running" | "submitted" | "succeeded" | "failed" | "canceled";
type ReferenceSceneMode = "product_only" | "handheld_product" | "model_wearing" | "talking_head" | "mixed";
type ReferenceMotionMode = "static_display" | "slow_pan" | "hand_operation" | "walking_show" | "fast_cut";
type ReferenceTextMode = "none" | "light_caption" | "dense_caption";
type MusicMode = "ai_music" | "upload_music" | "music_url" | "none";
type VoiceoverMode = "none" | "ai_voiceover" | "script_voiceover" | "upload_voiceover";
type SubtitleMode = "none" | "ai_subtitle" | "script_subtitle";

type VideoJobView = {
  id: string;
  mode: "video";
  customerId: string;
  reservedCredits: number;
  chargedCredits?: number;
  status: VideoJobStatus;
  progress: { completed: number; total: number };
  createdAt: string;
  updatedAt: string;
  prompt: string;
  input: {
    aspectRatio?: string;
    outputResolution?: "480p" | "720p";
    durationSeconds?: number;
    metadata?: {
      category?: string;
      videoType?: string;
      platform?: string;
      style?: string;
      captionMode?: string;
      outputQuality?: string;
      duration?: string;
      rewriteMode?: string;
      referenceSourceType?: string;
      referenceLink?: string;
      referenceStrength?: "light" | "medium" | "heavy";
      referenceProcessingMode?: "none" | "single_frame" | "multi_frame" | "full_video";
      referenceAssetStatus?: "pending" | "resolved" | "failed";
      referenceSceneMode?: ReferenceSceneMode;
      referenceMotionMode?: ReferenceMotionMode;
      referenceTextMode?: ReferenceTextMode;
      resolvedReferenceVideoUrl?: string;
      referenceFrameCount?: number;
      referenceUploadStatus?: string;
      referenceParseError?: string;
      generationGoals?: string[];
    };
  };
  sourceImageCount: number;
  providerTask?: {
    id: string;
    status: string;
    model: string;
    provider: string;
  };
  providerUsage?: {
    totalTokens?: number;
    completionTokens?: number;
    requestedResolution?: string;
    actualResolution?: string;
    requestedDurationSeconds?: number;
    actualDurationSeconds?: number;
    actualCostCny?: number;
    costStatus?: string;
  };
  providerMismatch?: boolean;
  requestedResolution?: string;
  actualResolution?: string;
  requestedDurationSeconds?: number;
  actualDurationSeconds?: number;
  referenceStrength?: "light" | "medium" | "heavy";
  referenceProcessingMode?: "none" | "single_frame" | "multi_frame" | "full_video";
  referenceAssetStatus?: "pending" | "resolved" | "failed";
  referenceFrameCount?: number;
  referenceVideoUrl?: string;
  referenceUploadStatus?: string;
  referenceParseError?: string;
  upscaleTasks?: Array<{
    id: string;
    status: string;
    targetResolution: string;
  }>;
  result?: {
    url?: string;
    localUrl?: string;
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
    createdAt: string;
  };
  sourceAssets?: Array<{
    id: string;
    filename: string;
    mimeType: string;
  }>;
  attemptCount?: number;
  nextAttemptAt?: string;
  lastError?: { code: string; message: string; retryable: boolean };
  error?: { code: string; message: string; retryable: boolean };
};

type VideoJobPanelState = {
  id: string;
  status: "idle" | "running" | "submitted" | "ready" | "failed" | "canceled";
  progress: number;
  previewUrl?: string;
  sourceName?: string;
  sourceType?: string;
  resultUrl?: string;
  error?: string;
  providerTaskId?: string;
  reservedCredits?: number;
  chargedCredits?: number;
  requestedResolution?: string;
  actualResolution?: string;
  requestedDurationSeconds?: number;
  actualDurationSeconds?: number;
  totalTokens?: number;
  actualCostCny?: number;
  costStatus?: string;
  providerMismatch?: boolean;
  referenceStrength?: "light" | "medium" | "heavy";
  referenceProcessingMode?: "none" | "single_frame" | "multi_frame" | "full_video";
  referenceAssetStatus?: "pending" | "resolved" | "failed";
  referenceFrameCount?: number;
  referenceSceneMode?: ReferenceSceneMode;
  referenceMotionMode?: ReferenceMotionMode;
  referenceTextMode?: ReferenceTextMode;
  referenceParseError?: string;
  attemptCount?: number;
  nextAttemptAt?: string;
  lastError?: { code: string; message: string; retryable: boolean };
};

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
  role?: ProductReferenceRole;
  colorGroupId?: string;
};

type UploadedVideoAudio = {
  id: string;
  filename: string;
  publicUrl: string;
  localUrl: string;
};

type ImageTaskMode = "single" | "detail_suite";

const merchantInfoGraphicImageTypeId = "detail_merchant_info_graphic";
const defaultDetailSuitePresetId: SuitePresetId = "detail-basic-conversion";
const detailSuitePresetIds: SuitePresetId[] = ["detail-basic-conversion", "detail-women-editorial", "detail-functional"];
const detailModelShotOptions = ["正面", "侧面", "背面", "场景照"] as const;

const colorKeywordRules: Array<{ id: string; label: string; pattern: RegExp }> = [
  { id: "black", label: "黑色", pattern: /(黑|black)/i },
  { id: "white", label: "白色", pattern: /(白|white)/i },
  { id: "gray", label: "灰色", pattern: /(灰|gray|grey)/i },
  { id: "red", label: "红色", pattern: /(红|red)/i },
  { id: "blue", label: "蓝色", pattern: /(蓝|blue)/i },
  { id: "green", label: "绿色", pattern: /(绿|green)/i },
  { id: "yellow", label: "黄色", pattern: /(黄|yellow)/i },
  { id: "pink", label: "粉色", pattern: /(粉|pink)/i },
  { id: "purple", label: "紫色", pattern: /(紫|purple)/i },
  { id: "brown", label: "棕色", pattern: /(棕|brown)/i },
  { id: "beige", label: "米色", pattern: /(米|beige)/i },
  { id: "khaki", label: "卡其", pattern: /(卡其|khaki)/i }
];

type CustomModel = {
  id: string;
  name: string;
  filename: string;
  mimeType: string;
  createdAt: string;
  imageUrl: string;
  modelGender?: ModelGender;
  modelAgeRange?: ModelAgeRange;
  modelSkinTone?: ModelSkinTone;
  modelHairStyle?: ModelHairStyle;
  modelProfile?: ModelProfile;
};

type CustomStylePreset = {
  id: string;
  name: string;
  filename: string;
  imageDataUrl: string;
  prompt: string;
  sampleId?: string;
  imageHash?: string;
  stylePrompt?: string;
  analysis?: StyleReferenceAnalysis;
  analyzerModel?: string;
  analyzedAt?: string;
  createdAt: string;
};

type StyleReferenceAnalysis = {
  background: string[];
  lighting: string[];
  camera: string[];
  pose: string[];
  palette: string[];
  props: string[];
  composition: string[];
  avoid: string[];
  qualityScore: number;
  summary: string;
};

type PlatformStyleBoard = {
  id: string;
  platform: string;
  category: string;
  imageType: string;
  styleName: string;
  sampleCount: number;
  status: "draft" | "ready_to_publish" | "published" | "archived";
  showOnHome: boolean;
  displayOrder: number;
  rules: {
    mustUse: string[];
    avoid: string[];
    background: string[];
    lighting: string[];
    camera: string[];
    pose: string[];
    palette: string[];
    prompt: string;
    promptCore?: string;
    promptVariants?: string[];
    negativePrompt?: string;
    productBrief?: string;
    sceneBrief?: string;
    colorRules?: string[];
    compositionRules?: string[];
  };
};

type ModuleCopyDraft = Partial<PosterCopy> & {
  bulletText?: string;
};

type NormalizedModuleCopy = PosterCopy & {
  suiteItemId?: string;
  imageTypeId: string;
  imageTypeLabel: string;
  detailNotes?: string;
};

type DetailModuleDraft = ModuleCopyDraft & {
  enabled?: boolean;
  detailNotes?: string;
  selectedColorGroupIds?: string[];
};

type DetailSuitePlanItem = SuitePlanItem & {
  baseSuiteItemId?: string;
  instanceIndex?: number;
  duplicate?: boolean;
};

function hasDetailModuleCopyInput(draft: DetailModuleDraft | undefined): boolean {
  if (!draft) return false;
  const bulletText = draft.bulletText ?? draft.bullets?.join("\n") ?? "";
  return Boolean(draft.title?.trim() || draft.subtitle?.trim() || bulletText.trim());
}

function explicitDetailModuleCopy(input: {
  item: DetailSuitePlanItem;
  draft: DetailModuleDraft;
}): NormalizedModuleCopy {
  const bullets = (input.draft.bulletText ?? input.draft.bullets?.join("\n") ?? "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, 8))
    .slice(0, 2);
  return {
    suiteItemId: input.item.id,
    imageTypeId: input.item.imageTypeId,
    imageTypeLabel: input.item.label,
    title: (input.draft.title ?? "").trim().slice(0, 18),
    subtitle: (input.draft.subtitle ?? "").trim().slice(0, 28),
    bullets,
    templateId: input.draft.templateId ?? "side-editorial"
  };
}

type DetailModuleConfig = {
  suiteItemId: string;
  baseSuiteItemId?: string;
  imageTypeId: string;
  role: string;
  label: string;
  enabled: boolean;
  outputCount: number;
  selectedColorGroupIds: string[];
  detailNotes?: string;
};

type WorkspaceMode = "image" | "video";
type EntranceView = "home" | "choice" | "workbench";
type SpecPanelMode = "main" | "detail";
type PortalHistoryState = {
  dsPortal: true;
  entranceView: EntranceView;
  workspaceMode: WorkspaceMode;
  videoCreationMode?: "choose" | "reference" | "custom";
};

function initialWorkspaceModeFromUrl(): WorkspaceMode {
  return "image";
}

function initialEntranceViewFromUrl(): EntranceView {
  return "home";
}

type CurrentUser = {
  id: string;
  phone: string;
  displayName?: string;
  companyName?: string;
  status: "active" | "suspended";
  createdAt?: string;
  updatedAt?: string;
};

type SessionActorView = {
  actorId: string;
  actorName: string;
};

type CreditAccountView = {
  customerId: string;
  balanceCredits: number;
  frozenCredits: number;
  updatedAt?: string;
};

type CreditDialogState = {
  title: string;
  message: string;
  requiredCredits?: number;
  balanceCredits?: number;
};

type CategoryPreset = {
  id: string;
  category: ApparelCategory;
  label: string;
  desc: string;
  mark: string;
  promptHint: string;
};

type MajorCategoryId = "bags";

type CategoryGroupPreset = {
  id: string;
  category: ApparelCategory;
  label: string;
  desc: string;
  mark: string;
  promptHint: string;
  categories: CategoryPreset[];
};

const customStyleStorageKey = "ds-bags.customTopSellerStyles.v1";
const activeGenerationJobStorageKey = "ds-bags.activeGenerationJob.v1";
const activeVideoJobStorageKey = "ds-bags.activeVideoJob.v1";
const imageWorkbenchDraftStorageKey = "ds-bags.imageWorkbenchDraft.v1";
const videoWorkbenchDraftStorageKey = "ds-bags.videoWorkbenchDraft.v1";
const styleReferenceAnalysisCredits = 2;
const maxCustomStylePromptLength = 2048;
const maxImageUploadCount = 12;
const maxImageUploadBytes = 8 * 1024 * 1024;
const maxDraftFileBytes = maxImageUploadBytes;
const maxDraftTotalBytes = 40 * 1024 * 1024;

const productReferenceRoleLabels: Record<ProductReferenceRole, string> = {
  top_outerwear: "裤装/袜子",
  bottom: "下装搭配",
  shoes: "鞋履搭配",
  hat_accessory: "包装盒/配件",
  bag: "包袋",
  other: "其他"
};

const outfitRoles: ProductReferenceRole[] = ["top_outerwear", "bottom", "shoes", "hat_accessory", "bag", "other"];

type MajorCategoryPreset = {
  id: MajorCategoryId;
  category: ApparelCategory;
  label: string;
  desc: string;
  mark: string;
};

type PersistedLocalImage = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  lastModified: number;
  storageKey?: string;
  role?: ProductReferenceRole;
  colorGroupId?: string;
};

type ImageWorkbenchDraft = {
  version: 1;
  savedAt: string;
  workspaceMode: WorkspaceMode;
  platform: CommercePlatform;
  selectedSpecId: string;
  selectedImageTypeIds: string[];
  imageTypeCounts: Record<string, string>;
  imageTaskMode: ImageTaskMode;
  selectedDetailSuitePresetId: SuitePresetId;
  detailColorNames: Record<string, string>;
  productGroupingMode: ProductGroupingMode;
  customWidth: number;
  customHeight: number;
  customSpecSurface: "main" | "detail";
  activeSpecPanel: SpecPanelMode;
  modelMode: ModelMode;
  selectedModelGender: ModelGender;
  selectedModelAgeRange: ModelAgeRange;
  selectedModelSkinTone: ModelSkinTone;
  selectedModelHairStyle: ModelHairStyle;
  selectedCustomModelId: string;
  selectedStyleIds: TopSellerStylePresetId[];
  simulatePhotoMetadata: boolean;
  selectedCustomStyleIds: string[];
  selectedStyleBoardIds: string[];
  userPrompt: string;
  selectedMajorCategoryId: MajorCategoryId;
  selectedCategoryGroupId: string;
  selectedCategoryId: string;
  textEnabledImageTypeIds: string[];
  moduleCopyDrafts: Record<string, ModuleCopyDraft>;
  detailModuleDrafts: Record<string, DetailModuleDraft>;
  detailModuleCopyCounts: Record<string, number>;
  activeDetailSuiteItemId: string;
  status: string;
  images: PersistedLocalImage[];
  merchantInfoImage?: PersistedLocalImage;
  styleReferenceImage?: PersistedLocalImage;
  customModelReferenceImage?: PersistedLocalImage;
};

type VideoWorkbenchDraft = {
  version: 1;
  savedAt: string;
  videoCreationMode: "choose" | "reference" | "custom";
  selectedVideoCategoryId: MajorCategoryId;
  videoTypeId: string;
  videoPlatformId: string;
  rewriteModeId: string;
  mainVideoTemplate: string;
  referenceVideoLink: string;
  selectedVideoGoals: string[];
  videoPrompt: string;
  videoAspect: string;
  videoDurationId: string;
  customVideoDurationSeconds: string;
  musicMode: MusicMode;
  voiceoverMode: VoiceoverMode;
  subtitleMode: SubtitleMode;
  musicAudioUrl: string;
  voiceoverScript: string;
  subtitleScript: string;
  musicAudio?: UploadedVideoAudio;
  voiceoverAudio?: UploadedVideoAudio;
  videoQuality: string;
  customVideoBrief: string;
  customVideoScript: string;
  customVideoRevision: string;
  customScriptStatus: string;
  productVideoFiles: PersistedLocalImage[];
  referenceVideoFiles: PersistedLocalImage[];
};

const majorCategoryPresets: MajorCategoryPreset[] = [
  { id: "bags", category: "bags", label: "箱包", desc: "女包 / 男包 / 双肩包 / 旅行箱 / 小皮具", mark: "包" },
];

const primaryMajorCategoryPresets = majorCategoryPresets;
const moreMajorCategoryPresets = majorCategoryPresets.slice(3);
const moreCategoryGroups = [
  moreMajorCategoryPresets.slice(0, 4),
  moreMajorCategoryPresets.slice(4)
];

const bagCategoryGroups: CategoryGroupPreset[] = [
  {
    id: "women_bags",
    category: "bags",
    label: "女包",
    desc: "托特包 / 腋下包 / 斜挎包 / 手提包",
    mark: "女",
    promptHint: "Tmall bag category: women's bags. Emphasize bag silhouette, handle or strap structure, hardware, leather or fabric grain, scale on body, elegant hand-carry, shoulder-carry or crossbody styling.",
    categories: [
      { id: "tote_bag", category: "bags", label: "托特包", desc: "通勤 / 大容量 / 肩背", mark: "托", promptHint: "Tmall bag category: tote bag. Emphasize open-top or zip-top silhouette, handle drop, shoulder scale, capacity impression, leather/canvas texture and clean commute styling." },
      { id: "crossbody_bag", category: "bags", label: "斜挎包", desc: "轻便 / 出街 / 肩带", mark: "挎", promptHint: "Tmall bag category: crossbody bag. Emphasize strap length, front flap or zipper, body scale, hardware, hands-free carry pose and accurate color/material." },
      { id: "shoulder_bag", category: "bags", label: "腋下包/肩背包", desc: "精致 / 轻奢 / 搭配", mark: "肩", promptHint: "Tmall bag category: shoulder bag. Emphasize curved or structured silhouette, short strap, hardware, refined under-arm scale and premium styling." },
      { id: "handbag", category: "bags", label: "手提包", desc: "通勤 / 气质 / 五金", mark: "提", promptHint: "Tmall bag category: handbag. Emphasize top handles, structured body, hardware, leather grain, hand-carry pose and premium business-casual scene." }
    ]
  },
  {
    id: "men_commute_bags",
    category: "bags",
    label: "男包通勤",
    desc: "公文包 / 胸包 / 邮差包 / 腰包",
    mark: "男",
    promptHint: "Tmall bag category: men's and commute bags. Emphasize durable material, compartments, zipper quality, strap structure, laptop/document capacity and practical city commute scenes.",
    categories: [
      { id: "briefcase", category: "bags", label: "公文包", desc: "商务 / 电脑 / 文件", mark: "公", promptHint: "Tmall bag category: briefcase. Emphasize structured rectangle body, handle, shoulder strap, laptop/document capacity, zipper/hardware and office commute credibility." },
      { id: "messenger_bag", category: "bags", label: "邮差包", desc: "斜挎 / 通勤 / 休闲", mark: "邮", promptHint: "Tmall bag category: messenger bag. Emphasize flap, strap adjustment, crossbody scale, pockets and practical urban carry." },
      { id: "chest_bag", category: "bags", label: "胸包", desc: "轻户外 / 出街 / 收纳", mark: "胸", promptHint: "Tmall bag category: chest bag. Emphasize compact body, strap buckle, front pocket, zipper path, body-worn scale and street utility." },
      { id: "waist_bag", category: "bags", label: "腰包", desc: "运动 / 轻便 / 随身", mark: "腰", promptHint: "Tmall bag category: waist bag. Emphasize waist or crossbody carry, zipper compartments, lightweight nylon/leather texture and casual utility." }
    ]
  },
  {
    id: "backpacks",
    category: "bags",
    label: "双肩包",
    desc: "学生包 / 电脑包 / 机能背包",
    mark: "双",
    promptHint: "Tmall bag category: backpacks. Emphasize front silhouette, shoulder straps, back panel, compartments, laptop capacity, side pockets, zipper pulls and realistic worn-on-back or desk-side scale.",
    categories: [
      { id: "laptop_backpack", category: "bags", label: "电脑双肩包", desc: "通勤 / 电脑仓 / 分区", mark: "电", promptHint: "Tmall bag category: laptop backpack. Emphasize padded laptop compartment, shoulder straps, back padding, zipper organization and professional commute scale." },
      { id: "student_backpack", category: "bags", label: "学生书包", desc: "校园 / 轻量 / 护脊", mark: "书", promptHint: "Tmall bag category: student backpack. Emphasize safe rounded structure, school capacity, comfortable straps, reflective or child-safe details and clean family-friendly scenes." },
      { id: "fashion_backpack", category: "bags", label: "潮流双肩包", desc: "出街 / 搭配 / 轻便", mark: "潮", promptHint: "Tmall bag category: fashion backpack. Emphasize compact silhouette, styling scale, zipper and pocket details, strap shape and city street outfit pairing." },
      { id: "camera_backpack", category: "bags", label: "摄影/设备包", desc: "保护 / 分仓 / 户外", mark: "摄", promptHint: "Tmall bag category: camera or gear backpack. Emphasize structured protection, divider compartments, rugged fabric, buckles and outdoor/creator utility." }
    ]
  },
  {
    id: "travel_luggage",
    category: "bags",
    label: "旅行箱包",
    desc: "拉杆箱 / 登机箱 / 旅行袋",
    mark: "旅",
    promptHint: "Tmall luggage category: travel luggage. Emphasize shell shape, telescopic handle, wheels, zipper/lock, capacity, front/side readability, airport or hotel context without clutter.",
    categories: [
      { id: "carry_on_luggage", category: "bags", label: "登机箱", desc: "20寸 / 轻便 / 轮组", mark: "登", promptHint: "Tmall luggage category: carry-on suitcase. Emphasize compact shell, telescopic handle, wheels, lock, corner protection and clean travel scale." },
      { id: "large_luggage", category: "bags", label: "大容量拉杆箱", desc: "旅行 / 扩容 / 耐用", mark: "箱", promptHint: "Tmall luggage category: large suitcase. Emphasize shell capacity, front and side profile, handle, wheels, expansion zipper and durable texture." },
      { id: "duffel_bag", category: "bags", label: "旅行袋", desc: "短途 / 手提 / 斜挎", mark: "袋", promptHint: "Tmall bag category: duffel bag. Emphasize barrel or rectangular body, top handles, shoulder strap, zipper opening, capacity and hotel/gym travel scene." },
      { id: "travel_organizer_bag", category: "bags", label: "收纳旅行包", desc: "分区 / 洗漱 / 便携", mark: "纳", promptHint: "Tmall bag category: travel organizer. Emphasize compartments, zipper mesh, folded or open structure, toiletry/cable organization and clean tabletop context." }
    ]
  },
  {
    id: "outdoor_function",
    category: "bags",
    label: "户外机能包",
    desc: "登山包 / 骑行包 / 防水包",
    mark: "户",
    promptHint: "Tmall bag category: outdoor and functional bags. Emphasize waterproof or abrasion-resistant fabric, buckles, straps, load-bearing structure, pockets and real outdoor utility.",
    categories: [
      { id: "hiking_backpack", category: "bags", label: "登山包", desc: "负重 / 背负 / 户外", mark: "山", promptHint: "Tmall bag category: hiking backpack. Emphasize frame or back support, waist belt, straps, waterproof fabric, side pockets and trail load-bearing scene." },
      { id: "cycling_bag", category: "bags", label: "骑行包", desc: "轻量 / 稳固 / 防水", mark: "骑", promptHint: "Tmall bag category: cycling bag. Emphasize compact aerodynamic shape, strap stability, waterproof zipper, reflective details and bike-use context." },
      { id: "waterproof_bag", category: "bags", label: "防水包", desc: "溯溪 / 露营 / 干湿分离", mark: "水", promptHint: "Tmall bag category: waterproof dry bag. Emphasize roll-top closure, sealed seams, waterproof fabric, outdoor wet context and capacity visibility." },
      { id: "camping_bag", category: "bags", label: "露营收纳包", desc: "装备 / 分区 / 耐磨", mark: "营", promptHint: "Tmall bag category: camping organizer bag. Emphasize rugged fabric, handles, compartments, gear capacity and tidy campsite tabletop or ground-cloth scene." }
    ]
  },
  {
    id: "small_leather_goods",
    category: "bags",
    label: "钱包小皮具",
    desc: "钱包 / 卡包 / 钥匙包 / 手机包",
    mark: "皮",
    promptHint: "Tmall leather goods category: wallets and small leather goods. Emphasize leather grain, stitching, card slots, zipper, snap closure, compact scale and premium tabletop detail.",
    categories: [
      { id: "wallet", category: "bags", label: "钱包", desc: "短款 / 长款 / 卡位", mark: "钱", promptHint: "Tmall leather goods category: wallet. Emphasize fold structure, card slots, stitching, leather grain, zipper or snap closure and hand/tabletop scale." },
      { id: "card_holder", category: "bags", label: "卡包", desc: "轻薄 / 卡位 / 通勤", mark: "卡", promptHint: "Tmall leather goods category: card holder. Emphasize slim profile, card slot layout, leather texture, edge finish and compact carry." },
      { id: "phone_pouch", category: "bags", label: "手机包", desc: "斜挎 / 轻便 / 随身", mark: "机", promptHint: "Tmall bag category: phone pouch. Emphasize phone-sized scale, strap, zipper or flap, hand/crossbody usage and everyday light-carry scene." },
      { id: "key_pouch", category: "bags", label: "钥匙包", desc: "小巧 / 五金 / 收纳", mark: "钥", promptHint: "Tmall leather goods category: key pouch. Emphasize zipper, key ring hardware, small leather body, stitching and premium macro detail." }
    ]
  },
  {
    id: "baby_kids_bags",
    category: "bags",
    label: "母婴儿童包",
    desc: "妈咪包 / 儿童包 / 保温包",
    mark: "童",
    promptHint: "Tmall bag category: baby and kids bags. Emphasize safe rounded structure, light weight, parent-friendly compartments, child scale, clean family scenes and no unsafe child handling.",
    categories: [
      { id: "diaper_bag", category: "bags", label: "妈咪包", desc: "分区 / 大容量 / 亲子", mark: "妈", promptHint: "Tmall bag category: diaper bag. Emphasize bottle pockets, wet/dry compartments, stroller-friendly straps, large capacity and clean parent-child use context." },
      { id: "kids_backpack", category: "bags", label: "儿童双肩包", desc: "可爱 / 轻量 / 校园", mark: "儿", promptHint: "Tmall bag category: kids backpack. Emphasize small child scale, rounded safe shape, straps, light weight, playful but clean color and school/daytrip context." },
      { id: "thermal_lunch_bag", category: "bags", label: "保温饭包", desc: "便当 / 保温 / 手提", mark: "饭", promptHint: "Tmall bag category: thermal lunch bag. Emphasize insulated material, handle, zipper, food container capacity and clean tabletop/lunch context." },
      { id: "stroller_bag", category: "bags", label: "推车挂包", desc: "挂扣 / 收纳 / 出行", mark: "挂", promptHint: "Tmall bag category: stroller organizer bag. Emphasize hooks, pockets, bottle storage, stroller attachment and parent-friendly travel scene." }
    ]
  },
  {
    id: "cosmetic_storage_bags",
    category: "bags",
    label: "收纳化妆包",
    desc: "化妆包 / 洗漱包 / 证件包",
    mark: "妆",
    promptHint: "Tmall bag category: cosmetic and storage bags. Emphasize zipper opening, internal pockets, waterproof lining, compact storage logic and clean vanity/travel tabletop context.",
    categories: [
      { id: "cosmetic_bag", category: "bags", label: "化妆包", desc: "开口 / 分区 / 便携", mark: "妆", promptHint: "Tmall bag category: cosmetic bag. Emphasize zipper opening, internal compartments, waterproof lining, cosmetic storage scale and clean vanity scene." },
      { id: "toiletry_bag", category: "bags", label: "洗漱包", desc: "旅行 / 防水 / 悬挂", mark: "洗", promptHint: "Tmall bag category: toiletry bag. Emphasize hanging hook, waterproof lining, transparent or mesh compartments, zipper organization and travel bathroom/hotel context." },
      { id: "document_pouch", category: "bags", label: "证件包", desc: "护照 / 票据 / 收纳", mark: "证", promptHint: "Tmall bag category: document pouch. Emphasize slim organizer shape, passport/card/ticket compartments, zipper and clean travel tabletop scene." },
      { id: "packing_cube", category: "bags", label: "行李收纳袋", desc: "衣物 / 分装 / 旅行", mark: "装", promptHint: "Tmall bag category: packing cube. Emphasize mesh panel, zipper, folded clothes capacity, modular travel organization and neat luggage context." }
    ]
  }
];

const categoryGroupsByMajor: Record<MajorCategoryId, CategoryGroupPreset[]> = {
  bags: bagCategoryGroups
};

const categoryPresetsByMajor: Record<MajorCategoryId, CategoryPreset[]> = {
  bags: bagCategoryGroups.flatMap((group) => group.categories)
};

const domesticPlatforms: CommercePlatform[] = [
  "vipshop",
  "taobao",
  "jd",
  "pinduoduo",
  "dewu",
  "xiaohongshu",
  "douyin",
  "kuaishou",
  "wechat_channels"
];

const crossBorderPlatforms: CommercePlatform[] = [
  "amazon",
  "ebay",
  "walmart",
  "etsy",
  "shopee",
  "lazada",
  "aliexpress",
  "tiktok_shop_global",
  "shopify"
];

type CategorySearchResult = {
  major: MajorCategoryPreset;
  group: CategoryGroupPreset;
  category: CategoryPreset;
  score: number;
};

const categorySearchCorpus: CategorySearchResult[] = majorCategoryPresets.flatMap((major) =>
  categoryGroupsByMajor[major.id].flatMap((group) =>
    group.categories.map((category) => ({
      major,
      group,
      category,
      score: 0
    }))
  )
);

function normalizeCategorySearchText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function fuzzyIncludes(text: string, query: string) {
  let index = 0;
  for (const char of query) {
    index = text.indexOf(char, index);
    if (index === -1) return false;
    index += 1;
  }
  return true;
}

function scoreCategorySearchItem(item: CategorySearchResult, query: string) {
  const fields = [
    item.category.label,
    item.category.desc,
    item.category.mark,
    item.category.promptHint,
    item.group.label,
    item.group.desc,
    item.group.mark,
    item.group.promptHint,
    item.major.label,
    item.major.desc,
    item.major.mark
  ].map(normalizeCategorySearchText);
  const joined = fields.join(" ");
  if (!query) return 0;
  if (fields[0] === query) return 100;
  if (fields[0].includes(query)) return 90;
  if (joined.includes(query)) return 70;
  if (fuzzyIncludes(joined, query)) return 35;
  return 0;
}

function searchCategoryPresets(query: string) {
  const normalizedQuery = normalizeCategorySearchText(query);
  if (!normalizedQuery) return [];
  return categorySearchCorpus
    .map((item) => ({ ...item, score: scoreCategorySearchItem(item, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.major.label.localeCompare(right.major.label, "zh-Hans-CN"))
    .slice(0, 8);
}

function inferOutfitRoleFromFilename(filename: string, categoryId: string, index: number): ProductReferenceRole {
  const text = `${filename} ${categoryId}`.toLowerCase();
  if (/(包|箱|wallet|bag|bags|backpack|luggage|tote|crossbody|handbag|duffel|pouch)/i.test(text)) return "bag";
  if (/(鞋|靴|sneaker|shoe|shoes|boot|boots|loafer|sandal)/i.test(text)) return "shoes";
  if (/(包|袋|bag|tote|handbag|backpack|purse)/i.test(text)) return "bag";
  if (/(裤|裙|short|pants|trouser|jeans|skirt|bottom)/i.test(text)) return "bottom";
  if (/(帽|表|手表|围巾|腰带|首饰|项链|耳环|戒指|配件|cap|hat|watch|belt|scarf|necklace|earring|ring|accessory)/i.test(text)) return "hat_accessory";
  if (/(衣|衫|外套|大衣|卫衣|毛衣|马甲|西装|top|shirt|tee|tshirt|coat|jacket|hoodie|sweater|blazer|vest|outerwear)/i.test(text)) return "top_outerwear";
  return outfitRoles[index % outfitRoles.length] ?? "other";
}

function inferDetailColorGroupId(filename: string, index: number): string {
  const matched = colorKeywordRules.find((item) => item.pattern.test(filename));
  return matched?.id ?? `color-${index + 1}`;
}

function buildDetailSuitePlanSafe(platform: CommercePlatform, presetId: SuitePresetId, category: ApparelCategory, productCategoryId: string): SuitePlanItem[] {
  try {
    return buildSuitePlan(platform, presetId, "detail", category, productCategoryId);
  } catch {
    return [];
  }
}

function buildDetailSuiteProductAnalysisDraft(input: {
  categoryLabel: string;
  categoryGroupLabel: string;
  colorGroups: Array<{ label: string; imageCount: number }>;
  styleLabels: string[];
  userPrompt: string;
}) {
  const colorLabels = input.colorGroups.map((group) => group.label).filter(Boolean);
  const productName = input.categoryLabel || input.categoryGroupLabel || "箱包商品";
  return {
    productName,
    productNameZh: productName,
    productType: productName,
    productStyle: input.styleLabels.join(" / ") || `${input.categoryGroupLabel}电商详情页`,
    color: colorLabels.length ? colorLabels.join(" / ") : "accurate original colors",
    visualFeatures: [
      `${input.categoryGroupLabel}包型结构`,
      colorLabels.length > 1 ? "多色SKU展示" : "单色商品展示",
      "详情页完整信息节奏"
    ],
    productIdentityLock: `Keep the same ${productName} bag silhouette, handles, shoulder strap, zipper path, pockets, hardware, stitching, logo-like marks, leather/fabric texture and accurate SKU colors across every detail-page module.`,
    targetScenes: ["详情首屏", "白底展示", "真人携带展示", "材质五金细节", "容量结构说明", "品质收尾"],
    targetAudience: "电商平台箱包购买用户",
    sellingPoints: [
      { type: "fit", title: "包型清晰", description: "正面、侧面、底部和携带比例更直观", visualKeywords: ["bag silhouette", "scale"] },
      { type: "quality", title: "材质五金", description: "皮革/织物纹理、走线、拉链和扣具看得清", visualKeywords: ["hardware", "texture"] },
      { type: "scene", title: "容量分区", description: colorLabels.length ? `${colorLabels.join("、")}等颜色统一展示，并补充容量结构` : "多角度素材统一展示，并补充容量结构", visualKeywords: ["capacity", "compartments"] }
    ],
    designDetails: input.userPrompt.trim()
  };
}

function detailModuleOutputCount(_item: DetailSuitePlanItem, draft: DetailModuleDraft | undefined, _colorGroups: Array<{ id: string; label: string; images: LocalImage[] }>): number {
  if (draft?.enabled === false) return 0;
  return 1;
}

function buildDetailModuleConfig(item: DetailSuitePlanItem, draft: DetailModuleDraft | undefined, colorGroups: Array<{ id: string; label: string; images: LocalImage[] }>): DetailModuleConfig {
  const outputCount = detailModuleOutputCount(item, draft, colorGroups);
  const selectedColorGroupIds = draft?.selectedColorGroupIds ?? [];
  return {
    suiteItemId: item.id,
    baseSuiteItemId: item.baseSuiteItemId,
    imageTypeId: item.imageTypeId,
    role: item.role,
    label: item.label,
    enabled: outputCount > 0,
    outputCount,
    selectedColorGroupIds,
    detailNotes: draft?.detailNotes?.trim() || undefined
  };
}

function buildDetailSuiteItemInstances(items: SuitePlanItem[], copyCounts: Record<string, number>): DetailSuitePlanItem[] {
  const expanded = items.flatMap((item) => {
    const copies = Math.max(0, Math.min(8, Math.trunc(Number(copyCounts[item.id] ?? 0))));
    const needsNumber = copies > 0;
    const baseItem: DetailSuitePlanItem = {
      ...item,
      label: needsNumber ? `${item.label}1` : item.label,
      baseSuiteItemId: item.id,
      instanceIndex: 1
    };
    const duplicateItems: DetailSuitePlanItem[] = Array.from({ length: copies }, (_, index) => ({
      ...item,
      id: `${item.id}__copy_${index + 2}`,
      label: `${item.label}${index + 2}`,
      baseSuiteItemId: item.id,
      instanceIndex: index + 2,
      duplicate: true
    }));
    return [baseItem, ...duplicateItems];
  });
  return expanded.map((item, index) => ({ ...item, order: index + 1 }));
}

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const merchantInfoInputRef = useRef<HTMLInputElement>(null);
  const customModelInputRef = useRef<HTMLInputElement>(null);
  const styleReferenceInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<LocalImage[]>([]);
  const merchantInfoImageRef = useRef<LocalImage | undefined>(undefined);
  const styleReferenceRef = useRef<LocalImage | undefined>(undefined);
  const customModelReferenceRef = useRef<LocalImage | undefined>(undefined);
  const imageDraftRestoreCompletedRef = useRef(false);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [merchantInfoImage, setMerchantInfoImage] = useState<LocalImage>();
  const [platform, setPlatform] = useState<CommercePlatform>("taobao");
  const [selectedSpecId, setSelectedSpecId] = useState("taobao-main-square");
  const [selectedImageTypeIds, setSelectedImageTypeIds] = useState<string[]>(["scene_main"]);
  const [imageTypeCounts, setImageTypeCounts] = useState<Record<string, string>>({ scene_main: "1" });
  const [imageTaskMode, setImageTaskMode] = useState<ImageTaskMode>("single");
  const [selectedDetailSuitePresetId, setSelectedDetailSuitePresetId] = useState<SuitePresetId>(defaultDetailSuitePresetId);
  const [detailColorNames, setDetailColorNames] = useState<Record<string, string>>({});
  const [productGroupingMode, setProductGroupingMode] = useState<ProductGroupingMode>("per_image");
  const outfitSelectionMode: OutfitSelectionMode = "all";
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(800);
  const [customSpecSurface, setCustomSpecSurface] = useState<"main" | "detail">("main");
  const [activeSpecPanel, setActiveSpecPanel] = useState<SpecPanelMode>("main");
  const [modelMode, setModelMode] = useState<ModelMode>("no_model");
  const [selectedModelGender, setSelectedModelGender] = useState<ModelGender>("lower_body");
  const [selectedModelAgeRange, setSelectedModelAgeRange] = useState<ModelAgeRange>("young_adult");
  const [selectedModelSkinTone, setSelectedModelSkinTone] = useState<ModelSkinTone>("east_asian");
  const [selectedModelHairStyle, setSelectedModelHairStyle] = useState<ModelHairStyle>("medium");
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [selectedCustomModelId, setSelectedCustomModelId] = useState("");
  const [customModelReferenceImage, setCustomModelReferenceImage] = useState<LocalImage>();
  const [selectedStyleIds, setSelectedStyleIds] = useState<TopSellerStylePresetId[]>([]);
  const [simulatePhotoMetadata, setSimulatePhotoMetadata] = useState(false);
  const [styleReferenceImage, setStyleReferenceImage] = useState<LocalImage>();
  const [customStyles, setCustomStyles] = useState<CustomStylePreset[]>([]);
  const [selectedCustomStyleIds, setSelectedCustomStyleIds] = useState<string[]>([]);
  const [styleBoards, setStyleBoards] = useState<PlatformStyleBoard[]>([]);
  const [selectedStyleBoardIds, setSelectedStyleBoardIds] = useState<string[]>([]);
  const [renamingCustomStyleId, setRenamingCustomStyleId] = useState("");
  const [customStyleNameDraft, setCustomStyleNameDraft] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedMajorCategoryId, setSelectedMajorCategoryId] = useState<MajorCategoryId>("bags");
  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState("women_bags");
  const [selectedCategoryId, setSelectedCategoryId] = useState("tote_bag");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);
  const [textEnabledImageTypeIds, setTextEnabledImageTypeIds] = useState<string[]>([]);
  const [moduleCopyDrafts, setModuleCopyDrafts] = useState<Record<string, ModuleCopyDraft>>({});
  const [detailModuleDrafts, setDetailModuleDrafts] = useState<Record<string, DetailModuleDraft>>({});
  const [detailModuleCopyCounts, setDetailModuleCopyCounts] = useState<Record<string, number>>({});
  const [activeDetailSuiteItemId, setActiveDetailSuiteItemId] = useState("");
  const [imageTypesExpanded, setImageTypesExpanded] = useState(false);
  const [modelTypesExpanded, setModelTypesExpanded] = useState(false);
  const [moreCategoriesExpanded, setMoreCategoriesExpanded] = useState(false);
  const [crossBorderPlatformsExpanded, setCrossBorderPlatformsExpanded] = useState(false);
  const [customModelExpanded, setCustomModelExpanded] = useState(false);
  const [customModelNameDraft, setCustomModelNameDraft] = useState("");
  const [renamingCustomModelId, setRenamingCustomModelId] = useState("");
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);
  const [status, setStatus] = useState("等待上传商品原图");
  const [job, setJob] = useState<GenerationJobView>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(initialWorkspaceModeFromUrl);
  const [entranceView, setEntranceView] = useState<EntranceView>(initialEntranceViewFromUrl);
  const [videoEntranceResetKey, setVideoEntranceResetKey] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [currentActor, setCurrentActor] = useState<SessionActorView>();
  const [creditAccount, setCreditAccount] = useState<CreditAccountView>();
  const [creditDialog, setCreditDialog] = useState<CreditDialogState>();
  const [acknowledgedLowCreditKey, setAcknowledgedLowCreditKey] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authActorName, setAuthActorName] = useState("");
  const [authStatus, setAuthStatus] = useState("手机号注册后直接启用，新用户默认 0 积分");
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [userJobs, setUserJobs] = useState<GenerationJobView[]>([]);
  const [userJobsStatus, setUserJobsStatus] = useState("登录后查看近 24 小时生成记录");
  const [openSummaryItemId, setOpenSummaryItemId] = useState("");

  const isDetailSuiteMode = imageTaskMode === "detail_suite";
  const detailSuitePlatform: CommercePlatform = "taobao";
  const detailSuiteSubmitSpecId = "taobao-detail-790";
  const platformSpecs = useMemo(() => specsForPlatform(platform), [platform]);
  const detailSuiteSpecs = useMemo(() => specsForPlatform(detailSuitePlatform), []);
  const mainSpecs = platformSpecs.filter((item) => item.assetGroup !== "detail");
  const detailSpec = detailSuiteSpecs.find((item) => item.assetGroup === "detail");
  const selectedSpecPool = isDetailSuiteMode ? detailSuiteSpecs : platformSpecs;
  const selectedSpec = selectedSpecPool.find((item) => item.id === selectedSpecId) ?? selectedSpecPool[0] ?? platformSpecs[0];
  const isDetailSpec = selectedSpecId === "custom" ? customSpecSurface === "detail" : selectedSpec.assetGroup === "detail";
  const selectedMajorCategory = majorCategoryPresets.find((item) => item.id === selectedMajorCategoryId) ?? majorCategoryPresets[0];
  const categoryGroupPresets = categoryGroupsByMajor[selectedMajorCategoryId];
  const selectedCategoryGroup = categoryGroupPresets.find((item) => item.id === selectedCategoryGroupId) ?? categoryGroupPresets[0];
  const productCategoryPresets = selectedCategoryGroup.categories;
  const selectedCategory = productCategoryPresets.find((item) => item.id === selectedCategoryId) ?? productCategoryPresets[0];
  const classicStylePresets = useMemo(() => topSellerStylePresetsForCategory(selectedMajorCategoryId), [selectedMajorCategoryId]);
  const customMainImageTypes = useMemo(() => uniqueImageTypes(mainSpecs.flatMap((item) => item.imageTypes)), [mainSpecs]);
  const customDetailImageTypes = useMemo(() => uniqueImageTypes((detailSpec?.imageTypes ?? [])), [detailSpec]);
  const customImageTypes = customSpecSurface === "detail" ? customDetailImageTypes : customMainImageTypes;
  const rawImageTypes = selectedSpecId === "custom" ? customImageTypes : selectedSpec?.imageTypes ?? [];
  const imageTypes = useMemo(() => imageTypesForCategory(rawImageTypes, selectedCategory.category, selectedCategory.id), [rawImageTypes, selectedCategory.category, selectedCategory.id]);
  const detailSuitePresetOptions = useMemo(() => detailSuitePresetIds
    .map((id) => suitePresets.find((item) => item.id === id))
    .filter((item): item is (typeof suitePresets)[number] => Boolean(item)), []);
  const selectedDetailSuitePreset = detailSuitePresetOptions.find((item) => item.id === selectedDetailSuitePresetId) ?? detailSuitePresetOptions[0];
  const detailBaseSuiteItems = useMemo(
    () => {
      try {
        return buildSuitePlan(detailSuitePlatform, selectedDetailSuitePresetId, "detail", selectedCategory.category, selectedCategory.id);
      } catch {
        return [] as SuitePlanItem[];
      }
    },
    [selectedCategory.category, selectedCategory.id, selectedDetailSuitePresetId]
  );
  const detailSuiteItems = useMemo(
    () => buildDetailSuiteItemInstances(detailBaseSuiteItems, detailModuleCopyCounts),
    [detailBaseSuiteItems, detailModuleCopyCounts]
  );
  const detailSuiteImageTypeIds = useMemo(() => Array.from(new Set(detailSuiteItems.map((item) => item.imageTypeId))), [detailSuiteItems]);
  const detailColorGroups = useMemo(() => {
    const groups = new Map<string, { id: string; label: string; images: LocalImage[] }>();
    images.forEach((image, index) => {
      const id = image.colorGroupId ?? inferDetailColorGroupId(image.file.name, index);
      const fallbackLabel = colorKeywordRules.find((item) => item.id === id)?.label ?? `颜色${index + 1}`;
      const group = groups.get(id) ?? { id, label: detailColorNames[id] ?? fallbackLabel, images: [] };
      group.images.push(image);
      groups.set(id, group);
    });
    return Array.from(groups.values());
  }, [detailColorNames, images]);
  const activeDetailSuiteItems = useMemo(
    () => detailSuiteItems.filter((item) => detailModuleOutputCount(item, detailModuleDrafts[item.id], detailColorGroups) > 0),
    [detailColorGroups, detailModuleDrafts, detailSuiteItems]
  );
  const detailSuiteModuleConfigs = useMemo(
    () => detailSuiteItems.map((item) => buildDetailModuleConfig(item, detailModuleDrafts[item.id], detailColorGroups)),
    [detailColorGroups, detailModuleDrafts, detailSuiteItems]
  );
  const detailSuitePlannedItemTotal = useMemo(
    () => activeDetailSuiteItems.reduce((sum, item) => sum + detailModuleOutputCount(item, detailModuleDrafts[item.id], detailColorGroups), 0),
    [activeDetailSuiteItems, detailColorGroups, detailModuleDrafts]
  );
  const selectedImageTypes = selectedImageTypeIds
    .map((id) => imageTypes.find((item) => item.id === id))
    .filter((item): item is PlatformImageTypePreset => Boolean(item));
  const selectedImageType = selectedImageTypes[0] ?? imageTypes[0];
  const isMerchantInfoGraphicSelected = selectedImageTypes.some((item) => item.id === merchantInfoGraphicImageTypeId);
  const normalSelectedImageTypes = selectedImageTypes.filter((item) => item.id !== merchantInfoGraphicImageTypeId);
  const selectedStyles = selectedStyleIds
    .map((id) => topSellerStylePresets.find((item) => item.id === id))
    .filter((item): item is (typeof topSellerStylePresets)[number] => Boolean(item));
  const selectedCustomStyles = selectedCustomStyleIds
    .map((id) => customStyles.find((item) => item.id === id))
    .filter((item): item is CustomStylePreset => Boolean(item));
  const matchedStyleBoards = useMemo(
    () => styleBoards.filter((board) =>
      isPublishedClassicStyleBoard(board) &&
      isStyleBoardMatched(board, {
        majorCategoryId: selectedMajorCategoryId,
        category: selectedCategory.category,
        imageTypeIds: selectedImageTypeIds
      })
    ),
    [selectedCategory.category, selectedImageTypeIds, selectedMajorCategoryId, styleBoards]
  );
  const selectedStyleBoards = selectedStyleBoardIds
    .map((id) => matchedStyleBoards.find((item) => item.id === id))
    .filter((item): item is PlatformStyleBoard => Boolean(item));
  const activeStyleLabels = [...selectedStyles.map((item) => item.label), ...selectedStyleBoards.map((item) => item.styleName), ...selectedCustomStyles.map((item) => item.name)];
  const selectedClassicStyleCount = selectedStyles.length + selectedStyleBoards.length;
  const styleSummaryText = activeStyleLabels.length
    ? `已选 ${activeStyleLabels.length} 个风格，将按风格分别生成：${activeStyleLabels.join(" / ")}`
    : "未选择，可上传参考风格图";
  const selectedCustomModel = customModels.find((item) => item.id === selectedCustomModelId);
  const modelControlsLocked = Boolean(selectedCustomModel);
  const customModelLimitReached = customModels.length >= 5;
  const imageCount = images.length;
  const effectiveProductGroupingMode: ProductGroupingMode = isDetailSuiteMode ? "single_product_multi_angle" : productGroupingMode;
  const productCount = effectiveProductGroupingMode === "single_product_multi_angle" || effectiveProductGroupingMode === "outfit_combo" ? (imageCount > 0 ? 1 : 0) : imageCount;
  const selectedImageTypeCountTotal = selectedImageTypes.reduce((sum, item) => sum + normalizedImageTypeCount(imageTypeCounts[item.id]), 0);
  const normalImageTypeCountTotal = normalSelectedImageTypes.reduce((sum, item) => sum + normalizedImageTypeCount(imageTypeCounts[item.id]), 0);
  const merchantInfoImageTypeCountTotal = isMerchantInfoGraphicSelected ? normalizedImageTypeCount(imageTypeCounts[merchantInfoGraphicImageTypeId]) : 0;
  const effectiveImageCount = imageCount + (merchantInfoImage ? 1 : 0);
  const effectiveProductCount = productCount + (merchantInfoImage ? 1 : 0);
  const detailSuitePlannedTotal = isDetailSuiteMode && imageCount > 0 ? detailSuitePlannedItemTotal : 0;
  const plannedImageTotal = isDetailSuiteMode
    ? detailSuitePlannedTotal
    : (productCount * normalImageTypeCountTotal) + (merchantInfoImage ? merchantInfoImageTypeCountTotal : 0);
  const detailSuiteNeedsMerchantInfo = isDetailSuiteMode && activeDetailSuiteItems.some((item) => item.role === "size_info");
  const unresolvedCustomStyleCount = selectedCustomStyles.filter((style) => !style.stylePrompt?.trim()).length;
  const pendingUploadedReferenceCount = !selectedStyleBoards.length && !selectedCustomStyles.length && styleReferenceImage ? 1 : 0;
  const pendingStyleAnalysisCount = unresolvedCustomStyleCount + pendingUploadedReferenceCount;
  const pendingStyleAnalysisCredits = pendingStyleAnalysisCount * styleReferenceAnalysisCredits;
  const estimatedGenerationCredits = plannedImageTotal * 10;
  const uploadModeLabel = effectiveProductGroupingMode === "outfit_combo" ? "箱包搭配组合" : effectiveProductGroupingMode === "single_product_multi_angle" ? "单款多角度" : "默认单图";
  const uploadModeHelp = effectiveProductGroupingMode === "outfit_combo"
    ? "按箱包、裤装、包袋、帽子、配饰等组成一套搭配，上传几件默认全部出现。"
    : effectiveProductGroupingMode === "single_product_multi_angle"
      ? "同一商品可继续追加角度图，系统会按 1 个商品处理。"
      : "一张图对应一个商品，批量上传会按多款处理。";
  const targetWidth = selectedSpecId === "custom" ? customWidth : selectedSpec.targetWidth;
  const targetHeight = selectedSpecId === "custom" ? customHeight : selectedSpec.targetHeight;
  const providerSize = resolveProviderSizeForTarget(targetWidth, targetHeight);
  const activeModelProfile: ModelProfile = modelMode === "no_model" ? "product_only" : modelGenderProfiles[selectedModelGender];
  const canSubmit = (isDetailSuiteMode || selectedImageTypes.length > 0)
    && (normalSelectedImageTypes.length === 0 || images.length > 0)
    && (!isMerchantInfoGraphicSelected || isDetailSuiteMode || Boolean(merchantInfoImage))
    && (!isDetailSuiteMode || (activeDetailSuiteItems.length > 0 && images.length > 0))
    && (!detailSuiteNeedsMerchantInfo || Boolean(merchantInfoImage))
    && !isSubmitting;
  const progressPercent = job?.progress.total ? Math.min(100, Math.round((job.progress.completed / job.progress.total) * 100)) : 0;
  const groupedResults = useMemo(() => groupResultsByType(job?.results ?? []), [job?.results]);
  const allResultIds = useMemo(() => job?.results.map((image) => image.id) ?? [], [job?.results]);
  const selectedResults = useMemo(
    () => (job?.results ?? []).filter((image) => selectedResultIds.includes(image.id)),
    [job?.results, selectedResultIds]
  );
  const userJobList = useMemo(() => {
    const byId = new Map<string, GenerationJobView>();
    userJobs.forEach((item) => byId.set(item.id, item));
    if (job && (!currentUser || !job.customerId || job.customerId === currentUser.id)) byId.set(job.id, job);
    return Array.from(byId.values()).sort((left, right) => {
      const leftTime = new Date(left.updatedAt ?? left.createdAt).getTime();
      const rightTime = new Date(right.updatedAt ?? right.createdAt).getTime();
      return rightTime - leftTime;
    });
  }, [currentUser, job, userJobs]);
  const userWorks = useMemo(
    () => userJobList.flatMap((item) => item.results.map((image, index) => ({ job: item, image, index }))),
    [userJobList]
  );
  const allResultsSelected = allResultIds.length > 0 && selectedResultIds.length === allResultIds.length;
  const categorySearchResults = useMemo(() => searchCategoryPresets(categorySearchQuery), [categorySearchQuery]);
  const detailTextModuleCandidates = useMemo(
    () => {
      if (!isDetailSpec) return [];
      return selectedImageTypes.map((item) => ({ id: item.id, label: item.label }));
    },
    [isDetailSpec, selectedImageTypes]
  );
  const enabledModuleCopies = useMemo<NormalizedModuleCopy[]>(
    () => detailTextModuleCandidates
      .filter((item) => textEnabledImageTypeIds.includes(item.id))
      .map((item) => {
        const fallback = defaultPosterCopy({
          majorCategoryLabel: selectedMajorCategory.label,
          categoryLabel: selectedCategory.label,
          imageTypeId: item.id,
          imageTypeLabel: item.label,
          styleLabel: activeStyleLabels.join(" / ")
        });
        const draft = moduleCopyDrafts[item.id] ?? {};
        return {
          imageTypeId: item.id,
          imageTypeLabel: item.label,
          ...normalizePosterCopy({
            title: draft.title,
            subtitle: draft.subtitle,
            bullets: (draft.bulletText ?? draft.bullets?.join("\n") ?? "").split(/\n+/),
            templateId: draft.templateId
          }, fallback)
        };
      }),
    [activeStyleLabels, detailTextModuleCandidates, moduleCopyDrafts, selectedCategory.label, selectedMajorCategory.label, textEnabledImageTypeIds]
  );
  const detailSuiteModuleCopies = useMemo<NormalizedModuleCopy[]>(
    () => activeDetailSuiteItems
      .filter((item) => item.role !== "size_info" && hasDetailModuleCopyInput(detailModuleDrafts[item.id]))
      .map((item) => {
        const draft = detailModuleDrafts[item.id] ?? {};
        return explicitDetailModuleCopy({ item, draft });
      }),
    [activeDetailSuiteItems, detailModuleDrafts]
  );
  const posterFallback = useMemo(
    () => defaultPosterCopy({
      majorCategoryLabel: selectedMajorCategory.label,
      categoryLabel: selectedCategory.label,
      imageTypeId: "detail_header_poster",
      imageTypeLabel: "页头海报",
      styleLabel: activeStyleLabels.join(" / ")
    }),
    [activeStyleLabels, selectedCategory.label, selectedMajorCategory.label]
  );
  const posterCopy = useMemo<PosterCopy>(
    () => enabledModuleCopies.find((item) => item.imageTypeId === "detail_header_poster") ?? posterFallback,
    [enabledModuleCopies, posterFallback]
  );
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    merchantInfoImageRef.current = merchantInfoImage;
  }, [merchantInfoImage]);

  useEffect(() => {
    styleReferenceRef.current = styleReferenceImage;
  }, [styleReferenceImage]);

  useEffect(() => {
    customModelReferenceRef.current = customModelReferenceImage;
  }, [customModelReferenceImage]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      if (merchantInfoImageRef.current) URL.revokeObjectURL(merchantInfoImageRef.current.previewUrl);
      if (styleReferenceRef.current) URL.revokeObjectURL(styleReferenceRef.current.previewUrl);
      if (customModelReferenceRef.current) URL.revokeObjectURL(customModelReferenceRef.current.previewUrl);
    };
  }, []);

  useEffect(() => {
    void fetch("/api/custom-models")
      .then((response) => response.json())
      .then((body) => setCustomModels(body.models ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void fetch("/api/style-library/styleboards?status=published&showOnHome=true")
      .then((response) => response.json())
      .then((body) => setStyleBoards(Array.isArray(body.boards) ? body.boards : []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void refreshCurrentUser();
  }, []);

  useEffect(() => {
    const resolvePortalState = (): PortalHistoryState => {
      const params = new URLSearchParams(window.location.search);
      const requestedWorkspaceMode = params.get("workspace");
      if (requestedWorkspaceMode === "image" || requestedWorkspaceMode === "video") {
        return {
          dsPortal: true,
          entranceView: "workbench",
          workspaceMode: requestedWorkspaceMode,
          videoCreationMode: requestedWorkspaceMode === "video" ? (normalizeVideoCreationMode(params.get("videoMode")) ?? "choose") : undefined
        };
      }
      if (params.get("entrance") === "choice") {
        return { dsPortal: true, entranceView: "choice", workspaceMode };
      }
      return { dsPortal: true, entranceView: "home", workspaceMode };
    };

    const initialState = resolvePortalState();
    if (!(window.history.state as Partial<PortalHistoryState> | null)?.dsPortal) {
      window.history.replaceState(initialState, "", window.location.href);
    }
    setEntranceView(initialState.entranceView);
    setWorkspaceMode(initialState.workspaceMode);
    if (initialState.entranceView === "workbench" && initialState.workspaceMode === "video") {
      setVideoEntranceResetKey((key) => key + 1);
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = ((event.state as Partial<PortalHistoryState> | null)?.dsPortal
        ? event.state
        : resolvePortalState()) as PortalHistoryState;
      setEntranceView(state.entranceView);
      setWorkspaceMode(state.workspaceMode);
      if (state.entranceView === "workbench" && state.workspaceMode === "video") {
        setVideoEntranceResetKey((key) => key + 1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [workspaceMode]);

  useEffect(() => {
    let canceled = false;
    const restoreDraft = async () => {
      const draft = readWorkbenchDraft<ImageWorkbenchDraft>(imageWorkbenchDraftStorageKey);
      const requestedWorkspaceMode = typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search).get("workspace");
      if (requestedWorkspaceMode === "image" || requestedWorkspaceMode === "video") {
        setEntranceView("workbench");
      }
      if (!draft || draft.version !== 1) {
        if (requestedWorkspaceMode === "image") setWorkspaceMode("image");
        if (requestedWorkspaceMode === "video") setWorkspaceMode("video");
        imageDraftRestoreCompletedRef.current = true;
        return;
      }

      setWorkspaceMode(
        requestedWorkspaceMode === "image"
          ? "image"
          : requestedWorkspaceMode === "video"
            ? "video"
            : draft.workspaceMode ?? "image"
      );
      setPlatform(draft.platform ?? "taobao");
      setSelectedSpecId(draft.selectedSpecId ?? "taobao-main-square");
      setSelectedImageTypeIds(Array.isArray(draft.selectedImageTypeIds) && draft.selectedImageTypeIds.length ? draft.selectedImageTypeIds : ["scene_main"]);
      setImageTypeCounts(draft.imageTypeCounts ?? { scene_main: "1" });
      setImageTaskMode(draft.imageTaskMode ?? "single");
      setSelectedDetailSuitePresetId(draft.selectedDetailSuitePresetId ?? defaultDetailSuitePresetId);
      setDetailColorNames(draft.detailColorNames ?? {});
      setProductGroupingMode(draft.productGroupingMode ?? "per_image");
      setCustomWidth(Number.isFinite(draft.customWidth) ? draft.customWidth : 800);
      setCustomHeight(Number.isFinite(draft.customHeight) ? draft.customHeight : 800);
      setCustomSpecSurface(draft.customSpecSurface ?? "main");
      setActiveSpecPanel(draft.activeSpecPanel ?? "main");
      setModelMode(draft.modelMode ?? "model");
      setSelectedModelGender(draft.selectedModelGender ?? "male");
      setSelectedModelAgeRange(draft.selectedModelAgeRange ?? "young_adult");
      setSelectedModelSkinTone(draft.selectedModelSkinTone ?? "east_asian");
      setSelectedModelHairStyle(draft.selectedModelHairStyle ?? "medium");
      setSelectedCustomModelId(draft.selectedCustomModelId ?? "");
      setSelectedStyleIds(Array.isArray(draft.selectedStyleIds) ? draft.selectedStyleIds : []);
      setSimulatePhotoMetadata(Boolean(draft.simulatePhotoMetadata));
      setSelectedCustomStyleIds(Array.isArray(draft.selectedCustomStyleIds) ? draft.selectedCustomStyleIds : []);
      setSelectedStyleBoardIds(Array.isArray(draft.selectedStyleBoardIds) ? draft.selectedStyleBoardIds : []);
      setUserPrompt(draft.userPrompt ?? "");
      setSelectedMajorCategoryId("bags");
      setSelectedCategoryGroupId(draft.selectedCategoryGroupId && bagCategoryGroups.some((group) => group.id === draft.selectedCategoryGroupId) ? draft.selectedCategoryGroupId : "women_bags");
      setSelectedCategoryId(draft.selectedCategoryId && categoryPresetsByMajor.bags.some((item) => item.id === draft.selectedCategoryId) ? draft.selectedCategoryId : "tote_bag");
      setTextEnabledImageTypeIds(Array.isArray(draft.textEnabledImageTypeIds) ? draft.textEnabledImageTypeIds : []);
      setModuleCopyDrafts(draft.moduleCopyDrafts ?? {});
      setDetailModuleDrafts(draft.detailModuleDrafts ?? {});
      setDetailModuleCopyCounts(draft.detailModuleCopyCounts ?? {});
      setActiveDetailSuiteItemId(draft.activeDetailSuiteItemId ?? "");
      setStatus(draft.status || "已恢复上次未提交的生图草稿");

      const [restoredImages, restoredMerchantInfo, restoredStyleReference, restoredCustomModelReference] = await Promise.all([
        restoreLocalImages(draft.images),
        restoreSingleLocalImage(draft.merchantInfoImage),
        restoreSingleLocalImage(draft.styleReferenceImage),
        restoreSingleLocalImage(draft.customModelReferenceImage)
      ]);
      if (canceled) return;
      if (restoredImages.length) setImages(restoredImages);
      if (restoredMerchantInfo) setMerchantInfoImage(restoredMerchantInfo);
      if (restoredStyleReference) setStyleReferenceImage(restoredStyleReference);
      if (restoredCustomModelReference) setCustomModelReferenceImage(restoredCustomModelReference);
      imageDraftRestoreCompletedRef.current = true;
    };
    void restoreDraft();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    restoreActiveGenerationJob();
  }, []);

  useEffect(() => {
    if (!imageDraftRestoreCompletedRef.current) return;
    const timer = window.setTimeout(() => {
      void (async () => {
        const [persistedImages, [persistedMerchantInfo], [persistedStyleReference], [persistedCustomModelReference]] = await Promise.all([
          persistLocalImages("image-draft:product", images),
          persistLocalImages("image-draft:merchant", [merchantInfoImage]),
          persistLocalImages("image-draft:style-reference", [styleReferenceImage]),
          persistLocalImages("image-draft:custom-model", [customModelReferenceImage])
        ]);
        writeWorkbenchDraft(imageWorkbenchDraftStorageKey, {
          version: 1,
          savedAt: new Date().toISOString(),
          workspaceMode,
          platform,
          selectedSpecId,
          selectedImageTypeIds,
          imageTypeCounts,
          imageTaskMode,
          selectedDetailSuitePresetId,
          detailColorNames,
          productGroupingMode,
          customWidth,
          customHeight,
          customSpecSurface,
          activeSpecPanel,
          modelMode,
          selectedModelGender,
          selectedModelAgeRange,
          selectedModelSkinTone,
          selectedModelHairStyle,
          selectedCustomModelId,
          selectedStyleIds,
          simulatePhotoMetadata,
          selectedCustomStyleIds,
          selectedStyleBoardIds,
          userPrompt,
          selectedMajorCategoryId,
          selectedCategoryGroupId,
          selectedCategoryId,
          textEnabledImageTypeIds,
          moduleCopyDrafts,
          detailModuleDrafts,
          detailModuleCopyCounts,
          activeDetailSuiteItemId,
          status,
          images: persistedImages,
          merchantInfoImage: persistedMerchantInfo,
          styleReferenceImage: persistedStyleReference,
          customModelReferenceImage: persistedCustomModelReference
        } satisfies ImageWorkbenchDraft);
      })();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [
    activeDetailSuiteItemId,
    activeSpecPanel,
    customHeight,
    customModelReferenceImage,
    customSpecSurface,
    customWidth,
    detailColorNames,
    detailModuleCopyCounts,
    detailModuleDrafts,
    imageTaskMode,
    imageTypeCounts,
    images,
    merchantInfoImage,
    modelMode,
    moduleCopyDrafts,
    platform,
    productGroupingMode,
    selectedCategoryGroupId,
    selectedCategoryId,
    selectedCustomModelId,
    selectedCustomStyleIds,
    selectedDetailSuitePresetId,
    selectedImageTypeIds,
    selectedMajorCategoryId,
    selectedModelAgeRange,
    selectedModelGender,
    selectedModelHairStyle,
    selectedModelSkinTone,
    selectedSpecId,
    selectedStyleBoardIds,
    selectedStyleIds,
    simulatePhotoMetadata,
    status,
    styleReferenceImage,
    textEnabledImageTypeIds,
    userPrompt,
    workspaceMode
  ]);

  useEffect(() => {
    const recover = () => {
      if (document.visibilityState === "visible") void restoreActiveGenerationJob();
    };
    window.addEventListener("focus", recover);
    window.addEventListener("pageshow", recover);
    document.addEventListener("visibilitychange", recover);
    return () => {
      window.removeEventListener("focus", recover);
      window.removeEventListener("pageshow", recover);
      document.removeEventListener("visibilitychange", recover);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(customStyleStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as CustomStylePreset[];
      if (Array.isArray(saved)) setCustomStyles(saved.filter((item) => item.id && item.name && item.prompt));
    } catch {
      setCustomStyles([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(customStyleStorageKey, JSON.stringify(customStyles));
    } catch {
      setStatus("自定义风格已保留在当前页面，但浏览器存储空间不足，刷新后可能丢失");
    }
    setSelectedCustomStyleIds((current) => current.filter((id) => customStyles.some((item) => item.id === id)));
  }, [customStyles]);

  useEffect(() => {
    setSelectedStyleBoardIds((current) => current.filter((id) => matchedStyleBoards.some((item) => item.id === id)));
  }, [matchedStyleBoards]);

  useEffect(() => {
    if (!job || job.status !== "running") return;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/generation-jobs/${job.id}`);
      const body = await response.json();
      if (!response.ok) {
        const recovered = await recoverLatestRunningGenerationJob();
        if (!recovered) {
          setStatus(`任务同步中断，已尝试从服务器恢复：${body.error ?? "unknown_error"}`);
        }
        window.clearInterval(timer);
        return;
      }

      applyRecoveredGenerationJob(body.job);
      if (body.job.status !== "running") {
        void refreshUserJobs();
        window.clearInterval(timer);
      }
    }, 1600);

    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  useEffect(() => {
    if (!isDetailSuiteMode) {
      if (activeDetailSuiteItemId) setActiveDetailSuiteItemId("");
      return;
    }
    const activeExists = activeDetailSuiteItemId && detailSuiteItems.some((item) => item.id === activeDetailSuiteItemId);
    if (activeExists) return;
    if (activeDetailSuiteItemId) setActiveDetailSuiteItemId("");
  }, [activeDetailSuiteItemId, detailSuiteItems, isDetailSuiteMode]);

  useEffect(() => {
    setDetailModuleCopyCounts({});
  }, [selectedDetailSuitePresetId, selectedCategory.id]);

  useEffect(() => {
    setSelectedResultIds(allResultIds);
  }, [job?.id, allResultIds.length]);

  function activateDetailSuiteSpec(nextPlatform = detailSuitePlatform) {
    const nextSpecs = specsForPlatform(nextPlatform);
    const nextDetailSpec = nextSpecs.find((item) => item.assetGroup === "detail");
    const nextDetailTypes = nextDetailSpec?.imageTypes ?? [];
    setSelectedSpecId(nextDetailSpec?.id ?? "custom");
    setCustomSpecSurface("detail");
    setActiveSpecPanel("detail");
    const suiteTypeIds = Array.from(new Set(buildDetailSuitePlanSafe(nextPlatform, selectedDetailSuitePresetId, selectedCategory.category, selectedCategory.id).map((item) => item.imageTypeId)));
    const nextIds = suiteTypeIds.length ? suiteTypeIds : nextDetailTypes.map((item) => item.id);
    setSelectedImageTypeIds(nextIds.length ? nextIds : [nextDetailTypes[0]?.id].filter(Boolean));
    ensureImageTypeCounts(nextIds);
    setActiveDetailSuiteItemId("");
  }

  function switchImageTaskMode(next: ImageTaskMode) {
    setImageTaskMode(next);
    setJob(undefined);
    setIsSubmitting(false);
    if (next === "detail_suite") {
      activateDetailSuiteSpec(detailSuitePlatform);
      setProductGroupingMode("single_product_multi_angle");
      setImages((current) => current.map((image, index) => ({
        ...image,
        colorGroupId: image.colorGroupId ?? inferDetailColorGroupId(image.file.name, index)
      })));
      setDetailColorNames((current) => ({
        ...Object.fromEntries(imagesRef.current.map((image, index) => {
          const groupId = image.colorGroupId ?? inferDetailColorGroupId(image.file.name, index);
          const label = colorKeywordRules.find((item) => item.id === groupId)?.label ?? `颜色${index + 1}`;
          return [groupId, label];
        })),
        ...current
      }));
      setImageTypesExpanded(false);
      setStatus("宝贝详情套图模式已开启，请上传多色或多角度素材");
      return;
    }
    const nextSpec = mainSpecs[0] ?? platformSpecs[0];
    setProductGroupingMode("per_image");
    if (nextSpec) selectSpec(nextSpec.id);
    setStatus("已切回单张/批量主图模式");
  }

  function selectDetailSuitePreset(next: SuitePresetId) {
    setSelectedDetailSuitePresetId(next);
    setJob(undefined);
    const nextItems = buildDetailSuitePlanSafe(detailSuitePlatform, next, selectedCategory.category, selectedCategory.id);
    const nextIds = Array.from(new Set(nextItems.map((item) => item.imageTypeId)));
    setSelectedImageTypeIds(nextIds);
    ensureImageTypeCounts(nextIds);
    setActiveDetailSuiteItemId("");
    setStatus(`${suitePresets.find((item) => item.id === next)?.label ?? "详情模板"} 已应用`);
  }

  function switchPlatform(next: CommercePlatform) {
    const nextSpecs = specsForPlatform(next);
    const nextMainSpecs = nextSpecs.filter((item) => item.assetGroup !== "detail");
    const nextSpec = nextMainSpecs[0] ?? nextSpecs[0];
    setPlatform(next);
    if (imageTaskMode === "detail_suite") {
      activateDetailSuiteSpec(next);
      return;
    }
    setSelectedSpecId(next === "free" ? "custom" : nextSpec.id);
    setCustomSpecSurface("main");
    setActiveSpecPanel("main");
    const nextTypes = next === "free" ? uniqueImageTypes(nextMainSpecs.flatMap((item) => item.imageTypes)) : nextSpec.imageTypes;
    setSelectedImageTypeIds([nextTypes[0]?.id].filter(Boolean));
    ensureImageTypeCounts([nextTypes[0]?.id].filter(Boolean));
  }

  function switchMajorCategory(next: MajorCategoryId) {
    const nextGroup = categoryGroupsByMajor[next][0];
    setSelectedMajorCategoryId(next);
    setSelectedCategoryGroupId(nextGroup.id);
    setSelectedCategoryId(nextGroup.categories[0].id);
    setSelectedStyleIds([]);
    setSelectedStyleBoardIds([]);
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setMoreCategoriesExpanded(false);
  }

  function selectCategoryGroup(groupId: string) {
    const nextGroup = categoryGroupPresets.find((item) => item.id === groupId);
    if (!nextGroup) return;
    setSelectedCategoryGroupId(groupId);
    setSelectedCategoryId(nextGroup.categories[0].id);
    setSelectedStyleIds([]);
    setSelectedStyleBoardIds([]);
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
  }

  function selectCategorySearchResult(majorId: MajorCategoryId, groupId: string, categoryId: string) {
    setSelectedMajorCategoryId(majorId);
    setSelectedCategoryGroupId(groupId);
    setSelectedCategoryId(categoryId);
    setSelectedStyleIds([]);
    setSelectedStyleBoardIds([]);
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setMoreCategoriesExpanded(false);
    setCategorySearchQuery("");
  }

  function applyCustomModel(model: CustomModel) {
    setSelectedCustomModelId(model.id);
    setCustomModelReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (customModelInputRef.current) customModelInputRef.current.value = "";
    setModelMode("model");
    if (model.modelGender) setSelectedModelGender(model.modelGender);
    if (model.modelAgeRange) setSelectedModelAgeRange(model.modelAgeRange);
    if (model.modelSkinTone) setSelectedModelSkinTone(model.modelSkinTone);
    if (model.modelHairStyle) setSelectedModelHairStyle(model.modelHairStyle);
    setCustomModelNameDraft(model.name);
    setRenamingCustomModelId("");
    setStatus(`${model.name} 已应用`);
  }

  function clearCustomModelSelection() {
    setSelectedCustomModelId("");
    setCustomModelNameDraft("");
    setRenamingCustomModelId("");
    setStatus("已退出专属持包模特，恢复手动选择");
  }

  function startRenameCustomModel(model: CustomModel) {
    setRenamingCustomModelId(model.id);
    setCustomModelNameDraft(model.name);
  }

  function selectSpec(specId: string, surface: "main" | "detail" = "main") {
    setSelectedSpecId(specId);
    if (specId === "custom") setCustomSpecSurface(surface);
    if (specId === "custom") {
      setActiveSpecPanel(surface === "detail" ? "detail" : "main");
    } else {
      const nextSpecPool = surface === "detail" || imageTaskMode === "detail_suite" ? detailSuiteSpecs : platformSpecs;
      const nextSpec = nextSpecPool.find((item) => item.id === specId);
      setActiveSpecPanel(nextSpec?.assetGroup === "detail" ? "detail" : "main");
    }
    const nextSpecPool = surface === "detail" || imageTaskMode === "detail_suite" ? detailSuiteSpecs : platformSpecs;
    const nextTypes = specId === "custom"
      ? (surface === "detail" ? customDetailImageTypes : customMainImageTypes)
      : nextSpecPool.find((item) => item.id === specId)?.imageTypes ?? [];
    if (nextTypes[0]) {
      setSelectedImageTypeIds([nextTypes[0].id]);
      ensureImageTypeCounts([nextTypes[0].id]);
    }
  }

  function toggleImageType(id: string) {
    setSelectedImageTypeIds((current) => {
      if (current.includes(id)) {
        return current.length > 1 ? current.filter((item) => item !== id) : current;
      }
      ensureImageTypeCounts([id]);
      return [...current, id];
    });
  }

  function toggleAllImageTypes() {
    setSelectedImageTypeIds((current) => {
      const next = current.length === imageTypes.length ? [imageTypes[0]?.id].filter(Boolean) : imageTypes.map((item) => item.id);
      ensureImageTypeCounts(next);
      return next;
    });
  }

  function ensureImageTypeCounts(ids: string[]) {
    setImageTypeCounts((current) => {
      const next = { ...current };
      ids.forEach((id) => {
        if (!next[id]) next[id] = "1";
      });
      return next;
    });
  }

  function setImageTypeCount(id: string, value: string) {
    setImageTypeCounts((current) => ({ ...current, [id]: value }));
  }

  function stepImageTypeCount(id: string, delta: number) {
    setImageTypeCounts((current) => ({
      ...current,
      [id]: String(clampImageTypeCount(normalizedImageTypeCount(current[id]) + delta))
    }));
  }

  function toggleModuleTextInput(imageTypeId: string) {
    setTextEnabledImageTypeIds((current) => {
      if (current.includes(imageTypeId)) return current.filter((item) => item !== imageTypeId);
      return [...current, imageTypeId];
    });
  }

  function renderImageTypeMenu(title: string) {
    if (!imageTypes.length) return null;
    return (
      <div className="nestedTypes specNestedTypes">
        <DisclosureHeader
          countText={isDetailSpec ? `详情 ${targetWidth}x${targetHeight} · ${selectedImageTypes.length}/${imageTypes.length} 张` : `${selectedImageTypes.length}/${imageTypes.length} 类`}
          expanded={imageTypesExpanded}
          title={title}
          onToggle={() => setImageTypesExpanded((value) => !value)}
          actionLabel={selectedImageTypes.length === imageTypes.length ? "仅保留第一项" : "全选"}
          onAction={toggleAllImageTypes}
        />
        {imageTypesExpanded ? (
          <div className="imageTypeList">
            {imageTypes.map((item) => (
              <div
                className={selectedImageTypeIds.includes(item.id) ? "imageTypeOption active" : "imageTypeOption"}
                key={item.id}
              >
                <button className="imageTypeSelectButton" type="button" onClick={() => toggleImageType(item.id)}>
                  <strong>{item.label}</strong>
                  <em>{item.description}</em>
                </button>
                {isDetailSpec && item.id !== merchantInfoGraphicImageTypeId ? (
                  <label className={textEnabledImageTypeIds.includes(item.id) ? "moduleTextToggle active" : "moduleTextToggle"}>
                    <input
                      checked={textEnabledImageTypeIds.includes(item.id)}
                      onChange={() => toggleModuleTextInput(item.id)}
                      type="checkbox"
                    />
                    需要文本输入
                  </label>
                ) : null}
                <div className="imageTypeCountStepper" aria-label={`${item.label}生成数量`}>
                  <button type="button" onClick={() => stepImageTypeCount(item.id, -1)}>−</button>
                  <input
                    inputMode="numeric"
                    max={99}
                    min={1}
                    type="number"
                    value={imageTypeCounts[item.id] ?? "1"}
                    onChange={(event) => setImageTypeCount(item.id, event.target.value)}
                  />
                  <button type="button" onClick={() => stepImageTypeCount(item.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  function renderCustomSpecInputs(options: { onActivate?: () => void } = {}) {
    return (
      <div
        aria-label="自定义图片目标尺寸"
        className="customSpecGrid inlineCustomSpecGrid"
        onClick={options.onActivate}
        onFocus={options.onActivate}
      >
        <label>
          目标宽
          <input
            aria-label="自定义图片目标宽"
            min={200}
            max={5000}
            type="number"
            value={customWidth}
            onChange={(event) => setCustomWidth(Number(event.target.value))}
          />
        </label>
        <label>
          目标高
          <input
            aria-label="自定义图片目标高"
            min={200}
            max={5000}
            type="number"
            value={customHeight}
            onChange={(event) => setCustomHeight(Number(event.target.value))}
          />
        </label>
      </div>
    );
  }

  function updateModuleCopyDraft(imageTypeId: string, patch: ModuleCopyDraft) {
    setModuleCopyDrafts((current) => ({
      ...current,
      [imageTypeId]: {
        ...(current[imageTypeId] ?? {}),
        ...patch
      }
    }));
  }

  function updateDetailModuleDraft(suiteItemId: string, patch: DetailModuleDraft) {
    setDetailModuleDrafts((current) => ({
      ...current,
      [suiteItemId]: {
        ...(current[suiteItemId] ?? {}),
        ...patch
      }
    }));
  }

  function addDetailModuleInstance(baseSuiteItemId: string) {
    const currentCopies = detailModuleCopyCounts[baseSuiteItemId] ?? 0;
    if (currentCopies >= 8) {
      setStatus("同类模块最多可增加 8 个");
      return;
    }
    const nextIndex = currentCopies + 2;
    const nextId = `${baseSuiteItemId}__copy_${nextIndex}`;
    setDetailModuleCopyCounts((current) => ({
      ...current,
      [baseSuiteItemId]: Math.min(8, (current[baseSuiteItemId] ?? 0) + 1)
    }));
    setDetailModuleDrafts((current) => ({
      ...current,
      [nextId]: { enabled: true }
    }));
    setActiveDetailSuiteItemId(nextId);
  }

  function removeDetailModuleInstance(item: DetailSuitePlanItem) {
    if (!item.duplicate || !item.baseSuiteItemId) return;
    const baseId = item.baseSuiteItemId;
    const removedIndex = item.instanceIndex ?? 2;
    const currentCopyCount = detailModuleCopyCounts[baseId] ?? 0;
    setDetailModuleCopyCounts((current) => ({
      ...current,
      [baseId]: Math.max(0, (current[baseId] ?? 0) - 1)
    }));
    setDetailModuleDrafts((current) => {
      const next = { ...current };
      for (let index = removedIndex; index < currentCopyCount + 1; index += 1) {
        const fromId = `${baseId}__copy_${index + 1}`;
        const toId = `${baseId}__copy_${index}`;
        if (next[fromId]) next[toId] = next[fromId];
        else delete next[toId];
      }
      delete next[`${baseId}__copy_${currentCopyCount + 1}`];
      return next;
    });
    if (activeDetailSuiteItemId === item.id) setActiveDetailSuiteItemId("");
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!incoming.length) return;
    const oversized = incoming.find((file) => file.size > maxImageUploadBytes);
    if (oversized) {
      setStatus(`${oversized.name} 超过 8MB，请压缩后再上传`);
      return;
    }

    const hadImages = imagesRef.current.length > 0;
    const startIndex = imagesRef.current.length;
    const incomingColorNames = Object.fromEntries(incoming.map((file, index) => {
      const groupId = inferDetailColorGroupId(file.name, startIndex + index);
      const label = colorKeywordRules.find((item) => item.id === groupId)?.label ?? `颜色${startIndex + index + 1}`;
      return [groupId, label];
    }));
    setImages((current) => {
      const buildImage = (file: File, index: number) => ({
        id: `${file.name}-${file.lastModified}-${createClientId()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        role: productGroupingMode === "outfit_combo" ? inferOutfitRoleFromFilename(file.name, selectedCategory.id, current.length + index) : undefined,
        colorGroupId: imageTaskMode === "detail_suite" ? inferDetailColorGroupId(file.name, current.length + index) : undefined
      });

      const availableSlots = Math.max(0, maxImageUploadCount - current.length);
      if (availableSlots <= 0) return current;
      return [...current, ...incoming.slice(0, availableSlots).map(buildImage)];
    });
    if (imageTaskMode === "detail_suite") {
      setDetailColorNames((current) => ({ ...incomingColorNames, ...current }));
    }
    if (!hadImages) setActiveImageIndex(0);
    setJob(undefined);
    setIsSubmitting(false);
    const overflowCount = Math.max(0, imagesRef.current.length + incoming.length - maxImageUploadCount);
    setStatus(overflowCount
      ? `单次最多上传 ${maxImageUploadCount} 张，已自动忽略后面 ${overflowCount} 张`
      : imageTaskMode === "detail_suite" ? "箱包详情素材已就绪，已自动整理颜色组" : productGroupingMode === "single_product_multi_angle" ? "单款多角度素材已就绪" : productGroupingMode === "outfit_combo" ? "箱包搭配素材已就绪，上传几件都会默认出现" : "包款已就绪");
  }

  function uploadMerchantInfoImage(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > maxImageUploadBytes) {
      setStatus(`${file.name} 超过 8MB，请压缩后再上传`);
      return;
    }

    const next = {
      id: `merchant-info-${file.name}-${file.lastModified}-${createClientId()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    };
    setMerchantInfoImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return next;
    });
    setSelectedImageTypeIds((current) => current.includes(merchantInfoGraphicImageTypeId) ? current : [...current, merchantInfoGraphicImageTypeId]);
    ensureImageTypeCounts([merchantInfoGraphicImageTypeId]);
    setJob(undefined);
    setIsSubmitting(false);
    setStatus("资料图已上传，将整理成工整的详情页信息图");
  }

  function removeMerchantInfoImage() {
    setMerchantInfoImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (merchantInfoInputRef.current) merchantInfoInputRef.current.value = "";
    setStatus("资料图已删除");
  }

  function handleUploadDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsUploadDragActive(false);
    addFiles(event.dataTransfer.files);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((image) => image.id !== id);
      setActiveImageIndex((index) => Math.min(index, Math.max(0, next.length - 1)));
      return next;
    });
  }

  function updateImageRole(id: string, role: ProductReferenceRole) {
    setImages((current) => current.map((image) => image.id === id ? { ...image, role } : image));
  }

  function renameDetailColorGroup(groupId: string, label: string) {
    setDetailColorNames((current) => ({ ...current, [groupId]: label }));
  }

  function moveImageToDetailColorGroup(imageId: string, groupId: string) {
    setImages((current) => current.map((image) => image.id === imageId ? { ...image, colorGroupId: groupId } : image));
  }

  function removeDetailColorGroup(groupId: string) {
    setImages((current) => {
      const belongsToGroup = (image: LocalImage, index: number) => (image.colorGroupId ?? inferDetailColorGroupId(image.file.name, index)) === groupId;
      current.filter(belongsToGroup).forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return current.filter((image, index) => !belongsToGroup(image, index));
    });
    setDetailColorNames((current) => {
      const next = { ...current };
      delete next[groupId];
      return next;
    });
    setStatus("已移除该颜色组素材");
  }

  function uploadCustomModel(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > maxImageUploadBytes) {
      setStatus(`${file.name} 超过 8MB，请压缩后再上传`);
      return;
    }

    const next = {
      id: `style-ref-${createClientId()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    };
    setCustomModelReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return next;
    });
    setSelectedCustomModelId("");
    setModelMode("model");
    setStatus("持包模特参考图已上传，可直接用于本次箱包生成");
  }

  function removeCustomModelReference() {
    setCustomModelReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (customModelInputRef.current) customModelInputRef.current.value = "";
    setStatus("已删除临时持包参考图");
  }

  async function saveCustomModelFromReference() {
    const source = customModelReferenceImage;
    if (!source) {
      setStatus("请先上传持包模特参考图");
      return;
    }
    if (customModelLimitReached) {
      setStatus("最多保存5个专属持包模特，请先删除一个再添加");
      return;
    }

    const formData = new FormData();
    formData.append("name", customModelNameDraft.trim() || `专属持包模特${customModels.length + 1}`);
    formData.append("modelImage", source.file, source.file.name);
    formData.append("modelGender", selectedModelGender);
    formData.append("modelAgeRange", selectedModelAgeRange);
    formData.append("modelSkinTone", selectedModelSkinTone);
    formData.append("modelHairStyle", selectedModelHairStyle);
    formData.append("modelProfile", activeModelProfile);
    const response = await fetch("/api/custom-models", { method: "POST", body: formData });
    const body = await response.json();
    if (!response.ok) {
      setStatus(`持包模特上传失败：${body.error ?? "unknown_error"}`);
      return;
    }

    setCustomModels((current) => [body.model, ...current.filter((item) => item.id !== body.model.id)]);
    applyCustomModel(body.model);
    setCustomModelReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (customModelInputRef.current) customModelInputRef.current.value = "";
    setModelMode("model");
    setStatus(`${body.model.name} 已保存为专属持包模特`);
  }

  async function renameCustomModel(modelId = renamingCustomModelId, name = customModelNameDraft) {
    const nextName = name.trim();
    if (!modelId || !nextName) return;

    const response = await fetch("/api/custom-models", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modelId, name: nextName })
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(`专属持包模特重命名失败：${body.error ?? "unknown_error"}`);
      return;
    }

    setCustomModels((current) => current.map((item) => (item.id === body.model.id ? body.model : item)));
    if (selectedCustomModelId === body.model.id) setSelectedCustomModelId(body.model.id);
    setRenamingCustomModelId("");
    setStatus(`${body.model.name} 已重命名`);
  }

  async function promptRenameCustomModel(model: CustomModel) {
    const nextName = window.prompt("修改专属持包模特名称", model.name);
    if (nextName === null) return;
    await renameCustomModel(model.id, nextName);
  }

  async function deleteCustomModel(modelId: string) {
    const target = customModels.find((item) => item.id === modelId);
    const response = await fetch("/api/custom-models", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modelId })
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(`专属持包模特删除失败：${body.error ?? "unknown_error"}`);
      return;
    }

    setCustomModels((current) => current.filter((item) => item.id !== modelId));
    if (selectedCustomModelId === modelId) clearCustomModelSelection();
    if (renamingCustomModelId === modelId) setRenamingCustomModelId("");
    setStatus(`${target?.name ?? "专属持包模特"} 已删除`);
  }

  function uploadStyleReference(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > maxImageUploadBytes) {
      setStatus(`${file.name} 超过 8MB，请压缩后再上传`);
      return;
    }

    setSelectedStyleIds([]);
    setSelectedCustomStyleIds([]);
    setSelectedStyleBoardIds([]);
    setRenamingCustomStyleId("");
    setCustomStyleNameDraft("");
    const next = {
      id: `${file.name}-${file.lastModified}-${createClientId()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    };
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return next;
    });
    setStatus("参考风格图已上传，生成或保存时将按参考图风格处理");
  }

  function removeStyleReference() {
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setStatus("参考风格图已删除");
  }

  async function analyzeStyleReferenceFile(file: File, sourceNote: string) {
    const formData = new FormData();
    formData.append("image", file, file.name);
    formData.append("platform", isDetailSuiteMode ? detailSuitePlatform : platform);
    formData.append("category", selectedCategory.category || selectedMajorCategoryId);
    formData.append("imageType", selectedImageType?.id ?? "scene_main");
    formData.append("styleName", "待归类风格");
    formData.append("sourceNote", sourceNote);

    const response = await fetch("/api/style-reference/analyze", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (body.error === "authentication_required") setUserPanelOpen(true);
      throw new Error(body.error ?? "style_reference_analysis_failed");
    }
    void refreshCurrentUser();
    return body as {
      reused: boolean;
      chargedCredits: number;
      sample?: {
        id: string;
        filename: string;
        imageHash?: string;
        stylePrompt?: string;
        analysis?: StyleReferenceAnalysis;
        analyzerModel?: string;
      };
      imageHash?: string;
      stylePrompt?: string;
      analysis?: StyleReferenceAnalysis;
      model?: string;
    };
  }

  async function saveCustomStyleFromReference() {
    const source = styleReferenceImage;
    if (!source) {
      setStatus("请先上传参考风格图");
      return;
    }

    setStatus("正在解析参考风格...");
    let result: Awaited<ReturnType<typeof analyzeStyleReferenceFile>>;
    try {
      result = await analyzeStyleReferenceFile(source.file, "用户保存自定义风格");
    } catch (error) {
      setStatus(`参考风格解析失败：${error instanceof Error ? error.message : "unknown_error"}`);
      return;
    }

    const imageDataUrl = await fileToCompactDataUrl(source.file);
    const nextIndex = customStyles.length + 1;
    const stylePrompt = result.stylePrompt || result.sample?.stylePrompt || buildCustomStylePrompt(source.file.name);
    const next: CustomStylePreset = {
      id: `custom-style-${Date.now().toString(36)}-${createClientId()}`,
      name: `自定义风格${nextIndex}`,
      filename: source.file.name,
      imageDataUrl,
      prompt: stylePrompt,
      sampleId: result.sample?.id,
      imageHash: result.imageHash || result.sample?.imageHash,
      stylePrompt,
      analysis: result.analysis || result.sample?.analysis,
      analyzerModel: result.model || result.sample?.analyzerModel,
      analyzedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setCustomStyles((current) => [next, ...current]);
    setSelectedStyleIds([]);
    setSelectedCustomStyleIds([next.id]);
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setStatus(result.reused ? `${next.name} 已保存，复用已解析风格` : `${next.name} 已保存，参考风格解析扣 ${result.chargedCredits} 点`);
  }

  function toggleCustomStyle(id: string) {
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setSelectedCustomStyleIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  }

  function toggleStyleBoard(id: string) {
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setSelectedStyleBoardIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  }

  function startRenameCustomStyle(style: CustomStylePreset) {
    setRenamingCustomStyleId(style.id);
    setCustomStyleNameDraft(style.name);
  }

  function renameCustomStyle(styleId = renamingCustomStyleId, name = customStyleNameDraft) {
    if (!styleId || !name.trim()) return;
    const nextName = name.trim().slice(0, 12);
    setCustomStyles((current) => current.map((item) => (item.id === styleId ? { ...item, name: nextName } : item)));
    setRenamingCustomStyleId("");
    setCustomStyleNameDraft("");
    setStatus(`${nextName} 已重命名`);
  }

  function promptRenameCustomStyle(style: CustomStylePreset) {
    const nextName = window.prompt("修改自定义风格名称", style.name);
    if (nextName === null) return;
    renameCustomStyle(style.id, nextName);
  }

  function deleteCustomStyle(styleId: string) {
    const target = customStyles.find((item) => item.id === styleId);
    setCustomStyles((current) => current.filter((item) => item.id !== styleId));
    setSelectedCustomStyleIds((current) => current.filter((item) => item !== styleId));
    if (renamingCustomStyleId === styleId) {
      setRenamingCustomStyleId("");
      setCustomStyleNameDraft("");
    }
    setStatus(`${target?.name ?? "自定义风格"} 已删除`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || (!isDetailSuiteMode && !selectedImageType)) return;
    const submissionImageType = selectedImageType ?? imageTypes[0];
    if (!submissionImageType) return;
    if (!isDetailSuiteMode && isMerchantInfoGraphicSelected && !merchantInfoImage) {
      setStatus("请先上传尺码/SKU/参数图");
      return;
    }
    if (detailSuiteNeedsMerchantInfo && !merchantInfoImage) {
      setStatus("尺码说明模块需要先上传尺码表/商品资料图");
      return;
    }
    const requiredCredits = estimatedGenerationCredits + pendingStyleAnalysisCredits;
    if (creditAccount && requiredCredits > 0 && creditAccount.balanceCredits < requiredCredits) {
      setCreditDialog({
        title: creditAccount.balanceCredits <= 0 ? "积分已耗尽" : "积分不足",
        message: "当前积分不够完成本次生成，请充值后再继续。",
        requiredCredits,
        balanceCredits: creditAccount.balanceCredits
      });
      setStatus("积分不足，请充值后再生成");
      return;
    }
    const lowCreditKey = creditAccount ? `${creditAccount.balanceCredits}-${requiredCredits}` : "";
    if (creditAccount && requiredCredits > 0 && creditAccount.balanceCredits <= 100 && acknowledgedLowCreditKey !== lowCreditKey) {
      setAcknowledgedLowCreditKey(lowCreditKey);
      setCreditDialog({
        title: creditAccount.balanceCredits <= 10 ? "积分即将耗尽" : "积分余额较低",
        message: "当前积分余额已经不多，本次仍可继续生成。建议提前充值，避免后续任务中断。",
        requiredCredits,
        balanceCredits: creditAccount.balanceCredits
      });
      setStatus(`积分余额低于 ${creditAccount.balanceCredits <= 10 ? "10" : "100"} 点`);
      return;
    }

    setIsSubmitting(true);
    setStatus("正在创建生成任务...");
    const resolvedCustomStyles: CustomStylePreset[] = [];
    let uploadedReferencePrompt: string | undefined;
    try {
      for (const style of selectedCustomStyles) {
        if (style.stylePrompt?.trim()) {
          resolvedCustomStyles.push(style);
          continue;
        }
        setStatus(`正在补解析自定义风格：${style.name}`);
        const result = await analyzeStyleReferenceFile(dataUrlToFile(style.imageDataUrl, style.filename), `用户复用旧自定义风格：${style.name}`);
        const stylePrompt = result.stylePrompt || result.sample?.stylePrompt || style.prompt || buildCustomStylePrompt(style.filename);
        const updated: CustomStylePreset = {
          ...style,
          prompt: stylePrompt,
          sampleId: result.sample?.id ?? style.sampleId,
          imageHash: result.imageHash || result.sample?.imageHash || style.imageHash,
          stylePrompt,
          analysis: result.analysis || result.sample?.analysis || style.analysis,
          analyzerModel: result.model || result.sample?.analyzerModel || style.analyzerModel,
          analyzedAt: new Date().toISOString()
        };
        resolvedCustomStyles.push(updated);
        setCustomStyles((current) => current.map((item) => (item.id === style.id ? updated : item)));
      }

      if (!selectedStyleBoards.length && !resolvedCustomStyles.length && styleReferenceImage) {
        setStatus("正在解析参考风格...");
        const result = await analyzeStyleReferenceFile(styleReferenceImage.file, "用户端上传参考图生成");
        uploadedReferencePrompt = result.stylePrompt || result.sample?.stylePrompt || buildCustomStylePrompt(styleReferenceImage.file.name);
      }
    } catch (error) {
      setStatus(`参考风格解析失败：${error instanceof Error ? error.message : "unknown_error"}`);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("platform", isDetailSuiteMode ? detailSuitePlatform : platform);
    formData.append("category", selectedCategory.category);
    formData.append("productCategoryId", selectedCategory.id);
    formData.append("productCategoryLabel", selectedCategory.label);
    formData.append("scene", submissionImageType.scene);
    formData.append("sceneVariant", submissionImageType.sceneVariant);
    formData.append("size", providerSize.preset);
    formData.append("modelProfile", activeModelProfile);
    formData.append("modelMode", modelMode);
    formData.append("productGroupingMode", effectiveProductGroupingMode);
    formData.append("photoMetadataMode", simulatePhotoMetadata ? "simulated" : "none");
    if (modelMode === "model") {
      formData.append("modelGender", selectedModelGender);
      formData.append("modelAgeRange", selectedModelAgeRange);
      formData.append("modelSkinTone", selectedModelSkinTone);
      formData.append("modelHairStyle", selectedModelHairStyle);
    }
    formData.append("specId", isDetailSuiteMode && selectedSpecId !== "custom" ? detailSuiteSubmitSpecId : selectedSpecId);
    if (selectedStyles[0]) formData.append("topSellerStyleId", selectedStyles[0].id);
    selectedStyles.forEach((item) => formData.append("topSellerStyleIds", item.id));
    const categoryPrompt = `Bag category path guidance: ${selectedMajorCategory.label} > ${selectedCategoryGroup.label} > ${selectedCategory.label}. ${selectedCategoryGroup.promptHint} ${selectedCategory.promptHint}`;
    const detailSuitePrompt = isDetailSuiteMode
      ? `Generate a complete ecommerce bag product-detail page suite. Color groups: ${detailColorGroups.map((group) => `${group.label}(${group.images.length} images)`).join(", ") || "not provided"}. Keep all colors, bag silhouette, handles, straps, zipper path, pockets, hardware, stitching, logo-like marks and material texture consistent across the detail page.`
      : "";
    const combinedUserPrompt = [categoryPrompt, detailSuitePrompt, userPrompt.trim()].filter(Boolean).join(" ");
    formData.append("userPrompt", combinedUserPrompt);
    formData.append("merchantPrompt", combinedUserPrompt);
    if (isDetailSuiteMode) {
      formData.append("generationMode", "suite");
      formData.append("suiteSurface", "detail");
      formData.append("suitePresetId", selectedDetailSuitePresetId);
      activeDetailSuiteItems.forEach((item) => formData.append("suiteItemIds", item.id));
      detailSuiteModuleConfigs.forEach((config) => formData.append("suiteModuleConfigs", JSON.stringify(config)));
      formData.append("productAnalysis", JSON.stringify(buildDetailSuiteProductAnalysisDraft({
        categoryLabel: selectedCategory.label,
        categoryGroupLabel: selectedCategoryGroup.label,
        colorGroups: detailColorGroups.map((group) => ({ label: group.label, imageCount: group.images.length })),
        styleLabels: activeStyleLabels,
        userPrompt
      })));
      formData.append("imageTypeId", activeDetailSuiteItems[0]?.imageTypeId ?? submissionImageType.id);
      Array.from(new Set(activeDetailSuiteItems.map((item) => item.imageTypeId))).forEach((id) => formData.append("imageTypeIds", id));
      formData.append("imageTypeCounts", JSON.stringify(Object.fromEntries(activeDetailSuiteItems.map((item) => [item.imageTypeId, 1]))));
    } else {
      formData.append("generationMode", "single");
      formData.append("imageTypeId", submissionImageType.id);
      selectedImageTypes.forEach((item) => formData.append("imageTypeIds", item.id));
      formData.append("imageTypeCounts", JSON.stringify(Object.fromEntries(selectedImageTypes.map((item) => [item.id, normalizedImageTypeCount(imageTypeCounts[item.id])]))));
    }
    selectedStyleBoards.forEach((board) => {
      formData.append("customStyleIds", `platform-styleboard-${board.id}`);
      formData.append("customStyleLabels", board.styleName);
      formData.append("customStylePrompts", buildPlatformStyleBoardPrompt(board));
    });
    resolvedCustomStyles.forEach((style) => {
      formData.append("customStyleIds", style.id);
      formData.append("customStyleLabels", style.name);
      formData.append("customStylePrompts", customStylePromptForSubmission(`Saved custom style "${style.name}":`, style.stylePrompt || style.prompt));
      formData.append("styleReferenceImages", dataUrlToFile(style.imageDataUrl, style.filename), style.filename);
    });
    if (!selectedStyleBoards.length && !resolvedCustomStyles.length && styleReferenceImage && uploadedReferencePrompt) {
      formData.append("customStyleIds", `uploaded-${styleReferenceImage.id}`.slice(0, 120));
      formData.append("customStyleLabels", uploadedReferenceStyleLabel(styleReferenceImage.file.name));
      formData.append("customStylePrompts", customStylePromptForSubmission(`Uploaded reference style "${styleReferenceImage.file.name}":`, uploadedReferencePrompt));
      formData.append("styleReferenceImages", styleReferenceImage.file, styleReferenceImage.file.name);
    }
    formData.append("targetWidth", String(targetWidth));
    formData.append("targetHeight", String(targetHeight));
    formData.append("count", "1");
    if (effectiveProductGroupingMode === "outfit_combo") {
      formData.append("outfitSelectionMode", outfitSelectionMode);
      formData.append("outfitItemCount", String(clampOutfitItemCount(Math.max(2, imageCount))));
    }
    if (selectedSpecId === "custom") formData.append("customSpecName", "自定义尺寸");
    if (modelMode === "model" && selectedCustomModelId) formData.append("customModelId", selectedCustomModelId);
    if (modelMode === "model" && !selectedCustomModelId && customModelReferenceImage) {
      formData.append("modelReferenceImage", customModelReferenceImage.file, customModelReferenceImage.file.name);
    }
    const submittedModuleCopies = isDetailSuiteMode ? detailSuiteModuleCopies : enabledModuleCopies;
    submittedModuleCopies.forEach((copy) => {
      formData.append("moduleCopies", JSON.stringify(copy));
    });
    const submittedPosterCopy = isDetailSuiteMode
      ? detailSuiteModuleCopies.find((copy) => copy.imageTypeId === "detail_header_poster")
      : enabledModuleCopies.find((copy) => copy.imageTypeId === "detail_header_poster");
    if (submittedPosterCopy) {
      formData.append("posterTitle", submittedPosterCopy.title);
      formData.append("posterSubtitle", submittedPosterCopy.subtitle);
      submittedPosterCopy.bullets.forEach((item) => formData.append("posterBullets", item));
      formData.append("posterTemplateId", submittedPosterCopy.templateId);
    }
    images.forEach((image, index) => {
      formData.append("images", image.file, image.file.name);
      formData.append("productSlotRoles", image.role ?? "other");
      const colorGroupId = image.colorGroupId ?? inferDetailColorGroupId(image.file.name, index);
      const group = detailColorGroups.find((item) => item.id === colorGroupId);
      formData.append("productColorGroupIds", isDetailSuiteMode ? colorGroupId : "");
      formData.append("productColorGroupLabels", isDetailSuiteMode ? group?.label ?? "" : "");
    });
    if ((isMerchantInfoGraphicSelected || isDetailSuiteMode) && merchantInfoImage) {
      formData.append("merchantInfoImage", merchantInfoImage.file, merchantInfoImage.file.name);
    }

    const response = await fetch("/api/generation-jobs", { method: "POST", body: formData });
    const body = await response.json();

    if (!response.ok) {
      if (body.error === "authentication_required") setUserPanelOpen(true);
      if (body.error === "insufficient_credits") {
        setCreditDialog({
          title: (body.account?.balanceCredits ?? 0) <= 0 ? "积分已耗尽" : "积分不足",
          message: "当前积分不够完成本次生成，请充值后再继续。",
          requiredCredits: typeof body.requiredCredits === "number" ? body.requiredCredits : undefined,
          balanceCredits: typeof body.account?.balanceCredits === "number" ? body.account.balanceCredits : undefined
        });
        if (body.account) setCreditAccount(body.account);
      }
      setStatus(`创建失败：${formatApiError(body)}`);
      setIsSubmitting(false);
      return;
    }

    setJob(body.job);
    persistActiveGenerationJob(body.job);
    upsertUserJob(body.job);
    void refreshUserJobs();
    setStatus(statusLabel(body.job));
  }

  async function cancelGenerationJob() {
    if (!job || job.status !== "running") return;

    setStatus("正在取消生成任务...");
    const response = await fetch(`/api/generation-jobs/${job.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "cancel" })
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(`取消失败：${body.error ?? "unknown_error"}`);
      return;
    }

    setJob(body.job);
    clearActiveGenerationJob();
    upsertUserJob(body.job);
    setIsSubmitting(false);
    setStatus(statusLabel(body.job));
    void refreshCurrentUser();
    void refreshUserJobs();
  }

  function toggleResultSelection(id: string) {
    setSelectedResultIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAllResults() {
    setSelectedResultIds((current) => (current.length === allResultIds.length ? [] : allResultIds));
  }

  function toggleStyle(id: TopSellerStylePresetId) {
    setStyleReferenceImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return undefined;
    });
    if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
    setSelectedStyleIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  }

  function openUserPanel() {
    setUserPanelOpen(true);
    void refreshCurrentUser();
    void refreshUserJobs();
  }

  function showHome() {
    navigatePortal("home", workspaceMode);
  }

  function showCreationChoice() {
    navigatePortal("choice", workspaceMode);
  }

  function enterImageWorkspace() {
    navigatePortal("workbench", "image");
  }

  function enterVideoWorkspace() {
    navigatePortal("workbench", "video");
    setVideoEntranceResetKey((key) => key + 1);
  }

  function navigatePortal(nextEntranceView: EntranceView, nextWorkspaceMode: WorkspaceMode) {
    setEntranceView(nextEntranceView);
    setWorkspaceMode(nextWorkspaceMode);
    if (typeof window === "undefined") return;
    const href = nextEntranceView === "workbench"
      ? `/?workspace=${nextWorkspaceMode}`
      : nextEntranceView === "choice"
        ? "/?entrance=choice"
        : "/";
    window.history.pushState(
      { dsPortal: true, entranceView: nextEntranceView, workspaceMode: nextWorkspaceMode } satisfies PortalHistoryState,
      "",
      href
    );
  }

  async function refreshCurrentUser() {
    const response = await fetch("/api/auth/me").catch(() => undefined);
    if (!response?.ok) {
      setIsLoggedIn(false);
      setCurrentUser(undefined);
      setCurrentActor(undefined);
      setCreditAccount(undefined);
      setUserJobs([]);
      return;
    }
    const body = await response.json().catch(() => ({}));
    setCurrentUser(body.user);
    setCurrentActor(body.actor);
    setCreditAccount(body.account);
    setIsLoggedIn(Boolean(body.user));
  }

  async function refreshUserJobs() {
    const response = await fetch("/api/generation-jobs").catch(() => undefined);
    if (!response?.ok) {
      if (response?.status === 401) {
        setUserJobs([]);
        setUserJobsStatus("登录后查看近 24 小时生成记录");
      } else {
        setUserJobsStatus("任务列表暂时无法加载");
      }
      return [];
    }

    const body = await response.json().catch(() => ({}));
    const jobs = Array.isArray(body.jobs) ? body.jobs : [];
    setUserJobs(jobs);
    setUserJobsStatus(jobs.length ? "已同步当前账号任务" : "当前账号近 24 小时暂无生图任务");
    return jobs as GenerationJobView[];
  }

  function upsertUserJob(next: GenerationJobView) {
    setUserJobs((current) => [next, ...current.filter((item) => item.id !== next.id)]);
  }

  async function restoreActiveGenerationJob() {
    const snapshot = readActiveGenerationJob();
    if (snapshot?.id) {
      if (snapshot.status === "running" && !isRecoverableRunningGenerationJob(snapshot)) {
        clearActiveGenerationJob();
      } else {
        setJob(snapshot);
        setStatus(statusLabel(snapshot));
        if (snapshot.status !== "running") {
          clearActiveGenerationJob();
          return;
        }
        const response = await fetch(`/api/generation-jobs/${snapshot.id}`).catch(() => undefined);
        const body = await response?.json().catch(() => ({}));
        if (response?.ok && body.job) {
          if (body.job.status !== "running" || isRecoverableRunningGenerationJob(body.job)) {
            applyRecoveredGenerationJob(body.job);
          } else {
            clearActiveGenerationJob();
          }
          return;
        }
      }
    }

    await recoverLatestRunningGenerationJob();
  }

  async function recoverLatestRunningGenerationJob(): Promise<boolean> {
    const jobs = await refreshUserJobs();
    const running = jobs.find(isRecoverableRunningGenerationJob);
    if (!running) {
      if (!readActiveGenerationJob()) setIsSubmitting(false);
      return false;
    }
    applyRecoveredGenerationJob(running);
    return true;
  }

  function applyRecoveredGenerationJob(next: GenerationJobView) {
    setJob(next);
    upsertUserJob(next);
    setStatus(statusLabel(next));
    if (next.status === "running") {
      persistActiveGenerationJob(next);
      setIsSubmitting(true);
    } else {
      clearActiveGenerationJob();
      setIsSubmitting(false);
      void refreshCurrentUser();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setIsLoggedIn(false);
    setCurrentUser(undefined);
    setCurrentActor(undefined);
    setCreditAccount(undefined);
    setUserJobs([]);
    setJob(undefined);
    setIsSubmitting(false);
    setUserPanelOpen(false);
    clearActiveGenerationJob();
    setStatus("已退出登录，可切换账号");
  }

  async function submitAuth() {
    const response = await fetch(`/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: authPhone, password: authPassword, actorName: authActorName })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setAuthStatus(`认证失败：${body.error ?? "unknown_error"}`);
      return;
    }
    setCurrentUser(body.user);
    setCurrentActor(body.actor);
    setCreditAccount(body.account);
    setIsLoggedIn(true);
    setAuthStatus(authMode === "register" ? "注册成功，充值审核到账后可生成图片" : "登录成功");
    setStatus("账号已登录");
    void refreshUserJobs();
    void restoreActiveGenerationJob();
  }

  function selectHistoryJob(next: GenerationJobView) {
    setJob(next);
    setWorkspaceMode("image");
    setEntranceView("workbench");
    setStatus(statusLabel(next));
    setUserPanelOpen(false);
  }

  function downloadUserWork(item: { job: GenerationJobView; image: GenerationJobView["results"][number]; index: number }) {
    void saveImageResult(item.job.options.platform, item.image, item.index);
  }

  function downloadSelectedResults() {
    if (!selectedResults.length) return;
    void saveImageResultsToFolder(
      selectedResults.map((image, index) => ({
        image,
        name: buildDownloadName(platform, image, index)
      })),
      "图片生成结果"
    );
  }

  function summaryItemControl(id: string) {
    return {
      open: openSummaryItemId === id,
      onOpen: () => setOpenSummaryItemId(id),
      onClose: () => setOpenSummaryItemId("")
    };
  }

  if (entranceView === "home") {
    return (
      <main className="homePortal" aria-label="箱包AI创作平台首页">
        <section className="homeHero bagsHomeHero">
          <div className="bagsHomeBrandBar" aria-label="箱包AI创作平台">
            <div className="bagsHomeBrand">
              <img alt="" src="/brand-logo.svg" />
              <span>
                <strong>箱包AI创作平台</strong>
                <em>Bag Image &amp; Video Studio</em>
              </span>
            </div>
          </div>
          <div className="bagsHomeLayout">
            <div className="bagsHomeCopy">
              <span className="bagsHomeKicker" aria-label="专为箱包而生">
                <span>专为</span>
                <strong>箱包</strong>
                <span>而生</span>
              </span>
              <h1>
                <span className="bagsHomeTitleMain">箱包电商视觉</span>
                <span className="bagsHomeTitleAccent">高级的 AI 创作</span>
              </h1>
              <p>为包款主图、持包大片、详情卖点与短视频画面，塑造更统一、更有质感的电商视觉。</p>
              <p className="bagsHomeSubtitle">AI生图 · AI生视频 · 商品视觉中枢</p>
              <div className="bagsHomePills" aria-label="箱包视觉能力">
                <span>持包/背包模特</span>
                <span>材质与五金细节</span>
                <span>容量分区表达</span>
              </div>
              <div className="bagsHomeActions">
                <a aria-label="进入创作平台" className="homePosterEnterButton" href="/?entrance=choice" onClick={(event) => { event.preventDefault(); window.location.assign("/?entrance=choice"); }}>
                  进入创作平台
                </a>
              </div>
            </div>
            <div className="bagsHomeGallery" aria-hidden="true">
              <figure className="bagsHeroShowcase">
                <img src="/homepage-assets/bag-hero-premium.png" alt="" />
              </figure>
            </div>
          </div>
          <div className="mobileHomeExperience">
            <div className="mobileHomeBrand">
              <img alt="" src="/brand-logo.svg" />
              <strong>箱包AI创作平台</strong>
            </div>
            <div className="mobileHomeSlogan" aria-label="专为箱包而生">
              <span>专为</span><strong>箱包</strong><span>而生</span>
            </div>
            <div className="mobileHomeFlowOverlay" aria-label="创作流程">
              <span className="mobileFlowCard upload">
                <i aria-hidden="true" />
                <em>上传包款</em>
              </span>
              <b aria-hidden="true" />
              <span className="mobileFlowCard ai">
                <i aria-hidden="true">AI</i>
                <em>AI智能生成</em>
              </span>
              <b aria-hidden="true" />
            </div>
            <div className="mobileHomeVisual" aria-hidden="true">
              <div className="mobilePosterCrop mobilePosterDress" />
              <div className="mobilePosterCrop mobilePosterShowcase" />
              <div className="mobilePosterCrop mobilePosterVideo" />
            </div>
            <div className="mobileHomeCopy">
              <h1>专为箱包而生<br />箱包电商视觉</h1>
              <p>上传包款原图，生成持包图、场景图、详情图和箱包短视频。</p>
              <span>AI生图 · AI生视频</span>
            </div>
            <a className="mobileHomeCta" href="/?entrance=choice" onClick={(event) => { event.preventDefault(); window.location.assign("/?entrance=choice"); }}>进入创作平台</a>
            <div className="mobilePosterCrop mobilePosterFlow" aria-label="创作流程" />
          </div>
        </section>
      </main>
    );
  }

  if (entranceView === "choice") {
    return (
      <main className="homePortal creationPortal" aria-label="选择创作类型">
        <header className="homePortalHeader">
          <Link className="logoMark homePortalLogo" href="/" aria-label="返回首页" onClick={(event) => { event.preventDefault(); showHome(); }}>
            <img alt="" src="/brand-logo.svg" />
          </Link>
          <span>箱包AI创作平台 · 专为箱包而生</span>
        </header>
        <section className="creationChoiceShell">
          <div className="creationChoiceIntro">
            <h1>今天要创作哪一种内容？</h1>
          </div>
          <div className="creationChoiceGrid">
            <button className="creationChoiceCard imageChoice" type="button" onClick={enterImageWorkspace}>
              <img className="creationChoiceImage premiumChoiceImage" alt="" src="/homepage-assets/bag-choice-image-premium.png" />
              <i aria-hidden="true">图</i>
              <span>生图创作</span>
              <strong>从包款素材生成唯美商品图</strong>
              <em>主图、持包图、白底图、箱包详情套图</em>
            </button>
            <button className="creationChoiceCard videoChoice" type="button" onClick={enterVideoWorkspace}>
              <img className="creationChoiceImage premiumChoiceImage" alt="" src="/homepage-assets/bag-choice-video-premium.png" />
              <i aria-hidden="true">视</i>
              <span>生视频创作</span>
              <strong>从商品图生成箱包短视频</strong>
              <em>参考视频生成，或一句话生成包款分镜镜头</em>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <form className={workspaceMode === "video" ? "station videoStation" : "station"} onSubmit={submit}>
      <header className="stationHeader">
        <Link className="logoMark" href="/" aria-label="返回首页" onClick={(event) => { event.preventDefault(); showHome(); }}>
          <img alt="" src="/brand-logo.svg" />
        </Link>
        <h1>
          箱包AI创作平台
          <span className="brandDivider">·</span>
          <span className="brandQualifier">专为箱包而生</span>
        </h1>
        <div className="headerSlogan" aria-label="网站广告语">
          {workspaceMode === "video" ? (
            <strong>一个视频或一句话，生成你想要的视频！</strong>
          ) : (
            <>
              <span>无需提示词</span>
              <strong>一键生成专业箱包电商图片</strong>
            </>
          )}
        </div>
        <button className={isLoggedIn ? "accountButton loggedIn" : "accountButton"} type="button" onClick={openUserPanel}>
          {isLoggedIn ? "我的" : "登录"}
        </button>
        <nav>
          <button className={workspaceMode === "image" ? "active" : ""} type="button" onClick={enterImageWorkspace}>图像生成</button>
          <button className={workspaceMode === "video" ? "active" : ""} type="button" onClick={enterVideoWorkspace}>视频生成</button>
        </nav>
        <div className={`statusDot ${job?.status ?? "idle"}`}>{status}</div>
      </header>

      {userPanelOpen ? (
        <div className="userPanelBackdrop" role="presentation" onClick={() => setUserPanelOpen(false)}>
          <section className="userPanel" aria-label="用户中心" role="dialog" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>我的工作台</span>
                <strong>箱包AI创作平台账号</strong>
              </div>
              <button aria-label="关闭用户中心" type="button" onClick={() => setUserPanelOpen(false)}>×</button>
            </header>
            <div className="userProfileCard">
              <i>AI</i>
              <span>
                <strong>{currentUser?.phone ?? "未登录用户"}</strong>
                <em>{isLoggedIn ? `当前使用者：${currentActor?.actorName ?? "默认同事"}` : "请使用手机号、密码和使用者名称登录或注册"}</em>
              </span>
            </div>
            {!isLoggedIn ? (
              <div className="authPanel">
                <div className="authModeSwitch">
                  <button className={authMode === "login" ? "active" : ""} type="button" onClick={() => setAuthMode("login")}>登录</button>
                  <button className={authMode === "register" ? "active" : ""} type="button" onClick={() => setAuthMode("register")}>注册</button>
                </div>
                <input inputMode="tel" placeholder="手机号" value={authPhone} onChange={(event) => setAuthPhone(event.target.value)} />
                <input placeholder="密码，至少 8 位" type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} />
                <input placeholder="当前使用者，例如：美工A / 运营B" value={authActorName} onChange={(event) => setAuthActorName(event.target.value)} />
                <button type="button" onClick={() => void submitAuth()}>{authMode === "register" ? "注册并登录" : "登录账号"}</button>
                <span>{authStatus}</span>
              </div>
            ) : null}
            <div className="userMetricGrid">
              <div><strong>{userJobList.length}</strong><span>历史任务</span></div>
              <div><strong>{formatCompactNumber(creditAccount?.balanceCredits ?? 0)}</strong><span>可用积分</span></div>
              <div><strong>{formatCompactNumber(creditAccount?.frozenCredits ?? 0)}</strong><span>冻结积分</span></div>
            </div>
            <div className="userPanelSections">
              <Link className="userPanelAction" href="/recharge" onClick={() => setUserPanelOpen(false)}>
                <strong>算力点充值</strong>
                <span>查看套餐、创建充值订单与管理余额</span>
              </Link>
              <Link className="userPanelAction" href="/generation-records?tab=images" onClick={() => setUserPanelOpen(false)}>
                <strong>生成记录</strong>
                <span>{userJobList.length || userWorks.length ? `${userJobList.length} 个任务 · ${userWorks.length} 张图片` : "查看近 24 小时生成任务与图片下载"}</span>
              </Link>
              <Link className="userPanelAction" href="/account" onClick={() => setUserPanelOpen(false)}>
                <strong>账号资料</strong>
                <span>{currentUser ? `${currentUser.status === "active" ? "启用" : "停用"} · ${currentUser.id}` : "注册后自动创建积分账户"}</span>
              </Link>
              <Link className="userPanelAction feedbackAction" href="/feedback" onClick={() => setUserPanelOpen(false)}>
                <strong>网站报错和建议</strong>
                <span>提交问题描述、报错截图或改进建议</span>
              </Link>
              {isLoggedIn ? (
                <button className="userPanelAction logoutAction" type="button" onClick={() => void logout()}>
                  <strong>退出登录 / 切换账号</strong>
                  <span>清空当前工作台账号状态，返回登录入口</span>
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {creditDialog ? (
        <div className="creditDialogBackdrop" role="presentation" onClick={() => setCreditDialog(undefined)}>
          <section className="creditDialog" aria-label="积分提醒" role="dialog" onClick={(event) => event.stopPropagation()}>
            <header>
              <span>积分提醒</span>
              <button aria-label="关闭积分提醒" type="button" onClick={() => setCreditDialog(undefined)}>×</button>
            </header>
            <strong>{creditDialog.title}</strong>
            <p>{creditDialog.message}</p>
            <div className="creditDialogStats">
              {typeof creditDialog.balanceCredits === "number" ? <span>当前积分：{formatCompactNumber(creditDialog.balanceCredits)}</span> : null}
              {typeof creditDialog.requiredCredits === "number" ? <span>本次预计：{formatCompactNumber(creditDialog.requiredCredits)}</span> : null}
            </div>
            <div className="creditDialogActions">
              <button type="button" onClick={() => setCreditDialog(undefined)}>稍后再说</button>
              <Link href="/recharge" onClick={() => setCreditDialog(undefined)}>去充值</Link>
            </div>
          </section>
        </div>
      ) : null}

      {workspaceMode === "video" ? (
        <VideoGenerationWorkspace entranceResetKey={videoEntranceResetKey} />
      ) : (
        <>
      <aside className="controlRail">
        <section className="taskModePanel" aria-label="图像任务模式">
          <button
            className={imageTaskMode === "single" ? "taskModeCard active" : "taskModeCard"}
            type="button"
            onClick={() => switchImageTaskMode("single")}
          >
            <strong>主图[单张/批量]</strong>
            <span>平台主图、白底图、风格图等单项生成</span>
          </button>
          <button
            className={imageTaskMode === "detail_suite" ? "taskModeCard active" : "taskModeCard"}
            type="button"
            onClick={() => switchImageTaskMode("detail_suite")}
          >
            <strong>宝贝详情[套图]</strong>
            <span>多色款一口气生成详情页结构</span>
          </button>
        </section>
        <section>
          <div className="categoryTitleRow">
            <StepTitle index="01" title="箱包细分" />
            <div className="categorySearchBox">
              <input
                aria-label="搜索具体类目"
                placeholder="搜索箱包细分"
                type="search"
                value={categorySearchQuery}
                onChange={(event) => setCategorySearchQuery(event.target.value)}
              />
              {categorySearchQuery.trim() ? (
                <div className="categorySearchPanel" role="listbox" aria-label="类目搜索结果">
                  {categorySearchResults.length ? (
                    categorySearchResults.map((item) => (
                      <button
                        key={`${item.major.id}-${item.category.id}`}
                        type="button"
                        onClick={() => selectCategorySearchResult(item.major.id, item.group.id, item.category.id)}
                      >
                        <strong>{item.category.label}</strong>
                        <span>{item.major.label} · {item.group.label} · {item.category.desc}</span>
                      </button>
                    ))
                  ) : (
                    <button type="button" onClick={() => selectCategorySearchResult("bags", "women_bags", "tote_bag")}>
                      <strong>箱包</strong>
                      <span>未录入细分类目可先按箱包基础款生成</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="compactCategoryHeader">
            <strong>{selectedCategoryGroup.label}</strong>
            <span>当前：{selectedCategoryGroup.label} · {selectedCategory.label}</span>
          </div>
          <div className="categoryGroupStrip" aria-label={`${selectedMajorCategory.label}二级类目`}>
            {categoryGroupPresets.map((item) => (
              <button
                className={selectedCategoryGroupId === item.id ? "categoryGroupChip active" : "categoryGroupChip"}
                key={item.id}
                type="button"
                onClick={() => selectCategoryGroup(item.id)}
              >
                <i>{item.mark}</i>
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.desc}</em>
                </span>
              </button>
            ))}
          </div>
          <div className="compactCategoryStrip" aria-label={`${selectedCategoryGroup.label}商品类目`}>
            {productCategoryPresets.map((item) => (
              <button
                className={selectedCategoryId === item.id ? "compactCategoryChip active" : "compactCategoryChip"}
                key={item.id}
                data-testid={`subcategory-${item.id}`}
                type="button"
                onClick={() => setSelectedCategoryId(item.id)}
              >
                <i>{item.mark}</i>
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.desc}</em>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <StepTitle index="02" title={isDetailSuiteMode ? "详情图规格" : "平台规格与图片类型"} />
          {!isDetailSuiteMode ? (
            <div className="platformList">
              {domesticPlatforms.map((item) => (
                <button
                  className={platform === item ? "platformButton active" : "platformButton"}
                  key={item}
                  type="button"
                  onClick={() => switchPlatform(item)}
                >
                  {platformLabels[item]}
                </button>
              ))}
              <button
                className={platform === "free" ? "platformButton active" : "platformButton"}
                type="button"
                onClick={() => switchPlatform("free")}
              >
                {platformLabels.free}
              </button>
              <button
                aria-expanded={crossBorderPlatformsExpanded}
                className={crossBorderPlatforms.includes(platform) ? "platformButton platformGroupButton active" : "platformButton platformGroupButton"}
                type="button"
                onClick={() => setCrossBorderPlatformsExpanded((value) => !value)}
              >
                跨境平台
              </button>
            </div>
          ) : null}
          {!isDetailSuiteMode && crossBorderPlatformsExpanded ? (
            <div className="crossBorderPlatformPanel" aria-label="跨境平台子品类">
              {crossBorderPlatforms.map((item) => (
                <button
                  className={platform === item ? "active" : ""}
                  key={item}
                  type="button"
                  onClick={() => switchPlatform(item)}
                >
                  {platformLabels[item]}
                </button>
              ))}
            </div>
          ) : null}

          <div className="specList compactSpecList">
            {!isDetailSuiteMode ? (
              <div className="specGroup">
                <strong>主图规格</strong>
                <div className="specGroupGrid">
                  {platform !== "free" ? (
                    <>
                    {mainSpecs.map((item) => (
                      <SpecButton
                        active={selectedSpecId === item.id}
                        key={item.id}
                        spec={item}
                        onClick={() => selectSpec(item.id)}
                      />
                    ))}
                    </>
                  ) : null}
                  <button
                    className={selectedSpecId === "custom" && customSpecSurface === "main" ? "specButton active" : "specButton"}
                    type="button"
                    onClick={() => selectSpec("custom", "main")}
                  >
                    <span className="specCard">
                      <strong>自定义尺寸</strong>
                      <span>{customWidth}x{customHeight} · 主图</span>
                    </span>
                  </button>
                </div>
                {selectedSpecId === "custom" && customSpecSurface === "main" ? renderCustomSpecInputs({ onActivate: () => {
                  if (selectedSpecId !== "custom" || customSpecSurface !== "main") selectSpec("custom", "main");
                } }) : null}
                {!isDetailSpec ? renderImageTypeMenu("主图生成类型") : null}
              </div>
            ) : null}

            {isDetailSuiteMode && activeSpecPanel === "detail" ? (
              <div className="specGroup detailSpecGroup">
                {detailSpec ? (
                  <>
                    <div className="detailSizeSwitch" role="group" aria-label="宝贝详情尺寸">
                      <button
                        className={selectedSpecId === detailSpec.id ? "specButton specCard active" : "specButton specCard"}
                        type="button"
                        onClick={() => selectSpec(detailSpec.id, "detail")}
                      >
                        <strong>默认规格790宽</strong>
                        <span>{detailSpec.targetWidth}x{detailSpec.targetHeight}</span>
                      </button>
                      <button
                        className={selectedSpecId === "custom" && customSpecSurface === "detail" ? "specButton active" : "specButton"}
                        type="button"
                        onClick={() => selectSpec("custom", "detail")}
                      >
                        <span className="specCard">
                          <strong>自定义详情图尺寸</strong>
                          <span>{customWidth}x{customHeight} · 详情模块</span>
                        </span>
                      </button>
                    </div>
                    {selectedSpecId === "custom" && customSpecSurface === "detail" ? renderCustomSpecInputs({ onActivate: () => {
                      if (selectedSpecId !== "custom" || customSpecSurface !== "detail") selectSpec("custom", "detail");
                    } }) : null}
                    <DetailTemplateSelector
                      activeItemId={activeDetailSuiteItemId}
                      colorGroups={detailColorGroups}
                      drafts={detailModuleDrafts}
                      merchantInfoImage={merchantInfoImage}
                      selectedId={selectedDetailSuitePresetId}
                      options={detailSuitePresetOptions}
                      suiteItems={detailSuiteItems}
                      onAddItem={addDetailModuleInstance}
                      onActivateItem={setActiveDetailSuiteItemId}
                      onRemoveItem={removeDetailModuleInstance}
                      onPickMerchantInfo={() => merchantInfoInputRef.current?.click()}
                      onRemoveMerchantInfo={removeMerchantInfoImage}
                      onSelect={selectDetailSuitePreset}
                      onUpdateItem={updateDetailModuleDraft}
                    />
                  </>
                ) : (
                  <span className="specGroupHint">当前平台暂无固定详情规格，可使用自定义详情尺寸。</span>
                )}
              </div>
            ) : null}
          </div>

        </section>

        <section>
          <StepTitle index="03" title="持包模特选择" />
          <div className="modeSwitch" role="group" aria-label="持包模特模式">
            <button className={modelMode === "model" ? "active" : ""} type="button" onClick={() => setModelMode("model")}>需要持包模特</button>
            <button className={modelMode === "no_model" ? "active" : ""} type="button" onClick={() => setModelMode("no_model")}>不需要持包模特</button>
          </div>

          {modelMode === "model" ? (
            <div className="modelPanel">
              <div className="modelSelectorGroup">
                <DisclosureHeader
                  countText={modelGenderLabels[selectedModelGender]}
                  expanded={modelTypesExpanded}
                  iconSrc={modelGenderIconSrc(selectedModelGender)}
                  title="持包模特类型"
                  onToggle={() => setModelTypesExpanded((value) => !value)}
                />
                {modelControlsLocked ? <p className="lockedModelHint">已应用专属持包模特，人物属性按保存时配置锁定。</p> : null}
                {modelTypesExpanded ? (
                  <div className="modelList compactModelList">
                    {modelGenders.map((item) => (
                      <button
                        className={selectedModelGender === item ? "modelOption active" : "modelOption"}
                        disabled={modelControlsLocked}
                        key={item}
                        type="button"
                        onClick={() => {
                          setSelectedModelGender(item);
                          if (item === "boy") setSelectedModelAgeRange("child_7_10");
                          if (item === "girl") setSelectedModelAgeRange("child_7_10");
                          if (item === "male" || item === "female" || item === "no_face" || item === "upper_body_face" || item === "upper_body_no_face" || item === "lower_body") setSelectedModelAgeRange("young_adult");
                          setModelTypesExpanded(false);
                        }}
                      >
                        <i className="modelThumb">
                          <img alt="" src={modelGenderIconSrc(item)} />
                        </i>
                        <span>
                          <strong>{modelGenderLabels[item]}</strong>
                          <em>{modelGenderDescription(item)}</em>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="modelDetailGrid">
                <label className="selectLabel">
                  年龄
                  <select disabled={modelControlsLocked} value={selectedModelAgeRange} onChange={(event) => setSelectedModelAgeRange(event.target.value as ModelAgeRange)}>
                    {modelAgeRanges.map((item) => (
                      <option key={item} value={item}>{modelAgeRangeLabels[item]}</option>
                    ))}
                  </select>
                </label>
                <label className="selectLabel">
                  人种风格
                  <select disabled={modelControlsLocked} value={selectedModelSkinTone} onChange={(event) => setSelectedModelSkinTone(event.target.value as ModelSkinTone)}>
                    {modelSkinTones.map((item) => (
                      <option key={item} value={item}>{modelSkinToneLabels[item]}</option>
                    ))}
                  </select>
                </label>
                <label className="selectLabel">
                  发型
                  <select disabled={modelControlsLocked} value={selectedModelHairStyle} onChange={(event) => setSelectedModelHairStyle(event.target.value as ModelHairStyle)}>
                    {modelHairStyles.map((item) => (
                      <option key={item} value={item}>{modelHairStyleLabels[item]}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="customModelBox">
                <input
                  ref={customModelInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => uploadCustomModel(event.target.files)}
                  type="file"
                />
                <button
                  aria-expanded={customModelExpanded}
                  className="customModelToggle"
                  type="button"
                  onClick={() => setCustomModelExpanded((value) => !value)}
                >
                  个性化定制持包模特
                </button>
                {customModelExpanded ? (
                  <div className="customModelPanel">
                    <div className="customModelUploadRow">
                      <button className="customModelUploadButton" type="button" onClick={() => customModelInputRef.current?.click()}>上传持包模特照片</button>
                      <span>上传后会先作为本次箱包生成的临时持包参考图，不会自动保存入库。</span>
                    </div>
                    {customModelReferenceImage ? (
                      <div className="customModelReferenceCard">
                        <img alt={customModelReferenceImage.file.name} src={customModelReferenceImage.previewUrl} />
                        <span>
                          <strong>已上传持包模特参考图</strong>
                          <em>{customModelReferenceImage.file.name}</em>
                        </span>
                        <button type="button" onClick={removeCustomModelReference}>移除</button>
                      </div>
                    ) : null}
                    <button className="saveCustomModelButton" disabled={!customModelReferenceImage || customModelLimitReached} type="button" onClick={() => void saveCustomModelFromReference()}>
                      保存为专属持包模特
                    </button>
                    <span className="customModelSaveHint">{customModelLimitReached ? "最多保存5个专属持包模特，请先删除一个再添加。" : "保存后会进入下方专属持包模特库，可右键重命名。"}</span>
                    <div className="customModelSavedList" aria-label="已保存专属持包模特">
                      <div className="customModelLibraryHeader">
                        <strong>专属持包模特库</strong>
                        <select
                          value={selectedCustomModelId}
                          onChange={(event) => {
                            const next = customModels.find((item) => item.id === event.target.value);
                            if (next) applyCustomModel(next);
                            else clearCustomModelSelection();
                          }}
                        >
                          <option value="">不使用专属持包模特</option>
                          {customModels.map((item, index) => (
                            <option key={item.id} value={item.id}>{item.name || `专属持包模特${index + 1}`}</option>
                          ))}
                        </select>
                      </div>
                      {customModels.slice(0, 5).map((model, index) => (
                        <div
                          className={selectedCustomModelId === model.id ? "customModelSelectedCard active" : "customModelSelectedCard"}
                          key={model.id}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            void promptRenameCustomModel(model);
                          }}
                        >
                          <button className="customModelPickButton" type="button" onClick={() => applyCustomModel(model)} onContextMenu={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void promptRenameCustomModel(model);
                          }}>
                            <img alt={model.name} src={model.imageUrl} />
                            <span>
                              <strong>{model.name || `专属持包模特${index + 1}`}</strong>
                              <em>
                                {[
                                  model.modelGender ? modelGenderLabels[model.modelGender] : modelGenderLabels[selectedModelGender],
                                  model.modelAgeRange ? modelAgeRangeLabels[model.modelAgeRange] : modelAgeRangeLabels[selectedModelAgeRange],
                                  model.modelSkinTone ? modelSkinToneLabels[model.modelSkinTone] : modelSkinToneLabels[selectedModelSkinTone],
                                  model.modelHairStyle ? modelHairStyleLabels[model.modelHairStyle] : modelHairStyleLabels[selectedModelHairStyle]
                                ].join(" · ")}
                              </em>
                            </span>
                          </button>
                          {renamingCustomModelId === model.id ? (
                            <div className="customModelRenameInline">
                              <input
                                aria-label={`${model.name}名称`}
                                autoFocus
                                value={customModelNameDraft}
                                onBlur={() => {
                                  if (customModelNameDraft.trim()) void renameCustomModel(model.id);
                                  else setRenamingCustomModelId("");
                                }}
                                onChange={(event) => setCustomModelNameDraft(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    void renameCustomModel(model.id);
                                  }
                                  if (event.key === "Escape") {
                                    setRenamingCustomModelId("");
                                    setCustomModelNameDraft("");
                                  }
                                }}
                              />
                              <span>右键进入改名，回车保存，Esc 取消。</span>
                            </div>
                          ) : null}
                          <div className="customModelCardActions">
                            <button className="danger" type="button" onClick={() => void deleteCustomModel(model.id)}>删除</button>
                          </div>
                        </div>
                      ))}
                      {customModels.length === 0 ? <span className="emptyCustomModelHint">暂无专属持包模特，上传一张持包或下半身参考照后会显示在这里。</span> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="platformProtocol">
              <strong>{modelProfileLabels.product_only}</strong>
              <span>提交到后端时会使用 modelProfile=product_only。</span>
            </div>
          )}
        </section>

        <section>
          <StepTitle index="04" title="图片风格" />
          <div className="styleReferenceUpload">
            <div className="customStyleHeader">
              <strong>爆款风格复刻</strong>
              <span>{styleReferenceImage ? "首次使用此参考图需 2 算力点，保存后复用不重复扣费。" : "上传临时参考图会清空已选风格；保存后进入自定义风格库。"}</span>
            </div>
            <input
              ref={styleReferenceInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => uploadStyleReference(event.target.files)}
              type="file"
            />
            <div className={styleReferenceImage ? "styleReferenceRow hasImage" : "styleReferenceRow"}>
              <button className="styleReferencePickButton" type="button" onClick={() => styleReferenceInputRef.current?.click()}>
              {styleReferenceImage ? (
                <>
                  <img alt={styleReferenceImage.file.name} src={styleReferenceImage.previewUrl} />
                  <span>
                    <strong>上传参考风格图</strong>
                    <em className="styleReferenceFilename" title={styleReferenceImage.file.name}>{styleReferenceImage.file.name}</em>
                  </span>
                </>
              ) : (
                <span>
                  <i className="styleReferencePlus" aria-hidden="true">+</i>
                  <strong>上传参考风格图</strong>
                  <em>可点击或拖拽图片到这里</em>
                </span>
              )}
              </button>
              {styleReferenceImage ? (
                <button
                  aria-label={`删除${styleReferenceImage.file.name}`}
                  className="styleReferenceRemoveButton"
                  type="button"
                  onClick={removeStyleReference}
                >
                  −
                </button>
              ) : null}
            </div>
            <button className="saveCustomStyleButton" disabled={!styleReferenceImage} type="button" onClick={() => void saveCustomStyleFromReference()}>
              保存为自定义风格
            </button>
            <div className="customStyleLibrary">
              <div className="customStyleHeader">
                <strong>自定义风格库</strong>
                <span>{customStyles.length ? `${customStyles.length} 个已保存，可右键重命名；已解析风格复用不重复扣费` : "保存参考图风格后会显示在这里"}</span>
              </div>
              {customStyles.length ? (
                <div className="customStyleList">
                  {customStyles.map((style) => (
                    <div className={selectedCustomStyleIds.includes(style.id) ? "customStyleCard active" : "customStyleCard"} key={style.id} onContextMenu={(event) => {
                      event.preventDefault();
                      promptRenameCustomStyle(style);
                    }}>
                      <button className="customStylePickButton" type="button" onClick={() => toggleCustomStyle(style.id)} onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        promptRenameCustomStyle(style);
                      }}>
                        <img alt={style.name} src={style.imageDataUrl} />
                        <span>
                          <strong>{style.name}</strong>
                          <em>{style.stylePrompt ? "已解析，复用不重复扣费" : `${style.filename} · 需补解析 +2 点`}</em>
                        </span>
                      </button>
                      <button className="customStyleDeleteButton" aria-label={`删除${style.name}`} type="button" onClick={() => deleteCustomStyle(style.id)}>−</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="compactMenuHeader">
            <div>
              <strong>经典电商风格</strong>
              <span>{selectedMajorCategory.label} · 经典 {selectedClassicStyleCount}/{classicStylePresets.length + matchedStyleBoards.length} 种 · {styleSummaryText}</span>
            </div>
          </div>
          <div className="styleList compactStyleList">
            {classicStylePresets.map((item) => (
              <button
                className={selectedStyleIds.includes(item.id) ? "styleOption active" : "styleOption"}
                key={item.id}
                type="button"
                onClick={() => toggleStyle(item.id)}
              >
                <StyleCover preset={item} />
              </button>
            ))}
            {matchedStyleBoards.map((board) => (
              <button
                className={selectedStyleBoardIds.includes(board.id) ? "styleOption learnedClassicStyle active" : "styleOption learnedClassicStyle"}
                key={board.id}
                type="button"
                onClick={() => toggleStyleBoard(board.id)}
              >
                <span className="learnedClassicStyleName">{board.styleName}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <StepTitle index="05" title="图片参数（核心技术）" />
          <label className="photoMetadataToggle">
            <input
              checked={simulatePhotoMetadata}
              onChange={(event) => setSimulatePhotoMetadata(event.target.checked)}
              type="checkbox"
            />
            <span>
              <em>勾选此项，易避开平台AI排查,更易获取流量。</em>
            </span>
          </label>
        </section>

        <section>
          <StepTitle index="06" title="提示词补充" />
          <div className="promptAssistBox">
            <div>
              <strong>可不填</strong>
              <span>默认按前面选项自动生成。需要特殊要求时，再补充一句。</span>
            </div>
            <textarea
              aria-label="提示词补充"
              maxLength={500}
              placeholder="例如：背景更像天猫高端箱包详情页，低机位展示包型，底部与五金纹路清楚。"
              rows={4}
              value={userPrompt}
              onChange={(event) => setUserPrompt(event.target.value)}
            />
            <em>{userPrompt.length}/500</em>
          </div>
        </section>
      </aside>

      <main className="mainStage">
        <div className="taskSummary" aria-label="当前任务配置摘要">
          <div className="summaryHeader">
            <span>当前任务 · 快捷修改</span>
          </div>
          <div className="summaryGrid">
            <SummaryItem
              {...summaryItemControl("01")}
              index="01"
              label="大类"
              value={selectedMajorCategory.label}
              editor={(
                <div className="summaryPopoverGrid">
                  {majorCategoryPresets.map((item) => (
                    <button className={selectedMajorCategoryId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => switchMajorCategory(item.id)}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("02")}
              index="02"
              label="品类细分"
              value={`${selectedCategoryGroup.label} · ${selectedCategory.label}`}
              editor={(
                <div className="summaryPopoverStack">
                  <div className="summaryPopoverGrid">
                    {categoryGroupPresets.map((item) => (
                      <button className={selectedCategoryGroupId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => selectCategoryGroup(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="summaryPopoverGrid">
                    {productCategoryPresets.map((item) => (
                      <button className={selectedCategoryId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setSelectedCategoryId(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("03")}
              index="03"
              label={isDetailSuiteMode ? "详情图规格" : "平台规格"}
              value={isDetailSuiteMode
                ? (selectedSpecId === "custom" ? "自定义详情图尺寸" : "默认规格790宽")
                : `${platformLabels[platform]} · ${selectedSpecId === "custom" ? "自定义规格" : selectedSpec.label}`}
              editor={(
                <div className="summaryPopoverStack">
                  <div className="summaryPopoverGrid">
                    {isDetailSuiteMode ? (
                      <>
                        {detailSpec ? (
                          <button className={selectedSpecId === detailSpec.id ? "active" : ""} type="button" onClick={() => selectSpec(detailSpec.id, "detail")}>
                            默认规格790宽
                          </button>
                        ) : null}
                        <button className={selectedSpecId === "custom" && customSpecSurface === "detail" ? "active" : ""} type="button" onClick={() => selectSpec("custom", "detail")}>自定义详情图尺寸</button>
                      </>
                    ) : (
                      <>
                        {[...domesticPlatforms, "free" as CommercePlatform, ...crossBorderPlatforms].map((item) => (
                          <button className={platform === item ? "active" : ""} key={item} type="button" onClick={() => switchPlatform(item)}>
                            {platformLabels[item]}
                          </button>
                        ))}
                        {mainSpecs.map((item) => (
                          <button className={selectedSpecId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => selectSpec(item.id)}>
                            {item.label}
                          </button>
                        ))}
                        <button className={selectedSpecId === "custom" && customSpecSurface === "main" ? "active" : ""} type="button" onClick={() => selectSpec("custom", "main")}>自定义尺寸</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("04")}
              index="04"
              label="目标尺寸"
              value={`${targetWidth}x${targetHeight} → ${providerSize.providerSize}`}
              editor={(
                <div className="summaryPopoverStack">
                  <div className="summaryPopoverGrid">
                    {isDetailSuiteMode ? (
                      <>
                        {detailSpec ? (
                          <button className={selectedSpecId === detailSpec.id ? "active" : ""} type="button" onClick={() => selectSpec(detailSpec.id, "detail")}>{detailSpec.targetWidth}x{detailSpec.targetHeight}</button>
                        ) : null}
                        <button className={selectedSpecId === "custom" && customSpecSurface === "detail" ? "active" : ""} type="button" onClick={() => selectSpec("custom", "detail")}>自定义详情图尺寸</button>
                      </>
                    ) : (
                      <>
                        {mainSpecs.map((item) => (
                          <button className={selectedSpecId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => selectSpec(item.id)}>{item.targetWidth}x{item.targetHeight}</button>
                        ))}
                        <button className={selectedSpecId === "custom" && customSpecSurface === "main" ? "active" : ""} type="button" onClick={() => selectSpec("custom", "main")}>自定义尺寸</button>
                      </>
                    )}
                  </div>
                  <label>宽<input min={200} max={5000} type="number" value={customWidth} onChange={(event) => setCustomWidth(Number(event.target.value))} /></label>
                  <label>高<input min={200} max={5000} type="number" value={customHeight} onChange={(event) => setCustomHeight(Number(event.target.value))} /></label>
                </div>
              )}
            />
            {!isDetailSuiteMode ? (
              <SummaryItem
                {...summaryItemControl("05")}
                index="05"
                label="生成类型"
                value={selectedImageTypes.map((item) => item.label).join(" / ")}
                editor={(
                  <div className="summaryPopoverGrid">
                    {imageTypes.map((item) => (
                      <button className={selectedImageTypeIds.includes(item.id) ? "active" : ""} key={item.id} type="button" onClick={() => toggleImageType(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            ) : null}
            <SummaryItem
              {...summaryItemControl("06")}
              index="06"
              label="商品数"
              value={String(productCount)}
              editor={(
                <div className="summaryPopoverStack">
                  <p>{productGroupingMode === "outfit_combo" ? "当前按 1 套箱包搭配处理，上传几件都会默认出现。" : productGroupingMode === "single_product_multi_angle" ? "当前按 1 个商品处理多张角度图。" : "当前一张图对应一个商品。"}</p>
                  <button type="button" onClick={openFilePicker}>继续上传商品图</button>
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("07")}
              index="07"
              label="图片数"
              value={String(imageCount)}
              editor={(
                <div className="summaryPopoverStack">
                  <p>已上传 {imageCount} 张图片，最多 {maxImageUploadCount} 张。</p>
                  <button type="button" onClick={openFilePicker}>追加图片</button>
                  <button disabled={!images.length} type="button" onClick={() => {
                    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
                    setImages([]);
                    setActiveImageIndex(0);
                  }}>清空上传</button>
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("08")}
              index="08"
              label="持包模特"
              value={modelMode === "no_model" ? "不需要持包模特" : `${selectedCustomModel?.name ?? (customModelReferenceImage ? "临时持包参考图" : modelGenderLabels[selectedModelGender])} · ${modelAgeRangeLabels[selectedModelAgeRange]} · ${modelSkinToneLabels[selectedModelSkinTone]} · ${modelHairStyleLabels[selectedModelHairStyle]}`}
              editor={(
                <div className="summaryPopoverStack">
                  <div className="summaryPopoverGrid">
                    <button className={modelMode === "model" ? "active" : ""} type="button" onClick={() => setModelMode("model")}>需要持包模特</button>
                    <button className={modelMode === "no_model" ? "active" : ""} type="button" onClick={() => setModelMode("no_model")}>不需要持包模特</button>
                  </div>
                  {modelMode === "model" ? (
                    <>
                      <label>人物<select disabled={modelControlsLocked} value={selectedModelGender} onChange={(event) => setSelectedModelGender(event.target.value as ModelGender)}>{modelGenders.map((item) => <option key={item} value={item}>{modelGenderLabels[item]}</option>)}</select></label>
                      <label>年段<select disabled={modelControlsLocked} value={selectedModelAgeRange} onChange={(event) => setSelectedModelAgeRange(event.target.value as ModelAgeRange)}>{modelAgeRanges.map((item) => <option key={item} value={item}>{modelAgeRangeLabels[item]}</option>)}</select></label>
                      <label>肤色<select disabled={modelControlsLocked} value={selectedModelSkinTone} onChange={(event) => setSelectedModelSkinTone(event.target.value as ModelSkinTone)}>{modelSkinTones.map((item) => <option key={item} value={item}>{modelSkinToneLabels[item]}</option>)}</select></label>
                      <label>发式<select disabled={modelControlsLocked} value={selectedModelHairStyle} onChange={(event) => setSelectedModelHairStyle(event.target.value as ModelHairStyle)}>{modelHairStyles.map((item) => <option key={item} value={item}>{modelHairStyleLabels[item]}</option>)}</select></label>
                      {customModels.length ? (
                        <label>专属持包模特<select value={selectedCustomModelId} onChange={(event) => {
                          const next = customModels.find((item) => item.id === event.target.value);
                          if (next) applyCustomModel(next);
                          else clearCustomModelSelection();
                        }}><option value="">不使用专属持包模特</option>{customModels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("09")}
              index="09"
              label="图片风格"
              value={activeStyleLabels.length ? activeStyleLabels.join(" / ") : "未选择"}
              editor={(
                <div className="summaryPopoverGrid">
                  {classicStylePresets.map((item) => (
                    <button className={selectedStyleIds.includes(item.id) ? "active" : ""} key={item.id} type="button" onClick={() => toggleStyle(item.id)}>
                      {item.label}
                    </button>
                  ))}
                  {matchedStyleBoards.map((item) => (
                    <button className={selectedStyleBoardIds.includes(item.id) ? "active" : ""} key={item.id} type="button" onClick={() => toggleStyleBoard(item.id)}>
                      {item.styleName}
                    </button>
                  ))}
                  {customStyles.map((item) => (
                    <button className={selectedCustomStyleIds.includes(item.id) ? "active" : ""} key={item.id} type="button" onClick={() => toggleCustomStyle(item.id)}>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            />
            <SummaryItem
              {...summaryItemControl("10")}
              index="10"
              label="参考风格图"
              value={styleReferenceImage ? styleReferenceImage.file.name : "未上传"}
              editor={(
                <div className="summaryPopoverStack">
                  <button type="button" onClick={() => styleReferenceInputRef.current?.click()}>上传参考风格图</button>
                  <button disabled={!styleReferenceImage} type="button" onClick={() => void saveCustomStyleFromReference()}>保存为自定义风格</button>
                  <button disabled={!styleReferenceImage} type="button" onClick={removeStyleReference}>删除参考图</button>
                </div>
              )}
            />
            {!isDetailSuiteMode ? (
              <SummaryItem
                {...summaryItemControl("11")}
                index="11"
                label="详情文案"
                value={enabledModuleCopies.length ? `已启用 ${enabledModuleCopies.length} 个模块` : "未启用"}
                editor={(
                  <div className="summaryPopoverGrid">
                    {detailTextModuleCandidates.length ? detailTextModuleCandidates.map((item) => (
                      <button className={textEnabledImageTypeIds.includes(item.id) ? "active" : ""} key={item.id} type="button" onClick={() => toggleModuleTextInput(item.id)}>{item.label}</button>
                    )) : <p>选择详情图规格后可启用模块文案。</p>}
                  </div>
                )}
              />
            ) : null}
            <SummaryItem
              {...summaryItemControl("12")}
              index="12"
              label="提示词补充"
              value={userPrompt.trim() ? "已填写" : "默认自动"}
              editor={<textarea maxLength={500} rows={5} value={userPrompt} onChange={(event) => setUserPrompt(event.target.value)} />}
            />
            <SummaryItem
              {...summaryItemControl("13")}
              index="13"
              label="图片参数"
              value={simulatePhotoMetadata ? "模拟 EXIF" : "不写入"}
              editor={(
                <div className="summaryPopoverGrid">
                  <button className={!simulatePhotoMetadata ? "active" : ""} type="button" onClick={() => setSimulatePhotoMetadata(false)}>不写入</button>
                  <button className={simulatePhotoMetadata ? "active" : ""} type="button" onClick={() => setSimulatePhotoMetadata(true)}>模拟 EXIF</button>
                </div>
              )}
            />
          </div>
        </div>

        {isDetailSuiteMode ? (
          <DetailSuiteStagePanel
            colorGroups={detailColorGroups}
            templateLabel={selectedDetailSuitePreset?.label ?? "详情模板"}
            templateDescription={selectedDetailSuitePreset?.description ?? ""}
            suiteItems={activeDetailSuiteItems}
            targetSize={`${targetWidth}x${targetHeight}`}
          />
        ) : null}

        {!isDetailSuiteMode && enabledModuleCopies.length ? (
          <div className="posterCopyPanel moduleCopyPanel" aria-label="详情模块文案输入">
            <div className="posterCopyHeader">
              <span>详情模块文案</span>
              <strong>已启用 {enabledModuleCopies.length} 个模块</strong>
            </div>
            <div className="moduleCopyList">
              {enabledModuleCopies.map((copy) => {
                const draft = moduleCopyDrafts[copy.imageTypeId] ?? {};
                const fallback = defaultPosterCopy({
                  majorCategoryLabel: selectedMajorCategory.label,
                  categoryLabel: selectedCategory.label,
                  imageTypeId: copy.imageTypeId,
                  imageTypeLabel: copy.imageTypeLabel,
                  styleLabel: activeStyleLabels.join(" / ")
                });
                return (
                  <article className="moduleCopyCard" key={copy.imageTypeId}>
                    <header>
                      <span>{copy.imageTypeLabel}</span>
                      <button type="button" onClick={() => toggleModuleTextInput(copy.imageTypeId)}>关闭文本输入</button>
                    </header>
                    <div className="posterCopyGrid">
                      <label>
                        商品名 / 核心标题
                        <input
                          maxLength={18}
                          placeholder={fallback.title}
                          type="text"
                          value={draft.title ?? ""}
                          onChange={(event) => updateModuleCopyDraft(copy.imageTypeId, { title: event.target.value })}
                        />
                      </label>
                      <label>
                        核心卖点
                        <input
                          maxLength={28}
                          placeholder={fallback.subtitle}
                          type="text"
                          value={draft.subtitle ?? ""}
                          onChange={(event) => updateModuleCopyDraft(copy.imageTypeId, { subtitle: event.target.value })}
                        />
                      </label>
                      <label className="posterBulletsField">
                        辅助卖点
                        <textarea
                          maxLength={36}
                          placeholder={fallback.bullets.join("\n")}
                          rows={2}
                          value={draft.bulletText ?? ""}
                          onChange={(event) => updateModuleCopyDraft(copy.imageTypeId, { bulletText: event.target.value })}
                        />
                      </label>
                      <label>
                        版式
                        <select
                          value={draft.templateId ?? fallback.templateId}
                          onChange={(event) => updateModuleCopyDraft(copy.imageTypeId, { templateId: event.target.value as PosterTemplateId })}
                        >
                          {posterTemplatePresets.map((item) => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isDetailSuiteMode ? (
        <div className="uploadModePanel" aria-label="上传模式切换">
          <strong className="uploadModeTitle">上传模式</strong>
          <div className="uploadModeContent">
            <div className="uploadModeCopy">
            <span>{uploadModeLabel}</span>
            <em>{uploadModeHelp}</em>
            </div>
            <div className="modeSwitch uploadModeSwitch" role="group" aria-label="单图与单款多角度切换">
              <button
                className={productGroupingMode === "per_image" ? "active" : ""}
                type="button"
                onClick={() => setProductGroupingMode("per_image")}
              >
                默认单图
              </button>
              <button
                className={productGroupingMode === "single_product_multi_angle" ? "active" : ""}
                type="button"
                onClick={() => setProductGroupingMode("single_product_multi_angle")}
              >
                单款多角度
              </button>
              <button
                className={productGroupingMode === "outfit_combo" ? "active" : ""}
                type="button"
                onClick={() => setProductGroupingMode("outfit_combo")}
              >
                搭配组合
              </button>
            </div>
          </div>
        </div>
        ) : null}

        <div
          className={[
            "uploadSurface compact",
            images.length ? "hasImage" : "",
            isUploadDragActive ? "dragActive" : ""
          ].filter(Boolean).join(" ")}
          onClick={openFilePicker}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsUploadDragActive(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            setIsUploadDragActive(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleUploadDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker();
            }
          }}
        >
          <input
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => addFiles(event.target.files ?? [])}
            type="file"
          />
          <input
            ref={merchantInfoInputRef}
            accept="image/png,image/jpeg,image/webp"
            className="hiddenFileInput"
            onChange={(event) => uploadMerchantInfoImage(event.target.files)}
            type="file"
          />
          <div className="uploadDropZone" onClick={(event) => {
            event.stopPropagation();
            openFilePicker();
          }}>
            <UploadGlyph majorCategoryId={selectedMajorCategoryId} />
            <strong>{images.length ? (isDetailSuiteMode ? "继续上传颜色或细节素材" : effectiveProductGroupingMode === "outfit_combo" ? "继续上传箱包搭配素材" : effectiveProductGroupingMode === "single_product_multi_angle" ? "继续拖拽追加角度图" : "继续拖拽上传更多包款图") : "点击或拖拽上传箱包图片"}</strong>
            <span>{images.length ? `${productCount} 个箱包素材 · ${imageCount} 张图片` : "直接点这里或把包款图片拖进来"}</span>
            <em>{isDetailSuiteMode ? "支持多色、多角度、包身、底部与五金、侧边等细节图；系统会先整理颜色组，再按箱包详情页结构生成" : effectiveProductGroupingMode === "outfit_combo" ? "上传几件默认全部出现；系统会识别箱包、裤装、包袋、帽子、配件等搭配位置" : effectiveProductGroupingMode === "single_product_multi_angle" ? "同一包款可继续追加侧面、侧边、底部与五金等角度图" : "默认一张图对应一个包款"}</em>
          </div>

          {images.length > 0 ? (
            <div className="assetMiniBoard" aria-label="上传素材概览" onClick={(event) => event.stopPropagation()}>
              <div className="assetMiniGroup">
                <span>{isDetailSuiteMode ? "详情素材" : effectiveProductGroupingMode === "outfit_combo" ? "箱包搭配素材" : effectiveProductGroupingMode === "single_product_multi_angle" ? "角度图" : "包款图"}</span>
                <div className="uploadThumbRail" aria-label="已上传产品图缩略图">
                  {images.map((image, index) => (
                    <div className={index === activeImageIndex ? "uploadThumbItem active" : "uploadThumbItem"} key={image.id}>
                      <button
                        className="uploadThumbButton"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveImageIndex(index);
                        }}
                      >
                        <img alt={image.file.name} src={image.previewUrl} />
                      </button>
                      <button
                        aria-label={`删除${image.file.name}`}
                        className="removeThumbButton"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeImage(image.id);
                        }}
                      >
                        −
                      </button>
                      {effectiveProductGroupingMode === "outfit_combo" ? (
                        <select
                          aria-label={`${image.file.name}搭配槽位`}
                          className="thumbRoleSelect"
                          value={image.role ?? "other"}
                          onChange={(event) => updateImageRole(image.id, event.target.value as ProductReferenceRole)}
                        >
                          {outfitRoles.map((role) => (
                            <option key={role} value={role}>{productReferenceRoleLabels[role]}</option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {isDetailSuiteMode && images.length ? (
          <DetailColorGroupPanel
            groups={detailColorGroups}
            onMoveImage={moveImageToDetailColorGroup}
            onRemoveGroup={removeDetailColorGroup}
            onRenameGroup={renameDetailColorGroup}
          />
        ) : null}

        <div className="actionRow">
          <button className="generateButton" disabled={!canSubmit} type="submit">
            {isSubmitting ? "生成队列运行中" : detailSuiteNeedsMerchantInfo && !merchantInfoImage ? "请先上传尺码表" : isDetailSuiteMode ? "生成完整详情" : "一键生图"}
          </button>
          <span className="generationCostHint">
            {detailSuiteNeedsMerchantInfo && !merchantInfoImage
              ? "尺码说明模块已启用，需上传尺码表/商品资料图后才能生成。"
              : (
                <>
                  生图约 {estimatedGenerationCredits} 点
                  {pendingStyleAnalysisCredits ? ` + 参考风格解析 ${pendingStyleAnalysisCredits} 点 = 共 ${estimatedGenerationCredits + pendingStyleAnalysisCredits} 点` : "；已解析风格复用不重复扣费"}
                </>
              )}
          </span>
          {job?.status === "running" ? (
            <button className="cancelGenerateButton" type="button" onClick={cancelGenerationJob}>
              取消生成
            </button>
          ) : null}
        </div>
      </main>

      <aside className="resultRail">
        <div className="queueCard">
          <span>图片任务状态</span>
          <strong>{job?.id ?? "等待生成任务"}</strong>
          <div className="queueMeta">
            <div className="queueStat">
              <b>{effectiveProductCount}</b>
              <small>{isMerchantInfoGraphicSelected ? "资料" : "商品"}</small>
            </div>
            <div className="queueStat">
              <b>{effectiveImageCount}</b>
              <small>{isMerchantInfoGraphicSelected ? "资料图" : "图片"}</small>
            </div>
            <div className="queueStat">
              <b>{job ? `${job.progress.completed}/${job.progress.total}` : `0/${effectiveProductCount}`}</b>
              <small>进度</small>
            </div>
          </div>
          <div className="progressBar"><i style={{ width: `${progressPercent}%` }} /></div>
        </div>

        {job?.error ? (
          <div className="errorCard">
            <strong>{job.status === "partial_failed" ? "部分图片生成失败" : providerErrorTitle(job.error)}</strong>
            <p>{job.status === "partial_failed" ? "成功图片已保留并按实际成功张数扣积分；失败部分已释放冻结积分。" : providerErrorMessage(job.error)}</p>
            {job.failures?.length ? (
              <div className="failureList">
                {job.failures.map((failure) => (
                  <article key={`${failure.order}-${failure.imageTypeId}`}>
                    <b>{failureLabel(failure)}</b>
                    <span>{failure.sourceFilename} · {providerErrorMessage(failure.error)}</span>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {isDetailSuiteMode ? (
          <DetailSuitePreviewPanel
            job={job}
            platform={platform}
            suiteItems={activeDetailSuiteItems}
          />
        ) : (
        <div className="resultPanel">
          <div className="panelHeader">
            <span>图片生成结果</span>
            <strong>{selectedResultIds.length}/{job?.results.length ?? 0} 张</strong>
          </div>
          {job?.results.length ? (
            <div className="resultBulkActions">
              <button type="button" onClick={toggleAllResults}>{allResultsSelected ? "取消全选" : "一键全选"}</button>
              <button disabled={selectedResults.length === 0} type="button" onClick={downloadSelectedResults}>下载选中</button>
              <em className="downloadRetentionHint">请及时下载，系统仅保存24小时</em>
            </div>
          ) : null}
          {job?.results[0] ? (
            <div className="resultGroups">
              {groupedResults.map((group) => (
                <section className="resultGroup" key={group.id}>
                  <h3>{group.label}</h3>
                  <div className="resultGrid">
                    {group.results.map((image, index) => (
                      <figure className={index === 0 ? "heroResult" : ""} key={image.id}>
                        <label className="resultSelect">
                          <input
                            checked={selectedResultIds.includes(image.id)}
                            onChange={() => toggleResultSelection(image.id)}
                            type="checkbox"
                          />
                          <span>选择</span>
                        </label>
                        <img alt={`${group.label} ${index + 1}`} src={imageSrc(image)} />
                        <figcaption>
                          <span>{image.imageTypeId === "detail_header_poster" ? "AI生成海报" : image.sourceFilename ?? "generated"}</span>
                          <div className="downloadActionWithHint compact">
                            <button type="button" onClick={() => void saveImageResult(platform, image, index)}>下载</button>
                            <em className="downloadRetentionHint">仅保存24小时</em>
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="emptyResult">
              <strong>暂无生成图</strong>
              <span>{images.length ? "点击生成后，结果会优先显示在这里。" : "先上传包款参考图。"}</span>
            </div>
          )}
        </div>
        )}
        <div className="recordShortcutCard">
          <span>图片生成记录</span>
          <strong>查看最近保留的图片任务和成品</strong>
          <a href="/generation-records?tab=images">进入记录</a>
        </div>
      </aside>
        </>
      )}
    </form>
  );
}

function DetailTemplateSelector(input: {
  activeItemId: string;
  colorGroups: Array<{ id: string; label: string; images: LocalImage[] }>;
  drafts: Record<string, DetailModuleDraft>;
  merchantInfoImage?: LocalImage;
  selectedId: SuitePresetId;
  options: Array<{ id: string; label: string; description: string }>;
  suiteItems: DetailSuitePlanItem[];
  onAddItem: (baseSuiteItemId: string) => void;
  onActivateItem: (id: string) => void;
  onRemoveItem: (item: DetailSuitePlanItem) => void;
  onPickMerchantInfo: () => void;
  onRemoveMerchantInfo: () => void;
  onSelect: (id: SuitePresetId) => void;
  onUpdateItem: (suiteItemId: string, patch: DetailModuleDraft) => void;
}) {
  return (
    <div className="detailSuiteOutline" aria-label="详情结构大纲">
      <div className="detailSuiteOutlineHeader">
        <strong>选择详情页模板</strong>
        <span>{input.suiteItems.length} 个模块</span>
      </div>
      <div className="detailTemplateGrid" aria-label="详情页模板">
        {input.options.map((item) => (
          <button
            className={input.selectedId === item.id ? "active" : ""}
            key={item.id}
            type="button"
            onClick={() => input.onSelect(item.id as SuitePresetId)}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>
      <div className="detailSuiteOutlineGrid">
        {input.suiteItems.map((item, index) => {
          const enabled = input.drafts[item.id]?.enabled !== false;
          const expanded = input.activeItemId === item.id;
          return (
            <div
              className={[
                "detailSuiteModuleItem",
                expanded ? "active" : "",
                enabled ? "" : "disabled"
              ].filter(Boolean).join(" ")}
              key={item.id}
            >
              <div className="detailSuiteModuleRow">
                <button
                  aria-expanded={expanded}
                  className="detailSuiteModuleButton"
                  type="button"
                  onClick={() => input.onActivateItem(expanded ? "" : item.id)}
                  >
                    <label className="detailSuiteModuleCheck" aria-label={`${item.label}是否生成`} onClick={(event) => event.stopPropagation()}>
                      <input
                      checked={enabled}
                      type="checkbox"
                      onChange={(event) => {
                        input.onUpdateItem(item.id, { enabled: event.target.checked });
                        if (event.target.checked) input.onActivateItem(item.id);
                      }}
                    />
                  </label>
                  <span className="detailSuiteModuleIndex">{String(index + 1).padStart(2, "0")}</span>
                  <em>
                    <strong>{item.label}</strong>
                    <span className="detailSuiteModuleChevron">{expanded ? "收起信息" : "待录入信息"}</span>
                    <small>{modulePolicyLabel(item)}</small>
                  </em>
                </button>
                <div className="detailSuiteModuleActions">
                  <button type="button" onClick={() => input.onAddItem(item.baseSuiteItemId ?? item.id)}>增加该模块</button>
                  {item.duplicate ? <button type="button" onClick={() => input.onRemoveItem(item)}>删除</button> : null}
                </div>
              </div>
              {expanded ? (
                <div className="detailSuiteModulePanel" aria-label={`${item.label}模块输入`}>
                  <DetailModuleEditorCard
                    compact
                    colorGroups={input.colorGroups}
                    draft={input.drafts[item.id] ?? {}}
                    item={item}
                    merchantInfoImage={input.merchantInfoImage}
                    onPickMerchantInfo={input.onPickMerchantInfo}
                    onRemoveMerchantInfo={input.onRemoveMerchantInfo}
                    onUpdate={input.onUpdateItem}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function modulePolicyLabel(item: SuitePlanItem): string {
  const model = item.modelPolicy === "never" ? "无持包模特" : item.modelPolicy === "required" ? "需持包模特" : "可选持包模特";
  const color = item.colorPolicy === "all_colors" ? "全部颜色" : item.colorPolicy === "merchant_data" ? "资料信息" : "主推色";
  return `${color} · ${model}`;
}

function DetailModuleEditorCard(input: {
  item: DetailSuitePlanItem;
  draft: DetailModuleDraft;
  colorGroups: Array<{ id: string; label: string; images: LocalImage[] }>;
  compact?: boolean;
  merchantInfoImage?: LocalImage;
  onPickMerchantInfo: () => void;
  onRemoveMerchantInfo: () => void;
  onUpdate: (suiteItemId: string, patch: DetailModuleDraft) => void;
}) {
  const enabled = input.draft.enabled !== false;
  const fallback = defaultPosterCopy({
    majorCategoryLabel: "电商",
    categoryLabel: input.item.label,
    imageTypeId: input.item.imageTypeId,
    imageTypeLabel: input.item.label,
    styleLabel: ""
  });
  const copyFields = detailModuleCopyFields(input.item, fallback);
  return (
    <article className={[enabled ? "detailModuleCard" : "detailModuleCard disabled", input.compact ? "compact" : ""].filter(Boolean).join(" ")}>
      {!input.compact ? (
      <header>
        <div>
          <b>{String(input.item.order).padStart(2, "0")}</b>
          <span>{input.item.label}</span>
          <small>{modulePolicyLabel(input.item)}</small>
        </div>
        <label className="detailModuleToggle">
          <input
            checked={enabled}
            type="checkbox"
            onChange={(event) => input.onUpdate(input.item.id, { enabled: event.target.checked })}
          />
          生成
        </label>
      </header>
      ) : null}
      {enabled ? (
        <>
          {input.item.role !== "size_info" ? (
            <DetailModuleAssetSelector
              colorGroups={input.colorGroups}
              draft={input.draft}
              item={input.item}
              suiteItemId={input.item.id}
              onUpdate={input.onUpdate}
            />
          ) : null}
          {input.item.role === "size_info" ? (
            <div className={input.merchantInfoImage ? "detailModuleInfoUpload" : "detailModuleInfoUpload required"}>
              <div>
                <strong>尺码/资料图（必传）</strong>
                <span>{input.merchantInfoImage ? input.merchantInfoImage.file.name : "上传手绘尺码表、表格截图或商品资料图；系统只做版式美化并保留原始数字文字"}</span>
              </div>
              <button type="button" onClick={input.onPickMerchantInfo}>{input.merchantInfoImage ? "替换资料图" : "上传资料图"}</button>
              {input.merchantInfoImage ? <button type="button" onClick={input.onRemoveMerchantInfo}>删除</button> : null}
            </div>
          ) : (
            <div className="detailModuleCopyGrid">
              <label>
                {copyFields.title.label}
                <input
                  maxLength={18}
                  placeholder={copyFields.title.placeholder}
                  value={input.draft.title ?? ""}
                  onChange={(event) => input.onUpdate(input.item.id, { title: event.target.value })}
                />
              </label>
              <label>
                {copyFields.subtitle.label}
                <input
                  maxLength={28}
                  placeholder={copyFields.subtitle.placeholder}
                  value={input.draft.subtitle ?? ""}
                  onChange={(event) => input.onUpdate(input.item.id, { subtitle: event.target.value })}
                />
              </label>
              <label>
                {copyFields.bullets.label}
                <textarea
                  maxLength={40}
                  placeholder={copyFields.bullets.placeholder}
                  rows={2}
                  value={input.draft.bulletText ?? ""}
                  onChange={(event) => input.onUpdate(input.item.id, { bulletText: event.target.value })}
                />
              </label>
              <label>
                {copyFields.notes.label}
                <textarea
                  maxLength={500}
                  placeholder={copyFields.notes.placeholder}
                  rows={3}
                  value={input.draft.detailNotes ?? ""}
                  onChange={(event) => input.onUpdate(input.item.id, { detailNotes: event.target.value })}
                />
              </label>
            </div>
          )}
        </>
      ) : (
        <div className="detailModuleEmpty">
          <strong>此模块已关闭</strong>
          <span>勾选“生成”后再填写这个模块的信息。</span>
        </div>
      )}
    </article>
  );
}

function DetailModuleAssetSelector(input: {
  suiteItemId: string;
  item: DetailSuitePlanItem;
  colorGroups: Array<{ id: string; label: string; images: LocalImage[] }>;
  draft: DetailModuleDraft;
  onUpdate: (suiteItemId: string, patch: DetailModuleDraft) => void;
}) {
  const selectedIds = input.draft.selectedColorGroupIds ?? [];
  return (
    <div className="detailModuleAssetSelector" aria-label={`${input.item.label}模块素材`}>
      <div>
        <strong>本模块素材</strong>
        <span>{input.colorGroups.length ? "选择这个模块要参考的颜色、角度或局部图" : "上传商品图后可绑定具体素材"}</span>
      </div>
      {input.colorGroups.length ? (
        <div className="detailModuleAssetChips">
          {input.colorGroups.map((group) => {
            const active = selectedIds.includes(group.id);
            return (
              <button
                className={active ? "active" : ""}
                aria-pressed={active}
                key={group.id}
                type="button"
                onClick={() => {
                  const next = active ? selectedIds.filter((id) => id !== group.id) : [...selectedIds, group.id];
                  input.onUpdate(input.suiteItemId, { selectedColorGroupIds: next });
                }}
              >
                <strong>{group.label}</strong>
                <span>{group.images.length} 张</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function detailModulePlaceholder(item: SuitePlanItem): string {
  if (item.role === "detail_header") return "例如：夏日通勤、轻量容量感、清爽高级感，美术字偏杂志风";
  if (item.role === "sku_color") return "例如：颜色按深浅排序，重点突出黑色和米色";
  if (item.role === "model_fit") return "例如：持包自然行走，侧面展示包型、肩带长度和真人比例";
  if (item.role === "key_features") return "例如：突出大容量、轻量、分区收纳、肩背舒适和通勤适配";
  if (item.role === "material_detail") return "例如：展示包身纹理、皮革/帆布/尼龙质感、走线和拼接层次";
  if (item.role === "craft_detail") return "例如：重点展示五金扣具、拉链顺滑、包底脚钉、边油、肩带连接和走线";
  if (item.role === "size_info") return "可填写尺寸容量建议，也可直接上传尺寸容量表/商品资料图";
  if (item.role === "trust_footer") return "例如：清洁保养方式、品质承诺、售后说明";
  return "补充这个模块必须表达的信息";
}

function detailModuleCopyFields(item: SuitePlanItem, fallback: PosterCopy) {
  const base = {
    title: { label: "模块主文案", placeholder: fallback.title },
    subtitle: { label: "模块说明", placeholder: fallback.subtitle },
    bullets: { label: "辅助短句", placeholder: "一行一个，最多两条" },
    notes: { label: "补充要求", placeholder: detailModulePlaceholder(item) }
  };
  if (item.role === "detail_header") {
    return {
      title: { label: "海报主标题", placeholder: "例如：夏日通勤箱包" },
      subtitle: { label: "海报副标题", placeholder: "例如：轻量舒适，日常好搭" },
      bullets: { label: "美术字短句", placeholder: "例如：清爽高级\n轻量容量感" },
      notes: { label: "海报画面要求", placeholder: "例如：杂志感排版，主标题更醒目，背景干净但有氛围" }
    };
  }
  if (item.role === "sku_color") {
    return {
      title: { label: "总览标题", placeholder: "例如：多色可选" },
      subtitle: { label: "颜色说明", placeholder: "例如：通勤基础色，显白不挑人" },
      bullets: { label: "重点颜色", placeholder: "例如：黑色主推\n米色温柔" },
      notes: { label: "颜色/排序要求", placeholder: "例如：按黑、白、灰、蓝排序；每个颜色只展示商品本体" }
    };
  }
  if (item.role === "model_fit") {
    return {
      title: { label: "场景主题", placeholder: "例如：通勤持包展示" },
      subtitle: { label: "动作说明", placeholder: "例如：自然迈步，展示包型比例" },
      bullets: { label: "镜头标记", placeholder: "例如：侧面\n底部与五金" },
      notes: { label: "持包画面要求", placeholder: "例如：每张只出现一个包款一个颜色，不要多色同框；需要侧面、侧边、底部与五金或行走镜头请写清楚" }
    };
  }
  if (item.role === "key_features") {
    return {
      title: { label: "包型标题", placeholder: "例如：利落修长包型" },
      subtitle: { label: "包型说明", placeholder: "例如：轮廓挺括，通勤搭配更利落" },
      bullets: { label: "包型关键词", placeholder: "例如：挺括\n大容量" },
      notes: { label: "包型展示要求", placeholder: "例如：重点展示正侧面轮廓、包底厚度、肩带长度、开口结构或容量比例" }
    };
  }
  if (item.role === "material_detail") {
    return {
      title: { label: "包身标题", placeholder: "例如：细腻包身肌理" },
      subtitle: { label: "包身说明", placeholder: "例如：纹理细腻，耐磨易打理" },
      bullets: { label: "包身关键词", placeholder: "例如：耐磨\n细腻" },
      notes: { label: "包身部位要求", placeholder: "例如：重点放大皮革纹理、帆布织纹、尼龙肌理、拼接层次、边油或走线细节" }
    };
  }
  if (item.role === "craft_detail") {
    return {
      title: { label: "工艺标题", placeholder: "例如：细密走线工艺" },
      subtitle: { label: "工艺说明", placeholder: "例如：边缘平整，细节耐看" },
      bullets: { label: "工艺关键词", placeholder: "例如：走线\n纽扣" },
      notes: { label: "工艺部位要求", placeholder: "例如：重点展示拉链、五金扣具、肩带连接、包底脚钉、边油、走线或包边细节" }
    };
  }
  if (item.role === "trust_footer") {
    return {
      title: { label: "收尾标题", placeholder: "例如：安心洗护" },
      subtitle: { label: "服务/品质说明", placeholder: "例如：日常好打理，售后更省心" },
      bullets: { label: "收尾条目", placeholder: "例如：轻柔洗涤\n悬挂晾干" },
      notes: { label: "洗护/品质要求", placeholder: "例如：填写洗护、保养、品质承诺、售后说明；没有就留空保持干净画面" }
    };
  }
  return base;
}

function DetailSuiteStagePanel(input: {
  colorGroups: Array<{ id: string; label: string; images: LocalImage[] }>;
  templateLabel: string;
  templateDescription: string;
  suiteItems: SuitePlanItem[];
  targetSize: string;
}) {
  return (
    <section className="detailSuiteDirector" aria-label="详情页生成大纲">
      <div className="detailDirectorHeader">
        <span>{input.templateLabel}</span>
        <strong>{input.templateLabel} · {input.targetSize}</strong>
      </div>
      <p className="detailDirectorDescription">{input.templateDescription}</p>
      <div className="detailDirectorStats">
        <div><b>{input.suiteItems.length}</b><small>详情模块</small></div>
        <div><b>{input.colorGroups.length}</b><small>颜色组</small></div>
        <div><b>{input.colorGroups.reduce((sum, group) => sum + group.images.length, 0)}</b><small>素材图</small></div>
      </div>
      <div className="detailDirectorTimeline">
        {input.suiteItems.map((item) => (
          <i key={item.id} title={item.label}>{item.label}</i>
        ))}
      </div>
    </section>
  );
}

function DetailColorGroupPanel(input: {
  groups: Array<{ id: string; label: string; images: LocalImage[] }>;
  onMoveImage: (imageId: string, groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, label: string) => void;
}) {
  return (
    <section className="detailColorPanel" aria-label="颜色分组">
      <div className="detailColorHeader">
        <span>颜色分组</span>
        <strong>{input.groups.length} 组</strong>
      </div>
      <div className="detailColorGroupList">
        {input.groups.map((group) => (
          <article className="detailColorGroup" key={group.id}>
            <header>
              <input
                aria-label={`${group.label}颜色名`}
                maxLength={12}
                value={group.label}
                onChange={(event) => input.onRenameGroup(group.id, event.target.value)}
              />
              <button type="button" onClick={() => input.onRemoveGroup(group.id)}>移除组</button>
            </header>
            <div className="detailColorThumbs">
              {group.images.map((image) => (
                <figure key={image.id}>
                  <img alt={image.file.name} src={image.previewUrl} />
                  <figcaption title={image.file.name}>{image.file.name}</figcaption>
                  <select
                    aria-label={`${image.file.name}移动到颜色组`}
                    value={group.id}
                    onChange={(event) => input.onMoveImage(image.id, event.target.value)}
                  >
                    {input.groups.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DetailSuitePreviewPanel(input: {
  job?: GenerationJobView;
  platform: CommercePlatform;
  suiteItems: SuitePlanItem[];
}) {
  const results = [...(input.job?.results ?? [])].sort((left, right) => (left.suiteOrder ?? 999) - (right.suiteOrder ?? 999));
  const failures = input.job?.failures ?? [];
  const resultsBySuiteItem = groupImagesBySuiteItem(results);
  const resultsByOrder = groupImagesByOrder(results);
  const failuresByOrder = groupFailuresByOrder(failures);
  const previewItems = input.suiteItems.map((item) => ({
    item,
    results: resultsBySuiteItem.get(item.id) ?? resultsByOrder.get(item.order) ?? [],
    failures: failuresByOrder.get(item.order) ?? []
  }));

  return (
    <div className="resultPanel detailSuiteResultPanel" aria-label="完整详情长图预览">
      <div className="panelHeader">
        <span>完整详情长图预览</span>
        <strong>{results.length}/{input.suiteItems.length} 屏</strong>
      </div>
      {input.job?.results.length ? (
        <div className="resultBulkActions">
          <button type="button" onClick={() => void saveDetailSuiteResults(input.platform, results)}>导出套图</button>
          <em className="downloadRetentionHint">请及时下载，系统仅保存24小时</em>
        </div>
      ) : null}
      <div className="detailLongPreview">
        {previewItems.map(({ item, results: moduleResults, failures: moduleFailures }) => (
          <article className={moduleResults.length ? "detailPreviewModule ready" : moduleFailures.length ? "detailPreviewModule failed" : "detailPreviewModule"} key={item.id}>
            <header>
              <span>{String(item.order).padStart(2, "0")}</span>
              <strong>{moduleResults[0]?.suiteLabel?.split(" · ")[0] ?? item.label}</strong>
              {moduleResults[0] ? (
                <div className="downloadActionWithHint compact">
                  <button type="button" onClick={() => void saveImageResult(input.platform, moduleResults[0], item.order - 1)}>下载</button>
                  <em className="downloadRetentionHint">仅保存24小时</em>
                </div>
              ) : null}
            </header>
            {moduleResults.length ? (
              <div className={moduleResults.length > 1 ? "detailPreviewImageStack" : "detailPreviewImageStack single"}>
                {moduleResults.map((result, index) => (
                  <figure key={result.id}>
                    {moduleResults.length > 1 ? <figcaption>{result.suiteLabel ?? `${item.label} ${index + 1}`}</figcaption> : null}
                    <img alt={result.suiteLabel ?? item.label} src={imageSrc(result)} />
                  </figure>
                ))}
              </div>
            ) : (
              <div className="detailPreviewPlaceholder">
                <strong>{moduleFailures.length ? "此模块生成失败" : "等待生成"}</strong>
                <span>{moduleFailures.length ? providerErrorMessage(moduleFailures[0].error) : `${item.targetWidth}x${item.targetHeight}`}</span>
                {moduleFailures.length ? <button disabled type="button">重做此模块</button> : null}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function groupImagesBySuiteItem(images: GenerationJobView["results"]): Map<string, GenerationJobView["results"]> {
  const groups = new Map<string, GenerationJobView["results"]>();
  images.forEach((image) => {
    if (!image.suiteItemId) return;
    groups.set(image.suiteItemId, [...(groups.get(image.suiteItemId) ?? []), image]);
  });
  return groups;
}

function groupImagesByOrder(images: GenerationJobView["results"]): Map<number, GenerationJobView["results"]> {
  const groups = new Map<number, GenerationJobView["results"]>();
  images.forEach((image) => {
    if (typeof image.suiteOrder !== "number") return;
    groups.set(image.suiteOrder, [...(groups.get(image.suiteOrder) ?? []), image]);
  });
  return groups;
}

function groupFailuresByOrder(failures: NonNullable<GenerationJobView["failures"]>): Map<number, NonNullable<GenerationJobView["failures"]>> {
  const groups = new Map<number, NonNullable<GenerationJobView["failures"]>>();
  failures.forEach((failure) => {
    const order = failure.suiteOrder ?? failure.order;
    groups.set(order, [...(groups.get(order) ?? []), failure]);
  });
  return groups;
}

function VideoGenerationWorkspace({ entranceResetKey }: { entranceResetKey: number }) {
  const productVideoInputRef = useRef<HTMLInputElement>(null);
  const referenceVideoInputRef = useRef<HTMLInputElement>(null);
  const customProductInputRef = useRef<HTMLInputElement>(null);
  const musicAudioInputRef = useRef<HTMLInputElement>(null);
  const voiceoverAudioInputRef = useRef<HTMLInputElement>(null);
  const productVideoFilesRef = useRef<LocalImage[]>([]);
  const referenceVideoFilesRef = useRef<LocalImage[]>([]);
  const videoDraftRestoreCompletedRef = useRef(false);
  const videoTypes = [
    { id: "qianchuan_ad", label: "推广素材使用", desc: "投放感开场、卖点密集、下单引导" },
    { id: "ecommerce_main", label: "商品主图", desc: "商品页首屏/轮播展示，突出包型和卖点" },
    { id: "live_selling", label: "直播间引流短片", desc: "口播节奏、利益点和直播间引导" },
    { id: "custom", label: "自定义", desc: "按你的补充要求生成指定视频需求" }
  ] as const;
  const videoPlatforms = [
    { id: "vertical", label: "竖屏", spec: "9:16 · ≤15s" },
    { id: "portrait_4_5", label: "竖版", spec: "4:5 · ≤15s" },
    { id: "ecommerce_3_4", label: "电商竖版", spec: "3:4 · ≤15s" },
    { id: "square", label: "方形", spec: "1:1 · ≤15s" },
    { id: "horizontal", label: "横屏", spec: "16:9 · ≤15s" },
    { id: "custom", label: "自定义", spec: "自定义比例 · ≤15s" }
  ] as const;
  const rewriteModes = [
    { id: "light", label: "轻度参考", desc: "更自由，主要借鉴画面感觉" },
    { id: "medium", label: "中度参考（推荐）", desc: "平衡相似度和原创度" },
    { id: "strong", label: "重度参考", desc: "更贴近参考视频的节奏和动作" }
  ] as const;
  const generationGoals = ["换成我的包款", "换背景但保留氛围", "保留节奏，重写文案", "生成投放感字幕"];
  const mainVideoTemplates = ["参考结构重拍", "棚拍主图动效", "推广素材节奏", "商品主图展示"];
  const freeVideoAspects = ["9:16竖屏", "1:1方形", "4:5竖版", "16:9横屏"];
  const musicModeOptions = [
    { id: "ai_music", label: "AI自动配乐" },
    { id: "upload_music", label: "上传本地音乐" },
    { id: "music_url", label: "粘贴音乐链接" },
    { id: "none", label: "不需要背景音乐" }
  ] as const satisfies ReadonlyArray<{ id: MusicMode; label: string }>;
  const voiceoverModeOptions = [
    { id: "none", label: "不需要配音" },
    { id: "ai_voiceover", label: "AI自主配音" },
    { id: "script_voiceover", label: "按文案配音" },
    { id: "upload_voiceover", label: "上传配音音频" }
  ] as const satisfies ReadonlyArray<{ id: VoiceoverMode; label: string }>;
  const subtitleModeOptions = [
    { id: "none", label: "无字幕" },
    { id: "ai_subtitle", label: "AI生成字幕" },
    { id: "script_subtitle", label: "按文案生成字幕" }
  ] as const satisfies ReadonlyArray<{ id: SubtitleMode; label: string }>;
  const directVideoQualities = [
    { id: "480p", label: "480P", desc: "推荐先生成，试片成本更低" },
    { id: "720p", label: "720P", desc: "更清晰，适合确认后直接导出" }
  ] as const;
  const videoDurationOptions = [
    { id: "5", label: "5秒", seconds: 5, desc: "最低试片成本" },
    { id: "10", label: "10秒", seconds: 10, desc: "常规短草稿" },
    { id: "15", label: "15秒", seconds: 15, desc: "完整卖点节奏" },
    { id: "custom", label: "自定义（≤15秒）", seconds: undefined, desc: "1-15秒整数" }
  ] as const;
  const upscaleVideoQualities = [
    { id: "720p", label: "720P" },
    { id: "1080p", label: "1080P" },
    { id: "2k", label: "2K" },
    { id: "4k", label: "4K" }
  ] as const;
  const [videoCreationMode, setVideoCreationMode] = useState<"choose" | "reference" | "custom">("choose");
  const [selectedVideoCategoryId, setSelectedVideoCategoryId] = useState<MajorCategoryId>("bags");
  const [videoTypeId, setVideoTypeId] = useState<(typeof videoTypes)[number]["id"]>("qianchuan_ad");
  const [videoPlatformId, setVideoPlatformId] = useState<(typeof videoPlatforms)[number]["id"]>("vertical");
  const [rewriteModeId, setRewriteModeId] = useState<(typeof rewriteModes)[number]["id"]>("medium");
  const [mainVideoTemplate, setMainVideoTemplate] = useState(mainVideoTemplates[0]);
  const [productVideoFiles, setProductVideoFiles] = useState<LocalImage[]>([]);
  const [referenceVideoFiles, setReferenceVideoFiles] = useState<LocalImage[]>([]);
  const [referenceVideoLink, setReferenceVideoLink] = useState("");
  const [selectedVideoGoals, setSelectedVideoGoals] = useState<string[]>(["换成我的包款", "保留节奏，重写文案"]);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspect, setVideoAspect] = useState(freeVideoAspects[0]);
  const [videoDurationId, setVideoDurationId] = useState<(typeof videoDurationOptions)[number]["id"]>("5");
  const [customVideoDurationSeconds, setCustomVideoDurationSeconds] = useState("5");
  const [musicMode, setMusicMode] = useState<MusicMode>("ai_music");
  const [voiceoverMode, setVoiceoverMode] = useState<VoiceoverMode>("none");
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>("ai_subtitle");
  const [musicAudioUrl, setMusicAudioUrl] = useState("");
  const [voiceoverScript, setVoiceoverScript] = useState("");
  const [voiceoverAudio, setVoiceoverAudio] = useState<UploadedVideoAudio>();
  const [subtitleScript, setSubtitleScript] = useState("");
  const [musicAudio, setMusicAudio] = useState<UploadedVideoAudio>();
  const [audioUploadStatus, setAudioUploadStatus] = useState("");
  const [videoQuality, setVideoQuality] = useState<(typeof directVideoQualities)[number]["id"]>("480p");
  const [customVideoBrief, setCustomVideoBrief] = useState("");
  const [customVideoScript, setCustomVideoScript] = useState("");
  const [customVideoRevision, setCustomVideoRevision] = useState("");
  const [customScriptStatus, setCustomScriptStatus] = useState("");
  const [customPromptWriting, setCustomPromptWriting] = useState<"draft" | "revise" | "">("");
  const [videoJob, setVideoJob] = useState<VideoJobPanelState>();
  const [cancelingVideoJob, setCancelingVideoJob] = useState(false);
  const selectedVideoType = videoTypes.find((item) => item.id === videoTypeId) ?? videoTypes[0];
  const selectedVideoCategory = majorCategoryPresets.find((item) => item.id === selectedVideoCategoryId) ?? majorCategoryPresets[0];
  const selectedVideoPlatform = videoPlatforms.find((item) => item.id === videoPlatformId) ?? videoPlatforms[0];
  const selectedRewriteMode = rewriteModes.find((item) => item.id === rewriteModeId) ?? rewriteModes[1];
  const referenceStrength = referenceStrengthForRewriteMode(rewriteModeId);
  const plannedReferenceProcessingMode = referenceStrength === "heavy" ? "full_video" : referenceStrength === "medium" ? "multi_frame" : "single_frame";
  const plannedReferenceFrameCount = referenceStrength === "medium" ? 3 : referenceStrength === "light" ? 1 : 0;
  const isMainVideo = true;
  const canGenerateVideo = productVideoFiles.length > 0;
  const videoInProgress = videoJob?.status === "running" || videoJob?.status === "submitted";
  const generated = videoJob?.status === "ready";
  const submitted = videoJob?.status === "submitted" || videoJob?.status === "running";
  const videoProgress = videoJob?.progress ?? 0;
  const videoProgressLabel = videoStatusLabel(videoJob?.status, videoProgress, videoJob);
  const selectedVideoDurationSeconds = videoDurationId === "custom"
    ? clampVideoDurationSeconds(Number.parseInt(customVideoDurationSeconds, 10))
    : videoDurationOptions.find((item) => item.id === videoDurationId)?.seconds ?? 5;
  const selectedVideoDurationLabel = `${selectedVideoDurationSeconds}秒`;
  const captionMode = videoAudioSubtitleSummary({ musicMode, voiceoverMode, subtitleMode });
  const generateAudio = shouldGenerateAudio({ musicMode, voiceoverMode });
  const referenceAudioLink = resolvedReferenceAudioLink({
    musicMode,
    voiceoverMode,
    musicAudioUrl,
    musicAudio,
    voiceoverAudio
  });
  const videoSpec = isMainVideo ? `${videoAspectToApiValue(selectedVideoPlatform.spec)} · ${selectedVideoDurationLabel}` : `${videoAspect} · ${selectedVideoDurationLabel}`;
  const previewSource = productVideoFiles[0];
  const previewIsVideo = Boolean(previewSource?.file.type.startsWith("video/"));
  const generatedPreviewUrl = videoJob?.resultUrl ?? videoJob?.previewUrl;
  const generatedPreviewIsVideo = Boolean(videoJob?.resultUrl || videoJob?.sourceType?.startsWith("video/"));
  const hasReferenceVideo = referenceVideoFiles.length > 0 || referenceVideoLink.trim().length > 0;
  const effectiveReferenceProcessingMode = hasReferenceVideo ? plannedReferenceProcessingMode : "none";
  const referenceSourceLabel = referenceVideoFiles.length ? "本地参考视频" : referenceVideoLink.trim() ? "链接参考" : "暂无参考";
  const referenceSourceType = referenceVideoFiles.length && referenceVideoLink.trim() ? "local_and_link" : referenceVideoFiles.length ? "local_upload" : referenceVideoLink.trim() ? "link" : "none";
  const customProductAnalysis = useMemo(() => analyzeCustomVideoProduct(productVideoFiles), [productVideoFiles]);
  const storyboardItems = buildVideoStoryboard({
    videoType: selectedVideoType.label,
    platform: selectedVideoPlatform.label,
    rewriteMode: selectedRewriteMode.label,
    goals: selectedVideoGoals,
    productName: "",
    sellingPoints: "",
    offer: ""
  });
  const requestedVideoMode = typeof window === "undefined" ? undefined : normalizeVideoCreationMode(new URLSearchParams(window.location.search).get("videoMode"));

  function chooseVideoCreationMode(mode: "reference" | "custom") {
    setVideoCreationMode(mode);
    if (typeof window === "undefined") return;
    const nextHref = `/?workspace=video&videoMode=${mode}`;
    if (window.location.pathname === "/" && window.location.search === `?workspace=video&videoMode=${mode}`) return;
    window.history.pushState(
      { dsPortal: true, entranceView: "workbench", workspaceMode: "video", videoCreationMode: mode } satisfies PortalHistoryState,
      "",
      nextHref
    );
  }

  function handleVideoModeCardKey(event: KeyboardEvent<HTMLElement>, mode: "reference" | "custom") {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    chooseVideoCreationMode(mode);
  }

  useEffect(() => {
    productVideoFilesRef.current = productVideoFiles;
  }, [productVideoFiles]);

  useEffect(() => {
    referenceVideoFilesRef.current = referenceVideoFiles;
  }, [referenceVideoFiles]);

  useEffect(() => {
    setVideoCreationMode(requestedVideoMode ?? "choose");
  }, [entranceResetKey, requestedVideoMode]);

  useEffect(() => {
    return () => {
      productVideoFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      referenceVideoFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    const restoreDraft = async () => {
      const draft = readWorkbenchDraft<VideoWorkbenchDraft>(videoWorkbenchDraftStorageKey);
      if (!draft || draft.version !== 1) {
        setVideoCreationMode(requestedVideoMode ?? "choose");
        videoDraftRestoreCompletedRef.current = true;
        return;
      }

      setVideoCreationMode(requestedVideoMode ?? "choose");
      setSelectedVideoCategoryId("bags");
      if (videoTypes.some((item) => item.id === draft.videoTypeId)) setVideoTypeId(draft.videoTypeId as (typeof videoTypes)[number]["id"]);
      if (videoPlatforms.some((item) => item.id === draft.videoPlatformId)) setVideoPlatformId(draft.videoPlatformId as (typeof videoPlatforms)[number]["id"]);
      if (rewriteModes.some((item) => item.id === draft.rewriteModeId)) setRewriteModeId(draft.rewriteModeId as (typeof rewriteModes)[number]["id"]);
      setMainVideoTemplate(draft.mainVideoTemplate || mainVideoTemplates[0]);
      setReferenceVideoLink(draft.referenceVideoLink ?? "");
      setSelectedVideoGoals(Array.isArray(draft.selectedVideoGoals) ? draft.selectedVideoGoals.map((goal) => goal === "换成我的服装" ? "换成我的包款" : goal) : ["换成我的包款", "保留节奏，重写文案"]);
      setVideoPrompt(draft.videoPrompt ?? "");
      setVideoAspect(draft.videoAspect || freeVideoAspects[0]);
      if (videoDurationOptions.some((item) => item.id === draft.videoDurationId)) setVideoDurationId(draft.videoDurationId as (typeof videoDurationOptions)[number]["id"]);
      setCustomVideoDurationSeconds(draft.customVideoDurationSeconds ?? "5");
      setMusicMode(draft.musicMode ?? "ai_music");
      setVoiceoverMode(draft.voiceoverMode ?? "none");
      setSubtitleMode(draft.subtitleMode ?? "ai_subtitle");
      setMusicAudioUrl(draft.musicAudioUrl ?? "");
      setVoiceoverScript(draft.voiceoverScript ?? "");
      setSubtitleScript(draft.subtitleScript ?? "");
      setMusicAudio(draft.musicAudio);
      setVoiceoverAudio(draft.voiceoverAudio);
      if (directVideoQualities.some((item) => item.id === draft.videoQuality)) setVideoQuality(draft.videoQuality as (typeof directVideoQualities)[number]["id"]);
      setCustomVideoBrief(draft.customVideoBrief ?? "");
      setCustomVideoScript(draft.customVideoScript ?? "");
      setCustomVideoRevision(draft.customVideoRevision ?? "");
      setCustomScriptStatus(draft.customScriptStatus ?? "");

      const [restoredProducts, restoredReferences] = await Promise.all([
        restoreLocalImages(draft.productVideoFiles),
        restoreLocalImages(draft.referenceVideoFiles)
      ]);
      if (canceled) return;
      if (restoredProducts.length) setProductVideoFiles(restoredProducts);
      if (restoredReferences.length) setReferenceVideoFiles(restoredReferences);
      videoDraftRestoreCompletedRef.current = true;
    };
    void restoreDraft();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".videoStage, .videoControlRail, .videoResultRail").forEach((element) => {
        element.scrollTop = 0;
      });
      window.scrollTo({ top: 0, left: 0 });
    });
  }, [videoCreationMode]);

  useEffect(() => {
    if (videoJob?.status !== "submitted") return;
    const interval = window.setInterval(() => {
      setVideoJob((current) => {
        if (!current || current.status !== "submitted") return current;
        if (current.progress >= 92) return current;
        const nextProgress = current.progress < 58 ? current.progress + 4 : current.progress < 78 ? current.progress + 3 : current.progress + 1;
        return { ...current, progress: Math.min(92, nextProgress) };
      });
    }, 1400);
    return () => window.clearInterval(interval);
  }, [videoJob?.id, videoJob?.status]);

  useEffect(() => {
    void restoreActiveVideoJob();
  }, []);

  useEffect(() => {
    if (!videoDraftRestoreCompletedRef.current) return;
    const timer = window.setTimeout(() => {
      void (async () => {
        const [persistedProductFiles, persistedReferenceFiles] = await Promise.all([
          persistLocalImages("video-draft:product", productVideoFiles),
          persistLocalImages("video-draft:reference", referenceVideoFiles)
        ]);
        writeWorkbenchDraft(videoWorkbenchDraftStorageKey, {
          version: 1,
          savedAt: new Date().toISOString(),
          videoCreationMode: "choose",
          selectedVideoCategoryId,
          videoTypeId,
          videoPlatformId,
          rewriteModeId,
          mainVideoTemplate,
          referenceVideoLink,
          selectedVideoGoals,
          videoPrompt,
          videoAspect,
          videoDurationId,
          customVideoDurationSeconds,
          musicMode,
          voiceoverMode,
          subtitleMode,
          musicAudioUrl,
          voiceoverScript,
          subtitleScript,
          musicAudio,
          voiceoverAudio,
          videoQuality,
          customVideoBrief,
          customVideoScript,
          customVideoRevision,
          customScriptStatus,
          productVideoFiles: persistedProductFiles,
          referenceVideoFiles: persistedReferenceFiles
        } satisfies VideoWorkbenchDraft);
      })();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [
    customScriptStatus,
    customVideoBrief,
    customVideoDurationSeconds,
    customVideoRevision,
    customVideoScript,
    mainVideoTemplate,
    musicAudio,
    musicAudioUrl,
    musicMode,
    productVideoFiles,
    referenceVideoFiles,
    referenceVideoLink,
    rewriteModeId,
    selectedVideoCategoryId,
    selectedVideoGoals,
    subtitleMode,
    subtitleScript,
    videoAspect,
    videoCreationMode,
    videoDurationId,
    videoPlatformId,
    videoPrompt,
    videoQuality,
    videoTypeId,
    voiceoverAudio,
    voiceoverMode,
    voiceoverScript
  ]);

  useEffect(() => {
    const recover = () => {
      if (document.visibilityState === "visible") void restoreActiveVideoJob();
    };
    window.addEventListener("focus", recover);
    window.addEventListener("pageshow", recover);
    document.addEventListener("visibilitychange", recover);
    return () => {
      window.removeEventListener("focus", recover);
      window.removeEventListener("pageshow", recover);
      document.removeEventListener("visibilitychange", recover);
    };
  }, []);

  useEffect(() => {
    if (!videoJob || (videoJob.status !== "running" && videoJob.status !== "submitted")) return;
    const interval = window.setInterval(() => {
      void refreshVideoJob(videoJob.id);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [videoJob?.id, videoJob?.status]);

  function addVideoFiles(files: FileList | null, target: "product" | "reference") {
    const incoming = Array.from(files ?? []).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (!incoming.length) return;
    const setter = target === "product" ? setProductVideoFiles : setReferenceVideoFiles;
    if (target === "reference") setReferenceVideoLink("");
    setter((current) => [
      ...current,
      ...incoming.slice(0, Math.max(0, 12 - current.length)).map((file) => ({
        id: `${file.name}-${file.lastModified}-${createClientId()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }))
    ]);
  }

  function removeVideoFile(id: string, target: "product" | "reference") {
    const setter = target === "product" ? setProductVideoFiles : setReferenceVideoFiles;
    setter((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function changeReferenceVideoLink(value: string) {
    const extractedUrl = extractFirstHttpUrl(value);
    const nextValue = extractedUrl ?? value;
    setReferenceVideoLink(nextValue);
    if (!nextValue.trim()) return;
    setReferenceVideoFiles((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }

  async function restoreActiveVideoJob() {
    const snapshot = readActiveVideoJob();
    if (snapshot?.id) {
      const recovered = await refreshVideoJob(snapshot.id, snapshot);
      if (recovered) return;
    }

    const response = await fetch("/api/video-jobs").catch(() => undefined);
    if (!response?.ok) return;
    const body = await response.json().catch(() => ({}));
    const jobs = Array.isArray(body.jobs) ? body.jobs as VideoJobView[] : [];
    const active = jobs.find((item) => item.status === "running" || item.status === "submitted");
    if (active) {
      applyRecoveredVideoJob(active);
    } else if (jobs[0]) {
      applyRecoveredVideoJob(jobs[0]);
    }
  }

  async function refreshVideoJob(id: string, fallback?: VideoJobPanelState): Promise<boolean> {
    const response = await fetch(`/api/video-jobs/${id}`).catch(() => undefined);
    const body = await response?.json().catch(() => ({}));
    if (!response?.ok || !body.job) return false;
    applyRecoveredVideoJob(body.job as VideoJobView, fallback);
    return true;
  }

  function applyRecoveredVideoJob(next: VideoJobView, fallback?: VideoJobPanelState) {
    setVideoJob((current) => videoJobStateFromServer(next, current ?? fallback));
    if (next.status === "running" || next.status === "submitted") {
      persistActiveVideoJob(next);
    } else {
      clearActiveVideoJob();
    }
  }

  async function cancelVideoJob() {
    const current = videoJob;
    if (!current || (current.status !== "running" && current.status !== "submitted")) return;
    setCancelingVideoJob(true);
    try {
      const response = await fetch(`/api/video-jobs/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.job) throw new Error(videoApiErrorMessage(body));
      applyRecoveredVideoJob(body.job as VideoJobView, current);
    } catch (error) {
      setVideoJob((latest) => latest?.id === current.id
        ? { ...latest, error: error instanceof Error ? error.message : "取消视频任务失败" }
        : latest);
    } finally {
      setCancelingVideoJob(false);
    }
  }

  function toggleVideoGoal(goal: string) {
    setSelectedVideoGoals((current) => (current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]));
  }

  async function uploadVideoAudioFile(file: File, target: "music" | "voiceover") {
    setAudioUploadStatus("正在上传音频...");
    try {
      const uploaded = await uploadVideoAudioAsset(file);
      if (target === "music") setMusicAudio(uploaded);
      if (target === "voiceover") setVoiceoverAudio(uploaded);
      setAudioUploadStatus("音频已上传");
    } catch (error) {
      setAudioUploadStatus(error instanceof Error ? error.message : "音频上传失败");
    }
  }

  function clearVideoAudio(target: "music" | "voiceover") {
    if (target === "music") setMusicAudio(undefined);
    if (target === "voiceover") setVoiceoverAudio(undefined);
  }

  async function writeCustomVideoScript() {
    if (!productVideoFiles.length) {
      setCustomScriptStatus("请先上传商品图");
      return;
    }
    setCustomPromptWriting("draft");
    setCustomScriptStatus("AI正在读取商品图并代写提示词...");
    try {
      const productImages = await Promise.all(productVideoFiles.slice(0, 3).map((item) => fileToGenerationImageDataUrl(item.file)));
      const result = await requestVideoPromptWriter({
        mode: "draft",
        brief: customVideoBrief,
        productImages: productImages.filter(Boolean),
        productAnalysis: customProductAnalysis,
        platform: selectedVideoPlatform.label,
        videoType: selectedVideoType.label,
        durationSeconds: selectedVideoDurationSeconds,
        outputResolution: videoQuality,
        musicMode,
        voiceoverMode,
        subtitleMode,
        voiceoverScript,
        subtitleScript
      });
      setCustomVideoScript(result.script);
      setCustomScriptStatus(result.summary || "AI已根据商品图生成视频提示词，可继续修改");
    } catch (error) {
      setCustomScriptStatus(error instanceof Error ? error.message : "AI代写失败，请稍后重试或手动填写。");
    } finally {
      setCustomPromptWriting("");
    }
  }

  async function applyCustomScriptRevision() {
    const revision = customVideoRevision.trim();
    if (!revision) return;
    const baseScript = customVideoScript.trim() || buildCustomVideoDirectorScript({
      brief: customVideoBrief,
      productAnalysis: customProductAnalysis,
      platform: selectedVideoPlatform.label,
      videoType: selectedVideoType.label,
      captionMode,
      musicMode,
      voiceoverMode,
      subtitleMode,
      voiceoverScript,
      subtitleScript
    });
    setCustomPromptWriting("revise");
    setCustomScriptStatus("AI正在按修改意见重写完整提示词...");
    try {
      const productImages = await Promise.all(productVideoFiles.slice(0, 3).map((item) => fileToGenerationImageDataUrl(item.file)));
      const result = await requestVideoPromptWriter({
        mode: "revise",
        brief: customVideoBrief,
        currentScript: baseScript,
        revision,
        productImages: productImages.filter(Boolean),
        productAnalysis: customProductAnalysis,
        platform: selectedVideoPlatform.label,
        videoType: selectedVideoType.label,
        durationSeconds: selectedVideoDurationSeconds,
        outputResolution: videoQuality,
        musicMode,
        voiceoverMode,
        subtitleMode,
        voiceoverScript,
        subtitleScript
      });
      setCustomVideoScript(result.script);
      setCustomVideoRevision("");
      setCustomScriptStatus(result.summary || "AI已按补充要求重写完整提示词");
    } catch (error) {
      setCustomScriptStatus(error instanceof Error ? error.message : "AI改写失败，请稍后重试或手动修改。");
    } finally {
      setCustomPromptWriting("");
    }
  }

  async function generateCustomVideoDraft() {
    if (!productVideoFiles.length) return;
    const id = `video-${Date.now().toString(36)}`;
    const source = productVideoFiles[0];
    const finalScript = customVideoScript.trim() || buildCustomVideoDirectorScript({
      brief: customVideoBrief,
      productAnalysis: customProductAnalysis,
      platform: selectedVideoPlatform.label,
      videoType: selectedVideoType.label,
      captionMode,
      musicMode,
      voiceoverMode,
      subtitleMode,
      voiceoverScript,
      subtitleScript
    });
    setCustomVideoScript(finalScript);
    setVideoJob({ id, status: "running", progress: 18, previewUrl: source?.previewUrl, sourceName: source?.file.name, sourceType: source?.file.type });
    try {
      const productImages = await Promise.all(productVideoFiles.slice(0, 3).map((item) => fileToGenerationImageDataUrl(item.file)));
      const aspectRatio = videoAspectToApiValue(selectedVideoPlatform.spec);
      const duration = selectedVideoDurationLabel;
      const response = await fetch("/api/video-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildCustomVideoPrompt({
            script: finalScript,
            productAnalysis: customProductAnalysis,
            platform: selectedVideoPlatform.label,
            videoType: selectedVideoType.label,
            aspectRatio,
            duration,
            captionMode,
            musicMode,
            voiceoverMode,
            subtitleMode,
            voiceoverScript,
            subtitleScript,
            outputQuality: videoQuality.toUpperCase(),
            productImageCount: productImages.filter(Boolean).length
          }),
          images: productImages.filter(Boolean).slice(0, 3),
          aspectRatio,
          outputResolution: videoQuality,
          durationSeconds: selectedVideoDurationSeconds,
          generateAudio,
          metadata: {
            category: selectedVideoCategory.label,
            videoType: `自定义生成-${selectedVideoType.label}`,
            platform: selectedVideoPlatform.label,
            captionMode,
            musicMode,
            voiceoverMode,
            subtitleMode,
            musicAudioUrl: musicMode === "music_url" ? extractFirstHttpUrl(musicAudioUrl) ?? musicAudioUrl.trim() : musicAudio?.publicUrl,
            voiceoverAudioUrl: voiceoverAudio?.publicUrl,
            referenceAudioLink,
            voiceoverScript: voiceoverScript.trim() || undefined,
            subtitleScript: subtitleScript.trim() || undefined,
            outputQuality: videoQuality.toUpperCase(),
            duration,
            rewriteMode: "custom",
            referenceSourceType: "none",
            generationGoals: ["自定义提示词", "商品图生成视频"]
          }
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(videoApiErrorMessage(body));
      applyRecoveredVideoJob(body.job as VideoJobView, {
        id: body.job.id,
        status: "running",
        progress: 18,
        previewUrl: source?.previewUrl,
        sourceName: source?.file.name,
        sourceType: source?.file.type
      });
    } catch (error) {
      setVideoJob({
        id,
        status: "failed",
        progress: 0,
        previewUrl: source?.previewUrl,
        sourceName: source?.file.name,
        sourceType: source?.file.type,
        error: error instanceof Error ? error.message : "视频任务创建失败"
      });
    }
  }

  async function generateVideoDraft() {
    if (!canGenerateVideo) return;
    const id = `video-${Date.now().toString(36)}`;
    const source = productVideoFiles[0];
    setVideoJob({ id, status: "running", progress: 18, previewUrl: source?.previewUrl, sourceName: source?.file.name, sourceType: source?.file.type });
    try {
      const referenceFrameLimit = effectiveReferenceProcessingMode === "multi_frame" ? 3 : effectiveReferenceProcessingMode === "single_frame" ? 1 : 0;
      const productFrameLimit = referenceFrameLimit > 2 ? 1 : referenceFrameLimit > 0 ? 2 : 3;
      const productImages = await Promise.all(productVideoFiles.slice(0, productFrameLimit).map((item) => fileToGenerationImageDataUrl(item.file)));
      const referenceAsset = await resolveReferenceVideoAssetForGeneration({
        sourceFile: referenceVideoFiles[0]?.file,
        referenceLink: referenceVideoLink.trim(),
        processingMode: effectiveReferenceProcessingMode,
        frameCount: referenceFrameLimit
      });
      const referenceImages = referenceFrameLimit > 0
        ? referenceAsset.frameImages
        : [];
      const images = [...productImages, ...referenceImages].filter(Boolean).slice(0, 6);
      const aspectRatio = videoAspectToApiValue(selectedVideoPlatform.spec);
      const duration = selectedVideoDurationLabel;
      const response = await fetch("/api/video-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildVideoPrompt({
            userPrompt: videoPrompt,
            category: selectedVideoCategory.label,
            videoType: selectedVideoType.label,
            platform: selectedVideoPlatform.label,
            template: mainVideoTemplate,
            aspectRatio,
            duration,
            captionMode,
            musicMode,
            voiceoverMode,
            subtitleMode,
            voiceoverScript,
            subtitleScript,
            outputQuality: videoQuality.toUpperCase(),
            rewriteMode: selectedRewriteMode.label,
            referenceStrength,
            referenceProcessingMode: effectiveReferenceProcessingMode,
            goals: selectedVideoGoals,
            productName: "",
            sellingPoints: "",
            audience: "",
            offer: "",
            referenceSource: referenceSourceLabel,
            referenceLink: referenceVideoLink.trim(),
            productAssetCount: productVideoFiles.length,
            productImageCount: productImages.filter(Boolean).length,
            referenceImageCount: referenceImages.filter(Boolean).length,
            storyboardItems
          }),
          images,
          aspectRatio,
          outputResolution: videoQuality,
          durationSeconds: selectedVideoDurationSeconds,
          generateAudio,
          referenceStrength,
          referenceAssetId: referenceAsset.assetId,
          metadata: {
            category: selectedVideoCategory.label,
            videoType: selectedVideoType.label,
            platform: selectedVideoPlatform.label,
            captionMode,
            musicMode,
            voiceoverMode,
            subtitleMode,
            musicAudioUrl: musicMode === "music_url" ? extractFirstHttpUrl(musicAudioUrl) ?? musicAudioUrl.trim() : musicAudio?.publicUrl,
            voiceoverAudioUrl: voiceoverAudio?.publicUrl,
            referenceAudioLink,
            voiceoverScript: voiceoverScript.trim() || undefined,
            subtitleScript: subtitleScript.trim() || undefined,
            outputQuality: videoQuality.toUpperCase(),
            duration,
            rewriteMode: selectedRewriteMode.label,
            referenceSourceType,
            referenceLink: referenceVideoLink.trim() || undefined,
            referenceStrength,
            referenceProcessingMode: effectiveReferenceProcessingMode,
            referenceAssetStatus: hasReferenceVideo ? "resolved" : "resolved",
            resolvedReferenceVideoUrl: referenceAsset.videoUrl,
            referenceFrameCount: referenceImages.filter(Boolean).length,
            referenceUploadStatus: referenceAsset.uploadStatus,
            generationGoals: selectedVideoGoals,
          }
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(videoApiErrorMessage(body));
      }
      applyRecoveredVideoJob(body.job as VideoJobView, {
        id: body.job.id,
        status: "running",
        progress: 18,
        previewUrl: source?.previewUrl,
        sourceName: source?.file.name,
        sourceType: source?.file.type
      });
    } catch (error) {
      setVideoJob({
        id,
        status: "failed",
        progress: 0,
        previewUrl: source?.previewUrl,
        sourceName: source?.file.name,
        sourceType: source?.file.type,
        error: error instanceof Error ? error.message : "视频任务创建失败"
      });
    }
  }

  if (videoCreationMode === "choose") {
    return (
      <main className="mainStage videoStage videoChoiceStage videoChoiceStageFull">
        <div className="videoChoiceHeader">
          <strong>选择视频生成方式，开始你的创作</strong>
          <p>两种生成方式，满足不同创作需求</p>
        </div>
        <div className="videoModeCards">
          <article
            className="videoModeCard"
            onClick={() => chooseVideoCreationMode("reference")}
            onKeyDown={(event) => handleVideoModeCardKey(event, "reference")}
            role="button"
            tabIndex={0}
          >
            <div className="videoModeText">
              <span>参考视频生成箱包短片</span>
              <strong>上传走路、展示或开箱视频，保留运镜节奏，替换为更清晰的箱包商品表达。</strong>
            </div>
            <div className="referenceFlowPreview choiceReferenceVisual" aria-hidden="true">
              <picture className="choiceModePicture">
                <source
                  srcSet="/video-choice-assets/bag-video-choice-reference-glass-600.webp 600w, /video-choice-assets/bag-video-choice-reference-glass-900.webp 900w"
                  sizes="(max-width: 720px) calc(100vw - 64px), 506px"
                  type="image/webp"
                />
                <img
                  className="choiceModeIllustration"
                  alt=""
                  src="/video-choice-assets/bag-video-choice-reference-glass-900.jpg"
                  width={900}
                  height={507}
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <div className="videoModeFooter">
              <p>适合：已有箱包展示视频，希望保留节奏并重塑商品画面</p>
              <button type="button" onClick={(event) => { event.stopPropagation(); chooseVideoCreationMode("reference"); }}>进入此模式 →</button>
            </div>
          </article>

          <article
            className="videoModeCard"
            onClick={() => chooseVideoCreationMode("custom")}
            onKeyDown={(event) => handleVideoModeCardKey(event, "custom")}
            role="button"
            tabIndex={0}
          >
            <div className="videoModeText">
              <span>一句话生成箱包短片</span>
              <strong>输入卖点脚本，自动组织包型特写、持包携带姿态、底部与五金细节和购买氛围。</strong>
            </div>
            <div className="customFlowPreview choicePromptVisual" aria-hidden="true">
              <picture className="choiceModePicture">
                <source
                  srcSet="/video-choice-assets/bag-video-choice-custom-glass-600.webp 600w, /video-choice-assets/bag-video-choice-custom-glass-900.webp 900w"
                  sizes="(max-width: 720px) calc(100vw - 64px), 506px"
                  type="image/webp"
                />
                <img
                  className="choiceModeIllustration"
                  alt=""
                  src="/video-choice-assets/bag-video-choice-custom-glass-900.jpg"
                  width={900}
                  height={507}
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <p className="choiceModeHint">从卖点脚本到完整镜头组</p>
            <div className="videoModeFooter">
              <p>适合：没有参考视频，需要按箱包卖点自动生成镜头</p>
              <button type="button" onClick={(event) => { event.stopPropagation(); chooseVideoCreationMode("custom"); }}>进入此模式 →</button>
            </div>
          </article>
        </div>
        </main>
    );
  }

  if (videoCreationMode === "custom") {
    return (
      <>
        <aside className="controlRail videoControlRail">
          <section>
            <StepTitle index="01" title="视频规格" />
            <div className="videoPlatformGrid">
              {videoPlatforms.map((item) => (
                <button className={videoPlatformId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVideoPlatformId(item.id)}>
                  <strong>{item.label}</strong>
                  <span>{item.spec}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <StepTitle index="02" title="声音" />
            <div className="videoOptionStack">
              <span>背景音乐</span>
              <div className="videoOptionGrid">
                {musicModeOptions.map((item) => (
                  <button className={musicMode === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setMusicMode(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
              {musicMode === "upload_music" ? (
                <div className="videoAudioInputBox">
                  <input accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/x-m4a,.mp3,.wav,.m4a,.aac" ref={musicAudioInputRef} type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadVideoAudioFile(file, "music"); event.currentTarget.value = ""; }} />
                  <button type="button" onClick={() => musicAudioInputRef.current?.click()}>{musicAudio ? "更换音乐" : "上传音乐"}</button>
                  {musicAudio ? <span>{musicAudio.filename}</span> : <span>支持 mp3 / wav / m4a / aac</span>}
                  {musicAudio ? <button type="button" onClick={() => clearVideoAudio("music")}>移除</button> : null}
                </div>
              ) : null}
              {musicMode === "music_url" ? (
                <label className="videoInlineInput">
                  音乐链接
                  <input value={musicAudioUrl} onChange={(event) => setMusicAudioUrl(event.target.value)} placeholder="https://example.com/music.mp3" />
                </label>
              ) : null}
              <span>配音</span>
              <div className="videoOptionGrid">
                {voiceoverModeOptions.map((item) => (
                  <button className={voiceoverMode === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVoiceoverMode(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
              {voiceoverMode === "script_voiceover" ? (
                <label className="videoInlineInput">
                  配音文案
                  <textarea rows={3} value={voiceoverScript} onChange={(event) => setVoiceoverScript(event.target.value)} placeholder="输入希望 AI 配音朗读的文案" />
                </label>
              ) : null}
              {voiceoverMode === "upload_voiceover" ? (
                <div className="videoAudioInputBox">
                  <input accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/x-m4a,.mp3,.wav,.m4a,.aac" ref={voiceoverAudioInputRef} type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadVideoAudioFile(file, "voiceover"); event.currentTarget.value = ""; }} />
                  <button type="button" onClick={() => voiceoverAudioInputRef.current?.click()}>{voiceoverAudio ? "更换配音" : "上传配音"}</button>
                  {voiceoverAudio ? <span>{voiceoverAudio.filename}</span> : <span>支持 mp3 / wav / m4a / aac</span>}
                  {voiceoverAudio ? <button type="button" onClick={() => clearVideoAudio("voiceover")}>移除</button> : null}
                </div>
              ) : null}
              {audioUploadStatus ? <em>{audioUploadStatus}</em> : null}
            </div>
          </section>
          <section>
            <StepTitle index="03" title="字幕" />
            <div className="videoOptionStack">
              <div className="videoOptionGrid">
                {subtitleModeOptions.map((item) => (
                  <button className={subtitleMode === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setSubtitleMode(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
              {subtitleMode === "script_subtitle" ? (
                <label className="videoInlineInput">
                  字幕文案
                  <textarea rows={3} value={subtitleScript} onChange={(event) => setSubtitleScript(event.target.value)} placeholder="输入希望出现在视频中的字幕文案" />
                </label>
              ) : null}
            </div>
          </section>
          <section>
            <StepTitle index="04" title="视频输出" />
            <div className="videoOutputQuality">
              <span>视频输出质量</span>
              <div className="videoQualityGrid">
                {directVideoQualities.map((item) => (
                  <button className={videoQuality === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVideoQuality(item.id)}>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </button>
                ))}
              </div>
              <span>视频时长</span>
              <div className="videoQualityGrid videoDurationGrid">
                {videoDurationOptions.map((item) => (
                  <button className={videoDurationId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVideoDurationId(item.id)}>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </button>
                ))}
              </div>
              {videoDurationId === "custom" ? (
                <label className="videoDurationCustomInput">
                  自定义秒数
                  <input
                    inputMode="numeric"
                    max={15}
                    min={1}
                    onChange={(event) => setCustomVideoDurationSeconds(event.target.value)}
                    type="number"
                    value={customVideoDurationSeconds}
                  />
                </label>
              ) : null}
              <em>草稿默认按真实 480P / 5 秒提交，确认 OK 后再走真实高清任务。</em>
            </div>
          </section>
        </aside>

        <main className="mainStage videoStage videoSubStage">
          <h2 className="videoPageHeading">一句话生成视频</h2>
          <button className="videoModeSwitchButton" type="button" onClick={() => chooseVideoCreationMode("reference")}>切换到参考视频生成</button>

          <section className="videoUploadStack customVideoBuilder">
            <div className="videoUploadBlock">
              <VideoDropZone
                accept="image/png,image/jpeg,image/webp"
                files={productVideoFiles}
                inputRef={customProductInputRef}
                label="点击或拖拽上传商品图"
                note="必填，可上传多张包款商品图、底部与五金图、持包图或细节图"
                onAdd={(files) => addVideoFiles(files, "product")}
                onRemove={(id) => removeVideoFile(id, "product")}
              />
            </div>
          </section>

          <section className="videoPromptBox videoScriptBox customPromptWriter">
            <strong>一句话，AI代写生视频提示词</strong>
            <textarea
              onChange={(event) => setCustomVideoBrief(event.target.value)}
              placeholder="简单描述想要什么样的视频，例如：高级棚拍感，持包展示，适合抖音投放，突出包身、底部与五金和容量感。"
              rows={3}
              value={customVideoBrief}
            />
            <div className="customScriptActions">
              <button className="generateButton" disabled={!productVideoFiles.length || Boolean(customPromptWriting)} type="button" onClick={() => void writeCustomVideoScript()}>
                {customPromptWriting === "draft" ? "AI代写中..." : "AI代写提示词"}
              </button>
              <span>{customScriptStatus || "上传商品图后，输入一句需求即可生成提示词。"}</span>
            </div>
          </section>

          <label className="videoPromptBox videoScriptBox customScriptEditor">
            <span className="videoPromptBoxTitleCentered">AI生成的提示词</span>
            <textarea
              onChange={(event) => setCustomVideoScript(event.target.value)}
              placeholder="AI代写后会在这里显示完整的视频提示词，你也可以直接手动编辑。"
              rows={10}
              value={customVideoScript}
            />
          </label>

          <div className="videoRevisionRow">
            <label className="videoPromptBox videoScriptBox">
              <span className="videoPromptBoxTitleCentered">补充或修改要求</span>
              <textarea
                onChange={(event) => setCustomVideoRevision(event.target.value)}
                placeholder="对上面的提示词哪里不满意，可以继续补充。例如：开头更安静，增加底部与五金纹路特写，结尾更像品牌广告。"
                rows={3}
                value={customVideoRevision}
              />
            </label>
            <button className="downloadVideoButton" disabled={!customVideoRevision.trim() || Boolean(customPromptWriting) || !productVideoFiles.length} type="button" onClick={() => void applyCustomScriptRevision()}>
              {customPromptWriting === "revise" ? "AI改写中..." : "提交修改意见"}
            </button>
          </div>

          <div className="actionRow">
            <button className="generateButton" disabled={!productVideoFiles.length || videoInProgress} type="button" onClick={generateCustomVideoDraft}>
              {videoInProgress ? "视频任务进行中" : "按文案生成视频"}
            </button>
          </div>
        </main>

        {renderVideoResultRail({
          videoJob,
          generated,
          submitted,
          videoProgress,
          videoProgressLabel,
          productVideoFiles,
          videoSpec,
          videoQuality: `${videoQuality.toUpperCase()} · ${selectedVideoDurationLabel}`,
          generatedPreviewUrl,
          generatedPreviewIsVideo,
          selectedVideoTypeLabel: selectedVideoType.label,
          captionMode,
          upscaleVideoQualities,
          videoInProgress,
          cancelingVideoJob,
          onCancelVideoJob: cancelVideoJob,
          videoCreationMode
        })}
      </>
    );
  }

  return (
    <>
      <aside className="controlRail videoControlRail">
        <section>
          <StepTitle index="01" title="视频规格" />
          <div className="videoPlatformGrid">
            {videoPlatforms.map((item) => (
              <button className={videoPlatformId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVideoPlatformId(item.id)}>
                <strong>{item.label}</strong>
                <span>{item.spec}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <StepTitle index="02" title="参考方式" />
          <div className="rewriteModeList">
            {rewriteModes.map((item) => (
              <button className={rewriteModeId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setRewriteModeId(item.id)}>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <StepTitle index="03" title="想改什么" />
          <div className="videoGoalGrid">
            {generationGoals.map((item) => (
              <button className={selectedVideoGoals.includes(item) ? "active" : ""} key={item} type="button" onClick={() => toggleVideoGoal(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section>
          <StepTitle index="04" title="声音" />
          <div className="videoOptionStack">
            <span>背景音乐</span>
            <div className="videoOptionGrid">
              {musicModeOptions.map((item) => (
                <button className={musicMode === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setMusicMode(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            {musicMode === "upload_music" ? (
              <div className="videoAudioInputBox">
                <input accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/x-m4a,.mp3,.wav,.m4a,.aac" ref={musicAudioInputRef} type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadVideoAudioFile(file, "music"); event.currentTarget.value = ""; }} />
                <button type="button" onClick={() => musicAudioInputRef.current?.click()}>{musicAudio ? "更换音乐" : "上传音乐"}</button>
                {musicAudio ? <span>{musicAudio.filename}</span> : <span>支持 mp3 / wav / m4a / aac</span>}
                {musicAudio ? <button type="button" onClick={() => clearVideoAudio("music")}>移除</button> : null}
              </div>
            ) : null}
            {musicMode === "music_url" ? (
              <label className="videoInlineInput">
                音乐链接
                <input value={musicAudioUrl} onChange={(event) => setMusicAudioUrl(event.target.value)} placeholder="https://example.com/music.mp3" />
              </label>
            ) : null}
            <span>配音</span>
            <div className="videoOptionGrid">
              {voiceoverModeOptions.map((item) => (
                <button className={voiceoverMode === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVoiceoverMode(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            {voiceoverMode === "script_voiceover" ? (
              <label className="videoInlineInput">
                配音文案
                <textarea rows={3} value={voiceoverScript} onChange={(event) => setVoiceoverScript(event.target.value)} placeholder="输入希望 AI 配音朗读的文案" />
              </label>
            ) : null}
            {voiceoverMode === "upload_voiceover" ? (
              <div className="videoAudioInputBox">
                <input accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/x-m4a,.mp3,.wav,.m4a,.aac" ref={voiceoverAudioInputRef} type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadVideoAudioFile(file, "voiceover"); event.currentTarget.value = ""; }} />
                <button type="button" onClick={() => voiceoverAudioInputRef.current?.click()}>{voiceoverAudio ? "更换配音" : "上传配音"}</button>
                {voiceoverAudio ? <span>{voiceoverAudio.filename}</span> : <span>支持 mp3 / wav / m4a / aac</span>}
                {voiceoverAudio ? <button type="button" onClick={() => clearVideoAudio("voiceover")}>移除</button> : null}
              </div>
            ) : null}
            {audioUploadStatus ? <em>{audioUploadStatus}</em> : null}
          </div>
        </section>
        <section>
          <StepTitle index="05" title="字幕" />
          <div className="videoOptionStack">
            <div className="videoOptionGrid">
              {subtitleModeOptions.map((item) => (
                <button className={subtitleMode === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setSubtitleMode(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            {subtitleMode === "script_subtitle" ? (
              <label className="videoInlineInput">
                字幕文案
                <textarea rows={3} value={subtitleScript} onChange={(event) => setSubtitleScript(event.target.value)} placeholder="输入希望出现在视频中的字幕文案" />
              </label>
            ) : null}
          </div>
        </section>
        <section>
          <StepTitle index="06" title="视频输出" />
          <div className="videoOutputQuality">
            <span>视频输出质量</span>
              <div className="videoQualityGrid">
                {directVideoQualities.map((item) => (
                  <button className={videoQuality === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVideoQuality(item.id)}>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </button>
                ))}
              </div>
            <span>视频时长</span>
            <div className="videoQualityGrid videoDurationGrid">
              {videoDurationOptions.map((item) => (
                <button className={videoDurationId === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setVideoDurationId(item.id)}>
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </button>
              ))}
            </div>
            {videoDurationId === "custom" ? (
              <label className="videoDurationCustomInput">
                自定义秒数
                <input
                  inputMode="numeric"
                  max={15}
                  min={1}
                  onChange={(event) => setCustomVideoDurationSeconds(event.target.value)}
                  type="number"
                  value={customVideoDurationSeconds}
                />
              </label>
            ) : null}
            <em>草稿默认按真实 480P / 5 秒提交，确认 OK 后再走真实高清任务。</em>
          </div>
        </section>
      </aside>

      <main className="mainStage videoStage videoSubStage">
        <h2 className="videoPageHeading">参考视频生成</h2>
        <button className="videoModeSwitchButton" type="button" onClick={() => chooseVideoCreationMode("custom")}>切换到自定义生成视频</button>

        <section className="videoUploadStack">
          <div className="videoUploadBlock">
            <strong>上传商品素材</strong>
            <VideoDropZone
              files={productVideoFiles}
              inputRef={productVideoInputRef}
              label="上传多件箱包素材：包款 / 包装盒 / 底部与五金 / 搭配配件"
              note="必填，支持多件箱包素材；系统会识别包款、包身、底部与五金和搭配元素，并按参考视频的展示结构生成。"
              onAdd={(files) => addVideoFiles(files, "product")}
              onRemove={(id) => removeVideoFile(id, "product")}
            />
          </div>
          <div className="videoReferenceBlock">
            <strong>参考视频（二选一）</strong>
            <div className="videoReferenceChoiceGrid">
              <VideoDropZone
                files={referenceVideoFiles}
                inputRef={referenceVideoInputRef}
                label="上传参考视频"
                note={referenceVideoLink.trim() ? "已使用链接参考，上传会自动清空链接" : "上传你想参考的短视频，系统会按当前参考强度处理。"}
                onAdd={(files) => addVideoFiles(files, "reference")}
                onRemove={(id) => removeVideoFile(id, "reference")}
              />
              <label className="videoReferenceLinkBox">
                <span>粘贴参考视频链接</span>
                <input
                  onChange={(event) => changeReferenceVideoLink(event.target.value)}
                  placeholder="抖音 / 快手 / 小红书 / 视频号"
                  value={referenceVideoLink}
                />
                <em>{referenceVideoFiles.length ? "已上传参考视频，输入链接会自动清空本地参考。" : "抖音/快手链接会先进入自建解析；未解析出视频文件前不会提交或扣参考费用。"}</em>
                {referenceVideoLink.trim() ? <strong>使用链接参考</strong> : null}
              </label>
            </div>
          </div>
        </section>

        <label className="videoPromptBox videoScriptBox">
          补充要求（选填）
          <textarea
            onChange={(event) => setVideoPrompt(event.target.value)}
            placeholder="例如：开头更强种草感，持包动作不要夸张，底部与五金回弹和包身材质要多给特写。"
            rows={4}
            value={videoPrompt}
          />
        </label>

        <div className="videoOriginalityNote">
          参考规则：商品素材决定商品本身，参考视频决定展示结构和节奏；不主动新增参考中没有的人物、口播、走秀或密集字幕。
          {referenceStrength !== "heavy" && hasReferenceVideo ? " 当前不是完整视频参考，如需贴近动作/运镜请切换重度参考。" : ""}
        </div>

        <div className="actionRow">
          <button className="generateButton" disabled={!canGenerateVideo || videoInProgress} type="button" onClick={generateVideoDraft}>
            {!canGenerateVideo ? "请先上传商品素材" : videoInProgress ? "视频任务进行中" : "提交视频生成任务"}
          </button>
        </div>
      </main>

        {renderVideoResultRail({
        videoJob,
        generated,
        submitted,
        videoProgress,
        videoProgressLabel,
        productVideoFiles,
        videoSpec,
        videoQuality: `${videoQuality.toUpperCase()} · ${selectedVideoDurationLabel}`,
        generatedPreviewUrl,
        generatedPreviewIsVideo,
        selectedVideoTypeLabel: selectedVideoType.label,
        captionMode,
        upscaleVideoQualities,
        videoInProgress,
        cancelingVideoJob,
        onCancelVideoJob: cancelVideoJob,
        videoCreationMode
      })}
    </>
  );
}

function SpecButton({ active, spec, onClick }: { active: boolean; spec: PlatformSpecPreset; onClick: () => void }) {
  return (
    <button className={active ? "specButton specCard active" : "specButton specCard"} type="button" onClick={onClick}>
      <strong>{spec.label}</strong>
      <span>{spec.assetGroup} · {spec.targetWidth}x{spec.targetHeight}</span>
    </button>
  );
}

function renderVideoResultRail(input: {
  videoJob?: VideoJobPanelState;
  generated: boolean;
  submitted: boolean;
  videoProgress: number;
  videoProgressLabel: string;
  productVideoFiles: LocalImage[];
  videoSpec: string;
  videoQuality: string;
  generatedPreviewUrl?: string;
  generatedPreviewIsVideo: boolean;
  selectedVideoTypeLabel: string;
  captionMode: string;
  upscaleVideoQualities: ReadonlyArray<{ id: string; label: string }>;
  videoInProgress: boolean;
  cancelingVideoJob: boolean;
  onCancelVideoJob: () => void;
  videoCreationMode: "reference" | "custom";
}) {
  const retrying = isRetryingVideoJob(input.videoJob);
  return (
    <aside className="resultRail videoResultRail">
      <div className="queueCard">
        <span>视频任务状态</span>
        <strong className="videoQueueStatusText">{input.videoJob ? input.videoProgressLabel : "等待创建视频任务"}</strong>
        <div className="queueMeta">
          <div className="queueStat"><b>{input.videoJob?.status === "running" || input.videoJob?.status === "submitted" ? 1 : 0}</b><small>生成中</small></div>
          <div className="queueStat"><b>{input.submitted || input.generated ? 1 : 0}</b><small>已提交</small></div>
          <div className="queueStat"><b>{input.productVideoFiles.length}</b><small>商品素材</small></div>
        </div>
        <div className="progressBar"><i style={{ width: `${input.videoProgress}%` }} /></div>
        <div className="videoProgressStatus">
          <span>{input.videoJob ? `${input.videoProgress}%` : "0%"}</span>
          <strong>{input.videoJob ? input.videoProgressLabel : "上传商品素材后开始排队"}</strong>
        </div>
      </div>

      <div className="resultPanel">
        <div className="panelHeader">
          <span>视频生成结果</span>
          <strong>{input.videoSpec} · {input.videoQuality} · 草稿预览</strong>
        </div>
        {input.generated && input.generatedPreviewUrl ? (
          <div className="videoResultPreview">
            {input.generatedPreviewIsVideo ? (
              <video controls playsInline src={input.generatedPreviewUrl} />
            ) : (
              <img alt="AI商品短视频草稿预览" src={input.generatedPreviewUrl} />
            )}
            <span>{input.selectedVideoTypeLabel} · {input.captionMode}</span>
          </div>
        ) : (
          <div className={`videoResultPlaceholder ${input.videoCreationMode === "custom" ? "customVideoResultPlaceholder" : "referenceVideoResultPlaceholder"}`}>
            <strong>{retrying ? "视频正在排队重试" : input.videoJob?.status === "running" ? "正在提交视频任务" : input.submitted ? "视频正在排队生成" : input.videoJob?.status === "failed" ? "视频任务创建失败" : input.videoJob?.status === "canceled" ? "视频任务已取消" : "生成后在这里显示视频预览"}</strong>
            <span>{retrying ? `视频供应商繁忙，系统会自动重试。${input.videoJob?.nextAttemptAt ? `下次重试：${formatDateTime(input.videoJob.nextAttemptAt)}` : ""}` : input.videoJob?.status === "running" ? "正在整理商品素材和视频提示词。" : input.submitted ? `${input.videoProgressLabel}，请稍候查看结果。` : input.videoJob?.status === "failed" ? input.videoJob.error : input.videoJob?.status === "canceled" ? "冻结积分已释放。" : "上传商品素材后点击生成。"}</span>
          </div>
        )}
        {input.videoInProgress ? (
          <button className="cancelVideoTaskButton" disabled={input.cancelingVideoJob} type="button" onClick={input.onCancelVideoJob}>
            {input.cancelingVideoJob ? "正在取消任务" : "取消任务"}
          </button>
        ) : null}
        <div className="downloadActionWithHint">
          <button className="downloadVideoButton" disabled={!input.generated || !input.generatedPreviewUrl} type="button" onClick={() => {
            if (input.generatedPreviewUrl) void saveUrlAsFile(input.generatedPreviewUrl, buildVideoDownloadName(input.videoJob));
          }}>直接导出视频</button>
          {input.generated && input.generatedPreviewUrl ? <em className="downloadRetentionHint">请及时下载，系统仅保存24小时</em> : null}
        </div>
        <div className="videoUpscaleResultBox">
          <span>高清输出</span>
          <div>
            {input.upscaleVideoQualities.map((item) => input.generated && input.videoJob?.id ? (
              <a href={`/video-upscale?source=videoJob&jobId=${encodeURIComponent(input.videoJob.id)}&target=${encodeURIComponent(item.id)}&returnMode=${input.videoCreationMode}`} key={item.id}>
                {item.label}
              </a>
            ) : (
              <button disabled key={item.id} type="button">{item.label}</button>
            ))}
          </div>
          <em>会进入独立高清输出工作台，单独创建任务、记录积分和成本。</em>
          <a className="downloadVideoButton" href={`/video-upscale?returnMode=${input.videoCreationMode}`}>
            视频高清转换器
          </a>
        </div>
      </div>
      <div className="recordShortcutCard videoRecordShortcutCard">
        <span>视频生成记录</span>
        <strong>查看最近保留的视频任务和成品</strong>
        <a href="/generation-records?tab=videos">进入记录</a>
      </div>
    </aside>
  );
}

function normalizeVideoCreationMode(value: string | null): "reference" | "custom" | undefined {
  if (value === "reference" || value === "custom") return value;
  return undefined;
}

function VideoDropZone({
  accept = "image/png,image/jpeg,image/webp,video/mp4,video/quicktime",
  files,
  inputRef,
  label,
  note,
  onAdd,
  onRemove
}: {
  accept?: string;
  files: LocalImage[];
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  note: string;
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={files.length ? "videoDropZone hasFiles" : "videoDropZone"}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onAdd(event.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        accept={accept}
        multiple
        onChange={(event) => onAdd(event.target.files)}
        type="file"
      />
      <strong>{label}</strong>
      <span>{note}</span>
      {files.length ? (
        <div className="videoAssetRail" aria-label={`${label}素材列表`}>
          {files.map((item) => (
            <div key={item.id}>
              {item.file.type.startsWith("image/") ? <img alt={item.file.name} src={item.previewUrl} /> : <span>VIDEO</span>}
              <button
                aria-label={`删除${item.file.name}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(item.id);
                }}
              >
                −
              </button>
            </div>
          ))}
        </div>
      ) : (
        <button type="button">选择素材</button>
      )}
    </div>
  );
}

function StepTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="stepTitle">
      <span>{index}</span>
      <h3>{title}</h3>
    </div>
  );
}

function DisclosureHeader({
  actionLabel,
  countText,
  expanded,
  iconSrc,
  onAction,
  onToggle,
  title
}: {
  actionLabel?: string;
  countText: string;
  expanded: boolean;
  iconSrc?: string;
  onAction?: () => void;
  onToggle: () => void;
  title: string;
}) {
  return (
    <div className="disclosureHeader">
      <button aria-expanded={expanded} className="disclosureToggle" type="button" onClick={onToggle}>
        <span>{expanded ? "⌃" : "⌄"}</span>
        <strong>{title}</strong>
        {iconSrc ? <img alt="" className="disclosureHeaderIcon" src={iconSrc} /> : null}
        <em>{countText}</em>
      </button>
      {actionLabel && onAction ? (
        <button className="miniSelectButton" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SummaryItem({
  index,
  label,
  value,
  editor,
  open,
  onOpen,
  onClose
}: {
  index: string;
  label: string;
  value: string;
  editor?: ReactNode;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  return (
    <div
      aria-expanded={editor ? Boolean(open) : undefined}
      className={open ? "summaryItem open" : "summaryItem"}
      onClick={editor ? onOpen : undefined}
      onFocus={onOpen}
      onKeyDown={(event) => {
        if (!editor) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      role={editor ? "button" : undefined}
      tabIndex={0}
    >
      <i>{index}</i>
      <div className="summaryItemBody">
        <span>{label}</span>
        <strong>{value || "未选择"}</strong>
      </div>
      {editor ? (
        <div className="summaryPopover" onClick={(event) => event.stopPropagation()}>
          <header>
            <span>{index}</span>
            <strong>{label}</strong>
          </header>
          {editor}
        </div>
      ) : null}
    </div>
  );
}

function VideoDevelopmentPlaceholder() {
  return (
    <section className="videoDevelopmentShell" aria-label="短视频生成开发中">
      <div className="videoDevelopmentBackdrop" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="videoDevelopmentCard">
        <span>D·SHOP Video</span>
        <strong>视频生成开发中...</strong>
        <em>当前版面已保留，功能建设完成后开放。</em>
      </div>
    </section>
  );
}

function UploadGlyph({ majorCategoryId: _majorCategoryId }: { majorCategoryId: MajorCategoryId }) {
  return (
    <svg aria-hidden="true" className="uploadGlyph" viewBox="0 0 64 64">
      <path d="M23 22v-4a9 9 0 0 1 18 0v4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.4" />
      <path d="M18 27c0-6.1 4.9-11 11-11h6c6.1 0 11 4.9 11 11v23c0 2.2-1.8 4-4 4H22c-2.2 0-4-1.8-4-4V27Z" fill="rgba(47, 128, 237, 0.08)" stroke="currentColor" strokeLinejoin="round" strokeWidth="3.4" />
      <path d="M23 31h18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M23 40h18v11H23z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="3" />
      <path d="M18 31l-5 6v12M46 31l5 6v12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" opacity=".72" />
      <path d="M29 23h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function fileToGenerationImageDataUrl(file: File): Promise<string> {
  if (file.type.startsWith("image/")) return fileToDataUrl(file);
  if (!file.type.startsWith("video/")) return "";
  return videoFileToFrameDataUrl(file);
}

async function fileToGenerationImageDataUrls(file: File, count: number): Promise<string[]> {
  const frameCount = Math.max(1, Math.min(5, Math.trunc(count)));
  if (file.type.startsWith("image/")) return [await fileToDataUrl(file)];
  if (!file.type.startsWith("video/")) return [];
  return videoFileToFrameDataUrls(file, frameCount);
}

function videoFileToFrameDataUrl(file: File): Promise<string> {
  return videoFileToFrameDataUrls(file, 1).then((frames) => frames[0] ?? "");
}

function videoFileToFrameDataUrls(file: File, count: number): Promise<string[]> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const cleanup = () => URL.revokeObjectURL(url);
    const frames: string[] = [];
    let pendingTimes: number[] = [];
    let currentIndex = 0;
    const capture = () => {
      const width = video.videoWidth || 720;
      const height = video.videoHeight || 1280;
      const maxSize = 720;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        cleanup();
        resolve(frames);
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", 0.78));
      currentIndex += 1;
      if (currentIndex >= pendingTimes.length) {
        cleanup();
        resolve(frames);
        return;
      }
      video.currentTime = pendingTimes[currentIndex];
    };
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.onerror = () => {
      cleanup();
      resolve(frames);
    };
    video.onloadeddata = () => {
      if (Number.isFinite(video.duration) && video.duration > 1) {
        pendingTimes = frameTimesForDuration(video.duration, count);
        video.currentTime = pendingTimes[0] ?? Math.min(1, video.duration / 3);
        return;
      }
      pendingTimes = [0];
      capture();
    };
    video.onseeked = capture;
    video.src = url;
  });
}

function videoUrlToFrameDataUrls(url: string, count: number): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const frames: string[] = [];
    let pendingTimes: number[] = [];
    let currentIndex = 0;
    const capture = () => {
      const width = video.videoWidth || 720;
      const height = video.videoHeight || 1280;
      const maxSize = 720;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(frames);
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", 0.78));
      currentIndex += 1;
      if (currentIndex >= pendingTimes.length) {
        resolve(frames);
        return;
      }
      video.currentTime = pendingTimes[currentIndex];
    };
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.onerror = () => resolve(frames);
    video.onloadeddata = () => {
      if (Number.isFinite(video.duration) && video.duration > 1) {
        pendingTimes = frameTimesForDuration(video.duration, count);
        video.currentTime = pendingTimes[0] ?? Math.min(1, video.duration / 3);
        return;
      }
      pendingTimes = [0];
      capture();
    };
    video.onseeked = capture;
    video.src = url;
  });
}

async function resolveReferenceVideoAssetForGeneration(input: {
  sourceFile?: File;
  referenceLink: string;
  processingMode: "none" | "single_frame" | "multi_frame" | "full_video";
  frameCount: number;
}): Promise<{ assetId?: string; videoUrl?: string; frameImages: string[]; uploadStatus?: string }> {
  if (input.processingMode === "none") return { frameImages: [] };

  if (input.sourceFile) {
    if (input.processingMode === "full_video") {
      const uploaded = await uploadReferenceVideoAsset(input.sourceFile);
      return {
        assetId: uploaded.id,
        videoUrl: uploaded.publicUrl,
        frameImages: [],
        uploadStatus: "uploaded"
      };
    }
    return {
      frameImages: await fileToGenerationImageDataUrls(input.sourceFile, input.frameCount),
      uploadStatus: "frame_extracted"
    };
  }

  if (input.referenceLink) {
    const resolved = await resolveReferenceVideoLink(input.referenceLink);
    if (input.processingMode === "full_video") {
      return {
        assetId: resolved.id,
        videoUrl: resolved.publicUrl,
        frameImages: [],
        uploadStatus: "resolved_from_link"
      };
    }
    return {
      assetId: resolved.id,
      frameImages: await videoUrlToFrameDataUrls(resolved.localUrl, input.frameCount),
      uploadStatus: "resolved_and_frame_extracted"
    };
  }

  return { frameImages: [] };
}

async function uploadReferenceVideoAsset(file: File): Promise<{ id: string; publicUrl: string; localUrl: string }> {
  const formData = new FormData();
  formData.append("video", file);
  const response = await fetch("/api/video-reference-assets", {
    method: "POST",
    body: formData
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(referenceAssetApiErrorMessage(body));
  return referenceAssetFromBody(body);
}

async function resolveReferenceVideoLink(url: string): Promise<{ id: string; publicUrl: string; localUrl: string }> {
  const resolvedUrl = extractFirstHttpUrl(url) ?? url.trim();
  const response = await fetch("/api/video-reference-assets/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: resolvedUrl })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(referenceAssetApiErrorMessage(body));
  return referenceAssetFromBody(body);
}

async function uploadVideoAudioAsset(file: File): Promise<UploadedVideoAudio> {
  const formData = new FormData();
  formData.append("audio", file);
  const response = await fetch("/api/video-audio-assets", {
    method: "POST",
    body: formData
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(videoAudioApiErrorMessage(body));
  return videoAudioAssetFromBody(body);
}

type VideoPromptWriterRequest = {
  mode: "draft" | "revise";
  brief?: string;
  currentScript?: string;
  revision?: string;
  productImages: string[];
  productAnalysis: ReturnType<typeof analyzeCustomVideoProduct>;
  platform: string;
  videoType: string;
  durationSeconds: number;
  outputResolution: "480p" | "720p";
  musicMode: MusicMode;
  voiceoverMode: VoiceoverMode;
  subtitleMode: SubtitleMode;
  voiceoverScript: string;
  subtitleScript: string;
};

async function requestVideoPromptWriter(input: VideoPromptWriterRequest): Promise<{ script: string; summary: string; model?: string; providerUsage?: Record<string, unknown>; source: "ai" }> {
  if (!input.productImages.length) throw new Error("请先上传可识别的商品图片。");
  const response = await fetch("/api/video-prompt-writer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(videoPromptWriterApiErrorMessage(body));
  if (typeof body?.script !== "string" || !body.script.trim()) {
    throw new Error("AI代写返回内容为空，请稍后重试。");
  }
  return {
    script: body.script,
    summary: typeof body.summary === "string" ? body.summary : "",
    model: typeof body.model === "string" ? body.model : undefined,
    providerUsage: body.providerUsage && typeof body.providerUsage === "object" ? body.providerUsage as Record<string, unknown> : undefined,
    source: "ai"
  };
}

function extractFirstHttpUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s，。；;、]+/i);
  return match?.[0]?.replace(/[，。!！）)\]]+$/g, "");
}

function referenceAssetFromBody(body: unknown): { id: string; publicUrl: string; localUrl: string } {
  const payload = body as { asset?: { id?: unknown; publicUrl?: unknown; localUrl?: unknown }; reference?: { asset?: { id?: unknown; publicUrl?: unknown; localUrl?: unknown } } };
  const asset = payload.asset ?? payload.reference?.asset;
  if (typeof asset?.id === "string" && typeof asset.publicUrl === "string" && typeof asset.localUrl === "string") {
    return { id: asset.id, publicUrl: asset.publicUrl, localUrl: asset.localUrl };
  }
  throw new Error("参考视频处理失败。");
}

function videoAudioAssetFromBody(body: unknown): UploadedVideoAudio {
  const payload = body as { asset?: { id?: unknown; filename?: unknown; publicUrl?: unknown; localUrl?: unknown } };
  const asset = payload.asset;
  if (typeof asset?.id === "string" && typeof asset.filename === "string" && typeof asset.publicUrl === "string" && typeof asset.localUrl === "string") {
    return { id: asset.id, filename: asset.filename, publicUrl: asset.publicUrl, localUrl: asset.localUrl };
  }
  throw new Error("音频上传失败。");
}

function referenceAssetApiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "参考视频处理失败。";
  const payload = body as { message?: unknown; error?: unknown };
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  return "参考视频处理失败。";
}

function videoAudioApiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "音频上传失败。";
  const payload = body as { message?: unknown; error?: unknown };
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  return "音频上传失败。";
}

function videoPromptWriterApiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "AI代写失败，请稍后重试或手动填写。";
  const payload = body as { message?: unknown; error?: unknown };
  if (typeof payload.message === "string") return payload.message;
  if (payload.error === "video_prompt_writer_not_configured") return "AI提示词代写模型未配置，请先配置模型后再使用。";
  if (payload.error === "invalid_video_prompt_writer_request") return "AI代写参数不完整，请检查商品图和修改意见。";
  if (payload.error === "authentication_required") return "请先登录后再使用AI代写。";
  if (typeof payload.error === "string") return payload.error;
  return "AI代写失败，请稍后重试或手动填写。";
}

function frameTimesForDuration(duration: number, count: number): number[] {
  const safeDuration = Math.max(0.1, duration);
  if (count <= 1) return [Math.min(1, safeDuration / 3)];
  const anchors = count === 2 ? [0.25, 0.75] : count === 3 ? [0.12, 0.5, 0.88] : [0.1, 0.35, 0.6, 0.85, 0.95];
  return anchors.slice(0, count).map((anchor) => Math.min(Math.max(0, safeDuration * anchor), Math.max(0, safeDuration - 0.08)));
}

async function fileToCompactDataUrl(file: File): Promise<string> {
  const source = await fileToDataUrl(file);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 420;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(source);
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => resolve(source);
    image.src = source;
  });
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, payload] = dataUrl.split(",", 2);
  const mimeType = header.match(/^data:([^;]+);base64$/)?.[1] ?? "image/jpeg";
  const binary = atob(payload ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], filename, { type: mimeType });
}

function createClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function buildCustomStylePrompt(filename: string): string {
  return [
    `Use the saved reference style derived from ${filename}.`,
    "Reverse-engineer and preserve its visual direction: color palette, lighting mood, camera angle, background material, composition rhythm, commercial polish and post-production texture.",
    "Apply only the style language to the new product image.",
    "Do not copy unrelated objects from the reference image, do not alter the uploaded product identity, logo, print, structure, color blocking, pattern, material or silhouette."
  ].join(" ");
}

function uploadedReferenceStyleLabel(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  const normalized = base ? `参考图风格：${base}` : "参考图风格";
  return normalized.length > 40 ? `${normalized.slice(0, 37)}...` : normalized;
}

function customStylePromptForSubmission(prefix: string, prompt: string): string {
  const cleanPrefix = prefix.trim();
  const cleanPrompt = prompt.trim();
  const separator = cleanPrefix ? " " : "";
  const promptBudget = Math.max(0, maxCustomStylePromptLength - cleanPrefix.length - separator.length);
  return `${cleanPrefix}${separator}${cleanPrompt.slice(0, promptBudget)}`.slice(0, maxCustomStylePromptLength);
}

function formatApiError(body: unknown): string {
  if (!body || typeof body !== "object") return "unknown_error";
  const payload = body as { error?: unknown; issues?: unknown; message?: unknown };
  if (typeof payload.message === "string") return payload.message;
  const error = typeof payload.error === "string" ? payload.error : "unknown_error";
  if (error === "insufficient_credits") return "积分不足，请充值后再生成";
  if (!Array.isArray(payload.issues) || !payload.issues.length) return error;
  const issueText = payload.issues
    .slice(0, 3)
    .map((issue) => {
      if (!issue || typeof issue !== "object") return "";
      const item = issue as { path?: unknown; message?: unknown };
      const path = Array.isArray(item.path) ? item.path.join(".") : "";
      const message = typeof item.message === "string" ? item.message : "";
      return [path, message].filter(Boolean).join(": ");
    })
    .filter(Boolean)
    .join("；");
  return issueText ? `${error}（${issueText}）` : error;
}

function StyleCover({ preset }: { preset: (typeof topSellerStylePresets)[number] }) {
  const labelClass = preset.label.length > 4 ? "compact" : "";

  return (
    <span className={`styleSwatch styleSwatch--${preset.id}`}>
      <strong className={labelClass}>{preset.label}</strong>
    </span>
  );
}

function StyleIcon({ icon }: { icon: StyleIconName }) {
  if (icon === "mountain") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path d="M6 50L23 22l9 14 8-12 18 26H6Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M26 21l6 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M41 27l4 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "city") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path d="M10 48V23h11v25H10Zm15 0V16h11v32H25Zm15 0V27h14v21H40Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M7 49h50" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "street") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path d="M8 45h48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18 18l28 30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M39 15l8 8-8 8-8-8 8-8Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M13 33l10-6 6 4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "trail") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path d="M8 50c7-10 11-16 15-27 4 11 8 16 13 22 5-8 8-14 13-25 4 10 7 18 9 30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M20 18l4-6m12 10l4-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "softWindow") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path d="M13 43c6 0 10-8 19-8s10 8 19 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M17 20v24M30 13v31M43 18v27" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "asian") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path d="M14 47V19h36v28H14Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M22 19c0-4 4-8 10-8s10 4 10 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M22 32h20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "playful") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <circle cx="20" cy="22" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="40" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="34" cy="42" r="10" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M11 48l12-10 8 6 10-14 11 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <rect x="12" y="14" width="40" height="36" rx="10" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M16 40h32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21 28h5M38 28h5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

type StyleIconName = "luxury" | "mountain" | "city" | "street" | "trail" | "softWindow" | "asian" | "playful";

function styleIconForPreset(id: TopSellerStylePresetId): StyleIconName {
  if (id === "old_money" || id === "minimal_premium") return "luxury";
  if (id === "urban_commute") return "city";
  if (id === "street_trend") return "street";
  if (id === "gorpcore") return "trail";
  if (id === "korean_relaxed") return "softWindow";
  if (id === "new_chinese") return "asian";
  if (id === "dopamine_sweet") return "playful";
  return "luxury";
}

function isStyleBoardMatched(board: PlatformStyleBoard, input: { majorCategoryId: MajorCategoryId; category: string; imageTypeIds: string[] }) {
  const categories = styleBoardCategoryAliases(input.majorCategoryId, input.category);
  const categoryMatched = categories.includes(board.category);
  const imageTypeMatched = input.imageTypeIds.length === 0 || input.imageTypeIds.includes(board.imageType);
  return categoryMatched && imageTypeMatched;
}

function isPublishedClassicStyleBoard(board: PlatformStyleBoard) {
  const name = board.styleName.trim();
  return board.showOnHome && board.status === "published" && name !== "待归类风格" && name !== "未归类风格";
}

function styleBoardCategoryAliases(majorCategoryId: MajorCategoryId, category: string) {
  const aliases = new Set([majorCategoryId, category, "general"]);
  if (majorCategoryId === "bags") {
    aliases.add("bags");
    if (/bag|backpack|luggage|tote|crossbody|handbag|wallet|pouch|duffel|包|箱|钱包|卡包|背包|托特|斜挎|旅行/i.test(category)) aliases.add("bags");
  }
  if (/running|hiking|outdoor|跑|登山|户外/.test(category)) aliases.add("sports");
  return Array.from(aliases);
}

function buildPlatformStyleBoardPrompt(board: PlatformStyleBoard) {
  const variants = board.rules.promptVariants ?? [];
  return [
    `Published ecommerce style "${board.styleName}" (${board.sampleCount} approved samples).`,
    board.rules.promptCore ? `Prompt core: ${board.rules.promptCore}.` : undefined,
    variants.length ? `Rotate one of these prompt variants to prevent repetitive output: ${variants.join(" | ")}.` : undefined,
    board.rules.productBrief ? `Product/category brief: ${board.rules.productBrief}.` : undefined,
    board.rules.sceneBrief ? `Scene brief: ${board.rules.sceneBrief}.` : undefined,
    board.rules.prompt,
    board.rules.mustUse.length ? `Hard style rules: ${board.rules.mustUse.join("; ")}.` : undefined,
    board.rules.background.length ? `Background vocabulary: ${board.rules.background.join(", ")}.` : undefined,
    board.rules.lighting.length ? `Lighting vocabulary: ${board.rules.lighting.join(", ")}.` : undefined,
    board.rules.camera.length ? `Camera/composition vocabulary: ${board.rules.camera.join(", ")}.` : undefined,
    board.rules.compositionRules?.length ? `Composition rules: ${board.rules.compositionRules.join(", ")}.` : undefined,
    board.rules.colorRules?.length ? `Color rules: ${board.rules.colorRules.join(", ")}.` : undefined,
    board.rules.pose.length ? `Pose/product angle vocabulary: ${board.rules.pose.join(", ")}.` : undefined,
    board.rules.avoid.length ? `Avoid for this style: ${board.rules.avoid.join(", ")}.` : undefined,
    board.rules.negativePrompt ? `Negative prompt for this style: ${board.rules.negativePrompt}.` : undefined,
    "Use this styleboard as the primary art direction and make it visibly different from other selected styles."
  ].filter(Boolean).join(" ");
}

function isRecoverableRunningGenerationJob(job: GenerationJobView): boolean {
  if (job.status !== "running") return false;
  if (job.error) return false;
  const failureCount = job.failures?.length ?? 0;
  return failureCount === 0 || failureCount < job.progress.total;
}

function statusLabel(job: GenerationJobView): string {
  if (job.status === "running") return `生成中 ${job.progress.completed}/${job.progress.total}`;
  if (job.status === "succeeded") return "生成完成";
  if (job.status === "partial_failed" && job.error && isBusyQueueError(job.error)) return `排队中断 ${job.progress.completed}/${job.progress.total}`;
  if (job.status === "partial_failed") return `部分失败 ${job.progress.completed}/${job.progress.total}`;
  if (job.status === "canceled") return "已取消";
  if (job.error && isBusyQueueError(job.error)) return "生图正在排队";
  return "生成失败";
}

function providerErrorTitle(error: { code: string; message: string; retryable: boolean }): string {
  if (isBusyQueueError(error)) return "生图正在排队";
  return error.code;
}

function providerErrorMessage(error: { code: string; message: string; retryable: boolean }): string {
  if (isBusyQueueError(error)) {
    return "你太有眼光了，当前也有很多用户在生成同款高级效果，生图正在排队中。请稍等一会儿后重试，我们会按实际成功图片扣除积分，未完成部分会释放冻结积分。";
  }
  return error.message;
}

function isBusyQueueError(error: { code: string; retryable: boolean }): boolean {
  return error.code === "provider_timeout" || error.code === "provider_rate_limited";
}

function failureLabel(failure: NonNullable<GenerationJobView["failures"]>[number]): string {
  return [failure.imageTypeLabel, failure.topSellerStyleLabel ?? failure.customStyleLabel ?? failure.suiteLabel]
    .filter(Boolean)
    .join(" · ");
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function imageSrc(image: GenerationJobView["results"][number]): string {
  if (image.base64) return `data:${image.mimeType};base64,${image.base64}`;
  return image.url ?? "";
}

function sanitizeDownloadName(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 120) || "download";
}

function triggerBrowserDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeDownloadName(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function blobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("download_failed");
  return response.blob();
}

async function writeBlobToFileHandle(handle: any, blob: Blob) {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function saveUrlAsFile(url: string, filename: string) {
  const safeName = sanitizeDownloadName(filename);
  const picker = (window as typeof window & { showSaveFilePicker?: (options?: unknown) => Promise<any> }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({ suggestedName: safeName });
      const blob = await blobFromUrl(url);
      await writeBlobToFileHandle(handle, blob);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  triggerBrowserDownload(url, safeName);
}

async function saveImageResult(platform: CommercePlatform, image: GenerationJobView["results"][number], index: number) {
  await saveUrlAsFile(imageSrc(image), buildDownloadName(platform, image, index));
}

async function saveImageResultsToFolder(files: Array<{ image: GenerationJobView["results"][number]; name: string }>, folderName: string) {
  if (!files.length) return;
  const directoryPicker = (window as typeof window & { showDirectoryPicker?: (options?: unknown) => Promise<any> }).showDirectoryPicker;
  if (directoryPicker) {
    try {
      const directory = await directoryPicker({ mode: "readwrite", suggestedName: sanitizeDownloadName(folderName) });
      for (const file of files) {
        const handle = await directory.getFileHandle(sanitizeDownloadName(file.name), { create: true });
        const blob = await blobFromUrl(imageSrc(file.image));
        await writeBlobToFileHandle(handle, blob);
      }
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  files.forEach((file) => triggerBrowserDownload(imageSrc(file.image), file.name));
}

async function saveDetailSuiteResults(platform: CommercePlatform, results: GenerationJobView["results"]) {
  const ordered = [...results].sort((left, right) => (left.suiteOrder ?? 999) - (right.suiteOrder ?? 999));
  await saveImageResultsToFolder(
    ordered.map((image, index) => ({ image, name: buildDownloadName(platform, image, index) })),
    "宝贝详情套图"
  );
}

function groupResultsByType(results: GenerationJobView["results"]) {
  const groups = new Map<string, { id: string; label: string; results: GenerationJobView["results"] }>();
  results.forEach((image) => {
    const baseId = image.imageTypeId ?? "unknown";
    const styleId = resultStyleId(image);
    const id = styleId ? `${styleId}-${baseId}` : baseId;
    const baseLabel = image.imageTypeLabel ?? "生成结果";
    const styleLabel = resultStyleLabel(image);
    const label = styleLabel ? `${styleLabel} · ${baseLabel}` : baseLabel;
    const group = groups.get(id) ?? { id, label, results: [] };
    group.results.push(image);
    groups.set(id, group);
  });
  return Array.from(groups.values());
}

function buildDownloadName(platform: CommercePlatform, image: GenerationJobView["results"][number], index: number): string {
  const source = (image.sourceFilename ?? "generated").replace(/\.[^.]+$/, "");
  const type = image.imageTypeLabel ?? image.imageTypeId ?? "result";
  const styleLabel = resultStyleLabel(image);
  const style = styleLabel ? `${styleLabel}-` : "";
  const extension = image.mimeType === "image/jpeg" ? "jpg" : image.mimeType === "image/webp" ? "webp" : "png";
  return `${platformLabels[platform]}-${style}${type}-${source}-${index + 1}.${extension}`;
}

function buildVideoDownloadName(job?: VideoJobPanelState): string {
  const source = job?.sourceName?.replace(/\.[^.]+$/, "") || job?.id || "video";
  return `视频生成结果-${source}.mp4`;
}

function videoAspectToApiValue(value: string): "16:9" | "9:16" | "1:1" | "4:5" | "3:4" {
  if (value.includes("9:16")) return "9:16";
  if (value.includes("4:5")) return "4:5";
  if (value.includes("3:4")) return "3:4";
  if (value.includes("1:1")) return "1:1";
  return "16:9";
}

function analyzeCustomVideoProduct(files: LocalImage[]) {
  const filenames = files.map((item) => item.file.name);
  const joined = filenames.join(" ").toLowerCase();
  const detected = [
    /(tote|托特|通勤|commute|briefcase|公文)/i.test(joined) ? "通勤托特包/公文包" : "",
    /(handbag|shoulder|crossbody|hobo|satchel|女包|手提|肩背|斜挎|腋下)/i.test(joined) ? "女包/肩背斜挎包" : "",
    /(backpack|rucksack|双肩|背包|书包|电脑包)/i.test(joined) ? "双肩包/电脑包" : "",
    /(luggage|suitcase|travel|trolley|旅行|拉杆|登机箱|行李箱)/i.test(joined) ? "旅行箱/拉杆箱" : "",
    /(wallet|card|pouch|coin|钱包|卡包|零钱|小皮具)/i.test(joined) ? "钱包/卡包/小皮具" : "",
    /(cosmetic|makeup|vanity|化妆|洗漱|收纳)/i.test(joined) ? "化妆包/收纳包" : "",
    /(baby|mom|kids|child|diaper|母婴|妈咪|儿童|童包)/i.test(joined) ? "母婴包/儿童包" : "",
    /(outdoor|hiking|trekking|camping|户外|徒步|露营|机能)/i.test(joined) ? "户外机能包" : "",
    /(leather|canvas|nylon|皮革|帆布|尼龙)/i.test(joined) ? "材质箱包" : ""
  ].filter(Boolean);
  const itemText = detected.length ? Array.from(new Set(detected)).join("、") : "箱包商品";
  return {
    itemText,
    summary: files.length
      ? `已读取 ${files.length} 张商品图，初步按「${itemText}」来写视频分镜。`
      : "等待上传商品图，上传后会根据文件和数量生成初步商品分析。",
    assetLine: filenames.length ? `素材：${filenames.slice(0, 4).join(" / ")}${filenames.length > 4 ? ` 等${filenames.length}张` : ""}` : "建议上传正面、侧面、内部结构、五金拉链、持包或细节图。"
  };
}

function buildCustomVideoDirectorScript(input: {
  brief: string;
  productAnalysis: ReturnType<typeof analyzeCustomVideoProduct>;
  platform: string;
  videoType: string;
  captionMode: string;
  musicMode: MusicMode;
  voiceoverMode: VoiceoverMode;
  subtitleMode: SubtitleMode;
  voiceoverScript: string;
  subtitleScript: string;
}) {
  const brief = input.brief.trim() || "生成一条适合箱包电商使用的原创短视频，画面高级、包款清楚、节奏流畅。";
  return [
    `视频总目标：${brief}`,
    `商品判断：根据上传商品图，主体按「${input.productAnalysis.itemText}」处理；包款颜色、包型轮廓、包身材质、提手/肩带、拉链/五金、口袋布局、内部结构、包底和细节必须以用户上传图为准。`,
    `平台与类型：${input.platform}，${input.videoType}，${input.captionMode}。`,
    `声音要求：${musicPromptRule(input.musicMode)} ${voiceoverPromptRule(input.voiceoverMode, input.voiceoverScript)}`,
    `字幕要求：${subtitlePromptRule(input.subtitleMode, input.subtitleScript)}`,
    "视频提示词：",
    "1. 0-2秒 开场钩子：竖版低机位近景快速进入，包款从画面中心亮相，镜头轻微推进，字幕用一句话点出容量感、包型或场景卖点。",
    "2. 2-4秒 包款完整展示：三分之二侧面或45度构图，展示正面轮廓、提手/肩带、包身材质、侧袋、包底和开口结构，运镜保持平稳。",
    "3. 4-6秒 包身和结构特写：切到包身纹理、走线、拉链、五金扣具、肩带连接、边油、包底脚钉或Logo-like细节，使用微距感镜头和柔和补光。",
    "4. 6-8秒 容量/携带展示：手部打开包口或放入随身物品，也可真人手提、肩背、斜挎、背负或拉杆行走，展示容量比例和真实携带状态，动作不要夸张。",
    "5. 8-10秒 搭配和场景：根据包款气质生成棚拍、通勤街道、办公空间、机场旅行、户外路径或轻生活场景，画面原创，不复用任何第三方人物或背景。",
    "6. 10-12秒 结尾定格：回到包款主视觉，字幕给出收藏、进店、查看尺码颜色或立即了解的行动引导。",
    "镜头要求：每个镜头都围绕用户包款，不改变商品身份；特写镜头必须服务于包型、包身、五金拉链、肩带连接、内部结构、容量感或持包/背包效果。"
  ].join("\n");
}

function buildCustomVideoPrompt(input: {
  script: string;
  productAnalysis: ReturnType<typeof analyzeCustomVideoProduct>;
  platform: string;
  videoType: string;
  aspectRatio: string;
  duration: string;
  captionMode: string;
  musicMode: MusicMode;
  voiceoverMode: VoiceoverMode;
  subtitleMode: SubtitleMode;
  voiceoverScript: string;
  subtitleScript: string;
  outputQuality: string;
  productImageCount: number;
}) {
  const prompt = [
    "Create an original bag ecommerce short video from the uploaded merchant product image(s).",
    `Product source rule: the first ${input.productImageCount} image(s) are the only source of truth for the merchant bag product. Treat the product as ${input.productAnalysis.itemText}; preserve colorway, bag silhouette, body proportions, handles, shoulder straps, zipper path, buckles, clasps, locks, wheels or trolley handle when present, pocket layout, flap shape, compartment structure, material texture, stitching, edge paint, trims and visible details.`,
    `Platform/video rule: ${input.platform}; ${input.videoType}; aspect ${input.aspectRatio}; duration ${input.duration}; direct output quality ${input.outputQuality}; ${input.captionMode}.`,
    `Audio rules: ${musicPromptRule(input.musicMode)} ${voiceoverPromptRule(input.voiceoverMode, input.voiceoverScript)}`,
    `Subtitle rules: ${subtitlePromptRule(input.subtitleMode, input.subtitleScript)}`,
    "Use the following approved video prompt exactly as the creative plan:",
    input.script,
    "Execution rules: write cinematic shot-by-shot video; include camera movement, bag close-ups, carrying movement, lighting, scene, and subtitles where needed. Do not copy any third-party video. Do not add watermark, QR code, fake price, platform logo, or unsupported claims. Keep the video commercially usable for bag ecommerce."
  ].join("\n");
  return prompt.length > 2950 ? `${prompt.slice(0, 2910)}\nPrompt shortened; preserve all product-source and execution rules above.` : prompt;
}

function buildVideoStoryboard(input: {
  videoType: string;
  platform: string;
  rewriteMode: string;
  goals: string[];
  productName: string;
  sellingPoints: string;
  offer: string;
}) {
  const productName = input.productName.trim() || "这款包";
  const sellingPoint = input.sellingPoints.trim() || "包型、容量感、包身和底部与五金细节";
  const offer = input.offer.trim() || "活动利益点";
  const modelLine = "是否出现人物完全跟随参考视频和用户明确要求；参考中没有人物时不要主动新增持包模特、走秀、口播或人物脸。";
  const backgroundLine = input.goals.includes("换背景但保留氛围") ? "背景重新生成，但保留参考视频的光线情绪和商业氛围。" : "背景按视频类型重新生成，避免照搬参考画面。";
  const copyLine = input.goals.includes("保留节奏，重写文案") ? "保留参考节奏，字幕全部重写。" : "字幕按商品卖点重新组织。";
  return [
    {
      title: "参考开场",
      duration: "0-2s",
      visual: `${productName}按参考视频的主体类型和镜头距离进入画面，先保持参考的展示方式。`,
      replacement: `替换为商家自己的包款素材，不复刻参考视频原人物、品牌、水印或字幕。${copyLine}`,
      caption: "",
      model: modelLine
    },
    {
      title: "整体展示",
      duration: "2-4s",
      visual: `展示${productName}的包型轮廓、颜色、包身、侧边和底部与五金结构，镜头运动跟随参考视频的节奏。`,
      replacement: `商品、背景和镜头细节重新生成。${backgroundLine}`,
      caption: "",
      model: modelLine
    },
    {
      title: "细节卖点",
      duration: "4-6s",
      visual: `按参考视频的切换密度展示包身纹理、肩带拉链、五金扣具、侧袋分区、内部容量、包底脚钉和走线等细节，突出${sellingPoint}。`,
      replacement: `只保留参考视频的展示顺序，重写画面与字幕。${copyLine}`,
      caption: "",
      model: modelLine
    },
    {
      title: "动作结构",
      duration: "6-8s",
      visual: `保持参考视频里的动作强度、剪辑节奏和镜头推进方式；参考中没有人物时只做包款陈列、手部整理、五金/拉链/包身局部推进或产品旋转。`,
      replacement: `动作只参考节奏，不复刻原镜头，不主动新增参考中没有的人物、走秀或口播。`,
      caption: "",
      model: modelLine
    },
    {
      title: "收尾展示",
      duration: "8-10s",
      visual: `画面回到商品主视觉或参考视频对应的收尾结构，保证商品清楚可识别。`,
      replacement: "不保留参考视频原店铺名、商标、价格表达、二维码和水印，活动信息只使用商家输入。",
      caption: offer,
      model: modelLine
    }
  ];
}

function videoTypeRule(label: string) {
  if (label.includes("推广")) return "Video type rule: make a performance-ad material video: strong first 2-second hook, dense product selling points, fast cuts, clear conversion CTA.";
  if (label.includes("主图")) return "Video type rule: make a bag product main video: bag clarity first, clean ecommerce display, little plot, show full bag silhouette, front/side/top angle and key details.";
  if (label.includes("持包")) return "Video type rule: focus on carrying effect: bag silhouette, body scale, hand-carry, shoulder, crossbody, backpack or luggage-pulling movement, and front/side/back inspection.";
  if (label.includes("细节")) return "Video type rule: focus on close details: material texture, zipper, hardware, handle, strap attachment, stitching, edge paint, compartments, SKU/color points, readable selling logic.";
  if (label.includes("直播")) return "Video type rule: make a live-room traffic clip: talk-show rhythm, benefit point, urgency, invite user into livestream.";
  return `Video type rule: ${label}.`;
}

function platformRule(label: string | undefined, aspectRatio: string, duration: string) {
  const durationRule = `strict duration limit ${duration}, never exceed 15 seconds`;
  if (!label) return `Platform rule: aspect ${aspectRatio}, ${durationRule}.`;
  if (label.includes("抖音") || label.includes("快手")) return `Platform rule: ${label}, vertical ${aspectRatio}, ${durationRule}; fast mobile pacing, readable large subtitles, strong first-screen impact.`;
  if (label.includes("淘宝") || label.includes("天猫")) return `Platform rule: ${label}, ${aspectRatio}, ${durationRule}; product-page clarity, clean commercial order, avoid noisy social-media effects.`;
  if (label.includes("小红书")) return `Platform rule: ${label}, ${aspectRatio}, ${durationRule}; lifestyle seeding tone, polished but natural, save-worthy subtitles and bag styling context.`;
  return `Platform rule: ${label}, ${aspectRatio}, ${durationRule}; general vertical ecommerce short video.`;
}

function rewriteModeRule(label: string) {
  if (label.includes("轻")) return "Reference mode rule: use only the extracted key frame for broad mood, composition, and subject placement. Do not borrow plot, people, background, subtitles, or product.";
  if (label.includes("重")) return "Reference mode rule: when a resolved full reference video is available, follow its subject type, display method, motion intensity, camera rhythm, edit structure, and transition pacing as structure only. Do not introduce major elements absent from the reference, such as a model/person, walking runway, talking head, street shoot, or dense captions, unless the user explicitly requests them.";
  return "Reference mode rule: use reference shot order, subject type, transition rhythm, and selling-point sequence, but replace protected identity, product, subtitle wording, brand marks, and exact shot details.";
}

function referenceStrengthForRewriteMode(value: string): "light" | "medium" | "heavy" {
  if (value === "light") return "light";
  if (value === "strong" || value === "heavy") return "heavy";
  return "medium";
}

function referenceProcessingRule(strength: "light" | "medium" | "heavy", processingMode: "none" | "single_frame" | "multi_frame" | "full_video") {
  if (processingMode === "single_frame") return "Reference asset rule: the system provides one extracted reference frame only; use it for broad composition and mood, not for motion or exact scene copying.";
  if (processingMode === "multi_frame") return "Reference asset rule: the system provides multiple extracted storyboard frames; use them for shot order and broad structure, not for identity, logo, subtitle, or exact frame copying.";
  if (processingMode === "full_video") return "Reference asset rule: the system provides a resolved full reference video; use it for motion/camera/editing structure while preserving originality and replacing protected identity, logos, subtitles, and products.";
  return `Reference asset rule: ${strength} reference selected but no reference asset is attached.`;
}

function referenceProcessingLabel(mode?: "none" | "single_frame" | "multi_frame" | "full_video") {
  if (mode === "single_frame") return "单帧参考";
  if (mode === "multi_frame") return "多帧分镜参考";
  if (mode === "full_video") return "完整视频参考";
  return "无参考素材";
}

function referenceSceneModeLabel(mode?: ReferenceSceneMode) {
  if (mode === "handheld_product") return "手持商品展示";
  if (mode === "model_wearing") return "持包展示";
  if (mode === "talking_head") return "口播讲解";
  if (mode === "mixed") return "混合展示";
  return "无人商品展示";
}

function referenceMotionModeLabel(mode?: ReferenceMotionMode) {
  if (mode === "slow_pan") return "慢推慢移";
  if (mode === "hand_operation") return "手部操作";
  if (mode === "walking_show") return "走动展示";
  if (mode === "fast_cut") return "快切节奏";
  return "静物展示";
}

function referenceTextModeLabel(mode?: ReferenceTextMode) {
  if (mode === "light_caption") return "少量字幕";
  if (mode === "dense_caption") return "密集字幕";
  return "少字/无字幕";
}

function goalRules(goals: string[], productAssetCount: number) {
  const rules = goals.map((goal) => {
    if (goal === "换成我的包款") return `Goal rule - replace bag product: uploaded merchant bag materials are the source of truth (${productAssetCount} item(s)). Present the merchant bags only in ways compatible with the reference video and user request. If the reference has no model/person, keep it as product display, hand/product operation, hardware/material close-up, capacity demonstration, or product turntable instead of inventing a model. Keep merchant colorway, bag silhouette, handles, straps, zipper path, hardware, pocket layout, compartment structure, pattern, texture, scale, and category accurate.`;
    if (goal === "换一个不侵权持包模特") return "Goal rule - replace carrying model: do not keep the original person's face, body identity, hairstyle identity, or likeness. Generate a new non-infringing lower-body or carrying model; only broad pose rhythm may be referenced.";
    if (goal === "换背景但保留氛围") return "Goal rule - replace background: do not keep the original location or set. Rebuild a different background while preserving only broad mood, lighting temperature, indoor/outdoor feeling, and commercial energy.";
    if (goal === "保留节奏，重写文案") return "Goal rule - rewrite copy: keep pacing, beat positions, and selling order, but rewrite every subtitle and spoken line. Do not reuse original wording.";
    if (goal === "生成投放感字幕") return "Goal rule - ad subtitles: add concise conversion subtitles with hook, benefit, proof, offer, and CTA. Use merchant-provided product facts only; no fake prices or unsupported claims.";
    return `Goal rule: ${goal}.`;
  });
  return rules.length ? rules : ["Goal rule: make an original merchant bag video using uploaded bag material as the main subject."];
}

function shouldGenerateAudio(input: { musicMode: MusicMode; voiceoverMode: VoiceoverMode }): boolean {
  return input.musicMode !== "none" || input.voiceoverMode !== "none";
}

function videoAudioSubtitleSummary(input: { musicMode: MusicMode; voiceoverMode: VoiceoverMode; subtitleMode: SubtitleMode }): string {
  return [musicModeLabel(input.musicMode), voiceoverModeLabel(input.voiceoverMode), subtitleModeLabel(input.subtitleMode)].join(" · ");
}

function musicModeLabel(mode: MusicMode): string {
  if (mode === "upload_music") return "上传音乐";
  if (mode === "music_url") return "音乐链接";
  if (mode === "none") return "无背景音乐";
  return "AI自动配乐";
}

function voiceoverModeLabel(mode: VoiceoverMode): string {
  if (mode === "ai_voiceover") return "AI自主配音";
  if (mode === "script_voiceover") return "按文案配音";
  if (mode === "upload_voiceover") return "上传配音";
  return "无配音";
}

function subtitleModeLabel(mode: SubtitleMode): string {
  if (mode === "none") return "无字幕";
  if (mode === "script_subtitle") return "按文案字幕";
  return "AI生成字幕";
}

function musicPromptRule(mode: MusicMode): string {
  if (mode === "upload_music") return "Use the uploaded reference audio as the background music source; align cuts naturally to its rhythm.";
  if (mode === "music_url") return "Use the provided online audio URL as the background music source; align cuts naturally to its rhythm.";
  if (mode === "none") return "Do not include background music.";
  return "Generate suitable background music automatically; keep it commercially clean and matching the video pacing.";
}

function voiceoverPromptRule(mode: VoiceoverMode, script: string): string {
  const cleanScript = script.trim();
  if (mode === "ai_voiceover") return "Generate a natural AI voiceover based on the product and video structure.";
  if (mode === "script_voiceover") return cleanScript
    ? `Generate AI voiceover using this script: ${cleanScript}`
    : "Generate AI voiceover only if a script is provided; otherwise keep voiceover concise and product-focused.";
  if (mode === "upload_voiceover") return "Use the uploaded reference audio as the voiceover reference/source.";
  return "Do not include voiceover.";
}

function subtitlePromptRule(mode: SubtitleMode, script: string): string {
  const cleanScript = script.trim();
  if (mode === "none") return "Do not generate subtitles, title bars, dense on-screen text, fake prices, QR codes, platform logos, or caption blocks.";
  if (mode === "script_subtitle") return cleanScript
    ? `Generate on-screen subtitles from this script, rewritten only for clarity and brevity: ${cleanScript}`
    : "Generate subtitles only if a subtitle script is provided; keep text sparse and readable.";
  return "Generate concise AI subtitles for the product video; keep them readable, original, and free of fake prices or unsupported claims.";
}

function resolvedReferenceAudioLink(input: {
  musicMode: MusicMode;
  voiceoverMode: VoiceoverMode;
  musicAudioUrl: string;
  musicAudio?: UploadedVideoAudio;
  voiceoverAudio?: UploadedVideoAudio;
}): string | undefined {
  if (input.voiceoverMode === "upload_voiceover" && input.voiceoverAudio?.publicUrl) return input.voiceoverAudio.publicUrl;
  if (input.musicMode === "upload_music" && input.musicAudio?.publicUrl) return input.musicAudio.publicUrl;
  if (input.musicMode === "music_url") return (extractFirstHttpUrl(input.musicAudioUrl) ?? input.musicAudioUrl.trim()) || undefined;
  return undefined;
}

function buildVideoPrompt(input: {
  userPrompt: string;
  category: string;
  videoType: string;
  platform?: string;
  template?: string;
  aspectRatio: string;
  duration: string;
  outputQuality: string;
  captionMode: string;
  musicMode: MusicMode;
  voiceoverMode: VoiceoverMode;
  subtitleMode: SubtitleMode;
  voiceoverScript: string;
  subtitleScript: string;
  rewriteMode: string;
  referenceStrength: "light" | "medium" | "heavy";
  referenceProcessingMode: "none" | "single_frame" | "multi_frame" | "full_video";
  goals: string[];
  productName: string;
  sellingPoints: string;
  audience: string;
  offer: string;
  referenceSource: string;
  referenceLink: string;
  productAssetCount: number;
  productImageCount: number;
  referenceImageCount: number;
  storyboardItems: ReturnType<typeof buildVideoStoryboard>;
}) {
  const userPrompt = input.userPrompt.trim();
  const hardRules = [
    videoTypeRule(input.videoType),
    platformRule(input.platform, input.aspectRatio, input.duration),
    `Direct output quality rule: generate the first draft at ${input.outputQuality}. Do not upscale to 1080P/2K/4K during initial generation; those are reserved for a later super-resolution step after the user approves the video.`,
    rewriteModeRule(input.rewriteMode),
    referenceProcessingRule(input.referenceStrength, input.referenceProcessingMode),
    "Reference consistency rule: preserve the reference video's obvious facts as control conditions: subject type, whether people are present, hand/product/carrying relationship, scene type, camera distance, action intensity, subtitle density, and edit rhythm. Do not add obvious elements absent from the reference, including full-body fashion walking, faces, talking-head narration, unrelated street-shoot scenes, full-screen dense captions, logos, watermarks, or brand marks, unless the user explicitly asks. If people appear, keep the bag as the hero and favor hand, shoulder, torso, hand-operation, hardware and material-detail framing.",
    "Visual style rule: follow the authorized reference video's broad visual style, lighting, pacing, camera mood, and commercial polish; do not impose a separate style selector.",
    musicPromptRule(input.musicMode),
    voiceoverPromptRule(input.voiceoverMode, input.voiceoverScript),
    subtitlePromptRule(input.subtitleMode, input.subtitleScript),
    ...goalRules(input.goals, input.productAssetCount)
  ];
  const prompt = [
    userPrompt || `Create an original bag ecommerce short video for ${input.category}.`,
    `Selected controls: ${input.videoType}; ${input.platform ?? "通用平台"}; ${input.rewriteMode}; ${input.captionMode}; goals=${input.goals.join(", ") || "default"}.`,
    input.productName.trim() ? `Product name: ${input.productName.trim()}.` : undefined,
    input.sellingPoints.trim() ? `Key selling points: ${input.sellingPoints.trim()}.` : undefined,
    input.audience.trim() ? `Target audience: ${input.audience.trim()}.` : undefined,
    input.offer.trim() ? `Offer or activity info: ${input.offer.trim()}.` : undefined,
    `Product material rule: user may upload multiple product images or angles for one or more bag products. Identify each bag type and keep every generated shot faithful to merchant bag colorway, silhouette, handles, shoulder straps, zipper path, hardware, pocket layout, flap shape, compartment structure, material texture, stitching, edge paint, scale, and visible details.`,
    `Product material rule: only use feet, legs, hands or a model/person when the reference video or user request clearly contains that structure. Otherwise present the merchant bag through product display, hand operation, hardware/material close-up, turntable, or camera movement following the reference.`,
    `Source order: first ${input.productImageCount} uploaded image/frame(s) represent merchant product truth from ${input.productAssetCount} total product asset(s); next ${input.referenceImageCount} image/frame(s) are reference structure/mood only.`,
    `Reference source: ${input.referenceSource}; processing=${referenceProcessingLabel(input.referenceProcessingMode)}; follow the reference subject type, display method, camera rhythm, motion intensity, and subtitle density${input.referenceLink.trim() ? " (link must be resolved by the server before use)." : ""}.`,
    `Hard execution rules:\n- ${hardRules.join("\n- ")}`,
    `Storyboard draft: ${input.storyboardItems.map((item, index) => `${index + 1}. ${item.title} ${item.duration}: ${item.visual} Subtitle: ${item.caption}`).join(" | ")}`,
    "Global originality rule: never copy the original face, watermark, logo, shop name, subtitles, exact frames, or complete picture. Keep merchant bag identity accurate; avoid QR codes, fake prices, unsupported claims, and unreadable text."
  ].filter(Boolean).join("\n");
  return prompt.length > 2950 ? `${prompt.slice(0, 2910)}\nPrompt shortened; keep all hard execution rules above.` : prompt;
}

function videoStatusLabel(status?: "idle" | "running" | "submitted" | "ready" | "failed" | "canceled", progress = 0, job?: Pick<VideoJobPanelState, "status" | "attemptCount" | "nextAttemptAt" | "lastError">) {
  if (status === "running" && isRetryingVideoJob(job)) return "排队重试中";
  if (status === "running") return "正在提交任务";
  if (status === "ready") return "生成完成";
  if (status === "failed") return "生成失败";
  if (status === "canceled") return "已取消";
  if (status === "submitted") {
    if (progress < 55) return "排队中";
    if (progress < 78) return "生成素材中";
    if (progress < 92) return "合成视频中";
    return "等待结果回传";
  }
  return "等待生成";
}

function isRetryingVideoJob(job?: Pick<VideoJobPanelState, "status" | "attemptCount" | "nextAttemptAt" | "lastError">): boolean {
  if (job?.status !== "running") return false;
  return Boolean(job.lastError?.retryable || job.nextAttemptAt || (job.attemptCount ?? 0) > 0);
}

function videoApiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "视频任务创建失败";
  const payload = body as { error?: unknown; message?: unknown; detail?: { message?: unknown }; requiredCredits?: unknown; account?: { balanceCredits?: unknown } };
  if (payload.error === "authentication_required") return "请先登录后再生成视频";
  if (payload.error === "insufficient_credits") {
    const required = typeof payload.requiredCredits === "number" ? `，预计需要 ${payload.requiredCredits} 积分` : "";
    const balance = typeof payload.account?.balanceCredits === "number" ? `，当前可用 ${payload.account.balanceCredits}` : "";
    return `积分不足${required}${balance}`;
  }
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.detail?.message === "string") return payload.detail.message;
  if (typeof payload.error === "string") return payload.error;
  return "视频任务创建失败";
}

function videoJobStateFromServer(
  job: VideoJobView,
  fallback?: { progress?: number; previewUrl?: string; sourceName?: string; sourceType?: string }
) {
  const fallbackProgress = typeof fallback?.progress === "number" ? fallback.progress : undefined;
  const progress = job.status === "running"
    ? Math.max(18, fallbackProgress ?? 18)
    : job.status === "submitted"
      ? Math.max(42, fallbackProgress ?? 42)
      : job.status === "failed" || job.status === "canceled"
        ? 0
        : 100;
  const resultUrl = job.result?.localUrl ?? job.result?.url;
  return {
    id: job.id,
    status: job.status === "succeeded" ? "ready" as const : job.status,
    progress,
    previewUrl: resultUrl ?? fallback?.previewUrl,
    sourceName: job.result?.filename ?? fallback?.sourceName,
    sourceType: job.result?.mimeType ?? fallback?.sourceType,
    resultUrl,
    error: job.error?.message,
    providerTaskId: job.providerTask?.id,
    reservedCredits: job.reservedCredits,
    chargedCredits: job.chargedCredits,
    requestedResolution: job.providerUsage?.requestedResolution ?? job.requestedResolution ?? job.input.outputResolution,
    actualResolution: job.providerUsage?.actualResolution ?? job.actualResolution,
    requestedDurationSeconds: job.providerUsage?.requestedDurationSeconds ?? job.requestedDurationSeconds ?? job.input.durationSeconds,
    actualDurationSeconds: job.providerUsage?.actualDurationSeconds ?? job.actualDurationSeconds,
    totalTokens: job.providerUsage?.totalTokens,
    actualCostCny: job.providerUsage?.actualCostCny,
    costStatus: job.providerUsage?.costStatus,
    providerMismatch: job.providerMismatch,
    referenceStrength: job.referenceStrength ?? job.input.metadata?.referenceStrength,
    referenceProcessingMode: job.referenceProcessingMode ?? job.input.metadata?.referenceProcessingMode,
    referenceAssetStatus: job.referenceAssetStatus ?? job.input.metadata?.referenceAssetStatus,
    referenceFrameCount: job.referenceFrameCount ?? job.input.metadata?.referenceFrameCount,
    referenceSceneMode: job.input.metadata?.referenceSceneMode,
    referenceMotionMode: job.input.metadata?.referenceMotionMode,
    referenceTextMode: job.input.metadata?.referenceTextMode,
    referenceParseError: job.referenceParseError ?? job.input.metadata?.referenceParseError,
    attemptCount: job.attemptCount,
    nextAttemptAt: job.nextAttemptAt,
    lastError: job.lastError
  };
}

function formatVideoResolution(value?: string): string {
  if (!value) return "-";
  const normalized = value.toLowerCase();
  if (normalized === "2k" || normalized === "4k") return normalized.toUpperCase();
  return normalized.replace("p", "P");
}

function resultStyleId(image: GenerationJobView["results"][number]): string | undefined {
  return image.topSellerStyleId ?? image.customStyleId;
}

function resultStyleLabel(image: GenerationJobView["results"][number]): string | undefined {
  return image.topSellerStyleLabel ?? image.customStyleLabel;
}

function normalizedImageTypeCount(value: string | number | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return clampImageTypeCount(parsed);
}

function clampImageTypeCount(value: number): number {
  return Math.min(99, Math.max(1, Math.trunc(value)));
}

function clampOutfitItemCount(value: number): number {
  return Math.min(6, Math.max(2, Math.trunc(value)));
}

function clampVideoDurationSeconds(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(15, Math.max(1, Math.trunc(value)));
}

function persistActiveGenerationJob(job: GenerationJobView) {
  try {
    if (job.status !== "running") {
      clearActiveGenerationJob();
      return;
    }
    window.localStorage.setItem(activeGenerationJobStorageKey, JSON.stringify({ id: job.id, job }));
  } catch {
    // Local recovery is best-effort; generation still continues on the server.
  }
}

function readActiveGenerationJob(): GenerationJobView | undefined {
  try {
    const raw = window.localStorage.getItem(activeGenerationJobStorageKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { job?: GenerationJobView };
    return parsed.job?.id ? parsed.job : undefined;
  } catch {
    return undefined;
  }
}

function clearActiveGenerationJob() {
  try {
    window.localStorage.removeItem(activeGenerationJobStorageKey);
  } catch {
    // Ignore storage failures.
  }
}

function persistActiveVideoJob(job: VideoJobView) {
  try {
    if (job.status !== "running" && job.status !== "submitted") {
      clearActiveVideoJob();
      return;
    }
    window.localStorage.setItem(activeVideoJobStorageKey, JSON.stringify({ id: job.id, job }));
  } catch {
    // Local recovery is best-effort; video tasks are still tracked on the server.
  }
}

function readActiveVideoJob(): ReturnType<typeof videoJobStateFromServer> | undefined {
  try {
    const raw = window.localStorage.getItem(activeVideoJobStorageKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { job?: VideoJobView };
    return parsed.job?.id ? videoJobStateFromServer(parsed.job) : undefined;
  } catch {
    return undefined;
  }
}

function clearActiveVideoJob() {
  try {
    window.localStorage.removeItem(activeVideoJobStorageKey);
  } catch {
    // Ignore storage failures.
  }
}

function readWorkbenchDraft<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function writeWorkbenchDraft(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Draft persistence is best-effort and should never block generation.
  }
}

function openWorkbenchDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("indexeddb_unavailable"));
      return;
    }
    const request = window.indexedDB.open("deepai-workbench-drafts", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb_open_failed"));
  });
}

async function withWorkbenchFileStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await openWorkbenchDraftDb();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction("files", mode);
      const store = transaction.objectStore("files");
      let request: IDBRequest<T> | void;
      try {
        request = callback(store);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve(request ? request.result : undefined);
      transaction.onerror = () => reject(transaction.error ?? new Error("indexeddb_transaction_failed"));
      transaction.onabort = () => reject(transaction.error ?? new Error("indexeddb_transaction_aborted"));
    });
  } finally {
    db.close();
  }
}

async function deleteDraftFilesByPrefix(prefix: string) {
  try {
    const db = await openWorkbenchDraftDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        if (String(cursor.key).startsWith(prefix)) cursor.delete();
        cursor.continue();
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("indexeddb_delete_failed"));
    });
    db.close();
  } catch {
    // Best-effort cleanup.
  }
}

async function putDraftFile(key: string, file: File) {
  await withWorkbenchFileStore("readwrite", (store) => store.put({ key, file }));
}

async function getDraftFile(key: string): Promise<File | undefined> {
  try {
    const record = await withWorkbenchFileStore<{ key: string; file: File | Blob }>("readonly", (store) => store.get(key));
    const stored = record?.file;
    if (!stored) return undefined;
    if (stored instanceof File) return stored;
    return new File([stored], key.split(":").pop() || "draft-file", { type: stored.type });
  } catch {
    return undefined;
  }
}

async function persistLocalImages(prefix: string, images: Array<LocalImage | undefined>): Promise<PersistedLocalImage[]> {
  await deleteDraftFilesByPrefix(prefix);
  const persisted: PersistedLocalImage[] = [];
  let totalBytes = 0;
  for (const image of images) {
    if (!image) continue;
    const storageKey = `${prefix}:${image.id}`;
    const canStoreFile = image.file.size <= maxDraftFileBytes && totalBytes + image.file.size <= maxDraftTotalBytes;
    if (canStoreFile) {
      try {
        await putDraftFile(storageKey, image.file);
        totalBytes += image.file.size;
      } catch {
        // Keep metadata even if the binary cannot be persisted.
      }
    }
    persisted.push({
      id: image.id,
      filename: image.file.name,
      mimeType: image.file.type,
      size: image.file.size,
      lastModified: image.file.lastModified,
      storageKey: canStoreFile ? storageKey : undefined,
      role: image.role,
      colorGroupId: image.colorGroupId
    });
  }
  return persisted;
}

async function restoreLocalImages(items: PersistedLocalImage[] | undefined): Promise<LocalImage[]> {
  const restored: LocalImage[] = [];
  for (const item of items ?? []) {
    if (!item.storageKey) continue;
    const file = await getDraftFile(item.storageKey);
    if (!file) continue;
    const normalized = file instanceof File
      ? file
      : new File([file], item.filename, { type: item.mimeType, lastModified: item.lastModified });
    restored.push({
      id: item.id,
      file: normalized,
      previewUrl: URL.createObjectURL(normalized),
      role: item.role,
      colorGroupId: item.colorGroupId
    });
  }
  return restored;
}

async function restoreSingleLocalImage(item: PersistedLocalImage | undefined): Promise<LocalImage | undefined> {
  const [image] = await restoreLocalImages(item ? [item] : []);
  return image;
}

function modelGenderIconSrc(gender: ModelGender): string {
  const filenames: Record<ModelGender, string> = {
    female: "female",
    male: "male",
    boy: "boy",
    girl: "girl",
    no_face: "no-face",
    upper_body_face: "upper-body-face",
    upper_body_no_face: "upper-body-no-face",
    lower_body: "lower-body"
  };
  return `/model-type-icons/${filenames[gender]}.webp`;
}

function modelGenderDescription(gender: ModelGender): string {
  if (gender === "male") return "男士通勤持包/背包模特，适合公文包、双肩包、邮差包和中性包款";
  if (gender === "boy") return "男童背包或手提展示，适合儿童书包、童包和母婴出行场景";
  if (gender === "girl") return "女童背包或手提展示，适合儿童书包、童包和亲子出行场景";
  if (gender === "no_face") return "身体近景，重点展示包型比例、肩带长度、手提/肩背姿态和容量感";
  if (gender === "upper_body_face") return "动态行走、通勤携带或旅行移动，展示包款比例和真实携带姿态";
  if (gender === "upper_body_no_face") return "五金拉链、侧袋、肩带连接、包身纹理或内部结构局部特写";
  if (gender === "lower_body") return "腰部以下或半身搭配持包，展示穿搭、包款位置和箱包比例";
  return "女士通勤持包/肩背模特，适合手提包、托特包、斜挎包和通用包款";
}

function uniqueImageTypes(items: PlatformImageTypePreset[]): PlatformImageTypePreset[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
