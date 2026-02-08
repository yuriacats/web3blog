# syntax=docker/dockerfile:1

FROM node:22-alpine as builder
RUN corepack enable pnpm
WORKDIR /work
COPY ./package.json ./pnpm-lock.yaml* ./front/
COPY --from=backend ./package.json ./pnpm-lock.yaml* ./backend/
COPY --from=backend src ./backend/src
RUN cd backend && pnpm install --frozen-lockfile
RUN cd front && pnpm install --frozen-lockfile
COPY ./src ./front/src
COPY ./tsconfig.json ./front/
RUN cd front && pnpm run build

###
FROM node:22-alpine as runnner
RUN corepack enable pnpm
WORKDIR /work

ENV NODE_ENV=production


COPY --from=builder /work/front .

COPY ./next.config.js .
COPY ./public ./public

CMD ["./node_modules/next/dist/bin/next", "start"]
