# ==========================================
# Stage 1: Build Frontend Assets & Server Bundle
# ==========================================
FROM oven/bun:alpine AS builder
WORKDIR /app

# Cache all dependencies (including devDependencies)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code, build client SPA and pre-bundle server
COPY . .
RUN bun run build
RUN bun build server/index.ts --target bun --outfile dist-server/index.js

# ==========================================
# Stage 2: Production Runner (Ultra Lightweight)
# ==========================================
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production server dependencies only
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy compiled frontend dist and bundled server JS
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 8080

# Run standalone Socket.io server JS bundle with Bun runtime
CMD ["bun", "run", "dist-server/index.js"]
