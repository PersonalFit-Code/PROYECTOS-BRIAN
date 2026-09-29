"use client";

import { MapPin, Phone } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import { BUSINESS } from "@/data/business";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * CartaCta — banda final de la carta: "¿Te ha entrado hambre?".
 * Reservar (modal global de reservas), Llamar (tel:) y Cómo llegar (Google Maps).
 */

export interface CartaCtaProps {
  className?: string;
}

export default function CartaCta({ className }: CartaCtaProps) {
  const m = useMessages();
  const t = useFormat();

  return (
    <section
      aria-labelledby="carta-cta-title"
      className={cn(
        "noise after:noise-after relative overflow-hidden rounded-3xl border border-pimenton-light/30 bg-[url('/textures/embers.webp')] bg-cover bg-center",
        className,
      )}
    >
      {/* Velo + brasa */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(160deg,rgba(34,8,11,0.92),rgba(18,18,18,0.86)_55%,rgba(58,14,19,0.9))]" />
      <div aria-hidden className="ember-glow absolute -right-20 -top-24 h-72 w-72 rounded-full [--ember-a1:0.5] [--ember-rgb:216_50_60]" />

      <div className="relative flex flex-col gap-8 px-6 py-12 md:px-12 md:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex items-center gap-3 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">
            <span aria-hidden className="h-px w-6 bg-pimenton-light/70" />
            {m.carta.ctaKicker}
          </p>
          <h2 id="carta-cta-title" aria-label={m.carta.ctaTitle} className="font-display text-4xl font-medium leading-[1.02] text-cream md:text-5xl">
            {m.carta.ctaLead} <em className="text-gradient-ember font-light italic">{m.carta.ctaAccent}</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-cream-muted md:text-lg">{m.carta.ctaText}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-md lg:justify-end">
          {/* Eran tres y el primero era "Reservar". Quedan dos para que el primario siga siendo uno
              solo: llamar (lo que se hace cuando se quiere preguntar algo) y cómo llegar. */}
          <NeonButton variant="primary" size="lg" pulse icon={<Phone aria-hidden />} href={BUSINESS.phone.tel} aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}>
            {m.common.cta.call}
          </NeonButton>
          <NeonButton variant="outline" size="lg" icon={<MapPin aria-hidden />} href={BUSINESS.social.directions} target="_blank" aria-label={m.common.cta.directionsAria}>
            {m.common.cta.directions}
          </NeonButton>
        </div>
      </div>
    </section>
  );
}
