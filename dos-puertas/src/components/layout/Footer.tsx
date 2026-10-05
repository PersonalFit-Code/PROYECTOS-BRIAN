"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import HoursList from "@/components/ui/HoursList";
import StatusPill from "@/components/ui/StatusPill";
import MapEmbed from "@/components/ui/MapEmbed";
import MapSheet from "@/components/ui/MapSheet";
import { useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { LOCALE_META } from "@/i18n/config";
import { format } from "@/i18n/getMessages";
import { BUSINESS } from "@/data/business";
import { LEGAL_PAGES, NAV_ITEMS } from "./navItems";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Footer() {
  const m = useMessages();
  const locale = useLocale();
  const lp = useLocalePath();
  const ta = BUSINESS.ratings.tripadvisor;
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <footer className="grano relative isolate mt-10 overflow-hidden border-t border-cream/10 bg-botella-900">
      <p aria-hidden className="pointer-events-none absolute -bottom-6 left-1/2 -z-10 -translate-x-1/2 font-rotulo text-[34vw] leading-none whitespace-nowrap text-cream/[0.05] uppercase lg:text-[22vw]">
        Dos Puertas
      </p>
      <div aria-hidden className="glow absolute -top-40 left-1/2 -z-10 h-80 w-[700px] -translate-x-1/2 [--glow-a:0.14]" />

      <div className="container-page grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_1.05fr_1.3fr] lg:gap-10">
        {/* La casa: marca, valoración, teléfono y secciones */}
        <div>
          <Wordmark size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-muted">{m.footer.about}</p>
          <a
            href={BUSINESS.social.tripadvisor}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-baseline gap-2 text-sm text-cream-muted hover:text-cream"
          >
            <span className="font-condensed text-3xl leading-none text-oro-light">{ta.valueForMoney.toLocaleString(LOCALE_META[locale].intl)}</span>
            <span>
              {m.social.ratingLabel}
              <span className="block text-xs text-cream-faint">{format(m.social.ratingCount, { count: ta.count })}</span>
            </span>
          </a>
          <a href={`tel:${BUSINESS.phone.e164}`} className="mt-4 flex min-h-11 w-fit items-center gap-3 text-sm text-cream-muted hover:text-cream">
            <Phone aria-hidden className="size-4 shrink-0 text-oro-light" />
            {BUSINESS.phone.display}
          </a>
          <LanguageSwitcher id="pie" className="mt-6 max-w-[240px]" />
          <nav aria-label={m.footer.links} className="mt-6">
            <h2 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{m.footer.links}</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-6 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link href={lp(item.path)} className="flex min-h-10 items-center text-cream-muted hover:text-cream">
                    {m.nav.items[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          <h2 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{m.footer.hours}</h2>
          <StatusPill className="mt-3" />
          <HoursList className="mt-3 -mx-3" />
          <p className="mt-3 text-xs text-cream-faint">{m.visita.noReservations}</p>
        </div>

        {/* Ubicación, al lado del horario */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{m.footer.location}</h2>
          <MapEmbed title={m.visita.mapLabel} className="mt-4 h-52 rounded-2xl sm:h-60" />
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="mt-4 flex gap-3 text-sm text-cream-muted hover:text-cream">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-oro-light" />
            <span>
              {BUSINESS.address.street} · {BUSINESS.address.postalCode} {BUSINESS.address.city}
              <span className="block text-cream-faint">{m.common.area}</span>
            </span>
          </a>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              aria-haspopup="dialog"
              className="pulsable inline-flex min-h-11 items-center gap-2 rounded-full bg-oro px-5 text-sm font-semibold text-botella hover:bg-oro-light"
            >
              <Navigation aria-hidden className="size-4" />
              {m.common.directions}
            </button>
            <a
              href={BUSINESS.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="pulsable inline-flex min-h-11 items-center rounded-full border border-cream/15 px-5 text-sm font-medium text-cream hover:border-oro/45"
            >
              {m.common.openInMaps}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-cream/10 py-6 text-xs text-cream-faint sm:flex-row sm:items-center sm:justify-between">
        <p>{format(m.footer.rights, { year: new Date().getFullYear() })}</p>
        <p>{m.footer.credits}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGAL_PAGES.map((slug) => (
            <li key={slug}>
              <Link href={lp(`/legal/${slug}`)} className="inline-flex min-h-8 items-center hover:text-cream">
                {m.legal.docs[slug].title}
              </Link>
            </li>
          ))}
          <li>
            <CookieSettingsLink className="inline-flex min-h-8 items-center hover:text-cream">{m.consent.footerLink}</CookieSettingsLink>
          </li>
        </ul>
      </div>
      <MapSheet open={mapOpen} onClose={() => setMapOpen(false)} />
    </footer>
  );
}
