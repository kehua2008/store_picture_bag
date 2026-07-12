export type VideoCostStatus = "missing_price" | "estimated_from_usage" | "not_applicable";

export interface VideoCostEstimate {
  actualCostCny?: number;
  pricePerMillionTokensCny?: number;
  costStatus: VideoCostStatus;
}

export interface VideoDraftCostInput {
  model: string;
  resolution?: string;
  durationSeconds?: number;
  generateAudio?: boolean;
  totalTokens?: number;
}

export interface VideoUpscaleCostInput {
  model: string;
  sourceResolution?: string;
  targetResolution: string;
  durationSeconds?: number;
  totalTokens?: number;
}

export type VideoDraftPriceTable = Record<string, number>;
export type VideoUpscalePriceTable = Record<string, number>;

export function estimateVideoDraftCost(input: VideoDraftCostInput, table: VideoDraftPriceTable = loadPriceTable("VIDEO_DRAFT_PRICE_TABLE_JSON")): VideoCostEstimate {
  if (!input.totalTokens || input.totalTokens <= 0) return { costStatus: "missing_price" };
  const price = table[draftPriceKey(input)] ?? table[draftFallbackPriceKey(input)];
  if (!Number.isFinite(price)) return { costStatus: "missing_price" };
  return {
    actualCostCny: roundCurrency((input.totalTokens / 1_000_000) * price),
    pricePerMillionTokensCny: price,
    costStatus: "estimated_from_usage"
  };
}

export function estimateVideoUpscaleCost(input: VideoUpscaleCostInput, table: VideoUpscalePriceTable = loadPriceTable("VIDEO_UPSCALE_PRICE_TABLE_JSON")): VideoCostEstimate {
  if (!input.totalTokens || input.totalTokens <= 0) return { costStatus: "missing_price" };
  const price = table[upscalePriceKey(input)] ?? table[upscaleFallbackPriceKey(input)];
  if (!Number.isFinite(price)) return { costStatus: "missing_price" };
  return {
    actualCostCny: roundCurrency((input.totalTokens / 1_000_000) * price),
    pricePerMillionTokensCny: price,
    costStatus: "estimated_from_usage"
  };
}

function draftPriceKey(input: VideoDraftCostInput): string {
  return [
    input.model,
    normalizeResolution(input.resolution),
    normalizeDuration(input.durationSeconds),
    input.generateAudio ? "audio" : "silent"
  ].join("|");
}

function draftFallbackPriceKey(input: VideoDraftCostInput): string {
  return [
    input.model,
    normalizeResolution(input.resolution),
    "any",
    input.generateAudio ? "audio" : "silent"
  ].join("|");
}

function upscalePriceKey(input: VideoUpscaleCostInput): string {
  return [
    input.model,
    normalizeResolution(input.sourceResolution),
    normalizeResolution(input.targetResolution),
    normalizeDuration(input.durationSeconds)
  ].join("|");
}

function upscaleFallbackPriceKey(input: VideoUpscaleCostInput): string {
  return [
    input.model,
    normalizeResolution(input.sourceResolution),
    normalizeResolution(input.targetResolution),
    "any"
  ].join("|");
}

function normalizeResolution(value?: string): string {
  return (value ?? "unknown").trim().toLowerCase();
}

function normalizeDuration(value?: number): string {
  if (!Number.isFinite(value)) return "unknown";
  return `${Math.max(1, Math.trunc(value as number))}s`;
}

function roundCurrency(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function loadPriceTable(envName: string): Record<string, number> {
  const raw = process.env[envName];
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, typeof value === "number" ? value : Number(value)])
        .filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
    );
  } catch {
    return {};
  }
}
