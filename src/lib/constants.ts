// Constantes do sistema de patrimônio de TI

export type CategoriaAtivo =
  | "MONITOR"
  | "CPU"
  | "NOTEBOOK"
  | "TV"
  | "RACK"
  | "SERVIDOR"
  | "IMPRESSORA"
  | "IMPRESSORA_ZEBRA"
  | "SMARTPHONE"
  | "TELEFONE_FIXO";

export type StatusAtivo =
  | "EM_ESTOQUE"
  | "EM_USO"
  | "EM_MANUTENCAO"
  | "DESCARTADO";

export type TipoMovimentacao =
  | "ENTRADA_ESTOQUE"
  | "ATRIBUICAO"
  | "DEVOLUCAO"
  | "MANUTENCAO"
  | "DESCARTE"
  | "TRANSFERENCIA";

export interface CategoriaInfo {
  value: CategoriaAtivo;
  label: string;
  labelSingular: string;
  icon: string; // nome do ícone lucide
  // campos específicos sugeridos para essa categoria
  campos: string[];
}

export const CATEGORIAS: CategoriaInfo[] = [
  {
    value: "MONITOR",
    label: "Monitores",
    labelSingular: "Monitor",
    icon: "Monitor",
    campos: ["Polegadas", "Resolução", "Tipo de painel", "Conexões"],
  },
  {
    value: "CPU",
    label: "CPUs / Desktops",
    labelSingular: "CPU",
    icon: "Cpu",
    campos: ["Processador", "Memória RAM", "Armazenamento", "Sistema Operacional"],
  },
  {
    value: "NOTEBOOK",
    label: "Notebooks",
    labelSingular: "Notebook",
    icon: "Laptop",
    campos: ["Processador", "Memória RAM", "Armazenamento", "Tela", "Sistema Operacional"],
  },
  {
    value: "TV",
    label: "Televisões",
    labelSingular: "TV",
    icon: "Tv",
    campos: ["Polegadas", "Resolução", "Tipo", "Smart TV"],
  },
  {
    value: "RACK",
    label: "Racks",
    labelSingular: "Rack",
    icon: "Server",
    campos: ["Tamanho (U)", "Largura", "Ventilação", "Capacidade"],
  },
  {
    value: "SERVIDOR",
    label: "Servidores",
    labelSingular: "Servidor",
    icon: "HardDrive",
    campos: ["Processador", "Memória RAM", "Armazenamento", "Sistema Operacional", "Função"],
  },
  {
    value: "IMPRESSORA",
    label: "Impressoras",
    labelSingular: "Impressora",
    icon: "Printer",
    campos: ["Tipo", "Velocidade (ppm)", "Duplex", "Conectividade"],
  },
  {
    value: "IMPRESSORA_ZEBRA",
    label: "Impressoras Térmicas Zebra",
    labelSingular: "Impressora Térmica Zebra",
    icon: "Printer",
    campos: ["Modelo", "Resolução (dpi)", "Largura máxima", "Conectividade", "Uso"],
  },
  {
    value: "SMARTPHONE",
    label: "Smartphones",
    labelSingular: "Smartphone",
    icon: "Smartphone",
    campos: ["Armazenamento", "RAM", "Sistema Operacional", "Linha/Operadora"],
  },
  {
    value: "TELEFONE_FIXO",
    label: "Telefones Fixos",
    labelSingular: "Telefone Fixo",
    icon: "Phone",
    campos: ["Tipo", "Ramal", "Linhas", "Recursos"],
  },
];

export const STATUS: { value: StatusAtivo; label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" }[] = [
  { value: "EM_ESTOQUE", label: "Em Estoque", color: "slate", variant: "secondary" },
  { value: "EM_USO", label: "Em Uso", color: "emerald", variant: "default" },
  { value: "EM_MANUTENCAO", label: "Em Manutenção", color: "amber", variant: "outline" },
  { value: "DESCARTADO", label: "Descartado", color: "rose", variant: "destructive" },
];

export const TIPOS_MOVIMENTACAO: { value: TipoMovimentacao; label: string; color: string }[] = [
  { value: "ENTRADA_ESTOQUE", label: "Entrada em Estoque", color: "slate" },
  { value: "ATRIBUICAO", label: "Atribuição a Responsável", color: "emerald" },
  { value: "DEVOLUCAO", label: "Devolução ao Estoque", color: "cyan" },
  { value: "MANUTENCAO", label: "Envio para Manutenção", color: "amber" },
  { value: "DESCARTE", label: "Descarte", color: "rose" },
  { value: "TRANSFERENCIA", label: "Transferência de Local", color: "violet" },
];

export function getCategoria(value: string): CategoriaInfo | undefined {
  return CATEGORIAS.find((c) => c.value === value);
}

export function getCategoriaLabel(value: string): string {
  return getCategoria(value)?.labelSingular ?? value;
}

export function getStatusInfo(value: string) {
  return STATUS.find((s) => s.value === value);
}

export function getTipoMovimentacaoInfo(value: string) {
  return TIPOS_MOVIMENTACAO.find((t) => t.value === value);
}

// Cores por categoria para gráficos
export const CATEGORIA_COLORS: Record<string, string> = {
  MONITOR: "#10b981", // emerald
  CPU: "#0ea5e9", // sky
  NOTEBOOK: "#8b5cf6", // violet
  TV: "#f59e0b", // amber
  RACK: "#64748b", // slate
  SERVIDOR: "#ef4444", // red
  IMPRESSORA: "#ec4899", // pink
  IMPRESSORA_ZEBRA: "#14b8a6", // teal
  SMARTPHONE: "#84cc16", // lime
  TELEFONE_FIXO: "#f97316", // orange
};
