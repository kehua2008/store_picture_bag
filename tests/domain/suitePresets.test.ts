import { describe, expect, it } from "vitest";
import { buildProductAnalysisDraft } from "../../src/domain/suites/productAnalysis";
import { buildSuiteCreativePlan } from "../../src/domain/suites/suiteCreativePlan";
import { buildSuitePlan, suitePresets } from "../../src/domain/suites/suitePresets";
import { buildApparelPromptRecipe } from "../../src/domain/prompts/apparelRecipe";

describe("commerce image suites", () => {
  it("builds 5/7/9 image suite plans for supported platforms", () => {
    expect(suitePresets.map((item) => item.id)).toEqual(["basic-5", "standard-7", "detail-9", "detail-basic-conversion", "detail-women-editorial", "detail-functional"]);
    expect(buildSuitePlan("taobao", "basic-5")).toHaveLength(5);
    expect(buildSuitePlan("taobao", "standard-7")).toHaveLength(7);
    expect(buildSuitePlan("taobao", "detail-9")).toHaveLength(9);
    expect(buildSuitePlan("douyin", "standard-7")[0]).toEqual(expect.objectContaining({ order: 1, role: "white_hero" }));
    expect(buildSuitePlan("taobao", "basic-5", "detail").map((item) => item.imageTypeId)).toEqual([
      "detail_header_poster",
      "detail_white_product",
      "detail_texture",
      "detail_model_fit"
    ]);
    expect(buildSuitePlan("taobao", "standard-7", "detail").map((item) => item.imageTypeId)).not.toContain("detail_craft");
    expect(buildSuitePlan("taobao", "detail-basic-conversion", "detail").map((item) => item.imageTypeId)).toEqual([
      "detail_header_poster",
      "detail_color_sku",
      "detail_model_fit",
      "detail_design_points",
      "detail_texture",
      "detail_craft",
      "detail_size_fit",
      "detail_header_poster"
    ]);
    expect(buildSuitePlan("taobao", "detail-basic-conversion", "detail").map((item) => item.label)).toEqual([
      "首屏海报",
      "多色SKU总览",
      "持包场景",
      "包型卖点",
      "包身细节",
      "五金工艺",
      "尺寸容量",
      "品质保养收尾"
    ]);
    expect(buildSuitePlan("taobao", "detail-basic-conversion", "detail")[1]).toEqual(expect.objectContaining({
      colorPolicy: "all_colors",
      modelPolicy: "never",
      visualMode: "product_only"
    }));
    expect(buildSuitePlan("taobao", "detail-basic-conversion", "detail")[2]).toEqual(expect.objectContaining({
      colorPolicy: "hero_color",
      modelPolicy: "required",
      visualMode: "model_scene"
    }));
    expect(buildSuitePlan("taobao", "detail-functional", "detail").map((item) => item.imageTypeId)).toContain("detail_craft");
    expect(buildSuitePlan("taobao", "detail-functional", "detail").map((item) => item.label)).toContain("五金工艺");
  });

  it("uses category-specific labels for detail suite modules", () => {
    const shoesPlan = buildSuitePlan("taobao", "basic-5", "detail", "shoes");
    const bagsPlan = buildSuitePlan("taobao", "basic-5", "detail", "bags");

    expect(shoesPlan.map((item) => item.label)).toContain("包身材质特写");
    expect(bagsPlan.map((item) => item.label)).toContain("包身材质特写");
    expect(shoesPlan.map((item) => item.imageTypeId)).not.toContain("detail_craft");
    expect(bagsPlan.map((item) => item.imageTypeId)).not.toContain("detail_craft");
  });

  it("uses product-subcategory labels for detail suite modules", () => {
    const watchPlan = buildSuitePlan("taobao", "basic-5", "detail", "jewelry", "watch");
    const glassesPlan = buildSuitePlan("taobao", "basic-5", "detail", "jewelry", "glasses");

    expect(watchPlan.map((item) => item.label)).toContain("表盘镜面特写");
    expect(glassesPlan.map((item) => item.label)).toContain("镜片框型特写");
    expect(watchPlan.map((item) => item.imageTypeId)).not.toContain("detail_craft");
    expect(glassesPlan.map((item) => item.imageTypeId)).not.toContain("detail_craft");
  });

  it("builds category-aware product analysis drafts", () => {
    const analysis = buildProductAnalysisDraft({ category: "men", categoryLabel: "男士通勤包", styleLabel: "平台标准棚拍" });

    expect(analysis.productNameZh).toBe("男士通勤包");
    expect(analysis.sellingPoints[0].title).toBe("包型利落");
    expect(analysis.productIdentityLock).toContain("bag silhouette");
  });

  it("adds suite role and product analysis to prompts without asking the model to render text", () => {
    const analysis = buildProductAnalysisDraft({ category: "women", categoryLabel: "女包", styleLabel: "高级画册" });
    const recipe = buildApparelPromptRecipe({
      platform: "taobao",
      category: "women",
      scene: "studio",
      sceneVariant: "minimal_solid",
      size: "portrait",
      modelProfile: "asian_female",
      specId: "taobao-detail-mobile",
      imageTypeId: "detail_texture",
      targetWidth: 790,
      targetHeight: 1200,
      modelMode: "model",
      suiteRole: "key_features",
      productAnalysis: analysis
    });

    expect(recipe.providerPrompt).toContain("Suite role: key feature base image");
    expect(recipe.providerPrompt).toContain("Product analysis");
    expect(recipe.providerPrompt).toContain("Do not render text labels inside the generated image");
    expect(recipe.providerPrompt).toContain("Product detail lock");
  });

  it("builds creative cards with per-image prompts, text layouts, references and masks", () => {
    const analysis = buildProductAnalysisDraft({
      category: "women",
      categoryLabel: "通勤托特包",
      styleLabel: "天猫质感",
      sourceFilenames: ["tote-front.jpg", "tote-back.jpg"]
    });
    const suiteItems = buildSuitePlan("taobao", "basic-5", "detail", "women", "tote_bag");
    const plan = buildSuiteCreativePlan({
      platform: "taobao",
      category: "women",
      surface: "detail",
      suiteItems,
      productAnalysis: analysis,
      userPrompt: "强调柔软保暖"
    });

    expect(plan.productUnderstanding.sourceImageSummary).toContain("tote-front.jpg");
    expect(plan.copyStrategy.sellingPointOrder).toContain("持包比例");
    expect(plan.items).toHaveLength(4);
    expect(plan.items[0]).toEqual(expect.objectContaining({
      role: "detail_header",
      imagePrompt: expect.stringContaining("Create")
    }));
    expect(plan.items[0].textLayout.renderMode).toBe("model_embedded");
    expect(plan.items[0].referenceStyleGroupName).toBe("箱包封面强差异");
    expect(plan.items[1].referenceStyleGroupName).not.toBe(plan.items[0].referenceStyleGroupName);
    expect(plan.items[0].imagePrompt).toContain("Bag diversity guidance (women");
    expect(plan.items[0].imagePrompt).toContain("rotate scene families");
    expect(plan.items[2].references.some((item) => item.kind === "material_crop")).toBe(true);
    expect(plan.items[2].masks.some((item) => item.kind === "detail_focus" && item.required)).toBe(true);
    expect(plan.items[0].composition.compositeRules.join(" ")).toContain("source of truth");
  });
});
