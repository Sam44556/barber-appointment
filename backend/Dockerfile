# ─────────────────────────────────────────────
# Stage 1: Install & Build (NestJS)
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDeps needed for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client, build NestJS, then copy generated folder
# (replaces the Windows-only xcopy in "npm run build")
RUN npx prisma generate && \
    npx nest build && \
    if [ -d "generated" ]; then cp -r generated dist/generated; fi

# ─────────────────────────────────────────────
# Stage 2: Production runtime
# ─────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Only copy production dependency manifests
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy the Prisma client & schema (runtime needs both)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
# Prisma config file — needed at runtime for `prisma migrate deploy`
COPY prisma.config.ts ./prisma.config.ts

# Expose the backend port
EXPOSE 3000

# Run database migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
