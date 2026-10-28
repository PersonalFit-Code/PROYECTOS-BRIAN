"use client";

import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { archivarHabito, borrarHabito, editarHabito } from "@/app/(app)/habitos/acciones";
import { Boton } from "@/components/ui/basicos";
import type { Area, Habit } from "@/lib/tipos";
import { FormHabito } from "./FormHabito";

const FRECUENCIA = (h: Habit) =>
  h.weekly_target
    ? `${h.weekly_target}× por semana`
    : h.weekdays.length === 7
      ? "todos los días"
      : h.weekdays.join() === "0,1,2,3,4"
        ? "L–V"
        : h.weekdays.map((d) => "LMXJVSD"[d]).join(" ");

export function GestionHabito({ habito, areas, racha }: { habito: Habit; areas: Area[]; racha: number }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, start] = useTransition();
  return (
    <li className="border-b border-line py-2 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{habito.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{habito.name}</div>
          <div className="text-xs text-muted">
            {habito.kind === "cantidad" ? `${habito.target} ${habito.unit ?? ""} · ` : habito.kind === "dejar" ? "a dejar · " : ""}
            {FRECUENCIA(habito)} · {habito.routine === "manana" ? "mañana" : habito.routine === "noche" ? "noche" : "día"}
            {racha > 0 && ` · 🔥 ${racha}`}
          </div>
        </div>
        <Boton variante="fantasma" aria-label="Editar" onClick={() => setEditando((v) => !v)}>
          <Pencil className="size-4" />
        </Boton>
        <Boton variante="fantasma" aria-label={habito.active ? "Archivar" : "Reactivar"} disabled={pendiente} onClick={() => start(() => archivarHabito(habito.id, !habito.active))}>
          {habito.active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
        </Boton>
        <Boton
          variante="peligro"
          aria-label="Borrar"
          disabled={pendiente}
          onClick={() => {
            if (confirm(`¿Borrar "${habito.name}" y todo su historial? Si solo quieres dejar de verlo, mejor archívalo.`)) start(() => borrarHabito(habito.id));
          }}
        >
          <Trash2 className="size-4" />
        </Boton>
      </div>
      {editando && (
        <div className="mt-3 rounded-md bg-side p-3">
          <FormHabito accion={editarHabito.bind(null, habito.id)} areas={areas} habito={habito} textoBoton="Guardar" alTerminar={() => setEditando(false)} />
        </div>
      )}
    </li>
  );
}
