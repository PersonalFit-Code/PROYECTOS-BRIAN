import SectionHeading from "./SectionHeading";

/**
 * Cabecera de subpágina: mismo lenguaje que las secciones, con el titular como h1. Entra con CSS al
 * cargar (no espera al JavaScript): es lo primero que se ve y lo que mide la velocidad (LCP).
 */
export default function PageHeader({ kicker, before, accent, after, lead }: { kicker: string; before: string; accent: string; after?: string; lead: string }) {
  return (
    <div className="relative isolate">
      <div aria-hidden className="glow absolute -top-48 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 [--glow-a:0.16]" />
      <div className="container-page pt-32 pb-10 sm:pt-40 sm:pb-14">
        <SectionHeading as="h1" entrada kicker={kicker} before={before} accent={accent} after={after} lead={lead} />
      </div>
    </div>
  );
}
