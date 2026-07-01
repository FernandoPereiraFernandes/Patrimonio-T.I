import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIAS } from "@/lib/constants";

// GET /api/ativos/stats - estatísticas do dashboard
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const [totalAtivos, porStatus, porCategoria, valorAgg, recentes] =
      await Promise.all([
        db.ativo.count(),
        db.ativo.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        db.ativo.groupBy({
          by: ["categoria"],
          _count: { categoria: true },
        }),
        db.ativo.aggregate({ _sum: { valorAquisicao: true } }),
        db.movimentacao.findMany({
          take: 8,
          orderBy: { data: "desc" },
          include: { ativo: true },
        }),
      ]);

    // Garantir que todas as categorias apareçam (mesmo com 0)
    const porCategoriaCompleto = CATEGORIAS.map((c) => {
      const found = porCategoria.find((p) => p.categoria === c.value);
      return {
        categoria: c.value,
        count: found?._count.categoria ?? 0,
      };
    });

    const statusMap = Object.fromEntries(
      porStatus.map((s) => [s.status, s._count.status])
    );

    // Ativos próximos do fim da garantia (próximos 90 dias) ou vencida
    const limite = new Date();
    limite.setDate(limite.getDate() + 90);
    const proximosGarantia = await db.ativo.findMany({
      where: {
        dataGarantia: { not: null, lte: limite },
        status: { not: "DESCARTADO" },
      },
      orderBy: { dataGarantia: "asc" },
      take: 10,
    });

    return NextResponse.json({
      totalAtivos,
      porStatus: porStatus.map((s) => ({ status: s.status, count: s._count.status })),
      porCategoria: porCategoriaCompleto,
      valorTotal: valorAgg._sum.valorAquisicao ?? 0,
      emEstoque: statusMap["EM_ESTOQUE"] ?? 0,
      emUso: statusMap["EM_USO"] ?? 0,
      emManutencao: statusMap["EM_MANUTENCAO"] ?? 0,
      descartados: statusMap["DESCARTADO"] ?? 0,
      proximosGarantia: proximosGarantia.map((a) => ({
        id: a.id,
        numeroPatrimonio: a.numeroPatrimonio,
        modelo: a.modelo,
        dataGarantia: a.dataGarantia,
        categoria: a.categoria,
      })),
      ultimasMovimentacoes: recentes,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
