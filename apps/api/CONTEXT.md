# Context

Date: 2026-06-19

Repo area: `apps/api`

Purpose: this is the server bootstrap handoff. If a user only says "read `apps/api/CONTEXT.md`", the agent must
use this file to discover the next files to read without asking for more pointers. Current code is the source of truth
when docs and implementation differ. The full product target lives in `docs/`; treat docs as roadmap/contract intent
unless the user explicitly asks to migrate current code toward them.

Reading tags:

- `[START_HERE]`: always read first; includes rules, docs map, and agent startup order.
- `[API_CHANGE]`: read before adding, removing, or changing an API endpoint.
- `[CURRENT_STATE]`: read before touching existing auth/domain behavior.
- `[MAIL]`: read only when changing mail or token-email flows.
- `[CONVENTIONS]`: read before adding public controller/service/repository/mapper code.
- `[TESTS]`: read before choosing which server tests to run.

## [START_HERE] Rules

Rules:

- Prefix shell commands with `rtk`.
- Skip Testcontainers-heavy full test runs unless explicitly requested; use focused `-Dtest=...`.
- Keep `.env` untracked and never print secret values.
- Do not commit generated runtime files, real secrets, or logs.
- Keep Java classes under `vn.vinfast.aitesthub` and include the local class JavaDoc header style already used in code.
- Prefer Lombok `@Builder` object construction for domain entities/DTO-like objects when the type supports it; avoid
  `new` plus setter chains unless the surrounding code or framework requires it.
- If implementation context changes in a way future agents must know, update this `apps/api/CONTEXT.md` handoff
  too.

## [START_HERE] Docs Map

Docs map:

- `seapps/apirver/CONTEXT.md`: read first; this file routes the rest of the backend context.

## [START_HERE] Agent Startup Order

Agent startup order:

1. Read this `apps/api/CONTEXT.md`.
2. Read broader `docs/` files only when the task needs product contract, DB schema, runtime setup, or new-domain
   implementation detail.
3. After each backend slice, update `CONTEXT.md` when their tracked facts change, then commit with
   `type(scope): summary`.

## [CURRENT_STATE] Auth

Current implemented auth state:

- Actual local auth endpoints live under `/api/v1/auth`: `register`, `login`, `refresh-token`, `logout`, `verify-email`,
  `forgot-password`, `reset-password`.
- This differs from the docs target `/api/v1/sessions`; for now follow existing code unless the user asks to migrate the
  contract.
- Login returns access token in the JSON body and refresh token only as HttpOnly `refresh_token` cookie.
- `POST /api/v1/auth/refresh-token` reads `refresh_token` cookie, validates a refresh JWT with `token_type=refresh`,
  returns a new access token, and rotates the refresh cookie.
- `POST /api/v1/auth/logout` clears `refresh_token` with `Max-Age=0`; no token store/revocation exists yet.
- Protected APIs use `Authorization: Bearer ...`; CSRF is disabled.
- Main `JwtDecoder` accepts only JWTs with `token_type=access`; a named `refreshTokenJwtDecoder` accepts only
  `token_type=refresh`.
- The access `JwtDecoder` is `@Primary`; keep the refresh decoder named/qualified so Spring Security uses access tokens
  for protected APIs while refresh-token flow uses refresh tokens.
- Register creates `PENDING_EMAIL_VERIFICATION` users and emails `${WEB_BASE_URL}/verify-email?token=...`.
- Forgot password emails `${WEB_BASE_URL}/reset-password?token=...`; the request must not reveal account existence.

## [CURRENT_STATE] OAuth

OAuth state:

- OAuth2 login is **fully implemented** for Google and GitHub providers.
- `OAuth2LoginSuccessHandler` implements find-or-create user pattern: on first OAuth login, a new `User` is created with
  `UserStatus.ACTIVE`, `Role.QC_MEMBER`, a random (un-guessable) `passwordHash`, `displayName` from OAuth profile (falls
  back to email prefix), and `avatarUrl` from the provider. On re-login, `avatarUrl` and `lastLoginAt` are synced.
- JWT tokens (access + refresh) are issued via `JwtTokenService` — same as local login. Refresh token is set as an
  HttpOnly cookie.
- No `authProvider` field on `User` entity — OAuth users are just users with an impossible-to-guess password hash.
- Profile extraction: `GoogleOAuth2UserProfileExtractor` (email, given_name, family_name, picture),
  `GithubOAuth2UserProfileExtractor` (email, name/login, avatar_url). `GithubEmailOAuth2UserEnricher` fetches private
  emails from GitHub API.
- Security config wires: `.oauth2Login()` with custom `ProviderAwareOAuth2UserService`, `OAuth2LoginSuccessHandler`, and
  redirect URIs under `/api/v1/`.
- 15 OAuth2 tests passing (handler: 5, profile: 5, userinfo: 3, auth provider: 2).

## [CURRENT_STATE] Domain Choices

Domain choices in current code:

- User entity is `vn.vinfast.aitesthub.user.entity.User`.
- Public API uses `email`; persistence stores it in `users.username`.
- `UserStatus`: `PENDING_EMAIL_VERIFICATION`, `ACTIVE`, `DISABLED`.
- `Role`: `QC_MEMBER`, `QC_LEAD`, `ADMIN`; `Role#getAuthority()` returns `ROLE_` + enum name.
- `User` uses Lombok builder/defaults; register currently builds users with `User.builder()`.
- Existing domain code prefers Lombok builders for object creation where available; keep that style instead of
  constructing with `new` and then mutating through setters.
- `User.avatarUrl` (`VARCHAR(512)`, nullable): stores the user's avatar image URL. `UserResponse` includes `avatarUrl`
  in its JSON payload. When `avatarUrl` is `null`, the frontend falls back to initials-based avatar rendering.
- Default avatar URL template is configurable via `vat.user.default-avatar-url` (env: `DEFAULT_AVATAR_URL`).

## [CURRENT_STATE] Persistence

Persistence now vs target:

- Current Flyway has six migrations: `V1__init_schema.sql` (auth)
- Email verification and password reset tokens are opaque raw values; only SHA-256 hashes are stored.
- `OpaqueTokenService` owns raw token generation and hashing for one-time email tokens.
- Future MVP docs expect main tables to use internal `BIGINT id` plus public `UUID public_id`; APIs should expose
  `publicId`, not internal `id`.

## [API_CHANGE] Implemented API Slices

Implemented API slices after auth:

- `GET /api/v1/users/me`: returns the current authenticated user by principal username/email.

## [MAIL] Mail

Mail:

- Mail config maps `.env` keys `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`.
- Mail flow uses Strategy + Factory: `MailType`, `MailRequest`, `MailMessage`, `MailStrategy`, `MailStrategyFactory`.
- Templates are HTML emails designed with a modern, minimalist aesthetic (sans-serif, ample padding, neutral colors).
- **Internationalization (i18n)**:
    - Emails support multi-language via Spring `MessageSource`.
    - Translations are stored in `messages.properties` (English default) and `messages_vi.properties` (Vietnamese).
    - The `LocaleContextHolder` reads the `Accept-Language` header from the frontend request to determine the email
      language at runtime.
    - Hardcoded English text has been replaced with dynamic placeholders (e.g., `{{title}}`, `{{greeting}}`, `{{body}}`)
      injected via the `model` map in each strategy.

## [CONVENTIONS] Workflow

Development workflow:

- Every step follows: Code → Write tests → Run tests → FAIL? fix and re-run : PASS?
  `git add . && git commit -m "type(scope): summary"` → next step.
- Never move to the next step until current step's tests pass and changes are committed.
- Commit messages follow conventional format: `feat(scope)`, `fix(scope)`, `refactor(scope)`, `docs(scope)`,
  `chore(scope)`.
- After each backend slice, update `CONTEXT.md`
  tracked facts change.

## [CONVENTIONS] API Conventions

API design (Microsoft RESTful Guidelines):

- Use plural nouns for collections
- HTTP methods: GET (read), POST (create/action), PATCH (partial update), DELETE (remove/archive).
- Actions on resources use verb sub-path
- Collection responses: `{ items, page, size, totalItems, totalPages }`.
- Errors use Problem Details shape (RFC 9457): `type`, `title`, `status`, `detail`, `instance`, plus `code` and optional
  `errors[]`.
- Status codes: 200 success, 201 created, 202 accepted, 204 no content, 400 bad request, 404 not found, 409 conflict,
  422 business validation.

DTO validation convention:

- Request DTO validation annotations must include explicit `message = "..."` on every constraint (`@NotNull`,
  `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Pattern`, `@DecimalMin`, `@DecimalMax`).
- Every request DTO field should have `@Schema(description = "...", example = "...")` for Swagger/OpenAPI docs. Mark
  optional fields with `nullable = true`.
- Request DTOs should be `record` types.
- Public controllers should expose Swagger/OpenAPI request, success response, and error response examples.

Code conventions:

- Public service/repository/mapper interfaces should have JavaDoc with `@param` and `@return` where useful, and link
  domain types with `{@link ...}`.
- Prefer feature-first packages: `<feature>/controller`, `service`, `service/impl`, `repository`, `entity`, `mapper`,
  `request`, `response`.
- Prefer Lombok `@Builder` for creating entities/responses/value objects that support it; use setters only for
  JPA/framework requirements, partial updates, or when an existing local pattern already uses setters.

## [TESTS] Focused Tests

Focused tests:

- Full server suite passed on 2026-06-19 after QC Productivity Features:
  `rtk bash mvnw test` -> 52 tests, 0 failures/errors.

- Public controller tests should cover HTTP status, JSON body, Problem Details validation errors, cookies/headers, and
  service delegation.
