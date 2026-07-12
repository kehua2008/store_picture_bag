export type ReferenceStrength = "light" | "medium" | "heavy";
export type ReferenceProcessingMode = "none" | "single_frame" | "multi_frame" | "full_video";
export type ReferenceAssetStatus = "pending" | "resolved" | "failed";
export type ShortVideoPlatform = "douyin" | "kuaishou" | "unknown";

export interface ReferenceResolveInput {
  sourceType?: string;
  referenceLink?: string;
  referenceStrength: ReferenceStrength;
  resolvedReferenceVideoUrl?: string;
  frameCount?: number;
}

export interface ReferenceResolveResult {
  sourceType: string;
  strength: ReferenceStrength;
  processingMode: ReferenceProcessingMode;
  assetStatus: ReferenceAssetStatus;
  platform?: ShortVideoPlatform;
  resolvedReferenceVideoUrl?: string;
  frameCount: number;
  parseError?: string;
}

const directVideoPattern = /\.(mp4|mov|m4v|webm)(?:[?#].*)?$/i;

export function resolveReferenceAsset(input: ReferenceResolveInput): ReferenceResolveResult {
  const sourceType = input.sourceType?.trim() || "none";
  const strength = input.referenceStrength;
  const referenceLink = input.referenceLink?.trim();
  const resolvedReferenceVideoUrl = input.resolvedReferenceVideoUrl?.trim();

  if (sourceType === "none") {
    return {
      sourceType,
      strength,
      processingMode: "none",
      assetStatus: "resolved",
      frameCount: 0
    };
  }

  if (sourceType === "local_upload") {
    return resolveLocalReference(strength, input.frameCount ?? 0, resolvedReferenceVideoUrl);
  }

  if (sourceType === "link") {
    return resolveLinkReference(strength, referenceLink, resolvedReferenceVideoUrl, input.frameCount ?? 0);
  }

  if (sourceType === "local_and_link") {
    return {
      sourceType,
      strength,
      processingMode: "none",
      assetStatus: "failed",
      frameCount: 0,
      parseError: "参考视频只能选择本地上传或平台链接其中一种。"
    };
  }

  return {
    sourceType,
    strength,
    processingMode: "none",
    assetStatus: "failed",
    frameCount: 0,
    parseError: "未知的参考视频来源。"
  };
}

export function shortVideoPlatformForUrl(url: string | undefined): ShortVideoPlatform {
  const value = url?.toLowerCase() ?? "";
  if (value.includes("douyin.com") || value.includes("iesdouyin.com") || value.includes("amemv.com")) return "douyin";
  if (value.includes("kuaishou.com") || value.includes("gifshow.com") || value.includes("chenzhongtech.com")) return "kuaishou";
  return "unknown";
}

export function isPublicHttpVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (!host || host === "localhost" || host === "0.0.0.0" || host === "::1") return false;
    if (host.startsWith("127.")) return false;
    if (isPrivateIpv4Host(host)) return false;
    if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return false;
    return true;
  } catch {
    return false;
  }
}

function isPrivateIpv4Host(host: string): boolean {
  const parts = host.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 10 ||
    a === 127 ||
    a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 ||
    a === 192 && b === 168;
}

function resolveLocalReference(strength: ReferenceStrength, frameCount: number, resolvedReferenceVideoUrl?: string): ReferenceResolveResult {
  if (strength === "heavy") {
    if (!resolvedReferenceVideoUrl) {
      return {
        sourceType: "local_upload",
        strength,
        processingMode: "full_video",
        assetStatus: "failed",
        frameCount: 0,
        parseError: "参考视频处理失败，请重新上传本地视频。"
      };
    }
    return {
      sourceType: "local_upload",
      strength,
      processingMode: "full_video",
      assetStatus: "resolved",
      resolvedReferenceVideoUrl,
      frameCount: 0
    };
  }

  return {
    sourceType: "local_upload",
    strength,
    processingMode: strength === "medium" ? "multi_frame" : "single_frame",
    assetStatus: frameCount > 0 ? "resolved" : "failed",
    frameCount,
    parseError: frameCount > 0 ? undefined : "参考视频处理失败，请重新上传本地视频。"
  };
}

function resolveLinkReference(strength: ReferenceStrength, referenceLink?: string, resolvedReferenceVideoUrl?: string, frameCount = 0): ReferenceResolveResult {
  const platform = shortVideoPlatformForUrl(referenceLink);
  if (!referenceLink || !/^https?:\/\//i.test(referenceLink)) {
    return {
      sourceType: "link",
      strength,
      processingMode: "none",
      assetStatus: "failed",
      platform,
      frameCount: 0,
      parseError: "请输入有效的 http/https 参考视频链接。"
    };
  }

  const candidateUrl = resolvedReferenceVideoUrl || (directVideoPattern.test(referenceLink) ? referenceLink : undefined);
  if (strength !== "heavy" && frameCount > 0) {
    return {
      sourceType: "link",
      strength,
      processingMode: strength === "medium" ? "multi_frame" : "single_frame",
      assetStatus: "resolved",
      platform,
      resolvedReferenceVideoUrl,
      frameCount
    };
  }

  if (strength === "heavy" && candidateUrl) {
    return {
      sourceType: "link",
      strength,
      processingMode: "full_video",
      assetStatus: "resolved",
      platform,
      resolvedReferenceVideoUrl: candidateUrl,
      frameCount: 0
    };
  }

  if (platform === "douyin" || platform === "kuaishou") {
    return {
      sourceType: "link",
      strength,
      processingMode: strength === "heavy" ? "full_video" : strength === "medium" ? "multi_frame" : "single_frame",
      assetStatus: "failed",
      platform,
      frameCount: 0,
      parseError: `已识别${platform === "douyin" ? "抖音" : "快手"}链接；自建下载解析服务尚未解析出可用视频文件，请先上传本地视频。`
    };
  }

  return {
    sourceType: "link",
    strength,
    processingMode: strength === "heavy" ? "full_video" : strength === "medium" ? "multi_frame" : "single_frame",
    assetStatus: "failed",
    platform,
    frameCount: 0,
    parseError: "当前链接不是公开视频直链，暂时无法作为真实参考视频使用。"
  };
}
