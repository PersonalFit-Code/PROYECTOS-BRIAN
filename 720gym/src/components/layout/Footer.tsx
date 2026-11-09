import Link from "next/link";
import Logo from "@/components/ui/Logo";
import SelectorAcento from "./SelectorAcento";
import { negocio, pilates } from "@/data/negocio";
import { enlacesConceptos } from "./navegacion";

export default function Footer() {
  return (
    <footer className="bg-negro text-white">
      <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo className="text-[28px]" />
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/60">
            Centro privado de entrenamiento en Ourense. Fuerza, salud y comunidad, con aforo limitado.
          </p>
          <p className="titular mt-6 text-[28px] text-white/90">Entrena. Cuídate. Crece.</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
          <div>
            <p className="etiqueta text-white/45">Conceptos</p>
            <ul className="mt-4 space-y-2 text-[15px]">
              {enlacesConceptos.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-white/75 hover:text-white">
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="etiqueta text-white/45">Visítanos</p>
            <address className="mt-4 space-y-2 text-[15px] not-italic text-white/75">
              <p>{negocio.direccion.calle}</p>
              <p>
                {negocio.direccion.cp} {negocio.direccion.ciudad}
              </p>
              <p className="pt-2">{negocio.horario.texto}</p>
              <p className="text-white/50">{negocio.horario.detalle}</p>
            </address>
          </div>
          <div>
            <p className="etiqueta text-white/45">Contacto</p>
            <ul className="mt-4 space-y-2 text-[15px] text-white/75">
              <li>
                <a href={`tel:${negocio.telefono}`} className="hover:text-white">
                  {negocio.telefonoVisible}
                </a>
              </li>
              <li>
                <a href={`mailto:${negocio.email}`} className="hover:text-white">
                  {negocio.email}
                </a>
              </li>
              <li>
                <a href={negocio.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Instagram {negocio.instagramUsuario}
                </a>
              </li>
              <li>
                <a href={negocio.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Facebook
                </a>
              </li>
              <li className="pt-2 text-white/50">
                720 Pilates:{" "}
                <a href={`https://wa.me/${pilates.whatsapp}`} className="hover:text-white" target="_blank" rel="noopener noreferrer">
                  {pilates.whatsappVisible}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="container-page flex flex-col gap-4 py-6 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 720 GYM CLUB · Ourense</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
            <Link href="/legal/aviso-legal" className="hover:text-white">
              Aviso legal
            </Link>
            <Link href="/legal/privacidad" className="hover:text-white">
              Privacidad
            </Link>
            <Link href="/legal/cookies" className="hover:text-white">
              Cookies
            </Link>
          </nav>
          <SelectorAcento />
        </div>
      </div>
    </footer>
  );
}
