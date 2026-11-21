"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { claseBoton } from "@/components/ui";

const CLAVE = "oficina-quieta";
const AVISO = "oficina-quieta-cambio";

function suscribir(aviso: () => void) {
  window.addEventListener(AVISO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(AVISO, aviso);
    window.removeEventListener("storage", aviso);
  };
}
const leer = () => window.localStorage.getItem(CLAVE) === "1";

/** Botón para parar las animaciones de la oficina. La elección se recuerda en este navegador. */
export function PausaMovimiento() {
  const quieta = useSyncExternalStore(suscribir, leer, () => false);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-oficina-quieta", quieta);
  }, [quieta]);

  function cambiar() {
    window.localStorage.setItem(CLAVE, quieta ? "0" : "1");
    window.dispatchEvent(new Event(AVISO));
  }

  return (
    <button type="button" onClick={cambiar} className={claseBoton("suave")}>
      {quieta ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
      {quieta ? "Reanudar animación" : "Parar animación"}
    </button>
  );
}
