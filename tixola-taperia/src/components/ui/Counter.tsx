"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
  /** Duración del giro de cada rodillo en segundos. */
  duration?: number;
  /** Retardo antes de empezar (s) — útil para escalonar varios contadores. */
  delay?: number;
  className?: string;
  /** Clases para prefijo/sufijo (más pequeños y rojos por defecto). */
  affixClassName?: string;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** El valor nunca cambia por su cuenta, así que no hay a qué suscribirse: `useSyncExternalStore` solo
 *  se usa aquí para distinguir el render del servidor del del navegador sin tocar estado en un efecto. */
const suscripcionVacia = () => () => {};

/** Retardo (s) que se añade por cada cifra hacia la derecha: el número cae en cascada, no de golpe. */
const CASCADA = 0.05;

/**
 * La tira de un rodillo: 0-9 DOS VECES. Con una sola vuelta el dígito se desliza de 0 a su destino y
 * ya; con dos, da una vuelta entera antes de asentarse, que es lo que hace que parezca un contador
 * mecánico y no un texto que se mueve. Veinte celdas → cada una ocupa el 5 % de la tira.
 */
const TIRA = [...Array(20).keys()].map((i) => i % 10);
const PASO = 100 / TIRA.length;

/**
 * Cifra grande que CAE COMO UN ODÓMETRO la primera vez que entra en el viewport: cada dígito es un
 * rodillo que gira una vuelta completa y se detiene en su número, en cascada de izquierda a derecha.
 *
 * POR QUÉ UN RODILLO Y NO UNA CUENTA. Antes el número contaba de 0 al valor final reescribiendo el
 * texto en cada fotograma. Funcionaba, pero "850" contando se lee como un número nervioso; el rodillo
 * se lee como un dato que aterriza. Y de paso sale más barato: la cuenta tocaba el contenido del nodo
 * (y con él el layout) sesenta veces por segundo en cuatro contadores a la vez; esto es un `transform`
 * por dígito, que lo lleva el compositor.
 *
 * TRES DETALLES QUE NO SE VEN PERO SOSTIENEN EL EFECTO:
 *  · Al terminar, cada rodillo se SUSTITUYE por su dígito suelto. No es un adorno: la ventana del
 *    rodillo necesita `overflow: hidden` para esconder los otros nueve números, y ese recorte se
 *    comería también la extrusión `text-3d` y el halo rojo, que caen por debajo del glifo. Con el
 *    cambio, el número en reposo —que es el que se mira— luce entero.
 *  · Los dígitos van en `tabular-nums`: sin eso cada ventana mediría distinto y la cifra bailaría.
 *  · Lo que NO es un dígito (la coma de "4,4", un espacio) no gira: se queda quieto en su sitio.
 *
 * Con `prefers-reduced-motion` no hay rodillos: el valor final, quieto, desde el primer pintado.
 * El número animado va `aria-hidden` y el valor final viaja aparte para los lectores de pantalla.
 */
export default function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 0.95,
  delay = 0,
  className,
  affixClassName,
}: CounterProps) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduced = useReducedMotion();

  /* El texto final sale del Intl del idioma activo, igual en servidor y en cliente (el locale viene
     del contexto, no del navegador), así que la hidratación no encuentra nada distinto. */
  const finalText = useMemo(() => formatNumber(value, locale, { decimals }), [value, locale, decimals]);
  const caracteres = useMemo(() => [...finalText], [finalText]);

  /* Cuándo se cambian los rodillos por los dígitos sueltos: el último en salir manda. */
  const [asentado, setAsentado] = useState(false);

  /* EL SERVIDOR PINTA EL NÚMERO FINAL, NO LOS RODILLOS, y esto no es un detalle de estilo: el HTML del
     servidor no sabe si quien mira pidió menos movimiento, así que si pintara los rodillos (veinte
     dígitos por celda) y el navegador decidiera luego pintar la cifra suelta, React encontraría un
     texto distinto al hidratar y lo cantaría como error. Pintando siempre el valor final, los dos
     lados coinciden; los rodillos se montan después, ya en el navegador.
     `useSyncExternalStore` y no un `useState` en un efecto: React usa la instantánea del servidor
     durante la hidratación, así que el cambio ocurre en el momento exacto en que es seguro. */
  const enCliente = useSyncExternalStore(suscripcionVacia, () => true, () => false);
  const quieto = !enCliente || reduced || asentado;

  useEffect(() => {
    if (!inView || !enCliente || reduced || asentado) return;
    const ultimo = caracteres.reduce((acc, c, i) => (/\d/.test(c) ? i : acc), 0);
    const total = (delay + ultimo * CASCADA + duration) * 1000;
    const t = window.setTimeout(() => setAsentado(true), total);
    return () => window.clearTimeout(t);
  }, [inView, enCliente, reduced, asentado, caracteres, delay, duration]);

  return (
    <span
      ref={ref}
      className={cn(
        /* `items-end` y no `items-baseline`: la ventana de un rodillo lleva `overflow: hidden`, y la
           línea base de una caja recortada es su borde inferior, no la de su texto. Alineando por abajo
           cajas que miden todas 1em, los glifos caen en el mismo sitio sin depender de esa regla. */
        "inline-flex items-end font-condensed leading-none tracking-wide tabular-nums text-cream",
        /* La extrusión y el halo, al asentarse: ver el porqué en el comentario del componente. */
        quieto && "text-3d drop-shadow-[0_0_22px_rgba(232,86,90,0.55)]",
        "transition-[filter] duration-700 ease-[var(--ease-out-expo)]",
        className,
      )}
    >
      {/* Lectores de pantalla: valor final estático */}
      <span className="sr-only">
        {prefix}
        {finalText}
        {suffix}
      </span>

      <span aria-hidden className="inline-flex items-end">
        {prefix && <span className={cn("mr-[0.08em] text-[0.55em] text-pimenton-light", affixClassName)}>{prefix}</span>}

        {caracteres.map((c, i) => {
          /* Lo que no es dígito (la coma de "4,4") no gira, pero mide lo mismo que los rodillos para
             que la fila siga cuadrando. */
          if (!/\d/.test(c)) {
            return (
              <span key={`${i}-${c}`} className="block h-[1em] leading-none">
                {c}
              </span>
            );
          }
          if (quieto) {
            return (
              <span key={`${i}-${c}`} className="block h-[1em] leading-none">
                {c}
              </span>
            );
          }
          const destino = TIRA.length / 2 + Number(c); // una vuelta entera y a su número
          return (
            <span key={`${i}-${c}`} className="rodillo block h-[1em] overflow-hidden">
              <motion.span
                className="flex flex-col"
                initial={{ y: "0%" }}
                animate={{ y: inView ? `-${destino * PASO}%` : "0%" }}
                transition={{ duration, delay: delay + i * CASCADA, ease: EASE_OUT_EXPO }}
              >
                {TIRA.map((d, j) => (
                  <span key={j} className="block h-[1em] leading-none">
                    {d}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}

        {suffix && <span className={cn("ml-[0.06em] text-[0.55em] text-pimenton-light", affixClassName)}>{suffix}</span>}
      </span>
    </span>
  );
}
