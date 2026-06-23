"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryIcon } from "./category-icon";
import { StatusBadge } from "./badges";
import { AssetFormDialog } from "./asset-form-dialog";
import { AssetDetailDialog } from "./asset-detail-dialog";
import { MovementDialog } from "./movement-dialog";
import { useAtivos, useDeleteAtivo } from "@/lib/queries";
import { CATEGORIAS, STATUS, getCategoriaLabel } from "@/lib/constants";
import type { Ativo } from "@/lib/types";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Filter,
  Eye,
  ArrowRightLeft,
  Pencil,
  Package,
  Inbox,
} from "lucide-react";

export function AssetList() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Ativo | null>(null);
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [movOpen, setMovOpen] = useState(false);
  const [movAtivo, setMovAtivo] = useState<Ativo | null>(null);

  const deleteMut = useDeleteAtivo();

  const filters = useMemo(
    () => ({
      busca: busca || undefined,
      categoria: categoria !== "ALL" ? categoria : undefined,
      status: status !== "ALL" ? status : undefined,
    }),
    [busca, categoria, status]
  );

  const { data: ativos, isLoading } = useAtivos(filters);

  const abrirNovo = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const abrirEdicao = (a: Ativo) => {
    setEditando(a);
    setFormOpen(true);
  };

  const abrirDetalhe = (id: string) => {
    setDetalheId(id);
    setDetalheOpen(true);
  };

  const abrirMovimentacao = (a: Ativo) => {
    setMovAtivo(a);
    setMovOpen(true);
  };

  const handleDelete = async (a: Ativo) => {
    if (
      !confirm(
        `Excluir o ativo ${a.numeroPatrimonio} (${a.marca} ${a.modelo})?\nEsta ação não pode ser desfeita.`
      )
    )
      return;
    try {
      await deleteMut.mutateAsync(a.id);
      toast.success("Ativo excluído.");
      setDetalheOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  const limparFiltros = () => {
    setBusca("");
    setCategoria("ALL");
    setStatus("ALL");
  };

  const total = ativos?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Patrimônio de TI
          </h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "item cadastrado" : "itens cadastrados"}
          </p>
        </div>
        <Button onClick={abrirNovo} className="self-start sm:self-auto">
          <Plus className="size-4 mr-1" />
          Novo Ativo
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por patrimônio, série, marca, modelo, responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[170px]">
                <Filter className="size-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas categorias</SelectItem>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.labelSingular}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos status</SelectItem>
                {STATUS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(busca || categoria !== "ALL" || status !== "ALL") && (
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                Limpar
              </Button>
            )}
          </div>
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
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">Nenhum ativo encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {busca || categoria !== "ALL" || status !== "ALL"
                ? "Tente ajustar os filtros de busca."
                : "Comece cadastrando o primeiro item de patrimônio."}
            </p>
            {!busca && categoria === "ALL" && status === "ALL" && (
              <Button onClick={abrirNovo} className="mt-4" size="sm">
                <Plus className="size-4 mr-1" />
                Cadastrar Ativo
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Patrimônio</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Responsável
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Localização
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ativos?.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => abrirDetalhe(a.id)}
                  >
                    <TableCell>
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CategoryIcon
                          categoria={a.categoria}
                          className="size-4"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm font-medium">
                        {a.numeroPatrimonio}
                      </div>
                      {a.numeroSerie && (
                        <div className="text-xs text-muted-foreground">
                          {a.numeroSerie}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {getCategoriaLabel(a.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {a.marca ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.modelo ?? ""}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {a.responsavel ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {a.localizacao ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirDetalhe(a.id)}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirMovimentacao(a)}
                              >
                                <ArrowRightLeft className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Movimentar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirEdicao(a)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Diálogos */}
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ativo={editando}
      />
      <AssetDetailDialog
        open={detalheOpen}
        onOpenChange={setDetalheOpen}
        ativoId={detalheId}
        onEdit={() => {
          setDetalheOpen(false);
          // Buscar o ativo da lista para edição
          const a = ativos?.find((x) => x.id === detalheId) ?? null;
          setEditando(a);
          setFormOpen(true);
        }}
        onMove={() => {
          setDetalheOpen(false);
          const a = ativos?.find((x) => x.id === detalheId) ?? null;
          setMovAtivo(a);
          setMovOpen(true);
        }}
        onDelete={() => {
          const a = ativos?.find((x) => x.id === detalheId);
          if (a) handleDelete(a);
        }}
      />
      <MovementDialog
        open={movOpen}
        onOpenChange={setMovOpen}
        ativo={movAtivo}
      />
    </div>
  );
}
