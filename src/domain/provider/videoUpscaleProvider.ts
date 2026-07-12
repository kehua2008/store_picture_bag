import type { ProviderError, ProviderResult } from "./types";

export type VideoUpscaleTargetResolution = "720p" | "1080p" | "2k" | "4k";

export interface CreateVideoUpscaleInput {
  sourceVideoUrl: string;
  sourceResolution?: string;
  targetResolution: VideoUpscaleTargetResolution;
  durationSeconds?: number;
  model?: string;
  fps?: number;
  scene?: string;
}

export interface CreatedVideoUpscaleTask {
  id: string;
  status: string;
  model: string;
  provider: string;
  raw: unknown;
}

export interface VideoUpscaleTaskStatusUpdate extends CreatedVideoUpscaleTask {
  outputUrl?: string;
  error?: ProviderError;
}

export interface VideoUpscaleProvider {
  readonly name: string;
  isConfigured(): boolean;
  create(input: CreateVideoUpscaleInput): Promise<ProviderResult<CreatedVideoUpscaleTask>>;
  get(task: CreatedVideoUpscaleTask): Promise<ProviderResult<VideoUpscaleTaskStatusUpdate>>;
}

type VideoUpscaleProviderOptions = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  createPath?: string;
  statusPath?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export class HttpVideoUpscaleProvider implements VideoUpscaleProvider {
  readonly name = "volcengine_mediakit";
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model?: string;
  private readonly createPath?: string;
  private readonly statusPath?: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: VideoUpscaleProviderOptions = {}) {
    this.apiKey = nonEmptyString(options.apiKey ?? process.env.VIDEO_UPSCALE_API_KEY ?? process.env.ARK_VIDEO_API_KEY);
    this.baseUrl = (options.baseUrl ?? process.env.VIDEO_UPSCALE_BASE_URL ?? "https://mediakit.cn-beijing.volces.com").replace(/\/$/, "");
    this.model = nonEmptyString(options.model ?? process.env.VIDEO_UPSCALE_MODEL ?? "volcengine-mediakit-enhance-video");
    this.createPath = normalizeOptionalPath(options.createPath ?? process.env.VIDEO_UPSCALE_CREATE_PATH) ?? "/api/v1/tools/enhance-video";
    this.statusPath = normalizeOptionalPath(options.statusPath ?? process.env.VIDEO_UPSCALE_STATUS_PATH) ?? "/api/v1/tasks/{id}";
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? Number(process.env.VIDEO_UPSCALE_TIMEOUT_MS), 120_000);
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.createPath && this.statusPath);
  }

  async create(input: CreateVideoUpscaleInput): Promise<ProviderResult<CreatedVideoUpscaleTask>> {
    if (!this.isConfigured()) return missingUpscaleConfig();
    const model = input.model ?? this.model!;
    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetcher(`${this.baseUrl}${this.createPath}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          video_url: input.sourceVideoUrl,
          scene: input.scene ?? "aigc",
          resolution: normalizeTargetResolution(input.targetResolution),
          fps: normalizeFps(input.fps)
        })
      });
      if (!response.ok) return { ok: false, error: await normalizeUpscaleResponseError(response) };
      const json = await response.json().catch(() => ({})) as Record<string, unknown>;
      const taskId = resolveTaskId(json);
      if (!taskId) {
        return { ok: false, error: { code: "provider_unknown", message: "超分供应商没有返回任务 ID。", retryable: true } };
      }
      return {
        ok: true,
        value: {
          id: taskId,
          status: resolveTaskStatus(json),
          model,
          provider: this.name,
          raw: json
        }
      };
    } catch (error) {
      return { ok: false, error: normalizeUpscaleError(error) };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  async get(task: CreatedVideoUpscaleTask): Promise<ProviderResult<VideoUpscaleTaskStatusUpdate>> {
    if (!this.isConfigured()) return missingUpscaleConfig();
    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetcher(`${this.baseUrl}${pathForTask(this.statusPath!, task.id)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        signal: controller.signal
      });
      if (!response.ok) return { ok: false, error: await normalizeUpscaleResponseError(response) };
      const json = await response.json().catch(() => ({})) as Record<string, unknown>;
      const bodyError = providerBodyError(json);
      if (bodyError) return { ok: false, error: bodyError };
      return {
        ok: true,
        value: {
          id: resolveTaskId(json) ?? task.id,
          status: resolveTaskStatus(json),
          model: task.model,
          provider: task.provider,
          outputUrl: findFirstVideoUrl(json),
          raw: json
        }
      };
    } catch (error) {
      return { ok: false, error: normalizeUpscaleError(error) };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export class UnconfiguredVideoUpscaleProvider implements VideoUpscaleProvider {
  readonly name = "unconfigured";

  isConfigured(): boolean {
    return false;
  }

  async create(): Promise<ProviderResult<CreatedVideoUpscaleTask>> {
    return missingUpscaleConfig();
  }

  async get(): Promise<ProviderResult<VideoUpscaleTaskStatusUpdate>> {
    return missingUpscaleConfig();
  }
}

function missingUpscaleConfig(): ProviderResult<never> {
  return {
    ok: false,
    error: {
      code: "provider_missing_config",
      message: "火山 AI MediaKit 超分服务未配置，请设置 VIDEO_UPSCALE_API_KEY 或 ARK_VIDEO_API_KEY。",
      retryable: false
    }
  };
}

function normalizeOptionalPath(value: string | undefined): string | undefined {
  const path = nonEmptyString(value);
  if (!path) return undefined;
  return path.startsWith("/") ? path : `/${path}`;
}

function nonEmptyString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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

function resolveTaskId(json: Record<string, unknown>): string | undefined {
  const data = objectAt(json, "data");
  return stringAt(json, "id") ?? stringAt(json, "task_id") ?? stringAt(data, "id") ?? stringAt(data, "task_id");
}

function resolveTaskStatus(json: Record<string, unknown>): string {
  const data = objectAt(json, "data");
  return stringAt(json, "status") ?? stringAt(json, "task_status") ?? stringAt(data, "status") ?? stringAt(data, "task_status") ?? "submitted";
}

function findFirstVideoUrl(json: unknown): string | undefined {
  if (typeof json === "string") return /^https?:\/\//i.test(json) || json.startsWith("data:video/") ? json : undefined;
  if (!json || typeof json !== "object") return undefined;
  const record = json as Record<string, unknown>;
  for (const key of ["video_url", "url", "output_url", "outputUrl", "download_url", "localUrl"]) {
    const value = stringAt(record, key);
    if (value && (/^https?:\/\//i.test(value) || value.startsWith("data:video/"))) return value;
  }
  for (const value of Object.values(record)) {
    const found = findFirstVideoUrl(value);
    if (found) return found;
  }
  return undefined;
}

function providerBodyError(json: Record<string, unknown>): ProviderError | undefined {
  const success = booleanAt(json, "success");
  if (success === true) return undefined;
  const code = stringAt(json, "code") ?? stringAt(json, "error_code");
  const message = stringAt(json, "message") ?? stringAt(json, "error") ?? stringAt(json, "error_msg");
  if (!message || code === "0" || code?.toLowerCase() === "success") return undefined;
  return { code: isRetryableProviderMessage(message) ? "provider_rate_limited" : "provider_unknown", message, retryable: isRetryableProviderMessage(message) };
}

async function normalizeUpscaleResponseError(response: Response): Promise<ProviderError> {
  const text = await response.text().catch(() => "");
  let message = text || response.statusText || "超分供应商请求失败。";
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    message = stringAt(json, "message") ?? stringAt(json, "error") ?? message;
  } catch {
    // Keep text response.
  }
  return {
    code: response.status === 429 ? "provider_rate_limited" : "provider_unknown",
    message,
    retryable: response.status >= 500 || response.status === 408 || response.status === 429
  };
}

function normalizeUpscaleError(error: unknown): ProviderError {
  if (error instanceof Error && error.name === "AbortError") {
    return { code: "provider_timeout", message: "超分供应商请求超时。", retryable: true };
  }
  return {
    code: "provider_unknown",
    message: error instanceof Error ? error.message : "超分供应商网络请求失败。",
    retryable: true
  };
}

function objectAt(value: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const nested = value[key];
  return nested && typeof nested === "object" ? nested as Record<string, unknown> : undefined;
}

function stringAt(value: Record<string, unknown> | undefined, key: string): string | undefined {
  const raw = value?.[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function booleanAt(value: Record<string, unknown> | undefined, key: string): boolean | undefined {
  const raw = value?.[key];
  return typeof raw === "boolean" ? raw : undefined;
}

function normalizeTargetResolution(value: VideoUpscaleTargetResolution): string {
  return value.toLowerCase();
}

function normalizeFps(value: number | undefined): number {
  if (!Number.isFinite(value)) return 50;
  return Math.max(1, Math.min(120, Math.trunc(value as number)));
}

function isRetryableProviderMessage(message: string): boolean {
  return /timeout|busy|rate|limit|try again|稍后|繁忙|超时/i.test(message);
}
