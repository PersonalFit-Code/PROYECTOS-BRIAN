import Link from "next/link";
import { HOME } from "@/content";
import { FEATURED_ITEMS, MENU, comboPrice, findItem } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import SectionHeading from "@/components/common/SectionHeading";
import TacoPreview from "@/components/common/TacoPreview";

export default function FeaturedMenu() {
  return (
    <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading id="featured-title" kicker="Para empezar" title={HOME.featured.title} text={HOME.featured.text} />
      <ul className="mt-12 grid gap-5 md:grid-cols-3">
        {FEATURED_ITEMS.slice(0, 3).map((item, i) => (
          <li key={item.id} className="reveal" style={{ ["--i" as string]: i }}>
            <article className="card lift press flex h-full flex-col p-5">
              <div className="rounded-2xl bg-bg-alt p-2 text-fg">
                {item.builder && (
                  <TacoPreview
                    style={item.builder.style}
                    size={item.builder.size}
                    meats={MENU.meats.slice(0, MENU.tacoSizes.find((s) => s.id === item.builder?.size)?.meats ?? 1).map((m) => m.id)}
                    sauces={["algerienne"]}
                    className="h-40 w-full"
                  />
                )}
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-3xl uppercase leading-none">{item.name}</h3>
                <p className="shrink-0 rounded-full bg-gold px-3 py-1 font-bold text-ink">{formatPrice(item.price)}</p>
              </div>
              <p className="mt-3 flex-1 text-fg-muted">{item.description}</p>
              {item.builder && (
                <Link href={`/monta-tu-taco?estilo=${item.builder.style}&tamano=${item.builder.size}`} className="press btn btn-primary mt-5">
                  Personalizar
                </Link>
              )}
            </article>
          </li>
        ))}
      </ul>

      <h3 className="reveal mt-14 font-display text-3xl uppercase">Combos sugeridos</h3>
      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {MENU.combos.map((combo, i) => (
          <li key={combo.id} className="reveal" style={{ ["--i" as string]: i }}>
            <article className="card flex h-full flex-col gap-4 border-dashed p-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <h4 className="font-display text-2xl uppercase text-brand-text">{combo.name}</h4>
                <p className="mt-2 text-fg-muted">{combo.description}</p>
                <p className="mt-2 text-sm text-fg-muted">{combo.items.map((id) => findItem(id)?.name).filter(Boolean).join(" · ")}</p>
              </div>
              <p className="shrink-0 text-right">
                <span className="block text-xs uppercase tracking-wider text-fg-muted">Precio orientativo</span>
                <span className="font-display text-4xl">{formatPrice(comboPrice(combo))}</span>
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
