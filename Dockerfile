# Dockerfile para o PatrimônioTI
# Build multi-stage para imagem final enxuta

# ============ ESTÁGIO 1: Dependências ============
FROM node:20-slim AS deps
WORKDIR /app

# Instalar bun
RUN npm install -g bun

# Copiar manifestos
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Instalar dependências
RUN bun install --frozen-lockfile || bun install

# Gerar Prisma Client
RUN bun run db:generate || npx prisma generate

# ============ ESTÁGIO 2: Build ============
FROM node:20-slim AS builder
WORKDIR /app

RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Usar schema MySQL na imagem de produção
RUN cp prisma/schema.mysql.prisma prisma/schema.prisma

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build do Next.js (gera .next/standalone)
RUN bun run build

# ============ ESTÁGIO 3: Runner ============
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Instalar apenas o necessário para runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar artefatos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Script de entrada que roda prisma db push antes de iniciar
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/install/status || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
