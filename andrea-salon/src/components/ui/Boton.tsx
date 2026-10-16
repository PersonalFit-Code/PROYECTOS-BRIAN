"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * El botón de la casa. Tres variantes y nada más:
 *  · `primario`: grafito macizo con texto blanco. UNA por pantalla, que es la acción que importa
 *    (casi siempre «Reservar cita»).
 *  · `secundario`: transparente con borde grafito fino. Para la segunda acción (ver servicios,
 *    WhatsApp).
 *  · `fantasma`: solo texto, para enlaces discretos dentro de tarjetas.
 *
 * Renderiza <a> (next/link) si recibe `href`, si no <button>. Las URL absolutas, `tel:` y `mailto:`
 * van en un <a> normal: `next/link` no tiene nada que prefetchar ahí y `urlFor("reservar")` puede
 * apuntar a otro subdominio.
 *
 * MOVIMIENTO con framer-motion: `whileTap` hunde el botón (0,96) y `whileHover` lo levanta 2 px.
 * `useReducedMotion` lo apaga todo —no se anima ni hover ni tap— porque la preferencia del sistema
 * manda sobre el gusto del diseño. Sin `will-change`: la web tiene una decena de CTAs y promoverlos
 * todos a capa propia gasta memoria de GPU para un hover.
 */
type Variant = "primario" | "secundario" | "fantasma";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

/* Se quitan los manejadores de arrastre y de animación del DOM: framer-motion define `onDrag*` y
   `onAnimation*` con otra firma (eventos de puntero + `PanInfo`) y los dos tipos chocan. Nadie los
   usa en un botón. */
type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"> & { href?: undefined };
type AnchorProps = BaseProps & { href: string; target?: string; rel?: string; onClick?: () => void; "aria-label"?: string; title?: string };
export type BotonProps = ButtonProps | AnchorProps;

/* Línea editorial: rectángulo de esquina casi recta, mayúscula espaciada, sin brillo ni sombra de
   color. La transición se ACOTA a la lista explícita: pulsar responde en 100 ms, el hover en 320.
   `active:` queda para quien no tenga JS: framer pone el mismo hundido. */
const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-[2px] text-center font-sans font-medium uppercase tracking-[0.18em] leading-snug transition-[background-color,border-color,box-shadow,color,opacity] duration-[var(--dur-morph)] ease-[var(--ease-muelle)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carmin focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primario: "bg-grafito text-white border border-grafito hover:bg-carmin-oscuro hover:border-carmin-oscuro",
  secundario: "bg-transparent text-grafito border border-grafito/70 hover:bg-grafito hover:text-white hover:border-grafito",
  fantasma: "bg-transparent text-grafito border border-transparent underline decoration-nude decoration-1 underline-offset-[6px] hover:decoration-grafito",
};

/* `min-h-*` + padding vertical en vez de `h-*` fija: si la etiqueta salta a dos líneas en un móvil
   de 320 px, el botón crece en vez de dejar el texto desbordando por fuera del borde. */
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 py-1.5 text-[11px]",
  md: "min-h-12 px-7 py-2 text-[12px]",
  lg: "min-h-14 px-9 py-2.5 text-[13px]",
};

const MotionLink = motion.create(Link);

const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(props, ref) {
  const { variant = "primario", size = "md", icon, iconRight, className, children, ...rest } = props;
  const reduced = useReducedMotion() ?? false;
  const classes = cn(base, variants[variant], sizes[size], className);
  /* Con movimiento reducido no hay gesto ninguno: ni hover ni tap. */
  const gesture = reduced
    ? {}
    : {
        whileTap: { scale: 0.98 },
        transition: { type: "spring" as const, stiffness: 520, damping: 30, mass: 0.6 },
      };

  const content = (
    <>
      {icon && <span className="relative -ml-1 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
      <span className="relative">{children}</span>
      {iconRight && (
        <span className="relative -mr-1 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 [&>svg]:h-5 [&>svg]:w-5">
          {iconRight}
        </span>
      )}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, target, rel, onClick, ...aria } = rest as AnchorProps;
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      return (
        <motion.a
          href={href}
          target={target}
          rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
          onClick={onClick}
          className={classes}
          {...gesture}
          {...aria}
        >
          {content}
        </motion.a>
      );
    }
    return (
      <MotionLink href={href} onClick={onClick} className={classes} {...gesture} {...aria}>
        {content}
      </MotionLink>
    );
  }

  const { type = "button", ...btn } = rest as ButtonProps;
  return (
    <motion.button ref={ref} type={type} className={classes} {...gesture} {...btn}>
      {content}
    </motion.button>
  );
});

export default Boton;
