import { describe, expect, it, vi } from "vitest";
import { YunwuVideoProvider } from "../../src/domain/provider/yunwuVideoProvider";

describe("YunwuVideoProvider", () => {
  it("returns missing config when no API key is configured", async () => {
    const provider = new YunwuVideoProvider({ apiKey: "" });

    const result = await provider.create({ prompt: "make a product video" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_missing_config");
      expect(result.error.message).toContain("YUNWU_API_KEY");
    }
  });

  it("uses the documented Doubao 2.0 route as the default video creation path", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "cgt-20260509165650-6rxbv",
        status: "submitted"
      })
    );
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://yunwu.ai",
      fetcher
    });

    const result = await provider.create({
      prompt: "make a product video",
      images: ["data:image/png;base64,abcd"],
      aspectRatio: "9:16",
      durationSeconds: 5,
      generateAudio: true,
      metadata: {
        sourceImageUrls: ["https://store.example.com/video-sources/job/source-1.png"]
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://yunwu.ai/api/v3/contents/generations/tasks",
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
      model: "doubao-seedance-2-0-260128",
      content: [
        {
          type: "text",
          text: "make a product video"
        },
        {
          type: "image_url",
          image_url: { url: "https://store.example.com/video-sources/job/source-1.png" },
          role: "reference_image"
        }
      ],
      generate_audio: true,
      ratio: "9:16",
      duration: 5,
      watermark: false
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("cgt-20260509165650-6rxbv");
      expect(result.value.model).toBe("doubao-seedance-2-0-260128");
    }
  });

  it("falls back to the configured legacy video route when the Doubao 2.0 route fails", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("Too many requests", { status: 429 }))
      .mockResolvedValueOnce(Response.json({
        code: 0,
        data: {
          task_id: "legacy-task-1",
          task_status: "submitted"
        }
      }));
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://yunwu.ai",
      fetcher,
      fallbackModel: "kling-v2-5-turbo",
      fallbackCreatePath: "/kling/v1/videos/image2video",
      fallbackStatusPath: "/kling/v1/videos/image2video/{id}"
    });

    const result = await provider.create({ prompt: "make animate", images: ["data:image/png;base64,abcd"] });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0][0]).toBe("https://yunwu.ai/api/v3/contents/generations/tasks");
    expect(fetcher.mock.calls[1][0]).toBe("https://yunwu.ai/kling/v1/videos/image2video");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("legacy-task-1");
      expect(result.value.model).toBe("kling-v2-5-turbo");
    }
  });

  it("creates a Kling image-to-video task with the configured Yunwu video API", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        code: 0,
        message: "SUCCEED",
        request_id: "795f5ea4-7746-4e3a-a184-75d44240f87f",
        data: {
          task_id: "814237883686625347",
          task_status: "submitted",
          created_at: 1762157958060,
          updated_at: 1762157958060
        }
      })
    );
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://yunwu.ai",
      model: "kling-v2-5-turbo",
      createPath: "/kling/v1/videos/image2video",
      fetcher
    });

    const result = await provider.create({
      prompt: "make animate",
      images: ["data:image/png;base64,abcd"],
      aspectRatio: "9:16",
      durationSeconds: 5
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://yunwu.ai/kling/v1/videos/image2video",
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
      model_name: "kling-v2-5-turbo",
      prompt: "make animate",
      negative_prompt: "",
      image_tail: "",
      aspect_ratio: "9:16",
      duration: "5",
      image: "abcd"
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("814237883686625347");
      expect(result.value.status).toBe("submitted");
      expect(result.value.statusUpdateTime).toBe(1762157958060);
      expect(result.value.model).toBe("kling-v2-5-turbo");
    }
  });

  it("rejects Kling image-to-video requests without an image", async () => {
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      model: "kling-v2-5-turbo",
      createPath: "/kling/v1/videos/image2video"
    });

    const result = await provider.create({ prompt: "make animate" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_bad_request");
      expect(result.error.message).toContain("requires one uploaded image");
    }
  });

  it("keeps the Veo body shape when a Veo model is explicitly configured", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "veo3-fast-frames:1757555257-PORrVn9sa9",
        status: "pending"
      })
    );
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      model: "veo3-fast-frames",
      createPath: "/v1/video/generations",
      fetcher
    });

    const result = await provider.create({
      prompt: "make animate",
      images: ["data:image/png;base64,abcd"],
      aspectRatio: "9:16"
    });

    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      enable_upsample: true,
      enhance_prompt: true,
      images: ["data:image/png;base64,abcd"],
      model: "veo3-fast-frames",
      prompt: "make animate",
      aspect_ratio: "9:16"
    });
    expect(result.ok).toBe(true);
  });

  it("normalizes empty success responses", async () => {
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      model: "kling-v2-5-turbo",
      createPath: "/kling/v1/videos/image2video",
      fetcher: async () => Response.json({ status: "pending" })
    });

    const result = await provider.create({ prompt: "make animate", images: ["abcd"] });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("provider_unknown");
  });

  it("queries video task status and extracts the output video url", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        data: {
          task_id: "task-1",
          task_status: "succeeded",
          task_result: {
            videos: [{ url: "https://cdn.example.com/result.mp4" }]
          }
        }
      })
    );
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://yunwu.ai",
      model: "kling-v2-5-turbo",
      createPath: "/kling/v1/videos/image2video",
      statusPath: "/kling/v1/videos/image2video/{id}",
      fetcher
    });

    const result = await provider.get({
      id: "task-1",
      status: "submitted",
      model: "kling-v2-5-turbo",
      provider: "yunwu",
      raw: {}
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://yunwu.ai/kling/v1/videos/image2video/task-1",
      expect.objectContaining({ method: "GET" })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("succeeded");
      expect(result.value.outputUrl).toBe("https://cdn.example.com/result.mp4");
    }
  });

  it("uses the documented Doubao 2.0 status path by default", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        content: {
          video_url: "https://cdn.example.com/doubao.mp4"
        },
        id: "cgt-20260509165650-6rxbv",
        model: "doubao-seedance-2-0-260128",
        status: "succeeded",
        updated_at: 1778317294
      })
    );
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://yunwu.ai",
      fetcher
    });

    const result = await provider.get({
      id: "cgt-20260509165650-6rxbv",
      status: "submitted",
      model: "doubao-seedance-2-0-260128",
      provider: "yunwu",
      raw: { providerRoute: "primary" }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://yunwu.ai/api/v3/contents/generations/tasks/cgt-20260509165650-6rxbv",
      expect.objectContaining({ method: "GET" })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("succeeded");
      expect(result.value.outputUrl).toBe("https://cdn.example.com/doubao.mp4");
    }
  });

  it("uses video-specific queue wording for video rate limits", async () => {
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      model: "kling-v2-5-turbo",
      createPath: "/kling/v1/videos/image2video",
      fetcher: async () => new Response("Too many requests", { status: 429 })
    });

    const result = await provider.create({ prompt: "make animate", images: ["abcd"] });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_rate_limited");
      expect(result.error.message).toContain("视频正在排队");
      expect(result.error.message).not.toContain("生图正在排队");
    }
  });

  it("aborts slow video task creation with a retryable timeout error", async () => {
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal as AbortSignal | undefined;
        const abort = () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        };
        if (signal?.aborted) abort();
        signal?.addEventListener("abort", abort, { once: true });
      })
    );
    const provider = new YunwuVideoProvider({
      apiKey: "test-key",
      model: "kling-v2-5-turbo",
      createPath: "/kling/v1/videos/image2video",
      fetcher,
      timeoutMs: 1
    });

    const result = await provider.create({ prompt: "make animate", images: ["abcd"] });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_timeout");
      expect(result.error.retryable).toBe(true);
    }
  });
});
