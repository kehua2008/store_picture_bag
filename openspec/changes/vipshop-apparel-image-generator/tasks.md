## 1. OpenSpec and Project Scaffold

- [x] 1.1 Create OpenSpec proposal, design, specs, and tasks for the Vipshop apparel generator.
- [x] 1.2 Scaffold a Next.js + TypeScript project with test tooling.
- [x] 1.3 Add environment examples and server-only OpenAI configuration boundaries.

## 2. Domain TDD

- [x] 2.1 Write failing tests for Vipshop apparel image spec resolution.
- [x] 2.2 Implement the Vipshop rules engine for `top`, `bottom`, and `shoes`.
- [x] 2.3 Write failing tests for prompt recipe generation.
- [x] 2.4 Implement prompt recipe generation with versioned hidden prompts.
- [x] 2.5 Write failing tests for image quality report gating.
- [x] 2.6 Implement deterministic metadata and white-background quality checks.

## 3. Provider and Jobs

- [x] 3.1 Write provider contract tests for success, missing config, and rate-limit normalization.
- [x] 3.2 Implement `ImageProvider` and `OpenAIImageProvider`.
- [x] 3.3 Write generation job service tests for queued/succeeded/failed flows.
- [x] 3.4 Implement in-memory generation job service and repositories.

## 4. API and UI

- [x] 4.1 Write API route tests for creating generation jobs and quality checks.
- [x] 4.2 Implement Next.js route handlers for generation jobs, status, and quality checks.
- [x] 4.3 Build the MVP workbench UI for product input, reference upload, job creation, and result display.
- [x] 4.4 Add Playwright smoke coverage for the workbench happy path.

## 5. Research and Evaluation

- [x] 5.1 Implement research sample models and manual import contract.
- [x] 5.2 Add a compliant crawler source interface and stub Vipshop source implementation.
- [x] 5.3 Add evaluation dataset schema for the 80% usability target.
- [x] 5.4 Document the manual acceptance rubric and sample labeling flow.
