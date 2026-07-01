"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  MoreVertical,
  Trash2,
  Pencil,
  Shield,
  Wrench,
  Eye,
  Loader2,
  Search,
  Mail,
} from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

const roleInfo: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" }> = {
  ADMIN: { label: "Administrador", icon: Shield, variant: "default" },
  TECNICO: { label: "Técnico", icon: Wrench, variant: "outline" },
  USUARIO: { label: "Usuário", icon: Eye, variant: "secondary" },
};

export default function UsuariosPage() {
  const { data: session } = useSession();
  const [busca, setBusca] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  const qc = useQueryClient();

  const { data: usuarios, isLoading } = useQuery<Usuario[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      return res.json();
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao excluir");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário excluído");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const toggleAtivoMut = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Status atualizado");
    },
  });

  const filtrados = (usuarios ?? []).filter((u) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-medium">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apenas administradores podem gerenciar usuários.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Usuários do Sistema
          </h2>
          <p className="text-sm text-muted-foreground">
            {usuarios?.length ?? 0} usuário(s) cadastrado(s)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditando(null);
            setFormOpen(true);
          }}
        >
          <UserPlus className="size-4 mr-1" />
          Novo Usuário
        </Button>
      </div>

      <Card className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
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
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="size-10 text-muted-foreground/40" />
            <h3 className="mt-3 font-medium">Nenhum usuário encontrado</h3>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((u) => {
                  const info = roleInfo[u.role] ?? roleInfo.USUARIO;
                  const isSelf = session?.user?.id === u.id;
                  const iniciais = u.nome
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {iniciais}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1.5">
                              {u.nome}
                              {isSelf && (
                                <Badge variant="outline" className="text-[10px] py-0">
                                  Você
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3.5" />
                          {u.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={info.variant} className="font-medium">
                          <info.icon className="size-3 mr-1" />
                          {info.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={u.ativo}
                          onCheckedChange={(v) =>
                            toggleAtivoMut.mutate({ id: u.id, ativo: v })
                          }
                          disabled={isSelf}
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
                                setEditando(u);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="size-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              disabled={isSelf}
                              onClick={() => {
                                if (
                                  confirm(
                                    `Excluir usuário ${u.nome}? Esta ação não pode ser desfeita.`
                                  )
                                ) {
                                  deleteMut.mutate(u.id);
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editando={editando}
      />
    </div>
  );
}

function UserFormDialog({
  open,
  onOpenChange,
  editando,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editando: Usuario | null;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("USUARIO");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // Resetar quando abrir
  useState(() => {});

  // Sincronizar quando muda o editando
  if (open && editando && nome === "" && email === "") {
    setNome(editando.nome);
    setEmail(editando.email);
    setRole(editando.role);
    setAtivo(editando.ativo);
  }

  const reset = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setRole("USUARIO");
    setAtivo(true);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    if (!nome || !email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }
    if (!editando && !senha) {
      toast.error("Senha é obrigatória para novo usuário");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = { nome, email, role, ativo };
      if (senha) payload.senha = senha;

      const url = editando
        ? `/api/users/${editando.id}`
        : "/api/users";
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

      toast.success(editando ? "Usuário atualizado!" : "Usuário criado!");
      qc.invalidateQueries({ queryKey: ["users"] });
      handleClose(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            {editando ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? "Altere os dados do usuário. Deixe a senha em branco para manter a atual."
              : "Preencha os dados para criar um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@empresa.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">
              {editando ? "Nova senha (opcional)" : "Senha"}
            </Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={editando ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Perfil de acesso</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4" />
                    Administrador (acesso total)
                  </div>
                </SelectItem>
                <SelectItem value="TECNICO">
                  <div className="flex items-center gap-2">
                    <Wrench className="size-4" />
                    Técnico (cadastra/movimenta ativos)
                  </div>
                </SelectItem>
                <SelectItem value="USUARIO">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4" />
                    Usuário (somente visualização)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="ativo" className="cursor-pointer">
                Conta ativa
              </Label>
              <p className="text-xs text-muted-foreground">
                Usuários inativos não podem fazer login
              </p>
            </div>
            <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="size-4 mr-1 animate-spin" />}
            {editando ? "Salvar" : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
