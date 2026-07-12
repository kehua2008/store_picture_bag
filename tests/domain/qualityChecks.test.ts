import { describe, expect, it } from "vitest";
import { runQualityChecks } from "../../src/domain/quality/checks";

describe("runQualityChecks", () => {
  it("marks a compliant white-background image usable", () => {
    const report = runQualityChecks({
      category: "top",
      assetType: "white_bg",
      metadata: {
        width: 1200,
        height: 1200,
        mimeType: "image/jpeg",
        fileSizeBytes: 900_000,
        colorMode: "rgb",
        whitePixelRatio: 0.98,
        subjectOccupancy: 0.78
      }
    });

    expect(report.usable).toBe(true);
    expect(report.checks.every((check) => check.passed)).toBe(true);
  });

  it("fails wrong dimensions and non-white background", () => {
    const report = runQualityChecks({
      category: "bottom",
      assetType: "white_bg",
      metadata: {
        width: 1000,
        height: 1200,
        mimeType: "image/jpeg",
        fileSizeBytes: 900_000,
        colorMode: "rgb",
        whitePixelRatio: 0.8,
        subjectOccupancy: 0.78
      }
    });

    expect(report.usable).toBe(false);
    expect(report.checks.find((check) => check.code === "dimensions")?.passed).toBe(false);
    expect(report.checks.find((check) => check.code === "white_background")?.passed).toBe(false);
  });

  it("fails forbidden elements", () => {
    const report = runQualityChecks({
      category: "shoes",
      assetType: "main_scene",
      metadata: {
        width: 1340,
        height: 1785,
        mimeType: "image/jpeg",
        fileSizeBytes: 500_000,
        colorMode: "rgb",
        subjectOccupancy: 0.8,
        detectedForbiddenElements: ["price", "qr_code"]
      }
    });

    expect(report.usable).toBe(false);
    expect(report.checks.find((check) => check.code === "forbidden_elements")?.measured?.detectedCount).toBe(2);
  });
});
