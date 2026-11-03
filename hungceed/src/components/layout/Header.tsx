"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageCircle, Search, ShoppingBag } from "lucide-react";
import CurvedMenu from "@/components/ui/curved-menu";
import Logo from "@/components/ui/Logo";
import { NEGOCIO } from "@/data/negocio";
import { useScrollPastPixels } from "@/hooks/useScrollPast";
import { cn } from "@/lib/utils";
import { MENU } from "./navegacion";

/**
 * Cabecera reciclada de la plantilla (franja fina + fila del logo + fila de secciones), ahora en
 * negro con el rojo de la marca. En escritorio, la fila de abajo es el catálogo entero: cada
 * categoría con su página y, al pasar por «Máquinas», sus series. En el móvil, el menú curvo.
 * El carrito es decorativo: la maqueta enseña el diseño, no vende.
 */
export default function Header() {
  const pathname = usePathname() ?? "/";
  const scrolled = useScrollPastPixels(24);
  const activo = (href: string) => pathname === href.split("?")[0] || pathname.startsWith(`${href.split("?")[0]}/`);

  const itemsMovil = [
    ...MENU.map((m) => ({ heading: m.nombre, href: m.href, active: activo(m.href) })),
    { heading: "Equipa tu centro", href: "/equipa-tu-centro", subheading: "Presupuesto para gimnasios y boxes", active: activo("/equipa-tu-centro") },
    { heading: "Hungceed GYM", href: "/gym", subheading: "Tarifas y altas online", active: activo("/gym") },
    { heading: "Envíos y garantía", href: "/envios", active: activo("/envios") },
  ];

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 bg-negro text-white transition-shadow duration-300", scrolled && "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]")}>
      {/* Franja: lo que tranquiliza antes de comprar. PENDIENTE DE CONFIRMAR con Jose (sale de su web): envío, garantía y pago. */}
      <div className="border-b border-white/10 bg-carbon">
        <div className="container-page flex h-8 items-center justify-between gap-4 text-[11px] font-medium tracking-[0.08em] text-gris-claro uppercase">
          <p className="truncate">
            Envío 48–72 h <span aria-hidden className="mx-2 text-rojo">/</span> Garantía 30 días
            <span className="hidden sm:inline">
              <span aria-hidden className="mx-2 text-rojo">/</span> Pago seguro
            </span>
          </p>
          <span className="hidden shrink-0 md:inline">Maqueta de diseño · no es la tienda real</span>
        </div>
      </div>

      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <CurvedMenu
              items={itemsMovil}
              label="Menú"
              openLabel="Abrir el menú"
              closeLabel="Cerrar el menú"
              heading="Catálogo"
              triggerClassName="text-white"
              footer={
                <div className="space-y-2 border-t border-linea pt-5 text-sm text-gris">
                  <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 font-semibold text-negro hover:text-rojo">
                    <MessageCircle aria-hidden className="size-4 text-rojo" /> Escríbenos por WhatsApp
                  </a>
                  <a href={`mailto:${NEGOCIO.email}`} className="flex min-h-11 items-center hover:text-negro">
                    {NEGOCIO.email}
                  </a>
                </div>
              }
            />
          </div>
          <button type="button" className="hidden size-10 items-center justify-center text-white/80 transition-colors hover:text-rojo lg:inline-flex" aria-label="Buscar (no activo en la maqueta)">
            <Search aria-hidden className="size-5" />
          </button>
        </div>

        <Link href="/" className="text-[1.35rem] sm:text-[1.6rem]" aria-label="Hungceed, inicio">
          <Logo />
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <Link
            href="/equipa-tu-centro"
            className={cn(
              "hidden h-10 items-center px-3 text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors lg:inline-flex",
              activo("/equipa-tu-centro") ? "text-rojo" : "text-white/80 hover:text-rojo",
            )}
          >
            Equipa tu centro
          </Link>
          <Link
            href="/gym"
            className={cn(
              "hidden h-10 items-center px-3 text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors sm:inline-flex",
              activo("/gym") ? "text-rojo" : "text-white hover:text-rojo",
            )}
          >
            Hungceed GYM
          </Link>
          <span className="relative inline-flex size-10 items-center justify-center text-white" aria-label="Carrito (no activo en la maqueta)" role="img">
            <ShoppingBag aria-hidden className="size-5" />
            <span aria-hidden className="absolute top-1 right-0.5 grid size-4 place-items-center rounded-full bg-rojo text-[10px] font-bold">0</span>
          </span>
        </div>
      </div>

      {/* Fila del catálogo (escritorio). */}
      <nav aria-label="Catálogo" className="hidden border-t border-white/10 lg:block">
        <ul className="container-page flex h-12 items-center justify-center gap-8">
          {MENU.map((m) => (
            <li key={m.href} className="group/item relative">
              <Link
                href={m.href}
                aria-current={activo(m.href) ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-12 items-center gap-1 text-[13px] font-semibold tracking-[0.1em] uppercase transition-colors",
                  "after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:bg-rojo after:transition-transform after:duration-300 hover:after:scale-x-100",
                  activo(m.href) ? "text-white after:scale-x-100" : "text-white/75 after:scale-x-0 hover:text-white",
                )}
              >
                {m.nombre}
                {m.hijos ? <ChevronDown aria-hidden className="size-3.5 transition-transform group-hover/item:rotate-180" /> : null}
              </Link>
              {m.hijos ? (
                <div className="invisible absolute top-full left-1/2 w-[34rem] -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-focus-within/item:visible group-focus-within/item:translate-y-0 group-focus-within/item:opacity-100 group-hover/item:visible group-hover/item:translate-y-0 group-hover/item:opacity-100">
                  <ul className="grid grid-cols-3 gap-px border-t-[3px] border-rojo bg-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
                    {m.hijos.map((h) => (
                      <li key={h.href}>
                        <Link href={h.href} className="block h-full bg-carbon p-5 transition-colors hover:bg-negro">
                          <span className="block text-[13px] font-bold tracking-[0.06em] text-white uppercase">{h.nombre}</span>
                          <span className="mt-1.5 block text-[12px] leading-snug text-gris-claro">{h.lema}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
