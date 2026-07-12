import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

import { assertValidVideoAudioBytes, storeVideoAudioAsset } from "../../src/domain/video/audioAssetStore";

let dataDir: string | undefined;

afterEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = undefined;
  delete process.env.STORE_DATA_DIR;
});

describe("audioAssetStore", () => {
  it("rejects html audio payloads", () => {
    const bytes = Buffer.from("<!doctype html><html><body>blocked</body></html>");
    expect(() => assertValidVideoAudioBytes(bytes, { mimeType: "audio/mpeg", filename: "fake.mp3" })).toThrow("invalid_video_audio_content");
  });

  it("stores a supported audio payload with a public url", async () => {
    dataDir = mkdtempSync(path.join(os.tmpdir(), "video-audio-store-"));
    process.env.STORE_DATA_DIR = dataDir;

    const stored = await storeVideoAudioAsset({
      bytes: Buffer.concat([Buffer.from("ID3"), Buffer.alloc(256)]),
      mimeType: "audio/mpeg",
      originalName: "music.mp3",
      requestUrl: "http://example.test/api/video-audio-assets"
    });

    expect(stored.publicUrl).toMatch(/^http:\/\/example\.test\/video-audio-assets\/.+\.mp3$/);
    expect(stored.mimeType).toBe("audio/mpeg");
  });
});
