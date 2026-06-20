# E3: Dataset Module

Dependency: E1.

Datasets group test cases inside a project. This is the next unimplemented business slice after Project and Target.

## E3.1: Entity + DTO + Mapper

| # | Checklist | Status |
|---|---|---|
| 1 | Add `Dataset` entity linked to `Project` and creator `User` | TODO |
| 2 | Include name, description, category/tags/metadata fields needed by the roadmap | TODO |
| 3 | Add request/response DTOs using records and OpenAPI schema annotations | TODO |
| 4 | Add `DatasetMapper` | TODO |
| 5 | Add Flyway migration for `datasets` after `V3` | TODO |

- Commit: `feat(dataset): add entity, dto, mapper and migration`
- Scope: `M`
- Review: `TODO`

## E3.2: Service + Controller

| # | Checklist | Status |
|---|---|---|
| 1 | Add `DatasetRepository` | TODO |
| 2 | Add `DatasetService` interface and implementation | TODO |
| 3 | Support create, find by `publicId`, paginated list by project, update, archive/disable | TODO |
| 4 | Add `DatasetController` at `/api/v1/projects/{projectId}/datasets` plus direct dataset endpoints where needed | TODO |
| 5 | Keep AI generation as a later E9 integration, not hardwired service logic | TODO |

- Commit: `feat(dataset): add service and controller`
- Scope: `M`
- Review: `TODO`

## E3.3: Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Unit test `DatasetServiceImpl` | TODO |
| 2 | MockMvc test dataset CRUD endpoints | TODO |
| 3 | MockMvc test creating a dataset for a missing project returns 404 | TODO |
| 4 | Verify APIs expose `publicId`, never internal DB `id` | TODO |

- Commit: `test(dataset): add unit and integration tests`
- Review: `TODO`
