import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/categorias/public
// Lista pública de categorias ativas (para formulários, sem exigir auth)
export async function GET() {
  try {
    const categorias = await db.categoria.findMany({
      where: { ativa: true },
      orderBy: [{ builtin: "desc" }, { label: "asc" }],
    });

    const result = categorias.map((c) => ({
      ...c,
      campos: JSON.parse(c.campos || "[]"),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao listar categorias públicas:", error);
    return NextResponse.json(
      { error: "Erro ao carregar categorias" },
      { status: 500 }
    );
  }
}
