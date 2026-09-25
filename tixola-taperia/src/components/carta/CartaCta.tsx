"use client";

import { CalendarCheck, MapPin, Phone, Printer } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/utils";

/**
 * CartaCta — banda final de la carta: "¿Te ha entrado hambre?".
 * Reservar (modal global), Llamar, Cómo llegar e Imprimir carta (window.print, con estilos
 * de impresión definidos en CartaExplorer).
 */

export interface CartaCtaProps {
  className?: string;
}

export default function CartaCta({ className }: CartaCtaProps) {
  const { open } = useReservation();

  return (
    <section
      aria-labelledby="carta-cta-title"
      className={cn(
        "carta-no-print noise after:noise-after relative overflow-hidden rounded-3xl border border-pimenton-light/30 bg-[url('/textures/embers.webp')] bg-cover bg-center",
        className,
      )}
    >
      {/* Velo + brasa */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(160deg,rgba(34,8,11,0.92),rgba(18,18,18,0.86)_55%,rgba(58,14,19,0.9))]" />
      <div
        aria-hidden
        className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(216,50,60,0.5),transparent)] blur-2xl"
      />

      <div className="relative flex flex-col gap-8 px-6 py-12 md:px-12 md:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-pimenton-light">
            <span aria-hidden className="h-px w-6 bg-pimenton-light/70" />
            Junto a la Catedral
          </p>
          <h2 id="carta-cta-title" className="font-display text-4xl leading-[1.05] text-cream md:text-5xl">
            ¿Te ha entrado <em className="text-gradient-ember font-display italic">hambre?</em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-cream-muted md:text-lg">
            Reserva mesa o pásate por {BUSINESS.address.street}. Las tixolas salen chisporroteando y la terraza mira a la Catedral.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-md lg:justify-end">
          <NeonButton variant="primary" size="lg" pulse icon={<CalendarCheck aria-hidden />} onClick={open}>
            Reservar mesa
          </NeonButton>
          <NeonButton variant="outline" size="lg" icon={<Phone aria-hidden />} href={BUSINESS.phone.tel} aria-label={`Llamar al ${BUSINESS.phone.display}`}>
            Llamar
          </NeonButton>
          <NeonButton variant="outline" size="lg" icon={<MapPin aria-hidden />} href={BUSINESS.social.directions} target="_blank">
            Cómo llegar
          </NeonButton>
          <NeonButton variant="ghost" size="lg" icon={<Printer aria-hidden />} onClick={() => window.print()} className="text-cream-muted hover:text-cream">
            Imprimir carta
          </NeonButton>
        </div>
      </div>
    </section>
  );
}
