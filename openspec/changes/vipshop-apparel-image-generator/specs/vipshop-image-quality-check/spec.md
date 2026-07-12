## ADDED Requirements

### Requirement: Deterministic image metadata checks
The system SHALL validate generated and uploaded images against the resolved Vipshop image specification before marking them usable.

#### Scenario: Reject wrong dimensions
- **GIVEN** an image with dimensions that do not match the resolved target dimensions
- **WHEN** quality checks run
- **THEN** the report SHALL include a failing `dimensions` check

### Requirement: White background validation
The system SHALL validate white-background assets for pure white background and centered product occupancy.

#### Scenario: Reject non-white background
- **GIVEN** a `white_bg` asset whose background pixels are not sufficiently close to RGB 255,255,255
- **WHEN** quality checks run
- **THEN** the report SHALL include a failing `white_background` check

### Requirement: Usability gate
The system SHALL mark an asset usable only when all blocking checks pass.

#### Scenario: Blocking check fails
- **GIVEN** a generated asset with any blocking quality failure
- **WHEN** the quality report is calculated
- **THEN** the asset SHALL NOT be marked usable
