"use client";

import { useState, useTransition } from "react";
import { guardarVision } from "@/app/(app)/metas/acciones";

/** Visión del área, escrita en presente ("Soy…", "Tengo…"). Se guarda al salir del cuadro. */
export function Vision({ areaId, inicial }: { areaId: string; inicial: string | null }) {
  const [texto, setTexto] = useState(inicial ?? "");
  const [, start] = useTransition();
  return (
    <textarea
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => texto !== (inicial ?? "") && start(() => guardarVision(areaId, texto))}
      rows={2}
      placeholder="Mi visión en presente: «Tengo un cuerpo fuerte y entreno 4 días por semana…»"
      className="w-full resize-none rounded-md bg-transparent px-1 py-1 text-sm italic text-muted outline-none placeholder:text-faint hover:bg-hover focus:bg-hover"
    />
  );
}
