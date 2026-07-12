import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { persistentDataDir } from "../../server/storagePaths";
import { absolutePublicUrl } from "./referenceAssetStore";

export interface StoredVideoAudio {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  localUrl: string;
}

const maxVideoAudioBytes = 30 * 1024 * 1024;

export function isSupportedVideoAudioType(mimeType: string, filename = ""): boolean {
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith("audio/mpeg") || normalized.startsWith("audio/mp3")) return true;
  if (normalized.startsWith("audio/wav") || normalized.startsWith("audio/x-wav")) return true;
  if (normalized.startsWith("audio/mp4") || normalized.startsWith("audio/aac") || normalized.startsWith("audio/x-m4a")) return true;
  return /\.(mp3|wav|m4a|aac)$/i.test(filename);
}

export function assertValidVideoAudioBytes(bytes: Buffer, options: { mimeType?: string; filename?: string } = {}): void {
  if (!bytes.length) throw new Error("empty_video_audio");
  if (bytes.length > maxVideoAudioBytes) throw new Error("video_audio_too_large");
  if (looksLikeTextPayload(bytes)) throw new Error("invalid_video_audio_content");
  if (!isSupportedVideoAudioType(options.mimeType ?? "", options.filename ?? "")) throw new Error("unsupported_video_audio_type");
}

export async function storeVideoAudioAsset(input: {
  bytes: Buffer;
  mimeType: string;
  originalName?: string;
  requestUrl: string;
}): Promise<StoredVideoAudio> {
  assertValidVideoAudioBytes(input.bytes, {
    mimeType: input.mimeType,
    filename: input.originalName
  });

  const id = crypto.randomUUID();
  const extension = extensionFor(input.mimeType, input.originalName);
  const dir = path.join(persistentDataDir(), "video-audio-assets");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${id}${extension}`;
  await writeFile(path.join(dir, filename), input.bytes);

  const localUrl = `/video-audio-assets/${encodeURIComponent(filename)}`;
  return {
    id,
    filename,
    mimeType: normalizeAudioMimeType(input.mimeType, filename),
    sizeBytes: input.bytes.length,
    publicUrl: absolutePublicUrl(input.requestUrl, localUrl),
    localUrl
  };
}

function extensionFor(mimeType: string, filename = ""): string {
  const fromName = filename.match(/\.(mp3|wav|m4a|aac)$/i)?.[0]?.toLowerCase();
  if (fromName) return fromName;
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("wav")) return ".wav";
  if (normalized.includes("aac")) return ".aac";
  if (normalized.includes("mp4") || normalized.includes("m4a")) return ".m4a";
  return ".mp3";
}

function normalizeAudioMimeType(mimeType: string, filename: string): string {
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith("audio/")) return normalized.split(";")[0];
  if (/\.wav$/i.test(filename)) return "audio/wav";
  if (/\.m4a$/i.test(filename)) return "audio/mp4";
  if (/\.aac$/i.test(filename)) return "audio/aac";
  return "audio/mpeg";
}

function looksLikeTextPayload(bytes: Buffer): boolean {
  const text = bytes.subarray(0, Math.min(bytes.length, 512)).toString("utf8").trimStart().toLowerCase();
  return text.startsWith("<!doctype html") ||
    text.startsWith("<html") ||
    text.startsWith("{") ||
    text.startsWith("[") ||
    text.includes("<script") ||
    text.includes("<head");
}
