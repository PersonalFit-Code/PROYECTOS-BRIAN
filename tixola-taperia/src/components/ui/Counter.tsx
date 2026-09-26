"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { formatNumber } from "@/lib/format";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export interface CounterProps {
  /** Valor final (admite decimales: 4.4). */
  value: number;
  /** Nº de decimales a mostrar (formato del idioma activo: "4,4" en es/gl/pt, "4.4" en en). */
  decimals?: number;
  /** Texto antes del número ("Nº "). */
  prefix?: string;
  /** Texto después del número ("+", " / 5", "º"). */
  suffix?: string;
  /** Duración de la cuenta en segundos. */
  duration?: number;
  /** Retardo antes de empezar (s) — útil para escalonar varios contadores. */
  delay?: number;
  className?: string;
  /** Clases para prefijo/sufijo (más pequeños y rojos por defecto). */
  affixClassName?: string;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Número que "cuenta" desde 0 hasta `value` la primera vez que entra en el viewport.
 *  - Dígitos enormes en Bebas Neue con extrusión `text-3d` y halo rojo pimentón.
 *  - La animación escribe en un MotionValue: framer actualiza el texto sin re-renderizar React.
 *  - Formato numérico con el Intl del idioma activo (igual en servidor y cliente: sale del contexto).
 *  - Con `prefers-reduced-motion` muestra el valor final directamente.
 *  - Accesible: el valor final siempre está disponible para lectores de pantalla (sr-only),
 *    mientras el número animado queda `aria-hidden`.
 */
export default function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2.2,
  delay = 0,
  className,
  affixClassName,
}: CounterProps) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduced = useReducedMotion();

  const formatter = useMemo(
    () => ({ format: (n: number) => formatNumber(n, locale, { decimals }) }),
    [locale, decimals],
  );

  const progress = useMotionValue(0);
  const text = useTransform(progress, (v) => formatter.format(v));
  const finalText = formatter.format(value);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      progress.jump(value);
      return;
    }
    const controls = animate(progress, value, { duration, delay, ease: EASE_OUT_EXPO });
    return () => controls.stop();
  }, [inView, reduced, value, duration, delay, progress]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-baseline font-condensed leading-none tracking-wide text-cream text-3d",
        "drop-shadow-[0_0_22px_rgba(216,50,60,0.55)]",
        className,
      )}
    >
      {/* Lectores de pantalla: valor final estático */}
      <span className="sr-only">
        {prefix}
        {finalText}
        {suffix}
      </span>

      <span aria-hidden className="inline-flex items-baseline">
        {prefix && <span className={cn("mr-[0.08em] text-[0.55em] text-pimenton-light", affixClassName)}>{prefix}</span>}
        {/* Ancho mínimo en "em" para que la cifra no baile mientras cuenta */}
        <motion.span className="tabular-nums" style={{ minWidth: `${finalText.length * 0.62}em` }}>
          {text}
        </motion.span>
        {suffix && <span className={cn("ml-[0.06em] text-[0.55em] text-pimenton-light", affixClassName)}>{suffix}</span>}
      </span>
    </span>
  );
}
