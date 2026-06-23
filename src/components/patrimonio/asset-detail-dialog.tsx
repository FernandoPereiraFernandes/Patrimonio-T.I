"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryIcon } from "./category-icon";
import { StatusBadge, MovimentacaoBadge } from "./badges";
import { useAtivo } from "@/lib/queries";
import { getCategoriaLabel } from "@/lib/constants";
import {
  Calendar,
  MapPin,
  User,
  Building2,
  DollarSign,
  FileText,
  ShieldCheck,
  Hash,
  StickyNote,
  Pencil,
  ArrowRightLeft,
  Trash2,
  Loader2,
  Package,
} from "lucide-react";

interface AssetDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ativoId: string | null;
  onEdit: () => void;
  onMove: () => void;
  onDelete: () => void;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function formatCurrency(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function AssetDetailDialog({
  open,
  onOpenChange,
  ativoId,
  onEdit,
  onMove,
  onDelete,
}: AssetDetailDialogProps) {
  const { data: ativo, isLoading } = useAtivo(ativoId);

  const specs: Record<string, string> = (() => {
    if (!ativo?.especificacoes) return {};
    try {
      return JSON.parse(ativo.especificacoes);
    } catch {
      return {};
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        {isLoading || !ativo ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 py-5 border-b bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <CategoryIcon
                      categoria={ativo.categoria}
                      className="size-6"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {ativo.marca} {ativo.modelo}
                    </DialogTitle>
                    <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-mono text-foreground/80">
                        {ativo.numeroPatrimonio}
                      </span>
                      <span>·</span>
                      <span>{getCategoriaLabel(ativo.categoria)}</span>
                    </DialogDescription>
                    <div className="mt-2">
                      <StatusBadge status={ativo.status} />
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(92vh-13rem)] custom-scroll">
              <div className="px-6 py-5 space-y-6">
                {/* Especificações técnicas */}
                {Object.keys(specs).length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Especificações Técnicas
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(specs).map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-lg border bg-muted/30 px-3 py-2"
                        >
                          <div className="text-xs text-muted-foreground">
                            {k}
                          </div>
                          <div className="text-sm font-medium truncate">
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Detalhes */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoItem
                    icon={Hash}
                    label="Nº de Série"
                    value={ativo.numeroSerie ?? "—"}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Localização"
                    value={ativo.localizacao ?? "—"}
                  />
                  <InfoItem
                    icon={User}
                    label="Responsável"
                    value={ativo.responsavel ?? "—"}
                  />
                  <InfoItem
                    icon={Building2}
                    label="Setor"
                    value={ativo.setor ?? "—"}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Aquisição"
                    value={formatDate(ativo.dataAquisicao)}
                  />
                  <InfoItem
                    icon={DollarSign}
                    label="Valor"
                    value={formatCurrency(ativo.valorAquisicao)}
                  />
                  <InfoItem
                    icon={FileText}
                    label="Nota Fiscal"
                    value={ativo.notaFiscal ?? "—"}
                  />
                  <InfoItem
                    icon={ShieldCheck}
                    label="Garantia até"
                    value={formatDate(ativo.dataGarantia)}
                    highlight={isWarrantyExpiring(ativo.dataGarantia)}
                  />
                  <InfoItem
                    icon={Building2}
                    label="Fornecedor"
                    value={ativo.fornecedor ?? "—"}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Movimentações"
                    value={String(ativo.movimentacoes?.length ?? 0)}
                  />
                </section>

                {ativo.descricao && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Descrição
                    </h3>
                    <p className="text-sm">{ativo.descricao}</p>
                  </section>
                )}

                {ativo.observacoes && (
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <StickyNote className="size-3.5" /> Observações
                    </h3>
                    <p className="text-sm rounded-lg border bg-muted/30 p-3">
                      {ativo.observacoes}
                    </p>
                  </section>
                )}

                <Separator />

                {/* Histórico de movimentações */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Histórico de Movimentações
                  </h3>
                  {ativo.movimentacoes && ativo.movimentacoes.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                      {ativo.movimentacoes.map((m, idx) => (
                        <div
                          key={m.id}
                          className="relative flex gap-3 rounded-lg border p-3"
                        >
                          <div className="flex flex-col items-center">
                            <div className="size-2 rounded-full bg-primary mt-1.5" />
                            {idx < ativo.movimentacoes!.length - 1 && (
                              <div className="w-px flex-1 bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <MovimentacaoBadge tipo={m.tipo} />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(m.data)}{" "}
                                {m.usuario && `· por ${m.usuario}`}
                              </span>
                            </div>
                            {m.descricao && (
                              <p className="text-sm text-muted-foreground">
                                {m.descricao}
                              </p>
                            )}
                            {(m.responsavelAnterior || m.responsavelNovo) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {m.responsavelAnterior ?? "—"} →{" "}
                                {m.responsavelNovo ?? "—"}
                              </p>
                            )}
                            {(m.localizacaoAnterior || m.localizacaoNova) && (
                              <p className="text-xs text-muted-foreground">
                                {m.localizacaoAnterior ?? "—"} →{" "}
                                {m.localizacaoNova ?? "—"}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      <Package className="size-8 mx-auto mb-2 opacity-40" />
                      Nenhuma movimentação registrada.
                    </div>
                  )}
                </section>
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t bg-muted/30 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-1" />
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onMove}>
                  <ArrowRightLeft className="size-4 mr-1" />
                  Movimentar
                </Button>
                <Button size="sm" onClick={onEdit}>
                  <Pencil className="size-4 mr-1" />
                  Editar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={`text-sm font-medium truncate ${
            highlight ? "text-amber-600 dark:text-amber-400" : ""
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function isWarrantyExpiring(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const limite = new Date();
  limite.setDate(limite.getDate() + 90);
  return date <= limite;
}
