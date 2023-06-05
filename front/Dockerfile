# syntax=docker/dockerfile:1

FROM node:20-alpine3.16 as builder
WORKDIR /work
COPY ./package*.json ./front/
RUN cd front && npm install 
COPY --from=backend ./package*.json ./backend/
COPY --from=backend src ./backend/src
RUN cd backend && npm install
COPY ./src ./front/src
COPY ./tsconfig.json ./front/
RUN cd front && npm run build

###
FROM node:20-alpine3.16 as runnner
WORKDIR /work

ENV NODE_ENV=develop


COPY --from=builder /work/front .

COPY ./next.config.js .
COPY ./public ./public

CMD ["./node_modules/next/dist/bin/next", "start"]
