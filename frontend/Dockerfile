# ─────────────────────────────────────────────
# Stage 1: Build the React/Vite app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

RUN npm ci

# Copy the rest of the source code
COPY . .

# ── Build-time environment variable ─────────────────────────
# VITE_API_URL is baked into the JS bundle at build time by Vite.
# Pass it when building the image:
#   docker build --build-arg VITE_API_URL=https://api.yourdomain.com/api .
# If not provided, falls back to the value in .env.production
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the production bundle (Vite reads VITE_* env vars automatically)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx (lightweight)
# ─────────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (handles SPA routing + gzip + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
