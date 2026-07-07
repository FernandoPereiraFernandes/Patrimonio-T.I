import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const REPO_DIR = process.env.APP_REPO_PATH || process.cwd();
const LOG_FILE = "/tmp/patrimonioti-update.log";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  const scriptPath = path.join(REPO_DIR, "scripts", "update.sh");
  if (!fs.existsSync(scriptPath)) {
    return NextResponse.json(
      { error: "scripts/update.sh não encontrado no servidor" },
      { status: 500 }
    );
  }

  try {
    fs.writeFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] Atualização disparada por ${session.user.email}\n`
    );

    // Processo desacoplado: continua rodando mesmo após a resposta da API
    const child = spawn("bash", [scriptPath], {
      cwd: REPO_DIR,
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    return NextResponse.json({ started: true });
  } catch (error) {
    console.error("Erro ao iniciar atualização:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar atualização" },
      { status: 500 }
    );
  }
}
