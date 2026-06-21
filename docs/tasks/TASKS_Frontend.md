# Frontend Task Implementation Plan

**⚠️ 🚨 AI AGENT DIRECTIVE: MUST READ BEFORE ANY CODE IS WRITTEN 🚨 ⚠️**

Whenever you feel "uncertain", "vague", or are about to guess how a component should look or how an API payload is structured, you MUST STOP and read these exact files:

1. **For UI/UX Rules & Styling:** Read `docs/architecture/Frontend_Design_System.md`.
2. **For Component Code Standards (React 19):** Read `docs/architecture/Component_Contracts.md`.
3. **For API Contracts:** You MUST read the exact Java class files in the Backend before building any Frontend API call.
   - Go to: `apps/api/src/main/java/vn/vinfast/aitesthub/<feature>/request/` to see what fields to send.
   - Go to: `apps/api/src/main/java/vn/vinfast/aitesthub/<feature>/response/` to see what fields you will receive.
   - **Do NOT guess JSON payloads.**

---

This document outlines the epics and tasks required to build the Frontend application for `vf-ai-testhub`.
The backend relies strictly on English keys, so the frontend MUST implement an i18n layer to translate API responses and UI text if the user selects Vietnamese.

## Epic 1: Project Setup & Foundation (Design System) - ⏳ PENDING
**Goal:** Initialize the React application and implement the core Design System components.
- [x] TASK 1.1: Initialize React + Vite (TypeScript) project. Configure ESLint and absolute paths (`@/`). *(Completed)*
- [x] TASK 1.2: Configure Tailwind CSS v4 and set up Semantic CSS Variables (`global.css`) based on `Frontend_Design_System.md`. *(Completed)*
- [ ] TASK 1.3: Set up shadcn/ui registry and install core layout primitives (Button, Input, Card, Table). Ensure they follow the Component Contracts (React 19 syntax).
- [ ] TASK 1.4: Implement React Router with lazy loading (`Suspense`).
- [ ] TASK 1.5: Build the `AppShell` layout (Sidebar, Top Header with Breadcrumbs, User Profile dropdown).
- [ ] **TESTING TASK 1.6:** Setup Vitest + React Testing Library. Write unit tests to verify the AppShell renders correctly and Sidebar responsive states work.

## Epic 2: API Client, State & i18n - ⏳ PENDING
**Goal:** Set up API fetching, global state, and strict translation layers (crucial since Backend is English-only).
- [ ] TASK 2.1: Configure `react-i18next`. Setup English (`en`) and Vietnamese (`vi`) translation dictionaries.
- [ ] TASK 2.2: Configure Axios with interceptors to automatically attach the `Authorization: Bearer <token>` header, and pass `Accept-Language` headers.
- [ ] TASK 2.3: Setup TanStack React Query. Create types for standard responses (e.g., `PageResponse<T>`) for paginated lists, and generic handlers for singular `Response` objects.
- [ ] TASK 2.4: Configure Zustand stores (e.g., `useAuthStore`, `useProjectStore`).
- [ ] **TESTING TASK 2.5:** Write Unit Tests for Axios interceptors (mocking requests) and Zustand stores (state mutations).

## Epic 3: Authentication & Security - ⏳ PENDING
**Goal:** Implement login flows against the fully implemented Spring Security (OAuth2/JWT) backend.
- [ ] TASK 3.1: Build Login Page. Include buttons for "Login with Google" and "Login with GitHub" (OAuth2 flows) mapped to `/api/v1/auth/...`.
- [ ] TASK 3.2: Implement OAuth2 callback handler (capturing the token returned from the backend after social login).
- [ ] TASK 3.3: Build Local Login/Register forms. Validate using Zod mapped with `zod-i18n-map`. *Must use FloatingInput component per Design System.*
- [ ] TASK 3.4: Protect routes. Unauthenticated users must be redirected to Login.
- [ ] **TESTING TASK 3.5:** Write Unit Tests for the Login Form (verify Zod validation fires correctly). Write E2E/Integration test for Protected Route redirection.

## Epic 4: Projects & Targets Management - ⏳ PENDING
**Goal:** Build UI to consume the `/api/v1/projects` and `/api/v1/targets` endpoints.
- [ ] TASK 4.1: Build "Project List" page (Table view, Empty State).
- [ ] TASK 4.2: Build "Create/Edit Project" modal (React Hook Form + Zod).
- [ ] TASK 4.3: Build "Target List" view within a selected Project.
- [ ] TASK 4.4: Build "Create/Edit Target" form. Must support `method`, `url`, `headers` (JSON), `bodyTemplate` (JSON), and `timeoutMs`.
- [ ] TASK 4.5: Build Response Mapping config UI (`GET/PUT /api/v1/targets/{targetId}/response-mapping`).
- [ ] **TESTING TASK 4.6:** Write Component tests for Project/Target Forms ensuring validation works. Write Integration tests mocking the API to ensure the List renders correctly.

## Epic 5: Datasets & TestCases Editor - ⏳ PENDING
**Goal:** Build the core interface for writing testcases (consuming `/api/v1/datasets` and `/api/v1/test-cases`).
- [ ] TASK 5.1: Build "Dataset List" and "Create Dataset" functionality.
- [ ] TASK 5.2: Build "TestCase Table" (Compact density, sticky headers).
- [ ] TASK 5.3: Build the "TestCase Editor" form panel.
- [ ] TASK 5.4: Build the UI to consume `/api/v1/test-cases/import/preview` and `confirm` (CSV/Excel import).
- [ ] TASK 5.5: Build the `AssertionBuilderWidget` (consuming `/api/v1/assertions`).
- [ ] TASK 5.6: Build the `ToolExpectationBuilder` widget (consuming `/api/v1/tool-expectations`).
- [ ] **TESTING TASK 5.7:** Write complex Unit Tests for `AssertionBuilderWidget` (verify dynamic fields appear based on selected assertion type). 

## Epic 6: Execution Runner & Real-time Feedback - ⏳ PENDING
**Goal:** UI to trigger runs and observe progress (consuming `/api/v1/runs`).
- [ ] TASK 6.1: Build "Trigger Run" modal (select target, select dataset). Calls `POST /api/v1/datasets/{datasetId}/runs`.
- [ ] TASK 6.2: Implement polling on `GET /api/v1/runs/{runId}` to observe run status changes.
- [ ] **TESTING TASK 6.3:** Write Integration test simulating the polling mechanism (mocking API responses transitioning from PENDING to COMPLETED).

## Epic 7: Results & Reporting - ⏳ PENDING
**Goal:** The massive data display screens for analyzing evaluation outputs.
- [ ] TASK 7.1: Build the "Run Report" dashboard (Summary statistics).
- [ ] TASK 7.2: Build the "Results Data Table" with client-side filtering.
- [ ] TASK 7.3: Implement the "Raw JSON & Code Display" components.
- [ ] **TESTING TASK 7.4:** Write Unit tests for the data transformation functions (calculating pass rates, filtering results).

## Epic 8: Rubrics (AI Judges) - ⏳ PENDING
**Goal:** Manage evaluation rubrics (consuming `/api/v1/rubrics`).
- [ ] TASK 8.1: Build Rubric List view.
- [ ] TASK 8.2: Build Create/Edit Rubric form.
- [ ] **TESTING TASK 8.3:** Write UI tests for Rubric forms.

## Task Workflow Rules for Agents (TDD & Implementation)
1. **Never Assume API Shape:** Read backend Java files before writing the frontend API client.
2. **Handle Backend English:** Ensure i18n layer translates English API responses to Vietnamese.
3. **Follow TDD (Test-Driven Development):** 
   - Write tests BEFORE implementation (`RED -> GREEN -> REFACTOR`).
   - For UI components, use **Vitest** + **React Testing Library**.
   - Test user behavior (e.g., clicking a button, typing in an input) rather than implementation details.
4. **Obey the Contracts:** Follow `Frontend_Design_System.md` and `Component_Contracts.md` strictly.