# Worklog - Sistema de Estoque e Patrimônio de TI

---
Task ID: 1
Agent: main
Task: Explorar estrutura do projeto e planejar implementação

Work Log:
- Lida estrutura do projeto Next.js 16 com shadcn/ui, Prisma, TanStack Query, Zustand
- Identificadas categorias de ativos: Monitor, CPU, Notebook, TV, Rack, Servidor, Impressora, Impressora Térmica Zebra, Smartphone, Telefone Fixo
- Definida arquitetura: Prisma (Ativo + Movimentacao), API routes, frontend com sidebar + dashboard + tabelas

Stage Summary:
- Stack confirmada: Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Prisma SQLite, TanStack Query, Recharts
- Categorias e status definidos como enums em constantes
- Próximo: definir schema Prisma e popular banco

---
Task ID: 2
Agent: main
Task: Transformar sistema em pacote instalável estilo GLPI com MariaDB + login

Work Log:
- Adicionado model User no schema Prisma (SQLite dev + MySQL prod separados)
- Configurado NextAuth.js com CredentialsProvider + bcrypt
- Criado middleware (proxy.ts no Next.js 16) protegendo todas as rotas exceto /login, /install, /api/auth, /api/install
- Criada página /login com UI profissional (logo, toggle de senha, link para instalador)
- Criada página /install com wizard completo estilo GLPI (5 steps: Boas-vindas, Pré-requisitos, Banco de Dados, Admin, Conclusão)
- Criadas APIs do instalador: /api/install/status, /api/install/test-connection (MariaDB), /api/install/init-db (escreve .env + prisma db push + cria admin)
- Criada API /api/setup-first-admin para criar o primeiro admin
- Criadas APIs /api/users (CRUD com validação de role ADMIN)
- Protegidas todas as APIs existentes (ativos, movimentações, stats) com getServerSession
- Criada página /usuarios (admin only) com tabela de usuários, criar/editar/excluir, ativar/desativar
- Adaptado layout principal: UserMenu com avatar + logout, badge de perfil, aba Usuários (admin only)
- Instalado mysql2 para testar conexão MariaDB no instalador
- Criado Dockerfile multi-stage (deps -> build -> runner) com docker-entrypoint.sh
- Criado docker-compose.yml com MariaDB 11 + App
- Criado .env.example com todas as variáveis
- Criado scripts/install.sh (Linux/macOS) - instalação automatizada via terminal
- Criado scripts/install.ps1 (Windows PowerShell) - instalação automatizada
- Criado scripts/patrimonioti.service - systemd unit para Linux
- Criado INSTALL.md - guia completo de instalação (4 métodos)
- Criado README.md - documentação geral do sistema
- Atualizado package.json com scripts de instalação e troca de schema
- Criado .dockerignore

Stage Summary:
- Sistema completo com autenticação e perfis (ADMIN/TECNICO/USUARIO)
- 4 métodos de instalação: Docker, script Linux, script Windows, manual
- Wizard web estilo GLPI funcional em /install
- Ambiente dev (SQLite) preservado para preview
- Ambiente prod (MariaDB) pronto via schema.mysql.prisma
- Validado via Agent Browser: login, dashboard, usuários, logout - tudo funcionando
