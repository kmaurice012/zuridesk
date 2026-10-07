FROM node:24.21.0-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@12.9.1

FROM base AS build
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN --mount=type=cache,id=zuridesk-pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @zuridesk/api...
COPY . .
RUN pnpm --filter @zuridesk/api build
RUN --mount=type=cache,id=zuridesk-pnpm,target=/pnpm/store pnpm --filter @zuridesk/api deploy --legacy --node-linker hoisted --prod /prod/api

FROM node:24.21.0-slim AS runtime
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --from=build --chown=node:node /prod/api ./
COPY --from=build --chown=node:node /workspace/apps/api/dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
