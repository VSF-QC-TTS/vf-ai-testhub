# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a monorepo consisting of multiple applications that form the VF AI TestHub evaluation platform:

- **`apps/api` (Backend API)**: A Spring Boot (Java) REST API using PostgreSQL for persistence and Redis for messaging. It follows the Controller/Service/Repository pattern with MapStruct for DTO mapping. The codebase is under the `vn.vinfast.aitesthub` namespace.
- **`apps/client` (Frontend)**: A React single-page application built with Vite, TypeScript, Tailwind CSS, React Router, React Query, and Zustand.
- **`apps/runner` (Evaluation Engine)**: A Node.js background worker using `ioredis` and `promptfoo` that consumes evaluation jobs from Redis streams, executes them, and reports results back to the backend.
- **`apps/mock-target`**: A mock service for end-to-end smoke tests.

## Documentation & Context (Source of Truth)

Do not rely blindly on older documents; adhere to this priority order:
1. Current code in the `apps/` directory.
2. Local agent instructions (`apps/api/AGENTS.md`) and state (`apps/api/CONTEXT.md`). **Read these before touching any backend code.**
3. Roadmap tasks (`docs/tasks/`).
4. Architecture and product specs (`docs/`). Always refer to `docs/INDEX.md` as the starting point to choose the smallest useful documentation set.

## Common Development Commands

### Infrastructure
```bash
# Start PostgreSQL, Redis, Backend API, Runner, and Mock Target
docker-compose up -d
```

### Backend (`apps/api`)
```bash
cd apps/api
# Build the backend application
./mvnw clean package

# Run the backend locally
./mvnw spring-boot:run

# Run all tests
./mvnw test

# Run a specific test class
./mvnw test -Dtest=ClassNameTest

# Run a specific test method
./mvnw test -Dtest=ClassNameTest#methodName
```
*(Note: Per `apps/api/AGENTS.md`, shell commands should be prefixed with `rtk` where applicable in the local environment.)*

### Frontend (`apps/client`)
```bash
cd apps/client
# Install dependencies
npm install

# Start local development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

### Runner (`apps/runner`)
```bash
cd apps/runner
# Install dependencies
npm install

# Start local development in watch mode
npm run dev

# Run tests
npm test

# Run type checking
npm run typecheck
```

## Core Backend Development Rules
- **API Shape**: Use path versioning (`/api/v1`). Follow standard REST HTTP methods. Errors use a Problem Details-compatible format (`type`, `title`, `status`, `detail`, `instance`).
- **Data Boundaries**: Do not expose internal database `BIGINT id` values through public APIs. Use UUID `publicId`.
- **DTOs**: Request DTOs should be Java `record` types and include explicit `message = "..."` on every validation constraint. Apply Swagger/OpenAPI `@Schema` annotations.
- **Architecture**: Controllers inject service interfaces, not implementations. Use Lombok `@Builder` for entities and responses; avoid generic setters unless required by frameworks.

## Core Runner Development Rules
- The runner authenticates to backend internal endpoints with `X-Runner-Token: ${RUNNER_TOKEN}`. Do not log this value.
- Refer to `.env.example` for required environment variables.