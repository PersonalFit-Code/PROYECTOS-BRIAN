import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Collage from "@/components/ui/Collage";
import { fotos } from "@/data/fotos";
import { claseBoton } from "@/components/ui/Boton";
import { clubes } from "@/data/conceptos";
import { wa } from "@/data/negocio";

const usos = ["Cursos", "Eventos", "Entrenamientos grupales", "Talleres", "Master class", "Seminarios", "Clinics"];
const talleres = ["Pilates", "Yoga", "Defensa personal", "Wushu", "Nutrición", "Acrobacias", "Baile"];

/** Clubes que entrenan en 720 + espacios para profesionales (720P). */
export default function Clubes({ pagina = false }: { pagina?: boolean }) {
  const Titulo = pagina ? "h1" : "h2";
  return (
    <section id="clubes" className={pagina ? "bg-pizarra pt-[calc(var(--header-h)+4rem)] pb-24 sm:pb-32" : "bg-pizarra py-24 sm:py-32"} aria-labelledby="titulo-clubes">
      <div className="container-page">
        <p data-reveal className="etiqueta text-white/55">
          Clubes que entrenan en 720
        </p>
        <Titulo id="titulo-clubes" data-reveal className="titular mt-5 max-w-4xl text-[clamp(2.1rem,3.6vw,3.1rem)]">
          Un centro vivo, de la mañana a la noche
          {pagina && <span className="sr-only">: clubes deportivos y alquiler de salas en Ourense</span>}
        </Titulo>
        <ul className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {clubes.map((c) => (
            <li key={c.nombre} data-reveal className="flex flex-col bg-pizarra p-7">
              <div className="grid h-28 place-items-center bg-suelo ring-1 ring-inset ring-white/8">
                <span className="font-sans text-[22px] font-black tracking-tight text-white/80">{c.corto}</span>
              </div>
              <p className="etiqueta mt-6 text-acento">{c.disciplina}</p>
              <h3 className="subtitular mt-2 text-[26px]">{c.nombre}</h3>
              <p className="mt-2 text-[14px] text-white/60">{c.detalle}</p>
              <a
                href={wa(`Hola, quiero información de ${c.disciplina} (${c.nombre}) en 720.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-white/85 hover:text-acento"
              >
                Pedir información <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>

        {/* 720P · profesionales */}
        <div id="profesionales" className="mt-28 grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <p data-reveal className="etiqueta text-white/55">720P · Espacios para profesionales</p>
            <h3 data-reveal className="mt-5">
              <span className="titular block text-[clamp(2.1rem,3.6vw,3.1rem)]">¿Quieres un espacio para tu club?</span>
              <span className="subtitular mt-2 block text-[clamp(1.05rem,1.6vw,1.3rem)] text-acento">Aquí lo podrás tener.</span>
            </h3>
            <p data-reveal className="mt-6 max-w-lg text-[16px] leading-relaxed text-white/70">
              Entrenadores, terapeutas e instructores: alquila sala dentro de 720 para tu actividad, con un centro de {">"}1.000 m², horario amplio y una
              comunidad que ya entrena aquí.
            </p>
            <ul data-reveal className="mt-8 flex flex-wrap gap-2">
              {usos.map((u) => (
                <li key={u} className="bg-suelo px-3 py-2 text-[13px] text-white/80">
                  {u}
                </li>
              ))}
            </ul>
            <p data-reveal className="mt-6 text-[13px] text-white/50">Talleres que ya se han hecho o se hacen: {talleres.join(" · ")} y más.</p>
            <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={wa("Hola, soy profesional y me interesa alquilar un espacio en 720 (720P).")} target="_blank" rel="noopener noreferrer" className={claseBoton("acento", true)}>
                Consultar disponibilidad
              </a>
              <Link href="/contacto" className={claseBoton("contorno", true)}>
                Ven a verlo
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Collage
              fotos={[
                { descripcion: fotos.funcional.alt, src: fotos.funcional.src },
                { descripcion: "Profesional dando una master class a un grupo" },
                { descripcion: "Detalle de material (esterillas, bandas)" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
