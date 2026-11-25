"use client";

import { Armchair, BarChart3, Columns3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/formato";

const ENLACES = [
  { href: "/", txt: "Oficina", Icono: Armchair },
  { href: "/pipeline", txt: "Pipeline", Icono: Columns3 },
  { href: "/panel", txt: "Panel", Icono: BarChart3 },
];

function activo(ruta: string, href: string) {
  return href === "/" ? ruta === "/" || ruta.startsWith("/despacho") || ruta.startsWith("/negocios") || ruta.startsWith("/importar") : ruta.startsWith(href);
}

/** Barra lateral en escritorio y barra inferior en el móvil. */
export function Nav() {
  const ruta = usePathname();
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-side p-4 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <Image src="/logo.svg" alt="" width={36} height={36} className="rounded-lg" />
          <span className="font-[family-name:var(--font-titulo)] text-lg font-extrabold tracking-tight">
            neuro<span className="text-brand">·</span>node
          </span>
        </Link>
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {ENLACES.map(({ href, txt, Icono }) => (
            <Link
              key={href}
              href={href}
              aria-current={activo(ruta, href) ? "page" : undefined}
              className={cx("flex min-h-11 items-center gap-3 rounded-xl px-3 font-bold transition", activo(ruta, href) ? "bg-brand text-white" : "text-muted hover:bg-soft hover:text-fg")}
            >
              <Icono className="size-5" aria-hidden />
              {txt}
            </Link>
          ))}
        </nav>
      </aside>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
        {ENLACES.map(({ href, txt, Icono }) => (
          <Link
            key={href}
            href={href}
            aria-current={activo(ruta, href) ? "page" : undefined}
            className={cx("flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold", activo(ruta, href) ? "text-brand" : "text-muted")}
          >
            <Icono className="size-5" aria-hidden />
            {txt}
          </Link>
        ))}
      </nav>
    </>
  );
}
