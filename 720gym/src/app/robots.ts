import type { MetadataRoute } from "next";
import { INDEXAR, URL_SITIO } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return INDEXAR
    ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${URL_SITIO}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
