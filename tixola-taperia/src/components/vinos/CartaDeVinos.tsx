"use client";

import { motion } from "framer-motion";
import { Check, Search, SlidersHorizontal, Wine as WineIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { normalizeText } from "@/components/carta/useMenuFilters";
import VinoSpotlight, { nombreDeOrigen, VINO_LAYOUT_TRANSITION, vinoLayoutId } from "@/components/vinos/VinoSpotlight";
import { formatPrice } from "@/data/menu";
import {
  isGalicianOrigin,
  ORIGIN_COUNTRY,
  ORIGIN_ORDER,
  SHOW_WINE_PRICES,
  WINE_KINDS,
  WINE_REGIONS,
  winesByOrigin,
  type Wine,
  type WineKind,
  type WineOrigin,
} from "@/data/wines";
import { localizeMenuItems } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

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
  const idBusqueda = useId();

  /** Qué botella está abierta. Solo puede haber una: la ficha es modal. */
  const [abierto, setAbierto] = useState<Wine | null>(null);
  const cerrar = useCallback(() => setAbierto(null), []);

  /** Lo que se ha tecleado en el buscador. */
  const [consulta, setConsulta] = useState("");
  /* Con `useDeferredValue` la letra aparece en el campo al instante y el filtrado de los 52 vinos va
     detrás, en una pasada de baja prioridad. Con 52 no se nota; con la carta llena de un día de
     estos, sí — y escribir en un buscador que se atasca es de las cosas que más molestan. */
  const consultaDiferida = useDeferredValue(consulta);

  /**
   * LOS FILTROS, DENTRO DE UN BOTÓN. Antes el índice de denominaciones estaba siempre a la vista:
   * quince chapas que en un teléfono eran once filas —media pantalla— antes de ver la primera
   * botella. El cliente lo dijo claro: "hazlo menos espacioso, ponlo como un botón de filtro y que
   * ahí aparezcan todas las denominaciones". Y de paso dejan de ser anclas para ser FILTROS de
   * verdad, que es lo que la gente espera al pulsarlas.
   *
   * Dentro de un grupo suman (o Monterrei O Valdeorras); entre grupos, restan (Monterrei Y blanco).
   */
  const [origen, setOrigen] = useState<WineOrigin | "todos">("todos");
  const [colores, setColores] = useState<readonly WineKind[]>([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const idPanel = useId();
  const idBusquedaPanel = useId();
  const refBotonFiltros = useRef<HTMLButtonElement>(null);

  const alternarColor = useCallback(
    (kind: WineKind) => setColores((previo) => (previo.includes(kind) ? previo.filter((k) => k !== kind) : [...previo, kind])),
    [],
  );
  const limpiar = useCallback(() => {
    setOrigen("todos");
    setColores([]);
    setConsulta("");
  }, []);

  /**
   * Nombre traducido de cada plato, para pintar los maridajes. La relación vive en el VINO
   * (`pairsWith`), así que aquí solo hay que traducir los nombres.
   */
  const nombreDePlato = useMemo(
    () => new Map(localizeMenuItems(locale).map((plato) => [plato.id, plato.name])),
    [locale],
  );

  /**
   * EL ÍNDICE DE BÚSQUEDA: por cada vino, todo el texto por el que alguien podría buscarlo, en
   * minúsculas y sin tildes (`normalizeText`, el mismo de la carta: "Riñas Baixas" o "rias baixas"
   * encuentran lo mismo).
   *
   * Qué entra, y por qué cada cosa. El nombre y la bodega son lo evidente. La DENOMINACIÓN y la
   * PROVINCIA porque mucha gente pide por zona —"algo de Monterrei", "un ourensano"— y el PAÍS
   * porque de las de fuera se acuerda uno del país antes que de la D.O. La UVA porque es la forma
   * en que de verdad se pide un blanco: "godello", "albariño", "mencía". El COLOR para quien escribe
   * "tinto" sin más.
   *
   * Y los PLATOS con los que marida, que será la búsqueda más útil de todas —escribes "pulpo" y
   * salen los vinos con los que se toma—, pero que HOY NO DEVUELVE NADA: ningún vino tiene todavía
   * `pairsWith`, porque esos maridajes los tiene que decir Tatiana y aún no han llegado. Se deja
   * puesto porque no cuesta nada y funciona solo el día que lleguen; lo que no se hace es
   * anunciarlo en el marcador del campo, que propone solo cosas que sí encuentran algo.
   *
   * Se recalcula solo al cambiar de idioma (las traducciones viven en `m` y en `nombreDePlato`).
   */
  const indice = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const origin of ORIGIN_ORDER) {
      const gallega = isGalicianOrigin(origin);
      const procedencia = gallega
        ? [nombreDeOrigen(origin, m), ...WINE_REGIONS[origin].provinces]
        : [nombreDeOrigen(origin, m), m.vinos.countries[ORIGIN_COUNTRY[origin] ?? "ninguno"]];
      for (const vino of winesByOrigin(origin)) {
        mapa.set(
          vino.id,
          normalizeText(
            [
              vino.name,
              vino.winery ?? "",
              ...procedencia,
              vino.kind ? m.vinos.kinds[vino.kind] : "",
              ...(vino.grapes ?? []),
              vino.subzone ?? "",
              vino.winemaker ?? "",
              ...(vino.methods ?? []).map((metodo) => m.vinos.methods[metodo]),
              ...(vino.pairsWith ?? []).map((id) => nombreDePlato.get(id) ?? ""),
            ].join(" "),
          ),
        );
      }
    }
    return mapa;
  }, [m, nombreDePlato]);

  /* Todas las palabras tienen que aparecer (Y, no O): "godello monterrei" son los godellos DE
     Monterrei, no todos los godellos más todos los de Monterrei. Es como filtra ya la carta. */
  const palabras = useMemo(() => normalizeText(consultaDiferida).split(" ").filter(Boolean), [consultaDiferida]);

  const todos = useMemo(() => ORIGIN_ORDER.map((origin) => ({ origin, vinos: winesByOrigin(origin) })), []);

  /* Los colores que de verdad hay en la carta, con cuántos de cada uno. Si un día no hay ni un
     rosado, su chapa no sale: un filtro que no puede devolver nada es una promesa rota. */
  const coloresEnCarta = useMemo(() => {
    const cuenta = new Map<WineKind, number>();
    for (const { vinos } of todos) for (const vino of vinos) if (vino.kind) cuenta.set(vino.kind, (cuenta.get(vino.kind) ?? 0) + 1);
    return WINE_KINDS.filter((kind) => cuenta.has(kind)).map((kind) => ({ kind, cuenta: cuenta.get(kind) ?? 0 }));
  }, [todos]);

  /* Escape cierra el panel y devuelve el foco al botón, que es de donde salió. */
  const alPulsarTecla = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    setPanelAbierto((abierto) => {
      if (abierto) refBotonFiltros.current?.focus();
      return false;
    });
  }, []);
  const enCarta = useMemo(() => todos.reduce((n, g) => n + g.vinos.length, 0), [todos]);

  /**
   * El filtrado va en dos pasos, y el orden importa.
   *
   * 1. Los filtros DE CONTENIDO —la búsqueda y el color— se aplican a todo. De ahí sale `porOrigen`,
   *    que es lo que lleva el número de cada chapa: así "D.O. Rioja 2" quiere decir "dos riojas de
   *    los que estás buscando", no "siete riojas en total". Es lo mismo que hace la carta de platos.
   * 2. La DENOMINACIÓN elegida reduce esa lista a una sola sección. Va después porque, si fuera
   *    antes, las chapas de las demás denominaciones se quedarían todas a cero.
   */
  const porOrigen = useMemo(() => {
    return todos.map(({ origin, vinos }) => ({
      origin,
      vinos: vinos.filter((vino) => {
        if (colores.length && (!vino.kind || !colores.includes(vino.kind))) return false;
        if (!palabras.length) return true;
        const texto = indice.get(vino.id) ?? "";
        return palabras.every((palabra) => texto.includes(palabra));
      }),
    }));
  }, [todos, palabras, indice, colores]);

  const grupos = useMemo(
    () => porOrigen.filter((g) => g.vinos.length > 0 && (origen === "todos" || g.origin === origen)),
    [porOrigen, origen],
  );

  /* Sin vinos no hay carta: la página ya enseña el aviso de `WINES_PENDING` en su lugar. Esto es
     "no hay carta", no "la búsqueda no encuentra nada", que se resuelve más abajo y con un texto. */
  if (!enCarta) return null;

  const filtrando = palabras.length > 0 || origen !== "todos" || colores.length > 0;
  /* El número del botón cuenta solo lo que vive DENTRO del panel: el color y la búsqueda. La
     denominación no, porque su chapa ya se ve pulsada en la fila. */
  const activos = colores.length + (consulta.trim() ? 1 : 0);
  const total = grupos.reduce((n, g) => n + g.vinos.length, 0);
  const conFiltrosDeContenido = porOrigen.reduce((n, g) => n + g.vinos.length, 0);

  return (
    <section className="container-page pb-16 md:pb-20">
      {/* LA BARRA, IGUAL QUE LA DE LA CARTA DE PLATOS, que es lo que pidió el cliente: "mete el
          filtro aquí como se hace en el menú, algo así pero para vinos, sin emojis ni nada, que sea
          bonito y simple". Una fila de chapas que se desplaza en horizontal con las denominaciones,
          y a la derecha el botón de filtros con lo demás. Sin iconos: los platos los llevan porque
          "vegano" o "sin gluten" son conceptos y un icono ayuda; "blanco" y "tinto" no lo necesitan. */}
      <div className="sticky top-[var(--header-h)] z-20 -mx-4 md:-mx-6" onKeyDown={alPulsarTecla}>
        <div className="relative">
          <div className="border-y border-cream/10 bg-granate-900/95 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]">
            <div className="px-4 md:px-6">
              <div className="flex items-center gap-3">
                <ChapasDeOrigen
                  className="min-w-0 flex-1"
                  grupos={porOrigen}
                  elegido={origen}
                  todosCuentan={conFiltrosDeContenido}
                  onElegir={setOrigen}
                />

                <div className="flex shrink-0 items-center gap-2 py-2">
                  <CampoDeBusqueda id={idBusqueda} valor={consulta} onCambio={setConsulta} className="hidden w-56 lg:block xl:w-72" />

                  <button
                    ref={refBotonFiltros}
                    type="button"
                    onClick={() => setPanelAbierto((v) => !v)}
                    aria-expanded={panelAbierto}
                    aria-controls={idPanel}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 ease-[var(--ease-out-expo)]",
                      panelAbierto || activos > 0
                        ? "border-pimenton-light/70 bg-pimenton/20 text-cream"
                        : "border-cream/20 text-cream-muted hover:border-cream/45 hover:text-cream",
                    )}
                  >
                    <SlidersHorizontal size={16} aria-hidden />
                    <span>{m.vinos.filters}</span>
                    {activos > 0 ? (
                      <>
                        {/* Un `aria-label` sobre un `<span>` genérico no lo anuncia ningún lector
                            (ARIA 1.2): el número va `aria-hidden` y al lado un texto de verdad. */}
                        <span
                          aria-hidden
                          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pimenton-light px-1.5 text-[11px] font-bold tabular-nums text-cream"
                        >
                          {activos}
                        </span>
                        <span className="sr-only">{t(m.vinos.filtersActive, { count: activos })}</span>
                      </>
                    ) : null}
                  </button>
                </div>
              </div>

              <p aria-live="polite" aria-atomic="true" className="sr-only">
                {t(m.vinos.searchCount, { count: total, total: enCarta })}
              </p>
            </div>
          </div>

          {/* EL PANEL cuelga en `absolute` del envoltorio, así que al abrirse no empuja la lista: se
              anima solo con `opacity` y `translate`, las dos propiedades que el navegador compone en
              la GPU. `inert` lo apaga del todo mientras está cerrado (ni foco ni lector). */}
          <div
            id={idPanel}
            aria-hidden={!panelAbierto || undefined}
            inert={!panelAbierto || undefined}
            className={cn(
              "absolute inset-x-0 top-full z-10 origin-top overflow-hidden border-b border-cream/10 bg-granate-900 shadow-[0_22px_45px_-24px_rgba(0,0,0,0.95)]",
              "transition-[opacity,translate] duration-200 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
              panelAbierto ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
            )}
          >
            <section aria-label={m.vinos.filtersAria} className="max-h-[min(62dvh,560px)] overflow-y-auto overscroll-contain px-4 pb-5 pt-4 md:px-6">
              <div className="flex flex-col gap-5">
                <CampoDeBusqueda id={idBusquedaPanel} valor={consulta} onCambio={setConsulta} className="lg:hidden" />

                <div>
                  <p className="mb-2.5 font-caps text-[11px] uppercase tracking-[0.3em] text-cream-faint">{m.vinos.filterByKind}</p>
                  <ul className="flex flex-wrap gap-2">
                    {coloresEnCarta.map(({ kind, cuenta }) => (
                      <Chapa key={kind} pulsada={colores.includes(kind)} onClick={() => alternarColor(kind)} cuenta={cuenta}>
                        {m.vinos.kinds[kind]}
                      </Chapa>
                    ))}
                  </ul>
                </div>

                {filtrando ? (
                  <button
                    type="button"
                    onClick={limpiar}
                    className="self-start rounded-full border border-cream/25 px-4 py-2 font-caps text-[11px] uppercase tracking-[0.18em] text-cream transition-colors hover:border-cream/50 hover:bg-cream/5"
                  >
                    {m.vinos.filtersClear}
                  </button>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>

      <p className="mt-6 font-caps text-xs uppercase tracking-[0.3em] text-cream-faint">
        {filtrando ? t(m.vinos.searchCount, { count: total, total: enCarta }) : t(m.vinos.count, { count: enCarta })}
      </p>

      {grupos.length ? (
        <div className="mt-6 grid gap-12">
          {grupos.map(({ origin, vinos }) => (
            <GrupoPorOrigen key={origin} origin={origin} vinos={vinos} onAbrir={setAbierto} />
          ))}
        </div>
      ) : (
        <SinResultados consulta={consulta} onLimpiar={limpiar} />
      )}

      {/* El aviso del IVA solo tiene sentido si hay precios; sin ellos sobra. */}
      {SHOW_WINE_PRICES ? <p className="mt-10 text-xs leading-relaxed text-cream-faint">{m.vinos.priceNote}</p> : null}
      {/* La carta de papel lo dice al pie de las dos caras, y es verdad: la lista no es cerrada. */}
      <p className="mt-2 text-xs leading-relaxed text-cream-faint">{m.vinos.offMenuNote}</p>

      <VinoSpotlight vino={abierto} onClose={cerrar} nombreDePlato={nombreDePlato} />
    </section>
  );
}

/** El campo de búsqueda, con la lupa dentro y una aspa para vaciarlo. */
function CampoDeBusqueda({
  id,
  valor,
  onCambio,
  className,
}: {
  id: string;
  valor: string;
  onCambio: (valor: string) => void;
  className?: string;
}) {
  const m = useMessages();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {m.vinos.searchLabel}
      </label>
      <Search size={17} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-faint" />
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={m.vinos.search}
        className="h-11 w-full rounded-full border border-cream/15 bg-granate/60 pl-10 pr-11 text-[15px] text-cream placeholder:text-cream-faint transition-colors focus:border-pimenton-light/70 focus:bg-granate/80 focus:outline-none focus:ring-2 focus:ring-pimenton-light/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor ? (
        <button
          type="button"
          onClick={() => onCambio("")}
          aria-label={m.vinos.searchClear}
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <X size={16} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** Cuando la búsqueda no encuentra nada. Decirlo y, sobre todo, decir por dónde seguir. */
function SinResultados({ consulta, onLimpiar }: { consulta: string; onLimpiar: () => void }) {
  const m = useMessages();
  const t = useFormat();
  return (
    <div className="mt-10 rounded-2xl border border-cream/10 bg-granate-800/40 px-5 py-10 text-center">
      <WineIcon className="mx-auto h-9 w-9 text-cream/20" strokeWidth={1.25} aria-hidden />
      <p className="mt-4 font-display text-xl text-cream text-balance">{t(m.vinos.noResults, { query: consulta.trim() })}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-cream-muted text-pretty">{m.vinos.noResultsHint}</p>
      <button
        type="button"
        onClick={onLimpiar}
        className="mt-5 inline-flex h-10 items-center rounded-full border border-cream/25 px-5 font-caps text-[11px] uppercase tracking-[0.18em] text-cream transition-colors hover:border-cream/50 hover:bg-cream/5"
      >
        {m.vinos.searchClear}
      </button>
    </div>
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
          {SHOW_WINE_PRICES ? (
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
          ) : null}
        </span>
      </button>
    </li>
  );
}

/** Chapa de filtro: se pulsa y se queda pulsada. `aria-pressed` es lo que la hace un interruptor. */
function Chapa({
  pulsada,
  cuenta,
  onClick,
  children,
}: {
  pulsada: boolean;
  cuenta: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={pulsada}
        onClick={onClick}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 font-caps text-[11px] uppercase tracking-[0.14em] transition-colors",
          pulsada
            ? "border-pimenton-light/80 bg-pimenton/25 text-cream"
            : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
        )}
      >
        {children}
        <span className={pulsada ? "text-cream/70" : "text-cream-faint"}>{cuenta}</span>
        {pulsada ? <Check size={13} strokeWidth={3} aria-hidden className="text-pimenton-a11y" /> : null}
      </button>
    </li>
  );
}

/**
 * La fila de denominaciones: selección única, exactamente como las categorías de la carta de
 * platos, y por la misma razón — es el eje por el que está ORDENADA la lista de abajo, así que
 * elegir una es "enséñame esta sección", no "añade un criterio".
 *
 * En el teléfono se desplaza en horizontal con dos desvanecidos a los lados para que se note que
 * hay más; en escritorio se reparte en varias líneas. El número de cada chapa cuenta los vinos que
 * ya pasan la búsqueda y el color, no los totales: "D.O. Rioja 2" es "dos riojas de los que buscas".
 */
function ChapasDeOrigen({
  grupos,
  elegido,
  todosCuentan,
  onElegir,
  className,
}: {
  grupos: { origin: WineOrigin; vinos: readonly Wine[] }[];
  elegido: WineOrigin | "todos";
  todosCuentan: number;
  onElegir: (origen: WineOrigin | "todos") => void;
  className?: string;
}) {
  const m = useMessages();
  const t = useFormat();
  const refScroll = useRef<HTMLDivElement>(null);

  /* Centra la chapa elegida si se queda fuera de la vista: al llegar desde el mapa o desde un
     enlace, la denominación puede estar quince chapas a la derecha y no se vería. */
  useEffect(() => {
    const scroller = refScroll.current;
    const chapa = scroller?.querySelector<HTMLElement>(`[data-chapa="${elegido}"]`);
    if (!scroller || !chapa) return;
    const izq = chapa.offsetLeft;
    const der = izq + chapa.offsetWidth;
    if (izq >= scroller.scrollLeft + 12 && der <= scroller.scrollLeft + scroller.clientWidth - 12) return;
    scroller.scrollTo({
      left: Math.max(0, izq - scroller.clientWidth / 2 + chapa.offsetWidth / 2),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [elegido]);

  const chapas: { id: WineOrigin | "todos"; etiqueta: string; cuenta: number }[] = [
    { id: "todos", etiqueta: m.vinos.allOrigins, cuenta: todosCuentan },
    ...grupos.map(({ origin, vinos }) => ({ id: origin, etiqueta: nombreDeOrigen(origin, m), cuenta: vinos.length })),
  ];

  return (
    <nav aria-label={m.vinos.filterByOrigin} className={cn("relative min-w-0", className)}>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-4 z-10 w-4 bg-gradient-to-r from-granate-900 to-transparent md:-left-6 md:w-6 lg:hidden" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-granate-900 to-transparent lg:hidden" />

      <div
        ref={refScroll}
        className="no-scrollbar -ml-4 flex snap-x gap-2 overflow-x-auto py-2 pl-4 pr-8 md:-ml-6 md:pl-6 lg:ml-0 lg:flex-wrap lg:overflow-visible lg:pl-0 lg:pr-0"
      >
        {chapas.map(({ id, etiqueta, cuenta }) => {
          const activa = id === elegido;
          return (
            <button
              key={id}
              type="button"
              data-chapa={id}
              aria-pressed={activa}
              onClick={() => onElegir(id)}
              className={cn(
                "relative inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 transition-colors duration-150 ease-[var(--ease-out-expo)] focus-visible:outline-offset-2",
                activa ? "border-transparent text-cream" : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
                cuenta === 0 && !activa && "opacity-50",
              )}
            >
              {activa ? (
                <motion.span
                  layoutId="vinos-chapa-activa"
                  aria-hidden
                  transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.8 }}
                  className="absolute inset-0 rounded-full border border-pimenton-light/70 bg-pimenton shadow-[0_0_22px_rgba(232,86,90,0.45)]"
                />
              ) : null}
              <span className="relative font-condensed text-lg uppercase leading-none tracking-wide">{etiqueta}</span>
              {/* ARIA 1.2 no permite nombrar un `<span>` genérico: el número es decorativo y el texto
                  completo viaja en un `sr-only` dentro del propio botón. */}
              <span
                aria-hidden
                className={cn(
                  "relative min-w-[1.4rem] rounded-full px-1.5 py-px text-center font-sans text-[11px] font-semibold tabular-nums leading-4",
                  activa ? "bg-cream/20 text-cream" : "bg-cream/[0.06] text-cream-faint",
                )}
              >
                {cuenta}
              </span>
              <span className="sr-only">{t(m.vinos.mapWorldWines, { count: cuenta })}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
