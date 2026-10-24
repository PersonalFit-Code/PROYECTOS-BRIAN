"use client";

import { MapPin } from "lucide-react";
import { BUSINESS } from "@/content";
import { setConsent } from "@/lib/consent";
import useConsent from "@/hooks/useConsent";

/** El iframe de Google Maps instala cookies de terceros: solo se carga con permiso. */
export default function MapEmbed() {
  const consent = useConsent();
  if (consent === "accepted") {
    return (
      <iframe
        title="Mapa: BH Tacos en Rúa Pena Trevinca, 12, Ourense"
        src={BUSINESS.mapsEmbed}
        className="h-80 w-full rounded-[20px] border border-line lg:h-full lg:min-h-96"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <div className="grid h-80 place-items-center rounded-[20px] border border-dashed border-line bg-bg-alt p-6 text-center lg:h-full lg:min-h-96">
      <div>
        <MapPin className="mx-auto h-10 w-10 text-brand-text" aria-hidden />
        <p className="mt-3 max-w-xs text-fg-muted">El mapa es de Google y usa cookies. Lo cargamos solo si lo aceptas.</p>
        <button type="button" onClick={() => setConsent("accepted")} className="press btn btn-ghost mt-4">
          Cargar el mapa
        </button>
      </div>
    </div>
  );
}
