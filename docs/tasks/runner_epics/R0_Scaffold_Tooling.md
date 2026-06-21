# R0: Scaffold & Tooling

Dependencies: none.

Create the standalone Node.js TypeScript runner service.

## R0.1: App Scaffold

| # | Checklist | Status |
|---|---|---|
| 1 | Create `apps/runner` package with TypeScript source under `src/` | TODO |
| 2 | Add package scripts for `dev`, `build`, `typecheck`, `test`, and `lint` | TODO |
| 3 | Configure `tsconfig.json` for strict TypeScript | TODO |
| 4 | Add `.env.example` for Redis, backend URL, runner token, concurrency, and timeout | TODO |
| 5 | Add README with local run instructions | TODO |

- Commit: `chore(runner): scaffold node typescript service`
- Scope: `M`
- Review: `TODO`

## R0.2: Runtime Config

| # | Checklist | Status |
|---|---|---|
| 1 | Add typed config loader with validation | TODO |
| 2 | Support `REDIS_URL` or host/port/password configuration | TODO |
| 3 | Support `BACKEND_BASE_URL` and `RUNNER_TOKEN` | TODO |
| 4 | Support worker identity: consumer group and consumer name | TODO |
| 5 | Unit test config defaults and required variables | TODO |

- Commit: `feat(runner): add typed runtime config`
- Scope: `S`
- Review: `TODO`
