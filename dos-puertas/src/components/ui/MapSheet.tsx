"use client";

import { Navigation, Phone } from "lucide-react";
import MapEmbed from "./MapEmbed";
import Sheet from "./Sheet";
import { useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";

/** «Cómo llegar» sin salir de la web: el mapa, la dirección y el salto a Google Maps. */
export default function MapSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const m = useMessages();
  return (
    <Sheet open={open} onClose={onClose} labelledBy="map-title" className="md:max-w-2xl">
      <p className="font-caps text-[11px] font-semibold tracking-[0.24em] text-oro-a11y uppercase">{m.common.directions}</p>
      <h2 id="map-title" className="mt-2 pr-12 font-display text-3xl leading-tight font-medium">
        {BUSINESS.address.street}
      </h2>
      <p className="mt-1 text-sm text-cream-muted">
        {BUSINESS.address.postalCode} {BUSINESS.address.city} · {BUSINESS.address.area}
      </p>
      <MapEmbed title={m.visita.mapLabel} className="mt-5 aspect-[4/3] rounded-2xl md:aspect-[16/10]" />
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={BUSINESS.maps}
          target="_blank"
          rel="noopener noreferrer"
          className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full bg-oro px-6 text-[15px] font-semibold text-botella hover:bg-oro-light"
        >
          <Navigation aria-hidden className="size-4" />
          {m.common.openInMaps}
        </a>
        <a
          href={`tel:${BUSINESS.phone.e164}`}
          className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.06] px-5 text-[15px] font-medium hover:bg-cream/10"
        >
          <Phone aria-hidden className="size-4 text-oro-light" />
          {BUSINESS.phone.display}
        </a>
      </div>
    </Sheet>
  );
}
