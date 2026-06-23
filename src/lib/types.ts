// Tipos compartilhados do sistema de patrimônio de TI

import type { CategoriaAtivo, StatusAtivo, TipoMovimentacao } from "./constants";

export interface Ativo {
  id: string;
  numeroPatrimonio: string;
  numeroSerie: string | null;
  categoria: string;
  marca: string | null;
  modelo: string | null;
  descricao: string | null;
  especificacoes: string | null;
  status: string;
  localizacao: string | null;
  responsavel: string | null;
  setor: string | null;
  dataAquisicao: string | null;
  valorAquisicao: number | null;
  fornecedor: string | null;
  notaFiscal: string | null;
  dataGarantia: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { movimentacoes: number };
}

export interface Movimentacao {
  id: string;
  ativoId: string;
  tipo: string;
  descricao: string | null;
  responsavelAnterior: string | null;
  responsavelNovo: string | null;
  localizacaoAnterior: string | null;
  localizacaoNova: string | null;
  data: string;
  usuario: string | null;
  ativo?: Ativo;
}

export interface AtivoInput {
  numeroPatrimonio: string;
  numeroSerie?: string | null;
  categoria: CategoriaAtivo;
  marca?: string | null;
  modelo?: string | null;
  descricao?: string | null;
  especificacoes?: string | null;
  status: StatusAtivo;
  localizacao?: string | null;
  responsavel?: string | null;
  setor?: string | null;
  dataAquisicao?: string | null;
  valorAquisicao?: number | null;
  fornecedor?: string | null;
  notaFiscal?: string | null;
  dataGarantia?: string | null;
  observacoes?: string | null;
}

export interface MovimentacaoInput {
  ativoId: string;
  tipo: TipoMovimentacao;
  descricao?: string | null;
  responsavelNovo?: string | null;
  localizacaoNova?: string | null;
  usuario?: string | null;
}

export interface Stats {
  totalAtivos: number;
  porStatus: { status: string; count: number }[];
  porCategoria: { categoria: string; count: number }[];
  valorTotal: number;
  emEstoque: number;
  emUso: number;
  emManutencao: number;
  descartados: number;
  proximosGarantia: { id: string; numeroPatrimonio: string; modelo: string | null; dataGarantia: string | null; categoria: string }[];
  ultimasMovimentacoes: Movimentacao[];
}
