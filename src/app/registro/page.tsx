"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ServerCog, Loader2, UserPlus, AlertCircle, Eye, EyeOff, ArrowLeft, CheckCircle2, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConf, setSenhaConf] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (senha !== senhaConf) {
      setErro("As senhas não conferem.");
      return;
    }
    if (senha.length < 6) {
      setErro("Senha deve ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao criar conta.");
        return;
      }

      setSucesso(true);
      toast.success("Conta criada! Redirecionando para login...");

      // Após 2s, redireciona para login já preenchendo o email
      setTimeout(() => {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }, 2000);
    } catch {
      setErro("Erro de rede ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <Card className="shadow-xl">
        <CardContent className="py-12 flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="size-9" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Conta criada!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua conta foi criada com sucesso com perfil de{" "}
            <strong>Usuário</strong>. Redirecionando para o login...
          </p>
          <Loader2 className="size-4 mt-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserPlus className="size-5 text-primary" />
          Criar nova conta
        </CardTitle>
        <CardDescription>
          Preencha seus dados para se cadastrar no sistema. Novos usuários
          recebem perfil de <strong>Usuário</strong> (somente visualização).
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
            <Label htmlFor="nome">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="nome"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha (mínimo 6 caracteres)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="pl-9 pr-10"
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

          <div className="space-y-1.5">
            <Label htmlFor="senhaConf">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="senhaConf"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Repita a senha"
                value={senhaConf}
                onChange={(e) => setSenhaConf(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <strong>Importante:</strong> Contas criadas por auto-registro têm
            perfil de <strong>Usuário</strong> (apenas visualização). Um
            administrador pode elevar seu perfil para{" "}
            <strong>Técnico</strong> ou <strong>Administrador</strong>{" "}
            posteriormente.
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !nome || !email || !senha || !senhaConf}
          >
            {loading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="size-4 mr-2" />
            )}
            Criar conta
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegistroPage() {
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

        <Suspense
          fallback={
            <Card>
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          }
        >
          <RegistroForm />
        </Suspense>

        {/* Voltar para login */}
        <div className="mt-4 text-center">
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="size-4 mr-2" />
              Já tenho conta - voltar para login
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>PatrimônioTI v1.0.0 · Setor de TI</p>
        </div>
      </div>
    </div>
  );
}
