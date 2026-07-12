## Overview

Build a small Next.js full-stack app that lets a merchant upload a reference product image, enter minimal apparel product attributes, and request Vipshop-ready image assets. The application keeps prompt engineering internal, calls an image provider through a stable interface, and blocks non-compliant outputs through deterministic quality checks before results are shown as usable.

## Architecture

- UI: a single workbench with product inputs, reference image upload, generation controls, job status, result groups, and quality reports.
- Domain: framework-independent TypeScript modules for Vipshop rules, prompt recipes, provider contracts, generation jobs, quality checks, and research samples.
- API: Next.js route handlers expose generation job creation/status and quality-check endpoints.
- Provider: `OpenAIImageProvider` implements the provider contract; other providers can be added without changing domain rules or UI.
- Storage: start with in-memory repositories for MVP/tests; keep repository interfaces so SQLite/Postgres/object storage can replace them later.
- Research: platform crawling and manual uploads normalize into the same research sample model and analysis tags.

## Core Domain Decisions

- Categories are limited to `top`, `bottom`, and `shoes`.
- Asset types are `main_scene`, `main_side_back`, `detail`, `white_bg`, and `sku_color`.
- Clothing main scene/side/detail outputs use 3:4 target `1340x1785`.
- White-background and SKU color outputs use square target `1200x1200` unless a narrower SKU export size is required later.
- Generated outputs must be converted/exported as JPG, RGB, 72dpi where possible, and compressed under the Vipshop file-size policy.
- Prompt recipes are versioned because prompt changes affect measurable acceptance rate.
- A generation job stores product input, recipe version, provider model, generated asset metadata, and quality reports.

## Provider Strategy

The default provider is OpenAI Images. The application must not expose API keys to the browser. Provider configuration is server-only and read from environment variables.

The provider contract returns normalized generated image objects and normalized provider errors. OpenAI-specific request parameters, response shapes, retries, rate-limit mapping, and cost metadata remain inside `OpenAIImageProvider`.

## Quality Strategy

Quality checks are layered:

- Metadata checks: dimensions, aspect ratio, MIME/format intent, file size, and required asset type.
- Pixel checks: white background purity and approximate subject bounding box/occupancy for white-background assets.
- Heuristic visual checks: potential text/watermark/QR/logo risk placeholders for later model-based detection.
- Policy output: each check returns pass/fail, severity, code, message, and measured values.

The MVP may use deterministic placeholder heuristics for text/watermark risk, but the interfaces must allow a later vision-model detector.

## Research Strategy

The first implementation supports a `ResearchSource` interface and sample import model. A Vipshop crawler can be implemented as a best-effort source with rate limiting and no anti-bot bypass. If platform access is unavailable, manually imported samples use the same sample analysis workflow.

## Risks

- OpenAI Images may not produce exact Vipshop dimensions directly for every custom target. The app must support post-processing/cropping/export to final Vipshop dimensions.
- Automated quality checks cannot fully judge commercial attractiveness. The 80% acceptance target requires an evaluation set and human labeling.
- Platform crawling may be restricted by login, policy, robots, or rate limits. The implementation must treat manual samples as a first-class fallback.
