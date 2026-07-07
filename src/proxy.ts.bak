import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ===== Proxy (middleware Next.js 16) — protege rotas autenticadas =====
// Em vez de usar next-auth/middleware (que conflita com proxy.ts no Next.js 16),
// usamos getToken do next-auth/jwt diretamente.

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas (NÃO exigem autenticação)
  const publicPaths = [
    "/login",
    "/registro",
    "/install",
    "/api/auth",          // rotas do NextAuth
    "/api/install",       // instalador
    "/api/setup-first-admin",
    "/api/registro",      // auto-cadastro
    "/api/categorias/public", // lista pública de categorias (para formulários)
  ];

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
    // Se for API, retorna 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }
    // Se for página, redireciona para login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo exceto arquivos estáticos
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|logo.svg|.*\\..*).*)",
  ],
};
