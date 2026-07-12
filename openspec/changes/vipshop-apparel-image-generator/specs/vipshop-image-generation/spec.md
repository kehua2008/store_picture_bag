## ADDED Requirements

### Requirement: Product-driven apparel generation
The system SHALL create Vipshop apparel image generation jobs from product attributes and at least one merchant-provided reference image.

#### Scenario: Create generation job
- **GIVEN** a user provides category, product attributes, requested asset types, and a reference image
- **WHEN** the user submits a generation request
- **THEN** the system SHALL create a generation job with status `queued`
- **AND** the job SHALL preserve the selected category and requested asset types

### Requirement: Hidden prompt recipe generation
The system SHALL generate model prompts from product input, Vipshop rules, and prompt recipe templates without exposing the full prompt to the end user.

#### Scenario: Build prompt for white background image
- **GIVEN** a `white_bg` request for a supported apparel category
- **WHEN** the prompt recipe is built
- **THEN** the prompt SHALL include pure white background constraints, full product visibility, centered composition, and no text/watermark/logo/QR/price constraints

### Requirement: Vipshop asset specifications
The system SHALL resolve target image specifications by category and asset type.

#### Scenario: Resolve clothing main image spec
- **GIVEN** category `top` or `bottom`
- **WHEN** the asset type is `main_scene`
- **THEN** the resolved target SHALL be 1340 pixels wide and 1785 pixels high

#### Scenario: Resolve SKU color image spec
- **GIVEN** any supported category
- **WHEN** the asset type is `sku_color`
- **THEN** the resolved target SHALL be square and at least 1200 by 1200 pixels
