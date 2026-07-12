import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { estimateVideoUpscaleCost, type VideoCostStatus } from "../billing/videoCosts";
import type { ProviderError } from "../provider/types";
import type {
  CreatedVideoUpscaleTask,
  CreateVideoUpscaleInput,
  VideoUpscaleProvider,
  VideoUpscaleTargetResolution,
  VideoUpscaleTaskStatusUpdate
} from "../provider/videoUpscaleProvider";
import { persistentDataDir } from "../../server/storagePaths";

export type VideoUpscaleSourceType = "videoJob" | "upload";
export type VideoUpscaleTaskStatus = "running" | "submitted" | "succeeded" | "failed" | "canceled";

export const videoUpscaleRetentionMs = 24 * 60 * 60 * 1000;
export const videoUpscalePollDelaysMs = [10_000, 15_000, 20_000, 30_000, 45_000, 60_000] as const;

export interface VideoUpscaleResultAsset {
  url?: string;
  localUrl?: string;
  filename?: string;
  mimeType?: string;
  path?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface VideoUpscaleUsage {
  provider: string;
  model: string;
  taskId: string;
  sourceResolution?: string;
  targetResolution: VideoUpscaleTargetResolution;
  durationSeconds?: number;
  totalTokens?: number;
  actualCostCny?: number;
  pricePerMillionTokensCny?: number;
  rawUsage?: Record<string, unknown>;
  costStatus: VideoCostStatus;
}

export interface VideoUpscaleTask {
  id: string;
  mode: "video_upscale";
  customerId: string;
  createdByActorId?: string;
  createdByActorName?: string;
  reservedCredits: number;
  chargedCredits?: number;
  status: VideoUpscaleTaskStatus;
  progress: { completed: number; total: number };
  sourceType: VideoUpscaleSourceType;
  sourceVideoJobId?: string;
  sourceAssetId?: string;
  sourceVideoUrl: string;
  sourcePreviewUrl?: string;
  sourceResolution?: string;
  targetResolution: VideoUpscaleTargetResolution;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
  pollCount: number;
  nextPollAt?: string;
  providerTask?: CreatedVideoUpscaleTask;
  usage?: VideoUpscaleUsage;
  result?: VideoUpscaleResultAsset;
  error?: ProviderError;
}

export type SerializableVideoUpscaleTask = Omit<VideoUpscaleTask, "result"> & {
  result?: Omit<VideoUpscaleResultAsset, "path">;
};

export interface VideoUpscaleTaskRepository {
  save(task: VideoUpscaleTask): VideoUpscaleTask;
  findById(id: string): VideoUpscaleTask | undefined;
  findByCustomerId(customerId: string): VideoUpscaleTask[];
  all(): VideoUpscaleTask[];
  deleteOlderThan(cutoffTime: number): VideoUpscaleTask[];
}

type VideoUpscaleTaskData = {
  tasks: VideoUpscaleTask[];
};

export class InMemoryVideoUpscaleTaskRepository implements VideoUpscaleTaskRepository {
  private readonly tasks = new Map<string, VideoUpscaleTask>();

  save(task: VideoUpscaleTask): VideoUpscaleTask {
    this.tasks.set(task.id, task);
    return task;
  }

  findById(id: string): VideoUpscaleTask | undefined {
    return this.tasks.get(id);
  }

  findByCustomerId(customerId: string): VideoUpscaleTask[] {
    return this.all().filter((task) => task.customerId === customerId).sort(sortByUpdatedDesc);
  }

  all(): VideoUpscaleTask[] {
    return Array.from(this.tasks.values()).sort(sortByUpdatedDesc);
  }

  deleteOlderThan(cutoffTime: number): VideoUpscaleTask[] {
    const deleted: VideoUpscaleTask[] = [];
    for (const task of this.tasks.values()) {
      if (retentionTimestamp(task) < cutoffTime) {
        this.tasks.delete(task.id);
        deleted.push(task);
      }
    }
    return deleted;
  }
}

export class FileVideoUpscaleTaskRepository implements VideoUpscaleTaskRepository {
  private readonly dataFile: string;
  private readonly cache = new Map<string, VideoUpscaleTask>();
  private loaded = false;

  constructor(options: { dataDir?: string } = {}) {
    this.dataFile = path.join(options.dataDir ?? persistentDataDir(), "video-upscale-tasks.json");
  }

  save(task: VideoUpscaleTask): VideoUpscaleTask {
    this.ensureLoaded();
    this.cache.set(task.id, task);
    this.persist();
    return task;
  }

  findById(id: string): VideoUpscaleTask | undefined {
    this.ensureLoaded();
    return this.cache.get(id);
  }

  findByCustomerId(customerId: string): VideoUpscaleTask[] {
    return this.all().filter((task) => task.customerId === customerId).sort(sortByUpdatedDesc);
  }

  all(): VideoUpscaleTask[] {
    this.ensureLoaded();
    return Array.from(this.cache.values()).sort(sortByUpdatedDesc);
  }

  deleteOlderThan(cutoffTime: number): VideoUpscaleTask[] {
    this.ensureLoaded();
    const deleted: VideoUpscaleTask[] = [];
    for (const task of this.cache.values()) {
      if (retentionTimestamp(task) < cutoffTime) {
        this.cache.delete(task.id);
        deleted.push(task);
      }
    }
    if (deleted.length) this.persist();
    return deleted;
  }

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = readFileSync(this.dataFile, "utf8");
      const parsed = JSON.parse(raw) as Partial<VideoUpscaleTaskData>;
      for (const task of parsed.tasks ?? []) this.cache.set(task.id, task);
    } catch {
      this.cache.clear();
    }
  }

  private persist(): void {
    mkdirSync(path.dirname(this.dataFile), { recursive: true });
    const data: VideoUpscaleTaskData = { tasks: Array.from(this.cache.values()).map(normalizeTaskForPersist) };
    const tempFile = `${this.dataFile}.tmp`;
    writeFileSync(tempFile, JSON.stringify(data, null, 2));
    renameSync(tempFile, this.dataFile);
  }
}

export class VideoUpscaleService {
  constructor(
    private readonly repository: VideoUpscaleTaskRepository,
    private readonly provider: VideoUpscaleProvider,
    private readonly options: {
      dataDir?: string;
      onSubmitted?: (task: VideoUpscaleTask) => Promise<void> | void;
      onFailed?: (task: VideoUpscaleTask) => Promise<void> | void;
      onCanceled?: (task: VideoUpscaleTask) => Promise<void> | void;
    } = {}
  ) {}

  isProviderConfigured(): boolean {
    return this.provider.isConfigured();
  }

  createTask(input: {
    customerId: string;
    createdByActorId?: string;
    createdByActorName?: string;
    sourceType: VideoUpscaleSourceType;
    sourceVideoJobId?: string;
    sourceAssetId?: string;
    sourceVideoUrl: string;
    sourcePreviewUrl?: string;
    sourceResolution?: string;
    targetResolution: VideoUpscaleTargetResolution;
    durationSeconds?: number;
    reservedCredits: number;
  }): VideoUpscaleTask {
    const now = new Date().toISOString();
    const task: VideoUpscaleTask = {
      id: `video-upscale-${crypto.randomUUID()}`,
      mode: "video_upscale",
      customerId: input.customerId,
      createdByActorId: input.createdByActorId,
      createdByActorName: input.createdByActorName,
      reservedCredits: input.reservedCredits,
      status: "running",
      progress: { completed: 0, total: 1 },
      sourceType: input.sourceType,
      sourceVideoJobId: input.sourceVideoJobId,
      sourceAssetId: input.sourceAssetId,
      sourceVideoUrl: input.sourceVideoUrl,
      sourcePreviewUrl: input.sourcePreviewUrl,
      sourceResolution: input.sourceResolution,
      targetResolution: input.targetResolution,
      durationSeconds: input.durationSeconds,
      createdAt: now,
      updatedAt: now,
      pollCount: 0
    };
    return this.repository.save(task);
  }

  async runTask(id: string, options: { now?: number } = {}): Promise<VideoUpscaleTask | undefined> {
    const task = this.repository.findById(id);
    if (!task || task.status === "succeeded" || task.status === "failed" || task.status === "canceled") return task;
    if (task.providerTask) return this.pollSubmittedTask(task, options.now ?? Date.now());

    const result = await this.provider.create({
      sourceVideoUrl: task.sourceVideoUrl,
      sourceResolution: task.sourceResolution,
      targetResolution: task.targetResolution,
      durationSeconds: task.durationSeconds
    });
    if (!result.ok) return this.failTask(task, result.error);

    const submitted: VideoUpscaleTask = {
      ...task,
      status: "submitted",
      progress: { completed: 0, total: 1 },
      chargedCredits: task.reservedCredits,
      providerTask: result.value,
      updatedAt: new Date(options.now ?? Date.now()).toISOString()
    };
    this.repository.save(submitted);
    await this.options.onSubmitted?.(submitted);
    return this.pollSubmittedTask(submitted, options.now ?? Date.now());
  }

  getTask(id: string): VideoUpscaleTask | undefined {
    return this.repository.findById(id);
  }

  listTasksForCustomer(customerId: string): VideoUpscaleTask[] {
    return this.repository.findByCustomerId(customerId);
  }

  async runDueTasks(now = Date.now()): Promise<VideoUpscaleTask[]> {
    const due = this.repository.all().filter((task) => task.status === "submitted" && isUpscalePollDue(task, now));
    const results: VideoUpscaleTask[] = [];
    for (const task of due) {
      const updated = await this.runTask(task.id, { now });
      if (updated) results.push(updated);
    }
    return results;
  }

  async cancelTask(id: string): Promise<VideoUpscaleTask | undefined> {
    const task = this.repository.findById(id);
    if (!task || task.status === "succeeded" || task.status === "failed" || task.status === "canceled") return task;
    const canceled: VideoUpscaleTask = {
      ...task,
      status: "canceled",
      progress: { completed: 0, total: 1 },
      updatedAt: new Date().toISOString(),
      nextPollAt: undefined
    };
    this.repository.save(canceled);
    await this.options.onCanceled?.(canceled);
    return this.repository.findById(id);
  }

  cleanupExpiredTasks(now = Date.now()): VideoUpscaleTask[] {
    return this.repository.deleteOlderThan(now - videoUpscaleRetentionMs);
  }

  private async failTask(task: VideoUpscaleTask, error: ProviderError): Promise<VideoUpscaleTask | undefined> {
    const failed: VideoUpscaleTask = {
      ...task,
      status: "failed",
      progress: { completed: 0, total: 1 },
      error,
      updatedAt: new Date().toISOString(),
      nextPollAt: undefined
    };
    this.repository.save(failed);
    await this.options.onFailed?.(failed);
    return this.repository.findById(task.id);
  }

  private async pollSubmittedTask(task: VideoUpscaleTask, now: number): Promise<VideoUpscaleTask | undefined> {
    if (!task.providerTask) return task;
    const pollCount = task.pollCount + 1;
    const result = await this.provider.get(task.providerTask);
    if (!result.ok) {
      if (!result.error.retryable) return this.failTask(task, result.error);
      const delayed = schedulePoll(task, pollCount, now, result.error);
      this.repository.save(delayed);
      return this.repository.findById(task.id);
    }
    if (isSucceededProviderStatus(result.value.status) && result.value.outputUrl) {
      const storedResult = await materializeVideoUpscaleResult(task.id, result.value.outputUrl, this.options.dataDir);
      const usage = buildUpscaleUsage(task, result.value);
      const succeeded: VideoUpscaleTask = {
        ...task,
        status: "succeeded",
        progress: { completed: 1, total: 1 },
        pollCount,
        nextPollAt: undefined,
        providerTask: result.value,
        usage,
        result: storedResult,
        updatedAt: new Date(now).toISOString()
      };
      this.repository.save(succeeded);
      return this.repository.findById(task.id);
    }
    const delayed = schedulePoll({ ...task, providerTask: result.value }, pollCount, now);
    this.repository.save(delayed);
    return this.repository.findById(task.id);
  }
}

export function serializeVideoUpscaleTask(task: VideoUpscaleTask): SerializableVideoUpscaleTask {
  return {
    ...task,
    result: task.result ? omitUpscaleResultPath(task.result) : undefined
  };
}

export function estimateVideoUpscaleCredits(input: {
  sourceResolution?: string;
  targetResolution: VideoUpscaleTargetResolution;
  durationSeconds?: number;
}): number | undefined {
  const table = loadCreditTable();
  const keys = [
    upscaleCreditKey(input.sourceResolution, input.targetResolution, input.durationSeconds),
    upscaleCreditKey(input.sourceResolution, input.targetResolution, undefined),
    upscaleCreditKey("any", input.targetResolution, input.durationSeconds),
    upscaleCreditKey("any", input.targetResolution, undefined),
    input.targetResolution
  ];
  for (const key of keys) {
    const value = table[key];
    if (Number.isInteger(value) && value > 0) return value;
  }
  return undefined;
}

export function hasVideoUpscalePricingConfigured(): boolean {
  return Object.keys(loadCreditTable()).length > 0;
}

export function allowMissingVideoUpscalePrice(): boolean {
  return process.env.VIDEO_UPSCALE_ALLOW_MISSING_PRICE === "true";
}

function buildUpscaleUsage(task: VideoUpscaleTask, update: VideoUpscaleTaskStatusUpdate): VideoUpscaleUsage {
  const rawUsage = recordAt(update.raw, "usage") ?? recordAt(update.raw, "data") ?? recordAt(update.raw, "output") ?? undefined;
  const totalTokens = numberAt(rawUsage, "total_tokens") ?? numberAt(rawUsage, "totalTokens");
  const cost = estimateVideoUpscaleCost({
    model: update.model,
    sourceResolution: task.sourceResolution,
    targetResolution: task.targetResolution,
    durationSeconds: task.durationSeconds,
    totalTokens
  });
  return {
    provider: update.provider,
    model: update.model,
    taskId: update.id,
    sourceResolution: task.sourceResolution,
    targetResolution: task.targetResolution,
    durationSeconds: task.durationSeconds,
    totalTokens,
    actualCostCny: cost.actualCostCny,
    pricePerMillionTokensCny: cost.pricePerMillionTokensCny,
    rawUsage,
    costStatus: cost.costStatus
  };
}

function schedulePoll(task: VideoUpscaleTask, pollCount: number, now: number, error?: ProviderError): VideoUpscaleTask {
  const delay = videoUpscalePollDelaysMs[Math.min(pollCount - 1, videoUpscalePollDelaysMs.length - 1)];
  return {
    ...task,
    status: "submitted",
    pollCount,
    nextPollAt: new Date(now + delay).toISOString(),
    error,
    updatedAt: new Date(now).toISOString()
  };
}

function isUpscalePollDue(task: VideoUpscaleTask, now: number): boolean {
  if (!task.nextPollAt) return true;
  return new Date(task.nextPollAt).getTime() <= now;
}

function isSucceededProviderStatus(status: string): boolean {
  return /succeed|success|completed|done/i.test(status);
}

function normalizeTaskForPersist(task: VideoUpscaleTask): VideoUpscaleTask {
  return {
    ...task,
    result: task.result ? omitUpscaleResultPath(task.result) : undefined
  };
}

function omitUpscaleResultPath(result: VideoUpscaleResultAsset): Omit<VideoUpscaleResultAsset, "path"> {
  const { path: _path, ...safeResult } = result;
  return safeResult;
}

function retentionTimestamp(task: Pick<VideoUpscaleTask, "createdAt" | "updatedAt">): number {
  return new Date(task.updatedAt || task.createdAt).getTime();
}

function sortByUpdatedDesc(left: VideoUpscaleTask, right: VideoUpscaleTask): number {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

async function materializeVideoUpscaleResult(taskId: string, outputUrl: string | undefined, dataDir = persistentDataDir()): Promise<VideoUpscaleResultAsset> {
  const createdAt = new Date().toISOString();
  if (!outputUrl) return { createdAt };

  const filename = `${safePathSegment(taskId)}.${extensionForVideoUrl(outputUrl)}`;
  const resultPath = path.join(dataDir, "generated-videos", filename);
  try {
    const bytes = await fetchVideoBytes(outputUrl);
    mkdirSync(path.dirname(resultPath), { recursive: true });
    writeFileSync(resultPath, bytes.buffer);
    return {
      url: outputUrl,
      localUrl: `/generated-videos/${filename}`,
      filename,
      mimeType: bytes.mimeType,
      path: resultPath,
      sizeBytes: bytes.buffer.length,
      createdAt
    };
  } catch {
    return {
      url: outputUrl,
      mimeType: contentTypeForVideoUrl(outputUrl),
      createdAt
    };
  }
}

async function fetchVideoBytes(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (url.startsWith("data:video/")) {
    const parsed = parseDataUrl(url);
    if (!parsed) throw new Error("invalid_video_data_url");
    return { buffer: parsed.buffer, mimeType: parsed.mimeType };
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("video_download_failed");
  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: response.headers.get("content-type")?.split(";")[0] ?? contentTypeForVideoUrl(url)
  };
}

function parseDataUrl(value: string): { mimeType: string; buffer: Buffer } | undefined {
  const match = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return undefined;
  return { mimeType: match[1] ?? "video/mp4", buffer: Buffer.from(match[2] ?? "", "base64") };
}

function contentTypeForVideoUrl(url: string): string {
  if (/\.webm(?:[?#].*)?$/i.test(url)) return "video/webm";
  if (/\.(mov|m4v)(?:[?#].*)?$/i.test(url)) return "video/quicktime";
  return "video/mp4";
}

function extensionForVideoUrl(url: string): string {
  if (/\.webm(?:[?#].*)?$/i.test(url)) return "webm";
  return "mp4";
}

function safePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
}

function recordAt(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = (value as Record<string, unknown>)[key];
  return raw && typeof raw === "object" ? raw as Record<string, unknown> : undefined;
}

function numberAt(value: Record<string, unknown> | undefined, key: string): number | undefined {
  const raw = value?.[key];
  const number = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  return Number.isFinite(number) ? number : undefined;
}

function loadCreditTable(): Record<string, number> {
  const raw = process.env.VIDEO_UPSCALE_CREDIT_TABLE_JSON;
  if (!raw) return defaultVideoUpscaleCreditTable;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const configured = Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, typeof value === "number" ? value : Number(value)])
        .filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
    );
    return Object.keys(configured).length ? { ...defaultVideoUpscaleCreditTable, ...configured } : defaultVideoUpscaleCreditTable;
  } catch {
    return defaultVideoUpscaleCreditTable;
  }
}

const defaultVideoUpscaleCreditTable: Record<string, number> = {
  "any|720p|any": 80,
  "any|1080p|any": 120,
  "any|2k|any": 200,
  "any|4k|any": 300,
  "720p": 80,
  "1080p": 120,
  "2k": 200,
  "4k": 300
};

function upscaleCreditKey(sourceResolution: string | undefined, targetResolution: string, durationSeconds?: number): string {
  const source = (sourceResolution ?? "unknown").toLowerCase();
  const duration = Number.isFinite(durationSeconds) ? `${Math.max(1, Math.trunc(durationSeconds as number))}s` : "any";
  return `${source}|${targetResolution.toLowerCase()}|${duration}`;
}
