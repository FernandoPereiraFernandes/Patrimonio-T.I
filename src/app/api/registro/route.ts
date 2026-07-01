import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// POST /api/registro
// Auto-cadastro de novo usuário (público, sem auth)
// Sempre cria com role USUARIO (menor privilégio)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const schema = z.object({
      nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
      email: z.string().email("E-mail inválido"),
      senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { nome, email, senha } = parsed.data;

    // Verificar se e-mail já existe
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
        role: "USUARIO", // auto-cadastro sempre como USUARIO
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Conta criada com sucesso! Faça login para acessar.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar conta" },
      { status: 500 }
    );
  }
}
