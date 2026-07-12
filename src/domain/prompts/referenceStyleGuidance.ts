import type { ApparelCategory } from "../apparel/options";
import type { SuiteImageRole } from "../suites/suitePresets";
import type { TopSellerStylePreset } from "./topSellerStylePresets";

interface ReferenceStyleGroup {
  id: string;
  name: string;
  sceneFamily: string;
  promptCore: string;
  backgrounds: string[];
  poses: string[];
  cameras: string[];
  lighting: string[];
  palette: string[];
  avoid: string[];
}

type ReferenceRoleBucket = "strongScene" | "leisureScene" | "natureScene" | "outdoorScene" | "coastScene" | "cityScene" | "galleryScene" | "indoorDetail";

const apparelCategories = new Set<ApparelCategory>(["women", "men", "kids", "sports", "bags"]);

const referenceStyleGroups: ReferenceStyleGroup[] = [
  {
    id: "commerce-cover",
    name: "箱包封面强差异",
    sceneFamily: "commerce cover / style-specific bag hero",
    promptCore: "bag silhouette and carrying effect readable, one decisive background family, stronger action than a neutral catalog stance, product remains dominant",
    backgrounds: ["architectural corridor", "clean city corner", "structured studio set", "window-light interior", "functional outdoor path"],
    poses: ["walk toward camera with bag visible", "half-turn showing bag side profile", "lace or strap adjustment", "one foot on rail or step", "carrying pose with hardware contact"],
    cameras: ["low-angle full body", "eye-level three-quarter full body", "wide environmental cover", "waist-to-full-body crop"],
    lighting: ["clear daylight", "soft window light", "controlled studio side light", "late afternoon contrast"],
    palette: ["black and white", "stone neutral", "clean accent color", "soft denim blue"],
    avoid: ["static street-wall pose", "same front standing stance", "background overpowering product"]
  },
  {
    id: "soft-daily",
    name: "松弛日常箱包",
    sceneFamily: "soft daily bag lifestyle",
    promptCore: "cafe window, apartment corner or quiet sidewalk, relaxed foot movement, soft conversion mood, bag silhouette and on-foot scale readable",
    backgrounds: ["cafe window", "pale wood room", "white curtain", "quiet sidewalk", "clean apartment doorway"],
    poses: ["sit on chair edge with bag visible", "look down while walking", "one bag slightly forward", "one knee bent with bag side profile", "lace or strap adjustment"],
    cameras: ["eye-level full body", "medium seated crop", "three-quarter walking shot", "negative-space portrait"],
    lighting: ["hazy window daylight", "soft morning light", "low-contrast indoor daylight", "light shade"],
    palette: ["cream", "pale grey", "washed denim", "butter yellow"],
    avoid: ["busy cafe clutter", "rigid catalog stance", "props covering bag, handles or straps"]
  },
  {
    id: "city-motion",
    name: "城市动作街拍",
    sceneFamily: "urban motion bag scene",
    promptCore: "street, lobby or transit-adjacent setting, visible carrying movement and practical bag context, no anonymous wall-only look",
    backgrounds: ["clean crosswalk", "office lobby edge", "elevator hall", "metal shutter", "underpass rail"],
    poses: ["stride across frame with bags sharp", "one foot planted near camera", "lace adjustment", "hands in pocket with bag-forward stance", "lean on railing with hardware visible"],
    cameras: ["lower 35mm full-body", "eye-level 50mm walking frame", "three-quarter street crop", "dynamic vertical frame"],
    lighting: ["crisp daylight", "harder urban side light", "soft lobby ambient light", "night accent light"],
    palette: ["cement grey", "black", "muted blue", "denim", "signal accent"],
    avoid: ["blank wall-only background", "busy signage", "same sidewalk scene twice"]
  },
  {
    id: "functional-outdoor",
    name: "机能户外行动",
    sceneFamily: "functional outdoor bag utility",
    promptCore: "trail, rock, park slope or campsite texture, active utility pose with hardware grip, upper support and bag function visible",
    backgrounds: ["rocky path", "trail railing", "grass slope", "wet pavement", "tidy campsite texture"],
    poses: ["step on rock", "sit on rock with hardware visible", "lean on wooden railing with bag-forward stance", "walk uphill", "heel planted on trail"],
    cameras: ["wide utility cover", "low-angle full body", "medium hiking portrait", "seated rock crop"],
    lighting: ["real outdoor daylight", "overcast utility light", "crisp side light", "practical shadows"],
    palette: ["moss green", "sand", "stone grey", "black technical accents"],
    avoid: ["props covering bags", "fake mountain backdrop", "unsafe cliff pose"]
  },
  {
    id: "studio-material",
    name: "棚拍材质变化",
    sceneFamily: "studio material bag system",
    promptCore: "controlled studio, paper sweep or plinth background, bag inspection remains clear while angle/camera changes between images",
    backgrounds: ["white paper sweep", "light gray plinth", "linen curtain set", "matte color corner", "soft shadow studio floor"],
    poses: ["front bag angle", "side profile angle", "heel/back angle", "toe-forward angle", "product-only pair alignment"],
    cameras: ["straight-on 70mm catalog lens", "side profile crop", "three-quarter product crop", "macro upper/hardware crop"],
    lighting: ["large softbox", "controlled side light", "even shadow control", "high-key studio light"],
    palette: ["pure white", "off-white", "soft grey", "controlled accent"],
    avoid: ["complex scenery in inspection roles", "hidden hardware or upper details", "over-styled props"]
  },
  {
    id: "polished-architecture",
    name: "建筑质感轻奢",
    sceneFamily: "polished architecture / quiet bag premium",
    promptCore: "stone, arch, gallery or refined interior architecture, calm pose variation, bag material and silhouette look premium",
    backgrounds: ["arched corridor", "stone arcade", "gallery hallway", "warm wood screen corridor", "curtain-lit interior"],
    poses: ["walk under arch with bag visible", "stand beside architectural edge with bag-forward stance", "one foot on step", "seated poised pose showing side profile", "slow step with hardware contact"],
    cameras: ["centered corridor perspective", "medium full-body portrait", "wide architecture frame", "slightly low elegant angle"],
    lighting: ["soft indoor daylight", "gallery ambient light", "warm corridor lighting", "low-contrast luxury light"],
    palette: ["stone beige", "museum white", "charcoal", "warm gold"],
    avoid: ["copied artwork", "visible labels", "flashy nightclub luxury"]
  },
  {
    id: "color-youth",
    name: "年轻色块甜酷",
    sceneFamily: "youth color-block bag set",
    promptCore: "bright but clean color system, playful movement, accurate product color, no clutter or childish overload",
    backgrounds: ["color-block studio corner", "pastel studio set", "bright street corner", "glossy magazine set", "clean prop cube"],
    poses: ["playful step", "slight jump with bags sharp", "looking back with bag-forward stance", "toe-forward pose", "angled lower-body stance"],
    cameras: ["35-50mm dynamic frame", "diagonal full-body composition", "slight low angle", "clean magazine crop"],
    lighting: ["bright frontal commercial light", "crisp color light", "clean high-key studio", "soft daylight with color accent"],
    palette: ["clean white", "pink", "lime", "sky blue", "sunny yellow"],
    avoid: ["muddy palette", "overcrowded props", "adultized child styling"]
  },
  {
    id: "indoor-detail",
    name: "室内细节近景",
    sceneFamily: "indoor bag detail / clean close-up",
    promptCore: "bag material, zipper, buckle, stitching, handle base, strap attachment, hardware, lining or capacity detail in a clean indoor setting, low scene complexity",
    backgrounds: ["linen surface", "paper screen surface", "pale wood tabletop", "clean light-gray detail set", "soft window-lit surface"],
    poses: ["hand opening zipper", "fingers showing material edge", "hardware close-up", "handle attachment crop", "bag body material close-up"],
    cameras: ["close medium bag detail", "macro material texture crop", "70mm detail portrait", "slightly high indoor bag angle"],
    lighting: ["high window light", "soft indoor daylight", "controlled side light", "large softbox"],
    palette: ["warm white", "soft gray", "natural wood", "muted brown"],
    avoid: ["whole suite as plain wall", "messy room", "detail crop losing product identity"]
  }
];

const bucketGroupIds: Record<ReferenceRoleBucket, string[]> = {
  strongScene: ["commerce-cover", "city-motion", "functional-outdoor", "polished-architecture", "color-youth"],
  leisureScene: ["soft-daily", "city-motion", "studio-material", "polished-architecture"],
  natureScene: ["functional-outdoor", "soft-daily", "commerce-cover", "studio-material"],
  outdoorScene: ["functional-outdoor", "city-motion", "commerce-cover", "soft-daily"],
  coastScene: ["city-motion", "soft-daily", "commerce-cover", "studio-material"],
  cityScene: ["city-motion", "polished-architecture", "soft-daily", "commerce-cover"],
  galleryScene: ["polished-architecture", "studio-material", "soft-daily", "indoor-detail"],
  indoorDetail: ["indoor-detail", "studio-material", "polished-architecture", "soft-daily"]
};

export function buildReferenceDrivenStyleGuidance(input: {
  category: ApparelCategory;
  imageTypeId?: string;
  suiteRole?: SuiteImageRole;
  variationIndex?: number;
  topSellerStyle?: TopSellerStylePreset;
  disabled?: boolean;
}): string {
  if (input.disabled || !apparelCategories.has(input.category)) return "";
  if (isStrictInspectionRole(input.imageTypeId, input.suiteRole)) return "";

  if (input.topSellerStyle) {
    return buildClassicApparelStylePlaybook({
      style: input.topSellerStyle,
      category: input.category,
      imageTypeId: input.imageTypeId,
      suiteRole: input.suiteRole,
      variationIndex: input.variationIndex ?? 0
    });
  }

  const bucket = referenceRoleBucket(input.imageTypeId ?? "", input.suiteRole);
  const group = pickReferenceGroup(bucket, input.variationIndex ?? 0);
  if (!group) return "";

  const roleText = input.suiteRole ? `suite role ${input.suiteRole}` : `image type ${input.imageTypeId ?? "general"}`;
  return [
    `Bag diversity guidance (${input.category}, ${roleText}): use the ${group.name} bag visual card as the current reusable direction.`,
    `Scene family: ${group.sceneFamily}. Prompt core: ${group.promptCore}.`,
    `Choose one background from: ${group.backgrounds.join(", ")}.`,
    `Choose one pose/action from: ${group.poses.join(", ")}.`,
    `Choose one camera from: ${group.cameras.join(", ")}.`,
    `Choose one lighting mode from: ${group.lighting.join(", ")}.`,
    `Palette cues: ${group.palette.join(", ")}.`,
    `Bag diversity rule: this is reusable art direction, not a source-image copy. Do not copy faces, logos, text, watermarks, exact layout, or merchant identity. Avoid ${group.avoid.join(", ")}. Across a suite, rotate scene families and do not use the same background category, same bag angle, or same carrying pose in consecutive images.`
  ].join(" ");
}

export function referenceStyleGroupNameFor(input: {
  category: ApparelCategory;
  imageTypeId?: string;
  suiteRole?: SuiteImageRole;
  variationIndex?: number;
  topSellerStyle?: TopSellerStylePreset;
}): string | undefined {
  if (!apparelCategories.has(input.category) || isStrictInspectionRole(input.imageTypeId, input.suiteRole)) return undefined;
  if (input.topSellerStyle) return input.topSellerStyle.label;
  return pickReferenceGroup(referenceRoleBucket(input.imageTypeId ?? "", input.suiteRole), input.variationIndex ?? 0)?.name;
}

function buildClassicApparelStylePlaybook(input: {
  style: TopSellerStylePreset;
  category: ApparelCategory;
  imageTypeId?: string;
  suiteRole?: SuiteImageRole;
  variationIndex: number;
}): string {
  const roleText = input.suiteRole ? `suite role ${input.suiteRole}` : `image type ${input.imageTypeId ?? "general"}`;
  const role = referenceRoleBucket(input.imageTypeId ?? "", input.suiteRole);
  const visual = input.style.visualSystem;
  const scene = visual.scenes[pickArrayIndex(input.variationIndex, role === "strongScene" ? 0 : 1, visual.scenes)] ?? input.style.label;
  const pose = visual.poses[pickArrayIndex(input.variationIndex, role === "indoorDetail" ? 2 : 3, visual.poses)] ?? "style-specific product-readable pose";
  const camera = visual.cameras[pickArrayIndex(input.variationIndex, 2, visual.cameras)] ?? "product-first commerce camera";
  const lighting = visual.lighting[pickArrayIndex(input.variationIndex, 1, visual.lighting)] ?? "professional ecommerce light";
  const palette = visual.palettes[pickArrayIndex(input.variationIndex, 4, visual.palettes)] ?? "controlled style palette";
  const roleIntensity = role === "indoorDetail"
    ? "material/detail roles should express the style through bag surface, light direction, crop, material texture, stitching, hardware and hardware only; do not add broad lifestyle scenery"
    : "cover, scene, model-fit and long images may use stronger sitting, walking, leaning, crouching, looking-back, strap-adjusting or bag-forward actions as long as the bag remains readable";

  return [
    `Classic bag style playbook for ${input.style.label} (${input.category}, ${roleText}): use the selected classic style as the reference card, not the generic fallback.`,
    `Style scene/action pick: background ${scene}; pose/action ${pose}; camera ${camera}; lighting ${lighting}; palette cue ${palette}.`,
    `Role intensity rule: ${roleIntensity}.`,
    `Style fidelity rule: stay inside ${input.style.label}'s own scene, pose, camera and palette pool; do not mix in unrelated aviation, beach, flower-field, generic sidewalk, plain beige wall or anonymous studio templates. Rotate background, action and camera across suite items.`
  ].join(" ");
}

function pickArrayIndex(index: number, offset: number, values: string[]): number {
  if (!values.length) return 0;
  return (Math.abs(index) + offset) % values.length;
}

function pickReferenceGroup(bucket: ReferenceRoleBucket, variationIndex: number): ReferenceStyleGroup | undefined {
  const ids = bucketGroupIds[bucket];
  const id = ids[Math.abs(variationIndex) % ids.length];
  return referenceStyleGroups.find((group) => group.id === id);
}

function referenceRoleBucket(imageTypeId: string, suiteRole?: SuiteImageRole): ReferenceRoleBucket {
  if (suiteRole === "detail_header") return "strongScene";
  if (suiteRole === "scene_hero") return "strongScene";
  if (suiteRole === "mobile_long") return "natureScene";
  if (suiteRole === "side_back") return "cityScene";
  if (suiteRole === "model_fit") return "leisureScene";
  if (suiteRole === "material_detail" || suiteRole === "craft_detail" || suiteRole === "single_feature" || suiteRole === "trust_footer") return "indoorDetail";
  if (imageTypeId.includes("model_fit") || imageTypeId.includes("fit")) return "leisureScene";
  if (imageTypeId.includes("detail_header") || imageTypeId.includes("poster") || imageTypeId.includes("cover")) return "strongScene";
  if (imageTypeId.includes("scene") || imageTypeId.includes("feed") || imageTypeId.includes("live")) return "strongScene";
  if (imageTypeId.includes("texture") || imageTypeId.includes("craft") || imageTypeId.includes("design")) return "indoorDetail";
  if (imageTypeId.includes("full_body") || imageTypeId.includes("side") || imageTypeId.includes("back")) return "cityScene";
  return "leisureScene";
}

function isStrictInspectionRole(imageTypeId?: string, suiteRole?: SuiteImageRole): boolean {
  const id = imageTypeId ?? "";
  return suiteRole === "white_hero" ||
    suiteRole === "detail_white" ||
    suiteRole === "sku_color" ||
    id.includes("white") ||
    id.includes("sku") ||
    id.includes("color");
}
