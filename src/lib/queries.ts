"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { AtivoInput, MovimentacaoInput } from "./types";
import type { CategoriaAtivo, StatusAtivo } from "./constants";

// ===== Queries =====

export function useAtivos(filters?: {
  categoria?: string;
  status?: string;
  busca?: string;
  localizacao?: string;
  setor?: string;
  responsavel?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.categoria) params.set("categoria", filters.categoria);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.busca) params.set("busca", filters.busca);
  if (filters?.localizacao) params.set("localizacao", filters.localizacao);
  if (filters?.setor) params.set("setor", filters.setor);
  if (filters?.responsavel) params.set("responsavel", filters.responsavel);

  const qs = params.toString();
  return useQuery({
    queryKey: ["ativos", filters],
    queryFn: async () => {
      const res = await fetch(`/api/ativos${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Erro ao carregar ativos");
      return res.json();
    },
  });
}

export function useAtivo(id: string | null) {
  return useQuery({
    queryKey: ["ativo", id],
    queryFn: async () => {
      const res = await fetch(`/api/ativos/${id}`);
      if (!res.ok) throw new Error("Erro ao carregar ativo");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/ativos/stats");
      if (!res.ok) throw new Error("Erro ao carregar estatísticas");
      return res.json();
    },
    refetchInterval: 60 * 1000,
  });
}

export function useMovimentacoes(filters?: {
  ativoId?: string;
  tipo?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.ativoId) params.set("ativoId", filters.ativoId);
  if (filters?.tipo) params.set("tipo", filters.tipo);
  if (filters?.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return useQuery({
    queryKey: ["movimentacoes", filters],
    queryFn: async () => {
      const res = await fetch(`/api/movimentacoes${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Erro ao carregar movimentações");
      return res.json();
    },
  });
}

// ===== Mutations =====

export function useCreateAtivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AtivoInput) => {
      const res = await fetch("/api/ativos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar ativo");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ativos"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });
}

export function useUpdateAtivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AtivoInput }) => {
      const res = await fetch(`/api/ativos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar ativo");
      }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["ativos"] });
      qc.invalidateQueries({ queryKey: ["ativo", vars.id] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });
}

export function useDeleteAtivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ativos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir ativo");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ativos"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });
}

export function useCreateMovimentacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MovimentacaoInput) => {
      const res = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao registrar movimentação");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ativos"] });
      qc.invalidateQueries({ queryKey: ["ativo"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });
}

// Helpers de tipo para uso nos formulários
export type { AtivoInput, MovimentacaoInput, CategoriaAtivo, StatusAtivo };
