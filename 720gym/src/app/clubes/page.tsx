import type { Metadata } from "next";
import Clubes from "@/components/secciones/Clubes";
import Cierre from "@/components/secciones/Cierre";
import CintaLogos from "@/components/ui/CintaLogos";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Clubes asociados de 720 GYM CLUB en Ourense",
  description:
    "Clubes que entrenan en 720 GYM CLUB, Ourense: Brazilian Jiu-Jitsu, Krav Maga, Capoeira, gimnasia acrobática y lucha de brazos. Escribe directamente a cada club.",
  alternates: { canonical: "/clubes" },
};

export default function PaginaClubes() {
  return (
    <>
      <JsonLd datos={migas([["Clubes asociados", "/clubes"]])} />
      <Clubes pagina />
      <Cierre />
      <CintaLogos />
    </>
  );
}
