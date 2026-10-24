import type { Metadata } from "next";
import Link from "next/link";
import { CARTA, SEO } from "@/content";
import { MENU } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { menuJsonLd, serializeJsonLd } from "@/lib/seo";
import OpenBadge from "@/components/layout/OpenBadge";
import MenuTabs from "@/components/carta/MenuTabs";
import SpiceMeter from "@/components/common/SpiceMeter";

export const metadata: Metadata = {
  title: SEO.carta.title,
  description: SEO.carta.description,
  alternates: { canonical: "/carta" },
  openGraph: { title: SEO.carta.title, description: SEO.carta.description, url: "/carta" },
};

export default function CartaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(menuJsonLd()) }} />
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pt-14">
        <OpenBadge className="enter-up" />
        <h1 className="enter-up mt-6 font-display text-6xl uppercase leading-none sm:text-7xl">
          La <span className="text-brand-text">carta</span>
        </h1>
        <p className="enter-up mt-6 max-w-3xl text-lg leading-relaxed text-fg-muted">
          {CARTA.intro[0]}
          <strong className="text-fg">{CARTA.intro[1]}</strong>
          {CARTA.intro[2]}
        </p>
        <Link href="/monta-tu-taco" className="press btn btn-primary enter-up mt-6">
          Monta tu taco
        </Link>
      </section>

      <MenuTabs />

      {/* Lo que se elige dentro del taco: carnes, salsas y extras (todo desde menu.json). */}
      <section aria-labelledby="dentro-title" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 id="dentro-title" className="font-display text-4xl uppercase">Qué puedes elegir dentro</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="card p-6">
            <h3 className="font-display text-2xl uppercase text-brand-text">Carnes</h3>
            <ul className="mt-4 space-y-2">
              {MENU.meats.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: m.color }} /> {m.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-2xl uppercase text-brand-text">Salsas · hasta {MENU.maxFreeSauces} gratis</h3>
            <ul className="mt-4 space-y-2">
              {MENU.sauces.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  {s.name} <SpiceMeter level={s.spice} />
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-2xl uppercase text-brand-text">Extras</h3>
            <ul className="mt-4 space-y-2">
              {MENU.extras.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3">
                  {e.name} <span className="font-bold">+{formatPrice(e.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-sm text-fg-muted">{CARTA.note}</p>
      </section>
    </>
  );
}
