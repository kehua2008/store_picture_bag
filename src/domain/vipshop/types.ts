export type VipshopCategory = "top" | "bottom" | "shoes";

export type VipshopAssetType =
  | "main_scene"
  | "main_side_back"
  | "detail"
  | "white_bg"
  | "sku_color";

export type BackgroundRule = "scene_clean" | "pure_white" | "not_applicable";

export interface VipshopImageSpec {
  category: VipshopCategory;
  assetType: VipshopAssetType;
  width: number;
  height: number;
  ratio: "3:4" | "1:1";
  minWidth: number;
  minHeight: number;
  maxFileSizeMb: number;
  format: "jpeg";
  colorMode: "rgb";
  dpi: 72;
  backgroundRule: BackgroundRule;
  subjectOccupancy: {
    min: number;
    max: number;
  };
  forbiddenElements: string[];
}

export interface ProductInput {
  category: VipshopCategory;
  title: string;
  color: string;
  material?: string;
  season?: string;
  style?: string;
  sellingPoints?: string[];
  skuColors?: string[];
}

export interface ReferenceImageInput {
  id: string;
  filename: string;
  mimeType: string;
  dataUrl?: string;
  file?: Blob;
}
