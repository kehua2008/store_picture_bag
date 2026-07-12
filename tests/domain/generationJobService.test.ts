import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import {
  GenerationJobService,
  generationJobRetentionMs,
  InMemoryGenerationJobRepository,
  maxGenerationConcurrency,
  serializeGenerationJob
} from "../../src/domain/jobs/generationJobService";
import { buildProductAnalysisDraft } from "../../src/domain/suites/productAnalysis";
import { buildSuiteCreativePlan } from "../../src/domain/suites/suiteCreativePlan";
import { buildSuitePlan } from "../../src/domain/suites/suitePresets";
import type { GenerateImageInput, ImageProvider } from "../../src/domain/provider/types";
import { persistentDataDir } from "../../src/server/storagePaths";

const testFile = new Blob(["image"], { type: "image/jpeg" });

describe("GenerationJobService", () => {
  it("creates running image edit jobs and hides source files in serializable output", () => {
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), successfulProvider);

    const job = service.createJob({
      options: {
        platform: "vipshop",
        category: "women",
        scene: "studio",
        sceneVariant: "minimal_solid",
        size: "portrait",
        modelProfile: "asian_female",
        count: 1,
        specId: "vipshop-main-portrait",
        imageTypeId: "studio_main",
        imageTypeIds: ["studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 1340,
        targetHeight: 1785,
        modelMode: "model"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    expect(job.status).toBe("running");
    expect(job.mode).toBe("image_edit");
    expect(job.progress.total).toBe(1);
    expect(job.prompt.body).toContain("Preserve the exact bag product");
    expect(job.prompt.body).toContain("Business surface");
    expect(job.prompt.body).toContain("Generate the uploaded bag naturally hand-carried");
    expect(job.prompt.body).toContain("Do not add text");
  });

  it("runs a job through provider", async () => {
    const repository = new InMemoryGenerationJobRepository();
    const service = new GenerationJobService(repository, successfulProvider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "men",
        scene: "white",
        sceneVariant: "pure_white",
        size: "square",
        modelProfile: "product_only",
        count: 2,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "no_model"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(completed?.status).toBe("succeeded");
    expect(completed?.progress).toEqual({ completed: 2, total: 2 });
    expect(completed?.results).toHaveLength(2);
    expect(completed?.results[0].sourceFilename).toBe("shirt.jpg");
    expect(completed?.results[0].base64).toBe("");
    expect(completed?.results[0].url).toMatch(/^\/generated-images\//);
  });

  it("does not store provider over-delivery beyond the planned image count", async () => {
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        const base = await successfulProvider.generate(input);
        if (!base.ok) return base;
        return {
          ok: true,
          value: [
            ...base.value,
            {
              ...base.value[0],
              id: "unexpected-extra-image"
            }
          ]
        };
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "men",
        scene: "white",
        sceneVariant: "pure_white",
        size: "square",
        modelProfile: "product_only",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main", "studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "no_model"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(2);
    expect(completed?.progress).toEqual({ completed: 2, total: 2 });
    expect(completed?.results).toHaveLength(2);
    expect(completed?.results.map((item) => item.id)).not.toContain("unexpected-extra-image");
  });

  it("keeps all requested images when a single image type count is greater than one", async () => {
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), successfulProvider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        imageTypeCounts: { studio_main: 3 },
        specId: "taobao-main-square",
        imageTypeId: "studio_main",
        imageTypeIds: ["studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 1200,
        targetHeight: 1200,
        modelMode: "model"
      },
      sourceImages: [{ id: "src-1", filename: "tote.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(3);
    expect(completed?.progress).toEqual({ completed: 3, total: 3 });
    expect(completed?.results).toHaveLength(3);
    expect(new Set(completed?.results.map((item) => item.id)).size).toBe(3);
  });

  it("cleans expired generation jobs while keeping recent jobs", () => {
    const repository = new InMemoryGenerationJobRepository();
    const service = new GenerationJobService(repository, successfulProvider);
    const expired = service.createJob({
      options: baseJobOptions(),
      sourceImages: [{ id: "src-expired", filename: "expired.jpg", mimeType: "image/jpeg", file: testFile }]
    });
    const recent = service.createJob({
      options: baseJobOptions(),
      sourceImages: [{ id: "src-recent", filename: "recent.jpg", mimeType: "image/jpeg", file: testFile }]
    });
    const expiredAt = new Date(Date.now() - generationJobRetentionMs - 1000).toISOString();
    repository.save({
      ...expired,
      createdAt: expiredAt,
      updatedAt: expiredAt
    });

    const deleted = service.cleanupExpiredJobs();

    expect(deleted.map((job) => job.id)).toEqual([expired.id]);
    expect(service.getJob(expired.id)).toBeUndefined();
    expect(service.getJob(recent.id)?.id).toBe(recent.id);
  });

  it("exposes success only after reserved credits are debited", async () => {
    const repository = new InMemoryGenerationJobRepository();
    let releaseSettlement: (() => void) | undefined;
    const settlement = new Promise<void>((resolve) => {
      releaseSettlement = resolve;
    });
    const service = new GenerationJobService(repository, successfulProvider, {
      onSucceeded: () => settlement
    });
    const job = service.createJob({
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-credit", filename: "credit.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const running = service.runJob(job.id);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.getJob(job.id)?.status).toBe("running");
    releaseSettlement?.();
    const completed = await running;

    expect(completed?.status).toBe("succeeded");
    expect(completed?.chargedCredits).toBe(30);
  });

  it("exposes failure and cancellation only after frozen credits are released", async () => {
    let releaseFailure: (() => void) | undefined;
    const failureSettlement = new Promise<void>((resolve) => {
      releaseFailure = resolve;
    });
    const failedRepository = new InMemoryGenerationJobRepository();
    const failedService = new GenerationJobService(failedRepository, failingProvider, {
      onFailed: () => failureSettlement
    });
    const failedJob = failedService.createJob({
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-fail-credit", filename: "fail.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const failingRun = failedService.runJob(failedJob.id);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(failedService.getJob(failedJob.id)?.status).toBe("running");
    releaseFailure?.();
    expect((await failingRun)?.status).toBe("failed");

    let releaseCancel: (() => void) | undefined;
    const cancelSettlement = new Promise<void>((resolve) => {
      releaseCancel = resolve;
    });
    const cancelService = new GenerationJobService(new InMemoryGenerationJobRepository(), successfulProvider, {
      onCanceled: () => cancelSettlement
    });
    const cancelJob = cancelService.createJob({
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-cancel-credit", filename: "cancel.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const canceling = cancelService.cancelJob(cancelJob.id);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(cancelService.getJob(cancelJob.id)?.status).toBe("running");
    releaseCancel?.();
    expect((await canceling)?.status).toBe("canceled");
  });

  it("persists terminal job status even when credit settlement fails", async () => {
    const failedRepository = new InMemoryGenerationJobRepository();
    const failedService = new GenerationJobService(failedRepository, failingProvider, {
      onFailed: async () => {
        throw new Error("ledger unavailable");
      }
    });
    const failedJob = failedService.createJob({
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-failed-settlement", filename: "fail.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    await expect(failedService.runJob(failedJob.id)).rejects.toThrow("ledger unavailable");
    expect(failedService.getJob(failedJob.id)?.status).toBe("failed");

    const successRepository = new InMemoryGenerationJobRepository();
    const successService = new GenerationJobService(successRepository, successfulProvider, {
      onSucceeded: async () => {
        throw new Error("ledger unavailable");
      }
    });
    const successJob = successService.createJob({
      reservedCredits: 12,
      options: baseJobOptions(),
      sourceImages: [{ id: "src-success-settlement", filename: "success.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    await expect(successService.runJob(successJob.id)).rejects.toThrow("ledger unavailable");
    expect(successService.getJob(successJob.id)?.status).toBe("succeeded");
  });

  it("simulates camera metadata on generated images when requested", async () => {
    const png = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        return {
          ok: true,
          value: [{
            id: "generated-with-exif",
            base64: png.toString("base64"),
            mimeType: "image/png",
            width: input.recipe.target.width,
            height: input.recipe.target.height,
            model: "test-model",
            provider: "test"
          }]
        };
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "men",
        scene: "white",
        sceneVariant: "pure_white",
        size: "square",
        modelProfile: "product_only",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "no_model",
        photoMetadataMode: "simulated"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);
    const result = completed?.results[0];
    const generatedPath = result?.url ? path.join(persistentDataDir(), result.url.replace(/^\//, "")) : "";
    const metadata = await sharp(readFileSync(generatedPath)).metadata();

    expect(result?.mimeType).toBe("image/jpeg");
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(4);
    expect(metadata.height).toBe(4);
    expect(metadata.exif).toBeInstanceOf(Buffer);
    expect(metadata.exif?.length).toBeGreaterThan(0);
  });

  it("cancels a running job before provider execution", async () => {
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), successfulProvider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "men",
        scene: "white",
        sceneVariant: "pure_white",
        size: "square",
        modelProfile: "product_only",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "no_model"
      },
      sourceImages: [{ id: "src-1", filename: "printed-shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const canceled = await service.cancelJob(job.id);
    const afterRun = await service.runJob(job.id);

    expect(canceled?.status).toBe("canceled");
    expect(afterRun?.status).toBe("canceled");
    expect(afterRun?.results).toHaveLength(0);
  });

  it("runs one batch job across multiple image types", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main", "studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(2);
    expect(calls).toHaveLength(2);
    expect(completed?.results).toEqual([
      expect.objectContaining({ imageTypeId: "white_main", imageTypeLabel: "白底主图" }),
      expect.objectContaining({ imageTypeId: "studio_main", imageTypeLabel: "棚拍主图" })
    ]);
  });

  it("keeps successful results and records failed planned items for partial failures", async () => {
    const callbacks: string[] = [];
    let callCount = 0;
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        callCount += 1;
        if (callCount === 2) {
          return {
            ok: false,
            error: {
              code: "provider_rate_limited",
              message: "studio generation failed",
              retryable: true
            }
          };
        }
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider, {
      onSucceeded: (job) => {
        callbacks.push(`${job.status}:${job.chargedCredits}`);
      }
    });
    const job = service.createJob({
      reservedCredits: 20,
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main", "studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(completed?.status).toBe("partial_failed");
    expect(completed?.progress).toEqual({ completed: 1, total: 2 });
    expect(completed?.results).toEqual([
      expect.objectContaining({ imageTypeId: "white_main", imageTypeLabel: "白底主图" })
    ]);
    expect(completed?.failures).toEqual([
      expect.objectContaining({
        imageTypeId: "studio_main",
        imageTypeLabel: "棚拍主图",
        sourceFilename: "shirt.jpg",
        error: expect.objectContaining({ message: "studio generation failed" })
      })
    ]);
    expect(completed?.chargedCredits).toBe(30);
    expect(callbacks).toEqual(["partial_failed:30"]);
  });

  it("passes distinct classic style variation cards to each planned item", async () => {
    const prompts: string[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        prompts.push(input.recipe.providerPrompt);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "men",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "portrait",
        modelProfile: "asian_male",
        count: 1,
        specId: "taobao-detail-mobile",
        imageTypeId: "detail_header_poster",
        imageTypeIds: ["detail_header_poster", "scene_main", "detail_texture", "detail_model_fit"],
        productGroupingMode: "per_image",
        targetWidth: 790,
        targetHeight: 1200,
        modelMode: "model",
        topSellerStyleId: "old_money",
        topSellerStyleIds: ["old_money"]
      },
      sourceImages: [{ id: "src-1", filename: "jacket.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    await service.runJob(job.id);

    expect(prompts).toHaveLength(4);
    expect(prompts[0]).toContain("Visual variation card for 老钱质感 1/4");
    expect(prompts[1]).toContain("Visual variation card for 老钱质感 2/4");
    expect(prompts[2]).toContain("Visual variation card for 老钱质感 3/4");
    expect(prompts[3]).toContain("Visual variation card for 老钱质感 4/4");
    expect(prompts[0]).toContain("commerce role: detail header poster");
    expect(prompts[1]).toContain("commerce role: scene image proving the selected style family");
    expect(prompts[2]).toContain("commerce role: material/detail image varying surface");
    expect(prompts[3]).toContain("commerce role: fit or wearing-effect image");
    expect(new Set(prompts.map((prompt) => prompt.match(/scene family: ([^;]+)/)?.[1])).size).toBe(4);
  });

  it("runs generation tasks concurrently with the default stability limit", async () => {
    let active = 0;
    let maxActive = 0;
    const started: string[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        active += 1;
        maxActive = Math.max(maxActive, active);
        started.push(input.referenceImage.filename);
        await new Promise((resolve) => setTimeout(resolve, 10));
        active -= 1;
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main", "studio_main", "scene_main", "flatlay_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model"
      },
      sourceImages: [
        { id: "src-1", filename: "bag-1.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "src-2", filename: "bag-2.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "src-3", filename: "bag-3.jpg", mimeType: "image/jpeg", file: testFile }
      ]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(12);
    expect(started).toHaveLength(12);
    expect(maxActive).toBe(maxGenerationConcurrency);
    expect(completed?.results).toHaveLength(12);
    expect(completed?.results.map((item) => item.sourceFilename)).toEqual([
      "bag-1.jpg",
      "bag-1.jpg",
      "bag-1.jpg",
      "bag-1.jpg",
      "bag-2.jpg",
      "bag-2.jpg",
      "bag-2.jpg",
      "bag-2.jpg",
      "bag-3.jpg",
      "bag-3.jpg",
      "bag-3.jpg",
      "bag-3.jpg"
    ]);
  });

  it("treats multiple uploaded angles as one product group", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main"],
        productGroupingMode: "single_product_multi_angle",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model"
      },
      sourceImages: [
        { id: "src-1", filename: "tote-front.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "src-2", filename: "tote-side.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "src-3", filename: "tote-back.jpg", mimeType: "image/jpeg", file: testFile }
      ]
    });

    expect(job.progress.total).toBe(1);
    expect(job.sourceImageGroups).toHaveLength(1);
    expect(job.sourceImageGroups[0].images).toHaveLength(3);

    const completed = await service.runJob(job.id);

    expect(calls).toHaveLength(1);
    expect(calls[0].referenceImages).toHaveLength(3);
    expect(completed?.results).toHaveLength(1);
    expect(completed?.results[0].sourceFilename).toBe("tote-front.jpg + tote-side.jpg + tote-back.jpg");
  });

  it("keeps saved style reference metadata without passing style images to providers", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "studio_main",
        imageTypeIds: ["studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model",
        customStylePrompts: ["Saved custom style \"自定义风格1\": preserve lighting, palette, camera and commercial polish."]
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }],
      styleReferenceImages: [{ id: "style-1", filename: "style.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);
    const serialized = completed ? serializeGenerationJob(completed) : undefined;

    expect(job.progress.total).toBe(1);
    expect(job.sourceImageGroups).toHaveLength(1);
    expect(job.sourceImageGroups[0].images).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(calls[0].referenceImages).toEqual([
      expect.objectContaining({ id: "src-1", filename: "shirt.jpg" }),
      expect.objectContaining({ id: "style-1", filename: "style.jpg" })
    ]);
    expect(calls[0].recipe.providerPrompt).toContain("Custom reference style reconstruction");
    expect(calls[0].recipe.providerPrompt).toContain("style reference image(s) are style-only references");
    expect(serialized?.styleReferenceImages).toEqual([
      expect.objectContaining({ id: "style-1", filename: "style.jpg", mimeType: "image/jpeg" })
    ]);
    expect("file" in (serialized?.styleReferenceImages?.[0] ?? {})).toBe(false);
  });

  it("expands jobs across multiple top seller styles", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "scene_main",
        imageTypeIds: ["scene_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model",
        topSellerStyleId: "old_money",
        topSellerStyleIds: ["old_money", "street_trend"]
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(2);
    expect(calls).toHaveLength(2);
    expect(calls[0].recipe.providerPrompt).toContain("老钱质感");
    expect(calls[1].recipe.providerPrompt).toContain("高街潮流");
    expect(completed?.results).toEqual([
      expect.objectContaining({ topSellerStyleId: "old_money", topSellerStyleLabel: "老钱质感" }),
      expect.objectContaining({ topSellerStyleId: "street_trend", topSellerStyleLabel: "高街潮流" })
    ]);
  });

  it("passes enabled detail module copy only to the matching image type", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "portrait",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-detail-mobile",
        imageTypeId: "detail_model_fit",
        imageTypeIds: ["detail_model_fit", "detail_texture"],
        productGroupingMode: "per_image",
        targetWidth: 790,
        targetHeight: 1200,
        modelMode: "model",
        moduleCopies: [
          {
            imageTypeId: "detail_model_fit",
            imageTypeLabel: "模特穿着展示",
            title: "上身显瘦",
            subtitle: "通勤日常都好穿",
            bullets: ["垂顺有型", "活动自在"],
            templateId: "clean-corner"
          }
        ]
      },
      sourceImages: [{ id: "src-1", filename: "tote.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    await service.runJob(job.id);

    expect(calls).toHaveLength(2);
    expect(calls[0].recipe.providerPrompt).toContain("Detail module text input is enabled for 模特穿着展示");
    expect(calls[0].recipe.providerPrompt).toContain("上身显瘦");
    expect(calls[0].recipe.providerPrompt).not.toContain("Do not add text, watermark");
    expect(calls[1].recipe.providerPrompt).not.toContain("上身显瘦");
    expect(calls[1].recipe.providerPrompt).not.toContain("Detail module text input is enabled");
    expect(calls[1].recipe.providerPrompt).toContain("Image-type hard boundary: this is a bag material texture close-up");
    expect(calls[1].recipe.providerPrompt).toContain("Do not add text");
  });

  it("expands jobs across saved custom styles with separate reference images", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "scene_main",
        imageTypeIds: ["scene_main", "studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model",
        customStyleIds: ["custom-1", "custom-2"],
        customStyleLabels: ["自定义风格1", "自定义风格2"],
        customStylePrompts: ["Saved custom style 1: warm window light.", "Saved custom style 2: cool street flash."]
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }],
      styleReferenceImages: [
        { id: "style-1", filename: "warm.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "style-2", filename: "cool.jpg", mimeType: "image/jpeg", file: testFile }
      ]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(4);
    expect(calls).toHaveLength(4);
    expect(calls[0].referenceImages).toEqual([
      expect.objectContaining({ id: "src-1" }),
      expect.objectContaining({ id: "style-1", filename: "warm.jpg" })
    ]);
    expect(calls[1].referenceImages).toEqual([
      expect.objectContaining({ id: "src-1" }),
      expect.objectContaining({ id: "style-2", filename: "cool.jpg" })
    ]);
    expect(calls[0].recipe.providerPrompt).toContain("warm window light");
    expect(calls[0].recipe.providerPrompt).not.toContain("cool street flash");
    expect(calls[1].recipe.providerPrompt).toContain("cool street flash");
    expect(calls[1].recipe.providerPrompt).not.toContain("warm window light");
    expect(completed?.results).toEqual([
      expect.objectContaining({ customStyleId: "custom-1", customStyleLabel: "自定义风格1", imageTypeId: "scene_main" }),
      expect.objectContaining({ customStyleId: "custom-2", customStyleLabel: "自定义风格2", imageTypeId: "scene_main" }),
      expect.objectContaining({ customStyleId: "custom-1", customStyleLabel: "自定义风格1", imageTypeId: "studio_main" }),
      expect.objectContaining({ customStyleId: "custom-2", customStyleLabel: "自定义风格2", imageTypeId: "studio_main" })
    ]);
  });

  it("expands one queue across classic and saved custom styles", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "scene_main",
        imageTypeIds: ["scene_main", "studio_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model",
        topSellerStyleIds: ["old_money"],
        customStyleIds: ["custom-1", "custom-2"],
        customStyleLabels: ["自定义风格1", "自定义风格2"],
        customStylePrompts: ["Saved custom style 1: warm window light.", "Saved custom style 2: cool street flash."]
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }],
      styleReferenceImages: [
        { id: "style-1", filename: "warm.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "style-2", filename: "cool.jpg", mimeType: "image/jpeg", file: testFile }
      ]
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(6);
    expect(calls).toHaveLength(6);
    expect(completed?.results.map((item) => item.topSellerStyleLabel ?? item.customStyleLabel)).toEqual([
      "老钱质感",
      "自定义风格1",
      "自定义风格2",
      "老钱质感",
      "自定义风格1",
      "自定义风格2"
    ]);
  });

  it("runs suite jobs in planned order with suite metadata", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const suiteItems = [
      { id: "suite-1", order: 1, role: "white_hero" as const, imageTypeId: "white_main", label: "白底主图", specId: "taobao-main-square", targetWidth: 800, targetHeight: 800 },
      { id: "suite-2", order: 2, role: "scene_hero" as const, imageTypeId: "scene_main", label: "场景主图", specId: "taobao-main-square", targetWidth: 800, targetHeight: 800 }
    ];
    const productAnalysis = buildProductAnalysisDraft({
      category: "women",
      categoryLabel: "连衣裙",
      sourceFilenames: ["tote.jpg"]
    });
    const suiteCreativePlan = buildSuiteCreativePlan({
      platform: "taobao",
      category: "women",
      surface: "main",
      suiteItems,
      productAnalysis
    });
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "white",
        sceneVariant: "pure_white",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "white_main",
        imageTypeIds: ["white_main", "scene_main"],
        productGroupingMode: "per_image",
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model",
        generationMode: "suite",
        suitePresetId: "basic-5",
        suiteItems,
        productAnalysis,
        suiteCreativePlan
      },
      sourceImages: [{ id: "src-1", filename: "tote.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(calls).toHaveLength(2);
    expect(calls[1].recipe.providerPrompt).toContain("Suite role: bag scene hero image");
    expect(calls[1].recipe.providerPrompt).toContain("Suite creative plan item 2");
    expect(calls[1].recipe.providerPrompt).toContain("Text layout render mode");
    expect(completed?.results).toEqual([
      expect.objectContaining({ imageTypeId: "white_main", suiteOrder: 1, suiteRole: "white_hero", suiteLabel: "白底主图", suiteCreativeItem: expect.objectContaining({ role: "white_hero" }) }),
      expect.objectContaining({ imageTypeId: "scene_main", suiteOrder: 2, suiteRole: "scene_hero", suiteLabel: "场景主图", suiteCreativeItem: expect.objectContaining({ role: "scene_hero" }) })
    ]);
    expect(serializeGenerationJob(job).suiteCreativePlan?.items).toHaveLength(2);
  });

  it("forces product-only model settings for no-model detail template modules", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const suiteItems = buildSuitePlan("taobao", "detail-basic-conversion", "detail", "women", "women_tshirt")
      .filter((item) => item.role === "sku_color" || item.role === "material_detail");
    const productAnalysis = buildProductAnalysisDraft({
      category: "women",
      categoryLabel: "T恤",
      sourceFilenames: ["black-shirt.jpg", "white-shirt.jpg"]
    });
    const suiteCreativePlan = buildSuiteCreativePlan({
      platform: "taobao",
      category: "women",
      surface: "detail",
      suiteItems,
      productAnalysis
    });
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "catalog",
        sceneVariant: "magazine_cover",
        size: "portrait",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-detail-mobile",
        imageTypeId: suiteItems[0].imageTypeId,
        imageTypeIds: suiteItems.map((item) => item.imageTypeId),
        productGroupingMode: "single_product_multi_angle",
        targetWidth: 790,
        targetHeight: 1200,
        modelMode: "model",
        generationMode: "suite",
        suitePresetId: "detail-basic-conversion",
        suiteItems,
        productAnalysis,
        suiteCreativePlan
      },
      modelReferenceImage: { id: "model", filename: "model.jpg", mimeType: "image/jpeg", file: testFile },
      sourceImages: [
        { id: "src-1", filename: "black-shirt.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "src-2", filename: "white-shirt.jpg", mimeType: "image/jpeg", file: testFile }
      ]
    });

    const completed = await service.runJob(job.id);

    expect(completed?.results.map((item) => item.suiteLabel)).toEqual(["多色SKU总览", "包身细节"]);
    expect(calls).toHaveLength(2);
    expect(calls[0].modelReferenceImage).toBeUndefined();
    expect(calls[0].recipe.providerPrompt).toContain("Model direction: no human model");
    expect(calls[1].modelReferenceImage).toBeUndefined();
    expect(calls[1].recipe.providerPrompt).toContain("Model direction: no human model");
  });

  it("marks jobs failed on provider errors without leaking secrets", async () => {
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), failingProvider);
    const job = service.createJob({
      options: {
        platform: "jd",
        category: "shoes",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "portrait",
        modelProfile: "asian_male",
        count: 1,
        specId: "jd-detail-mobile",
        imageTypeId: "detail_texture",
        imageTypeIds: ["detail_texture"],
        targetWidth: 750,
        targetHeight: 1200,
        modelMode: "model"
      },
      sourceImages: [{ id: "src-1", filename: "shoe.jpg", mimeType: "image/jpeg", file: testFile }]
    });

    const completed = await service.runJob(job.id);

    expect(completed?.status).toBe("failed");
    expect(completed?.error?.code).toBe("provider_rate_limited");
    expect(completed?.error?.message).not.toContain("secret");
    expect(completed?.failures).toEqual([
      expect.objectContaining({
        imageTypeId: "detail_texture",
        imageTypeLabel: "包身材质特写",
        error: expect.objectContaining({ code: "provider_rate_limited" })
      })
    ]);
  });

  it("passes custom model reference images to providers without serializing files", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return {
          ok: true,
          value: []
        };
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "square",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-main-square",
        imageTypeId: "studio_main",
        imageTypeIds: ["studio_main"],
        targetWidth: 800,
        targetHeight: 800,
        modelMode: "model",
        customModelId: "model-1",
        customModelName: "Lookbook model"
      },
      sourceImages: [{ id: "src-1", filename: "shirt.jpg", mimeType: "image/jpeg", file: testFile }],
      modelReferenceImage: { id: "model-1", filename: "model.jpg", mimeType: "image/jpeg", file: testFile }
    });

    await service.runJob(job.id);
    const stored = service.getJob(job.id);
    const serialized = stored ? serializeGenerationJob(stored) : undefined;

    expect(calls[0].modelReferenceImage).toEqual(
      expect.objectContaining({ id: "model-1", filename: "model.jpg", file: testFile })
    );
    expect(stored?.modelReferenceImage?.file).toBe(testFile);
    expect(serialized?.modelReferenceImage).toEqual(
      expect.objectContaining({ id: "model-1", filename: "model.jpg", mimeType: "image/jpeg" })
    );
    expect("file" in (serialized?.modelReferenceImage ?? {})).toBe(false);
  });

  it("splits merchant info graphics from normal model-based image tasks", async () => {
    const calls: GenerateImageInput[] = [];
    const provider: ImageProvider = {
      name: "test",
      async generate(input) {
        calls.push(input);
        return successfulProvider.generate(input);
      }
    };
    const service = new GenerationJobService(new InMemoryGenerationJobRepository(), provider);
    const job = service.createJob({
      options: {
        platform: "taobao",
        category: "women",
        scene: "studio",
        sceneVariant: "modern_studio",
        size: "portrait",
        modelProfile: "asian_female",
        count: 1,
        specId: "taobao-detail-mobile",
        imageTypeId: "detail_model_fit",
        imageTypeIds: ["detail_model_fit", "detail_merchant_info_graphic"],
        productGroupingMode: "per_image",
        targetWidth: 790,
        targetHeight: 1200,
        modelMode: "model",
        modelGender: "female",
        modelAgeRange: "young_adult",
        modelSkinTone: "east_asian",
        modelHairStyle: "medium",
        customModelId: "model-1",
        customModelName: "Lookbook model"
      },
      sourceImages: [
        { id: "src-1", filename: "dress-1.jpg", mimeType: "image/jpeg", file: testFile },
        { id: "src-2", filename: "dress-2.jpg", mimeType: "image/jpeg", file: testFile }
      ],
      merchantInfoImage: { id: "merchant-info-1", filename: "size-chart.jpg", mimeType: "image/jpeg", file: testFile },
      modelReferenceImage: { id: "model-1", filename: "model.jpg", mimeType: "image/jpeg", file: testFile }
    });

    const completed = await service.runJob(job.id);

    expect(job.progress.total).toBe(3);
    expect(calls.map((call) => call.referenceImage.filename)).toEqual(["dress-1.jpg", "dress-2.jpg", "size-chart.jpg"]);
    expect(calls[0].modelReferenceImage?.filename).toBe("model.jpg");
    expect(calls[1].modelReferenceImage?.filename).toBe("model.jpg");
    expect(calls[0].recipe.providerPrompt).not.toContain("Merchant information graphic rewrite task");
    expect(calls[1].recipe.providerPrompt).not.toContain("Merchant information graphic rewrite task");
    expect(calls[2].modelReferenceImage).toBeUndefined();
    expect(calls[2].recipe.providerPrompt).toContain("Model direction: no human model");
    expect(calls[2].recipe.providerPrompt).toContain("Image type: 资料图美化");
    expect(calls[2].recipe.providerPrompt).toContain("Merchant information graphic rewrite task");
    expect(completed?.results.map((item) => item.sourceFilename)).toEqual(["dress-1.jpg", "dress-2.jpg", "size-chart.jpg"]);
    expect(completed?.results.map((item) => item.imageTypeId)).toEqual(["detail_model_fit", "detail_model_fit", "detail_merchant_info_graphic"]);
    expect(serializeGenerationJob(job).merchantInfoImage).toEqual(expect.objectContaining({ filename: "size-chart.jpg", mimeType: "image/jpeg" }));
  });
});

function baseJobOptions() {
  return {
    platform: "taobao" as const,
    category: "men" as const,
    scene: "white" as const,
    sceneVariant: "pure_white" as const,
    size: "square" as const,
    modelProfile: "product_only" as const,
    count: 1,
    specId: "taobao-main-square",
    imageTypeId: "white_main",
    imageTypeIds: ["white_main"],
    productGroupingMode: "per_image" as const,
    targetWidth: 800,
    targetHeight: 800,
    modelMode: "no_model" as const
  };
}

const successfulProvider: ImageProvider = {
  name: "test",
  async generate(input) {
    return {
      ok: true,
      value: Array.from({ length: input.n ?? 1 }, (_, index) => ({
        id: `generated-${index}`,
        base64: "a".repeat(1000),
        mimeType: "image/png",
        width: input.recipe.target.width,
        height: input.recipe.target.height,
        model: "test-model",
        provider: "test"
      }))
    };
  }
};

const failingProvider: ImageProvider = {
  name: "test",
  async generate() {
    return {
      ok: false,
      error: {
        code: "provider_rate_limited",
        message: "slow down",
        retryable: true
      }
    };
  }
};
