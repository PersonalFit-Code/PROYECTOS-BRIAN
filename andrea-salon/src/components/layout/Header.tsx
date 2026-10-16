"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/SocialGlyphs";
import StatusPill from "@/components/ui/StatusPill";
import CurvedMenu from "@/components/ui/curved-menu";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useScrollPastPixels } from "@/hooks/useScrollPast";
import { BUSINESS } from "@/data/business";
import { LEGAL_DOC_KEYS } from "@/data/legal";
import { urlFor } from "@/lib/hosts";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./navItems";

/**
 * Cabecera editorial: menú a la izquierda, logotipo «ANDREA SALÓN» en Bodoni espaciado en el centro
 * (como la cabecera de una revista) y «Cita previa» en grafito a la derecha. Blanca; al bajar, con un
 * filete nude debajo.
 */
export default function Header() {
  const m = useMessages();
  const lp = useLocalePath();
  const pathname = usePathname();
  /* Del almacén único de scroll (`useScrollPast`): un listener para toda la web. */
  const scrolled = useScrollPastPixels(24);

  const items = NAV_ITEMS.map((it) => ({
    heading: m.nav.items[it.key],
    subheading: m.nav.subheadings[it.key],
    href: lp(it.path),
    active: isActive(pathname ?? "/", it.path),
  }));

  const menuFooter = (
    <div className="space-y-4 border-t border-nude pt-6 text-sm">
      <StatusPill badge />
      <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-gris hover:text-tinta">
        <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-carmin-suave" />
        <span>
          {BUSINESS.address.street} · {BUSINESS.address.postalCode} {BUSINESS.address.city}
          <span className="sr-only"> ({m.common.misc.newTab})</span>
        </span>
      </a>
      <a href={BUSINESS.phone.tel} className="flex min-h-11 items-center gap-3 text-gris hover:text-tinta">
        <Phone aria-hidden className="size-4 text-carmin-suave" />
        {BUSINESS.phone.display}
      </a>
      <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 text-gris hover:text-tinta">
        <InstagramGlyph className="size-4 text-carmin-suave" />
        {BUSINESS.social.instagramHandle}
        <span className="sr-only"> ({m.common.misc.newTab})</span>
      </a>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gris">
        {LEGAL_DOC_KEYS.map((key) => (
          <li key={key}>
            <Link href={lp(`/legal/${m.legal[key].slug}`)} className="inline-flex min-h-8 items-center hover:text-tinta">
              {m.legal[key].title}
            </Link>
          </li>
        ))}
        <li>
          <CookieSettingsLink className="inline-flex min-h-8 items-center hover:text-tinta">{m.consent.footerLink}</CookieSettingsLink>
        </li>
      </ul>
    </div>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-500",
        /* Arriba del todo, sin fondo (la portada ya es blanca); al bajar, blanco con un filete. */
        scrolled ? "border-b border-nude bg-white/95 backdrop-blur-sm" : "border-b border-transparent bg-white",
      )}
    >
      <div className="container-page grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-4">
          <CurvedMenu
            items={items}
            label={m.nav.menu.label}
            openLabel={m.nav.menu.open}
            closeLabel={m.nav.menu.close}
            heading={m.nav.menu.heading}
            top={<LanguageSwitcher id="menu" className="w-fit" />}
            footer={menuFooter}
            triggerClassName="shrink-0"
          />
          <span className="hidden lg:block">
            <StatusPill compact />
          </span>
        </div>

        {/* Logotipo tipográfico, como la cabecera de una revista. El logo acuarela queda para el
            icono de la pestaña y el pie. */}
        {/* Sin `aria-label`: el nombre accesible tiene que contener lo que se ve (WCAG 2.5.3). */}
        <Link href={lp("/")} className="flex flex-col items-center px-2 py-1 text-center">
          <span className="titulo-editorial text-[1.15rem] leading-none tracking-[0.24em] text-tinta sm:text-2xl sm:tracking-[0.3em]">{m.common.brand}</span>
          <span className="etiqueta mt-1.5 hidden text-[9px] tracking-[0.42em] text-carmin-suave sm:block">{m.common.tagline}</span>
          <span className="sr-only"> · {m.nav.items.home}</span>
        </Link>

        <div className="flex justify-end">
          {/* Un <a> y no `next/link`: `urlFor("reservar")` puede ser otro subdominio. */}
          <a
            href={urlFor("reservar", "/")}
            className="inline-flex size-11 items-center justify-center gap-2.5 rounded-[2px] bg-grafito text-white transition-colors hover:bg-carmin-oscuro sm:h-11 sm:w-auto sm:px-6"
          >
            <CalendarCheck aria-hidden className="size-[17px] sm:hidden" />
            <span className="sr-only sm:not-sr-only sm:text-[11px] sm:font-medium sm:tracking-[0.2em] sm:uppercase">{m.common.cta.book}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
