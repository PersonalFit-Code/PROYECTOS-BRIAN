import type { Metadata } from "next";
import { CalendarClock, Euro, Images, Sparkles, Users } from "lucide-react";
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
import PlegableMovil from "@/components/ui/PlegableMovil";
import FranjaCta from "@/components/ui/FranjaCta";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Portada: el hero limpio a pantalla completa y, debajo, en el móvil cada apartado es una barra
 * que se despliega (menos scroll, más sencillo); en escritorio se ve todo abierto. Entre medias,
 * franjas de acción para que siempre haya a mano «Inscríbete» y WhatsApp.
 */
export default function Inicio() {
  return (
    <>
      <Hero />
      <PlegableMovil titulo="Por qué 720" resumen="Aforo limitado y abierto los 365 días" icono={<Sparkles className="size-5" aria-hidden />}>
        <PorQue />
      </PlegableMovil>
      <PlegableMovil titulo="La sala por dentro" resumen="Racks, peso libre, zona funcional" icono={<Images className="size-5" aria-hidden />}>
        <Linea />
        <Galeria />
      </PlegableMovil>
      <FranjaCta frase="¿Te ves entrenando aquí?" detalle="Date de alta en un minuto o prueba antes una clase gratis." />
      <Linea />
      <Indice />
      <Linea />
      <PlegableMovil titulo="Clases de hoy" resumen="Reserva tu plaza en un toque" icono={<CalendarClock className="size-5" aria-hidden />}>
        <ClasesHoy />
      </PlegableMovil>
      <PlegableMovil titulo="Tarifas" resumen="Desde 35 €/mes · elige tu plan" icono={<Euro className="size-5" aria-hidden />}>
        <TarifasDestacadas />
      </PlegableMovil>
      <FranjaCta frase="Aforo limitado: asegura tu plaza" detalle="Pocas personas por franja, a propósito. Entra antes de que se llene." boton="Quiero mi plaza" clara />
      <PlegableMovil titulo="Comunidad" resumen="Clubes y gente que tira de ti" icono={<Users className="size-5" aria-hidden />}>
        <Comunidad resumen />
      </PlegableMovil>
      <Cierre />
      <CintaLogos />
    </>
  );
}
