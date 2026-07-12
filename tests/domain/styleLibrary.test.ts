import { mkdir, mkdtemp, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { FileStyleLibraryRepository } from "../../src/domain/styleLibrary/styleLibrary";
import type { StyleVisionAnalyzer } from "../../src/domain/styleLibrary/styleVisionAnalyzer";

describe("style library", () => {
  it("creates candidate batches without publishing homepage style boards", async () => {
    const repository = await isolatedRepository();
    const samples = await repository.createSamples([
      {
        file: testFile("korean-window.png", "image/png"),
        sourceType: "admin_upload",
        status: "approved",
        platform: "taobao",
        category: "women",
        imageType: "scene_main",
        styleName: "待归类风格"
      }
    ]);

    const batch = await repository.createCandidateBatch({ name: "候选批次", sampleIds: samples.map((sample) => sample.id) });
    const data = await repository.all();

    expect(batch.status).toBe("collecting");
    expect(batch.sampleIds).toEqual([samples[0].id]);
    expect(data.boards).toEqual([]);
  });

  it("builds an export manifest with sample id file mappings", async () => {
    const repository = await isolatedRepository();
    const [sample] = await repository.createSamples([
      {
        file: testFile("minimal.jpg", "image/jpeg"),
        sourceType: "admin_upload",
        status: "approved",
        sourceNote: "优质主图",
        platform: "taobao",
        category: "men",
        imageType: "scene_main",
        styleName: "待归类风格"
      }
    ]);
    const batch = await repository.createCandidateBatch({ sampleIds: [sample.id] });

    const { manifest, samples } = await repository.buildExportManifest({ batchId: batch.id });

    expect(manifest.schemaVersion).toBe("style-export-manifest.v1");
    expect(manifest.batchId).toBe(batch.id);
    expect(manifest.sampleIds).toEqual([sample.id]);
    expect(manifest.samples[0]).toEqual(expect.objectContaining({
      sampleId: sample.id,
      sourceNote: "优质主图",
      platform: "taobao",
      category: "men",
      analysis: sample.analysis
    }));
    expect(samples[0].exportFilename).toContain(sample.id);
  });

  it("stores precomputed reference analysis and reuses it by image hash", async () => {
    let analyzeCalls = 0;
    const repository = await isolatedRepository({
      name: "test-analyzer",
      analyze: async () => {
        analyzeCalls += 1;
        throw new Error("analyzer_should_not_run");
      }
    });
    const analysis = {
      background: ["white curtain"],
      lighting: ["soft window light"],
      camera: ["50mm lens"],
      pose: ["relaxed standing"],
      palette: ["cream"],
      props: ["wood chair"],
      composition: ["airy negative space"],
      avoid: ["logo", "text"],
      qualityScore: 91,
      summary: "soft window ecommerce style"
    };
    const [sample] = await repository.createSamples([
      {
        file: testFile("reference.png", "image/png"),
        sourceType: "user_replicate",
        status: "pending_review",
        platform: "taobao",
        category: "women",
        imageType: "scene_main",
        styleName: "窗光松弛",
        imageHash: "hash-1",
        analysis,
        stylePrompt: "Use soft window light and airy composition only.",
        negativePrompt: "logo, text",
        analyzer: "test-analyzer",
        analyzerModel: "vision-test",
        analyzerUsage: { total_tokens: 123 },
        analysisVersion: "style-reference-analysis.v1",
        analysisCostCredits: 2,
        customerId: "user-1",
        billingLedgerEntryId: "ledger-1"
      }
    ]);

    const reused = await repository.findAnalyzedSampleByHash("hash-1");
    const { manifest } = await repository.buildExportManifest({ sampleIds: [sample.id] });

    expect(analyzeCalls).toBe(0);
    expect(reused?.id).toBe(sample.id);
    expect(reused?.stylePrompt).toBe("Use soft window light and airy composition only.");
    expect(manifest.samples[0]).toEqual(expect.objectContaining({
      stylePrompt: "Use soft window light and airy composition only.",
      negativePrompt: "logo, text",
      analysis
    }));
  });

  it("builds layout-aware fallback prompts for poster-like reference styles", async () => {
    const repository = await isolatedRepository();
    const [sample] = await repository.createSamples([
      {
        file: testFile("vipshop_hero_poster.png", "image/png"),
        sourceType: "admin_upload",
        status: "approved",
        platform: "taobao",
        category: "women",
        imageType: "scene_main",
        styleName: "页头海报风格"
      }
    ]);

    expect(sample.stylePrompt).toContain("Layout and visual hierarchy");
    expect(sample.stylePrompt).toContain("editorial poster composition");
    expect(sample.stylePrompt).toContain("left-side copy-safe negative space");
  });

  it("imports analysis results as ready-to-publish boards hidden from home", async () => {
    const repository = await isolatedRepository();
    const samples = await repository.createSamples([
      {
        file: testFile("soft-window.png", "image/png"),
        sourceType: "admin_upload",
        status: "approved",
        platform: "taobao",
        category: "women",
        imageType: "scene_main",
        styleName: "待归类风格"
      }
    ]);
    const batch = await repository.createCandidateBatch({ sampleIds: samples.map((sample) => sample.id) });

    const boards = await repository.importStyleAnalysisResult({
      batchId: batch.id,
      analyst: "test",
      styleGroups: [
        {
          styleName: "韩系窗光松弛",
          category: "women",
          imageType: "scene_main",
          sampleIds: samples.map((sample) => sample.id),
          productBrief: "女装柔和生活方式图",
          sceneBrief: "窗光室内场景",
          promptCore: "soft Korean window light ecommerce style",
          promptVariants: ["cafe window", "sunlit apartment"],
          negativePrompt: "hard flash, logo, text",
          rules: {
            background: ["white curtain"],
            lighting: ["hazy window daylight"],
            composition: ["airy negative space"],
            color: ["soft neutrals"],
            avoid: ["busy props"]
          }
        }
      ]
    });
    const data = await repository.all();

    expect(boards[0]).toEqual(expect.objectContaining({
      status: "ready_to_publish",
      showOnHome: false,
      sampleIds: [samples[0].id]
    }));
    expect(boards[0].rules.promptCore).toBe("soft Korean window light ecommerce style");
    expect(boards[0].rules.promptVariants).toEqual(["cafe window", "sunlit apartment"]);
    expect(data.candidateBatches[0].status).toBe("imported");
  });

  it("approves user reference samples into a long-lived candidate pool", async () => {
    const repository = await isolatedRepository();
    const [sample] = await repository.createSamples([
      {
        file: testFile("user-reference.png", "image/png"),
        sourceType: "user_replicate",
        status: "pending_review",
        platform: "taobao",
        category: "women",
        imageType: "scene_main",
        styleName: "用户参考图"
      }
    ]);

    const result = await repository.approveSampleForCandidatePool(sample.id);
    const data = await repository.all();

    expect(result?.sample.status).toBe("approved");
    expect(result?.batch.name).toBe("用户参考图候选池");
    expect(result?.batch.sampleIds).toContain(sample.id);
    expect(data.samples.find((item) => item.id === sample.id)?.status).toBe("approved");
  });

  it("rejects user reference samples by deleting metadata, files, and batch references", async () => {
    const repository = await isolatedRepository();
    const [sample] = await repository.createSamples([
      {
        file: testFile("bad-reference.png", "image/png"),
        sourceType: "user_replicate",
        status: "pending_review",
        platform: "taobao",
        category: "women",
        imageType: "scene_main",
        styleName: "用户参考图"
      }
    ]);
    await repository.createCandidateBatch({ name: "临时候选批次", sampleIds: [sample.id] });
    const beforeReject = await repository.buildExportManifest({ sampleIds: [sample.id] });
    await expect(readFile(beforeReject.samples[0].absolutePath)).resolves.toBeInstanceOf(Buffer);

    const result = await repository.rejectSampleAndDelete(sample.id);
    const data = await repository.all();

    expect(result?.sample.status).toBe("rejected");
    expect(data.samples.some((item) => item.id === sample.id)).toBe(false);
    expect(data.candidateBatches[0].sampleIds).not.toContain(sample.id);
    await expect(readFile(beforeReject.samples[0].absolutePath)).rejects.toThrow();
  });
});

async function isolatedRepository(analyzer?: StyleVisionAnalyzer) {
  const workspace = await mkdtemp(path.join(tmpdir(), "style-library-test-"));
  const uploadDir = path.join(workspace, "public", "style-samples");
  await mkdir(uploadDir, { recursive: true });
  return new FileStyleLibraryRepository({
    analyzer,
    dataDir: path.join(workspace, ".data"),
    uploadDir
  });
}

function testFile(name: string, type: string): File {
  return {
    name,
    type,
    arrayBuffer: async () => new TextEncoder().encode("image").buffer
  } as File;
}
