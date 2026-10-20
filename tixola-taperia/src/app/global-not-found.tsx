import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { BUSINESS } from "@/data/business";
import { DEFAULT_LOCALE, LOCALE_HEADER, LOCALE_META, isLocale, localePath, type Locale } from "@/i18n/config";
import esCommon from "@/i18n/messages/es/common";
import glCommon from "@/i18n/messages/gl/common";
import enCommon from "@/i18n/messages/en/common";
import ptCommon from "@/i18n/messages/pt/common";
import { cn } from "@/lib/utils";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * 404 DEL SITIO — y el único.
 *
 * POR QUÉ ESTE FICHERO Y NO `not-found.tsx`. El layout raíz de la web es `app/[locale]/layout.tsx`
 * (no hay `app/layout.tsx`), o sea un SEGMENTO DINÁMICO. Con esa forma, un `not-found.tsx` queda por
 * encima del layout y Next no puede componerlo: cuando se dispara, sirve un esqueleto vacío
 * —`<html id="__next_error__">` con `<head>` y `<body>` literalmente vacíos, ver
 * `getErrorRSCPayload` en `next/dist/server/app-render/app-render.js`— y deja que el navegador pinte
 * el 404 al hidratar. Medido el 19-10-2026 sobre `next start`: 404 correcto, pero CERO texto en el
 * HTML, ningún `<link rel="stylesheet">` y ningún `lang`. Sin JavaScript, una página en blanco.
 *
 * `global-not-found.js` es la respuesta de Next a exactamente este caso (lo nombra su documentación:
 * «your root layout is defined using top-level dynamic segments»). Se resuelve en el enrutador, ANTES
 * de renderizar nada, y pinta su propio documento completo. De ahí las tres cosas que este fichero
 * hace y una página normal no: declara `<html>` y `<body>`, importa `globals.css` y carga las fuentes.
 * Requiere `experimental.globalNotFound` en `next.config.ts`.
 *
 * EL IDIOMA, EN TRES INTENTOS. Este componente no recibe `params` —no cuelga de `[locale]`—, así que
 * el idioma llega en una cabecera de petición que pone el proxy (`x-tixola-locale`, ver
 * `src/proxy.ts`). Si no está, se mira la cookie `NEXT_LOCALE`, y si tampoco, castellano: la misma
 * regla que aplica el proxy a quien entra sin prefijo. La cookie no sobra: el `matcher` del proxy se
 * salta las rutas que llevan un punto, así que en `/en/carta.pdf` —un enlace viejo a un PDF que ya no
 * está— la cabecera no llega aunque el idioma esté a la vista en la URL, y sin la cookie el 404
 * saldría en castellano.
 *
 * LO QUE CUESTA: leer cabeceras hace que esta página se renderice en cada petición en vez de servirse
 * desde la caché. Antes el 404 se prerenderizaba una vez y el CDN servía el resto; ahora cada URL
 * inexistente es una invocación, también las de los robots que prueban direcciones al azar. Se acepta
 * a sabiendas: la alternativa es un 404 que le habla en castellano a quien venía leyendo en inglés, y
 * el idioma de esa página es justo lo que este fichero vino a arreglar. Si algún día el gasto
 * molestara, el cambio es quitar las dos lecturas de aquí y servirla estática en un solo idioma.
 */

/** Textos del 404 por idioma. Solo `common`, no el paquete entero: esta página se sirve sola. */
const COPY = {
  es: esCommon.notFound,
  gl: glCommon.notFound,
  en: enCommon.notFound,
  pt: ptCommon.notFound,
} satisfies Record<Locale, { kicker: string; title: string; text: string; back: string }>;

/**
 * Idioma de la petición: primero la cabecera que pone el proxy, luego la cookie de idioma y, si no
 * hay ninguna de las dos, castellano. Valida siempre, y no por formalismo: en las rutas que el proxy
 * no mira, la cabecera llega tal cual la mande quien pida la página.
 */
async function localeDeLaPeticion(): Promise<Locale> {
  const deLaCabecera = (await headers()).get(LOCALE_HEADER);
  if (isLocale(deLaCabecera)) return deLaCabecera;
  const deLaCookie = (await cookies()).get("NEXT_LOCALE")?.value;
  return isLocale(deLaCookie) ? deLaCookie : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await localeDeLaPeticion();
  /* El sufijo de marca a mano: la plantilla `%s · Tixola Tapería` vive en el layout de idioma y esta
     página no pasa por él. El `noindex` lo inyecta Next solo en toda respuesta 404. */
  return { title: `${COPY[locale].title} · ${BUSINESS.name}` };
}

export const viewport: Viewport = {
  themeColor: "#3b1613",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function GlobalNotFound() {
  const locale = await localeDeLaPeticion();
  const nf = COPY[locale];

  return (
    <html lang={LOCALE_META[locale].hreflang} className={fontVariables}>
      {/* Mismas clases que el `<body>` del layout de idioma (sin ellas el fondo sale blanco) más
          `sin-barra-movil`: aquí no hay barra flotante y sin eso el hueco que le reserva `globals.css`
          dejaba 64 px de scroll vacío en el móvil. */}
      <body className="sin-barra-movil min-h-dvh bg-granate text-cream antialiased">
        <main className={cn("container-page relative flex min-h-dvh flex-col items-center justify-center overflow-hidden text-center")}>
          {/* Brasa de fondo, como en el resto de la web. */}
          <div
            aria-hidden
            className="ember-glow absolute left-1/2 top-1/2 -z-10 h-[70vh] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full [--ember-a1:0.28]"
          />
          <p className="font-caps text-xs uppercase tracking-[0.35em] text-pimenton-a11y">{nf.kicker}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-cream md:text-6xl">{nf.title}</h1>
          <p className="mt-4 max-w-md text-cream-muted text-pretty">{nf.text}</p>
          {/* `<a>` y no `<Link>` a propósito: salir de aquí es siempre una carga completa de página
              —el 404 global ocupa el sitio del layout raíz, así que el enrutador de Next lo trata
              como un cambio de raíz— y además así el enlace funciona sin JavaScript. */}
          <a
            href={localePath(locale, "/")}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-pimenton px-6 font-sans font-semibold text-cream transition-colors duration-300 hover:bg-pimenton-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-granate"
          >
            {nf.back}
          </a>
        </main>
      </body>
    </html>
  );
}
