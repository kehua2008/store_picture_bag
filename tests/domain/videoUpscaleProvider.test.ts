import { describe, expect, it, vi } from "vitest";
import { HttpVideoUpscaleProvider } from "../../src/domain/provider/videoUpscaleProvider";

describe("HttpVideoUpscaleProvider", () => {
  it("creates Volcengine AI MediaKit enhance-video tasks", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        success: true,
        task_id: "amk-tool-enhance-video-1703200",
        request_id: "20260415150000F6DE4C24A6A0D94B7FF1"
      })
    );
    const provider = new HttpVideoUpscaleProvider({
      apiKey: "test-key",
      fetcher
    });

    const result = await provider.create({
      sourceVideoUrl: "https://example.com/source.mp4",
      sourceResolution: "480p",
      targetResolution: "1080p",
      durationSeconds: 6
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://mediakit.cn-beijing.volces.com/api/v1/tools/enhance-video",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer test-key",
          "Content-Type": "application/json"
        }
      })
    );
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      video_url: "https://example.com/source.mp4",
      scene: "aigc",
      resolution: "1080p",
      fps: 50
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("amk-tool-enhance-video-1703200");
      expect(result.value.status).toBe("submitted");
      expect(result.value.provider).toBe("volcengine_mediakit");
    }
  });

  it("queries completed MediaKit tasks and extracts result.video_url", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        success: true,
        task_id: "amk-tool-enhance-video-1703200",
        task_type: "enhance-video",
        status: "completed",
        result: {
          duration: 5.967,
          fps: 50,
          resolution: "1080p",
          tool_version: "standard",
          video_url: "https://example.volcvideo.com/enhanced_video.mp4?auth_key=test"
        }
      })
    );
    const provider = new HttpVideoUpscaleProvider({
      apiKey: "test-key",
      fetcher
    });

    const result = await provider.get({
      id: "amk-tool-enhance-video-1703200",
      status: "submitted",
      model: "volcengine-mediakit-enhance-video",
      provider: "volcengine_mediakit",
      raw: {}
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://mediakit.cn-beijing.volces.com/api/v1/tasks/amk-tool-enhance-video-1703200",
      expect.objectContaining({
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer test-key"
        }
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("completed");
      expect(result.value.outputUrl).toBe("https://example.volcvideo.com/enhanced_video.mp4?auth_key=test");
    }
  });

  it("falls back to the Ark video key when a dedicated MediaKit key is not set", () => {
    const previousArkKey = process.env.ARK_VIDEO_API_KEY;
    const previousUpscaleKey = process.env.VIDEO_UPSCALE_API_KEY;
    process.env.ARK_VIDEO_API_KEY = "ark-key";
    delete process.env.VIDEO_UPSCALE_API_KEY;
    const provider = new HttpVideoUpscaleProvider();
    expect(provider.isConfigured()).toBe(true);
    if (previousArkKey === undefined) delete process.env.ARK_VIDEO_API_KEY;
    else process.env.ARK_VIDEO_API_KEY = previousArkKey;
    if (previousUpscaleKey === undefined) delete process.env.VIDEO_UPSCALE_API_KEY;
    else process.env.VIDEO_UPSCALE_API_KEY = previousUpscaleKey;
  });
});
