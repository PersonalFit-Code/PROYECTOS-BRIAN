import Link from "next/link";
import { BUSINESS, HOME } from "@/content";
import OpenBadge from "@/components/layout/OpenBadge";
import TacoPreview from "@/components/common/TacoPreview";

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

        <div className="relative mx-auto w-full max-w-lg">
          <div className="anim-float text-fg">
            <TacoPreview style="rebozado" size="XL" meats={["pollo", "cordon-bleu", "picada"]} sauces={["algerienne", "cheddar"]} extras={["gratinado-mozzarella"]} className="h-auto w-full drop-shadow-2xl" label="Ilustración de un French taco XL rebozado, cortado por la mitad: patatas, tres carnes, salsa quesera y gratinado" />
          </div>
          <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 -rotate-2 whitespace-nowrap rounded-xl bg-gold px-4 py-2 font-display text-lg uppercase tracking-wide text-ink shadow-lg">
            Prensado a la plancha
          </p>
        </div>
      </div>

      {/* Cinta de ambiente */}
      <div className="border-y border-line bg-brand py-3 text-white" aria-hidden>
        <div className="flex w-max anim-marquee gap-10 whitespace-nowrap font-display text-xl uppercase tracking-wider">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-10">
              {["French tacos", "Salsa quesera casera", "Patatas dentro", "Taco rebozado", "Zona gaming PS5", "Rúa Pena Trevinca, 12"].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t} <span className="text-gold">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
