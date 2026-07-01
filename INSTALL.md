# 📦 Guia de Instalação — PatrimônioTI

Sistema completo de controle de estoque e patrimônio para o setor de TI.
Inspirado no modelo de instalação do **GLPI**, oferece instalação via interface web
ou via script de linha de comando.

---

## 📋 Pré-requisitos

| Componente | Versão mínima | Observação |
|------------|---------------|------------|
| **Node.js** | 18+ | Recomendado 20+ |
| **Bun** (opcional) | 1.0+ | Mais rápido que npm |
| **MariaDB** | 10.6+ | Ou MySQL 8+ |
| **RAM** | 1 GB | Mínimo para produção |
| **Disco** | 5 GB | Para app + banco + logs |

---

## 🚀 Métodos de Instalação

Escolha **UM** dos métodos abaixo:

### Método 1: Docker Compose (mais rápido) ⭐ Recomendado

Levanta o PatrimônioTI + MariaDB em containers isolados com 1 comando.

```bash
# 1. Clone o projeto
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti

# 2. Configure variáveis (opcional - tem defaults)
cp .env.example .env
nano .env  # ajuste senhas e NEXTAUTH_SECRET

# 3. Suba os containers
docker compose up -d --build

# 4. Acesse o instalador web
# http://localhost:3000/install
```

Após a instalação via web, o sistema estará disponível em `http://localhost:3000`.

**Comandos úteis Docker:**
```bash
docker compose logs -f app        # ver logs da aplicação
docker compose logs -f mariadb    # ver logs do banco
docker compose restart app        # reiniciar app
docker compose down               # parar tudo
docker compose up -d --build      # rebuild após atualização
```

---

### Método 2: Script automatizado (Linux/macOS)

Instalação via terminal, ideal para servidores Linux sem Docker.

```bash
# 1. Instale o MariaDB no servidor (ex: Ubuntu/Debian)
sudo apt update
sudo apt install -y mariadb-server mariadb-client
sudo systemctl enable --now mariadb
sudo mysql_secure_installation

# 2. Clone o projeto
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti

# 3. Rode o instalador
chmod +x scripts/install.sh
./scripts/install.sh
```

O script vai pedir interativamente:
- Host, porta, usuário e senha do MariaDB
- Nome do banco (cria automaticamente se não existir)
- Nome, e-mail e senha do admin

Após concluir:

```bash
# Build de produção
bun run build
# ou: npm run build

# Iniciar (use systemd ou PM2 para manter ativo)
bun run start
# ou: npm run start
```

---

### Método 3: Script automatizado (Windows PowerShell)

```powershell
# 1. Instale MariaDB: https://mariadb.org/download/
# 2. Clone o projeto
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti

# 3. Rode o instalador como Administrador
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

---

### Método 4: Instalação manual passo-a-passo

Para casos onde você quer controle total.

#### 4.1. Preparar o banco MariaDB

```sql
-- Conecte como root
mysql -u root -p

-- Criar banco
CREATE DATABASE patrimonioti
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Criar usuário da aplicação
CREATE USER 'patrimonioti'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON patrimonioti.* TO 'patrimonioti'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4.2. Baixar e configurar o projeto

```bash
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com as configurações
nano .env
```

**Conteúdo do `.env`:**
```bash
# Banco de dados
DATABASE_URL="mysql://patrimonioti:senha_forte_aqui@localhost:3306/patrimonioti"

# Gere um secret forte: openssl rand -hex 32
NEXTAUTH_SECRET="seu_secret_aleatorio_de_64_caracteres_hex"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="production"
```

#### 4.3. Ativar schema MySQL

```bash
# Fazer backup do schema SQLite (desenvolvimento)
cp prisma/schema.prisma prisma/schema.sqlite.bak.prisma

# Ativar schema MySQL
cp prisma/schema.mysql.prisma prisma/schema.prisma
```

#### 4.4. Instalar dependências e criar tabelas

```bash
# Instalar dependências
bun install
# ou: npm install

# Gerar Prisma Client
bun run db:generate
# ou: npx prisma generate

# Criar tabelas no banco
bun run db:push --accept-data-loss
# ou: npx prisma db push --accept-data-loss
```

#### 4.5. Criar o admin inicial

**Opção A** — Via instalador web (recomendado):
```bash
# Iniciar o servidor
bun run dev
# Acessar http://localhost:3000/install
# Seguir o wizard
```

**Opção B** — Via API direta:
```bash
curl -X POST http://localhost:3000/api/setup-first-admin \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@empresa.com","senha":"senha_forte"}'
```

#### 4.6. Build de produção

```bash
bun run build
bun run start
# ou: npm run build && npm run start
```

#### 4.7. Configurar como serviço (systemd)

```bash
# Copiar service file
sudo cp scripts/patrimonioti.service /etc/systemd/system/

# Editar caminhos conforme sua instalação
sudo nano /etc/systemd/system/patrimonioti.service

# Ativar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable --now patrimonioti

# Verificar status
sudo systemctl status patrimonioti
sudo journalctl -u patrimonioti -f
```

---

## 🔐 Credenciais Padrão (após instalação)

> ⚠️ **IMPORTANTE:** Troque estas senhas imediatamente após instalar!

### Desenvolvimento (seed)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `admin@patrimonio.ti` | `admin123` | ADMIN |
| `roberto.mendes@patrimonio.ti` | `tecnico123` | TECNICO |

### Produção

Definidas durante a instalação (script ou wizard web).

---

## 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|------------|
| **ADMIN** | Acesso total: cadastra/edita/exclui ativos, movimenta, gerencia usuários |
| **TECNICO** | Cadastra e edita ativos, registra movimentações |
| **USUARIO** | Apenas visualização (consulta) |

---

## 🛠️ Operações Pós-Instalação

### Backup do banco

```bash
# Backup completo
mysqldump -u patrimonioti -p patrimonioti > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u patrimonioti -p patrimonioti < backup_20241201.sql
```

### Atualizar o sistema

```bash
cd /opt/patrimonioti
git pull origin main
bun install
bun run db:push --accept-data-loss
bun run build
sudo systemctl restart patrimonioti
```

### Resetar senha de admin (emergência)

```bash
# Gerar hash de uma nova senha
node -e "const b=require('bcryptjs');console.log(b.hashSync('nova_senha',10))"

# Atualizar no banco
mysql -u patrimonioti -p patrimonioti -e \
  "UPDATE User SET senha='HASH_GERADO' WHERE email='admin@empresa.com';"
```

---

## 🌐 Configurar HTTPS (Reverse Proxy)

### Nginx

```nginx
server {
    listen 80;
    server_name patrimonio.suaempresa.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name patrimonio.suaempresa.com.br;

    ssl_certificate /etc/letsencrypt/live/patrimonio.suaempresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/patrimonio.suaempresa.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Após configurar, atualize `.env`:
```bash
NEXTAUTH_URL="https://patrimonio.suaempresa.com.br"
```

### Caddy (mais simples, HTTPS automático)

```
patrimonio.suaempresa.com.br {
    reverse_proxy localhost:3000
}
```

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se MariaDB está rodando: `sudo systemctl status mariadb`
- Teste a conexão: `mysql -u usuario -p -h host banco`
- Confira a `DATABASE_URL` no `.env`

### Erro: "NEXTAUTH_SECRET is missing"
- Gere um secret: `openssl rand -hex 32`
- Adicione ao `.env`: `NEXTAUTH_SECRET="..."`

### Esqueci a senha de admin
- Use o comando de reset na seção "Operações Pós-Instalação"

### O instalador web não cria o admin
- Verifique logs: `journalctl -u patrimonioti -f`
- Veja se o schema MySQL está ativo: `cat prisma/schema.prisma | grep provider`
  - Deve ser `provider = "mysql"`, não `"sqlite"`
- Tente criar via CLI: `curl -X POST http://localhost:3000/api/setup-first-admin ...`

### Porta 3000 ocupada
- Edite `.env`: adicione `PORT=3001`
- Ou systemd: `Environment=PORT=3001`

---

## 📞 Suporte

Em caso de dúvidas, consulte:
- 📖 [README.md](./README.md) — Visão geral do sistema
- 🐛 [Issues](https://github.com/sua-empresa/patrimonioti/issues) — Reportar bugs

---

**PatrimônioTI v1.0.0** · Sistema desenvolvido para o setor de TI
