export type PosterTemplateId = "clean-corner" | "side-editorial" | "bottom-card" | "detail-callout";

export type PosterZoneId = "top-left" | "top-right" | "left-side" | "right-side" | "bottom-left" | "bottom-right";

export interface PosterCopy {
  title: string;
  subtitle: string;
  bullets: string[];
  templateId: PosterTemplateId;
}

export interface PosterTemplatePreset {
  id: PosterTemplateId;
  label: string;
  description: string;
  preferredZones: PosterZoneId[];
  accent: string;
}

interface PosterTypographyProfile {
  titleFont: string;
  subtitleFont: string;
  bulletFont: string;
  detailFont: string;
  titleFill: string;
  subtitleFill: string;
  bulletFill: string;
  cardFill: string;
  cardStroke: string;
  accentLine: string;
  pillFill: string;
  pillStroke: string;
  pillTextFill: string;
  titleStroke?: string;
  titleStrokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  titleLineGap: number;
  subtitleLineGap: number;
}

export const posterFontStacks = {
  modernSans: "'Source Han Sans SC', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  editorialSerif: "'Source Han Serif SC', 'Noto Serif CJK SC', 'Songti SC', 'STSong', serif",
  roundedSans: "'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  wenkai: "'LXGW WenKai', 'Kaiti SC', 'STKaiti', 'PingFang SC', serif",
  condensedDisplay: "'Source Han Sans SC', 'Noto Sans CJK SC', 'Arial Narrow', 'PingFang SC', sans-serif"
} as const;

export interface PosterZoneScore {
  id: PosterZoneId;
  score: number;
}

interface PosterZoneRect {
  id: PosterZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const posterTemplatePresets: PosterTemplatePreset[] = [
  {
    id: "clean-corner",
    label: "角标首屏",
    description: "小标题和短卖点，适合模特/商品主体居中的详情首屏",
    preferredZones: ["top-left", "top-right"],
    accent: "#e2e8f0"
  },
  {
    id: "side-editorial",
    label: "广告画册",
    description: "侧边信息区，适合天猫详情首屏的场景页头",
    preferredZones: ["left-side", "right-side"],
    accent: "#f8fafc"
  },
  {
    id: "bottom-card",
    label: "底部卖点卡",
    description: "底部克制信息卡，适合上半身或上方主体图",
    preferredZones: ["bottom-left", "bottom-right"],
    accent: "#bfdbfe"
  },
  {
    id: "detail-callout",
    label: "细节标注",
    description: "小标签与细线标注，适合材质、五金、工艺和局部细节",
    preferredZones: ["top-left", "bottom-right"],
    accent: "#cbd5e1"
  }
];

export function getPosterTypographyProfile(templateId: PosterTemplateId): PosterTypographyProfile {
  if (templateId === "side-editorial") {
    return {
      titleFont: `800 38px ${posterFontStacks.editorialSerif}`,
      subtitleFont: `500 18px ${posterFontStacks.modernSans}`,
      bulletFont: `700 16px ${posterFontStacks.modernSans}`,
      detailFont: `800 14px ${posterFontStacks.modernSans}`,
      titleFill: "#f8fafc",
      subtitleFill: "rgba(226, 232, 240, 0.9)",
      bulletFill: "#e2e8f0",
      cardFill: "rgba(8, 15, 32, 0.42)",
      cardStroke: "rgba(248, 250, 252, 0.18)",
      accentLine: "#f8fafc",
      pillFill: "rgba(248, 250, 252, 0.1)",
      pillStroke: "rgba(248, 250, 252, 0.2)",
      pillTextFill: "#f8fafc",
      titleStroke: "rgba(15, 23, 42, 0.4)",
      titleStrokeWidth: 2,
      shadowColor: "rgba(2, 6, 23, 0.34)",
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      titleLineGap: 46,
      subtitleLineGap: 28
    };
  }

  if (templateId === "bottom-card") {
    return {
      titleFont: `800 34px ${posterFontStacks.condensedDisplay}`,
      subtitleFont: `500 18px ${posterFontStacks.modernSans}`,
      bulletFont: `700 16px ${posterFontStacks.modernSans}`,
      detailFont: `800 14px ${posterFontStacks.modernSans}`,
      titleFill: "#f8fafc",
      subtitleFill: "rgba(226, 232, 240, 0.88)",
      bulletFill: "#dbeafe",
      cardFill: "rgba(2, 6, 23, 0.46)",
      cardStroke: "rgba(248, 250, 252, 0.16)",
      accentLine: "#bfdbfe",
      pillFill: "rgba(191, 219, 254, 0.12)",
      pillStroke: "rgba(191, 219, 254, 0.24)",
      pillTextFill: "#eff6ff",
      titleStroke: "rgba(15, 23, 42, 0.32)",
      titleStrokeWidth: 1.5,
      shadowColor: "rgba(2, 6, 23, 0.3)",
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      titleLineGap: 42,
      subtitleLineGap: 28
    };
  }

  if (templateId === "detail-callout") {
    return {
      titleFont: `800 22px ${posterFontStacks.modernSans}`,
      subtitleFont: `500 16px ${posterFontStacks.roundedSans}`,
      bulletFont: `700 14px ${posterFontStacks.roundedSans}`,
      detailFont: `800 14px ${posterFontStacks.modernSans}`,
      titleFill: "#f8fafc",
      subtitleFill: "rgba(226, 232, 240, 0.86)",
      bulletFill: "#e2e8f0",
      cardFill: "rgba(2, 6, 23, 0.62)",
      cardStroke: "rgba(248, 250, 252, 0.18)",
      accentLine: "#cbd5e1",
      pillFill: "rgba(248, 250, 252, 0.1)",
      pillStroke: "rgba(248, 250, 252, 0.2)",
      pillTextFill: "#f8fafc",
      shadowColor: "rgba(2, 6, 23, 0.24)",
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      titleLineGap: 26,
      subtitleLineGap: 24
    };
  }

  return {
    titleFont: `800 34px ${posterFontStacks.wenkai}`,
    subtitleFont: `500 18px ${posterFontStacks.modernSans}`,
    bulletFont: `700 16px ${posterFontStacks.modernSans}`,
    detailFont: `800 14px ${posterFontStacks.modernSans}`,
    titleFill: "#f8fafc",
    subtitleFill: "rgba(226, 232, 240, 0.88)",
    bulletFill: "#e2e8f0",
    cardFill: "rgba(2, 6, 23, 0.44)",
    cardStroke: "rgba(248, 250, 252, 0.18)",
    accentLine: "#e2e8f0",
    pillFill: "rgba(248, 250, 252, 0.1)",
    pillStroke: "rgba(248, 250, 252, 0.2)",
    pillTextFill: "#f8fafc",
    shadowColor: "rgba(2, 6, 23, 0.28)",
    shadowBlur: 8,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    titleLineGap: 42,
    subtitleLineGap: 28
  };
}

export const POSTER_CANVAS_WIDTH = 790;
export const POSTER_CANVAS_HEIGHT = 1200;

const categoryCopyMap = [
  { match: /旅行箱|拉杆箱|登机箱|行李箱/i, title: "轻量大容量", subtitle: "顺滑轮组 出行收纳更从容", bullets: ["分区收纳", "顺滑推行"] },
  { match: /包|箱/i, title: "实用容量感", subtitle: "材质细节清楚 通勤出行都合适", bullets: ["容量分区", "质感五金"] },
  { match: /护肤|面霜|精华|洁面|防晒/i, title: "细腻肤感", subtitle: "清透质地 日常护理更安心", bullets: ["清爽吸收", "温和护理"] },
  { match: /彩妆|口红|粉底|眼影/i, title: "显色质感", subtitle: "妆效清晰 轻松打造精致氛围", bullets: ["细腻贴肤", "持妆自然"] },
  { match: /母婴|童包|婴/i, title: "安心柔软", subtitle: "亲肤材质 守护日常成长", bullets: ["柔软亲肤", "细节安心"] },
  { match: /家纺|床品|收纳|餐厨|家居/i, title: "舒适生活感", subtitle: "实用细节 提升日常居家质感", bullets: ["耐用好打理", "空间更整洁"] },
  { match: /手机|平板|耳机|智能|数码/i, title: "清晰科技感", subtitle: "细节配置直观 展现可靠体验", bullets: ["性能清晰", "质感机身"] },
  { match: /零食|饮品|粮油|食品/i, title: "新鲜好滋味", subtitle: "包装清晰 呈现真实食用场景", bullets: ["风味饱满", "安心优选"] },
  { match: /运动|户外|露营|骑行|健身/i, title: "户外机能感", subtitle: "轻松应对运动与日常场景", bullets: ["耐用支撑", "自在活动"] },
  { match: /珠宝|首饰|配饰/i, title: "精致光泽感", subtitle: "细节闪耀 点亮日常造型", bullets: ["细腻光泽", "精巧百搭"] },
  { match: /汽车|车载|车内|美容养护/i, title: "车生活质感", subtitle: "适配清晰 使用场景更直观", bullets: ["安装便捷", "耐用可靠"] }
];

export function defaultPosterCopy(input: { categoryLabel: string; styleLabel: string; majorCategoryLabel?: string; imageTypeLabel?: string; imageTypeId?: string }): PosterCopy {
  const haystack = [input.majorCategoryLabel, input.categoryLabel, input.imageTypeLabel].filter(Boolean).join(" ");
  const preset = categoryCopyMap.find((item) => item.match.test(haystack));
  const isDetailCallout = /细节|工艺|材质|卖点|模块|局部/.test(input.imageTypeLabel ?? "") || input.imageTypeId?.includes("texture") || input.imageTypeId?.includes("craft");
  const isWhiteProduct = /白底|商品展示/.test(input.imageTypeLabel ?? "") || input.imageTypeId?.includes("white");
  const isModelFit = /模特|持包|背包|搭配/.test(input.imageTypeLabel ?? "") || input.imageTypeId?.includes("model");

  return {
    title: isDetailCallout ? preset?.bullets[0] ?? "细节清晰" : isWhiteProduct ? input.categoryLabel : preset?.title ?? "质感日常款",
    subtitle: isModelFit ? `${preset?.title ?? input.categoryLabel} 实拍携带参考` : isDetailCallout ? `放大${input.categoryLabel}核心卖点` : preset?.subtitle ?? `${input.styleLabel}风格 展示商品细节`,
    bullets: isWhiteProduct ? ["轮廓清楚", "细节真实"] : preset?.bullets ?? ["卖点明确", "细节清楚"],
    templateId: isDetailCallout ? "detail-callout" : "side-editorial"
  };
}

export function normalizePosterCopy(copy: Partial<PosterCopy>, fallback: PosterCopy): PosterCopy {
  const bullets = (copy.bullets ?? []).map(cleanText).filter(Boolean);
  return {
    title: limitText(cleanText(copy.title) || fallback.title, 12),
    subtitle: limitText(cleanText(copy.subtitle) || fallback.subtitle, 18),
    bullets: (bullets.length ? bullets : fallback.bullets).map((item) => limitText(item, 8)).slice(0, 2),
    templateId: posterTemplatePresets.some((item) => item.id === copy.templateId) ? copy.templateId! : fallback.templateId
  };
}

export function wrapPosterText(ctx: Pick<CanvasRenderingContext2D, "measureText">, text: string, maxWidth: number): string[] {
  const source = cleanText(text);
  if (!source) return [];

  const lines: string[] = [];
  let line = "";

  for (const char of Array.from(source)) {
    const next = `${line}${char}`;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 2);
}

export function selectSafestPosterZone(scores: PosterZoneScore[], preferredZones: PosterZoneId[]): PosterZoneId {
  const preferred = scores.filter((item) => preferredZones.includes(item.id));
  const candidates = preferred.length ? preferred : scores;
  return [...candidates].sort((a, b) => a.score - b.score)[0]?.id ?? preferredZones[0] ?? "top-left";
}

export async function composePosterDataUrl(baseImageSrc: string, copy: PosterCopy): Promise<string> {
  const image = await loadImage(baseImageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_CANVAS_WIDTH;
  canvas.height = POSTER_CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return baseImageSrc;

  drawCoverImage(ctx, image, canvas.width, canvas.height);
  const template = posterTemplatePresets.find((item) => item.id === copy.templateId) ?? posterTemplatePresets[0];
  const typography = getPosterTypographyProfile(template.id);
  const zone = selectSafestPosterZone(analyzePosterZones(ctx, canvas.width, canvas.height), template.preferredZones);
  drawPosterOverlay(ctx, canvas.width, canvas.height, copy, template, typography, zone);
  return canvas.toDataURL("image/png", 0.96);
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const dx = (width - drawWidth) / 2;
  const dy = (height - drawHeight) / 2;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}

function analyzePosterZones(ctx: CanvasRenderingContext2D, width: number, height: number): PosterZoneScore[] {
  return posterZoneRects(width, height).map((zone) => {
    const data = ctx.getImageData(zone.x, zone.y, zone.width, zone.height).data;
    let brightnessTotal = 0;
    let edgeTotal = 0;
    let previous = 0;
    const samples = Math.max(1, Math.floor(data.length / 16));

    for (let index = 0; index < data.length; index += 16) {
      const brightness = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      brightnessTotal += brightness;
      edgeTotal += Math.abs(brightness - previous);
      previous = brightness;
    }

    const average = brightnessTotal / samples;
    const edge = edgeTotal / samples;
    const centerPenalty = zone.id.includes("side") ? 8 : 0;
    const lowContrastPenalty = average > 86 && average < 176 ? 10 : 0;
    return { id: zone.id, score: edge + centerPenalty + lowContrastPenalty };
  });
}

function posterZoneRects(width: number, height: number): PosterZoneRect[] {
  return [
    { id: "top-left", x: 36, y: 42, width: Math.round(width * 0.44), height: 230 },
    { id: "top-right", x: Math.round(width * 0.52), y: 42, width: Math.round(width * 0.42), height: 230 },
    { id: "left-side", x: 36, y: 260, width: Math.round(width * 0.34), height: 470 },
    { id: "right-side", x: Math.round(width * 0.62), y: 260, width: Math.round(width * 0.32), height: 470 },
    { id: "bottom-left", x: 36, y: Math.round(height * 0.72), width: Math.round(width * 0.48), height: 210 },
    { id: "bottom-right", x: Math.round(width * 0.48), y: Math.round(height * 0.72), width: Math.round(width * 0.46), height: 210 }
  ];
}

function drawPosterOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  copy: PosterCopy,
  template: PosterTemplatePreset,
  typography: PosterTypographyProfile,
  zoneId: PosterZoneId
) {
  const rect = posterZoneRects(width, height).find((item) => item.id === zoneId) ?? posterZoneRects(width, height)[0];
  drawSoftVignette(ctx, width, height);

  if (template.id === "detail-callout") {
    drawDetailCallout(ctx, rect, copy, template, typography);
    return;
  }

  drawInfoCard(ctx, rect, template, typography);
  const padding = template.id === "side-editorial" ? 22 : 18;
  const textX = rect.x + padding;
  let textY = rect.y + padding;
  const maxTextWidth = rect.width - padding * 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = typography.titleFont;
  ctx.fillStyle = typography.titleFill;
  ctx.shadowColor = typography.shadowColor ?? "transparent";
  ctx.shadowBlur = typography.shadowBlur ?? 0;
  ctx.shadowOffsetX = typography.shadowOffsetX ?? 0;
  ctx.shadowOffsetY = typography.shadowOffsetY ?? 0;
  if (typography.titleStroke && typography.titleStrokeWidth) {
    ctx.lineWidth = typography.titleStrokeWidth;
    ctx.strokeStyle = typography.titleStroke;
  }
  const titleLines = wrapPosterText(ctx, copy.title, maxTextWidth);
  titleLines.forEach((line) => {
    if (typography.titleStroke && typography.titleStrokeWidth) {
      ctx.strokeText(line, textX, textY);
    }
    ctx.fillText(line, textX, textY);
    textY += typography.titleLineGap;
  });

  ctx.shadowColor = "transparent";
  ctx.fillStyle = typography.subtitleFill;
  ctx.font = typography.subtitleFont;
  wrapPosterText(ctx, copy.subtitle, maxTextWidth).forEach((line) => {
    ctx.fillText(line, textX, textY + 8);
    textY += typography.subtitleLineGap;
  });

  const bulletY = Math.min(rect.y + rect.height - 48, textY + 18);
  ctx.font = typography.bulletFont;
  ctx.fillStyle = typography.bulletFill;
  copy.bullets.slice(0, 2).forEach((bullet, index) => {
    const x = textX + index * Math.min(132, maxTextWidth / 2);
    drawTinyPill(ctx, x, bulletY, bullet, typography);
  });
}

function drawDetailCallout(ctx: CanvasRenderingContext2D, rect: PosterZoneRect, copy: PosterCopy, template: PosterTemplatePreset, typography: PosterTypographyProfile) {
  const x = rect.x;
  const y = rect.y + 10;
  ctx.save();
  ctx.strokeStyle = typography.accentLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 18);
  ctx.lineTo(x + 86, y + 18);
  ctx.lineTo(x + 112, y + 42);
  ctx.stroke();

  ctx.fillStyle = typography.cardFill;
  ctx.beginPath();
  ctx.roundRect(x, y, Math.min(260, rect.width), 72, 16);
  ctx.fill();

  ctx.fillStyle = template.accent;
  ctx.font = typography.detailFont;
  ctx.fillText(copy.bullets[0] ?? copy.title, x + 16, y + 16);
  ctx.fillStyle = typography.titleFill;
  ctx.font = typography.titleFont;
  ctx.fillText(copy.title, x + 16, y + 38);
  ctx.restore();
}

function drawSoftVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(2, 6, 23, 0.16)");
  shade.addColorStop(0.48, "rgba(2, 6, 23, 0.02)");
  shade.addColorStop(1, "rgba(2, 6, 23, 0.18)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
}

function drawInfoCard(ctx: CanvasRenderingContext2D, rect: PosterZoneRect, template: PosterTemplatePreset, typography: PosterTypographyProfile) {
  ctx.save();
  ctx.fillStyle = typography.cardFill;
  ctx.strokeStyle = typography.cardStroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = typography.accentLine;
  ctx.fillRect(rect.x + 18, rect.y + 14, 42, 2);
  ctx.restore();
}

function drawTinyPill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, typography: PosterTypographyProfile) {
  const width = Math.min(116, Math.max(68, ctx.measureText(text).width + 24));
  ctx.save();
  ctx.fillStyle = typography.pillFill;
  ctx.strokeStyle = typography.pillStroke;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 30, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = typography.pillTextFill;
  ctx.fillText(text, x + 12, y + 7);
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("poster_base_image_load_failed"));
    image.src = src;
  });
}

function cleanText(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function limitText(value: string, maxLength: number) {
  return Array.from(value).slice(0, maxLength).join("");
}
