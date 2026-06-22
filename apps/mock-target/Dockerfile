FROM node:24.16.0-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system mocktarget \
    && useradd --system --gid mocktarget --home-dir /app mocktarget

COPY --chown=mocktarget:mocktarget server.mjs ./

USER mocktarget

EXPOSE 8090

CMD ["node", "server.mjs"]
