import SectionHeading from "./SectionHeading";

/**
 * Cabecera de subpágina: el mismo lenguaje que las secciones, con el titular como h1. Entra con CSS
 * al cargar (no espera al JavaScript): es lo primero que se ve y lo que mide la velocidad (LCP).
 * `note` es el aviso de «pendiente de confirmar» cuando la página enseña datos provisionales.
 */
export default function PageHeader({ kicker, title, accent, description, note }: { kicker: string; title: string; accent?: string; description?: string; note?: string }) {
  return (
    <div className="relative bg-white">
      <div className="container-page pt-[calc(var(--header-h)+3rem)] pb-12 sm:pt-[calc(var(--header-h)+4.5rem)] sm:pb-16">
        <SectionHeading as="h1" entrada kicker={kicker} title={title} accent={accent} description={description} />
        {note ? (
          <p className="hero-in mt-8 inline-flex items-start gap-2 border border-nude bg-nude-claro px-4 py-2.5 text-sm text-tinta" style={{ ["--i" as string]: 3 }}>
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-carmin-suave" />
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
