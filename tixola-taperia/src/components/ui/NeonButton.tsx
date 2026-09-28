"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "cream";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  pulse?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = BaseProps & { href: string; target?: string; rel?: string; onClick?: () => void; "aria-label"?: string };
export type NeonButtonProps = ButtonProps | AnchorProps;

/* Sin `will-change-transform`: la web tiene una decena larga de CTAs y promocionarlos todos a su
   propia capa de composición durante toda la sesión gasta memoria de GPU sin necesidad — solo se
   mueven en `hover`, con una transición que el navegador ya compone bien.
 *
 * La transición se ACOTA a la lista explícita (antes `transition-all`, que gobernaba también el
 * `active:`, así que el hundido de la pulsación tardaba 300 ms en notarse) y `active:duration-100`
 * separa la realimentación del dedo del resto: pulsar responde en 100 ms, el hover en 200. */
const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full text-center font-sans font-semibold leading-snug tracking-wide transition-[translate,scale,background-color,border-color,box-shadow,color,opacity] duration-200 active:duration-100 ease-[var(--ease-out-expo)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-iron disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-pimenton text-cream border border-pimenton-light/60 hover:bg-pimenton-light hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(216,50,60,0.75)] active:translate-y-0",
  ghost: "bg-transparent text-cream hover:bg-cream/10 border border-transparent",
  /* Sin `backdrop-blur`: el CTA secundario de la portada vive sobre capas que respiran en bucle (halo
     de calor, vaho), y el desenfoque del fondo habría que recalcularlo con cada fotograma de ellas. */
  outline:
    "bg-transparent text-cream border border-cream/30 hover:border-cream/70 hover:bg-cream/5 hover:-translate-y-0.5",
  cream: "bg-cream text-iron border border-cream hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(249,246,240,0.35)]",
};

/* `min-h-*` + padding vertical en vez de `h-*` fija: con una sola línea el botón mide exactamente
   lo mismo que antes (40/48/56 px), pero si la etiqueta no cabe y salta a dos líneas (el "Llamar al
   646 45 72 74" en una columna estrecha o en un móvil de 320 px), la píldora crece en vez de dejar
   el texto desbordando por fuera del borde redondeado. */
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 py-1.5 text-sm",
  md: "min-h-12 px-6 py-2 text-[15px]",
  lg: "min-h-14 px-8 py-2.5 text-base md:text-lg",
};

/**
 * Botón CTA con "pulso neón rojo" (variant="primary" pulse).
 * Renderiza <a> (next/link) si recibe `href`, si no <button>.
 */
const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(function NeonButton(props, ref) {
  const { variant = "primary", size = "md", pulse = false, icon, iconRight, className, children, ...rest } = props;
  const glow = pulse && variant === "primary";
  const classes = cn(base, variants[variant], sizes[size], className);

  const content = (
    <>
      {/* Pulso neón: resplandor ESTÁTICO en una capa aparte cuya `opacity` late. Animar el
          `box-shadow` del propio botón repintaría la capa en cada fotograma, sin fin. */}
      {glow && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-neon animate-neon-pulse" />}
      {/* brillo interior deslizante */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        {/* El brillo se desplaza con `translate`, no con `left`: `left` es MAQUETA y cada fotograma
            obligaba a recalcular la posición y a repintar el botón entero con su recorte redondeado.
            Además 700 ms SIN curva expo se perciben enteros; 500 ms con `ease-out` ya cuentan lo
            mismo. Mismo efecto visual, cero trabajo de maqueta. */}
        <span className="absolute -inset-y-2 left-0 w-1/2 -translate-x-full rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[translate,opacity] duration-500 ease-out group-hover:translate-x-[250%] group-hover:opacity-100" />
      </span>
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
        <a href={href} target={target} rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)} onClick={onClick} className={classes} {...aria}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} className={classes} {...aria}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...btn } = rest as ButtonProps;
  return (
    <button ref={ref} type={type} className={classes} {...btn}>
      {content}
    </button>
  );
});

export default NeonButton;
