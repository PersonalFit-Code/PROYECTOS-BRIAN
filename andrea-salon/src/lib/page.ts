import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";

/** Idioma y mensajes de una página a partir de sus `params` (con el español de respaldo). */
export async function pageContext(params: Promise<{ locale: string }>) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return { locale, m: await getMessages(locale) };
}
