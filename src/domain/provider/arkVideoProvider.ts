import type { ProviderResult } from "./types";
import { normalizeYunwuError, normalizeYunwuResponseError } from "./yunwuImageProvider";
import type { CreateVideoInput, CreatedVideoTask, VideoTaskStatusUpdate } from "./yunwuVideoProvider";

interface ArkVideoProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  createPath?: string;
  statusPath?: string;
  fetcher?: typeof fetch;
  generateAudio?: boolean;
  watermark?: boolean;
  timeoutMs?: number;
}

type ArkContentItem =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string }; role: "reference_image" }
  | { type: "video_url"; video_url: { url: string }; role: "reference_video" }
  | { type: "audio_url"; audio_url: { url: string }; role: "reference_audio" };

type ArkVideoCreateResponse = {
  id?: string;
  task_id?: string;
  status?: string;
  model?: string;
  created_at?: number;
  updated_at?: number;
  request_id?: string;
  error?: {
    code?: string;
    message?: string;
  };
  data?: {
    id?: string;
    task_id?: string;
    status?: string;
  };
};

export class ArkVideoProvider {
  readonly name = "ark";
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly createPath: string;
  private readonly statusPath: string;
  private readonly fetcher: typeof fetch;
  private readonly generateAudio: boolean;
  private readonly watermark: boolean;
  private readonly timeoutMs: number;

  constructor(options: ArkVideoProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.ARK_VIDEO_API_KEY;
    this.baseUrl = (options.baseUrl ?? process.env.ARK_VIDEO_BASE_URL ?? "https://ark.cn-beijing.volces.com").replace(/\/$/, "");
    this.model = options.model ?? process.env.ARK_VIDEO_MODEL ?? "doubao-seedance-2-0-260128";
    this.createPath = normalizePath(options.createPath ?? process.env.ARK_VIDEO_CREATE_PATH ?? "/api/v3/contents/generations/tasks");
    this.statusPath = normalizePath(options.statusPath ?? process.env.ARK_VIDEO_STATUS_PATH ?? `${this.createPath}/{id}`);
    this.fetcher = options.fetcher ?? fetch;
    this.generateAudio = options.generateAudio ?? parseBoolean(process.env.ARK_VIDEO_GENERATE_AUDIO, true);
    this.watermark = options.watermark ?? parseBoolean(process.env.ARK_VIDEO_WATERMARK, false);
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? Number(process.env.ARK_VIDEO_TIMEOUT_MS), 120_000);
  }

  async create(input: CreateVideoInput): Promise<ProviderResult<CreatedVideoTask>> {
    if (!this.apiKey) {
      return {
        ok: false,
        error: {
          code: "provider_missing_config",
          message: "ARK_VIDEO_API_KEY is not configured on the server.",
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

    const model = input.model ?? this.model;
    const body = buildArkCreateVideoBody({
      ...input,
      model,
      prompt,
      generateAudio: input.generateAudio ?? this.generateAudio,
      watermark: this.watermark
    });

    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetcher(`${this.baseUrl}${this.createPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        return { ok: false, error: await normalizeYunwuResponseError(response) };
      }

      const json = await response.json().catch(() => ({})) as ArkVideoCreateResponse;
      const taskId = resolveArkTaskId(json);
      if (!taskId) {
        return {
          ok: false,
          error: {
            code: "provider_unknown",
            message: "Ark returned no video task id.",
            retryable: true
          }
        };
      }

      return {
        ok: true,
        value: {
          id: taskId,
          status: resolveArkTaskStatus(json),
          statusUpdateTime: resolveArkStatusUpdateTime(json),
          model,
          provider: this.name,
          raw: json
        }
      };
    } catch (error) {
      return { ok: false, error: normalizeYunwuError(error) };
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
          message: "ARK_VIDEO_API_KEY is not configured on the server.",
          retryable: false
        }
      };
    }

    const controller = new AbortController();
    const timeout = this.timeoutMs > 0 ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetcher(`${this.baseUrl}${pathForTask(this.statusPath, task.id)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        signal: controller.signal
      });

      if (!response.ok) {
        return { ok: false, error: await normalizeYunwuResponseError(response) };
      }

      const json = await response.json().catch(() => ({})) as ArkVideoCreateResponse & Record<string, unknown>;
      return {
        ok: true,
        value: {
          id: resolveArkTaskId(json) ?? task.id,
          status: resolveArkTaskStatus(json),
          statusUpdateTime: resolveArkStatusUpdateTime(json),
          model: task.model,
          provider: this.name,
          outputUrl: findFirstVideoUrl(json),
          raw: json
        }
      };
    } catch (error) {
      return { ok: false, error: normalizeYunwuError(error) };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

function buildArkCreateVideoBody(input: Required<Pick<CreateVideoInput, "model" | "prompt">> & CreateVideoInput & { generateAudio: boolean; watermark: boolean }) {
  const images = sourceImageUrls(input) ?? input.images ?? [];
  const content: ArkContentItem[] = [
    {
      type: "text",
      text: input.prompt
    },
    ...images.slice(0, 6).map((url) => ({
      type: "image_url" as const,
      image_url: { url },
      role: "reference_image" as const
    })),
    ...buildReferenceVideoContent(input.metadata?.resolvedReferenceVideoUrl),
    ...buildReferenceAudioContent(input.metadata?.referenceAudioLink)
  ];

  return {
    model: input.model,
    content,
    generate_audio: input.generateAudio,
    ratio: input.aspectRatio ?? "9:16",
    duration: clampDurationSeconds(input.durationSeconds ?? 15),
    resolution: normalizeResolution(input.outputResolution),
    watermark: input.watermark
  };
}

function sourceImageUrls(input: CreateVideoInput): string[] | undefined {
  const value = input.metadata?.sourceImageUrls;
  if (!Array.isArray(value)) return undefined;
  const urls = value.filter((item): item is string => typeof item === "string" && /^https?:\/\//i.test(item));
  return urls.length ? urls : undefined;
}

function buildReferenceVideoContent(referenceLink?: string): ArkContentItem[] {
  const url = referenceLink?.trim();
  if (!url || !/^https?:\/\//i.test(url)) return [];
  return [
    {
      type: "video_url",
      video_url: { url },
      role: "reference_video"
    }
  ];
}

function buildReferenceAudioContent(referenceAudioLink?: string): ArkContentItem[] {
  const url = referenceAudioLink?.trim();
  if (!url || !/^https?:\/\//i.test(url)) return [];
  return [
    {
      type: "audio_url",
      audio_url: { url },
      role: "reference_audio"
    }
  ];
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function pathForTask(path: string, id: string): string {
  const encodedId = encodeURIComponent(id);
  if (path.includes("{id}")) return path.replaceAll("{id}", encodedId);
  return `${path.replace(/\/$/, "")}/${encodedId}`;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function normalizeTimeoutMs(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.trunc(value as number));
}

function clampDurationSeconds(value: number) {
  if (!Number.isFinite(value)) return 15;
  return Math.max(1, Math.min(15, Math.round(value)));
}

function normalizeResolution(value?: string) {
  const resolution = value?.trim().toLowerCase();
  if (resolution === "720p") return "720p";
  return "480p";
}

function resolveArkTaskId(response: ArkVideoCreateResponse) {
  return response.data?.task_id ?? response.data?.id ?? response.task_id ?? response.id ?? response.request_id;
}

function resolveArkTaskStatus(response: ArkVideoCreateResponse) {
  return response.data?.status ?? response.status ?? "pending";
}

function resolveArkStatusUpdateTime(response: ArkVideoCreateResponse) {
  return response.updated_at ?? response.created_at;
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
