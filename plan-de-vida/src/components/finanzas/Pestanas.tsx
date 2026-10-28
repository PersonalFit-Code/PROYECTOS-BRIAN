"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/components/layout/nav";
import { cx } from "@/lib/formato";

/** Subapartados de Finanzas en pestañas (en el móvil no hay barra lateral). */
export function Pestanas() {
  const pathname = usePathname();
  const hijos = NAV.find((i) => i.href === "/finanzas")?.hijos ?? [];
  return (
    <nav className="mb-6">
      <div className="grid grid-cols-5 gap-1.5">
        {hijos.map((h) => {
          const on = pathname === h.href;
          return (
            <Link
              key={h.href}
              href={h.href}
              className={cx("relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-center text-[11px] leading-tight transition active:scale-95 sm:text-xs", on ? "font-medium text-fg" : "glass text-muted hover:text-fg")}
            >
              {on && <motion.span layoutId="pestana-finanzas" className="glass-strong absolute inset-0 rounded-2xl" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <h.icon className="relative size-5" />
              <span className="relative">{h.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
