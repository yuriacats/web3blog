FROM node:22-alpine as builder
RUN corepack enable pnpm
WORKDIR /work
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile
COPY src ./src
COPY tsconfig.build.json ./tsconfig.json
COPY babel.config.json ./
RUN pnpm run build

###
FROM node:22-alpine as runnner
RUN corepack enable pnpm
WORKDIR /work

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

COPY --from=builder /work/dist ./dist

CMD ["node", "./dist/index.js"]
