# Epic 4: Projects & Targets Management

Goal: build project and target management screens using the real backend contracts.

## Read First

Backend:

- `apps/api/src/main/java/vn/vinfast/aitesthub/project/controller/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/project/request/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/project/response/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/target/controller/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/target/request/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/target/response/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/target/entity/ResponseMapping.java`

Frontend:

- Epic 1 AppShell
- Epic 2 API client/query/i18n
- `docs/architecture/Frontend_Design_System.md` table/form rules

## Task 4.1: Project API Layer

Target files:

- `apps/client/src/features/projects/projects.api.ts`
- `apps/client/src/features/projects/projects.types.ts`
- `apps/client/src/features/projects/projects.schemas.ts`
- `apps/client/src/features/projects/projects.queries.ts`

Steps:

1. Read backend project DTOs.
2. Define request and response types.
3. Implement create, list, get, update, and archive API functions.
4. Add query keys.
5. Add mutations with query invalidation.

Acceptance:

- Project public UUID is used for all routes and mutations.
- Internal numeric IDs are never represented in UI routes.

## Task 4.2: Project List Page

Route:

- `/projects`

Steps:

1. Fetch paginated active projects.
2. Render compact table on desktop.
3. Render responsive cards or scrollable table on mobile.
4. Add search/filter if backend supports it.
5. Add empty state with create CTA.
6. Add archive action with confirmation.
7. Store pagination/search in URL params.

Acceptance:

- Loading, empty, error, and success states exist.
- Row actions are keyboard accessible.
- Pagination survives reload through URL state.

## Task 4.3: Project Form Dialog

Steps:

1. Build create/edit dialog.
2. Use React Hook Form + Zod for dashboard form.
3. Use static labels, not floating labels.
4. Submit through TanStack mutation.
5. Show backend validation errors near fields when possible.
6. Close dialog only after successful mutation.

Acceptance:

- Create and edit share schema where possible.
- Save button has stable loading state.
- Vietnamese labels do not overflow.

## Task 4.4: Target API Layer

Target files:

- `apps/client/src/features/targets/targets.api.ts`
- `apps/client/src/features/targets/targets.types.ts`
- `apps/client/src/features/targets/targets.schemas.ts`
- `apps/client/src/features/targets/targets.queries.ts`

Steps:

1. Read backend target DTOs.
2. Implement parse cURL preview endpoint.
3. Implement create, list by project, get, update, delete.
4. Implement get/save response mapping.
5. Define types for `TargetType`, HTTP method, `authConfig`, `headersTemplate`, `queryParamsTemplate`, `bodyTemplate`, and `responseMapping`.

Acceptance:

- JSON-ish fields are typed as `Record<string, unknown>` at transport boundary.
- UI validates JSON before submit.

## Task 4.5: Target List and Detail

Routes:

- `/projects/:projectId/targets`
- `/targets/:targetId`

Steps:

1. Show targets for selected project.
2. Include target type, method, URL, environment, timeout, default status.
3. Add create/edit/delete actions.
4. Add "Test target configuration" placeholder only if backend supports it; otherwise do not invent an endpoint.
5. Link to response mapping tab.

Acceptance:

- Long URLs truncate with tooltip and copy.
- Delete requires confirmation.

## Task 4.6: Target Form

Sections:

- Basic: name, environment, target type.
- HTTP: method, URL, timeout.
- Templates: query params, headers, body.
- Auth: auth config JSON or guided fields.
- Bindings: input binding and variable bindings.

Steps:

1. Use tabs or accordion for advanced sections.
2. Add JSON editor component for template objects.
3. Provide format/validate button for JSON fields.
4. Support cURL parse preview and allow user to apply parsed values.
5. Validate URL and timeout before submit.

Acceptance:

- Invalid JSON blocks submit and points to the field.
- cURL parser result is previewed before persisting.
- Secrets are visually masked if entered.

## Task 4.7: Response Mapping UI

Fields from backend mapping:

- `answerPath`
- `suggestionsPath`
- `intentPath`
- `confidencePath`
- `sourcesPath`
- `retrievalPath`
- `memoryPath`
- `rewritePath`
- `agentPath`
- `toolPath`
- `toolCallsPath`
- `traceIdPath`
- `latencyPath`
- `customComponents`
- `missingFieldBehavior`

Steps:

1. Build mapping form grouped by answer, RAG, tool/agent, trace, custom.
2. Provide examples such as `$.data.answer` and `$.data.tool_calls`.
3. Add `missingFieldBehavior` select with translated labels but raw values `FAIL`, `SKIP`, `WARNING`.
4. Add local validation that paths start with `$` or a supported path format if that is the runner standard.
5. Save through PUT endpoint.

Acceptance:

- Mapping UI explains operational impact through concise labels/help text.
- Saved mapping refetches and shows persisted values.

## Task 4.8: Tests

Cases:

1. Project list renders loading, empty, and populated states.
2. Project form validates required fields.
3. Target JSON template field rejects invalid JSON.
4. cURL preview can apply parsed values.
5. Response mapping saves `missingFieldBehavior`.
6. Archive/delete confirmations protect destructive actions.

## Suggested Commit Slices

1. `feat(frontend): add project api and list`
2. `feat(frontend): add project form flows`
3. `feat(frontend): add target api and list`
4. `feat(frontend): add target configuration form`
5. `feat(frontend): add response mapping editor`
6. `test(frontend): cover project target management`
