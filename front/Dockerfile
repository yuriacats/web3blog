FROM node:20-alpine3.16 as builder
WORKDIR /work
COPY package*.json ./
RUN npm install --omit=dev
COPY ./src ./src
COPY ./tsconfig.json ./
RUN npm run build

###
FROM node:20-alpine3.16 as runnner
WORKDIR /work

ENV NODE_ENV=develop


COPY --from=builder /work .

COPY ./next.config.js .
COPY ./public ./public
COPY ./.next ./.next

CMD ["./node_modules/next/dist/bin/next", "start"]
