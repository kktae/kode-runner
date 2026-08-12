# ==========================================
# Stage 1: Build Frontend Assets & Prepare
# ==========================================
FROM oven/bun:latest AS builder
WORKDIR /app

# Cache dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code and build client SPA
COPY . .
RUN bun run build

# ==========================================
# Stage 2: Production Runner (Optimized)
# ==========================================
FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy compiled dist and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 8080

# Run standalone Socket.io server with Bun runtime
CMD ["bun", "run", "server/index.ts"]
