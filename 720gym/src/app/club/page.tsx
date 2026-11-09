import type { Metadata } from "next";
import Intro from "@/components/secciones/Intro";
import Aforo from "@/components/secciones/Aforo";
import Equipo from "@/components/secciones/Equipo";
import Historia from "@/components/secciones/Historia";
import Comunidad from "@/components/secciones/Comunidad";
import Cierre from "@/components/secciones/Cierre";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "El club: equipo, historia y comunidad",
  description: "Conoce 720 GYM CLUB en Ourense: más de 1.000 m², aforo limitado, el equipo (Brais, Bea y Pablo), la historia de «Aquí no había nada» y una comunidad con 5,0 en Google.",
  alternates: { canonical: "/club" },
};

export default function PaginaClub() {
  return (
    <>
      <JsonLd datos={migas([["El club", "/club"]])} />
      <Intro pagina />
      <Aforo />
      <Equipo />
      <Historia />
      <Comunidad />
      <Cierre />
    </>
  );
}
