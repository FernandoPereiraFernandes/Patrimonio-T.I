import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// GET /api/categorias
// Se ?public=true, qualquer pessoa (mesmo sem auth) pode listar (para formulários)
// Caso contrário, requer auth
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublicRequest = searchParams.get("public") === "true";

  if (!isPublicRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
  }

  const categorias = await db.categoria.findMany({
    where: { ativa: true },
    orderBy: [{ builtin: "desc" }, { label: "asc" }],
  });

  // Serializar campos (JSON string -> array)
  const result = categorias.map((c) => ({
    ...c,
    campos: JSON.parse(c.campos || "[]"),
  }));

  return NextResponse.json(result);
}

// POST /api/categorias - cria nova categoria (apenas ADMIN)
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
      value: z
        .string()
        .min(2, "Chave deve ter ao menos 2 caracteres")
        .max(40)
        .regex(/^[A-Z0-9_]+$/, "Chave deve ter apenas LETRAS_MAIÚSCULAS, números e _"),
      label: z.string().min(2, "Nome (plural) é obrigatório").max(80),
      labelSingular: z.string().min(2, "Nome (singular) é obrigatório").max(80),
      icon: z.string().default("Package"),
      campos: z.array(z.string()).default([]),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    const { value, label, labelSingular, icon, campos } = parsed.data;

    // Verificar duplicidade
    const existente = await db.categoria.findUnique({ where: { value } });
    if (existente) {
      return NextResponse.json(
        { error: `Já existe categoria com chave "${value}"` },
        { status: 400 }
      );
    }

    const categoria = await db.categoria.create({
      data: {
        value: value.toUpperCase(),
        label,
        labelSingular,
        icon,
        campos: JSON.stringify(campos),
        builtin: false,
        ativa: true,
      },
    });

    return NextResponse.json(
      { ...categoria, campos: JSON.parse(categoria.campos || "[]") },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
