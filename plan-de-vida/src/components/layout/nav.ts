import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  House,
  Landmark,
  ListChecks,
  PiggyBank,
  Receipt,
  Repeat,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface ItemNav {
  href: string;
  label: string;
  icon: LucideIcon;
  hijos?: ItemNav[];
}

export const NAV: ItemNav[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/hoy", label: "Hoy", icon: Sun },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/habitos", label: "Hábitos", icon: ListChecks },
  { href: "/metas", label: "Metas", icon: Target },
  {
    href: "/finanzas",
    label: "Finanzas",
    icon: Wallet,
    hijos: [
      { href: "/finanzas", label: "Movimientos", icon: Receipt },
      { href: "/finanzas/suscripciones", label: "Fijos", icon: Repeat },
      { href: "/finanzas/huchas", label: "Huchas", icon: PiggyBank },
      { href: "/finanzas/patrimonio", label: "Patrimonio", icon: Landmark },
      { href: "/finanzas/inversion", label: "Inversión", icon: TrendingUp },
    ],
  },
  { href: "/diario", label: "Diario", icon: BookOpen },
  { href: "/revisiones", label: "Revisiones", icon: ClipboardCheck },
  { href: "/coach", label: "Coach", icon: Sparkles },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

/** Los cuatro fijos de la barra inferior del móvil; el resto va en "Más". */
export const NAV_MOVIL = ["/", "/hoy", "/habitos", "/finanzas"];

export function activo(pathname: string, href: string, exacto = false): boolean {
  if (href === "/" || exacto) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
