import { describe, expect, it } from "vitest";
import { resolveVipshopImageSpec } from "../../src/domain/vipshop/rules";

describe("resolveVipshopImageSpec", () => {
  it("resolves clothing main scene images to Vipshop 3:4 size", () => {
    const spec = resolveVipshopImageSpec("top", "main_scene");

    expect(spec.width).toBe(1340);
    expect(spec.height).toBe(1785);
    expect(spec.ratio).toBe("3:4");
    expect(spec.maxFileSizeMb).toBe(1);
    expect(spec.forbiddenElements).toContain("watermark");
  });

  it("resolves bottom detail images with detail file size policy", () => {
    const spec = resolveVipshopImageSpec("bottom", "detail");

    expect(spec.width).toBe(1340);
    expect(spec.height).toBe(1785);
    expect(spec.maxFileSizeMb).toBe(1.5);
  });

  it("resolves SKU color images as square pure-white assets", () => {
    const spec = resolveVipshopImageSpec("shoes", "sku_color");

    expect(spec.width).toBe(1200);
    expect(spec.height).toBe(1200);
    expect(spec.ratio).toBe("1:1");
    expect(spec.backgroundRule).toBe("pure_white");
    expect(spec.subjectOccupancy).toEqual({ min: 0.7, max: 0.85 });
  });
});
