import { CalendarDays, Users, HeartHandshake, Building2 } from "lucide-react";
import Collage from "@/components/ui/Collage";

const iconos = [
  { Icono: CalendarDays, titulo: "365 días", texto: "Abierto todos los días del año, festivos incluidos." },
  { Icono: Users, titulo: "Socios limitados", texto: "Los justos para disfrutar del material sin esperas." },
  { Icono: HeartHandshake, titulo: "Entorno familiar", texto: "Todas las edades, sin competitividad tóxica." },
  { Icono: Building2, titulo: "Espacio para tu club", texto: "Clubes, talleres y profesionales entrenan aquí." },
];

/** Por qué aforo limitado: su propio texto del dosier, collage espejo e iconos. */
export default function Aforo() {
  return (
    <section className="bg-white py-24 text-negro sm:py-32 lg:py-40" aria-labelledby="titulo-aforo">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <Collage
            tono="claro"
            espejo
            fotos={[
              { descripcion: "Socia entrenando sola y tranquila en la sala, sin nadie esperando" },
              { descripcion: "Fachada o entrada de 720 en la calle Río Bibei" },
            ]}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6 lg:pl-10">
          <p data-reveal className="etiqueta text-negro/50">
            Aforo limitado, ¿por qué?
          </p>
          <h2 id="titulo-aforo" data-reveal className="mt-6">
            <span className="titular block text-[clamp(2.1rem,3.6vw,3.1rem)]">Exclusivo</span>
            <span className="subtitular mt-1 block text-[clamp(1.05rem,1.6vw,1.3rem)] text-negro/55">y privado. Para ti.</span>
          </h2>
          <div data-reveal className="mt-8 max-w-xl space-y-5 text-[17px] leading-relaxed text-negro/75">
            <p>
              <strong className="font-semibold text-negro">Exclusivo</strong> porque el número de socios es el justo para que disfrutes de todo el material sin
              agobios y sin masificaciones.
            </p>
            <p>
              <strong className="font-semibold text-negro">Privado</strong> porque es para ti: un grupo reducido de personas que quieren un espacio donde entrenar
              y disfrutar del buen ambiente, con respeto y compañerismo.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {iconos.map(({ Icono, titulo, texto }) => (
              <li key={titulo} data-reveal className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center bg-negro text-acento">
                  <Icono className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="subtitular block text-[22px]">{titulo}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-negro/60">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
