# --- Multi-Stage Dockerfile for CampusGrid (Next.js Frontend) ---

# 1. Base Setup
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./

# 2. Dependencies
FROM base AS dependencies
RUN npm install
COPY . .

# 3. Target Stage: Testing Environment
FROM dependencies AS testing-env
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 4. Production Builder
FROM dependencies AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 5. Target Stage: Staging Environment
FROM base AS staging-env
ENV NODE_ENV=staging
ENV PORT=3000
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]

# 6. Target Stage: Production Environment
FROM base AS production-env
ENV NODE_ENV=production
ENV PORT=3000
USER node
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
