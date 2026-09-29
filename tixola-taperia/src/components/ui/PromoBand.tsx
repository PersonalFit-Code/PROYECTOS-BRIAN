"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { PROMO, promoActivo, promoText } from "@/data/promos";
import { useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * BANDA DE PROMOCIÓN — "este mes tenemos cata de vinos".
 *
 * Todo lo que anuncia sale de `src/data/promos.ts`; aquí solo se decide CUÁNDO se enseña y CÓMO.
 *
 * Se pinta solo en el cliente, y no por capricho: las páginas se generan en el build, así que una
 * comprobación de fecha hecha en el servidor se quedaría congelada en el día que se publicó y una
 * promoción caducada seguiría ahí hasta el siguiente despliegue. Comprobando la fecha en el
 * navegador, el día que termina desaparece sola aunque nadie toque nada. El precio es que no sale
 * en el HTML inicial, lo cual para una promoción da igual: no es contenido que deba indexar Google.
 *
 * Se puede cerrar, y se recuerda por `id`: quien la cierra no la vuelve a ver, pero al publicar una
 * promoción nueva (id nuevo) la ve otra vez. Sin eso, o se cierra para siempre —y la siguiente no
 * la ve nadie— o reaparece en cada página y se vuelve molesta.
 */

const CLAVE = "tixola_promo_cerrada";

/** AAAA-MM-DD en la zona del visitante. Es la fecha que él ve en su calendario, que es la que importa. */
function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* ── Si la banda se enseña o no, como fuente externa ──
   La respuesta depende de dos cosas que el servidor no puede conocer: el calendario del visitante y
   lo que él haya cerrado antes. `useSyncExternalStore` es la forma que tiene React de leer algo así:
   en el servidor devuelve `false` (no se pinta nada, así que no hay desajuste al hidratar) y en el
   navegador lee de verdad. Es la alternativa al `useState` + `useEffect`, que para esto provoca un
   render de más y, además, lo prohíbe el compilador de React. Va como módulo y no dentro del
   componente porque la banda sale en dos sitios (portada y carta) y cerrarla en uno tiene que
   cerrarla en el otro: un solo estado y un aviso a todos los suscritos. */
const oyentes = new Set<() => void>();

/* Respaldo para cuando `localStorage` no está (navegación privada, almacenamiento bloqueado): sin
   esto, el botón de cerrar no cerraría nada, que es peor que olvidarlo al recargar. */
let cerradaEnMemoria = "";

function suscribir(avisar: () => void): () => void {
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
  };
}

/** Booleano, no objeto: `useSyncExternalStore` compara por identidad y un objeto nuevo en cada
    lectura sería un bucle de renders. */
function leerCliente(): boolean {
  if (!promoActivo(PROMO, hoyISO())) return false;
  let cerrada = cerradaEnMemoria;
  if (!cerrada) {
    try {
      cerrada = window.localStorage.getItem(CLAVE) ?? "";
    } catch {
      /* Almacenamiento bloqueado: se enseña. Preferimos repetirnos a callarnos. */
    }
  }
  return cerrada !== PROMO.id;
}

/** En el servidor no se pinta: la página se genera en el build y congelaría el día de publicación. */
const leerServidor = (): boolean => false;

export default function PromoBand({ className }: { className?: string }) {
  const m = useMessages();
  const locale = useLocale();
  const lp = useLocalePath();
  const visible = useSyncExternalStore(suscribir, leerCliente, leerServidor);

  const cerrar = useCallback(() => {
    if (!PROMO) return;
    cerradaEnMemoria = PROMO.id;
    try {
      window.localStorage.setItem(CLAVE, PROMO.id);
    } catch {
      /* Si no se puede recordar, se volverá a ver al recargar. Es el fallo menos malo. */
    }
    oyentes.forEach((avisar) => avisar());
  }, []);

  if (!visible || !PROMO) return null;
  const t = promoText(PROMO, locale);
  /* Una ruta interna pasa por `lp()` para no perder el idioma; un `tel:`, `mailto:` o `https:` va tal cual. */
  const interno = PROMO.href?.startsWith("/");
  const destino = PROMO.href ? (interno ? lp(PROMO.href) : PROMO.href) : null;

  return (
    <aside
      aria-label={t.title}
      className={cn(
        "relative flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-gold/30 bg-[linear-gradient(120deg,rgba(58,14,19,0.9),rgba(20,20,20,0.9))] px-4 py-3 pr-12 sm:px-6",
        className,
      )}
    >
      <Sparkles className="h-5 w-5 shrink-0 text-gold" aria-hidden />
      <p className="min-w-0 flex-1 text-sm leading-snug text-cream">
        <strong className="font-semibold">{t.title}</strong>{" "}
        <span className="text-cream-muted">{t.text}</span>
      </p>
      {destino && PROMO.cta && (
        interno ? (
          <Link href={destino} className="shrink-0 rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10">
            {PROMO.cta}
          </Link>
        ) : (
          <a href={destino} className="shrink-0 rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10">
            {PROMO.cta}
          </a>
        )
      )}
      <button
        type="button"
        onClick={cerrar}
        aria-label={m.common.misc.close}
        className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-cream-faint transition-colors hover:bg-cream/10 hover:text-cream"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </aside>
  );
}
