"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  STATUS,
  type CategoriaAtivo,
  type StatusAtivo,
} from "@/lib/constants";
import { useCategorias } from "@/lib/categorias";
import { useCreateAtivo, useUpdateAtivo } from "@/lib/queries";
import type { Ativo, AtivoInput } from "@/lib/types";
import { CategoryIcon } from "@/components/patrimonio/category-icon";
import { Loader2, Save, X } from "lucide-react";

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ativo?: Ativo | null;
}

function toDateInput(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function AssetFormDialog({
  open,
  onOpenChange,
  ativo,
}: AssetFormDialogProps) {
  // key muda quando o dialog abre ou quando ativo muda -> força remontagem do form
  const formKey = `${open ? "open" : "closed"}-${ativo?.id ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        {open && (
          <AssetFormInner
            key={formKey}
            ativo={ativo}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

const EMPTY: AtivoInput = {
  numeroPatrimonio: "",
  numeroSerie: "",
  categoria: "MONITOR",
  marca: "",
  modelo: "",
  descricao: "",
  especificacoes: "",
  status: "EM_ESTOQUE",
  localizacao: "",
  responsavel: "",
  setor: "TI",
  dataAquisicao: "",
  valorAquisicao: 0,
  fornecedor: "",
  notaFiscal: "",
  dataGarantia: "",
  observacoes: "",
};

function AssetFormInner({
  ativo,
  onClose,
}: {
  ativo?: Ativo | null;
  onClose: () => void;
}) {
  const isEdit = !!ativo;

  // Inicializa state já com os valores corretos (sem useEffect)
  const initialSpecs: Record<string, string> = (() => {
    if (!ativo?.especificacoes) return {};
    try {
      return JSON.parse(ativo.especificacoes);
    } catch {
      return {};
    }
  })();

  const initialForm: AtivoInput = ativo
    ? {
        numeroPatrimonio: ativo.numeroPatrimonio,
        numeroSerie: ativo.numeroSerie ?? "",
        categoria: ativo.categoria as CategoriaAtivo,
        marca: ativo.marca ?? "",
        modelo: ativo.modelo ?? "",
        descricao: ativo.descricao ?? "",
        especificacoes: ativo.especificacoes ?? "",
        status: ativo.status as StatusAtivo,
        localizacao: ativo.localizacao ?? "",
        responsavel: ativo.responsavel ?? "",
        setor: ativo.setor ?? "",
        dataAquisicao: toDateInput(ativo.dataAquisicao),
        valorAquisicao: ativo.valorAquisicao ?? 0,
        fornecedor: ativo.fornecedor ?? "",
        notaFiscal: ativo.notaFiscal ?? "",
        dataGarantia: toDateInput(ativo.dataGarantia),
        observacoes: ativo.observacoes ?? "",
      }
    : EMPTY;

  const [form, setForm] = useState<AtivoInput>(initialForm);
  const [specs, setSpecs] = useState<Record<string, string>>(initialSpecs);
  const [valorStr, setValorStr] = useState(
    ativo?.valorAquisicao
      ? ativo.valorAquisicao.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })
      : ""
  );

  const createMut = useCreateAtivo();
  const updateMut = useUpdateAtivo();
  const { data: categorias } = useCategorias();

  const categoriaInfo = categorias?.find((c) => c.value === form.categoria);
  const camposCategoria = categoriaInfo?.campos ?? [];

  // Garantir que os campos de specs têm todos os campos da categoria atual
  const specsAtuais: Record<string, string> = {};
  camposCategoria.forEach((campo) => {
    specsAtuais[campo] = specs[campo] ?? "";
  });

  const handleValorChange = (v: string) => {
    setValorStr(v);
    const num = parseFloat(v.replace(/\./g, "").replace(",", "."));
    setForm((f) => ({ ...f, valorAquisicao: isNaN(num) ? 0 : num }));
  };

  const handleSubmit = async () => {
    if (!form.numeroPatrimonio.trim()) {
      toast.error("Informe o número de patrimônio");
      return;
    }
    if (!form.categoria) {
      toast.error("Selecione a categoria");
      return;
    }

    // Limpar especificações vazias
    const specsLimpos: Record<string, string> = {};
    Object.entries(specsAtuais).forEach(([k, v]) => {
      if (v && v.trim()) specsLimpos[k] = v.trim();
    });

    const payload: AtivoInput = {
      ...form,
      especificacoes:
        Object.keys(specsLimpos).length > 0
          ? JSON.stringify(specsLimpos)
          : null,
      dataAquisicao: form.dataAquisicao || null,
      dataGarantia: form.dataGarantia || null,
      valorAquisicao: form.valorAquisicao || null,
    };

    try {
      if (isEdit && ativo) {
        await updateMut.mutateAsync({ id: ativo.id, input: payload });
        toast.success("Ativo atualizado com sucesso!");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Ativo cadastrado com sucesso!");
      }
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar ativo");
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b bg-muted/30">
        <DialogTitle className="flex items-center gap-2 text-lg">
          {isEdit ? "Editar Ativo" : "Novo Ativo de TI"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? `Alterando dados do patrimônio ${ativo?.numeroPatrimonio}`
            : "Preencha os dados para cadastrar um novo item no patrimônio de TI."}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(92vh-9rem)] custom-scroll">
        <div className="px-6 py-5 space-y-6">
          {/* Seção 1: Identificação */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Identificação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="numPat">
                  Nº Patrimônio / Tombamento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numPat"
                  placeholder="Ex: TI-MON-0001"
                  value={form.numeroPatrimonio}
                  onChange={(e) =>
                    setForm({ ...form, numeroPatrimonio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numSerie">Nº de Série</Label>
                <Input
                  id="numSerie"
                  placeholder="Serial do fabricante"
                  value={form.numeroSerie ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, numeroSerie: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Categoria <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) =>
                    setForm({ ...form, categoria: v as CategoriaAtivo })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(categorias ?? []).map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon
                            categoria={c.value}
                            iconName={c.icon}
                            className="size-4"
                          />
                          {c.labelSingular}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as StatusAtivo })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Dell, HP, Zebra..."
                  value={form.marca ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, marca: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  placeholder="Ex: OptiPlex 7090"
                  value={form.modelo ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, modelo: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Seção 2: Especificações técnicas */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Especificações Técnicas · {categoriaInfo?.labelSingular ?? form.categoria}
            </h3>
            {camposCategoria.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {camposCategoria.map((campo) => (
                  <div key={campo} className="space-y-1.5">
                    <Label htmlFor={`spec-${campo}`}>{campo}</Label>
                    <Input
                      id={`spec-${campo}`}
                      placeholder={campo}
                      value={specsAtuais[campo] ?? ""}
                      onChange={(e) =>
                        setSpecs({ ...specs, [campo]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem campos específicos para esta categoria.{" "}
                {categoriaInfo?.builtin === false &&
                  "Você pode adicionar campos editando a categoria em Configurações > Categorias."}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição (livre)</Label>
              <Textarea
                id="descricao"
                rows={2}
                placeholder="Descrição complementar do equipamento"
                value={form.descricao ?? ""}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>
          </section>

          <Separator />

          {/* Seção 3: Localização e responsável */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Localização & Responsável
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="localizacao">Localização física</Label>
                <Input
                  id="localizacao"
                  placeholder="Ex: Sala 302, Almoxarifado Ti"
                  value={form.localizacao ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, localizacao: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setor">Setor</Label>
                <Input
                  id="setor"
                  placeholder="Ex: Financeiro, TI, RH"
                  value={form.setor ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, setor: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="responsavel">Responsável pelo uso</Label>
                <Input
                  id="responsavel"
                  placeholder="Pessoa que utiliza o equipamento"
                  value={form.responsavel ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, responsavel: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Seção 4: Aquisição */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Aquisição & Garantia
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dataAq">Data de aquisição</Label>
                <Input
                  id="dataAq"
                  type="date"
                  value={form.dataAquisicao ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, dataAquisicao: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valor">Valor de aquisição (R$)</Label>
                <Input
                  id="valor"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorStr}
                  onChange={(e) => handleValorChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  placeholder="Empresa fornecedora"
                  value={form.fornecedor ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, fornecedor: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nf">Nota Fiscal</Label>
                <Input
                  id="nf"
                  placeholder="Número da NF"
                  value={form.notaFiscal ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, notaFiscal: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="garantia">Validade da garantia</Label>
                <Input
                  id="garantia"
                  type="date"
                  value={form.dataGarantia ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, dataGarantia: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Seção 5: Observações */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Observações
            </h3>
            <Textarea
              rows={3}
              placeholder="Anotações sobre estado, acessórios, defeitos, etc."
              value={form.observacoes ?? ""}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
            />
          </section>
        </div>
      </ScrollArea>

      <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2">
        <Button variant="outline" onClick={onClose}>
          <X className="size-4 mr-1" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 mr-1 animate-spin" />
          ) : (
            <Save className="size-4 mr-1" />
          )}
          {isEdit ? "Salvar Alterações" : "Cadastrar Ativo"}
        </Button>
      </DialogFooter>
    </>
  );
}
