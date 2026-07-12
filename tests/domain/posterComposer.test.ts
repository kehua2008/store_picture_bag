import { describe, expect, it } from "vitest";
import {
  defaultPosterCopy,
  getPosterTypographyProfile,
  normalizePosterCopy,
  selectSafestPosterZone,
  wrapPosterText
} from "../../src/domain/posters/posterComposer";

describe("poster composer helpers", () => {
  it("builds editable default poster copy from selected task context", () => {
    expect(defaultPosterCopy({ categoryLabel: "衬衫", styleLabel: "高级画册" })).toEqual({
      title: "质感日常款",
      subtitle: "高级画册风格 展示商品细节",
      bullets: ["卖点明确", "细节清楚"],
      templateId: "side-editorial"
    });
  });

  it("builds category and module aware default copy for non-apparel detail modules", () => {
    expect(defaultPosterCopy({
      majorCategoryLabel: "箱包",
      categoryLabel: "通勤托特包",
      imageTypeId: "detail_header_poster",
      imageTypeLabel: "页头海报",
      styleLabel: "城市通勤"
    })).toEqual({
      title: "实用容量感",
      subtitle: "材质细节清楚 通勤出行都合适",
      bullets: ["容量分区", "质感五金"],
      templateId: "side-editorial"
    });

    expect(defaultPosterCopy({
      majorCategoryLabel: "箱包",
      categoryLabel: "旅行箱",
      imageTypeId: "detail_texture",
      imageTypeLabel: "材质细节",
      styleLabel: "城市通勤"
    })).toEqual(expect.objectContaining({
      title: "分区收纳",
      subtitle: "放大旅行箱核心卖点",
      templateId: "detail-callout"
    }));
  });

  it("normalizes poster copy and limits selling points", () => {
    const fallback = defaultPosterCopy({ categoryLabel: "外套", styleLabel: "平台标准棚拍" });

    expect(normalizePosterCopy({
      title: "  ",
      subtitle: "轻暖通勤",
      bullets: ["防风防泼水", "", "挺括轮廓", "多场景"],
      templateId: "bottom-card"
    }, fallback)).toEqual({
      title: "质感日常款",
      subtitle: "轻暖通勤",
      bullets: ["防风防泼水", "挺括轮廓"],
      templateId: "bottom-card"
    });
  });

  it("wraps Chinese poster text by measured width", () => {
    const ctx = {
      measureText: (text: string) => ({ width: text.length * 10 } as TextMetrics)
    };

    expect(wrapPosterText(ctx, "轻盈通勤托特新品", 40)).toEqual(["轻盈通勤", "托特新品"]);
  });

  it("selects the safest preferred ecommerce copy zone", () => {
    expect(selectSafestPosterZone([
      { id: "top-left", score: 80 },
      { id: "top-right", score: 20 },
      { id: "bottom-left", score: 5 }
    ], ["top-left", "top-right"])).toBe("top-right");
  });

  it("uses scene-specific typography profiles for poster templates", () => {
    expect(getPosterTypographyProfile("side-editorial").titleFont).toContain("Source Han Serif SC");
    expect(getPosterTypographyProfile("side-editorial").titleStrokeWidth).toBeGreaterThan(0);
    expect(getPosterTypographyProfile("bottom-card").titleFont).toContain("Source Han Sans SC");
    expect(getPosterTypographyProfile("detail-callout").titleFont).toContain("22px");
  });
});
