import type { Metadata } from "next";
import { Quote, Wine } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Denominaciones from "@/components/vinos/Denominaciones";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";
import { REVIEWS } from "@/data/reviews";

/* Las dos reseñas que hablan del vino de la casa. */
const WINE_REVIEWS = REVIEWS.filter((r) => r.id === "iberica-iluminacion" || r.id === "nina-ucles");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/vinos", { title: m.vinos.kicker, description: m.vinos.pageLead });
}

export default async function VinosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  const t = m.vinos;
  return (
    <>
      <PageHeader kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.pageLead} />

      <section aria-labelledby="casa-title" className="container-page">
        <div className="capa-alta grano relative grid gap-8 overflow-hidden rounded-[32px] p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-10">
          <div aria-hidden className="glow absolute -top-24 -left-24 size-96 [--glow-a:0.18]" />
          <div className="relative">
            <p className="flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
              <Wine aria-hidden className="size-4" />
              {t.houseKicker}
            </p>
            <h2 id="casa-title" className="mt-3 font-display text-3xl leading-tight font-medium sm:text-4xl">
              {t.houseTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-cream-muted">{t.houseText}</p>
            <p className="mt-4 inline-flex rounded-full bg-cream/[0.06] px-3 py-1.5 text-xs text-cream-faint ring-1 ring-cream/10">{t.housePending}</p>
          </div>
          <div className="relative">
            <p className="font-caps text-[10px] font-semibold tracking-[0.26em] text-oro-a11y uppercase">{t.quoteLabel}</p>
            <div className="mt-3 space-y-3">
              {WINE_REVIEWS.map((r) => (
                <figure key={r.id} className="rounded-2xl bg-tinta-900/50 p-4 ring-1 ring-cream/10">
                  <Quote aria-hidden className="size-4 text-oro-light" />
                  <blockquote className="mt-2 font-display text-lg leading-snug italic">«{r.text}»</blockquote>
                  <figcaption className="mt-2 text-xs text-cream-faint">
                    — {r.author} · {r.platform}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="do-title" className="container-page py-16 sm:py-20">
        <p className="flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
          <span aria-hidden className="h-px w-8 bg-oro-light/70" />
          {t.doKicker}
        </p>
        <h2 id="do-title" className="mt-3 mb-8 font-display text-3xl leading-tight font-medium sm:text-4xl">
          {t.doTitle}
        </h2>
        <Denominaciones />
      </section>
    </>
  );
}
