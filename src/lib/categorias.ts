"use client";

import { useQuery } from "@tanstack/react-query";

export interface CategoriaDinamica {
  id: string;
  value: string;
  label: string;
  labelSingular: string;
  icon: string;
  campos: string[];
  builtin: boolean;
  ativa: boolean;
  createdAt: string;
}

// Hook para buscar categorias dinâmicas (todas ativas)
// Usa rota pública para funcionar mesmo sem auth (para formulários)
export function useCategorias() {
  return useQuery<CategoriaDinamica[]>({
    queryKey: ["categorias-public"],
    queryFn: async () => {
      const res = await fetch("/api/categorias/public");
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      return res.json();
    },
    staleTime: 60 * 1000, // 1 min
  });
}

// Helper para obter info de uma categoria específica
export function getCategoriaInfo(
  categorias: CategoriaDinamica[] | undefined,
  value: string
): CategoriaDinamica | undefined {
  return categorias?.find((c) => c.value === value);
}
