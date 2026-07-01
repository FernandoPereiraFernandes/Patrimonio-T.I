import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { AtivoInput } from "@/lib/types";

// GET /api/ativos/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ativo = await db.ativo.findUnique({
      where: { id },
      include: {
        movimentacoes: {
          orderBy: { data: "desc" },
        },
      },
    });

    if (!ativo) {
      return NextResponse.json(
        { error: "Ativo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(ativo);
  } catch (error) {
    console.error("Erro ao buscar ativo:", error);
    return NextResponse.json({ error: "Erro ao buscar ativo" }, { status: 500 });
  }
}

// PUT /api/ativos/[id] - ADMIN ou TECNICO
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role === "USUARIO") {
    return NextResponse.json(
      { error: "Sem permissão para editar ativos" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = (await req.json()) as AtivoInput;

    const existente = await db.ativo.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json(
        { error: "Ativo não encontrado" },
        { status: 404 }
      );
    }

    // Verificar duplicidade de número de patrimônio (se mudou)
    if (body.numeroPatrimonio !== existente.numeroPatrimonio) {
      const dup = await db.ativo.findUnique({
        where: { numeroPatrimonio: body.numeroPatrimonio },
      });
      if (dup) {
        return NextResponse.json(
          { error: "Número de patrimônio já cadastrado" },
          { status: 400 }
        );
      }
    }

    const atualizado = await db.ativo.update({
      where: { id },
      data: {
        numeroPatrimonio: body.numeroPatrimonio,
        numeroSerie: body.numeroSerie || null,
        categoria: body.categoria,
        marca: body.marca || null,
        modelo: body.modelo || null,
        descricao: body.descricao || null,
        especificacoes: body.especificacoes || null,
        status: body.status,
        localizacao: body.localizacao || null,
        responsavel: body.responsavel || null,
        setor: body.setor || null,
        dataAquisicao: body.dataAquisicao ? new Date(body.dataAquisicao) : null,
        valorAquisicao: body.valorAquisicao ?? null,
        fornecedor: body.fornecedor || null,
        notaFiscal: body.notaFiscal || null,
        dataGarantia: body.dataGarantia ? new Date(body.dataGarantia) : null,
        observacoes: body.observacoes || null,
      },
      include: { _count: { select: { movimentacoes: true } } },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar ativo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ativo" },
      { status: 500 }
    );
  }
}

// DELETE /api/ativos/[id] - apenas ADMIN
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Apenas administradores podem excluir ativos" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await db.ativo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir ativo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir ativo" },
      { status: 500 }
    );
  }
}
