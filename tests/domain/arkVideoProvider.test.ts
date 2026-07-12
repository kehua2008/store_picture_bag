import { describe, expect, it, vi } from "vitest";
import { ArkVideoProvider } from "../../src/domain/provider/arkVideoProvider";

describe("ArkVideoProvider", () => {
  it("returns missing config when no API key is configured", async () => {
    const provider = new ArkVideoProvider({ apiKey: "" });

    const result = await provider.create({ prompt: "make a product video" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_missing_config");
      expect(result.error.message).toContain("ARK_VIDEO_API_KEY");
    }
  });

  it("creates a Seedance task using Ark content generation body shape", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "cgt-123",
        status: "pending",
        created_at: 1762157958060
      })
    );
    const provider = new ArkVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://ark.cn-beijing.volces.com",
      model: "doubao-seedance-2-0-260128",
      fetcher,
      generateAudio: true,
      watermark: false
    });

    const result = await provider.create({
      prompt: "first-person fruit tea ad",
      images: [
        "https://ark-project.tos-cn-beijing.volces.com/doc_image/r2v_tea_pic1.jpg",
        "https://ark-project.tos-cn-beijing.volces.com/doc_image/r2v_tea_pic2.jpg"
      ],
      aspectRatio: "16:9",
      durationSeconds: 11,
      outputResolution: "720p",
      metadata: {
        sourceImageUrls: [
          "http://47.120.21.152/video-sources/video-1/source-1.jpg",
          "http://47.120.21.152/video-sources/video-1/source-2.jpg"
        ],
        resolvedReferenceVideoUrl: "https://ark-project.tos-cn-beijing.volces.com/doc_video/r2v_tea_video1.mp4",
        referenceAudioLink: "https://ark-project.tos-cn-beijing.volces.com/doc_audio/r2v_tea_audio1.mp3"
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks",
      expect.objectContaining({
        method: "POST",
        headers: {
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
          text: "first-person fruit tea ad"
        },
        {
          type: "image_url",
          image_url: { url: "http://47.120.21.152/video-sources/video-1/source-1.jpg" },
          role: "reference_image"
        },
        {
          type: "image_url",
          image_url: { url: "http://47.120.21.152/video-sources/video-1/source-2.jpg" },
          role: "reference_image"
        },
        {
          type: "video_url",
          video_url: { url: "https://ark-project.tos-cn-beijing.volces.com/doc_video/r2v_tea_video1.mp4" },
          role: "reference_video"
        },
        {
          type: "audio_url",
          audio_url: { url: "https://ark-project.tos-cn-beijing.volces.com/doc_audio/r2v_tea_audio1.mp3" },
          role: "reference_audio"
        }
      ],
      generate_audio: true,
      ratio: "16:9",
      duration: 11,
      resolution: "720p",
      watermark: false
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("cgt-123");
      expect(result.value.status).toBe("pending");
      expect(result.value.model).toBe("doubao-seedance-2-0-260128");
    }
  });

  it("defaults Ark draft tasks to 480p when no output resolution is provided", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "cgt-480",
        status: "pending"
      })
    );
    const provider = new ArkVideoProvider({
      apiKey: "test-key",
      fetcher,
      generateAudio: false,
      watermark: false
    });

    const result = await provider.create({
      prompt: "make a low cost draft",
      images: ["data:image/jpeg;base64,abcd"],
      durationSeconds: 5
    });

    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual(expect.objectContaining({
      duration: 5,
      resolution: "480p"
    }));
    expect(result.ok).toBe(true);
  });

  it("uses the per-task audio setting when provided", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "cgt-audio-off",
        status: "pending"
      })
    );
    const provider = new ArkVideoProvider({
      apiKey: "test-key",
      fetcher,
      generateAudio: true,
      watermark: false
    });

    await provider.create({
      prompt: "make a silent product video",
      generateAudio: false
    });

    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual(expect.objectContaining({
      generate_audio: false
    }));
  });


  it("does not pass raw user reference links as Ark reference videos", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "cgt-raw-link",
        status: "pending"
      })
    );
    const provider = new ArkVideoProvider({
      apiKey: "test-key",
      fetcher,
      generateAudio: false,
      watermark: false
    });

    await provider.create({
      prompt: "make a product video",
      images: ["data:image/jpeg;base64,abc"],
      metadata: {
        referenceLink: "https://v.douyin.com/example/"
      }
    });

    const init = fetcher.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body)) as { content: Array<{ type: string }> };
    expect(body.content.some((item) => item.type === "video_url")).toBe(false);
  });

  it("queries Ark task status and extracts the output video url", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        id: "cgt-123",
        status: "succeeded",
        content: {
          video_url: "https://cdn.example.com/result.mp4"
        }
      })
    );
    const provider = new ArkVideoProvider({
      apiKey: "test-key",
      baseUrl: "https://ark.cn-beijing.volces.com",
      statusPath: "/api/v3/contents/generations/tasks/{id}",
      fetcher
    });

    const result = await provider.get({
      id: "cgt-123",
      status: "pending",
      model: "doubao-seedance-2-0-260128",
      provider: "ark",
      raw: {}
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/cgt-123",
      expect.objectContaining({ method: "GET" })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("succeeded");
      expect(result.value.outputUrl).toBe("https://cdn.example.com/result.mp4");
    }
  });
});
