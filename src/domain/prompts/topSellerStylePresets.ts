export const topSellerStylePresetIds = [
  "old_money",
  "urban_commute",
  "street_trend",
  "gorpcore",
  "korean_relaxed",
  "new_chinese",
  "dopamine_sweet",
  "minimal_premium",
  "bag_performance_utility",
  "bag_clean_lifestyle",
  "bag_premium_leather",
  "bag_outdoor_trail",
  "shoe_tech_runner",
  "shoe_clean_lifestyle",
  "shoe_luxury_leather",
  "shoe_outdoor_trail",
  "bag_quiet_luxury",
  "bag_commute_utility",
  "bag_travel_luggage",
  "bag_light_lifestyle",
  "beauty_clean_lab",
  "beauty_gloss_editorial",
  "beauty_ingredient_natural",
  "beauty_luxury_fragrance",
  "baby_soft_nursery",
  "baby_bright_play",
  "baby_clean_safety",
  "home_warm_living",
  "home_japanese_wood",
  "home_modern_minimal",
  "home_functional_storage",
  "digital_dark_tech",
  "digital_clean_white",
  "digital_lifestyle_desk",
  "digital_smart_home",
  "food_appetizing_closeup",
  "food_origin_fresh",
  "food_clean_packaging",
  "food_festival_gift",
  "sports_performance",
  "sports_outdoor_field",
  "sports_yoga_clean",
  "sports_camping_gear",
  "jewelry_macro_luxury",
  "jewelry_oriental_gift",
  "jewelry_daily_wear",
  "auto_clean_detail",
  "auto_scene_install",
  "auto_tech_black"
] as const;

export type TopSellerStylePresetId = (typeof topSellerStylePresetIds)[number];
export type VariationStrength = "safe" | "balanced" | "bold";

export interface StyleVisualSystem {
  scenes: string[];
  cameras: string[];
  lighting: string[];
  poses: string[];
  palettes: string[];
  commerceIntensity: string;
  forbiddenElements: string[];
}

export interface TopSellerStylePreset {
  id: TopSellerStylePresetId;
  label: string;
  desc: string;
  badge: string;
  sampleClass: string;
  visualSystem: StyleVisualSystem;
  direction: string;
}

export type TopSellerStyleCategoryKey =
  | "apparel"
  | "shoes"
  | "bags"
  | "beauty"
  | "baby"
  | "home"
  | "digital"
  | "food"
  | "sports"
  | "jewelry"
  | "auto"
  | "general";

export const topSellerStylePresets: TopSellerStylePreset[] = [
  {
    id: "old_money",
    label: "老钱质感",
    desc: "低饱和、克制奢华、皮革/包型高级感，适合高客单包款",
    badge: "高级客单",
    sampleClass: "minimal_art",
    visualSystem: {
      scenes: ["marble corridor", "quiet club lounge", "arched doorway", "linen curtain alcove", "warm stone arcade"],
      cameras: ["70-85mm editorial lens", "straight verticals", "waist-to-full-body crop", "eye-level premium catalog frame"],
      lighting: ["soft window light", "gentle shadow falloff", "low-contrast premium lighting"],
      poses: ["calm bag-forward carry", "hand-carry in corridor", "slow walking with bag visible", "seated side-profile bag view", "polished product side angle"],
      palettes: ["ivory", "oatmeal", "camel", "charcoal", "deep navy"],
      commerceIntensity: "balanced marketplace with high-ticket premium restraint",
      forbiddenElements: ["loud color blocks", "streetwear graffiti", "discount graphics", "busy props"]
    },
    direction:
      "Top merchant hit-style reconstruction: old money quiet luxury for bags. Palette ivory, oatmeal, camel, charcoal, deep navy; background marble corridor, quiet club lounge, arched doorway, linen curtain alcove or warm stone arcade; lighting soft window light with gentle shadow falloff; camera 70-85mm editorial lens, straight verticals, bag-forward carry crop or refined product side view; pose calm hand-carry, shoulder-carry, seated side-profile bag view, or polished product angle. Emphasize leather grain, handle, strap, zipper, hardware, stitching and restrained expensive maturity, not generic studio."
  },
  {
    id: "urban_commute",
    label: "城市通勤",
    desc: "干净利落、办公室到街头，适合通勤包、公文包、双肩包",
    badge: "通勤爆款",
    sampleClass: "modern_studio",
    visualSystem: {
      scenes: ["glass office facade with depth", "clean street corner crossing", "elevator lobby", "modern desk-side studio", "office atrium walkway"],
      cameras: ["eye-level 50mm", "clean vertical composition", "front-to-three-quarter view", "practical full-body crop"],
      lighting: ["crisp daylight", "softbox with tailoring edge", "clear office daylight"],
      poses: ["walking with tote", "shoulder strap adjustment", "bag side profile at office floor", "placing laptop into bag", "commute stride with bag visible"],
      palettes: ["black", "white", "slate", "taupe", "muted blue"],
      commerceIntensity: "balanced marketplace with clear professional readability",
      forbiddenElements: ["fantasy runway styling", "messy office props", "overly dramatic pose", "dense text"]
    },
    direction:
      "Top merchant hit-style reconstruction: urban commute bags. Palette black, white, slate, taupe, muted blue; background glass office facade with depth, clean street corner crossing, elevator lobby, modern desk-side studio or office atrium walkway; lighting crisp daylight or softbox with clean bag edges; camera eye-level 50mm, clean vertical composition, three-quarter bag crop when useful; pose walking with tote, shoulder strap adjustment, laptop insertion, office-floor side profile, or commute stride with bag visible. Make it polished and practical, not fashion-magazine fantasy."
  },
  {
    id: "street_trend",
    label: "高街潮流",
    desc: "强首屏、街拍感、包型突出，适合潮流斜挎包/双肩包",
    badge: "潮流点击",
    sampleClass: "urban_highstreet",
    visualSystem: {
      scenes: ["city crosswalk", "metal shutter", "parking garage", "underpass", "neon storefront", "skateboard-like street texture"],
      cameras: ["lower angle 28-35mm", "slightly wide perspective", "stronger foreground depth", "dynamic full-body frame"],
      lighting: ["harder side light", "late afternoon contrast", "urban night accent light"],
      poses: ["wide bag-forward stance", "stride toward camera with bag", "crossbody strap adjustment", "low-angle backpack view", "leaning near rail with bag visible", "hand holding strap"],
      palettes: ["black", "denim blue", "cement grey", "accent red", "electric blue"],
      commerceIntensity: "strong click-through with product-first street energy",
      forbiddenElements: ["neutral catalog stance", "luxury lounge", "pastel softness", "price badges"]
    },
    direction:
      "Top merchant hit-style reconstruction: high-street bag trend. Palette black, denim blue, cement grey, accent red or electric blue; background city crosswalk, metal shutter, parking garage, underpass, neon storefront or skateboard-like street texture; lighting harder side light or late afternoon contrast; camera lower angle 28-35mm, slightly wider perspective, stronger foreground depth; pose wide bag-forward stance, stride toward camera with bag, crossbody strap adjustment, low-angle backpack view, leaning near rail with bag visible, or hand holding strap. It must feel street-shot and energetic while bag silhouette, material, straps and hardware remain sharp."
  },
  {
    id: "gorpcore",
    label: "山系机能",
    desc: "户外机能、自然场景、耐穿感，适合冲锋衣/裤装/鞋包",
    badge: "户外热卖",
    sampleClass: "sunny_outdoor",
    visualSystem: {
      scenes: ["trail entrance", "rocky path", "grass slope", "wet pavement", "campsite texture", "mountain-like city park"],
      cameras: ["35-50mm field-test framing", "three-quarter product view", "full-body outdoor crop", "low practical angle for bags"],
      lighting: ["real outdoor daylight", "practical shadows", "overcast functional light"],
      poses: ["backpack on trail", "bag placed on wet pavement", "strap adjustment", "opening outdoor compartment", "checking buckle or strap", "walking on trail with bag"],
      palettes: ["moss green", "sand", "stone grey", "black", "muted orange"],
      commerceIntensity: "bold lifestyle utility while keeping product inspection clear",
      forbiddenElements: ["luxury room", "fragile fashion pose", "unrelated camping clutter", "discount banners"]
    },
    direction:
      "Top merchant hit-style reconstruction: gorpcore outdoor bag utility. Palette moss green, sand, stone grey, black, muted orange; background trail entrance, rocky path, grass slope, wet pavement, campsite texture or mountain-like city park, never a luxury room; lighting real outdoor daylight with practical shadows; camera 35-50mm, practical three-quarter field-test framing; pose backpack on trail, bag placed on wet pavement, strap adjustment, opening outdoor compartment, checking buckle/strap, or walking on trail with bag. Emphasize rugged fabric, zipper, buckle, weather-ready texture, strap support and movement readiness."
  },
  {
    id: "korean_relaxed",
    label: "韩系松弛",
    desc: "柔和自然光、松弛街拍，适合通勤包/腋下包/托特包",
    badge: "氛围转化",
    sampleClass: "window_light",
    visualSystem: {
      scenes: ["cafe window", "sunlit apartment", "quiet sidewalk", "white curtain", "pale wood floor"],
      cameras: ["50mm eye-level", "negative-space composition", "half-body slight turn", "relaxed full-body frame"],
      lighting: ["hazy window daylight", "low contrast", "airy highlights", "soft morning light"],
      poses: ["relaxed seated edge of chair with bag visible", "gentle walking with bag", "looking down at bag", "one bag slightly forward", "half-turn showing bag side profile", "strap adjustment"],
      palettes: ["cream", "pale grey", "washed denim", "butter yellow", "light khaki"],
      commerceIntensity: "balanced marketplace with soft lifestyle conversion",
      forbiddenElements: ["formal studio stiffness", "hard contrast streetwear", "heavy makeup", "busy cafe clutter"]
    },
    direction:
      "Top merchant hit-style reconstruction: Korean relaxed bag lifestyle. Palette cream, pale grey, washed denim, butter yellow, light khaki; background cafe window, sunlit apartment, quiet sidewalk, white curtain, pale wood floor; lighting hazy window daylight, low contrast, airy highlights; camera 50mm eye-level with negative space or clean half-body carrying crop; pose relaxed seated edge of chair with bag visible, gentle walking with bag, looking down while adjusting strap, one bag slightly forward, half-turn showing side profile, or natural hand-carry. It must feel soft, lived-in and breathable, not formal studio."
  },
  {
    id: "new_chinese",
    label: "新中式雅致",
    desc: "立领/盘扣/东方留白，适合改良中式与国风款",
    badge: "趋势风格",
    sampleClass: "luxury_home",
    visualSystem: {
      scenes: ["warm wood screen corridor", "stone courtyard path", "paper screen alcove", "bamboo shadow walkway", "circular doorway", "minimalist tea-room scene"],
      cameras: ["symmetrical 50-70mm", "generous negative space", "side profile turn", "calm full-body crop"],
      lighting: ["quiet side light", "poetic shadow", "warm indoor daylight"],
      poses: ["upright composed bag-forward posture", "slow step past screen with bag", "hand-carry near stone threshold", "side profile bag angle", "seated calm bag view"],
      palettes: ["ink black", "porcelain white", "tea brown", "jade grey", "cinnabar accent"],
      commerceIntensity: "balanced marketplace with contemporary cultural restraint",
      forbiddenElements: ["costume-drama exaggeration", "fake ancient props", "heavy logo", "crowded decorative screens"]
    },
    direction:
      "Top merchant hit-style reconstruction: modern new Chinese bag elegance. Palette ink black, porcelain white, tea brown, jade grey, cinnabar accent; background warm wood screen corridor, stone courtyard path, paper screen alcove, bamboo shadow walkway, circular doorway or minimalist tea-room scene; lighting quiet side light with poetic shadow; camera symmetrical 50-70mm, generous negative space; pose upright composed bag-forward carry, slow step past screen with bag, hand-carry near stone threshold, side profile bag angle, or seated calm bag view. Keep contemporary ecommerce clarity and avoid costume-drama exaggeration."
  },
  {
    id: "dopamine_sweet",
    label: "甜酷多巴胺",
    desc: "明亮色彩、年轻感、视觉抓眼，适合女包/童包",
    badge: "年轻流量",
    sampleClass: "magazine_cover",
    visualSystem: {
      scenes: ["color-block studio corner", "playful studio prop", "bright street corner", "glossy magazine set", "clean pastel set"],
      cameras: ["35-50mm dynamic frame", "diagonal composition", "full-body playful crop", "slight low angle"],
      lighting: ["bright frontal commercial light", "crisp color light", "clean high-key studio"],
      poses: ["playful step with bag", "slight motion with bag sharp", "one bag forward", "bag-forward half-body pose", "looking back with bag visible", "angled stance"],
      palettes: ["clean white", "pink", "lime", "sky blue", "sunny yellow"],
      commerceIntensity: "strong click-through with youthful color energy",
      forbiddenElements: ["muddy palette", "adultized child styling", "overcrowded props", "price callouts"]
    },
    direction:
      "Top merchant hit-style reconstruction: dopamine sweet-cool bags. Palette clean white plus one or two saturated accents like pink, lime, sky blue or sunny yellow; background color-block studio corner, playful studio prop, bright street corner or glossy magazine set; lighting bright frontal commercial light with crisp color; camera 35-50mm, dynamic diagonal composition or low bag-forward crop; pose playful step with bag, slight motion with bag sharp, one bag forward, bag-forward half-body pose, looking back with bag visible, or angled stance. It must be vivid and young while keeping bag color accurate and the scene uncluttered."
  },
  {
    id: "minimal_premium",
    label: "极简高级",
    desc: "纯净背景、材质优先，适合白底/详情/品质款",
    badge: "审核友好",
    sampleClass: "pure_white",
    visualSystem: {
      scenes: ["seamless white sweep", "matte plinth", "minimal paper-texture set", "light gray studio"],
      cameras: ["straight-on 70mm product lens", "front view", "side view", "back view", "centered product crop"],
      lighting: ["large softbox", "even shadow control", "precise commercial light"],
      poses: ["neutral front bag angle", "side profile", "back angle", "top/open angle", "centered product-only layout"],
      palettes: ["pure white", "off-white", "soft grey", "controlled shadow"],
      commerceIntensity: "audit-safe inspection-first marketplace image",
      forbiddenElements: ["atmospheric scene", "busy background", "strong lifestyle gesture", "decorative novelty"]
    },
    direction:
      "Top merchant hit-style reconstruction: minimal premium bag marketplace. Palette pure white, off-white, soft grey, controlled shadow only; background seamless white sweep, matte plinth, or minimal paper-texture set; lighting large softbox, even and precise; camera straight-on 70mm product/catalog lens; angle if model carry is used: neutral front bag angle, side profile, back angle, top/open angle, or bag-forward crop; if product-only: centered, large, crisp edges. Prioritize inspection, material, handle, strap, zipper, hardware, pockets, bottom and platform approval, not atmosphere."
  },
  makePreset("bag_performance_utility", "运动机能", "速度感、机能结构、科技棚拍，适合户外包/机能包", "机能包", "modern_studio", ["cool grey", "electric blue", "black", "white"], "Tmall bag visual: performance outdoor-bag technology. Use low 35mm product angle, crisp rim light, clean gradient or track-inspired floor, visible straps, buckles, zippers, reinforced panels and load-bearing structure, precise nylon texture, energetic but inspection-friendly composition."),
  makePreset("bag_clean_lifestyle", "百搭通勤", "干净日常、轻街拍、百搭穿搭，适合托特包/斜挎包", "百搭", "urban_highstreet", ["white", "light denim", "warm grey", "khaki"], "Tmall bag visual: clean lifestyle versatility. Use sidewalk, cafe entrance or simple studio floor, eye-level to low three-quarter bag view, soft daylight, everyday carrying styling, strict color cleanliness and clear bag edge."),
  makePreset("bag_premium_leather", "质感皮革", "深色背景、皮革高光、商务高级，适合皮具/通勤包", "皮革", "minimal_art", ["black", "cognac", "cream", "deep brown"], "Tmall bag visual: premium leather goods detail. Use warm dark tabletop or stone plinth, controlled highlight on leather grain, 70mm product lens, elegant side view, stitching, handle, zipper puller, clasp and hardware clarity, no distracting props."),
  makePreset("bag_outdoor_trail", "户外越野", "山系地面、机能耐穿、结构突出，适合户外包/机能包", "户外", "sunny_outdoor", ["moss green", "stone grey", "sand", "muted orange"], "Tmall bag visual: outdoor trail utility. Use rocky ground, wet pavement or park trail, practical daylight, low angle showing straps, buckles, zippers, side pockets and rugged fabric, functional texture and weather-ready mood."),
  makePreset("bag_quiet_luxury", "静奢皮具", "皮革、五金、低饱和高级感，适合女包/钱包", "皮具", "minimal_art", ["ivory", "taupe", "caramel", "charcoal"], "Tmall bag visual: quiet luxury leather goods. Use marble, linen or warm stone surface, soft side light, 70mm product lens, emphasize silhouette, handle, hardware and leather grain, restrained premium styling."),
  makePreset("bag_commute_utility", "通勤机能", "容量、分区、耐用材质，适合双肩包/男包", "通勤", "urban_highstreet", ["black", "slate", "navy", "cement grey"], "Tmall bag visual: commute utility. Use office lobby, desk-side or clean city scene, three-quarter carrying angle, visible compartments, zippers, straps and laptop capacity, practical professional tone."),
  makePreset("bag_travel_luggage", "旅行场景", "机场/酒店感、拉杆轮组、容量感，适合旅行箱", "旅行", "modern_studio", ["silver", "cream", "navy", "graphite"], "Tmall luggage visual: premium travel scene. Use airport-like corridor, hotel lobby or clean studio, full front and side readability, emphasize shell texture, wheels, handle and capacity, no crowded travel clutter."),
  makePreset("bag_light_lifestyle", "轻生活方式", "明亮街拍、轻巧搭配、年轻日常", "轻巧", "window_light", ["cream", "washed blue", "butter yellow", "light khaki"], "Tmall bag visual: light lifestyle pairing. Use soft window daylight or clean street corner, relaxed carrying pose, clear scale on body, bright breathable palette, product remains the hero."),
  makePreset("beauty_clean_lab", "成分实验室", "洁净、成分、功效信任，适合护肤", "成分", "pure_white", ["white", "ice blue", "transparent glass", "silver"], "Tmall beauty visual: clean lab skincare trust. Use white acrylic, water-drop freshness, precise reflection, macro texture swatch when helpful, label integrity and ingredient-focused clean lighting."),
  makePreset("beauty_gloss_editorial", "彩妆光泽", "高光反射、色彩试色、精修杂志感", "彩妆", "magazine_cover", ["rose", "berry", "nude beige", "gloss black"], "Tmall makeup visual: glossy editorial. Use polished reflective surface, controlled color swatch, crisp front light, cosmetic tube or compact geometry, premium retouching and accurate shade display."),
  makePreset("beauty_ingredient_natural", "植萃自然", "植物/水润/温和自然，适合个护护肤", "植萃", "sunny_outdoor", ["sage green", "cream", "clear water", "warm beige"], "Tmall beauty visual: natural ingredient care. Use clean botanical hint, water or bathroom freshness, soft daylight, gentle palette, trustworthy packaging and no fake medical claim graphics."),
  makePreset("beauty_luxury_fragrance", "香氛静奢", "玻璃瓶、高光、氛围留白，适合香水香氛", "香氛", "minimal_art", ["champagne", "smoke grey", "black", "transparent amber"], "Tmall fragrance visual: luxury scent atmosphere. Use reflective glass, atmospheric but uncluttered background, low-key highlight, bottle silhouette and cap clarity, premium gift mood."),
  makePreset("baby_soft_nursery", "柔软育儿", "奶油色、亲肤、安全感，适合母婴用品", "亲肤", "window_light", ["cream", "warm white", "pale wood", "soft blue"], "Tmall baby visual: soft nursery safety. Use warm nursery or clean tabletop, rounded forms, soft fabric cues, hygienic daylight, parent-friendly trust and child-safe styling."),
  makePreset("baby_bright_play", "明亮玩趣", "清爽色块、玩具早教、童趣但不杂乱", "玩趣", "magazine_cover", ["sunny yellow", "sky blue", "coral", "white"], "Tmall baby visual: bright play and learning. Use clean color-block background, simple play context, rounded product forms, cheerful light, avoid clutter and adultized styling."),
  makePreset("baby_clean_safety", "洁净安全", "卫生、材质、结构清晰，适合喂养/纸尿裤", "安全", "pure_white", ["white", "mint", "soft grey", "pale blue"], "Tmall baby visual: clean safety proof. Use white or mint hygienic scene, clear packaging and structure, soft absorbency or easy-clean cues, no exaggerated medical claims."),
  makePreset("home_warm_living", "温暖居家", "客厅卧室场景、生活温度，适合家居家纺", "居家", "window_light", ["warm white", "oak", "linen", "soft brown"], "Tmall home visual: warm living scene. Use bedroom or living room context, soft window light, show scale, fabric or material texture, cozy but tidy family atmosphere."),
  makePreset("home_japanese_wood", "日式原木", "浅木色、留白、收纳秩序", "原木", "minimal_art", ["light wood", "off-white", "sage", "warm grey"], "Tmall home visual: Japanese wood minimal. Use pale wood, off-white background, orderly composition, natural daylight, product function and texture clarity."),
  makePreset("home_modern_minimal", "现代极简", "干净空间、线条、材质高级", "极简", "modern_studio", ["white", "charcoal", "stone grey", "metal"], "Tmall home visual: modern minimal interior. Use clean architecture, straight lines, controlled shadows, product centered in realistic room scale, premium material emphasis."),
  makePreset("home_functional_storage", "功能收纳", "前后对比感、容量分区、实用清晰", "收纳", "pure_white", ["white", "light grey", "clear plastic", "blue accent"], "Tmall home visual: functional storage and cleaning. Use clear compartment visibility, before-use clarity without messy clutter, practical hand-scale or room-scale context, high readability."),
  makePreset("digital_dark_tech", "暗调科技", "黑底高光、金属质感、性能感", "科技", "urban_highstreet", ["black", "graphite", "electric blue", "silver"], "Tmall digital visual: dark technology hero. Use black or graphite background, precise rim light, reflective metal or glass, ports/buttons/screen geometry visible, premium performance mood."),
  makePreset("digital_clean_white", "白场精修", "白底、反射、结构清晰，适合数码家电", "精修", "pure_white", ["white", "silver", "ice grey", "soft shadow"], "Tmall digital visual: clean white retouching. Use seamless white or light grey, centered product, crisp edge, controlled reflection, exact screen or control-panel shape."),
  makePreset("digital_lifestyle_desk", "桌面生活", "办公桌、使用场景、生产力氛围", "桌面", "modern_studio", ["white", "oak", "slate", "muted blue"], "Tmall digital visual: lifestyle desk productivity. Use tidy desk scene, hand-scale or usage context, soft daylight, cable and accessory discipline, product remains clear."),
  makePreset("digital_smart_home", "智能家居", "现代家庭、控制面板、智能感", "智能", "window_light", ["warm white", "silver", "soft blue", "wood"], "Tmall appliance visual: smart home. Use kitchen, bath or living scene, clean family-scale context, control panel readability, credible functional lighting."),
  makePreset("food_appetizing_closeup", "食欲近景", "质地、色泽、入口感，适合零食生鲜", "食欲", "magazine_cover", ["warm red", "golden", "fresh green", "cream"], "Tmall food visual: appetizing close-up. Use macro texture, fresh serving, warm light, clean tabletop, accurate ingredients and no fake quantity exaggeration."),
  makePreset("food_origin_fresh", "产地新鲜", "自然光、产地/冷链、真实新鲜感", "新鲜", "sunny_outdoor", ["natural green", "sky blue", "earth brown", "clean white"], "Tmall food visual: origin and freshness. Use natural ingredient scene, water or ice cue when appropriate, daylight, clean cold-chain trust and package integrity."),
  makePreset("food_clean_packaging", "包装信任", "标签清晰、整齐陈列、日常厨房", "包装", "pure_white", ["white", "warm beige", "brand color", "soft grey"], "Tmall food visual: clean packaging trust. Use front-facing package readability, neat arrangement, kitchen or tabletop hint, clear label and daily-use reliability."),
  makePreset("food_festival_gift", "节礼氛围", "礼盒、节日、高客单送礼感", "礼盒", "minimal_art", ["red", "gold", "deep green", "cream"], "Tmall food visual: festival gift box. Use premium gift arrangement, restrained red/gold or seasonal palette, box structure and contents visible, celebratory but not noisy."),
  makePreset("sports_performance", "运动性能", "力量、速度、支撑结构，适合运动包与户外装备", "性能", "urban_highstreet", ["black", "white", "signal red", "electric blue"], "Tmall sports visual: performance action. Use dynamic athletic pose or equipment context, crisp daylight or rim light, emphasize strap support, reinforced fabric, protective structure and movement readiness."),
  makePreset("sports_outdoor_field", "户外实测", "真实户外、耐穿防护、装备感", "实测", "sunny_outdoor", ["moss", "sand", "stone", "orange"], "Tmall sports/outdoor visual: field-tested utility. Use trail, campsite or park scene, practical shadows, weatherproof details, pockets, straps and rugged texture."),
  makePreset("sports_yoga_clean", "瑜伽清爽", "柔和干净、舒展轻运动", "瑜伽", "window_light", ["cream", "sage", "dusty pink", "light grey"], "Tmall sports visual: clean yoga and wellness. Use airy studio, soft daylight, controlled pose, supportive sole or equipment comfort, calm healthy palette."),
  makePreset("sports_camping_gear", "露营装备", "帐篷/器具场景、功能结构、户外生活", "露营", "minimal_art", ["khaki", "forest green", "black", "warm amber"], "Tmall outdoor gear visual: camping lifestyle. Use tidy campsite texture, product setup or hand-scale, warm practical light, function-first composition."),
  makePreset("jewelry_macro_luxury", "珠宝微距", "金属/宝石高光、精致微距", "珠宝", "minimal_art", ["champagne", "black", "pearl white", "ruby"], "Tmall jewelry visual: macro luxury. Use 85-100mm macro feeling, velvet or stone surface, precise sparkle, metal finish, gemstone clarity and premium retouching."),
  makePreset("jewelry_oriental_gift", "东方礼赠", "礼盒、雅致、节庆送礼", "礼赠", "new_chinese", ["jade", "cinnabar", "gold", "porcelain white"], "Tmall jewelry visual: oriental gift elegance. Use refined gift box, warm wood or paper texture, symmetrical composition, cultural restraint and no costume-drama exaggeration."),
  makePreset("jewelry_daily_wear", "日常佩戴", "上身比例、轻奢通勤、不过度夸张", "佩戴", "window_light", ["cream", "taupe", "silver", "soft gold"], "Tmall accessory visual: daily wear. Use neck/hand/wrist scale, soft daylight, clean outfit pairing, show size and comfort, product remains sharp."),
  makePreset("auto_clean_detail", "洁净细节", "材质、接口、安装结构清晰", "细节", "pure_white", ["white", "black", "silver", "blue"], "Tmall auto accessory visual: clean detail. Use studio or car-detail close-up, show texture, ports, clips, seams and installation-facing structure clearly."),
  makePreset("auto_scene_install", "车内实装", "真实车内、安装位置、使用场景", "实装", "modern_studio", ["black", "warm grey", "chrome", "soft blue"], "Tmall auto visual: real in-car installation. Use clean car interior, dashboard/seat/trunk context, hand-scale when useful, no messy cockpit clutter."),
  makePreset("auto_tech_black", "黑金科技", "暗调、金属、智能设备感", "科技", "urban_highstreet", ["black", "graphite", "gold", "electric blue"], "Tmall auto electronics visual: black tech. Use dark reflective surface, rim light, product buttons/display visible, premium smart-device feeling.")
];

const legacyTopSellerStylePresetIdMap: Partial<Record<TopSellerStylePresetId, TopSellerStylePresetId>> = {
  shoe_tech_runner: "bag_performance_utility",
  shoe_clean_lifestyle: "bag_clean_lifestyle",
  shoe_luxury_leather: "bag_premium_leather",
  shoe_outdoor_trail: "bag_outdoor_trail"
};

export function normalizeTopSellerStylePresetId(id?: string): TopSellerStylePresetId | undefined {
  if (!id || !topSellerStylePresetIds.includes(id as TopSellerStylePresetId)) return undefined;
  const typed = id as TopSellerStylePresetId;
  return legacyTopSellerStylePresetIdMap[typed] ?? typed;
}

export function findTopSellerStylePreset(id?: string): TopSellerStylePreset | undefined {
  const normalizedId = normalizeTopSellerStylePresetId(id);
  return topSellerStylePresets.find((item) => item.id === normalizedId);
}

export const topSellerStylePresetIdsByCategory: Record<TopSellerStyleCategoryKey, TopSellerStylePresetId[]> = {
  apparel: ["old_money", "urban_commute", "street_trend", "gorpcore", "korean_relaxed", "new_chinese", "dopamine_sweet", "minimal_premium"],
  shoes: ["bag_performance_utility", "bag_clean_lifestyle", "bag_premium_leather", "bag_outdoor_trail", "minimal_premium"],
  bags: ["bag_quiet_luxury", "bag_commute_utility", "bag_travel_luggage", "bag_light_lifestyle", "bag_performance_utility", "bag_premium_leather", "bag_outdoor_trail", "minimal_premium"],
  beauty: ["beauty_clean_lab", "beauty_gloss_editorial", "beauty_ingredient_natural", "beauty_luxury_fragrance", "minimal_premium"],
  baby: ["baby_soft_nursery", "baby_bright_play", "baby_clean_safety", "minimal_premium"],
  home: ["home_warm_living", "home_japanese_wood", "home_modern_minimal", "home_functional_storage", "minimal_premium"],
  digital: ["digital_dark_tech", "digital_clean_white", "digital_lifestyle_desk", "digital_smart_home"],
  food: ["food_appetizing_closeup", "food_origin_fresh", "food_clean_packaging", "food_festival_gift"],
  sports: ["sports_performance", "sports_outdoor_field", "sports_yoga_clean", "sports_camping_gear", "minimal_premium"],
  jewelry: ["jewelry_macro_luxury", "jewelry_oriental_gift", "jewelry_daily_wear", "minimal_premium"],
  auto: ["auto_clean_detail", "auto_scene_install", "auto_tech_black", "minimal_premium"],
  general: ["minimal_premium", "digital_clean_white", "home_warm_living", "food_clean_packaging"]
};

export function topSellerStylePresetsForCategory(category: TopSellerStyleCategoryKey): TopSellerStylePreset[] {
  const ids = topSellerStylePresetIdsByCategory[category] ?? topSellerStylePresetIdsByCategory.apparel;
  return ids.map((id) => findTopSellerStylePreset(id)).filter((item): item is TopSellerStylePreset => Boolean(item));
}

function makePreset(
  id: TopSellerStylePresetId,
  label: string,
  desc: string,
  badge: string,
  sampleClass: string,
  palettes: string[],
  direction: string
): TopSellerStylePreset {
  return {
    id,
    label,
    desc,
    badge,
    sampleClass,
    visualSystem: richPresetVisualSystem(id, palettes),
    direction
  };
}

function richPresetVisualSystem(id: TopSellerStylePresetId, palettes: string[]): StyleVisualSystem {
  const sharedForbidden = ["generic wall", "beige facade", "plain sidewalk", "same neutral standing pose", "same studio template", "price badges", "third-party logos", "messy props", "unreadable product details"];
  const byId: Partial<Record<TopSellerStylePresetId, Omit<StyleVisualSystem, "palettes" | "commerceIntensity" | "forbiddenElements"> & { forbiddenElements?: string[]; commerceIntensity?: string }>> = {
    bag_performance_utility: {
      scenes: ["technical studio floor", "cool gradient tech floor", "floating acrylic riser", "mesh shadow studio", "speed-line floor reflection"],
      cameras: ["low 28-35mm bag-forward angle", "three-quarter hardware reveal", "side profile compression view", "macro strap detail crop"],
      lighting: ["crisp rim light", "cool high-contrast strip light", "clean top softbox with shadow edge"],
      poses: ["bag angled toward camera", "strap lifted upward", "single bag with side depth", "single bag side profile"]
    },
    bag_clean_lifestyle: {
      scenes: ["pale concrete step", "cafe entrance floor", "light wood dressing area", "clean crosswalk crop", "warm grey studio floor"],
      cameras: ["eye-level carrying crop", "low three-quarter bag view", "half-body lifestyle crop", "side profile walking angle"],
      lighting: ["soft daylight", "warm storefront window light", "clean low-contrast studio light"],
      poses: ["walking with bag", "one bag slightly forward", "seated strap-adjusting angle", "standing side profile"]
    },
    bag_premium_leather: {
      scenes: ["warm stone plinth", "dark walnut tabletop", "linen-lined luxury surface", "polished leather shadow set", "brushed brass accent surface"],
      cameras: ["70mm side profile product lens", "handle close crop", "three-quarter hardware angle", "macro stitching crop"],
      lighting: ["controlled leather highlight", "warm side light", "low-key premium reflection"],
      poses: ["elegant side view", "handle and flap angled upward", "hardware detail angle", "single bag aligned with depth"]
    },
    bag_outdoor_trail: {
      scenes: ["rocky trail ground", "wet pavement texture", "mossy park path", "gravel slope", "mud-safe outdoor mat"],
      cameras: ["low bag utility angle", "three-quarter backpack view", "field-test walking crop", "macro buckle detail crop"],
      lighting: ["real outdoor daylight", "overcast utility light", "practical wet-ground reflection"],
      poses: ["backpack on trail", "bag placed on gravel", "buckle tilted to camera", "bag beside trail gear"]
    },
    bag_quiet_luxury: {
      scenes: ["marble ledge", "linen drape surface", "warm stone console", "quiet lounge chair", "soft leather tabletop"],
      cameras: ["70mm product lens", "front silhouette frame", "three-quarter handle view", "macro hardware crop"],
      lighting: ["soft side window light", "controlled hardware highlight", "low-contrast luxury shadow"],
      poses: ["upright bag silhouette", "handle lifted cleanly", "strap draped naturally", "hardware angled to light"]
    },
    bag_commute_utility: {
      scenes: ["office lobby bench", "desk-side work setup", "elevator corridor", "clean city commute corner", "concrete business floor"],
      cameras: ["three-quarter carrying angle", "front capacity view", "over-shoulder scale crop", "pocket detail crop"],
      lighting: ["crisp office daylight", "softbox with edge definition", "clear lobby ambient light"],
      poses: ["shoulder-carry view", "hand holding strap", "front pocket opened slightly", "standing beside desk"]
    },
    bag_travel_luggage: {
      scenes: ["airport-like corridor", "hotel lobby floor", "clean boarding-gate bench", "studio travel plinth", "smooth terminal wall panel"],
      cameras: ["full front luggage view", "three-quarter wheel angle", "low handle-and-wheel crop", "side capacity profile"],
      lighting: ["clean terminal daylight", "premium lobby soft light", "controlled shell reflection"],
      poses: ["handle extended", "case angled on wheels", "open-shell organization view", "upright front profile"]
    },
    bag_light_lifestyle: {
      scenes: ["sunlit cafe window", "washed denim outfit crop", "pale wood bench", "bright clean street corner", "soft apartment mirror area"],
      cameras: ["relaxed half-body scale crop", "50mm eye-level carry view", "soft three-quarter product angle", "negative-space lifestyle frame"],
      lighting: ["hazy daylight", "soft morning window light", "airy low-contrast highlight"],
      poses: ["crossbody carry", "hand-carry with walking step", "bag resting on lap", "strap adjusted naturally"]
    },
    beauty_clean_lab: {
      scenes: ["white acrylic lab tray", "transparent glass slab", "water-drop surface", "ice-blue tile", "clinical vanity shelf"],
      cameras: ["straight product packshot", "macro texture swatch crop", "three-quarter bottle arrangement", "label-readable 70mm view"],
      lighting: ["clean lab softbox", "controlled glass reflection", "bright hygienic top light"],
      poses: ["bottle centered with label clear", "jar open with texture visible", "dropper angled above swatch", "packaging and product aligned"]
    },
    beauty_gloss_editorial: {
      scenes: ["polished reflective surface", "color swatch acrylic", "gloss black vanity", "magazine beauty tabletop", "soft mirror reflection"],
      cameras: ["close cosmetic geometry frame", "macro shade swatch crop", "front label product lens", "diagonal editorial arrangement"],
      lighting: ["crisp frontal beauty light", "controlled specular highlight", "soft colored reflection"],
      poses: ["tube angled with cap visible", "compact open cleanly", "lipstick bullet upright", "shade swatches beside product"]
    },
    beauty_ingredient_natural: {
      scenes: ["clean botanical tray", "fresh water surface", "sunlit bathroom stone", "sage-toned vanity", "ingredient-and-packaging tabletop"],
      cameras: ["three-quarter packaging view", "macro cream texture crop", "ingredient scale close-up", "label-readable bottle angle"],
      lighting: ["soft natural daylight", "fresh water reflection", "gentle bathroom window light"],
      poses: ["package beside ingredient hint", "texture swatch near jar", "pump/dropper in use", "front label with soft botanical edge"]
    },
    beauty_luxury_fragrance: {
      scenes: ["smoky glass plinth", "champagne reflective surface", "black velvet tray", "warm amber backlight", "minimal gift vanity"],
      cameras: ["bottle silhouette front view", "cap and atomizer macro crop", "three-quarter glass refraction angle", "negative-space luxury frame"],
      lighting: ["low-key glass highlight", "warm rim light", "controlled premium reflection"],
      poses: ["bottle upright centered", "cap placed beside bottle", "box and bottle staged", "spray-nozzle detail angle"]
    },
    home_warm_living: {
      scenes: ["tidy living room sofa", "warm bedroom corner", "linen-covered bed", "oak side table", "sunlit family room"],
      cameras: ["room-scale three-quarter view", "material texture close crop", "front use-case frame", "scale-revealing lifestyle angle"],
      lighting: ["warm window light", "soft home ambient light", "gentle afternoon shadow"],
      poses: ["product neatly arranged in use", "folded textile detail", "hand-scale interaction", "room context with product dominant"]
    },
    home_japanese_wood: {
      scenes: ["pale wood floor", "off-white tatami-like surface", "orderly shelf wall", "linen curtain corner", "minimal entryway bench"],
      cameras: ["straight orderly composition", "low room-scale product angle", "top-down organization view", "texture close crop"],
      lighting: ["natural daylight", "soft wood-toned bounce", "quiet low-contrast shadow"],
      poses: ["product aligned with storage grid", "use state opened cleanly", "material edge visible", "negative-space product placement"]
    },
    home_modern_minimal: {
      scenes: ["clean architectural wall", "stone countertop", "charcoal-and-white room set", "metal line interior", "modern appliance corner"],
      cameras: ["straight vertical architecture frame", "three-quarter product-in-room view", "material edge crop", "centered premium product view"],
      lighting: ["controlled architectural shadow", "large softbox with crisp edge", "cool balanced interior light"],
      poses: ["product centered in realistic room scale", "functional use angle", "surface and edge detail", "minimal prop alignment"]
    },
    home_functional_storage: {
      scenes: ["open cabinet organization", "clean laundry shelf", "white utility tabletop", "transparent bin arrangement", "before-use tidy corner"],
      cameras: ["front compartment view", "top-down capacity view", "hand-scale use crop", "side profile structure angle"],
      lighting: ["bright practical soft light", "clear hygienic daylight", "low-shadow readability light"],
      poses: ["compartments visible", "drawer/bin partly opened", "items neatly sorted", "handle or mechanism shown"]
    },
    digital_dark_tech: {
      scenes: ["graphite reflective slab", "black glass desktop", "cool neon edge surface", "dark metal riser", "performance tech bench"],
      cameras: ["low hero product angle", "macro port/button crop", "three-quarter industrial design view", "screen-geometry front view"],
      lighting: ["precise rim light", "cool strip highlight", "low-key metal reflection"],
      poses: ["product angled to reveal ports", "screen or control face visible", "accessory staged in line", "edge profile emphasized"]
    },
    digital_clean_white: {
      scenes: ["seamless white sweep", "light gray reflective floor", "white acrylic riser", "soft shadow product table", "clean appliance plinth"],
      cameras: ["straight centered packshot", "three-quarter structure view", "macro interface crop", "side profile scale angle"],
      lighting: ["large clean softbox", "controlled reflection", "even white-field retouching"],
      poses: ["centered product only", "front controls readable", "ports/buttons visible", "accessories aligned neatly"]
    },
    digital_lifestyle_desk: {
      scenes: ["tidy oak desk", "modern home-office corner", "keyboard-and-notebook setup", "soft monitor glow desk", "clean productivity shelf"],
      cameras: ["50mm desk-use view", "hand-scale interaction crop", "three-quarter product angle", "top-down setup frame"],
      lighting: ["soft desk daylight", "balanced screen glow", "clean office ambient light"],
      poses: ["product in active desk use", "hand reaching naturally", "cable discipline visible", "accessories spaced cleanly"]
    },
    digital_smart_home: {
      scenes: ["modern kitchen counter", "clean bathroom shelf", "living room smart corner", "control-panel close context", "warm wood appliance nook"],
      cameras: ["room-scale use view", "control-panel close crop", "three-quarter appliance angle", "family-scale product frame"],
      lighting: ["warm home daylight", "soft practical interior light", "clean panel highlight"],
      poses: ["product installed or placed naturally", "panel readable", "hand-scale interaction", "use context visible"]
    },
    food_appetizing_closeup: {
      scenes: ["warm tabletop serving", "macro texture plate", "fresh ingredient board", "clean snack arrangement", "soft kitchen counter"],
      cameras: ["macro bite-texture crop", "45-degree tabletop view", "front pack-and-food frame", "overhead ingredient rhythm"],
      lighting: ["warm appetizing side light", "fresh bright kitchen light", "soft highlight on texture"],
      poses: ["food texture close and accurate", "package beside real serving", "ingredients arranged cleanly", "steam/condensation only if truthful"]
    },
    food_origin_fresh: {
      scenes: ["fresh produce surface", "cold-chain ice cue", "sunlit origin table", "clean water freshness setup", "natural ingredient crate"],
      cameras: ["front packaging trust view", "macro freshness detail", "three-quarter ingredient scene", "top-down origin arrangement"],
      lighting: ["natural daylight", "fresh cool reflection", "clear clean highlight"],
      poses: ["package integrity visible", "ingredient scale shown", "water or ice cue restrained", "freshness detail near product"]
    },
    food_clean_packaging: {
      scenes: ["neat pantry shelf", "white kitchen counter", "front-facing package row", "soft breakfast tabletop", "clean retail display surface"],
      cameras: ["label-readable front view", "three-quarter package group", "top-down daily-use layout", "macro seal/detail crop"],
      lighting: ["bright packaging light", "clean kitchen daylight", "low-shadow label clarity"],
      poses: ["package centered and readable", "packs aligned with depth", "daily-use serving hint", "seal or nutrition panel angled"]
    },
    food_festival_gift: {
      scenes: ["premium gift-box tabletop", "restrained red-gold surface", "deep green holiday set", "warm wood gift counter", "cream festive plinth"],
      cameras: ["front gift-box structure view", "contents reveal angle", "three-quarter premium arrangement", "macro gift material crop"],
      lighting: ["warm premium side light", "controlled gold highlight", "soft celebratory glow"],
      poses: ["box opened cleanly", "contents visible without exaggeration", "ribbon or package detail", "gift set aligned symmetrically"]
    },
    sports_performance: {
      scenes: ["gym floor line", "track-side concrete", "training studio mat", "urban court surface", "dynamic shadow wall"],
      cameras: ["low action-ready angle", "full-body performance crop", "material or support detail crop", "three-quarter movement frame"],
      lighting: ["crisp athletic rim light", "harder daylight contrast", "clean high-speed studio light"],
      poses: ["stride or lunge pose", "supportive structure under movement", "zip/seam/detail visible", "equipment-scale context"]
    },
    sports_outdoor_field: {
      scenes: ["trail field test", "campsite gear surface", "park grass slope", "wet stone path", "outdoor equipment bench"],
      cameras: ["field-test 35mm framing", "low rugged detail angle", "three-quarter use context", "macro strap/pocket crop"],
      lighting: ["practical outdoor daylight", "overcast utility light", "warm campsite side light"],
      poses: ["walking trail action", "strap or zipper adjusted", "product planted on rugged surface", "weatherproof detail shown"]
    },
    sports_yoga_clean: {
      scenes: ["airy yoga studio", "sage mat floor", "sunlit wellness room", "light curtain studio", "clean stretch area"],
      cameras: ["50mm calm body frame", "support or material crop", "mat-level product angle", "balanced full-body composition"],
      lighting: ["soft window daylight", "low-contrast wellness light", "clean high-key studio"],
      poses: ["controlled stretch pose", "standing relaxed posture", "comfort/support detail", "product placed or worn cleanly"]
    },
    sports_camping_gear: {
      scenes: ["tidy campsite table", "tent-side ground cloth", "forest-green gear surface", "warm lantern setup", "camp kitchen bench"],
      cameras: ["setup-revealing wide crop", "hand-scale function angle", "macro buckle/material crop", "three-quarter gear arrangement"],
      lighting: ["warm practical lantern light", "natural campsite daylight", "controlled rugged shadow"],
      poses: ["product assembled clearly", "hand using mechanism", "gear staged with sparse context", "material durability angle"]
    },
    jewelry_macro_luxury: {
      scenes: ["black velvet surface", "warm stone jewelry tray", "pearl-white plinth", "champagne mirror slab", "ruby-toned accent surface"],
      cameras: ["85-100mm macro feeling", "gemstone clarity crop", "metal curve side angle", "scale-on-hand close frame"],
      lighting: ["precise sparkle highlight", "soft luxury rim light", "controlled metal reflection"],
      poses: ["piece centered with clasp visible", "ring/chain angled to light", "scale-on-hand if useful", "gift-box reveal detail"]
    },
    jewelry_oriental_gift: {
      scenes: ["warm wood gift tray", "paper texture surface", "jade-toned plinth", "porcelain-white box", "cinnabar restrained accent"],
      cameras: ["symmetrical gift composition", "macro metal-and-stone crop", "front gift-box reveal", "70mm premium product view"],
      lighting: ["quiet side light", "warm refined highlight", "soft cultural restraint"],
      poses: ["jewelry placed in gift box", "piece aligned with paper texture", "scale detail shown", "box and product balanced"]
    },
    jewelry_daily_wear: {
      scenes: ["soft skin-scale surface", "soft hand/wrist surface", "taupe vanity table", "daily commute accessory tray", "window-light jewelry tray"],
      cameras: ["scale-on-body close frame", "50mm daily-wear crop", "macro clasp/detail angle", "three-quarter accessory view"],
      lighting: ["soft daylight", "gentle skin-safe highlight", "low-contrast premium light"],
      poses: ["worn on neck/hand/wrist", "piece held lightly", "clasp or chain detail visible", "daily outfit pairing"]
    },
    auto_clean_detail: {
      scenes: ["white studio car-detail surface", "dashboard close-up crop", "black rubber mat texture", "silver utility tabletop", "installation hardware tray"],
      cameras: ["macro connector detail", "front structure view", "three-quarter installation angle", "hand-scale product crop"],
      lighting: ["clear technical softbox", "controlled chrome highlight", "low-shadow inspection light"],
      poses: ["ports or clips visible", "texture and seams shown", "product centered with hardware", "installation-facing side view"]
    },
    auto_scene_install: {
      scenes: ["clean dashboard context", "car seat installation area", "trunk organization scene", "center-console close-up", "windshield mount context"],
      cameras: ["real in-car use angle", "hand-scale installation crop", "three-quarter mounted view", "front compatibility frame"],
      lighting: ["soft car-window daylight", "clean interior ambient light", "controlled dashboard highlight"],
      poses: ["product installed in correct position", "hand adjusting naturally", "before-use mounting angle", "function interface visible"]
    },
    auto_tech_black: {
      scenes: ["dark reflective dashboard surface", "graphite tech tabletop", "black glass car-console set", "rim-lit product plinth", "gold accent utility surface"],
      cameras: ["low tech hero angle", "macro button/display crop", "three-quarter smart-device view", "front interface frame"],
      lighting: ["black-gold rim light", "cool electric accent", "controlled metal reflection"],
      poses: ["display/buttons visible", "product angled to show ports", "mount/accessory aligned", "edge profile emphasized"]
    }
  };

  const visual = byId[id] ?? {
    scenes: ["style-specific product surface", "category use context", "controlled lifestyle set", "material-led tabletop"],
    cameras: ["product-first commercial framing", "clear front or three-quarter view", "scale-revealing use angle", "macro material crop"],
    lighting: ["professional ecommerce lighting", "controlled shadows", "clean retouching"],
    poses: ["product-first composition", "scale-revealing use case", "inspection-friendly angle"]
  };

  return {
    scenes: visual.scenes,
    cameras: visual.cameras,
    lighting: visual.lighting,
    poses: visual.poses,
    palettes,
    commerceIntensity: visual.commerceIntensity ?? "balanced Tmall marketplace style with product identity first",
    forbiddenElements: [...sharedForbidden, ...(visual.forbiddenElements ?? [])]
  };
}
