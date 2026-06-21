# AI TestHub Runner

Node.js TypeScript service that consumes backend run snapshots from Redis Streams, executes evaluations, and reports
structured results back to the backend internal API.

## Local Setup

```bash
npm install
npm run typecheck
npm test
npm run dev
```

Required environment variables are listed in `.env.example`.

The runner authenticates to backend internal endpoints with `X-Runner-Token: ${RUNNER_TOKEN}`. Do not log this value.

## Docker Compose

The root `docker-compose.yml` includes the runner, Redis, backend API, PostgreSQL, and a mock target service for future
end-to-end smoke tests.

Useful service URLs inside the Compose network:

```text
Backend API: http://api:8080
Redis: redis://redis:6379
Mock target: http://mock-target:8090/chat
Runner stream key: run:jobs
```

The runner service uses the same `RUNNER_TOKEN` value as the API service. Keep the root `.env` value aligned with
`RUNNER_TOKEN`, or Compose falls back to `local-runner-token`.
