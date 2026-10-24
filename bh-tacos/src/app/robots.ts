import type { MetadataRoute } from "next";
import { BUSINESS } from "@/content";

/* Se sirve como /robots.txt (equivale a public/robots.txt, pero con el dominio de content.ts). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${BUSINESS.siteUrl}/sitemap.xml` };
}
