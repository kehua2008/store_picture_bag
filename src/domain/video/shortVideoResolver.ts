import { assertValidReferenceVideoBytes, isSupportedReferenceVideoType, storeReferenceVideo, type StoredReferenceVideo } from "./referenceAssetStore";
import { shortVideoPlatformForUrl, type ShortVideoPlatform } from "./referenceResolver";

export interface ShortVideoResolveResult {
  platform: ShortVideoPlatform;
  sourceUrl: string;
  finalPageUrl?: string;
  title?: string;
  stored?: StoredReferenceVideo;
  candidateVideoUrl?: string;
  error?: string;
}

const maxDownloadBytes = 120 * 1024 * 1024;

export async function resolveShortVideoReference(input: {
  url: string;
  requestUrl: string;
  fetcher?: typeof fetch;
}): Promise<ShortVideoResolveResult> {
  const sourceUrl = extractFirstHttpUrl(input.url) ?? input.url.trim();
  const platform = shortVideoPlatformForUrl(sourceUrl);
  const fetcher = input.fetcher ?? fetch;
  if (!/^https?:\/\//i.test(sourceUrl)) return { platform, sourceUrl, error: "请输入有效的 http/https 视频链接。" };

  const direct = await tryDownloadVideo(fetcher, sourceUrl, input.requestUrl);
  if (direct.stored) return { platform, sourceUrl, finalPageUrl: sourceUrl, stored: direct.stored, candidateVideoUrl: sourceUrl };

  const page = await fetchText(fetcher, sourceUrl);
  if (!page.text) {
    return {
      platform,
      sourceUrl,
      finalPageUrl: page.finalUrl,
      error: platformResolveFailureMessage(platform, direct.error || page.error)
    };
  }

  const candidateUrls = extractCandidateVideoUrls(page.text);
  for (const candidateUrl of candidateUrls) {
    const downloaded = await tryDownloadVideo(fetcher, candidateUrl, input.requestUrl);
    if (downloaded.stored) {
      return {
        platform,
        sourceUrl,
        finalPageUrl: page.finalUrl,
        title: extractTitle(page.text),
        stored: downloaded.stored,
        candidateVideoUrl: candidateUrl
      };
    }
  }

  return {
    platform,
    sourceUrl,
    finalPageUrl: page.finalUrl,
    title: extractTitle(page.text),
    candidateVideoUrl: candidateUrls[0],
    error: platform === "douyin" || platform === "kuaishou"
      ? platformResolveFailureMessage(platform)
      : "当前链接不是可下载视频文件，暂时无法作为参考视频。"
  };
}

export function extractFirstHttpUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s，。；;、]+/i);
  return match?.[0]?.replace(/[，。!！）)\]]+$/g, "");
}

export function extractCandidateVideoUrls(html: string): string[] {
  const normalized = html
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .replace(/%2F/gi, "/");
  const urls = new Set<string>();
  const patterns = [
    /https?:\/\/[^"'\\\s<>]+?\.(?:mp4|mov|m4v|webm)(?:\?[^"'\\\s<>]*)?/gi,
    /https?:\/\/[^"'\\\s<>]+?(?:playwm|play_addr|video|tos-cn|gifshow)[^"'\\\s<>]*/gi
  ];
  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const value = trimCandidateUrl(match[0]);
      if (value && /^https?:\/\//i.test(value)) urls.add(value);
    }
  }
  return Array.from(urls).slice(0, 12);
}

async function fetchText(fetcher: typeof fetch, url: string): Promise<{ text?: string; finalUrl?: string; error?: string }> {
  try {
    const response = await fetcher(url, {
      headers: browserLikeHeaders(),
      redirect: "follow"
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) return { finalUrl: response.url, error: `平台页面请求失败：${response.status}` };
    if (!contentType.includes("text/html") && !contentType.includes("application/json") && !contentType.includes("text/plain")) {
      return { finalUrl: response.url, error: `链接返回的不是可解析页面：${contentType || "unknown"}` };
    }
    return { text: await response.text(), finalUrl: response.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "链接解析请求失败" };
  }
}

async function tryDownloadVideo(fetcher: typeof fetch, url: string, requestUrl: string): Promise<{ stored?: StoredReferenceVideo; error?: string }> {
  try {
    const response = await fetcher(url, {
      headers: browserLikeHeaders(),
      redirect: "follow"
    });
    const contentType = response.headers.get("content-type") ?? "";
    const filename = filenameFromUrl(response.url || url);
    if (!response.ok) return { error: `视频下载失败：${response.status}` };
    if (!isSupportedReferenceVideoType(contentType, filename)) return { error: `链接返回的不是视频文件：${contentType || "unknown"}` };

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maxDownloadBytes) return { error: "参考视频超过 120MB，请换一个更短的视频。" };

    const bytes = Buffer.from(await response.arrayBuffer());
    assertValidReferenceVideoBytes(bytes, {
      mimeType: contentType || "video/mp4",
      filename,
      requireMinSize: true
    });
    const stored = await storeReferenceVideo({
      bytes,
      mimeType: contentType || "video/mp4",
      originalName: filename,
      requestUrl,
      requireMinSize: true
    });
    return { stored };
  } catch (error) {
    return { error: downloadErrorMessage(error) };
  }
}

function platformResolveFailureMessage(platform: ShortVideoPlatform, detail?: string): string {
  if (platform === "douyin" || platform === "kuaishou") {
    const name = platform === "douyin" ? "抖音" : "快手";
    return `已识别${name}链接，但当前页面规则未解析出可下载视频文件，请上传本地视频。`;
  }
  return detail || "链接解析失败，请上传本地视频。";
}

function downloadErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "invalid_reference_video_content") return "下载内容不是有效视频文件。";
  if (message === "reference_video_too_small") return "下载内容过小，不是有效参考视频。";
  return message || "视频下载失败";
}

function browserLikeHeaders(): HeadersInit {
  return {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,video/mp4,video/webm,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  };
}

function extractTitle(html: string): string | undefined {
  const title = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim();
  return title || undefined;
}

function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "reference.mp4";
  } catch {
    return "reference.mp4";
  }
}

function trimCandidateUrl(url: string): string {
  return url
    .replace(/[),.;\]}]+$/g, "")
    .replace(/\\u0026/g, "&")
    .replace(/&quot.*$/i, "")
    .trim();
}
