/**
 * Motor local del asistente CON ACCIONES (sin clave de la API): sigue la conversación con un
 * pequeño estado y ejecuta las mismas herramientas que Claude (reservar, alta, plan, ficha, aviso).
 * Así la demo funciona igual sin conexión a la IA: todo lo que pasa aparece en el CRM.
 */
import { clasesHorario, dias } from "@/data/horario";
import { eur, planPorId } from "@/data/pagos";
import { ejecutar, plazasLibres, type AccionChat } from "@/lib/asistente-ejecutor";
import { responderLocal } from "@/lib/asistente-local";

export interface EstadoLocal {
  intencion?: "reserva" | "alta" | "plan";
  clase?: string;
  sesion?: { dia: string; hora: string; clase: string };
  planId?: string;
  objetivo?: string;
  dias?: number;
  nombre?: string;
  telefono?: string;
  avisado?: boolean;
}
export interface RespuestaLocal {
  texto: string;
  acciones: AccionChat[];
  sugerencias?: string[];
  hechos: string[];
}

const normal = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const clases: [RegExp, string][] = [
  [/reformer/, "reformer"],
  [/\bmat\b|suelo/, "mat"],
  [/hipopres/, "hipopresivos"],
  [/yoga/, "yoga"],
  [/cross/, "crossgym"],
  [/power|fuerza maxima/, "powerlifting"],
];
const planes: [RegExp, string][] = [
  [/entrada|un dia|de paso/, "entrada-diaria"],
  [/paquete|inicio/, "paquete-inicio"],
  [/supervis/, "supervision"],
  [/bono\s*15/, "bono-15"],
  [/bono\s*5\b/, "bono-5"],
  [/bono|personal|entrenador/, "bono-10"],
  [/valoraci/, "valoracion"],
  [/reformer.*3|3.*reformer/, "reformer-3"],
  [/reformer.*1|1.*reformer/, "reformer-1"],
  [/reformer|pilates/, "reformer-2"],
  [/hipopres/, "hipopresivos-1"],
  [/mat/, "mat-2"],
  [/gimnasio|sala|libre|35/, "gimnasio-libre"],
];

const nombreClase = (id: string) => clasesHorario.find((c) => c.id === id)?.nombre ?? id;

const capitalizar = (t: string) =>
  t
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

function extraerDatos(texto: string, e: EstadoLocal) {
  const tel = texto.replace(/[\s.-]/g, "").match(/(?:\+?34)?([6789]\d{8})/);
  if (tel) e.telefono = tel[1];
  const nom = texto.match(/(?:me llamo|soy|mi nombre es|nombre:?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i);
  if (nom) e.nombre = capitalizar(nom[1]);
  else if (!e.nombre && tel) {
    // «Lucía 600123123»: lo que no es el número, si parece un nombre.
    const resto = texto.replace(tel[0], "").replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, "").trim();
    if (resto && resto.split(/\s+/).length <= 3 && !/hola|quiero|reserv|apunt/i.test(resto)) e.nombre = capitalizar(resto);
  }
}

function planLocal(objetivo: string, d: number) {
  const fuerza = /fuerza|muscul|tonific|volumen/.test(normal(objetivo));
  const base = fuerza
    ? [["Sentadilla goblet 3×10", "Press banca con mancuernas 3×10", "Remo en polea 3×12", "Peso muerto rumano 3×10", "Plancha 3×30 s"], ["Prensa 3×12", "Press militar 3×10", "Jalón al pecho 3×12", "Zancadas 3×10 por pierna", "Pallof press 3×12"], ["Hip thrust 3×12", "Fondos asistidos 3×8", "Remo con mancuerna 3×10", "Sentadilla búlgara 3×8", "Rueda abdominal 3×8"]]
    : [["Bici o remo 10 min suave", "Sentadilla goblet 3×12", "Remo en polea 3×12", "Kettlebell swing 3×15", "Plancha 3×30 s"], ["Circuito: zancadas, flexiones, remo TRX ×3 vueltas", "Cinta inclinada 15 min", "Estiramientos 5 min"], ["Prensa 3×15", "Press con mancuernas 3×12", "Jalón al pecho 3×12", "Escaladores 3×30 s", "Bici 10 min a ritmo"]];
  const diasSemana = ["Lunes", "Miércoles", "Viernes", "Martes", "Jueves"].slice(0, d);
  const enfoques = ["Técnica y adaptación", "Más volumen", "Más intensidad", "Consolidar y medir progreso"];
  return enfoques.map((enfoque, i) => ({
    semana: i + 1,
    enfoque,
    sesiones: diasSemana.map((dia, k) => ({ dia, titulo: `Sesión ${String.fromCharCode(65 + (k % 3))}`, ejercicios: base[k % 3].map((x) => (i >= 2 ? x.replace("3×", "4×") : i === 1 ? x.replace("3×10", "3×12").replace("3×8", "3×10") : x)) })),
  }));
}

export async function responderConAcciones(texto: string, e: EstadoLocal, conversacion: string, conImagen = false): Promise<RespuestaLocal> {
  const t = normal(texto);
  const hechos: string[] = [];
  extraerDatos(texto, e);

  if (conImagen) {
    return {
      texto: "¡Gracias por la foto! Para analizarla al detalle necesito la conexión con la IA, que en esta demo está apagada. Si me cuentas qué entrenas y qué quieres conseguir, te recomiendo plan ahora mismo.",
      acciones: [{ etiqueta: "Valoración inicial 35 €", href: "/alta?plan=valoracion", venta: true }],
      sugerencias: ["Quiero ganar fuerza", "Quiero ponerme en forma", "Me interesa Pilates"],
      hechos,
    };
  }

  // Avisos a la gerencia: quejas, salud y ventas grandes.
  if (!e.avisado && /queja|mal servicio|reclam|lesion|dolor|operad|embaraz|bono\s*(de\s*)?1[05]|pareja|grupo de|alquil|empresa/.test(t)) {
    e.avisado = true;
    const motivo = /queja|reclam|mal servicio/.test(t) ? "queja" : /lesion|dolor|operad|embaraz/.test(t) ? "lesion_o_salud" : "venta_grande";
    const r = await ejecutar("avisar_gerente", { motivo, urgencia: motivo === "queja" ? "alta" : "normal", resumen: `Mensaje del cliente: «${texto.slice(0, 200)}»`, nombre: e.nombre ?? "", telefono: e.telefono ?? "" }, conversacion);
    if (r.hecho) hechos.push(r.hecho);
    if (motivo === "lesion_o_salud") {
      return { texto: "Gracias por contármelo. Con molestias o lesiones lo mejor es empezar con una valoración con nuestro entrenador, que adapta todo a ti. Ya he avisado al equipo y te escribirán por WhatsApp.", acciones: [{ etiqueta: "Reservar valoración", href: "/alta?plan=valoracion", venta: true }], hechos };
    }
    if (motivo === "queja") return { texto: "Siento mucho lo que me cuentas. Ya he pasado tu mensaje a la gerencia con prioridad y te escribirán hoy mismo.", acciones: [], hechos };
    hechos.push("Venta grande: el equipo te contactará");
  }

  if (!e.intencion) {
    if (/reserv|plaza|apuntarme a la clase|clase de/.test(t) && !/precio|cuanto/.test(t)) e.intencion = "reserva";
    else if (/apunt|alta|inscrib|pagar|me quedo|contratar|quiero el|darme de alta/.test(t)) e.intencion = "alta";
    else if (/plan|rutina|programa de entren/.test(t)) e.intencion = "plan";
  }

  // ── Reserva ──
  if (e.intencion === "reserva") {
    e.clase ??= clases.find(([r]) => r.test(t))?.[1];
    if (!e.clase) return { texto: "¡Vamos! ¿A qué clase quieres venir?", acciones: [], sugerencias: ["Pilates Reformer", "Pilates Mat", "Yoga", "CrossGym", "Powerlifting"], hechos };
    if (!e.sesion) {
      const dia = dias.find((d) => t.includes(normal(d))) ?? "cualquiera";
      const hueco = plazasLibres(dia, e.clase).find((s) => s.libres > 0);
      if (!hueco) return { texto: `Esa semana ${nombreClase(e.clase)} está completa ese día. ¿Probamos otro día?`, acciones: [{ etiqueta: "Ver horario", href: "/horario" }], hechos };
      e.sesion = { dia: hueco.dia, hora: hueco.hora, clase: e.clase };
      if (!e.nombre || !e.telefono)
        return { texto: `El próximo hueco de ${nombreClase(e.clase)} es el ${hueco.dia.toLowerCase()} a las ${hueco.hora} y quedan ${hueco.libres} plazas. ¿Te la reservo? Dime tu nombre y teléfono.`, acciones: [], hechos };
    }
    if (!e.nombre || !e.telefono) return { texto: "Para reservarte la plaza necesito tu nombre y tu teléfono (9 cifras).", acciones: [], hechos };
    const r = await ejecutar("reservar_clase", { ...e.sesion, nombre: e.nombre, telefono: e.telefono }, conversacion);
    await ejecutar("guardar_ficha_cliente", { nombre: e.nombre, telefono: e.telefono, objetivo: `Clase de ${nombreClase(e.sesion.clase)}`, disponibilidad: `${e.sesion.dia} ${e.sesion.hora}`, plan_recomendado: nombreClase(e.sesion.clase), temperatura: "caliente", siguiente_paso: "Confirmar asistencia y ofrecer plan mensual tras la clase", idioma: "español", resumen: `Ha reservado ${nombreClase(e.sesion.clase)} el ${e.sesion.dia} a las ${e.sesion.hora}.` }, conversacion);
    if (r.hecho) hechos.push(r.hecho);
    const s = e.sesion;
    e.intencion = undefined;
    e.sesion = undefined;
    e.clase = undefined;
    return r.error
      ? { texto: "Vaya, esa plaza se acaba de ocupar. ¿Miramos otro horario?", acciones: [{ etiqueta: "Ver horario", href: "/horario" }], hechos }
      : { texto: `¡Hecho, ${e.nombre}! Tienes plaza el ${s.dia.toLowerCase()} a las ${s.hora} en ${nombreClase(s.clase)}. Te llegará un recordatorio por WhatsApp el día antes.`, acciones: r.accion ? [r.accion] : [], sugerencias: ["Quiero apuntarme", "¿Qué tengo que llevar?"], hechos };
  }

  // ── Alta ──
  if (e.intencion === "alta") {
    e.planId ??= planes.find(([r]) => r.test(t))?.[1];
    if (!e.planId) return { texto: "¡Genial que te animes! ¿Qué te interesa más?", acciones: [], sugerencias: ["Gimnasio libre 35 €/mes", "Pilates Reformer", "Entrenamiento personal", "Paquete Inicio 75 €"], hechos };
    const plan = planPorId(e.planId)!;
    if (!e.nombre || !e.telefono) return { texto: `Perfecto: ${plan.nombre}, ${eur(plan.precio)}${plan.mensual ? " al mes" : ""}. Para dejarte el alta lista, dime tu nombre y tu teléfono.`, acciones: [], hechos };
    const r = await ejecutar("crear_alta", { plan_id: plan.id, nombre: e.nombre, telefono: e.telefono, email: "" }, conversacion);
    await ejecutar("guardar_ficha_cliente", { nombre: e.nombre, telefono: e.telefono, objetivo: `Alta en ${plan.nombre}`, disponibilidad: "", plan_recomendado: plan.nombre, temperatura: "caliente", siguiente_paso: "Comprobar que ha completado el pago; si no, llamarle hoy", idioma: "español", resumen: `Ha iniciado el alta en ${plan.nombre} desde el asistente.` }, conversacion);
    if (r.hecho) hechos.push(r.hecho);
    e.intencion = undefined;
    e.planId = undefined;
    return { texto: `¡Listo, ${e.nombre}! Te he dejado el alta preparada con tus datos. Pulsa el botón y pagas en un minuto con tarjeta, Apple Pay o Google Pay.`, acciones: r.accion ? [r.accion] : [], hechos };
  }

  // ── Plan de 4 semanas ──
  if (e.intencion === "plan") {
    if (!e.objetivo) {
      const o = t.match(/(perder peso|adelgaz|ganar fuerza|fuerza|musculo|tonific|ponerme en forma|forma|salud|espalda|movilidad)/);
      if (!o) return { texto: "Te preparo un plan de 4 semanas gratis. ¿Qué quieres conseguir?", acciones: [], sugerencias: ["Perder peso", "Ganar fuerza", "Ponerme en forma"], hechos };
      e.objetivo = o[1];
    }
    if (!e.dias) {
      const n = t.match(/\b([2-5])\b/);
      if (!n) return { texto: "¿Cuántos días a la semana puedes entrenar?", acciones: [], sugerencias: ["2 días", "3 días", "4 días"], hechos };
      e.dias = Number(n[1]);
    }
    if (!e.nombre || !e.telefono) return { texto: "¡Perfecto! Para enviártelo y que lo tengas siempre, dime tu nombre y tu teléfono.", acciones: [], hechos };
    const r = await ejecutar("crear_plan_4_semanas", { nombre: e.nombre, telefono: e.telefono, objetivo: e.objetivo, nivel: "principiante", dias_por_semana: e.dias, semanas: planLocal(e.objetivo, e.dias), consejos: ["Calienta 5-10 minutos antes de cada sesión.", "Sube el peso solo cuando la técnica sea limpia.", "Duerme bien y bebe agua: también es entrenamiento."] }, conversacion);
    if (r.hecho) hechos.push(r.hecho);
    e.intencion = undefined;
    return { texto: `¡Aquí lo tienes, ${e.nombre}! Tu plan de 4 semanas para ${e.objetivo}, ${e.dias} días a la semana. Si quieres, el entrenador lo revisa contigo en la valoración inicial.`, acciones: [...(r.accion ? [r.accion] : []), { etiqueta: "Valoración 35 €", href: "/alta?plan=valoracion" }], hechos };
  }

  // Sin intención clara: respuesta informativa de siempre + ficha si hay datos.
  if (e.nombre && e.telefono) {
    await ejecutar("guardar_ficha_cliente", { nombre: e.nombre, telefono: e.telefono, objetivo: "Pidiendo información", disponibilidad: "", plan_recomendado: "", temperatura: "templado", siguiente_paso: "Llamar para resolver dudas y ofrecer clase gratis", idioma: "español", resumen: `Ha dejado sus datos: «${texto.slice(0, 120)}»` }, conversacion);
  }
  const base = responderLocal(texto);
  return { ...base, hechos, sugerencias: ["Reservar una clase", "Quiero apuntarme", "Hazme un plan de 4 semanas"] };
}
