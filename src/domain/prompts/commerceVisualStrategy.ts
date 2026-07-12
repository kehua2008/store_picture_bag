import type { ApparelCategory, CommercePlatform } from "../apparel/options";
import type { SuiteImageRole } from "../suites/suitePresets";
import type { TopSellerStylePreset, VariationStrength } from "./topSellerStylePresets";
import { buildReferenceDrivenStyleGuidance } from "./referenceStyleGuidance";

export interface CommerceVisualStrategyInput {
  platform: CommercePlatform;
  category: ApparelCategory;
  imageTypeId?: string;
  style?: TopSellerStylePreset;
  suiteRole?: SuiteImageRole;
  styleVariationIndex?: number;
  styleVariationTotal?: number;
  referenceStyleGuidanceDisabled?: boolean;
  allowTextOverlay?: boolean;
}

const categoryDirections: Record<ApparelCategory, string> = {
  women:
    "Category conversion focus: emphasize women's bag silhouette, handle/strap shape, hardware, leather or fabric texture, capacity impression, elegant carry scale, and natural hand-carry, shoulder or crossbody poses that keep the bag dominant.",
  men:
    "Category conversion focus: emphasize men's bag structure, commuter capacity, laptop-friendly proportion, leather/nylon/canvas texture, zipper path, hardware, strap connection, and clean front or three-quarter bag views.",
  kids:
    "Category conversion focus: emphasize kids' and parent-child bag safety, soft structure, secure closures, bright clean background, age-appropriate carrying scale, practical storage and no adultized styling.",
  shoes:
    "Category conversion focus: emphasize bag 3/4 side view, material texture, handle/strap structure, real shadow, and optional dynamic context for commute, travel or outdoor bags.",
  bags:
    "Category conversion focus: emphasize bag silhouette, hardware, handle or strap structure, capacity impression, leather or fabric texture, and unobstructed hand-carry or shoulder-carry views.",
  beauty:
    "Category conversion focus: emphasize bottle, jar, tube or compact silhouette, texture swatch, ingredient freshness, clean vanity setting, reflective packaging control, and premium skincare or makeup credibility.",
  baby:
    "Category conversion focus: emphasize safety, softness, parent-friendly use, gentle colors, rounded props, clean nursery context, and avoid risky poses or unrealistic infant handling.",
  home:
    "Category conversion focus: emphasize material texture, room-scale lifestyle context, neat home styling, fabric weave, storage capacity, comfort, and practical daily-use scenarios.",
  digital:
    "Category conversion focus: emphasize product industrial design, screen or interface clarity, ports, scale, clean reflections, technology trust, and controlled studio lighting.",
  food:
    "Category conversion focus: emphasize freshness, appetizing color, packaging trust, ingredient close-ups, clean table setting, condensation or steam only when appropriate, and no misleading serving size.",
  sports:
    "Category conversion focus: emphasize functional material, motion readiness, outdoor or gym context, ergonomic structure, durability details, and energetic but product-first composition.",
  jewelry:
    "Category conversion focus: emphasize metal shine, gemstone clarity, scale on hand/neck/ear when useful, macro detail, clean luxury surface, and avoid overblown sparkle that hides product structure.",
  auto:
    "Category conversion focus: emphasize compatibility, installation position, material durability, vehicle context, clean technical detail, and practical use instead of decorative lifestyle clutter."
};

const platformMechanics: Record<CommercePlatform, string> = {
  vipshop:
    "Hot-item platform mechanics for 唯品会: clean discount-retail clarity, centered bag product, pale or white background, complete bags outline, SKU-friendly crop, restrained styling.",
  taobao:
    "Hot-item platform mechanics for 天猫/淘宝: click-oriented but clean, brighter background hierarchy, stronger subject occupancy, natural model energy, and visible selling-point details without text blocks.",
  jd:
    "Hot-item platform mechanics for 京东: credible standardized image, white or light gray studio, sharp texture, practical angles, minimal props, product trust first.",
  douyin:
    "Hot-item platform mechanics for 抖音: dynamic vertical commerce, motion, lifestyle depth, punchier lighting, strong first frame, product remains dominant.",
  dewu:
    "Hot-item platform mechanics for 得物: trend and material credibility, clean street or studio scenes, low clutter, detail close-ups, premium neutral palette.",
  pinduoduo:
    "Hot-item platform mechanics for 拼多多: direct recognition, large subject, bright exposure, simple background, clear product shape, no price-heavy graphics.",
  xiaohongshu:
    "Hot-item platform mechanics for 小红书: editorial lifestyle seeding, authentic lived-in scene, soft natural light, composition that feels saved/shared, product readable without posterized hard-sell graphics.",
  kuaishou:
    "Hot-item platform mechanics for 快手: live-commerce trust, direct product recognition, warm real-use context, large subject, less abstract editorial styling, no loud price graphics.",
  wechat_channels:
    "Hot-item platform mechanics for 视频号: restrained social trust, clean and credible product scene, calm lighting, friend-circle readability, avoid noisy entertainment-platform treatment.",
  amazon:
    "Hot-item platform mechanics for Amazon: compliance-first white hero for main image, product fills most of frame, crisp edges, exact scale and material; secondary images may vary lifestyle/use/detail while staying truthful.",
  ebay:
    "Hot-item platform mechanics for eBay: truthful gallery sequence, condition and angle clarity, simple backgrounds, useful scale/detail views, no borders, text or watermarks.",
  walmart:
    "Hot-item platform mechanics for Walmart: mass-retail trust, clean white hero, clear practical details, family-friendly secondary lifestyle, consistent product accuracy.",
  etsy:
    "Hot-item platform mechanics for Etsy: boutique/craft marketplace warmth, crop-safe centered product, tactile material story, small-brand taste, enough negative space for thumbnail crops.",
  shopee:
    "Hot-item platform mechanics for Shopee: mobile square thumbnail clarity, bright exposure, high product recognition, compact scene, Southeast Asia marketplace readability.",
  lazada:
    "Hot-item platform mechanics for Lazada: large clean product hero, mobile shopping clarity, practical lifestyle context, crisp detail images, avoid misleading scene claims.",
  aliexpress:
    "Hot-item platform mechanics for AliExpress: global buyer clarity, strong 1:1 product identity, simple language-free product benefits through angles, details and use context.",
  tiktok_shop_global:
    "Hot-item platform mechanics for TikTok Shop: scroll-stopping shop-card hero, clean product silhouette, strong first impression, creator-style secondary scene, no watermark or promo text.",
  shopify:
    "Hot-item platform mechanics for Shopify/DTC: brand-owned gallery cohesion, premium visual system, reusable campaign crops, stronger differentiation through scene, lighting and art direction.",
  free:
    "Hot-item platform mechanics for 通用平台: no strict platform lock; build a modern merchant-ready image using the chosen size, category and style, with high differentiation and product accuracy."
};

export function buildCommerceVisualStrategy(input: CommerceVisualStrategyInput): string {
  const imageTypeId = input.imageTypeId ?? "";
  const isStudioMain = imageTypeId === "studio_main";
  const strength = variationStrengthFor(input.platform, imageTypeId, input.suiteRole);
  const role = roleConstraintFor(imageTypeId, input.suiteRole, Boolean(input.allowTextOverlay));
  const styleVariables = input.style ? styleVariableText(input.style, strength, imageTypeId) : "";
  const styleMatrix = input.style ? buildStyleSceneMatrixDirective({ ...input, imageTypeId }) : "";
  const variationCard = input.style
    ? buildClassicStyleVariationCard({
        style: input.style,
        imageTypeId,
        suiteRole: input.suiteRole,
        variationIndex: input.styleVariationIndex ?? 0,
        variationTotal: input.styleVariationTotal
      })
    : "";
  const referenceDrivenStyle = buildReferenceDrivenStyleGuidance({
    category: input.category,
    imageTypeId,
    suiteRole: input.suiteRole,
    variationIndex: input.styleVariationIndex,
    topSellerStyle: input.style,
    disabled: Boolean(input.referenceStyleGuidanceDisabled || isStudioMain)
  });
  const studioBoundary = isStudioMain
    ? "Studio-main hard boundary: this image must remain inside a controlled photography studio. Use seamless paper, matte painted wall, plinth, bag riser, simple prop cube, or clean studio floor only. Any selected style or reference may influence palette, lighting, bag angle, carry pose, and restrained studio props, but must not introduce outdoor streets, cafes, apartments, home rooms, windowside lifestyle scenes, architecture, plants, or complex environmental backgrounds."
    : "";

  return [
    "Hot-item reference guidance: use public ecommerce reference images only as conversion-pattern guidance, never copy any specific merchant image or layout.",
    "Global conversion mechanics: single dominant bag subject, ecommerce-readable bag silhouette, accurate colorway, clean edges, realistic leather/canvas/nylon/material behavior, stable crop, clean background hierarchy, visible handles, straps, zipper path, pockets, hardware, stitching, capacity impression and construction.",
    platformMechanics[input.platform],
    categoryDirections[input.category],
    role,
    studioBoundary,
    styleVariables,
    styleMatrix,
    variationCard,
    referenceDrivenStyle,
    input.style
      ? "Selected-style dominance: when a top-merchant style is selected, the final image must first read as that style, not as the generic image type. The style controls the scene family, background material, camera feel, lighting quality, pose attitude, palette and retouching mood while the product identity remains locked."
      : "",
    input.style && !isWhiteOrSku(imageTypeId) && !imageTypeId.includes("texture") && !imageTypeId.includes("craft")
      ? "Flat-wall rejection for selected classic bag style: do not place the bag or carrying model backed against or leaning on a single plain wall, stone wall, concrete wall, color wall, beige facade or anonymous exterior surface. Use a real spatial scene with depth, foreground/background layers, floor texture, plinth, desk, corridor, travel path, trail, or a purpose-built studio set; the pose must not hide the bag."
      : "",
    "Differentiation mandate: for every generation attempt, create a distinct merchant-grade visual solution by varying one or more safe variables such as camera height, focal length feel, product angle, model pose, prop restraint, background material, light direction, depth, color temperature, or scene micro-context. Never repeat a generic studio template, generic street wall, beige building facade, back-against-wall pose, sidewalk-only lookbook, or same-pose ecommerce template unless the selected platform/image type requires strict white-background compliance.",
    `Variation strength: ${strength}. Keep product identity, platform rules, and category details fixed; vary only controlled camera, pose, scene, lighting, palette, and commerce intensity variables.`
  ].filter(Boolean).join(" ");
}

export interface ClassicStyleVariationCard {
  sceneFamily: string;
  backgroundMaterial: string;
  camera: string;
  lighting: string;
  poseOrProductAngle: string;
  palette: string;
  commerceRole: string;
  forbiddenRepetition: string;
}

export function buildStyleSceneMatrixDirective(input: {
  category: ApparelCategory;
  imageTypeId?: string;
  style?: TopSellerStylePreset;
  suiteRole?: string;
}): string {
  if (!input.style) return "";
  const imageTypeId = input.imageTypeId ?? "";
  const role = imageRoleBucket(imageTypeId, input.suiteRole);
  const base = styleSceneMatrix[input.style.id]?.[role] ?? styleSceneMatrix[input.style.id]?.main ?? defaultStyleSceneDirective(input.style);
  const category = categoryMatrixAddOn(input.category, input.style.id);
  const strictness = isWhiteOrSku(imageTypeId) || imageTypeId.includes("texture") || imageTypeId.includes("craft")
    ? "Style matrix strictness: preserve inspection clarity first; apply style through lighting, surface, palette and retouching only."
    : "Style matrix strictness: at least four visible variables must change from any generic fallback: background family, camera/focal feel, model pose or product angle, lighting quality, palette/styling system, prop restraint, and retouching mood.";

  return [
    `STYLE SCENE MATRIX for ${input.style.label} / ${role}: ${base}`,
    category,
    strictness,
    "Default-scene rewrite: if the image type says scene main, studio main, model fit, lifestyle, feed, live cover or detail poster, reinterpret that role through this style matrix. Do not satisfy it with the default street-wall or generic studio solution."
  ].filter(Boolean).join(" ");
}

type ImageRoleBucket = "main" | "scene" | "studio" | "detailPoster" | "detailFit" | "detailLifestyle" | "detail" | "white";

function imageRoleBucket(imageTypeId: string, suiteRole?: string): ImageRoleBucket {
  if (isWhiteOrSku(imageTypeId)) return "white";
  if (imageTypeId === "detail_header_poster" || suiteRole === "detail_header") return "detailPoster";
  if (imageTypeId.includes("texture") || imageTypeId.includes("craft") || imageTypeId.includes("design") || imageTypeId.includes("size")) return "detail";
  if (imageTypeId.includes("model_fit") || imageTypeId.includes("fit") || imageTypeId.includes("full_body")) return "detailFit";
  if (imageTypeId.includes("scene_lifestyle") || imageTypeId.includes("scene") || imageTypeId.includes("feed") || imageTypeId.includes("live") || suiteRole === "scene_hero") return "scene";
  if (imageTypeId.includes("studio")) return "studio";
  return "main";
}

const styleSceneMatrix: Partial<Record<TopSellerStylePreset["id"], Partial<Record<ImageRoleBucket, string>>>> = {
  old_money: {
    main: "make it a restrained high-ticket bag catalog image in a marble corridor, quiet club lounge, arched doorway or refined warm-stone luxury interior; 70-85mm editorial lens, straight verticals, calm bag-forward hand-carry, shoulder-carry, crossbody pose or product pedestal angle; premium styling can support the bag without covering it",
    scene: "scene main becomes quiet luxury bag environment, not street fashion: marble corridor, private-club lounge, arched doorway, linen curtain alcove, refined stone arcade; low-contrast soft window light; calm hand-carry, shoulder-carry, seated side-profile bag view, or slow walking with bag visible; no ordinary city sidewalk, no random beige exterior wall, no back-to-wall pose",
    studio: "studio main becomes premium catalog restraint: warm grey/ivory set, linen curtain or stone surface, 70mm lens feeling, controlled shadow, product complete and expensive-looking",
    detailPoster: "detail poster becomes high-ticket campaign: architectural arch, marble, linen, large negative space, elegant generated typography only if poster role permits it",
    detailFit: "model fit becomes luxury bag carrying image: upright composed posture, tailored styling, calm half-turn, shoulder carry, hand carry or seated side-profile bag view; handles, strap length and hardware readable",
    detailLifestyle: "lifestyle detail becomes quiet club or refined interior use scene with premium restraint and no busy props",
    detail: "detail image uses stone/linen surface, soft side light, macro leather/canvas texture, stitching, zipper, edge paint, lining or hardware trust and premium retouching",
    white: "white/SKU image uses controlled premium shadow, ivory/off-white retouching discipline, exact product inspection"
  },
  minimal_premium: {
    main: "make it minimal premium marketplace: seamless white sweep, matte plinth, minimal paper-texture set or light-gray studio; straight-on 70mm product/catalog lens; neutral front/side pose; no outdoor street, no building facade, no lifestyle sidewalk",
    scene: "scene main is reinterpreted as an ultra-minimal studio scene: seamless white or light gray sweep, matte plinth, controlled shadow, product/model centered, catalog-stillness; absolutely no street, no stone building wall, no window facade, no urban sidewalk",
    studio: "studio main must be strict minimal studio: light gray/white paper set, controlled softbox, crisp edges, neutral posture, product large and inspectable",
    detailPoster: "detail poster becomes minimal campaign: white/gray negative space, refined product silhouette, quiet typography area if allowed, no outdoor location",
    detailFit: "model fit becomes neutral bag catalog carrying: front/side/back readability, bag-forward hand or shoulder placement, simple studio floor",
    detailLifestyle: "lifestyle detail becomes minimal product-use vignette on paper/soft-gray set, not a real street scene",
    detail: "detail image uses clean paper/white surface, exact texture, controlled shadow, no decorative props",
    white: "white/SKU image remains pure inspection-first with exact color and clean edges"
  },
  korean_relaxed: {
    main: "make it soft Korean relaxed bag casual: cafe window, sunlit apartment, white curtain, pale wood floor or warm quiet sidewalk; hazy window daylight, low contrast, negative space, relaxed seated edge of chair with bag visible, shoulder carry, crossbody pose or gentle walking",
    scene: "scene main becomes soft bag lifestyle natural-light image: cafe window seating area, sunlit apartment corner with depth, white curtain set, pale wood floor, or warm quiet sidewalk crossing; relaxed pose looking down at bag, shoulder strap adjustment, opening bag, or gentle walk with bag side profile; no marble corridor, no parking garage, no harsh underpass, no rigid catalog stance, no back-to-wall pose",
    studio: "studio main becomes airy home-studio/window-light catalog: white curtain, pale wood floor, soft morning light, relaxed but product-readable posture",
    detailPoster: "detail poster becomes airy lifestyle editorial: window light, white curtain, pale wood, soft copy area if poster role permits it",
    detailFit: "model fit becomes relaxed carrying-effect image with gentle walking, seated edge, natural styling, low-contrast light",
    detailLifestyle: "lifestyle detail uses cafe/apartment/window-light scene with quiet props kept sparse",
    detail: "detail image uses pale wood or white curtain background, soft daylight, tactile material, stitching, zipper, handle, strap or hardware close-up",
    white: "white/SKU image keeps soft high-key retouching with Korean clean softness"
  },
  street_trend: {
    main: "make it high-street bag trend: metal shutter, parking garage, underpass, crosswalk, neon storefront or skateboard-like texture; lower 28-35mm camera, stronger foreground depth, bag-forward hand-carry, crossbody, backpack stance or stride",
    scene: "scene main must be energetic bag street-shot, not quiet wall lookbook: parking garage lane, underpass depth, crosswalk, neon storefront corner, rail or metal shutter as layered texture only; lower/wider camera; bag-forward stride, shoulder adjustment, hand carry or crossbody angle; no marble, no cafe softness, no beige facade, no model backed flat against a shutter or wall",
    studio: "studio main becomes streetwear bag studio with concrete/metal set, harder side light, low-angle framing and strong bag silhouette energy",
    detailPoster: "detail poster becomes high-impact street campaign with metal/concrete texture, diagonal composition, no luxury calmness",
    detailFit: "model fit shows stride, wide bag-forward stance, low-angle carry visibility, and streetwear styling while bag details stay visible",
    detailLifestyle: "lifestyle detail uses street texture, rail, shutter or garage context with product-first clarity",
    detail: "detail image uses concrete/metal texture, harder light, graphic material, zipper, strap and hardware focus",
    white: "white/SKU image keeps product inspection but may use slightly stronger contrast and streetwear retouching discipline"
  },
  gorpcore: {
    main: "make it gorpcore outdoor utility: trail entrance, rocky path, grass slope, wet pavement, campsite texture or city-park mountain feeling; practical daylight, field-test framing, action-ready pose",
    scene: "scene main must leave urban fashion wall entirely: trail entrance, rocky path, grass slope, wet pavement, campsite texture or mountain-like city park; backpack carrying, waist/shoulder strap adjustment, opening a compartment, luggage on wet pavement, or walking trail; no office, no marble, no cafe, no generic street wall",
    studio: "studio main becomes functional outdoor-studio set with stone/rubber/technical texture, practical shadows, utility styling",
    detailPoster: "detail poster becomes outdoor performance campaign with trail/campsite texture and product utility emphasis",
    detailFit: "model fit shows movement readiness, strap stability, backpack/shoulder carrying comfort, pocket access and utility styling optional",
    detailLifestyle: "lifestyle detail uses trail/campsite/park utility context with low clutter",
    detail: "detail image uses rugged stone/wet pavement/technical surface, weatherproof fabric, zipper, strap, buckle, wheel or hardware close-up",
    white: "white/SKU image keeps inspection clarity with rugged material emphasis only"
  },
  urban_commute: {
    main: "make it urban commute bag: glass office facade, elevator lobby, clean commute corner, modern desk-side studio or concrete business context; eye-level 50mm, hand-carry, shoulder-carry, backpack, laptop insertion or clean side profile",
    scene: "scene main becomes professional commute bag, not casual fashion wall: glass office facade with depth, lobby, clean street corner crossing with business context, desk-side studio, office atrium walkway; walking with tote/backpack, opening laptop compartment, shoulder strap adjustment, or office-floor side profile; no model backed flat against a concrete wall",
    studio: "studio main uses modern office-studio set, crisp daylight, clean bag edge, practical bag-forward crop",
    detailPoster: "detail poster becomes clean business-casual campaign with office/lobby geometry and clear selling-point area",
    detailFit: "model fit emphasizes bag scale, side profile, handle/strap length, zipper path, laptop compartment and commute carry placement",
    detailLifestyle: "lifestyle detail shows office-to-street use, bag/phone/coffee prop restraint",
    detail: "detail image uses desk-side/concrete/light-gray surface and crisp product detail",
    white: "white/SKU image remains standardized with professional retouching"
  },
  new_chinese: {
    main: "make it modern new Chinese elegance: warm wood screen corridor, stone courtyard path, paper screen alcove, bamboo shadow walkway, circular doorway or minimalist tea-room; symmetrical 50-70mm, composed posture",
    scene: "scene main becomes contemporary Chinese bag restraint: warm wood screen corridor, stone courtyard path, paper screen alcove, bamboo shadow walkway, circular doorway or tea-room; upright composed hand-carry, shoulder-carry, slow step past screen, seated side-profile bag angle or product pedestal; no western street facade, no back-to-wall pose",
    studio: "studio main uses paper texture/wood screen/minimal tea-room set with quiet side light",
    detailPoster: "detail poster becomes modern Chinese campaign with circular doorway, bamboo shadow or paper texture and generous negative space",
    detailFit: "model fit emphasizes composed posture, calm side turn, hand/shoulder placement, bag side profile and hardware visibility",
    detailLifestyle: "lifestyle detail uses tea-room/courtyard/wood-screen context with no costume-drama props",
    detail: "detail image uses paper/wood/stone texture, quiet side light and refined craftsmanship focus",
    white: "white/SKU image keeps clean inspection with restrained warm retouching"
  },
  dopamine_sweet: {
    main: "make it dopamine sweet-cool: color-block studio corner, clean playful prop, bright street corner, glossy magazine set or pastel set; bright frontal commercial light, dynamic diagonal composition",
    scene: "scene main must be bright youthful color energy: color-block studio corner, clean playful prop, glossy set or bright corner; playful step, hair movement, angled stance; no beige facade, no luxury lounge, no muddy neutral palette, no flat color-wall standing pose",
    studio: "studio main uses crisp color-block or pastel set, high-key light, product color accuracy",
    detailPoster: "detail poster becomes bright youth campaign with saturated accent and clean typography zone if allowed",
    detailFit: "model fit uses playful but decent foot-forward pose, full bags readability and clean color accents",
    detailLifestyle: "lifestyle detail uses simple playful prop or pastel set, no clutter",
    detail: "detail image uses clean color accent surface and crisp commercial light",
    white: "white/SKU image remains clean with a small controlled color accent only if platform-safe"
  }
};

function defaultStyleSceneDirective(style: TopSellerStylePreset): string {
  return `use the ${style.label} scene family from its structured variables, not a generic fallback; choose a background, camera, lighting and product angle that visibly match ${style.label}`;
}

function buildClassicStyleVariationCard(input: {
  style: TopSellerStylePreset;
  imageTypeId: string;
  suiteRole?: string;
  variationIndex: number;
  variationTotal?: number;
}): string {
  const role = imageRoleBucket(input.imageTypeId, input.suiteRole);
  const visual = input.style.visualSystem;
  const offset = roleOffset(role);
  const index = Math.max(0, input.variationIndex);
  const card: ClassicStyleVariationCard = {
    sceneFamily: visual.scenes[pickIndex(index, offset, visual.scenes)] ?? input.style.label,
    backgroundMaterial: backgroundMaterialFor(visual.scenes[pickIndex(index, offset + 1, visual.scenes)], role),
    camera: visual.cameras[pickIndex(index, offset + 2, visual.cameras)] ?? "product-first commercial framing",
    lighting: visual.lighting[pickIndex(index, offset + 3, visual.lighting)] ?? "professional ecommerce lighting",
    poseOrProductAngle: poseOrAngleFor(visual.poses[pickIndex(index, offset + 4, visual.poses)], role),
    palette: visual.palettes[pickIndex(index, offset + 5, visual.palettes)] ?? "controlled ecommerce palette",
    commerceRole: commerceRoleFor(role),
    forbiddenRepetition: forbiddenRepetitionFor(input.style, role)
  };
  const total = input.variationTotal && input.variationTotal > 1 ? ` ${index + 1}/${input.variationTotal}.` : ".";

  return [
    `Visual variation card for ${input.style.label}${total}`,
    `scene family: ${card.sceneFamily}`,
    `background material: ${card.backgroundMaterial}`,
    `camera: ${card.camera}`,
    `lighting: ${card.lighting}`,
    `pose or product angle: ${card.poseOrProductAngle}`,
    `palette: ${card.palette}`,
    `commerce role: ${card.commerceRole}`,
    `forbidden repetition: ${card.forbiddenRepetition}`,
    "Single-direction rule: this image must choose one clear visual direction from this card; do not average or blend multiple scene families.",
    "If this planned image may resemble the previous one, change at least one of background material, camera distance, pose, product angle or light direction before rendering.",
    "Detail-page suite rule: poster, wearing/use scene, material detail and fit/module images must not share the same background or composition rhythm."
  ].join("; ");
}

function pickIndex(index: number, offset: number, values: string[]): number {
  if (!values.length) return 0;
  return (index + offset) % values.length;
}

function roleOffset(role: ImageRoleBucket): number {
  const offsets: Record<ImageRoleBucket, number> = {
    main: 0,
    scene: 1,
    studio: 2,
    detailPoster: 0,
    detailFit: 3,
    detailLifestyle: 5,
    detail: 2,
    white: 1
  };
  return offsets[role];
}

function backgroundMaterialFor(scene: string | undefined, role: ImageRoleBucket): string {
  if (role === "white") return "platform-safe white or light-gray surface with controlled shadow only";
  if (role === "detail") return "close material surface derived from the style, with low clutter and macro readability";
  return scene ? `${scene} material language, clearly different from a plain wall or sidewalk` : "style-specific material surface";
}

function poseOrAngleFor(pose: string | undefined, role: ImageRoleBucket): string {
  if (role === "white") return "inspection-first front, side or three-quarter product angle, no lifestyle pose";
  if (role === "detail") return "macro material, hardware, zipper, closure, lining, texture or structure angle; no broad lifestyle scene";
  return pose ?? "role-specific model pose or product angle";
}

function commerceRoleFor(role: ImageRoleBucket): string {
  const roles: Record<ImageRoleBucket, string> = {
    main: "main image with high product occupancy and restrained but non-repeated background",
    scene: "scene image proving the selected style family through environment, movement and use context",
    studio: "studio image with style-specific set material, not a repeated generic sweep",
    detailPoster: "detail header poster with stronger campaign mood, negative space and readable product",
    detailFit: "fit or wearing-effect image with a clearly different pose and camera rhythm",
    detailLifestyle: "use-scene detail image with style-specific context and sparse props",
    detail: "material/detail image varying surface, crop, angle and light rather than complex scenery",
    white: "white/SKU image preserving compliance while varying shadow, angle and material clarity only"
  };
  return roles[role];
}

function forbiddenRepetitionFor(style: TopSellerStylePreset, role: ImageRoleBucket): string {
  const strictRole =
    role === "white" || role === "detail"
      ? "do not force complex scenery; avoid repeating the same shadow, surface crop or product angle across detail/SKU images"
      : "do not reuse the same wall, same neutral standing pose, same sidewalk, same studio template or same camera distance as another image in this task";
  return `${strictRole}; hard negatives: generic wall, beige facade, plain sidewalk, same neutral standing pose, same studio template, ${style.visualSystem.forbiddenElements.join(", ")}`;
}

function categoryMatrixAddOn(category: ApparelCategory, styleId: TopSellerStylePreset["id"]): string {
  if (category === "men" || category === "women" || category === "kids" || category === "sports") {
    return "Category matrix add-on: for bags, vary bag angle, carrying crop, styling, scale cue, camera height, background family, and detail emphasis by style; never keep the same stance and only swap tiny background details.";
  }
  if (category === "shoes") {
    return "Category matrix add-on: for bags, style controls surface material, camera height, handle/strap visibility, movement/use context and shadow, not just color grading.";
  }
  if (category === "bags") {
    return "Category matrix add-on: for bags, style controls carry pose, surface/interior context, hardware emphasis, scale cue and background material.";
  }
  if (category === "beauty") {
    return "Category matrix add-on: for beauty, style controls surface material, reflection, ingredient/texture cue, bottle arrangement and premium retouching.";
  }
  if (category === "home") {
    return "Category matrix add-on: for home goods, style controls room type, surface, scale, light temperature, textile/material styling and prop discipline.";
  }
  return `Category matrix add-on: apply ${styleId} through category-specific use context, material surface, scale cue, camera angle and commercial retouching while preserving exact product identity.`;
}

function styleVariableText(style: TopSellerStylePreset, strength: VariationStrength, imageTypeId: string): string {
  const safeMode = strength === "safe" || isWhiteOrSku(imageTypeId);
  const visual = style.visualSystem;
  const scene = safeMode ? visual.scenes.slice(0, 2) : visual.scenes;
  const camera = safeMode ? visual.cameras.slice(0, 3) : visual.cameras;
  const poses = safeMode ? visual.poses.slice(0, 3) : visual.poses;
  const lighting = safeMode ? visual.lighting.slice(0, 2) : visual.lighting;
  const palettes = safeMode ? visual.palettes.slice(0, 4) : visual.palettes;

  return [
    `Structured style variables for ${style.label}:`,
    `scene options: ${scene.join(", ")}`,
    `camera options: ${camera.join(", ")}`,
    `lighting options: ${lighting.join(", ")}`,
    `pose options: ${poses.join(", ")}`,
    `background palette: ${palettes.join(", ")}`,
    `commerce intensity: ${visual.commerceIntensity}`,
    `style-specific forbidden elements: ${visual.forbiddenElements.join(", ")}`,
    styleBoundaryText(style.id)
  ].join("; ");
}

function styleBoundaryText(id: TopSellerStylePreset["id"]): string {
  const shared =
    "anti-homogeneity lock: do not use a generic pale exterior wall, anonymous building facade, default sidewalk, neutral standing pose, back-to-wall pose, or repeated ecommerce street-shot template unless it is a strict white/SKU inspection role";
  const boundaries: Partial<Record<TopSellerStylePreset["id"], string>> = {
    old_money:
      "style boundary for 老钱质感: use marble corridor, quiet club lounge, arched doorway, linen curtain alcove or refined warm-stone luxury interior with depth; avoid youthful casual street, ordinary apartment wall, plain sidewalk facade, neon, shutter, sporty/outdoor props, and random beige city wall",
    urban_commute:
      "style boundary for 城市通勤: use glass office facade with depth, elevator lobby, modern desk-side studio, clean commute corner crossing or office atrium walkway; avoid luxury lounge, cafe softness, outdoor trail, color-block youth props, plain concrete wall, and purely minimal white catalog set",
    street_trend:
      "style boundary for 高街潮流: use city crosswalk, metal shutter, parking garage, underpass, neon storefront or skateboard-like street texture with lower/wider camera energy; avoid premium marble/club scenes, hazy cafe softness, plain beige wall, and quiet catalog posture",
    gorpcore:
      "style boundary for 山系机能: use trail entrance, rocky path, grass slope, wet pavement, campsite texture or city-park mountain feeling; avoid office facade, luxury stone corridor, cafe/apartment softness, and generic fashion street wall",
    korean_relaxed:
      "style boundary for 韩系松弛: use cafe window, sunlit apartment, quiet sidewalk with lifestyle warmth, white curtain or pale wood floor; avoid marble corridor, formal luxury lounge, harsh streetwear underpass, parking garage, and rigid catalog stance",
    new_chinese:
      "style boundary for 新中式雅致: use warm wood screen corridor, stone courtyard path, paper screen alcove, bamboo shadow walkway, circular doorway or minimalist tea-room scene; avoid western city facade, random street wall, neon streetwear, office lobby, and costume-drama props",
    dopamine_sweet:
      "style boundary for 甜酷多巴胺: use color-block studio corner, playful clean prop, bright street corner, glossy magazine set or pastel set with one or two saturated accents; avoid beige facade, luxury lounge, flat color-wall standing pose, pure neutral catalog, and muddy low-saturation palette",
    minimal_premium:
      "style boundary for 极简高级: use seamless white sweep, matte plinth, minimal paper-texture set or light-gray studio with controlled shadow; avoid outdoor street, building facade, lifestyle sidewalk, cafe/apartment scene, busy props, and strong lifestyle gesture"
  };
  return `${boundaries[id] ?? "style boundary: use only the selected style scene family and avoid generic fallback scenes"}; ${shared}`;
}

function roleConstraintFor(imageTypeId: string, suiteRole?: string, allowTextOverlay = false): string {
  if (isWhiteOrSku(imageTypeId)) {
    return "Role constraint: white/SKU image. Keep stable and inspection-friendly, subject centered and large, clean edges, accurate color, no stylistic novelty, no generated text.";
  }
  if (imageTypeId === "detail_header_poster" || suiteRole === "detail_header") {
    return allowTextOverlay
      ? "Role constraint: detail-page poster. Stronger campaign mood and merchant-provided short poster typography are allowed; product remains readable and text must not cover the product."
      : "Role constraint: detail-page poster. Stronger campaign mood is allowed, but do not render any text labels, generated typography, badges, prices, QR codes, URLs, watermarks, or promotional copy.";
  }
  if (imageTypeId.includes("texture") || imageTypeId.includes("craft")) {
    return "Role constraint: detail image. Keep style variation low, macro ecommerce detail, one material/craft/closure/pocket/zipper/handle/strap/hardware feature per image, clean neutral background, no text labels.";
  }
  if (imageTypeId.includes("model_fit")) {
    return "Role constraint: model-fit image. Allow the largest variation in pose, camera, and scene because this role communicates wearing effect and style identity; arms must not hide key design details.";
  }
  if (imageTypeId.includes("scene") || imageTypeId.includes("feed") || imageTypeId.includes("live")) {
    return "Role constraint: scene/lifestyle or cover image. Allow stronger atmosphere, depth, movement, and color. If a top-merchant style is selected, its scene family overrides the generic scene-main street default. The product must remain first visual priority and background lower contrast than product.";
  }
  return "Role constraint: main image. Subject should occupy 70-80% of frame, immediately recognizable, platform-safe, clean background hierarchy, no price text, no collage, no watermark.";
}

function variationStrengthFor(platform: CommercePlatform, imageTypeId: string, suiteRole?: string): VariationStrength {
  if (isWhiteOrSku(imageTypeId) || imageTypeId.includes("texture") || imageTypeId.includes("craft")) return "safe";
  if (platform === "douyin" || platform === "kuaishou" || platform === "xiaohongshu" || platform === "tiktok_shop_global" || platform === "shopify" || imageTypeId.includes("feed") || imageTypeId.includes("live") || imageTypeId === "detail_header_poster" || suiteRole === "detail_header") return "bold";
  return "balanced";
}

function isWhiteOrSku(imageTypeId: string): boolean {
  return imageTypeId.includes("white") || imageTypeId.includes("sku") || imageTypeId.includes("color");
}
