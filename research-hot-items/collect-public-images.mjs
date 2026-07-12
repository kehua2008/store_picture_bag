import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve("research-hot-items");
const manifestPath = path.join(rootDir, "manifest.json");

const platforms = [
  ["vipshop", "唯品会"],
  ["taobao", "淘宝"],
  ["jd", "京东"],
  ["douyin", "抖音小店"],
  ["dewu", "得物"],
  ["pinduoduo", "拼多多"]
];

const categories = [
  ["women", "女装"],
  ["men", "男装"],
  ["kids", "童装"],
  ["shoes", "鞋靴"],
  ["bags", "箱包"]
];

const samplesPerGroup = 10;
const maxCandidatesPerGroup = 45;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(input) {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractBingImageCandidates(html) {
  const decoded = decodeHtml(html);
  const candidates = [];
  const pattern = /"murl":"(https?:\/\/[^"]+)".*?"purl":"(https?:\/\/[^"]+)".*?"t":"([^"]*)"/g;
  let match;

  while ((match = pattern.exec(decoded)) !== null) {
    candidates.push({
      imageUrl: match[1],
      sourceUrl: match[2],
      title: match[3]
    });
  }

  if (candidates.length > 0) return candidates;

  return unique([...decoded.matchAll(/"murl":"(https?:\/\/[^"]+)"/g)].map((item) => item[1])).map((imageUrl) => ({
    imageUrl,
    sourceUrl: "",
    title: ""
  }));
}

function extensionFor(contentType, imageUrl) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const ext = path.extname(new URL(imageUrl).pathname).replace(".", "").toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext.replace("jpeg", "jpg") : "jpg";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 public ecommerce prompt research"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function downloadImage(candidate, outputPathBase) {
  const response = await fetch(candidate.imageUrl, {
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0 public ecommerce prompt research",
      "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    },
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) throw new Error(`not image: ${contentType}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 12000) throw new Error(`too small: ${buffer.length}`);

  const ext = extensionFor(contentType, candidate.imageUrl);
  const outputPath = `${outputPathBase}.${ext}`;
  await writeFile(outputPath, buffer);

  return {
    outputPath,
    contentType,
    bytes: buffer.length
  };
}

async function loadManifest() {
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

async function main() {
  const manifest = await loadManifest();
  const existingUrls = new Set(manifest.samples.map((sample) => sample.imageUrl));

  for (const [platformId, platformLabel] of platforms) {
    for (const [categoryId, categoryLabel] of categories) {
      const groupSamples = manifest.samples.filter((sample) => sample.platform === platformId && sample.category === categoryId);
      if (groupSamples.length >= samplesPerGroup) continue;

      const outputDir = path.join(rootDir, "images", platformId, categoryId);
      await mkdir(outputDir, { recursive: true });

      const query = `${platformLabel} ${categoryLabel} 爆款 主图 电商 商品图`;
      const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
      console.log(`collecting ${platformId}/${categoryId}: ${query}`);

      let html;
      try {
        html = await fetchText(searchUrl);
      } catch (error) {
        console.warn(`search failed ${platformId}/${categoryId}: ${error.message}`);
        continue;
      }

      const candidates = extractBingImageCandidates(html).slice(0, maxCandidatesPerGroup);
      let count = groupSamples.length;

      for (const candidate of candidates) {
        if (count >= samplesPerGroup) break;
        if (existingUrls.has(candidate.imageUrl)) continue;

        const index = String(count + 1).padStart(2, "0");
        const localBase = path.join(outputDir, `${platformId}-${categoryId}-${index}`);

        try {
          const downloaded = await downloadImage(candidate, localBase);
          const relativePath = path.relative(rootDir, downloaded.outputPath);
          manifest.samples.push({
            id: `${platformId}-${categoryId}-${index}`,
            platform: platformId,
            platformLabel,
            category: categoryId,
            categoryLabel,
            sourceType: "public_bing_image_search",
            query,
            sourceUrl: candidate.sourceUrl,
            imageUrl: candidate.imageUrl,
            title: candidate.title,
            localPath: relativePath,
            contentType: downloaded.contentType,
            bytes: downloaded.bytes,
            collectedAt: new Date().toISOString(),
            status: "downloaded"
          });
          existingUrls.add(candidate.imageUrl);
          count += 1;
          console.log(`  saved ${relativePath}`);
        } catch (error) {
          console.warn(`  skip ${candidate.imageUrl}: ${error.message}`);
        }

        await sleep(300);
      }

      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      await sleep(1200);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
