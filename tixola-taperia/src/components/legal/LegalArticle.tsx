"use client";

import Link from "next/link";
import { Fragment, useMemo, type ReactNode } from "react";
import { ArrowLeft, ChevronRight, Cookie, FileText, Info, ListOrdered, Mail, Phone, ScrollText } from "lucide-react";
import { BUSINESS } from "@/data/business";
import {
  CONSENT_MAX_AGE_MONTHS,
  LEGAL_DOC_KEYS,
  LEGAL_PLACEHOLDERS,
  LEGAL_UPDATED_AT,
  PLACEHOLDER_PATTERN,
  type LegalBlock,
  type LegalDocKey,
} from "@/data/legal";
import NeonButton from "@/components/ui/NeonButton";
import { type Locale } from "@/i18n/config";
import { formatLongDate } from "@/lib/format";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { openCookieSettings } from "@/lib/consent";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Variables de plantilla
   ────────────────────────────────────────────────────────────── */

/** Fecha de revisión legible en el idioma de la página ("25 de septiembre de 2026"). */
export function formatLegalDate(locale: Locale): string {
  /* Mediodía local: evita que el día cambie por la zona horaria del servidor. */
  return formatLongDate(LEGAL_UPDATED_AT, locale);
}

/**
 * Marcadores disponibles en los textos legales ({tradeName}, {companyName}, {email}, {phone}…).
 * Los datos del responsable salen de LEGAL_PLACEHOLDERS hasta que el cliente los sustituya.
 */
export function legalTemplateVars(locale: Locale): Record<string, string> {
  return {
    tradeName: BUSINESS.name,
    ...LEGAL_PLACEHOLDERS,
    address: BUSINESS.address.full,
    city: BUSINESS.address.city,
    phone: BUSINESS.phone.display,
    phoneTel: BUSINESS.phone.e164,
    siteUrl: SITE_URL,
    updated: formatLegalDate(locale),
    consentMonths: String(CONSENT_MAX_AGE_MONTHS),
  };
}

/** `true` mientras algún dato del responsable conserve los corchetes (pendiente de confirmar). */
const HAS_PENDING_PLACEHOLDERS = Object.values(LEGAL_PLACEHOLDERS).some((v) => v.search(PLACEHOLDER_PATTERN) !== -1);

/* ──────────────────────────────────────────────────────────────
   Marcado en línea: **negrita**, [enlace](destino) y marcadores [PENDIENTES]
   ────────────────────────────────────────────────────────────── */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const DOC_ICON: Record<LegalDocKey, typeof FileText> = { privacy: ScrollText, legalNotice: FileText, cookies: Cookie };

interface InlineContext {
  /** Resuelve destinos internos (privacy | legalNotice | cookies | home | carta) a rutas con idioma. */
  hrefFor: (target: string) => string | null;
  newTabLabel: string;
}

/** Resalta los marcadores "[ASÍ]" que el cliente aún no ha sustituido. */
function highlightPlaceholders(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(PLACEHOLDER_PATTERN);
  if (parts.length === 1) return [text];
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={`${keyPrefix}-${i}`} className="rounded bg-gold/15 px-1 font-semibold text-gold [box-decoration-break:clone]">
        {part}
      </mark>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
    ),
  );
}

/** Convierte un texto ya interpolado en nodos React (negritas, enlaces, marcadores). */
function renderInline(text: string, ctx: InlineContext): ReactNode[] {
  const linkClass = "text-cream underline decoration-pimenton-light/70 underline-offset-4 transition-colors hover:text-pimenton-a11y hover:decoration-pimenton-light";
  return text.split(INLINE_PATTERN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-cream">
          {highlightPlaceholders(part.slice(2, -2), `b${i}`)}
        </strong>
      );
    }
    const link = LINK_PATTERN.exec(part);
    if (link) {
      const [, label, target] = link;
      const internal = ctx.hrefFor(target);
      if (internal) {
        return (
          <Link key={i} href={internal} className={linkClass}>
            {label}
          </Link>
        );
      }
      const external = /^https?:/.test(target);
      return (
        <a
          key={i}
          href={target}
          className={linkClass}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {highlightPlaceholders(label, `l${i}`)}
          {external && <span className="sr-only"> ({ctx.newTabLabel})</span>}
        </a>
      );
    }
    return <Fragment key={i}>{highlightPlaceholders(part, `t${i}`)}</Fragment>;
  });
}

/* ──────────────────────────────────────────────────────────────
   Bloques
   ────────────────────────────────────────────────────────────── */

const bodyText = "text-[15px] leading-relaxed text-cream-200/90 md:text-base";

/** Celda de tabla: en < md cada fila es una tarjeta y la cabecera se pinta con `data-label`. */
const cellClass = cn(
  "md:border-b md:border-cream/10 md:py-3 md:pr-4 md:align-top md:last:pr-0",
  "max-md:flex max-md:gap-3 max-md:py-1.5",
  "max-md:before:w-20 max-md:before:shrink-0 max-md:before:pt-0.5 max-md:before:font-caps max-md:before:text-[10px] max-md:before:uppercase max-md:before:tracking-[0.2em] max-md:before:text-pimenton-a11y max-md:before:content-[attr(data-label)]",
);

function Block({ block, ctx, fmt }: { block: LegalBlock; ctx: InlineContext; fmt: (s: string) => string }) {
  const inline = (s: string) => renderInline(fmt(s), ctx);

  switch (block.type) {
    case "p":
      return <p className={bodyText}>{inline(block.text)}</p>;

    case "ul":
    case "ol": {
      const Tag = block.type;
      return (
        <Tag className={cn("flex flex-col gap-2.5 pl-1", bodyText, block.type === "ol" && "list-decimal pl-6 marker:text-pimenton-a11y")}>
          {block.items.map((item, i) => (
            <li key={i} className={cn(block.type === "ul" && "relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-pimenton-light")}>
              {inline(item)}
            </li>
          ))}
        </Tag>
      );
    }

    case "dl":
      return (
        <dl className="grid gap-x-6 gap-y-3 rounded-2xl border border-cream/10 bg-cream/[0.03] p-5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-y-4">
          {block.items.map((item, i) => (
            <Fragment key={i}>
              <dt className="font-caps text-[11px] uppercase leading-relaxed tracking-[0.25em] text-pimenton-a11y">{inline(item.term)}</dt>
              <dd className={cn(bodyText, "text-cream")}>{inline(item.desc)}</dd>
            </Fragment>
          ))}
        </dl>
      );

    case "table":
      return (
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{fmt(block.caption)}</caption>
          <thead className="max-md:sr-only">
            <tr>
              {block.head.map((h, i) => (
                <th key={i} scope="col" className="border-b border-cream/20 pb-3 pr-4 font-caps text-[11px] font-medium uppercase tracking-[0.22em] text-pimenton-a11y last:pr-0">
                  {fmt(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r} className="max-md:mb-3 max-md:block max-md:rounded-2xl max-md:border max-md:border-cream/10 max-md:bg-cream/[0.03] max-md:p-4">
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row" data-label={fmt(block.head[c])} className={cn(cellClass, "text-left font-semibold text-cream")}>
                      <span className="min-w-0">{inline(cell)}</span>
                    </th>
                  ) : (
                    <td key={c} data-label={fmt(block.head[c])} className={cn(cellClass, "text-cream-200/90")}>
                      <span className="min-w-0">{inline(cell)}</span>
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "note":
      return (
        <aside className="glass-red flex items-start gap-3 rounded-2xl px-5 py-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-pimenton-a11y" aria-hidden />
          <p className={cn(bodyText, "text-cream")}>{inline(block.text)}</p>
        </aside>
      );

    case "cookieSettings":
      return (
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <NeonButton variant="outline" size="md" icon={<Cookie aria-hidden />} onClick={openCookieSettings}>
            {fmt(block.label)}
          </NeonButton>
          <span className="text-sm text-cream-faint">{fmt(block.hint)}</span>
        </div>
      );

    default: {
      /* Exhaustividad: si aparece un tipo nuevo, TypeScript avisa aquí. */
      const never: never = block;
      return never;
    }
  }
}

/* ──────────────────────────────────────────────────────────────
   Artículo
   ────────────────────────────────────────────────────────────── */

/**
 * Página legal (privacidad · aviso legal · cookies): migas de pan, cabecera editorial, índice
 * pegajoso en escritorio (plegable en móvil), secciones con anclas, tarjeta de contacto y
 * enlaces a los otros documentos. Todo el texto sale de `m.legal` y se interpola con los datos
 * de negocio y los marcadores de src/data/legal.ts (resaltados mientras estén pendientes).
 */
export default function LegalArticle({ docKey }: { docKey: LegalDocKey }) {
  const m = useMessages();
  const t = useFormat();
  const lp = useLocalePath();
  const locale = useLocale();

  const vars = useMemo(() => legalTemplateVars(locale), [locale]);
  const fmt = useMemo(() => (s: string) => t(s, vars), [t, vars]);
  const doc = m.legal.docs[docKey];
  const title = m.legal[docKey].title;

  const ctx = useMemo<InlineContext>(
    () => ({
      hrefFor: (target) => {
        if (target === "home") return lp("/");
        if (target === "carta") return lp("/carta");
        const key = LEGAL_DOC_KEYS.find((k) => k === target);
        return key ? lp(`/legal/${m.legal[key].slug}`) : null;
      },
      newTabLabel: m.common.misc.newTab,
    }),
    [lp, m],
  );

  const related = LEGAL_DOC_KEYS.filter((k) => k !== docKey);

  const toc = (
    <ol className="flex flex-col gap-1">
      {doc.sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="group flex min-h-9 items-center gap-2 rounded-lg py-1.5 pr-2 text-sm text-cream-muted transition-colors hover:text-cream"
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-pimenton-light/70 transition-transform group-hover:translate-x-0.5" aria-hidden />
            <span className="leading-snug">{fmt(s.title)}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  const relatedList = (
    <ul className="flex flex-col gap-1">
      {related.map((k) => {
        const Icon = DOC_ICON[k];
        return (
          <li key={k}>
            <Link href={lp(`/legal/${m.legal[k].slug}`)} className="group flex min-h-11 items-center gap-2.5 rounded-lg py-2 pr-2 text-sm text-cream-200 transition-colors hover:text-cream">
              <Icon className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
              {m.legal[k].title}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <article className="container-page relative pb-20 pt-8 md:pb-28 md:pt-12" aria-labelledby="legal-title">
      {/* Brasa decorativa */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 -z-10 h-[420px] w-[420px] rounded-full bg-burgundy/50 blur-3xl" />

      {/* Migas de pan */}
      <nav aria-label={m.legal.page.breadcrumbAria} className="mb-8 md:mb-10">
        <ol className="flex flex-wrap items-center gap-1.5 font-caps text-[11px] uppercase tracking-[0.25em] text-cream-muted">
          <li>
            <Link href={lp("/")} className="inline-flex min-h-8 items-center rounded transition-colors hover:text-cream">
              {m.legal.page.home}
            </Link>
          </li>
          <li aria-hidden className="text-pimenton-light">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="text-cream">
            {title}
          </li>
        </ol>
      </nav>

      {/* Cabecera */}
      <header className="max-w-3xl">
        <p className="mb-4 inline-flex items-center gap-3 font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">
          <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
          {m.legal.page.kicker}
        </p>
        <h1 id="legal-title" className="font-display text-4xl leading-[0.98] tracking-[-0.01em] text-cream text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-cream-muted text-pretty md:text-lg">{renderInline(fmt(doc.intro), ctx)}</p>
        <p className="mt-5 text-sm text-cream-faint">
          <time dateTime={LEGAL_UPDATED_AT} suppressHydrationWarning>
            {t(m.legal.page.updatedOn, { date: vars.updated })}
          </time>
        </p>
      </header>

      <div className="divider-iron my-10 md:my-12" aria-hidden />

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Índice: plegable en móvil/tablet, pegajoso en escritorio */}
        <aside className="lg:self-start lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <details className="glass rounded-2xl px-4 py-1 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-caps text-[11px] uppercase tracking-[0.25em] text-cream [&::-webkit-details-marker]:hidden">
              <ListOrdered className="h-4 w-4 text-pimenton-light" aria-hidden />
              {m.legal.page.tocTitle}
            </summary>
            <nav aria-label={m.legal.page.tocAria} className="border-t border-cream/10 py-3">
              {toc}
            </nav>
          </details>

          <nav aria-label={m.legal.page.tocAria} className="hidden lg:block">
            <p className="mb-3 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">{m.legal.page.tocTitle}</p>
            {toc}
            <p className="mb-2 mt-8 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">{m.legal.page.relatedTitle}</p>
            {relatedList}
          </nav>
        </aside>

        {/* Cuerpo */}
        <div className="mt-10 max-w-3xl font-sans lg:mt-0">
          {HAS_PENDING_PLACEHOLDERS && (
            <aside className="mb-8 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-5 py-4 text-sm text-cream-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <p>{m.legal.page.placeholderNote}</p>
            </aside>
          )}

          <div className="flex flex-col gap-12 md:gap-14">
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-[calc(var(--header-h)+1.5rem)]">
                <h2 id={`${section.id}-title`} className="mb-5 font-display text-2xl leading-tight text-cream text-balance md:text-3xl">
                  {fmt(section.title)}
                </h2>
                <div className="flex flex-col gap-5">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} ctx={ctx} fmt={fmt} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Contacto para dudas y derechos */}
          <section aria-labelledby="legal-contact" className="glass-smoke noise after:noise-after relative mt-14 overflow-hidden rounded-3xl p-6 md:p-8">
            <h2 id="legal-contact" className="font-display text-2xl text-cream md:text-3xl">
              {m.legal.page.contactTitle}
            </h2>
            <p className={cn(bodyText, "mt-3")}>{renderInline(fmt(m.legal.page.contactText), ctx)}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <NeonButton variant="primary" size="md" href={BUSINESS.phone.tel} icon={<Phone aria-hidden />} aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}>
                {BUSINESS.phone.display}
              </NeonButton>
              {!vars.email.startsWith("[") && (
                <NeonButton variant="outline" size="md" href={`mailto:${vars.email}`} icon={<Mail aria-hidden />}>
                  {vars.email}
                </NeonButton>
              )}
            </div>
          </section>

          {/* Otros documentos (móvil/tablet) + volver */}
          <div className="mt-10 flex flex-col gap-6 border-t border-cream/10 pt-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="lg:hidden">
              <p className="mb-2 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">{m.legal.page.relatedTitle}</p>
              {relatedList}
            </div>
            <Link
              href={lp("/")}
              className="group inline-flex h-11 items-center gap-2 self-start rounded-full border border-cream/15 px-4 font-caps text-[11px] uppercase tracking-[0.25em] text-cream-200 transition-all duration-300 hover:border-pimenton-light/60 hover:text-cream hover:shadow-neon"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
              {m.legal.page.backHome}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
