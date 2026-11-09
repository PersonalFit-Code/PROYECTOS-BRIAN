"use client";

import { useSyncExternalStore } from "react";
import { negocio } from "@/data/negocio";
import { cn } from "@/lib/utils";

/** «Abierto ahora · hasta las 22:30» con la hora de Madrid. */
function minutosMadrid() {
  const p = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const h = Number(p.find((x) => x.type === "hour")?.value ?? 0);
  const m = Number(p.find((x) => x.type === "minute")?.value ?? 0);
  return h * 60 + m;
}
const aMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const suscribir = (cb: () => void) => {
  const id = window.setInterval(cb, 60000);
  return () => window.clearInterval(id);
};

export default function EstadoAbierto({ className }: { className?: string }) {
  const ahora = useSyncExternalStore(suscribir, minutosMadrid, () => -1);
  const abre = aMin(negocio.horario.apertura);
  const cierra = aMin(negocio.horario.cierre);
  const abierto = ahora >= abre && ahora < cierra;
  const texto = ahora < 0 ? `Todos los días · ${negocio.horario.apertura}–${negocio.horario.cierre}` : abierto ? `Abierto ahora · hasta las ${negocio.horario.cierre}` : `Cerrado · abre a las ${negocio.horario.apertura}`;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex size-2.5">
        {abierto && <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-60" />}
        <span className={cn("relative size-2.5 rounded-full", abierto ? "bg-[#25d366]" : ahora < 0 ? "bg-white/50" : "bg-white/40")} />
      </span>
      {texto}
    </span>
  );
}
