import { NextResponse } from "next/server";

/**
 * Recibe las solicitudes del formulario (prueba, inscripción, entrada diaria) y, si está
 * configurado AVISO_WEBHOOK_URL (p. ej. un escenario de Make que manda WhatsApp o email al
 * gimnasio), se las reenvía. La URL va en las variables de entorno de Vercel, nunca en el código.
 * Sin webhook, el aviso llega igualmente por el WhatsApp que abre el formulario.
 */
const LIMITE = 600;
const limpiar = (v: unknown) => (typeof v === "string" ? v.slice(0, LIMITE).trim() : "");

export async function POST(req: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const aviso = {
    tipo: limpiar(datos.tipo),
    nombre: limpiar(datos.nombre),
    telefono: limpiar(datos.telefono),
    email: limpiar(datos.email),
    actividad: limpiar(datos.actividad),
    plan: limpiar(datos.plan),
    fecha: limpiar(datos.fecha),
    hora: limpiar(datos.hora),
    comentario: limpiar(datos.comentario),
    recibido: new Date().toISOString(),
    origen: "web 720gym",
  };
  if (!aviso.nombre || aviso.telefono.replace(/\D/g, "").length < 9 || !["prueba", "inscripcion", "entrada"].includes(aviso.tipo)) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }

  const webhook = process.env.AVISO_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ ok: true, reenviado: false });
  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aviso),
      signal: AbortSignal.timeout(6000),
    });
    return NextResponse.json({ ok: true, reenviado: r.ok });
  } catch {
    return NextResponse.json({ ok: true, reenviado: false });
  }
}
