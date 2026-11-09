import type { Metadata } from "next";
import Horario from "@/components/secciones/Horario";
import Cierre from "@/components/secciones/Cierre";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Horario de clases y reservas",
  description: "Horario semanal de 720 GYM CLUB en Ourense: Pilates Reformer, Mat, yoga, CrossGym, powerlifting y clubes. Reserva tu plaza online en un toque. Sala abierta 365 días.",
  alternates: { canonical: "/horario" },
};

export default function PaginaHorario() {
  return (
    <>
      <JsonLd datos={migas([["Horario", "/horario"]])} />
      <Horario pagina titulo="Horario de clases" />
      <Cierre />
    </>
  );
}
