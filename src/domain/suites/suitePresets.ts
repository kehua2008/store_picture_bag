import {
  findPlatformSpec,
  findSpecImageType,
  imageTypeForCategory,
  platformLabels,
  specsForPlatform,
  type ApparelCategory,
  type AssetGroup,
  type CommercePlatform,
  type PlatformImageTypePreset,
  type PlatformSpecPreset
} from "../apparel/options";

export type GenerationMode = "single" | "suite";
export type SuitePresetId =
  | "basic-5"
  | "standard-7"
  | "detail-9"
  | "detail-basic-conversion"
  | "detail-women-editorial"
  | "detail-functional";
export type SuiteSurface = Extract<AssetGroup, "main" | "detail">;
export type SuiteImageRole =
  | "white_hero"
  | "detail_white"
  | "scene_hero"
  | "studio_hero"
  | "mobile_long"
  | "side_back"
  | "key_features"
  | "single_feature"
  | "material_detail"
  | "model_fit"
  | "detail_header"
  | "craft_detail"
  | "sku_color"
  | "size_info"
  | "trust_footer";
export type SuiteVisualMode = "poster" | "product_only" | "model_scene" | "detail_closeup" | "info_graphic" | "selling_point";
export type SuiteColorPolicy = "all_colors" | "hero_color" | "single_color_each" | "merchant_data";
export type SuiteModelPolicy = "never" | "required" | "optional";
export type SuiteSourcePolicy = "all_images" | "hero_color_images" | "detail_images" | "merchant_info";
export type SuiteTextPolicy = "none" | "short_copy" | "structured_copy";

export interface SuitePreset {
  id: SuitePresetId;
  label: string;
  description: string;
  count: number;
}

export interface SuitePlanItem {
  id: string;
  order: number;
  role: SuiteImageRole;
  imageTypeId: string;
  label: string;
  purpose?: string;
  visualMode?: SuiteVisualMode;
  colorPolicy?: SuiteColorPolicy;
  modelPolicy?: SuiteModelPolicy;
  sourcePolicy?: SuiteSourcePolicy;
  textPolicy?: SuiteTextPolicy;
  specId: string;
  targetWidth: number;
  targetHeight: number;
}

export const suitePresets: SuitePreset[] = [
  { id: "basic-5", label: "5张基础套图", description: "白底、场景、卖点、细节、真人携带展示", count: 5 },
  { id: "standard-7", label: "7张标准套图", description: "基础套图 + 补充角度与核心卖点图", count: 7 },
  { id: "detail-9", label: "9张完整详情套图", description: "标准套图 + SKU颜色与品质收尾", count: 9 },
  { id: "detail-basic-conversion", label: "基础转化版", description: "适合托特包、斜挎包、双肩包等基础包款，信息完整、转化清楚", count: 8 },
  { id: "detail-women-editorial", label: "通勤质感版", description: "适合女包、男包、公文包和小皮具，强化携带比例和质感氛围", count: 9 },
  { id: "detail-functional", label: "旅行容量版", description: "适合拉杆箱、旅行袋、户外包和收纳包，突出容量、结构和使用场景", count: 9 }
];

const mainBaseRoles: SuiteImageRole[] = ["white_hero", "scene_hero", "studio_hero", "mobile_long", "model_fit"];
const mainStandardRoles: SuiteImageRole[] = [...mainBaseRoles, "side_back", "key_features"];
const mainDetailRoles: SuiteImageRole[] = [...mainStandardRoles, "material_detail", "sku_color"];

const detailBaseRoles: SuiteImageRole[] = ["detail_header", "detail_white", "material_detail", "model_fit"];
const detailStandardRoles: SuiteImageRole[] = [...detailBaseRoles, "key_features", "side_back"];
const detailDetailRoles: SuiteImageRole[] = [...detailStandardRoles, "single_feature", "studio_hero"];

const detailTemplateRoles: Record<Extract<SuitePresetId, "detail-basic-conversion" | "detail-women-editorial" | "detail-functional">, SuiteImageRole[]> = {
  "detail-basic-conversion": ["detail_header", "sku_color", "model_fit", "key_features", "material_detail", "craft_detail", "size_info", "trust_footer"],
  "detail-women-editorial": ["detail_header", "model_fit", "sku_color", "key_features", "scene_hero", "material_detail", "craft_detail", "size_info", "trust_footer"],
  "detail-functional": ["detail_header", "detail_white", "scene_hero", "key_features", "material_detail", "craft_detail", "sku_color", "size_info", "trust_footer"]
};

const roleToImageType: Record<SuiteImageRole, string> = {
  white_hero: "white_main",
  detail_white: "detail_white_product",
  scene_hero: "scene_main",
  studio_hero: "studio_main",
  mobile_long: "mobile_long_main",
  side_back: "side_back_main",
  key_features: "detail_texture",
  single_feature: "detail_model_fit",
  material_detail: "detail_texture",
  model_fit: "detail_model_fit",
  detail_header: "detail_header_poster",
  craft_detail: "detail_craft",
  sku_color: "detail_white_product",
  size_info: "detail_size_fit",
  trust_footer: "detail_header_poster"
};

const roleLabels: Record<SuiteImageRole, string> = {
  white_hero: "白底主图",
  detail_white: "白底商品展示",
  scene_hero: "场景主图",
  studio_hero: "棚拍主图",
  mobile_long: "手机长图",
  side_back: "侧背补充图",
  key_features: "核心卖点图",
  single_feature: "单卖点图",
  material_detail: "材质细节图",
  model_fit: "持包效果图",
  detail_header: "详情首屏",
  craft_detail: "工艺设计图",
  sku_color: "SKU颜色图",
  size_info: "尺码说明图",
  trust_footer: "品质收尾图"
};

const detailRoleLabels: Partial<Record<SuiteImageRole, string>> = {
  detail_white: "白底商品展示",
  scene_hero: "详情场景展示",
  key_features: "箱包卖点补充",
  material_detail: "包身材质细节",
  model_fit: "持包效果展示",
  detail_header: "详情首屏海报",
  craft_detail: "工艺细节图",
  sku_color: "多色SKU总览",
  size_info: "尺寸容量说明",
  trust_footer: "品质保养收尾",
  side_back: "侧背补充展示",
  single_feature: "容量功能补充",
  studio_hero: "棚拍补充展示"
};

const detailTemplateLabels: Partial<Record<SuiteImageRole, string>> = {
  detail_header: "首屏海报",
  sku_color: "多色SKU总览",
  detail_white: "白底商品展示",
  model_fit: "持包场景",
  key_features: "包型卖点",
  material_detail: "包身细节",
  craft_detail: "五金工艺",
  size_info: "尺寸容量",
  trust_footer: "品质保养收尾",
  scene_hero: "场景卖点图"
};

const rolePolicies: Record<SuiteImageRole, Pick<SuitePlanItem, "purpose" | "visualMode" | "colorPolicy" | "modelPolicy" | "sourcePolicy" | "textPolicy">> = {
  white_hero: { purpose: "白底主图检查商品本体", visualMode: "product_only", colorPolicy: "hero_color", modelPolicy: "never", sourcePolicy: "hero_color_images", textPolicy: "none" },
  detail_white: { purpose: "在详情页中清楚展示商品本体、轮廓和颜色", visualMode: "product_only", colorPolicy: "hero_color", modelPolicy: "never", sourcePolicy: "hero_color_images", textPolicy: "none" },
  scene_hero: { purpose: "用真实场景表达携带氛围或功能场景", visualMode: "model_scene", colorPolicy: "hero_color", modelPolicy: "required", sourcePolicy: "hero_color_images", textPolicy: "short_copy" },
  studio_hero: { purpose: "棚拍方式展示商品稳定质感", visualMode: "product_only", colorPolicy: "hero_color", modelPolicy: "optional", sourcePolicy: "hero_color_images", textPolicy: "none" },
  mobile_long: { purpose: "移动端竖版首屏展示", visualMode: "model_scene", colorPolicy: "hero_color", modelPolicy: "optional", sourcePolicy: "hero_color_images", textPolicy: "none" },
  side_back: { purpose: "补充侧面、背面或结构角度", visualMode: "product_only", colorPolicy: "hero_color", modelPolicy: "never", sourcePolicy: "hero_color_images", textPolicy: "none" },
  key_features: { purpose: "表达一个或多个箱包核心卖点", visualMode: "selling_point", colorPolicy: "hero_color", modelPolicy: "optional", sourcePolicy: "hero_color_images", textPolicy: "short_copy" },
  single_feature: { purpose: "突出单一设计、容量或功能卖点", visualMode: "selling_point", colorPolicy: "hero_color", modelPolicy: "optional", sourcePolicy: "hero_color_images", textPolicy: "short_copy" },
  material_detail: { purpose: "展示包身纹理、材质和表面质感", visualMode: "detail_closeup", colorPolicy: "hero_color", modelPolicy: "never", sourcePolicy: "detail_images", textPolicy: "short_copy" },
  model_fit: { purpose: "展示主推色真实手提、肩背、斜挎或背负效果、人体比例和搭配氛围", visualMode: "model_scene", colorPolicy: "hero_color", modelPolicy: "required", sourcePolicy: "hero_color_images", textPolicy: "none" },
  detail_header: { purpose: "建立详情页第一屏风格和核心卖点", visualMode: "poster", colorPolicy: "hero_color", modelPolicy: "optional", sourcePolicy: "hero_color_images", textPolicy: "short_copy" },
  craft_detail: { purpose: "展示提手、肩带、拉链、扣具、走线、五金和口袋等结构工艺", visualMode: "detail_closeup", colorPolicy: "hero_color", modelPolicy: "never", sourcePolicy: "detail_images", textPolicy: "short_copy" },
  sku_color: { purpose: "整齐展示所有颜色，帮助买家快速选色", visualMode: "product_only", colorPolicy: "all_colors", modelPolicy: "never", sourcePolicy: "all_images", textPolicy: "none" },
  size_info: { purpose: "表达尺寸、容量、重量、肩带长度、分区和可容纳物信息", visualMode: "info_graphic", colorPolicy: "merchant_data", modelPolicy: "never", sourcePolicy: "merchant_info", textPolicy: "structured_copy" },
  trust_footer: { purpose: "用保养、品质和售后信息完成箱包详情页收尾", visualMode: "info_graphic", colorPolicy: "merchant_data", modelPolicy: "never", sourcePolicy: "merchant_info", textPolicy: "structured_copy" }
};

const suiteOnlyDetailImageTypes: Record<string, PlatformImageTypePreset> = {
  detail_craft: { id: "detail_craft", label: "五金结构细节", description: "展示提手、肩带、拉链、扣具、走线、五金和口袋等结构工艺", scene: "studio", sceneVariant: "window_light" },
  detail_design_points: { id: "detail_design_points", label: "核心卖点展示", description: "突出包型、容量、分区、材质、五金、功能或携带体验等核心卖点", scene: "catalog", sceneVariant: "minimal_art" },
  detail_size_fit: { id: "detail_size_fit", label: "尺寸容量说明", description: "表达尺寸、容量、重量、肩带长度、分区和可容纳物信息", scene: "catalog", sceneVariant: "minimal_art" },
  detail_color_sku: { id: "detail_color_sku", label: "颜色SKU展示", description: "整齐展示多色、多规格或SKU一致性", scene: "white", sceneVariant: "pure_white" }
};

export function findSuitePreset(id: string): SuitePreset | undefined {
  return suitePresets.find((item) => item.id === id);
}

export function buildSuitePlan(platform: CommercePlatform, presetId: SuitePresetId, surface: SuiteSurface = "main", category?: ApparelCategory, productCategoryId?: string): SuitePlanItem[] {
  const roles = rolesForPreset(presetId, surface);
  return roles.map((role, index) => {
    const imageTypeId = imageTypeForRole(role, surface);
    const resolved = resolveSuiteImageType(platform, imageTypeId, surface);
    const categoryImageType = category ? imageTypeForCategory(resolved.imageType, category, productCategoryId) : resolved.imageType;
    const templateLabel = isDetailTemplatePreset(presetId) ? detailTemplateLabels[role] : undefined;
    const label = templateLabel ?? (surface === "detail" && category ? categoryImageType.label : surface === "detail" ? detailRoleLabels[role] ?? roleLabels[role] : roleLabels[role]);
    return {
      id: `${presetId}-${index + 1}-${role}`,
      order: index + 1,
      role,
      imageTypeId,
      label,
      ...rolePolicies[role],
      specId: resolved.spec.id,
      targetWidth: resolved.spec.targetWidth,
      targetHeight: resolved.spec.targetHeight
    };
  });
}

export function resolveSuiteImageType(platform: CommercePlatform, imageTypeId: string, surface?: SuiteSurface): { spec: PlatformSpecPreset; imageType: PlatformImageTypePreset } {
  const specs = surface ? preferredSpecsForSurface(platform, surface) : specsForPlatform(platform);
  for (const spec of specs) {
    const imageType = findSpecImageType(spec, imageTypeId);
    if (imageType) return { spec, imageType };
  }
  const suiteOnlyImageType = surface === "detail" ? suiteOnlyDetailImageTypes[imageTypeId] : undefined;
  if (suiteOnlyImageType && specs[0]) return { spec: specs[0], imageType: suiteOnlyImageType };

  throw new Error(`suite_image_type_not_found:${platformLabels[platform]}:${imageTypeId}`);
}

export function findPlatformImageType(platform: CommercePlatform, imageTypeId: string): { spec: PlatformSpecPreset; imageType: PlatformImageTypePreset } | undefined {
  for (const spec of specsForPlatform(platform)) {
    const imageType = findSpecImageType(spec, imageTypeId);
    if (imageType) return { spec, imageType };
  }
  return undefined;
}

export function suiteItemFromOption(platform: CommercePlatform, item: SuitePlanItem): SuitePlanItem {
  const spec = findPlatformSpec(item.specId, platform);
  if (!spec) return item;
  return { ...item, targetWidth: spec.targetWidth, targetHeight: spec.targetHeight };
}

function rolesForPreset(presetId: SuitePresetId, surface: SuiteSurface): SuiteImageRole[] {
  if (surface === "detail" && isDetailTemplatePreset(presetId)) return detailTemplateRoles[presetId];
  if (surface === "detail") {
    return presetId === "detail-9" ? detailDetailRoles : presetId === "standard-7" ? detailStandardRoles : detailBaseRoles;
  }
  return presetId === "detail-9" ? mainDetailRoles : presetId === "standard-7" ? mainStandardRoles : mainBaseRoles;
}

function isDetailTemplatePreset(presetId: SuitePresetId): presetId is keyof typeof detailTemplateRoles {
  return presetId === "detail-basic-conversion" || presetId === "detail-women-editorial" || presetId === "detail-functional";
}

function preferredSpecsForSurface(platform: CommercePlatform, surface: SuiteSurface): PlatformSpecPreset[] {
  const specs = specsForPlatform(platform);
  if (surface === "detail") return [...specs.filter((item) => item.assetGroup === "detail"), ...specs.filter((item) => item.assetGroup !== "detail")];
  return [...specs.filter((item) => item.assetGroup === "main"), ...specs.filter((item) => item.assetGroup !== "detail"), ...specs.filter((item) => item.assetGroup === "detail")];
}

function imageTypeForRole(role: SuiteImageRole, surface: SuiteSurface): string {
  if (surface === "detail" && role === "scene_hero") return "detail_model_fit";
  if (surface === "detail" && role === "side_back") return "detail_white_product";
  if (surface === "detail" && role === "studio_hero") return "detail_texture";
  if (surface === "detail" && role === "key_features") return "detail_design_points";
  if (surface === "detail" && role === "sku_color") return "detail_color_sku";
  return roleToImageType[role];
}
