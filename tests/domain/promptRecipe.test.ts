import { describe, expect, it } from "vitest";
import { buildPromptRecipe } from "../../src/domain/prompts/recipes";

describe("buildPromptRecipe", () => {
  it("builds a hidden white-background prompt with Vipshop constraints", () => {
    const recipe = buildPromptRecipe({
      product: {
        category: "shoes",
        title: "通勤托特包",
        color: "雾灰色",
        material: "细纹皮革",
        sellingPoints: ["包型挺括", "容量分区"]
      },
      assetType: "white_bg",
      referenceImage: {
        id: "ref-1",
        filename: "tote-bag.jpg",
        mimeType: "image/jpeg"
      }
    });

    expect(recipe.version).toBe("vipshop-apparel-v1");
    expect(recipe.target).toEqual({ width: 1200, height: 1200, assetType: "white_bg" });
    expect(recipe.identityLock).toContain("Treat the reference image as the product source of truth");
    expect(recipe.providerPrompt).toContain("RGB 255,255,255");
    expect(recipe.providerPrompt).toContain("70% to 85%");
    expect(recipe.providerPrompt).toContain("Do not add text");
    expect(recipe.providerPrompt).not.toContain("tote-bag.jpg");
    expect(recipe.userVisibleSummary).not.toContain("Do not add text");
  });

  it("includes category and commercial direction for scene prompts", () => {
    const recipe = buildPromptRecipe({
      product: {
        category: "shoes",
        title: "轻量通勤双肩包",
        color: "黑色",
        style: "通勤机能"
      },
      assetType: "main_scene",
      referenceImage: { id: "ref-2", filename: "backpack.jpg", mimeType: "image/jpeg" },
      researchTags: ["three-quarter angle", "soft daylight"]
    });

    expect(recipe.target.width).toBe(1340);
    expect(recipe.providerPrompt).toContain("bag product");
    expect(recipe.providerPrompt).toContain("clean premium ecommerce bag product image for listing use");
    expect(recipe.providerPrompt).toContain("Do not redesign the bag silhouette");
    expect(recipe.providerPrompt).toContain("Research signals");
  });
});
