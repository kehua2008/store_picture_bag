import type { VipshopAssetType, VipshopCategory, VipshopImageSpec } from "./types";

const forbiddenElements = [
  "watermark",
  "promotional_text",
  "price",
  "qr_code",
  "url",
  "third_party_logo",
  "collage",
  "border",
  "unrelated_props"
];

export function resolveVipshopImageSpec(
  category: VipshopCategory,
  assetType: VipshopAssetType
): VipshopImageSpec {
  if (assetType === "white_bg" || assetType === "sku_color") {
    return {
      category,
      assetType,
      width: 1200,
      height: 1200,
      ratio: "1:1",
      minWidth: 800,
      minHeight: 800,
      maxFileSizeMb: assetType === "sku_color" ? 0.5 : 2,
      format: "jpeg",
      colorMode: "rgb",
      dpi: 72,
      backgroundRule: "pure_white",
      subjectOccupancy: { min: 0.7, max: 0.85 },
      forbiddenElements
    };
  }

  return {
    category,
    assetType,
    width: 1340,
    height: 1785,
    ratio: "3:4",
    minWidth: 1340,
    minHeight: 1785,
    maxFileSizeMb: assetType === "detail" ? 1.5 : 1,
    format: "jpeg",
    colorMode: "rgb",
    dpi: 72,
    backgroundRule: assetType === "detail" ? "not_applicable" : "scene_clean",
    subjectOccupancy: { min: 0.68, max: 0.9 },
    forbiddenElements
  };
}

export function listSupportedCategories(): VipshopCategory[] {
  return ["top", "bottom", "shoes"];
}

export function listAssetTypes(): VipshopAssetType[] {
  return ["main_scene", "main_side_back", "detail", "white_bg", "sku_color"];
}
