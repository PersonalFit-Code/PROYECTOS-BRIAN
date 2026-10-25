import Link from "next/link";
import { BUSINESS, HOME } from "@/content";
import OpenBadge from "@/components/layout/OpenBadge";
import PhotoSlot from "@/components/common/PhotoSlot";
import Sticker from "@/components/common/Sticker";
import Tape from "@/components/common/Tape";
import { MENU } from "@/data/menu";
import { formatPrice } from "@/lib/format";

export default function Hero() {
  const { hero } = HOME;
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Halo cálido detrás del taco */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-brand/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-cheese/20 blur-[110px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-14">
        <div>
          <div className="enter-up">
            <OpenBadge />
          </div>
          <h1 id="hero-title" className="enter-up mt-6 font-display text-5xl uppercase leading-[0.92] tracking-tight text-balance sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            Los auténticos <span className="text-brand-text">French Tacos</span> de Lyon llegan a <span className="text-gold-text">Ourense</span>
          </h1>
          <p className="enter-up mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted text-pretty">{hero.subtitle}</p>
          <div className="enter-up mt-8 flex flex-wrap gap-3">
            <Link href="/carta" className="press btn btn-cheese">
              {hero.ctaMenu}
            </Link>
            <Link href="/monta-tu-taco" className="press btn btn-primary">
              {hero.ctaBuilder}
            </Link>
            <Link href="/contacto#pedir" className="press btn btn-ghost">
              {hero.ctaDelivery}
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted" aria-label="Valoraciones">
            {BUSINESS.ratings.map((r) => (
              <li key={r.platform}>
                <span className="font-bold text-gold-text">★ {r.value.toLocaleString("es-ES")}</span> en {r.platform} ({r.count} reseñas)
              </li>
            ))}
          </ul>
        </div>

        {/* Foto real en polaroid, pegada con cinta y con sus pegatinas. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <figure className="polaroid relative rotate-2">
            <Tape className="-top-3 left-6 -rotate-6" />
            <Tape className="-top-3 right-6 rotate-6" />
            <PhotoSlot slot="hero" priority className="aspect-square w-full rounded-[4px]" sizes="(min-width: 1024px) 512px, 90vw" label="French tacos" />
            <figcaption className="mt-2 text-center font-display text-lg uppercase tracking-wide text-ink">Gratinados de la casa</figcaption>
          </figure>
          <Sticker tone="gold" rotate={-8} className="absolute -left-4 top-10 text-2xl sm:-left-8">
            desde {formatPrice(Math.min(...MENU.tacoStyles.flatMap((s) => Object.values(s.prices))))}
          </Sticker>
          <Sticker tone="brand" rotate={5} className="absolute -bottom-4 right-2 text-lg sm:-right-6">
            Prensado a la plancha
          </Sticker>
        </div>
      </div>

      {/* Cinta de ambiente */}
      <div className="border-y border-line bg-brand py-3 text-ink" aria-hidden>
        <div className="flex w-max anim-marquee gap-10 whitespace-nowrap font-display text-xl uppercase tracking-wider">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-10">
              {["French tacos", "Salsa quesera casera", "Patatas dentro", "Taco rebozado", "Zona gaming PS5", "Rúa Pena Trevinca, 12"].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t} <span className="text-cocoa">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
