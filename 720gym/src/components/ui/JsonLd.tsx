import { URL_SITIO } from "@/lib/sitio";

/** Datos estructurados (schema.org) para Google. */
export default function JsonLd({ datos }: { datos: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />;
}

/** Migas de pan: Inicio › … (BreadcrumbList). */
export function migas(tramos: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Inicio", "/"] as [string, string], ...tramos].map(([nombre, ruta], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: nombre,
      item: `${URL_SITIO}${ruta === "/" ? "" : ruta}`,
    })),
  };
}
