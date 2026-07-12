import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentDataDir } from "../../../src/server/storagePaths";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const bytes = await readFile(path.join(persistentDataDir(), "video-audio-assets", safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "video_audio_not_found" }, { status: 404 });

  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "public, max-age=86400"
    }
  });
}

function contentTypeFor(filename: string): string {
  if (/\.wav$/i.test(filename)) return "audio/wav";
  if (/\.m4a$/i.test(filename)) return "audio/mp4";
  if (/\.aac$/i.test(filename)) return "audio/aac";
  return "audio/mpeg";
}
