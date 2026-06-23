"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { TIPOS_MOVIMENTACAO, type TipoMovimentacao } from "@/lib/constants";
import { useCreateMovimentacao } from "@/lib/queries";
import type { Ativo } from "@/lib/types";
import { Loader2, ArrowRightLeft, AlertTriangle } from "lucide-react";

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ativo: Ativo | null;
}

const TIPOS_DISPINIVEIS: TipoMovimentacao[] = [
  "ATRIBUICAO",
  "DEVOLUCAO",
  "MANUTENCAO",
  "TRANSFERENCIA",
  "DESCARTE",
  "ENTRADA_ESTOQUE",
];

const LOC_SUGERIDA: Record<TipoMovimentacao, string> = {
  ATRIBUICAO: "",
  DEVOLUCAO: "Almoxarifado Ti",
  MANUTENCAO: "Assistência Técnica",
  TRANSFERENCIA: "",
  DESCARTE: "",
  ENTRADA_ESTOQUE: "Almoxarifado Ti",
};

export function MovementDialog({
  open,
  onOpenChange,
  ativo,
}: MovementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && ativo ? (
          <MovementForm
            ativo={ativo}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MovementForm({
  ativo,
  onClose,
}: {
  ativo: Ativo;
  onClose: () => void;
}) {
  const [tipo, setTipo] = useState<TipoMovimentacao>("ATRIBUICAO");
  const [responsavelNovo, setResponsavelNovo] = useState(
    ativo.responsavel ?? ""
  );
  const [localizacaoNova, setLocalizacaoNova] = useState(
    ativo.localizacao ?? ""
  );
  const [descricao, setDescricao] = useState("");
  const [usuario, setUsuario] = useState("");

  const mut = useCreateMovimentacao();

  const handleSubmit = async () => {
    const payload = {
      ativoId: ativo.id,
      tipo,
      descricao: descricao || null,
      responsavelNovo: responsavelNovo || null,
      localizacaoNova: localizacaoNova || null,
      usuario: usuario || null,
    };

    try {
      await mut.mutateAsync(payload);
      toast.success("Movimentação registrada com sucesso!");
      onClose();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao registrar movimentação"
      );
    }
  };

  const showResponsavel = tipo === "ATRIBUICAO" || tipo === "TRANSFERENCIA";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ArrowRightLeft className="size-5 text-primary" />
          Registrar Movimentação
        </DialogTitle>
        <DialogDescription>
          Patrimônio <strong>{ativo.numeroPatrimonio}</strong> · {ativo.marca}{" "}
          {ativo.modelo}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Status atual */}
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status atual:</span>
            <span className="font-medium">
              {ativo.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Responsável atual:</span>
            <span className="font-medium">{ativo.responsavel ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Local atual:</span>
            <span className="font-medium">{ativo.localizacao ?? "—"}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de movimentação</Label>
          <Select
            value={tipo}
            onValueChange={(v) => {
              const novo = v as TipoMovimentacao;
              setTipo(novo);
              if (!localizacaoNova) setLocalizacaoNova(LOC_SUGERIDA[novo]);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_MOVIMENTACAO.filter((t) =>
                TIPOS_DISPINIVEIS.includes(t.value)
              ).map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showResponsavel && (
          <div className="space-y-1.5">
            <Label htmlFor="respNovo">Novo responsável</Label>
            <Input
              id="respNovo"
              placeholder="Nome da pessoa que receberá o ativo"
              value={responsavelNovo}
              onChange={(e) => setResponsavelNovo(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="locNova">Nova localização</Label>
          <Input
            id="locNova"
            placeholder="Ex: Sala 302, Almoxarifado Ti"
            value={localizacaoNova}
            onChange={(e) => setLocalizacaoNova(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="usuario">Registrado por</Label>
          <Input
            id="usuario"
            placeholder="Seu nome"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descMov">Descrição / observação</Label>
          <Textarea
            id="descMov"
            rows={3}
            placeholder="Detalhes da movimentação (motivo, defeito, etc.)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        {tipo === "DESCARTE" && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span>
              O ativo será marcado como <strong>Descartado</strong> e não poderá
              mais ser atribuído. Esta ação fica registrada no histórico.
            </span>
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={mut.isPending}>
          {mut.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
          Registrar
        </Button>
      </DialogFooter>
    </>
  );
}
