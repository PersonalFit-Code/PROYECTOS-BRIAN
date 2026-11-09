/**
 * Ejecuta en el navegador las herramientas que pide el asistente (ver plazas, reservar, alta,
 * ficha, aviso a la gerencia, plan de 4 semanas). En la demo los datos viven en este navegador y
 * aparecen al momento en el CRM; en producción, esto mismo lo hace el servidor con la base de datos.
 */
import { clasesHorario, dias, sesiones, type ClaseId, type Dia } from "@/data/horario";
import { capacidad, claveSesion, esReservable, ocupacionBase } from "@/data/plazas";
import { eur, planPorId } from "@/data/pagos";
import { guardarAlerta, guardarFicha, guardarPlan, guardarReserva, guardarSolicitud, leerReservas, type AlertaGerente, type FichaLead, type PlanSemanas } from "@/lib/demo";
import type { Accion } from "@/lib/asistente-local";

export interface AccionChat extends Accion {
  /** Botón de venta (relleno) en lugar de botón de información. */
  venta?: boolean;
}
export interface Resultado {
  contenido: string;
  error?: boolean;
  accion?: AccionChat;
  /** Texto corto que se enseña en el chat como «hecho» (p. ej. «Reserva confirmada»). */
  hecho?: string;
}

const nombreClase = (id: string) => clasesHorario.find((c) => c.id === id)?.nombre ?? id;
const digitos = (t: unknown) => String(t ?? "").replace(/\D/g, "");
const avisar = (datos: Record<string, string>) =>
  fetch("/api/aviso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) }).catch(() => {});

/** Sesiones reservables ordenadas desde hoy, con las plazas libres reales. */
export function plazasLibres(dia: string, clase: string) {
  const hoy = (new Date().getDay() + 6) % 7;
  const reservas = leerReservas();
  return sesiones
    .filter((s) => esReservable(s.clase) && (dia === "cualquiera" || s.dia === dia) && (clase === "cualquiera" || s.clase === clase))
    .map((s) => {
      const total = capacidad[s.clase] ?? 0;
      const ocupadas = Math.min(total, ocupacionBase(s) + reservas.filter((r) => r.clave === claveSesion(s)).length);
      return { ...s, libres: total - ocupadas, orden: ((dias.indexOf(s.dia) - hoy + 7) % 7) * 10000 + Number(s.hora.replace(":", "")) };
    })
    .sort((a, b) => a.orden - b.orden);
}

export async function ejecutar(nombre: string, entrada: Record<string, unknown>, conversacion: string): Promise<Resultado> {
  const t = (k: string) => String(entrada[k] ?? "").trim();
  switch (nombre) {
    case "ver_plazas": {
      const lista = plazasLibres(t("dia") || "cualquiera", t("clase") || "cualquiera").slice(0, 12);
      if (!lista.length) return { contenido: "No hay sesiones de esa clase ese día. Propón otro día u otra clase." };
      return { contenido: lista.map((s) => `${s.dia} ${s.hora} · ${nombreClase(s.clase)} (${s.duracion}) · ${s.libres > 0 ? `quedan ${s.libres} plazas` : "COMPLETA"}`).join("\n") };
    }

    case "reservar_clase": {
      const dia = t("dia") as Dia;
      const clase = t("clase") as ClaseId;
      const sesion = plazasLibres(dia, clase).find((s) => s.hora === t("hora"));
      if (!sesion) return { contenido: "Esa sesión no existe. Mira ver_plazas y elige una de la lista.", error: true };
      if (sesion.libres <= 0) return { contenido: "Esa sesión está completa. Propón otra con plazas.", error: true };
      if (t("nombre").length < 2 || digitos(entrada.telefono).length < 9) return { contenido: "Falta el nombre o el teléfono (9 cifras). Pídeselos.", error: true };
      guardarReserva({ clave: claveSesion(sesion), clase: nombreClase(clase), dia, hora: sesion.hora, nombre: t("nombre"), telefono: t("telefono") });
      avisar({ tipo: "reserva", nombre: t("nombre"), telefono: t("telefono"), actividad: nombreClase(clase), fecha: dia, hora: sesion.hora, comentario: "Reserva hecha por el asistente" });
      return {
        contenido: `Reserva confirmada: ${dia} ${sesion.hora}, ${nombreClase(clase)}, a nombre de ${t("nombre")}. Le quedan ${sesion.libres - 1} plazas a esa sesión. Recordatorio por WhatsApp el día antes.`,
        hecho: `Plaza reservada · ${dia} ${sesion.hora} · ${nombreClase(clase)}`,
        accion: { etiqueta: "Ver el horario", href: "/horario" },
      };
    }

    case "crear_alta": {
      const plan = planPorId(t("plan_id"));
      if (!plan) return { contenido: "Ese plan no existe en el catálogo.", error: true };
      if (t("nombre").length < 2 || digitos(entrada.telefono).length < 9) return { contenido: "Falta el nombre o el teléfono (9 cifras). Pídeselos.", error: true };
      guardarSolicitud({ tipo: "inscripcion", nombre: t("nombre"), telefono: t("telefono"), email: t("email") || undefined, plan: `${plan.nombre} · ${eur(plan.precio)}${plan.mensual ? "/mes" : ""}`, comentario: "Alta iniciada desde el asistente" });
      avisar({ tipo: "inscripcion", nombre: t("nombre"), telefono: t("telefono"), email: t("email"), plan: plan.nombre, comentario: "Alta iniciada desde el asistente" });
      const q = new URLSearchParams({ plan: plan.id, nombre: t("nombre"), telefono: t("telefono"), ...(t("email") ? { email: t("email") } : {}) });
      return {
        contenido: `Alta preparada: ${plan.nombre}, ${eur(plan.precio)}${plan.mensual ? " al mes" : " (pago único)"}. El cliente ya tiene el botón para pagar de forma segura con sus datos rellenados.`,
        hecho: `Alta preparada · ${plan.nombre}`,
        accion: { etiqueta: `Pagar ${eur(plan.precio)}${plan.mensual ? "/mes" : ""}`, href: `/alta?${q}`, venta: true },
      };
    }

    case "guardar_ficha_cliente": {
      const temperatura = (["frio", "templado", "caliente"].includes(t("temperatura")) ? t("temperatura") : "templado") as FichaLead["temperatura"];
      guardarFicha({
        conversacion,
        nombre: t("nombre") || undefined,
        telefono: t("telefono") || undefined,
        objetivo: t("objetivo") || "Sin definir",
        disponibilidad: t("disponibilidad") || undefined,
        plan_recomendado: t("plan_recomendado") || undefined,
        temperatura,
        siguiente_paso: t("siguiente_paso"),
        idioma: t("idioma") || "español",
        resumen: t("resumen"),
      });
      return { contenido: "Ficha guardada en el CRM. No lo menciones al cliente; sigue la conversación." };
    }

    case "avisar_gerente": {
      const motivo = t("motivo") as AlertaGerente["motivo"];
      guardarAlerta({ conversacion, motivo, urgencia: t("urgencia") === "alta" ? "alta" : "normal", resumen: t("resumen"), nombre: t("nombre") || undefined, telefono: t("telefono") || undefined });
      avisar({ tipo: "alerta", nombre: t("nombre"), telefono: t("telefono"), plan: motivo, comentario: t("resumen") });
      return { contenido: "Aviso enviado a la gerencia. Dile al cliente que le escribirán pronto por WhatsApp.", hecho: "Aviso enviado al equipo de 720" };
    }

    case "crear_plan_4_semanas": {
      if (t("nombre").length < 2 || digitos(entrada.telefono).length < 9) return { contenido: "Para enviarle el plan necesitas su nombre y teléfono (9 cifras). Pídeselos.", error: true };
      const semanas = Array.isArray(entrada.semanas) ? (entrada.semanas as PlanSemanas["semanas"]) : [];
      if (!semanas.length) return { contenido: "El plan está vacío. Vuelve a crearlo con las 4 semanas.", error: true };
      const plan = guardarPlan({
        conversacion,
        nombre: t("nombre"),
        telefono: t("telefono"),
        objetivo: t("objetivo"),
        nivel: t("nivel"),
        dias_por_semana: Number(entrada.dias_por_semana) || 3,
        semanas,
        consejos: Array.isArray(entrada.consejos) ? (entrada.consejos as string[]) : [],
      });
      guardarFicha({ conversacion, nombre: t("nombre"), telefono: t("telefono"), objetivo: t("objetivo"), temperatura: "templado", siguiente_paso: "Llamar para ofrecer la valoración inicial y revisar el plan", idioma: "español", resumen: `Ha descargado un plan de 4 semanas (${t("nivel")}, ${plan.dias_por_semana} días).` });
      return {
        contenido: "Plan creado. El cliente lo tiene en el botón «Descargar mi plan». Invítale a hacer la valoración inicial o a probar una clase gratis.",
        hecho: "Plan de 4 semanas listo",
        accion: { etiqueta: "Descargar mi plan (PDF)", href: `/plan?id=${plan.id}`, venta: true },
      };
    }
  }
  return { contenido: `Herramienta desconocida: ${nombre}`, error: true };
}
