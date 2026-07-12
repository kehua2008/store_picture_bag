import { categoryLabels, type ApparelCategory } from "../apparel/options";

export interface ProductSellingPoint {
  type: "material" | "fit" | "design" | "quality" | "comfort" | "function" | "scene";
  title: string;
  description: string;
  visualKeywords: string[];
}

export interface ProductVisualUnderstanding {
  sourceImageSummary: string;
  productIdentityAnchors: string[];
  materialSignals: string[];
  constructionSignals: string[];
  stylingSignals: string[];
  missingAngles: string[];
  riskNotes: string[];
}

export interface ProductAnalysis {
  productName: string;
  productNameZh: string;
  productType: string;
  productStyle: string;
  visualUnderstanding: ProductVisualUnderstanding;
  visualFeatures: string[];
  color: string;
  material: string;
  silhouette: string;
  designDetails: string;
  productIdentityLock: string;
  sellingPoints: ProductSellingPoint[];
  targetAudience: string;
  targetScenes: string[];
  inputImageType: "flat_lay" | "hanging" | "model" | "unknown";
}

const categoryDefaults: Record<ApparelCategory, Omit<ProductAnalysis, "productName" | "productNameZh" | "productType" | "visualUnderstanding">> = {
  women: {
    productStyle: "精致女包 / 日常搭配",
    visualFeatures: ["女包包型", "包身材质", "五金工艺"],
    color: "accurate original color",
    material: "visible bag material",
    silhouette: "clear feminine bag silhouette",
    designDetails: "bag shape, handle, shoulder strap, zipper, hardware, pocket layout, stitching and trims",
    productIdentityLock: "same bag color, same silhouette, same handle, same strap, same zipper path, same hardware, same pocket layout, same stitching and trims",
    sellingPoints: [
      { type: "fit", title: "持包比例", description: "真人携带更显包型", visualKeywords: ["carry fit", "bag silhouette"] },
      { type: "material", title: "包身质感", description: "细节质感清楚", visualKeywords: ["bag texture", "material"] },
      { type: "scene", title: "多场景搭配", description: "通勤约会都适合", visualKeywords: ["daily", "styling"] }
    ],
    targetAudience: "注重质感和日常搭配的女性用户",
    targetScenes: ["通勤", "约会", "周末出行"],
    inputImageType: "unknown"
  },
  men: {
    productStyle: "利落男包 / 休闲通勤",
    visualFeatures: ["男包包型", "稳固结构", "实用细节"],
    color: "accurate original color",
    material: "structured bag material",
    silhouette: "clean masculine bag silhouette",
    designDetails: "front panel, side depth, handle, strap, zipper, buckle, pocket layout and stitching",
    productIdentityLock: "same color, same bag silhouette, same side depth, same handles, same straps, same zippers, same hardware, same pockets and stitching",
    sellingPoints: [
      { type: "fit", title: "包型利落", description: "通勤携带不笨重", visualKeywords: ["clean bag fit", "structure"] },
      { type: "material", title: "包身质感", description: "材质纹理清楚", visualKeywords: ["bag texture", "material"] },
      { type: "scene", title: "通勤百搭", description: "多种场景都好搭", visualKeywords: ["commute", "daily"] }
    ],
    targetAudience: "追求实穿和整洁形象的男性用户",
    targetScenes: ["通勤", "休闲", "出行"],
    inputImageType: "unknown"
  },
  kids: {
    productStyle: "清爽童包 / 活力日常",
    visualFeatures: ["童包比例", "舒适活动", "安全细节"],
    color: "accurate original color",
    material: "comfortable kid-friendly bag material",
    silhouette: "natural child-size bag silhouette",
    designDetails: "rounded bag shape, secure closure, strap, pocket layout, color blocking and safe trims",
    productIdentityLock: "same kids' bag proportions, same color, same pattern, same closure, same straps, same pockets and safe trims",
    sellingPoints: [
      { type: "comfort", title: "活动自在", description: "适合日常玩耍", visualKeywords: ["comfort", "movement"] },
      { type: "material", title: "柔软包身", description: "背携柔软舒适", visualKeywords: ["soft bag body", "kid-friendly"] },
      { type: "design", title: "童趣设计", description: "颜色细节清楚", visualKeywords: ["pattern", "cute"] }
    ],
    targetAudience: "重视舒适和安全感的童包购买者",
    targetScenes: ["上学", "玩耍", "亲子出行"],
    inputImageType: "unknown"
  },
  shoes: {
    productStyle: "质感箱包 / 日常搭配",
    visualFeatures: ["包型轮廓", "包身材质", "五金结构"],
    color: "accurate original color",
    material: "visible bag material",
    silhouette: "clear bag shape",
    designDetails: "bag silhouette, material texture, handles, straps, zipper, hardware, pockets and stitching",
    productIdentityLock: "same bag shape, same material texture, same handles, same straps, same zipper, same hardware, same stitching and color",
    sellingPoints: [
      { type: "comfort", title: "舒适背携", description: "日常携带更轻松", visualKeywords: ["comfort", "support"] },
      { type: "quality", title: "细节做工", description: "包身走线清晰", visualKeywords: ["stitching", "bag body"] },
      { type: "scene", title: "百搭出行", description: "多场景易搭配", visualKeywords: ["daily", "styling"] }
    ],
    targetAudience: "注重实用和搭配的箱包用户",
    targetScenes: ["通勤", "出行", "休闲"],
    inputImageType: "unknown"
  },
  bags: {
    productStyle: "实用箱包 / 质感通勤",
    visualFeatures: ["包型结构", "容量空间", "五金细节"],
    color: "accurate original color",
    material: "visible bag material",
    silhouette: "structured bag shape",
    designDetails: "handle, strap, zipper, pocket, hardware and stitching",
    productIdentityLock: "same bag shape, same handle and strap, same zipper, same hardware, same pockets and color",
    sellingPoints: [
      { type: "function", title: "容量分区", description: "日常收纳更清楚", visualKeywords: ["capacity", "pockets"] },
      { type: "quality", title: "质感五金", description: "细节更显品质", visualKeywords: ["hardware", "texture"] },
      { type: "scene", title: "通勤出行", description: "多场景都适合", visualKeywords: ["commute", "travel"] }
    ],
    targetAudience: "重视收纳和质感的箱包用户",
    targetScenes: ["通勤", "旅行", "日常出行"],
    inputImageType: "unknown"
  },
  beauty: {
    productStyle: "精致美妆 / 清洁护理",
    visualFeatures: ["瓶身轮廓", "包装质感", "膏体或质地表现"],
    color: "accurate packaging and product color",
    material: "visible cosmetic packaging material",
    silhouette: "clean bottle, jar, tube or compact silhouette",
    designDetails: "cap, pump, label layout, texture, logo-like marks and packaging finish",
    productIdentityLock: "same package shape, same label position, same cap or pump, same color, same texture and visible branding-like marks",
    sellingPoints: [
      { type: "quality", title: "质地清晰", description: "膏体或包装质感可见", visualKeywords: ["texture", "cosmetic"] },
      { type: "function", title: "护理卖点", description: "功效场景表达明确", visualKeywords: ["skincare", "benefit"] },
      { type: "scene", title: "精致梳妆", description: "适合详情页氛围图", visualKeywords: ["vanity", "premium"] }
    ],
    targetAudience: "关注功效、质地和包装质感的美妆个护用户",
    targetScenes: ["梳妆台", "浴室", "礼盒陈列"],
    inputImageType: "unknown"
  },
  baby: {
    productStyle: "安心母婴 / 柔和日常",
    visualFeatures: ["安全材质", "柔和色彩", "亲子使用场景"],
    color: "accurate soft original color",
    material: "baby-safe soft material",
    silhouette: "rounded safe product silhouette",
    designDetails: "edge, closure, fabric, label, handle and safety-related details",
    productIdentityLock: "same baby product shape, same safety details, same fabric or material, same color and same functional structure",
    sellingPoints: [
      { type: "comfort", title: "柔软安心", description: "材质亲肤舒适", visualKeywords: ["soft", "baby-safe"] },
      { type: "function", title: "使用方便", description: "亲子日常更顺手", visualKeywords: ["parenting", "daily use"] },
      { type: "quality", title: "细节安全", description: "边缘和结构清楚", visualKeywords: ["safety", "detail"] }
    ],
    targetAudience: "关注安全、舒适和实用性的父母用户",
    targetScenes: ["婴儿房", "亲子出行", "日常护理"],
    inputImageType: "unknown"
  },
  home: {
    productStyle: "家居生活 / 舒适质感",
    visualFeatures: ["空间搭配", "材质纹理", "使用尺度"],
    color: "accurate home product color",
    material: "visible home textile, wood, ceramic, metal or plastic material",
    silhouette: "clear home product shape in room context",
    designDetails: "surface texture, seams, edges, handle, storage structure and finish",
    productIdentityLock: "same home product shape, same material texture, same color, same size impression and same functional details",
    sellingPoints: [
      { type: "scene", title: "空间好搭", description: "融入真实家居场景", visualKeywords: ["room", "lifestyle"] },
      { type: "quality", title: "材质可见", description: "纹理和做工清楚", visualKeywords: ["material", "texture"] },
      { type: "function", title: "实用收纳", description: "使用方式直观", visualKeywords: ["storage", "daily use"] }
    ],
    targetAudience: "关注居家质感和实用性的家庭用户",
    targetScenes: ["客厅", "卧室", "厨房", "收纳空间"],
    inputImageType: "unknown"
  },
  digital: {
    productStyle: "科技数码 / 专业清晰",
    visualFeatures: ["工业设计", "屏幕界面", "接口结构"],
    color: "accurate device color",
    material: "glass, metal, plastic or electronic finish",
    silhouette: "precise device silhouette",
    designDetails: "screen, buttons, ports, lens, speaker grille, logo-like marks and surface finish",
    productIdentityLock: "same device shape, same screen ratio, same ports, same buttons, same camera or lens layout and same color",
    sellingPoints: [
      { type: "function", title: "功能清楚", description: "核心功能直观呈现", visualKeywords: ["technology", "feature"] },
      { type: "quality", title: "做工精密", description: "材质和接口清晰", visualKeywords: ["industrial design", "ports"] },
      { type: "scene", title: "办公生活", description: "真实使用场景可信", visualKeywords: ["desk", "usage"] }
    ],
    targetAudience: "关注性能、外观和可靠性的数码用户",
    targetScenes: ["办公桌", "居家使用", "科技棚拍"],
    inputImageType: "unknown"
  },
  food: {
    productStyle: "食品生鲜 / 新鲜可信",
    visualFeatures: ["新鲜色泽", "包装信任", "食材细节"],
    color: "accurate food and packaging color",
    material: "food texture and packaging material",
    silhouette: "clear food package or ingredient shape",
    designDetails: "package seal, label, ingredient texture, serving detail and freshness cues",
    productIdentityLock: "same package shape, same label placement, same food color, same ingredient appearance and same quantity impression",
    sellingPoints: [
      { type: "quality", title: "新鲜直观", description: "色泽和食材质感清楚", visualKeywords: ["fresh", "ingredient"] },
      { type: "function", title: "包装可信", description: "包装信息区域完整", visualKeywords: ["package", "trust"] },
      { type: "scene", title: "食用场景", description: "餐桌或厨房氛围自然", visualKeywords: ["table", "serving"] }
    ],
    targetAudience: "关注新鲜度、口感和包装安全的食品用户",
    targetScenes: ["餐桌", "厨房", "生鲜陈列"],
    inputImageType: "unknown"
  },
  sports: {
    productStyle: "运动户外 / 功能场景",
    visualFeatures: ["功能结构", "运动场景", "耐用材质"],
    color: "accurate performance product color",
    material: "technical upper material, rubber, metal or outdoor material",
    silhouette: "functional sports or outdoor silhouette",
    designDetails: "straps, zippers, sole, buckle, ventilation, seams and reinforced areas",
    productIdentityLock: "same sports product shape, same technical structure, same color, same hardware and same functional details",
    sellingPoints: [
      { type: "function", title: "运动功能", description: "功能结构表达明确", visualKeywords: ["performance", "function"] },
      { type: "quality", title: "耐用细节", description: "材质和加固处清楚", visualKeywords: ["durable", "outdoor"] },
      { type: "scene", title: "户外适配", description: "真实运动场景自然", visualKeywords: ["outdoor", "active"] }
    ],
    targetAudience: "关注功能、耐用和场景适配的运动户外用户",
    targetScenes: ["健身", "露营", "徒步", "骑行"],
    inputImageType: "unknown"
  },
  jewelry: {
    productStyle: "珠宝配饰 / 精致高级",
    visualFeatures: ["金属光泽", "宝石细节", "佩戴比例"],
    color: "accurate metal and gemstone color",
    material: "metal, gemstone, pearl, leather or accessory material",
    silhouette: "delicate jewelry or accessory silhouette",
    designDetails: "clasp, chain, gemstone setting, engraving, texture and reflective finish",
    productIdentityLock: "same jewelry shape, same chain or clasp, same gemstone setting, same metal color and same decorative details",
    sellingPoints: [
      { type: "quality", title: "光泽质感", description: "金属和宝石细节清楚", visualKeywords: ["shine", "gemstone"] },
      { type: "design", title: "精致设计", description: "结构和比例高级", visualKeywords: ["delicate", "design"] },
      { type: "scene", title: "佩戴效果", description: "尺度和搭配自然", visualKeywords: ["wearing", "scale"] }
    ],
    targetAudience: "关注质感、设计和佩戴效果的珠宝配饰用户",
    targetScenes: ["礼盒", "佩戴特写", "高级静物"],
    inputImageType: "unknown"
  },
  auto: {
    productStyle: "汽车用品 / 实用耐用",
    visualFeatures: ["安装位置", "材质耐用", "功能结构"],
    color: "accurate auto accessory color",
    material: "plastic, leather, metal, rubber or textile automotive material",
    silhouette: "clear automotive accessory shape",
    designDetails: "mounting points, buttons, seams, surface finish, connector and functional structure",
    productIdentityLock: "same auto accessory shape, same connector or mounting structure, same color, same surface texture and same functional details",
    sellingPoints: [
      { type: "function", title: "安装适配", description: "位置和用途清楚", visualKeywords: ["installation", "compatibility"] },
      { type: "quality", title: "耐用材质", description: "结构和材质可信", visualKeywords: ["durable", "material"] },
      { type: "scene", title: "车内外场景", description: "使用场景直观", visualKeywords: ["car interior", "usage"] }
    ],
    targetAudience: "关注适配、耐用和实用功能的汽车用品用户",
    targetScenes: ["车内", "后备箱", "安装展示"],
    inputImageType: "unknown"
  }
};

export function buildProductAnalysisDraft(input: {
  category: ApparelCategory;
  categoryLabel?: string;
  styleLabel?: string;
  sourceFilenames?: string[];
}): ProductAnalysis {
  const base = categoryDefaults[input.category];
  const label = input.categoryLabel ?? categoryLabels[input.category];
  return {
    ...base,
    productName: `${label}商品视觉分析草稿`,
    productNameZh: label,
    productType: label,
    visualUnderstanding: buildVisualUnderstandingDraft({
      category: input.category,
      label,
      sourceFilenames: input.sourceFilenames,
      base
    }),
    productStyle: input.styleLabel ? `${input.styleLabel} / ${base.productStyle}` : base.productStyle
  };
}

function buildVisualUnderstandingDraft(input: {
  category: ApparelCategory;
  label: string;
  sourceFilenames?: string[];
  base: Omit<ProductAnalysis, "productName" | "productNameZh" | "productType" | "visualUnderstanding">;
}): ProductVisualUnderstanding {
  const filenames = input.sourceFilenames?.filter(Boolean) ?? [];
  const sourceImageSummary = filenames.length
    ? `Uploaded references: ${filenames.join(", ")}. Treat these images as the product source of truth and infer front, side, back, material and scale cues when available.`
    : `No uploaded filename metadata was provided; use category defaults for ${input.label} and keep all visual assumptions conservative.`;

  return {
    sourceImageSummary,
    productIdentityAnchors: [
      input.base.productIdentityLock,
      `${input.label} category shape and proportion`,
      input.base.designDetails
    ],
    materialSignals: [input.base.material, ...input.base.sellingPoints.filter((item) => item.type === "material" || item.type === "quality").flatMap((item) => item.visualKeywords)],
    constructionSignals: [input.base.silhouette, input.base.designDetails, ...constructionSignalsForCategory(input.category)],
    stylingSignals: [input.base.productStyle, ...input.base.targetScenes],
    missingAngles: inferMissingAngles(filenames),
    riskNotes: [
      "Do not invent unobserved logos, patterns, closures, certificates or ingredient claims.",
      "If a detail is not visible in the source image, keep the generated detail generic and visually plausible instead of over-specifying it."
    ]
  };
}

function inferMissingAngles(filenames: string[]): string[] {
  const joined = filenames.join(" ").toLowerCase();
  const missing: string[] = [];
  if (!/(back|rear|背|后)/.test(joined)) missing.push("back view");
  if (!/(side|侧)/.test(joined)) missing.push("side view");
  if (!/(detail|texture|macro|细节|材质|五金|拉链|包身)/.test(joined)) missing.push("macro material detail");
  return missing;
}

function constructionSignalsForCategory(category: ApparelCategory): string[] {
  const signals: Record<ApparelCategory, string[]> = {
    women: ["bag silhouette", "handle and strap", "hardware proportion"],
    men: ["front panel", "side profile", "zipper and hardware construction"],
    kids: ["child-safe proportions", "closure security", "soft bag comfort"],
    shoes: ["bag silhouette", "panel-to-strap junction", "bottom profile"],
    bags: ["handle attachment", "zipper", "strap and hardware placement"],
    beauty: ["cap or pump", "label area", "package finish"],
    baby: ["rounded edges", "closure safety", "soft contact surfaces"],
    home: ["edge finish", "surface texture", "room scale"],
    digital: ["screen ratio", "buttons and ports", "camera or sensor layout"],
    food: ["package seal", "ingredient texture", "serving scale"],
    sports: ["reinforced seams", "straps or buckles", "performance structure"],
    jewelry: ["clasp or setting", "reflective finish", "wearing scale"],
    auto: ["mounting point", "connector or fit area", "durable surface finish"]
  };
  return signals[category];
}
