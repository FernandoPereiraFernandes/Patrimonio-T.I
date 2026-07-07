import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const REPO_DIR = process.env.APP_REPO_PATH || process.cwd();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  try {
    await execAsync("git fetch origin", { cwd: REPO_DIR });

    const { stdout: branchOut } = await execAsync(
      "git rev-parse --abbrev-ref HEAD",
      { cwd: REPO_DIR }
    );
    const branch = branchOut.trim();

    const { stdout: localOut } = await execAsync("git rev-parse HEAD", {
      cwd: REPO_DIR,
    });
    const { stdout: remoteOut } = await execAsync(
      `git rev-parse origin/${branch}`,
      { cwd: REPO_DIR }
    );

    const localHash = localOut.trim();
    const remoteHash = remoteOut.trim();
    const upToDate = localHash === remoteHash;

    let commitsPendentes: {
      hash: string;
      message: string;
      author: string;
      date: string;
    }[] = [];

    if (!upToDate) {
      const { stdout: log } = await execAsync(
        `git log HEAD..origin/${branch} --pretty=format:"%h|||%s|||%an|||%ad" --date=short`,
        { cwd: REPO_DIR }
      );
      commitsPendentes = log
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [hash, message, author, date] = line.split("|||");
          return { hash, message, author, date };
        });
    }

    return NextResponse.json({
      branch,
      localHash: localHash.slice(0, 7),
      remoteHash: remoteHash.slice(0, 7),
      upToDate,
      commitsPendentes,
    });
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return NextResponse.json(
      { error: "Erro ao verificar atualizações no GitHub" },
      { status: 500 }
    );
  }
}
