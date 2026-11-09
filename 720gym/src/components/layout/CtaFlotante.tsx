"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Escritorio: al pasar la portada aparece abajo a la izquierda una píldora para inscribirse
 * (en el móvil ya está el «+» de la barra fija). Se oculta en el alta, el panel y la clase gratis.
 */
export default function CtaFlotante() {
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mirar = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, []);
  if (ruta.startsWith("/alta") || ruta.startsWith("/panel")) return null;
  return (
    <Link
      href="/alta"
      className={cn(
        "cta-flotante vidrio-fuerte group fixed bottom-6 left-6 z-40 hidden items-center gap-3 rounded-full py-2 pr-5 pl-2 text-white transition-all duration-500 lg:flex",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <span className="grid size-10 place-items-center rounded-full bg-white text-negro transition group-hover:rotate-12">
        <Sparkles className="size-[18px]" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="subtitular block text-[15px]">Inscríbete hoy</span>
        <span className="block text-[12px] text-white/65">Desde 35 €/mes · plazas limitadas</span>
      </span>
      <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
