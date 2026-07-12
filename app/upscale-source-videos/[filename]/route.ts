import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentDataDir } from "../../../src/server/storagePaths";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const bytes = await readFile(path.join(persistentDataDir(), "upscale-source-videos", safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "video_not_found" }, { status: 404 });
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": contentTypeForFilename(safeName),
      "Cache-Control": "public, max-age=86400"
    }
  });
}

function contentTypeForFilename(filename: string): string {
  if (/\.webm$/i.test(filename)) return "video/webm";
  if (/\.(mov|m4v)$/i.test(filename)) return "video/quicktime";
  return "video/mp4";
}
