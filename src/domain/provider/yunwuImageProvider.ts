import type { GenerateImageInput, GeneratedImage, ImageProvider, ProviderError, ProviderResult } from "./types";

interface YunwuImageProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

type YunwuImageItem = {
  b64_json?: string;
  url?: string;
};

export class YunwuImageProvider implements ImageProvider {
  readonly name = "yunwu";
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: YunwuImageProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.YUNWU_API_KEY;
    this.baseUrl = (options.baseUrl ?? process.env.YUNWU_BASE_URL ?? "https://yunwu.ai").replace(/\/$/, "");
    this.model = options.model ?? process.env.YUNWU_IMAGE_MODEL ?? "gpt-image-2";
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? Number(process.env.YUNWU_IMAGE_TIMEOUT_MS), 600_000);
  }

  async generate(input: GenerateImageInput): Promise<ProviderResult<GeneratedImage[]>> {
    if (!this.apiKey) {
      return {
        ok: false,
        error: {
          code: "provider_missing_config",
          message: "YUNWU_API_KEY is not configured on the server.",
          retryable: false
        }
      };
    }

    const referenceImages = input.referenceImages?.length ? input.referenceImages : [input.referenceImage];
    const primaryImage = await referenceToBlob(referenceImages[0]);
    if (!primaryImage) {
      return {
        ok: false,
        error: {
          code: "provider_bad_request",
          message: "Uploaded image data is missing.",
          retryable: false
        }
      };
    }
    const additionalImages = await Promise.all(referenceImages.slice(1).map((image) => referenceToBlob(image)));
    const modelReferenceImage = input.modelReferenceImage ? await referenceToBlob(input.modelReferenceImage) : undefined;

    const size = `${input.recipe.target.width}x${input.recipe.target.height}`;
    const form = new FormData();
    form.append("image", primaryImage, referenceImages[0].filename);
    for (let index = 0; index < additionalImages.length; index += 1) {
      const image = additionalImages[index];
      const reference = referenceImages[index + 1];
      if (!image || !reference) continue;
      form.append("image", image, reference.filename);
    }
    if (modelReferenceImage && input.modelReferenceImage) {
      form.append("image", modelReferenceImage, input.modelReferenceImage.filename);
    }
    form.append("prompt", input.recipe.providerPrompt);
    form.append("model", this.model);
    form.append("n", String(input.n ?? 1));
    form.append("quality", "high");
    form.append("size", size);

    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;

    try {
      const response = await this.fetcher(`${this.baseUrl}/v1/images/edits`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: form,
        signal: controller.signal
      });

      if (!response.ok) {
        return { ok: false, error: await normalizeYunwuResponseError(response) };
      }

      const json = await response.json().catch(() => ({}));
      const data =
        typeof json === "object" && json !== null && "data" in json && Array.isArray(json.data)
          ? (json.data as YunwuImageItem[])
          : [];

      if (data.length === 0) {
        return {
          ok: false,
          error: {
            code: "provider_unknown",
            message: "Yunwu returned no generated images.",
            retryable: true
          }
        };
      }

      return {
        ok: true,
        value: data.map((item, index) => ({
          id: `yunwu-${Date.now()}-${index}`,
          base64: item.b64_json ?? "",
          url: item.url,
          mimeType: "image/png",
          width: input.recipe.target.width,
          height: input.recipe.target.height,
          model: this.model,
          provider: this.name,
          sourceFilename: input.referenceImage.filename
        }))
      };
    } catch (error) {
      return { ok: false, error: normalizeYunwuError(error) };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export async function referenceToBlob(referenceImage: GenerateImageInput["referenceImage"]): Promise<Blob | undefined> {
  if (referenceImage.file) return referenceImage.file;
  if (!referenceImage.dataUrl) return undefined;

  const [header, payload] = referenceImage.dataUrl.split(",", 2);
  if (!payload) return undefined;
  const mimeType = header.match(/^data:([^;]+);base64$/)?.[1] ?? referenceImage.mimeType;
  const binary = Buffer.from(payload, "base64");
  return new Blob([binary], { type: mimeType });
}

export async function normalizeYunwuResponseError(response: Response): Promise<ProviderError> {
  const body = await response.text().catch(() => "");
  const message = sanitizeProviderMessage(body || response.statusText || "Yunwu image generation failed.");

  if (response.status === 429) {
    return { code: "provider_rate_limited", message: busyQueueMessage(), retryable: true };
  }

  if (response.status >= 400 && response.status < 500) {
    return { code: "provider_bad_request", message, retryable: false };
  }

  return { code: "provider_unknown", message, retryable: true };
}

export function normalizeYunwuError(error: unknown): ProviderError {
  if (isAbortError(error)) {
    return {
      code: "provider_timeout",
      message: busyQueueMessage(),
      retryable: true
    };
  }

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: string }).message)
      : "Yunwu image generation failed.";

  return { code: "provider_unknown", message: sanitizeProviderMessage(message), retryable: true };
}

function normalizeTimeoutMs(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.trunc(value as number));
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    ("name" in error && String((error as { name?: unknown }).name) === "AbortError")
  );
}

function busyQueueMessage(): string {
  return "你太有眼光了，当前也有很多用户在生成同款高级效果，生图正在排队中。请稍等一会儿后重试，我们会按实际成功图片扣除积分，未完成部分会释放冻结积分。";
}

function sanitizeProviderMessage(message: string): string {
  return message.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, "Bearer [redacted]");
}
