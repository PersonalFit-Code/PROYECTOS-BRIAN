"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Boton } from "./basicos";

const CerrarHoja = createContext<() => void>(() => {});

/** Dentro de una Hoja: función para cerrarla (p. ej. tras guardar un formulario). */
export function useCerrarHoja() {
  return useContext(CerrarHoja);
}

/**
 * Hoja de cristal: sube desde abajo en el móvil y aparece centrada en el ordenador. Los formularios
 * ("Nuevo hábito", "Añadir cuenta"…) viven aquí para que la página quede limpia.
 */
export function Hoja({
  titulo,
  boton,
  icono,
  variante = "primario",
  children,
  claseBoton,
  etiqueta,
}: {
  titulo: string;
  boton: ReactNode;
  icono?: ReactNode;
  variante?: "primario" | "suave" | "fantasma";
  children: ReactNode;
  claseBoton?: string;
  /** nombre accesible si el botón es solo un icono */
  etiqueta?: string;
}) {
  const [abierta, setAbierta] = useState(false);
  // true solo en el navegador (el portal necesita document.body)
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!abierta) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    document.addEventListener("keydown", cerrar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", cerrar);
      document.body.style.overflow = overflow;
    };
  }, [abierta]);

  return (
    <>
      <Boton type="button" variante={variante} onClick={() => setAbierta(true)} className={claseBoton} aria-label={etiqueta}>
        {icono && <span className="[&_svg]:size-4">{icono}</span>}
        {boton}
      </Boton>
      {montado &&
        createPortal(
          <AnimatePresence>
            {abierta && (
              <motion.div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setAbierta(false)} />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={titulo}
                  className="glass-strong pb-safe relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 md:rounded-3xl"
                  initial={{ y: 60, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 60, opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                >
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-faint/50 md:hidden" />
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">{titulo}</h2>
                    <button aria-label="Cerrar" onClick={() => setAbierta(false)} className="rounded-full p-1.5 text-muted transition hover:bg-hover">
                      <X className="size-5" />
                    </button>
                  </div>
                  <CerrarHoja.Provider value={() => setAbierta(false)}>{children}</CerrarHoja.Provider>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
