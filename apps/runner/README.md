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
