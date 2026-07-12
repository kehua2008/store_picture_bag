## ADDED Requirements

### Requirement: Provider-independent generation contract
The system SHALL call image generation through a provider interface that hides provider-specific request and response formats from application code.

#### Scenario: Provider returns generated images
- **GIVEN** a valid normalized generation request
- **WHEN** the provider completes successfully
- **THEN** the provider SHALL return normalized generated image metadata and binary/base64 image content

### Requirement: OpenAI Images default provider
The system SHALL provide an OpenAI Images provider implementation configured only on the server.

#### Scenario: Missing API key
- **GIVEN** the OpenAI provider is selected and no server API key is configured
- **WHEN** a generation request is attempted
- **THEN** the provider SHALL return a normalized configuration error

### Requirement: Provider error normalization
The system SHALL normalize provider errors into stable application error codes.

#### Scenario: Provider rate limit
- **GIVEN** the provider reports a rate limit error
- **WHEN** the application handles the error
- **THEN** the error SHALL be represented as `provider_rate_limited`
