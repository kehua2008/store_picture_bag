import type { ProviderError, ProviderResult } from "./types";

interface YunwuVideoProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  createPath?: string;
  statusPath?: string;
  fallbackModel?: string;
  fallbackCreatePath?: string;
  fallbackStatusPath?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

export interface CreateVideoInput {
  prompt: string;
  images?: string[];
  aspectRatio?: string;
  durationSeconds?: number;
  outputResolution?: "480p" | "720p";
  generateAudio?: boolean;
  referenceStrength?: "light" | "medium" | "heavy";
  referenceAssetId?: string;
  enhancePrompt?: boolean;
  enableUpsample?: boolean;
  model?: string;
  metadata?: {
    referenceLink?: string;
    resolvedReferenceVideoUrl?: string;
    referenceProcessingMode?: "none" | "single_frame" | "multi_frame" | "full_video";
    referenceAudioLink?: string;
    [key: string]: unknown;
  };
}

export interface CreatedVideoTask {
  id: string;
  status: string;
  statusUpdateTime?: number;
  model: string;
  provider: string;
  raw: unknown;
}

export interface VideoTaskStatusUpdate extends CreatedVideoTask {
  outputUrl?: string;
  error?: ProviderError;
}

type YunwuVideoCreateResponse = {
  id?: string;
  status?: string;
  status_update_time?: number;
  code?: number;
  message?: string;
  request_id?: string;
  data?: {
    task_id?: string;
    task_status?: string;
    created_at?: number;
    updated_at?: number;
  };
};

type VideoRouteConfig = {
  model?: string;
  createPath?: string;
  statusPath?: string;
  label: "primary" | "fallback";
};

const defaultDoubaoVideoModel = "doubao-seedance-2-0-260128";
const defaultDoubaoVideoCreatePath = "/api/v3/contents/generations/tasks";
const defaultDoubaoVideoStatusPath = "/api/v3/contents/generations/tasks/{id}";

export class YunwuVideoProvider {
  readonly name = "yunwu";
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly primaryRoute: VideoRouteConfig;
  private readonly fallbackRoute?: VideoRouteConfig;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: YunwuVideoProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.YUNWU_API_KEY;
    this.baseUrl = (options.baseUrl ?? process.env.YUNWU_BASE_URL ?? "https://yunwu.ai").replace(/\/$/, "");
    this.primaryRoute = {
      model: nonEmptyString(options.model ?? process.env.YUNWU_VIDEO_PRIMARY_MODEL) ?? defaultDoubaoVideoModel,
      createPath: normalizeOptionalPath(options.createPath ?? process.env.YUNWU_VIDEO_PRIMARY_CREATE_PATH) ?? defaultDoubaoVideoCreatePath,
      statusPath: normalizeOptionalPath(options.statusPath ?? process.env.YUNWU_VIDEO_PRIMARY_STATUS_PATH) ?? defaultDoubaoVideoStatusPath,
      label: "primary"
    };
    this.fallbackRoute = normalizeRoute({
      model: options.fallbackModel ?? process.env.YUNWU_VIDEO_MODEL,
      createPath: options.fallbackCreatePath ?? process.env.YUNWU_VIDEO_CREATE_PATH,
      statusPath: options.fallbackStatusPath ?? process.env.YUNWU_VIDEO_STATUS_PATH,
      label: "fallback"
    }, this.primaryRoute);
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? Number(process.env.YUNWU_VIDEO_TIMEOUT_MS), 120_000);
  }

  async create(input: CreateVideoInput): Promise<ProviderResult<CreatedVideoTask>> {
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
    const prompt = input.prompt.trim();
    if (!prompt) {
      return {
        ok: false,
        error: {
          code: "provider_bad_request",
          message: "Video prompt is required.",
          retryable: false
        }
      };
    }

    const primary = await this.createWithRoute(input, this.primaryRoute, prompt);
    if (primary.ok || !shouldAttemptFallback(primary.error) || !this.fallbackRoute?.model || !this.fallbackRoute.createPath) {
      return primary;
    }

    return this.createWithRoute(input, this.fallbackRoute, prompt);
  }

  private async createWithRoute(input: CreateVideoInput, route: VideoRouteConfig, prompt: string): Promise<ProviderResult<CreatedVideoTask>> {
    if (!route.model) {
      return missingVideoConfig(route.label === "primary" ? "YUNWU_VIDEO_PRIMARY_MODEL" : "YUNWU_VIDEO_MODEL");
    }
    if (!route.createPath) {
      return missingVideoConfig(route.label === "primary" ? "YUNWU_VIDEO_PRIMARY_CREATE_PATH" : "YUNWU_VIDEO_CREATE_PATH");
    }

    const model = route.model;
    if (model.startsWith("kling-") && !input.images?.[0]) {
      return {
        ok: false,
        error: {
          code: "provider_bad_request",
          message: "Kling image-to-video requires one uploaded image.",
          retryable: false
        }
      };
    }

    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetcher(`${this.baseUrl}${route.createPath}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify(buildCreateVideoBody({ ...input, model, prompt }, route.createPath))
      });

      if (!response.ok) return { ok: false, error: await normalizeYunwuVideoResponseError(response) };

      const json = await response.json().catch(() => ({})) as YunwuVideoCreateResponse;
      const taskId = resolveTaskId(json);
      if (!taskId) {
        return {
          ok: false,
          error: {
            code: "provider_unknown",
            message: "Yunwu returned no video task id.",
            retryable: true
          }
        };
      }

      return {
        ok: true,
        value: {
          id: taskId,
          status: resolveTaskStatus(json),
          statusUpdateTime: resolveStatusUpdateTime(json),
          model,
          provider: this.name,
          raw: { ...json, providerRoute: route.label }
        }
      };
    } catch (error) {
      return { ok: false, error: normalizeYunwuVideoError(error) };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  async get(task: CreatedVideoTask): Promise<ProviderResult<VideoTaskStatusUpdate>> {
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

    const route = this.routeForTask(task) ?? this.primaryRoute;
    if (!route.statusPath) return missingVideoConfig(route.label === "primary" ? "YUNWU_VIDEO_PRIMARY_STATUS_PATH" : "YUNWU_VIDEO_STATUS_PATH");

    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetcher(`${this.baseUrl}${pathForTask(route.statusPath, task.id)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        signal: controller.signal
      });

      if (!response.ok) return { ok: false, error: await normalizeYunwuVideoResponseError(response) };

      const json = await response.json().catch(() => ({})) as YunwuVideoCreateResponse & Record<string, unknown>;
      const bodyError = providerBodyError(json);
      if (bodyError) return { ok: false, error: bodyError };

      return {
        ok: true,
        value: {
          id: resolveTaskId(json) ?? task.id,
          status: resolveTaskStatus(json),
          statusUpdateTime: resolveStatusUpdateTime(json),
          model: task.model,
          provider: this.name,
          outputUrl: findFirstVideoUrl(json),
          raw: { ...json, providerRoute: route.label }
        }
      };
    } catch (error) {
      return { ok: false, error: normalizeYunwuVideoError(error) };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private routeForTask(task: CreatedVideoTask): VideoRouteConfig | undefined {
    const rawRoute = task.raw && typeof task.raw === "object" ? (task.raw as Record<string, unknown>).providerRoute : undefined;
    if (rawRoute === "fallback") return this.fallbackRoute;
    if (rawRoute === "primary") return this.primaryRoute;
    if (this.fallbackRoute?.model && this.fallbackRoute.model === task.model) return this.fallbackRoute;
    if (this.primaryRoute.model === task.model) return this.primaryRoute;
    return undefined;
  }
}

function normalizeRoute(route: VideoRouteConfig, primaryRoute: VideoRouteConfig): VideoRouteConfig | undefined {
  const normalized = {
    ...route,
    model: nonEmptyString(route.model),
    createPath: normalizeOptionalPath(route.createPath),
    statusPath: normalizeOptionalPath(route.statusPath)
  };
  if (!normalized.model && !normalized.createPath && !normalized.statusPath) return undefined;
  if (
    normalized.model === primaryRoute.model &&
    normalized.createPath === primaryRoute.createPath &&
    normalized.statusPath === primaryRoute.statusPath
  ) {
    return undefined;
  }
  return normalized;
}

function normalizeOptionalPath(path: string | undefined): string | undefined {
  const value = nonEmptyString(path);
  if (!value) return undefined;
  return value.startsWith("/") ? value : `/${value}`;
}

function nonEmptyString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function missingVideoConfig(name: string): ProviderResult<never> {
  return {
    ok: false,
    error: {
      code: "provider_missing_config",
      message: `${name} is not configured on the server. Video generation requires a dedicated Yunwu video model and API path.`,
      retryable: false
    }
  };
}

function normalizeTimeoutMs(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.trunc(value as number));
}

function pathForTask(path: string, id: string): string {
  const encodedId = encodeURIComponent(id);
  if (path.includes("{id}")) return path.replaceAll("{id}", encodedId);
  return `${path.replace(/\/$/, "")}/${encodedId}`;
}

function buildCreateVideoBody(input: Required<Pick<CreateVideoInput, "model" | "prompt">> & CreateVideoInput, createPath?: string) {
  const images = input.images ?? [];
  if (isDoubaoContentGenerationRoute(input.model, createPath)) {
    return buildDoubaoContentGenerationBody(input, createPath);
  }

  if (input.model.startsWith("kling-")) {
    return {
      model_name: input.model,
      prompt: input.prompt,
      negative_prompt: "",
      image_tail: "",
      aspect_ratio: input.aspectRatio ?? "1:1",
      duration: String(input.durationSeconds ?? 5),
      image: stripDataUrlPrefix(images[0] ?? "")
    };
  }

  if (input.model.startsWith("sora-")) {
    return {
      images,
      model: input.model,
      orientation: orientationForAspectRatio(input.aspectRatio ?? "16:9"),
      prompt: input.prompt,
      size: "large",
      duration: input.durationSeconds ?? 15,
      watermark: false,
      private: true
    };
  }

  return {
    enable_upsample: input.enableUpsample ?? true,
    enhance_prompt: input.enhancePrompt ?? true,
    images,
    model: input.model,
    prompt: input.prompt,
    aspect_ratio: input.aspectRatio ?? "16:9"
  };
}

function buildDoubaoContentGenerationBody(input: Required<Pick<CreateVideoInput, "model" | "prompt">> & CreateVideoInput, createPath?: string) {
  const isV3 = createPath?.includes("/api/v3/contents/generations/tasks") ?? false;
  const aspectRatio = input.aspectRatio ?? "1:1";
  const duration = input.durationSeconds ?? 5;
  const images = sourceImageUrls(input) ?? input.images ?? [];
  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: isV3 ? input.prompt : appendDoubaoPromptOptions(input.prompt, aspectRatio, duration)
    },
    ...images.map((url) => ({
      type: "image_url",
      image_url: { url },
      role: "reference_image"
    }))
  ];

  if (!isV3) {
    return {
      model: input.model,
      content
    };
  }

  return {
    model: input.model,
    content,
    generate_audio: input.generateAudio ?? false,
    ratio: aspectRatio,
    duration,
    watermark: false
  };
}

function sourceImageUrls(input: CreateVideoInput): string[] | undefined {
  const value = input.metadata?.sourceImageUrls;
  if (!Array.isArray(value)) return undefined;
  const urls = value.filter((item): item is string => typeof item === "string" && /^https?:\/\//i.test(item));
  return urls.length ? urls : undefined;
}

function appendDoubaoPromptOptions(prompt: string, aspectRatio: string, duration: number): string {
  const options = [
    `--ratio ${aspectRatio}`,
    `--duration ${duration}`,
    "--watermark false"
  ];
  return `${prompt} ${options.join(" ")}`;
}

function isDoubaoContentGenerationRoute(model: string, createPath?: string): boolean {
  if (!model.startsWith("doubao-")) return false;
  return createPath?.includes("/contents/generations/tasks") ?? false;
}

function orientationForAspectRatio(aspectRatio: string) {
  if (aspectRatio === "9:16" || aspectRatio === "4:5" || aspectRatio === "3:4") return "portrait";
  if (aspectRatio === "1:1") return "square";
  return "landscape";
}

function stripDataUrlPrefix(value: string) {
  const [, payload] = value.split(",", 2);
  return payload ?? value;
}

function resolveTaskId(response: YunwuVideoCreateResponse) {
  return response.data?.task_id ?? response.id ?? response.request_id;
}

function resolveTaskStatus(response: YunwuVideoCreateResponse) {
  return response.data?.task_status ?? response.status ?? stringAt(response, ["data", "status"]) ?? stringAt(response, ["data", "task_status"]) ?? "pending";
}

function resolveStatusUpdateTime(response: YunwuVideoCreateResponse) {
  return response.data?.updated_at ?? response.status_update_time;
}

function providerBodyError(response: Record<string, unknown>): ProviderError | undefined {
  const code = typeof response.code === "number" ? response.code : undefined;
  const message = typeof response.message === "string" ? response.message : undefined;
  if (code === undefined || code === 0) return undefined;
  const lower = (message ?? "").toLowerCase();
  const retryable = code === 429 || lower.includes("rate") || lower.includes("busy") || lower.includes("queue");
  return {
    code: retryable ? "provider_rate_limited" : "provider_unknown",
    message: retryable ? videoBusyQueueMessage() : (message || "Yunwu video task query failed."),
    retryable
  };
}

function shouldAttemptFallback(error: ProviderError): boolean {
  return error.retryable || error.code === "provider_bad_request" || error.code === "provider_unknown";
}

async function normalizeYunwuVideoResponseError(response: Response): Promise<ProviderError> {
  const body = await response.text().catch(() => "");
  const message = sanitizeProviderMessage(body || response.statusText || "Yunwu video generation failed.");

  if (response.status === 429) {
    return { code: "provider_rate_limited", message: videoBusyQueueMessage(), retryable: true };
  }

  if (response.status >= 400 && response.status < 500) {
    return { code: "provider_bad_request", message, retryable: false };
  }

  return { code: "provider_unknown", message, retryable: true };
}

function normalizeYunwuVideoError(error: unknown): ProviderError {
  if (isAbortError(error)) {
    return {
      code: "provider_timeout",
      message: videoBusyQueueMessage(),
      retryable: true
    };
  }

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: string }).message)
      : "Yunwu video generation failed.";

  return { code: "provider_unknown", message: sanitizeProviderMessage(message), retryable: true };
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    ("name" in error && String((error as { name?: unknown }).name) === "AbortError")
  );
}

function sanitizeProviderMessage(message: string): string {
  return message.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, "Bearer [redacted]");
}

function findFirstVideoUrl(value: unknown): string | undefined {
  return findFirstUrl(value, []);
}

function findFirstUrl(value: unknown, keyPath: string[]): string | undefined {
  if (typeof value === "string") {
    if (!/^https?:\/\//i.test(value) && !value.startsWith("data:video/")) return undefined;
    const keyHint = keyPath.join(".").toLowerCase();
    if (/\.(mp4|mov|webm|m3u8)(\?|#|$)/i.test(value) || keyHint.includes("video") || keyHint.includes("url")) return value;
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstUrl(item, keyPath);
      if (found) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== "object") return undefined;
  const entries = Object.entries(value as Record<string, unknown>);
  const prioritized = [
    ...entries.filter(([key]) => /video|url|output|result/i.test(key)),
    ...entries.filter(([key]) => !/video|url|output|result/i.test(key))
  ];
  for (const [key, nested] of prioritized) {
    const found = findFirstUrl(nested, [...keyPath, key]);
    if (found) return found;
  }
  return undefined;
}

function stringAt(value: unknown, path: string[]): string | undefined {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

function videoBusyQueueMessage(): string {
  return "你太有眼光了，当前也有很多用户在生成同款高级视频，视频正在排队中。请稍等一会儿后重试，我们会按实际成功视频扣除积分，未完成会释放冻结积分。";
}
