# Frontend Task Implementation Plan

This is the implementation index for the AI TestHub frontend. Each epic file in `docs/tasks/frontend_epics/` is written as a step-by-step execution guide for agents.

## Mandatory Reading Before Frontend Work

Read these before writing code:

1. `docs/architecture/Frontend_Design_System.md`
2. `docs/architecture/Component_Contracts.md`
3. The relevant frontend epic file listed below.
4. The exact backend Java files for the feature being implemented:
   - `apps/api/src/main/java/vn/vinfast/aitesthub/<feature>/controller/`
   - `apps/api/src/main/java/vn/vinfast/aitesthub/<feature>/request/`
   - `apps/api/src/main/java/vn/vinfast/aitesthub/<feature>/response/`

Do not guess API payloads from memory or from old docs. Backend source is the source of truth.

## Current Frontend Baseline

Current package facts from `apps/client/package.json`:

- React `19.x`
- React DOM `19.x`
- React Router DOM `7.x`
- Tailwind CSS `4.x`
- Radix primitives already started for dropdown/slot
- Zustand installed
- i18n, Axios, TanStack Query, React Hook Form, Zod, Vitest, Testing Library, and MSW still need to be added before their epics can be complete.

React 19 contract constraints:

- Use `createRoot`; never use `ReactDOM.render`.
- Do not add new `forwardRef` wrappers unless required by a third-party adapter.
- Prefer `ref` as a prop in local components.
- Do not use function component `defaultProps`, `propTypes`, string refs, `findDOMNode`, `react-test-renderer`, or `react-dom/test-utils`.
- Use `useActionState` from `react` instead of deprecated `ReactDOM.useFormState`.

## Epic Index

| Epic | File | Status | Goal |
| --- | --- | --- | --- |
| 1 | `frontend_epics/epic_1_project_setup_and_foundation.md` | IN_PROGRESS | Foundation, routing, AppShell, UI primitives, testing setup |
| 2 | `frontend_epics/epic_2_api_client_state_i18n.md` | PENDING | API client, env validation, TanStack Query, Zustand, i18n |
| 3 | `frontend_epics/epic_3_authentication_and_security.md` | PENDING | Local auth, OAuth entrypoints, session handling, protected routes |
| 4 | `frontend_epics/epic_4_projects_and_targets_management.md` | PENDING | Project and target CRUD, cURL parse, response mapping |
| 5 | `frontend_epics/epic_5_datasets_testcases_editor.md` | PENDING | Dataset CRUD, testcase table/editor, CSV/Excel import, assertions/tools |
| 6 | `frontend_epics/epic_6_execution_runner_feedback.md` | PENDING | Trigger runs, status polling, run history |
| 7 | `frontend_epics/epic_7_results_reporting_review.md` | PENDING | Run report, result details, raw JSON, manual review |
| 8 | `frontend_epics/epic_8_rubrics_ai_generation.md` | PENDING | Rubrics, AI testcase generation, assertion suggestions |

## Workflow Rules

1. Work one small slice at a time.
2. Before each slice, read the epic section and backend Java contract files.
3. Write or update tests before implementation where practical.
4. Keep UI text behind i18n keys.
5. Use TanStack Query for server state, URL search params for shareable view state, Zustand only for cross-route client state.
6. After each small completed slice, run the focused frontend checks and commit only relevant files.
7. Update the epic checklist when implementation facts change.

## Standard Verification Commands

Run from `apps/client`:

```bash
npm run lint
npm run build
npm test
```

If `npm test` does not exist yet, Epic 1 must add it before later epics can be marked complete.

## Done Definition

A frontend epic is not complete until:

- It reads real backend contracts.
- It has loading, empty, error, and success states.
- It has responsive behavior for desktop, tablet, and mobile.
- It has at least one meaningful behavior test for each major user flow.
- It has i18n keys for all user-visible strings.
- It does not use React 19 removed/deprecated APIs listed in `Component_Contracts.md`.
