import { LEGAL, LEGAL_UPDATED, LEGAL_WARNING } from "@/content";

export default function LegalLayout({ doc }: { doc: keyof typeof LEGAL }) {
  const { title, sections } = LEGAL[doc];
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 lg:pt-14">
      <p role="note" className="rounded-2xl border-2 border-gold bg-gold/15 p-4 font-semibold">
        {LEGAL_WARNING}
      </p>
      <h1 className="mt-8 font-display text-5xl uppercase leading-none sm:text-6xl">{title}</h1>
      <p className="mt-3 text-sm text-fg-muted">Última actualización: {LEGAL_UPDATED}</p>
      <ol className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <li key={s.title}>
            <h2 className="font-display text-2xl uppercase">
              <span className="text-brand-text">{i + 1}.</span> {s.title}
            </h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 24)} className="mt-3 leading-relaxed text-fg-muted">
                {p}
              </p>
            ))}
          </li>
        ))}
      </ol>
    </article>
  );
}
