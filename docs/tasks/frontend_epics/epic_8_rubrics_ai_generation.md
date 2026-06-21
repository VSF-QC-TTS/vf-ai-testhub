# Epic 8: Rubrics and AI Generation

Goal: build rubric management and AI-assisted testcase/assertion suggestion flows.

## Read First

Backend:

- `apps/api/src/main/java/vn/vinfast/aitesthub/rubric/`
- `apps/api/src/main/java/vn/vinfast/aitesthub/ai/`
- `apps/api/CONTEXT.md` AI generation service state

## Task 8.1: Rubric API Layer

Steps:

1. Read rubric controller/request/response classes.
2. Implement project rubric list/create/update/archive.
3. Implement global rubric list if backend exposes it.
4. Define types for rubric scope, category, language, default threshold, criteria, and versions if returned.

Acceptance:

- Archived rubric behavior matches backend.
- Global and project-scoped rubrics are visually distinct.

## Task 8.2: Rubric List

Steps:

1. Build rubric list page under project or global area.
2. Add filters by scope/category/language.
3. Show title, scope, category, language, status, updated time.
4. Add create/edit/archive actions.

Acceptance:

- Empty state offers create rubric where allowed.
- Archive requires confirmation.

## Task 8.3: Rubric Form

Steps:

1. Build create/edit form.
2. Fields: name/title, scope, category, language, content, threshold, criteria if backend supports.
3. Use textarea/editor for rubric content.
4. Validate threshold range.
5. Provide preview panel showing how rubric will be used by assertions.

Acceptance:

- Long rubric content remains editable.
- Validation errors are localized.

## Task 8.4: AI TestCase Generation

Steps:

1. Read AI generation request/response DTOs.
2. Build generate testcase dialog from dataset page.
3. Collect prompt/context fields exactly as backend expects.
4. Submit request.
5. Render returned `TestCaseDraft` list for review.
6. Let user select drafts to persist only if backend has persistence endpoint; otherwise export/apply through existing testcase create flow.

Acceptance:

- Generated content is never silently persisted without user review.
- Model errors show retryable error state.
- User can edit draft before saving.

## Task 8.5: Assertion Suggestions

Steps:

1. Read assertion suggestion DTOs.
2. Add "Suggest assertions" action from testcase editor.
3. Show assertion and tool expectation drafts.
4. Let user accept, edit, or discard each suggestion.
5. Persist accepted suggestions through existing assertion/tool expectation endpoints.

Acceptance:

- Tool expectation suggestions are hidden or marked unavailable when backend omits tool context.
- Accepted suggestions keep backend enum values.

## Task 8.6: Tests

Cases:

1. Rubric form validates threshold/content.
2. Rubric list filters by category.
3. AI generation dialog sends exact request payload.
4. Draft review allows edit before save.
5. Assertion suggestions persist accepted items only.

## Suggested Commit Slices

1. `feat(frontend): add rubric management`
2. `feat(frontend): add ai testcase draft flow`
3. `feat(frontend): add assertion suggestion review`
4. `test(frontend): cover rubrics ai generation`
