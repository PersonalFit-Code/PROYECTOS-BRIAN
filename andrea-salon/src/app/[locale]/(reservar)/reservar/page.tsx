import type { Metadata } from "next";
import { Phone } from "lucide-react";
import Asistente from "@/components/reservar/Asistente";
import type { CitaACambiar } from "@/components/reservar/tipos";
import { BUSINESS } from "@/data/business";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { urlFor } from "@/lib/hosts";
import { getAjustes } from "@/lib/reservas/ajustes";
import { cargarCitaPorToken, enPlazo } from "@/lib/reservas/citas";
import { tokenValido } from "@/lib/reservas/enlaces";
import { catalogoReserva } from "@/lib/reservas/publico";
import { fechaLarga, hora } from "@/lib/fechas";

/**
 * /<locale>/reservar (o reservar.<dominio>/<locale>). Lee el catálogo fresco en cada visita: un
 * servicio que Andrea desactiva desde el panel deja de ofrecerse al momento.
 */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l } = await params;
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const m = (await getMessages(locale)).reservar;
  return {
    title: m.seo.title,
    description: m.seo.description,
    alternates: { canonical: urlFor("reservar", "/", locale) },
  };
}

async function citaACambiar(token: string | null, firma: string | null): Promise<CitaACambiar | null> {
  if (!token || !firma || !/^[0-9a-f-]{36}$/i.test(token)) return null;
  try {
    if (!tokenValido(token, firma)) return null;
    const [c, ajustes] = await Promise.all([cargarCitaPorToken(token), getAjustes()]);
    if (!c || !enPlazo(c, ajustes) || c.items.some((i) => !i.service_id)) return null;
    return {
      token,
      firma,
      servicios: c.items.map((i) => i.service_id as string),
      staffId: c.cita.staff_id,
      fecha: fechaLarga(c.cita.starts_at, ajustes.timezone),
      hora: hora(c.cita.starts_at, ajustes.timezone),
    };
  } catch {
    return null;
  }
}

export default async function ReservarPage({ params, searchParams }: Props) {
  const { locale: l } = await params;
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const q = await searchParams;
  const [m, catalogo, cambiar] = await Promise.all([
    getMessages(locale),
    catalogoReserva(),
    citaACambiar(uno(q.cambiar), uno(q.t)),
  ]);

  if (!catalogo) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-tinta">{m.reservar.title}</h1>
        <p className="mt-4 text-gris">{m.reservar.errores.ERROR_INTERNO}</p>
        <a href={BUSINESS.phone.tel} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-carmin px-6 font-semibold text-white">
          <Phone aria-hidden className="size-4" />
          {BUSINESS.phone.display}
        </a>
      </div>
    );
  }

  // `?servicios=<id>,<id>` lo escribe el propio asistente; `?servicio=<slug>` llega desde los
  // botones «Reservar» de la web (la URL legible que se comparte).
  const porSlug = uno(q.servicio);
  const desdeWeb = porSlug ? catalogo.servicios.filter((s) => s.slug === porSlug).map((s) => s.id) : [];
  const servicios = [...(uno(q.servicios) ?? "").split(",").filter(Boolean), ...desdeWeb];
  const fecha = uno(q.fecha);
  return (
    <Asistente
      catalogo={catalogo}
      conSlug={uno(q.con)}
      cambiar={cambiar}
      inicial={{ servicios, fecha: fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : null }}
    />
  );
}
