"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS, TIPOS_MOVIMENTACAO } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const info = STATUS.find((s) => s.value === status);
  if (!info) return <Badge variant="outline">{status}</Badge>;

  const classes: Record<string, string> = {
    EM_ESTOQUE:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    EM_USO:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    EM_MANUTENCAO:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    DESCARTADO:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
  };

  return (
    <Badge variant="outline" className={`font-medium ${classes[status] ?? ""}`}>
      {info.label}
    </Badge>
  );
}

export function MovimentacaoBadge({ tipo }: { tipo: string }) {
  const info = TIPOS_MOVIMENTACAO.find((t) => t.value === tipo);
  if (!info) return <Badge variant="outline">{tipo}</Badge>;

  const classes: Record<string, string> = {
    ENTRADA_ESTOQUE:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300",
    ATRIBUICAO:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
    DEVOLUCAO:
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300",
    MANUTENCAO:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
    DESCARTE:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300",
    TRANSFERENCIA:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300",
  };

  return (
    <Badge variant="outline" className={`font-medium ${classes[tipo] ?? ""}`}>
      {info.label}
    </Badge>
  );
}
