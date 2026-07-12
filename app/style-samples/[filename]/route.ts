import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentUploadSubdir } from "../../../src/server/storagePaths";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const bytes = await readFile(path.join(persistentUploadSubdir("style-samples"), safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "style_sample_not_found" }, { status: 404 });

  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

function contentTypeFor(filename: string): string {
  if (/\.png$/i.test(filename)) return "image/png";
  if (/\.webp$/i.test(filename)) return "image/webp";
  return "image/jpeg";
}
