# E5: Assertion & ToolExpectation Module

Dependency: E4.

Assertions evaluate chatbot outputs. Tool expectations evaluate tool/agent behavior when the target response exposes that data.

## E5.1: Assertion Entity + DTO + Mapper

| # | Checklist | Status |
|---|---|---|
| 1 | Add `Assertion` entity linked to `TestCase` | TODO |
| 2 | Support scope/type/target component/field path/multi-field configuration | TODO |
| 3 | Support expected value, optional rubric link/override, threshold, weight, severity, enabled, sort order | TODO |
| 4 | Add request/response DTOs and mapper | TODO |
| 5 | Add Flyway migration for `assertions` | TODO |

- Commit: `feat(assertion): add entity, dto, mapper and migration`
- Scope: `M`
- Review: `TODO`

## E5.2: ToolExpectation Entity + DTO + Mapper

| # | Checklist | Status |
|---|---|---|
| 1 | Add `ToolExpectation` entity linked to `TestCase` | TODO |
| 2 | Support expected source/tool/agent, argument assertions, sequence, min/max calls | TODO |
| 3 | Support optional rubric link/override, threshold, required flag, severity, enabled | TODO |
| 4 | Add request/response DTOs and mapper | TODO |
| 5 | Add Flyway migration for `tool_expectations` | TODO |

- Commit: `feat(tool-expectation): add entity, dto, mapper and migration`
- Scope: `M`
- Review: `TODO`

## E5.3: Services

| # | Checklist | Status |
|---|---|---|
| 1 | Add `AssertionService` CRUD scoped by test case | TODO |
| 2 | Add `ToolExpectationService` CRUD scoped by test case | TODO |
| 3 | Validate assertion/tool expectation types against supported enum values | TODO |
| 4 | Unit test both services | TODO |

- Commit: `feat(assertion): add assertion and tool expectation services`
- Review: `TODO`

## E5.4: Controllers + Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Add `AssertionController` at `/api/v1/test-cases/{testCaseId}/assertions` | TODO |
| 2 | Add `ToolExpectationController` at `/api/v1/test-cases/{testCaseId}/tool-expectations` | TODO |
| 3 | Add MockMvc CRUD tests for both controllers | TODO |
| 4 | Add validation tests for unsupported assertion/tool expectation types | TODO |

- Commit: `feat(assertion): add controllers and integration tests`
- Review: `TODO`
