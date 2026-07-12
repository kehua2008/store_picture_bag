import { describe, expect, it } from "vitest";

import { isPublicHttpVideoUrl, resolveReferenceAsset, shortVideoPlatformForUrl } from "../../src/domain/video/referenceResolver";

describe("referenceResolver", () => {
  it("maps local light and medium references to real frame modes", () => {
    expect(resolveReferenceAsset({
      sourceType: "local_upload",
      referenceStrength: "light",
      frameCount: 1
    })).toMatchObject({
      assetStatus: "resolved",
      processingMode: "single_frame",
      frameCount: 1
    });

    expect(resolveReferenceAsset({
      sourceType: "local_upload",
      referenceStrength: "medium",
      frameCount: 3
    })).toMatchObject({
      assetStatus: "resolved",
      processingMode: "multi_frame",
      frameCount: 3
    });
  });

  it("does not pretend local heavy references work without an uploaded video url", () => {
    expect(resolveReferenceAsset({
      sourceType: "local_upload",
      referenceStrength: "heavy"
    })).toMatchObject({
      assetStatus: "failed",
      processingMode: "full_video"
    });
  });

  it("detects Douyin and Kuaishou links for the self-built parser path", () => {
    expect(shortVideoPlatformForUrl("https://v.douyin.com/example/")).toBe("douyin");
    expect(shortVideoPlatformForUrl("https://v.kuaishou.com/example")).toBe("kuaishou");
    expect(resolveReferenceAsset({
      sourceType: "link",
      referenceStrength: "heavy",
      referenceLink: "https://v.douyin.com/example/"
    })).toMatchObject({
      assetStatus: "failed",
      platform: "douyin",
      processingMode: "full_video"
    });
  });

  it("allows direct public video urls as resolved heavy references", () => {
    expect(resolveReferenceAsset({
      sourceType: "link",
      referenceStrength: "heavy",
      referenceLink: "https://cdn.example.com/reference.mp4"
    })).toMatchObject({
      assetStatus: "resolved",
      processingMode: "full_video",
      resolvedReferenceVideoUrl: "https://cdn.example.com/reference.mp4"
    });
  });

  it("rejects local and private urls for full video references", () => {
    expect(isPublicHttpVideoUrl("http://47.120.21.152/reference-videos/test.mp4")).toBe(true);
    expect(isPublicHttpVideoUrl("https://cdn.example.com/reference.mp4")).toBe(true);
    expect(isPublicHttpVideoUrl("http://localhost:3001/reference-videos/test.mp4")).toBe(false);
    expect(isPublicHttpVideoUrl("http://127.0.0.1/reference-videos/test.mp4")).toBe(false);
    expect(isPublicHttpVideoUrl("http://192.168.1.8/reference-videos/test.mp4")).toBe(false);
    expect(isPublicHttpVideoUrl("ftp://cdn.example.com/reference.mp4")).toBe(false);
  });
});
