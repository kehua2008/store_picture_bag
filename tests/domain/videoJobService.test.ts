import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import {
  estimateVideoJobCredits,
  FileVideoJobRepository,
  InMemoryVideoJobRepository,
  serializeVideoJob,
  videoRetryDelaysMs,
  VideoJobService
} from "../../src/domain/jobs/videoJobService";
import type { ProviderError, ProviderResult } from "../../src/domain/provider/types";
import type { CreateVideoInput, CreatedVideoTask, VideoTaskStatusUpdate } from "../../src/domain/provider/yunwuVideoProvider";

const pendingVideoTaskQuery = async (task: CreatedVideoTask): Promise<ProviderResult<VideoTaskStatusUpdate>> => ({
  ok: true,
  value: {
    ...task,
    status: "processing"
  }
});

describe("VideoJobService", () => {
  it("submits provider tasks and records charged credits without persisting image data", async () => {
    const callbacks: string[] = [];
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async (): Promise<ProviderResult<CreatedVideoTask>> => ({
        ok: true,
        value: {
          id: "video-provider-task-1",
          status: "submitted",
          model: "kling-v2-5-turbo",
          provider: "yunwu",
          raw: { task_id: "video-provider-task-1" }
        }
      }),
      get: pendingVideoTaskQuery
    }, {
      onSubmitted: (job) => {
        callbacks.push(`submitted:${job.reservedCredits}`);
      }
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 110,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc", "data:image/png;base64,def"],
        aspectRatio: "9:16"
      }
    });

    const completed = await service.runJob(job.id);
    const serialized = serializeVideoJob(completed!);

    expect(completed?.status).toBe("submitted");
    expect(completed?.chargedCredits).toBe(110);
    expect(completed?.providerTask?.id).toBe("video-provider-task-1");
    expect(callbacks).toEqual(["submitted:110"]);
    expect(serialized.input.images).toEqual(["2 source image(s) omitted"]);
  });

  it("keeps retryable provider failures running and schedules the next attempt", async () => {
    const error: ProviderError = {
      code: "provider_rate_limited",
      message: "provider busy",
      retryable: true
    };
    const callbacks: string[] = [];
    const now = new Date("2026-06-30T10:00:00.000Z").getTime();
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async () => ({ ok: false, error }),
      get: pendingVideoTaskQuery
    }, {
      onFailed: (job) => {
        callbacks.push(`failed:${job.reservedCredits}`);
      }
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16"
      }
    });

    const completed = await service.runJob(job.id, { now });

    expect(completed?.status).toBe("running");
    expect(completed?.attemptCount).toBe(1);
    expect(completed?.lastError).toEqual(error);
    expect(completed?.nextAttemptAt).toBe(new Date(now + videoRetryDelaysMs[0]).toISOString());
    expect(callbacks).toEqual([]);
  });

  it("marks final retry exhaustion as failed and invokes release settlement", async () => {
    const error: ProviderError = {
      code: "provider_timeout",
      message: "provider timeout",
      retryable: true
    };
    const callbacks: string[] = [];
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async () => ({ ok: false, error }),
      get: pendingVideoTaskQuery
    }, {
      onFailed: (job) => {
        callbacks.push(`failed:${job.reservedCredits}`);
      }
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16"
      }
    });

    let current = job;
    for (let attempt = 0; attempt <= videoRetryDelaysMs.length; attempt += 1) {
      current = (await service.runJob(current.id, { now: Date.now() + attempt * 1_000_000, force: true }))!;
    }

    expect(current.status).toBe("failed");
    expect(current.error).toEqual(error);
    expect(callbacks).toEqual(["failed:80"]);
  });

  it("marks non-retryable provider failures and invokes release settlement", async () => {
    const error: ProviderError = {
      code: "provider_bad_request",
      message: "bad video request",
      retryable: false
    };
    const callbacks: string[] = [];
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async () => ({ ok: false, error }),
      get: pendingVideoTaskQuery
    }, {
      onFailed: (job) => {
        callbacks.push(`failed:${job.reservedCredits}`);
      }
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16"
      }
    });

    const completed = await service.runJob(job.id);

    expect(completed?.status).toBe("failed");
    expect(completed?.error).toEqual(error);
    expect(callbacks).toEqual(["failed:80"]);
  });

  it("keeps one provider submission in flight and does not overwrite cancellation", async () => {
    let createCalls = 0;
    let resolveCreate: (result: ProviderResult<CreatedVideoTask>) => void = () => undefined;
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async () => {
        createCalls += 1;
        return new Promise<ProviderResult<CreatedVideoTask>>((resolve) => {
          resolveCreate = resolve;
        });
      },
      get: pendingVideoTaskQuery
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16"
      }
    });

    const running = service.runJob(job.id);
    await service.runDueJobs();
    const canceled = await service.cancelJob(job.id);
    resolveCreate({
      ok: true,
      value: {
        id: "late-provider-task",
        status: "submitted",
        model: "kling-v2-5-turbo",
        provider: "yunwu",
        raw: {}
      }
    });
    const completed = await running;

    expect(createCalls).toBe(1);
    expect(canceled?.status).toBe("canceled");
    expect(completed?.status).toBe("canceled");
    expect(service.getJob(job.id)?.status).toBe("canceled");
  });

  it("runs due video jobs one at a time to keep memory low", async () => {
    let active = 0;
    let maxActive = 0;
    const submittedPrompts: string[] = [];
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async (input): Promise<ProviderResult<CreatedVideoTask>> => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        submittedPrompts.push(input.prompt);
        await new Promise((resolve) => setTimeout(resolve, 10));
        active -= 1;
        return {
          ok: true,
          value: {
            id: `task-${submittedPrompts.length}`,
            status: "submitted",
            model: "kling-v2-5-turbo",
            provider: "yunwu",
            raw: {}
          }
        };
      },
      get: pendingVideoTaskQuery
    });

    service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "first video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16"
      }
    });
    service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "second video",
        images: ["data:image/png;base64,def"],
        aspectRatio: "9:16"
      }
    });

    const results = await service.runDueJobs();

    expect(results).toHaveLength(2);
    expect(maxActive).toBe(1);
    expect(submittedPrompts.sort()).toEqual(["first video", "second video"]);
  });

  it("restores persisted source assets and submits after service reconstruction", async () => {
    const dataDir = mkdtempSync(path.join(os.tmpdir(), "video-job-service-"));
    try {
      const repository = new FileVideoJobRepository({ dataDir });
      const service = new VideoJobService(repository, {
        create: async () => {
          throw new Error("first service should not submit");
        },
        get: pendingVideoTaskQuery
      }, undefined, { dataDir });
      const job = service.createJob({
        customerId: "customer-1",
        reservedCredits: 80,
        videoInput: {
          prompt: "Create a product video",
          images: ["data:image/png;base64,YWJjZA=="],
          aspectRatio: "9:16"
        }
      });
      const serialized = serializeVideoJob(job);
      const submittedImages: string[][] = [];
      const restoredService = new VideoJobService(new FileVideoJobRepository({ dataDir }), {
        create: async (input: CreateVideoInput): Promise<ProviderResult<CreatedVideoTask>> => {
          submittedImages.push(input.images ?? []);
          return {
            ok: true,
            value: {
              id: "restored-provider-task",
              status: "submitted",
              model: "kling-v2-5-turbo",
              provider: "yunwu",
              raw: {}
            }
          };
        },
        get: pendingVideoTaskQuery
      }, undefined, { dataDir });

      const completed = await restoredService.runJob(job.id);

      expect(serialized.input.images).toEqual(["1 source image(s) omitted"]);
      expect(serialized.sourceAssets[0]).not.toHaveProperty("path");
      expect(completed?.status).toBe("submitted");
      expect(submittedImages[0]?.[0]).toBe("data:image/png;base64,YWJjZA==");
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it("polls submitted provider tasks and exposes a completed video result", async () => {
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async (): Promise<ProviderResult<CreatedVideoTask>> => ({
        ok: true,
        value: {
          id: "provider-task-ready",
          status: "submitted",
          model: "kling-v2-5-turbo",
          provider: "yunwu",
          raw: {}
        }
      }),
      get: async (task: CreatedVideoTask): Promise<ProviderResult<VideoTaskStatusUpdate>> => ({
        ok: true,
        value: {
          ...task,
          status: "succeeded",
          outputUrl: "data:video/mp4;base64,AAAA",
          raw: {
            data: { video_url: "data:video/mp4;base64,AAAA" },
            usage: { total_tokens: 108900, completion_tokens: 108900 },
            resolution: "480p",
            duration: 5,
            ratio: "9:16",
            generate_audio: false,
            service_tier: "default"
          }
        }
      })
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 80,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16",
        outputResolution: "480p",
        durationSeconds: 5
      }
    });

    const submitted = await service.runJob(job.id);
    const completed = await service.runJob(submitted!.id, { force: true });
    const serialized = serializeVideoJob(completed!);

    expect(completed?.status).toBe("succeeded");
    expect(completed?.result?.url).toBe("data:video/mp4;base64,AAAA");
    expect(completed?.providerUsage).toEqual(expect.objectContaining({
      totalTokens: 108900,
      completionTokens: 108900,
      requestedResolution: "480p",
      actualResolution: "480p",
      requestedDurationSeconds: 5,
      actualDurationSeconds: 5,
      costStatus: "missing_price"
    }));
    expect(completed?.providerMismatch).toBe(false);
    expect(serialized.result?.url).toBe("data:video/mp4;base64,AAAA");
    expect(serialized.result?.localUrl).toContain("/generated-videos/");
    expect(serialized.result).not.toHaveProperty("path");
  });

  it("estimates short-video credits by duration, references, and extra images", () => {
    expect(estimateVideoJobCredits({ images: ["one"], durationSeconds: 5, outputResolution: "480p" })).toBe(300);
    expect(estimateVideoJobCredits({ images: ["one"], metadata: { duration: "10s" } })).toBe(300);
    expect(estimateVideoJobCredits({ images: ["one"], metadata: { duration: "15s" } })).toBe(300);
    expect(estimateVideoJobCredits({ images: ["one"], durationSeconds: 10, outputResolution: "720p" })).toBe(300);
    expect(estimateVideoJobCredits({
      images: ["one", "two", "three"],
      metadata: { duration: "15s", referenceSourceType: "local_upload", referenceProcessingMode: "multi_frame" }
    })).toBe(410);
    expect(estimateVideoJobCredits({
      images: ["one"],
      metadata: { duration: "5s", referenceSourceType: "link", referenceProcessingMode: "full_video" }
    })).toBe(380);
  });

  it("marks provider mismatches when Ark returns a different resolution than requested", async () => {
    const service = new VideoJobService(new InMemoryVideoJobRepository(), {
      create: async (): Promise<ProviderResult<CreatedVideoTask>> => ({
        ok: true,
        value: {
          id: "provider-task-mismatch",
          status: "submitted",
          model: "doubao-seedance-2-0-fast-260128",
          provider: "ark",
          raw: {}
        }
      }),
      get: async (task: CreatedVideoTask): Promise<ProviderResult<VideoTaskStatusUpdate>> => ({
        ok: true,
        value: {
          ...task,
          status: "succeeded",
          outputUrl: "data:video/mp4;base64,AAAA",
          raw: {
            usage: { total_tokens: 324900 },
            resolution: "720p",
            duration: 15
          }
        }
      })
    });

    const job = service.createJob({
      customerId: "customer-1",
      reservedCredits: 50,
      videoInput: {
        prompt: "Create a product video",
        images: ["data:image/png;base64,abc"],
        aspectRatio: "9:16",
        outputResolution: "480p",
        durationSeconds: 5
      }
    });

    const submitted = await service.runJob(job.id);
    const completed = await service.runJob(submitted!.id, { force: true });

    expect(completed?.providerMismatch).toBe(true);
    expect(completed?.providerUsage).toEqual(expect.objectContaining({
      requestedResolution: "480p",
      actualResolution: "720p",
      requestedDurationSeconds: 5,
      actualDurationSeconds: 15
    }));
  });
});
