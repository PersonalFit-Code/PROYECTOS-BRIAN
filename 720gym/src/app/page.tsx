import Hero from "@/components/secciones/Hero";
import Intro from "@/components/secciones/Intro";
import Conceptos from "@/components/secciones/Conceptos";
import Aforo from "@/components/secciones/Aforo";
import Horario from "@/components/secciones/Horario";
import Tarifas from "@/components/secciones/Tarifas";
import Apuntate from "@/components/secciones/Apuntate";
import Equipo from "@/components/secciones/Equipo";
import Historia from "@/components/secciones/Historia";
import Comunidad from "@/components/secciones/Comunidad";
import Clubes from "@/components/secciones/Clubes";
import Preguntas from "@/components/secciones/Preguntas";
import Contacto from "@/components/secciones/Contacto";
import FraseGigante from "@/components/ui/FraseGigante";
import CintaLogos from "@/components/ui/CintaLogos";

export default function Inicio() {
  return (
    <>
      <Hero />
      <Intro />
      <Conceptos />
      <section className="bg-white" aria-label="Lema">
        <FraseGigante frase="Aquí entrenas a tu ritmo, rodeado de gente como tú." className="pt-24 pb-4 sm:pt-32" />
      </section>
      <Aforo />
      <Horario />
      <Tarifas />
      <Apuntate />
      <Equipo />
      <Historia />
      <section className="bg-negro" aria-label="Norma de la casa">
        <FraseGigante frase="Si puedes levantarlo, puedes bajarlo." tono="contorno" sentido={-1} className="pb-24" />
      </section>
      <Comunidad />
      <Clubes />
      <Preguntas />
      <Contacto />
      <CintaLogos />
    </>
  );
}
