import type { Metadata } from "next";
import Tarifas from "@/components/secciones/Tarifas";
import Cierre from "@/components/secciones/Cierre";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Tarifas del gimnasio, Pilates y entrenador personal",
  description: "Tarifas 2025-26 de 720 GYM CLUB en Ourense: gimnasio libre 35 €/mes, entrada diaria 5 €, bonos de entrenamiento personal y 720 Pilates desde 35 €/mes. Alta online.",
  alternates: { canonical: "/tarifas" },
};

export default function PaginaTarifas() {
  return (
    <>
      <JsonLd datos={migas([["Tarifas", "/tarifas"]])} />
      <Tarifas pagina />
      <Cierre />
    </>
  );
}
