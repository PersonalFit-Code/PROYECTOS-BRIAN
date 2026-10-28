import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { CalendarioVista, type Cita } from "@/components/calendario/CalendarioVista";
import { PreguntarCoach } from "@/components/coach/PreguntarCoach";
import { Pagina } from "@/components/layout/Pagina";
import { Titulo } from "@/components/ui/basicos";
import { getHuchas, getMetas, getRecurrentes, getTareas } from "@/lib/datos/consultas";
import { diaSemana, diasDelRango, hoy as hoyMadrid, mesDe, rangoMes, sumarMeses } from "@/lib/fechas";
import { siguienteFecha } from "@/lib/finanzas";
import { euros } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";

export const metadata: Metadata = { title: "Calendario" };

/**
 * Calendario: lo que toca cada día. Tareas con fecha, cobros y pagos fijos (proyectados desde su
 * próxima fecha), fechas límite de metas y huchas, y las revisiones (semanal el domingo, mensual el
 * último día). Se cargan del mes pasado a seis meses vista: el calendario navega sin volver al servidor.
 */
export default async function CalendarioPage() {
  const hoy = hoyMadrid();
  const desde = rangoMes(mesDe(sumarMeses(hoy, -1))).desde;
  const hasta = rangoMes(mesDe(sumarMeses(hoy, 6))).hasta;
  const s = await getSesion();
  const [tareas, recurrentes, metas, huchas] = await Promise.all([getTareas(s, { pendientes: false }), getRecurrentes(s), getMetas(s), getHuchas(s)]);

  const citas: Cita[] = [];
  for (const r of recurrentes.filter((r) => r.active)) {
    let fecha = r.next_date;
    for (let i = 0; i < 60 && fecha <= hasta; i++, fecha = siguienteFecha(fecha, r.frequency)) {
      if (fecha < desde) continue;
      const ingreso = r.kind === "ingreso";
      citas.push({
        id: `fijo-${r.id}-${fecha}`,
        dia: fecha,
        nombre: `${ingreso ? "Cobro" : "Pago"}: ${r.name}`,
        detalle: `${ingreso ? "+" : "−"}${euros(r.amount)} · ${r.method === "efectivo" ? "efectivo" : "tarjeta"}`,
        tipo: ingreso ? "cobro" : "pago",
        href: "/finanzas/suscripciones",
      });
    }
  }
  for (const m of metas.filter((m) => m.due_date && m.status === "activa")) {
    citas.push({ id: `meta-${m.id}`, dia: m.due_date!, nombre: `Fecha límite: ${m.title}`, detalle: `${Math.round(n(m.progress_pct))} % hecho`, tipo: "limite", href: "/metas" });
  }
  for (const h of huchas.filter((h) => h.target_date && !h.done)) {
    citas.push({ id: `hucha-${h.id}`, dia: h.target_date!, nombre: `Hucha: ${h.name}`, detalle: `${euros(h.saved, false)} de ${euros(h.target, false)}`, tipo: "limite", href: "/finanzas/huchas" });
  }
  for (const d of diasDelRango(desde, hasta)) {
    if (diaSemana(d) === 6) citas.push({ id: `rev-s-${d}`, dia: d, nombre: "Revisión semanal", tipo: "revision", href: `/revisiones?tipo=semanal&de=${d}` });
    if (rangoMes(mesDe(d)).hasta === d) citas.push({ id: `rev-m-${d}`, dia: d, nombre: "Revisión del mes", tipo: "revision", href: `/revisiones?tipo=mensual&de=${d}` });
  }

  return (
    <Pagina ancha>
      <Titulo
        icono={<CalendarDays />}
        color="blue"
        sub="Lo que toca cada día: tareas, pagos y cobros, fechas límite y revisiones."
        acciones={<PreguntarCoach pregunta="Mira mis tareas, pagos y fechas límite y organízame la semana: qué hago cada día">Organízame la semana</PreguntarCoach>}
      >
        Calendario
      </Titulo>
      <CalendarioVista
        tareas={tareas.filter((t) => t.due_date && t.due_date >= desde && t.due_date <= hasta)}
        sinFecha={tareas.filter((t) => !t.due_date && !t.done)}
        citas={citas}
        metas={metas.filter((m) => m.status === "activa").map((m) => ({ id: m.id, title: m.title }))}
        hoy={hoy}
      />
    </Pagina>
  );
}
