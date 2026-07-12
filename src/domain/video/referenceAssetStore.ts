import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { persistentDataDir } from "../../server/storagePaths";

export interface StoredReferenceVideo {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  localUrl: string;
}

const maxReferenceVideoBytes = 120 * 1024 * 1024;
const minResolvedReferenceVideoBytes = 100 * 1024;
const maxArkReferenceDurationSeconds = 15.2;
const normalizedReferenceDurationSeconds = 14.5;
const execFileAsync = promisify(execFile);

export function isSupportedReferenceVideoType(mimeType: string, filename = ""): boolean {
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith("video/mp4") || normalized.startsWith("video/quicktime") || normalized.startsWith("video/webm")) return true;
  return /\.(mp4|mov|m4v|webm)$/i.test(filename);
}

export function assertValidReferenceVideoBytes(bytes: Buffer, options: { mimeType?: string; filename?: string; requireMinSize?: boolean } = {}): void {
  if (!bytes.length) throw new Error("empty_reference_video");
  if (bytes.length > maxReferenceVideoBytes) throw new Error("reference_video_too_large");
  if (looksLikeTextPayload(bytes)) throw new Error("invalid_reference_video_content");
  if (options.requireMinSize && bytes.length < minResolvedReferenceVideoBytes) throw new Error("reference_video_too_small");

  const filename = options.filename ?? "";
  const mimeType = options.mimeType ?? "";
  if (isWebmLike(mimeType, filename)) {
    if (!hasWebmHeader(bytes)) throw new Error("invalid_reference_video_content");
    return;
  }
  if (!hasMp4FtypBox(bytes)) throw new Error("invalid_reference_video_content");
}

export async function storeReferenceVideo(input: {
  bytes: Buffer;
  mimeType: string;
  originalName?: string;
  requestUrl: string;
  requireMinSize?: boolean;
}): Promise<StoredReferenceVideo> {
  if (!isSupportedReferenceVideoType(input.mimeType, input.originalName)) throw new Error("unsupported_reference_video_type");
  assertValidReferenceVideoBytes(input.bytes, {
    mimeType: input.mimeType,
    filename: input.originalName,
    requireMinSize: input.requireMinSize
  });

  const id = crypto.randomUUID();
  const extension = extensionFor(input.mimeType, input.originalName);
  const dir = path.join(persistentDataDir(), "reference-videos");
  await mkdir(dir, { recursive: true });
  const normalized = await normalizeReferenceVideoForArk({
    bytes: input.bytes,
    dir,
    extension,
    mimeType: input.mimeType,
    originalName: input.originalName,
    requireMinSize: input.requireMinSize
  });
  const filename = `${Date.now()}-${id}${extension}`;
  await writeFile(path.join(dir, filename), normalized.bytes);

  const localUrl = `/reference-videos/${encodeURIComponent(filename)}`;
  return {
    id,
    filename,
    mimeType: normalizeVideoMimeType(input.mimeType, filename),
    sizeBytes: normalized.bytes.length,
    localUrl,
    publicUrl: absolutePublicUrl(input.requestUrl, localUrl)
  };
}

async function normalizeReferenceVideoForArk(input: {
  bytes: Buffer;
  dir: string;
  extension: string;
  mimeType: string;
  originalName?: string;
  requireMinSize?: boolean;
}): Promise<{ bytes: Buffer }> {
  const tempId = crypto.randomUUID();
  const sourcePath = path.join(input.dir, `.reference-source-${tempId}${input.extension}`);
  const outputPath = path.join(input.dir, `.reference-normalized-${tempId}.mp4`);
  try {
    await writeFile(sourcePath, input.bytes);
    const duration = await probeVideoDurationSeconds(sourcePath);
    if (!duration || duration <= maxArkReferenceDurationSeconds) return { bytes: input.bytes };
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      sourcePath,
      "-t",
      String(normalizedReferenceDurationSeconds),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      "-movflags",
      "+faststart",
      outputPath
    ]);
    const normalizedBytes = await readFile(outputPath);
    assertValidReferenceVideoBytes(normalizedBytes, {
      mimeType: "video/mp4",
      filename: "normalized.mp4",
      requireMinSize: input.requireMinSize
    });
    return { bytes: normalizedBytes };
  } catch {
    return { bytes: input.bytes };
  } finally {
    await rm(sourcePath, { force: true }).catch(() => undefined);
    await rm(outputPath, { force: true }).catch(() => undefined);
  }
}

async function probeVideoDurationSeconds(filePath: string): Promise<number | undefined> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nokey=1:noprint_wrappers=1",
      filePath
    ]);
    const duration = Number.parseFloat(stdout.trim());
    return Number.isFinite(duration) ? duration : undefined;
  } catch {
    return undefined;
  }
}

export function absolutePublicUrl(requestUrl: string, localUrl: string): string {
  const configured = process.env.APP_PUBLIC_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = configured || new URL(requestUrl).origin;
  return `${base.replace(/\/$/, "")}${localUrl}`;
}

function extensionFor(mimeType: string, filename = ""): string {
  const fromName = filename.match(/\.(mp4|mov|m4v|webm)$/i)?.[0]?.toLowerCase();
  if (fromName) return fromName === ".m4v" ? ".mp4" : fromName;
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("quicktime")) return ".mov";
  if (normalized.includes("webm")) return ".webm";
  return ".mp4";
}

function normalizeVideoMimeType(mimeType: string, filename: string): string {
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith("video/")) return normalized.split(";")[0];
  if (/\.mov$/i.test(filename)) return "video/quicktime";
  if (/\.webm$/i.test(filename)) return "video/webm";
  return "video/mp4";
}

function isWebmLike(mimeType: string, filename: string): boolean {
  return mimeType.toLowerCase().includes("webm") || /\.webm$/i.test(filename);
}

function hasWebmHeader(bytes: Buffer): boolean {
  return bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
}

function hasMp4FtypBox(bytes: Buffer): boolean {
  const searchLimit = Math.min(bytes.length - 8, 4096);
  for (let offset = 0; offset <= searchLimit; offset += 1) {
    if (bytes[offset + 4] === 0x66 && bytes[offset + 5] === 0x74 && bytes[offset + 6] === 0x79 && bytes[offset + 7] === 0x70) {
      const boxSize = bytes.readUInt32BE(offset);
      if (boxSize >= 8 && boxSize <= bytes.length - offset) return true;
    }
  }
  return false;
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
