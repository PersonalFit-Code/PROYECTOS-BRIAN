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
    <header className={cn("fixed inset-x-0 top-0 z-40 bg-white text-negro transition-shadow duration-300", scrolled && "shadow-[0_1px_0_var(--color-linea)]")}>
      {/* Franja fina en gris, como la de Gymshark. PENDIENTE DE CONFIRMAR con Jose (sale de su web): envío y garantía. */}
      <div className="bg-hueso">
        <div className="container-page flex h-8 items-center justify-center gap-4 text-[11px] font-medium text-negro">
          <p className="truncate">
            Envío en 48–72 h <span aria-hidden className="mx-2 text-gris-claro">·</span> Garantía de 30 días
            <span className="hidden sm:inline">
              <span aria-hidden className="mx-2 text-gris-claro">·</span>
              <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                Te asesoramos por WhatsApp
              </a>
            </span>
          </p>
        </div>
      </div>

      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 lg:grid-cols-[auto_1fr_auto] lg:gap-10">
        <div className="flex items-center gap-2 lg:order-2 lg:justify-center">
          <div className="lg:hidden">
            <CurvedMenu
              items={itemsMovil}
              label="Menú"
              openLabel="Abrir el menú"
              closeLabel="Cerrar el menú"
              heading="Catálogo"
              triggerClassName="text-negro"
              footer={
                <div className="space-y-2 border-t border-linea pt-5 text-sm text-gris">
                  <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 font-semibold text-negro">
                    <MessageCircle aria-hidden className="size-4" /> Escríbenos por WhatsApp
                  </a>
                  <a href={`mailto:${NEGOCIO.email}`} className="flex min-h-11 items-center hover:text-negro">
                    {NEGOCIO.email}
                  </a>
                </div>
              }
            />
          </div>

          {/* Catálogo (escritorio): texto pequeño en negro, subrayado al pasar, como Gymshark. */}
          <nav aria-label="Catálogo" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {MENU.map((m) => (
                <li key={m.href} className="group/item relative">
                  <Link
                    href={m.href}
                    aria-current={activo(m.href) ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-16 items-center gap-1 text-[13px] font-medium transition-colors",
                      "after:absolute after:bottom-[18px] after:left-0 after:h-px after:w-full after:origin-left after:bg-negro after:transition-transform after:duration-300 hover:after:scale-x-100",
                      activo(m.href) ? "after:scale-x-100" : "after:scale-x-0",
                    )}
                  >
                    {m.nombre}
                    {m.hijos ? <ChevronDown aria-hidden className="size-3.5 transition-transform group-hover/item:rotate-180" /> : null}
                  </Link>
                  {m.hijos ? (
                    <div className="invisible absolute top-full left-1/2 w-[34rem] -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-focus-within/item:visible group-focus-within/item:translate-y-0 group-focus-within/item:opacity-100 group-hover/item:visible group-hover/item:translate-y-0 group-hover/item:opacity-100">
                      <ul className="grid grid-cols-3 gap-px border border-linea bg-linea shadow-[0_24px_48px_-24px_rgba(10,10,11,0.25)]">
                        {m.hijos.map((h) => (
                          <li key={h.href}>
                            <Link href={h.href} className="block h-full bg-white p-5 transition-colors hover:bg-hueso">
                              <span className="subtitular block text-[17px]">{h.nombre}</span>
                              <span className="mt-1.5 block text-[12px] leading-snug text-gris">{h.lema}</span>
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
        </div>

        <Link href="/" className="text-[1.3rem] sm:text-[1.45rem] lg:order-1" aria-label="Hungceed, inicio">
          <Logo />
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2 lg:order-3">
          <Link
            href="/equipa-tu-centro"
            className={cn("hidden h-10 items-center px-2 text-[13px] font-medium xl:inline-flex", activo("/equipa-tu-centro") ? "underline underline-offset-4" : "hover:underline hover:underline-offset-4")}
          >
            Equipa tu centro
          </Link>
          <Link
            href="/gym"
            className={cn("hidden h-10 items-center px-2 text-[13px] font-medium sm:inline-flex", activo("/gym") ? "underline underline-offset-4" : "hover:underline hover:underline-offset-4")}
          >
            Hungceed GYM
          </Link>
          <button type="button" className="inline-flex size-10 items-center justify-center" aria-label="Buscar (no activo en la maqueta)">
            <Search aria-hidden className="size-5" strokeWidth={1.75} />
          </button>
          <span className="relative inline-flex size-10 items-center justify-center" aria-label="Carrito (no activo en la maqueta)" role="img">
            <ShoppingBag aria-hidden className="size-5" strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </header>
  );
}
