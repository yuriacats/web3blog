
###
FROM node:20-alpine3.16 as builder
WORKDIR /work
COPY package*.json ./

RUN npm install
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

###
FROM node:20-alpine3.16 as runnner
WORKDIR /work

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /work/dist ./dist

CMD ["node", "./dist/index.js"]
