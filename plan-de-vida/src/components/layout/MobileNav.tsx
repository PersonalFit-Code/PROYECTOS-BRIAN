"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Ellipsis, X } from "lucide-react";
import { cx } from "@/lib/formato";
import { activo, NAV, NAV_MOVIL } from "./nav";

/** Barra inferior del móvil (modo app instalada): 4 accesos fijos + "Más" con el resto. */
export function MobileNav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const fijos = NAV.filter((i) => NAV_MOVIL.includes(i.href));
  const resto = NAV.flatMap((i) => (i.hijos ? i.hijos.filter((h) => h.href !== "/finanzas") : NAV_MOVIL.includes(i.href) ? [] : [i]));

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setAbierto(false)}>
          <div className="pb-safe absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-bg p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-semibold">Más</span>
              <button aria-label="Cerrar" onClick={() => setAbierto(false)} className="rounded p-1 hover:bg-hover">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pb-16">
              {resto.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={() => setAbierto(false)}
                  className={cx("flex flex-col items-center gap-1 rounded-lg p-3 text-center text-xs", activo(pathname, i.href) ? "bg-hover font-medium" : "text-muted")}
                >
                  <i.icon className="size-5" />
                  {i.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {fijos.map((i) => (
            <Link key={i.href} href={i.href} className={cx("flex flex-col items-center gap-0.5 py-2 text-[11px]", activo(pathname, i.href) ? "text-fg" : "text-muted")}>
              <i.icon className="size-5" />
              {i.label}
            </Link>
          ))}
          <button onClick={() => setAbierto((v) => !v)} className={cx("flex flex-col items-center gap-0.5 py-2 text-[11px]", abierto ? "text-fg" : "text-muted")}>
            <Ellipsis className="size-5" />
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
