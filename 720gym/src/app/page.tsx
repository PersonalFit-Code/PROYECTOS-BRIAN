import type { Metadata } from "next";
import Hero from "@/components/secciones/Hero";
import PorQue from "@/components/secciones/PorQue";
import Indice from "@/components/secciones/Indice";
import Galeria from "@/components/secciones/Galeria";
import { ClasesHoy } from "@/components/secciones/Horario";
import TarifasDestacadas from "@/components/secciones/TarifasDestacadas";
import Comunidad from "@/components/secciones/Comunidad";
import Cierre from "@/components/secciones/Cierre";
import Linea from "@/components/ui/Linea";
import CintaLogos from "@/components/ui/CintaLogos";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Portada v3, corta (Brian: «en móvil se ve muy cansino tanto scroll»): lo esencial y un índice;
 * cada apartado tiene su página (horario, tarifas, el club, conceptos, clase gratis, contacto).
 */
export default function Inicio() {
  return (
    <>
      <Hero />
      <PorQue />
      <Linea />
      <Galeria />
      <Linea />
      <Indice />
      <Linea />
      <ClasesHoy />
      <TarifasDestacadas />
      <Comunidad resumen />
      <Cierre />
      <CintaLogos />
    </>
  );
}
