"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BUSINESS, NAV } from "@/content";
import { cn } from "@/lib/format";
import useScrolledPast from "@/hooks/useScrolledPast";
import TacoIcon from "@/components/common/TacoIcon";
import ThemeToggle from "@/components/layout/ThemeToggle";
import OrderMenu from "@/components/layout/OrderMenu";
import { GENERIC_ORDER_TEXT, whatsappUrl } from "@/lib/whatsapp";

export default function Header() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(12);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // El drawer se cierra al navegar.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      // Trampa de foco dentro del drawer.
      if (e.key === "Tab" && drawerRef.current) {
        const f = drawerRef.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled ? "border-b border-line bg-[var(--header-bg)] shadow-lg backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
        <Link href="/" className="press flex items-center gap-2" aria-label={`${BUSINESS.name}, ir al inicio`}>
          <TacoIcon className="h-9 w-9" />
          <span className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
            BH <span className="text-brand-text">Tacos</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={cn(
                    "press rounded-full px-4 py-2 text-sm font-semibold",
                    isActive(n.href) ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <OrderMenu />
          </div>
          <button
            type="button"
            className="press grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="drawer"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Drawer móvil: entra desde la derecha con la curva de cajón de iOS (Emil: --ease-drawer). */}
      <div className={cn("fixed inset-0 z-50 overflow-hidden lg:hidden", open ? "visible" : "invisible delay-300")} aria-hidden={!open}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
          className={cn("absolute inset-0 bg-black/60 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <div
          id="drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(86vw,360px)] flex-col gap-6 bg-bg p-6 shadow-2xl transition-transform duration-300 ease-[var(--ease-drawer)]",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl uppercase">Menú</span>
            <button ref={closeRef} type="button" className="press grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="Principal (móvil)">
            <ul className="flex flex-col gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={cn("press block rounded-xl px-4 py-3 font-display text-2xl uppercase", isActive(n.href) ? "bg-surface-2 text-brand-text" : "text-fg")}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto grid gap-3">
            <a className="press btn btn-salsa" href={whatsappUrl(GENERIC_ORDER_TEXT)} target="_blank" rel="noopener noreferrer">
              Pedir por WhatsApp
            </a>
            <a className="press btn btn-primary" href={`tel:${BUSINESS.phone.tel}`}>
              Llamar · {BUSINESS.phone.display}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
