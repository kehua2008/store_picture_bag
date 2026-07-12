import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { persistentUploadSubdir } from "../../../src/server/storagePaths";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "");
  if (!safeName || safeName !== filename) return NextResponse.json({ error: "invalid_feedback_screenshot" }, { status: 400 });
  const bytes = await readFile(path.join(persistentUploadSubdir("feedback-screenshots"), safeName)).catch(() => undefined);
  if (!bytes) return NextResponse.json({ error: "feedback_screenshot_not_found" }, { status: 404 });
  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypeFor(safeName),
      "Cache-Control": "private, max-age=300"
    }
  });
}

function contentTypeFor(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
