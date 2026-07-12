import { describe, expect, it } from "vitest";
import { ManualResearchSampleRepository, VipshopCrawlerSource } from "../../src/domain/research/samples";

describe("research samples", () => {
  it("imports manual samples into the shared model", () => {
    const repository = new ManualResearchSampleRepository();

    const sample = repository.importSample({
      category: "top",
      imageUrl: "https://example.com/a.jpg",
      title: "爆款针织衫"
    });

    expect(sample.sourceType).toBe("manual_import");
    expect(repository.all()).toHaveLength(1);
  });

  it("stores analysis tags", () => {
    const repository = new ManualResearchSampleRepository();
    const sample = repository.importSample({ category: "shoes", title: "运动鞋" });

    const updated = repository.saveTags(sample.id, {
      composition: ["three-quarter front"],
      background: ["clean studio"],
      lighting: ["softbox"],
      pose: ["not_applicable"],
      subjectOccupancy: 0.78,
      detailFocus: ["sole texture"],
      forbiddenElementObservations: []
    });

    expect(updated?.tags?.composition).toContain("three-quarter front");
  });

  it("keeps the Vipshop crawler as a compliant best-effort source", async () => {
    const source = new VipshopCrawlerSource();

    await expect(source.collect("bottom", 10)).resolves.toEqual([]);
  });
});
