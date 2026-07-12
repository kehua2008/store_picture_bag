import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

import { assertValidReferenceVideoBytes, storeReferenceVideo } from "../../src/domain/video/referenceAssetStore";

let dataDir: string | undefined;

afterEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = undefined;
  delete process.env.STORE_DATA_DIR;
});

describe("referenceAssetStore", () => {
  it("rejects html even when it is named as mp4", () => {
    const bytes = Buffer.from("<!doctype html><html><head></head><body>blocked</body></html>");
    expect(() => assertValidReferenceVideoBytes(bytes, { mimeType: "video/mp4", filename: "fake.mp4" })).toThrow("invalid_reference_video_content");
  });

  it("rejects tiny platform downloads", () => {
    const bytes = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x18]),
      Buffer.from("ftypisom"),
      Buffer.alloc(128)
    ]);
    expect(() => assertValidReferenceVideoBytes(bytes, { mimeType: "video/mp4", filename: "tiny.mp4", requireMinSize: true })).toThrow("reference_video_too_small");
  });

  it("stores a valid mp4 payload", async () => {
    dataDir = mkdtempSync(path.join(os.tmpdir(), "reference-video-store-"));
    process.env.STORE_DATA_DIR = dataDir;
    const source = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x18]),
      Buffer.from("ftypisom"),
      Buffer.alloc(256)
    ]);

    const stored = await storeReferenceVideo({
      bytes: source,
      mimeType: "video/mp4",
      originalName: "reference.mp4",
      requestUrl: "http://example.test/api/video-reference-assets"
    });

    expect(stored.publicUrl).toMatch(/^http:\/\/example\.test\/reference-videos\/.+\.mp4$/);
    expect(stored.sizeBytes).toBe(source.length);
  });
});
