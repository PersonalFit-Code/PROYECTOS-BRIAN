import { MapPin, Clock, Phone, Mail, Bus, Car } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { negocio, pilates, wa } from "@/data/negocio";

export default function Contacto({ pagina = false }: { pagina?: boolean }) {
  const Titulo = pagina ? "h1" : "h2";
  const filas = [
    { Icono: MapPin, titulo: "Dirección", texto: negocio.direccion.completa },
    { Icono: Clock, titulo: "Horario", texto: `${negocio.horario.texto}. ${negocio.horario.detalle}.` },
    { Icono: Bus, titulo: "Cómo llegar", texto: "Bien comunicado con varias líneas de autobús urbano." },
    { Icono: Car, titulo: "Aparcamiento", texto: "Fácil aparcamiento en la zona." },
  ];
  return (
    <section id="contacto" className={pagina ? "bg-negro pt-[calc(var(--header-h)+3rem)] pb-16 sm:pb-24" : "bg-negro py-16 sm:py-24"} aria-labelledby="titulo-contacto">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p data-reveal className="etiqueta text-white/55">
            Contacto
          </p>
          <Titulo id="titulo-contacto" data-reveal className="titular mt-5 text-[clamp(2.1rem,3.6vw,3.1rem)]">
            Ven a vernos
          </Titulo>
          <ul className="mt-10 space-y-6">
            {filas.map(({ Icono, titulo, texto }) => (
              <li key={titulo} data-reveal className="flex gap-4">
                <Icono className="mt-0.5 size-5 shrink-0 text-acento" aria-hidden />
                <span>
                  <span className="etiqueta block text-white/45">{titulo}</span>
                  <span className="mt-1 block text-[16px] text-white/85">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-10 grid gap-3 sm:grid-cols-2">
            <a href={wa("Hola, tengo una duda sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" className={claseBoton("acento")}>
              WhatsApp {negocio.whatsappVisible}
            </a>
            <a href={`tel:${negocio.telefono}`} className={claseBoton("contorno")}>
              <Phone className="size-4" aria-hidden /> {negocio.telefonoVisible}
            </a>
            <a href={`mailto:${negocio.email}`} className={claseBoton("contorno")}>
              <Mail className="size-4" aria-hidden /> Email
            </a>
            <a href={negocio.instagram} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno")}>
              Instagram
            </a>
          </div>
          <p data-reveal className="mt-6 text-[13px] text-white/50">
            ¿Dudas de 720 Pilates? WhatsApp {pilates.whatsappVisible} · {pilates.email}
          </p>
        </div>
        <div data-reveal className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-suelo sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]">
            <iframe
              title="Mapa: 720 GYM CLUB en Calle Río Bibei 16, Ourense"
              src={negocio.mapaEmbed}
              className="absolute inset-0 h-full w-full grayscale invert-[0.92] hue-rotate-180 contrast-[0.9]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={negocio.comoLlegar}
              target="_blank"
              rel="noopener noreferrer"
              className={`${claseBoton("blanco")} absolute right-4 bottom-4 left-4 sm:left-auto`}
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
