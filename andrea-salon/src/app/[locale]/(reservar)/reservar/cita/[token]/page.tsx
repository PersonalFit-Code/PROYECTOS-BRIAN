import type { Metadata } from "next";
import CitaGestion from "@/components/reservar/CitaGestion";
import { DEFAULT_LOCALE, isLocale, LOCALE_META } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { getAjustes } from "@/lib/reservas/ajustes";
import { cargarCitaPorToken, resumen, type ResumenCita } from "@/lib/reservas/citas";
import { tokenValido, urlCambiarCita } from "@/lib/reservas/enlaces";

/**
 * La cita de la clienta, desde el enlace del correo. Se valida la firma en el servidor y se pinta
 * el resumen; las acciones (sí voy, cancelar, no puedo) las hace el cliente con POST para que un
 * escáner de enlaces del correo no cancele nada al abrirlo. `?accion=` solo preselecciona la
 * pregunta.
 */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l } = await params;
  const m = (await getMessages(isLocale(l) ? l : DEFAULT_LOCALE)).reservar;
  return { title: { absolute: m.cita.seoTitle }, robots: { index: false, follow: false } };
}

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function CitaPage({ params, searchParams }: Props) {
  const { locale: l, token } = await params;
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const q = await searchParams;
  const firma = uno(q.t);
  const accion = uno(q.accion);

  let cita: ResumenCita | null = null;
  try {
    if (/^[0-9a-f-]{36}$/i.test(token) && tokenValido(token, firma)) {
      const [c, ajustes] = await Promise.all([cargarCitaPorToken(token), getAjustes()]);
      if (c) cita = resumen(c, ajustes, new Date(), LOCALE_META[locale].intl);
    }
  } catch (e) {
    console.error("[cita] página:", e);
  }

  return (
    <CitaGestion
      cita={cita}
      firma={firma ?? ""}
      accionInicial={accion === "cancelar" || accion === "no-puedo" || accion === "si-voy" ? accion : null}
      urlCambiar={cita && firma ? urlCambiarCita(token, locale) : null}
    />
  );
}
