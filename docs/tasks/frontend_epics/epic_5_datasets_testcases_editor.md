# Epic 5: Datasets & TestCases Editor

Goal: build the main authoring workflow for datasets, test cases, imports, assertions, and tool expectations.

## Read First

Backend:

- `apps/api/src/main/java/vn/vinfast/aitesthub/dataset/controller/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/dataset/request/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/dataset/response/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/testcase/controller/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/testcase/request/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/testcase/response/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/assertion/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/toolexpectation/`

## Task 5.1: Dataset API and List

Steps:

1. Implement dataset types and API functions.
2. Build `/projects/:projectId/datasets`.
3. Render dataset table with name, category, tags, creator, updated date, archived state if visible.
4. Add create/edit/archive flows.
5. Store page/search/filter in URL.

Acceptance:

- Empty state points to create dataset.
- Archive is confirmed.
- Dataset route uses public UUID.

## Task 5.2: TestCase API and Table

Steps:

1. Implement testcase API functions from backend DTOs.
2. Build `/datasets/:datasetId/test-cases`.
3. Render compact table with external ID, section, input preview, expected behavior, tags, priority, enabled.
4. Add filters: section, tag, enabled, priority, search.
5. Support row selection for batch actions if backend supports them; otherwise do not invent batch endpoints.

Acceptance:

- Long input text truncates with detail panel access.
- Table header is sticky.
- Mobile can scroll horizontally.

## Task 5.3: TestCase Editor

Steps:

1. Build create/edit side panel or dialog.
2. Fields: external ID, section, name, input, expected behavior, reference answer, variables JSON, preconditions, tags, priority, enabled.
3. Validate required fields and JSON variables.
4. Submit through mutation.
5. Keep unsaved-change guard for long edits.

Acceptance:

- Editor can create and update without leaving table context.
- JSON variables have format/validate button.
- Errors are localized.

## Task 5.4: CSV/Excel Import

Backend endpoints:

- Preview endpoint.
- Confirm endpoint.

Steps:

1. Read exact import controller paths.
2. Build upload UI accepting CSV/XLS/XLSX only if backend supports each.
3. Show preview table.
4. Highlight invalid rows.
5. Let user confirm import.
6. Show final imported count and skipped/error count.

Acceptance:

- Upload errors do not crash route.
- Confirm button disabled until preview is valid enough to submit.
- Large previews remain scrollable.

## Task 5.5: Assertion Builder

Steps:

1. Read backend assertion enum values.
2. Build assertion list per testcase.
3. Build dynamic form based on assertion `scope` and `type`.
4. Support field path, field paths, expected value, threshold, weight, severity, rubric reference/override.
5. Add inline examples for JSON paths.

Acceptance:

- Changing assertion type updates fields without losing unrelated data unexpectedly.
- Transport values stay backend enum strings.
- `llm_rubric` clearly requires runner/AI judge support.

## Task 5.6: Tool Expectation Builder

Steps:

1. Read backend tool expectation enum values and DTOs.
2. Build list per testcase.
3. Build dynamic form for tool call, count, sequence, args, output-used, and agent expectations.
4. Support sequence editor.
5. Support argument assertions editor if backend expects list/map structure.

Acceptance:

- UI labels are translated.
- Current runner limitations are visible where semantics may return `UNCERTAIN`.
- No unsupported backend fields are invented.

## Task 5.7: Tests

Cases:

1. Dataset list states.
2. Testcase editor validation.
3. Variables JSON rejects invalid JSON.
4. Import preview renders invalid rows.
5. Assertion builder changes fields by type.
6. Tool expectation sequence editor preserves order.

## Suggested Commit Slices

1. `feat(frontend): add dataset management`
2. `feat(frontend): add testcase table editor`
3. `feat(frontend): add testcase import flow`
4. `feat(frontend): add assertion builder`
5. `feat(frontend): add tool expectation builder`
6. `test(frontend): cover testcase authoring`
