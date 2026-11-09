import type { MetadataRoute } from "next";
import { conceptos } from "@/data/conceptos";
import { URL_SITIO } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const hoy = new Date();
  return [
    { url: `${URL_SITIO}/`, lastModified: hoy, changeFrequency: "weekly", priority: 1 },
    ...conceptos.map((c) => ({ url: `${URL_SITIO}${c.href}`, lastModified: hoy, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${URL_SITIO}/horario`, lastModified: hoy, changeFrequency: "weekly", priority: 0.9 },
    { url: `${URL_SITIO}/tarifas`, lastModified: hoy, changeFrequency: "monthly", priority: 0.9 },
    { url: `${URL_SITIO}/alta`, lastModified: hoy, changeFrequency: "monthly", priority: 0.8 },
    { url: `${URL_SITIO}/clase-gratis`, lastModified: hoy, changeFrequency: "monthly", priority: 0.8 },
    { url: `${URL_SITIO}/club`, lastModified: hoy, changeFrequency: "monthly", priority: 0.7 },
    { url: `${URL_SITIO}/contacto`, lastModified: hoy, changeFrequency: "monthly", priority: 0.7 },
    { url: `${URL_SITIO}/clubes`, lastModified: hoy, changeFrequency: "monthly", priority: 0.6 },
    { url: `${URL_SITIO}/preguntas`, lastModified: hoy, changeFrequency: "monthly", priority: 0.6 },
  ];
}
