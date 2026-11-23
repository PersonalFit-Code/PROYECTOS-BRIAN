import type { Metadata } from "next";
import Hero from "@/components/secciones/Hero";
import QueEs720 from "@/components/secciones/QueEs720";
import Galeria from "@/components/secciones/Galeria";
import Instalaciones from "@/components/secciones/Instalaciones";
import Disciplinas from "@/components/secciones/Disciplinas";
import Filosofia from "@/components/secciones/Filosofia";
import Resenas from "@/components/secciones/Resenas";
import Comunidad from "@/components/secciones/Comunidad";
import Cierre from "@/components/secciones/Cierre";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Portada: va contando 720 por apartados, alternando claro y oscuro (el naranja solo en los claros).
 * Las disciplinas se encuentran al bajar, no hay que buscarlas en el menú. Sin precios: las cuotas
 * están al final de cada ficha, como pidió Brais.
 */
export default function Inicio() {
  return (
    <>
      <Hero />
      <QueEs720 />
      <Galeria />
      <Instalaciones />
      <Disciplinas
        id="entrena"
        de={["libre", "plan"]}
        tono="oscuro"
        grande
        etiqueta="Por libre o con un plan"
        titulo="Entrena a tu ritmo, sabiendo qué hacer"
        texto="Un gimnasio de aforo limitado para entrenar con autonomía y, si lo necesitas, un entrenador que te enseña y te deja una planificación clara."
      />
      <Disciplinas
        id="grupos-reducidos"
        de={["grupos"]}
        tono="claro"
        etiqueta="Actividades en grupos reducidos"
        titulo={
          <>
            Grupos pequeños, <span className="resalte">atención cercana</span>
          </>
        }
        texto="Pilates, Hipopresivos, Yoga y CrossGym dirigidos por profesionales especializados, con trabajo adaptado a cada persona."
      />
      <Disciplinas
        id="clubes"
        de={["clubes"]}
        tono="oscuro"
        etiqueta="Clubes y disciplinas"
        titulo="Todo forma parte de 720"
        texto="Cada actividad está dirigida por profesionales especializados, buscando que cada persona entrene con criterio, seguridad y el apoyo adecuado."
      />
      <Filosofia />
      <Resenas />
      <Comunidad resumen />
      <Cierre />
    </>
  );
}
