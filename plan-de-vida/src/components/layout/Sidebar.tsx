"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cx } from "@/lib/formato";
import { activo, NAV } from "./nav";
import { salir } from "@/app/login/acciones";

/** Barra lateral de escritorio: panel de cristal flotante, con la selección deslizándose entre apartados. */
export function Sidebar({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 p-3 md:block">
      <div className="glass flex h-full flex-col rounded-3xl px-2.5 py-4">
        <div className="mb-4 flex items-center gap-2.5 px-2">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 text-sm font-bold text-white shadow-md">{nombre.charAt(0)}</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{nombre}</div>
            <div className="text-xs text-muted">Plan de vida</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <div key={item.href}>
              <EnlaceNav href={item.href} label={item.label} Icon={item.icon} on={activo(pathname, item.href) && !item.hijos} />
              {item.hijos && activo(pathname, item.href) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="ml-5 overflow-hidden border-l border-line pl-1.5">
                  {item.hijos.map((h) => (
                    <EnlaceNav key={h.href} href={h.href} label={h.label} Icon={h.icon} on={activo(pathname, h.href, h.href === "/finanzas")} pequeno />
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>
        <form action={salir}>
          <button className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-muted transition hover:bg-hover hover:text-fg">
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

function EnlaceNav({ href, label, Icon, on, pequeno }: { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; on: boolean; pequeno?: boolean }) {
  return (
    <Link href={href} className={cx("relative flex items-center gap-2.5 rounded-xl px-2.5 text-sm transition", pequeno ? "py-1.5" : "py-2", on ? "font-medium text-fg" : "text-muted hover:bg-hover/70 hover:text-fg")}>
      {on && <motion.span layoutId={pequeno ? "nav-sub" : "nav"} className="absolute inset-0 rounded-xl bg-bg/80 shadow-sm" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
      <Icon className="relative size-4 shrink-0" />
      <span className="relative truncate">{label}</span>
    </Link>
  );
}
