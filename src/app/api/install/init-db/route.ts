import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { join } from "path";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const execAsync = promisify(exec);

// POST /api/install/init-db
// Configura o ambiente: escreve .env com MariaDB, roda prisma db push, cria admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const schema = z.object({
      host: z.string().min(1),
      porta: z.number().int().min(1).max(65535),
      usuario: z.string().min(1),
      senha: z.string(),
      banco: z.string().min(1),
      adminNome: z.string().min(3),
      adminEmail: z.string().email(),
      adminSenha: z.string().min(6),
      nextauthSecret: z.string().min(10),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const {
      host,
      porta,
      usuario,
      senha,
      banco,
      adminNome,
      adminEmail,
      adminSenha,
      nextauthSecret,
    } = parsed.data;

    // 1. Construir DATABASE_URL para MariaDB
    const senhaUrl = senha ? encodeURIComponent(senha) : "";
    const databaseUrl = `mysql://${usuario}${senhaUrl ? ":" + senhaUrl : ""}@${host}:${porta}/${banco}`;

    // 2. Escrever arquivo .env
    const envContent = `# PatrimônioTI - Configuração gerada pelo instalador
# Gerado em: ${new Date().toISOString()}

# Banco de dados (MariaDB/MySQL)
DATABASE_URL="${databaseUrl}"

# NextAuth
NEXTAUTH_SECRET="${nextauthSecret}"
NEXTAUTH_URL="http://localhost:3000"

# Aplicação
NODE_ENV="production"
`;

    const envPath = join(process.cwd(), ".env");
    await writeFile(envPath, envContent, "utf-8");

    // 3. Copiar schema.mysql.prisma para schema.prisma (temporário)
    // Em produção, o instalador troca o schema para usar MySQL
    const schemaMysqlPath = join(process.cwd(), "prisma", "schema.mysql.prisma");
    const schemaPath = join(process.cwd(), "prisma", "schema.prisma");

    const fs = await import("fs/promises");
    const schemaMysqlContent = await fs.readFile(schemaMysqlPath, "utf-8");
    // Backup do schema SQLite atual
    await fs.writeFile(
      join(process.cwd(), "prisma", "schema.sqlite.bak.prisma"),
      await fs.readFile(schemaPath, "utf-8")
    );
    await fs.writeFile(schemaPath, schemaMysqlContent, "utf-8");

    // 4. Rodar prisma generate + db push
    try {
      await execAsync("bun run db:generate", { cwd: process.cwd() });
      await execAsync("bun run db:push --accept-data-loss", {
        cwd: process.cwd(),
        timeout: 60000,
      });
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: `Erro ao inicializar tabelas: ${
            e instanceof Error ? e.message : String(e)
          }`,
          step: "prisma",
        },
        { status: 500 }
      );
    }

    // 5. Criar usuário ADMIN
    // Recriar a conexão do Prisma (já que o .env mudou) - em runtime, o Prisma Client
    // já vai usar a nova URL após o generate. Em produção isso funciona pois o processo
    // reinicia. Para o instalador em runtime, usamos query direta no mysql2.
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection({
      host,
      port: porta,
      user: usuario,
      password: senha,
      database: banco,
    });

    try {
      const senhaHash = await bcrypt.hash(adminSenha, 10);
      const id = `c${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      await conn.query(
        `INSERT INTO User (id, nome, email, senha, role, ativo, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'ADMIN', true, NOW(), NOW())`,
        [id, adminNome, adminEmail.toLowerCase(), senhaHash]
      );
    } finally {
      await conn.end();
    }

    return NextResponse.json({
      ok: true,
      message: "Sistema instalado com sucesso!",
      databaseUrl: databaseUrl.replace(/:[^@]+@/, ":****@"),
      adminEmail,
    });
  } catch (error) {
    console.error("Erro na inicialização:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Erro interno na instalação",
      },
      { status: 500 }
    );
  }
}
