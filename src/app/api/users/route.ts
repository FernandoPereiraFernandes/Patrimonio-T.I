import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// GET /api/users - lista usuários (apenas ADMIN)
export async function GET() {
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

  const usuarios = await db.user.findMany({
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(usuarios);
}

// POST /api/users - cria novo usuário (apenas ADMIN)
export async function POST(req: NextRequest) {
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
    const body = await req.json();

    const schema = z.object({
      nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
      email: z.string().email("E-mail inválido"),
      senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
      role: z.enum(["ADMIN", "TECNICO", "USUARIO"]).default("USUARIO"),
      ativo: z.boolean().default(true),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { nome, email, senha, role, ativo } = parsed.data;

    const existente = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Já existe usuário com este e-mail" },
        { status: 400 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await db.user.create({
      data: {
        nome,
        email: email.toLowerCase(),
        senha: senhaHash,
        role,
        ativo,
      },
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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
