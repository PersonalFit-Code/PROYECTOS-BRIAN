"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { cx } from "@/lib/formato";
import { useCerrarHoja } from "./Hoja";

/** Formulario de Server Action con error visible y reseteo al guardar. Dentro de una Hoja, la cierra al guardar. */
export function FormAccion({ accion, children, className, resetear = true }: { accion: (f: FormData) => Promise<void>; children: ReactNode; className?: string; resetear?: boolean }) {
  const ref = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, start] = useTransition();
  const cerrar = useCerrarHoja();
  return (
    <form
      ref={ref}
      aria-busy={pendiente}
      action={(f) =>
        start(async () => {
          setError(null);
          try {
            await accion(f);
            if (resetear) ref.current?.reset();
            cerrar();
          } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo guardar");
          }
        })
      }
      className={cx(className, pendiente && "opacity-70")}
    >
      {children}
      {error && <p className="col-span-full text-sm text-bad">{error}</p>}
    </form>
  );
}
