"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Settings,
  RefreshCw,
  Download,
  Shield,
  GitBranch,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Upload,
  FolderSync,
  FileArchive,
} from "lucide-react";

interface UpdateStatus {
  branch: string;
  localHash: string;
  remoteHash: string;
  upToDate: boolean;
  commitsPendentes: { hash: string; message: string; author: string; date: string }[];
}

export default function ConfiguracaoPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-medium">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apenas administradores podem acessar a Configuração.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="size-5 text-primary" />
          Configuração do Sistema
        </h2>
        <p className="text-sm text-muted-foreground">
          Atualize o sistema puxando do GitHub ou aplicando um patch (.zip)
          manualmente.
        </p>
      </div>

      <GithubUpdateCard />
      <PatchUploadCard />
      <WatchedFolderInfoCard />
    </div>
  );
}

// =================== Card 1: Atualização via GitHub (git pull) ===================

function GithubUpdateCard() {
  const qc = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [log, setLog] = useState("");

  const { data: status, isLoading, refetch, isFetching } = useQuery<UpdateStatus>({
    queryKey: ["update-status"],
    queryFn: async () => {
      const res = await fetch("/api/config/status");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao verificar atualizações");
      }
      return res.json();
    },
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/config/update", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao iniciar atualização");
      }
      return res.json();
    },
    onSuccess: () => {
      setUpdating(true);
      toast.success("Atualização iniciada. Acompanhe o log abaixo.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  useEffect(() => {
    if (!updating) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/config/update-log");
      if (res.ok) {
        const data = await res.json();
        setLog(data.log);
        if (data.done) {
          setUpdating(false);
          clearInterval(interval);
          qc.invalidateQueries({ queryKey: ["update-status"] });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [updating, qc]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="size-4 text-primary" />
        <h3 className="font-semibold text-sm">Atualizar via GitHub</h3>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : status ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{status.branch}</span>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              local: {status.localHash}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              GitHub: {status.remoteHash}
            </Badge>
            {status.upToDate ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="size-3 mr-1" />
                Atualizado
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {status.commitsPendentes.length} commit(s) pendente(s)
              </Badge>
            )}
          </div>

          {status.commitsPendentes.length > 0 && (
            <div className="rounded-lg border divide-y max-h-56 overflow-y-auto custom-scroll">
              {status.commitsPendentes.map((c) => (
                <div key={c.hash} className="p-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground">{c.hash}</code>
                    <span className="font-medium">{c.message}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.author} · {c.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`size-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              Verificar novamente
            </Button>
            <Button
              onClick={() => {
                if (
                  confirm(
                    "Isso vai baixar o código mais recente do GitHub, instalar dependências, recompilar e reiniciar o serviço. Continuar?"
                  )
                ) {
                  updateMut.mutate();
                }
              }}
              disabled={status.upToDate || updating || updateMut.isPending}
            >
              {updating || updateMut.isPending ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Download className="size-4 mr-1" />
              )}
              Aplicar atualização
            </Button>
          </div>
        </>
      ) : null}

      {(updating || log) && (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Log da atualização:
          </p>
          <pre className="bg-black text-emerald-400 text-xs p-3 rounded-lg max-h-64 overflow-y-auto whitespace-pre-wrap">
            {log || "Aguardando início..."}
          </pre>
        </div>
      )}
    </Card>
  );
}

// =================== Card 2: Upload manual de patch (.zip) ===================

function PatchUploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [log, setLog] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/config/upload-update", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao enviar patch");
      }
      return res.json();
    },
    onSuccess: () => {
      setApplying(true);
      toast.success("Patch enviado. Aplicando atualização...");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  useEffect(() => {
    if (!applying) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/config/patch-log");
      if (res.ok) {
        const data = await res.json();
        setLog(data.log);
        if (data.done) {
          setApplying(false);
          clearInterval(interval);
          if (data.log.includes("Patch concluído com sucesso")) {
            toast.success("Patch aplicado e serviço reiniciado!");
          } else {
            toast.error("Falha ao aplicar o patch. Veja o log.");
          }
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [applying]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Selecione um arquivo .zip");
      return;
    }
    setSelectedFile(file);
  };

  const handleEnviar = () => {
    if (!selectedFile) return;
    if (
      !confirm(
        `Aplicar o patch "${selectedFile.name}"? Isso vai sobrescrever os arquivos incluídos no zip, reinstalar dependências se necessário, recompilar e reiniciar o serviço.`
      )
    )
      return;
    uploadMut.mutate(selectedFile);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="size-4 text-primary" />
        <h3 className="font-semibold text-sm">Atualizar via upload de patch (.zip)</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Envie um .zip contendo apenas os arquivos que mudaram (patch parcial).
        Os arquivos serão sobrepostos no projeto — <code>node_modules</code>,{" "}
        <code>.git</code>, <code>.next</code> e <code>.env</code> nunca são
        tocados.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <FileArchive className="size-8 mx-auto text-muted-foreground mb-2" />
        {selectedFile ? (
          <p className="text-sm font-medium">{selectedFile.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Arraste um .zip aqui ou clique para selecionar
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button
        onClick={handleEnviar}
        disabled={!selectedFile || applying || uploadMut.isPending}
      >
        {applying || uploadMut.isPending ? (
          <Loader2 className="size-4 mr-1 animate-spin" />
        ) : (
          <Upload className="size-4 mr-1" />
        )}
        Enviar e aplicar
      </Button>

      {(applying || log) && (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Log da aplicação do patch:
          </p>
          <pre className="bg-black text-emerald-400 text-xs p-3 rounded-lg max-h-64 overflow-y-auto whitespace-pre-wrap">
            {log || "Aguardando início..."}
          </pre>
          {applying && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              O serviço será reiniciado automaticamente ao final. A página
              pode parecer travada por alguns segundos — isso é esperado.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// =================== Card 3: Info sobre a pasta monitorada (SCP/SFTP) ===================

function WatchedFolderInfoCard() {
  return (
    <Card className="p-4 space-y-2 border-sky-200 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-800">
      <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
        <FolderSync className="size-4" />
        <h3 className="font-semibold text-sm">Atualização automática por pasta (SCP/SFTP)</h3>
      </div>
      <p className="text-xs text-sky-800 dark:text-sky-300">
        Além do upload acima, você pode simplesmente copiar o .zip de patch
        direto pro servidor via SCP/SFTP, na pasta:
      </p>
      <code className="block text-xs bg-black/10 dark:bg-white/10 rounded px-2 py-1.5 w-fit">
        /opt/Patrimonio-T.I/updates/incoming/
      </code>
      <p className="text-xs text-sky-800 dark:text-sky-300">
        Um serviço (<code>patrimonioti-watcher</code>) fica observando essa
        pasta e aplica o patch sozinho assim que detecta o arquivo — sem
        precisar abrir o navegador. Requer o watcher configurado (veja
        instruções de instalação do systemd).
      </p>
    </Card>
  );
}
