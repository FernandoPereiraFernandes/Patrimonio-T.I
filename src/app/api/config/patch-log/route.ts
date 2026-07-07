import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";

const LOG_FILE = "/tmp/patrimonioti-patch.log";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  try {
    const content = fs.existsSync(LOG_FILE)
      ? fs.readFileSync(LOG_FILE, "utf-8")
      : "";
    const done =
      content.includes("Patch concluído com sucesso") ||
      content.includes("ERRO:");
    return NextResponse.json({ log: content, done });
  } catch {
    return NextResponse.json({ log: "", done: false });
  }
}
