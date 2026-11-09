import type { MetadataRoute } from "next";
import { conceptos } from "@/data/conceptos";
import { URL_SITIO } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${URL_SITIO}/`, changeFrequency: "weekly", priority: 1 },
    ...conceptos.map((c) => ({ url: `${URL_SITIO}${c.href}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
