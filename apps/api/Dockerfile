FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git
RUN npm install -g pnpm

# Copy workspace configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install

# Build shared types package
RUN pnpm --filter @dishub/types build

# Set dummy DATABASE_URL for build-time Prisma config validation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client
WORKDIR /app/apps/api
RUN pnpm exec prisma generate

# Build TypeScript to Javascript
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
