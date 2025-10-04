FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm i --frozen-lockfile && \
   pnpm approve-builds

COPY . .
RUN pnpm run build

EXPOSE 3333
CMD ["pnpm", "run", "start:prod"]
