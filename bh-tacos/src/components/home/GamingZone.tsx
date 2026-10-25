import { Gamepad2 } from "lucide-react";
import PhotoSlot from "@/components/common/PhotoSlot";
import Sticker from "@/components/common/Sticker";
import { BUSINESS, HOME } from "@/content";
import TornEdge from "@/components/common/TornEdge";

export default function GamingZone() {
  return (
    <section aria-labelledby="gaming-title" className="relative bg-bg px-4 pb-16 pt-20 sm:px-6">
      <TornEdge fill="var(--bg)" className="absolute -top-6 left-0 sm:-top-9" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 overflow-hidden rounded-[28px] bg-[#14112a] p-8 text-snow sm:p-12 lg:grid-cols-[1.3fr_1fr]">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-salsa/40 blur-[90px]" />
        <div className="relative reveal">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-gold">Zona gaming · PS5</p>
          <h2 id="gaming-title" className="mt-3 font-display text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            {HOME.gaming.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#d9d6ee]">{HOME.gaming.text}</p>
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="press btn btn-cheese mt-8">
            {HOME.gaming.cta}
          </a>
        </div>
        {/* Mando dibujado con botones que laten (microanimación decorativa). */}
        <div className="relative reveal mx-auto grid place-items-center" style={{ ["--i" as string]: 1 }}>
          {/* TODO: foto de la zona de la PS5; hoy, el local por dentro. */}
          <figure className="polaroid relative w-full max-w-sm rotate-2">
            <PhotoSlot slot="gaming" className="aspect-[4/3] w-full rounded-[4px]" sizes="(min-width: 1024px) 384px, 90vw" label="Zona gaming" />
            <figcaption className="mt-2 text-center font-display text-lg uppercase tracking-wide text-ink">Ven a echar el rato</figcaption>
          </figure>
          <Sticker tone="gold" rotate={-7} className="absolute -left-2 -top-4 text-xl">
            <Gamepad2 className="h-5 w-5" aria-hidden /> PS5 gratis
          </Sticker>
        </div>
      </div>
    </section>
  );
}
