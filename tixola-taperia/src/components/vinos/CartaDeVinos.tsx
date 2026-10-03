"use client";

import { motion } from "framer-motion";
import { Wine as WineIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import VinoSpotlight, { nombreDeOrigen, VINO_LAYOUT_TRANSITION, vinoLayoutId } from "@/components/vinos/VinoSpotlight";
import { formatPrice } from "@/data/menu";
import {
  isGalicianOrigin,
  ORIGIN_COUNTRY,
  ORIGIN_ORDER,
  WINE_KINDS,
  WINE_REGIONS,
  winesByOrigin,
  type Wine,
  type WineOrigin,
} from "@/data/wines";
import { localizeMenuItems } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";

/**
 * LA CARTA DE VINOS — una cuadrícula de botellas por denominación.
 *
 * EL RECORRIDO QUE PIDIÓ EL CLIENTE, en sus palabras: "me apetece uno de Monterrei, pues pincho y
 * que me salgan todos los de Monterrei con la foto; una vez pincho en la foto se me despliega toda
 * la información de ese vino". Así que:
 *   1. El mapa de arriba lleva a su denominación (ancla `#vinos-{origen}`).
 *   2. Aquí, cada denominación es una CUADRÍCULA DE BOTELLAS: foto, nombre y precio. Dos columnas en
 *      el teléfono, hasta cinco en escritorio.
 *   3. Al pulsar una botella se abre su ficha completa (`VinoSpotlight`), con la foto viajando desde
 *      la tarjeta.
 *
 * ANTES ERAN FILAS DE TEXTO con un `<details>` que crecía hacia abajo. Funcionaba, pero la botella
 * era una miniatura de 48 px y había que abrir una por una para ver cuál era cada cosa. En una carta
 * de vinos la etiqueta ES el producto: la cuadrícula la pone delante.
 *
 * LO QUE SE PIERDE Y POR QUÉ SE ASUME. Con `<details>` los 52 vinos llevaban su ficha entera en el
 * HTML servido. Ahora el HTML lleva nombre, bodega, denominación y precio —que es lo que alguien
 * busca de verdad: "Casal de Armán Ourense"— y la nota de cata, el terruño y los premios viven en la
 * ficha. A cambio, la página pesa bastante menos y se entiende de un vistazo.
 */

export default function CartaDeVinos() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();

  /** Qué botella está abierta. Solo puede haber una: la ficha es modal. */
  const [abierto, setAbierto] = useState<Wine | null>(null);
  const cerrar = useCallback(() => setAbierto(null), []);

  /**
   * Nombre traducido de cada plato, para pintar los maridajes. La relación vive en el VINO
   * (`pairsWith`), así que aquí solo hay que traducir los nombres.
   */
  const nombreDePlato = useMemo(
    () => new Map(localizeMenuItems(locale).map((plato) => [plato.id, plato.name])),
    [locale],
  );

  const grupos = ORIGIN_ORDER.map((origin) => ({ origin, vinos: winesByOrigin(origin) })).filter((g) => g.vinos.length > 0);
  /* Sin vinos no hay carta: la página ya enseña el aviso de `WINES_PENDING` en su lugar. */
  if (!grupos.length) return null;

  const total = grupos.reduce((n, g) => n + g.vinos.length, 0);

  return (
    <section className="container-page pb-16 md:pb-20">
      <p className="font-caps text-xs uppercase tracking-[0.3em] text-cream-faint">{t(m.vinos.count, { count: total })}</p>

      {/* Índice de denominaciones. Son anclas, no filtros: el navegador ya sabe llevar a un sitio de
          la página, así funciona sin JavaScript y los 52 vinos siguen estando en el HTML. */}
      <nav aria-label={m.vinos.indexLabel} className="mt-4 flex flex-wrap gap-2">
        {grupos.map(({ origin, vinos }) => (
          <a
            key={origin}
            href={`#vinos-${origin}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 font-caps text-[11px] uppercase tracking-[0.14em] text-cream-muted transition-colors hover:border-cream/40 hover:text-cream"
          >
            {nombreDeOrigen(origin, m)}
            <span className="text-cream-faint">{vinos.length}</span>
          </a>
        ))}
      </nav>

      <div className="mt-8 grid gap-12">
        {grupos.map(({ origin, vinos }) => (
          <GrupoPorOrigen key={origin} origin={origin} vinos={vinos} onAbrir={setAbierto} />
        ))}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-cream-faint">{m.vinos.priceNote}</p>
      {/* La carta de papel lo dice al pie de las dos caras, y es verdad: la lista no es cerrada. */}
      <p className="mt-2 text-xs leading-relaxed text-cream-faint">{m.vinos.offMenuNote}</p>

      <VinoSpotlight vino={abierto} onClose={cerrar} nombreDePlato={nombreDePlato} />
    </section>
  );
}

/** Los vinos de una denominación. Si los hay de varios colores, se separan por color dentro. */
function GrupoPorOrigen({
  origin,
  vinos,
  onAbrir,
}: {
  origin: WineOrigin;
  vinos: readonly Wine[];
  onAbrir: (v: Wine) => void;
}) {
  const m = useMessages();
  const gallega = isGalicianOrigin(origin);
  /* La procedencia de abajo: las provincias en las gallegas, el país en las de fuera. En Argentina y
     Sudáfrica el propio nombre ya es el país, así que `ORIGIN_COUNTRY` los deja sin nada. */
  const pie = gallega ? WINE_REGIONS[origin].provinces.join(" · ") : m.vinos.countries[ORIGIN_COUNTRY[origin] ?? "ninguno"];

  /* Los colores presentes, en el orden de `WINE_KINDS`; los vinos sin color declarado van al final. */
  const porColor = WINE_KINDS.map((kind) => ({ kind, lista: vinos.filter((v) => v.kind === kind) })).filter((g) => g.lista.length > 0);
  const sinColor = vinos.filter((v) => !v.kind);
  const separar = porColor.length > 1 || sinColor.length > 0;

  return (
    <section id={`vinos-${origin}`} aria-labelledby={`t-vinos-${origin}`} className="scroll-mt-28">
      <h2 id={`t-vinos-${origin}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-2xl font-medium text-cream md:text-3xl">{nombreDeOrigen(origin, m)}</span>
        {pie ? <span className="font-caps text-[11px] uppercase tracking-[0.2em] text-cream-faint">{pie}</span> : null}
      </h2>
      <span aria-hidden className="mt-2 block h-px w-full bg-cream/12" />

      <div className="mt-5 grid gap-7">
        {porColor.map(({ kind, lista }) => (
          <div key={kind}>
            {separar ? (
              <p className="mb-3 font-caps text-[10px] uppercase tracking-[0.26em] text-pimenton-a11y">{m.vinos.kinds[kind]}</p>
            ) : null}
            <Cuadricula vinos={lista} onAbrir={onAbrir} />
          </div>
        ))}

        {sinColor.length ? <Cuadricula vinos={sinColor} onAbrir={onAbrir} /> : null}
      </div>
    </section>
  );
}

/** Dos columnas en el teléfono —que es por donde entra casi todo el mundo—, hasta cinco en escritorio. */
function Cuadricula({ vinos, onAbrir }: { vinos: readonly Wine[]; onAbrir: (v: Wine) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {vinos.map((vino) => (
        <TarjetaVino key={vino.id} vino={vino} onAbrir={onAbrir} />
      ))}
    </ul>
  );
}

/**
 * Una botella de la cuadrícula: foto 3:4, nombre y precio. Toda la tarjeta es el botón.
 *
 * La foto lleva el `layoutId` compartido con la ficha, así que al pulsar no aparece una ventana de la
 * nada: ESTA botella crece hasta llenar la hoja, y al cerrar vuelve a su sitio. Es lo mismo que hace
 * el detalle de los platos, y es lo que mantiene claro qué se ha pulsado.
 */
function TarjetaVino({ vino, onAbrir }: { vino: Wine; onAbrir: (v: Wine) => void }) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();

  return (
    <li id={`vino-${vino.id}`} className="scroll-mt-28">
      <button
        type="button"
        onClick={() => onAbrir(vino)}
        aria-label={t(m.vinos.openSheet, { name: vino.name })}
        className="group block w-full rounded-2xl border border-cream/10 bg-granate-800/45 p-2 text-left transition-colors duration-300 hover:border-cream/30 hover:bg-granate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light"
      >
        <motion.span
          layoutId={vinoLayoutId(vino.id)}
          transition={VINO_LAYOUT_TRANSITION}
          className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-granate-900"
        >
          {vino.image ? (
            <Image
              src={vino.image}
              alt=""
              fill
              /* Dos columnas a 390 px son ~180 px de hueco; en escritorio, cinco columnas de ~220. */
              sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 230px"
              quality={74}
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          ) : (
            /* Sin foto, una copa dibujada del mismo tamaño: la cuadrícula no debe bailar. */
            <span className="flex h-full w-full items-center justify-center text-cream/15">
              <WineIcon className="h-10 w-10" strokeWidth={1.25} aria-hidden />
            </span>
          )}
        </motion.span>

        <span className="block px-1.5 pb-1 pt-3">
          <span className="block font-display text-[15px] font-medium leading-snug text-cream text-balance md:text-base">{vino.name}</span>
          {vino.winery && !vino.name.startsWith(vino.winery) ? (
            <span className="mt-0.5 block truncate text-[12px] leading-snug text-cream-faint">{vino.winery}</span>
          ) : null}
          <span className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            {vino.bottlePrice !== undefined ? (
              <span className="font-sans text-[15px] font-semibold text-pimenton-a11y">{formatPrice(vino.bottlePrice, locale)}</span>
            ) : null}
            {vino.glassPrice !== undefined ? (
              <span className="text-[12px] text-cream-muted">
                <span className="font-caps text-[9px] uppercase tracking-[0.16em] text-cream-faint">{m.vinos.glass}</span>{" "}
                {formatPrice(vino.glassPrice, locale)}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
}
