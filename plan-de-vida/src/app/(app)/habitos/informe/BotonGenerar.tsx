"use client";

import { Sparkles } from "lucide-react";
import { useTransition } from "react";
import { Boton } from "@/components/ui/basicos";
import { generarInforme } from "./acciones";

export function BotonGenerar({ mes, hay }: { mes: string; hay: boolean }) {
  const [pendiente, start] = useTransition();
  return (
    <Boton variante={hay ? "suave" : "primario"} disabled={pendiente} onClick={() => start(() => generarInforme(mes))}>
      <Sparkles className="size-4" />
      {pendiente ? "El coach está analizando…" : hay ? "Regenerar ideas" : "Pedir ideas al coach"}
    </Boton>
  );
}
