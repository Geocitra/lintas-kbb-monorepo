FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install

# Build shared types package
RUN pnpm --filter @dishub/types build

# Build React app
WORKDIR /app/apps/web
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
