import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * LOGOTIPO DE TIXOLA — el de verdad, el de la carta de papel.
 *
 * Hasta esta versión aquí había una sartén dibujada a mano en SVG, inventada durante el desarrollo.
 * Tatiana mandó el logotipo real: una sartén con una ramita de perejil, la palabra "Tixola" escrita
 * a mano y, debajo, "vinoteca - tapería". Un logotipo no se re-teclea, así que se usa su archivo.
 *
 * VIENE PARTIDO EN DOS PIEZAS, y no por capricho. El logotipo impreso es un bloque APILADO —marca
 * arriba, nombre debajo— pensado para la portada de una carta, donde ocupa media hoja. Una cabecera
 * web es una franja de 72 px: metido entero ahí, "vinoteca - tapería" mide cuatro píxeles y la
 * palabra escrita a mano se vuelve un garabato. Separando la sartén del texto se puede montar un
 * bloque HORIZONTAL, que es lo que pide una cabecera, y dejar el apilado para donde hay sitio.
 *
 * Las piezas se sacaron del PNG original por componentes conexos (la sartén y la ramita son un
 * trazo continuo; cada letra, otro), no recortando rectángulos: las cajas de la sartén y del texto
 * se solapan y un recorte recto habría cortado la ramita o comido la "T".
 *
 * De ahí salieron `tixola-mark.png` (la sartén) y `tixola-wordmark.png` (el manuscrito). Aquí solo
 * se usa la primera: el manuscrito suelto no lo pinta ninguna variante, porque donde hay sitio para
 * enseñarlo se usa el logotipo entero. Se guarda igualmente por ser un recorte limpio de la marca,
 * que hace falta fuera de la web (redes, cartelería, la propia carta).
 *
 * QUÉ VARIANTE VA DÓNDE
 *  · `full` (cabecera) — sartén real + TIXOLA en Cinzel. El nombre en tipografía y no manuscrito
 *    **porque a 36 px tiene que LEERSE**: es el nombre del negocio, no un adorno. La sartén sí va
 *    donde iba la sartén, que es lo que pidió el cliente.
 *  · `stacked` (pie) — el logotipo entero tal cual, con el manuscrito y "vinoteca - tapería". Allí
 *    hay sitio para enseñarlo a un tamaño en el que se lee, y es donde la marca se firma.
 *  · `wordmark` — solo TIXOLA en Cinzel.
 *  · `mark` — solo la sartén con la ramita.
 *  · `t` (avatar del chat, 28-40 px) — sartén CREMA SOBRE ROJO, simplificada, la misma que el icono
 *    de la pestaña. A ese tamaño el trazo fino del logotipo real se convierte en una mancha; lo que
 *    sostiene el reconocimiento es la silueta y el rojo lleno, no el detalle.
 */

export type LogoVariant = "full" | "stacked" | "wordmark" | "mark" | "t";
export type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  /**
   * Tamaño responsive por nombre (`sm` 28 px · `md` 36→44 px · `lg` 48→56 px) o altura fija en píxeles.
   * Con un nombre la altura la pone CSS; con un número se fija en píxeles.
   */
  size?: LogoSize | number;
  variant?: LogoVariant;
  className?: string;
  /** `true` cuando el logo es decorativo (p. ej. dentro de un enlace ya etiquetado). */
  decorative?: boolean;
}

const NOMBRE = "Tixola Tapería";

/* Dimensiones reales de cada archivo. Van escritas para que el navegador reserve el hueco antes de
   descargar la imagen: sin esto la cabecera daría un salto en cada carga. */
const ARCHIVOS = {
  mark: { src: "/brand/tixola-mark.png", w: 464, h: 276 },
  stacked: { src: "/brand/tixola-logo.png", w: 578, h: 432 },
} as const;

/** Alturas responsive por nombre. */
const SIZE_CLASS: Record<LogoSize, string> = {
  sm: "h-7",
  md: "h-9 md:h-11",
  lg: "h-12 md:h-14",
};

/* La sartén ocupa toda la altura pedida; la palabra, algo menos, para que su altura de mayúscula
   case con el cuerpo de la sartén y no parezca que flota. */
const ALTURA_PALABRA: Record<LogoSize, string> = {
  sm: "h-5",
  md: "h-6 md:h-7",
  lg: "h-8 md:h-9",
};

const CINZEL = "var(--font-cinzel), 'Cinzel', 'Trajan Pro', Georgia, serif";

/** La sartén real, como imagen. Hereda nada: el archivo ya viene en crema de marca (#f6f4e7). */
function Marca({ clase, altura }: { clase: string; altura?: number }) {
  const { src, w, h } = ARCHIVOS.mark;
  return (
    <Image
      src={src}
      alt=""
      width={altura ? Math.round((altura * w) / h) : w}
      height={altura ?? h}
      priority
      className={cn("w-auto shrink-0 object-contain", clase)}
      style={altura ? { height: altura } : undefined}
    />
  );
}

/**
 * "TIXOLA" en Cinzel, versalitas talladas con tracking amplio. Sigue siendo SVG y no imagen porque
 * es texto: escala sin pesar, hereda `currentColor` y se puede animar. `textLength` fija la anchura
 * para que no salte mientras carga la fuente web.
 */
function Palabra({ clase, altura }: { clase: string; altura?: number }) {
  return (
    <svg
      viewBox="0 0 160 40"
      height={altura}
      width={altura ? Math.round((altura * 160) / 40) : undefined}
      aria-hidden
      className={cn("w-auto shrink-0", clase)}
    >
      <text
        x="4"
        y="30.5"
        fontSize="27"
        fontWeight={600}
        textLength="152"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        style={{ fontFamily: CINZEL, letterSpacing: "0.14em" }}
      >
        TIXOLA
      </text>
    </svg>
  );
}

/**
 * Insignia compacta: sartén crema sobre el rojo de marca, la misma silueta que el icono de la
 * pestaña. Para avatares y huecos de 28-40 px, donde el trazo fino del logotipo real no sobrevive.
 */
function Insignia({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="shrink-0">
      <rect width="64" height="64" rx="14" fill="#9e1618" />
      {/* Elipse + mango en diagonal, como en el logotipo impreso: es una sartén VISTA DE LADO.
          Con un círculo de frente y el mango en horizontal se leía como una diana, no como una
          sartén — a 16 px lo único que queda de un dibujo es su silueta. */}
      <g fill="none" stroke="#f6f4e7" strokeLinecap="round">
        <ellipse cx="25" cy="39" rx="16" ry="12" strokeWidth="4" />
        <path d="M36 30.5 L53 15" strokeWidth="5" />
      </g>
    </svg>
  );
}

export default function Logo({ size = "md", variant = "full", className, decorative = false }: LogoProps) {
  const fijo = typeof size === "number";
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": NOMBRE } as const);

  if (variant === "t") {
    return (
      <span className={cn("inline-flex", className)} {...a11y}>
        <Insignia size={fijo ? size : { sm: 28, md: 40, lg: 56 }[size]} />
      </span>
    );
  }

  if (variant === "stacked") {
    const { src, w, h } = ARCHIVOS.stacked;
    return (
      <Image
        src={src}
        alt={decorative ? "" : NOMBRE}
        width={fijo ? Math.round((size * w) / h) : w}
        height={fijo ? size : h}
        className={cn("w-auto object-contain", !fijo && { sm: "h-16", md: "h-20 md:h-24", lg: "h-24 md:h-28" }[size], className)}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
    );
  }

  const claseAltura = fijo ? "" : SIZE_CLASS[size];
  const clasePalabra = fijo ? "" : ALTURA_PALABRA[size];

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex items-center text-cream", className)} {...a11y}>
        <Marca clase={claseAltura} altura={fijo ? size : undefined} />
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex items-center text-cream", className)} {...a11y}>
        <Palabra clase={claseAltura} altura={fijo ? size : undefined} />
      </span>
    );
  }

  /* `full`: sartén + nombre. El hueco entre los dos es pequeño a propósito — la ramita ya se extiende
     hacia la derecha, así que un margen grande rompería la relación entre la marca y la palabra. */
  return (
    <span className={cn("inline-flex items-center gap-2 text-cream md:gap-2.5", className)} {...a11y}>
      <Marca clase={claseAltura} altura={fijo ? size : undefined} />
      <Palabra clase={clasePalabra} altura={fijo ? Math.round(size * 0.66) : undefined} />
    </span>
  );
}

/** Atajo: insignia compacta (mismo API que `<Logo variant="t" />`). */
export function TMark({ size = "sm", className, decorative = true }: Omit<LogoProps, "variant">) {
  return <Logo variant="t" size={size} className={className} decorative={decorative} />;
}
