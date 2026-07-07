import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ===== Proxy (middleware Next.js 16) — protege rotas autenticadas =====
// Em vez de usar next-auth/middleware (que conflita com proxy.ts no Next.js 16),
// usamos getToken do next-auth/jwt diretamente.

// Rotas públicas (NÃO exigem autenticação)
const publicPaths = [
  "/login",
  "/registro",
  "/install",
  "/api/auth",              // rotas do NextAuth
  "/api/install",           // instalador
  "/api/setup-first-admin",
  "/api/registro",          // auto-cadastro
  "/api/categorias/public", // lista pública de categorias (para formulários)
];

// Prefixos de API de domínio onde o perfil USUARIO só pode LER (GET).
// Qualquer verbo de escrita nessas rotas é bloqueado para USUARIO,
// mesmo que algum botão apareça indevidamente na tela.
const restrictedApiPrefixes = [
  "/api/ativos",
  "/api/movimentacoes",
  "/api/categorias",
  "/api/users",
  "/api/config", // aba de configuração/atualização (futuro)
];

// Páginas administrativas: USUARIO nem deveria conseguir navegar até elas.
const adminOnlyPages = ["/categorias", "/usuarios", "/configuracao"];

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  // Verifica token JWT
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "patrimonio-ti-dev-secret-change-in-production",
  });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string) || "USUARIO";

  // ---- Bloqueio de escrita via API para perfil USUARIO ----
  if (
    role === "USUARIO" &&
    WRITE_METHODS.has(req.method) &&
    restrictedApiPrefixes.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.json(
      { error: "Seu perfil tem acesso somente de leitura." },
      { status: 403 }
    );
  }

  // ---- Bloqueio de navegação para telas administrativas ----
  if (role === "USUARIO" && adminOnlyPages.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo exceto arquivos estáticos
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|logo.svg|.*\\..*).*)",
  ],
};
