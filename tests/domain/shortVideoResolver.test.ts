import { mkdtempSync, rmSync } from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { extractFirstHttpUrl, resolveShortVideoReference } from "../../src/domain/video/shortVideoResolver";

let dataDir: string | undefined;

afterEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = undefined;
  delete process.env.STORE_DATA_DIR;
});

describe("shortVideoResolver", () => {
  it("extracts a Douyin url from full share text", () => {
    expect(extractFirstHttpUrl("9.79 b@n.qr Bgo:/ 买一件送一件！ https://v.douyin.com/yE5Y6u4V7tQ/ 复制此链接")).toBe("https://v.douyin.com/yE5Y6u4V7tQ/");
  });

  it("does not store html returned from a Douyin short link as mp4", async () => {
    dataDir = mkdtempSync(path.join(os.tmpdir(), "short-video-resolver-"));
    process.env.STORE_DATA_DIR = dataDir;
    const fetcher = vi.fn(async () => new Response(
      "<!doctype html><html><head><title>Douyin</title></head><body>blocked</body></html>",
      {
        status: 200,
        headers: { "content-type": "video/mp4" }
      }
    ));

    const result = await resolveShortVideoReference({
      url: "https://v.douyin.com/yE5Y6u4V7tQ/",
      requestUrl: "http://example.test/api/video-reference-assets/resolve",
      fetcher
    });

    expect(result.stored).toBeUndefined();
    expect(result.error).toContain("抖音");
  });
});
