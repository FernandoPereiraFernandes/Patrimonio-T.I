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

---
Task ID: 3
Agent: main
Task: Corrigir erro CLIENT_FETCH_ERROR do NextAuth + adicionar registro de usuários + categorias dinâmicas

Work Log:
- Reformulado proxy.ts (middleware Next.js 16): removido conflito com next-auth/middleware, usando getToken direto do next-auth/jwt
- Adicionadas rotas públicas no proxy: /login, /registro, /install, /api/auth, /api/install, /api/setup-first-admin, /api/registro, /api/categorias/public
- Corrigida página /login: envolvido useSearchParams em Suspense boundary (necessário no Next.js 16)
- Adicionado botão "Criar nova conta" na página de login (link para /registro)
- Criada página /registro com formulário completo (nome, email, senha, confirmação)
- Criada API /api/registro (POST público) - sempre cria com role USUARIO
- Criada página /categorias (admin only) para gerenciar categorias dinâmicas
- Adicionado model Categoria no Prisma (SQLite + MySQL)
- Criado seed-categorias.ts que popula as 10 categorias padrão como builtin=true
- Criadas APIs: /api/categorias (GET/POST admin), /api/categorias/[id] (PUT/DELETE admin), /api/categorias/public (GET público)
- Atualizado componente CategoryIcon para aceitar iconName override (24 ícones disponíveis)
- Criado hook useCategorias que busca categorias da API pública
- Atualizado asset-form-dialog para usar categorias dinâmicas (DB + ícones customizados)
- Adicionado menu "Categorias" no sidebar (admin only)
- Atualizado schema Prisma SQLite e MySQL com model Categoria
- Validações: admin não pode excluir builtin, não pode desativar builtin, não pode excluir categoria com ativos

Stage Summary:
- ERRO CLIENT_FETCH_ERROR CORRIGIDO: causa era conflito entre proxy function e default export do next-auth/middleware no Next.js 16
- Página de login agora abre corretamente (sem erro de fetch)
- Auto-registro de usuários funcionando em /registro (role USUARIO automático)
- Categorias dinâmicas: admin pode criar/editar/excluir categorias customizadas
- 10 categorias padrão marcadas como builtin (não editáveis/excluíveis)
- Teste curl completo: todas as 11 categorias (10 builtin + 1 TABLET customizada) retornadas
- Lint 100% limpo
