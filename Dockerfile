# --- Multi-Stage Dockerfile for CampusGrid (Next.js Frontend) ---
# Two-server model: both staging and production use port 3000 cleanly.
# Staging API URL vs Production API URL is the only difference — baked in at build time.

# ─────────────────────────────────────────────────────────────────
# Stage 1 — Base: shared Alpine foundation + package manifests
# ─────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS base
WORKDIR /app
COPY package*.json ./

# ─────────────────────────────────────────────────────────────────
# Stage 2 — Dependencies: installs all node_modules (dev + prod)
# ─────────────────────────────────────────────────────────────────
FROM base AS dependencies
RUN rm -f package-lock.json && npm install
COPY . .

# ─────────────────────────────────────────────────────────────────
# Stage 3 — TARGET: testing-env
# Triggered on every push to main. Lightweight dev server — no build.
# Purpose: verify the image compiles and the dev server can start.
# ─────────────────────────────────────────────────────────────────
FROM dependencies AS testing-env
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────────────────────────
# Stage 4 — Builder: compiles Next.js standalone output
# NEXT_PUBLIC_API_URL is injected as a build-arg and baked into
# the JS bundle. It MUST be provided — it cannot be set at runtime.
# ─────────────────────────────────────────────────────────────────
FROM dependencies AS builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─────────────────────────────────────────────────────────────────
# Stage 5 — TARGET: staging-env
# Lean image using Next.js standalone output. Staging API URL baked
# in at build time via --build-arg NEXT_PUBLIC_API_URL=<staging-url>
# ─────────────────────────────────────────────────────────────────
FROM base AS staging-env
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]

# ─────────────────────────────────────────────────────────────────
# Stage 6 — TARGET: production-env
# Identical structure to staging — only the baked API URL differs.
# Built from the same commit SHA as staging after manual approval.
# ─────────────────────────────────────────────────────────────────
FROM base AS production-env
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
