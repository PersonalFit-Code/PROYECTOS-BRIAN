import type { Metadata } from "next";
import Hero from "@/components/secciones/Hero";
import PorQue from "@/components/secciones/PorQue";
import Indice from "@/components/secciones/Indice";
import { ClasesHoy } from "@/components/secciones/Horario";
import TarifasDestacadas from "@/components/secciones/TarifasDestacadas";
import Comunidad from "@/components/secciones/Comunidad";
import Cierre from "@/components/secciones/Cierre";
import Ticker from "@/components/ui/Ticker";
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
      <div className="border-y border-white/10 bg-negro py-4">
        <Ticker frases={["Aforo limitado", "Abierto 365 días", "Pilates Reformer", "5,0 en Google", "Primera clase gratis", "Entrada diaria 5 €", "Sin matrícula en Pilates"]} />
      </div>
      <PorQue />
      <Indice />
      <ClasesHoy />
      <TarifasDestacadas />
      <Comunidad resumen />
      <Cierre />
      <CintaLogos />
    </>
  );
}
