import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentDataDir } from "../../../src/server/storagePaths";
import { getAuthContextFromRequest } from "../../../src/server/auth";
import { userOwnsGeneratedVideo } from "../../../src/server/assetAuthorization";

export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { filename } = await context.params;
  const safeName = path.basename(filename);
  if (!userOwnsGeneratedVideo(auth.user.id, safeName)) {
    return NextResponse.json({ error: "generated_video_not_found" }, { status: 404 });
  }

  const bytes = await readFile(path.join(persistentDataDir(), "generated-videos", safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "generated_video_not_found" }, { status: 404 });

  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "private, max-age=31536000, immutable"
    }
  });
}

function contentTypeFor(filename: string): string {
  if (/\.mov$/i.test(filename)) return "video/quicktime";
  if (/\.webm$/i.test(filename)) return "video/webm";
  if (/\.m3u8$/i.test(filename)) return "application/vnd.apple.mpegurl";
  return "video/mp4";
}
