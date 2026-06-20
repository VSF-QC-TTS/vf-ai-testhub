# E8: Result & ManualReview Module

Dependencies: E7, E4.

Results are system-generated after a run. Manual reviews are QC decisions layered on top of automated results.

## E8.1: Result Entities

| # | Checklist | Status |
|---|---|---|
| 1 | Add `TestResult` entity linked to `Run` and `TestCase` | TODO |
| 2 | Add `AssertionResult` entity linked to `TestResult` and `Assertion` | TODO |
| 3 | Add `ToolExpectationResult` linked to `TestResult` and `ToolExpectation` | TODO |
| 4 | Add DTOs and mappers | TODO |
| 5 | Add Flyway migration for result tables | TODO |

- Commit: `feat(result): add result entities, dto, mapper and migrations`
- Scope: `L`
- Review: `TODO`

## E8.2: Result Ingestion API

| # | Checklist | Status |
|---|---|---|
| 1 | Add internal endpoint `POST /internal/runs/{runId}/results` or versioned equivalent | TODO |
| 2 | Authenticate runner-to-backend calls with service credentials, not user JWT | TODO |
| 3 | Accept batched result payloads and persist in chunks | TODO |
| 4 | Mark run `COMPLETED` when final batch is received | TODO |
| 5 | Unit test batch save and completion update behavior | TODO |

- Commit: `feat(result): add result ingestion api for runner callback`
- Scope: `L`
- Review: `TODO`

## E8.3: ManualReview Entity + Service

| # | Checklist | Status |
|---|---|---|
| 1 | Add `ManualReview` entity linked to `TestResult` | TODO |
| 2 | Support status override, notes, reviewer, and timestamps | TODO |
| 3 | Add `ManualReviewService` | TODO |
| 4 | Add Flyway migration | TODO |
| 5 | Unit test override behavior | TODO |

- Commit: `feat(result): add manual review entity and service`
- Scope: `M`
- Review: `TODO`

## E8.4: Report Aggregation Service

| # | Checklist | Status |
|---|---|---|
| 1 | Add `ReportService` for totals, passed, failed, uncertain, and pass rate | TODO |
| 2 | Return test results with assertion/tool expectation breakdown | TODO |
| 3 | Include manual review override state when present | TODO |
| 4 | Unit test pass-rate and override calculations | TODO |

- Commit: `feat(result): add report aggregation service`
- Scope: `M`
- Review: `TODO`

## E8.5: Controllers + Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Add `ResultController` for run reports and result listing | TODO |
| 2 | Add compare endpoint if product scope still needs it | TODO |
| 3 | Add `ManualReviewController` for result review submission | TODO |
| 4 | MockMvc test report shape and manual review submission | TODO |

- Commit: `feat(result): add controllers and integration tests`
- Review: `TODO`
