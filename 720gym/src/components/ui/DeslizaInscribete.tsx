"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type PointerEvent as PE } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * «Desliza para inscribirte» (la animación que gustó en Burdin). Se arrastra el tirador hasta el
 * final y lleva a la página de alta. También funciona con un toque o con el teclado (accesible).
 */
export default function DeslizaInscribete({
  href = "/alta",
  texto = "Desliza para inscribirte",
  className,
  tono = "oscuro",
}: {
  href?: string;
  texto?: string;
  className?: string;
  tono?: "oscuro" | "claro";
}) {
  const router = useRouter();
  const pista = useRef<HTMLDivElement>(null);
  const inicio = useRef<{ x: number; max: number } | null>(null);
  const [x, setX] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [hecho, setHecho] = useState(false);
  const [maximo, setMaximo] = useState(1);
  const movido = useRef(false);

  const completar = () => {
    setHecho(true);
    setX(inicio.current?.max ?? (pista.current ? pista.current.clientWidth - 60 : 0));
    window.setTimeout(() => router.push(href), 380);
  };

  const bajar = (e: PE<HTMLButtonElement>) => {
    if (hecho || !pista.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    inicio.current = { x: e.clientX - x, max: pista.current.clientWidth - 60 };
    setMaximo(inicio.current.max);
    movido.current = false;
    setArrastrando(true);
  };
  const mover = (e: PE<HTMLButtonElement>) => {
    if (!inicio.current || hecho) return;
    const nx = Math.min(inicio.current.max, Math.max(0, e.clientX - inicio.current.x));
    if (Math.abs(nx - x) > 3) movido.current = true;
    setX(nx);
  };
  const soltar = () => {
    if (!inicio.current || hecho) return;
    setArrastrando(false);
    if (x > inicio.current.max * 0.82) completar();
    else setX(0);
  };

  const progreso = x / maximo;
  const claro = tono === "claro";

  return (
    <div
      ref={pista}
      className={cn(
        "relative h-15 w-full max-w-md select-none overflow-hidden rounded-full p-1.5",
        "vidrio text-white",
        className,
      )}
    >
      <div
        className={cn("absolute inset-y-1.5 left-1.5 rounded-full", claro ? "bg-white/15" : "bg-white/20")}
        style={{ width: `${x + 48}px`, transition: arrastrando ? "none" : "width .45s cubic-bezier(.16,1,.3,1)" }}
        aria-hidden
      />
      <span
        className="desliza-texto subtitular pointer-events-none absolute inset-0 grid place-items-center pl-12 text-[17px] tracking-[0.06em]"
        style={{ opacity: 1 - progreso * 1.4 }}
        aria-hidden
      >
        {hecho ? "¡Vamos!" : texto}
      </span>
      <button
        type="button"
        onPointerDown={bajar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onClick={() => !movido.current && completar()}
        aria-label={`${texto}: ir a la inscripción`}
        className={cn(
          "relative z-10 grid size-12 cursor-grab touch-none place-items-center rounded-full shadow-lg active:cursor-grabbing",
          claro ? "bg-white text-negro" : "bg-white text-negro",
        )}
        style={{ transform: `translate3d(${x}px,0,0)`, transition: arrastrando ? "none" : "transform .45s cubic-bezier(.16,1,.3,1)" }}
      >
        {hecho ? <Check className="size-5" /> : <ArrowRight className="desliza-flecha size-5" />}
      </button>
    </div>
  );
}
