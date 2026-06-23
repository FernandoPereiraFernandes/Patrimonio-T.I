"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryIcon } from "./category-icon";
import { MovimentacaoBadge } from "./badges";
import { useMovimentacoes } from "@/lib/queries";
import { TIPOS_MOVIMENTACAO, getCategoriaLabel } from "@/lib/constants";
import { History, ArrowRight, Search } from "lucide-react";

export function MovementsView() {
  const [tipo, setTipo] = useState<string>("ALL");
  const [busca, setBusca] = useState("");

  const { data: movs, isLoading } = useMovimentacoes({ limit: 200 });

  const filtrados = useMemo(() => {
    if (!movs) return [];
    return movs.filter((m: { tipo: string; descricao: string | null; ativo?: { numeroPatrimonio: string; marca: string | null; modelo: string | null; categoria: string } }) => {
      if (tipo !== "ALL" && m.tipo !== tipo) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const txt = `${m.descricao ?? ""} ${m.ativo?.numeroPatrimonio ?? ""} ${m.ativo?.marca ?? ""} ${m.ativo?.modelo ?? ""} ${m.responsavelNovo ?? ""}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
  }, [movs, tipo, busca]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <History className="size-5 text-primary" />
          Movimentações
        </h2>
        <p className="text-sm text-muted-foreground">
          Histórico de entradas, atribuições, devoluções, manutenções e
          descartes.
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, patrimônio, responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              {TIPOS_MOVIMENTACAO.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="size-10 text-muted-foreground/40" />
            <h3 className="mt-3 font-medium">Nenhuma movimentação</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não há registros para os filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll max-h-[65vh]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[60px]">Tipo</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Descrição
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Responsável
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Localização
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Por
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((m: { id: string; tipo: string; ativo?: { numeroPatrimonio: string; marca: string | null; modelo: string | null; categoria: string }; descricao: string | null; responsavelAnterior: string | null; responsavelNovo: string | null; localizacaoAnterior: string | null; localizacaoNova: string | null; data: string; usuario: string | null }) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <MovimentacaoBadge tipo={m.tipo} />
                    </TableCell>
                    <TableCell>
                      {m.ativo ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                            <CategoryIcon
                              categoria={m.ativo.categoria}
                              className="size-3.5"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-xs font-medium">
                              {m.ativo.numeroPatrimonio}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                              {m.ativo.marca} {m.ativo.modelo}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs">
                      <div className="line-clamp-2">{m.descricao ?? "—"}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          {m.responsavelAnterior ?? "—"}
                        </span>
                        {m.responsavelNovo && (
                          <>
                            <ArrowRight className="size-3 text-muted-foreground" />
                            <span>{m.responsavelNovo}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          {m.localizacaoAnterior ?? "—"}
                        </span>
                        {m.localizacaoNova && (
                          <>
                            <ArrowRight className="size-3 text-muted-foreground" />
                            <span>{m.localizacaoNova}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(m.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {m.usuario ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
