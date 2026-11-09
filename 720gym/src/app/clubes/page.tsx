import type { Metadata } from "next";
import Clubes from "@/components/secciones/Clubes";
import Cierre from "@/components/secciones/Cierre";
import CintaLogos from "@/components/ui/CintaLogos";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Clubes y alquiler de espacios en Ourense",
  description:
    "Gimnasia acrobática, capoeira, jiu-jitsu brasileño y halterofilia en 720 GYM CLUB, Ourense. Con 720P alquilas sala para tus clases, talleres o eventos.",
  alternates: { canonical: "/clubes" },
};

export default function PaginaClubes() {
  return (
    <>
      <JsonLd datos={migas([["Clubes y 720P", "/clubes"]])} />
      <Clubes pagina />
      <Cierre />
      <CintaLogos />
    </>
  );
}
