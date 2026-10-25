import { BUSINESS, HOME, REVIEWS } from "@/content";
import SectionHeading from "@/components/common/SectionHeading";
import TornEdge from "@/components/common/TornEdge";

export default function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="on-cream relative">
      <TornEdge fill="var(--cream-bg)" className="absolute -top-6 left-0 sm:-top-9" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading id="reviews-title" kicker="Reseñas" title={HOME.reviews.title} />
      <ul className="mt-12 grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <li key={r.name} className="reveal" style={{ ["--i" as string]: i }}>
            <figure className="card flex h-full flex-col p-6 shadow-[var(--shadow-warm)]" style={{ rotate: `${[-1, 0.8, -0.5][i]}deg` }}>
              <p className="text-gold-text" role="img" aria-label={`${r.stars} de 5 estrellas`}>
                {"★".repeat(r.stars)}
              </p>
              <blockquote className="mt-4 flex-1 text-lg leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-5 font-display text-xl uppercase text-brand-text">{r.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="reveal mt-8 text-sm text-fg-muted">
        Valoración media en apps de reparto:{" "}
        {BUSINESS.ratings.map((r) => `${r.value.toLocaleString("es-ES")} en ${r.platform} (${r.count})`).join(" · ")}.
      </p>
      </div>
    </section>
  );
}
