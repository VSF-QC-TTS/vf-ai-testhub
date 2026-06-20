# E6: Rubric Module

Dependency: E1.

Rubrics provide reusable LLM judge criteria at global, project, dataset, or testcase scope.

## E6.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|---|---|
| 1 | Add `Rubric` entity linked to `Project` where applicable | TODO |
| 2 | Support rubric name, scope, content, version/status, and metadata | TODO |
| 3 | Add request/response DTOs and mapper | TODO |
| 4 | Add Flyway migration for `rubrics` | TODO |

- Commit: `feat(rubric): add entity, dto, mapper and migration`
- Scope: `M`
- Review: `TODO`

## E6.2: Service + Controller

| # | Checklist | Status |
|---|---|---|
| 1 | Add `RubricRepository` | TODO |
| 2 | Add `RubricService` interface and implementation | TODO |
| 3 | Support CRUD plus publish/archive behavior if versioning is implemented | TODO |
| 4 | Add `RubricController` under `/api/v1/projects/{projectId}/rubrics` | TODO |

- Commit: `feat(rubric): add service and controller`
- Scope: `M`
- Review: `TODO`

## E6.3: Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Unit test `RubricServiceImpl` | TODO |
| 2 | MockMvc test rubric CRUD endpoints | TODO |
| 3 | Test invalid publish/archive transitions if supported | TODO |

- Commit: `test(rubric): add unit and integration tests`
- Review: `TODO`
