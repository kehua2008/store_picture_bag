import {
  categoryLabels,
  categoryImageTypeDirection,
  categoryProductIdentityFocus,
  defaultSceneVariant,
  findPlatformSpec,
  findSpecImageType,
  imageTypeForCategory,
  modelAgeRangeLabels,
  modelGenderLabels,
  modelHairStyleLabels,
  modelEthnicityPromptLabels,
  modelProfileLabels,
  modelSkinToneLabels,
  platformSpecs,
  platformLabels,
  resolveAllowedSize,
  resolveProviderSizeForTarget,
  sceneVariantLabels,
  sceneLabels,
  type ApparelCategory,
  type ApparelScene,
  type CommercePlatform,
  type ModelAgeRange,
  type ModelGender,
  type ModelHairStyle,
  type ModelMode,
  type ModelProfile,
  type ModelSkinTone,
  type SceneVariant,
  type SizePreset
} from "../apparel/options";
import type { ProductAnalysis } from "../suites/productAnalysis";
import { buildSuiteCreativePromptSection, type SuiteCreativePlanItem } from "../suites/suiteCreativePlan";
import type { SuiteImageRole } from "../suites/suitePresets";
import type { SuiteModuleConfig } from "../jobs/generationJobService";
import { buildCommerceVisualStrategy } from "./commerceVisualStrategy";
import { buildSuitePromptSection } from "./suitePromptTemplates";
import { findTopSellerStylePreset } from "./topSellerStylePresets";
import {
  apparelForbiddenContentRule,
  apparelGarmentFitRule,
  apparelHumanAnatomyRule,
  apparelIdentityLock,
  apparelCustomModelConsistencyRule,
  apparelModelDetailRule,
  apparelModelDirection,
  apparelNegativePrompt,
  apparelPosterForbiddenContentRule,
  apparelPosterNegativePrompt,
  apparelPlatformRules,
  apparelProductSourceRule,
  apparelSceneDirections
} from "./promptTemplates";
import type { PromptRecipe } from "./recipes";

export interface ApparelPromptInput {
  platform: CommercePlatform;
  category: ApparelCategory;
  productCategoryId?: string;
  productCategoryLabel?: string;
  scene: ApparelScene;
  sceneVariant?: SceneVariant;
  size: SizePreset | string;
  modelProfile?: ModelProfile;
  specId?: string;
  imageTypeId?: string;
  targetWidth?: number;
  targetHeight?: number;
  customSpecName?: string;
  modelMode?: ModelMode;
  modelGender?: ModelGender;
  modelAgeRange?: ModelAgeRange;
  modelSkinTone?: ModelSkinTone;
  modelHairStyle?: ModelHairStyle;
  customModelId?: string;
  customModelName?: string;
  posterTemplateId?: string;
  posterTitle?: string;
  posterSubtitle?: string;
  posterBullets?: string[];
  topSellerStyleId?: string;
  moduleCopy?: {
    imageTypeId: string;
    imageTypeLabel: string;
    title: string;
    subtitle: string;
    bullets: string[];
    templateId: string;
  };
  customStylePrompts?: string[];
  styleReferenceCount?: number;
  productGroupingMode?: "per_image" | "single_product_multi_angle" | "outfit_combo";
  productReferenceRoles?: Array<"top_outerwear" | "bottom" | "shoes" | "hat_accessory" | "bag" | "other">;
  userPrompt?: string;
  suiteRole?: SuiteImageRole;
  productAnalysis?: ProductAnalysis;
  suiteCreativeItem?: SuiteCreativePlanItem;
  suiteModuleConfig?: SuiteModuleConfig;
  colorGroupLabel?: string;
  shotLabel?: string;
  styleVariationIndex?: number;
  styleVariationTotal?: number;
}

export function buildApparelPromptRecipe(input: ApparelPromptInput): PromptRecipe {
  const specPreset = input.specId ? findPlatformSpec(input.specId, input.platform) : undefined;
  const rawImageTypePreset = specPreset && input.imageTypeId ? findSpecImageType(specPreset, input.imageTypeId) : undefined;
  const imageTypePreset = rawImageTypePreset ? imageTypeForCategory(rawImageTypePreset, input.category, input.productCategoryId) : undefined;
  const targetWidth = input.targetWidth ?? specPreset?.targetWidth;
  const targetHeight = input.targetHeight ?? specPreset?.targetHeight;
  const size = targetWidth && targetHeight ? resolveProviderSizeForTarget(targetWidth, targetHeight) : resolveAllowedSize(input.size);
  const platform = platformLabels[input.platform];
  const spec = platformSpecs[input.platform];
  const category = categoryLabels[input.category];
  const productCategoryText = input.productCategoryLabel?.trim() ? ` Specific product subcategory: ${input.productCategoryLabel.trim()}.` : "";
  const topSellerStyle = findTopSellerStylePreset(input.topSellerStyleId);
  const hasCustomStyle = Boolean(input.customStylePrompts?.length);
  const selectedScene = imageTypePreset?.scene ?? input.scene;
  const scene = sceneLabels[selectedScene];
  const sceneVariant = imageTypePreset?.sceneVariant ?? input.sceneVariant ?? defaultSceneVariant(selectedScene);
  const styleSceneOverridesDefault = Boolean((topSellerStyle || hasCustomStyle) && styleOverridesDefaultScene(imageTypePreset?.id ?? input.imageTypeId));
  const sceneText = styleSceneOverridesDefault
    ? topSellerStyle
      ? `Style-directed ecommerce scene controlled by ${topSellerStyle.label}; do not use the generic ${scene} / ${sceneVariantLabels[sceneVariant]} default unless it matches the selected style matrix.`
      : `Custom reference style controls the ecommerce scene; do not use the generic ${scene} / ${sceneVariantLabels[sceneVariant]} default unless it matches the selected reference style matrix.`
    : `Scene: ${scene}. Sub-scene: ${sceneVariantLabels[sceneVariant]}.`;
  const modelProfile = input.modelMode === "no_model" ? "product_only" : input.modelProfile ?? "asian_female";
  const modelDetailText = input.modelMode === "model"
    ? [
        apparelModelDetailRule,
        input.modelGender ? `Model type: ${modelGenderLabels[input.modelGender]}.` : "",
        input.modelAgeRange ? `Age impression: ${modelAgeRangeLabels[input.modelAgeRange]}.` : "",
        input.modelSkinTone ? `Model ethnicity style: ${modelSkinToneLabels[input.modelSkinTone]}. ${modelEthnicityPromptLabels[input.modelSkinTone]}.` : "",
        input.modelHairStyle ? `Hairstyle: ${modelHairStyleLabels[input.modelHairStyle]}.` : ""
      ].filter(Boolean).join(" ")
    : "";
  const isPosterImage = imageTypePreset?.id === "detail_header_poster";
  const posterTextRequested = isPosterImage && Boolean(input.moduleCopy || input.posterTitle?.trim() || input.posterSubtitle?.trim() || input.posterBullets?.some((item) => item.trim()));
  const categoryImageTypeText = imageTypePreset && (!isPosterImage || posterTextRequested)
    ? categoryImageTypeDirection(input.category, imageTypePreset.id, input.productCategoryId) ?? ""
    : isPosterImage
      ? "Create a Tmall-style detail-page first-screen poster image: rich brand-campaign mood, elevated scene design, layered but clean background, vivid but tasteful color accents, complete product visibility, and no text overlays unless merchant copy is explicitly provided."
      : "";
  const imageTypeText = imageTypePreset
    ? `Image type: ${imageTypePreset.label}. Image type goal: ${imageTypePreset.description}. ${categoryImageTypeText}`
    : "";
  const imageTypeBoundaryText = buildImageTypeBoundaryText(imageTypePreset?.id ?? input.imageTypeId, posterTextRequested);
  const posterSafeAreaText = posterTextRequested
    ? posterSafeAreaDirection(input.moduleCopy?.templateId ?? input.posterTemplateId)
    : "";
  const moduleCopyText = buildModuleCopyText({
    imageTypeId: imageTypePreset?.id ?? input.imageTypeId,
    copy: input.moduleCopy
  });
  const posterTypographyText = posterTextRequested
    ? posterTypographyDirection({
        platform: input.platform,
        category: input.category,
        title: input.moduleCopy?.title ?? input.posterTitle,
        subtitle: input.moduleCopy?.subtitle ?? input.posterSubtitle,
        bullets: input.moduleCopy?.bullets ?? input.posterBullets
      })
    : "";
  const suitePromptText = buildSuitePromptSection({
    platform: input.platform,
    role: input.suiteRole,
    productAnalysis: input.productAnalysis,
    allowTextOverlay: posterTextRequested
  });
  const suiteCreativePlanText = buildSuiteCreativePromptSection(input.suiteCreativeItem);
  const suiteModuleControlText = buildSuiteModuleControlText({
    role: input.suiteRole,
    config: input.suiteModuleConfig,
    colorGroupLabel: input.colorGroupLabel,
    shotLabel: input.shotLabel
  });
  const targetText =
    targetWidth && targetHeight
      ? `Target commerce specification: ${input.customSpecName ?? specPreset?.label ?? "custom"} ${targetWidth}x${targetHeight}. Provider render canvas: ${size.providerSize}.`
      : `Output size: ${size.providerSize}.`;
  const customModelText =
    input.customModelId && input.customModelName
      ? `Custom model reference selected: ${input.customModelName} (${input.customModelId}). ${apparelCustomModelConsistencyRule}`
      : "";
  const topSellerStyleText = topSellerStyle
    ? [
        `Top merchant hit-style preset: ${topSellerStyle.label}.`,
        "STYLE OVERRIDE: this selected style is the primary art-direction system for background, lighting, camera, pose, palette, prop restraint, retouching mood and commerce intensity.",
        "If the generic image type scene, platform scene, model default pose, or previous scene label conflicts with the selected style, the selected style wins unless the role is strict white/SKU or macro detail.",
        topSellerStyle.direction,
        "Style separation mandate: the selected style must visibly control the palette, background, camera angle, lighting, pose and styling attitude. Do not fall back to generic neutral studio, generic street wall, beige building facade, or repeated lookbook template unless that exact environment is explicitly listed in the selected style variables."
      ].join(" ")
    : "";
  const customStyleText = input.customStylePrompts?.length
    ? [
        `Custom reference style reconstruction: ${input.customStylePrompts.map((item) => item.trim()).filter(Boolean).join(" ")}`,
        input.styleReferenceCount
          ? `The attached ${input.styleReferenceCount} style reference image(s) are style-only references and appear after the product reference image; use them only for background, environment, lighting, camera, composition, color treatment, scene styling and commercial retouching.`
          : "",
        "CUSTOM STYLE OVERRIDE: the analyzed reference style prompt controls only environment, background, lighting, camera, composition, color treatment, scene styling and commercial retouching for this one planned item.",
        "Do not merge multiple custom styles into one generic result. This item must use only its own custom style prompt.",
        "Do not copy unrelated objects, logos, text, props, people, or product identity from style reference images. Never borrow bag material, logo-like marks, silhouette, print, colorway, label, pattern, handle, strap, zipper path, hardware, pocket layout, lining or construction from a style reference image."
      ].join(" ")
    : "";
  const commerceVisualStrategyText = buildCommerceVisualStrategy({
    platform: input.platform,
    category: input.category,
    imageTypeId: imageTypePreset?.id ?? input.imageTypeId,
    style: topSellerStyle,
    suiteRole: input.suiteRole,
    styleVariationIndex: input.styleVariationIndex,
    styleVariationTotal: input.styleVariationTotal,
    referenceStyleGuidanceDisabled: Boolean(input.customStylePrompts?.length),
    allowTextOverlay: posterTextRequested
  });
  const userPromptText = input.userPrompt?.trim()
    ? `MERCHANT MUST-FOLLOW EXTRA REQUIREMENT: ${input.userPrompt.trim()}. Optional merchant extra instruction compatibility label: this is no longer optional; follow the merchant requirement as a high-priority instruction. Only product identity preservation, platform compliance, model decency, and safety rules may override it.`
    : "";
  const categoryStabilityText = buildCategoryStabilityText({
    category: input.category,
    productCategoryId: input.productCategoryId,
    imageTypeId: imageTypePreset?.id ?? input.imageTypeId
  });
  const outfitReferenceText = buildOutfitReferenceText({
    productGroupingMode: input.productGroupingMode,
    productReferenceRoles: input.productReferenceRoles
  });
  const sceneDirectionText = hasCustomStyle
    ? `Custom reference style scene direction: treat the analyzed style prompt as the primary art-direction system for background, layout, lighting, camera, composition, palette, prop restraint and commercial retouching. Do not fall back to the generic ${scene} / ${sceneVariantLabels[sceneVariant]} template unless it matches the reference style matrix.`
    : apparelSceneDirections[selectedScene];
  const posterTextException = posterTextRequested
    ? "Poster exception: this selected detail-page header poster should include only the merchant-provided short ecommerce typography as part of the image; this exception overrides generic no-text listing rules, while still forbidding prices, QR codes, URLs, watermarks, and third-party logos."
    : "";
  const forbiddenContentRule = posterTextRequested
    ? apparelPosterForbiddenContentRule
    : input.moduleCopy
      ? "Detail-module text exception: short clean typography is allowed only for the selected module copy. Do not add watermark, price, discount badge, QR code, URL, border, collage layout, old campaign banner, dense promotional copy, platform logo, third-party logo, messy background, over-retouched face, deformed limbs, duplicate bodies, extra fingers, unrelated props, or text beyond the provided short title, subtitle and selling tags."
      : apparelForbiddenContentRule;
  const providerPrompt = [
    apparelIdentityLock,
    categoryProductIdentityFocus(input.category, input.productCategoryId),
    `Generate a merchant-ready ecommerce product image for ${platform}.`,
    `Business surface: ${spec.businessSurface}. Platform goal: ${spec.primaryGoal}.`,
    specPreset ? `Platform specification: ${specPreset.label}. Asset group: ${specPreset.assetGroup}. Source note: ${specPreset.sourceNote}.` : "",
    imageTypeText,
    imageTypeBoundaryText,
    suitePromptText,
    suiteCreativePlanText,
    suiteModuleControlText,
    posterSafeAreaText,
    posterTypographyText,
    moduleCopyText,
    `Category: ${category}.${productCategoryText} ${sceneText}`,
    sceneDirectionText,
    apparelModelDirection(modelProfile),
    modelDetailText,
    customModelText,
    topSellerStyleText,
    customStyleText,
    commerceVisualStrategyText,
    categoryStabilityText,
    outfitReferenceText,
    userPromptText,
    apparelPlatformRules[input.platform],
    posterTextException,
    `Platform compliance constraints: ${spec.compliance.join(", ")}.`,
    `${targetText} Use realistic photography, accurate bag material behavior, natural body/bag proportions, sharp focus, balanced exposure, and clean professional retouching.`,
    apparelProductSourceRule,
    apparelGarmentFitRule,
    apparelHumanAnatomyRule,
    forbiddenContentRule
  ].filter(Boolean).join(" ");

  return {
    version: "vipshop-apparel-v1",
    userVisibleSummary: `${platform}${category}${imageTypePreset?.label ?? sceneVariantLabels[sceneVariant]}，${modelProfileLabels[modelProfile]}，${targetWidth && targetHeight ? `${targetWidth}x${targetHeight}` : size.providerSize}`,
    identityLock: apparelIdentityLock,
    providerPrompt,
    negativePrompt: posterTextRequested || input.moduleCopy ? apparelPosterNegativePrompt : apparelNegativePrompt,
    target: {
      width: size.width,
      height: size.height,
      assetType: input.scene === "white" ? "white_bg" : "main_scene"
    }
  };
}

function buildImageTypeBoundaryText(imageTypeId?: string, allowTextOverlay = false): string {
  const id = imageTypeId ?? "";
  if (id === "white_main" || id === "detail_white_product" || id.includes("white")) {
    return "Image-type hard boundary: this is a strict white-background commerce image. Use pure white or platform-safe white, keep the exact product complete and centered, do not add props, scenes, decorative set pieces, text, watermarks, badges, or lifestyle storytelling. Style references may affect only clean lighting, shadow control and retouching discipline.";
  }
  if (id === "scene_main" || id.includes("scene_lifestyle") || id.includes("feed") || id.includes("live")) {
    return "Image-type hard boundary: this is a scene image, but the uploaded product must remain the first visual subject. The environment, model action, props, style preset and reference mood may support conversion only; they must not cover, shrink, recolor, redesign, or visually compete with the product.";
  }
  if (id === "studio_main") {
    return "Image-type hard boundary: this is an indoor photography-studio main image. Keep it inside a controlled studio set with paper sweep, matte backdrop, simple plinth, bags riser, stool, prop cube, or clean studio floor. Do not generate street scenes, cafes, home rooms, windowside lifestyle spaces, outdoor architecture, plants, landscapes, or complex environmental backgrounds.";
  }
  if (id === "detail_header_poster") {
    return allowTextOverlay
      ? "Image-type hard boundary: this is a detail-page header poster. Build a first-screen ecommerce campaign mood while keeping the exact product visible and unobstructed. Merchant-provided short Chinese title and selling-point typography is allowed only in quiet safe areas; do not add prices, QR codes, URLs, platform logos, watermarks, or dense promotional blocks."
      : "Image-type hard boundary: this is a detail-page header poster. Build a first-screen ecommerce campaign mood while keeping the exact product visible and unobstructed. Do not add any title, selling-point typography, text labels, badges, prices, QR codes, URLs, platform logos, watermarks, or dense promotional blocks.";
  }
  if (id === "detail_texture") {
    return "Image-type hard boundary: this is a bag material texture close-up. Show a close, inspectable crop of the real bag material, leather/canvas/nylon/suede/woven surface, stitching, edge paint, panel seam, quilting, perforation, color blocking, lining or finish. Do not turn it into a full-body outfit image, generic model photo, broad lifestyle scene, or distant product shot.";
  }
  if (id === "detail_craft") {
    return "Image-type hard boundary: this is a bag craftsmanship close-up. Focus on construction details such as zipper teeth, puller, clasp, buckle, lock, handle base, strap attachment, metal feet, trolley wheel or handle when present, stitching, edge finishing, trims, lining, pocket structure, hardware, seams or bag-bottom edges. Do not turn it into a full-body outfit image or generic scene image.";
  }
  if (id === "detail_merchant_info_graphic") {
    return "Image-type hard boundary: this is a merchant information graphic rewrite. Use only the uploaded size/SKU/parameter reference image as the data source, preserve every readable value and relationship exactly, do not call model-wearing logic, and do not invent missing merchant data.";
  }
  return "";
}

function buildModuleCopyText(input: {
  imageTypeId?: string;
  copy?: ApparelPromptInput["moduleCopy"];
}): string {
  if (!input.copy || input.imageTypeId === "detail_header_poster") return "";
  const title = input.copy.title.trim();
  const subtitle = input.copy.subtitle.trim();
  const bullets = input.copy.bullets.map((item) => item.trim()).filter(Boolean).slice(0, 2);
  const copy = [
    title ? `title "${title}"` : undefined,
    subtitle ? `subtitle "${subtitle}"` : undefined,
    bullets.length ? `selling tags ${bullets.map((item) => `"${item}"`).join(", ")}` : undefined
  ].filter(Boolean).join("; ");

  return [
    `Detail module text input is enabled for ${input.copy.imageTypeLabel}.`,
    copy ? `Render this short Chinese ecommerce copy directly inside this detail module: ${copy}.` : "Render one short Chinese ecommerce title and one or two concise selling tags based on the product and module role.",
    "Text policy for this selected module: short, clean, correctly spelled Chinese typography is allowed and expected; place it in a quiet safe area, keep it legible, aligned, and secondary to the product. Do not add prices, QR codes, URLs, platform logos, watermarks, dense promotional copy, or text over key product details."
  ].join(" ");
}

function buildSuiteModuleControlText(input: {
  role?: SuiteImageRole;
  config?: SuiteModuleConfig;
  colorGroupLabel?: string;
  shotLabel?: string;
}): string {
  if (!input.role && !input.config && !input.colorGroupLabel && !input.shotLabel) return "";
  const notes = input.config?.detailNotes?.trim();
  const selectedColors = input.config?.selectedColorGroupIds?.length
    ? `Selected color group ids: ${input.config.selectedColorGroupIds.join(", ")}.`
    : "";
  const modelShotRule = input.role === "model_fit"
    ? [
        "Model-scene module hard rule: generate exactly one model wearing exactly one SKU color in this image.",
        "Do not place multiple models together. Do not show multiple colorways in the same model-scene image.",
        input.colorGroupLabel ? `The only SKU color for this image is ${input.colorGroupLabel}.` : "",
        input.shotLabel ? `Requested wearing angle / shot: ${input.shotLabel}.` : "",
        "Use a hand-carry, shoulder, crossbody, backpack, luggage-pulling, product-only, hand-operation, or bag lifestyle scene unless the requested shot explicitly says macro detail; keep the bag identity faithful to this color group's reference images."
      ].filter(Boolean).join(" ")
    : "";
  const merchantRule = input.role === "size_info"
    ? "Size-information module rule: if a merchant information image is attached as the reference, preserve all readable size, measurement, height/weight, SKU or parameter data exactly and only beautify the layout; do not invent missing numbers."
    : "";

  return [
    "Suite module merchant controls are enabled for this exact module.",
    input.config?.label ? `Module label: ${input.config.label}.` : "",
    selectedColors,
    notes ? `Merchant module notes: ${notes}.` : "",
    modelShotRule,
    merchantRule
  ].filter(Boolean).join(" ");
}

function buildOutfitReferenceText(input: {
  productGroupingMode?: "per_image" | "single_product_multi_angle" | "outfit_combo";
  productReferenceRoles?: Array<"top_outerwear" | "bottom" | "shoes" | "hat_accessory" | "bag" | "other">;
}): string {
  if (input.productGroupingMode !== "outfit_combo") return "";
  const roles = input.productReferenceRoles ?? [];
  const roleLabels: Record<NonNullable<typeof roles[number]>, string> = {
    top_outerwear: "styling support item for a bag outfit, keep secondary to the bag",
    bottom: "lower-body styling support such as pants or skirt, keep secondary to the bag",
    shoes: "shoe styling support item, worn on the feet and kept secondary to the bag",
    hat_accessory: "hat, scarf, belt, watch, jewelry or other styling accessory, worn in its natural body position",
    bag: "bag, carried or worn naturally by hand, shoulder or crossbody strap",
    other: "additional outfit item, placed naturally without replacing the other uploaded products"
  };
  const orderedRoles = roles.length
    ? roles.map((role, index) => `reference image ${index + 1}: ${roleLabels[role] ?? roleLabels.other}`).join("; ")
    : "use each uploaded reference image as a separate outfit item";

  return [
    `Outfit-combination rule: ${orderedRoles}.`,
    "Every uploaded outfit item is required and must appear in the final image unless it is physically impossible; do not randomly omit items, do not choose only one or two items, and do not replace one uploaded item with another.",
    "Place each item on the correct body part: tops on torso, bottoms on lower body, shoes on feet, bags carried or worn naturally, and accessories in their natural styling position.",
    "Preserve each uploaded item's own color, material, pattern, silhouette, trims, hardware and visible marks while making the complete outfit look coherent and realistic."
  ].join(" ");
}

function buildCategoryStabilityText(input: { category: ApparelCategory; productCategoryId?: string; imageTypeId?: string }): string {
  const productId = input.productCategoryId ?? "";
  const imageTypeId = input.imageTypeId ?? "";
  const isBottom = /pants|denim|skirt|bottom/.test(productId);
  const isShoes = false;
  const isBags = input.category === "bags";
  const rules: string[] = [];

  if (isBottom) {
    rules.push("Bag framing rule: show the bag product completely and clearly. The front panel, side depth, handles, shoulder straps, zipper path, hardware, pocket layout, bag bottom, material texture, stitching and colorway must be visible. Do not turn a bag product into a fashion crop where the bag is small or hidden.");
  }

  if (isShoes) {
    rules.push("Bag commercial lighting rule: keep bags bright, clear, and inspectable with clean ecommerce fill light. Front panel, side depth, handles, shoulder straps, zipper path, hardware, pockets, bag bottom and material texture must be visible. Avoid dark underexposure, muddy shadows, black crushed details, or hiding the bag on dark ground.");
  }

  if (isBags) {
    rules.push("Bag commercial readability rule: keep the bag bright, clear, and inspectable with clean ecommerce fill light. Bag silhouette, front panel, side depth, handle, shoulder strap, zipper path, buckle, lock, wheels or trolley handle when present, pockets, stitching, hardware, material texture and capacity impression must be visible. Avoid hiding the bag behind arms, hair, clothing, props, dark shadows, busy backgrounds, or unrealistic collapsed volume.");
  }

  if (imageTypeId.includes("white") || imageTypeId.includes("studio") || imageTypeId.includes("scene") || imageTypeId.includes("main")) {
    rules.push("Main-image readability rule: the product must remain the first visual priority, sharp, unobstructed, and easy to inspect; background, props, model pose, and lighting are secondary.");
  }

  return rules.join(" ");
}

function posterSafeAreaDirection(templateId?: string): string {
  if (templateId === "side-editorial") {
    return "Poster layout requirement: place generated typography in a clean low-detail side area on the left or right; keep the bag silhouette, handles, straps, hardware, material texture and carried/product view readable in the remaining area.";
  }
  if (templateId === "bottom-card") {
    return "Poster layout requirement: place generated typography in a calm lower-left or lower-right ecommerce selling-point area; do not place key bag details such as handles, strap, logo-like marks, zipper, hardware, pockets or opening under text.";
  }
  if (templateId === "detail-callout") {
    return "Poster layout requirement: create a close but readable bag detail image with one quiet corner for generated callout text; keep bag material, stitching, zipper, hardware, handle, strap, pocket or craftsmanship details sharp.";
  }
  return "Poster layout requirement: place short generated ecommerce copy in a quiet top-left or top-right corner while keeping the product or model unobstructed and centered.";
}

function styleOverridesDefaultScene(imageTypeId?: string): boolean {
  const id = imageTypeId ?? "";
  if (!id) return true;
  if (id.includes("white") || id.includes("sku") || id.includes("color")) return false;
  if (id.includes("texture") || id.includes("craft")) return false;
  return true;
}

function posterTypographyDirection(input: { platform: CommercePlatform; category: ApparelCategory; title?: string; subtitle?: string; bullets?: string[] }): string {
  const title = input.title?.trim();
  const subtitle = input.subtitle?.trim();
  const bullets = input.bullets?.map((item) => item.trim()).filter(Boolean).slice(0, 2) ?? [];
  const copy = [
    title ? `main title "${title}"` : "a short Chinese ecommerce main title based on the product",
    subtitle ? `subtitle "${subtitle}"` : "one concise Chinese selling-point subtitle",
    bullets.length ? `small selling points ${bullets.map((item) => `"${item}"`).join(", ")}` : "one or two short Chinese selling-point tags"
  ].join("; ");

  const typographyMood = posterTypographyMood(input.platform, input.category);
  const fontSystem = posterFontSystem(input.category);

  return `Generated poster typography requirement: render the following Chinese ecommerce poster copy directly inside the image: ${copy}. Typography mood: ${typographyMood}. Font system: ${fontSystem}. Typography must be clean, legible, premium, correctly spelled, aligned to the chosen layout area, and integrated with the scene like a professional Tmall detail-page hero poster.`;
}

function posterTypographyMood(platform: CommercePlatform, category: ApparelCategory): string {
  const platformMood: Record<CommercePlatform, string> = {
    vipshop: "clean premium retail",
    taobao: "content-commerce editorial",
    jd: "clear rational commerce",
    douyin: "high-impact vertical commerce",
    dewu: "premium material-first",
    pinduoduo: "direct bright conversion",
    xiaohongshu: "lifestyle seeding editorial",
    kuaishou: "direct live-commerce trust",
    wechat_channels: "restrained social-commerce trust",
    amazon: "compliance-first marketplace clarity",
    ebay: "truthful item-gallery clarity",
    walmart: "mass-retail product trust",
    etsy: "warm boutique marketplace",
    shopee: "mobile-first Southeast Asia marketplace",
    lazada: "clean mobile marketplace",
    aliexpress: "global buyer clarity",
    tiktok_shop_global: "scroll-stopping shop-card commerce",
    shopify: "brand-owned DTC editorial",
    free: "custom merchant-ready visual direction"
  };

  const categoryMood: Record<ApparelCategory, string> = {
    women: "elegant fashion lettering with soft editorial spacing",
    men: "structural and concise lettering with strong alignment",
    kids: "rounded playful lettering that still stays readable",
    shoes: "compact technical lettering with material clarity",
    bags: "refined minimal lettering with calm premium spacing",
    beauty: "clean cosmetic editorial lettering with airy ingredient spacing",
    baby: "soft rounded parent-friendly lettering with gentle hierarchy",
    home: "warm lifestyle lettering with calm domestic spacing",
    digital: "precise technology lettering with crisp modular alignment",
    food: "fresh appetizing lettering with bright shelf-ready clarity",
    sports: "active performance lettering with sharp energetic rhythm",
    jewelry: "luxury jewelry lettering with delicate premium spacing",
    auto: "technical utility lettering with strong readable alignment"
  };

  return `${platformMood[platform]}, ${categoryMood[category]}`;
}

function posterFontSystem(category: ApparelCategory): string {
  const shared =
    "choose from generic open-source or system-safe Chinese font styles only, such as modern sans, elegant serif/Songti, rounded sans, handwritten WenKai-style, condensed display sans, or high-contrast editorial serif; do not imitate a proprietary brand font";

  const categoryFont: Record<ApparelCategory, string> = {
    women: "prefer elegant serif/Songti, high-contrast editorial serif, or slim modern sans when the scene is refined",
    men: "prefer condensed display sans, structural modern sans, or restrained serif for a sharper commercial tone",
    kids: "prefer rounded sans or soft handwritten WenKai-style while keeping every character readable",
    shoes: "prefer compact technical sans or condensed display sans with clear spacing",
    bags: "prefer refined modern sans, elegant serif, or quiet editorial serif",
    beauty: "prefer airy modern sans, elegant serif, or delicate high-contrast editorial lettering",
    baby: "prefer rounded sans or soft handwritten WenKai-style with gentle spacing",
    home: "prefer warm serif, rounded sans, or calm modern sans",
    digital: "prefer precise geometric sans, compact technical sans, or modular display sans",
    food: "prefer fresh rounded sans, warm serif, or friendly handwritten style",
    sports: "prefer energetic condensed sans, technical sans, or bold modern display sans",
    jewelry: "prefer luxury serif, high-contrast editorial serif, or refined slim sans",
    auto: "prefer technical sans, condensed display sans, or strong modular sans"
  };

  return `${shared}; ${categoryFont[category]}.`;
}
