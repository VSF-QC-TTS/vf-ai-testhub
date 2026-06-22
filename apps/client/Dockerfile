# ============================================================
# VF AI TestHub - Client Dockerfile
# Multi-stage build: Vite build -> Nginx static runtime
# ============================================================

FROM node:24.16.0-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts index.html components.json ./
COPY public public
COPY src src

RUN npm run build

FROM nginx:1.29-alpine AS runtime

LABEL maintainer="nghlong3004"
LABEL description="VF AI TestHub Client"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --spider -q http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
