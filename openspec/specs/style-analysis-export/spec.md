# style-analysis-export Specification

## Requirements

### Requirement: Export Analysis Package

The system SHALL export a zip package containing image files and `manifest.json`.

#### Scenario: Export candidate batch

- GIVEN a candidate batch with sample IDs
- WHEN the administrator downloads the analysis package
- THEN the zip contains `manifest.json`
- AND every exported sample has an image under `images/`
- AND the manifest includes batch ID, sample IDs, file mappings, source information, rough labels, notes, and export time

### Requirement: Manifest Is Sync Metadata

The system SHALL treat `manifest.json` as generated sync metadata, not as a persistent online source file.
