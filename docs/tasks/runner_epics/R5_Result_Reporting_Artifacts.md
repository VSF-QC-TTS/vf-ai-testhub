# R5: Result Reporting & Artifacts

Dependencies: R2, R4.

Turn execution output into backend result callback payloads and artifacts.

## R5.1: Result Normalizer

| # | Checklist | Status |
|---|---|---|
| 1 | Convert promptfoo/domain results into `TestResultIngestionItem` | TODO |
| 2 | Convert assertion checks into `AssertionResultIngestionItem` | TODO |
| 3 | Convert tool checks into `ToolExpectationResultIngestionItem` | TODO |
| 4 | Compute `PASSED`, `FAILED`, `ERROR`, `SKIPPED`, and `UNCERTAIN` consistently | TODO |
| 5 | Unit test status aggregation and nested result mapping | TODO |

- Commit: `feat(runner): normalize evaluation results`
- Scope: `L`
- Review: `TODO`

## R5.2: Batched Result Reporter

| # | Checklist | Status |
|---|---|---|
| 1 | Buffer results and flush by size or interval | TODO |
| 2 | Send final batch with `finalBatch=true` | TODO |
| 3 | Retry transient backend failures with bounded backoff | TODO |
| 4 | Avoid duplicate submission where possible after worker restart | TODO |
| 5 | Unit test flush size, interval, final batch, and retry behavior | TODO |

- Commit: `feat(runner): report results in batches`
- Scope: `M`
- Review: `TODO`

## R5.3: Artifact Writer

| # | Checklist | Status |
|---|---|---|
| 1 | Write sanitized promptfoo config/summary artifacts locally for MVP | TODO |
| 2 | Redact secrets, auth headers, and sensitive response fields | TODO |
| 3 | Return artifact path/reference in runner logs and future backend payload support | TODO |
| 4 | Unit test redaction rules | TODO |

- Commit: `feat(runner): write sanitized run artifacts`
- Scope: `M`
- Review: `TODO`
