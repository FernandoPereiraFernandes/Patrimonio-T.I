import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { z } from "zod";

// POST /api/install/test-connection
// Testa a conexão com MariaDB/MySQL com as credenciais fornecidas
// Não persiste nada, apenas valida que consegue conectar e (opcionalmente) criar o banco
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const schema = z.object({
      host: z.string().min(1, "Host é obrigatório"),
      porta: z.number().int().min(1).max(65535).default(3306),
      usuario: z.string().min(1, "Usuário é obrigatório"),
      senha: z.string().default(""),
      banco: z.string().min(1, "Nome do banco é obrigatório"),
      criarBanco: z.boolean().default(false),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { host, porta, usuario, senha, banco, criarBanco } = parsed.data;

    // Primeiro conectar sem o banco para poder criá-lo se necessário
    const conn = await mysql.createConnection({
      host,
      port: porta,
      user: usuario,
      password: senha,
      connectTimeout: 8000,
    });

    try {
      // Verificar versão do servidor
      const [rows] = await conn.query("SELECT VERSION() as versao");
      const versao = (rows as { versao: string }[])[0]?.versao ?? "desconhecida";

      if (criarBanco) {
        await conn.query(
          `CREATE DATABASE IF NOT EXISTS \`${banco}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
      }

      // Tentar usar o banco para validar que ele existe
      try {
        await conn.query(`USE \`${banco}\``);
      } catch {
        return NextResponse.json({
          ok: false,
          error: `Banco de dados "${banco}" não existe. Marque a opção "Criar banco automaticamente".`,
          versao,
        });
      }

      // Verificar tabelas existentes
      const [tabelas] = await conn.query(
        `SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = ?`,
        [banco]
      );
      const listaTabelas = (tabelas as { TABLE_NAME: string }[]).map(
        (t) => t.TABLE_NAME
      );

      return NextResponse.json({
        ok: true,
        versao,
        banco,
        tabelas: listaTabelas,
        temTabelas: listaTabelas.length > 0,
      });
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao conectar";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
