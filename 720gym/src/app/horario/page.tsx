import type { Metadata } from "next";
import HorarioSemana from "@/components/secciones/HorarioSemana";
import Cierre from "@/components/secciones/Cierre";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Horarios de todas las actividades",
  description: "Horarios 2026-27 de 720 GYM CLUB en Ourense: gimnasio abierto los 365 días y todas las actividades y clubes del centro.",
  alternates: { canonical: "/horario" },
};

export default function PaginaHorario() {
  return (
    <>
      <JsonLd datos={migas([["Horarios", "/horario"]])} />
      <HorarioSemana />
      <Cierre />
    </>
  );
}
