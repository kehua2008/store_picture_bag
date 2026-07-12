## Why

唯品会鞋服商家需要一种简单但稳定的方式，把商品参考图转成专业、合规、可上架的电商图片。首版聚焦上衣、下衣和鞋，用更窄的品类范围换取更高的提示词质量、质检覆盖和可用率。

## What Changes

- Add a Next.js full-stack image generation workspace for Vipshop apparel imagery.
- Add a hidden prompt recipe system that turns product attributes and reference image analysis into model-ready ecommerce prompts.
- Add a Vipshop image rules engine for apparel asset requirements, including main images, white-background images, SKU color images, and detail images.
- Add an image provider abstraction with OpenAI Images as the default provider and room for later provider implementations.
- Add automatic quality checks for dimensions, aspect ratio, file format policy, file size policy, white background rules, subject placement, and forbidden visible elements.
- Add a research sample pipeline contract that supports compliant platform crawling attempts and manual sample import.
- Add TDD coverage for rules, prompt recipes, provider contracts, quality checks, API behavior, and user workflow.

## Capabilities

### New Capabilities
- `vipshop-image-generation`: Generate Vipshop apparel image assets from product information and reference images.
- `vipshop-image-quality-check`: Validate generated or uploaded images against Vipshop apparel image requirements.
- `image-provider-abstraction`: Route image generation through a provider contract with OpenAI Images as the initial implementation.
- `research-sample-analysis`: Capture and analyze high-performing ecommerce image samples for prompt recipe improvement.

### Modified Capabilities

None.

## Impact

- Adds a Next.js + TypeScript app scaffold, test configuration, and domain modules.
- Adds API routes for generation jobs and quality checks.
- Adds OpenAI SDK dependency and image-processing dependencies.
- Adds local-first repository abstractions for jobs, assets, prompt recipes, quality reports, and research samples.
