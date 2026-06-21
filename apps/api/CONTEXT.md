# Backend Context

Date: 2026-06-21

Repo area: `apps/api`

Purpose: this is the backend implementation handoff for agents. It records current server behavior and facts that are
easy to miss from product docs alone. Current code is the source of truth when docs and implementation differ. The full
product target lives in `docs/`; treat docs as roadmap/contract intent unless the user explicitly asks to migrate
current code toward them.

Read `apps/api/AGENTS.md` first for backend rules and conventions. Use this file for current state.

Reading tags:

- `[START_HERE]`: read first for the docs map and startup reminder.
- `[CURRENT_STATE]`: read before touching existing auth/domain/persistence behavior.
- `[API_CHANGE]`: read before adding, removing, or changing an API endpoint.
- `[MAIL]`: read only when changing mail or token-email flows.
- `[TESTS]`: read before choosing which server tests to run.

## [START_HERE] Docs Map

- `apps/api/AGENTS.md`: backend coding rules, conventions, and test expectations.
- `apps/api/CONTEXT.md`: current backend implementation state.
- `docs/INDEX.md`: top-level documentation map and recommended reading order.
- `docs/tasks/TASKS_Backend.md`: backend roadmap, current baseline, task breakdown, and acceptance criteria.
- `docs/architecture/API_Design.md`: product API contract target; mixed current and roadmap coverage.
- `docs/architecture/Database_Design.md`: conceptual database target plus current schema notes.
- `docs/architecture/C4_Architecture.md`: system/container/component architecture and async runner flow.
- `docs/architecture/LLD_FullStack.md`: low-level implementation and testing strategy.
- `docs/product/PRD.md`: product intent and domain model; roadmap source, not current implementation truth.

## [START_HERE] Agent Startup Reminder

1. Read `apps/api/AGENTS.md`.
2. Read this `apps/api/CONTEXT.md`.
3. Use `docs/INDEX.md` before opening broader docs.
4. After each backend slice, update this file when tracked implementation facts change.

## [CURRENT_STATE] Auth

Current implemented auth state:

- Local auth endpoints live under `/api/v1/auth`: `register`, `login`, `refresh-token`, `logout`, `verify-email`,
  `forgot-password`, `reset-password`.
- Login returns the access token in the JSON body and stores the refresh token only as the HttpOnly `refresh_token`
  cookie.
- `POST /api/v1/auth/refresh-token` reads the `refresh_token` cookie, validates a refresh JWT with
  `token_type=refresh`, returns a new access token, and rotates the refresh cookie.
- `POST /api/v1/auth/logout` clears `refresh_token` with `Max-Age=0`; no token store/revocation exists yet.
- Protected APIs use `Authorization: Bearer ...`; CSRF is disabled.
- Spring Security validates protected APIs through OAuth2 Resource Server `JwtDecoder`; do not add a duplicate
  handwritten JWT request filter.
- Main `JwtDecoder` accepts only JWTs with `token_type=access`; named `refreshTokenJwtDecoder` accepts only
  `token_type=refresh`.
- The access `JwtDecoder` is `@Primary`; keep the refresh decoder named/qualified so Spring Security uses access tokens
  for protected APIs while refresh-token flow uses refresh tokens.
- Register creates `PENDING_EMAIL_VERIFICATION` users and emails `${WEB_BASE_URL}/verify-email?token=...`.
- Forgot password emails `${WEB_BASE_URL}/reset-password?token=...`; the request must not reveal account existence.

## [CURRENT_STATE] OAuth

OAuth state:

- OAuth2 login is implemented for Google and GitHub providers.
- `OAuth2LoginSuccessHandler` implements a find-or-create user pattern. On first OAuth login, it creates a `User` with
  `UserStatus.ACTIVE`, `Role.QC_MEMBER`, a random unguessable `passwordHash`, `displayName` from the OAuth profile
  with email-prefix fallback, and `avatarUrl` from the provider. On re-login, `avatarUrl` and `lastLoginAt` are synced.
- JWT tokens (access + refresh) are issued via `JwtTokenService`, same as local login. Refresh token is set as an
  HttpOnly cookie.
- There is no `authProvider` field on `User`; OAuth users are regular users with an unguessable password hash.
- Profile extraction: `GoogleOAuth2UserProfileExtractor` reads email, `given_name`, `family_name`, and `picture`;
  `GithubOAuth2UserProfileExtractor` reads email, name/login, and `avatar_url`.
- `GithubEmailOAuth2UserEnricher` fetches private emails from the GitHub API.
- Security config wires `.oauth2Login()` with `ProviderAwareOAuth2UserService`, `OAuth2LoginSuccessHandler`, and
  redirect URIs under `/api/v1/`.

## [CURRENT_STATE] Domain Choices

Domain choices in current code:

- User entity is `vn.vinfast.aitesthub.user.entity.User`.
- Public API uses `email`; persistence stores it in `users.username`.
- `UserStatus`: `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `DISABLED`.
- `Role`: `QC_MEMBER`, `QC_LEAD`, `ADMIN`; `Role#getAuthority()` returns `ROLE_` + enum name.
- `User` uses Lombok builder/defaults; register currently builds users with `User.builder()`.
- `User.avatarUrl` (`VARCHAR(512)`, nullable) stores the user's avatar image URL. `UserResponse` includes `avatarUrl`
  in JSON. When `avatarUrl` is `null`, the frontend falls back to initials-based avatar rendering.
- Default avatar URL template is configurable via `vat.user.default-avatar-url` (env: `DEFAULT_AVATAR_URL`).
- `Project` entity is `vn.vinfast.aitesthub.project.entity.Project`. It uses internal `BIGINT id` and exposes
  `UUID publicId`. It tracks ownership and creator via relationships to `User`.
- `Target` entity is `vn.vinfast.aitesthub.target.entity.Target`. It configures external execution environments
  (`HTTP` APIs or `LLM` providers) for a `Project` and exposes `UUID publicId`.
- `ResponseMapping` entity is `vn.vinfast.aitesthub.target.entity.ResponseMapping`. It has a `OneToOne` association with
  `Target` and maps dynamic JSON response paths such as answer, suggestions, intent, tool calls, and trace fields into
  structured evaluation data.
- `Dataset` entity is `vn.vinfast.aitesthub.dataset.entity.Dataset`. It groups evaluation test cases inside a
  `Project`, tracks its creator, stores category/tags/metadata, supports archiving, and exposes `UUID publicId`.
- `TestCase` entity is `vn.vinfast.aitesthub.testcase.entity.TestCase`. It belongs to a `Dataset`, stores legacy import
  fields (`externalId`, `sectionName`, `input`, `expectedBehavior`) plus roadmap fields such as reference answer,
  variables, preconditions, tags, priority, enabled/source, generated metadata, and exposes `UUID publicId`.

## [CURRENT_STATE] Persistence

Persistence now vs target:

- Current backend uses PostgreSQL and Flyway.
- Current migrations:
  - `V1__init_schema.sql`: users, email verification tokens, password reset tokens.
  - `V2__project_schema.sql`: projects.
  - `V3__target_schema.sql`: targets and response mappings.
  - `V4__dataset_schema.sql`: datasets.
  - `V5__test_case_schema.sql`: test cases plus `test_priority` and `test_case_source` enum types.
  - `V6__test_case_import_preview_schema.sql`: persisted CSV/Excel import previews and uploaded file references.
- Email verification and password reset tokens are opaque raw values; only SHA-256 hashes are stored.
- `OpaqueTokenService` owns raw token generation and hashing for one-time email tokens.
- Main tables use internal `BIGINT id` plus public UUID `public_id`; APIs should expose `publicId`, not internal `id`.

## [API_CHANGE] Implemented API Slices

Implemented API slices after auth:

- `GET /api/v1/users/me`: returns the current authenticated user by principal username/email.
- `POST /api/v1/projects`: create a new project.
- `GET /api/v1/projects/{id}`: get a project by `publicId`.
- `GET /api/v1/projects`: get paginated active projects.
- `PUT /api/v1/projects/{id}`: update a project by `publicId`.
- `PATCH /api/v1/projects/{id}/archive`: archive a project by `publicId`.
- `POST /api/v1/projects/{projectId}/targets/parse-curl`: parse a raw cURL command into a target configuration preview
  without persisting.
- `POST /api/v1/projects/{projectId}/targets`: create a new target inside a project.
- `GET /api/v1/projects/{projectId}/targets`: get paginated targets for a project.
- `GET /api/v1/targets/{targetId}`: get a target by its `publicId`.
- `PUT /api/v1/targets/{targetId}`: update a target by its `publicId`.
- `DELETE /api/v1/targets/{targetId}`: delete a target by its `publicId`.
- `GET /api/v1/targets/{targetId}/response-mapping`: get response mapping configuration for a target.
- `PUT /api/v1/targets/{targetId}/response-mapping`: save or update response mapping configuration for a target.
- `POST /api/v1/projects/{projectId}/datasets`: create a new dataset inside a project.
- `GET /api/v1/projects/{projectId}/datasets`: get paginated active datasets for a project.
- `GET /api/v1/datasets/{datasetId}`: get a dataset by its `publicId`.
- `PUT /api/v1/datasets/{datasetId}`: update a dataset by its `publicId`.
- `DELETE /api/v1/datasets/{datasetId}`: archive a dataset by its `publicId`.
- `POST /api/v1/datasets/{datasetId}/test-cases`: create a test case inside a dataset.
- `GET /api/v1/datasets/{datasetId}/test-cases`: get paginated/filterable test cases for a dataset.
- `GET /api/v1/test-cases/{testCaseId}`: get a test case by its `publicId`.
- `PUT /api/v1/test-cases/{testCaseId}`: update a test case by its `publicId`.
- `DELETE /api/v1/test-cases/{testCaseId}`: delete a test case by its `publicId`.
- `POST /api/v1/datasets/{datasetId}/test-cases/import/preview`: parse and store a CSV/XLS/XLSX import preview.
- `POST /api/v1/datasets/{datasetId}/test-cases/import/confirm`: confirm an import preview and persist imported test
  cases in batches.
- `POST /api/v1/projects/{projectId}/rubrics`: create a project or dataset scoped rubric.
- `GET /api/v1/projects/{projectId}/rubrics`: get paginated/filterable rubrics for a project.
- `GET /api/v1/rubrics/global`: get paginated/filterable global rubrics.
- `GET /api/v1/rubrics/{rubricId}`: get a rubric by its `publicId`.
- `PUT /api/v1/rubrics/{rubricId}`: update a rubric by its `publicId`.
- `DELETE /api/v1/rubrics/{rubricId}`: archive a rubric by its `publicId`.

## [MAIL] Mail

Mail state:

- Mail config maps `.env` keys `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`.
- Mail flow uses Strategy + Factory: `MailType`, `MailRequest`, `MailMessage`, `MailStrategy`, `MailStrategyFactory`.
- Templates are HTML emails designed with a minimalist UI.
- Emails support i18n through Spring `MessageSource`.
- Translations are stored in `messages.properties` (English default) and `messages_vi.properties` (Vietnamese).
- `LocaleContextHolder` reads the `Accept-Language` header from the frontend request to determine email language.
- Hardcoded English text has been replaced with dynamic placeholders such as `{{title}}`, `{{greeting}}`, and `{{body}}`
  injected through the strategy model map.

## [TESTS] Focused Tests

Focused tests:

- Last known full server suite on 2026-06-19 after QC productivity features:
  `rtk bash mvnw test` -> 52 tests, 0 failures/errors.
- Prefer focused commands for changed slices, for example:
  `rtk bash mvnw -Dtest=ProjectControllerTest,ProjectServiceImplTest test`.
- Dataset focused verification on 2026-06-21:
  `rtk bash mvnw -Dtest=DatasetServiceImplTest,DatasetControllerTest test` -> 14 tests, 0 failures/errors.
- TestCase entity/DTO/mapper compile verification on 2026-06-21:
  `rtk bash mvnw compile` -> success.
- TestCase service focused verification on 2026-06-21:
  `rtk bash mvnw -Dtest=TestCaseServiceImplTest test` -> 6 tests, 0 failures/errors.
- TestCase import preview persistence compile verification on 2026-06-21:
  `rtk bash mvnw compile` -> success.
- TestCase import focused verification on 2026-06-21:
  `rtk bash mvnw -Dtest=CsvTestCaseImportStrategyTest,ExcelTestCaseImportStrategyTest,TestCaseImportServiceImplTest test`
  -> 6 tests, 0 failures/errors.
- TestCase controller focused verification on 2026-06-21:
  `rtk bash mvnw -Dtest=TestCaseControllerTest,TestCaseImportControllerTest test` -> 9 tests, 0 failures/errors.
- Rubric entity/DTO/mapper compile verification on 2026-06-21:
  `rtk bash mvnw compile` -> success.
- Rubric service/controller compile verification on 2026-06-21:
  `rtk bash mvnw compile` -> success.
- Rubric focused verification on 2026-06-21:
  `rtk bash mvnw -Dtest=RubricServiceImplTest,RubricControllerTest test` -> 14 tests, 0 failures/errors.
- Public controller tests should cover HTTP status, JSON body, Problem Details validation errors, cookies/headers, and
  service delegation.
