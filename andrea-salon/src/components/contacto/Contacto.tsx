"use client";

import { useRef } from "react";
import { Car, MapPin, Navigation, Phone } from "lucide-react";
import Boton from "@/components/ui/Boton";
import HoursList from "@/components/ui/HoursList";
import MapEmbed from "@/components/ui/MapEmbed";
import SectionHeading from "@/components/ui/SectionHeading";
import StatusPill from "@/components/ui/StatusPill";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";
import { InstagramGlyph } from "@/components/ui/SocialGlyphs";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/utils";

/**
 * Bloque de contacto: dirección, teléfono, WhatsApp, Instagram, horario en vivo y el mapa (tras
 * consentimiento). `compact` es la versión corta de la portada (sin aparcamiento ni nota de reserva);
 * la página /contacto lo monta entero con `titleAs="h1"`.
 */
export default function Contacto({ compact = false, titleAs = "h2" }: { compact?: boolean; titleAs?: "h1" | "h2" }) {
  const m = useMessages();
  const t = useFormat();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const c = m.contacto;
  const h = compact ? m.home.contacto : c;

  const fila = "flex min-h-6 items-start gap-3 py-0.5 text-sm text-gris";
  const icono = "mt-0.5 size-4 shrink-0 text-carmin-suave";

  return (
    <section ref={ref} id="contacto" aria-labelledby="contacto-title" className="scroll-mt-24">
      {compact ? <div aria-hidden className="filete container-page" /> : null}
      <div className={cn("container-page", compact ? "py-20 sm:py-28" : "pt-8 pb-20 sm:pb-28")}>
        <SectionHeading as={titleAs} id="contacto-title" entrada={!compact} kicker={h.kicker} title={h.title} accent={h.accent} description={h.description} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="space-y-8">
            {/* Una tarjeta, dos listas: un <dl> solo admite grupos <div> con <dt>/<dd> como hijos
                directos, así que la rejilla ES la lista (y aparcar va en otra, bajo la raya). */}
            <div data-reveal className="glass rounded-3xl p-6 sm:p-8">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{c.address}</dt>
                  <dd className="mt-2">
                    <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className={cn(fila, "hover:text-tinta")}>
                      <MapPin aria-hidden className={icono} />
                      <span>
                        {BUSINESS.address.street}
                        <span className="block">
                          {BUSINESS.address.postalCode} {BUSINESS.address.city}
                        </span>
                        <span className="sr-only"> ({m.common.misc.newTab})</span>
                      </span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{c.phone}</dt>
                  <dd className="mt-2">
                    <a href={BUSINESS.phone.tel} className={cn(fila, "hover:text-tinta")} aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}>
                      <Phone aria-hidden className={icono} />
                      {BUSINESS.phone.display}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{c.whatsapp}</dt>
                  <dd className="mt-2">
                    <a href={BUSINESS.whatsapp.url} target="_blank" rel="noopener noreferrer" className={cn(fila, "hover:text-tinta")}>
                      <WhatsAppGlyph size="size-4" className="mt-0.5 shrink-0 text-carmin-suave" />
                      {BUSINESS.whatsapp.display}
                      <span className="sr-only"> ({m.common.misc.newTab})</span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{c.social}</dt>
                  <dd className="mt-2">
                    <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" className={cn(fila, "hover:text-tinta")}>
                      <InstagramGlyph className={icono} />
                      {BUSINESS.social.instagramHandle}
                      <span className="sr-only"> ({m.common.misc.newTab})</span>
                    </a>
                  </dd>
                </div>
              </dl>
              {!compact ? (
                <dl className="mt-6 border-t border-carmin/10 pt-5">
                  <dt className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{c.parking}</dt>
                  <dd className={cn(fila, "mt-2")}>
                    <Car aria-hidden className={icono} />
                    {c.parkingText}
                  </dd>
                </dl>
              ) : null}
            </div>

            <div data-reveal>
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{c.hours}</h3>
              <StatusPill className="mt-3" />
              <HoursList className="mt-3 -mx-3" />
              {!compact ? <p className="mt-4 text-sm text-gris">{c.bookNote}</p> : null}
            </div>
          </div>

          <div data-reveal className="flex flex-col gap-4">
            <MapEmbed title={c.mapTitle} className="h-72 rounded-3xl sm:h-96 lg:h-full lg:min-h-[420px]" />
            <div className="flex flex-wrap gap-3">
              <Boton href={BUSINESS.directions} target="_blank" icon={<Navigation aria-hidden />} aria-label={m.common.cta.directionsAria}>
                {c.howToArrive}
              </Boton>
              <Boton href={BUSINESS.maps} target="_blank" variant="secundario">
                {m.common.cta.openMaps}
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
