import { describe, expect, it } from "vitest";
import {
  platformSpecPresets,
  platforms,
  imageTypesForCategory,
  hasProductDetailProfile,
  resolveAllowedSize,
  resolveProviderSizeForTarget,
  specsForPlatform
} from "../../src/domain/apparel/options";
import { buildApparelPromptRecipe } from "../../src/domain/prompts/apparelRecipe";

describe("apparel image prompt", () => {
  it("uses category-specific main image type labels", () => {
    const mainTypes = specsForPlatform("taobao").find((item) => item.id === "taobao-main-square")!.imageTypes;
    const homeTypes = imageTypesForCategory(mainTypes, "home", "kitchenware");
    const labels = homeTypes.map((item) => item.label);

    expect(labels).toContain("厨具餐具角度补充");
    expect(labels).toContain("厨具餐具场景主图");
    expect(labels).not.toContain("完整穿搭图");
    expect(homeTypes).toHaveLength(6);
  });

  it("uses generic ecommerce image type labels for the general category", () => {
    const mainTypes = specsForPlatform("taobao").find((item) => item.id === "taobao-main-square")!.imageTypes;
    const detailTypes = specsForPlatform("taobao").find((item) => item.id === "taobao-detail-mobile")!.imageTypes;
    const generalMainLabels = imageTypesForCategory(mainTypes, "home", "general_ecommerce").map((item) => item.label);
    const generalDetailLabels = imageTypesForCategory(detailTypes, "home", "general_ecommerce").map((item) => item.label);

    expect(generalMainLabels).toContain("通用商品场景主图");
    expect(generalMainLabels).toContain("完整通用商品图");
    expect(generalDetailLabels).toContain("通用商品页头海报");
    expect(generalDetailLabels).toContain("资料图美化");
    expect(generalMainLabels).not.toContain("居家场景主图");
    expect(generalDetailLabels).not.toContain("家居页头海报");
  });

  it("maps only supported provider sizes", () => {
    expect(resolveAllowedSize("square").providerSize).toBe("1024x1024");
    expect(resolveAllowedSize("portrait").providerSize).toBe("1024x1536");
    expect(resolveAllowedSize("tall").providerSize).toBe("2160x3840");
    expect(resolveAllowedSize("999x999").providerSize).toBe("1024x1536");
    expect(resolveProviderSizeForTarget(800, 800).providerSize).toBe("1024x1024");
    expect(resolveProviderSizeForTarget(1080, 1920).providerSize).toBe("2160x3840");
  });

  it("covers domestic, content, cross-border, and free commerce platforms with main and detail-like specs", () => {
    expect(platforms).toEqual([
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
    ]);

    for (const platform of platforms) {
      const specs = specsForPlatform(platform);
      expect(specs.some((item) => item.assetGroup === "main")).toBe(true);
      expect(specs.some((item) => item.assetGroup === "detail" || item.imageTypes.some((type) => type.id.includes("detail")))).toBe(true);
    }

    expect(platformSpecPresets.some((item) => item.platform === "dewu" && item.sourceNote.includes("待商家后台校准"))).toBe(true);
    expect(specsForPlatform("amazon").some((item) => item.label.includes("2000x2000"))).toBe(true);
    expect(specsForPlatform("free").some((item) => item.sourceNote.includes("UI默认使用自定义尺寸"))).toBe(true);
  });

  it("contains product fidelity and compliance constraints", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "douyin",
      category: "bags",
      scene: "catalog",
      sceneVariant: "magazine_cover",
      size: "tall",
      modelProfile: "no_face",
      specId: "douyin-video-cover",
      imageTypeId: "feed_card",
      targetWidth: 1080,
      targetHeight: 1920,
      modelMode: "model"
    });

    expect(recipe.providerPrompt).toContain("original color");
    expect(recipe.providerPrompt).toContain("silhouette");
    expect(recipe.providerPrompt).toContain("shoulder straps");
    expect(recipe.providerPrompt).toContain("zipper");
    expect(recipe.providerPrompt).toContain("leather/canvas/nylon texture");
    expect(recipe.providerPrompt).toContain("Do not add text");
    expect(recipe.providerPrompt).toContain("watermark");
    expect(recipe.providerPrompt).toContain("QR code");
    expect(recipe.providerPrompt).toContain("Business surface");
    expect(recipe.providerPrompt).toContain("Platform specification");
    expect(recipe.providerPrompt).toContain("Image type");
    expect(recipe.providerPrompt).toContain("Hot-item reference guidance");
    expect(recipe.providerPrompt).toContain("Hot-item platform mechanics for 抖音");
    expect(recipe.providerPrompt).toContain("Category conversion focus: emphasize bag silhouette");
    expect(recipe.providerPrompt).toContain("Role constraint: scene/lifestyle or cover image");
    expect(recipe.providerPrompt).toContain("Variation strength: bold");
    expect(recipe.providerPrompt).toContain("Generate the uploaded bag naturally hand-carried");
    expect(recipe.providerPrompt).toContain("Platform compliance constraints");
    expect(recipe.providerPrompt).not.toContain("Suite platform tone");
    expect(recipe.providerPrompt).not.toContain("Suite role:");
    expect(recipe.negativePrompt).toContain("discount badge");
    expect(recipe.negativePrompt).toContain("old campaign banner");
    expect(recipe.target).toMatchObject({ width: 2160, height: 3840 });
  });

  it("uses product-only direction when model mode disables models", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "white",
      sceneVariant: "pure_white",
      size: "square",
      modelProfile: "asian_female",
      specId: "taobao-main-square",
      imageTypeId: "white_main",
      targetWidth: 800,
      targetHeight: 800,
      modelMode: "no_model"
    });

    expect(recipe.providerPrompt).toContain("no human model");
    expect(recipe.userVisibleSummary).toContain("仅商品展示");
  });

  it("adds person consistency guidance when custom models are selected", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "modern_studio",
      size: "square",
      modelProfile: "asian_female",
      specId: "taobao-main-square",
      imageTypeId: "studio_main",
      targetWidth: 800,
      targetHeight: 800,
      modelMode: "model",
      customModelId: "model-1",
      customModelName: "Lookbook model"
    });

    expect(recipe.providerPrompt).toContain("face identity reference only");
    expect(recipe.providerPrompt).toContain("face shape");
    expect(recipe.providerPrompt).toContain("body type, age range, ethnicity style, hairstyle direction");
    expect(recipe.providerPrompt).toContain("The uploaded bag image is the source of truth");
  });

  it("keeps studio main images inside a controlled photography studio", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "modern_studio",
      size: "square",
      modelProfile: "asian_female",
      specId: "taobao-main-square",
      imageTypeId: "studio_main",
      targetWidth: 1200,
      targetHeight: 1200,
      modelMode: "model"
    });

    expect(recipe.providerPrompt).toContain("controlled studio set");
    expect(recipe.providerPrompt).toContain("pure or near-solid neutral backdrop");
    expect(recipe.providerPrompt).toContain("Do not create outdoor streets");
    expect(recipe.providerPrompt).toContain("Studio-main hard boundary");
    expect(recipe.providerPrompt).not.toContain("cafe window");
  });

  it("adds structured model casting details to prompts", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "kids",
      scene: "studio",
      sceneVariant: "modern_studio",
      size: "portrait",
      modelProfile: "child",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_model_fit",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      modelGender: "boy",
      modelAgeRange: "child_7_10",
      modelSkinTone: "latino_hispanic",
      modelHairStyle: "short"
    });

    expect(recipe.providerPrompt).toContain("Model type: 男童");
    expect(recipe.providerPrompt).toContain("Age impression: 7-10岁");
    expect(recipe.providerPrompt).toContain("Model ethnicity style: 拉丁/西语裔");
    expect(recipe.providerPrompt).toContain("Latino / Hispanic fashion ecommerce model");
    expect(recipe.providerPrompt).toContain("Hairstyle: 短发");
    expect(recipe.providerPrompt).toContain("natural body/bag proportions");
  });

  it("turns outfit-combination upload roles into hard prompt rules", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "modern_studio",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-main-square",
      imageTypeId: "studio_main",
      targetWidth: 1200,
      targetHeight: 1200,
      modelMode: "model",
      productGroupingMode: "outfit_combo",
      productReferenceRoles: ["top_outerwear", "bottom", "shoes", "bag"]
    });

    expect(recipe.providerPrompt).toContain("Outfit-combination rule");
    expect(recipe.providerPrompt).toContain("reference image 1: styling support item for a bag outfit");
    expect(recipe.providerPrompt).toContain("reference image 2: lower-body styling support");
    expect(recipe.providerPrompt).toContain("reference image 3: shoe styling support");
    expect(recipe.providerPrompt).toContain("reference image 4: bag");
    expect(recipe.providerPrompt).toContain("Every uploaded outfit item is required");
    expect(recipe.providerPrompt).toContain("Place each item on the correct body part");
  });

  it("adds top seller style presets and optional user prompt", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "catalog",
      sceneVariant: "magazine_cover",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_header_poster",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      topSellerStyleId: "old_money",
      userPrompt: "背景更像高端女包详情页，光线更柔和"
    });

    expect(recipe.providerPrompt).toContain("Top merchant hit-style preset: 老钱质感");
    expect(recipe.providerPrompt).toContain("STYLE OVERRIDE");
    expect(recipe.providerPrompt).toContain("old money quiet luxury for bags");
    expect(recipe.providerPrompt).toContain("Structured style variables for 老钱质感");
    expect(recipe.providerPrompt).toContain("Selected-style dominance");
    expect(recipe.providerPrompt).toContain("commerce intensity");
    expect(recipe.providerPrompt).toContain("printed graphics");
    expect(recipe.providerPrompt).toContain("must never redesign");
    expect(recipe.negativePrompt).toContain("missing original color");
    expect(recipe.providerPrompt).toContain("Optional merchant extra instruction");
    expect(recipe.providerPrompt).toContain("背景更像高端女包详情页");
  });

  it("adds bag diversity guidance to default bag scenes", () => {
    const women = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "street",
      sceneVariant: "urban_highstreet",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model"
    });
    const men = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "street",
      sceneVariant: "urban_highstreet",
      size: "portrait",
      modelProfile: "asian_male",
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model"
    });

    expect(women.providerPrompt).toContain("Bag diversity guidance (women");
    expect(women.providerPrompt).toContain("箱包封面强差异");
    expect(women.providerPrompt).toContain("rotate scene families");
    expect(women.providerPrompt).toContain("Do not copy faces, logos, text, watermarks");
    expect(men.providerPrompt).toContain("Bag diversity guidance (men");
    expect(men.providerPrompt).toContain("箱包封面强差异");
    expect(men.providerPrompt).not.toContain("women apparel");
  });

  it("does not mix default reference guidance into explicitly selected styles", () => {
    const topSeller = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "street",
      sceneVariant: "urban_highstreet",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model",
      topSellerStyleId: "old_money"
    });
    const custom = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "street",
      sceneVariant: "urban_highstreet",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model",
      customStylePrompts: ["Saved custom style: warm window light and soft home mood."]
    });

    expect(topSeller.providerPrompt).toContain("Top merchant hit-style preset: 老钱质感");
    expect(topSeller.providerPrompt).toContain("Classic bag style playbook for 老钱质感");
    expect(topSeller.providerPrompt).not.toContain("Bag diversity guidance");
    expect(custom.providerPrompt).toContain("Custom reference style reconstruction");
    expect(custom.providerPrompt).toContain("Custom reference style controls the ecommerce scene");
    expect(custom.providerPrompt).toContain("Custom reference style scene direction");
    expect(custom.providerPrompt).not.toContain("Create an outdoor street-style ecommerce image");
    expect(custom.providerPrompt).not.toContain("Bag diversity guidance");
    expect(custom.providerPrompt).not.toContain("Classic bag style playbook");
  });

  it("keeps strict white bag roles from scenic reference guidance", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "white",
      sceneVariant: "pure_white",
      size: "square",
      modelProfile: "asian_female",
      specId: "taobao-main-square",
      imageTypeId: "white_main",
      targetWidth: 800,
      targetHeight: 800,
      modelMode: "model"
    });

    expect(recipe.providerPrompt).toContain("Scene: 纯白底图");
    expect(recipe.providerPrompt).not.toContain("Bag diversity guidance");
    expect(recipe.providerPrompt).not.toContain("Classic bag style playbook");
  });

  it("keeps top seller style presets visually distinct", () => {
    const base = {
      platform: "taobao" as const,
      category: "men" as const,
      scene: "street" as const,
      sceneVariant: "urban_highstreet" as const,
      size: "portrait",
      modelProfile: "asian_male" as const,
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model" as const
    };

    const oldMoney = buildApparelPromptRecipe({ ...base, topSellerStyleId: "old_money" });
    const street = buildApparelPromptRecipe({ ...base, topSellerStyleId: "street_trend" });
    const outdoor = buildApparelPromptRecipe({ ...base, topSellerStyleId: "gorpcore" });

    expect(oldMoney.providerPrompt).toContain("marble corridor");
    expect(oldMoney.providerPrompt).toContain("Style-directed ecommerce scene controlled by 老钱质感");
    expect(oldMoney.providerPrompt).not.toContain("Scene: 街拍");
    expect(oldMoney.providerPrompt).toContain("STYLE SCENE MATRIX for 老钱质感 / scene");
    expect(oldMoney.providerPrompt).toContain("style boundary for 老钱质感");
    expect(oldMoney.providerPrompt).toContain("avoid youthful casual street");
    expect(oldMoney.providerPrompt).toContain("hand-carry");
    expect(oldMoney.providerPrompt).toContain("generic image type");
    expect(street.providerPrompt).toContain("lower angle 28-35mm");
    expect(street.providerPrompt).toContain("STYLE SCENE MATRIX for 高街潮流 / scene");
    expect(street.providerPrompt).toContain("style boundary for 高街潮流");
    expect(street.providerPrompt).toContain("avoid premium marble");
    expect(street.providerPrompt).toContain("bag-forward stance");
    expect(outdoor.providerPrompt).toContain("rocky path");
    expect(outdoor.providerPrompt).toContain("STYLE SCENE MATRIX for 山系机能 / scene");
    expect(outdoor.providerPrompt).toContain("style boundary for 山系机能");
    expect(outdoor.providerPrompt).toContain("avoid office facade");
    expect(outdoor.providerPrompt).toContain("backpack carrying");
  });

  it("rejects flat back-to-wall scenes for men classic bag styles", () => {
    const base = {
      platform: "taobao" as const,
      category: "men" as const,
      scene: "street" as const,
      sceneVariant: "urban_highstreet" as const,
      size: "portrait",
      modelProfile: "asian_male" as const,
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model" as const
    };

    const commute = buildApparelPromptRecipe({ ...base, topSellerStyleId: "urban_commute" });
    const dopamine = buildApparelPromptRecipe({ ...base, topSellerStyleId: "dopamine_sweet" });

    expect(commute.providerPrompt).toContain("Flat-wall rejection for selected classic bag style");
    expect(commute.providerPrompt).toContain("office atrium walkway");
    expect(commute.providerPrompt).not.toMatch(/scene options: [^.;]*concrete wall/);
    expect(dopamine.providerPrompt).toContain("color-block studio corner");
    expect(dopamine.providerPrompt).not.toMatch(/scene options: [^.;]*color-block wall/);
    expect(dopamine.providerPrompt).toContain("no flat color-wall standing pose");
  });

  it("forces similar apparel styles away from the same generic street wall", () => {
    const base = {
      platform: "taobao" as const,
      category: "men" as const,
      scene: "street" as const,
      sceneVariant: "urban_highstreet" as const,
      size: "portrait",
      modelProfile: "asian_male" as const,
      specId: "taobao-long-main",
      imageTypeId: "scene_main",
      targetWidth: 800,
      targetHeight: 1200,
      modelMode: "model" as const
    };

    const koreanRelaxed = buildApparelPromptRecipe({ ...base, topSellerStyleId: "korean_relaxed" });
    const minimalPremium = buildApparelPromptRecipe({ ...base, topSellerStyleId: "minimal_premium" });

    expect(koreanRelaxed.providerPrompt).toContain("cafe window");
    expect(koreanRelaxed.providerPrompt).toContain("STYLE SCENE MATRIX for 韩系松弛 / scene");
    expect(koreanRelaxed.providerPrompt).toContain("style boundary for 韩系松弛");
    expect(koreanRelaxed.providerPrompt).toContain("avoid marble corridor");
    expect(minimalPremium.providerPrompt).toContain("seamless white sweep");
    expect(minimalPremium.providerPrompt).toContain("STYLE SCENE MATRIX for 极简高级 / scene");
    expect(minimalPremium.providerPrompt).toContain("scene main is reinterpreted as an ultra-minimal studio scene");
    expect(minimalPremium.providerPrompt).toContain("style boundary for 极简高级");
    expect(minimalPremium.providerPrompt).toContain("avoid outdoor street");
    expect(minimalPremium.providerPrompt).toContain("generic pale exterior wall");
  });

  it("keeps strict white and material detail roles from being overruled by style scenes", () => {
    const white = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "white",
      sceneVariant: "pure_white",
      size: "portrait",
      modelProfile: "asian_male",
      specId: "taobao-main-square",
      imageTypeId: "white_main",
      targetWidth: 800,
      targetHeight: 800,
      modelMode: "model",
      topSellerStyleId: "street_trend"
    });
    const detail = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model",
      topSellerStyleId: "old_money"
    });

    expect(white.providerPrompt).toContain("Scene: 纯白底图");
    expect(white.providerPrompt).toContain("STYLE SCENE MATRIX for 高街潮流 / white");
    expect(white.providerPrompt).toContain("preserve inspection clarity first");
    expect(detail.providerPrompt).toContain("Scene: 室内棚拍");
    expect(detail.providerPrompt).toContain("STYLE SCENE MATRIX for 老钱质感 / detail");
    expect(detail.providerPrompt).toContain("preserve inspection clarity first");
    expect(white.providerPrompt).toContain("Visual variation card for 高街潮流");
    expect(white.providerPrompt).toContain("commerce role: white/SKU image preserving compliance");
    expect(white.providerPrompt).toContain("platform-safe white or light-gray surface");
    expect(detail.providerPrompt).toContain("commerce role: material/detail image varying surface");
    expect(detail.providerPrompt).toContain("do not force complex scenery");
  });

  it("builds different visual variation cards for the same classic style across planned roles", () => {
    const base = {
      platform: "taobao" as const,
      category: "men" as const,
      scene: "studio" as const,
      sceneVariant: "modern_studio" as const,
      size: "portrait",
      modelProfile: "asian_male" as const,
      specId: "taobao-detail-mobile",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model" as const,
      topSellerStyleId: "old_money",
      styleVariationTotal: 4
    };

    const poster = buildApparelPromptRecipe({ ...base, imageTypeId: "detail_header_poster", styleVariationIndex: 0 });
    const scene = buildApparelPromptRecipe({ ...base, imageTypeId: "scene_main", styleVariationIndex: 1 });
    const detail = buildApparelPromptRecipe({ ...base, imageTypeId: "detail_texture", styleVariationIndex: 2, modelMode: "no_model", modelProfile: "product_only" });
    const fit = buildApparelPromptRecipe({ ...base, imageTypeId: "detail_model_fit", styleVariationIndex: 3 });

    expect(poster.providerPrompt).toContain("Visual variation card for 老钱质感 1/4");
    expect(scene.providerPrompt).toContain("Visual variation card for 老钱质感 2/4");
    expect(detail.providerPrompt).toContain("Visual variation card for 老钱质感 3/4");
    expect(fit.providerPrompt).toContain("Visual variation card for 老钱质感 4/4");
    expect(poster.providerPrompt).toContain("commerce role: detail header poster");
    expect(scene.providerPrompt).toContain("commerce role: scene image proving the selected style family");
    expect(detail.providerPrompt).toContain("commerce role: material/detail image varying surface");
    expect(fit.providerPrompt).toContain("commerce role: fit or wearing-effect image");
    expect(scene.providerPrompt).toContain("forbidden repetition: do not reuse the same wall");
    expect(poster.providerPrompt).toContain("Single-direction rule");
    expect(poster.providerPrompt).toContain("Detail-page suite rule");
  });

  it("adds specific detail-page directions for selected detail modules", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model"
    });

    expect(recipe.providerPrompt).toContain("包身纹理细节");
    expect(recipe.providerPrompt).toContain("zoom in on real leather");
    expect(recipe.providerPrompt).toContain("not a full outfit image");
    expect(recipe.providerPrompt).toContain("Role constraint: detail image");
    expect(recipe.providerPrompt).toContain("Variation strength: safe");
  });

  it("uses category-specific detail module directions for bags", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "shoes",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model"
    });

    expect(recipe.providerPrompt).toContain("包身材质特写");
    expect(recipe.providerPrompt).toContain("bag material");
    expect(recipe.providerPrompt).toContain("zipper");
    expect(recipe.providerPrompt).toContain("Do not turn it into a full-body outfit image");
  });

  it("does not expose unsupported craft detail modules", () => {
    const detailTypes = specsForPlatform("taobao").find((item) => item.id === "taobao-detail-mobile")!.imageTypes;
    const baseTypeIds = detailTypes.map((item) => item.id);
    const bagTypeIds = imageTypesForCategory(detailTypes, "bags").map((item) => item.id);

    expect(baseTypeIds).not.toContain("detail_craft");
    expect(bagTypeIds).not.toContain("detail_craft");
  });

  it("uses category-specific detail module directions for beauty products", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "beauty",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model"
    });

    expect(recipe.providerPrompt).toContain("膏体质地特写");
    expect(recipe.providerPrompt).toContain("cosmetic formula texture close-up");
    expect(recipe.providerPrompt).toContain("swatch");
    expect(recipe.providerPrompt).toContain("exact cosmetic packaging");
  });

  it("uses product-subcategory detail modules for watches and eyewear", () => {
    const detailTypes = specsForPlatform("taobao").find((item) => item.id === "taobao-detail-mobile")!.imageTypes;
    const watchTypes = imageTypesForCategory(detailTypes, "jewelry", "watch");
    const glassesTypes = imageTypesForCategory(detailTypes, "jewelry", "glasses");

    expect(watchTypes.find((item) => item.id === "detail_texture")?.label).toBe("表盘镜面特写");
    expect(watchTypes.find((item) => item.id === "detail_craft")).toBeUndefined();
    expect(glassesTypes.find((item) => item.id === "detail_texture")?.label).toBe("镜片框型特写");
    expect(glassesTypes.find((item) => item.id === "detail_craft")).toBeUndefined();
  });

  it("has product-level profiles for all expanded commerce categories", () => {
    const expandedCategoryIds = [
      "skincare", "makeup", "fragrance", "personal_care",
      "diaper", "feeding", "stroller", "toys_early",
      "bedding", "furniture", "kitchenware", "storage_cleaning",
      "phone_tablet", "computer_office", "camera_audio", "home_appliance",
      "snacks", "fresh", "grain_oil", "tea_drink",
      "sportswear", "fitness", "outdoor", "cycling_fishing",
      "necklace_ring", "watch", "glasses", "fashion_accessory",
      "car_interior", "car_care", "car_electronics", "auto_parts"
    ];

    expect(expandedCategoryIds.filter((id) => !hasProductDetailProfile(id))).toEqual([]);
  });

  it("uses product-subcategory prompt directions for watches", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "jewelry",
      productCategoryId: "watch",
      productCategoryLabel: "腕表",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model"
    });

    expect(recipe.providerPrompt).toContain("Specific product subcategory: 腕表");
    expect(recipe.providerPrompt).toContain("表盘镜面特写");
    expect(recipe.providerPrompt).toContain("watch case shape");
    expect(recipe.providerPrompt).toContain("dial");
    expect(recipe.providerPrompt).toContain("bezel");
    expect(recipe.providerPrompt).not.toContain("表冠表扣细节");
  });

  it("allows detail header posters to generate typography directly", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "catalog",
      sceneVariant: "magazine_cover",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_header_poster",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      posterTemplateId: "side-editorial",
      posterTitle: "通勤挺括感",
      posterSubtitle: "轻盈容量 通勤可背",
      posterBullets: ["包型利落", "分区有序"]
    });

    expect(recipe.providerPrompt).toContain("detail-page first-screen advertising poster image");
    expect(recipe.providerPrompt).toContain("rich brand-campaign mood");
    expect(recipe.providerPrompt).toContain("place generated typography in a clean low-detail side area");
    expect(recipe.providerPrompt).toContain("Generated poster typography requirement");
    expect(recipe.providerPrompt).toContain("Typography mood: content-commerce editorial");
    expect(recipe.providerPrompt).toContain("elegant fashion lettering");
    expect(recipe.providerPrompt).toContain("Font system:");
    expect(recipe.providerPrompt).toContain("open-source or system-safe Chinese font styles");
    expect(recipe.providerPrompt).toContain("通勤挺括感");
    expect(recipe.providerPrompt).toContain("Poster exception");
    expect(recipe.negativePrompt).not.toContain("text, watermark");
    expect(recipe.negativePrompt).toContain("misspelled text");
  });

  it("keeps detail header posters text-free when no merchant copy is provided", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "catalog",
      sceneVariant: "magazine_cover",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_header_poster",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      suiteRole: "detail_header"
    });

    expect(recipe.providerPrompt).toContain("detail-page first-screen poster image");
    expect(recipe.providerPrompt).toContain("Do not render text labels inside the generated image");
    expect(recipe.providerPrompt).not.toContain("Generated poster typography requirement");
    expect(recipe.providerPrompt).not.toContain("Poster exception");
    expect(recipe.negativePrompt).toContain("text, watermark");
  });

  it("allows normal detail module text only when module copy is enabled", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_model_fit",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      moduleCopy: {
        imageTypeId: "detail_model_fit",
        imageTypeLabel: "模特穿着展示",
        title: "上身显瘦",
        subtitle: "通勤日常都好穿",
        bullets: ["垂顺有型", "活动自在"],
        templateId: "clean-corner"
      }
    });

    expect(recipe.providerPrompt).toContain("Detail module text input is enabled for 模特穿着展示");
    expect(recipe.providerPrompt).toContain("Render this short Chinese ecommerce copy directly inside this detail module");
    expect(recipe.providerPrompt).toContain("上身显瘦");
    expect(recipe.providerPrompt).toContain("Text policy for this selected module");
    expect(recipe.providerPrompt).toContain("short, clean, correctly spelled Chinese typography is allowed and expected");
    expect(recipe.providerPrompt).not.toContain("Do not add text, watermark");
    expect(recipe.negativePrompt).not.toContain("text, watermark");
    expect(recipe.negativePrompt).toContain("misspelled text");
  });

  it("keeps normal detail modules text-free when module copy is not enabled", () => {
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model"
    });

    expect(recipe.providerPrompt).toContain("Image-type hard boundary: this is a bag material texture close-up");
    expect(recipe.providerPrompt).toContain("Do not add text");
    expect(recipe.providerPrompt).not.toContain("Detail module text input is enabled");
    expect(recipe.negativePrompt).toContain("text, watermark");
  });

  it("keeps main and detail image-type boundaries from bleeding into each other", () => {
    const white = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "white",
      sceneVariant: "pure_white",
      size: "square",
      modelProfile: "asian_male",
      specId: "taobao-main-square",
      imageTypeId: "white_main",
      targetWidth: 800,
      targetHeight: 800,
      modelMode: "model",
      topSellerStyleId: "street_trend"
    });
    const studio = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "studio",
      sceneVariant: "modern_studio",
      size: "square",
      modelProfile: "asian_male",
      specId: "taobao-main-square",
      imageTypeId: "studio_main",
      targetWidth: 800,
      targetHeight: 800,
      modelMode: "model",
      customStylePrompts: ["Uploaded reference style: cafe window, home sunlight and relaxed lifestyle scene."]
    });
    const poster = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "catalog",
      sceneVariant: "magazine_cover",
      size: "portrait",
      modelProfile: "asian_male",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_header_poster",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model"
    });
    const texture = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "studio",
      sceneVariant: "window_light",
      size: "portrait",
      modelProfile: "product_only",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "no_model",
      topSellerStyleId: "old_money"
    });

    expect(white.providerPrompt).toContain("strict white-background commerce image");
    expect(white.providerPrompt).toContain("do not add props, scenes, decorative set pieces, text");
    expect(studio.providerPrompt).toContain("indoor photography-studio main image");
    expect(studio.providerPrompt).toContain("Do not generate street scenes, cafes, home rooms");
    expect(poster.providerPrompt).toContain("detail-page header poster");
    expect(poster.providerPrompt).toContain("Do not add any title, selling-point typography");
    expect(poster.providerPrompt).not.toContain("Short generated Chinese title and selling-point typography is allowed");
    expect(texture.providerPrompt).toContain("bag material texture close-up");
    expect(texture.providerPrompt).toContain("Do not turn it into a full-body outfit image");
  });

  it("keeps poster typography moods platform and category aware", () => {
    const menRecipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "men",
      scene: "catalog",
      sceneVariant: "magazine_cover",
      size: "portrait",
      modelProfile: "asian_male",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_header_poster",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      posterTitle: "通勤挺括感"
    });

    expect(menRecipe.providerPrompt).toContain("Typography mood: content-commerce editorial");
    expect(menRecipe.providerPrompt).toContain("structural and concise lettering");
  });
});
