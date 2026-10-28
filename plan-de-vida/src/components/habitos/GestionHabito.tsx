"use client";

import { Archive, ArchiveRestore, Flame, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { archivarHabito, borrarHabito, editarHabito } from "@/app/(app)/habitos/acciones";
import { Boton } from "@/components/ui/basicos";
import { Hoja } from "@/components/ui/Hoja";
import { Icono } from "@/components/ui/iconos";
import { cx } from "@/lib/formato";
import type { Area, Habit } from "@/lib/tipos";
import { FormHabito } from "./FormHabito";

const FRECUENCIA = (h: Habit) =>
  h.weekly_target
    ? `${h.weekly_target} veces por semana`
    : h.weekdays.length === 7
      ? "todos los días"
      : h.weekdays.join() === "0,1,2,3,4"
        ? "de lunes a viernes"
        : h.weekdays.map((d) => "LMXJVSD"[d]).join(" ");

const RUTINA = { manana: "mañana", dia: "día", noche: "noche" } as const;

export function GestionHabito({ habito, areas, racha, i = 0 }: { habito: Habit; areas: Area[]; racha: number; i?: number }) {
  const [pendiente, start] = useTransition();
  return (
    <li className={cx("glass entrar rounded-2xl p-3", !habito.active && "opacity-60")} style={{ ["--i" as string]: i }}>
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
          <Icono nombre={habito.emoji} porDefecto="check" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{habito.name}</div>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span>{habito.kind === "cantidad" ? `${habito.target} ${habito.unit ?? ""}` : habito.kind === "dejar" ? "a dejar" : "sí/no"}</span>
            <span>· {FRECUENCIA(habito)}</span>
            <span>· {RUTINA[habito.routine]}</span>
            {racha > 0 && (
              <span className="inline-flex items-center gap-0.5 text-warn">
                <Flame className="size-3" /> {racha}
              </span>
            )}
            {!habito.active && <span>· archivado</span>}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Hoja titulo="Editar hábito" boton="Editar" icono={<Pencil />} variante="suave" claseBoton="py-1.5">
          <FormHabito accion={editarHabito.bind(null, habito.id)} areas={areas} habito={habito} textoBoton="Guardar cambios" />
        </Hoja>
        <Boton variante="suave" className="py-1.5" disabled={pendiente} onClick={() => start(() => archivarHabito(habito.id, !habito.active))}>
          {habito.active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
          {habito.active ? "Archivar" : "Reactivar"}
        </Boton>
        <Boton
          variante="peligro"
          className="py-1.5"
          disabled={pendiente}
          onClick={() => {
            if (confirm(`¿Borrar "${habito.name}" y todo su historial? Si solo quieres dejar de verlo, mejor archívalo.`)) start(() => borrarHabito(habito.id));
          }}
        >
          <Trash2 className="size-4" /> Borrar
        </Boton>
      </div>
    </li>
  );
}
