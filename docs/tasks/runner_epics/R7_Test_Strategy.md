# R7: Test Strategy & Smoke Flows

Dependencies: R0-R6 as applicable.

This epic keeps runner correctness practical and focused on adapter behavior.

## R7.1: Unit Test Coverage

| # | Checklist | Status |
|---|---|---|
| 1 | Test config loading and validation | TODO |
| 2 | Test snapshot/result contract validation | TODO |
| 3 | Test promptfoo config builder mappings | TODO |
| 4 | Test response normalization and result aggregation | TODO |
| 5 | Test security guards and redaction | TODO |

- Commit: `test(runner): add unit coverage for adapter logic`
- Scope: `M`
- Review: `TODO`

## R7.2: Integration Smoke

| # | Checklist | Status |
|---|---|---|
| 1 | Add Redis-backed smoke test for consuming one run job | TODO |
| 2 | Mock backend internal API and assert result callback body | TODO |
| 3 | Mock target chatbot API and validate request templating | TODO |
| 4 | Mock promptfoo evaluate for deterministic result mapping | TODO |
| 5 | Document local smoke command | TODO |

- Commit: `test(runner): add redis to backend smoke flow`
- Scope: `L`
- Review: `TODO`
