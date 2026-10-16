"use client";

import Image from "next/image";
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
 * Cabecera mínima y centrada (patrón de Dos Puertas): la marca, el estado en vivo, «Reservar cita»
 * y el botón del menú lateral con todas las secciones. Flota como una cápsula de cristal en cuanto
 * se baja un poco; arriba del todo es transparente para no competir con la portada.
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
    <div className="space-y-4 border-t border-carmin/12 pt-6 text-sm">
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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-2.5 pt-[max(10px,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-[60px] w-fit max-w-full items-center gap-2 rounded-full px-2 transition-[background-color,border-color,box-shadow] duration-500",
          /* Cristal fuerte (lleva texto) y ancho (desenfoque real solo en gama alta). */
          scrolled ? "liquid-glass liquid-glass-strong cristal-ancho" : "border border-transparent",
        )}
      >
        <Link href={lp("/")} aria-label={m.nav.homeAria} className="pulsable flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1.5 focus-visible:outline-offset-[-2px]">
          {/* El logo que mandó Brian (317×318, PNG): a 40 px pesa lo que un icono. `priority`: está
              en el primer pantallazo de todas las páginas. */}
          <Image src="/brand/logo.png" alt="" width={40} height={40} priority className="size-10 rounded-full" />
          <span className="font-display text-lg font-semibold leading-none tracking-[-0.01em] text-tinta">{m.common.brand}</span>
        </Link>

        <span className="hidden px-3 md:block">
          <StatusPill compact />
        </span>
        {/* Un <a> y no `next/link`: `urlFor("reservar")` puede ser otro subdominio. */}
        <a
          href={urlFor("reservar", "/")}
          className="pulsable inline-flex size-11 shrink-0 items-center justify-center gap-2 rounded-full bg-carmin text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-carmin-oscuro sm:w-auto sm:px-5"
        >
          <CalendarCheck aria-hidden className="size-[18px]" />
          <span className="sr-only sm:not-sr-only">{m.common.cta.book}</span>
        </a>
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
      </div>
    </header>
  );
}
