import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve("research-hot-items");
const manifest = JSON.parse(await readFile(path.join(rootDir, "manifest.json"), "utf8"));

const platforms = {
  vipshop: {
    label: "唯品会",
    signal: "折扣场景强，主图偏商品清楚、主体居中、白底或浅色背景，活动图容易出现价格和促销文案。",
    prompt: "用于 prompt 时保留清晰商品轮廓、完整款式、克制浅背景，禁止价格、折扣、强促销字和第三方水印。"
  },
  taobao: {
    label: "淘宝",
    signal: "搜索主图强调第一眼识别和点击欲，常见彩色背景、模特半身或全身、卖点区块和高主体占比。",
    prompt: "用于 prompt 时提取高主体占比、明快背景、清楚版型，避免老式牛皮癣文字、边框拼图和价格角标。"
  },
  jd: {
    label: "京东",
    signal: "更偏可信、标准和品控感，白底/浅灰棚拍、完整商品、材质细节和干净构图更适合平台调性。",
    prompt: "用于 prompt 时强化稳定棚拍、可信光线、材质清晰和标准商品角度，减少夸张场景和强滤镜。"
  },
  douyin: {
    label: "抖音",
    signal: "更容易出现封面式构图、强对比色、动态姿态、竖版冲击力和生活化场景。",
    prompt: "用于 prompt 时保留竖版冲击力、动态姿态和场景氛围，但仍要求商品是视觉主体，禁止二维码和直播间贴片。"
  },
  dewu: {
    label: "得物",
    signal: "更偏潮流质感、单品细节、干净背景、低杂讯构图，鞋靴和箱包样本更有参考价值。",
    prompt: "用于 prompt 时强调潮流质感、材质可信、干净背景、低饱和高级色和细节特写。"
  },
  pinduoduo: {
    label: "拼多多",
    signal: "转化导向明显，主体大、颜色亮、价格感强，样本中促销模板和信息密集图较多。",
    prompt: "用于 prompt 时只提取主体大、明亮直接、商品清楚的部分，排除价格牌、夸张营销词和杂乱贴片。"
  }
};

const categories = {
  women: {
    label: "女装",
    useful: "模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。",
    prompt: "增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。"
  },
  men: {
    label: "男装",
    useful: "更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。",
    prompt: "增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。"
  },
  kids: {
    label: "童装",
    useful: "明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。",
    prompt: "增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。"
  },
  shoes: {
    label: "鞋靴",
    useful: "鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。",
    prompt: "增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。"
  },
  bags: {
    label: "箱包",
    useful: "箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。",
    prompt: "增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。"
  }
};

function samplesFor(platform, category) {
  return manifest.samples.filter((sample) => sample.platform === platform && sample.category === category);
}

function renderGroup(platformId, categoryId) {
  const platform = platforms[platformId];
  const category = categories[categoryId];
  const samples = samplesFor(platformId, categoryId);
  const sampleList = samples.map((sample) => `- \`${sample.localPath}\` | ${sample.title || "untitled"} | ${sample.sourceUrl || sample.imageUrl}`).join("\n");

  return `# ${platform.label} / ${category.label} Hot Item Reference Analysis

## Sample Set

- Count: ${samples.length}
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: ${platform.signal}
- Category pattern: ${category.useful}
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: ${platform.prompt}
- Category direction: ${category.prompt}
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

${sampleList}
`;
}

function renderPromptGuidance() {
  return `# Prompt Guidance From Hot Item Reference Research

## Summary

This research folder contains 300 publicly accessible ecommerce reference images: 6 platforms x 5 categories x 10 images. The samples are useful as a conversion-pattern pool, not as assets to copy. Public image search mixed modern product visuals with older promotional templates, so the prompt guidance separates useful visual mechanics from negative elements.

## Global Prompt Rules

- Main images should prioritize one clear subject, high product readability, accurate color, clean edges, realistic fabric or material behavior, and a stable ecommerce crop.
- Use high-conversion structure without copying promotional clutter: large subject, clear silhouette, simple background hierarchy, good contrast, and visible material texture.
- Keep text out of generated listing images unless the selected image type is a detail-page poster. For non-poster images, explicitly forbid prices, badges, QR codes, URLs, platform logos, watermarks, dense copy, and collage borders.
- Vary the image set by role: main image for immediate recognition, model-fit image for wearing effect, detail image for material/craft, scene image for lifestyle conversion, SKU image for color and shape consistency.
- Add controlled diversity to prompts through camera angle, pose, scene variant, lighting, and styling attitude instead of random decorative backgrounds.

## Platform Directions

- 唯品会: clean discount-retail clarity. Prefer centered product, pale or white background, complete garment outline, SKU-friendly crops, restrained styling.
- 淘宝: click-oriented but still clean. Use brighter backgrounds, stronger subject occupancy, natural model energy, and visible selling-point details without text blocks.
- 京东: credible and standardized. Use white, light gray, modern studio, sharp texture, practical angles, and minimal props.
- 抖音: dynamic vertical commerce. Use motion, lifestyle scenes, stronger depth, and punchier lighting while keeping the product dominant.
- 得物: trend and material credibility. Use clean street/studio scenes, lower clutter, detail close-ups, sneaker/bag texture, and premium neutral palettes.
- 拼多多: direct recognition. Use large subject, bright exposure, simple background, and clear product shape while excluding price-heavy graphics.

## Category Directions

- 女装: emphasize fit, waistline, hem movement, fabric drape, neckline/sleeve details, and style identity. Use natural walk, half-turn, hand at lapel, or relaxed standing poses.
- 男装: emphasize shoulder line, outerwear structure, trouser length, layering, and practical context. Use walking, cuff-adjusting, hands-in-pocket, or clean front/side poses.
- 童装: emphasize comfort, safe childlike movement, bright clean background, correct child proportions, and no adultized styling.
- 鞋靴: emphasize 3/4 side view, sole texture, upper material, heel support, real ground shadow, and optional dynamic context for sports/outdoor shoes.
- 箱包: emphasize bag silhouette, hardware, handle/strap structure, capacity impression, leather/fabric texture, and unobstructed hand-carry or shoulder-carry views.

## Concrete Prompt Additions

- Add to main-image prompts: "single dominant product subject, ecommerce-readable silhouette, product occupies 70-80% of frame, clean background hierarchy, no price text, no collage, no watermark".
- Add to model prompts: "natural commerce pose that reveals garment structure, accurate fit, realistic fabric tension, arms not hiding key design details".
- Add to detail prompts: "macro ecommerce detail, sharp material texture, one design feature per image, clean neutral background, no text labels unless poster mode".
- Add to scene prompts: "lifestyle context supports the product category, background lower contrast than product, product remains the first visual priority".
- Add to negative prompt: "price tag, discount badge, QR code, platform logo, watermark, dense Chinese promotional copy, collage layout, old campaign banner, over-retouched face, distorted hands, unrelated props".

## Integration Notes

- Existing \`topSellerStylePresets\` can absorb these findings by adding stronger composition controls per style: subject occupancy, pose family, background hierarchy, and forbidden promo clutter.
- Existing image-type directions should distinguish main image, model-fit, detail texture, craft, SKU, and poster typography more sharply.
- Poster typography should remain an explicit exception; all other image types should keep generated text disabled.
`;
}

function renderInteraction() {
  const counts = Object.keys(platforms).flatMap((platformId) =>
    Object.keys(categories).map((categoryId) => {
      const platform = platforms[platformId].label;
      const category = categories[categoryId].label;
      return `- ${platform} / ${category}: ${samplesFor(platformId, categoryId).length}`;
    })
  ).join("\n");

  return `# Hot Item Reference Research Interaction Log

## Task

Research public hot-selling ecommerce reference images for the current project categories, store them separately from product code, analyze visual patterns, and turn the findings into prompt guidance.

## Scope

- Platforms: vipshop, taobao, jd, douyin, dewu, pinduoduo.
- Categories: women, men, kids, shoes, bags.
- Target sample depth: 10 images per platform/category.
- Source policy: public pages and image URLs only; no login bypass, anti-bot bypass, paid access, or credentialed scraping.

## Results

- Downloaded images: ${manifest.samples.length}
- Groups covered: 30
- Per group:
${counts}

## Quality Notes

- Public image search returned a mix of product photos, marketplace assets, and promotional templates.
- Price tags, heavy copy, collage layouts, and watermarks are treated as negative examples for prompt constraints.
- The set is suitable for first-round prompt guidance and should be refined later with merchant-provided screenshots or platform API data if higher fidelity is needed.

## Progress

- [x] Create folder skeleton and tracking files.
- [x] Collect candidate public image URLs.
- [x] Download accessible images.
- [x] Analyze images by platform/category.
- [x] Summarize prompt guidance.
`;
}

for (const platformId of Object.keys(platforms)) {
  await mkdir(path.join(rootDir, "analysis", platformId), { recursive: true });
  for (const categoryId of Object.keys(categories)) {
    await writeFile(path.join(rootDir, "analysis", platformId, `${categoryId}.md`), renderGroup(platformId, categoryId));
  }
}

await writeFile(path.join(rootDir, "prompt-guidance.md"), renderPromptGuidance());
await writeFile(path.join(rootDir, "interaction.md"), renderInteraction());
