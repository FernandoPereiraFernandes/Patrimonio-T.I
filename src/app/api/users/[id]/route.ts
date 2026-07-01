import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// PUT /api/users/[id] - atualiza usuário (ADMIN ou próprio usuário)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const isSelf = session.user.id === id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isSelf && !isAdmin) {
    return NextResponse.json(
      { error: "Sem permissão para editar este usuário" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    const schema = z.object({
      nome: z.string().min(3).optional(),
      email: z.string().email().optional(),
      senha: z.string().min(6).optional(),
      role: z.enum(["ADMIN", "TECNICO", "USUARIO"]).optional(),
      ativo: z.boolean().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    // Apenas ADMIN pode alterar role e ativo de outros usuários
    if (!isAdmin) {
      delete parsed.data.role;
      delete parsed.data.ativo;
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.email) data.email = parsed.data.email.toLowerCase();
    if (parsed.data.senha) {
      data.senha = await bcrypt.hash(parsed.data.senha, 10);
    }

    const user = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - remove usuário (apenas ADMIN)
export async function DELETE(
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

  const { id } = await params;

  if (session.user.id === id) {
    return NextResponse.json(
      { error: "Você não pode excluir sua própria conta" },
      { status: 400 }
    );
  }

  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}
