import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentDataDir } from "../../../src/server/storagePaths";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const bytes = await readFile(path.join(persistentDataDir(), "reference-videos", safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "reference_video_not_found" }, { status: 404 });

  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "public, max-age=86400"
    }
  });
}

function contentTypeFor(filename: string): string {
  if (/\.mov$/i.test(filename)) return "video/quicktime";
  if (/\.webm$/i.test(filename)) return "video/webm";
  return "video/mp4";
}
