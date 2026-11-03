import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { CATEGORIAS } from "@/data/catalogo";
import { NEGOCIO } from "@/data/negocio";

/**
 * Pie con lo que hoy falta en su web: enlaces legales de verdad (aviso legal, privacidad, cookies,
 * devoluciones), WhatsApp y el catálogo completo. Los legales son un hueco: se redactan al cerrar.
 */
export default function Footer() {
  const legal = ["Aviso legal", "Privacidad", "Cookies"];
  return (
    <footer className="bg-hueso text-negro">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="block text-[72px] leading-none" aria-label="Hungceed, inicio">
            <Logo />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-gris">{NEGOCIO.lema}</p>
          <p className="mt-6 text-sm text-gris">
            <a href={`mailto:${NEGOCIO.email}`} className="hover:text-negro">
              {NEGOCIO.email}
            </a>
          </p>
          <p className="mt-2 text-sm">
            <a href={NEGOCIO.instagram.url} target="_blank" rel="noopener noreferrer" className="text-gris hover:text-negro">
              Instagram {NEGOCIO.instagram.handle}
            </a>
          </p>
        </div>

        <div>
          <h2 className="etiqueta text-negro">Catálogo</h2>
          <ul className="mt-5 space-y-2.5 text-sm text-gris">
            {CATEGORIAS.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-negro">
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="etiqueta text-negro">Ayuda</h2>
          <ul className="mt-5 space-y-2.5 text-sm text-gris">
            <li>
              <Link href="/envios" className="hover:text-negro">
                Envíos y garantía
              </Link>
            </li>
            <li>
              <a href={NEGOCIO.devoluciones} target="_blank" rel="noopener noreferrer" className="hover:text-negro">
                Devoluciones
              </a>
            </li>
            <li>
              <a href={NEGOCIO.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-negro">
                WhatsApp
              </a>
            </li>
            <li>
              <Link href="/gym" className="hover:text-negro">
                Hungceed GYM
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="etiqueta text-negro">Legal</h2>
          <ul className="mt-5 space-y-2.5 text-sm text-gris">
            {legal.map((l) => (
              <li key={l}>
                <span>{l}</span> <span className="text-[11px] text-gris-claro">(se redacta al cerrar)</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-linea">
        <p className="container-page py-5 text-xs text-gris">
          © 2026 Hungceed · Maqueta de diseño preparada por Brian Carbajal. Fotos y textos de producto de hungceed.es.
        </p>
      </div>
    </footer>
  );
}
