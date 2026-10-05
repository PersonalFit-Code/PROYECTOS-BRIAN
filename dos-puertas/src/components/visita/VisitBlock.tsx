"use client";

import { useRef } from "react";
import { Banknote, CreditCard, MapPin, Navigation, Phone, Smartphone, Ban } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import HoursList from "@/components/ui/HoursList";
import StatusPill from "@/components/ui/StatusPill";
import MapEmbed from "@/components/ui/MapEmbed";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { BUSINESS } from "@/data/business";

const PAY_ICONS = { cash: Banknote, card: CreditCard, mobile: Smartphone } as const;

/** Horario + dónde + pago. En la portada lleva cabecera; en /visita la pone la página. */
export default function VisitBlock({ withHeading = true }: { withHeading?: boolean }) {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = m.visita;

  return (
    <section ref={ref} id="visita" aria-labelledby={withHeading ? "visita-title" : undefined} aria-label={withHeading ? undefined : t.pageTitle} className="scroll-mt-24">
      {withHeading ? <div aria-hidden className="filete container-page" /> : null}
      <div className={withHeading ? "container-page py-20 sm:py-28" : "container-page pb-10"}>
        {withHeading ? <SectionHeading id="visita-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.lead} /> : null}

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div data-reveal className="capa-alta grano relative overflow-hidden rounded-[32px] p-6 sm:p-8">
            <div aria-hidden className="glow absolute -top-24 -right-24 -z-0 size-80 [--glow-a:0.2]" />
            <MapEmbed title={t.mapLabel} className="relative -mx-2 -mt-2 mb-7 h-56 rounded-[22px] sm:-mx-4 sm:-mt-4 sm:h-72" />
            <h3 className="relative font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{t.addressTitle}</h3>
            <p className="relative mt-3 font-display text-3xl leading-tight font-medium sm:text-4xl">{BUSINESS.address.street}</p>
            <p className="relative mt-1 text-cream-muted">
              {BUSINESS.address.postalCode} {BUSINESS.address.city} · {m.common.area}
            </p>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <a
                href={BUSINESS.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full bg-oro px-6 text-[15px] font-semibold text-botella hover:bg-oro-light"
              >
                <Navigation aria-hidden className="size-4" />
                {m.common.directions}
              </a>
              <a
                href={`tel:${BUSINESS.phone.e164}`}
                className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.06] px-5 text-[15px] font-medium hover:bg-cream/10"
              >
                <Phone aria-hidden className="size-4 text-oro-light" />
                {BUSINESS.phone.display}
              </a>
            </div>

            <div className="relative mt-8 flex items-start gap-3 rounded-2xl bg-cream/[0.06] p-4 ring-1 ring-cream/10">
              <Ban aria-hidden className="mt-0.5 size-5 shrink-0 text-oro-light" />
              <p className="text-sm leading-relaxed">{t.noReservations}</p>
            </div>

            <h3 className="relative mt-8 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{t.paymentTitle}</h3>
            <ul className="relative mt-3 flex flex-wrap gap-2">
              {BUSINESS.payments.map((p) => {
                const Icon = PAY_ICONS[p];
                return (
                  <li key={p} className="inline-flex items-center gap-2 rounded-full bg-cream/[0.06] px-4 py-2 text-sm ring-1 ring-cream/10">
                    <Icon aria-hidden className="size-4 text-oro-light" />
                    {t.payments[p]}
                  </li>
                );
              })}
            </ul>
          </div>

          <div data-reveal className="capa rounded-[32px] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{t.hoursTitle}</h3>
              <MapPin aria-hidden className="size-4 text-cream-faint" />
            </div>
            <StatusPill className="mt-3" />
            <HoursList className="mt-4 -mx-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
