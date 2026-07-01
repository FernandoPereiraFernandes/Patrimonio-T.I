import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// PUT /api/categorias/[id] - atualiza categoria (apenas ADMIN, não permite editar builtin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const schema = z.object({
      label: z.string().min(2).max(80).optional(),
      labelSingular: z.string().min(2).max(80).optional(),
      icon: z.string().optional(),
      campos: z.array(z.string()).optional(),
      ativa: z.boolean().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const existente = await db.categoria.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Não permitir mudar a chave (value) - é referenciada nos ativos
    // Não permitir desativar categorias builtin
    if (existente.builtin && parsed.data.ativa === false) {
      return NextResponse.json(
        { error: "Categorias padrão do sistema não podem ser desativadas" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.label !== undefined) data.label = parsed.data.label;
    if (parsed.data.labelSingular !== undefined) data.labelSingular = parsed.data.labelSingular;
    if (parsed.data.icon !== undefined) data.icon = parsed.data.icon;
    if (parsed.data.campos !== undefined) data.campos = JSON.stringify(parsed.data.campos);
    if (parsed.data.ativa !== undefined) data.ativa = parsed.data.ativa;

    const categoria = await db.categoria.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...categoria,
      campos: JSON.parse(categoria.campos || "[]"),
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// DELETE /api/categorias/[id] - remove categoria (apenas ADMIN, não permite excluir builtin)
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
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const categoria = await db.categoria.findUnique({ where: { id } });
    if (!categoria) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    if (categoria.builtin) {
      return NextResponse.json(
        { error: "Categorias padrão do sistema não podem ser excluídas" },
        { status: 400 }
      );
    }

    // Verificar se existem ativos usando esta categoria
    const ativosCount = await db.ativo.count({
      where: { categoria: categoria.value },
    });
    if (ativosCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir: existem ${ativosCount} ativo(s) usando esta categoria. Reatribua os ativos antes de excluir.`,
        },
        { status: 400 }
      );
    }

    await db.categoria.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}
