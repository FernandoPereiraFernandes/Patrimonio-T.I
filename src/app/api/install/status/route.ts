import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/install/status
// Retorna o estado da instalação: se o sistema já tem usuários e o status da conexão com DB
export async function GET() {
  try {
    let usuariosCount = 0;
    let ativosCount = 0;
    let dbOk = true;
    let dbError: string | null = null;

    try {
      usuariosCount = await db.user.count();
      ativosCount = await db.ativo.count();
    } catch (e) {
      dbOk = false;
      dbError = e instanceof Error ? e.message : "Erro desconhecido";
    }

    return NextResponse.json({
      instalado: usuariosCount > 0,
      usuariosCount,
      ativosCount,
      dbOk,
      dbError,
      databaseUrl: process.env.DATABASE_URL
        ? maskUrl(process.env.DATABASE_URL)
        : null,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        instalado: false,
        error: error instanceof Error ? error.message : "Erro",
      },
      { status: 500 }
    );
  }
}

function maskUrl(url: string): string {
  // Esconde a senha da URL para exibição segura
  return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, "$1****$2");
}
