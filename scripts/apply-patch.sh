#!/bin/bash
# Uso: apply-patch.sh <caminho-do-zip>
#
# Aplica um patch PARCIAL (zip contendo só os arquivos que mudaram) por cima
# do projeto, reinstala dependências se necessário, roda migrations do
# Prisma, recompila e reinicia o serviço via systemd --user (sem sudo).

set -euo pipefail
cd "$(dirname "$0")/.."
REPO_DIR="$(pwd)"

ZIP_PATH="${1:-}"
LOGFILE="/tmp/patrimonioti-patch.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOGFILE"; }

: > "$LOGFILE"
log "Iniciando aplicação de patch: $ZIP_PATH"

if [ -z "$ZIP_PATH" ] || [ ! -f "$ZIP_PATH" ]; then
  log "ERRO: arquivo zip não encontrado: $ZIP_PATH"
  exit 1
fi

# ---- Validação anti path-traversal (zip-slip) ----
log "Validando conteúdo do zip (procurando caminhos suspeitos)..."
if unzip -Z1 "$ZIP_PATH" | grep -E '(^/|(^|/)\.\.(/|$))' >/dev/null; then
  log "ERRO: o zip contém caminhos absolutos ou '../'. Abortado por segurança."
  exit 1
fi

STAGING=$(mktemp -d)
trap 'rm -rf "$STAGING"' EXIT

log "Extraindo para área temporária ($STAGING)..."
unzip -o -q "$ZIP_PATH" -d "$STAGING" >> "$LOGFILE" 2>&1

# ---- Aplica por cima do projeto, preservando o que não deve ser tocado ----
log "Aplicando arquivos sobre o projeto (rsync)..."
rsync -a \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude '.env' \
  --exclude 'updates/' \
  "$STAGING"/ "$REPO_DIR"/ >> "$LOGFILE" 2>&1

# ---- Detecta gerenciador de pacotes ----
if [ -f "$REPO_DIR/bun.lockb" ]; then PKG="bun"; else PKG="npm"; fi
log "Gerenciador detectado: $PKG"

if [ "$PKG" = "bun" ]; then
  log "==> bun install"; bun install >> "$LOGFILE" 2>&1
  log "==> prisma generate"; bunx prisma generate >> "$LOGFILE" 2>&1
  log "==> prisma db push"; bunx prisma db push >> "$LOGFILE" 2>&1
  log "==> build"; bun run build >> "$LOGFILE" 2>&1
else
  log "==> npm install"; npm install >> "$LOGFILE" 2>&1
  log "==> prisma generate"; npx prisma generate >> "$LOGFILE" 2>&1
  log "==> prisma db push"; npx prisma db push >> "$LOGFILE" 2>&1
  log "==> build"; npm run build >> "$LOGFILE" 2>&1
fi

# ---- Reinicia o serviço (systemd de usuário, sem sudo) ----
log "Reiniciando serviço via systemd --user..."
if systemctl --user restart patrimonioti.service >> "$LOGFILE" 2>&1; then
  log "Serviço reiniciado com sucesso."
else
  log "AVISO: não consegui reiniciar via systemctl --user (o serviço está configurado?). Reinicie manualmente."
fi

# ---- Arquiva o zip aplicado (auditoria) ----
mkdir -p "$REPO_DIR/updates/applied"
mv "$ZIP_PATH" "$REPO_DIR/updates/applied/$(date +%Y%m%d-%H%M%S)-$(basename "$ZIP_PATH")" 2>/dev/null || true

log "Patch concluído com sucesso."
