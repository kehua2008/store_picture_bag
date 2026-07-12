# raw-style-candidate-pool Specification

## Requirements

### Requirement: Candidate Batch Collection

The system SHALL allow administrators to create raw style candidate batches from existing style samples.

#### Scenario: Candidate batch does not publish styles

- GIVEN approved style samples exist
- WHEN an administrator creates a candidate batch
- THEN the batch stores sample IDs and status
- AND no homepage style board is created automatically

### Requirement: Candidate Batch Status

Candidate batches SHALL support `collecting`, `exported`, `analyzed`, `imported`, and `archived`.
