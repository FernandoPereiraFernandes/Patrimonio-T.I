"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ServerCog, Loader2, LogIn, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setErro("E-mail ou senha inválidos. Verifique suas credenciais.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ServerCog className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">PatrimônioTI</h1>
          <p className="text-sm text-muted-foreground">
            Controle de Estoque e Patrimônio de TI
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <LogIn className="size-5 text-primary" />
              Acessar o sistema
            </CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o painel de patrimônio.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {erro && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>{erro}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                </div>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !senha}
              >
                {loading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="size-4 mr-2" />
                )}
                Entrar
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            <span>
              Primeira instalação?{" "}
              <Link
                href="/install"
                className="text-primary hover:underline font-medium"
              >
                Acesse o instalador
              </Link>
            </span>
          </div>
          <p>PatrimônioTI v1.0.0 · Setor de TI</p>
        </div>
      </div>
    </div>
  );
}
