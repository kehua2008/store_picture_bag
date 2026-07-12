import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import { generatedAssetRetentionMs, planGeneratedAssetCleanup } from "../../src/server/maintenance/generatedAssetCleanup";

describe("generated asset cleanup", () => {
  it("only marks expired orphan generated assets as cleanup candidates", () => {
    const dataDir = mkdtempSync(path.join(os.tmpdir(), "generated-asset-cleanup-"));
    const now = new Date("2026-07-02T12:00:00.000Z").getTime();
    try {
      mkdirSync(path.join(dataDir, "generated-images"), { recursive: true });
      mkdirSync(path.join(dataDir, "generated-videos"), { recursive: true });
      const referencedImage = path.join(dataDir, "generated-images", "referenced.png");
      const orphanImage = path.join(dataDir, "generated-images", "orphan.png");
      const recentImage = path.join(dataDir, "generated-images", "recent.png");
      const orphanVideo = path.join(dataDir, "generated-videos", "orphan.mp4");
      writeFileSync(referencedImage, "referenced");
      writeFileSync(orphanImage, "orphan");
      writeFileSync(recentImage, "recent");
      writeFileSync(orphanVideo, "video");
      writeFileSync(path.join(dataDir, "generation-jobs.json"), JSON.stringify({
        jobs: [{ results: [{ url: "/generated-images/referenced.png" }] }]
      }));
      writeFileSync(path.join(dataDir, "generation-jobs.json.bak-1"), "backup");

      const oldDate = new Date(now - 4 * 24 * 60 * 60 * 1000);
      const recentDate = new Date(now - 60 * 60 * 1000);
      for (const file of [referencedImage, orphanImage, orphanVideo]) {
        utimesSync(file, oldDate, oldDate);
      }
      utimesSync(recentImage, recentDate, recentDate);

      const plan = planGeneratedAssetCleanup({ dataDir, now, retentionMs: 3 * 24 * 60 * 60 * 1000 });

      expect(plan.referencedRelativePaths).toEqual(["generated-images/referenced.png"]);
      expect(plan.candidates.map((item) => item.relativePath).sort()).toEqual([
        "generated-images/orphan.png",
        "generated-videos/orphan.mp4"
      ]);
      expect(plan.backups.map((item) => item.relativePath)).toEqual(["generation-jobs.json.bak-1"]);
      expect(plan.totalCandidateBytes).toBeGreaterThan(0);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it("defaults generated asset retention to 24 hours", () => {
    expect(generatedAssetRetentionMs).toBe(24 * 60 * 60 * 1000);
  });
});
