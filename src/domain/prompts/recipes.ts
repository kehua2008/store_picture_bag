import { resolveVipshopImageSpec } from "../vipshop/rules";
import type { ProductInput, ReferenceImageInput, VipshopAssetType } from "../vipshop/types";
import {
  legacyCategoryLabel,
  legacyVipshopAssetDirection,
  legacyVipshopForbiddenContentRule,
  legacyVipshopIdentityLock,
  legacyVipshopNegativePrompt,
  legacyVipshopQualityRule
} from "./promptTemplates";

export interface PromptRecipeInput {
  product: ProductInput;
  assetType: VipshopAssetType;
  referenceImage: ReferenceImageInput;
  researchTags?: string[];
}

export interface PromptRecipe {
  version: "vipshop-apparel-v1";
  userVisibleSummary: string;
  identityLock: string;
  providerPrompt: string;
  negativePrompt: string;
  target: {
    width: number;
    height: number;
    assetType: VipshopAssetType;
  };
}

export function buildPromptRecipe(input: PromptRecipeInput): PromptRecipe {
  const spec = resolveVipshopImageSpec(input.product.category, input.assetType);
  const sellingPoints = input.product.sellingPoints?.filter(Boolean).join(", ") || "accurate product shape and material";
  const researchTags = input.researchTags?.length ? ` Research signals: ${input.researchTags.join(", ")}.` : "";

  const providerPrompt = [
    legacyVipshopIdentityLock,
    `Product category: ${legacyCategoryLabel[input.product.category]}.`,
    `Product title: ${input.product.title}. Color: ${input.product.color}.`,
    input.product.material ? `Material: ${input.product.material}.` : "",
    input.product.season ? `Season: ${input.product.season}.` : "",
    input.product.style ? `Style: ${input.product.style}.` : "",
    `Commercial selling points to express visually: ${sellingPoints}.`,
    legacyVipshopAssetDirection[input.assetType],
    `Target Vipshop canvas: ${spec.width}x${spec.height}, ${spec.ratio}, JPEG, RGB, 72dpi.`,
    legacyVipshopQualityRule,
    legacyVipshopForbiddenContentRule,
    researchTags
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: "vipshop-apparel-v1",
    userVisibleSummary: `唯品会${input.assetType}生成，${spec.width}x${spec.height}`,
    identityLock: legacyVipshopIdentityLock,
    providerPrompt,
    negativePrompt: legacyVipshopNegativePrompt,
    target: {
      width: spec.width,
      height: spec.height,
      assetType: input.assetType
    }
  };
}
