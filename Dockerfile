# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install production deps only
RUN npm ci --omit=dev

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy deps from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source
COPY . .

# Persistent volume for SQLite database
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

USER appuser

# Cloud Run / Railway / Fly.io all inject PORT at runtime
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["node", "src/app.js"]
