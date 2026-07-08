# --- Build stage ---
FROM node:22-alpine AS builder
WORKDIR /app

# Prisma braucht auf Alpine libssl/openssl-Kompatibilitaet.
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat openssl

# Alles uebernehmen (inkl. node_modules), damit prisma-CLId + Init-Skript
# beim Start verfuegbar sind.
COPY --from=builder /app ./

EXPOSE 3000
ENTRYPOINT ["sh", "docker/entrypoint.sh"]
