# E9: AI Integration Module

Dependencies: E4, E5.

This module calls external LLM APIs. Tests must mock external calls.

## E9.1: AI TestCase Generation

| # | Checklist | Status |
|---|---|---|
| 1 | Add `AIGeneratorService` interface | TODO |
| 2 | Accept requirement text and optional project/dataset context | TODO |
| 3 | Generate `TestCaseDraft` objects, not persisted entities | TODO |
| 4 | Add prompt template builder with explicit output schema | TODO |
| 5 | Retry malformed model responses with a small bounded retry count | TODO |

- Commit: `feat(ai): add ai testcase generator service`
- Scope: `M`
- Review: `TODO`

## E9.2: AI Assertion Suggestions

| # | Checklist | Status |
|---|---|---|
| 1 | Add method for suggesting assertions from testcase and response mapping context | TODO |
| 2 | Return `AssertionDraft` objects for QC review before persistence | TODO |
| 3 | Include tool expectation suggestions only when trace/tool fields are available | TODO |
| 4 | Validate model output before returning it to controllers | TODO |

- Commit: `feat(ai): add ai assertion suggestion`
- Scope: `M`
- Review: `TODO`

## E9.3: Tests

| # | Checklist | Status |
|---|---|---|
| 1 | Mock LLM provider with WireMock or an equivalent Spring test double | TODO |
| 2 | Test valid JSON response parsing | TODO |
| 3 | Test malformed response retry and final failure | TODO |
| 4 | Test timeout/error mapping | TODO |

- Commit: `test(ai): add wiremock tests for ai services`
- Review: `TODO`
