import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Messages } from "@/i18n/getMessages";
import { format } from "@/i18n/getMessages";
import { localePath, type Locale } from "@/i18n/config";
import { LEGAL_PAGES, type LegalSlug } from "@/components/layout/navItems";
import { BUSINESS } from "@/data/business";

/** Los huecos `[pendiente: …]` se pintan resaltados para que nadie publique sin rellenarlos. */
function WithPending({ text }: { text: string }) {
  const parts = text.split(/(\[pendiente[^\]]*\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[pendiente") ? (
          <mark key={i} className="rounded bg-oro/15 px-1 py-0.5 text-oro-a11y ring-1 ring-oro/30">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function LegalDoc({ slug, locale, m }: { slug: LegalSlug; locale: Locale; m: Messages }) {
  const t = m.legal;
  const doc = t.docs[slug];
  const l = BUSINESS.legal;
  const vars = {
    holder: l.holder ?? `[${t.pending.holder}]`,
    taxId: l.taxId ?? `[${t.pending.taxId}]`,
    fiscalAddress: l.fiscalAddress ?? `[${t.pending.fiscalAddress}]`,
    email: l.email ?? `[${t.pending.email}]`,
    registry: l.registry ?? `[${t.pending.registry}]`,
    phone: `${BUSINESS.phone.display}`,
  };
  const pending = Object.values(l).some((v) => v === null);

  return (
    <article className="container-page pt-32 pb-16 sm:pt-40">
      <div className="max-w-3xl">
        <p className="flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
          <span aria-hidden className="h-px w-8 bg-oro-light/70" />
          {t.kicker}
        </p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-none font-medium sm:text-6xl">{doc.title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-cream-muted sm:text-base">{doc.lead}</p>
        <p className="mt-3 text-xs text-cream-faint">{t.updated}</p>
        {pending ? (
          <p className="mt-6 flex gap-3 rounded-2xl border border-oro/30 bg-oro/[0.07] p-4 text-sm leading-relaxed text-cream">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-oro-light" />
            {t.draftNotice}
          </p>
        ) : null}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={t.tocLabel} className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-caps text-[10px] font-semibold tracking-[0.26em] text-oro-a11y uppercase">{t.tocLabel}</p>
          <ol className="mt-3 space-y-1 text-sm">
            {doc.sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#s${i + 1}`} className="inline-flex min-h-9 items-center text-cream-muted hover:text-cream">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-2xl space-y-10">
          {doc.sections.map((s, i) => (
            <section key={s.title} id={`s${i + 1}`} className="scroll-mt-28">
              <h2 className="font-display text-2xl font-medium">
                <span className="mr-3 font-condensed text-xl tracking-wide text-oro/70">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-relaxed text-cream-muted">
                  <WithPending text={format(p, vars)} />
                </p>
              ))}
              {s.list ? (
                <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-cream-muted">
                  {s.list.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-oro/70" />
                      <span>
                        <WithPending text={format(item, vars)} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className="border-t border-cream/10 pt-8">
            <p className="font-caps text-[10px] font-semibold tracking-[0.26em] text-oro-a11y uppercase">{t.otherDocs}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {LEGAL_PAGES.filter((p) => p !== slug).map((p) => (
                <li key={p}>
                  <Link href={localePath(locale, `/legal/${p}`)} className="pulsable inline-flex min-h-11 items-center rounded-full border border-cream/15 px-5 text-sm hover:border-oro/45">
                    {t.docs[p].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
