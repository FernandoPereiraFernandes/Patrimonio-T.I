# ============================================================
# PatrimônioTI - Script de Instalação (Windows PowerShell)
# ============================================================
# Uso:
#   1. Abra o PowerShell como Administrador
#   2. Execute: powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
#
# Este script:
#   1. Verifica pré-requisitos (Node.js)
#   2. Solicita dados do MariaDB
#   3. Testa conexão
#   4. Configura .env
#   5. Instala dependências
#   6. Cria as tabelas no banco
#   7. Cria usuário admin inicial
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Log($msg) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[AVISO] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERRO] $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Blue }

Write-Host ""
Write-Host "============================================================"
Write-Host "  PatrimônioTI - Instalação Automatizada (Windows)"
Write-Host "  Sistema de Controle de Estoque e Patrimônio de TI"
Write-Host "============================================================"
Write-Host ""

# ===== Verificação de pré-requisitos =====
Write-Log "Verificando pré-requisitos..."

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Err "Node.js não encontrado. Instale a versão 18+ de https://nodejs.org"
    exit 1
}
$nodeVersion = node -v
Write-Log "Node.js encontrado: $nodeVersion"

if (Get-Command bun -ErrorAction SilentlyContinue) {
    $pkgMgr = "bun"
    Write-Log "Bun encontrado - será usado para instalação."
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $pkgMgr = "npm"
    Write-Log "npm encontrado - será usado para instalação."
} else {
    Write-Err "Nem bun nem npm encontrados. Instale um dos dois."
    exit 1
}

if (Get-Command mysql -ErrorAction SilentlyContinue) {
    Write-Log "Cliente MySQL/MariaDB encontrado."
} else {
    Write-Warn "Cliente 'mysql' não encontrado no PATH. Recomendado para diagnóstico."
}

Write-Host ""
Write-Log "Pré-requisitos OK!"
Write-Host ""

# ===== Coleta de dados do banco =====
Write-Host "------------------------------------------------------------"
Write-Host "  Configuração do Banco de Dados MariaDB/MySQL"
Write-Host "------------------------------------------------------------"
Write-Host ""

$DB_HOST = Read-Host "Host do MariaDB [localhost]"
if (!$DB_HOST) { $DB_HOST = "localhost" }

$DB_PORT = Read-Host "Porta [3306]"
if (!$DB_PORT) { $DB_PORT = "3306" }

$DB_USER = Read-Host "Usuário do banco [root]"
if (!$DB_USER) { $DB_USER = "root" }

$DB_PASSWORD = Read-Host "Senha do banco" -AsSecureString
$DB_PASSWORDPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)

$DB_NAME = Read-Host "Nome do banco de dados [patrimonioti]"
if (!$DB_NAME) { $DB_NAME = "patrimonioti" }

$criarBanco = Read-Host "Criar o banco '$DB_NAME' se não existir? (s/N)"
if ($criarBanco -eq "s" -or $criarBanco -eq "S") {
    Write-Log "Criando banco '$DB_NAME'..."
    $env:MYSQL_PWD = $DB_PASSWORDPlain
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Banco criado/confirmado."
    } else {
        Write-Err "Falha ao criar banco. Verifique credenciais e permissões."
        exit 1
    }
}

# Testar conexão
Write-Log "Testando conexão com o banco..."
$env:MYSQL_PWD = $DB_PASSWORDPlain
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "USE \`$DB_NAME\`; SELECT 1;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Log "Conexão bem-sucedida!"
} else {
    Write-Err "Não foi possível conectar ao banco. Verifique as credenciais."
    exit 1
}

Write-Host ""
Write-Host "------------------------------------------------------------"
Write-Host "  Conta de Administrador"
Write-Host "------------------------------------------------------------"
Write-Host ""

$ADMIN_NOME = Read-Host "Nome do administrador"
if (!$ADMIN_NOME) { $ADMIN_NOME = "Administrador" }

$ADMIN_EMAIL = Read-Host "E-mail do administrador"
if (!$ADMIN_EMAIL) {
    Write-Err "E-mail é obrigatório."
    exit 1
}

$ADMIN_PASSWORD = Read-Host "Senha do administrador (mínimo 6 caracteres)" -AsSecureString
$ADMIN_PASSWORDPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ADMIN_PASSWORD)
)
if ($ADMIN_PASSWORDPlain.Length -lt 6) {
    Write-Err "Senha muito curta."
    exit 1
}

$ADMIN_PASSWORD_CONFIRM = Read-Host "Confirmar senha" -AsSecureString
$ADMIN_PASSWORD_CONFIRMPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ADMIN_PASSWORD_CONFIRM)
)
if ($ADMIN_PASSWORDPlain -ne $ADMIN_PASSWORD_CONFIRMPlain) {
    Write-Err "Senhas não conferem."
    exit 1
}

# ===== Gerar NEXTAUTH_SECRET =====
$NEXTAUTH_SECRET = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })

# ===== Escrever .env =====
Write-Log "Escrevendo arquivo .env..."

# Escapar senha para URL
$DB_PASSWORD_ENC = [uri]::EscapeDataString($DB_PASSWORDPlain)

$envContent = @"
# PatrimônioTI - Configuração gerada em $(Get-Date)
# Banco de Dados (MariaDB/MySQL)
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD_ENC}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# NextAuth
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# Aplicação
NODE_ENV="production"
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Log "Arquivo .env criado."

# ===== Trocar schema para MySQL =====
Write-Log "Trocando schema Prisma para MySQL..."
if (Test-Path "prisma\schema.mysql.prisma") {
    if (Test-Path "prisma\schema.prisma") {
        Copy-Item "prisma\schema.prisma" "prisma\schema.sqlite.bak.prisma" -Force
    }
    Copy-Item "prisma\schema.mysql.prisma" "prisma\schema.prisma" -Force
    Write-Log "Schema MySQL ativado."
} else {
    Write-Err "Arquivo prisma\schema.mysql.prisma não encontrado."
    exit 1
}

# ===== Instalar dependências =====
Write-Log "Instalando dependências..."
if ($pkgMgr -eq "bun") {
    bun install
} else {
    npm install
}

# ===== Gerar Prisma Client =====
Write-Log "Gerando Prisma Client..."
if ($pkgMgr -eq "bun") {
    bun run db:generate
} else {
    npm run db:generate
}

# ===== Criar tabelas =====
Write-Log "Criando tabelas no banco de dados..."
if ($pkgMgr -eq "bun") {
    bun run db:push --accept-data-loss
} else {
    npx prisma db push --accept-data-loss
}

# ===== Criar admin =====
Write-Log "Criando usuário administrador..."

$hashScript = @"
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$ADMIN_PASSWORDPlain', 10);
console.log(hash);
"@
$HASH = $hashScript | node 2>$null

if ($HASH) {
    $env:MYSQL_PWD = $DB_PASSWORDPlain
    $insertSQL = "INSERT INTO User (id, nome, email, senha, role, ativo, createdAt, updatedAt) VALUES (LOWER(REPLACE(UUID(),'-','')), '$ADMIN_NOME', LOWER('$ADMIN_EMAIL'), '$HASH', 'ADMIN', 1, NOW(), NOW());"
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER $DB_NAME -e $insertSQL 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Administrador criado: $ADMIN_EMAIL"
    } else {
        Write-Warn "Falha ao criar admin. Use a interface web em /install."
    }
} else {
    Write-Warn "Não foi possível gerar hash. Use a interface web em /install."
}

# ===== Concluído =====
Write-Host ""
Write-Host "============================================================"
Write-Host "  INSTALAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "============================================================"
Write-Host ""
Write-Host "  Banco de dados: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
Write-Host "  Administrador:  ${ADMIN_EMAIL}"
Write-Host "  Perfil:         ADMIN (acesso total)"
Write-Host ""
Write-Host "  Para iniciar o sistema:"
if ($pkgMgr -eq "bun") {
    Write-Host "    bun run build"
    Write-Host "    bun run start"
} else {
    Write-Host "    npm run build"
    Write-Host "    npm run start"
}
Write-Host ""
Write-Host "  Acesse: http://localhost:3000"
Write-Host ""
