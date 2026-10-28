"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Ellipsis, X } from "lucide-react";
import { cx } from "@/lib/formato";
import { IndicadorEnlace } from "./IndicadorEnlace";
import { activo, NAV, NAV_MOVIL } from "./nav";

/** Barra inferior del móvil (cristal flotante): 4 accesos fijos + "Más" con el resto. */
export function MobileNav({ coach }: { coach: string }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const fijos = NAV.filter((i) => NAV_MOVIL.includes(i.href));
  const resto = NAV.flatMap((i) => (i.hijos ? i.hijos.filter((h) => h.href !== "/finanzas") : NAV_MOVIL.includes(i.href) ? [] : [i]));

  return (
    <>
      <AnimatePresence>
        {abierto && (
          <motion.div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAbierto(false)}>
            <motion.div
              className="glass-strong absolute inset-x-3 bottom-24 rounded-3xl p-3"
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-sm font-semibold">Más apartados</span>
                <button aria-label="Cerrar" onClick={() => setAbierto(false)} className="rounded-full p-1 hover:bg-hover">
                  <X className="size-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {resto.map((i, n) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setAbierto(false)}
                    style={{ ["--i" as string]: n }}
                    className={cx("entrar relative flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center text-xs transition", activo(pathname, i.href) ? "bg-bg/80 font-medium shadow-sm" : "text-muted hover:bg-hover")}
                  >
                    <i.icon className="size-5" />
                    {i.href === "/coach" ? coach : i.label}
                    <IndicadorEnlace />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="glass-strong grid grid-cols-5 rounded-3xl p-1">
          {fijos.map((i) => {
            const on = activo(pathname, i.href);
            return (
              <Link key={i.href} href={i.href} className={cx("relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] transition", on ? "text-fg" : "text-muted")}>
                {on && <motion.span layoutId="nav-movil" className="absolute inset-0 rounded-2xl bg-bg/80 shadow-sm" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <i.icon className="relative size-5" />
                <span className="relative">{i.label}</span>
                <IndicadorEnlace />
              </Link>
            );
          })}
          <button onClick={() => setAbierto((v) => !v)} className={cx("flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px]", abierto ? "text-fg" : "text-muted")}>
            <Ellipsis className="size-5" />
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
