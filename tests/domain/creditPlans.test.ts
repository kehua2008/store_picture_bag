import { describe, expect, it } from "vitest";
import { creditChargePrinciples, creditChargeRules, creditRechargePlans, creditsForRule, estimateBaseImageCount, estimatePlanBaseImageCount, estimatePlanVideoCount, unitImagePriceCny } from "../../src/domain/billing/creditPlans";

describe("credit recharge plans", () => {
  it("offers the requested recharge tiers starting at 99 yuan", () => {
    expect(creditRechargePlans.map((plan) => plan.credits)).toEqual([990, 2990, 9990, 29990, 49990, 99990]);
    expect(Math.min(...creditRechargePlans.map((plan) => plan.credits))).toBe(990);
    expect(creditRechargePlans[0]).toEqual(expect.objectContaining({ credits: 990, priceCny: 99, imageCreditsPerUnit: 30, videoCreditsPerUnit: 300 }));
  });

  it("estimates tier-specific image and video capacity", () => {
    expect(estimateBaseImageCount(990)).toBe(33);
    expect(estimatePlanBaseImageCount(creditRechargePlans[0])).toBe(33);
    expect(estimatePlanBaseImageCount(creditRechargePlans[5])).toBe(9999);
    expect(estimatePlanVideoCount(creditRechargePlans[0])).toBe(3);
    expect(estimatePlanVideoCount(creditRechargePlans[5])).toBe(499);
  });

  it("makes larger recharge tiers more cost efficient than the starter plan", () => {
    const starterUnitPrice = unitImagePriceCny(creditRechargePlans[0]);
    const largerPlans = creditRechargePlans.slice(1);

    largerPlans.forEach((plan) => {
      expect(unitImagePriceCny(plan)).toBeLessThan(starterUnitPrice);
    });
  });

  it("defines detailed charging rules for image, style, model and video work", () => {
    expect(creditsForRule("single-main")).toBe(30);
    expect(creditsForRule("detail-poster")).toBe(45);
    expect(creditsForRule("short-video")).toBe(300);
    expect(creditsForRule("custom-style")).toBe(0);
    expect(creditsForRule("style-reference-analysis")).toBe(10);
    expect(creditsForRule("video-prompt-writer")).toBe(10);
    expect(creditsForRule("video-prompt-revise")).toBe(10);
    expect(creditsForRule("custom-model")).toBe(0);
    const ruleIds = creditChargeRules.map((rule) => rule.id);
    expect(ruleIds).toContain("multi-angle");
    expect(ruleIds).not.toContain("suite-basic");
    expect(ruleIds).not.toContain("suite-standard");
    expect(ruleIds).not.toContain("suite-detail");
    expect(creditChargePrinciples.join(" ")).toContain("失败任务不扣点");
  });
});
