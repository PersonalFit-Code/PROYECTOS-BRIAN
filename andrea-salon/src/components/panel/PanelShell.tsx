"use client";

import { BarChart3, CalendarDays, CalendarPlus, Download, Ellipsis, Gift, LogOut, Scissors, Settings, Sun, Ticket, Users, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marco del panel: barra lateral en escritorio y pestañas abajo en el móvil (Andrea lo usa desde el
 * teléfono en el mostrador). Las secciones de la dueña solo aparecen si lo es; la página también lo
 * comprueba en el servidor, esto es solo para no enseñar botones que no llevan a nada.
 *
 * En el móvil caben cinco pestañas. La empleada tiene justo cinco; la dueña tiene once, así que ve
 * las cuatro del día a día y «Más», que despliega el resto encima de la barra. (Antes la barra se
 * desplazaba de lado y las secciones de la dueña quedaban fuera de la pantalla sin ninguna pista.)
 */
interface Props {
  rol: "owner" | "staff";
  nombre: string;
  salir: () => Promise<void>;
  /** Panel sin contraseña (desarrollo): franja de aviso y sin «Salir». */
  sinLogin?: boolean;
  children: ReactNode;
}

interface Item {
  href: string;
  label: string;
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
  { href: "/panel/bonos-catalogo", label: "Catálogo de bonos", icon: Gift },
  { href: "/panel/equipo", label: "Equipo", icon: UserRound },
  { href: "/panel/analitica", label: "Analítica", icon: BarChart3 },
  { href: "/panel/exportar", label: "Exportar", icon: Download },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings },
];

export default function PanelShell({ rol, nombre, salir, sinLogin = false, children }: Props) {
  const pathname = usePathname() ?? "/panel";
  const items = rol === "owner" ? [...COMUNES, ...DUENA] : COMUNES;
  const activo = (href: string, exacto?: boolean) => (exacto ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const enBarra = rol === "owner" ? COMUNES.slice(0, 4) : COMUNES;
  const enMas = rol === "owner" ? [...COMUNES.slice(4), ...DUENA] : [];
  const masActivo = enMas.some((it) => activo(it.href, it.exacto));

  const [masAbierto, setMasAbierto] = useState(false);
  /* Cambiar de página (también con una pestaña de la barra, que queda por encima del velo) cierra
     «Más». Se ajusta en el render, el patrón de React para estado derivado de un cambio de prop. */
  const [rutaVista, setRutaVista] = useState(pathname);
  if (rutaVista !== pathname) {
    setRutaVista(pathname);
    if (masAbierto) setMasAbierto(false);
  }
  const botonMasRef = useRef<HTMLButtonElement>(null);
  const hojaRef = useRef<HTMLDivElement>(null);
  const cerrarMas = (devolverFoco: boolean) => {
    setMasAbierto(false);
    if (devolverFoco) botonMasRef.current?.focus();
  };

  /* Abierto: el foco entra en la primera sección y Escape cierra (y lo devuelve a «Más»). */
  useEffect(() => {
    if (!masAbierto) return;
    hojaRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMasAbierto(false);
        botonMasRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [masAbierto]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      {sinLogin && (
        <p role="note" className="fixed inset-x-0 top-0 z-[60] bg-amber-300 px-4 py-1 text-center text-xs font-semibold text-tinta">
          Panel sin contraseña · solo para desarrollo, sin datos reales de clientas
        </p>
      )}
      {/* Saltar las once secciones del menú (WCAG 2.4.1). Invisible hasta recibir el foco. */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:inline-flex focus-visible:rounded-full focus-visible:bg-carmin focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white"
      >
        Saltar al contenido
      </a>
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
          {!sinLogin && <form action={salir}>
            <button type="submit" className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm text-gris hover:bg-rosa-niebla hover:text-tinta">
              <LogOut aria-hidden className="size-4" /> Salir
            </button>
          </form>}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--capa-borde)] bg-crema/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-display text-lg font-semibold">Andrea Salón</p>
          {!sinLogin && (
            <form action={salir}>
              <button type="submit" className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-gris" aria-label="Salir">
                <LogOut aria-hidden className="size-4" />
              </button>
            </form>
          )}
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pt-8">
          {children}
        </main>
        {masAbierto && (
          <>
            {/* Velo: tocar fuera cierra. Solo ratón/dedo; con teclado se cierra con Escape. */}
            <div aria-hidden className="fixed inset-0 z-40 bg-tinta/20 lg:hidden" onClick={() => cerrarMas(false)} />
            <div
              id="panel-mas"
              ref={hojaRef}
              className="fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-50 rounded-3xl border border-[var(--capa-borde)] bg-white p-2 shadow-[var(--shadow-card)] lg:hidden"
            >
              <ul className="grid grid-cols-2 gap-1">
                {enMas.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => cerrarMas(false)}
                      aria-current={activo(it.href, it.exacto) ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-[15px] font-medium",
                        activo(it.href, it.exacto) ? "bg-carmin text-white" : "text-tinta hover:bg-rosa-niebla",
                      )}
                    >
                      <it.icon aria-hidden className="size-5 shrink-0" />
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        <nav
          className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[var(--capa-borde)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          aria-label="Secciones del panel"
        >
          {enBarra.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={activo(it.href, it.exacto) ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                activo(it.href, it.exacto) ? "text-carmin" : "text-gris",
              )}
            >
              <it.icon aria-hidden className="size-5" />
              {it.label}
            </Link>
          ))}
          {enMas.length > 0 && (
            <button
              ref={botonMasRef}
              type="button"
              onClick={() => (masAbierto ? cerrarMas(true) : setMasAbierto(true))}
              aria-expanded={masAbierto}
              aria-controls="panel-mas"
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                masActivo || masAbierto ? "text-carmin" : "text-gris",
              )}
            >
              <Ellipsis aria-hidden className="size-5" />
              Más
              {masActivo && <span className="sr-only"> (estás en una de estas secciones)</span>}
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
