import { NextRequest, NextResponse } from "next/server";

// Rotas que NÃO exigem autenticação:
// - /login (página de login)
// - /install (instalador web)
// - /api/auth/* (rotas do NextAuth)
// - /api/install/* (APIs do instalador)
// - /api/setup-first-admin (criação do primeiro admin)
export function proxy(req: NextRequest) {
  // Apenas protege rotas - o next-auth/middleware faz a verificação de sessão
  // Mas como a API do next-auth/middleware usa default export, vamos fazer
  // uma verificação simples via token cookie aqui.
  return NextResponse.next();
}

// Configuração do matcher - rotas que passam pelo proxy
export const config = {
  matcher: [
    /*
     * Proteger tudo exceto:
     * - arquivos estáticos (_next/static, _next/image, favicon, assets)
     * - /login
     * - /install e suas sub-rotas
     * - /api/auth e /api/install
     */
    "/((?!login|install|api/auth|api/install|api/setup-first-admin|_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)",
  ],
};

// Re-export do next-auth middleware como default (mantém compatibilidade)
export { default } from "next-auth/middleware";
