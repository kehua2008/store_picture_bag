import type { VipshopAssetType, VipshopCategory } from "../vipshop/types";

export type QualityCheckSeverity = "blocking" | "warning";

export interface ImageMetadataInput {
  width: number;
  height: number;
  mimeType: string;
  fileSizeBytes: number;
  dpi?: number;
  colorMode?: "rgb" | "cmyk" | "unknown";
  whitePixelRatio?: number;
  subjectOccupancy?: number;
  detectedForbiddenElements?: string[];
}

export interface QualityCheckResult {
  code: string;
  passed: boolean;
  severity: QualityCheckSeverity;
  message: string;
  measured?: Record<string, string | number | boolean | undefined>;
}

export interface QualityReport {
  category: VipshopCategory;
  assetType: VipshopAssetType;
  usable: boolean;
  checks: QualityCheckResult[];
}
