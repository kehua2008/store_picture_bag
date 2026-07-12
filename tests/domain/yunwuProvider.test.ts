import { describe, expect, it, vi } from "vitest";
import { buildApparelPromptRecipe } from "../../src/domain/prompts/apparelRecipe";
import { normalizeYunwuResponseError, YunwuImageProvider } from "../../src/domain/provider/yunwuImageProvider";

const recipe = buildApparelPromptRecipe({
  platform: "vipshop",
  category: "women",
  scene: "studio",
  size: "portrait"
});

describe("YunwuImageProvider", () => {
  it("returns missing config when no API key is configured", async () => {
    const provider = new YunwuImageProvider({ apiKey: "" });

    const result = await provider.generate({
      recipe,
      referenceImage: { id: "ref", filename: "ref.jpg", mimeType: "image/jpeg", file: new Blob(["x"]) }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_missing_config");
      expect(result.error.message).toContain("YUNWU_API_KEY");
    }
  });

  it("constructs multipart form data for image edits", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({ data: [{ b64_json: "abcd" }, { url: "https://cdn.example/out.png" }] })
    );
    const provider = new YunwuImageProvider({
      apiKey: "test-key",
      baseUrl: "https://yunwu.ai",
      model: "gpt-image-2",
      fetcher
    });

    const result = await provider.generate({
      recipe,
      n: 2,
      referenceImage: {
        id: "ref",
        filename: "coat.jpg",
        mimeType: "image/jpeg",
        file: new Blob(["image"], { type: "image/jpeg" })
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://yunwu.ai/v1/images/edits",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer test-key"
        }
      })
    );
    const init = fetcher.mock.calls[0][1] as RequestInit;
    const form = init.body as FormData;
    expect(form.get("model")).toBe("gpt-image-2");
    expect(form.get("prompt")).toContain("Preserve the exact bag product");
    expect(form.get("n")).toBe("2");
    expect(form.get("quality")).toBe("high");
    expect(form.get("size")).toBe("1024x1536");
    expect(form.get("image")).toBeInstanceOf(Blob);
    expect(form.getAll("image")).toHaveLength(1);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0].base64).toBe("abcd");
      expect(result.value[1].url).toBe("https://cdn.example/out.png");
    }
  });

  it("aborts slow image requests with a friendly timeout error", async () => {
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      })
    );
    const provider = new YunwuImageProvider({
      apiKey: "test-key",
      fetcher,
      timeoutMs: 1
    });

    const result = await provider.generate({
      recipe,
      referenceImage: { id: "ref", filename: "ref.jpg", mimeType: "image/jpeg", file: new Blob(["x"]) }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("provider_timeout");
      expect(result.error.retryable).toBe(true);
      expect(result.error.message).toContain("你太有眼光了");
      expect(result.error.message).toContain("生图正在排队");
    }
  });

  it("sends custom model references as a second image", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
      Response.json({ data: [{ b64_json: "abcd" }] })
    );
    const provider = new YunwuImageProvider({
      apiKey: "test-key",
      fetcher
    });

    await provider.generate({
      recipe,
      referenceImage: {
        id: "ref",
        filename: "coat.jpg",
        mimeType: "image/jpeg",
        file: new Blob(["image"], { type: "image/jpeg" })
      },
      modelReferenceImage: {
        id: "model",
        filename: "model.jpg",
        mimeType: "image/jpeg",
        file: new Blob(["model"], { type: "image/jpeg" })
      }
    });

    const init = fetcher.mock.calls[0][1] as RequestInit;
    const form = init.body as FormData;
    expect(form.getAll("image")).toHaveLength(2);
    expect(form.getAll("image")[0]).toBeInstanceOf(Blob);
    expect(form.getAll("image")[1]).toBeInstanceOf(Blob);
  });

  it("normalizes empty success responses and provider errors", async () => {
    const emptyProvider = new YunwuImageProvider({
      apiKey: "test-key",
      fetcher: async () => Response.json({ data: [] })
    });

    const empty = await emptyProvider.generate({
      recipe,
      referenceImage: { id: "ref", filename: "ref.jpg", mimeType: "image/jpeg", file: new Blob(["x"]) }
    });
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("provider_unknown");

    const rateLimit = await normalizeYunwuResponseError(
      new Response("Bearer secret-key Too many requests", { status: 429 })
    );
    expect(rateLimit).toEqual({
      code: "provider_rate_limited",
      message: expect.stringContaining("生图正在排队"),
      retryable: true
    });
  });
});
