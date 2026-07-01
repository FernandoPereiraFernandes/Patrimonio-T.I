import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// POST /api/setup-first-admin
// Cria o primeiro usuário ADMIN do sistema (usado pelo instalador)
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

    // Verificar se já existe algum usuário (segurança)
    const totalUsuarios = await db.user.count();
    if (totalUsuarios > 0) {
      return NextResponse.json(
        {
          error:
            "Já existem usuários cadastrados. Use o login administrativo para criar novos usuários.",
        },
        { status: 403 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = await db.user.create({
      data: {
        nome,
        email: email.toLowerCase(),
        senha: senhaHash,
        role: "ADMIN",
        ativo: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Administrador criado com sucesso!",
        userId: admin.id,
        email: admin.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar primeiro admin:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar administrador" },
      { status: 500 }
    );
  }
}
