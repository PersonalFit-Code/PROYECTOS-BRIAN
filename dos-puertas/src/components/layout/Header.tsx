"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import StatusPill from "@/components/ui/StatusPill";
import CurvedMenu from "@/components/ui/curved-menu";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";
import { LEGAL_PAGES, NAV_ITEMS, isActive } from "./navItems";

/** Cabecera mínima: la marca, el estado, «Llamar» y el botón del menú lateral con todas las secciones. */
export default function Header() {
  const m = useMessages();
  const lp = useLocalePath();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = NAV_ITEMS.map((it) => ({
    heading: m.nav.items[it.key],
    subheading: m.nav.subheadings[it.key],
    href: lp(it.path),
    active: isActive(pathname, it.path),
  }));

  const menuFooter = (
    <div className="space-y-4 border-t border-cream/15 pt-6 text-sm">
      <StatusPill badge />
      <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-cream-muted hover:text-cream">
        <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-oro-light" />
        <span>
          {BUSINESS.address.street} · {BUSINESS.address.city}
          <span className="block text-cream-faint">{m.nav.hoursShort}</span>
        </span>
      </a>
      <a href={`tel:${BUSINESS.phone.e164}`} className="flex min-h-11 items-center gap-3 text-cream-muted hover:text-cream">
        <Phone aria-hidden className="size-4 text-oro-light" />
        {BUSINESS.phone.display}
      </a>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-faint">
        {LEGAL_PAGES.map((slug) => (
          <li key={slug}>
            <Link href={lp(`/legal/${slug}`)} className="inline-flex min-h-8 items-center hover:text-cream">
              {m.legal.docs[slug].title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-2.5 pt-[max(10px,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 rounded-full pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-500",
          scrolled ? "liquid-glass liquid-glass-strong cristal-ancho" : "border border-transparent",
        )}
      >
        <Link href={lp("/")} aria-label={`${BUSINESS.legalName} · ${m.nav.items.home}`} className="marca-cabecera pulsable shrink-0 rounded-md">
          <Wordmark size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden pr-2 md:block">
            <StatusPill compact />
          </span>
          <a
            href={`tel:${BUSINESS.phone.e164}`}
            className="pulsable inline-flex size-11 items-center justify-center gap-2 rounded-full bg-oro text-sm font-semibold text-botella hover:bg-oro-light sm:w-auto sm:px-5"
          >
            <Phone aria-hidden className="size-[18px]" />
            <span className="sr-only sm:not-sr-only">{m.common.call}</span>
          </a>
          <CurvedMenu
            items={items}
            label={m.nav.menu.label}
            openLabel={m.nav.menu.open}
            closeLabel={m.nav.menu.close}
            heading={m.nav.menu.heading}
            footer={menuFooter}
          />
        </div>
      </div>
    </header>
  );
}
