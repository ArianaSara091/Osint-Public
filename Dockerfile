FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@10

COPY . .

RUN pnpm install --frozen-lockfile

RUN BASE_PATH=/ PORT=3000 pnpm --filter @workspace/osint-app run build

RUN NODE_ENV=production pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
