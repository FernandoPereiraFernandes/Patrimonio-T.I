"use client";

import {
  Monitor,
  Cpu,
  Laptop,
  Tv,
  Server,
  HardDrive,
  Printer,
  Smartphone,
  Phone,
  Package,
  Tablet,
  Wifi,
  Router,
  Network,
  Cable,
  Battery,
  Camera,
  Keyboard,
  Mouse,
  Headphones,
  Speaker,
  MemoryStick,
  CircuitBoard,
  type LucideIcon,
} from "lucide-react";

// Mapa completo de ícones suportados (built-in + customizados)
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  MONITOR: Monitor,
  CPU: Cpu,
  NOTEBOOK: Laptop,
  TV: Tv,
  RACK: Server,
  SERVIDOR: HardDrive,
  IMPRESSORA: Printer,
  IMPRESSORA_ZEBRA: Printer,
  SMARTPHONE: Smartphone,
  TELEFONE_FIXO: Phone,
  // Ícones extras para categorias customizadas
  Package,
  Tablet,
  Wifi,
  Router,
  Network,
  Cable,
  Battery,
  Camera,
  Keyboard,
  Mouse,
  Headphones,
  Speaker,
  HardDriveDownload: HardDrive,
  MemoryStick,
  CircuitBoard,
};

export function CategoryIcon({
  categoria,
  className,
  iconName,
}: {
  categoria: string;
  className?: string;
  iconName?: string; // override: usar ícone pelo nome
}) {
  // Prioridade: iconName > categoria > Package
  const Icon =
    (iconName && CATEGORY_ICONS[iconName]) ||
    CATEGORY_ICONS[categoria] ||
    Package;
  return <Icon className={className} />;
}
