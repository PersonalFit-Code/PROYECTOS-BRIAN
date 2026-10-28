"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/components/layout/nav";
import { cx } from "@/lib/formato";

/** Subapartados de Finanzas en pestañas (en el móvil no hay barra lateral). */
export function Pestanas() {
  const pathname = usePathname();
  const hijos = NAV.find((i) => i.href === "/finanzas")?.hijos ?? [];
  return (
    <nav className="-mx-4 mb-6 overflow-x-auto border-b border-line px-4">
      <div className="flex gap-1">
        {hijos.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            className={cx("flex shrink-0 items-center gap-1.5 border-b-2 px-2 py-2 text-sm", pathname === h.href ? "border-fg font-medium" : "border-transparent text-muted hover:text-fg")}
          >
            <h.icon className="size-4" />
            {h.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
