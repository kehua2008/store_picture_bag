import { describe, expect, it } from "vitest";
import { buildPromptRecipe } from "../../src/domain/prompts/recipes";
import { normalizeOpenAIError, OpenAIImageProvider } from "../../src/domain/provider/openaiImageProvider";

const recipe = buildPromptRecipe({
  product: { category: "shoes", title: "测试通勤包", color: "黑色" },
  assetType: "main_scene",
  referenceImage: { id: "ref", filename: "ref.jpg", mimeType: "image/jpeg" }
});

describe("OpenAIImageProvider", () => {
  it("returns missing config when no API key or client is configured", async () => {
    const provider = new OpenAIImageProvider({ apiKey: "" });

    const result = await provider.generate({
      recipe,
      referenceImage: { id: "ref", filename: "ref.jpg", mimeType: "image/jpeg" }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_missing_config");
      expect(result.error.retryable).toBe(false);
    }
  });

  it("normalizes generated images from an injected client", async () => {
    const provider = new OpenAIImageProvider({
      model: "gpt-image-2",
      client: {
        generate: async () => ({ data: [{ b64_json: "abcd" }] })
      }
    });

    const result = await provider.generate({
      recipe,
      referenceImage: { id: "ref", filename: "ref.jpg", mimeType: "image/jpeg" }
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]).toMatchObject({
        base64: "abcd",
        mimeType: "image/jpeg",
        width: 1340,
        height: 1785,
        model: "gpt-image-2",
        provider: "openai"
      });
    }
  });

  it("normalizes rate-limit errors", () => {
    const error = normalizeOpenAIError({ status: 429, message: "Too many requests" });

    expect(error).toEqual({
      code: "provider_rate_limited",
      message: "Too many requests",
      retryable: true
    });
  });
});
