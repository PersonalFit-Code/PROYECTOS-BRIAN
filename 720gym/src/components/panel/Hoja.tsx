"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ventana modal del panel (ficha de cliente, cobros, resumen anual…). */
export default function Hoja({ titulo, subtitulo, children, onCerrar, ancha = false }: { titulo: ReactNode; subtitulo?: ReactNode; children: ReactNode; onCerrar: () => void; ancha?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      className={cn(
        "m-0 mt-auto max-h-[92svh] w-full max-w-none overflow-y-auto bg-white p-0 text-negro backdrop:bg-black/60 backdrop:backdrop-blur-[2px] sm:m-auto sm:max-h-[88vh]",
        ancha ? "sm:w-[min(94vw,60rem)]" : "sm:w-[min(94vw,40rem)]",
      )}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/[0.06] bg-white px-5 py-4 sm:px-7">
        <div>
          <h2 className="titular text-[30px] sm:text-[36px]">{titulo}</h2>
          {subtitulo && <div className="mt-1 text-[13px] text-negro/60">{subtitulo}</div>}
        </div>
        <button type="button" onClick={onCerrar} className="grid size-10 shrink-0 place-items-center ring-1 ring-black/10 hover:ring-negro" aria-label="Cerrar">
          <X className="size-5" />
        </button>
      </div>
      <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
    </dialog>
  );
}
