# E11: Run Comparison & Experiment Module

Status: TODO

Goal: support contract-backed run comparison first, then optional A/B experiment orchestration. This epic exists because the mentor prototype shows A/B-style UI, but the current backend only supports independent runs and reports.

## Current Backend Facts

- `RunRequest` accepts one `targetId`; it does not accept variants.
- `RunController` supports trigger/status/history only.
- `ResultController` supports `GET /api/v1/runs/{runId}/report` and `GET /api/v1/runs/{runId}/results`.
- There is no implemented `GET /api/v1/runs/compare`.
- There are no experiment, variant, prompt/config version, or promotion entities.

## Definitions

- `Run Compare`: read-only comparison of two completed runs.
- `Experiment`: planned execution that owns variants and the runs produced for those variants.
- `Variant`: an auditable target/config/rubric/prompt/model snapshot used in one branch.
- `Promotion`: optional product decision to mark a variant as the preferred configuration.

## E11.1: Run Compare API

Scope: M

Checklist:

| # | Task | Status |
|---|---|---|
| 1 | Define `RunComparisonResponse` with base run, candidate run, summary, and testcase diffs | TODO |
| 2 | Add `RunComparisonService` interface with Javadoc for params/return behavior | TODO |
| 3 | Implement `RunComparisonServiceImpl` using existing run/report/result repositories | TODO |
| 4 | Validate both runs exist, are terminal, and are comparable by dataset/scope when fields are available | TODO |
| 5 | Add `GET /api/v1/runs/compare?baseRunId=&candidateRunId=` | TODO |
| 6 | Add service and controller tests for regressions, fixes, unchanged, missing run, non-terminal run, and incompatible runs | TODO |

Response requirements:

- `baseRun`, `candidateRun`: public ID, target summary, dataset summary, status, created/completed timestamps.
- `summary`: total comparable cases, regressions, fixes, unchanged, new/missing cases, pass-rate delta, latency delta when available.
- `diffs`: testcase public ID/external ID, input preview, status shift, latency shift, assertion diffs, tool expectation diffs.
- Do not expose internal numeric IDs.

## E11.2: Comparison Persistence Decision

Scope: S

Checklist:

| # | Task | Status |
|---|---|---|
| 1 | Decide whether comparisons are computed on demand or persisted as saved comparison reports | TODO |
| 2 | If persisted, add Flyway migration for comparison report metadata and cached diff payload references | TODO |
| 3 | If on-demand, document performance limits and pagination strategy for large runs | TODO |

Guidance:

- Start on-demand unless large runs make response time unacceptable.
- Persist only if users need saved comparison history, audit trails, or shareable snapshots independent of current result data.

## E11.3: Experiment Domain Model

Scope: L

Checklist:

| # | Task | Status |
|---|---|---|
| 1 | Add Flyway migration for `experiments` and `experiment_variants` | TODO |
| 2 | Store public UUIDs, project, dataset, run scope, status, created by, started/completed timestamps | TODO |
| 3 | Store variant name/key, target ID, optional rubric/config references, runtime options, and produced run ID | TODO |
| 4 | Define statuses: `DRAFT`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED` | TODO |
| 5 | Add repositories, entities, DTOs, mappers | TODO |

Rules:

- Variants must be auditable. Do not store only a display label.
- If prompt/config versioning does not exist yet, variants may reference targets/rubrics/runtime options only.
- Promotion state is out of scope until there is a real versioned config to promote.

## E11.4: Experiment Service & Run Orchestration

Scope: L

Checklist:

| # | Task | Status |
|---|---|---|
| 1 | Add `ExperimentService` interface with Javadoc for create/start/get/list behavior | TODO |
| 2 | Implement create/update draft experiment | TODO |
| 3 | Implement start experiment by triggering one run per variant through existing run service/work queue | TODO |
| 4 | Aggregate variant run statuses into experiment status | TODO |
| 5 | Prevent starting experiments with fewer than two variants or invalid dataset/scope | TODO |
| 6 | Add cancellation only if existing runner cancellation exists; otherwise document as unsupported | TODO |

Acceptance:

- Experiment start is idempotent or protected against duplicate starts.
- Failed variant run does not hide other variant results.
- Produced runs remain accessible through normal run/report APIs.

## E11.5: Experiment APIs

Scope: M

Checklist:

| # | Endpoint | Status |
|---|---|---|
| 1 | `POST /api/v1/projects/{projectId}/experiments` create draft | TODO |
| 2 | `GET /api/v1/projects/{projectId}/experiments` list | TODO |
| 3 | `GET /api/v1/experiments/{experimentId}` detail | TODO |
| 4 | `POST /api/v1/experiments/{experimentId}/start` start | TODO |
| 5 | `GET /api/v1/experiments/{experimentId}/comparison` aggregate variant comparison | TODO |

Response requirements:

- Include variant runs and links by public UUID.
- Include comparison summary only after enough variant runs complete.
- Return validation errors for incompatible variants/scopes.

## E11.6: Optional Prompt/Config Versioning

Scope: L

Checklist:

| # | Task | Status |
|---|---|---|
| 1 | Decide which resources need versioning: target config, response mapping, rubric, prompt template, model/runtime options | TODO |
| 2 | Add version snapshot entities only for approved resources | TODO |
| 3 | Record version references on runs and experiment variants | TODO |
| 4 | Add promotion endpoint only after a versioned resource can actually be promoted | TODO |

Guidance:

- This is the difference between "Compare two runs" and a real A/B workflow users can trust.
- Avoid adding a `versionName` string without immutable snapshot data.

## E11.7: Tests

Required tests:

- Compare two completed compatible runs.
- Reject compare for missing, non-terminal, or incompatible runs.
- Create experiment with two variants.
- Reject experiment with one variant.
- Start experiment and verify produced run links.
- Aggregate completed variant results.
- Ensure public IDs only in API responses.

## Suggested Commit Slices

1. `feat(result): add run comparison api`
2. `feat(experiment): add experiment domain model`
3. `feat(experiment): orchestrate variant runs`
4. `feat(experiment): expose experiment comparison api`
5. `test(experiment): cover comparison workflows`
