import type { DatosPuesto, Lugar, Tramo } from "@/components/OficinaIso";
import { PUESTOS, type EstadoPuesto, type Puesto } from "@/lib/oficina";
import type { getSesion } from "@/lib/sesion";
import { esContactado, type Estado } from "@/lib/tipos";

/** Lo que buscamos ahora: 10 infoproductores o coaches que prueben el agente. */
export const TESTERS = 10;

export const n = (v: number) => v.toLocaleString("es-ES");

export const INTERESADO = new Set<Estado>(["interesado", "quiere_propuesta", "reunion"]);

interface Negocio {
  id: string;
  nombre: string;
  estado: Estado;
  creado: string;
}
/** Una cosa concreta que un agente ha dejado hecha: lleva a la ficha del negocio. */
export interface Hecho {
  id: string;
  titulo: string;
  detalle?: string;
  cuando: string;
}
export interface Apunte {
  id: string;
  puesto: Puesto;
  texto: string;
  creado: string;
}

/** La hora del momento de pedir la página (en el servidor, fuera del render puro). */
async function ahora() {
  return Date.now();
}

/** Todo lo que necesita la oficina y cada despacho: qué hace cada agente, lo que ha dejado hecho y el recorrido. */
export async function cargarOficina(db: Awaited<ReturnType<typeof getSesion>>["db"]) {
  const [{ data: negocios }, { data: diag }, { data: props }, { data: diario }] = await Promise.all([
    db.from("negocios").select("id, nombre, estado, creado").order("creado", { ascending: false }).range(0, 4999),
    db.from("diagnosticos").select("id, negocio_id, dolor, creado").order("creado", { ascending: false }).range(0, 9999),
    db.from("propuestas").select("negocio_id, guion, correo_cuerpo, url_visual, actualizado").order("actualizado", { ascending: false }).range(0, 4999),
    db.from("actividad").select("id, puesto, texto, creado").order("creado", { ascending: false }).limit(60),
  ]);

  const lista = (negocios ?? []) as Negocio[];
  const nombre = new Map(lista.map((x) => [x.id, x.nombre]));
  const total = lista.length;
  const contactados = lista.filter((x) => esContactado(x.estado)).length;
  const diagnosticos = ((diag ?? []) as { id: string; negocio_id: string; dolor: string; creado: string }[]).filter((d) => nombre.has(d.negocio_id));
  const conDiagnostico = new Set(diagnosticos.map((d) => d.negocio_id)).size;
  const propuestas = ((props ?? []) as { negocio_id: string; guion: unknown; correo_cuerpo: string | null; url_visual: string | null; actualizado: string }[]).filter((p) =>
    nombre.has(p.negocio_id),
  );
  const conGuion = propuestas.filter((p) => p.guion);
  const quieren = new Set(lista.filter((x) => INTERESADO.has(x.estado)).map((x) => x.id));
  const conOferta = propuestas.filter((p) => quieren.has(p.negocio_id) && p.correo_cuerpo);
  const conDiseno = propuestas.filter((p) => quieren.has(p.negocio_id) && p.url_visual);
  const porEscribir = lista.filter((x) => x.estado === "pendiente").length;
  const haceUnaSemana = new Date(await ahora() - 7 * 864e5).toISOString();
  const semana = lista.filter((x) => x.creado >= haceUnaSemana).length;

  const estado: Record<Puesto, EstadoPuesto> = {
    captacion: {
      activo: true,
      frase: total === 0 ? "Empiezo a buscar esta noche" : semana > 0 ? `Esta semana he traído ${n(semana)}` : `Tengo ${n(total)}. Busco más cada noche`,
      hechos: total,
      total: null,
      cifra: "infoproductores y coaches encontrados",
    },
    diagnostico: {
      activo: conDiagnostico < total,
      frase: total === 0 ? "Espero a que Leo traiga a alguien" : conDiagnostico < total ? `Me quedan ${n(total - conDiagnostico)} por mirar` : "Todos mirados",
      hechos: conDiagnostico,
      total,
      cifra: "con su problema apuntado",
    },
    guion: {
      activo: conGuion.length < total,
      frase: total === 0 ? "Espero a que Leo traiga a alguien" : conGuion.length < total ? `Me quedan ${n(total - conGuion.length)} por preparar` : "Todos tienen sus mensajes",
      hechos: conGuion.length,
      total,
      cifra: "con mensajes a medida",
    },
    oferta: {
      activo: conOferta.length < quieren.size,
      frase: quieren.size === 0 ? "Espero al primer interesado" : conOferta.length < quieren.size ? `${n(quieren.size - conOferta.length)} propuestas por escribir` : "Al día",
      hechos: conOferta.length,
      total: quieren.size,
      cifra: "propuestas escritas para interesados",
    },
    diseno: {
      activo: conDiseno.length < quieren.size,
      frase: quieren.size === 0 ? "Espero al primer interesado" : conDiseno.length < quieren.size ? `${n(quieren.size - conDiseno.length)} propuestas por montar` : "Al día",
      hechos: conDiseno.length,
      total: quieren.size,
      cifra: "propuestas visuales para interesados",
    },
  };

  // Lo que cada agente ha dejado hecho, lo más nuevo primero. Es lo que «se puede sacar» de él.
  const hechos: Record<Puesto, Hecho[]> = {
    captacion: lista.slice(0, 6).map((x) => ({ id: x.id, titulo: x.nombre, cuando: x.creado })),
    diagnostico: [...Map.groupBy(diagnosticos, (d) => d.negocio_id).values()].slice(0, 6).map((ds) => ({
      id: ds[0].negocio_id,
      titulo: nombre.get(ds[0].negocio_id) ?? "",
      detalle: ds.length > 1 ? `${ds[0].dolor} (y ${ds.length - 1} más)` : ds[0].dolor,
      cuando: ds[0].creado,
    })),
    guion: conGuion.slice(0, 6).map((p) => ({ id: p.negocio_id, titulo: nombre.get(p.negocio_id) ?? "", detalle: "Mensajes listos para copiar", cuando: p.actualizado })),
    oferta: conOferta.slice(0, 6).map((p) => ({ id: p.negocio_id, titulo: nombre.get(p.negocio_id) ?? "", detalle: "Propuesta escrita", cuando: p.actualizado })),
    diseno: conDiseno.slice(0, 6).map((p) => ({ id: p.negocio_id, titulo: nombre.get(p.negocio_id) ?? "", detalle: "Propuesta visual", cuando: p.actualizado })),
  };

  // Lo que espera para pasar de una mesa a la siguiente: es lo que se ve viajar en la oficina.
  const tramos: Tramo[] = [
    { de: "captacion", a: "diagnostico", esperan: total - conDiagnostico },
    { de: "diagnostico", a: "guion", esperan: Math.max(0, conDiagnostico - conGuion.length) },
    { de: "guion", a: "tu", esperan: porEscribir },
    { de: "tu", a: "oferta", esperan: quieren.size - conOferta.length },
    { de: "oferta", a: "diseno", esperan: Math.max(0, conOferta.length - conDiseno.length) },
  ];
  const enEscena = {
    ...Object.fromEntries(PUESTOS.map((p) => [p, { activo: estado[p].activo, frase: estado[p].frase }])),
    tu: { activo: porEscribir > 0, frase: `${n(porEscribir)} por escribir` },
  } as Record<Lugar, DatosPuesto>;

  const apuntes = (diario ?? []) as Apunte[];

  return { estado, hechos, tramos, enEscena, apuntes, total, contactados, interesados: quieren.size };
}
