FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/wa-gateway ./apps/wa-gateway

RUN pnpm install

WORKDIR /app/apps/wa-gateway
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]
