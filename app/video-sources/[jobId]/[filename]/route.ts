import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentDataDir } from "../../../../src/server/storagePaths";

export async function GET(_request: Request, context: { params: Promise<{ jobId: string; filename: string }> }) {
  const { jobId, filename } = await context.params;
  const safeJobId = safeSegment(jobId);
  const safeName = safeSegment(filename);
  const bytes = await readFile(path.join(persistentDataDir(), "video-sources", safeJobId, safeName)).catch(() => undefined);
  if (!bytes) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mimeTypeFor(safeName),
      "Cache-Control": "public, max-age=86400"
    }
  });
}

function safeSegment(value: string): string {
  return path.basename(value).replace(/[^a-zA-Z0-9._-]/g, "");
}

function mimeTypeFor(filename: string): string {
  if (/\.jpe?g$/i.test(filename)) return "image/jpeg";
  if (/\.webp$/i.test(filename)) return "image/webp";
  return "image/png";
}
