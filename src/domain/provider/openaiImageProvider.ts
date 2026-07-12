import OpenAI from "openai";
import type { GenerateImageInput, GeneratedImage, ImageProvider, ProviderError, ProviderResult } from "./types";

interface OpenAIImageProviderOptions {
  apiKey?: string;
  model?: string;
  client?: ImageGenerationClient;
}

interface ImageGenerationClient {
  generate(input: Record<string, unknown>): Promise<unknown>;
}

export class OpenAIImageProvider implements ImageProvider {
  readonly name = "openai";
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly client?: ImageGenerationClient;

  constructor(options: OpenAIImageProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
    this.client = options.client;
  }

  async generate(input: GenerateImageInput): Promise<ProviderResult<GeneratedImage[]>> {
    if (!this.apiKey && !this.client) {
      return {
        ok: false,
        error: {
          code: "provider_missing_config",
          message: "OPENAI_API_KEY is not configured on the server.",
          retryable: false
        }
      };
    }

    try {
      const client = this.client ?? (new OpenAI({ apiKey: this.apiKey }).images as unknown as ImageGenerationClient);
      const response = await client.generate({
        model: this.model,
        prompt: input.recipe.providerPrompt,
        size: `${input.recipe.target.width}x${input.recipe.target.height}`,
        quality: "high",
        output_format: "jpeg"
      });

      const data =
        typeof response === "object" && response !== null && "data" in response && Array.isArray(response.data)
          ? response.data
          : [];
      const images = data.map((item: unknown, index: number): GeneratedImage => {
        const record = item as { b64_json?: string };
        return {
          id: `openai-${Date.now()}-${index}`,
          base64: record.b64_json ?? "",
          mimeType: "image/jpeg",
          width: input.recipe.target.width,
          height: input.recipe.target.height,
          model: this.model,
          provider: this.name
        };
      });

      return { ok: true, value: images };
    } catch (error) {
      return { ok: false, error: normalizeOpenAIError(error) };
    }
  }
}

export function normalizeOpenAIError(error: unknown): ProviderError {
  const status = typeof error === "object" && error !== null && "status" in error ? (error as { status?: number }).status : undefined;
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: string }).message)
      : "OpenAI image generation failed.";

  if (status === 429) {
    return { code: "provider_rate_limited", message, retryable: true };
  }

  if (status && status >= 400 && status < 500) {
    return { code: "provider_bad_request", message, retryable: false };
  }

  return { code: "provider_unknown", message, retryable: true };
}
