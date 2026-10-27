"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Correccion, Modo } from "@/lib/progreso";
import type { Errores } from "@/lib/test";

/* El test se monta solo en el navegador: baraja al azar y lee el progreso de
   localStorage, dos cosas que no pueden salir iguales en el servidor. */
const Test = dynamic(() => import("@/components/Test"), {
  ssr: false,
  loading: () => <p className="py-20 text-center text-tinta-suave">Preparando el test…</p>,
});

export default function TestCliente(props: { modo: Modo; temaId?: string; correccion: Correccion; errores: Errores }) {
  /* Cambiar la ronda vuelve a montar el test: preguntas nuevas, todo a cero. */
  const [ronda, setRonda] = useState(0);
  return <Test key={ronda} {...props} onRepetir={() => setRonda((r) => r + 1)} />;
}
