# codex-style-analysis-skill Specification

## Requirements

### Requirement: Offline Skill Analysis

The local Codex Skill SHALL analyze exported style candidate packages and produce `style-analysis-result.json`.

#### Scenario: Produce importable result

- GIVEN a package with `manifest.json` and images
- WHEN the Skill analyzes it
- THEN the result contains at least one style group
- AND every style group contains `styleName`, `sampleIds`, and `promptCore`
- AND every `sampleId` exists in the manifest

### Requirement: Candidate Labels Are Non-Final

The Skill SHALL use image evidence and manifest metadata to infer final style groups without treating existing rough labels as authoritative.
