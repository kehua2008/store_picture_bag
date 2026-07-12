import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentDataDir } from "../../../src/server/storagePaths";
import { getAuthContextFromRequest } from "../../../src/server/auth";
import { userOwnsGeneratedImage } from "../../../src/server/assetAuthorization";

export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  const auth = await getAuthContextFromRequest(request);
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const { filename } = await context.params;
  const safeName = path.basename(filename);
  if (!userOwnsGeneratedImage(auth.user.id, safeName)) {
    return NextResponse.json({ error: "generated_image_not_found" }, { status: 404 });
  }

  const bytes = await readFile(path.join(persistentDataDir(), "generated-images", safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "generated_image_not_found" }, { status: 404 });

  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "private, max-age=31536000, immutable"
    }
  });
}

function contentTypeFor(filename: string): string {
  if (/\.jpe?g$/i.test(filename)) return "image/jpeg";
  if (/\.webp$/i.test(filename)) return "image/webp";
  return "image/png";
}
