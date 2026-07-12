export const platforms = [
  "vipshop",
  "taobao",
  "jd",
  "pinduoduo",
  "dewu",
  "xiaohongshu",
  "douyin",
  "kuaishou",
  "wechat_channels",
  "amazon",
  "ebay",
  "walmart",
  "etsy",
  "shopee",
  "lazada",
  "aliexpress",
  "tiktok_shop_global",
  "shopify",
  "free"
] as const;
export type CommercePlatform = (typeof platforms)[number];

export const apparelCategories = [
  "women",
  "men",
  "kids",
  "shoes",
  "bags",
  "beauty",
  "baby",
  "home",
  "digital",
  "food",
  "sports",
  "jewelry",
  "auto"
] as const;
export type ApparelCategory = (typeof apparelCategories)[number];

export const scenes = ["street", "studio", "catalog", "white"] as const;
export type ApparelScene = (typeof scenes)[number];

export const sizePresets = ["square", "portrait", "tall"] as const;
export type SizePreset = (typeof sizePresets)[number];

export const assetGroups = ["main", "detail", "activity", "custom"] as const;
export type AssetGroup = (typeof assetGroups)[number];

export const modelModes = ["model", "no_model"] as const;
export type ModelMode = (typeof modelModes)[number];

export const modelProfiles = ["asian_female", "asian_male", "child", "no_face", "upper_body_face", "upper_body_no_face", "lower_body", "product_only"] as const;
export type ModelProfile = (typeof modelProfiles)[number];

export const modelGenders = ["female", "male", "boy", "girl", "no_face", "upper_body_face", "upper_body_no_face", "lower_body"] as const;
export type ModelGender = (typeof modelGenders)[number];

export const modelAgeRanges = ["teen", "young_adult", "adult", "middle_adult", "child_4_6", "child_7_10", "child_11_14"] as const;
export type ModelAgeRange = (typeof modelAgeRanges)[number];

export const modelSkinTones = [
  "east_asian",
  "southeast_asian",
  "south_asian",
  "black_african",
  "white_caucasian",
  "latino_hispanic",
  "middle_eastern",
  "mixed_ethnicity"
] as const;
export type ModelSkinTone = (typeof modelSkinTones)[number];

export const modelHairStyles = ["short", "medium", "long", "curly", "tied", "bob"] as const;
export type ModelHairStyle = (typeof modelHairStyles)[number];

export const sceneVariants = [
  "european_street",
  "korean_street",
  "urban_highstreet",
  "sunny_outdoor",
  "minimal_solid",
  "luxury_home",
  "modern_studio",
  "window_light",
  "minimal_art",
  "magazine_cover",
  "retro_film",
  "pure_white"
] as const;
export type SceneVariant = (typeof sceneVariants)[number];

export const platformLabels: Record<CommercePlatform, string> = {
  vipshop: "唯品会",
  taobao: "天猫/淘宝",
  jd: "京东",
  pinduoduo: "拼多多",
  dewu: "得物",
  xiaohongshu: "小红书",
  douyin: "抖音",
  kuaishou: "快手",
  wechat_channels: "视频号",
  amazon: "Amazon",
  ebay: "eBay",
  walmart: "Walmart",
  etsy: "Etsy",
  shopee: "Shopee",
  lazada: "Lazada",
  aliexpress: "AliExpress",
  tiktok_shop_global: "TikTok Shop",
  shopify: "Shopify/独立站",
  free: "其他"
};

export const categoryLabels: Record<ApparelCategory, string> = {
  women: "女包",
  men: "男包",
  kids: "儿童包",
  shoes: "鞋靴",
  bags: "箱包",
  beauty: "美妆个护",
  baby: "母婴用品",
  home: "家居家纺",
  digital: "数码家电",
  food: "食品生鲜",
  sports: "运动户外",
  jewelry: "珠宝配饰",
  auto: "汽车用品"
};

export const sceneLabels: Record<ApparelScene, string> = {
  street: "外景街拍",
  studio: "室内棚拍",
  catalog: "高端画册",
  white: "纯白底图"
};

export const sceneVariantLabels: Record<SceneVariant, string> = {
  european_street: "欧式建筑",
  korean_street: "韩式街道",
  urban_highstreet: "都市高街",
  sunny_outdoor: "阳光户外",
  minimal_solid: "简约纯色",
  luxury_home: "轻奢家居",
  modern_studio: "现代工作室",
  window_light: "自然光影窗边",
  minimal_art: "极简艺术",
  magazine_cover: "杂志封面",
  retro_film: "复古胶片",
  pure_white: "绝对白底"
};

export const sceneVariantGroups: Record<ApparelScene, SceneVariant[]> = {
  street: ["european_street", "korean_street", "urban_highstreet", "sunny_outdoor"],
  studio: ["minimal_solid", "luxury_home", "modern_studio", "window_light"],
  catalog: ["minimal_art", "magazine_cover", "retro_film"],
  white: ["pure_white"]
};

export const modelProfileLabels: Record<ModelProfile, string> = {
  asian_female: "女包持包模特",
  asian_male: "男包通勤模特",
  child: "儿童包亲子模特",
  no_face: "无露脸持包近景",
  upper_body_face: "真人背包/斜挎",
  upper_body_no_face: "手提/肩带局部",
  lower_body: "半身搭配持包",
  product_only: "仅商品展示"
};

export const modelProfileDescriptions: Record<ModelProfile, string> = {
  asian_female: "以手提、单肩、斜挎和半身搭配为主，适合女包、托特包、腋下包和小皮具展示包型比例",
  asian_male: "以通勤、手提、斜挎和背负为主，适合男包、公文包、胸包和双肩包展示实用比例",
  child: "儿童或亲子场景自然安全，适合儿童包、妈咪包、保温包，动作干净不成人化",
  no_face: "不出现人物脸部，重点看手提、肩背、斜挎、包身、五金和肩带比例",
  upper_body_face: "自然行走、转身、拿取或背负的真人搭配，重点呈现包型、容量感和携带方式",
  upper_body_no_face: "局部特写提手、肩带、拉链、五金、包身材质或开合结构，可带手部但不强调完整人物",
  lower_body: "从腰部或半身到包体的搭配画面，展示手提、斜挎、肩背比例和箱包整体搭配效果",
  product_only: "无真人模特，适合白底、箱包SKU、材质五金细节或纯商品图"
};

export const modelGenderLabels: Record<ModelGender, string> = {
  female: "女包持包模特",
  male: "男包通勤模特",
  boy: "男童背包",
  girl: "女童背包",
  no_face: "无露脸持包",
  upper_body_face: "真人背包/斜挎",
  upper_body_no_face: "手提/肩带局部",
  lower_body: "半身搭配持包"
};

export const modelAgeRangeLabels: Record<ModelAgeRange, string> = {
  teen: "少年感",
  young_adult: "青年",
  adult: "成年",
  middle_adult: "成熟",
  child_4_6: "4-6岁",
  child_7_10: "7-10岁",
  child_11_14: "11-14岁"
};

export const modelSkinToneLabels: Record<ModelSkinTone, string> = {
  east_asian: "东亚人种",
  southeast_asian: "东南亚人种",
  south_asian: "南亚人种",
  black_african: "非洲/黑人",
  white_caucasian: "白人/高加索",
  latino_hispanic: "拉丁/西语裔",
  middle_eastern: "中东人种",
  mixed_ethnicity: "混血/多元"
};

export const modelEthnicityPromptLabels: Record<ModelSkinTone, string> = {
  east_asian: "East Asian fashion ecommerce model, natural East Asian facial features and skin tone range",
  southeast_asian: "Southeast Asian fashion ecommerce model, natural Southeast Asian facial features and warm tropical skin tone range",
  south_asian: "South Asian fashion ecommerce model, natural South Asian facial features and brown skin tone range",
  black_african: "Black / African descent fashion ecommerce model, natural Black facial features, hair texture compatibility, and deep skin tone range",
  white_caucasian: "White / Caucasian fashion ecommerce model, natural European/Caucasian facial features and light skin tone range",
  latino_hispanic: "Latino / Hispanic fashion ecommerce model, natural Latin American facial features and olive-to-warm skin tone range",
  middle_eastern: "Middle Eastern fashion ecommerce model, natural Middle Eastern facial features and olive-to-warm skin tone range",
  mixed_ethnicity: "Mixed-ethnicity / multi-ethnic fashion ecommerce model, balanced diverse facial features and natural skin tone"
};

export const legacyModelSkinToneMap: Record<string, ModelSkinTone> = {
  fair: "white_caucasian",
  natural: "east_asian",
  warm: "latino_hispanic",
  tan: "south_asian"
};

export const modelHairStyleLabels: Record<ModelHairStyle, string> = {
  short: "短发",
  medium: "中发",
  long: "长发",
  curly: "卷发",
  tied: "扎发",
  bob: "波波头"
};

export const modelGenderProfiles: Record<ModelGender, ModelProfile> = {
  female: "asian_female",
  male: "asian_male",
  boy: "child",
  girl: "child",
  no_face: "no_face",
  upper_body_face: "upper_body_face",
  upper_body_no_face: "upper_body_no_face",
  lower_body: "lower_body"
};

export interface PlatformSpec {
  label: string;
  businessSurface: string;
  primaryGoal: string;
  recommendedSizes: SizePreset[];
  outputNaming: string;
  compliance: string[];
}

export const platformSpecs: Record<CommercePlatform, PlatformSpec> = {
  vipshop: {
    label: "唯品会",
    businessSurface: "特卖主图 / 款式详情 / SKU 图",
    primaryGoal: "商品完整居中、质感清楚、白底与竖版主图更容易通过审核",
    recommendedSizes: ["portrait", "square"],
    outputNaming: "款式ID_唯品会_主图/白底",
    compliance: ["禁止价格与促销字", "禁止第三方 Logo", "主体占比稳定", "白底图需纯白"]
  },
  taobao: {
    label: "天猫/淘宝",
    businessSurface: "搜索主图 / 商品卡片 / 详情入口",
    primaryGoal: "天猫/淘宝搜索与详情首屏兼容，商品清晰、风格有记忆点但不依赖文字贴片",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "款式ID_天猫淘宝_800方图",
    compliance: ["禁止牛皮癣文字", "禁止边框拼图", "颜色必须货板一致", "背景不过度花哨"]
  },
  pinduoduo: {
    label: "拼多多",
    businessSurface: "商品列表 / 活动坑位 / SKU 快速铺货",
    primaryGoal: "明亮直接、主体大、商品辨识强，不生成价格贴和夸张促销元素",
    recommendedSizes: ["square"],
    outputNaming: "款式ID_拼多多_方图",
    compliance: ["禁止价格牌", "禁止夸张营销词", "避免杂乱背景", "主体清晰偏大"]
  },
  dewu: {
    label: "得物",
    businessSurface: "质感主图 / SKU透明图 / 细节图 / 场景图",
    primaryGoal: "潮流质感、材质可信、画面干净，尺寸暂按可编辑预设等待商家后台校准",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "款式ID_得物_质感图",
    compliance: ["待商家后台校准", "禁止价格与营销词", "材质细节清楚", "避免过度滤镜"]
  },
  xiaohongshu: {
    label: "小红书",
    businessSurface: "笔记封面 / 商品卡 / 种草场景图",
    primaryGoal: "生活方式真实、有审美记忆点，画面像优质种草内容但商品必须第一眼可识别",
    recommendedSizes: ["portrait", "square"],
    outputNaming: "款式ID_小红书_封面",
    compliance: ["禁止平台Logo", "禁止夸张功效词", "避免硬广式大字报", "保留真实使用场景"]
  },
  jd: {
    label: "京东",
    businessSurface: "自营风主图 / 商详图 / 品质款展示",
    primaryGoal: "可信、克制、清晰，偏标准棚拍和高质感白底展示",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "款式ID_京东_标准图",
    compliance: ["画面干净克制", "禁止不相关道具", "避免强烈滤镜", "材质纹理清楚"]
  },
  douyin: {
    label: "抖音",
    businessSurface: "短视频封面 / 直播商品卡 / 信息流素材",
    primaryGoal: "竖版冲击力强，持包/背包自然，有场景氛围但不能压过包款",
    recommendedSizes: ["tall", "portrait"],
    outputNaming: "款式ID_抖音_竖版",
    compliance: ["禁止文字贴片", "禁止二维码", "携带动作自然", "包款仍是视觉主体"]
  },
  kuaishou: {
    label: "快手",
    businessSurface: "商品卡 / 直播间商品图 / 短视频封面",
    primaryGoal: "真实直接、强识别、高转化，适合直播和短视频场景的移动端首屏",
    recommendedSizes: ["tall", "square"],
    outputNaming: "款式ID_快手_商品图",
    compliance: ["禁止二维码", "禁止夸张促销贴片", "商品不能被主播氛围淹没", "保持真实可信"]
  },
  wechat_channels: {
    label: "视频号",
    businessSurface: "视频号小店商品图 / 橱窗商品卡 / 直播商品图",
    primaryGoal: "克制可信、适合社交电商转化，商品完整清楚且不过度娱乐化",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "款式ID_视频号_商品图",
    compliance: ["禁止二维码", "禁止诱导分享文字", "避免夸张营销词", "画面干净可信"]
  },
  amazon: {
    label: "Amazon",
    businessSurface: "Marketplace main image / listing gallery / A+ compatible product visuals",
    primaryGoal: "strict product-first clarity: pure-white compliant main image, accurate scale, conversion-ready secondary lifestyle and detail views",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_Amazon_Main",
    compliance: ["main image pure white", "no text or watermark", "product fills most of the frame", "accurate product only"]
  },
  ebay: {
    label: "eBay",
    businessSurface: "listing gallery / search thumbnail / condition and angle photos",
    primaryGoal: "clear truthful item representation, multiple inspection angles, condition-readable product photography",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_eBay_Gallery",
    compliance: ["no borders", "no marketing text", "no watermark", "image must accurately represent item"]
  },
  walmart: {
    label: "Walmart",
    businessSurface: "Marketplace main image / product page gallery / zoom-ready product visuals",
    primaryGoal: "retail-standard trust: white-background primary image, crisp product detail, family-friendly secondary lifestyle",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_Walmart_Main",
    compliance: ["white background for primary image", "no promotional overlays", "sharp high-resolution product", "clean retail trust"]
  },
  etsy: {
    label: "Etsy",
    businessSurface: "listing first photo / cropped thumbnails / handmade-style gallery",
    primaryGoal: "handmade or boutique marketplace appeal with enough safe space for square, portrait, and landscape thumbnail crops",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_Etsy_Listing",
    compliance: ["center focal product", "avoid cluttered collage", "no watermark", "keep crop-safe negative space"]
  },
  shopee: {
    label: "Shopee",
    businessSurface: "product main image / mobile marketplace gallery / SKU images",
    primaryGoal: "mobile-first square clarity, product readable in small thumbnails, clean bright Southeast Asia marketplace styling",
    recommendedSizes: ["square"],
    outputNaming: "SKU_Shopee_Main",
    compliance: ["1:1 square preferred", "clear original photo look", "clean background", "product text on packaging readable where relevant"]
  },
  lazada: {
    label: "Lazada",
    businessSurface: "product main image / PDP gallery / campaign-ready mobile product visuals",
    primaryGoal: "Southeast Asia marketplace clarity with large subject, clean background and mobile shopping readability",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_Lazada_Main",
    compliance: ["clean main image", "no misleading product content", "avoid watermark and heavy text", "product must match listing"]
  },
  aliexpress: {
    label: "AliExpress",
    businessSurface: "global listing main image / detail gallery / ad-retargeting product card",
    primaryGoal: "global marketplace readability: clear 1:1 hero, strong product identity, practical secondary scene and detail images",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_AliExpress_Main",
    compliance: ["1:1 main image safe", "avoid misleading props", "no watermark", "product and variant must stay accurate"]
  },
  tiktok_shop_global: {
    label: "TikTok Shop",
    businessSurface: "shop tab product card / affiliate product page / LIVE product pin",
    primaryGoal: "scroll-stopping but compliant square product hero with secondary creator-style lifestyle images",
    recommendedSizes: ["square", "tall"],
    outputNaming: "SKU_TikTokShop_Main",
    compliance: ["no watermark", "no promotional text on main image", "clean main background", "product fills most of frame"]
  },
  shopify: {
    label: "Shopify/独立站",
    businessSurface: "DTC product page / collection grid / campaign landing page",
    primaryGoal: "brand-owned ecommerce photography: consistent ratio, premium brand story, fast-scanning gallery and reusable campaign crops",
    recommendedSizes: ["square", "portrait"],
    outputNaming: "SKU_DTC_Product",
    compliance: ["consistent visual system", "fast-loading clean composition", "no third-party platform logo", "brand-safe product accuracy"]
  },
  free: {
    label: "其他",
    businessSurface: "无固定平台约束的自由商品图",
    primaryGoal: "按商家自定义尺寸和图片类型生成，不套用具体平台审核规则，但仍保持真实、美观、可商用",
    recommendedSizes: ["square", "portrait", "tall"],
    outputNaming: "SKU_其他_Custom",
    compliance: ["自定义尺寸优先", "无平台Logo", "无水印", "商品真实准确"]
  }
};

export const allowedImageSizes = ["1024x1024", "1024x1536", "2160x3840"] as const;
export type AllowedImageSize = (typeof allowedImageSizes)[number];

export interface SizeOption {
  preset: SizePreset;
  label: string;
  providerSize: AllowedImageSize;
  width: number;
  height: number;
  description: string;
}

export const sizeOptions: Record<SizePreset, SizeOption> = {
  square: {
    preset: "square",
    label: "1:1 方图",
    providerSize: "1024x1024",
    width: 1024,
    height: 1024,
    description: "适合白底图、SKU 图、商品卡片"
  },
  portrait: {
    preset: "portrait",
    label: "2:3 竖图",
    providerSize: "1024x1536",
    width: 1024,
    height: 1536,
    description: "适合商品详情、棚拍和平台主图"
  },
  tall: {
    preset: "tall",
    label: "9:16 长竖图",
    providerSize: "2160x3840",
    width: 2160,
    height: 3840,
    description: "适合抖音、信息流和强视觉场景"
  }
};

export function resolveAllowedSize(input: string): SizeOption {
  if (isSizePreset(input)) return sizeOptions[input];
  const matched = Object.values(sizeOptions).find((option) => option.providerSize === input);
  return matched ?? sizeOptions.portrait;
}

export interface PlatformImageTypePreset {
  id: string;
  label: string;
  description: string;
  scene: ApparelScene;
  sceneVariant: SceneVariant;
}

type CategoryImageTypeOverride = Partial<Record<string, Pick<PlatformImageTypePreset, "label" | "description">>>;
type ProductImageTypeOverride = Pick<PlatformImageTypePreset, "label" | "description"> & { direction: string };
type ProductDetailProfile = {
  identityFocus: string;
  imageTypes: Partial<Record<string, ProductImageTypeOverride>>;
};

const categoryImageTypeOverrides: Record<ApparelCategory, CategoryImageTypeOverride> = {
  women: {},
  men: {},
  kids: {
    white_main: { label: "白底童包主图", description: "干净展示童包包型、颜色、肩带和轮廓" },
    scene_main: { label: "童趣场景主图", description: "儿童友好场景，展示背包/手提氛围和实用感" },
    studio_main: { label: "童包棚拍主图", description: "稳定棚拍光，突出童包包型、材质和安全细节" },
    mobile_long_main: { label: "童包竖版首图", description: "移动端竖版构图，展示包款比例和儿童携带感" },
    full_body_main: { label: "童包背携展示", description: "完整展示童包背携比例、活动空间和安全感" },
    side_back_main: { label: "童包侧背补充", description: "补充侧面、背面、肩带、拉链或包体结构" },
    detail_model_fit: { label: "童包背携展示", description: "儿童背携比例自然，展示包型、活动空间和舒适度" },
    detail_size_fit: { label: "童包尺寸容量说明", description: "表达年龄段、容量、肩带长度和活动余量" }
  },
  shoes: {
    white_main: { label: "白底包款主图", description: "完整展示包型、包身、肩带、五金和轮廓" },
    scene_main: { label: "场景主图", description: "展示包款在通勤、旅行或日常场景中的使用感" },
    studio_main: { label: "质感棚拍包图", description: "稳定光线展示包身材质、包型和五金结构" },
    mobile_long_main: { label: "包款竖版首图", description: "适合移动端，突出包型比例和视觉冲击" },
    full_body_main: { label: "完整包款图", description: "完整展示包型、包身、肩带和持包/背包比例" },
    side_back_main: { label: "侧背包型图", description: "补充侧面、背面、包底、肩带和内部结构角度" },
    detail_header_poster: { label: "包款页头海报", description: "建立包款风格、容量卖点和使用场景" },
    detail_white_product: { label: "白底包款展示", description: "完整展示包型、包身、肩带、五金和轮廓" },
    detail_model_fit: { label: "持包效果展示", description: "展示真人携带比例、肩带长度和搭配效果" },
    detail_texture: { label: "包身材质特写", description: "特写皮革、帆布、尼龙、绒面或包身纹理" },
    detail_craft: { label: "五金/拉链结构", description: "展示拉链、扣具、肩带连接、包底脚钉和车缝结构" },
    detail_design_points: { label: "箱包功能卖点", description: "突出容量分区、轻量、耐磨、防泼水、肩背舒适等功能点" },
    detail_size_fit: { label: "尺寸容量说明", description: "表达长宽高、容量、肩带长度、电脑仓和适配场景" },
    detail_color_sku: { label: "包款颜色/SKU", description: "展示不同包款颜色和货板一致性" },
    detail_scene_lifestyle: { label: "通勤/旅行场景", description: "展示包款在通勤、旅行或日常场景中的使用感" },
    detail_footer_trust: { label: "箱包品质背书", description: "以干净质感收尾，强化箱包材料和结构可信度" }
  },
  bags: {
    white_main: { label: "白底包款主图", description: "完整展示包型、肩带、五金和轮廓" },
    scene_main: { label: "背携场景主图", description: "展示通勤、旅行或日常背携效果" },
    studio_main: { label: "质感棚拍包图", description: "稳定光线展示材质、五金和包体结构" },
    mobile_long_main: { label: "包款竖版首图", description: "移动端竖版构图，突出包型和搭配比例" },
    full_body_main: { label: "完整包款图", description: "完整展示包型、肩带、手柄、五金和容量比例" },
    side_back_main: { label: "侧背包型图", description: "补充侧面、背面、底部或开合结构角度" },
    detail_header_poster: { label: "包款页头海报", description: "建立包款风格、容量卖点和通勤/旅行场景" },
    detail_white_product: { label: "白底包款展示", description: "完整展示包型、轮廓、肩带和五金位置" },
    detail_model_fit: { label: "上身背携展示", description: "展示手提、单肩、斜挎或双肩背负比例" },
    detail_texture: { label: "包身材质特写", description: "特写皮革、帆布、尼龙、纹理和边油质感" },
    detail_craft: { label: "五金拉链细节", description: "展示拉链、扣具、铆钉、走线、包边和开合工艺" },
    detail_design_points: { label: "容量分区展示", description: "突出隔层、口袋、收纳结构和使用便利性" },
    detail_size_fit: { label: "肩带手柄结构", description: "展示肩带长度、手柄高度、包体尺寸和背负比例" },
    detail_color_sku: { label: "包款颜色/SKU", description: "展示包款多色、材质和五金色一致性" },
    detail_scene_lifestyle: { label: "通勤旅行场景", description: "展示包款在办公、出行或城市生活中的搭配" },
    detail_footer_trust: { label: "包款品质背书", description: "以高级材质和工艺氛围做详情页收尾" }
  },
  beauty: {
    white_main: { label: "白底包装主图", description: "完整展示瓶身、盒体、盖子、泵头或彩妆盘结构" },
    scene_main: { label: "梳妆台场景", description: "展示浴室、梳妆台或随身使用氛围" },
    studio_main: { label: "精修质感主图", description: "高光反射和包装质感清晰，适合首图" },
    mobile_long_main: { label: "美妆竖版首图", description: "移动端竖版构图，突出产品精致感和功效氛围" },
    full_body_main: { label: "完整包装图", description: "完整展示瓶身、盒体、盖子、泵头或彩妆盘结构" },
    side_back_main: { label: "侧背包装图", description: "补充侧面、背标、开盖或包装结构角度" },
    detail_header_poster: { label: "美妆页头海报", description: "建立产品功效、质地氛围和品牌精致感" },
    detail_white_product: { label: "白底包装展示", description: "完整展示瓶罐、管状、盒装或彩妆包装" },
    detail_model_fit: { label: "手持/上妆展示", description: "用手持、试色或局部上妆体现使用方式" },
    detail_texture: { label: "膏体质地特写", description: "特写乳霜、精华、粉质、唇釉或试色色块质地" },
    detail_craft: { label: "包装工艺细节", description: "展示瓶盖、泵头、压纹、烫印、刷头或盒体工艺" },
    detail_design_points: { label: "成分卖点氛围", description: "用干净道具和质地表现保湿、修护、显色等卖点" },
    detail_size_fit: { label: "使用步骤展示", description: "表达打开、取用、涂抹、收纳等使用流程" },
    detail_color_sku: { label: "色号/SKU展示", description: "展示色号、质地差异和套装货板一致性" },
    detail_scene_lifestyle: { label: "梳妆台场景", description: "展示产品在浴室、梳妆台或随身使用场景" },
    detail_footer_trust: { label: "品牌质感收尾", description: "用精致干净构图强化安全、品质和品牌信任" }
  },
  baby: {
    white_main: { label: "白底母婴主图", description: "完整展示产品结构、规格和安全边缘" },
    scene_main: { label: "亲子使用场景", description: "展示宝宝或亲子自然使用状态，安全真实" },
    studio_main: { label: "柔和棚拍主图", description: "温和光线展示材质、结构和安全感" },
    mobile_long_main: { label: "母婴竖版首图", description: "移动端竖版构图，突出柔软、安全和照护氛围" },
    full_body_main: { label: "完整母婴展示", description: "完整展示用品结构、配件和使用比例" },
    side_back_main: { label: "结构角度补充", description: "补充背面、侧面、开合、固定或收纳结构" },
    detail_header_poster: { label: "母婴页头海报", description: "建立安全、柔软、亲子友好的首屏氛围" },
    detail_white_product: { label: "白底母婴展示", description: "完整展示产品结构、规格和安全边缘" },
    detail_model_fit: { label: "宝宝使用展示", description: "展示宝宝或亲子自然使用状态，安全真实" },
    detail_texture: { label: "柔软材质特写", description: "特写棉柔、亲肤、无刺激材质和细节" },
    detail_craft: { label: "安全结构细节", description: "展示圆角、防滑、固定、缝制或开合安全结构" },
    detail_design_points: { label: "照护卖点展示", description: "突出舒适、安全、便携、易清洁等母婴卖点" },
    detail_size_fit: { label: "年龄规格说明", description: "表达年龄段、尺寸、容量或成长适配" },
    detail_color_sku: { label: "颜色/规格展示", description: "展示柔和配色和规格组合" },
    detail_scene_lifestyle: { label: "亲子生活场景", description: "展示卧室、餐椅、出行或护理场景" },
    detail_footer_trust: { label: "安全品质背书", description: "以温和可信画面做详情页收尾" }
  },
  home: {
    white_main: { label: "白底家居主图", description: "完整展示产品结构、轮廓和尺寸比例" },
    scene_main: { label: "居家场景主图", description: "展示客厅、卧室、餐厨等真实空间摆放效果" },
    studio_main: { label: "材质棚拍主图", description: "稳定光线展示材质、边角、结构和工艺" },
    mobile_long_main: { label: "家居竖版首图", description: "移动端竖版构图，展示空间比例和生活氛围" },
    full_body_main: { label: "完整结构展示", description: "完整展示产品整体、配件、容量或组合形态" },
    side_back_main: { label: "多角度结构图", description: "补充侧面、背面、底部、开合或内部结构角度" },
    detail_header_poster: { label: "家居页头海报", description: "建立居家空间氛围、材质和生活方式" },
    detail_white_product: { label: "白底家居展示", description: "完整展示产品结构、轮廓和尺寸比例" },
    detail_model_fit: { label: "空间摆放效果", description: "展示产品在客厅、卧室、餐厨等空间中的比例" },
    detail_texture: { label: "材质纹理特写", description: "特写木纹、布艺、金属、陶瓷或纤维质感" },
    detail_craft: { label: "结构工艺细节", description: "展示连接、边角、缝线、承托、开合或安装结构" },
    detail_design_points: { label: "功能卖点展示", description: "突出收纳、承重、易清洁、舒适、节省空间等功能" },
    detail_size_fit: { label: "尺寸空间说明", description: "表达占地、层高、容量、适配空间和组合方式" },
    detail_color_sku: { label: "颜色规格展示", description: "展示颜色、材质、尺寸或套装规格" },
    detail_scene_lifestyle: { label: "居家场景搭配", description: "展示真实生活空间搭配和使用氛围" },
    detail_footer_trust: { label: "家居品质收尾", description: "以温暖干净的空间质感强化品质信任" }
  },
  digital: {
    white_main: { label: "白底设备主图", description: "完整展示设备外观、屏幕、接口和配件" },
    scene_main: { label: "桌面使用场景", description: "展示办公、游戏、出行或居家科技场景" },
    studio_main: { label: "科技质感主图", description: "精修光线展示金属、玻璃、屏幕和按键" },
    mobile_long_main: { label: "数码竖版首图", description: "移动端竖版构图，突出科技感和使用方式" },
    full_body_main: { label: "完整设备展示", description: "完整展示设备、配件、屏幕比例和整体结构" },
    side_back_main: { label: "接口背面补充", description: "补充背面、侧面、接口、镜头、按键或控制面板" },
    detail_header_poster: { label: "科技页头海报", description: "建立产品性能、科技感和使用场景" },
    detail_white_product: { label: "白底设备展示", description: "完整展示设备外观、屏幕、接口和配件" },
    detail_model_fit: { label: "手持/桌面使用", description: "展示手持、桌面、办公或居家使用状态" },
    detail_texture: { label: "屏幕接口特写", description: "特写屏幕边框、接口、镜头、按键或材质" },
    detail_craft: { label: "按键结构细节", description: "展示按键、转轴、散热孔、接口、线材和装配细节" },
    detail_design_points: { label: "功能卖点展示", description: "突出续航、性能、便携、智能、静音等功能" },
    detail_size_fit: { label: "尺寸比例说明", description: "表达设备尺寸、厚度、重量感和桌面占比" },
    detail_color_sku: { label: "颜色配置展示", description: "展示颜色、配置、套装和配件组合" },
    detail_scene_lifestyle: { label: "办公生活场景", description: "展示办公、游戏、出行或居家科技场景" },
    detail_footer_trust: { label: "科技品质收尾", description: "以精密、干净、可信的科技画面收尾" }
  },
  food: {
    white_main: { label: "白底包装主图", description: "完整展示包装、规格和产品形态" },
    scene_main: { label: "食用场景主图", description: "展示餐桌、茶歇、厨房或户外食用氛围" },
    studio_main: { label: "食欲质感主图", description: "稳定光线展示色泽、质地和新鲜感" },
    mobile_long_main: { label: "食品竖版首图", description: "移动端竖版构图，突出风味和购买欲" },
    full_body_main: { label: "完整包装陈列", description: "完整展示包装、开袋、倒出或组合装形态" },
    side_back_main: { label: "规格背标补充", description: "补充背标、侧面、封口、罐盖、礼盒或内容物角度" },
    detail_header_poster: { label: "食品页头海报", description: "建立新鲜、风味和购买欲的首屏氛围" },
    detail_white_product: { label: "白底包装展示", description: "完整展示包装、规格和产品形态" },
    detail_model_fit: { label: "食用/手持展示", description: "展示手持、开袋、倒出或食用场景" },
    detail_texture: { label: "食材口感特写", description: "特写纹理、水分、颗粒、酥脆或鲜嫩状态" },
    detail_craft: { label: "包装密封细节", description: "展示封口、罐盖、袋体、保鲜或礼盒结构" },
    detail_design_points: { label: "风味卖点展示", description: "突出产地、口味、营养、新鲜或方便食用" },
    detail_size_fit: { label: "规格份量说明", description: "表达容量、克重、份量、组合和储存方式" },
    detail_color_sku: { label: "口味/SKU展示", description: "展示多口味、多规格或组合装" },
    detail_scene_lifestyle: { label: "餐桌生活场景", description: "展示早餐、茶歇、厨房、户外或聚会场景" },
    detail_footer_trust: { label: "食品品质背书", description: "以干净可靠构图强化新鲜和安全感" }
  },
  sports: {
    white_main: { label: "白底装备主图", description: "完整展示运动装备、服饰或器材结构" },
    scene_main: { label: "运动场景主图", description: "展示跑步、健身、露营、骑行或户外使用感" },
    studio_main: { label: "性能棚拍主图", description: "稳定光线展示功能材质、结构和力量感" },
    mobile_long_main: { label: "运动竖版首图", description: "移动端竖版构图，突出性能和活力" },
    full_body_main: { label: "完整装备展示", description: "完整展示装备结构、配件、穿戴或使用比例" },
    side_back_main: { label: "功能角度补充", description: "补充侧背、扣具、绑带、防滑、支撑或收纳结构" },
    detail_header_poster: { label: "运动户外海报", description: "建立性能、活力和户外使用场景" },
    detail_white_product: { label: "白底装备展示", description: "完整展示运动装备、服饰或器材结构" },
    detail_model_fit: { label: "运动使用展示", description: "展示穿戴、握持、背负或运动中的真实使用状态" },
    detail_texture: { label: "功能材质特写", description: "特写防水、透气、弹力、耐磨或抓地材质" },
    detail_craft: { label: "结构工艺细节", description: "展示扣具、绑带、缝线、支撑、缓震或防滑结构" },
    detail_design_points: { label: "性能卖点展示", description: "突出轻量、防护、支撑、便携、耐用等性能" },
    detail_size_fit: { label: "穿戴规格说明", description: "表达尺码、调节范围、负重或适配人群" },
    detail_color_sku: { label: "颜色规格展示", description: "展示颜色、尺码、套装或装备组合" },
    detail_scene_lifestyle: { label: "户外运动场景", description: "展示山地、跑步、健身、露营或骑行场景" },
    detail_footer_trust: { label: "运动品质背书", description: "以力量感和专业感强化产品可信度" }
  },
  jewelry: {
    white_main: { label: "白底珠宝主图", description: "完整展示首饰形态、镶嵌、光泽和比例" },
    scene_main: { label: "佩戴礼赠场景", description: "展示佩戴、礼盒、通勤或宴会氛围" },
    studio_main: { label: "微距质感主图", description: "精修光影展示金属、宝石、珍珠和切面" },
    mobile_long_main: { label: "珠宝竖版首图", description: "移动端竖版构图，突出精致、光泽和礼赠感" },
    full_body_main: { label: "完整款式展示", description: "完整展示项链、戒指、耳饰、手表或配饰形态" },
    side_back_main: { label: "工艺角度补充", description: "补充扣头、链节、背面、镶嵌、表冠或铰链结构" },
    detail_header_poster: { label: "珠宝页头海报", description: "建立精致、光泽和礼赠氛围" },
    detail_white_product: { label: "白底珠宝展示", description: "完整展示首饰形态、镶嵌和比例" },
    detail_model_fit: { label: "佩戴效果展示", description: "展示耳、颈、手腕或手指佩戴比例" },
    detail_texture: { label: "材质光泽特写", description: "特写金属、宝石、珍珠、切面和反光质感" },
    detail_craft: { label: "镶嵌工艺细节", description: "展示爪镶、链节、扣头、刻面、抛光和连接结构" },
    detail_design_points: { label: "设计寓意展示", description: "突出造型、线条、礼赠感和搭配亮点" },
    detail_size_fit: { label: "佩戴尺寸说明", description: "表达链长、戒圈、耳饰大小或手围比例" },
    detail_color_sku: { label: "款式/SKU展示", description: "展示不同金色、石色、尺寸或套装组合" },
    detail_scene_lifestyle: { label: "礼赠佩戴场景", description: "展示礼盒、约会、通勤或宴会佩戴氛围" },
    detail_footer_trust: { label: "珠宝品质背书", description: "以高级光影和精密工艺做详情页收尾" }
  },
  auto: {
    white_main: { label: "白底车品主图", description: "完整展示车品结构、配件和安装形态" },
    scene_main: { label: "车内实装场景", description: "展示车内、车外、清洁、收纳或安装使用场景" },
    studio_main: { label: "耐用质感主图", description: "稳定光线展示材质、接口、按钮和结构" },
    mobile_long_main: { label: "车品竖版首图", description: "移动端竖版构图，突出功能和专业感" },
    full_body_main: { label: "完整配件展示", description: "完整展示配件、套装、线材、接口或适配结构" },
    side_back_main: { label: "安装角度补充", description: "补充卡扣、接口、背面、侧面、安装点或固定结构" },
    detail_header_poster: { label: "车品页头海报", description: "建立车内外使用场景、功能和品质感" },
    detail_white_product: { label: "白底车品展示", description: "完整展示车品结构、配件和安装形态" },
    detail_model_fit: { label: "车内使用展示", description: "展示安装、手持、收纳或驾驶场景中的使用方式" },
    detail_texture: { label: "材质耐用特写", description: "特写皮革、塑料、金属、纤维、防滑或耐磨材质" },
    detail_craft: { label: "安装结构细节", description: "展示卡扣、接口、固定点、缝线、开关或连接结构" },
    detail_design_points: { label: "功能卖点展示", description: "突出收纳、防护、清洁、安全、智能或便携功能" },
    detail_size_fit: { label: "车型适配说明", description: "表达尺寸、安装位置、兼容车型或空间占比" },
    detail_color_sku: { label: "颜色规格展示", description: "展示颜色、尺寸、套装或接口规格" },
    detail_scene_lifestyle: { label: "车内外场景", description: "展示驾驶、露营、清洁、收纳或停车使用场景" },
    detail_footer_trust: { label: "车品品质背书", description: "以专业、耐用、可信画面做详情页收尾" }
  }
};

const productDetailProfiles: Record<string, ProductDetailProfile> = {
  necklace_ring: productProfile({
    product: "首饰",
    hero: "建立首饰光泽、佩戴精致感和礼赠氛围",
    white: "完整展示首饰造型、镶嵌、链扣和比例",
    use: "佩戴效果展示",
    useDesc: "展示耳、颈、手腕或手指佩戴比例",
    texture: "金属宝石光泽",
    textureDesc: "特写金属、宝石、珍珠、切面和反光质感",
    craft: "镶嵌链扣细节",
    craftDesc: "展示爪镶、链节、扣头、刻面、抛光和连接结构",
    feature: "设计寓意展示",
    featureDesc: "突出造型、线条、礼赠感和搭配亮点",
    size: "佩戴尺寸说明",
    sizeDesc: "表达链长、戒圈、耳饰大小或手围比例",
    sku: "金色/石色/SKU",
    scene: "礼赠佩戴场景",
    trust: "首饰品质背书",
    identity: "Subcategory identity focus: preserve the exact jewelry design, stone placement, metal color, setting, chain links, clasp, engraving-like marks, pearl or gem shape, polish, shine, and wearing scale.",
    directionTerms: "metal shine, gemstone setting, clasp, chain links, cut facets, engraving-like marks, wearing scale, gift-box or clean premium surface"
  }),
  watch: productProfile({
    product: "腕表",
    hero: "建立腕表精密质感、佩戴气质和商务/科技场景",
    white: "完整展示表盘、表圈、表冠、表带和扣具",
    use: "上手佩戴展示",
    useDesc: "展示手腕佩戴比例、表盘大小和表带贴合度",
    texture: "表盘镜面特写",
    textureDesc: "特写表盘刻度、指针、镜面反射、表圈和材质光泽",
    craft: "表冠表扣细节",
    craftDesc: "展示表冠、表扣、表带连接、刻度、机芯窗或按键结构",
    feature: "机芯功能卖点",
    featureDesc: "突出机械质感、计时功能、防水运动感或智能交互",
    size: "腕围尺寸说明",
    sizeDesc: "表达表径、厚度、腕围比例和佩戴松紧",
    sku: "表盘/表带SKU",
    scene: "商务/运动佩戴",
    trust: "腕表品质背书",
    identity: "Subcategory identity focus: preserve the exact watch case shape, dial layout, hands, indices, bezel, crown, buttons, strap links or band material, clasp, screen or mechanical details, color, markings, and wrist scale.",
    directionTerms: "watch dial, bezel, crown, hands, indices, strap material, clasp, case thickness, wrist scale, precise luxury or smart-tech presentation"
  }),
  glasses: productProfile({
    product: "眼镜",
    hero: "建立眼镜框型、镜片质感和脸型适配氛围",
    white: "完整展示镜框、镜片、鼻托、镜腿和铰链",
    use: "佩戴效果展示",
    useDesc: "展示脸部佩戴比例、框型修饰和镜片透明度",
    texture: "镜片框型特写",
    textureDesc: "特写镜框材质、镜片反射、鼻托、铰链和镜腿纹理",
    craft: "铰链鼻托细节",
    craftDesc: "展示铰链、螺丝、鼻托、镜腿连接和边缘打磨",
    feature: "脸型适配卖点",
    featureDesc: "突出显脸小、防晒、轻量、防蓝光或舒适鼻托",
    size: "脸型尺寸说明",
    sizeDesc: "表达框宽、镜片大小、鼻梁距离和脸型适配比例",
    sku: "框色/镜片SKU",
    scene: "通勤/户外佩戴",
    trust: "眼镜品质背书",
    identity: "Subcategory identity focus: preserve the exact eyewear frame shape, lens color and transparency, hinge, nose pads, temple arms, bridge, rim thickness, material finish, logo-like marks, and face/tabletop scale.",
    directionTerms: "eyewear frame shape, lens reflection, hinge, nose pads, temple arms, bridge width, face scale, optical clarity"
  }),
  fashion_accessory: productProfile({
    product: "配饰",
    hero: "建立箱包配饰搭配氛围、材质和造型亮点",
    white: "完整展示配饰形态、边缘、扣具和材质",
    use: "穿戴搭配展示",
    useDesc: "展示帽子、围巾、腰带或配饰在身上的比例",
    texture: "配饰材质特写",
    textureDesc: "特写织物、皮革、金属扣、纹理和边缘处理",
    craft: "扣具边缘细节",
    craftDesc: "展示扣具、缝线、收边、孔位、编织或连接结构",
    feature: "搭配卖点展示",
    featureDesc: "突出搭配性、修饰比例、保暖、防晒或收腰功能",
    size: "穿戴尺寸说明",
    sizeDesc: "表达长度、宽度、围度、调节范围和穿戴比例",
    sku: "颜色/款式SKU",
    scene: "日常搭配场景",
    trust: "配饰品质背书",
    identity: "Subcategory identity focus: preserve the exact accessory shape, material, buckle or edge detail, weave or leather grain, stitching, color, pattern, logo-like marks, and wearing scale.",
    directionTerms: "accessory material texture, buckle or edge detail, stitching, wearing scale, styling compatibility, accurate color"
  }),
  phone_tablet: productProfile({
    product: "手机平板",
    hero: "建立屏幕科技感、机身质感和移动使用场景",
    white: "完整展示屏幕比例、边框、镜头、接口和机身",
    use: "手持使用展示",
    useDesc: "展示手持比例、屏幕可读性和移动使用状态",
    texture: "屏幕镜头特写",
    textureDesc: "特写屏幕边框、镜头模组、接口、按键和材质反光",
    craft: "接口按键细节",
    craftDesc: "展示接口、按键、镜头环、扬声器孔和装配缝隙",
    feature: "性能功能卖点",
    featureDesc: "突出影像、屏幕、轻薄、续航或智能交互",
    size: "机身尺寸说明",
    sizeDesc: "表达屏幕尺寸、厚度、重量感和手持比例",
    sku: "颜色/配置SKU",
    scene: "办公生活场景",
    trust: "数码品质背书",
    identity: "Subcategory identity focus: preserve exact screen ratio, bezel, camera layout, ports, buttons, accessory geometry, color, finish, label-like marks, and interface placement.",
    directionTerms: "screen ratio, bezels, camera layout, ports, buttons, clean reflection, hand scale, technology trust"
  }),
  home_appliance: productProfile({
    product: "家用电器",
    hero: "建立家电功能感、清洁质感和居家使用场景",
    white: "完整展示电器外观、控制面板、功能部件和配件",
    use: "居家使用展示",
    useDesc: "展示厨房、浴室或居家场景中的真实使用状态",
    texture: "面板材质特写",
    textureDesc: "特写控制面板、出风口、按钮、接口和表面材质",
    craft: "结构部件细节",
    craftDesc: "展示开合、滤网、刀头、喷嘴、线材或装配结构",
    feature: "功能卖点展示",
    featureDesc: "突出清洁、静音、快速、智能、节能或容量功能",
    size: "容量尺寸说明",
    sizeDesc: "表达容量、占地、收纳和居家空间比例",
    sku: "颜色/规格SKU",
    scene: "厨房浴室场景",
    trust: "家电品质背书",
    identity: "Subcategory identity focus: preserve exact appliance shape, control panel, functional part, buttons, vents, cable or accessory, color, finish, and usage scale.",
    directionTerms: "appliance form, control panel, functional part, buttons, vents, capacity, kitchen or bathroom context"
  }),
  skincare: productProfile({
    product: "护肤品",
    hero: "建立护肤功效、瓶罐质感和干净安心氛围",
    white: "完整展示瓶身、罐体、盖子、泵头和外盒",
    use: "手持取用展示",
    useDesc: "展示手持、按压、取用或涂抹状态",
    texture: "精华膏体特写",
    textureDesc: "特写精华、乳霜、凝胶、面膜或水润质地",
    craft: "瓶盖泵头细节",
    craftDesc: "展示瓶盖、泵头、压纹、标签和包装材质",
    feature: "护肤功效氛围",
    featureDesc: "突出保湿、修护、舒缓、清爽或光泽肤感",
    size: "使用步骤说明",
    sizeDesc: "表达打开、按压、取用、涂抹和收纳流程",
    sku: "容量/套装SKU",
    scene: "浴室梳妆台场景",
    trust: "护肤品质背书",
    identity: "Subcategory identity focus: preserve exact skincare bottle, jar, tube, cap, pump, box, label-like marks, formula color and package material.",
    directionTerms: "skincare bottle or jar, pump, cap, label integrity, cream or serum texture, clean vanity scene"
  }),
  makeup: productProfile({
    product: "彩妆",
    hero: "建立彩妆显色、精致包装和美妆氛围",
    white: "完整展示口红、粉底、眼影盘或彩妆包装",
    use: "试色上妆展示",
    useDesc: "展示手臂试色、唇部/面部局部上妆或手持使用",
    texture: "色彩质地特写",
    textureDesc: "特写粉质、膏体、唇釉、粉底液或试色色块",
    craft: "彩妆包装细节",
    craftDesc: "展示管身、刷头、压盘、盒盖、镜面和开合结构",
    feature: "妆效卖点展示",
    featureDesc: "突出显色、持妆、光泽、遮瑕或细腻粉质",
    size: "上妆步骤说明",
    sizeDesc: "表达打开、蘸取、涂抹和补妆流程",
    sku: "色号/SKU展示",
    scene: "化妆台场景",
    trust: "彩妆品质背书",
    identity: "Subcategory identity focus: preserve exact makeup package, tube, compact, palette layout, applicator, shade color, label-like marks and material finish.",
    directionTerms: "makeup tube or compact, applicator, shade swatch, powder or gloss texture, polished beauty editorial scene"
  }),
  bedding: productProfile({
    product: "床品家纺",
    hero: "建立卧室柔软感、面料质感和居家氛围",
    white: "完整展示床品套件、枕被、折叠边缘和花纹",
    use: "卧室铺设展示",
    useDesc: "展示床上铺设、折叠、枕被组合和空间比例",
    texture: "织物柔软特写",
    textureDesc: "特写纤维、织纹、绗缝、印花和柔软厚度",
    craft: "缝线包边细节",
    craftDesc: "展示包边、拉链、纽扣、绗缝、走线和角部结构",
    feature: "睡眠舒适卖点",
    featureDesc: "突出亲肤、保暖、透气、柔软或可机洗",
    size: "床型尺寸说明",
    sizeDesc: "表达床型、被套尺寸、枕套数量和铺设比例",
    sku: "花色/尺寸SKU",
    scene: "卧室搭配场景",
    trust: "家纺品质背书",
    identity: "Subcategory identity focus: preserve exact bedding pattern, fabric weave, quilting, seams, edge finish, color, set composition and scale.",
    directionTerms: "bedding fabric weave, softness, quilting, pillow and duvet scale, bedroom matching"
  }),
  furniture: productProfile({
    product: "家具家装",
    hero: "建立空间质感、结构设计和家居氛围",
    white: "完整展示家具结构、轮廓、材质和尺寸比例",
    use: "空间摆放展示",
    useDesc: "展示客厅、卧室、餐厅或书房摆放比例",
    texture: "木纹布艺特写",
    textureDesc: "特写木纹、布艺、金属、皮革、边角和表面处理",
    craft: "连接边角细节",
    craftDesc: "展示连接、支撑、抽屉、脚架、边角和装配结构",
    feature: "空间功能卖点",
    featureDesc: "突出收纳、承重、舒适、节省空间或可组合",
    size: "空间尺寸说明",
    sizeDesc: "表达占地、层高、承重、组合和房间比例",
    sku: "颜色/尺寸SKU",
    scene: "家居空间场景",
    trust: "家具品质背书",
    identity: "Subcategory identity focus: preserve exact furniture silhouette, material, legs, edges, handles, surface finish, color, pattern, dimensions and assembly details.",
    directionTerms: "furniture scale, wood grain or fabric texture, legs, edges, room context, assembly structure"
  }),
  kitchenware: productProfile({
    product: "厨具餐具",
    hero: "建立厨房实用感、材质质感和餐桌氛围",
    white: "完整展示锅具、杯盘、刀具或收纳结构",
    use: "厨房餐桌展示",
    useDesc: "展示烹饪、盛放、手持或餐桌使用状态",
    texture: "金属陶瓷特写",
    textureDesc: "特写不锈钢、陶瓷、玻璃、涂层、手柄和边缘",
    craft: "手柄边缘细节",
    craftDesc: "展示手柄、锅底、杯口、盘沿、盖子和连接结构",
    feature: "烹饪收纳卖点",
    featureDesc: "突出不粘、耐热、易清洁、容量或节省空间",
    size: "容量规格说明",
    sizeDesc: "表达容量、口径、套装数量和厨房空间比例",
    sku: "颜色/套装SKU",
    scene: "厨房餐桌场景",
    trust: "厨具品质背书",
    identity: "Subcategory identity focus: preserve exact kitchenware shape, handle, lid, rim, coating, material finish, color, capacity and set composition.",
    directionTerms: "kitchenware material finish, handle, lid, rim, coating, capacity, tabletop or kitchen scene"
  }),
  computer_office: productProfile({
    product: "电脑办公",
    hero: "建立办公效率、科技质感和桌面场景",
    white: "完整展示电脑、键盘、鼠标、外设或办公设备",
    use: "桌面办公展示",
    useDesc: "展示桌面使用、手部操作、接口连接和办公比例",
    texture: "键盘接口特写",
    textureDesc: "特写键盘、接口、屏幕边框、转轴、按键和材质",
    craft: "转轴接口细节",
    craftDesc: "展示转轴、接口、按键、散热孔、线材和装配结构",
    feature: "办公功能卖点",
    featureDesc: "突出效率、便携、静音、性能、连接或人体工学",
    size: "桌面尺寸说明",
    sizeDesc: "表达设备尺寸、厚度、桌面占比和收纳比例",
    sku: "配置/颜色SKU",
    scene: "办公桌面场景",
    trust: "办公数码品质背书",
    identity: "Subcategory identity focus: preserve exact computer or office device shape, keys, screen ratio, ports, hinge, buttons, color, finish and accessory layout.",
    directionTerms: "computer or office device, keyboard, screen ratio, ports, hinge, desk scale, productivity scenario"
  }),
  camera_audio: productProfile({
    product: "影音摄影",
    hero: "建立镜头音质、精密器材和创作场景",
    white: "完整展示相机、耳机、音箱、镜头或配件",
    use: "拍摄聆听展示",
    useDesc: "展示手持拍摄、佩戴耳机、桌面音箱或创作状态",
    texture: "镜头声学特写",
    textureDesc: "特写镜头、按钮、网罩、耳罩、接口和材质纹理",
    craft: "按键接口细节",
    craftDesc: "展示按键、旋钮、镜头环、声学网罩、接口和连接结构",
    feature: "影音性能卖点",
    featureDesc: "突出清晰、降噪、低延迟、便携、专业或沉浸感",
    size: "设备规格说明",
    sizeDesc: "表达尺寸、佩戴比例、桌面占比或配件组合",
    sku: "颜色/配置SKU",
    scene: "创作影音场景",
    trust: "影音器材品质背书",
    identity: "Subcategory identity focus: preserve exact camera/audio device shape, lens, buttons, mesh, ear cups, ports, color, finish and accessory geometry.",
    directionTerms: "lens or speaker detail, buttons, mesh, ear cups, ports, clean studio reflection, creative usage context"
  })
};

Object.assign(productDetailProfiles, {
  fragrance: productProfile({
    product: "香水香氛", hero: "建立香气意境、玻璃瓶质感和高级氛围", white: "完整展示瓶身、瓶盖、喷头、液体颜色和外盒", use: "手持喷洒展示", useDesc: "展示手持、喷洒、摆放或香薰使用状态", texture: "瓶身液体特写", textureDesc: "特写玻璃、液体色泽、瓶盖、喷头和反光", craft: "瓶盖喷头细节", craftDesc: "展示喷头、瓶盖、标签、压纹、盒体和玻璃厚度", feature: "香调氛围展示", featureDesc: "用花果、木质、清新或温暖氛围表达香调", size: "容量规格说明", sizeDesc: "表达瓶身容量、旅行装、套装和摆放比例", sku: "香型/容量SKU", scene: "梳妆台香氛场景", trust: "香氛品质背书", identity: "Subcategory identity focus: preserve exact fragrance bottle silhouette, cap, sprayer, liquid tone, label-like marks, box and reflective glass material.", directionTerms: "fragrance glass bottle, cap, sprayer, liquid tone, reflective luxury surface, scent mood"
  }),
  personal_care: productProfile({
    product: "个护清洁", hero: "建立日常清洁、清爽可信和浴室使用氛围", white: "完整展示瓶身、泵头、管状包装或清洁工具", use: "清洁使用展示", useDesc: "展示手持、挤出、泡沫、冲洗或浴室使用状态", texture: "泡沫质地特写", textureDesc: "特写泡沫、啫喱、膏体、刷头或包装材质", craft: "泵头瓶身细节", craftDesc: "展示泵头、瓶盖、管口、刷毛、标签和防滑结构", feature: "清洁卖点展示", featureDesc: "突出清爽、温和、除菌、柔顺或便携功能", size: "使用规格说明", sizeDesc: "表达容量、用量、旅行装或家庭装比例", sku: "香型/规格SKU", scene: "浴室日用场景", trust: "个护品质背书", identity: "Subcategory identity focus: preserve exact personal-care bottle, tube, pump, cap, brush head, label-like marks, formula color and package finish.", directionTerms: "personal-care bottle or tube, pump, foam or gel texture, brush head, hygienic bathroom cleanliness"
  }),
  diaper: productProfile({
    product: "纸尿裤", hero: "建立柔软干爽、安全安心和母婴信任氛围", white: "完整展示纸尿裤形态、包装、腰围和吸收层", use: "宝宝使用展示", useDesc: "展示宝宝穿着、手持或换尿裤场景，安全自然", texture: "吸收层材质特写", textureDesc: "特写柔软表层、吸收芯、腰围、魔术贴和边缘", craft: "腰围防漏细节", craftDesc: "展示腰围、腿围、防漏边、粘贴扣和吸收结构", feature: "干爽舒适卖点", featureDesc: "突出柔软、干爽、防漏、透气或夜用场景", size: "尺码阶段说明", sizeDesc: "表达宝宝体重段、腰围、尺码和成长适配", sku: "尺码/片数SKU", scene: "母婴护理场景", trust: "母婴安全背书", identity: "Subcategory identity focus: preserve exact diaper shape, package design, waist structure, absorbent layer, soft material, label-like marks and size cues.", directionTerms: "diaper soft absorbent texture, waist band, leak guard, package trust, clean nursery context"
  }),
  feeding: productProfile({
    product: "喂养用品", hero: "建立安全喂养、干净卫生和亲子使用氛围", white: "完整展示奶瓶、餐具、水杯、吸管或配件", use: "亲子喂养展示", useDesc: "展示手持、倒水、喂养或餐桌使用状态", texture: "硅胶瓶身特写", textureDesc: "特写奶嘴、吸管、瓶身刻度、杯盖和材质", craft: "防漏结构细节", craftDesc: "展示杯盖、密封圈、刻度、手柄、吸管和防漏结构", feature: "安全易清洁卖点", featureDesc: "突出安全材质、防漏、易清洁、防摔或便携", size: "容量阶段说明", sizeDesc: "表达容量、年龄段、手握比例和配件组合", sku: "颜色/容量SKU", scene: "亲子餐桌场景", trust: "喂养安全背书", identity: "Subcategory identity focus: preserve exact feeding product shape, nipple, straw, lid, handle, scale marks, material color and accessory layout.", directionTerms: "baby bottle, cup, straw, nipple, lid, safe material, parent-hand scale, hygienic feeding scene"
  }),
  stroller: productProfile({
    product: "童车童床", hero: "建立安全结构、舒适承托和亲子出行氛围", white: "完整展示推车、安全座椅、童床或床品结构", use: "宝宝乘坐展示", useDesc: "展示宝宝乘坐、推行、安装或卧睡比例", texture: "座椅软垫特写", textureDesc: "特写安全带、软垫、轮子、扶手、支架和面料", craft: "安全带轮组细节", craftDesc: "展示安全带、卡扣、轮组、刹车、折叠和支撑结构", feature: "安全便携卖点", featureDesc: "突出稳固、可折叠、减震、舒适或安全防护", size: "年龄承重说明", sizeDesc: "表达年龄段、承重、尺寸、折叠和空间比例", sku: "颜色/规格SKU", scene: "亲子出行场景", trust: "童车安全背书", identity: "Subcategory identity focus: preserve exact stroller/crib/child-seat frame, wheels, straps, padding, buckle, fabric, color and safety structure.", directionTerms: "stroller or child seat frame, wheels, safety straps, padding, buckle, parent-friendly use"
  }),
  toys_early: productProfile({
    product: "玩具早教", hero: "建立安全玩乐、启蒙互动和明亮亲子氛围", white: "完整展示玩具形态、部件、颜色和套装", use: "儿童玩乐展示", useDesc: "展示儿童玩耍、拼搭、阅读或亲子互动状态", texture: "圆角材质特写", textureDesc: "特写圆角、积木、纸张、按钮、纹理和安全边缘", craft: "拼搭结构细节", craftDesc: "展示拼接、开合、转动、按钮、卡扣或书页结构", feature: "启蒙互动卖点", featureDesc: "突出益智、互动、精细动作、色彩认知或陪伴", size: "年龄阶段说明", sizeDesc: "表达年龄段、手握比例、部件大小和套装数量", sku: "款式/套装SKU", scene: "亲子玩乐场景", trust: "玩具安全背书", identity: "Subcategory identity focus: preserve exact toy shape, rounded edges, component layout, colors, graphics, book pages, buttons and set composition.", directionTerms: "toy rounded form, safe material, bright colors, component layout, child-friendly play scenario"
  }),
  storage_cleaning: productProfile({
    product: "收纳清洁", hero: "建立整洁家务、实用结构和清爽空间氛围", white: "完整展示收纳盒、清洁工具、日用品或组件", use: "家务使用展示", useDesc: "展示收纳、清洁、拿取或家居摆放状态", texture: "材质结构特写", textureDesc: "特写塑料、纤维、刷毛、把手、隔层和边缘", craft: "隔层把手细节", craftDesc: "展示隔层、把手、卡扣、刷头、伸缩杆或折叠结构", feature: "收纳清洁卖点", featureDesc: "突出容量、易清洁、省空间、可折叠或耐用", size: "容量空间说明", sizeDesc: "表达容量、尺寸、安装位置和空间占比", sku: "规格/套装SKU", scene: "整洁家居场景", trust: "日用品质背书", identity: "Subcategory identity focus: preserve exact storage/cleaning product shape, compartments, handle, brush fibers, material, color and functional structure.", directionTerms: "storage compartments, cleaning brush, handle, foldable structure, clean home context"
  }),
  snacks: productProfile({
    product: "休闲零食", hero: "建立食欲、包装信任和分享氛围", white: "完整展示包装、食品形态、规格和组合", use: "开袋食用展示", useDesc: "展示开袋、倒出、手持或餐桌食用状态", texture: "口感食材特写", textureDesc: "特写酥脆、颗粒、果仁、糕点、肉脯或内馅", craft: "包装封口细节", craftDesc: "展示封口、袋体、罐盖、独立包装和礼盒结构", feature: "风味卖点展示", featureDesc: "突出口味、产地、营养、便携或分享场景", size: "规格份量说明", sizeDesc: "表达克重、份量、组合、独立包装和储存方式", sku: "口味/规格SKU", scene: "茶歇分享场景", trust: "食品品质背书", identity: "Subcategory identity focus: preserve exact snack packaging, food shape, flavor color, ingredient texture, portion size, seal, label-like marks and SKU identity.", directionTerms: "snack packaging, appetizing serving, ingredient texture, portion size, clean table scene"
  }),
  fresh: productProfile({
    product: "生鲜果蔬", hero: "建立新鲜水润、产地感和食材品质氛围", white: "完整展示水果、海鲜、肉禽或包装规格", use: "食材处理展示", useDesc: "展示手持、切开、装盘、保鲜或冷链状态", texture: "新鲜水润特写", textureDesc: "特写果肉、纹理、水分、冰鲜、肉质或表皮", craft: "包装保鲜细节", craftDesc: "展示保鲜盒、冰袋、封膜、网套或冷链包装", feature: "新鲜产地卖点", featureDesc: "突出新鲜、产地、口感、营养或冷链可信", size: "规格重量说明", sizeDesc: "表达重量、数量、大小、礼盒或家庭装比例", sku: "规格/口味SKU", scene: "厨房餐桌场景", trust: "生鲜品质背书", identity: "Subcategory identity focus: preserve exact fresh ingredient appearance, natural color, cut surface, package, portion size, freshness cues and SKU identity.", directionTerms: "fresh ingredient texture, natural color, water or ice cues, cut surface, cold-chain trust"
  }),
  grain_oil: productProfile({
    product: "粮油调味", hero: "建立厨房日常、产地品质和包装可信氛围", white: "完整展示米面油调味包装、瓶罐和规格", use: "厨房使用展示", useDesc: "展示倒油、取米、烹饪或厨房摆放状态", texture: "食材包装特写", textureDesc: "特写米粒、面粉、油色、瓶身、罐盖和标签", craft: "瓶盖封口细节", craftDesc: "展示瓶盖、封口、袋体、把手、罐身和防漏结构", feature: "日常品质卖点", featureDesc: "突出产地、口感、营养、家庭装或烹饪便利", size: "容量规格说明", sizeDesc: "表达升数、克重、家庭装、组合和储存方式", sku: "口味/规格SKU", scene: "厨房烹饪场景", trust: "粮油品质背书", identity: "Subcategory identity focus: preserve exact grain/oil/seasoning package, bottle, cap, label-like marks, ingredient appearance, color and SKU identity.", directionTerms: "grain oil seasoning packaging, bottle cap, ingredient origin cue, kitchen scene, label readability"
  }),
  tea_drink: productProfile({
    product: "茶饮冲调", hero: "建立饮品风味、杯饮氛围和清新质感", white: "完整展示茶饮包装、瓶罐、杯具或冲调套装", use: "冲泡饮用展示", useDesc: "展示倒出、冲泡、手持杯饮或茶歇状态", texture: "液体茶汤特写", textureDesc: "特写茶汤、咖啡、粉末、气泡、杯壁和包装材质", craft: "瓶盖袋口细节", craftDesc: "展示瓶盖、袋口、罐盖、茶包、勺具和包装结构", feature: "风味口感卖点", featureDesc: "突出香气、清爽、浓郁、便携或即冲即饮", size: "容量份量说明", sizeDesc: "表达毫升、包数、杯量、组合和储存方式", sku: "口味/规格SKU", scene: "茶歇饮用场景", trust: "茶饮品质背书", identity: "Subcategory identity focus: preserve exact beverage package, bottle, can, sachet, cup, liquid color, powder texture, label-like marks and SKU identity.", directionTerms: "beverage cup, liquid color, powder or tea texture, bottle or sachet packaging, aroma mood"
  }),
  sportswear: productProfile({
    product: "运动服饰", hero: "建立运动表现、弹力面料和活力场景", white: "完整展示运动服饰版型、面料拼接和细节", use: "运动穿着展示", useDesc: "展示跑步、瑜伽、健身或训练穿着比例", texture: "弹力面料特写", textureDesc: "特写弹力、透气、缝线、网眼、压胶或反光条", craft: "运动结构细节", craftDesc: "展示缝线、拉链、腰头、口袋、透气区和防滑结构", feature: "运动性能卖点", featureDesc: "突出透气、速干、弹力、支撑或轻量", size: "穿着尺码说明", sizeDesc: "表达松紧、长度、支撑范围和运动余量", sku: "颜色/尺码SKU", scene: "健身运动场景", trust: "运动服饰品质背书", identity: "Subcategory identity focus: preserve exact sportswear silhouette, fabric panels, seams, zipper, waistband, logo-like marks, color and fit structure.", directionTerms: "sportswear stretch fabric, seams, breathable panels, active pose, performance material"
  }),
  fitness: productProfile({
    product: "健身器材", hero: "建立训练功能、握持结构和家庭健身氛围", white: "完整展示器材形态、握把、承重点和配件", use: "训练使用展示", useDesc: "展示手持、踩踏、支撑、拉伸或家庭训练状态", texture: "防滑握把特写", textureDesc: "特写防滑纹理、金属、泡棉、刻度、绑带和连接件", craft: "承重结构细节", craftDesc: "展示握把、轴承、卡扣、绑带、焊点或支撑结构", feature: "训练功能卖点", featureDesc: "突出承重、防滑、便携、调节或多功能", size: "训练规格说明", sizeDesc: "表达重量、尺寸、阻力、调节范围和收纳比例", sku: "重量/规格SKU", scene: "家庭健身场景", trust: "健身器材品质背书", identity: "Subcategory identity focus: preserve exact fitness equipment shape, handles, straps, weight markings, joints, material texture, color and functional structure.", directionTerms: "fitness equipment grip, weight, straps, support structure, home-gym context"
  }),
  outdoor: productProfile({
    product: "户外装备", hero: "建立户外性能、耐用结构和山野场景", white: "完整展示装备结构、绑带、扣具和收纳形态", use: "户外使用展示", useDesc: "展示露营、徒步、登山或携带使用状态", texture: "耐磨防水特写", textureDesc: "特写防水面料、扣具、绑带、拉链、支架和耐磨纹理", craft: "扣具绑带细节", craftDesc: "展示扣具、绑带、支架、拉链、折叠和承重结构", feature: "户外性能卖点", featureDesc: "突出防水、便携、承重、耐磨或快速搭建", size: "收纳规格说明", sizeDesc: "表达展开尺寸、收纳体积、重量和适用人数", sku: "颜色/规格SKU", scene: "露营山野场景", trust: "户外装备品质背书", identity: "Subcategory identity focus: preserve exact outdoor gear shape, straps, buckles, fabric panels, frame, zipper, color and rugged functional structure.", directionTerms: "outdoor gear straps, buckles, waterproof fabric, frame, rugged camping or hiking context"
  }),
  cycling_fishing: productProfile({
    product: "骑行垂钓", hero: "建立户外专业、装备结构和运动场景", white: "完整展示骑行、垂钓或户外配件结构", use: "户外操作展示", useDesc: "展示骑行安装、手持鱼竿、配件使用或户外操作状态", texture: "装备结构特写", textureDesc: "特写碳纤维、金属件、绑带、接口、握把和防滑纹理", craft: "接口调节细节", craftDesc: "展示卡扣、旋钮、接口、线轮、支架、绑带和固定结构", feature: "专业性能卖点", featureDesc: "突出轻量、耐用、防滑、调节、便携或精准控制", size: "装备规格说明", sizeDesc: "表达长度、重量、接口、调节范围和适配场景", sku: "型号/规格SKU", scene: "骑行垂钓场景", trust: "户外配件品质背书", identity: "Subcategory identity focus: preserve exact cycling/fishing gear shape, handle, reel, mount, straps, connector, carbon or metal texture, color and functional structure.", directionTerms: "cycling or fishing technical components, handle, reel, mount, straps, outdoor use, durable finish"
  }),
  car_interior: productProfile({
    product: "车内用品", hero: "建立车内整洁、安装适配和实用氛围", white: "完整展示脚垫、坐垫、收纳或车内配件结构", use: "车内安装展示", useDesc: "展示座椅、后备箱、中控或脚垫安装比例", texture: "耐磨材质特写", textureDesc: "特写皮革、橡胶、纤维、防滑纹理、缝线和边缘", craft: "安装固定细节", craftDesc: "展示卡扣、绑带、防滑底、缝线、边缘和固定点", feature: "车内实用卖点", featureDesc: "突出防滑、收纳、耐磨、易清洁或适配车型", size: "车型适配说明", sizeDesc: "表达尺寸、安装位置、车型空间和适配比例", sku: "颜色/车型SKU", scene: "车内使用场景", trust: "车品品质背书", identity: "Subcategory identity focus: preserve exact car-interior product shape, mounting points, straps, stitching, texture, color, vehicle fit and functional parts.", directionTerms: "car interior fit, mounting points, straps, stitching, durable material, vehicle cabin scale"
  }),
  car_care: productProfile({
    product: "美容养护", hero: "建立清洁养护、车漆质感和专业可信氛围", white: "完整展示养护瓶罐、工具、喷头或套装", use: "车辆养护展示", useDesc: "展示喷涂、擦拭、清洁、打蜡或工具使用状态", texture: "泡沫液体特写", textureDesc: "特写泡沫、液体、喷头、毛巾、刷头和瓶身材质", craft: "喷头瓶身细节", craftDesc: "展示喷头、瓶盖、刷头、海绵、标签和包装结构", feature: "清洁养护卖点", featureDesc: "突出去污、上光、防护、除味或便捷使用", size: "容量套装说明", sizeDesc: "表达容量、套装数量、使用面积和工具组合", sku: "容量/套装SKU", scene: "车库洗车场景", trust: "养护品质背书", identity: "Subcategory identity focus: preserve exact car-care bottle, sprayer, cap, brush, towel, liquid color, package and label-like marks.", directionTerms: "car-care bottle, sprayer, foam or liquid texture, brush or towel, garage or vehicle surface scene"
  }),
  car_electronics: productProfile({
    product: "车载电器", hero: "建立车载科技、安装稳定和驾驶场景",
    white: "完整展示屏幕、支架、线材、接口和主机", use: "车内安装使用", useDesc: "展示中控、挡风玻璃、点烟器或仪表台安装状态", texture: "屏幕接口特写", textureDesc: "特写屏幕、镜头、接口、线材、按键和支架材质", craft: "支架线材细节", craftDesc: "展示支架、吸盘、接口、线材、按键和固定结构", feature: "车载功能卖点", featureDesc: "突出导航、记录、充电、智能互联或安全辅助", size: "安装适配说明", sizeDesc: "表达安装位置、屏幕尺寸、线长和车型空间比例", sku: "配置/接口SKU", scene: "驾驶舱场景", trust: "车载电器品质背书", identity: "Subcategory identity focus: preserve exact automotive electronic device, screen, camera, cable, mount, connector, buttons, color and dashboard placement.", directionTerms: "car electronic screen, cable, mount, connector, dashboard context, technical detail"
  }),
  auto_parts: productProfile({
    product: "汽车配件", hero: "建立结构适配、耐用品质和专业安装氛围", white: "完整展示轮胎、雨刷、外饰或配件结构", use: "安装适配展示", useDesc: "展示车辆安装点、局部装配或使用比例", texture: "橡胶金属特写", textureDesc: "特写橡胶纹路、金属件、接口、卡扣和耐磨材质", craft: "接口安装细节", craftDesc: "展示卡扣、接口、螺丝、雨刷骨架、轮胎纹路或固定点", feature: "适配耐用卖点", featureDesc: "突出耐磨、防滑、适配、安装便捷或安全防护", size: "车型规格说明", sizeDesc: "表达尺寸、接口、车型适配和安装位置", sku: "型号/规格SKU", scene: "车辆安装场景", trust: "配件品质背书", identity: "Subcategory identity focus: preserve exact auto part shape, connector, tread or blade structure, mounting point, material finish, color and compatibility details.", directionTerms: "auto part connector, rubber tread, metal fitting, mounting point, vehicle compatibility"
  }),
  general_ecommerce: productProfile({
    product: "通用商品",
    hero: "建立商品第一眼识别、质感、用途和购买理由",
    white: "完整展示商品外观、颜色、材质、包装和关键结构",
    use: "通用使用展示",
    useDesc: "展示手持、摆放、安装、收纳、佩戴或日常使用比例",
    texture: "材质质感细节",
    textureDesc: "特写商品表面、纹理、材质、包装、接口、边缘或工艺质感",
    craft: "结构工艺细节",
    craftDesc: "展示开合、接口、缝线、边缘、扣件、喷头、屏幕、手柄或连接结构",
    feature: "核心卖点展示",
    featureDesc: "突出便携、容量、耐用、易清洁、舒适、美观、收纳或使用效率",
    size: "尺寸比例说明",
    sizeDesc: "表达商品体积、容量、手持比例、摆放空间或使用尺度",
    sku: "颜色/规格/SKU",
    scene: "通用使用场景",
    trust: "品质信任背书",
    identity: "Subcategory identity focus: this is a generic ecommerce product category. Preserve the exact product shape, color, material, packaging, visible marks, functional parts, scale, texture, and any product-specific structure from the source image. Do not assume it is apparel, home goods, electronics, food, beauty, jewelry, auto, or any other specific category unless the source image clearly proves it.",
    directionTerms: "clear product identity, accurate material, scale, function, packaging, key structure, practical ecommerce use context"
  })
});

export interface PlatformSpecPreset {
  id: string;
  platform: CommercePlatform;
  assetGroup: AssetGroup;
  label: string;
  targetWidth: number;
  targetHeight: number;
  providerSize: AllowedImageSize;
  imageTypes: PlatformImageTypePreset[];
  sourceNote: string;
}

const mainImageTypes: PlatformImageTypePreset[] = [
  { id: "white_main", label: "白底主图", description: "干净白底，适合首图或SKU", scene: "white", sceneVariant: "pure_white" },
  { id: "scene_main", label: "场景主图", description: "真人或商品场景，突出转化", scene: "street", sceneVariant: "urban_highstreet" },
  { id: "studio_main", label: "棚拍主图", description: "稳定棚拍光，主体完整", scene: "studio", sceneVariant: "modern_studio" },
  { id: "mobile_long_main", label: "手机长图", description: "2:3/3:4竖版主图，适合移动端首屏", scene: "catalog", sceneVariant: "magazine_cover" },
  { id: "full_body_main", label: "完整持包图", description: "完整包款或持包/背包比例，展示包型和搭配", scene: "studio", sceneVariant: "modern_studio" },
  { id: "side_back_main", label: "侧背补充图", description: "补充侧面、背面或结构角度，不改变商品", scene: "studio", sceneVariant: "minimal_solid" }
];

const detailPageImageTypes: PlatformImageTypePreset[] = [
  { id: "detail_header_poster", label: "页头海报", description: "详情页首屏氛围海报，建立风格和卖点", scene: "catalog", sceneVariant: "magazine_cover" },
  { id: "detail_white_product", label: "白底商品展示", description: "白底完整展示商品，适合详情页基础展示", scene: "white", sceneVariant: "pure_white" },
  { id: "detail_model_fit", label: "持包/背包展示", description: "真人展示包型比例、肩带长度、携带姿态和整体搭配效果", scene: "studio", sceneVariant: "modern_studio" },
  { id: "detail_texture", label: "包身纹理细节", description: "贴近拍摄包身肌理、材质、纹路、走线和质感", scene: "studio", sceneVariant: "window_light" },
  { id: "detail_merchant_info_graphic", label: "资料图美化", description: "上传尺码表、SKU、参数图，重排成工整详情图", scene: "catalog", sceneVariant: "minimal_art" }
];

const detailImageTypes: PlatformImageTypePreset[] = [
  detailPageImageTypes[3],
  { id: "detail_fit", label: "包型结构", description: "展示包身轮廓、侧边厚度、提手、肩带、开口和整体比例", scene: "catalog", sceneVariant: "minimal_art" }
];

const activityImageTypes: PlatformImageTypePreset[] = [
  { id: "live_cover", label: "直播封面", description: "竖向或横向活动入口图", scene: "catalog", sceneVariant: "magazine_cover" },
  { id: "feed_card", label: "信息流", description: "更强首屏冲击力", scene: "street", sceneVariant: "urban_highstreet" }
];

function productProfile(input: {
  product: string;
  hero: string;
  white: string;
  use: string;
  useDesc: string;
  texture: string;
  textureDesc: string;
  craft: string;
  craftDesc: string;
  feature: string;
  featureDesc: string;
  size: string;
  sizeDesc: string;
  sku: string;
  scene: string;
  trust: string;
  identity: string;
  directionTerms: string;
}): ProductDetailProfile {
  return {
    identityFocus: input.identity,
    imageTypes: {
      white_main: {
        label: `白底${input.product}主图`,
        description: input.white,
        direction: `Create a strict marketplace white-background main image for ${input.product}: full product visible, centered, clean edges, no props, no text, accurate color, and preserve ${input.directionTerms}.`
      },
      scene_main: {
        label: `${input.product}场景主图`,
        description: `展示${input.product}真实使用、陈列、佩戴或摆放场景`,
        direction: `Create a conversion-focused scene main image for ${input.product}: product is the hero, realistic use context, clean background hierarchy, and preserve ${input.directionTerms}.`
      },
      studio_main: {
        label: `${input.product}棚拍主图`,
        description: `稳定棚拍光，突出${input.product}外观、材质和结构`,
        direction: `Create a clean studio main image for ${input.product}: stable commercial lighting, complete product shape visible, sharp material details, and preserve ${input.directionTerms}.`
      },
      mobile_long_main: {
        label: `${input.product}竖版首图`,
        description: `移动端竖版构图，突出${input.product}第一眼识别和质感`,
        direction: `Create a mobile-first vertical main image for ${input.product}: strong first-screen readability, complete product or scale visible, no text overlays, and preserve ${input.directionTerms}.`
      },
      full_body_main: {
        label: `完整${input.product}图`,
        description: `完整展示${input.product}比例、结构、材质和主要功能部位`,
        direction: `Create a complete product main image for ${input.product}: show full shape, scale, material, key functional parts, and preserve ${input.directionTerms}.`
      },
      side_back_main: {
        label: `${input.product}角度补充`,
        description: `补充侧面、背面、内部、底部、接口或结构角度`,
        direction: `Create a supplementary angle image for ${input.product}: show side, back, bottom, interior, connector, opening or construction angle while preserving exact product identity and ${input.directionTerms}.`
      },
      detail_header_poster: {
        label: `${input.product}页头海报`,
        description: input.hero,
        direction: `Create a detail-page hero poster for ${input.product}: emphasize ${input.directionTerms}; keep the exact product visible and suitable for Tmall detail-page first screen.`
      },
      detail_white_product: {
        label: `白底${input.product}展示`,
        description: input.white,
        direction: `Create a strict white-background ${input.product} detail image: show the complete item clearly with ${input.directionTerms}; crisp edges, accurate color, no props or text.`
      },
      detail_model_fit: {
        label: input.use,
        description: input.useDesc,
        direction: `Create a category-accurate in-use image for ${input.product}: show realistic scale and usage with ${input.directionTerms}; preserve exact product identity.`
      },
      detail_texture: {
        label: input.texture,
        description: input.textureDesc,
        direction: `Create a macro material/detail close-up for ${input.product}: focus on ${input.directionTerms}; this must be a precise detail close-up, not a generic full product image.`
      },
      detail_craft: {
        label: input.craft,
        description: input.craftDesc,
        direction: `Create a craftsmanship/structure close-up for ${input.product}: clearly show construction details related to ${input.directionTerms}; no text labels.`
      },
      detail_design_points: {
        label: input.feature,
        description: input.featureDesc,
        direction: `Create a visual selling-point image for ${input.product}: express one or two key benefits through composition and product detail, using ${input.directionTerms}; do not add explanatory text.`
      },
      detail_size_fit: {
        label: input.size,
        description: input.sizeDesc,
        direction: `Create a size/specification explanation image for ${input.product} without text: communicate scale, fit, dimensions, or compatibility visually with ${input.directionTerms}.`
      },
      detail_color_sku: {
        label: input.sku,
        description: `展示${input.product}不同颜色、材质、规格或组合的一致性`,
        direction: `Create a SKU detail image for ${input.product}: show color/material/spec consistency and clean product arrangement; no labels or promotional text.`
      },
      detail_scene_lifestyle: {
        label: input.scene,
        description: `展示${input.product}真实使用、佩戴或摆放场景`,
        direction: `Create a lifestyle detail image for ${input.product}: show the most relevant usage scenario while the product remains dominant, sharp, and inspectable.`
      },
      detail_footer_trust: {
        label: input.trust,
        description: `以干净可信的质感画面强化${input.product}品质`,
        direction: `Create a premium closing image for ${input.product}: clean brand-like quality mood, trustworthy materials, refined composition, no clutter and no text unless explicitly enabled.`
      }
    }
  };
}

function productCategoryProfile(productCategoryId?: string): ProductDetailProfile | undefined {
  return productCategoryId ? productDetailProfiles[productCategoryId] : undefined;
}

export function hasProductDetailProfile(productCategoryId: string): boolean {
  return Boolean(productDetailProfiles[productCategoryId]);
}

export function imageTypeForCategory(imageType: PlatformImageTypePreset, category: ApparelCategory, productCategoryId?: string): PlatformImageTypePreset {
  const categoryOverride = categoryImageTypeOverrides[category][imageType.id];
  const productOverride = productCategoryProfile(productCategoryId)?.imageTypes[imageType.id];
  return { ...imageType, ...categoryOverride, ...productOverride };
}

export function imageTypesForCategory(imageTypes: PlatformImageTypePreset[], category: ApparelCategory, productCategoryId?: string): PlatformImageTypePreset[] {
  return imageTypes.map((item) => imageTypeForCategory(item, category, productCategoryId));
}

export function categoryImageTypeDirection(category: ApparelCategory, imageTypeId: string, productCategoryId?: string): string | undefined {
  const direction = productCategoryProfile(productCategoryId)?.imageTypes[imageTypeId]?.direction ?? categoryImageTypeDirections[category]?.[imageTypeId] ?? categoryImageTypeDirections.default[imageTypeId];
  return direction;
}

export function categoryProductIdentityFocus(category: ApparelCategory, productCategoryId?: string): string {
  return productCategoryProfile(productCategoryId)?.identityFocus ?? productIdentityFocusByCategory[category];
}

const productIdentityFocusByCategory: Record<ApparelCategory, string> = {
  women: "Category identity focus: preserve the exact women's bag product, including bag silhouette, handle shape, shoulder strap, zipper path, hardware, pocket layout, material texture, stitching, trims, colorway, logo-like marks, and carry proportion.",
  men: "Category identity focus: preserve the exact men's bag product, including bag silhouette, side depth, handle/strap structure, leather/nylon/canvas texture, zippers, buckles, pockets, stitching, hardware, colorway, and commute proportion.",
  kids: "Category identity focus: preserve the exact kids' bag product, including child-safe proportions, secure closures, straps, pockets, flexible/soft structure, material, color blocking, playful details, logo-like marks, and stitching.",
  shoes: "Category identity focus: preserve the exact bag product, bag silhouette, panels, handles, straps, zipper path, hardware, pockets, logos or marks, color blocking, stitching, and material texture.",
  bags: "Category identity focus: preserve the exact bag silhouette, handles, strap length and attachment points, hardware, zipper, buckle, pocket layout, compartment structure, logo-like marks, leather/canvas/nylon texture, stitching, edge paint, and color.",
  beauty: "Category identity focus: preserve the exact cosmetic packaging, bottle/jar/tube/compact shape, cap, pump, applicator, label-like marks, colorway, package material, product texture color, and SKU appearance.",
  baby: "Category identity focus: preserve the exact baby product shape, soft material, safety edges, fasteners, pattern, prints, labels, color, size proportion, and functional structure.",
  home: "Category identity focus: preserve the exact home product structure, material texture, weave or wood grain, hardware, dimensions, edges, surface finish, color, pattern, and assembly details.",
  digital: "Category identity focus: preserve the exact device shape, screen ratio, bezels, buttons, ports, camera/sensor layout, accessory geometry, color, finish, label-like marks, and interface placement.",
  food: "Category identity focus: preserve the exact food product and packaging, pack shape, label-like marks, flavor color, ingredient appearance, portion size, texture, seal, cap, and SKU identity.",
  sports: "Category identity focus: preserve the exact sports product, straps, buckles, grip details, fabric panels, protection structure, logo-like marks, color, stitching, and performance material texture.",
  jewelry: "Category identity focus: preserve the exact jewelry silhouette, stone placement, metal color, setting, chain links, clasp, engraving-like marks, pearl/gem shape, polish, and scale.",
  auto: "Category identity focus: preserve the exact automotive accessory shape, mounting points, connector, buttons, stitching, texture, material finish, color, logo-like marks, and functional parts."
};

const categoryImageTypeDirections: Record<ApparelCategory | "default", Record<string, string>> = {
  default: {
    white_main:
      "Create a strict marketplace white-background main image: full product visible, centered, clean edges, no props, no text, and accurate product color.",
    scene_main:
      "Create a conversion-focused scene main image: product is the hero, composition is simple, model or setting supports the product without distracting from it.",
    studio_main:
      "Create a clean studio main image: stable commercial lighting, full product silhouette visible, ecommerce-ready composition, material and structure easy to inspect.",
    mobile_long_main:
      "Create a mobile long main image: vertical mobile-first composition, full product visible, strong ecommerce first-screen readability, no text or graphic overlays.",
    full_body_main:
      "Create a complete product main image: show the whole product clearly with full styling coverage and no awkward crop.",
    side_back_main:
      "Create a supplementary side/back main image: show a side angle, back angle, or construction angle of the same product, preserving all design details accurately.",
    detail_header_poster:
      "Create a Tmall-style detail-page first-screen advertising poster image: rich brand-campaign mood, elevated scene design, layered but clean background, vivid but tasteful color accents, complete product visibility, and tasteful ecommerce poster typography generated directly inside the image.",
    detail_white_product:
      "Create a white-background product detail image: show the complete product clearly on pure white, with crisp edges and accurate color for detail-page inspection.",
    detail_model_fit:
      "Create an in-use product detail image: show the product being worn, carried, held, placed, or used in the most category-appropriate way, with realistic scale and no identity change.",
    detail_texture:
      "Create a close-up material detail image: zoom in on the real surface texture, thickness, finish, color accuracy, and tactile quality. This should be a detail close-up, not a full product image.",
    detail_merchant_info_graphic:
      "Merchant information graphic rewrite task: use the uploaded merchant reference image as the only source of truth for bag dimensions, capacity, shoulder strap length, weight, laptop fit, luggage size, SKU, color, and parameter data. Preserve every readable number, unit, size label, color/SKU name, product parameter, and table relationship exactly. Do not invent missing values or alter merchant data. Re-layout it into a clean, polished bag ecommerce detail-page information image with neat tables, balanced spacing, readable typography, and premium Tmall-style visual order.",
    detail_craft:
      "Create a craftsmanship close-up: focus on construction, joining, stitching, hardware, edges, openings, fasteners, or structural details. The image must clearly show how the product is made.",
    detail_design_points:
      "Create a design-point detail image: highlight one or two category-specific selling points visually without adding text labels.",
    detail_size_fit:
      "Create a size/fit/specification explanation image without text: use product scale, placement, model/body relation, or clean composition to communicate proportions visually.",
    detail_color_sku:
      "Create a color/SKU detail image: keep color accuracy and clean product presentation, suitable for showing SKU consistency without text or color labels.",
    detail_scene_lifestyle:
      "Create a lifestyle detail image: show the product in a realistic usage scene, still keeping it visually dominant and inspectable.",
    detail_footer_trust:
      "Create a premium closing detail image: clean brand-like quality mood, material trust, refined composition, no text unless poster text is explicitly enabled.",
    live_cover:
      "Create a live-commerce cover image: strong visual entry point, clear product, no text or badges, suitable for a livestream card.",
    feed_card:
      "Create an information-feed image: high first-frame impact, clean scene, product instantly readable, no text overlays."
  },
  women: {
    detail_model_fit:
      "Create a women's bag carrying detail image: show the exact bag naturally hand-carried, shoulder-carried or crossbody-worn with clean styling, correct body scale, handle/strap length, bag silhouette, zipper/hardware and side profile clearly visible.",
    detail_texture:
      "Create a women's bag material close-up: zoom in on real leather, suede, canvas, nylon or woven texture, stitching, edge paint, panel seams, perforation, color blocking, and color accuracy. This should be a bag detail close-up, not a full outfit image.",
    detail_craft:
      "Create a women's bag craftsmanship close-up: focus on zipper, puller, clasp, buckle, handle base, strap attachment, stitching, trim, edge finish, lining, pocket structure or hardware. The image must clearly show bag construction details.",
    detail_design_points:
      "Create a women's bag design-point detail image: highlight bag silhouette, handle shape, strap/buckle system, zipper path, side pocket, compartment layout, capacity structure, or distinctive bag design without adding text."
  },
  men: {
    detail_model_fit:
      "Create a men's bag carrying detail image: show the exact bag naturally carried with correct scale, side profile, handle/strap placement, zipper path, hardware, pockets, and business/casual styling context clearly readable.",
    detail_texture:
      "Create a men's bag material close-up: zoom in on real leather grain, nylon, canvas, suede, stitching, panel seams, perforation, polish, and color accuracy. This should be a bag detail close-up, not a full outfit image.",
    detail_craft:
      "Create a men's bag craftsmanship close-up: focus on zipper teeth, puller, buckle, lock, handle base, strap attachment, stitching, trims, lining, pocket structure, or hardware. The image must clearly show bag construction details.",
    detail_design_points:
      "Create a men's bag design-point detail image: highlight side profile, leather finish, zipper structure, compartment layout, shoulder comfort, laptop capacity, or distinctive bag structure without adding text."
  },
  kids: {
    detail_model_fit:
      "Create a kids' bag carrying detail image: the child model must be natural, age-appropriate, and safe; show bag scale, secure closure, shoulder strap, pocket access, comfort room, and unchanged color or playful details.",
    detail_size_fit:
      "Create a kids' bag size explanation image without text: communicate bag dimensions, capacity, shoulder strap length, secure closure, pocket access, and activity allowance visually."
  },
  shoes: {
    full_body_main:
      "Create a complete bag main image: show the full bag or a clean single-bag hero with silhouette, handles, straps, zipper, hardware, pockets and bottom all readable.",
    side_back_main:
      "Create a supplementary bag angle: show side profile, back panel, bottom, strap connection, opening, or interior construction while preserving the exact bag identity.",
    detail_header_poster:
      "Create a bag detail-page hero poster: emphasize bag silhouette, capacity mood, material confidence, and usage scenario while keeping the exact bag design visible.",
    detail_model_fit:
      "Create a carrying detail image: show the exact bag naturally hand-carried, shoulder-carried, crossbody-worn, backpacked or luggage-pulled with correct scale and unchanged handles/straps.",
    detail_texture:
      "Create a bag material close-up: focus on leather, canvas, nylon, suede, woven texture, stitching, panel seams, perforation, or color blocking; do not turn it into a generic textile surface unrelated to the bag.",
    detail_craft:
      "Create a bag construction close-up: focus on zipper, buckle, lock, handle base, strap attachment, metal feet, trolley wheel, stitching, lining, or edge finish with realistic manufacturing detail.",
    detail_design_points:
      "Create a bag feature image: visually emphasize capacity, compartments, lightweight structure, waterproof material, anti-theft pocket, travel wheels, or durable bag body without text labels.",
    detail_size_fit:
      "Create a bag size/spec image without text: communicate dimensions, capacity, strap length, laptop fit, luggage size, or carrying compatibility visually.",
    detail_scene_lifestyle:
      "Create a bag lifestyle image: show the bag in commute, travel, street, office, home, or outdoor use while keeping the bag as the sharp visual subject."
  },
  bags: {
    full_body_main:
      "Create a complete bag main image: show bag silhouette, handles, straps, opening, hardware, pockets, and bottom structure clearly.",
    side_back_main:
      "Create a supplementary bag angle: show side, back, bottom, shoulder-strap attachment, or opening structure while preserving exact hardware and pocket layout.",
    detail_header_poster:
      "Create a bag detail-page hero poster: emphasize premium carrying mood, capacity, silhouette, hardware, and commute/travel use while keeping the exact bag design visible.",
    detail_model_fit:
      "Create a bag carry-fit detail image: show hand carry, shoulder carry, crossbody, backpack, or clutch scale on a model with exact strap, handle, and bag proportions.",
    detail_texture:
      "Create a bag body material close-up: focus on leather grain, canvas weave, nylon sheen, quilting, embossing, edge paint, or stitching.",
    detail_craft:
      "Create a bag hardware/craft close-up: focus on zipper, clasp, buckle, rivets, strap rings, stitching, handle connection, edge paint, or opening mechanism.",
    detail_design_points:
      "Create a bag capacity/organization image: visually show compartments, pockets, inner lining, opening width, or everyday carry capacity without text labels.",
    detail_size_fit:
      "Create a bag scale/strap image without text: communicate handle height, strap length, body size, carry proportion, and shoulder/hand fit visually.",
    detail_scene_lifestyle:
      "Create a bag lifestyle image: show commuting, travel, office, shopping, or city use while the bag remains the hero."
  },
  beauty: {
    detail_header_poster:
      "Create a cosmetic detail-page hero poster: emphasize formula mood, clean packaging, refined bathroom/vanity atmosphere, ingredient freshness, and premium beauty typography when enabled.",
    detail_model_fit:
      "Create a beauty use detail image: show hand holding, dispensing, swatching, applying to lips/cheek/skin, or vanity usage while preserving exact packaging.",
    detail_texture:
      "Create a cosmetic formula texture close-up: show cream, serum, foam, powder, lipstick, gloss, swatch, or applicator texture with accurate color and finish.",
    detail_craft:
      "Create a beauty packaging close-up: focus on cap, pump, applicator, compact hinge, embossing, label-like marks, bottle material, or box finish.",
    detail_design_points:
      "Create a cosmetic benefit mood image: visually express hydration, repair, clean feel, color payoff, glow, or texture finish without rendering explanatory labels.",
    detail_size_fit:
      "Create a beauty usage-step image without text: show open, dispense, apply, store, or travel-friendly use sequence with clean composition.",
    detail_scene_lifestyle:
      "Create a beauty lifestyle image: place the exact product in a vanity, bathroom, travel pouch, or self-care scene with refined light."
  },
  baby: {},
  home: {},
  digital: {},
  food: {},
  sports: {},
  jewelry: {},
  auto: {}
};

export const platformSpecPresets: PlatformSpecPreset[] = [
  spec("vipshop-main-portrait", "vipshop", "main", "主图/场景 1340x1785", 1340, 1785, "1024x1536", mainImageTypes, "沿用项目现有唯品会 MVP 输出规格；官方资料明确主图数量与浅色背景要求。"),
  spec("vipshop-white-square", "vipshop", "main", "白底/SKU 1200x1200", 1200, 1200, "1024x1024", [mainImageTypes[0], detailImageTypes[0]], "沿用项目现有唯品会白底与SKU规则。"),
  spec("vipshop-detail-portrait", "vipshop", "detail", "宝贝详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),

  spec("taobao-main-square", "taobao", "main", "主图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "天猫/淘宝主图按1:1高清方图输出，兼容搜索、商品卡与后台裁切；比旧800方图保留更多缩放余量。"),
  spec("taobao-long-main", "taobao", "main", "手机长图 800x1200", 800, 1200, "1024x1536", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[3], mainImageTypes[4]], "淘宝/天猫移动端长图仍按2:3安全构图，适合箱包持包图、场景图和详情入口图。"),
  spec("taobao-detail-mobile", "taobao", "detail", "宝贝详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),

  spec("jd-main-square", "jd", "main", "主图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "京东主图按高清1:1方图输出，兼容缩放、搜索和商品页展示。"),
  spec("jd-hd-square", "jd", "main", "高清主图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "京东推荐高清图资料汇总。"),
  spec("jd-detail-mobile", "jd", "detail", "宝贝详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),
  spec("jd-activity", "jd", "activity", "活动图 790x400", 790, 400, "1024x1024", activityImageTypes, "京东活动图750x300/790x400资料汇总。"),

  spec("douyin-main-square", "douyin", "main", "商品主图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "抖音电商商品卡按高清1:1方图输出，移动端缩略图更安全。"),
  spec("douyin-apparel-portrait", "douyin", "main", "箱包竖图 750x1000", 750, 1000, "1024x1536", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[3], mainImageTypes[4]], "箱包、包款搭配和持包场景3:4竖图建议。"),
  spec("douyin-video-cover", "douyin", "activity", "短视频封面 1080x1920", 1080, 1920, "2160x3840", activityImageTypes, "Canva抖音尺寸说明。"),
  spec("douyin-detail", "douyin", "detail", "宝贝详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),

  spec("dewu-main-square", "dewu", "main", "质感主图 1:1", 1200, 1200, "1024x1024", mainImageTypes, "待商家后台校准。"),
  spec("dewu-transparent-sku", "dewu", "main", "SKU/透明图 1:1", 1200, 1200, "1024x1024", [mainImageTypes[0], detailImageTypes[0]], "待商家后台校准。"),
  spec("dewu-detail", "dewu", "detail", "宝贝详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接；得物仍待商家后台校准。"),
  spec("dewu-scene", "dewu", "main", "场景图 3:4", 900, 1200, "1024x1536", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[3], mainImageTypes[4]], "待商家后台校准。"),

  spec("pinduoduo-main-square", "pinduoduo", "main", "主图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "拼多多主图按高清1:1方图输出，兼容商品列表、轮播与后台压缩。"),
  spec("pinduoduo-long", "pinduoduo", "main", "商品长图 400x600", 400, 600, "1024x1536", [mainImageTypes[1], mainImageTypes[3], mainImageTypes[4]], "拼多多公开资料常见长图为400x600。"),
  spec("pinduoduo-carousel", "pinduoduo", "main", "轮播图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "拼多多轮播图按高清1:1方图输出，便于多图统一。"),
  spec("pinduoduo-detail", "pinduoduo", "detail", "宝贝详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),

  spec("xiaohongshu-cover-portrait", "xiaohongshu", "main", "笔记封面 3:4", 1080, 1440, "1024x1536", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[3], mainImageTypes[4]], "小红书移动端笔记封面常用3:4安全构图，按内容电商封面需求设置。"),
  spec("xiaohongshu-square", "xiaohongshu", "main", "商品卡方图 1080x1080", 1080, 1080, "1024x1024", mainImageTypes, "小红书商品卡与笔记内商品图通用方图。"),
  spec("xiaohongshu-detail", "xiaohongshu", "detail", "种草详情 1080x1440", 1080, 1440, "1024x1536", detailPageImageTypes, "小红书种草内容更偏单图叙事，按3:4详情图生成。"),

  spec("kuaishou-main-square", "kuaishou", "main", "商品主图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "快手小店商品图按高清方图安全规格，适配移动端商品卡。"),
  spec("kuaishou-live-cover", "kuaishou", "activity", "直播/短视频封面 1080x1920", 1080, 1920, "2160x3840", activityImageTypes, "快手直播与短视频封面按9:16移动端规格。"),
  spec("kuaishou-detail", "kuaishou", "detail", "商品详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),

  spec("wechat-channels-main-square", "wechat_channels", "main", "商品图 1200x1200", 1200, 1200, "1024x1024", mainImageTypes, "视频号小店商品图按高清1:1方图输出，兼容橱窗与直播商品卡。"),
  spec("wechat-channels-cover", "wechat_channels", "activity", "视频号封面 1080x1920", 1080, 1920, "2160x3840", activityImageTypes, "视频号短视频/直播封面按9:16规格。"),
  spec("wechat-channels-detail", "wechat_channels", "detail", "商品详情 790宽", 790, 1200, "1024x1536", detailPageImageTypes, "详情图统一按790宽，生成后用于不限高详情页拼接。"),

  spec("amazon-main-square", "amazon", "main", "主图 2000x2000", 2000, 2000, "1024x1024", [mainImageTypes[0], mainImageTypes[2], mainImageTypes[5]], "Amazon卖家指南：纯白背景、无文字水印、商品占比高；1000x1000以上利于缩放。"),
  spec("amazon-gallery-square", "amazon", "main", "辅图/场景 2000x2000", 2000, 2000, "1024x1024", mainImageTypes, "Amazon图库辅图可用于场景、细节、使用方式，仍需保持商品准确。"),
  spec("amazon-a-plus-portrait", "amazon", "detail", "A+详情 1500x2000", 1500, 2000, "1024x1536", detailPageImageTypes, "按Amazon A+/详情模块常用竖图安全规格，具体模块尺寸需商家后台校准。"),

  spec("ebay-gallery-square", "ebay", "main", "图库主图 1600x1600", 1600, 1600, "1024x1024", mainImageTypes, "eBay官方最低要求最长边500px；1600方图用于更好的缩放和搜索展示。"),
  spec("ebay-angle-portrait", "ebay", "main", "角度辅图 1200x1600", 1200, 1600, "1024x1536", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[4], mainImageTypes[5]], "eBay图库建议多角度真实展示商品状态。"),
  spec("ebay-detail-portrait", "ebay", "detail", "细节说明 1200x1600", 1200, 1600, "1024x1536", detailPageImageTypes, "用于材质、瑕疵、尺寸和使用场景等图库补充。"),

  spec("walmart-main-square", "walmart", "main", "主图 1500x1500", 1500, 1500, "1024x1024", [mainImageTypes[0], mainImageTypes[2], mainImageTypes[5]], "Walmart Marketplace通用做法：主图白底、方图、高清缩放友好。"),
  spec("walmart-gallery-square", "walmart", "main", "图库 1500x1500", 1500, 1500, "1024x1024", mainImageTypes, "Walmart图库可补充场景、功能和细节，保持零售可信。"),
  spec("walmart-detail-portrait", "walmart", "detail", "详情 1500x2000", 1500, 2000, "1024x1536", detailPageImageTypes, "按Walmart商品页竖图详情安全规格。"),

  spec("etsy-listing-square", "etsy", "main", "Listing方图 2000x2000", 2000, 2000, "1024x1024", mainImageTypes, "Etsy官方建议listing图片宽高至少2000px，首图需适配多种缩略图裁切。"),
  spec("etsy-listing-landscape", "etsy", "main", "Listing横图 2000x1500", 2000, 1500, "1024x1024", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[4]], "Etsy官方建议首图可用横向或方图，并保留裁切安全边距。"),
  spec("etsy-detail-square", "etsy", "detail", "图库细节 2000x2000", 2000, 2000, "1024x1024", detailPageImageTypes, "Etsy图库用于材质、尺寸、制作细节和生活方式补充。"),

  spec("shopee-main-square", "shopee", "main", "主图 1024x1024", 1024, 1024, "1024x1024", mainImageTypes, "Shopee卖家资料建议1:1方图，1024x1024及以上更清晰。"),
  spec("shopee-gallery-square", "shopee", "main", "图库 1000x1000", 1000, 1000, "1024x1024", mainImageTypes, "Shopee移动端图库安全规格，适合1-9张商品图。"),
  spec("shopee-detail-portrait", "shopee", "detail", "详情 1000x1500", 1000, 1500, "1024x1536", detailPageImageTypes, "Shopee详情/长图按移动端竖向安全规格。"),

  spec("lazada-main-square", "lazada", "main", "主图 1000x1000", 1000, 1000, "1024x1024", mainImageTypes, "Lazada主图按东南亚移动端方图安全规格，具体类目需后台校准。"),
  spec("lazada-gallery-square", "lazada", "main", "图库 1000x1000", 1000, 1000, "1024x1024", mainImageTypes, "Lazada图库用于场景、功能、细节补充。"),
  spec("lazada-detail-portrait", "lazada", "detail", "详情 1000x1500", 1000, 1500, "1024x1536", detailPageImageTypes, "Lazada详情页按移动端竖图安全规格。"),

  spec("aliexpress-main-square", "aliexpress", "main", "主图 800x800", 800, 800, "1024x1024", mainImageTypes, "AliExpress卖家帮助资料：1:1图片建议800x800px起。"),
  spec("aliexpress-gallery-square", "aliexpress", "main", "图库 1000x1000", 1000, 1000, "1024x1024", mainImageTypes, "AliExpress全球商品卡方图安全规格。"),
  spec("aliexpress-detail-portrait", "aliexpress", "detail", "详情 1000x1500", 1000, 1500, "1024x1536", detailPageImageTypes, "AliExpress详情图按移动端竖向展示安全规格。"),

  spec("tiktok-shop-global-main", "tiktok_shop_global", "main", "主图 1600x1600", 1600, 1600, "1024x1024", [mainImageTypes[0], mainImageTypes[1], mainImageTypes[2], mainImageTypes[4]], "TikTok Shop通用卖家资料：1:1主图、无水印/促销文字，建议高清方图。"),
  spec("tiktok-shop-global-cover", "tiktok_shop_global", "activity", "商品/内容封面 1080x1920", 1080, 1920, "2160x3840", activityImageTypes, "TikTok Shop内容电商封面按9:16移动端规格。"),
  spec("tiktok-shop-global-detail", "tiktok_shop_global", "detail", "商品详情 1000x1500", 1000, 1500, "1024x1536", detailPageImageTypes, "TikTok Shop商品页辅图按移动端竖图安全规格。"),

  spec("shopify-product-square", "shopify", "main", "商品图 2048x2048", 2048, 2048, "1024x1024", mainImageTypes, "Shopify/独立站常用高清商品方图，适合主题裁切和缩放。"),
  spec("shopify-lifestyle-portrait", "shopify", "main", "品牌场景 1600x2400", 1600, 2400, "1024x1536", [mainImageTypes[1], mainImageTypes[2], mainImageTypes[3], mainImageTypes[4]], "独立站品牌场景图按2:3竖图安全规格。"),
  spec("shopify-detail-portrait", "shopify", "detail", "详情模块 1600x2400", 1600, 2400, "1024x1536", detailPageImageTypes, "独立站商品页详情模块，具体主题尺寸可后续自定义。"),

  spec("free-main-custom-source", "free", "main", "通用规格素材", 1024, 1024, "1024x1024", mainImageTypes, "仅用于通用平台的图片类型校验；UI默认使用自定义尺寸。"),
  spec("free-detail-custom-source", "free", "detail", "通用详情素材", 1024, 1536, "1024x1536", detailPageImageTypes, "仅用于通用平台的详情类型校验；UI默认使用自定义尺寸。")
];

export function specsForPlatform(platform: CommercePlatform): PlatformSpecPreset[] {
  return platformSpecPresets.filter((item) => item.platform === platform);
}

export function findPlatformSpec(specId: string, platform?: CommercePlatform): PlatformSpecPreset | undefined {
  const normalizedSpecId = specId === "taobao-detail-790" ? "taobao-detail-mobile" : specId;
  return platformSpecPresets.find((item) => item.id === normalizedSpecId && (!platform || item.platform === platform));
}

export function findSpecImageType(spec: PlatformSpecPreset, imageTypeId: string): PlatformImageTypePreset | undefined {
  return spec.imageTypes.find((item) => item.id === imageTypeId);
}

export function resolveProviderSizeForTarget(targetWidth: number, targetHeight: number): SizeOption {
  const ratio = targetWidth / targetHeight;
  return Object.values(sizeOptions).reduce((best, option) => {
    const optionRatio = option.width / option.height;
    const bestRatio = best.width / best.height;
    const score = Math.abs(optionRatio - ratio) * 10 + Math.abs(option.width - targetWidth) / 5000 + Math.abs(option.height - targetHeight) / 5000;
    const bestScore = Math.abs(bestRatio - ratio) * 10 + Math.abs(best.width - targetWidth) / 5000 + Math.abs(best.height - targetHeight) / 5000;
    return score < bestScore ? option : best;
  }, sizeOptions.portrait);
}

function spec(
  id: string,
  platform: CommercePlatform,
  assetGroup: AssetGroup,
  label: string,
  targetWidth: number,
  targetHeight: number,
  providerSize: AllowedImageSize,
  imageTypes: PlatformImageTypePreset[],
  sourceNote: string
): PlatformSpecPreset {
  return { id, platform, assetGroup, label, targetWidth, targetHeight, providerSize, imageTypes, sourceNote };
}

export function defaultSceneVariant(scene: ApparelScene): SceneVariant {
  return sceneVariantGroups[scene][0];
}

function isSizePreset(value: string): value is SizePreset {
  return (sizePresets as readonly string[]).includes(value);
}
