# Backend Agent Instructions

These instructions apply to `apps/api`. Read this file before changing backend code, then read
`apps/api/CONTEXT.md` for the current implementation state.

## Startup Order

1. Read this `apps/api/AGENTS.md`.
2. Read `apps/api/CONTEXT.md`.
3. Read broader `docs/` files only when the task needs product intent, API contract, DB design, runtime architecture, or
   roadmap detail. Use `docs/INDEX.md` to choose the smallest useful set.
4. Current code wins when docs and implementation disagree, unless the user explicitly asks to migrate the code toward
   a documented target.

## Operating Rules

- Prefix shell commands with `rtk`.
- Skip Testcontainers-heavy full test runs unless explicitly requested; use focused `-Dtest=...` when possible.
- Keep `.env` untracked and never print secret values.
- Do not commit generated runtime files, real secrets, or logs.
- Do not run `git commit` unless the user explicitly asks or the active workflow specifically assigns commit ownership.
- If implementation context changes in a way future agents must know, update `apps/api/CONTEXT.md`.

## Backend Conventions

- Keep Java classes under `vn.vinfast.aitesthub`.
- New public Java classes should include the local class JavaDoc header style already used in code (`@author`,
  `@since`).
- Prefer feature-first packages: `<feature>/controller`, `service`, `service/impl`, `repository`, `entity`, `mapper`,
  `request`, `response`.
- Service classes must use the interface/implementation pattern. Controllers inject service interfaces, not
  implementations.
- Prefer Lombok `@Builder` for creating entities/responses/value objects that support it. Use setters only for
  JPA/framework requirements, partial updates, or established local patterns.
- Internal database `BIGINT id` values must not be exposed through public APIs. Public APIs use UUID `publicId`.

## API Conventions

The backend uses Microsoft/Azure-inspired internal REST conventions, not strict Azure public-service compliance.

- Use plural resource nouns for collections.
- Use path versioning under `/api/v1`.
- HTTP methods: `GET` for reads, `POST` for create/action, `PUT` or `PATCH` for updates according to the existing
  controller pattern, and `DELETE` for removals.
- Actions on resources may use verb sub-paths when already established by code, such as `parse-curl`.
- Collection responses currently use `{ items, page, size, totalItems, totalPages }` in docs, while some implemented
  Spring endpoints may still return `Page<T>`. Do not silently change this behavior without a dedicated API contract
  task.
- Errors use a Problem Details-compatible shape: `type`, `title`, `status`, `detail`, `instance`, plus `code` and
  optional `errors[]`.

## DTO and Controller Conventions

- Request DTO validation annotations must include explicit `message = "..."` on every constraint (`@NotNull`,
  `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Pattern`, `@DecimalMin`, `@DecimalMax`).
- Request DTOs should be Java `record` types.
- Request DTO fields should include `@Schema(description = "...", example = "...")`; mark optional fields with
  `nullable = true`.
- Public controllers should expose Swagger/OpenAPI request, success response, and error response examples when the
  surrounding controller already follows that style.

## Test Expectations

- Write or update focused tests with each backend slice.
- Public controller tests should cover HTTP status, JSON body, Problem Details validation errors, cookies/headers, and
  service delegation where relevant.
- Service tests should cover authorization boundaries, ownership checks, validation branches, and repository
  interactions.
