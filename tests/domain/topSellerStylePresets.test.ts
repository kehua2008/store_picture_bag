import { describe, expect, it } from "vitest";
import { findTopSellerStylePreset, normalizeTopSellerStylePresetId, topSellerStylePresetsForCategory } from "../../src/domain/prompts/topSellerStylePresets";

describe("top seller style presets", () => {
  it("uses category-specific classic ecommerce styles", () => {
    const apparel = topSellerStylePresetsForCategory("apparel");
    const shoes = topSellerStylePresetsForCategory("shoes");
    const beauty = topSellerStylePresetsForCategory("beauty");

    expect(apparel.map((item) => item.label)).toContain("城市通勤");
    expect(apparel.map((item) => item.id)).toEqual([
      "old_money",
      "urban_commute",
      "street_trend",
      "gorpcore",
      "korean_relaxed",
      "new_chinese",
      "dopamine_sweet",
      "minimal_premium"
    ]);
    expect(shoes.map((item) => item.label)).toContain("运动机能");
    expect(beauty.map((item) => item.label)).toContain("成分实验室");
    expect(shoes.map((item) => item.id)).not.toEqual(apparel.map((item) => item.id));
    expect(shoes.map((item) => item.id)).toEqual([
      "bag_performance_utility",
      "bag_clean_lifestyle",
      "bag_premium_leather",
      "bag_outdoor_trail",
      "minimal_premium"
    ]);
    expect(beauty.length).toBeGreaterThanOrEqual(4);
    expect(beauty.length).toBeLessThanOrEqual(6);
  });

  it("uses concrete visual variables for non-apparel classic presets", () => {
    const bagsPerformance = findTopSellerStylePreset("bag_performance_utility");
    const bags = findTopSellerStylePreset("bag_commute_utility");
    const beauty = findTopSellerStylePreset("beauty_clean_lab");

    expect(bagsPerformance?.visualSystem.scenes).toContain("technical studio floor");
    expect(bags?.visualSystem.cameras).toContain("three-quarter carrying angle");
    expect(beauty?.visualSystem.scenes).toContain("white acrylic lab tray");
    expect(bagsPerformance?.visualSystem.scenes).not.toContain("category-specific Tmall product scene");
    expect(bags?.visualSystem.scenes).not.toContain("clean ecommerce set");
    expect(beauty?.visualSystem.scenes).not.toContain("merchant-grade lifestyle context");
    expect(bagsPerformance?.visualSystem.forbiddenElements).toContain("generic wall");
    expect(bagsPerformance?.visualSystem.forbiddenElements).toContain("same studio template");
  });

  it("maps legacy shoe style ids to bag-specific presets", () => {
    expect(normalizeTopSellerStylePresetId("shoe_tech_runner")).toBe("bag_performance_utility");
    expect(findTopSellerStylePreset("shoe_luxury_leather")?.id).toBe("bag_premium_leather");
  });
});
