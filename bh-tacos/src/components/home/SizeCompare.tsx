import Link from "next/link";
import { HOME } from "@/content";
import { MENU } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import SectionHeading from "@/components/common/SectionHeading";
import TacoPreview from "@/components/common/TacoPreview";
import TornEdge from "@/components/common/TornEdge";

export default function SizeCompare() {
  const clasico = MENU.tacoStyles.find((s) => s.id === "clasico") ?? MENU.tacoStyles[0];
  const rebozado = MENU.tacoStyles.find((s) => s.id === "rebozado") ?? MENU.tacoStyles[1];
  return (
    <section aria-labelledby="sizes-title" className="on-cream relative">
      <TornEdge fill="var(--cream-bg)" className="absolute -top-6 left-0 sm:-top-9" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading id="sizes-title" kicker="Tamaños" title={HOME.sizes.title} text={HOME.sizes.text} highlight="Tú decides" />
      <ul className="mt-12 grid gap-5 md:grid-cols-3">
        {MENU.tacoSizes.map((s, i) => (
          <li key={s.id} className="reveal" style={{ ["--i" as string]: i }}>
            <article className="card lift press flex h-full flex-col p-6 shadow-[var(--shadow-warm)]" style={{ rotate: `${[-1, 0.6, -0.4][i]}deg` }}>
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-6xl uppercase text-brand-text">{s.id}</h3>
                <p className="text-right text-sm text-fg-muted">
                  {s.meats} {s.meats === 1 ? "carne" : "carnes"}
                </p>
              </div>
              {/* Referencia de escala: el mismo dibujo a la escala de cada tamaño, sobre una regla. */}
              <div className="relative mt-4 flex h-44 items-end justify-center rounded-2xl bg-bg-alt text-fg">
                <TacoPreview style="clasico" size={s.id} meats={MENU.meats.slice(0, s.meats).map((m) => m.id)} className="h-full w-auto" />
                <div aria-hidden className="absolute inset-x-6 bottom-3 flex justify-between border-t border-dashed border-line pt-1 text-[10px] text-fg-muted">
                  <span>0</span>
                  <span>{s.reference}</span>
                </div>
              </div>
              <p className="mt-4 flex-1 text-fg-muted">{s.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-surface-2 p-3">
                  <dt className="text-fg-muted">Clásico</dt>
                  <dd className="font-display text-2xl">{formatPrice(clasico.prices[s.id])}</dd>
                </div>
                <div className="rounded-xl bg-surface-2 p-3">
                  <dt className="text-fg-muted">Rebozado</dt>
                  <dd className="font-display text-2xl">{formatPrice(rebozado.prices[s.id])}</dd>
                </div>
              </dl>
              <Link href={`/monta-tu-taco?estilo=clasico&tamano=${s.id}`} className="press btn btn-ghost mt-5">
                Montar un {s.id}
              </Link>
            </article>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
