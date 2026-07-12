import { describe, expect, it } from "vitest";

import { createVideoJobSchema } from "../../src/server/schemas";

describe("createVideoJobSchema", () => {
  it("accepts bag video reference and originality metadata", () => {
    const parsed = createVideoJobSchema.safeParse({
      prompt: "Create an original bag ecommerce short video.",
      images: ["data:image/png;base64,abc"],
      aspectRatio: "9:16",
      outputResolution: "480p",
      durationSeconds: 10,
      metadata: {
        category: "箱包",
        videoType: "千川推广视频",
        platform: "抖音/快手",
        captionMode: "AI自动配乐 · 按文案配音 · 按文案字幕",
        musicMode: "music_url",
        voiceoverMode: "script_voiceover",
        subtitleMode: "script_subtitle",
        musicAudioUrl: "https://example.com/music.mp3",
        voiceoverScript: "这款通勤托特包容量清楚又有质感",
        subtitleScript: "通勤容量 / 包型利落",
        duration: "10s",
        rewriteMode: "中度参考（推荐）",
        referenceSourceType: "link",
        referenceLink: "https://example.com/video",
        referenceAudioLink: "https://example.com/audio.mp3",
        generationGoals: ["换成我的包款", "保留节奏，重写文案"],
        productName: "通勤托特包",
        audience: "25-35岁通勤女性",
        offer: "今日限时"
      }
    });

    expect(parsed.success).toBe(true);
  });
});
