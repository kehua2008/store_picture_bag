import type { PromptRecipe } from "../prompts/recipes";
import type { SuiteCreativePlanItem } from "../suites/suiteCreativePlan";
import type { ReferenceImageInput } from "../vipshop/types";

export type ProviderErrorCode =
  | "provider_missing_config"
  | "provider_rate_limited"
  | "provider_timeout"
  | "provider_bad_request"
  | "provider_unknown";

export interface GeneratedImage {
  id: string;
  base64: string;
  url?: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  model: string;
  provider: string;
  sourceFilename?: string;
  generationOrder?: number;
  imageTypeId?: string;
  imageTypeLabel?: string;
  suiteItemId?: string;
  suiteOrder?: number;
  suiteRole?: string;
  suiteLabel?: string;
  suiteCreativeItem?: SuiteCreativePlanItem;
  topSellerStyleId?: string;
  topSellerStyleLabel?: string;
  customStyleId?: string;
  customStyleLabel?: string;
}

export interface ProviderError {
  code: ProviderErrorCode;
  message: string;
  retryable: boolean;
}

export type ProviderResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ProviderError };

export interface GenerateImageInput {
  recipe: PromptRecipe;
  referenceImage: ReferenceImageInput;
  referenceImages?: ReferenceImageInput[];
  modelReferenceImage?: ReferenceImageInput;
  n?: number;
}

export interface ImageProvider {
  name: string;
  generate(input: GenerateImageInput): Promise<ProviderResult<GeneratedImage[]>>;
}
