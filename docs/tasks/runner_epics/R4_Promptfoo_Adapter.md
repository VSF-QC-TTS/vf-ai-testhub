# R4: Promptfoo Adapter

Dependencies: R1, R3.

Use promptfoo as the evaluation engine without making promptfoo YAML the source of truth.

## R4.1: Config Builder

| # | Checklist | Status |
|---|---|---|
| 1 | Convert `RunSnapshot` to in-memory promptfoo test suite object | TODO |
| 2 | Create custom provider function that uses runner target executor | TODO |
| 3 | Map test cases to promptfoo tests/vars | TODO |
| 4 | Map assertion and tool expectation definitions to promptfoo-compatible assertions where possible | TODO |
| 5 | Unit test generated config object from snapshot fixture | TODO |

- Commit: `feat(runner): build promptfoo config from snapshot`
- Scope: `L`
- Review: `TODO`

## R4.2: Promptfoo Runner Wrapper

| # | Checklist | Status |
|---|---|---|
| 1 | Call promptfoo Node API with max concurrency from run options | TODO |
| 2 | Provide CLI fallback only if Node API blocks MVP | TODO |
| 3 | Convert promptfoo execution errors into runner domain errors | TODO |
| 4 | Preserve promptfoo summary for artifact writing | TODO |
| 5 | Unit test wrapper with mocked promptfoo evaluate function | TODO |

- Commit: `feat(runner): run evaluations through promptfoo`
- Scope: `M`
- Review: `TODO`

## R4.3: Domain Evaluator Gaps

| # | Checklist | Status |
|---|---|---|
| 1 | Identify assertion/tool expectation types not directly supported by promptfoo | TODO |
| 2 | Add custom evaluator adapters only for unsupported domain behavior | TODO |
| 3 | Keep mapping deterministic and covered by tests | TODO |
| 4 | Document known unsupported types, if any | TODO |

- Commit: `feat(runner): add domain evaluator adapters`
- Scope: `M`
- Review: `TODO`
