import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createVideoPromptWriter,
  FileVideoPromptWriterUsageRepository,
  OpenAICompatibleVideoPromptWriter,
  recordVideoPromptWriterUsage,
  VideoPromptWriterError
} from "../../src/domain/video/videoPromptWriter";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("OpenAICompatibleVideoPromptWriter", () => {
  it("calls an OpenAI-compatible model and returns an AI script", async () => {
    let requestedBody: unknown;
    const writer = new OpenAICompatibleVideoPromptWriter({
      apiKey: "test-key",
      baseUrl: "https://model.local",
      model: "writer-model",
      fetcher: (async (_url, init) => {
        requestedBody = JSON.parse(String(init?.body ?? "{}"));
        return new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                script: "视频总目标：突出针织衫柔软质感。\n1. 0-2秒 开场：商品近景进入。",
                summary: "已按针织衫需求生成。"
              })
            }
          }],
          usage: { prompt_tokens: 120, completion_tokens: 201, total_tokens: 321 }
        }), { status: 200 });
      }) as typeof fetch
    });

    const result = await writer.write({
      mode: "draft",
      brief: "突出柔软面料",
      productImages: ["data:image/png;base64,abc"],
      productAnalysis: { itemText: "针织衫", summary: "已读取商品图", assetLine: "knit.png" },
      platform: "抖音",
      videoType: "商品主图",
      durationSeconds: 5,
      outputResolution: "480p",
      musicMode: "ai_music",
      voiceoverMode: "none",
      subtitleMode: "ai_subtitle"
    });

    expect(result).toEqual(expect.objectContaining({
      script: expect.stringContaining("针织衫"),
      summary: "已按针织衫需求生成。",
      provider: "openai_compatible",
      model: "writer-model",
      providerUsage: { prompt_tokens: 120, completion_tokens: 201, total_tokens: 321 },
      promptTokens: 120,
      completionTokens: 201,
      totalTokens: 321,
      costStatus: "missing_price",
      source: "ai"
    }));
    expect(requestedBody).toEqual(expect.objectContaining({
      model: "writer-model",
      response_format: { type: "json_object" }
    }));
  });

  it("fails explicitly when no model key is configured", async () => {
    const writer = new OpenAICompatibleVideoPromptWriter({ apiKey: "" });

    await expect(writer.write({
      mode: "draft",
      productImages: ["data:image/png;base64,abc"],
      platform: "抖音",
      videoType: "商品主图",
      durationSeconds: 5,
      outputResolution: "480p"
    })).rejects.toBeInstanceOf(VideoPromptWriterError);
  });

  it("falls back past empty environment variables to the existing Yunwu API config", async () => {
    process.env.VIDEO_PROMPT_WRITER_API_KEY = "";
    process.env.STYLE_VISION_API_KEY = "";
    process.env.YUNWU_API_KEY = "yunwu-key";
    process.env.VIDEO_PROMPT_WRITER_BASE_URL = "";
    process.env.STYLE_VISION_BASE_URL = "";
    process.env.YUNWU_BASE_URL = "https://yunwu.ai";
    process.env.VIDEO_PROMPT_WRITER_MODEL = "";
    process.env.STYLE_VISION_MODEL = "";

    const writer = createVideoPromptWriter();

    expect(writer).toBeInstanceOf(OpenAICompatibleVideoPromptWriter);
  });

  it("records prompt writer usage and estimates configured cost", () => {
    const dataDir = mkdtempSync(path.join(os.tmpdir(), "vpw-usage-"));
    const oldPriceTable = process.env.VIDEO_PROMPT_WRITER_PRICE_TABLE_JSON;
    process.env.VIDEO_PROMPT_WRITER_PRICE_TABLE_JSON = JSON.stringify({
      "writer-model": {
        inputPerMillionCny: 10,
        outputPerMillionCny: 20
      }
    });
    try {
      const repository = new FileVideoPromptWriterUsageRepository({ dataDir });
      const record = recordVideoPromptWriterUsage({
        customerId: "customer-1",
        mode: "draft",
        imageCount: 2,
        result: {
          script: "script",
          summary: "summary",
          provider: "yunwu",
          model: "writer-model",
          providerUsage: { prompt_tokens: 1000, completion_tokens: 2000, total_tokens: 3000 },
          promptTokens: 1000,
          completionTokens: 2000,
          totalTokens: 3000,
          estimatedCostCny: 0.05,
          costStatus: "estimated_from_usage",
          source: "ai"
        }
      }, repository);

      expect(record).toEqual(expect.objectContaining({
        customerId: "customer-1",
        provider: "yunwu",
        model: "writer-model",
        promptTokens: 1000,
        completionTokens: 2000,
        totalTokens: 3000,
        imageCount: 2,
        estimatedCostCny: 0.05,
        costStatus: "estimated_from_usage"
      }));
      expect(repository.all()).toHaveLength(1);
    } finally {
      process.env.VIDEO_PROMPT_WRITER_PRICE_TABLE_JSON = oldPriceTable;
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
