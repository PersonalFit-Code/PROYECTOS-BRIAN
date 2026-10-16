"use client";

import { CalendarClock, Check, Phone, X } from "lucide-react";
import { useState } from "react";
import Boton from "@/components/ui/Boton";
import { BUSINESS } from "@/data/business";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { formatCents } from "@/lib/format";
import { urlFor } from "@/lib/hosts";
import type { ResumenCita } from "@/lib/reservas/citas";
import { duracionTexto, horaSalon, llamar } from "./api";

type Accion = "cancelar" | "no-puedo" | "si-voy";

export default function CitaGestion({
  cita: inicial,
  firma,
  accionInicial,
  urlCambiar,
}: {
  cita: ResumenCita | null;
  firma: string;
  accionInicial: Accion | null;
  urlCambiar: string | null;
}) {
  const m = useMessages().reservar;
  const t = useFormat();
  const locale = useLocale();
  const [cita, setCita] = useState(inicial);
  const [pregunta, setPregunta] = useState<Accion | null>(accionInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const reservarOtra = urlFor("reservar", "/", locale);

  if (!cita) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <h1 className="font-display text-3xl font-semibold text-tinta">{m.cita.title}</h1>
        <p className="mt-4 text-gris">{m.cita.invalido}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Boton href={BUSINESS.phone.tel} icon={<Phone />}>{m.cita.llamar}</Boton>
          <Boton href={reservarOtra} variant="fantasma">{m.cita.reservarOtra}</Boton>
        </div>
      </div>
    );
  }

  const futura = cita.esFutura;
  const viva = cita.estado === "confirmed" && futura;

  const hacer = async (accion: Accion) => {
    setEnviando(true);
    setError(null);
    const r = await llamar<{ cita: ResumenCita | null }>(`/api/reservar/cita/${cita.token}`, {
      method: "POST",
      body: JSON.stringify({ t: firma, accion }),
    });
    setEnviando(false);
    setPregunta(null);
    if (r.ok) {
      if (r.datos.cita) setCita(r.datos.cita);
      setAviso(accion === "si-voy" ? m.cita.siVoyHecho : m.cita.cancelada);
    } else {
      setError((m.errores as Record<string, string>)[r.error.codigo] ?? m.errores.ERROR_INTERNO);
    }
  };

  const textoPregunta: Record<Accion, string> = {
    cancelar: m.cita.preguntaCancelar,
    "no-puedo": m.cita.preguntaNoPuedo,
    "si-voy": m.cita.accionSiVoy,
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-8">
      <h1 className="font-display text-3xl font-semibold text-tinta sm:text-4xl">{m.cita.title}</h1>

      <div className="mt-6 rounded-3xl border border-[var(--capa-borde)] bg-white p-6 shadow-[var(--shadow-card)]">
        <span className="inline-flex rounded-full bg-rosa-niebla px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-carmin">
          {m.cita.estado[cita.estado]}
        </span>
        <p className="mt-4 font-display text-2xl font-semibold text-tinta first-letter:uppercase">{cita.fecha}</p>
        <p className="mt-1 text-lg text-tinta">
          {cita.hora} – {horaSalon(cita.salida)} · {duracionTexto(cita.duracionMin)}
        </p>
        <dl className="mt-5 grid gap-3 text-[15px]">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-carmin-suave">{m.resumen.que}</dt>
            <dd className="text-tinta">{cita.servicios.map((s) => s.nombre).join(" + ")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-carmin-suave">{m.resumen.con}</dt>
            <dd className="text-tinta">{cita.profesional.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-carmin-suave">{m.resumen.precio}</dt>
            <dd className="text-tinta">{formatCents(cita.totalCents)} · {m.resumen.pagoSalon}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-gris">{BUSINESS.address.full}</p>
      </div>

      {aviso && <p role="status" className="mt-5 rounded-2xl bg-rosa-niebla px-4 py-3 text-tinta">{aviso}</p>}
      {error && <p role="alert" className="mt-5 rounded-2xl border border-carmin/20 bg-white px-4 py-3 text-carmin">{error}</p>}
      {viva && cita.asistenciaConfirmada && !aviso && <p className="mt-5 text-tinta">{m.cita.asistencia}</p>}

      {viva && pregunta && (
        <div className="mt-5 rounded-3xl border border-carmin/25 bg-white p-5">
          <p className="text-tinta">{textoPregunta[pregunta]}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Boton onClick={() => hacer(pregunta)} disabled={enviando}>
              {pregunta === "si-voy" ? m.cita.siVoy : m.cita.siCancelar}
            </Boton>
            <Boton variant="secundario" onClick={() => setPregunta(null)} disabled={enviando}>
              {m.cita.noCancelar}
            </Boton>
          </div>
        </div>
      )}

      {viva && !pregunta && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!cita.asistenciaConfirmada && (
            <Boton onClick={() => hacer("si-voy")} disabled={enviando} icon={<Check />}>{m.cita.siVoy}</Boton>
          )}
          {cita.puedeCambiar && urlCambiar && (
            <Boton href={urlCambiar} variant="secundario" icon={<CalendarClock />}>{m.cita.cambiar}</Boton>
          )}
          {cita.puedeCambiar ? (
            <Boton variant="fantasma" onClick={() => setPregunta("cancelar")} icon={<X />}>{m.cita.cancelar}</Boton>
          ) : (
            <Boton variant="fantasma" onClick={() => setPregunta("no-puedo")} icon={<X />}>{m.cita.noPuedo}</Boton>
          )}
        </div>
      )}

      {viva && !cita.puedeCambiar && (
        <p className="mt-5 text-sm text-gris">
          {t(m.cita.fueraPlazo, { horas: cita.horasCancelacion, telefono: BUSINESS.phone.display })}
        </p>
      )}

      {!viva && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {!futura && cita.estado !== "cancelled" && <p className="text-gris">{m.cita.pasada}</p>}
          <Boton href={reservarOtra}>{m.cita.reservarOtra}</Boton>
        </div>
      )}
    </div>
  );
}
