"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  User as UserIcon,
  Users,
  ChevronDown,
  Shield,
  Wrench,
  Eye,
} from "lucide-react";

const roleInfo: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ADMIN: { label: "Administrador", icon: Shield, color: "text-primary" },
  TECNICO: { label: "Técnico", icon: Wrench, color: "text-amber-600" },
  USUARIO: { label: "Usuário", icon: Eye, color: "text-muted-foreground" },
};

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!session?.user) return null;

  const role = session.user.role;
  const info = roleInfo[role] ?? roleInfo.USUARIO;
  const iniciais = session.user.name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2 gap-1.5">
          <Avatar className="size-7 border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {iniciais}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-xs font-medium max-w-[140px] truncate">
              {session.user.name}
            </span>
            <span className={`text-[10px] ${info.color} flex items-center gap-0.5`}>
              <info.icon className="size-2.5" />
              {info.label}
            </span>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium truncate">{session.user.name}</span>
            <span className="text-xs font-normal text-muted-foreground truncate">
              {session.user.email}
            </span>
            <Badge variant="outline" className="mt-1 w-fit text-[10px]">
              <info.icon className="size-3 mr-1" />
              {info.label}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role === "ADMIN" && (
          <DropdownMenuItem onClick={() => router.push("/usuarios")}>
            <Users className="size-4 mr-2" />
            Gerenciar Usuários
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4 mr-2" />
          Sair do sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
