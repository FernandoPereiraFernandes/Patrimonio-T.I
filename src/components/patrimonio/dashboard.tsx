"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "./category-icon";
import { StatusBadge, MovimentacaoBadge } from "./badges";
import { useStats } from "@/lib/queries";
import { getCategoriaColor, getStatusInfo } from "@/lib/constants";
import {
  Package,
  Boxes,
  Wrench,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  History,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const valorTotalFmt = stats.valorTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const cards = [
    {
      label: "Total de Ativos",
      value: stats.totalAtivos,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
      hint: "Itens cadastrados",
    },
    {
      label: "Em Estoque",
      value: stats.emEstoque,
      icon: Boxes,
      color: "text-slate-600 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-800/60",
      hint: "Disponíveis no almoxarifado",
    },
    {
      label: "Em Uso",
      value: stats.emUso,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      hint: "Atribuídos a responsáveis",
    },
    {
      label: "Em Manutenção",
      value: stats.emManutencao,
      icon: Wrench,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      hint: "Fora de operação",
    },
  ];

  // stats.porCategoria já vem da API com label/labelSingular/icon de TODAS as
  // categorias ativas (padrão + customizadas), então nenhuma categoria nova fica de fora.
  const dadosCategoria = stats.porCategoria
    .filter((p) => p.count > 0)
    .map((p) => ({
      name: p.labelSingular,
      categoria: p.categoria,
      qtd: p.count,
      cor: getCategoriaColor(p.categoria),
    }));

  const dadosStatus = stats.porStatus.map((p) => ({
    name: getStatusInfo(p.status)?.label ?? p.status,
    value: p.count,
    cor:
      p.status === "EM_USO"
        ? "#10b981"
        : p.status === "EM_ESTOQUE"
        ? "#64748b"
        : p.status === "EM_MANUTENCAO"
        ? "#f59e0b"
        : "#ef4444",
  }));

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Painel Geral</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral do estoque e patrimônio de TI
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm">
          <DollarSign className="size-4 text-primary" />
          <span className="text-muted-foreground">Valor investido:</span>
          <span className="font-semibold">{valorTotalFmt}</span>
        </div>
      </div>

      {/* Cards de KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">
                    {c.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.hint}
                  </p>
                </div>
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${c.bg} ${c.color}`}
                >
                  <c.icon className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Ativos por categoria (barra) */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Ativos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosCategoria}
                  margin={{ top: 8, right: 8, left: -16, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border/50"
                  />
                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${value} itens`, "Quantidade"]}
                  />
                  <Bar dataKey="qtd" radius={[6, 6, 0, 0]}>
                    {dadosCategoria.map((entry, idx) => (
                      <Cell key={idx} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por status (pizza) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {dadosStatus.map((entry, idx) => (
                      <Cell key={idx} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {dadosStatus.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: s.cor }}
                    />
                    {s.name}
                  </span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista inferior: garantias + movimentações recentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Garantias vencendo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-500" />
              Garantias Vencendo (90 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.proximosGarantia.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nenhuma garantia vencendo nos próximos 90 dias.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
                {stats.proximosGarantia.map((a) => {
                  const vencida =
                    a.dataGarantia && new Date(a.dataGarantia) < new Date();
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-muted/40 cursor-pointer"
                      onClick={() => onNavigate("patrimonio")}
                    >
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CategoryIcon
                          categoria={a.categoria}
                          className="size-4"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {a.modelo ?? a.numeroPatrimonio}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {a.numeroPatrimonio}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-medium ${
                            vencida
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {vencida ? "Vencida" : "Vence em"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {a.dataGarantia
                            ? new Date(a.dataGarantia).toLocaleDateString(
                                "pt-BR"
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movimentações recentes */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="size-4 text-primary" />
              Movimentações Recentes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("movimentacoes")}
              className="text-xs"
            >
              Ver todas
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {stats.ultimasMovimentacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nenhuma movimentação registrada.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
                {stats.ultimasMovimentacoes.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 rounded-lg border p-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MovimentacaoBadge tipo={m.tipo} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.data).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {m.descricao ?? "—"}
                      </p>
                      {m.ativo && (
                        <p className="text-xs font-mono mt-1 text-foreground/70">
                          {m.ativo.numeroPatrimonio} · {m.ativo.marca}{" "}
                          {m.ativo.modelo}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
