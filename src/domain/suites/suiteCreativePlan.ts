import { platformLabels, type ApparelCategory, type CommercePlatform } from "../apparel/options";
import { buildReferenceDrivenStyleGuidance, referenceStyleGroupNameFor } from "../prompts/referenceStyleGuidance";
import type { ProductAnalysis, ProductSellingPoint, ProductVisualUnderstanding } from "./productAnalysis";
import type { SuiteImageRole, SuitePlanItem, SuiteSurface } from "./suitePresets";

export type TextRenderMode = "none" | "external_overlay" | "model_embedded";
export type TextBlockKind = "headline" | "subtitle" | "badge" | "callout" | "caption" | "metric";
export type ReferenceRequirementKind = "source_product" | "all_source_angles" | "material_crop" | "model_reference" | "style_reference";
export type MaskRequirementKind = "subject_cutout" | "product_keepout" | "text_safe_area" | "detail_focus" | "background_replace";

export interface SuiteCopywritingBlock {
  headline: string;
  subtitle: string;
  badges: string[];
  callouts: string[];
  proofPoints: string[];
  tone: string;
}

export interface SuiteTextBlock {
  id: string;
  kind: TextBlockKind;
  text: string;
  anchor: "top_left" | "top_center" | "top_right" | "middle_left" | "middle_right" | "bottom_left" | "bottom_center" | "bottom_right";
  x: number;
  y: number;
  width: number;
  height: number;
  align: "left" | "center" | "right";
  maxChars: number;
  fontRole: "display" | "body" | "caption" | "number";
}

export interface SuiteTextLayout {
  renderMode: TextRenderMode;
  safeArea: SuiteTextBlock["anchor"];
  canvasWidth: number;
  canvasHeight: number;
  blocks: SuiteTextBlock[];
  rules: string[];
}

export interface SuiteReferenceRequirement {
  kind: ReferenceRequirementKind;
  required: boolean;
  source: string;
  purpose: string;
}

export interface SuiteMaskRequirement {
  kind: MaskRequirementKind;
  required: boolean;
  target: string;
  purpose: string;
}

export interface SuiteCompositionRule {
  subjectPlacement: string;
  camera: string;
  background: string;
  lighting: string;
  overlayPolicy: string;
  compositeRules: string[];
}

export interface SuiteCreativePlanItem {
  id: string;
  suiteItemId: string;
  order: number;
  role: SuiteImageRole;
  label: string;
  imageTypeId: string;
  targetWidth: number;
  targetHeight: number;
  sellingPoint?: ProductSellingPoint;
  copy: SuiteCopywritingBlock;
  imagePrompt: string;
  referenceStyleGuidance?: string;
  referenceStyleGroupName?: string;
  textLayout: SuiteTextLayout;
  references: SuiteReferenceRequirement[];
  masks: SuiteMaskRequirement[];
  composition: SuiteCompositionRule;
}

export interface SuiteCreativePlan {
  version: "suite-creative-plan-v1";
  platform: CommercePlatform;
  category: ApparelCategory;
  surface: SuiteSurface;
  productUnderstanding: ProductVisualUnderstanding;
  copyStrategy: {
    productName: string;
    audience: string;
    scenes: string[];
    sellingPointOrder: string[];
    tone: string;
  };
  items: SuiteCreativePlanItem[];
}

export function buildSuiteCreativePlan(input: {
  platform: CommercePlatform;
  category: ApparelCategory;
  surface: SuiteSurface;
  suiteItems: SuitePlanItem[];
  productAnalysis: ProductAnalysis;
  styleLabels?: string[];
  userPrompt?: string;
}): SuiteCreativePlan {
  const tone = copyTone(input.platform, input.surface, input.styleLabels);
  return {
    version: "suite-creative-plan-v1",
    platform: input.platform,
    category: input.category,
    surface: input.surface,
    productUnderstanding: input.productAnalysis.visualUnderstanding,
    copyStrategy: {
      productName: input.productAnalysis.productNameZh || input.productAnalysis.productName,
      audience: input.productAnalysis.targetAudience,
      scenes: input.productAnalysis.targetScenes,
      sellingPointOrder: input.productAnalysis.sellingPoints.map((item) => item.title),
      tone
    },
    items: input.suiteItems.map((item, index) => buildSuiteCreativePlanItem({
      item,
      index,
      platform: input.platform,
      surface: input.surface,
      category: input.category,
      productAnalysis: input.productAnalysis,
      tone,
      userPrompt: input.userPrompt,
      styleLabels: input.styleLabels
    }))
  };
}

export function buildSuiteCreativePromptSection(item?: SuiteCreativePlanItem): string {
  if (!item) return "";

  const references = item.references
    .map((reference) => `${reference.kind}${reference.required ? " required" : " optional"}: ${reference.purpose}`)
    .join("; ");
  const masks = item.masks
    .map((mask) => `${mask.kind}${mask.required ? " required" : " optional"}: ${mask.purpose}`)
    .join("; ");
  const textBlocks = item.textLayout.blocks
    .map((block) => `${block.kind} "${block.text}" at ${block.anchor}`)
    .join("; ");

  return [
    `Suite creative plan item ${item.order} (${item.label}).`,
    `Image prompt: ${item.imagePrompt}`,
    item.referenceStyleGuidance ? `Reference style card: ${item.referenceStyleGuidance}` : "",
    `Copywriting plan: headline "${item.copy.headline}", subtitle "${item.copy.subtitle}", badges ${item.copy.badges.join(" / ") || "none"}, callouts ${item.copy.callouts.join(" / ") || "none"}.`,
    `Text layout render mode: ${item.textLayout.renderMode}. Safe area: ${item.textLayout.safeArea}. Blocks: ${textBlocks || "none"}.`,
    `Reference requirements: ${references}. Mask requirements: ${masks}.`,
    `Composition: ${item.composition.subjectPlacement}; camera ${item.composition.camera}; background ${item.composition.background}; lighting ${item.composition.lighting}; overlay policy ${item.composition.overlayPolicy}.`,
    `Composite rules: ${item.composition.compositeRules.join(" ")}`
  ].join(" ");
}

function buildSuiteCreativePlanItem(input: {
  item: SuitePlanItem;
  index: number;
  platform: CommercePlatform;
  surface: SuiteSurface;
  category: ApparelCategory;
  productAnalysis: ProductAnalysis;
  tone: string;
  userPrompt?: string;
  styleLabels?: string[];
}): SuiteCreativePlanItem {
  const sellingPoint = selectSellingPoint(input.productAnalysis.sellingPoints, input.item.role, input.index);
  const copy = buildCopywriting({
    role: input.item.role,
    label: input.item.label,
    productAnalysis: input.productAnalysis,
    sellingPoint,
    tone: input.tone
  });
  const textLayout = buildTextLayout({
    role: input.item.role,
    targetWidth: input.item.targetWidth,
    targetHeight: input.item.targetHeight,
    copy
  });
  const composition = compositionForRole(input.item.role, input.productAnalysis, input.surface);
  const referenceStyleGuidance = buildReferenceDrivenStyleGuidance({
    category: input.category,
    imageTypeId: input.item.imageTypeId,
    suiteRole: input.item.role,
    variationIndex: input.index,
    disabled: Boolean(input.styleLabels?.length)
  });
  const referenceStyleGroupName = referenceStyleGroupNameFor({
    category: input.category,
    imageTypeId: input.item.imageTypeId,
    suiteRole: input.item.role,
    variationIndex: input.index
  });

  return {
    id: `creative-${input.item.id}`,
    suiteItemId: input.item.id,
    order: input.item.order,
    role: input.item.role,
    label: input.item.label,
    imageTypeId: input.item.imageTypeId,
    targetWidth: input.item.targetWidth,
    targetHeight: input.item.targetHeight,
    sellingPoint,
    copy,
    imagePrompt: buildImagePrompt({
      platform: input.platform,
      category: input.category,
      role: input.item.role,
      label: input.item.label,
      productAnalysis: input.productAnalysis,
      sellingPoint,
      composition,
      textLayout,
      userPrompt: input.userPrompt,
      referenceStyleGuidance
    }),
    referenceStyleGuidance: referenceStyleGuidance || undefined,
    referenceStyleGroupName: referenceStyleGuidance ? referenceStyleGroupName : undefined,
    textLayout,
    references: referencesForRole(input.item.role),
    masks: masksForRole(input.item.role, textLayout.renderMode),
    composition
  };
}

function buildCopywriting(input: {
  role: SuiteImageRole;
  label: string;
  productAnalysis: ProductAnalysis;
  sellingPoint?: ProductSellingPoint;
  tone: string;
}): SuiteCopywritingBlock {
  const productName = compactText(input.productAnalysis.productNameZh || input.productAnalysis.productType, 12);
  const point = input.sellingPoint ?? input.productAnalysis.sellingPoints[0];
  const secondary = input.productAnalysis.sellingPoints.find((item) => item.title !== point?.title) ?? input.productAnalysis.sellingPoints[1];

  const roleHeadline: Partial<Record<SuiteImageRole, string>> = {
    white_hero: productName,
    detail_white: `${productName}展示`,
    scene_hero: `${input.productAnalysis.targetScenes[0] ?? "多场景"}适配`,
    studio_hero: "包型清晰",
    mobile_long: "持包比例更自然",
    side_back: "结构细节完整",
    key_features: "核心卖点",
    single_feature: point?.title ?? input.label,
    material_detail: point?.type === "material" ? point.title : "包身材质",
    model_fit: "穿着效果",
    detail_header: productName,
    craft_detail: "工艺细节",
    sku_color: "颜色展示",
    size_info: "尺码说明",
    trust_footer: "品质安心"
  };

  return {
    headline: compactText(roleHeadline[input.role] ?? input.label, 14),
    subtitle: compactText(point ? `${point.title} ${point.description}` : input.productAnalysis.productStyle, 22),
    badges: [point?.title, secondary?.title].filter(Boolean).map((item) => compactText(item, 8)),
    callouts: [point?.description, secondary?.description].filter(Boolean).map((item) => compactText(item, 12)),
    proofPoints: proofPointsForRole(input.role, input.productAnalysis),
    tone: input.tone
  };
}

function buildTextLayout(input: {
  role: SuiteImageRole;
  targetWidth: number;
  targetHeight: number;
  copy: SuiteCopywritingBlock;
}): SuiteTextLayout {
  const renderMode = textRenderModeForRole(input.role);
  const safeArea = safeAreaForRole(input.role);
  const rules = [
    "Use external overlay coordinates as percentages of the final canvas.",
    "Keep all text out of the product keepout mask and avoid covering bag silhouette, handles, straps, zipper path, hardware, pockets, material macro details, labels or compartment openings.",
    "Prefer strong hierarchy: headline first, subtitle second, badges or callouts last."
  ];

  if (renderMode === "none") {
    return {
      renderMode,
      safeArea,
      canvasWidth: input.targetWidth,
      canvasHeight: input.targetHeight,
      blocks: [],
      rules: [...rules, "No ecommerce copy should be rendered or overlaid for this image."]
    };
  }

  return {
    renderMode,
    safeArea,
    canvasWidth: input.targetWidth,
    canvasHeight: input.targetHeight,
    blocks: layoutBlocksForRole(input.role, input.copy),
    rules
  };
}

function buildImagePrompt(input: {
  platform: CommercePlatform;
  category: ApparelCategory;
  role: SuiteImageRole;
  label: string;
  productAnalysis: ProductAnalysis;
  sellingPoint?: ProductSellingPoint;
  composition: SuiteCompositionRule;
  textLayout: SuiteTextLayout;
  userPrompt?: string;
  referenceStyleGuidance?: string;
}): string {
  const pointText = input.sellingPoint ? `${input.sellingPoint.title}: ${input.sellingPoint.description}` : "accurate product identity";
  const textInstruction =
    input.textLayout.renderMode === "model_embedded"
      ? `Use only the planned short Chinese copy in the ${input.textLayout.safeArea} area; keep it legible and correctly spelled.`
      : input.textLayout.renderMode === "external_overlay"
        ? `Do not render text in the image; leave a clean ${input.textLayout.safeArea} area for later external copy overlay.`
        : "No text area is required; keep the image clean.";

  return [
    `Create ${input.label} for ${platformLabels[input.platform]} commerce.`,
    `Product understanding: ${input.productAnalysis.visualUnderstanding.sourceImageSummary}`,
    `Identity anchors: ${input.productAnalysis.visualUnderstanding.productIdentityAnchors.join("; ")}.`,
    `Main selling point to express visually: ${pointText}.`,
    `Composition rules: ${input.composition.subjectPlacement}; ${input.composition.camera}; ${input.composition.background}; ${input.composition.lighting}.`,
    input.referenceStyleGuidance,
    textInstruction,
    input.userPrompt?.trim() ? `Merchant extra intent: ${input.userPrompt.trim()}.` : ""
  ].filter(Boolean).join(" ");
}

function selectSellingPoint(points: ProductSellingPoint[], role: SuiteImageRole, index: number): ProductSellingPoint | undefined {
  const byType: Partial<Record<SuiteImageRole, ProductSellingPoint["type"][]>> = {
    material_detail: ["material", "quality", "comfort"],
    craft_detail: ["design", "quality", "function"],
    model_fit: ["fit", "comfort", "scene"],
    key_features: ["material", "fit", "design", "function"],
    single_feature: ["design", "fit", "function"],
    scene_hero: ["scene", "comfort", "fit"],
    size_info: ["fit", "comfort", "function"],
    trust_footer: ["quality", "material", "function"]
  };
  const types = byType[role];
  if (types) {
    const matched = points.find((point) => types.includes(point.type));
    if (matched) return matched;
  }
  return points[index % Math.max(points.length, 1)];
}

function referencesForRole(role: SuiteImageRole): SuiteReferenceRequirement[] {
  const shared: SuiteReferenceRequirement[] = [
    { kind: "source_product", required: true, source: "uploaded product image", purpose: "lock exact product shape, color, material, logo-like marks and construction details" },
    { kind: "all_source_angles", required: false, source: "uploaded multi-angle product images", purpose: "resolve side, back, scale and hidden construction details when available" }
  ];
  if (role === "material_detail" || role === "craft_detail") {
    return [...shared, { kind: "material_crop", required: false, source: "detected product detail crop", purpose: "guide bag material, zipper, stitching, hardware, lining, edge paint or finish close-up" }];
  }
  if (role === "size_info") {
    return [{ kind: "source_product", required: true, source: "uploaded product image or merchant size data", purpose: "keep size/spec explanation tied to the real product without inventing measurements" }];
  }
  if (role === "model_fit" || role === "scene_hero" || role === "mobile_long" || role === "detail_header") {
    return [...shared, { kind: "model_reference", required: false, source: "selected custom model image", purpose: "preserve selected model identity when provided" }];
  }
  return shared;
}

function masksForRole(role: SuiteImageRole, renderMode: TextRenderMode): SuiteMaskRequirement[] {
  const masks: SuiteMaskRequirement[] = [
    { kind: "subject_cutout", required: role === "white_hero" || role === "detail_white" || role === "sku_color", target: "product subject", purpose: "separate product from old background while preserving edges" },
    { kind: "product_keepout", required: true, target: "product silhouette and important details", purpose: "prevent overlays or generated props from covering the product" },
    { kind: "background_replace", required: role !== "material_detail" && role !== "craft_detail", target: "background", purpose: "replace source background with role-specific clean commerce scene" }
  ];
  if (renderMode !== "none") {
    masks.push({ kind: "text_safe_area", required: true, target: "planned copy area", purpose: "reserve quiet low-detail space for headline, subtitle and callouts" });
  }
  if (role === "material_detail" || role === "craft_detail") {
    masks.push({ kind: "detail_focus", required: true, target: "bag material, zipper, stitching, handle, strap, buckle, hardware, lining or finish detail", purpose: "focus generation on the selected feature area without changing product identity" });
  }
  return masks;
}

function compositionForRole(role: SuiteImageRole, analysis: ProductAnalysis, surface: SuiteSurface): SuiteCompositionRule {
  const placement: Record<SuiteImageRole, string> = {
    white_hero: "centered full product with generous margins and balanced shadow",
    detail_white: "centered product display with clear edge readability",
    scene_hero: "product or model placed slightly off-center with copy-safe negative space",
    studio_hero: "front or three-quarter studio view with complete silhouette",
    mobile_long: "vertical full-product or full-body composition with strong top-to-bottom readability",
    side_back: "side, back or three-quarter supplementary angle with structure visible",
    key_features: "product on one side and calm feature-label area on the other side",
    single_feature: "one feature detail emphasized with simple product context",
    material_detail: "macro crop of bag material, lining, zipper area or surface with original color fidelity",
    model_fit: "carrying-fit pose with bag-forward styling coverage, natural body scale and clear handle/strap placement",
    detail_header: "campaign-like first-screen poster with product dominant and clean no-text composition",
    craft_detail: "close detail composition around bag construction, zipper, stitching, handle, strap, buckle, lining or hardware",
    sku_color: "clean SKU display with color accuracy and repeatable alignment",
    size_info: "structured size/specification area with product scale reference and quiet table-safe space",
    trust_footer: "clean closing composition with premium material trust mood"
  };

  const backgrounds: Record<SuiteImageRole, string> = {
    white_hero: "pure white or very light gray marketplace background",
    detail_white: "clean white detail-page background",
    scene_hero: `${analysis.targetScenes[0] ?? "daily lifestyle"} commerce scene`,
    studio_hero: "controlled commercial studio background",
    mobile_long: "clean vertical mobile ecommerce background",
    side_back: "simple studio or neutral environment",
    key_features: "low-detail background with open copy area",
    single_feature: "minimal product-detail background",
    material_detail: "soft macro background from the bag material itself",
    model_fit: `${analysis.targetScenes[0] ?? "daily wear"} carrying fit-inspection setting`,
    detail_header: surface === "detail" ? "richer Tmall-style detail-page campaign scene" : "premium commerce hero scene",
    craft_detail: "macro construction detail background",
    sku_color: "clean white or pale gray SKU comparison background",
    size_info: "clean information-graphic background with subtle product context",
    trust_footer: "calm premium closing background"
  };

  return {
    subjectPlacement: placement[role],
    camera: role === "material_detail" || role === "craft_detail" ? "macro lens close-up" : role === "size_info" ? "flat clean product-and-info composition" : role === "mobile_long" ? "vertical 50mm full-product framing" : "commercial 35-70mm ecommerce framing",
    background: backgrounds[role],
    lighting: role === "material_detail" || role === "craft_detail" ? "soft grazing light that reveals material texture, zipper structure, hardware and stitching" : "soft commercial lighting with natural shadows",
    overlayPolicy: textRenderModeForRole(role) === "external_overlay" ? "leave copy-safe area empty for later overlay" : textRenderModeForRole(role) === "model_embedded" ? "allow only planned short poster typography" : "no overlay area",
    compositeRules: [
      "Use uploaded product as the source of truth for all identity details.",
      "Keep product color and material consistent across the suite.",
      "Do not add prices, QR codes, third-party logos, platform logos or unsupported certification marks."
    ]
  };
}

function layoutBlocksForRole(role: SuiteImageRole, copy: SuiteCopywritingBlock): SuiteTextBlock[] {
  const safeArea = safeAreaForRole(role);
  const headline = block("headline", "headline", copy.headline, safeArea, 8, 8, 58, 11, "display", 14);
  const subtitle = block("subtitle", "subtitle", copy.subtitle, safeArea, 8, 20, 58, 8, "body", 22);
  const firstBadge = copy.badges[0] ? block("badge-1", "badge", copy.badges[0], safeArea, 8, 31, 20, 6, "caption", 8) : undefined;
  const secondBadge = copy.badges[1] ? block("badge-2", "badge", copy.badges[1], safeArea, 30, 31, 20, 6, "caption", 8) : undefined;

  if (role === "material_detail" || role === "craft_detail") {
    return [
      block("headline", "headline", copy.headline, "middle_left", 8, 38, 42, 10, "display", 12),
      block("callout-1", "callout", copy.callouts[0] ?? copy.subtitle, "middle_left", 8, 50, 36, 7, "body", 12)
    ];
  }

  if (role === "key_features") {
    return [
      headline,
      ...copy.callouts.slice(0, 3).map((text, index) => block(`callout-${index + 1}`, "callout", text, "middle_right", 58, 24 + index * 14, 32, 8, "body", 12))
    ];
  }

  if (role === "trust_footer") {
    return [
      block("headline", "headline", copy.headline, "top_center", 22, 10, 56, 10, "display", 12),
      block("subtitle", "subtitle", copy.subtitle, "top_center", 22, 22, 56, 7, "body", 18)
    ];
  }

  if (role === "size_info") {
    return [
      block("headline", "headline", copy.headline, "top_center", 20, 10, 60, 10, "display", 12),
      block("subtitle", "subtitle", copy.subtitle, "top_center", 18, 22, 64, 8, "body", 18),
      ...copy.callouts.slice(0, 2).map((text, index) => block(`metric-${index + 1}`, "metric", text, "middle_left", 14 + index * 34, 42, 28, 9, "number", 10))
    ];
  }

  return [headline, subtitle, firstBadge, secondBadge].filter((item): item is SuiteTextBlock => Boolean(item));
}

function block(
  id: string,
  kind: TextBlockKind,
  text: string,
  anchor: SuiteTextBlock["anchor"],
  x: number,
  y: number,
  width: number,
  height: number,
  fontRole: SuiteTextBlock["fontRole"],
  maxChars: number
): SuiteTextBlock {
  return {
    id,
    kind,
    text,
    anchor,
    x,
    y,
    width,
    height,
    align: anchor.includes("right") ? "right" : anchor.includes("center") ? "center" : "left",
    maxChars,
    fontRole
  };
}

function textRenderModeForRole(role: SuiteImageRole): TextRenderMode {
  if (role === "studio_hero" || role === "model_fit" || role === "detail_white" || role === "side_back" || role === "sku_color") return "none";
  if (role === "detail_header") return "model_embedded";
  return "external_overlay";
}

function safeAreaForRole(role: SuiteImageRole): SuiteTextBlock["anchor"] {
  const safeAreas: Partial<Record<SuiteImageRole, SuiteTextBlock["anchor"]>> = {
    white_hero: "top_left",
    scene_hero: "top_right",
    mobile_long: "top_left",
    key_features: "middle_right",
    single_feature: "middle_left",
    material_detail: "middle_left",
    craft_detail: "middle_left",
    detail_header: "top_left",
    size_info: "top_center",
    trust_footer: "top_center"
  };
  return safeAreas[role] ?? "top_left";
}

function proofPointsForRole(role: SuiteImageRole, analysis: ProductAnalysis): string[] {
  if (role === "trust_footer") return ["材质可信", "做工清楚", "细节可验"];
  if (role === "sku_color") return [analysis.color, "同款同版", "色差可控"];
  if (role === "size_info") return ["尺寸容量清楚", "脚型适配", "购买少纠结"];
  return analysis.sellingPoints.slice(0, 3).map((item) => item.title);
}

function copyTone(platform: CommercePlatform, surface: SuiteSurface, styleLabels?: string[]): string {
  const styles = styleLabels?.filter(Boolean).join(" / ");
  const surfaceTone = surface === "detail" ? "detail-page narrative, clear hierarchy" : "listing suite, quick conversion";
  return `${platformLabels[platform]} ${surfaceTone}${styles ? `, style: ${styles}` : ""}`;
}

function compactText(value: string | undefined, maxLength: number): string {
  const normalized = (value ?? "").replace(/\s+/g, "").trim();
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength);
}
