"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon, isIconeConhecido } from "@/components/patrimonio/category-icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Tags,
  Plus,
  MoreVertical,
  Trash2,
  Pencil,
  Shield,
  Loader2,
  Search,
  X,
  Save,
  Lock,
  AlertTriangle,
} from "lucide-react";

interface Categoria {
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

const ICONES_DISPONIVEIS = [
  "Monitor", "Cpu", "Laptop", "Tv", "Server", "HardDrive",
  "Printer", "Smartphone", "Phone", "Package", "Tablet",
  "Wifi", "Router", "Network", "Cable", "Battery",
  "Camera", "Keyboard", "Mouse", "Headphones", "Speaker",
  "HardDriveDownload", "MemoryStick", "CircuitBoard",
  "Zap", "Radio", "Bluetooth", "Usb", "Disc", "Save",
  "FileText", "Folder", "FolderOpen", "Layers", "Box", "Boxes",
  "Truck", "ShoppingCart", "CreditCard", "Lock", "Unlock", "Key",
  "Settings", "Cog", "Wrench", "QrCode", "Barcode", "Fingerprint",
  "Video", "Gamepad2", "Watch", "Gauge", "Thermometer", "Fan",
  "Plug", "PlugZap", "BatteryCharging", "Lightbulb", "Power",
  "Database", "Cloud", "CloudUpload", "Share2", "Link", "Link2",
  "Globe", "ScanLine",
];

const OPCAO_ICONE_CUSTOM = "__CUSTOM__";

export default function CategoriasPage() {
  const { data: session } = useSession();
  const [busca, setBusca] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);

  const qc = useQueryClient();

  const { data: categorias, isLoading } = useQuery<Categoria[]>({
    queryKey: ["categorias"],
    queryFn: async () => {
      const res = await fetch("/api/categorias");
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      return res.json();
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao excluir");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria excluída");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const toggleAtivaMut = useMutation({
    mutationFn: async ({ id, ativa }: { id: string; ativa: boolean }) => {
      const res = await fetch(`/api/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativa }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Status atualizado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const filtradas = (categorias ?? []).filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      c.label.toLowerCase().includes(q) ||
      c.labelSingular.toLowerCase().includes(q) ||
      c.value.toLowerCase().includes(q)
    );
  });

  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-medium">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apenas administradores podem gerenciar categorias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Tags className="size-5 text-primary" />
            Categorias de Ativos
          </h2>
          <p className="text-sm text-muted-foreground">
            {categorias?.length ?? 0} categoria(s) ·{" "}
            {categorias?.filter((c) => c.builtin).length ?? 0} padrão do sistema
            · {categorias?.filter((c) => !c.builtin).length ?? 0} customizada(s)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditando(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4 mr-1" />
          Nova Categoria
        </Button>
      </div>

      <Card className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Tags className="size-10 text-muted-foreground/40" />
            <h3 className="mt-3 font-medium">Nenhuma categoria encontrada</h3>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[60px]">Ícone</TableHead>
                  <TableHead>Nome (singular / plural)</TableHead>
                  <TableHead className="hidden md:table-cell">Chave</TableHead>
                  <TableHead className="hidden lg:table-cell">Campos</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CategoryIcon
                          categoria={c.value}
                          iconName={c.icon}
                          className="size-4"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{c.labelSingular}</div>
                      <div className="text-xs text-muted-foreground">{c.label}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs px-1.5 py-0.5 rounded bg-muted">
                        {c.value}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.campos.slice(0, 3).map((campo) => (
                          <Badge key={campo} variant="outline" className="text-[10px] py-0">
                            {campo}
                          </Badge>
                        ))}
                        {c.campos.length > 3 && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            +{c.campos.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.builtin ? (
                        <Badge variant="secondary" className="font-medium">
                          <Lock className="size-3 mr-1" />
                          Padrão
                        </Badge>
                      ) : (
                        <Badge className="font-medium bg-primary/10 text-primary border-primary/20">
                          Customizada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={c.ativa}
                        onCheckedChange={(v) =>
                          toggleAtivaMut.mutate({ id: c.id, ativa: v })
                        }
                        disabled={c.builtin}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditando(c);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            disabled={c.builtin}
                            onClick={() => {
                              if (
                                confirm(
                                  `Excluir categoria "${c.labelSingular}"? Esta ação não pode ser desfeita.`
                                )
                              ) {
                                deleteMut.mutate(c.id);
                              }
                            }}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <CategoriaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editando={editando}
      />
    </div>
  );
}

// =================== Formulário de Categoria ===================

function CategoriaFormDialog({
  open,
  onOpenChange,
  editando,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editando: Categoria | null;
}) {
  const qc = useQueryClient();
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [labelSingular, setLabelSingular] = useState("");
  const [icon, setIcon] = useState("Package");
  // Controla se o Select está no modo "digitar nome customizado"
  const [iconModoCustom, setIconModoCustom] = useState(false);
  const [campos, setCampos] = useState<string[]>([]);
  const [novoCampo, setNovoCampo] = useState("");
  const [saving, setSaving] = useState(false);

  // Sincronizar quando muda o editando (key remonta o componente)
  const formKey = `${open ? "open" : "closed"}-${editando?.id ?? "new"}`;

  const handleClose = (v: boolean) => {
    if (!v) {
      // reset ao fechar
      setValue("");
      setLabel("");
      setLabelSingular("");
      setIcon("Package");
      setIconModoCustom(false);
      setCampos([]);
      setNovoCampo("");
    }
    onOpenChange(v);
  };

  const adicionarCampo = () => {
    if (!novoCampo.trim()) return;
    if (campos.includes(novoCampo.trim())) {
      toast.error("Campo já existe");
      return;
    }
    setCampos([...campos, novoCampo.trim()]);
    setNovoCampo("");
  };

  const removerCampo = (campo: string) => {
    setCampos(campos.filter((c) => c !== campo));
  };

  const handleSubmit = async () => {
    if (!label || !labelSingular) {
      toast.error("Nome (singular e plural) é obrigatório");
      return;
    }
    if (!editando && !value) {
      toast.error("Chave da categoria é obrigatória");
      return;
    }
    if (!icon.trim()) {
      toast.error("Informe um ícone");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        label,
        labelSingular,
        icon: icon.trim(),
        campos,
      };
      if (!editando) payload.value = value.toUpperCase();

      const url = editando
        ? `/api/categorias/${editando.id}`
        : "/api/categorias";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao salvar");
      }

      toast.success(editando ? "Categoria atualizada!" : "Categoria criada!");
      qc.invalidateQueries({ queryKey: ["categorias"] });
      handleClose(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  // Inicializa valores quando abre (controlado por key no wrapper)
  if (open && editando && value === "" && label === "") {
    setValue(editando.value);
    setLabel(editando.label);
    setLabelSingular(editando.labelSingular);
    setIcon(editando.icon);
    setIconModoCustom(!ICONES_DISPONIVEIS.includes(editando.icon));
    setCampos(editando.campos || []);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" key={formKey}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="size-5 text-primary" />
            {editando ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? `Editando "${editando.labelSingular}". A chave não pode ser alterada.`
              : "Crie uma categoria customizada para novos tipos de ativos."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Chave (value) */}
          {!editando && (
            <div className="space-y-1.5">
              <Label htmlFor="value">
                Chave (identificador único) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                placeholder="Ex: TABLET, LEITOR_CODIGO, WEBCAM"
                value={value}
                onChange={(e) =>
                  setValue(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))
                }
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Apenas letras maiúsculas, números e underline. Esta chave não
                poderá ser alterada depois.
              </p>
            </div>
          )}

          {/* Nomes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="labelSingular">
                Nome (singular) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="labelSingular"
                placeholder="Ex: Tablet"
                value={labelSingular}
                onChange={(e) => setLabelSingular(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label">
                Nome (plural) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="label"
                placeholder="Ex: Tablets"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>

          {/* Ícone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Ícone</Label>
              <div className="flex items-center gap-1">
                <div className="flex size-7 items-center justify-center rounded-md border bg-muted/40">
                  <CategoryIcon
                    categoria="CUSTOM"
                    iconName={icon}
                    className="size-4"
                  />
                </div>
              </div>
            </div>

            {!iconModoCustom ? (
              <Select
                value={icon}
                onValueChange={(v) => {
                  if (v === OPCAO_ICONE_CUSTOM) {
                    setIconModoCustom(true);
                    setIcon("");
                  } else {
                    setIcon(v);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {ICONES_DISPONIVEIS.map((ic) => (
                    <SelectItem key={ic} value={ic}>
                      <span className="flex items-center gap-2">
                        <CategoryIcon
                          categoria="CUSTOM"
                          iconName={ic}
                          className="size-4"
                        />
                        {ic}
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value={OPCAO_ICONE_CUSTOM}>
                    <span className="text-primary font-medium">
                      + Digitar outro nome de ícone...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Zap, Radio, Truck, Fingerprint..."
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIconModoCustom(false);
                      setIcon("Package");
                    }}
                  >
                    Usar lista
                  </Button>
                </div>
                {icon && !isIconeConhecido(icon) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                    <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                    Ícone &quot;{icon}&quot; não reconhecido pelo sistema — vai
                    aparecer como ícone padrão até alguém adicionar esse nome
                    na lista de ícones suportados. Confira o nome exato em{" "}
                    <a
                      href="https://lucide.dev/icons"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      lucide.dev/icons
                    </a>
                    .
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Campos específicos */}
          <div className="space-y-1.5">
            <Label>Campos específicos (para especificações técnicas)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Polegadas, Resolução..."
                value={novoCampo}
                onChange={(e) => setNovoCampo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarCampo();
                  }
                }}
              />
              <Button type="button" onClick={adicionarCampo} size="icon">
                <Plus className="size-4" />
              </Button>
            </div>
            {campos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {campos.map((campo) => (
                  <Badge
                    key={campo}
                    variant="outline"
                    className="py-1 pl-2 pr-1 gap-1"
                  >
                    {campo}
                    <button
                      type="button"
                      onClick={() => removerCampo(campo)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Estes campos aparecerão no formulário de cadastro de ativos desta
              categoria.
            </p>
          </div>

          {editando?.builtin && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Lock className="size-3.5 mt-0.5 shrink-0" />
              <span>
                Esta é uma categoria padrão do sistema. Você pode editar nome,
                ícone e campos, mas não pode desativá-la ou excluí-la.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : editando ? (
              <Save className="size-4 mr-1" />
            ) : (
              <Plus className="size-4 mr-1" />
            )}
            {editando ? "Salvar" : "Criar Categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
