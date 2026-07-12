# style-board-import-and-publishing Specification

## Requirements

### Requirement: Import Analysis Result

The system SHALL import valid `style-analysis-result.json` and create style boards with status `ready_to_publish`.

#### Scenario: Import result

- GIVEN a valid result with sample IDs that exist online
- WHEN the administrator imports the JSON
- THEN the system creates style boards
- AND reconnects them to online samples by `sampleIds`
- AND does not automatically show them on the homepage

### Requirement: Homepage Publication

The homepage SHALL show only style boards where `status=published` and `showOnHome=true`.

#### Scenario: Hide unpublished boards

- GIVEN a board with status `ready_to_publish`
- WHEN the user opens the homepage
- THEN the board is not available in classic style selection

#### Scenario: Show published board

- GIVEN a board with status `published` and `showOnHome=true`
- WHEN the user opens the homepage
- THEN the board is available in classic style selection ordered by `displayOrder`
