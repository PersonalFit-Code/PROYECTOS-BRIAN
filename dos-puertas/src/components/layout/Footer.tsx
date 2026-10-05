"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import HoursList from "@/components/ui/HoursList";
import StatusPill from "@/components/ui/StatusPill";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { BUSINESS } from "@/data/business";
import { NAV_ITEMS } from "./navItems";

export default function Footer() {
  const m = useMessages();
  const lp = useLocalePath();
  const ta = BUSINESS.ratings.tripadvisor;

  return (
    <footer className="grano relative isolate mt-10 overflow-hidden border-t border-cream/10 bg-tinta-900">
      <p aria-hidden className="pointer-events-none absolute -bottom-6 left-1/2 -z-10 -translate-x-1/2 font-rotulo text-[34vw] leading-none whitespace-nowrap text-cream/[0.05] uppercase lg:text-[22vw]">
        Dos Puertas
      </p>
      <div aria-hidden className="glow absolute -top-40 left-1/2 -z-10 h-80 w-[700px] -translate-x-1/2 [--glow-a:0.14]" />

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr_0.8fr]">
        <div>
          <Wordmark size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-muted">{m.footer.about}</p>
          <a
            href={BUSINESS.social.tripadvisor}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-baseline gap-2 text-sm text-cream-muted hover:text-cream"
          >
            <span className="font-condensed text-3xl leading-none text-oro-light">{ta.valueForMoney.toLocaleString("es-ES")}</span>
            <span>
              {m.social.ratingLabel}
              <span className="block text-xs text-cream-faint">{format(m.social.ratingCount, { count: ta.count })}</span>
            </span>
          </a>
        </div>

        <div>
          <h2 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{m.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="flex gap-3 text-cream-muted hover:text-cream">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-oro-light" />
                <span>
                  {BUSINESS.address.street}
                  <br />
                  {BUSINESS.address.postalCode} {BUSINESS.address.city}
                  <br />
                  <span className="text-cream-faint">{BUSINESS.address.area}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`tel:${BUSINESS.phone.e164}`} className="flex min-h-11 items-center gap-3 text-cream-muted hover:text-cream">
                <Phone aria-hidden className="size-4 shrink-0 text-oro-light" />
                {BUSINESS.phone.display}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{m.footer.hours}</h2>
          <StatusPill className="mt-3" />
          <HoursList className="mt-3 -mx-3" />
          <p className="mt-3 text-xs text-cream-faint">{m.visita.noReservations}</p>
        </div>

        <div>
          <h2 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{m.footer.links}</h2>
          <ul className="mt-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link href={lp(item.path)} className="flex min-h-11 items-center text-cream-muted hover:text-cream">
                  {m.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-cream/10 py-6 text-xs text-cream-faint sm:flex-row sm:items-center sm:justify-between">
        <p>{format(m.footer.rights, { year: new Date().getFullYear() })}</p>
        <p>{m.footer.credits}</p>
        <Link href={lp("/legal")} className="hover:text-cream">
          {m.footer.legal}
        </Link>
      </div>
    </footer>
  );
}
