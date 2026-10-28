"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cx } from "@/lib/formato";
import { activo, NAV } from "./nav";
import { salir } from "@/app/login/acciones";

/** Barra lateral de escritorio, como la de Notion: gris cálido, iconos finos, subapartados sangrados. */
export function Sidebar({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-side px-2 py-3 md:flex">
      <div className="mb-3 flex items-center gap-2 px-2 py-1">
        <span className="grid size-6 place-items-center rounded bg-fg text-xs font-bold text-bg">{nombre.charAt(0)}</span>
        <span className="truncate text-sm font-semibold">Plan de vida de {nombre}</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <div key={item.href}>
            <EnlaceNav href={item.href} label={item.label} Icon={item.icon} on={activo(pathname, item.href) && !item.hijos} />
            {item.hijos && activo(pathname, item.href) && (
              <div className="ml-4 border-l border-line pl-1">
                {item.hijos.map((h) => (
                  <EnlaceNav key={h.href} href={h.href} label={h.label} Icon={h.icon} on={activo(pathname, h.href, h.href === "/finanzas")} pequeno />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <form action={salir}>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-hover">
          <LogOut className="size-4" /> Cerrar sesión
        </button>
      </form>
    </aside>
  );
}

function EnlaceNav({ href, label, Icon, on, pequeno }: { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; on: boolean; pequeno?: boolean }) {
  return (
    <Link
      href={href}
      className={cx(
        "flex items-center gap-2 rounded-md px-2 text-sm transition",
        pequeno ? "py-1" : "py-1.5",
        on ? "bg-hover font-medium text-fg" : "text-muted hover:bg-hover hover:text-fg",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
