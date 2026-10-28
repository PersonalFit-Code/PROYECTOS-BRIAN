"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cx } from "@/lib/formato";
import { Icono, ICONOS } from "./iconos";

/** Botón que muestra el icono elegido y despliega la cuadrícula para cambiarlo. Viaja en el formulario como `name`. */
export function SelectorIcono({ name, inicial = "check" }: { name: string; inicial?: string }) {
  const [valor, setValor] = useState(ICONOS[inicial] ? inicial : "circle");
  const [abierto, setAbierto] = useState(false);
  return (
    <div>
      <input type="hidden" name={name} value={valor} />
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-line bg-bg/70 px-3 py-2 text-sm transition hover:border-accent"
        aria-expanded={abierto}
        aria-label={`Icono: ${ICONOS[valor]?.nombre}. Cambiar`}
      >
        <span className="grid size-6 place-items-center rounded-lg bg-accent/15 text-accent">
          <Icono nombre={valor} />
        </span>
        <span className="flex-1 text-left">{ICONOS[valor]?.nombre}</span>
        <span className="text-xs text-muted">{abierto ? "Cerrar" : "Cambiar"}</span>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 grid grid-cols-7 gap-1.5 sm:grid-cols-9">
              {Object.entries(ICONOS).map(([clave, { nombre }]) => (
                <button
                  key={clave}
                  type="button"
                  title={nombre}
                  aria-label={nombre}
                  onClick={() => {
                    setValor(clave);
                    setAbierto(false);
                  }}
                  className={cx("grid aspect-square place-items-center rounded-xl transition hover:bg-hover", valor === clave ? "bg-accent text-accent-fg" : "text-muted")}
                >
                  <Icono nombre={clave} className="size-4.5" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
