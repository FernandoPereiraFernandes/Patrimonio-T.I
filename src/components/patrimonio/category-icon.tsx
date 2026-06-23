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
  type LucideIcon,
} from "lucide-react";

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
};

export function CategoryIcon({
  categoria,
  className,
}: {
  categoria: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[categoria] ?? Package;
  return <Icon className={className} />;
}
