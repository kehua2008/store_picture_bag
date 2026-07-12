import { describe, expect, it } from "vitest";
import {
  estimateVideoUpscaleCredits,
  hasVideoUpscalePricingConfigured,
  InMemoryVideoUpscaleTaskRepository,
  serializeVideoUpscaleTask,
  VideoUpscaleService
} from "../../src/domain/jobs/videoUpscaleService";
import type { ProviderResult } from "../../src/domain/provider/types";
import type {
  CreatedVideoUpscaleTask,
  VideoUpscaleProvider,
  VideoUpscaleTaskStatusUpdate
} from "../../src/domain/provider/videoUpscaleProvider";

describe("VideoUpscaleService", () => {
  it("creates independent upscale tasks and records completed results", async () => {
    const callbacks: string[] = [];
    const provider: VideoUpscaleProvider = {
      name: "test-upscale",
      isConfigured: () => true,
      create: async (): Promise<ProviderResult<CreatedVideoUpscaleTask>> => ({
        ok: true,
        value: {
          id: "upscale-provider-task-1",
          status: "submitted",
          model: "upscale-model",
          provider: "test-upscale",
          raw: { task_id: "upscale-provider-task-1" }
        }
      }),
      get: async (task): Promise<ProviderResult<VideoUpscaleTaskStatusUpdate>> => ({
        ok: true,
        value: {
          ...task,
          status: "succeeded",
          outputUrl: "data:video/mp4;base64,AAAA",
          raw: { usage: { total_tokens: 2000 } }
        }
      })
    };
    const service = new VideoUpscaleService(new InMemoryVideoUpscaleTaskRepository(), provider, {
      onSubmitted: (task) => {
        callbacks.push(`submitted:${task.reservedCredits}`);
      }
    });

    const task = service.createTask({
      customerId: "customer-1",
      sourceType: "videoJob",
      sourceVideoJobId: "video-job-1",
      sourceVideoUrl: "https://example.com/source.mp4",
      sourceResolution: "480p",
      targetResolution: "1080p",
      durationSeconds: 5,
      reservedCredits: 30
    });
    const completed = await service.runTask(task.id);
    const serialized = serializeVideoUpscaleTask(completed!);

    expect(completed?.status).toBe("succeeded");
    expect(completed?.chargedCredits).toBe(30);
    expect(completed?.usage?.targetResolution).toBe("1080p");
    expect(completed?.usage?.totalTokens).toBe(2000);
    expect(completed?.result?.localUrl).toContain("/generated-videos/");
    expect("path" in (serialized.result ?? {})).toBe(false);
    expect(callbacks).toEqual(["submitted:30"]);
  });

  it("uses default Volcengine MediaKit upscale credits and allows overrides", () => {
    const previous = process.env.VIDEO_UPSCALE_CREDIT_TABLE_JSON;
    delete process.env.VIDEO_UPSCALE_CREDIT_TABLE_JSON;
    expect(hasVideoUpscalePricingConfigured()).toBe(true);
    expect(estimateVideoUpscaleCredits({ sourceResolution: "480p", targetResolution: "720p", durationSeconds: 5 })).toBe(80);
    expect(estimateVideoUpscaleCredits({ sourceResolution: "480p", targetResolution: "1080p", durationSeconds: 5 })).toBe(120);
    expect(estimateVideoUpscaleCredits({ sourceResolution: "480p", targetResolution: "2k", durationSeconds: 5 })).toBe(200);
    expect(estimateVideoUpscaleCredits({ sourceResolution: "480p", targetResolution: "4k", durationSeconds: 5 })).toBe(300);
    process.env.VIDEO_UPSCALE_CREDIT_TABLE_JSON = JSON.stringify({ "480p|1080p|5s": 66 });
    expect(estimateVideoUpscaleCredits({ sourceResolution: "480p", targetResolution: "1080p", durationSeconds: 5 })).toBe(66);
    if (previous === undefined) delete process.env.VIDEO_UPSCALE_CREDIT_TABLE_JSON;
    else process.env.VIDEO_UPSCALE_CREDIT_TABLE_JSON = previous;
  });
});
