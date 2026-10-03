"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Expand, Flame, Leaf, MessageCircleQuestion, Sparkles, Sprout, Star, WheatOff, Wine, type LucideProps } from "lucide-react";
import { memo, type ComponentType } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import { DishIcon } from "@/components/icons/DishIcons";
import { AllergenRow } from "@/components/ui/AllergenIcon";
import { formatPrice, type DietTag, type MenuItem } from "@/data/menu";
import { PHOTOS, type Photo } from "@/data/photos";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * MenuItemCard — tarjeta de plato.
 *
 *  - EN MÓVIL ES UNA FILA DE ~72 px: miniatura, nombre y precio, cinco platos por pantalla. Con la
 *    ficha completa desplegada cada plato ocupaba una pantalla entera: 40 platos eran 12.000 px, 18
 *    pantallas de dedo para llegar al final. Al tocar se abre LA FICHA (`DishSpotlight`), la misma que
 *    ya abren los platos estrella: foto grande, precio, alérgenos, maridaje y camarero.
 *  - EN ESCRITORIO la tarjeta se queda como estaba (toda la información a la vista) y la FOTO es el
 *    botón que abre esa misma ficha. Una sola manera de ver un plato en toda la web.
 *  - Con foto —la escrita en `MenuItem.image` o la del manifiesto que reclame el plato por
 *    `dishIds`—: imagen 4:3 arriba (next/image, con el `object-position` del manifiesto de fotos) y
 *    el icono del plato en un disco de hierro sobre la esquina.
 *  - Sin foto: cabecera fina con el icono del plato (DishIcon) en dorado sobre un disco de hierro.
 *  - Nombre en Bebas Neue mayúsculas, descripción, precio grande en rojo pimentón + unidad, variantes
 *    en línea, chips dietéticos (lucide), fila de alérgenos, maridaje ("Marida con: …") y un botón
 *    fantasma "Preguntar al camarero" que abre el chat con una pregunta sobre el plato.
 *  - `id={item.id}` para enlaces profundos `/carta#tix-chistorra-huevos` (con `scroll-margin-top`);
 *    `highlighted` dispara el anillo rojo de llegada.
 *  - SIN `layout` de framer-motion: esa prop medía con `getBoundingClientRect` las 49 tarjetas antes
 *    y después de CADA cambio de filtro (cada tecla, cada chip, cada alérgeno), y además las
 *    secciones llevan `content-visibility: auto`, así que o se forzaba su maquetación —perdiendo justo
 *    el ahorro de esa propiedad— o devolvían rectángulos vacíos y la recolocación saltaba. El fundido
 *    de entrada (`enter`) ya cuenta visualmente el cambio de filtro.
 *  - Superficie de hierro opaco en TODAS las gamas: sobre la pizarra oscura el cristal ahumado no
 *    aportaba nada visible y multiplicaba por 49 el trabajo de composición.
 *  - `memo`: escribir en el buscador re-renderiza la carta con los resultados ANTERIORES (el filtrado
 *    va diferido) y sin esta puerta las 49 tarjetas volvían a renderizarse en cada tecla para pintar
 *    exactamente lo mismo.
 */

export type MenuItemCardVariant = "glass" | "chalk";

export interface MenuItemCardProps {
  item: MenuItem;
  /** etiquetas dietéticas ya localizadas (`localizeDietTags(locale)`) */
  dietTags: Record<DietTag, string>;
  variant?: MenuItemCardVariant;
  highlighted?: boolean;
  /**
   * Fundido de entrada al montarse. La sección lo activa solo para tarjetas que aparecen DESPUÉS
   * del primer frame (al filtrar): así el HTML estático y el árbol interactivo no parpadean.
   */
  enter?: boolean;
  /** Abre la ficha del plato (`DishSpotlight`), que vive en `CartaExplorer`. */
  onOpen: (item: MenuItem) => void;
  className?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface TagStyle {
  icon: ComponentType<LucideProps>;
  chip: string;
}

/** Colores por etiqueta: hoja verde (vegano), trigo tachado (sin gluten), llama (picante), estrella dorada… */
const TAG_STYLES: Record<DietTag, TagStyle> = {
  vegano: { icon: Leaf, chip: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  vegetariano: { icon: Sprout, chip: "border-lime-400/40 bg-lime-400/10 text-lime-300" },
  "sin-gluten": { icon: WheatOff, chip: "border-gold/40 bg-gold/10 text-gold" },
  picante: { icon: Flame, chip: "border-ember/50 bg-ember/10 text-ember" },
  estrella: { icon: Star, chip: "border-gold/60 bg-gold/15 text-gold" },
  nuevo: { icon: Sparkles, chip: "border-cream/40 bg-cream/10 text-cream" },
};

/** Orden de pintado de los chips (la estrella primero, que es la que más vende). */
const TAG_ORDER: DietTag[] = ["estrella", "nuevo", "vegano", "vegetariano", "sin-gluten", "picante"];

/** Foto del manifiesto por ruta (para el `object-position`). */
const PHOTO_BY_SRC: ReadonlyMap<string, Photo> = new Map(PHOTOS.map((p) => [p.src, p]));

/**
 * Foto del manifiesto por PLATO, para las que no van escritas en `MenuItem.image`.
 *
 * La tarjeta solo miraba `item.image`, así que una foto que reclamaba su plato desde el manifiesto
 * (`dishIds`) salía en la ficha al pinchar… y la tarjeta seguía enseñando el icono. Ahora el
 * manifiesto vale para las dos, y `dishIds` es el único sitio donde hay que enlazar una foto con su
 * plato — que además es el que lleva el `alt` traducido y el punto de encuadre.
 *
 * El `.reverse()` no es un adorno: `new Map` se queda con la ÚLTIMA entrada repetida, y aquí el
 * criterio es el mismo que en el resto de la web (`.find()`), o sea la PRIMERA foto del manifiesto
 * que reclame ese plato. Dándole la vuelta a la lista, la primera acaba sobrescribiendo a las demás.
 */
const PHOTO_BY_DISH: ReadonlyMap<string, Photo> = new Map(
  PHOTOS.flatMap((p) => (p.dishIds ?? []).map((id) => [id, p] as const)).reverse(),
);

/** Anchos reales de la columna de la rejilla (1 col móvil · 2 cols md · 3 cols xl junto al camarero). */
const IMAGE_SIZES = "(min-width: 1280px) 300px, (min-width: 768px) 45vw, calc(100vw - 32px)";

function MenuItemCard({ item, dietTags, variant = "glass", highlighted = false, enter = false, onOpen, className }: MenuItemCardProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const chat = useChat();

  const chalk = variant === "chalk";
  const tags = TAG_ORDER.filter((tag) => item.tags.includes(tag));
  const titleId = `carta-item-${item.id}-title`;
  const delManifiesto = PHOTO_BY_DISH.get(item.id);
  const photo = item.image ? PHOTO_BY_SRC.get(item.image) : delManifiesto;
  /* La ruta que se pinta: la escrita en el plato manda, y si no la hay, la del manifiesto. */
  const fotoSrc = item.image ?? delManifiesto?.src;
  /* La variante más barata, para la fila de móvil. Las variantes van de menor a mayor y la mayor
     es, por contrato, el precio base que la fila ya enseña: repetirla sería decir dos veces lo
     mismo. (Lo vigila `assertMenuIntegrity`, que rompe el build si dejan de cuadrar.) */
  const mediaRacion = item.variants && item.variants.length > 1 ? item.variants[0] : undefined;

  const askWaiter = () => chat.open({ prefill: t(m.carta.askAboutDish, { name: item.name }), page: "carta" });

  return (
    <motion.li
      id={item.id}
      initial={enter ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      className={cn("carta-card group relative flex list-none scroll-mt-[calc(var(--header-h)+92px)]", className)}
    >
      <article
        aria-labelledby={titleId}
        className={cn(
          /* Lista explícita en vez de `transition-all`: así el hover no arrastra también el
             `filter`, el `background-image` ni las propiedades de maqueta. 200 ms con curva expo. */
          "relative flex w-full flex-col overflow-hidden rounded-2xl",
          "transition-[translate,border-color,background-color,box-shadow] duration-200 ease-[var(--ease-out-expo)]",
          chalk
            ? "border border-dashed border-cream/25 bg-granate-900/55 hover:border-cream/50 hover:bg-granate-900/70"
            : cn(
                "border border-cream/10 bg-granate-800/90 shadow-card",
                /* Sombra de hover más corta: un desenfoque de 60 px con 49 tarjetas en la página es
                   una superficie enorme que repintar por un halo que casi no se ve. */
                "hover:-translate-y-1 hover:border-pimenton-light/60 hover:shadow-[0_0_0_1px_rgba(232,86,90,0.35),0_12px_30px_-16px_rgba(158,22,24,0.6)]",
              ),
        )}
      >
        {/* Anillo de resalte para el enlace profundo */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
          initial={false}
          animate={
            highlighted
              ? {
                  opacity: [0, 1, 1, 0],
                  boxShadow: [
                    "inset 0 0 0 0px rgba(232,86,90,0), 0 0 0px rgba(232,86,90,0)",
                    "inset 0 0 0 3px rgba(232,86,90,0.95), 0 0 48px rgba(232,86,90,0.6)",
                    "inset 0 0 0 3px rgba(232,86,90,0.7), 0 0 36px rgba(232,86,90,0.4)",
                    "inset 0 0 0 0px rgba(232,86,90,0), 0 0 0px rgba(232,86,90,0)",
                  ],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 2.4, ease: "easeInOut", times: [0, 0.15, 0.7, 1] }}
        />

        {/* ── Fila compacta (solo móvil): miniatura + nombre + precio + galón ──
            El encabezado va DENTRO del botón, que es el patrón de acordeón de siempre. En escritorio
            esta fila desaparece y manda el `<h3>` del cuerpo, que conserva el `id` al que apunta el
            `aria-labelledby` del artículo: un elemento con `display:none` sigue valiendo para dar
            nombre accesible, así que el artículo se llama igual en las dos maquetas. */}
        <h3 className="md:hidden">
          <button
            type="button"
            onClick={() => onOpen(item)}
            aria-label={t(m.carta.openDish, { name: item.name })}
            className="flex w-full items-center gap-3 p-2.5 text-left"
          >
            {fotoSrc ? (
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-granate-800">
                <Image
                  src={fotoSrc}
                  alt=""
                  fill
                  /* 64 px de caja en una pantalla de hasta 3x: pedir 192 px es todo lo que puede
                     aprovechar, y son ~6 KB en vez de los ~40 de la foto grande. */
                  sizes="56px"
                  className="object-cover"
                  style={{ objectPosition: photo?.focus ?? "50% 50%" }}
                />
              </span>
            ) : (
              <span
                aria-hidden
                className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-cream/10 bg-[radial-gradient(circle_at_30%_30%,#653427,#3b1613_75%)] text-gold"
              >
                <DishIcon iconKey={item.emoji} size={24} strokeWidth={1.5} />
              </span>
            )}

            {/* Solo el nombre, a dos líneas como mucho. La descripción recortada a una línea no
                distinguía nada ("Zamburiñas de la rí…") y costaba un renglón en cada una de las
                cuarenta filas: se lee entera al desplegar, que es para lo que está el acordeón.
                La excepción son las MEDIAS RACIONES: eso no es adorno, es un precio distinto, y es
                de lo primero que se mira en una carta de tapas. Va aquí y no solo en la ficha
                porque en móvil la fila es lo único que se ve sin abrir nada. */}
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 block font-condensed text-lg uppercase leading-[1.1] tracking-wide text-cream">
                {item.name}
              </span>
              {mediaRacion && (
                <span className="mt-1 block truncate text-[11px] leading-none text-cream-faint">
                  {mediaRacion.label}{" "}
                  <span className={cn("font-condensed text-[13px] tracking-wide", chalk ? "text-gold" : "text-pimenton-a11y")}>
                    {formatPrice(mediaRacion.price, locale)}
                  </span>
                </span>
              )}
            </span>

            <span className="flex shrink-0 items-center gap-1">
              <span className={cn("font-condensed text-xl tracking-wide", chalk ? "text-gold" : "text-pimenton-light")}>
                {formatPrice(item.price, locale)}
              </span>
              {/* Galón de "esto se abre". `Expand` y no un `ChevronDown`: ya no despliega hacia abajo,
                  abre una ficha a pantalla completa, y el icono tiene que contarlo. */}
              <Expand aria-hidden size={15} className="text-cream-faint" />
            </span>
          </button>
        </h3>

        {/* ── Cabecera: foto 4:3 o disco con el icono del plato ──
            La foto es el BOTÓN que abre la ficha en escritorio (en móvil la abre la fila de arriba).
            Toda esta cabecera va oculta por debajo de `md`, donde manda la fila compacta. */}
        {fotoSrc ? (
          <button
            type="button"
            onClick={() => onOpen(item)}
            aria-label={t(m.carta.openDish, { name: item.name })}
            className="group/foto relative aspect-[4/3] w-full overflow-hidden bg-granate-800 max-md:hidden"
          >
            <Image
              src={fotoSrc}
              alt={t(m.carta.photoOf, { name: item.name })}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              style={{ objectPosition: photo?.focus ?? "50% 50%" }}
            />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-granate-900/90 via-granate-900/30 to-transparent" />
            <span
              aria-hidden
              className="absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 bg-granate/90 text-gold shadow-[0_8px_20px_-8px_rgba(0,0,0,0.9)]"
            >
              <DishIcon iconKey={item.emoji} size={22} />
            </span>
            {/* Pista de que la foto se puede abrir: aparece al acercar el puntero o al enfocar con el
                teclado. Sin puntero (táctil) no se pinta, que allí ya manda la fila compacta. */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full border border-cream/20 bg-granate-900/85 px-2.5 py-1 font-caps text-[9px] uppercase tracking-[0.18em] text-cream opacity-0 transition-opacity duration-300 group-hover/foto:opacity-100 group-focus-visible/foto:opacity-100 [@media(hover:hover)]:inline-flex"
            >
              <Expand size={11} />
              {m.carta.openDishCta}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-5 pt-5 max-md:hidden md:px-6">
            <span
              aria-hidden
              className={cn(
                "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-gold",
                chalk
                  ? "border-cream/20 bg-granate-900/70"
                  /* Solo el radial prehorneado: el volumen del disco lo dan el degradado y el borde.
                     La doble sombra (una interior de 1 px y otra de 24 px de desenfoque) se pintaba
                     49 veces por una insinuación de relieve que a este tamaño no se distingue. */
                  : "border-cream/10 bg-[radial-gradient(circle_at_30%_30%,#653427,#3b1613_75%)]",
              )}
            >
              <DishIcon iconKey={item.emoji} size={30} strokeWidth={1.5} />
            </span>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-cream/15 to-transparent" />
          </div>
        )}

        {/* ── Cuerpo ── */}
        <div className="flex flex-1 flex-col p-5 max-md:hidden md:p-6">
          {/* En móvil el nombre ya lo da la fila compacta de arriba; repetirlo sería leerlo dos veces. */}
          <h3
            id={titleId}
            className={cn(
              "font-condensed text-2xl uppercase leading-[0.95] tracking-wide text-cream md:text-[1.75rem]",
              chalk && "[text-shadow:0_0_1px_rgba(246,244,231,0.55),0_0_12px_rgba(246,244,231,0.18)]",
            )}
          >
            {item.name}
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-cream-muted">{item.description}</p>

          {/* Precio + unidad */}
          <p className="mt-4 flex items-baseline gap-2 leading-none">
            <span
              className={cn(
                "font-condensed text-4xl tracking-wide",
                chalk ? "text-gold [text-shadow:0_0_14px_rgba(232,194,122,0.35)]" : "text-pimenton-light text-glow-red",
              )}
            >
              {formatPrice(item.price, locale)}
            </span>
            {item.unit && <span className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{item.unit}</span>}
          </p>

          {/* Variantes: "Media (4 uds) 5,50 € · Ración (8 uds) 9,50 €" */}
          {item.variants && item.variants.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cream-400" aria-label={m.carta.variants}>
              {item.variants.map((v, i) => (
                <span key={v.label} className="inline-flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden className="text-cream-faint">
                      ·
                    </span>
                  )}
                  <span>
                    {v.label}{" "}
                    {/* `text-pimenton-a11y` (no `-light`): 16 px es texto normal y necesita 4,5:1 sobre granate-800.
                        El precio grande de arriba es texto grande (3:1) y sí puede llevar `-light`. */}
                    <span className={cn("font-condensed text-base tracking-wide", chalk ? "text-gold" : "text-pimenton-a11y")}>
                      {formatPrice(v.price, locale)}
                    </span>
                  </span>
                </span>
              ))}
            </p>
          )}

          {/* Chips dietéticos */}
          {tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={m.carta.tagsAria}>
              {tags.map((tag) => {
                const { icon: Icon, chip } = TAG_STYLES[tag];
                return (
                  <li key={tag} className={cn("inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-wider", chip)}>
                    <Icon size={12} strokeWidth={2.4} aria-hidden />
                    {dietTags[tag]}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pie: alérgenos + maridaje + camarero */}
          <div className="mt-auto flex flex-col gap-3 pt-5">
            {item.allergens.length > 0 ? (
              <AllergenRow ids={item.allergens} size="xs" />
            ) : (
              <span className="text-xs text-cream-faint">{m.carta.allergensAsk}</span>
            )}

            {item.pairing && (
              <p className="inline-flex items-start gap-2 text-xs text-cream-400">
                <Wine size={14} strokeWidth={2} aria-hidden className={cn("mt-0.5 shrink-0", chalk ? "text-gold" : "text-pimenton-light")} />
                <span>
                  <span className="text-cream-faint">{m.carta.pairing}:</span> <span className="font-medium text-cream-200">{item.pairing}</span>
                </span>
              </p>
            )}

            <button
              type="button"
              onClick={askWaiter}
              aria-label={t(m.carta.askAboutDishAria, { name: item.name })}
              className="-ml-3 inline-flex h-11 w-fit items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <MessageCircleQuestion size={16} strokeWidth={2.2} aria-hidden className="text-pimenton-light" />
              {m.carta.askAboutDishCta}
            </button>
          </div>
        </div>

        {/* Línea inferior de brasa que se enciende al pasar el puntero */}
        {!chalk && (
          <span
            aria-hidden
            /* El degradado es FIJO y lo que se mueve es la `opacity`: interpolar las paradas de un
               `background-image` (vía `transition-all`) obliga a re-rasterizarlo en cada fotograma. */
            className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-pimenton-light/80 to-transparent opacity-0 transition-opacity duration-500 ease-[var(--ease-out-expo)] group-hover:opacity-100"
          />
        )}
      </article>
    </motion.li>
  );
}

export default memo(MenuItemCard);
