"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
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
import { useCategorias } from "@/lib/categorias";
import { STATUS, getCategoriaLabel, compareNumeroPatrimonio } from "@/lib/constants";
import type { Ativo } from "@/lib/types";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Filter,
  Eye,
  ArrowRightLeft,
  Pencil,
  Copy,
  Inbox,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TAMANHOS_PAGINA = [10, 20, 30, 50];

export function AssetList() {
  const { data: session } = useSession();
  // ADMIN e TECNICO podem criar/editar/excluir/movimentar.
  // USUARIO (perfil padrão) só visualiza.
  const podeEditar =
    session?.user?.role === "ADMIN" || session?.user?.role === "TECNICO";

  const { data: categorias } = useCategorias();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [filtroMarcaModelo, setFiltroMarcaModelo] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [filtroLocalizacao, setFiltroLocalizacao] = useState("");

  // Paginação
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Ativo | null>(null);
  const [duplicando, setDuplicando] = useState<Ativo | null>(null);
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [movOpen, setMovOpen] = useState(false);
  const [movAtivo, setMovAtivo] = useState<Ativo | null>(null);

  const deleteMut = useDeleteAtivo();

  // Filtros que vão para a API (mantém o comportamento original)
  const filters = useMemo(
    () => ({
      busca: busca || undefined,
      categoria: categoria !== "ALL" ? categoria : undefined,
      status: status !== "ALL" ? status : undefined,
    }),
    [busca, categoria, status]
  );

  const { data: ativosRaw, isLoading } = useAtivos(filters);

  // Filtros adicionais por coluna (marca/modelo, responsável, localização),
  // aplicados no cliente sobre o resultado já filtrado pela API. Em seguida,
  // ordena por número de patrimônio em ordem NUMÉRICA (001, 002, ..., 010),
  // e não alfabética (que colocaria "010" antes de "002").
  const ativos = useMemo(() => {
    if (!ativosRaw) return ativosRaw;
    const filtrados = ativosRaw.filter((a: Ativo) => {
      if (filtroMarcaModelo) {
        const q = filtroMarcaModelo.toLowerCase();
        const txt = `${a.marca ?? ""} ${a.modelo ?? ""}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      if (filtroResponsavel) {
        const q = filtroResponsavel.toLowerCase();
        if (!(a.responsavel ?? "").toLowerCase().includes(q)) return false;
      }
      if (filtroLocalizacao) {
        const q = filtroLocalizacao.toLowerCase();
        if (!(a.localizacao ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return [...filtrados].sort((a, b) =>
      compareNumeroPatrimonio(a.numeroPatrimonio, b.numeroPatrimonio)
    );
  }, [ativosRaw, filtroMarcaModelo, filtroResponsavel, filtroLocalizacao]);

  // Sempre que um filtro ou o tamanho de página muda, volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [busca, categoria, status, filtroMarcaModelo, filtroResponsavel, filtroLocalizacao, pageSize]);

  const totalFiltrado = ativos?.length ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / pageSize));
  const paginaAtual = Math.min(page, totalPaginas);

  const ativosPaginados = useMemo(() => {
    if (!ativos) return ativos;
    const inicio = (paginaAtual - 1) * pageSize;
    return ativos.slice(inicio, inicio + pageSize);
  }, [ativos, paginaAtual, pageSize]);

  const abrirNovo = () => {
    setEditando(null);
    setDuplicando(null);
    setFormOpen(true);
  };

  const abrirEdicao = (a: Ativo) => {
    setEditando(a);
    setDuplicando(null);
    setFormOpen(true);
  };

  const abrirDuplicar = (a: Ativo) => {
    setEditando(null);
    setDuplicando(a);
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
    setFiltroMarcaModelo("");
    setFiltroResponsavel("");
    setFiltroLocalizacao("");
  };

  const temFiltroAtivo =
    !!busca ||
    categoria !== "ALL" ||
    status !== "ALL" ||
    !!filtroMarcaModelo ||
    !!filtroResponsavel ||
    !!filtroLocalizacao;

  const categoriaInfo = (value: string) =>
    categorias?.find((c) => c.value === value);

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Patrimônio de TI
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalFiltrado} {totalFiltrado === 1 ? "item cadastrado" : "itens cadastrados"}
          </p>
        </div>
        {podeEditar && (
          <Button onClick={abrirNovo} className="self-start sm:self-auto">
            <Plus className="size-4 mr-1" />
            Novo Ativo
          </Button>
        )}
      </div>

      {/* Busca geral */}
      <Card className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por patrimônio, série, marca, modelo, responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Filtros por coluna: categoria, marca/modelo, responsável, localização, status */}
      <Card className="p-3">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Filter className="size-3.5" />
          Filtros por coluna
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas categorias</SelectItem>
              {(categorias ?? []).map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="flex items-center gap-2">
                    <CategoryIcon
                      categoria={c.value}
                      iconName={c.icon}
                      className="size-3.5"
                    />
                    {c.labelSingular}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Marca / Modelo"
            value={filtroMarcaModelo}
            onChange={(e) => setFiltroMarcaModelo(e.target.value)}
          />

          <Input
            placeholder="Responsável"
            value={filtroResponsavel}
            onChange={(e) => setFiltroResponsavel(e.target.value)}
          />

          <Input
            placeholder="Localização"
            value={filtroLocalizacao}
            onChange={(e) => setFiltroLocalizacao(e.target.value)}
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
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
        </div>
        {temFiltroAtivo && (
          <div className="mt-2">
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="size-3.5 mr-1" />
              Limpar filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : totalFiltrado === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">Nenhum ativo encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {temFiltroAtivo
                ? "Tente ajustar os filtros de busca."
                : "Comece cadastrando o primeiro item de patrimônio."}
            </p>
            {!temFiltroAtivo && podeEditar && (
              <Button onClick={abrirNovo} className="mt-4" size="sm">
                <Plus className="size-4 mr-1" />
                Cadastrar Ativo
              </Button>
            )}
          </div>
        ) : (
          <>
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
                  {ativosPaginados?.map((a) => {
                    const catInfo = categoriaInfo(a.categoria);
                    return (
                      <TableRow
                        key={a.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => abrirDetalhe(a.id)}
                      >
                        <TableCell>
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CategoryIcon
                              categoria={a.categoria}
                              iconName={catInfo?.icon}
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
                            {catInfo?.labelSingular ?? getCategoriaLabel(a.categoria)}
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
                            {podeEditar && (
                              <>
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
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => abrirDuplicar(a)}
                                      >
                                        <Copy className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicar</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Itens por página:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAMANHOS_PAGINA.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="hidden sm:inline">
                  · Mostrando {(paginaAtual - 1) * pageSize + 1}–
                  {Math.min(paginaAtual * pageSize, totalFiltrado)} de {totalFiltrado}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={paginaAtual <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm px-2 whitespace-nowrap">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={paginaAtual >= totalPaginas}
                  onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Diálogos (só fazem sentido para quem pode editar, mas o guard real está no middleware/API) */}
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ativo={editando}
        duplicarDe={duplicando}
      />
      <AssetDetailDialog
        open={detalheOpen}
        onOpenChange={setDetalheOpen}
        ativoId={detalheId}
        onEdit={
          podeEditar
            ? () => {
                setDetalheOpen(false);
                const a = ativos?.find((x) => x.id === detalheId) ?? null;
                setEditando(a);
                setDuplicando(null);
                setFormOpen(true);
              }
            : undefined
        }
        onMove={
          podeEditar
            ? () => {
                setDetalheOpen(false);
                const a = ativos?.find((x) => x.id === detalheId) ?? null;
                setMovAtivo(a);
                setMovOpen(true);
              }
            : undefined
        }
        onDelete={
          podeEditar
            ? () => {
                const a = ativos?.find((x) => x.id === detalheId);
                if (a) handleDelete(a);
              }
            : undefined
        }
      />
      <MovementDialog
        open={movOpen}
        onOpenChange={setMovOpen}
        ativo={movAtivo}
      />
    </div>
  );
}
