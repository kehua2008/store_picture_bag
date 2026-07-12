import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { persistentDataDir } from "../../server/storagePaths";
import { assertValidReferenceVideoBytes, isSupportedReferenceVideoType } from "./referenceAssetStore";

export interface StoredUpscaleVideoAsset {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  localUrl: string;
}

const maxUpscaleSourceVideoBytes = 180 * 1024 * 1024;

export async function storeUpscaleVideoAsset(input: {
  bytes: Buffer;
  mimeType: string;
  originalName?: string;
  requestUrl: string;
}): Promise<StoredUpscaleVideoAsset> {
  if (!isSupportedReferenceVideoType(input.mimeType, input.originalName)) throw new Error("unsupported_upscale_video_type");
  if (input.bytes.length > maxUpscaleSourceVideoBytes) throw new Error("upscale_video_too_large");
  assertValidReferenceVideoBytes(input.bytes, {
    mimeType: input.mimeType,
    filename: input.originalName,
    requireMinSize: false
  });

  const id = crypto.randomUUID();
  const extension = extensionFor(input.mimeType, input.originalName);
  const dir = path.join(persistentDataDir(), "upscale-source-videos");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${id}${extension}`;
  await writeFile(path.join(dir, filename), input.bytes);
  const localUrl = `/upscale-source-videos/${encodeURIComponent(filename)}`;
  return {
    id,
    filename,
    mimeType: normalizeVideoMimeType(input.mimeType, filename),
    sizeBytes: input.bytes.length,
    localUrl,
    publicUrl: absolutePublicUrl(input.requestUrl, localUrl)
  };
}

function extensionFor(mimeType: string, originalName?: string): string {
  const fromName = originalName?.match(/\.(mp4|mov|m4v|webm)$/i)?.[0];
  if (fromName) return fromName.toLowerCase();
  if (mimeType.toLowerCase().includes("webm")) return ".webm";
  if (mimeType.toLowerCase().includes("quicktime")) return ".mov";
  return ".mp4";
}

function normalizeVideoMimeType(mimeType: string, filename: string): string {
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith("video/")) return normalized.split(";")[0] ?? "video/mp4";
  if (/\.webm$/i.test(filename)) return "video/webm";
  if (/\.(mov|m4v)$/i.test(filename)) return "video/quicktime";
  return "video/mp4";
}

function absolutePublicUrl(requestUrl: string, localUrl: string): string {
  const configured = process.env.APP_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return `${configured}${localUrl}`;
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}${localUrl}`;
}
