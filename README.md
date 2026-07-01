# 🖥️ PatrimônioTI

**Sistema completo de controle de estoque e patrimônio para o setor de TI**

Inspirado no modelo do GLPI, oferece gestão de ativos de TI (monitores, CPUs, notebooks,
TVs, racks, servidores, impressoras, impressoras térmicas Zebra, smartphones e telefones fixos)
com sistema de autenticação, controle de acesso por perfis, histórico de movimentações e
instalação web automatizada.

![Status](https://img.shields.io/badge/status-produção-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![MariaDB](https://img.shields.io/badge/MariaDB-11-brown)

---

## ✨ Funcionalidades

### 📊 Gestão de Patrimônio
- Cadastro completo de ativos com campos específicos por categoria
- 10 categorias pré-configuradas: Monitor, CPU, Notebook, TV, Rack, Servidor,
  Impressora, Impressora Térmica Zebra, Smartphone, Telefone Fixo
- Controle de status: Em Estoque, Em Uso, Em Manutenção, Descartado
- Atribuição a responsáveis e setores
- Controle de garantia com alertas de vencimento (90 dias)
- Valor de aquisição e total investido
- Especificações técnicas dinâmicas por categoria (RAM, CPU, polegadas, etc)

### 🔄 Movimentações
- Histórico completo de cada ativo (timeline)
- 6 tipos de movimentação: Entrada em Estoque, Atribuição, Devolução,
  Manutenção, Descarte, Transferência
- Atualização automática do status do ativo ao movimentar
- Registro de quem realizou cada operação

### 📈 Dashboard e Relatórios
- Painel com KPIs em tempo real
- Gráficos: ativos por categoria, distribuição por status
- Valor investido por categoria
- Distribuição por setor e localização
- Alertas de garantias vencendo
- Movimentações recentes

### 🔐 Autenticação e Controle de Acesso
- Login com e-mail e senha (NextAuth.js)
- 3 perfis de usuário: **ADMIN**, **TECNICO**, **USUARIO**
- Senhas armazenadas com bcrypt (hash seguro)
- Sessões JWT com expiração de 8 horas
- Proteção de rotas e APIs por perfil

### 🚀 Instalação Automatizada
- **Wizard web** estilo GLPI em `/install`
- **Script bash** para Linux/macOS (`scripts/install.sh`)
- **Script PowerShell** para Windows (`scripts/install.ps1`)
- **Docker Compose** com MariaDB embutido
- Detecção automática do banco de dados
- Criação automática das tabelas
- Criação do admin inicial

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Charts | Recharts |
| Backend | API Routes do Next.js |
| Banco de Dados | MariaDB 11 (produção) / SQLite (desenvolvimento) |
| ORM | Prisma 6 |
| Auth | NextAuth.js v4 + bcrypt |
| Estado | TanStack Query (server), Zustand (client) |
| Runtime | Bun (recomendado) ou Node.js 18+ |

---

## 📦 Instalação Rápida

> 📖 Para métodos detalhados, consulte o **[INSTALL.md](./INSTALL.md)**.

### Opção A: Docker (recomendado)

```bash
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti
cp .env.example .env  # edite senhas
docker compose up -d --build
# Acesse http://localhost:3000/install
```

### Opção B: Script Linux

```bash
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti
chmod +x scripts/install.sh
./scripts/install.sh
```

### Opção C: Desenvolvimento local (SQLite)

```bash
git clone https://github.com/sua-empresa/patrimonioti.git
cd patrimonioti
bun install
cp .env.example .env  # ajuste para SQLite se necessário
bun run db:push
bun run prisma/seed.ts  # cria 30 ativos de exemplo + 2 usuários
bun run dev
```

**Credenciais de desenvolvimento:**
- Admin: `admin@patrimonio.ti` / `admin123`
- Técnico: `roberto.mendes@patrimonio.ti` / `tecnico123`

---

## 👤 Perfis de Acesso

| Perfil | Ver | Criar/Editar | Excluir | Gerenciar Usuários |
|--------|:---:|:---:|:---:|:---:|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ |
| **TECNICO** | ✅ | ✅ | ❌ | ❌ |
| **USUARIO** | ✅ | ❌ | ❌ | ❌ |

---

## 📁 Estrutura do Projeto

```
patrimonioti/
├── prisma/
│   ├── schema.prisma              # Schema SQLite (desenvolvimento)
│   ├── schema.mysql.prisma        # Schema MySQL/MariaDB (produção)
│   └── seed.ts                    # Dados de exemplo
├── src/
│   ├── app/
│   │   ├── page.tsx               # Dashboard principal
│   │   ├── login/page.tsx         # Tela de login
│   │   ├── install/page.tsx       # Instalador web (wizard)
│   │   ├── usuarios/page.tsx      # Gerenciamento de usuários
│   │   └── api/
│   │       ├── auth/[...nextauth] # NextAuth endpoints
│   │       ├── ativos/            # CRUD de ativos + stats
│   │       ├── movimentacoes/     # CRUD de movimentações
│   │       ├── users/             # CRUD de usuários
│   │       └── install/           # APIs do instalador
│   ├── components/
│   │   ├── patrimonio/            # Componentes do domínio
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts                # Config NextAuth
│   │   ├── db.ts                  # Prisma Client
│   │   ├── constants.ts           # Categorias, status, tipos
│   │   ├── types.ts               # Tipos TypeScript
│   │   └── queries.ts             # Hooks React Query
│   └── proxy.ts                   # Middleware de auth (Next.js 16)
├── scripts/
│   ├── install.sh                 # Instalador Linux/macOS
│   ├── install.ps1                # Instalador Windows
│   └── patrimonioti.service       # Systemd service file
├── Dockerfile                     # Imagem de produção
├── docker-compose.yml             # App + MariaDB
├── .env.example                   # Template de configuração
├── INSTALL.md                     # Guia de instalação detalhado
└── README.md                      # Este arquivo
```

---

## 🔄 API Endpoints

### Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|:----:|
| POST | `/api/auth/callback/credentials` | Login | ❌ |
| GET | `/api/auth/session` | Sessão atual | ❌ |
| POST | `/api/auth/signout` | Logout | ✅ |

### Ativos
| Método | Rota | Descrição | Perfil |
|--------|------|-----------|:------:|
| GET | `/api/ativos` | Lista com filtros | Qualquer |
| GET | `/api/ativos/[id]` | Detalhe com histórico | Qualquer |
| GET | `/api/ativos/stats` | Estatísticas do dashboard | Qualquer |
| POST | `/api/ativos` | Cria ativo | ADMIN, TECNICO |
| PUT | `/api/ativos/[id]` | Atualiza ativo | ADMIN, TECNICO |
| DELETE | `/api/ativos/[id]` | Exclui ativo | ADMIN |

### Movimentações
| Method | Route | Description | Perfil |
|--------|-------|-------------|:------:|
| GET | `/api/movimentacoes` | Lista com filtros | Qualquer |
| POST | `/api/movimentacoes` | Registra movimentação | ADMIN, TECNICO |

### Usuários
| Método | Rota | Descrição | Perfil |
|--------|------|-----------|:------:|
| GET | `/api/users` | Lista usuários | ADMIN |
| POST | `/api/users` | Cria usuário | ADMIN |
| PUT | `/api/users/[id]` | Atualiza usuário | ADMIN ou self |
| DELETE | `/api/users/[id]` | Exclui usuário | ADMIN |

### Instalação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|:----:|
| GET | `/api/install/status` | Estado da instalação | ❌ |
| POST | `/api/install/test-connection` | Testa MariaDB | ❌ |
| POST | `/api/install/init-db` | Inicializa banco + admin | ❌ |
| POST | `/api/setup-first-admin` | Cria primeiro admin | ❌ |

---

## 📊 Categorias Suportadas

| Categoria | Ícone | Campos específicos |
|-----------|-------|-------------------|
| Monitor | 🖥️ | Polegadas, Resolução, Tipo de painel, Conexões |
| CPU | 💻 | Processador, RAM, Armazenamento, SO |
| Notebook | 💼 | Processador, RAM, Armazenamento, Tela, SO |
| TV | 📺 | Polegadas, Resolução, Tipo, Smart TV |
| Rack | 🗄️ | Tamanho (U), Largura, Ventilação, Capacidade |
| Servidor | 🗃️ | Processador, RAM, Armazenamento, SO, Função |
| Impressora | 🖨️ | Tipo, Velocidade (ppm), Duplex, Conectividade |
| Impressora Zebra | 🏷️ | Modelo, Resolução (dpi), Largura, Conectividade, Uso |
| Smartphone | 📱 | Armazenamento, RAM, SO, Linha/Operadora |
| Telefone Fixo | ☎️ | Tipo, Ramal, Linhas, Recursos |

---

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Sessões JWT com secret de 64 chars
- ✅ Proteção CSRF nativa do NextAuth
- ✅ Middleware de proteção em todas as rotas
- ✅ Validação de input com Zod nas APIs
- ✅ Isolamento por perfil de usuário
- ✅ Cookies HttpOnly

**Recomendações para produção:**
- Use HTTPS (reverse proxy com Nginx/Caddy)
- Gere `NEXTAUTH_SECRET` forte: `openssl rand -hex 32`
- Use usuário MariaDB dedicado (não root)
- Faça backups regulares do banco
- Mantenha o sistema atualizado

---

## 🗺️ Roadmap

- [ ] Exportação para CSV/Excel
- [ ] Importação em massa de ativos
- [ ] API REST documentada (Swagger)
- [ ] App mobile (PWA)
- [ ] Notificações por e-mail (garantia vencendo)
- [ ] Integração com Active Directory/LDAP
- [ ] Auditoria completa (quem alterou o quê)
- [ ] Geração de etiquetas de patrimônio (PDF)

---

## 📄 Licença

MIT License — sinta-se livre para usar, modificar e distribuir.

---

## 🙏 Créditos

Desenvolvido para o setor de TI. Inspirado no modelo de instalação do [GLPI](https://glpi-project.org/).
Componentes UI por [shadcn/ui](https://ui.shadcn.com/). Ícones por [Lucide](https://lucide.dev/).

---

**Para instruções completas de instalação, consulte o [INSTALL.md](./INSTALL.md).**
