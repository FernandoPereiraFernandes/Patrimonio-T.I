import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { AtivoInput } from "@/lib/types";

// GET /api/ativos - lista com filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria") || undefined;
    const status = searchParams.get("status") || undefined;
    const busca = searchParams.get("busca") || undefined;
    const localizacao = searchParams.get("localizacao") || undefined;
    const setor = searchParams.get("setor") || undefined;
    const responsavel = searchParams.get("responsavel") || undefined;

    const where: Record<string, unknown> = {};
    if (categoria) where.categoria = categoria;
    if (status) where.status = status;
    if (localizacao) where.localizacao = { contains: localizacao };
    if (setor) where.setor = { contains: setor };
    if (responsavel) where.responsavel = { contains: responsavel };
    if (busca) {
      where.OR = [
        { numeroPatrimonio: { contains: busca } },
        { numeroSerie: { contains: busca } },
        { marca: { contains: busca } },
        { modelo: { contains: busca } },
        { responsavel: { contains: busca } },
        { localizacao: { contains: busca } },
        { descricao: { contains: busca } },
      ];
    }

    const ativos = await db.ativo.findMany({
      where,
      orderBy: [{ categoria: "asc" }, { numeroPatrimonio: "asc" }],
      include: { _count: { select: { movimentacoes: true } } },
    });

    return NextResponse.json(ativos);
  } catch (error) {
    console.error("Erro ao listar ativos:", error);
    return NextResponse.json(
      { error: "Erro ao listar ativos" },
      { status: 500 }
    );
  }
}

// POST /api/ativos - cria novo ativo
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AtivoInput;

    if (!body.numeroPatrimonio || !body.categoria) {
      return NextResponse.json(
        { error: "Número de patrimônio e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar duplicidade do número de patrimônio
    const existente = await db.ativo.findUnique({
      where: { numeroPatrimonio: body.numeroPatrimonio },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Número de patrimônio já cadastrado" },
        { status: 400 }
      );
    }

    const data = {
      numeroPatrimonio: body.numeroPatrimonio,
      numeroSerie: body.numeroSerie || null,
      categoria: body.categoria,
      marca: body.marca || null,
      modelo: body.modelo || null,
      descricao: body.descricao || null,
      especificacoes: body.especificacoes || null,
      status: body.status || "EM_ESTOQUE",
      localizacao: body.localizacao || null,
      responsavel: body.responsavel || null,
      setor: body.setor || null,
      dataAquisicao: body.dataAquisicao ? new Date(body.dataAquisicao) : null,
      valorAquisicao: body.valorAquisicao ?? null,
      fornecedor: body.fornecedor || null,
      notaFiscal: body.notaFiscal || null,
      dataGarantia: body.dataGarantia ? new Date(body.dataGarantia) : null,
      observacoes: body.observacoes || null,
    };

    const ativo = await db.ativo.create({ data });

    // Registrar movimentação de entrada em estoque
    await db.movimentacao.create({
      data: {
        ativoId: ativo.id,
        tipo: "ENTRADA_ESTOQUE",
        descricao: `Entrada do ativo no patrimônio. NF: ${data.notaFiscal ?? "N/A"}`,
        localizacaoNova: data.localizacao || "Almoxarifado Ti",
        usuario: body.responsavel || "Sistema",
      },
    });

    // Se criado já em uso, registrar atribuição
    if (ativo.status === "EM_USO" && ativo.responsavel) {
      await db.movimentacao.create({
        data: {
          ativoId: ativo.id,
          tipo: "ATRIBUICAO",
          descricao: `Atribuído a ${ativo.responsavel}`,
          responsavelNovo: ativo.responsavel,
          localizacaoNova: ativo.localizacao,
          usuario: body.responsavel || "Sistema",
        },
      });
    }

    const ativoCompleto = await db.ativo.findUnique({
      where: { id: ativo.id },
      include: { _count: { select: { movimentacoes: true } } },
    });

    return NextResponse.json(ativoCompleto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ativo:", error);
    return NextResponse.json(
      { error: "Erro ao criar ativo" },
      { status: 500 }
    );
  }
}
