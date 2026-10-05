import type { Metadata } from "next";
import { Quote, Star, Wine } from "lucide-react";
import PinchoArt from "@/components/ui/PinchoArt";
import PageHeader from "@/components/ui/PageHeader";
import Denominaciones from "@/components/vinos/Denominaciones";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";
import { REVIEWS } from "@/data/reviews";

/* Las dos reseñas que hablan del vino de la casa, con la frase del vino resaltada. */
const WINE_HIGHLIGHT: Record<string, string> = {
  "iberica-iluminacion": "el vino blanco que probamos, que no lo hay en ningún sitio salvo aquí",
  "nina-ucles": "buenos vinos",
};
const WINE_REVIEWS = REVIEWS.filter((r) => r.id in WINE_HIGHLIGHT);

function Resaltado({ text, phrase }: { text: string; phrase: string }) {
  const i = text.indexOf(phrase);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-medium text-oro-light">{phrase}</span>
      {text.slice(i + phrase.length)}
    </>
  );
}

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
        <div className="capa-alta grano relative grid gap-8 overflow-hidden rounded-[32px] p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12 lg:p-10">
          <div aria-hidden className="glow absolute -top-24 -left-24 size-96 [--glow-a:0.18]" />
          <div className="relative flex flex-col items-start">
            <PinchoArt kind="copa" className="w-20 sm:w-24" />
            <p className="mt-4 flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
              <span aria-hidden className="h-px w-8 bg-oro-light/70" />
              {t.houseKicker}
            </p>
            <h2 id="casa-title" className="mt-3 font-display text-3xl leading-tight font-medium text-balance sm:text-4xl">
              {t.houseTitle}
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-pretty text-cream-muted">{t.houseText}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {t.houseFacts.map((f) => (
                <li key={f} className="inline-flex items-center gap-2 rounded-full bg-oro/10 px-3.5 py-1.5 text-[13px] text-cream ring-1 ring-oro/25">
                  <Wine aria-hidden className="size-3.5 text-oro-light" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-cream-faint">{t.housePending}</p>
          </div>

          <div className="relative">
            <p className="font-caps text-[10px] font-semibold tracking-[0.26em] text-oro-a11y uppercase">{t.quoteLabel}</p>
            <div className="mt-3 grid gap-3 sm:auto-rows-fr sm:grid-cols-2">
              {WINE_REVIEWS.map((r) => (
                <figure key={r.id} className="flex h-full flex-col rounded-2xl bg-botella-900/55 p-5 ring-1 ring-cream/10">
                  <div className="flex items-center justify-between">
                    <span className="flex gap-0.5 text-oro" role="img" aria-label={`${r.rating} de 5`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} aria-hidden className="size-3.5" fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                      ))}
                    </span>
                    <Quote aria-hidden className="size-4 text-oro/60" />
                  </div>
                  <blockquote className="mt-3 text-[14.5px] leading-relaxed text-pretty text-cream/85">
                    «<Resaltado text={r.text} phrase={WINE_HIGHLIGHT[r.id]} />»
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-2.5 pt-4 text-[13px] text-cream-muted">
                    <span aria-hidden className="inline-flex size-7 items-center justify-center rounded-full bg-oro/15 font-display text-sm text-oro-light ring-1 ring-oro/25">
                      {r.author.replace(/[^\p{L}]/gu, "").charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{r.author}</span>
                    <span className="rounded-full bg-cream/[0.06] px-2.5 py-0.5 text-[10px] text-cream-faint ring-1 ring-cream/10">{r.platform}</span>
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
        <h2 id="do-title" className="mt-3 font-display text-3xl leading-tight font-medium sm:text-4xl">
          {t.doTitle}
        </h2>
        <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-pretty text-cream-muted">{t.doLead}</p>
        <Denominaciones />
      </section>
    </>
  );
}
