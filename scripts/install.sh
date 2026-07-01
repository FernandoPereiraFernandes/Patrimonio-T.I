#!/bin/bash
# ============================================================
# PatrimônioTI - Script de Instalação Automatizada (Linux/macOS)
# ============================================================
# Uso:
#   chmod +x scripts/install.sh
#   ./scripts/install.sh
#
# Este script:
#   1. Verifica pré-requisitos (Node.js, npm/bun)
#   2. Solicita dados do MariaDB
#   3. Testa conexão
#   4. Configura .env
#   5. Instala dependências
#   6. Cria as tabelas no banco
#   7. Cria usuário admin inicial
#   8. (Opcional) Inicia o sistema
# ============================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn()  { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error() { echo -e "${RED}[ERRO]${NC} $1"; }
info()  { echo -e "${BLUE}[INFO]${NC} $1"; }

echo ""
echo "============================================================"
echo "  PatrimônioTI - Instalação Automatizada"
echo "  Sistema de Controle de Estoque e Patrimônio de TI"
echo "============================================================"
echo ""

# ===== Verificação de pré-requisitos =====
log "Verificando pré-requisitos..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    log "Node.js encontrado: $NODE_VERSION"
else
    error "Node.js não encontrado. Instale a versão 18+ de https://nodejs.org"
    exit 1
fi

# Bun (opcional) ou npm
if command -v bun &> /dev/null; then
    PKG_MGR="bun"
    log "Bun encontrado - será usado para instalação."
elif command -v npm &> /dev/null; then
    PKG_MGR="npm"
    log "npm encontrado - será usado para instalação."
else
    error "Nem bun nem npm encontrados. Instale um dos dois."
    exit 1
fi

# MariaDB/MySQL client (opcional, mas recomendado)
if command -v mysql &> /dev/null; then
    log "Cliente MySQL/MariaDB encontrado."
else
    warn "Cliente 'mysql' não encontrado no PATH. Recomendado para diagnóstico."
fi

echo ""
log "Pré-requisitos OK!"
echo ""

# ===== Coleta de dados do banco =====
echo "------------------------------------------------------------"
echo "  Configuração do Banco de Dados MariaDB/MySQL"
echo "------------------------------------------------------------"
echo ""

read -p "Host do MariaDB [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Porta [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Usuário do banco [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Senha do banco: " DB_PASSWORD
echo ""

read -p "Nome do banco de dados [patrimonioti]: " DB_NAME
DB_NAME=${DB_NAME:-patrimonioti}

echo ""
read -p "Criar o banco '$DB_NAME' se não existir? (s/N): " CRIAR_BANCO
CRIAR_BANCO=${CRIAR_BANCO:-n}

if [[ "$CRIAR_BANCO" =~ ^[sS]$ ]]; then
    log "Criando banco '$DB_NAME' se necessário..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e \
        "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
        2>/dev/null && log "Banco criado/confirmado." || {
            error "Falha ao criar banco. Verifique credenciais e permissões."
            exit 1
        }
fi

# Testar conexão
log "Testando conexão com o banco..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE \`$DB_NAME\`; SELECT 1;" &>/dev/null; then
    log "Conexão bem-sucedida!"
else
    error "Não foi possível conectar ao banco. Verifique as credenciais."
    exit 1
fi

echo ""
echo "------------------------------------------------------------"
echo "  Conta de Administrador"
echo "------------------------------------------------------------"
echo ""

read -p "Nome do administrador: " ADMIN_NOME
ADMIN_NOME=${ADMIN_NOME:-Administrador}

read -p "E-mail do administrador: " ADMIN_EMAIL
if [[ -z "$ADMIN_EMAIL" ]]; then
    error "E-mail é obrigatório."
    exit 1
fi

read -s -p "Senha do administrador (mínimo 6 caracteres): " ADMIN_PASSWORD
echo ""
if [[ ${#ADMIN_PASSWORD} -lt 6 ]]; then
    error "Senha muito curta."
    exit 1
fi

read -s -p "Confirmar senha: " ADMIN_PASSWORD_CONFIRM
echo ""
if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]]; then
    error "Senhas não conferem."
    exit 1
fi

# ===== Gerar NEXTAUTH_SECRET =====
NEXTAUTH_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# ===== Escrever .env =====
log "Escrevendo arquivo .env..."

# Escapar senha para URL
DB_PASSWORD_ENC=$(node -e "console.log(encodeURIComponent('$DB_PASSWORD'))")

cat > .env <<EOF
# PatrimônioTI - Configuração gerada em $(date)
# Banco de Dados (MariaDB/MySQL)
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD_ENC}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# NextAuth
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# Aplicação
NODE_ENV="production"
EOF

log "Arquivo .env criado."

# ===== Trocar schema para MySQL =====
log "Trocando schema Prisma para MySQL..."
if [ -f "prisma/schema.mysql.prisma" ]; then
    cp prisma/schema.prisma prisma/schema.sqlite.bak.prisma 2>/dev/null || true
    cp prisma/schema.mysql.prisma prisma/schema.prisma
    log "Schema MySQL ativado."
else
    error "Arquivo prisma/schema.mysql.prisma não encontrado."
    exit 1
fi

# ===== Instalar dependências =====
log "Instalando dependências..."
if [ "$PKG_MGR" = "bun" ]; then
    bun install
else
    npm install
fi

# ===== Gerar Prisma Client =====
log "Gerando Prisma Client..."
$PKG_MGR run db:generate || npx prisma generate

# ===== Criar tabelas =====
log "Criando tabelas no banco de dados..."
$PKG_MGR run db:push --accept-data-loss || npx prisma db push --accept-data-loss

# ===== Criar admin =====
log "Criando usuário administrador..."

HASH=$(node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$ADMIN_PASSWORD', 10);
console.log(hash);
" 2>/dev/null)

if [ -z "$HASH" ]; then
    warn "Não foi possível gerar hash via node. Tentando via mysql..."
    warn "Pule a criação do admin e use a interface web em /install."
else
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e \
        "INSERT INTO User (id, nome, email, senha, role, ativo, createdAt, updatedAt) VALUES (LOWER(REPLACE(UUID(),'-','')), '$ADMIN_NOME', LOWER('$ADMIN_EMAIL'), '$HASH', 'ADMIN', 1, NOW(), NOW());" \
        2>/dev/null && log "Administrador criado: $ADMIN_EMAIL" || warn "Falha ao criar admin (talvez já exista). Use a interface web."
fi

# ===== Concluído =====
echo ""
echo "============================================================"
echo -e "${GREEN}  INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo "============================================================"
echo ""
echo "  Banco de dados: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "  Administrador:  ${ADMIN_EMAIL}"
echo "  Perfil:         ADMIN (acesso total)"
echo ""
echo "  Para iniciar o sistema:"
if [ "$PKG_MGR" = "bun" ]; then
    echo "    bun run build && bun run start"
else
    echo "    npm run build && npm run start"
fi
echo ""
echo "  Acesse: http://localhost:3000"
echo ""
echo "  Em produção, considere:"
echo "    - Configurar HTTPS (reverse proxy com Nginx/Caddy)"
echo "    - Alterar NEXTAUTH_URL no .env para a URL pública"
echo "    - Configurar systemd ou PM2 para manter o serviço ativo"
echo ""
