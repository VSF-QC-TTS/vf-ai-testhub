# E7: Run Module

Dependencies: E2, E4, E5, E6, E0.4.

This is the highest-risk backend epic. Keep it small and preserve async execution through Redis Streams.

## E7.1: Run Entity + DTO

| # | Checklist | Status |
|---|---|---|
| 1 | Add `Run` entity linked to project, dataset, target, trigger user, and optional previous run | TODO |
| 2 | Add status, timestamps, counters, and failure reason fields | TODO |
| 3 | Add `RunRequest`, `RunResponse`, and `RunSnapshotDto` | TODO |
| 4 | Add Flyway migration for `runs` | TODO |

- Commit: `feat(run): add run entity, dto and migration`
- Scope: `M`
- Review: `TODO`

## E7.2: RunSnapshot Assembly

| # | Checklist | Status |
|---|---|---|
| 1 | Fetch target, test cases, assertions, tool expectations, and rubrics with bounded query count | TODO |
| 2 | Group assertions and tool expectations by test case in memory | TODO |
| 3 | Serialize an immutable `RunSnapshotDto` for the runner | TODO |
| 4 | Unit test snapshot shape and grouping behavior by state/output | TODO |
| 5 | Unit test empty dataset behavior | TODO |

- Commit: `feat(run): implement run snapshot assembly with batch fetching`
- Scope: `L`
- Review: `TODO`

## E7.3: Redis Streams Publisher

| # | Checklist | Status |
|---|---|---|
| 1 | Add `RunStreamPublisher` over the existing Redis stream infrastructure | TODO |
| 2 | Publish serialized snapshot/reference to stream key `run:jobs` | TODO |
| 3 | Include run ID and correlation metadata for observability | TODO |
| 4 | Add integration or focused component test for stream publish | TODO |

- Commit: `feat(run): add redis streams publisher`
- Scope: `M`
- Review: `TODO`

## E7.4: RunService Facade

| # | Checklist | Status |
|---|---|---|
| 1 | Add `RunService.triggerRun(datasetId, targetId)` | TODO |
| 2 | Create run with `PENDING`, assemble snapshot, publish job, then mark `RUNNING` | TODO |
| 3 | Reject missing target/dataset and invalid empty-dataset runs with business errors | TODO |
| 4 | Unit test status changes and publish outcome by state/output | TODO |

- Commit: `feat(run): add run service facade`
- Scope: `L`
- Review: `TODO`

## E7.5: Controller + Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Add `RunController` at `/api/v1/datasets/{datasetId}/runs` | TODO |
| 2 | Add trigger endpoint returning `202 Accepted` | TODO |
| 3 | Add get status endpoint by run `publicId` | TODO |
| 4 | Add paginated run history endpoint | TODO |
| 5 | MockMvc test trigger and status retrieval | TODO |

- Commit: `feat(run): add controller and integration tests`
- Scope: `M`
- Review: `TODO`

## Checkpoint: Core Evaluation Flow

| # | Check | Status |
|---|---|---|
| 1 | Project -> Target -> Dataset -> TestCase -> Assertion -> Trigger Run flow works | TODO |
| 2 | Redis Stream receives a job with the expected run reference or snapshot | TODO |
| 3 | Large snapshot payload risk is explicitly handled before production use | TODO |
