import { resolveVipshopImageSpec } from "../vipshop/rules";
import type { VipshopAssetType, VipshopCategory } from "../vipshop/types";
import type { ImageMetadataInput, QualityCheckResult, QualityReport } from "./types";

const bytesPerMb = 1024 * 1024;

export function runQualityChecks(params: {
  category: VipshopCategory;
  assetType: VipshopAssetType;
  metadata: ImageMetadataInput;
}): QualityReport {
  const spec = resolveVipshopImageSpec(params.category, params.assetType);
  const metadata = params.metadata;
  const checks: QualityCheckResult[] = [];

  checks.push({
    code: "dimensions",
    passed: metadata.width === spec.width && metadata.height === spec.height,
    severity: "blocking",
    message: `Image must be ${spec.width}x${spec.height}.`,
    measured: { width: metadata.width, height: metadata.height }
  });

  checks.push({
    code: "mime_type",
    passed: metadata.mimeType === "image/jpeg",
    severity: "blocking",
    message: "Image must be exported as JPG/JPEG.",
    measured: { mimeType: metadata.mimeType }
  });

  checks.push({
    code: "file_size",
    passed: metadata.fileSizeBytes <= spec.maxFileSizeMb * bytesPerMb,
    severity: "blocking",
    message: `Image must be no larger than ${spec.maxFileSizeMb}MB.`,
    measured: { fileSizeBytes: metadata.fileSizeBytes, maxMb: spec.maxFileSizeMb }
  });

  checks.push({
    code: "color_mode",
    passed: (metadata.colorMode ?? "rgb") === "rgb",
    severity: "blocking",
    message: "Image must use RGB color mode.",
    measured: { colorMode: metadata.colorMode ?? "rgb" }
  });

  if (spec.backgroundRule === "pure_white") {
    checks.push({
      code: "white_background",
      passed: (metadata.whitePixelRatio ?? 0) >= 0.96,
      severity: "blocking",
      message: "White-background assets need a pure RGB 255,255,255 background.",
      measured: { whitePixelRatio: metadata.whitePixelRatio ?? 0 }
    });
  }

  const occupancy = metadata.subjectOccupancy ?? spec.subjectOccupancy.min;
  checks.push({
    code: "subject_occupancy",
    passed: occupancy >= spec.subjectOccupancy.min && occupancy <= spec.subjectOccupancy.max,
    severity: "blocking",
    message: `Subject occupancy must stay between ${spec.subjectOccupancy.min} and ${spec.subjectOccupancy.max}.`,
    measured: { subjectOccupancy: occupancy }
  });

  const forbidden = metadata.detectedForbiddenElements ?? [];
  checks.push({
    code: "forbidden_elements",
    passed: forbidden.length === 0,
    severity: "blocking",
    message: "Image must not contain text, watermark, QR code, price, URL, border, collage, or third-party logo.",
    measured: { detectedCount: forbidden.length, detected: forbidden.join(",") }
  });

  return {
    category: params.category,
    assetType: params.assetType,
    usable: checks.every((check) => check.passed || check.severity !== "blocking"),
    checks
  };
}
