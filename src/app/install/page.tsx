"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ServerCog,
  Check,
  X,
  Loader2,
  Database,
  UserCog,
  Rocket,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Terminal,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  PartyPopper,
} from "lucide-react";

type Step = 0 | 1 | 2 | 3 | 4;

interface InstallStatus {
  instalado: boolean;
  usuariosCount: number;
  ativosCount: number;
  dbOk: boolean;
  dbError: string | null;
  databaseUrl: string | null;
  nodeEnv: string;
}

export default function InstallPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<InstallStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Form state
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPorta, setDbPorta] = useState("3306");
  const [dbUsuario, setDbUsuario] = useState("root");
  const [dbSenha, setDbSenha] = useState("");
  const [dbBanco, setDbBanco] = useState("patrimonioti");
  const [criarBanco, setCriarBanco] = useState(true);

  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [adminSenhaConf, setAdminSenhaConf] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [testando, setTestando] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    versao?: string;
    tabelas?: string[];
    error?: string;
  } | null>(null);

  const [instalando, setInstalando] = useState(false);
  const [installResult, setInstallResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    databaseUrl?: string;
    adminEmail?: string;
  } | null>(null);

  // Carregar status na inicialização
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/install/status");
      const data = await res.json();
      setStatus(data);
      if (data.instalado) {
        // Já instalado - vai direto para tela de "concluído"
        setStep(4);
      }
    } catch {
      // ignora
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTestConnection = async () => {
    setTestando(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/install/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: dbHost,
          porta: parseInt(dbPorta, 10),
          usuario: dbUsuario,
          senha: dbSenha,
          banco: dbBanco,
          criarBanco,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.ok) {
        toast.success(`Conexão OK! Servidor: ${data.versao}`);
      } else {
        toast.error(data.error || "Falha ao conectar");
      }
    } catch (e) {
      setTestResult({
        ok: false,
        error: e instanceof Error ? e.message : "Erro",
      });
      toast.error("Erro ao testar conexão");
    } finally {
      setTestando(false);
    }
  };

  const handleInstall = async () => {
    if (adminSenha !== adminSenhaConf) {
      toast.error("As senhas não conferem");
      return;
    }
    if (adminSenha.length < 6) {
      toast.error("Senha deve ter ao menos 6 caracteres");
      return;
    }

    setInstalando(true);
    setInstallResult(null);

    // Gerar secret aleatório
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    try {
      const res = await fetch("/api/install/init-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: dbHost,
          porta: parseInt(dbPorta, 10),
          usuario: dbUsuario,
          senha: dbSenha,
          banco: dbBanco,
          adminNome,
          adminEmail,
          adminSenha,
          nextauthSecret: secret,
        }),
      });
      const data = await res.json();
      setInstallResult(data);
      if (data.ok) {
        toast.success("Sistema instalado com sucesso!");
        setStep(4);
      } else {
        toast.error(data.error || "Erro na instalação");
      }
    } catch (e) {
      setInstallResult({
        ok: false,
        error: e instanceof Error ? e.message : "Erro",
      });
      toast.error("Erro na instalação");
    } finally {
      setInstalando(false);
    }
  };

  const steps = [
    { n: 0, label: "Boas-vindas", icon: Rocket },
    { n: 1, label: "Pré-requisitos", icon: ShieldCheck },
    { n: 2, label: "Banco de Dados", icon: Database },
    { n: 3, label: "Administrador", icon: UserCog },
    { n: 4, label: "Conclusão", icon: Check },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ServerCog className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              PatrimônioTI · Instalador
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Configuração inicial do sistema
            </p>
          </div>
          <Badge variant="outline" className="ml-auto hidden sm:inline-flex">
            v1.0.0
          </Badge>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 custom-scroll">
              {steps.map((s, idx) => {
                const active = step === s.n;
                const done = step > s.n;
                return (
                  <div key={s.n} className="flex items-center flex-1 min-w-fit">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : done
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <Check className="size-5" />
                        ) : (
                          <s.icon className="size-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          active ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 min-w-[20px] ${
                          step > s.n ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conteúdo do step */}
          {loadingStatus ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Verificando estado da instalação...
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* STEP 0: Boas-vindas */}
              {step === 0 && (
                <Card className="animate-fade-in">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Rocket className="size-8" />
                    </div>
                    <CardTitle className="text-2xl">
                      Bem-vindo ao instalador do PatrimônioTI
                    </CardTitle>
                    <CardDescription className="max-w-xl mx-auto">
                      Este assistente vai guiá-lo pela configuração inicial do
                      sistema de controle de estoque e patrimônio de TI. Em
                      poucos minutos você terá o sistema pronto para uso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Feature
                        icon={Database}
                        title="Banco MariaDB"
                        desc="Configure o banco de dados MariaDB/MySQL"
                      />
                      <Feature
                        icon={UserCog}
                        title="Admin inicial"
                        desc="Crie a conta de administrador"
                      />
                      <Feature
                        icon={ShieldCheck}
                        title="Login seguro"
                        desc="Sistema protegido por autenticação"
                      />
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      <p className="font-medium mb-1">O que você precisa ter:</p>
                      <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Servidor MariaDB 10.x ou MySQL 8.x acessível</li>
                        <li>Credenciais de um usuário com permissão CREATE</li>
                        <li>Node.js 18+ ou Bun instalado</li>
                      </ul>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6 flex justify-end">
                    <Button onClick={() => setStep(1)} size="lg">
                      Iniciar Instalação
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 1: Pré-requisitos */}
              {step === 1 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="size-5 text-primary" />
                      Verificação de Pré-requisitos
                    </CardTitle>
                    <CardDescription>
                      Confirmando que o ambiente está pronto para a instalação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Checklist
                      label="Node.js / Bun runtime"
                      ok
                      detail="Detectado: ambiente em execução"
                    />
                    <Checklist
                      label="Prisma ORM"
                      ok
                      detail="Instalado e configurado"
                    />
                    <Checklist
                      label="NextAuth.js"
                      ok
                      detail="Pronto para autenticação"
                    />
                    <Checklist
                      label="Banco de dados conectado"
                      ok={status?.dbOk ?? false}
                      detail={
                        status?.dbOk
                          ? `Conectado · ${status.databaseUrl ?? "DATABASE_URL configurada"}`
                          : status?.dbError ?? "Aguardando configuração"
                      }
                    />
                    <Checklist
                      label="Estado atual do sistema"
                      ok={!(status?.instalado ?? false)}
                      detail={
                        status?.instalado
                          ? `Já possui ${status.usuariosCount} usuários e ${status.ativosCount} ativos`
                          : "Sistema novo, pronto para instalar"
                      }
                    />
                  </CardContent>
                  <div className="px-6 pb-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(0)}>
                      <ArrowLeft className="size-4 mr-1" />
                      Voltar
                    </Button>
                    <Button onClick={() => setStep(2)}>
                      Continuar
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 2: Banco de Dados */}
              {step === 2 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="size-5 text-primary" />
                      Configuração do Banco de Dados
                    </CardTitle>
                    <CardDescription>
                      Informe os dados de conexão com MariaDB/MySQL. Clique em
                      "Testar Conexão" antes de continuar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="host">Servidor (Host)</Label>
                        <Input
                          id="host"
                          placeholder="localhost ou 192.168.1.10"
                          value={dbHost}
                          onChange={(e) => setDbHost(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="porta">Porta</Label>
                        <Input
                          id="porta"
                          placeholder="3306"
                          value={dbPorta}
                          onChange={(e) => setDbPorta(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="usuario">Usuário</Label>
                        <Input
                          id="usuario"
                          placeholder="root ou usuario_db"
                          value={dbUsuario}
                          onChange={(e) => setDbUsuario(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="senha">Senha</Label>
                        <Input
                          id="senha"
                          type="password"
                          placeholder="••••••••"
                          value={dbSenha}
                          onChange={(e) => setDbSenha(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="banco">Nome do Banco de Dados</Label>
                        <Input
                          id="banco"
                          placeholder="patrimonioti"
                          value={dbBanco}
                          onChange={(e) => setDbBanco(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <Checkbox
                        id="criarBanco"
                        checked={criarBanco}
                        onCheckedChange={(v) => setCriarBanco(!!v)}
                      />
                      <Label htmlFor="criarBanco" className="cursor-pointer">
                        Criar o banco de dados automaticamente se não existir
                      </Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testando}
                      >
                        {testando ? (
                          <Loader2 className="size-4 mr-1 animate-spin" />
                        ) : (
                          <Database className="size-4 mr-1" />
                        )}
                        Testar Conexão
                      </Button>
                    </div>

                    {testResult && (
                      <div
                        className={`rounded-lg border p-4 ${
                          testResult.ok
                            ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "border-destructive/30 bg-destructive/10"
                        }`}
                      >
                        {testResult.ok ? (
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                              <Check className="size-4" />
                              Conexão bem-sucedida!
                            </p>
                            <p className="text-muted-foreground">
                              Versão do servidor: <strong>{testResult.versao}</strong>
                            </p>
                            <p className="text-muted-foreground">
                              Banco: <strong>{dbBanco}</strong> ·{" "}
                              {testResult.tabelas?.length ?? 0} tabela(s)
                              {(testResult.tabelas?.length ?? 0) > 0 && (
                                <span className="ml-1">
                                  ({testResult.tabelas?.join(", ")})
                                </span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-destructive flex items-start gap-1.5">
                            <X className="size-4 mt-0.5 shrink-0" />
                            {testResult.error}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <div className="px-6 pb-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="size-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!testResult?.ok}
                    >
                      Continuar
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 3: Admin */}
              {step === 3 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="size-5 text-primary" />
                      Conta de Administrador
                    </CardTitle>
                    <CardDescription>
                      Crie a conta inicial de administrador. Esta conta terá
                      acesso total ao sistema e poderá cadastrar outros
                      usuários.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="adminNome">Nome completo</Label>
                        <Input
                          id="adminNome"
                          placeholder="Ex: Administrador de TI"
                          value={adminNome}
                          onChange={(e) => setAdminNome(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="adminEmail">E-mail</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          placeholder="admin@empresa.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="adminSenha">Senha</Label>
                        <div className="relative">
                          <Input
                            id="adminSenha"
                            type={mostrarSenha ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            value={adminSenha}
                            onChange={(e) => setAdminSenha(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                        <Label htmlFor="adminSenhaConf">
                          Confirmar senha
                        </Label>
                        <Input
                          id="adminSenhaConf"
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="Repita a senha"
                          value={adminSenhaConf}
                          onChange={(e) => setAdminSenhaConf(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                      <span>
                        Ao confirmar, o instalador irá: <strong>escrever o arquivo .env</strong>,{" "}
                        <strong>criar as tabelas no banco MariaDB</strong> e{" "}
                        <strong>cadastrar o administrador</strong>. Esta operação
                        não pode ser desfeita.
                      </span>
                    </div>

                    {installResult && !installResult.ok && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-1.5">
                        <X className="size-4 mt-0.5 shrink-0" />
                        {installResult.error}
                      </div>
                    )}
                  </CardContent>
                  <div className="px-6 pb-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)} disabled={instalando}>
                      <ArrowLeft className="size-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleInstall}
                      disabled={
                        instalando ||
                        !adminNome ||
                        !adminEmail ||
                        !adminSenha ||
                        adminSenha !== adminSenhaConf
                      }
                    >
                      {instalando ? (
                        <Loader2 className="size-4 mr-1 animate-spin" />
                      ) : (
                        <Rocket className="size-4 mr-1" />
                      )}
                      {instalando ? "Instalando..." : "Instalar Sistema"}
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 4: Conclusão */}
              {step === 4 && (
                <Card className="animate-fade-in">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <PartyPopper className="size-8" />
                    </div>
                    <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
                      Instalação Concluída!
                    </CardTitle>
                    <CardDescription className="max-w-xl mx-auto">
                      O PatrimônioTI foi configurado com sucesso e está pronto
                      para uso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Banco de dados:</span>
                        <span className="font-medium font-mono">
                          {installResult?.databaseUrl ?? status?.databaseUrl ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Administrador:</span>
                        <span className="font-medium">
                          {installResult?.adminEmail ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Perfil:</span>
                        <span className="font-medium">ADMIN (acesso total)</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <p className="font-medium text-sm mb-1">Próximos passos:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                        <li>Faça login com as credenciais do administrador</li>
                        <li>Cadastre os ativos de TI no módulo Patrimônio</li>
                        <li>
                          Em "Usuários", crie contas para os técnicos da equipe
                        </li>
                        <li>Configure setores e localizações conforme sua empresa</li>
                      </ol>
                    </div>

                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                      <span>
                        Por segurança, <strong>reinicie o serviço</strong> após
                        a instalação para que o novo arquivo .env seja carregado
                        completamente. Em produção: <code>systemctl restart patrimonioti</code> ou
                        reinicie o container Docker.
                      </span>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      size="lg"
                      onClick={() => router.push("/login")}
                    >
                      Ir para o Login
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 text-xs text-muted-foreground text-center">
          PatrimônioTI · Instalador Web · Inspirado no modelo do GLPI
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function Checklist({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div
        className={`flex size-6 items-center justify-center rounded-full shrink-0 ${
          ok
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        }`}
      >
        {ok ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {detail && (
          <p className="text-xs text-muted-foreground mt-0.5 break-all">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
