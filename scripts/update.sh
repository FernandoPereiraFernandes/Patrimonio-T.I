#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

LOGFILE="/tmp/patrimonioti-update.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando atualização..." > "$LOGFILE"

# Detecta automaticamente o gerenciador de pacotes usado no projeto
if [ -f "bun.lockb" ]; then
  PKG="bun"
else
  PKG="npm"
fi
echo "==> Gerenciador detectado: $PKG" >> "$LOGFILE"

echo "==> git fetch" >> "$LOGFILE"
git fetch origin >> "$LOGFILE" 2>&1

echo "==> git pull" >> "$LOGFILE"
git pull origin main >> "$LOGFILE" 2>&1

if [ "$PKG" = "bun" ]; then
  echo "==> bun install" >> "$LOGFILE"
  bun install >> "$LOGFILE" 2>&1

  echo "==> prisma generate" >> "$LOGFILE"
  bunx prisma generate >> "$LOGFILE" 2>&1

  echo "==> prisma db push (aplica alterações de schema)" >> "$LOGFILE"
  bunx prisma db push >> "$LOGFILE" 2>&1

  echo "==> build" >> "$LOGFILE"
  bun run build >> "$LOGFILE" 2>&1
else
  echo "==> npm install" >> "$LOGFILE"
  npm install >> "$LOGFILE" 2>&1

  echo "==> prisma generate" >> "$LOGFILE"
  npx prisma generate >> "$LOGFILE" 2>&1

  echo "==> prisma db push (aplica alterações de schema)" >> "$LOGFILE"
  npx prisma db push >> "$LOGFILE" 2>&1

  echo "==> build" >> "$LOGFILE"
  npm run build >> "$LOGFILE" 2>&1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Atualização concluída. Reinicie o processo (npm run start) para aplicar." >> "$LOGFILE"
