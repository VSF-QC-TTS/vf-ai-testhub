# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Protocol

See `AGENTS.md` for the Zero-Trust skill loading protocol (applies to all AI agents) and the MCP runtime-enforcement section (when enabled).

## Self-Learning Protocol

At the end of any multi-step task with user corrections, load and run **[common/common-session-retrospective](.claude/skills/common/common-session-retrospective/SKILL.md)** to capture skill gaps and prevent repeat rework.

## Project Structure & Architecture

This is a monorepo consisting of:
- `apps/api/`: Spring Boot backend application (Java 21).
- `apps/client/`: React + TypeScript + Vite frontend application.
- `docs/`: Product target, roadmap, and DB schema documents.

### API Architecture (`apps/api`)
- Built with Spring Boot 4.0.7, Spring Security, Spring Data JPA, and PostgreSQL.
- Feature-first package structure under `vn.vinfast.aitesthub`: `<feature>/controller`, `service`, `entity`, `mapper`, `request`, `response`.
- **Domain Focus**: Contains entities like `User`, `Project`, `Target`, and `ResponseMapping`.
- **Auth**: Fully implemented OAuth2 (Google/GitHub) and local JWT authentication.
- **DTOs & Entities**: Prefers Lombok `@Builder` for creating domain entities and DTOs.
- **Persistence**: Flyway migrations are used. Uses `BIGINT id` internally and `UUID publicId` publicly.
- For more detailed API context, always refer to `apps/api/CONTEXT.md` before making changes.

### Client Architecture (`apps/client`)
- Modern React 19 app using Vite.
- State management via Zustand.
- Styling with Tailwind CSS v4.
- Linting using ESLint and TypeScript strict mode.

## Common Commands

### Backend (`apps/api`)
Prefix shell commands with `rtk` (e.g., `rtk bash mvnw ...`).
- **Build**: `cd apps/api && ./mvnw clean install -DskipTests`
- **Run Application**: `cd apps/api && ./mvnw spring-boot:run`
- **Run All Tests**: `cd apps/api && ./mvnw test`
- **Run Single Test**: `cd apps/api && ./mvnw test -Dtest=ClassNameTest`
- **Run Specific Test Method**: `cd apps/api && ./mvnw test -Dtest=ClassNameTest#methodName`

### Frontend (`apps/client`)
- **Install Dependencies**: `cd apps/client && npm install`
- **Start Development Server**: `cd apps/client && npm run dev`
- **Build for Production**: `cd apps/client && npm run build`
- **Run Linter**: `cd apps/client && npm run lint`
- **Preview Production Build**: `cd apps/client && npm run preview`

## Workflow & Commit Standards

- **TDD approach preferred**: Code → Write tests → Run tests → Commit.
- **Commit Messages**: Follow Conventional Commits format: `feat(scope)`, `fix(scope)`, `refactor(scope)`, `docs(scope)`, `chore(scope)`.
- Never move to the next step until the current step's tests pass and changes are committed.
- If backend implementation context changes in a way future agents must know, update `apps/api/CONTEXT.md`.
