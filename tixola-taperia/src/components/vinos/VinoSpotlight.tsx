"use client";

import { AnimatePresence, MotionConfig, motion, useDragControls, useReducedMotion, type PanInfo, type Variants } from "framer-motion";
import { MessageCircleQuestion, Wine as WineIcon, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useChat } from "@/components/chat/ChatProvider";
import { formatPrice } from "@/data/menu";
import {
  isGalicianOrigin,
  WINE_AXES,
  WINE_REGIONS,
  type GalicianDoId,
  type Wine,
  type WineAxis,
  type WineOrigin,
} from "@/data/wines";
import { useInertBackground } from "@/hooks/useInertBackground";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { lockScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";

/**
 * VinoSpotlight — la ficha completa de una botella, al pulsar su foto en la carta.
 *
 * ESTÁ PENSADA PARA EL TELÉFONO, que es por donde entra casi todo el mundo a la carta de un bar:
 *  · Móvil: hoja que sube desde abajo y se cierra arrastrándola, con LA BOTELLA ARRIBA Y GRANDE —a
 *    todo el ancho, en 4:5— porque lo primero que quiere ver quien pulsa es cuál es exactamente esa
 *    botella. Debajo, el resto de la ficha, que se desplaza.
 *  · Tablet y escritorio: diálogo centrado a dos columnas, la botella a sangre en la izquierda.
 *
 * LA FOTO VIAJA desde la tarjeta de la cuadrícula hasta aquí (`layoutId` de framer-motion) y vuelve
 * al cerrar, igual que el detalle de los platos. No es un adorno: es lo que mantiene el hilo entre
 * "he pulsado ESTA botella" y "esta es su ficha".
 *
 * Es hermana de `DishSpotlight` y comparte su contrato de accesibilidad: `role="dialog"` modal,
 * Escape / fondo / botón cierran, foco inicial en "cerrar" y devuelto al cerrar, el resto de la
 * página en `inert` y el scroll del documento bloqueado. Se monta por portal en `document.body` para
 * escapar de cualquier ancestro con `transform` u `overflow`.
 */

/** Id del elemento compartido entre la tarjeta de la cuadrícula y esta ficha. */
export const vinoLayoutId = (id: string) => `botella-${id}`;

/** La foto es el hilo entre la tarjeta y la ficha: ni tan lenta que se note el viaje, ni instantánea. */
export const VINO_LAYOUT_TRANSITION = { layout: { duration: 0.34, ease: [0.16, 1, 0.3, 1] } } as const;

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * `sizes` NO es el ancho del hueco: con `object-cover` el navegador agranda la foto hasta cubrir la
 * caja y solo se ve una franja, así que hay que declarar el ancho de la foto YA agrandada.
 *  · Móvil: la caja es 4:5 a todo el ancho y la foto es 3:4 — casi la misma proporción, así que el
 *    ancho pedido es el de la pantalla.
 *  · Escritorio: columna de ~376 × 780 px; una foto 3:4 ahí dentro acaba midiendo ~585 px de ancho.
 */
const FOTO_SIZES = "(max-width: 767px) 100vw, (max-width: 1023px) 60vw, 600px";

/** Hoja de abajo (móvil). */
const HOJA: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } },
  exit: { y: "100%", transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};
/** Diálogo centrado (sm+). */
const DIALOGO: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, y: 14, scale: 0.98, transition: { duration: 0.22, ease: "easeIn" } },
};
/** Los bloques de la ficha entran escalonados, detrás de la foto. */
const CUERPO: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
};
const BLOQUE: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT_EXPO } },
};

/** `true` solo tras la hidratación (el portal necesita `document.body`). */
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export interface VinoSpotlightProps {
  /** botella abierta; `null` cierra la ficha */
  vino: Wine | null;
  onClose: () => void;
  /** nombre traducido de cada plato, para pintar los maridajes */
  nombreDePlato: Map<string, string>;
}

export default function VinoSpotlight({ vino, onClose, nombreDePlato }: VinoSpotlightProps) {
  const isClient = useIsClient();
  const isMobile = useIsMobile();
  const hostRef = useRef<HTMLDivElement>(null);
  const volverElFoco = useRef<HTMLElement | null>(null);
  const abierto = vino !== null;

  useInertBackground(abierto, [hostRef]);

  useEffect(() => {
    if (!abierto) return;
    volverElFoco.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    /* Bloqueo CONTADO y compartido (`src/lib/scrollLock.ts`). */
    const soltarScroll = lockScroll();
    return () => {
      soltarScroll();
      const el = volverElFoco.current;
      volverElFoco.current = null;
      if (el?.isConnected) el.focus({ preventScroll: true });
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, onClose]);

  if (!isClient) return null;

  return createPortal(
    <div ref={hostRef} data-vino-spotlight="">
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {vino && <Hoja key={vino.id} vino={vino} movil={isMobile} onClose={onClose} nombreDePlato={nombreDePlato} />}
        </AnimatePresence>
      </MotionConfig>
    </div>,
    document.body,
  );
}

/* ───────────────────────── La hoja ───────────────────────── */

function Hoja({
  vino,
  movil,
  onClose,
  nombreDePlato,
}: {
  vino: Wine;
  movil: boolean;
  onClose: () => void;
  nombreDePlato: Map<string, string>;
}) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const chat = useChat();
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const tituloId = useId();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => cerrarRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  /* El arrastre arranca desde el asa: si la hoja entera fuese arrastrable, framer fijaría
     `touch-action` y bloquearía el scroll nativo del contenido. */
  const alTocarElAsa = useCallback((e: ReactPointerEvent<HTMLDivElement>) => dragControls.start(e), [dragControls]);
  const alSoltar = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 110 || info.velocity.y > 600) onClose();
    },
    [onClose],
  );

  const region = isGalicianOrigin(vino.origin) ? WINE_REGIONS[vino.origin as GalicianDoId] : null;
  const tipoDeMezcla = vino.grapes?.length === 1 ? m.vinos.monovarietal : m.vinos.blend;
  const maridajes = (vino.pairsWith ?? []).map((id) => nombreDePlato.get(id)).filter((n): n is string => Boolean(n));
  const ejes = WINE_AXES.filter((eje) => vino.profile?.[eje] !== undefined);

  const hayTecnica = Boolean(
    vino.grapes?.length || vino.ageing || vino.winemaking || vino.methods?.length || vino.abv !== undefined || vino.bottleCl !== undefined,
  );
  const hayCata = Boolean(vino.notes || ejes.length || vino.serveC || maridajes.length);
  const hayOrigen = Boolean(vino.subzone || vino.terroir || vino.winemaker || vino.awards?.length || vino.story);

  /* La bodega, salvo cuando el nombre ya la dice ("Quinta Sardonia · Quinta Sardonia"). */
  const bodega = vino.winery && !vino.name.startsWith(vino.winery) ? vino.winery : null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-hidden sm:items-center sm:p-4 md:p-8" role="presentation">
      <motion.button
        type="button"
        aria-label={m.vinos.closeOverlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        className="absolute inset-0 cursor-default bg-black/80"
      />

      {/* Sin `overflow-hidden`: la foto viaja como elemento compartido y no debe recortarse. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        variants={movil ? HOJA : DIALOGO}
        initial="hidden"
        animate="visible"
        exit="exit"
        drag={movil && !reducedMotion ? "y" : false}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={alSoltar}
        className={cn(
          "noise after:noise-after after:rounded-[inherit] relative flex max-h-[94dvh] w-full flex-col rounded-t-[28px] bg-granate-900 shadow-[0_-14px_40px_-16px_rgba(0,0,0,0.9)] outline-none",
          "sm:max-w-md sm:rounded-[28px] sm:shadow-card",
          "md:h-[min(88dvh,780px)] md:max-h-none md:max-w-4xl md:flex-row",
        )}
      >
        {/* Cerrar: sobre la foto en móvil, en la esquina del panel en escritorio. */}
        <button
          ref={cerrarRef}
          type="button"
          onClick={onClose}
          aria-label={m.vinos.close}
          className="absolute right-3 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-granate-900/88 text-cream transition-colors duration-160 hover:bg-cream/10 md:right-4 md:top-4"
        >
          <X size={18} aria-hidden />
        </button>

        {/* ── LA BOTELLA ──
            En móvil ocupa todo el ancho en 4:5 (la foto es 3:4, así que apenas se recorta: la
            etiqueta se lee entera). En escritorio llena la columna de la izquierda, a sangre. */}
        <div className="relative shrink-0 md:w-[42%] md:self-stretch">
          <motion.div
            layoutId={vinoLayoutId(vino.id)}
            transition={VINO_LAYOUT_TRANSITION}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[28px] bg-granate-800 md:absolute md:inset-0 md:aspect-auto md:rounded-l-[28px] md:rounded-tr-none"
          >
            {vino.image ? (
              <Image
                src={vino.image}
                alt={t(m.vinos.bottlePhoto, { name: vino.name })}
                fill
                sizes={FOTO_SIZES}
                quality={82}
                priority
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-cream/15">
                <WineIcon className="h-20 w-20" strokeWidth={1} aria-hidden />
              </span>
            )}
            {/* Funde el borde de la foto con el panel: abajo en móvil, al lateral en escritorio. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-granate-900 to-transparent md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-16 md:bg-gradient-to-l"
            />
          </motion.div>

          {/* Asa de arrastre (móvil) */}
          <div
            onPointerDown={alTocarElAsa}
            className="absolute inset-x-0 top-0 z-20 flex h-12 touch-none items-start justify-center pt-2.5 md:hidden"
          >
            <span aria-hidden className="h-1.5 w-12 rounded-full bg-cream/45 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            <span className="sr-only">{m.vinos.dragHandle}</span>
          </div>
        </div>

        {/* ── LA FICHA ── */}
        <motion.div
          variants={CUERPO}
          initial="hidden"
          animate="visible"
          data-lenis-prevent=""
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 md:px-7 md:py-7"
        >
          <motion.div variants={BLOQUE}>
            <p className="font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">{nombreDeOrigen(vino.origin, m)}</p>
            <h2 id={tituloId} className="mt-2 font-display text-[28px] font-medium leading-tight text-cream md:text-4xl">
              {vino.name}
            </h2>
            {bodega ? <p className="mt-1.5 text-sm leading-snug text-cream-faint">{bodega}</p> : null}

            <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {vino.bottlePrice !== undefined ? (
                <span className="font-sans text-2xl font-semibold text-pimenton-a11y">{formatPrice(vino.bottlePrice, locale)}</span>
              ) : null}
              {vino.glassPrice !== undefined ? (
                <span className="text-sm text-cream-muted">
                  <span className="font-caps text-[10px] uppercase tracking-[0.18em] text-cream-faint">{m.vinos.glass}</span>{" "}
                  {formatPrice(vino.glassPrice, locale)}
                </span>
              ) : null}
              {vino.kind ? (
                <span className="rounded-full border border-cream/15 px-2.5 py-1 font-caps text-[10px] uppercase tracking-[0.14em] text-cream-muted">
                  {m.vinos.kinds[vino.kind]}
                </span>
              ) : null}
            </p>
            <span aria-hidden className="mt-5 block h-px w-full bg-cream/12" />
          </motion.div>

          <div className="mt-5 grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] md:gap-7">
            {/* La denominación: lo único que casi siempre tiene algo que contar, y de las cinco
                gallegas está verificado contra sus consejos reguladores. No habla de ESTA botella. */}
            {region ? (
              <motion.div variants={BLOQUE}>
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
              </motion.div>
            ) : null}

            {hayTecnica ? (
              <motion.div variants={BLOQUE}>
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
              </motion.div>
            ) : null}

            {hayCata ? (
              <motion.div variants={BLOQUE}>
                <Bloque titulo={m.vinos.blockTasting}>
                  {ejes.length ? (
                    <dl className="grid gap-2">
                      {ejes.map((eje) => (
                        <Eje key={eje} eje={eje} valor={vino.profile?.[eje] ?? 1} />
                      ))}
                    </dl>
                  ) : null}
                  {vino.notes ? <Dato titulo={m.vinos.notes}>{vino.notes}</Dato> : null}
                  {vino.serveC ? (
                    <Dato titulo={m.vinos.serve}>
                      {/* Hay bodegas que publican UNA temperatura, no un intervalo (Murrieta, 13 ºC). */}
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
              </motion.div>
            ) : null}

            {hayOrigen ? (
              <motion.div variants={BLOQUE}>
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
              </motion.div>
            ) : null}
          </div>

          <motion.div variants={BLOQUE} className="mt-7 grid gap-3">
            {!hayTecnica && !hayCata && !hayOrigen ? (
              <p className="text-sm leading-relaxed text-cream-faint text-pretty">{m.vinos.pendingSheet}</p>
            ) : null}
            <button
              type="button"
              onClick={() => chat.open({ prefill: t(m.vinos.askAboutWine, { name: vino.name }), page: "vinos" })}
              aria-label={t(m.vinos.askAboutWineAria, { name: vino.name })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-pimenton-light/40 bg-pimenton/12 px-4 py-3 font-caps text-[11px] uppercase tracking-[0.14em] text-pimenton-a11y transition-colors duration-300 hover:border-pimenton-light/70 hover:bg-pimenton/20 hover:text-cream sm:w-fit sm:px-5"
            >
              <MessageCircleQuestion size={15} aria-hidden />
              {m.vinos.askAboutWineCta}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Piezas de la ficha ───────────────────────── */

/** El título de una procedencia: "D.O. Ribeiro" en las gallegas, su nombre impreso en el resto. */
export function nombreDeOrigen(origin: WineOrigin, m: ReturnType<typeof useMessages>): string {
  return isGalicianOrigin(origin) ? `${m.vinos.doPrefix} ${WINE_REGIONS[origin].label}` : m.vinos.origins[origin];
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-caps text-[11px] uppercase tracking-[0.26em] text-pimenton-a11y">{titulo}</p>
      <dl className="mt-3 grid gap-3">{children}</dl>
    </div>
  );
}

/** Un dato con su rótulo arriba y el valor debajo: en móvil no hay sitio para dos columnas. */
function Dato({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <dt className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{titulo}</dt>
      <dd className="text-sm leading-relaxed text-cream-muted text-pretty">{children}</dd>
    </div>
  );
}

/**
 * Un eje del perfil de boca, en cinco tramos. Es la parte pensada para quien no entiende de vino:
 * "Cuerpo ▮▮▮▯▯" se lee sin saber nada. Los tramos son `aria-hidden` y el valor va en el texto
 * alternativo, porque cinco cajitas no significan nada leídas en voz alta.
 */
function Eje({ eje, valor }: { eje: WineAxis; valor: number }) {
  const m = useMessages();
  const t = useFormat();
  return (
    <div className="flex items-center gap-3">
      <dt className="w-24 shrink-0 font-caps text-[10px] uppercase tracking-[0.18em] text-cream-faint">{m.vinos.axes[eje]}</dt>
      <dd className="flex items-center gap-1" aria-label={t(m.vinos.axisAria, { axis: m.vinos.axes[eje], value: valor })}>
        {[1, 2, 3, 4, 5].map((tramo) => (
          <span key={tramo} aria-hidden className={cn("h-1.5 w-5 rounded-full", tramo <= valor ? "bg-pimenton-light" : "bg-cream/12")} />
        ))}
      </dd>
    </div>
  );
}
