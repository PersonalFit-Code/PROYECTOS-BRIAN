"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cifra que cuenta desde 0 al entrar en pantalla (como en Burdin): +1.000 m², 365 días, 5,0 ★.
 * Con «reducir movimiento» muestra el valor final directamente.
 */
export default function Contador({
  hasta,
  decimales = 0,
  prefijo = "",
  sufijo = "",
  duracion = 1600,
  className,
}: {
  hasta: number;
  decimales?: number;
  prefijo?: string;
  sufijo?: string;
  duracion?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setValor(hasta), 0);
      return () => window.clearTimeout(t);
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const inicio = performance.now();
        const paso = (t: number) => {
          const p = Math.min(1, (t - inicio) / duracion);
          const suave = 1 - Math.pow(1 - p, 4);
          setValor(hasta * suave);
          if (p < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [hasta, duracion]);

  const texto = valor.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales, useGrouping: true });
  const final = hasta.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales, useGrouping: true });
  return (
    <span ref={ref} className={className} aria-label={`${prefijo}${final}${sufijo}`}>
      <span aria-hidden>
        {prefijo}
        {texto}
        {sufijo}
      </span>
    </span>
  );
}
