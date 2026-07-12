## ADDED Requirements

### Requirement: Research sample ingestion
The system SHALL support research samples from both platform crawling attempts and manual imports.

#### Scenario: Manual sample import
- **GIVEN** a user imports a sample image with category and source metadata
- **WHEN** the sample is accepted
- **THEN** it SHALL be stored in the same sample model used by crawled samples

### Requirement: Analysis tag storage
The system SHALL store structured analysis tags for research samples.

#### Scenario: Store composition tags
- **GIVEN** a research sample has been analyzed
- **WHEN** analysis tags are saved
- **THEN** the system SHALL preserve composition, background, lighting, model pose, subject occupancy, detail focus, and forbidden-element observations

### Requirement: Crawling compliance boundary
The system SHALL treat platform crawling as best-effort and SHALL NOT require anti-bot bypass behavior for the generation workflow.

#### Scenario: Crawling unavailable
- **GIVEN** platform crawling is blocked or unavailable
- **WHEN** research samples are needed
- **THEN** manual sample import SHALL remain a supported fallback
