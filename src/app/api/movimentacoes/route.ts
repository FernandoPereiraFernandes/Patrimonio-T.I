import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { MovimentacaoInput } from "@/lib/types";

// GET /api/movimentacoes - lista com filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ativoId = searchParams.get("ativoId") || undefined;
    const tipo = searchParams.get("tipo") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: Record<string, unknown> = {};
    if (ativoId) where.ativoId = ativoId;
    if (tipo) where.tipo = tipo;

    const movimentacoes = await db.movimentacao.findMany({
      where,
      orderBy: { data: "desc" },
      take: limit,
      include: { ativo: true },
    });

    return NextResponse.json(movimentacoes);
  } catch (error) {
    console.error("Erro ao listar movimentações:", error);
    return NextResponse.json(
      { error: "Erro ao listar movimentações" },
      { status: 500 }
    );
  }
}

// POST /api/movimentacoes - registra nova movimentação e atualiza ativo
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MovimentacaoInput;

    if (!body.ativoId || !body.tipo) {
      return NextResponse.json(
        { error: "ativoId e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    const ativo = await db.ativo.findUnique({ where: { id: body.ativoId } });
    if (!ativo) {
      return NextResponse.json(
        { error: "Ativo não encontrado" },
        { status: 404 }
      );
    }

    const responsavelAnterior = ativo.responsavel;
    const localizacaoAnterior = ativo.localizacao;

    // Determinar novo status do ativo conforme tipo de movimentação
    let novoStatus = ativo.status;
    let novoResponsavel = ativo.responsavel;
    let novaLocalizacao = ativo.localizacao;

    switch (body.tipo) {
      case "ATRIBUICAO":
        novoStatus = "EM_USO";
        novoResponsavel = body.responsavelNovo ?? novoResponsavel;
        novaLocalizacao = body.localizacaoNova ?? novaLocalizacao;
        break;
      case "DEVOLUCAO":
        novoStatus = "EM_ESTOQUE";
        novoResponsavel = null;
        novaLocalizacao = body.localizacaoNova ?? "Almoxarifado Ti";
        break;
      case "MANUTENCAO":
        novoStatus = "EM_MANUTENCAO";
        novaLocalizacao = body.localizacaoNova ?? "Assistência Técnica";
        break;
      case "DESCARTE":
        novoStatus = "DESCARTADO";
        novoResponsavel = null;
        break;
      case "TRANSFERENCIA":
        novaLocalizacao = body.localizacaoNova ?? novaLocalizacao;
        novoResponsavel = body.responsavelNovo ?? novoResponsavel;
        break;
      case "ENTRADA_ESTOQUE":
        novoStatus = "EM_ESTOQUE";
        novoResponsavel = null;
        novaLocalizacao = body.localizacaoNova ?? "Almoxarifado Ti";
        break;
    }

    // Criar a movimentação e atualizar o ativo em transação
    const [movimentacao] = await db.$transaction([
      db.movimentacao.create({
        data: {
          ativoId: body.ativoId,
          tipo: body.tipo,
          descricao: body.descricao || null,
          responsavelAnterior,
          responsavelNovo: novoResponsavel,
          localizacaoAnterior,
          localizacaoNova: novaLocalizacao,
          usuario: body.usuario || "Sistema",
        },
      }),
      db.ativo.update({
        where: { id: body.ativoId },
        data: {
          status: novoStatus,
          responsavel: novoResponsavel,
          localizacao: novaLocalizacao,
        },
      }),
    ]);

    const movimentacaoCompleta = await db.movimentacao.findUnique({
      where: { id: movimentacao.id },
      include: { ativo: true },
    });

    return NextResponse.json(movimentacaoCompleta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    return NextResponse.json(
      { error: "Erro ao criar movimentação" },
      { status: 500 }
    );
  }
}
