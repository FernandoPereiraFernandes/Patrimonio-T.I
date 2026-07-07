"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "./category-icon";
import { useAtivos, useStats } from "@/lib/queries";
import { useCategorias } from "@/lib/categorias";
import { getCategoriaColor } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { PieChart as PieIcon, BarChart3, MapPin, Building2 } from "lucide-react";

export function ReportsView() {
  const { data: ativos, isLoading: loadingAtivos } = useAtivos();
  const { data: stats, isLoading: loadingStats } = useStats();
  const { data: categorias, isLoading: loadingCategorias } = useCategorias();

  if (loadingAtivos || loadingStats || loadingCategorias || !ativos || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const listaCategorias = categorias ?? [];

  // Valor por categoria — agora percorre TODAS as categorias ativas (padrão + customizadas)
  const valorPorCategoria = listaCategorias
    .map((c) => {
      const itens = ativos.filter(
        (a: { categoria: string; valorAquisicao: number | null }) =>
          a.categoria === c.value
      );
      const valor = itens.reduce(
        (acc: number, a: { valorAquisicao: number | null }) =>
          acc + (a.valorAquisicao ?? 0),
        0
      );
      return {
        name: c.labelSingular,
        categoria: c.value,
        valor,
        qtd: itens.length,
      };
    })
    .filter((d) => d.qtd > 0)
    .sort((a, b) => b.valor - a.valor);

  // Por setor
  const setorMap = new Map<string, number>();
  ativos.forEach((a: { setor: string | null }) => {
    const s = a.setor || "Sem setor";
    setorMap.set(s, (setorMap.get(s) ?? 0) + 1);
  });
  const porSetor = Array.from(setorMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Por localização
  const locMap = new Map<string, number>();
  ativos.forEach((a: { localizacao: string | null }) => {
    const l = a.localizacao || "Sem localização";
    locMap.set(l, (locMap.get(l) ?? 0) + 1);
  });
  const porLocal = Array.from(locMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const totalAtivos = ativos.length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Análises detalhadas do patrimônio por categoria, setor e localização.
        </p>
      </div>

      {/* Valor investido por categoria */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            Valor Investido por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valorPorCategoria}
                margin={{ top: 8, right: 8, left: 8, bottom: 50 }}
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
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v}`
                  }
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
                  formatter={(value: number) => [
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }),
                    "Valor",
                  ]}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {valorPorCategoria.map((entry, idx) => (
                    <Cell key={idx} fill={getCategoriaColor(entry.categoria)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Distribuição por setor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Distribuição por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porSetor}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    labelLine={false}
                  >
                    {porSetor.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          [
                            "#10b981",
                            "#0ea5e9",
                            "#8b5cf6",
                            "#f59e0b",
                            "#ef4444",
                            "#ec4899",
                            "#14b8a6",
                            "#84cc16",
                          ][idx % 8]
                        }
                      />
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
          </CardContent>
        </Card>

        {/* Por localização */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Top Localizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {porLocal.map((l, idx) => {
                const pct = (l.value / totalAtivos) * 100;
                return (
                  <div key={l.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{l.name}</span>
                      <span className="font-medium ml-2">
                        {l.value} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${pct}%`,
                          background: `hsl(${160 + idx * 12} 70% 45%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por categoria */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieIcon className="size-4 text-primary" />
            Resumo por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {listaCategorias
              .filter((c) =>
                stats.porCategoria.some(
                  (p) => p.categoria === c.value && p.count > 0
                )
              )
              .map((c) => {
                const dados = stats.porCategoria.find(
                  (p) => p.categoria === c.value
                );
                const valorCat = valorPorCategoria.find(
                  (v) => v.categoria === c.value
                );
                const cor = getCategoriaColor(c.value);
                return (
                  <div
                    key={c.value}
                    className="rounded-lg border p-3 flex items-center gap-3"
                  >
                    <div
                      className="flex size-10 items-center justify-center rounded-lg shrink-0"
                      style={{
                        background: `${cor}22`,
                        color: cor,
                      }}
                    >
                      <CategoryIcon
                        categoria={c.value}
                        iconName={c.icon}
                        className="size-5"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {c.labelSingular}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dados?.count ?? 0}{" "}
                        {(dados?.count ?? 0) === 1 ? "item" : "itens"}
                        {valorCat && valorCat.valor > 0 && (
                          <>
                            {" · "}
                            {valorCat.valor.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
