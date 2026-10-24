import { Gamepad2 } from "lucide-react";
import { BUSINESS, HOME } from "@/content";

export default function GamingZone() {
  return (
    <section aria-labelledby="gaming-title" className="px-4 py-10 sm:px-6">
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
          <div className="anim-float grid h-56 w-56 place-items-center rounded-full border border-white/10 bg-white/5">
            <Gamepad2 className="h-28 w-28 text-gold" strokeWidth={1.4} aria-hidden />
          </div>
          <span aria-hidden className="anim-pulse-dot absolute right-6 top-8 h-4 w-4 rounded-full bg-brand" />
          <span aria-hidden className="anim-pulse-dot absolute bottom-10 left-6 h-3 w-3 rounded-full bg-salsa" style={{ animationDelay: ".6s" }} />
        </div>
      </div>
    </section>
  );
}
