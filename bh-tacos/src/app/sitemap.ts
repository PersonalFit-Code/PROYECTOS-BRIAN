import type { MetadataRoute } from "next";
import { BUSINESS } from "@/content";

/* Se sirve como /sitemap.xml. Las páginas legales no van: son noindex hasta tener texto real. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/carta", "/monta-tu-taco", "/sobre-nosotros", "/contacto"];
  return routes.map((r) => ({ url: `${BUSINESS.siteUrl}${r}`, changeFrequency: "weekly", priority: r === "" ? 1 : 0.8 }));
}
