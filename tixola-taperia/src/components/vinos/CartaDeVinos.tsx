"use client";

import Image from "next/image";
import { useMemo, type ReactNode } from "react";
import { MessageCircleQuestion, Plus, Wine as WineIcon } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import { formatPrice } from "@/data/menu";
import {
  isGalicianOrigin,
  ORIGIN_COUNTRY,
  ORIGIN_ORDER,
  WINE_AXES,
  WINE_KINDS,
  WINE_REGIONS,
  winesByOrigin,
  type GalicianDoId,
  type Wine,
  type WineAxis,
  type WineOrigin,
} from "@/data/wines";
import { localizeMenuItems } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * LA CARTA DE VINOS — una ficha desplegable por botella.
 *
 * MIENTRAS NO HAYA VINOS, ESTO NO PINTA NADA (`WINES` está vacía y devuelve `null`): la página enseña
 * el aviso de que la carta se está cerrando. Pero el renderizador existe y está probado, que es justo
 * lo que faltaba — hasta ahora, el día que llegara la lista de Tatiana no se habría visto ni una
 * botella por mucho que se rellenara `wines.ts`.
 *
 * SE AGRUPA POR DENOMINACIÓN, no por color, y es lo que pidió el cliente: "pinchamos en Rías Baixas
 * y aparecen todos los vinos que tenemos de las Rías Baixas". Tiene sentido en esta carta: 52 vinos
 * de 16 procedencias distintas, desde el Ribeiro de al lado hasta Sudáfrica. Agrupados por color
 * serían dos listas enormes donde el origen —que es justo lo que esta casa vende— se perdería.
 * Dentro de una denominación con blancos y tintos, se separan por color.
 *
 * LO QUE ENSEÑA Y EN QUÉ ORDEN. Es la lista que pidió el cliente, en sus cuatro bloques:
 *   · SIN DESPLEGAR, lo que decide la compra: nombre, bodega, denominación, añada y precio de copa y
 *     de botella. Con eso se elige un vino, y son cinco líneas, no veinte.
 *   · AL DESPLEGAR, el resto en tres bloques — uva y elaboración, cata y servicio, origen e historia.
 *
 * POR QUÉ DESPLEGABLE Y NO TODO A LA VISTA. Es el mismo problema que ya resolvió la carta de comer:
 * con la ficha completa abierta, cada vino ocupa una pantalla y una carta de treinta botellas son
 * treinta pantallas de dedo. Plegada, cada vino es una fila. Y son `<details>` nativos: el contenido
 * va en el HTML (lo leen los buscadores), funcionan sin JavaScript y el teclado los abre solo.
 *
 * CADA DATO ES OPCIONAL, Y ESO NO ES PEREZA. No hay dos bodegas que publiquen lo mismo: unas dan el
 * porcentaje del ensamblaje y otras solo la uva mayoritaria, unas puntúan en guías y otras no existen
 * para las guías. Un campo que falta simplemente no se pinta, ni con guión ni con "no disponible". La
 * alternativa —rellenar huecos— es inventarse una ficha técnica, y es exactamente el error que esta
 * web ya corrigió una vez.
 *
 * LAS FOTOS DE BOTELLA (`vino.image`) son las que hizo Brian en el propio local: 33 de los 52 vinos
 * las tienen. Van en dos sitios —miniatura en la fila y foto grande al desplegar— y donde no hay
 * foto va una copa dibujada del mismo tamaño, para que las filas no bailen según haya foto o no.
 *
 * Y UN VINO DEL QUE NO SE SEPA NADA MÁS NO SE DESPLIEGA. Antes todas las filas eran `<details>`,
 * así que la mitad de la carta abría un panel vacío con un borde: el "+" prometía algo que no
 * existía. Si no hay ni foto ni ningún bloque que pintar, la fila se queda como fila.
 */

export default function CartaDeVinos() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();

  /**
   * Nombre traducido de cada plato, para pintar los maridajes. La relación vive en el VINO
   * (`pairsWith`), así que aquí solo hay que traducir los nombres; `MenuItemId` ya garantiza que el
   * plato existe.
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

      <div className="mt-8 grid gap-10">
        {grupos.map(({ origin, vinos }) => (
          <GrupoPorOrigen key={origin} origin={origin} vinos={vinos} nombreDePlato={nombreDePlato} />
        ))}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-cream-faint">{m.vinos.priceNote}</p>
      {/* La carta de papel lo dice al pie de las dos caras, y es verdad: la lista no es cerrada. */}
      <p className="mt-2 text-xs leading-relaxed text-cream-faint">{m.vinos.offMenuNote}</p>
    </section>
  );
}

/** El título de una procedencia: "D.O. Ribeiro" para las gallegas, su nombre impreso para el resto. */
function nombreDeOrigen(origin: WineOrigin, m: ReturnType<typeof useMessages>): string {
  return isGalicianOrigin(origin) ? `${m.vinos.doPrefix} ${WINE_REGIONS[origin].label}` : m.vinos.origins[origin];
}

/** Los vinos de una denominación. Si los hay de varios colores, se separan por color dentro. */
function GrupoPorOrigen({
  origin,
  vinos,
  nombreDePlato,
}: {
  origin: WineOrigin;
  vinos: readonly Wine[];
  nombreDePlato: Map<string, string>;
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

      <div className="mt-4 grid gap-5">
        {porColor.map(({ kind, lista }) => (
          <div key={kind}>
            {separar ? (
              <p className="mb-2 font-caps text-[10px] uppercase tracking-[0.26em] text-pimenton-a11y">{m.vinos.kinds[kind]}</p>
            ) : null}
            <ul className="grid gap-3">
              {lista.map((vino) => (
                <FichaVino key={vino.id} vino={vino} nombreDePlato={nombreDePlato} />
              ))}
            </ul>
          </div>
        ))}

        {sinColor.length ? (
          <div>
            <ul className="grid gap-3">
              {sinColor.map((vino) => (
                <FichaVino key={vino.id} vino={vino} nombreDePlato={nombreDePlato} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   La ficha
   ────────────────────────────────────────────────────────────── */

function FichaVino({ vino, nombreDePlato }: { vino: Wine; nombreDePlato: Map<string, string> }) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();

  /* Monovarietal o ensamblaje se deduce de la lista de uvas: un dato menos que escribir a mano. */
  const tipoDeMezcla = vino.grapes?.length === 1 ? m.vinos.monovarietal : m.vinos.blend;

  const maridajes = (vino.pairsWith ?? []).map((id) => nombreDePlato.get(id)).filter((n): n is string => Boolean(n));
  const ejes = WINE_AXES.filter((eje) => vino.profile?.[eje] !== undefined);

  const hayTecnica = Boolean(
    vino.grapes?.length || vino.ageing || vino.winemaking || vino.methods?.length || vino.abv !== undefined || vino.bottleCl !== undefined,
  );
  const hayCata = Boolean(vino.notes || ejes.length || vino.serveC || maridajes.length);
  const hayOrigen = Boolean(vino.subzone || vino.terroir || vino.winemaker || vino.awards?.length || vino.story);

  /* LA DENOMINACIÓN SIEMPRE TIENE ALGO QUE CONTAR, y de las cinco gallegas lo tenemos verificado
     contra sus consejos reguladores (`WINE_REGIONS`). Es lo que convierte la ficha de un vino del
     que solo sabemos el nombre en algo que se lee: de dónde viene, con qué uvas se hace allí y a
     qué saben los vinos de esa zona. No habla de ESTA botella —no se inventa nada de ella—, habla
     de su denominación, que es un dato público y comprobable. */
  const region = isGalicianOrigin(vino.origin) ? WINE_REGIONS[vino.origin as GalicianDoId] : null;

  const cabecera = (
    <>
      <Miniatura vino={vino} />
      <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-medium leading-tight text-cream md:text-2xl">{vino.name}</span>
            {/* Solo se pinta la línea de debajo si hay algo que poner: la carta de papel da el
                nombre y poco más, y un "·" suelto delataría el hueco. La crianza NO va aquí aunque se
                sepa: en esta carta suele formar parte del propio nombre ("Arzuaga Crianza") y repetida
                debajo se leía como un tartamudeo. Vive dentro de la ficha, con su rótulo. */}
            {[vino.winery, vino.vintage ? String(vino.vintage) : null].filter(Boolean).length ? (
              <span className="mt-1 block text-[13px] leading-snug text-cream-faint">
                {[vino.winery, vino.vintage ? String(vino.vintage) : null].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </span>

          {/* Los precios: lo segundo que se mira después del nombre, así que van alineados a la derecha
              y en columna, nunca en la misma línea que la bodega. */}
          <span className="shrink-0 text-right">
            {vino.glassPrice !== undefined ? (
              <span className="block whitespace-nowrap text-[13px] text-cream-muted">
                <span className="font-caps text-[10px] uppercase tracking-[0.18em] text-cream-faint">{m.vinos.glass}</span>{" "}
                {formatPrice(vino.glassPrice, locale)}
              </span>
            ) : null}
            {vino.bottlePrice !== undefined ? (
              <span className="block whitespace-nowrap font-sans text-lg font-semibold text-pimenton-a11y">
                {formatPrice(vino.bottlePrice, locale)}
              </span>
            ) : null}
          </span>
    </>
  );

  return (
    <li id={`vino-${vino.id}`} className="scroll-mt-28">
      <details className="group overflow-hidden rounded-2xl border border-cream/10 bg-granate-800/45 transition-colors duration-300 open:border-cream/20 open:bg-granate-800/70 hover:border-cream/25">
        <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3 marker:content-none md:px-5 [&::-webkit-details-marker]:hidden">
          {cabecera}

          <Plus
            aria-hidden
            className="h-5 w-5 shrink-0 text-pimenton-a11y transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45"
            strokeWidth={2}
          />
        </summary>

        <div className="flex flex-col gap-6 border-t border-cream/10 px-4 py-5 md:px-5 lg:flex-row lg:gap-8">
          {/* La botella, grande. Va dentro del <details> y no en la fila: en la fila es una miniatura
              que solo tiene que decir "de qué color es esto", y aquí se lee la etiqueta. */}
          {vino.image ? (
            <figure
              className="relative mx-auto aspect-[3/4] w-44 shrink-0 self-start overflow-hidden rounded-xl border border-cream/10 bg-granate-900 sm:w-52 lg:mx-0"
            >
              <Image
                src={vino.image}
                alt={t(m.vinos.bottlePhoto, { name: vino.name })}
                fill
                sizes="(max-width: 640px) 176px, 208px"
                quality={80}
                className="object-cover"
              />
            </figure>
          ) : null}

        {/* Los bloques en columnas que se reparten el ancho que haya: varias en escritorio, una en el
            teléfono, y si un vino solo trae un bloque ese bloque ocupa todo en vez de dejar huecos.
            Con una sola columna, en una pantalla ancha cada dato se quedaba solo en una línea de mil
            píxeles. */}
        <div className="grid min-w-0 flex-1 items-start gap-6 lg:grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] lg:gap-8">
          {/* ── Bloque 0 · la denominación ──
              Va el PRIMERO a propósito: es el único bloque que casi siempre tiene algo que contar, y
              en los vinos de los que la casa aún no ha rellenado la ficha es lo único. No habla de
              esta botella, habla de su denominación —dato público del consejo regulador—, así que no
              hay forma de que afirme nada que no se sostenga. */}
          {region ? (
            <Bloque titulo={m.vinos.blockRegion}>
              <Dato titulo={m.vinos.regionProvinces}>
                {region.provinces.join(" · ")}
                {region.since ? ` · ${t(m.vinos.since, { year: region.since })}` : ""}
              </Dato>
              <Dato titulo={m.vinos.regionGrapes}>
                <span className="grid gap-1.5">
                  <span>
                    <span className="font-caps text-[10px] uppercase tracking-[0.18em] text-cream-faint">{m.vinos.whites}: </span>
                    {region.whites.join(", ")}
                  </span>
                  <span>
                    <span className="font-caps text-[10px] uppercase tracking-[0.18em] text-cream-faint">{m.vinos.reds}: </span>
                    {region.reds.join(", ")}
                  </span>
                </span>
              </Dato>
              <Dato titulo={nombreDeOrigen(vino.origin, m)}>{m.vinos.regionCharacter[region.id]}</Dato>
            </Bloque>
          ) : null}

          {/* ── Bloque 1 · uva y elaboración ── */}
          {hayTecnica ? (
          <Bloque titulo={m.vinos.blockGrape}>
            {vino.grapes?.length ? (
            <Dato titulo={`${m.vinos.grapes} · ${tipoDeMezcla}`}>
              <span className="flex flex-wrap gap-1.5">
                {vino.grapes.map((uva, i) => {
                  const parte = vino.grapeShares?.[uva];
                  return (
                    <span
                      key={uva}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[12px] leading-none",
                        i === 0 ? "border-gold/45 bg-gold/12 text-cream" : "border-cream/15 text-cream-muted",
                      )}
                    >
                      {uva}
                      {parte !== undefined ? (
                        <span className="ml-1.5 text-cream-faint">{t(m.vinos.percent, { value: formatNumber(parte, locale) })}</span>
                      ) : null}
                    </span>
                  );
                })}
              </span>
            </Dato>
            ) : null}

            {vino.ageing ? <Dato titulo={m.vinos.ageing}>{vino.ageing}</Dato> : null}
            {vino.winemaking ? <Dato titulo={m.vinos.winemaking}>{vino.winemaking}</Dato> : null}

            {vino.methods?.length ? (
              <Dato titulo={m.vinos.methodsTitle}>
                <span className="flex flex-wrap gap-1.5">
                  {vino.methods.map((metodo) => (
                    <span
                      key={metodo}
                      className="rounded-full border border-pimenton-light/35 bg-pimenton/15 px-2.5 py-1 font-caps text-[10px] uppercase tracking-[0.14em] text-pimenton-a11y"
                    >
                      {m.vinos.methods[metodo]}
                    </span>
                  ))}
                </span>
              </Dato>
            ) : null}

            {vino.abv !== undefined ? (
              <Dato titulo={m.vinos.abv}>{t(m.vinos.abvValue, { value: formatNumber(vino.abv, locale) })}</Dato>
            ) : null}
            {vino.bottleCl !== undefined ? (
              <Dato titulo={m.vinos.format}>{t(m.vinos.formatValue, { cl: formatNumber(vino.bottleCl, locale) })}</Dato>
            ) : null}
          </Bloque>
          ) : null}

          {/* ── Bloque 2 · cata y servicio ── */}
          {hayCata ? (
            <Bloque titulo={m.vinos.blockTasting}>
              {ejes.length ? (
                <dl className="grid gap-2 sm:max-w-sm">
                  {ejes.map((eje) => (
                    <Eje key={eje} eje={eje} valor={vino.profile?.[eje] ?? 1} />
                  ))}
                </dl>
              ) : null}

              {vino.notes ? <Dato titulo={m.vinos.notes}>{vino.notes}</Dato> : null}
              {vino.serveC ? (
                <Dato titulo={m.vinos.serve}>
                  {/* Hay bodegas que publican UNA temperatura y no un intervalo (Murrieta, 13 ºC):
                      guardada como [13, 13] es correcta, pero "de 13 a 13 °C" no se puede leer. */}
                  {vino.serveC[0] === vino.serveC[1]
                    ? t(m.vinos.serveValueOne, { min: vino.serveC[0] })
                    : t(m.vinos.serveValue, { min: vino.serveC[0], max: vino.serveC[1] })}
                </Dato>
              ) : null}

              {maridajes.length ? (
                <Dato titulo={m.vinos.pairsWith}>
                  <span className="flex flex-wrap gap-1.5">
                    {maridajes.map((plato) => (
                      <span key={plato} className="rounded-full border border-cream/15 px-2.5 py-1 text-[12px] leading-none text-cream-muted">
                        {plato}
                      </span>
                    ))}
                  </span>
                </Dato>
              ) : null}
            </Bloque>
          ) : null}

          {/* ── Bloque 3 · origen e historia ── */}
          {hayOrigen ? (
            <Bloque titulo={m.vinos.blockOrigin}>
              {vino.subzone ? <Dato titulo={m.vinos.subzone}>{vino.subzone}</Dato> : null}
              {vino.terroir ? <Dato titulo={m.vinos.terroir}>{vino.terroir}</Dato> : null}
              {vino.winemaker ? <Dato titulo={m.vinos.winemaker}>{vino.winemaker}</Dato> : null}

              {vino.awards?.length ? (
                <Dato titulo={m.vinos.awards}>
                  <span className="grid gap-1">
                    {vino.awards.map((premio) => (
                      <span key={`${premio.source}-${premio.year ?? ""}-${premio.score ?? ""}`}>
                        {premio.source}
                        {premio.score ? ` · ${premio.score}` : ""}
                        {premio.year ? ` (${premio.year})` : ""}
                      </span>
                    ))}
                  </span>
                </Dato>
              ) : null}

              {vino.story ? <Dato titulo={m.vinos.story}>{vino.story}</Dato> : null}
            </Bloque>
          ) : null}

          {/* ── Lo que falta, y a quién preguntárselo ──
              Un vino del que la casa solo tiene nombre y precio lo dice, en vez de abrir un panel
              medio vacío y dejar al cliente adivinando si es que no hay más o es que se rompió algo.
              El botón del camarero va en TODAS las fichas: sabe la carta entera y puede contestar lo
              que estos campos aún no cuentan. */}
          <div className="grid gap-3">
            {!hayTecnica && !hayCata && !hayOrigen ? (
              <p className="text-sm leading-relaxed text-cream-faint text-pretty">{m.vinos.pendingSheet}</p>
            ) : null}
            <PreguntarPorElVino vino={vino} />
          </div>
        </div>
        </div>
      </details>
    </li>
  );
}

/**
 * El enlace al camarero virtual, con la pregunta ya escrita por este vino. Es un `<button>` dentro
 * de un `<details>` abierto, así que no hay riesgo de que al pulsarlo se cierre la ficha: el
 * `<summary>` queda arriba y este botón no está dentro de él.
 */
function PreguntarPorElVino({ vino }: { vino: Wine }) {
  const m = useMessages();
  const t = useFormat();
  const chat = useChat();

  return (
    <button
      type="button"
      onClick={() => chat.open({ prefill: t(m.vinos.askAboutWine, { name: vino.name }), page: "vinos" })}
      aria-label={t(m.vinos.askAboutWineAria, { name: vino.name })}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-pimenton-light/40 bg-pimenton/12 px-4 py-2 font-caps text-[11px] uppercase tracking-[0.14em] text-pimenton-a11y transition-colors duration-300 hover:border-pimenton-light/70 hover:bg-pimenton/20 hover:text-cream"
    >
      <MessageCircleQuestion size={15} aria-hidden />
      {m.vinos.askAboutWineCta}
    </button>
  );
}

/**
 * La miniatura de la fila. Decorativa a propósito (`alt=""` vía `aria-hidden`): el nombre del vino
 * está justo al lado y repetirlo en la foto sería leerlo dos veces con el lector de pantalla.
 * Los vinos sin foto llevan una copa dibujada del mismo tamaño para que las filas no bailen.
 */
function Miniatura({ vino }: { vino: Wine }) {
  return (
    <span
      aria-hidden
      className="relative block h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-cream/10 bg-granate-900 md:h-20 md:w-[3.75rem]"
    >
      {vino.image ? (
        <Image src={vino.image} alt="" fill sizes="60px" quality={70} className="scale-[1.45] object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-cream/20">
          <WineIcon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      )}
    </span>
  );
}

/** Uno de los tres bloques de la ficha. */
function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-caps text-[11px] uppercase tracking-[0.26em] text-pimenton-a11y">{titulo}</p>
      <dl className="mt-3 grid gap-3">{children}</dl>
    </div>
  );
}

/** Un dato con su rótulo. El rótulo arriba y el valor debajo: en móvil no hay sitio para dos columnas. */
function Dato({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <dt className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{titulo}</dt>
      <dd className="text-sm leading-relaxed text-cream-muted text-pretty">{children}</dd>
    </div>
  );
}

/**
 * Un eje del perfil de boca, en cinco tramos. Es la parte de la ficha pensada para quien no entiende
 * de vino: "Cuerpo ▮▮▮▯▯" se lee sin saber nada, y una nota de cata de cinco líneas no.
 *
 * Los tramos son `aria-hidden` y el valor va en el texto alternativo del `<dd>`: cinco cajitas no
 * significan nada leídas en voz alta.
 */
function Eje({ eje, valor }: { eje: WineAxis; valor: number }) {
  const m = useMessages();
  const t = useFormat();

  return (
    <div className="flex items-center gap-3">
      <dt className="w-24 shrink-0 font-caps text-[10px] uppercase tracking-[0.18em] text-cream-faint">{m.vinos.axes[eje]}</dt>
      <dd className="flex items-center gap-1" aria-label={t(m.vinos.axisAria, { axis: m.vinos.axes[eje], value: valor })}>
        {[1, 2, 3, 4, 5].map((tramo) => (
          <span
            key={tramo}
            aria-hidden
            className={cn("h-1.5 w-5 rounded-full", tramo <= valor ? "bg-pimenton-light" : "bg-cream/12")}
          />
        ))}
      </dd>
    </div>
  );
}
