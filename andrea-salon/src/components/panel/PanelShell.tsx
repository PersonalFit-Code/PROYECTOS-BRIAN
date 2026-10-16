"use client";

import { BarChart3, CalendarDays, CalendarPlus, Download, Gift, LogOut, Scissors, Settings, Sun, Ticket, Users, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marco del panel: barra lateral en escritorio y pestañas abajo en el móvil (Andrea lo usa desde el
 * teléfono en el mostrador). Las secciones de la dueña solo aparecen si lo es; la página también lo
 * comprueba en el servidor, esto es solo para no enseñar botones que no llevan a nada.
 */
interface Props {
  rol: "owner" | "staff";
  nombre: string;
  salir: () => Promise<void>;
  children: ReactNode;
}

interface Item {
  href: string;
  label: string;
  /** Para la barra de abajo del móvil, donde cada pestaña tiene 72 px: «Catálogo de bonos» no cabe. */
  corto?: string;
  icon: LucideIcon;
  exacto?: boolean;
}

const COMUNES: Item[] = [
  { href: "/panel", label: "Hoy", icon: Sun, exacto: true },
  { href: "/panel/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/panel/citas/nueva", label: "Nueva cita", icon: CalendarPlus },
  { href: "/panel/clientas", label: "Clientas", icon: Users },
  { href: "/panel/bonos", label: "Bonos", icon: Ticket },
];

const DUENA: Item[] = [
  { href: "/panel/servicios", label: "Servicios", icon: Scissors },
  { href: "/panel/bonos-catalogo", label: "Catálogo de bonos", corto: "Catálogo", icon: Gift },
  { href: "/panel/equipo", label: "Equipo", icon: UserRound },
  { href: "/panel/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/panel/exportar", label: "Exportar", icon: Download },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings },
];

export default function PanelShell({ rol, nombre, salir, children }: Props) {
  const pathname = usePathname() ?? "/panel";
  const items = rol === "owner" ? [...COMUNES, ...DUENA] : COMUNES;
  const activo = (href: string, exacto?: boolean) => (exacto ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-[var(--capa-borde)] bg-white/70 p-4 lg:flex">
        <div className="px-2 pb-6 pt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-carmin-suave">Panel</p>
          <p className="font-display text-xl font-semibold">Andrea Salón</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Secciones del panel">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={activo(it.href, it.exacto) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-[15px] font-medium transition-colors",
                activo(it.href, it.exacto) ? "bg-carmin text-white" : "text-tinta hover:bg-rosa-niebla",
              )}
            >
              <it.icon aria-hidden className="size-5" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[var(--capa-borde)] pt-4">
          <p className="truncate px-2 text-sm text-gris">{nombre}</p>
          <form action={salir}>
            <button type="submit" className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm text-gris hover:bg-rosa-niebla hover:text-tinta">
              <LogOut aria-hidden className="size-4" /> Salir
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--capa-borde)] bg-crema/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-display text-lg font-semibold">Andrea Salón</p>
          <form action={salir}>
            <button type="submit" className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-gris" aria-label="Salir">
              <LogOut aria-hidden className="size-4" />
            </button>
          </form>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-8">
          {children}
        </main>
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-[var(--capa-borde)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          aria-label="Secciones del panel"
        >
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.corto ? it.label : undefined}
              aria-current={activo(it.href, it.exacto) ? "page" : undefined}
              className={cn(
                "flex min-h-16 min-w-[72px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                activo(it.href, it.exacto) ? "text-carmin" : "text-gris",
              )}
            >
              <it.icon aria-hidden className="size-5" />
              {it.corto ?? it.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
