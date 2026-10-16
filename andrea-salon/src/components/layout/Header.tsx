"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/SocialGlyphs";
import LogoAndrea from "@/components/ui/LogoAndrea";
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
 * Cabecera de revista (referencia: Vogue): franja grafito arriba, el logotipo de Andrea en el
 * centro (caligrafía + «uñas y belleza» en rosa + filigranas, `LogoAndrea`), llamar y «Cita previa» a la derecha, y en
 * escritorio una segunda fila con las secciones en mayúscula entre filetes. Al bajar, el logotipo se
 * encoge un poco.
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
    <header className="fixed inset-x-0 top-0 z-40 border-t-4 border-grafito bg-white pt-[env(safe-area-inset-top)]">
      {/* Fila 1: logotipo de cabecera de revista en el centro, accesos a los lados. */}
      <div
        className={cn(
          "container-page grid grid-cols-[1fr_auto_1fr] items-center gap-3 transition-[height] duration-500 ease-[var(--ease-out-expo)]",
          scrolled ? "h-[68px] lg:h-[88px]" : "h-[72px] lg:h-[140px]",
        )}
      >
        <div className="flex items-center gap-5">
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
          <span className="hidden xl:block">
            <StatusPill compact />
          </span>
        </div>

        {/* Sin `aria-label`: el nombre accesible tiene que contener lo que se ve (WCAG 2.5.3). */}
        <Link href={lp("/")} className="flex flex-col items-center px-2 text-center">
          {/* Arriba del todo, con sus filigranas (como el logo de Andrea); al bajar, solo las letras. */}
          <span className="hidden lg:block">
            <LogoAndrea filigranas={!scrolled} />
          </span>
          <span className="lg:hidden">
            <LogoAndrea tamano="sm" />
          </span>
          <span className="sr-only"> · {m.nav.items.home}</span>
        </Link>

        <div className="flex items-center justify-end gap-5">
          <a
            href={BUSINESS.phone.tel}
            className="hidden items-center gap-2 font-sans text-[12px] font-medium tracking-[0.18em] text-tinta uppercase transition-colors hover:text-carmin-suave lg:inline-flex"
          >
            <Phone aria-hidden className="size-3.5" />
            {m.common.cta.call}
          </a>
          <span aria-hidden className="hidden h-6 w-px bg-nude lg:block" />
          {/* Un <a> y no `next/link`: `urlFor("reservar")` puede ser otro subdominio. Al pasar por
              encima, el icono entra desde la izquierda y el fondo pasa de grafito a taupe. */}
          <a
            href={urlFor("reservar", "/")}
            className="group/cta inline-flex size-11 items-center justify-center overflow-hidden rounded-[2px] bg-grafito text-white transition-colors duration-300 hover:bg-carmin-suave sm:h-11 sm:w-auto sm:px-5"
          >
            <CalendarCheck aria-hidden className="size-[17px] shrink-0 transition-[width,margin,opacity] duration-300 sm:w-0 sm:opacity-0 sm:group-hover/cta:mr-2 sm:group-hover/cta:w-[17px] sm:group-hover/cta:opacity-100" />
            <span className="sr-only sm:not-sr-only sm:text-[12px] sm:font-medium sm:tracking-[0.2em] sm:uppercase">{m.common.cta.book}</span>
          </a>
        </div>
      </div>

      {/* Fila 2 (escritorio): las secciones en mayúscula, centradas, entre dos filetes. */}
      <nav aria-label={m.nav.menu.heading} className="hidden border-y border-nude shadow-[0_6px_14px_-12px_rgba(43,42,45,0.25)] lg:block">
        <ul className="container-page flex h-[52px] items-center justify-center gap-9">
          {NAV_ITEMS.filter((it) => it.key !== "home").map((it) => {
            const activo = isActive(pathname ?? "/", it.path);
            return (
              <li key={it.key}>
                <Link
                  href={lp(it.path)}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "relative font-sans text-[14px] font-normal tracking-[0.14em] text-tinta uppercase transition-colors hover:text-carmin-suave",
                    "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100",
                    activo ? "after:scale-x-100" : "after:scale-x-0",
                  )}
                >
                  {m.nav.items[it.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
