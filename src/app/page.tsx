"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CategoryIcon } from "@/components/patrimonio/category-icon";
import { Dashboard } from "@/components/patrimonio/dashboard";
import { AssetList } from "@/components/patrimonio/asset-list";
import { MovementsView } from "@/components/patrimonio/movements-view";
import { ReportsView } from "@/components/patrimonio/reports-view";
import { ThemeToggle } from "@/components/patrimonio/theme-toggle";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  History,
  BarChart3,
  Menu,
  ServerCog,
  Github,
  Heart,
} from "lucide-react";

type View = "dashboard" | "patrimonio" | "movimentacoes" | "relatorios";

const NAV: { value: View; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "dashboard", label: "Painel", icon: LayoutDashboard, desc: "Visão geral" },
  { value: "patrimonio", label: "Patrimônio", icon: Boxes, desc: "Ativos cadastrados" },
  { value: "movimentacoes", label: "Movimentações", icon: History, desc: "Histórico" },
  { value: "relatorios", label: "Relatórios", icon: BarChart3, desc: "Análises" },
];

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navegar = (v: string) => {
    setView(v as View);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {/* Botão menu mobile */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent
                view={view}
                onNavigate={navegar}
              />
            </SheetContent>
          </Sheet>

          {/* Logo + título */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ServerCog className="size-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold leading-tight">
                PatrimônioTI
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Gestão de Estoque e Patrimônio de TI
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Setor de TI
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Conteúdo com sidebar */}
      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-sidebar">
          <SidebarContent view={view} onNavigate={navegar} />
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl animate-fade-in" key={view}>
            {view === "dashboard" && <Dashboard onNavigate={navegar} />}
            {view === "patrimonio" && <AssetList />}
            {view === "movimentacoes" && <MovementsView />}
            {view === "relatorios" && <ReportsView />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card">
        <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <ServerCog className="size-3.5 text-primary" />
            PatrimônioTI · Sistema de Controle de Estoque e Patrimônio de TI
          </p>
          <p className="flex items-center gap-1">
            Desenvolvido com
            <Heart className="size-3 fill-primary text-primary" /> para o setor
            de TI
          </p>
        </div>
      </footer>
    </div>
  );
}

function SidebarContent({
  view,
  onNavigate,
}: {
  view: string;
  onNavigate: (v: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo no topo do sidebar (mobile) */}
      <div className="lg:hidden flex h-16 items-center gap-2.5 border-b px-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ServerCog className="size-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold leading-tight text-sidebar-foreground">
            PatrimônioTI
          </h1>
          <p className="text-xs text-sidebar-foreground/60 leading-tight">
            Gestão de Patrimônio de TI
          </p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Menu
        </p>
        {NAV.map((item) => {
          const active = view === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onNavigate(item.value)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-4.5 shrink-0",
                  active ? "" : "group-hover:text-primary"
                )}
              />
              <div className="flex-1 text-left">
                <div>{item.label}</div>
                <div
                  className={cn(
                    "text-[11px] font-normal",
                    active
                      ? "text-sidebar-primary-foreground/70"
                      : "text-sidebar-foreground/50"
                  )}
                >
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Categorias rápidas */}
      <div className="p-3 border-t border-sidebar-border">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Categorias
        </p>
        <div className="grid grid-cols-2 gap-1.5 px-1">
          {[
            "MONITOR",
            "CPU",
            "NOTEBOOK",
            "TV",
            "RACK",
            "SERVIDOR",
            "IMPRESSORA",
            "IMPRESSORA_ZEBRA",
            "SMARTPHONE",
            "TELEFONE_FIXO",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => onNavigate("patrimonio")}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              title={cat}
            >
              <CategoryIcon
                categoria={cat}
                className="size-3.5 shrink-0 opacity-70"
              />
              <span className="truncate">
                {cat === "IMPRESSORA_ZEBRA" ? "Zebra" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <a
          href="#"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          <Github className="size-3.5" />
          v1.0.0 · Build TI
        </a>
      </div>
    </div>
  );
}
