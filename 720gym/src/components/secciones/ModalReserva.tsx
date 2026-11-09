"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { guardarReserva } from "@/lib/demo";
import type { Sesion } from "@/data/horario";

/** Reserva de plaza en una clase: nombre y teléfono, y la plaza queda guardada al momento. */
export default function ModalReserva({
  sesion,
  nombreClase,
  libres,
  total,
  onCerrar,
}: {
  sesion: Sesion;
  nombreClase: string;
  libres: number;
  total: number;
  onCerrar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [hecho, setHecho] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    /* Sin cerrar en la limpieza: en modo estricto React desmonta y vuelve a montar, y un close()
       ahí dispararía onClose y la ventana se cerraría sola. Al desmontarse, el diálogo sale del DOM. */
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
  }, []);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nombre = String(f.get("nombre") ?? "").trim();
    const telefono = String(f.get("telefono") ?? "").trim();
    if (nombre.length < 2 || telefono.replace(/\D/g, "").length < 9) return setError("Escribe tu nombre y un teléfono de 9 cifras.");
    guardarReserva({ clave: `${sesion.dia}|${sesion.hora}|${sesion.clase}`, clase: nombreClase, dia: sesion.dia, hora: sesion.hora, nombre, telefono });
    fetch("/api/aviso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "reserva", nombre, telefono, actividad: nombreClase, fecha: sesion.dia, hora: sesion.hora }),
      keepalive: true,
    }).catch(() => {});
    setHecho(true);
  }

  const campo = "h-13 w-full rounded-2xl bg-white/10 px-4 text-[16px] text-white ring-1 ring-white/15 outline-none placeholder:text-white/45 focus:ring-2 focus:ring-white";

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      onClick={(e) => e.target === dialogo.current && onCerrar()}
      className="vidrio-fuerte m-auto w-[min(92vw,30rem)] overflow-hidden rounded-[2rem] p-0 text-white backdrop:bg-black/60 backdrop:backdrop-blur-md"
      aria-labelledby="titulo-reserva"
    >
      <div className="relative p-7 sm:p-8">
        <button type="button" onClick={onCerrar} className="absolute top-4 right-4 grid size-10 place-items-center text-white/60 hover:text-white" aria-label="Cerrar">
          <X className="size-5" />
        </button>
        {hecho ? (
          <div role="status">
            <CheckCircle2 className="size-10" aria-hidden />
            <p className="titular mt-5 text-[28px]">Plaza reservada</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">
              {nombreClase}, {sesion.dia.toLowerCase()} a las {sesion.hora}. Te enviaremos un recordatorio por WhatsApp el día antes. Si no puedes venir, avísanos y liberamos tu plaza para otra persona.
            </p>
            <button type="button" onClick={onCerrar} className={`${claseBoton("blanco")} mt-7 w-full rounded-full`}>
              Perfecto
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <p className="etiqueta text-white/50">Reservar plaza</p>
            <h3 id="titulo-reserva" className="titular mt-3 text-[28px]">
              {nombreClase}
            </h3>
            <p className="mt-1 text-[15px] text-white/70">
              {sesion.dia} · {sesion.hora} · {sesion.duracion}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 bg-white/10">
                <div className="h-full bg-white" style={{ width: `${((total - libres) / total) * 100}%` }} />
              </div>
              <span className="text-[13px] font-semibold">
                {libres} de {total} libres
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-white/75">Nombre</span>
                <input name="nombre" autoComplete="name" className={campo} placeholder="Tu nombre" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-white/75">Teléfono</span>
                <input name="telefono" type="tel" inputMode="tel" autoComplete="tel" className={campo} placeholder="600 000 000" />
              </label>
            </div>
            {error && (
              <p className="mt-4 text-[14px] font-semibold" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={`${claseBoton("blanco", true)} mt-6 w-full rounded-full`}>
              Confirmar reserva
            </button>
            <p className="mt-3 text-center text-[12px] text-white/45">Socios y clase de prueba. Al reservar aceptas la política de privacidad.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}
