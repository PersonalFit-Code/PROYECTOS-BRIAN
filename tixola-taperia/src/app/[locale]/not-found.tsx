"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, localePath, stripLocale } from "@/i18n/config";

/**
 * 404 dentro de un idioma válido (p. ej. un slug legal desconocido).
 * El enlace de vuelta conserva el prefijo de idioma de la URL actual; se resuelve con
 * `stripLocale`/`localePath` directamente (sin depender del LocaleProvider) para que
 * funcione también si la ruta no llegó a montar el layout del idioma.
 */
export default function NotFound() {
  const pathname = usePathname();
  const { locale } = stripLocale(pathname ?? "/");
  const home = localePath(locale ?? DEFAULT_LOCALE, "/");

  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="font-caps text-xs uppercase tracking-[0.35em] text-pimenton-light">404</p>
      <h1 className="mt-4 font-display text-5xl text-cream">Esta mesa no existe</h1>
      <p className="mt-4 max-w-md text-cream-muted">La página que buscas no está en la carta. Vuelve al inicio o echa un vistazo a nuestros platos.</p>
      <Link href={home} className="mt-8 rounded-full bg-pimenton px-6 py-3 font-semibold text-cream hover:bg-pimenton-light">
        Volver al inicio
      </Link>
    </main>
  );
}
