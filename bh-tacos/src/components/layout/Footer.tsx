import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BUSINESS, HOURS_SUMMARY } from "@/content";
import { whatsappUrl } from "@/lib/whatsapp";
import Logo from "@/components/common/Logo";
import SocialLinks from "@/components/common/SocialLinks";
import Year from "@/components/layout/Year";

export default function Footer() {
  const link = "press inline-flex items-center gap-2 hover:text-fg";
  return (
    <footer className="border-t border-line bg-bg-alt pb-28 pt-16 lg:pb-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="press inline-flex" aria-label="BH Tacos, ir al inicio">
            <Logo className="h-32 w-auto drop-shadow-lg" />
          </Link>
          <p className="mt-4 max-w-xs text-fg-muted">{BUSINESS.claim}</p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl uppercase">Visítanos</h2>
          <ul className="mt-4 space-y-3 text-fg-muted">
            <li>
              <a className={link} href={BUSINESS.maps} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden /> {BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.city}
              </a>
            </li>
            <li>{HOURS_SUMMARY}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl uppercase">Contacto</h2>
          <ul className="mt-4 space-y-3 text-fg-muted">
            <li>
              <a className={link} href={`tel:${BUSINESS.phone.tel}`}>
                <Phone className="h-4 w-4" aria-hidden /> {BUSINESS.phone.display}
              </a>
            </li>
            <li>
              <a className={link} href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
              </a>
            </li>
            <li>
              <a className={link} href={`mailto:${BUSINESS.email}`}>
                <Mail className="h-4 w-4" aria-hidden /> {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl uppercase">Legal</h2>
          <ul className="mt-4 space-y-3 text-fg-muted">
            <li><Link className={link} href="/aviso-legal">Aviso legal</Link></li>
            <li><Link className={link} href="/privacidad">Política de privacidad</Link></li>
            <li><Link className={link} href="/cookies">Política de cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-line px-4 pt-6 text-sm text-fg-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          © <Year /> {BUSINESS.name}. Todos los derechos reservados.
        </p>
        <p>Hecho con queso y buena onda en Ourense.</p>
      </div>
    </footer>
  );
}
