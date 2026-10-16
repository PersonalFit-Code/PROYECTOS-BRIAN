import SectionHeading from "./SectionHeading";

/**
 * Cabecera de subpágina: el mismo lenguaje que las secciones, con el titular como h1. Entra con CSS
 * al cargar (no espera al JavaScript): es lo primero que se ve y lo que mide la velocidad (LCP).
 * `note` es el aviso de «pendiente de confirmar» cuando la página enseña datos provisionales.
 */
export default function PageHeader({ kicker, title, accent, description, note }: { kicker: string; title: string; accent?: string; description?: string; note?: string }) {
  return (
    <div className="relative isolate">
      <div aria-hidden className="halo absolute -top-48 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 [--halo-a:0.6]" />
      <div className="container-page pt-32 pb-10 sm:pt-40 sm:pb-14">
        <SectionHeading as="h1" entrada kicker={kicker} title={title} accent={accent} description={description} />
        {note ? (
          <p className="hero-in mt-6 inline-flex items-start gap-2 rounded-2xl bg-rosa/60 px-4 py-2.5 text-sm text-tinta ring-1 ring-carmin/10" style={{ ["--i" as string]: 3 }}>
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-carmin-suave" />
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
