import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const REPO_DIR = process.env.APP_REPO_PATH || process.cwd();
const INCOMING_DIR = path.join(REPO_DIR, "updates", "incoming");
const APPLY_SCRIPT = path.join(REPO_DIR, "scripts", "apply-patch.sh");
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { error: "Envie um arquivo .zip" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx. 50MB)" },
        { status: 400 }
      );
    }

    fs.mkdirSync(INCOMING_DIR, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const destPath = path.join(INCOMING_DIR, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destPath, buffer);

    // Dispara a aplicação do patch em processo desacoplado (sobrevive ao
    // reinício do próprio servidor, feito pelo apply-patch.sh no final)
    const child = spawn("bash", [APPLY_SCRIPT, destPath], {
      cwd: REPO_DIR,
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    return NextResponse.json({ started: true, file: safeName });
  } catch (error) {
    console.error("Erro ao processar upload de patch:", error);
    return NextResponse.json(
      { error: "Erro ao processar o arquivo" },
      { status: 500 }
    );
  }
}
