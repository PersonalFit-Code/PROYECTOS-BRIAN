import Image from "next/image";
import { CalendarDays, DoorOpen, Users, Warehouse } from "lucide-react";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import { fotos } from "@/data/fotos";
import { negocio, wa } from "@/data/negocio";

/**
 * 720P · Espacios para profesionales: alquilar una sala o el centro para tu actividad. Los usos y
 * los talleres ya realizados son los de su dosier. No hay tarifas publicadas: se consulta por WhatsApp.
 */
const usos = ["Cursos", "Eventos", "Entrenamientos grupales", "Talleres", "Master class", "Seminarios", "Clinics"];
const talleres = ["Pilates", "Yoga", "Defensa personal", "Wushu", "Nutrición", "Acrobacias", "Baile"];
const mensaje = "Hola, os escribo desde la web de 720 Gym Club. Soy profesional y me interesa alquilar un espacio en 720 (720P). ¿Podemos hablar de disponibilidad y condiciones? Gracias.";
const opciones = [
  { I: DoorOpen, t: "Una sala para tu actividad", d: "Para tus clases, tus sesiones o tu grupo, dentro de un centro que ya está en marcha." },
  { I: Warehouse, t: "El centro entero", d: "Para un evento, un seminario o una jornada que necesite todo el espacio." },
  { I: CalendarDays, t: "Un día o todo el curso", d: "Desde una actividad puntual hasta un horario fijo durante la temporada." },
  { I: Users, t: "Una comunidad que ya entrena aquí", d: "Clubes y profesionales comparten el espacio y mantienen su propia identidad." },
];
const espacios = [fotos.pistaPilates, fotos.pilatesWallUnit, fotos.funcional, fotos.pistaVertical, fotos.pilatesReformer, fotos.racks];

export default function Profesionales() {
  return (
    <>
      <section className="relative overflow-hidden bg-negro pt-[calc(var(--header-h)+3rem)] pb-16 text-white sm:pb-24" aria-labelledby="titulo-720p">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <p className="etiqueta text-white/60">720P · Espacios para profesionales</p>
            <h1 id="titulo-720p" className="titular mt-4 text-[clamp(2.6rem,6.4vw,4.8rem)] leading-[0.94]">
              ¿Quieres un espacio para tu actividad?
            </h1>
            <p className="subtitular mt-3 text-[clamp(1.2rem,2.4vw,1.7rem)] text-white/90">Aquí lo podrás tener.</p>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/70">
              Entrenadores, terapeutas, instructores y clubes: alquila una sala, o el centro entero, dentro de 720. Un espacio de {negocio.metros} con horario
              amplio y una comunidad que ya entrena aquí.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={wa(mensaje)} target="_blank" rel="noopener noreferrer" className="boton-venta sin-flecha subtitular inline-flex h-14 items-center justify-center gap-2.5 px-7 text-[16px]">
                <IconoWhatsApp className="size-5 text-marca" />
                Consultar disponibilidad
              </a>
              <a href="#espacios" className="boton-info subtitular inline-flex h-14 items-center justify-center px-7 text-[16px] text-white">
                Ver los espacios
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="grid aspect-[4/3] place-items-center rounded-[2rem] bg-black ring-1 ring-white/10">
              <Image src="/sellos/720p-logo.png" alt="Logo de 720P" width={420} height={420} priority className="aspect-square h-[82%] w-auto rounded-[2rem]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pared py-16 text-negro sm:py-24" aria-labelledby="titulo-720p-como">
        <div className="container-page">
          <p data-reveal className="etiqueta text-negro/50">Cómo funciona</p>
          <h2 id="titulo-720p-como" data-reveal className="titular mt-3 max-w-3xl text-titulo-2 leading-[0.98]">
            Tu actividad, <span className="resalte">dentro de 720</span>
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {opciones.map(({ I, t, d }) => (
              <li key={t} data-reveal className="ficha-clara rounded-3xl border border-negro/10 bg-white p-6">
                <span className="grid size-14 place-items-center rounded-2xl bg-pared">
                  <I className="size-8 text-marca" strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="subtitular mt-4 text-[20px] leading-tight">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-negro/65">{d}</p>
              </li>
            ))}
          </ul>

          <div data-reveal className="mt-4 rounded-3xl bg-white p-6 sm:p-8">
            <h3 className="subtitular text-[21px]">Para qué se usa</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {usos.map((u) => (
                <li key={u} className="rounded-full bg-pared px-4 py-2 text-[14px] font-semibold text-negro/80">
                  {u}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14.5px] text-negro/60">Talleres que ya se han hecho o se hacen: {talleres.join(" · ")} y más.</p>
          </div>
        </div>
      </section>

      <section id="espacios" className="scroll-mt-24 bg-negro py-16 text-white sm:py-24" aria-labelledby="titulo-720p-espacios">
        <div className="container-page">
          <p data-reveal className="etiqueta text-white/50">Los espacios</p>
          <h2 id="titulo-720p-espacios" data-reveal className="titular mt-3 text-titulo-3">
            El centro por dentro
          </h2>
        </div>
        <ul className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:px-6 lg:container-page lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible">
          {espacios.map((f) => (
            <li key={f.src} className="relative aspect-[4/3] w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl bg-suelo sm:w-[46vw] lg:w-auto">
              <Image src={f.src} alt={f.alt} fill sizes="(min-width:1024px) 33vw, 78vw" className="object-cover" />
            </li>
          ))}
        </ul>
        <div className="container-page mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p data-reveal className="subtitular max-w-xl text-[20px] sm:text-[22px]">Cuéntanos qué necesitas y vemos qué espacio y qué horario encajan.</p>
          <a data-reveal href={wa(mensaje)} target="_blank" rel="noopener noreferrer" className="boton-venta sin-flecha subtitular inline-flex h-14 shrink-0 items-center justify-center gap-2.5 px-7 text-[16px]">
            <IconoWhatsApp className="size-5 text-marca" />
            Consultar disponibilidad
          </a>
        </div>
      </section>
    </>
  );
}
