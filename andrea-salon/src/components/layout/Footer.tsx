"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUp, MapPin, Navigation, Phone } from "lucide-react";
import { FacebookGlyph, InstagramGlyph } from "@/components/ui/SocialGlyphs";
import HoursList from "@/components/ui/HoursList";
import StatusPill from "@/components/ui/StatusPill";
import MapEmbed from "@/components/ui/MapEmbed";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { useReveal } from "@/hooks/useReveal";
import { BUSINESS } from "@/data/business";
import { LEGAL_DOC_KEYS } from "@/data/legal";
import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";
import { NAV_ITEMS } from "./navItems";

/**
 * Pie de página: la casa (logo, texto, redes, teléfono y WhatsApp), el horario en vivo, la ubicación
 * con el mapa (tras consentimiento) y la línea legal con «Configurar cookies». Lleva `id="footer"`
 * porque `ChapterNav` y `FloatingWhatsApp` lo buscan por ahí.
 */
export default function Footer() {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const f = m.nav.footer;

  return (
    <footer ref={ref} id="footer" className="relative isolate mt-10 overflow-hidden border-t border-carmin/10 bg-rosa-niebla">
      <div aria-hidden className="halo absolute -top-40 left-1/2 -z-10 h-80 w-[700px] -translate-x-1/2 [--halo-a:0.5]" />

      <div className="container-page grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.3fr] lg:gap-10">
        {/* La casa */}
        <div data-reveal>
          <Link href={lp("/")} aria-label={m.nav.homeAria} className="inline-flex items-center gap-3 rounded-full">
            <Image src="/brand/logo.png" alt="" width={56} height={56} className="size-14 rounded-full" />
            <span className="font-display text-2xl font-semibold leading-none text-tinta">{m.common.brand}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gris">{f.about}</p>
          <ul className="mt-5 space-y-1">
            <li>
              <a href={BUSINESS.phone.tel} className="flex min-h-11 w-fit items-center gap-3 text-sm text-gris hover:text-tinta">
                <Phone aria-hidden className="size-4 shrink-0 text-carmin-suave" />
                {BUSINESS.phone.display}
              </a>
            </li>
            <li>
              <a href={BUSINESS.whatsapp.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 w-fit items-center gap-3 text-sm text-gris hover:text-tinta">
                <WhatsAppGlyph size="size-4" className="shrink-0 text-carmin-suave" />
                {m.common.cta.whatsapp}
                <span className="sr-only"> ({m.common.misc.newTab})</span>
              </a>
            </li>
            <li>
              <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" className="flex min-h-11 w-fit items-center gap-3 text-sm text-gris hover:text-tinta">
                <InstagramGlyph className="size-4 shrink-0 text-carmin-suave" />
                {BUSINESS.social.instagramHandle}
                <span className="sr-only"> ({m.common.misc.newTab})</span>
              </a>
            </li>
            <li>
              <a href={BUSINESS.social.facebook} target="_blank" rel="noopener noreferrer" className="flex min-h-11 w-fit items-center gap-3 text-sm text-gris hover:text-tinta">
                <FacebookGlyph className="size-4 shrink-0 text-carmin-suave" />
                Facebook
                <span className="sr-only"> ({m.common.misc.newTab})</span>
              </a>
            </li>
          </ul>
          <LanguageSwitcher id="pie" className="mt-6 w-fit" />
          <nav aria-label={f.links} className="mt-6">
            <h2 className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{f.links}</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-6 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link href={lp(item.path)} className="flex min-h-10 items-center text-gris hover:text-tinta">
                    {m.nav.items[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Horario */}
        <div data-reveal>
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{f.hours}</h2>
          <StatusPill className="mt-3" />
          <HoursList className="mt-3 -mx-3" />
        </div>

        {/* Ubicación */}
        <div data-reveal className="sm:col-span-2 lg:col-span-1">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{f.location}</h2>
          <MapEmbed title={m.contacto.mapTitle} className="mt-4 h-52 rounded-2xl sm:h-60" />
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="mt-4 flex gap-3 text-sm text-gris hover:text-tinta">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-carmin-suave" />
            <span>
              {BUSINESS.address.street}
              <span className="block">
                {BUSINESS.address.postalCode} {BUSINESS.address.city}
              </span>
              <span className="sr-only"> ({m.common.misc.newTab})</span>
            </span>
          </a>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href={BUSINESS.directions}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={m.common.cta.directionsAria}
              className="pulsable inline-flex min-h-11 items-center gap-2 rounded-full bg-carmin px-5 text-sm font-semibold text-white hover:bg-carmin-oscuro"
            >
              <Navigation aria-hidden className="size-4" />
              {m.common.cta.directions}
            </a>
            <a
              href={BUSINESS.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="pulsable inline-flex min-h-11 items-center rounded-full border border-carmin/20 bg-white/70 px-5 text-sm font-medium text-tinta hover:border-carmin/45"
            >
              {m.common.cta.openMaps}
              <span className="sr-only"> ({m.common.misc.newTab})</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col gap-3 border-t border-carmin/10 py-6 text-xs text-gris sm:flex-row sm:items-center sm:justify-between">
        <p>{format(f.rights, { year: new Date().getFullYear() })}</p>
        {/* Mientras la web viva en el enlace privado: aviso para Andrea, no para las clientas. */}
        {SITE_URL_IS_PROVISIONAL ? <p>{f.preview}</p> : null}
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
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
          <li>
            <a href="#main" className="inline-flex min-h-8 items-center gap-1 hover:text-tinta">
              <ArrowUp aria-hidden className="size-3.5" />
              {f.backToTop}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
