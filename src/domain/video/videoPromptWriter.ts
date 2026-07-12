import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { persistentDataDir } from "../../server/storagePaths";

export type VideoPromptWriterMode = "draft" | "revise";
export type VideoPromptWriterCostStatus = "missing_price" | "estimated_from_usage";

export type VideoPromptWriterInput = {
  mode: VideoPromptWriterMode;
  brief?: string;
  currentScript?: string;
  revision?: string;
  productImages: string[];
  productAnalysis?: {
    itemText?: string;
    summary?: string;
    assetLine?: string;
  };
  platform: string;
  videoType: string;
  durationSeconds: number;
  outputResolution: string;
  musicMode?: string;
  voiceoverMode?: string;
  subtitleMode?: string;
  voiceoverScript?: string;
  subtitleScript?: string;
};

export type VideoPromptWriterResult = {
  script: string;
  summary: string;
  provider: string;
  model: string;
  providerUsage?: Record<string, unknown>;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostCny?: number;
  costStatus: VideoPromptWriterCostStatus;
  source: "ai";
};

export type VideoPromptWriterUsageRecord = {
  id: string;
  customerId: string;
  mode: VideoPromptWriterMode;
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  imageCount: number;
  estimatedCostCny?: number;
  costStatus: VideoPromptWriterCostStatus;
  rawUsage?: Record<string, unknown>;
  createdAt: string;
};

export class VideoPromptWriterError extends Error {
  constructor(readonly code: string, message: string, readonly status = 500) {
    super(message);
    this.name = "VideoPromptWriterError";
  }
}

export type VideoPromptWriterOptions = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  provider?: string;
  fetcher?: typeof fetch;
};

export type VideoPromptWriterUsageInput = {
  customerId: string;
  mode: VideoPromptWriterMode;
  imageCount: number;
  result: VideoPromptWriterResult;
};

type ChatCompletionBody = {
  choices?: Array<{ message?: { content?: unknown } }>;
  usage?: Record<string, unknown>;
};

type WriterJson = {
  script?: unknown;
  summary?: unknown;
};

export class OpenAICompatibleVideoPromptWriter {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly provider: string;
  private readonly fetcher: typeof fetch;

  constructor(options: VideoPromptWriterOptions = {}) {
    this.apiKey = nonEmptyString(options.apiKey);
    this.baseUrl = (options.baseUrl ?? "https://api.openai.com").replace(/\/$/, "");
    this.model = options.model ?? "gpt-4o-mini";
    this.provider = options.provider ?? providerNameForBaseUrl(this.baseUrl);
    this.fetcher = options.fetcher ?? fetch;
  }

  async write(input: VideoPromptWriterInput): Promise<VideoPromptWriterResult> {
    if (!this.apiKey) {
      throw new VideoPromptWriterError("video_prompt_writer_not_configured", "AI提示词代写模型未配置。", 503);
    }

    const response = await this.fetcher(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        temperature: input.mode === "revise" ? 0.35 : 0.45,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You are a senior ecommerce short-video director for bag and luggage product ads.",
              "Return strict JSON only with keys script and summary.",
              "Write in Chinese.",
              "The script must be a concrete shot-by-shot video prompt for a video-generation model.",
              "Do not copy brands, logos, watermarks, QR codes, prices, exact people, or unsupported claims.",
              "Preserve merchant product facts from the provided images and product analysis."
            ].join(" ")
          },
          {
            role: "user",
            content: buildUserContent(input)
          }
        ]
      })
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new VideoPromptWriterError("video_prompt_writer_provider_failed", message || "AI提示词代写失败。", response.status);
    }

    const body = await response.json().catch(() => undefined) as ChatCompletionBody | undefined;
    const content = body?.choices?.[0]?.message?.content;
    const parsed = parseWriterJson(content);
    if (!parsed?.script) {
      throw new VideoPromptWriterError("video_prompt_writer_invalid_response", "AI提示词代写返回内容无法识别。", 502);
    }
    const tokenUsage = normalizeTokenUsage(body?.usage);
    const cost = estimateVideoPromptWriterCost({
      model: this.model,
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
      totalTokens: tokenUsage.totalTokens
    });

    return {
      script: limitScript(parsed.script),
      summary: parsed.summary || (input.mode === "revise" ? "已按修改意见重写视频提示词。" : "已根据商品图和需求生成视频提示词。"),
      provider: this.provider,
      model: this.model,
      providerUsage: body?.usage,
      ...tokenUsage,
      ...cost,
      source: "ai"
    };
  }
}

export function createVideoPromptWriter(): OpenAICompatibleVideoPromptWriter {
  const baseUrl = firstNonEmpty(
    process.env.VIDEO_PROMPT_WRITER_BASE_URL,
    process.env.STYLE_VISION_BASE_URL,
    process.env.YUNWU_BASE_URL,
    "https://api.openai.com"
  );
  return new OpenAICompatibleVideoPromptWriter({
    apiKey: firstNonEmpty(process.env.VIDEO_PROMPT_WRITER_API_KEY, process.env.STYLE_VISION_API_KEY, process.env.YUNWU_API_KEY, process.env.OPENAI_API_KEY),
    baseUrl,
    model: firstNonEmpty(process.env.VIDEO_PROMPT_WRITER_MODEL, process.env.STYLE_VISION_MODEL, process.env.OPENAI_TEXT_MODEL, "gpt-4o-mini"),
    provider: providerNameForBaseUrl(baseUrl)
  });
}

export function recordVideoPromptWriterUsage(input: VideoPromptWriterUsageInput, repository = new FileVideoPromptWriterUsageRepository()): VideoPromptWriterUsageRecord {
  const record: VideoPromptWriterUsageRecord = {
    id: `vpw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    customerId: input.customerId,
    mode: input.mode,
    provider: input.result.provider,
    model: input.result.model,
    promptTokens: input.result.promptTokens,
    completionTokens: input.result.completionTokens,
    totalTokens: input.result.totalTokens,
    imageCount: input.imageCount,
    estimatedCostCny: input.result.estimatedCostCny,
    costStatus: input.result.costStatus,
    rawUsage: input.result.providerUsage,
    createdAt: new Date().toISOString()
  };
  repository.append(record);
  return record;
}

export class FileVideoPromptWriterUsageRepository {
  private readonly dataFile: string;

  constructor(options: { dataDir?: string } = {}) {
    this.dataFile = path.join(options.dataDir ?? persistentDataDir(), "video-prompt-writer-usage.json");
  }

  append(record: VideoPromptWriterUsageRecord): VideoPromptWriterUsageRecord {
    const records = this.all();
    records.push(record);
    this.persist(records);
    return record;
  }

  all(): VideoPromptWriterUsageRecord[] {
    if (!existsSync(this.dataFile)) return [];
    try {
      const parsed = JSON.parse(readFileSync(this.dataFile, "utf8")) as { records?: unknown };
      return Array.isArray(parsed.records) ? parsed.records.filter(isUsageRecord) : [];
    } catch {
      return [];
    }
  }

  private persist(records: VideoPromptWriterUsageRecord[]): void {
    mkdirSync(path.dirname(this.dataFile), { recursive: true });
    const tmp = `${this.dataFile}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify({ records }, null, 2));
    renameSync(tmp, this.dataFile);
  }
}

function buildUserContent(input: VideoPromptWriterInput): Array<Record<string, unknown>> {
  const text = [
    input.mode === "revise"
      ? "Task: revise the current approved video prompt according to the revision note. Rewrite the whole prompt, not only append comments."
      : "Task: draft a new custom video prompt from the user's short brief and product images.",
    `User brief: ${input.brief?.trim() || "用户未填写具体需求，请基于商品图生成一条适合电商使用的原创短视频。"}`,
    input.mode === "revise" ? `Current script:\n${input.currentScript?.trim() || "(empty)"}` : undefined,
    input.mode === "revise" ? `Revision note: ${input.revision?.trim() || "(empty)"}` : undefined,
    `Product analysis: item=${input.productAnalysis?.itemText || "商品"}; summary=${input.productAnalysis?.summary || ""}; assets=${input.productAnalysis?.assetLine || ""}`,
    `Controls: platform=${input.platform}; videoType=${input.videoType}; duration=${input.durationSeconds}s; resolution=${input.outputResolution}.`,
    `Audio/subtitle controls: music=${input.musicMode || "ai_music"}; voiceover=${input.voiceoverMode || "none"}; subtitle=${input.subtitleMode || "ai_subtitle"}.`,
    input.voiceoverScript?.trim() ? `Voiceover script: ${input.voiceoverScript.trim()}` : undefined,
    input.subtitleScript?.trim() ? `Subtitle script: ${input.subtitleScript.trim()}` : undefined,
    [
      "Output requirements:",
      "- JSON only: {\"script\":\"...\",\"summary\":\"...\"}.",
      "- script must include total goal, product rule, sound rule, subtitle rule, and numbered shot plan.",
      "- Each shot must include time range, visual subject, camera movement, action, and text/audio behavior.",
      "- If the product images do not clearly show a model, do not force runway walking or face close-ups unless the brief asks for it.",
              "- Preserve bag colorway, silhouette, body proportions, handles, shoulder straps, zipper path, buckles, clasps, locks, wheels or trolley handle when present, pocket layout, flap shape, compartment structure, material texture, stitching, edge paint, trims, pattern, and visible details.",
      "- Keep within the selected duration and first-draft resolution.",
      "- Do not add QR code, watermark, platform logo, fake price, or unsupported promise."
    ].join("\n")
  ].filter(Boolean).join("\n\n");

  return [
    { type: "text", text },
    ...input.productImages.slice(0, 3).map((url) => ({
      type: "image_url",
      image_url: { url }
    }))
  ];
}

function parseWriterJson(content: unknown): { script: string; summary: string } | undefined {
  if (typeof content !== "string") return undefined;
  const trimmed = content.trim();
  if (!trimmed) return undefined;
  const parsed = safeJsonParse(trimmed) ?? safeJsonParse(extractJsonObject(trimmed));
  if (parsed && typeof parsed === "object") {
    const writer = parsed as WriterJson;
    const script = typeof writer.script === "string" ? writer.script.trim() : "";
    const summary = typeof writer.summary === "string" ? writer.summary.trim() : "";
    if (script) return { script, summary };
  }
  return { script: trimmed, summary: "" };
}

function safeJsonParse(value: string | undefined): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function extractJsonObject(value: string): string | undefined {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start < 0 || end <= start) return undefined;
  return value.slice(start, end + 1);
}

function limitScript(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 2800 ? `${trimmed.slice(0, 2760)}\n提示词已压缩，请保留以上商品事实、镜头计划和限制规则。` : trimmed;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.map(nonEmptyString).find(Boolean);
}

function nonEmptyString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function providerNameForBaseUrl(baseUrl?: string): string {
  const normalized = (baseUrl ?? "").toLowerCase();
  if (normalized.includes("yunwu")) return "yunwu";
  if (normalized.includes("openai")) return "openai";
  return "openai_compatible";
}

function normalizeTokenUsage(usage?: Record<string, unknown>): { promptTokens?: number; completionTokens?: number; totalTokens?: number } {
  const promptTokens = numberAt(usage, "prompt_tokens") ?? numberAt(usage, "promptTokens") ?? numberAt(usage, "input_tokens") ?? numberAt(usage, "inputTokens");
  const completionTokens = numberAt(usage, "completion_tokens") ?? numberAt(usage, "completionTokens") ?? numberAt(usage, "output_tokens") ?? numberAt(usage, "outputTokens");
  const totalTokens = numberAt(usage, "total_tokens") ?? numberAt(usage, "totalTokens") ?? sumTokens(promptTokens, completionTokens);
  return { promptTokens, completionTokens, totalTokens };
}

function numberAt(source: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = source?.[key];
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : undefined;
  return Number.isFinite(numeric) ? numeric : undefined;
}

function sumTokens(promptTokens?: number, completionTokens?: number): number | undefined {
  if (!Number.isFinite(promptTokens) && !Number.isFinite(completionTokens)) return undefined;
  return Math.max(0, Math.trunc(promptTokens ?? 0)) + Math.max(0, Math.trunc(completionTokens ?? 0));
}

function estimateVideoPromptWriterCost(input: {
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}): { estimatedCostCny?: number; costStatus: VideoPromptWriterCostStatus } {
  const table = loadPromptWriterPriceTable();
  const price = table[input.model];
  if (!price) return { costStatus: "missing_price" };

  const inputPrice = Number(price.inputPerMillionCny);
  const outputPrice = Number(price.outputPerMillionCny);
  if (!Number.isFinite(inputPrice) || !Number.isFinite(outputPrice)) return { costStatus: "missing_price" };

  const promptTokens = input.promptTokens;
  const completionTokens = input.completionTokens;
  if (Number.isFinite(promptTokens) || Number.isFinite(completionTokens)) {
    return {
      estimatedCostCny: roundCurrency(((promptTokens ?? 0) / 1_000_000) * inputPrice + ((completionTokens ?? 0) / 1_000_000) * outputPrice),
      costStatus: "estimated_from_usage"
    };
  }
  if (Number.isFinite(input.totalTokens)) {
    return {
      estimatedCostCny: roundCurrency(((input.totalTokens ?? 0) / 1_000_000) * Math.max(inputPrice, outputPrice)),
      costStatus: "estimated_from_usage"
    };
  }
  return { costStatus: "missing_price" };
}

function loadPromptWriterPriceTable(): Record<string, { inputPerMillionCny?: unknown; outputPerMillionCny?: unknown }> {
  const raw = process.env.VIDEO_PROMPT_WRITER_PRICE_TABLE_JSON;
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, { inputPerMillionCny?: unknown; outputPerMillionCny?: unknown }] => {
        const value = entry[1];
        return typeof value === "object" && value !== null;
      })
    );
  } catch {
    return {};
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function isUsageRecord(value: unknown): value is VideoPromptWriterUsageRecord {
  return typeof value === "object" && value !== null && typeof (value as VideoPromptWriterUsageRecord).id === "string";
}
