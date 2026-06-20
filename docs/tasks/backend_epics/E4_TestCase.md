# E4: TestCase Module

Dependency: E3.

Test cases are QC-authored inputs and expected behavior. Results produced after execution belong to E8, not this module.

## E4.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|---|---|
| 1 | Add `TestCase` entity linked to `Dataset` | TODO |
| 2 | Include legacy import fields: `externalId`, `sectionName`, `input`, `expectedBehavior` | TODO |
| 3 | Include roadmap fields: reference answer, variables/context, tags, priority, enabled, source, sort order | TODO |
| 4 | Add request/response DTOs and mapper | TODO |
| 5 | Add Flyway migration for `test_cases` with JSONB where appropriate | TODO |

- Commit: `feat(testcase): add entity, dto, mapper and migration`
- Scope: `M`
- Review: `TODO`

## E4.2: CRUD + Filtering Service

| # | Checklist | Status |
|---|---|---|
| 1 | Add `TestCaseRepository` with filtering support | TODO |
| 2 | Add `TestCaseService` interface and implementation | TODO |
| 3 | Support CRUD scoped by dataset | TODO |
| 4 | Support pagination, keyword search, enabled filter, and tag filter | TODO |
| 5 | Add focused unit tests for CRUD and filtering behavior | TODO |

- Commit: `feat(testcase): add repository, service with filtering and unit tests`
- Scope: `M`
- Review: `TODO`

## E4.3: Import Service

| # | Checklist | Status |
|---|---|---|
| 1 | Add `ImportStrategy` interface | TODO |
| 2 | Implement CSV import for the legacy four testcase definition columns | TODO |
| 3 | Implement Excel import only if product scope confirms it is still needed | TODO |
| 4 | Process rows in chunks and batch-check duplicates by dataset/external ID | TODO |
| 5 | Return import summary: imported, skipped, failed, and row-level errors | TODO |
| 6 | Unit test valid import, duplicates, empty file, and missing required columns | TODO |

- Commit: `feat(testcase): add import service with batch processing`
- Scope: `L`
- Review: `TODO`

## E4.4: Controller + Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Add `TestCaseController` at `/api/v1/datasets/{datasetId}/test-cases` | TODO |
| 2 | Add list endpoint with pagination/filter query params | TODO |
| 3 | Add multipart import endpoint | TODO |
| 4 | MockMvc test list filtering | TODO |
| 5 | MockMvc test CSV import success and validation failure | TODO |

- Commit: `feat(testcase): add controller with filter, import endpoint and tests`
- Scope: `M`
- Review: `TODO`
