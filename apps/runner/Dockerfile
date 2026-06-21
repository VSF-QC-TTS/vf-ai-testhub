# ============================================================
# VF AI TestHub - Runner Dockerfile
# Multi-stage build: npm install -> TypeScript build -> runtime
# ============================================================

FROM node:24.16.0-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

COPY tsconfig.json ./
COPY src src
RUN npm run build

FROM node:24.16.0-bookworm-slim AS runtime

LABEL maintainer="nghlong3004"
LABEL description="VF AI TestHub Node runner"

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && groupadd --system runner \
    && useradd --system --gid runner --home-dir /app runner

COPY --from=builder --chown=runner:runner /app/dist ./dist

USER runner

CMD ["node", "dist/index.js"]
