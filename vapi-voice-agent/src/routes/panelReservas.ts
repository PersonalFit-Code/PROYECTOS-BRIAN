/**
 * Panel de reservas: lo que ha apuntado el agente de un restaurante, para
 * verlo entrar durante la demo sin abrir la consola de Firebase.
 *
 * Mismo acceso que el panel de pedidos (usuario "cocina" y PANEL_PASSWORD, o
 * solo desde el propio ordenador si no hay contrasena): lleva nombres y
 * telefonos de clientes.
 */

import { Router, type Request, type Response } from "express";

import { getNegocio } from "../db/businesses";
import { pideReservas } from "../db/restaurante";
import { listarRecados, listarReservas, type ConId, type Recado, type Reserva } from "../db/reservas";
import { leerFecha } from "../reservas/herramientas";
import { escapar, leerBusinessId, permitido } from "./panel";

export const panelReservasRouter = Router();

const DIAS_ES = ["", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const IDIOMAS_ES: Record<string, string> = {
  nl: "neerlandes",
  fr: "frances",
  en: "ingles",
  de: "aleman",
};

function diaEnCastellano(fecha: string): string {
  const partes = leerFecha(fecha);
  if (!partes) return fecha;
  const domingoCero = new Date(Date.UTC(partes.anio, partes.mes - 1, partes.dia)).getUTCDay();
  const iso = domingoCero === 0 ? 7 : domingoCero;
  return `${DIAS_ES[iso]} ${partes.dia}/${partes.mes}`;
}

function pintarReserva(r: ConId<Reserva>, hoy: string): string {
  const pasada = r.fecha < hoy;
  const estado =
    r.estado === "pendiente"
      ? `<span class="etiqueta pendiente">A confirmar (mas de 8)</span>`
      : `<span class="etiqueta">Apuntada</span>`;
  return `<article class="tarjeta${pasada ? " pasada" : ""}">
  <header><b>${escapar(diaEnCastellano(r.fecha))} · ${escapar(r.hora)}</b><span>${r.personas} pers.</span></header>
  ${estado}
  <div>${escapar(r.nombre)} · <a href="tel:${escapar(r.telefono)}">${escapar(r.telefono)}</a></div>
  ${r.notas ? `<div class="notas">${escapar(r.notas)}</div>` : ""}
  <div class="suave">Idioma: ${escapar(IDIOMAS_ES[r.idioma] ?? r.idioma ?? "")}</div>
</article>`;
}

function pintarRecado(r: ConId<Recado>): string {
  return `<article class="tarjeta">
  <header><b>${escapar(r.nombre)}</b><span class="suave">${escapar(r.creadoEnIso.slice(0, 16).replace("T", " "))}</span></header>
  <div>${escapar(r.mensaje)}</div>
  <div><a href="tel:${escapar(r.telefono)}">${escapar(r.telefono)}</a> · <span class="suave">Idioma: ${escapar(IDIOMAS_ES[r.idioma] ?? r.idioma ?? "")}</span></div>
</article>`;
}

panelReservasRouter.get("/reservas", async (req: Request, res: Response) => {
  if (!permitido(req, res)) return;

  const negocio = await getNegocio(leerBusinessId(req.query.business));
  if (!pideReservas(negocio)) {
    res
      .status(404)
      .send("Ese negocio no coge reservas. Abre /reservas?business=hilderwin");
    return;
  }

  const [reservas, recados] = await Promise.all([
    listarReservas(negocio.id),
    listarRecados(negocio.id),
  ]);
  // Las proximas primero, por dia y hora; las pasadas al final.
  const hoy = new Date().toISOString().slice(0, 10);
  const ordenadas = [...reservas].sort((a, b) => {
    const pa = a.fecha < hoy ? 1 : 0;
    const pb = b.fecha < hoy ? 1 : 0;
    if (pa !== pb) return pa - pb;
    return `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`);
  });

  res.type("html").send(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="15">
<title>Reservas · ${escapar(negocio.nombre)}</title>
<style>
  :root { color-scheme: light dark; --fondo:#f6f6f7; --tarjeta:#fff; --texto:#1a1a1a;
          --suave:#6b6b70; --borde:#e2e2e5; --acento:#1f5f8b; --aviso:#b5431a; }
  @media (prefers-color-scheme: dark) {
    :root { --fondo:#16161a; --tarjeta:#1f1f24; --texto:#f2f2f3;
            --suave:#a0a0a8; --borde:#2e2e36; --acento:#7bb8e0; --aviso:#ff8a5c; }
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:16px; background:var(--fondo); color:var(--texto);
         font:16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  h1 { font-size:1.25rem; margin:0 0 2px; }
  h2 { font-size:1rem; margin:22px 0 10px; }
  .sub, .suave { color:var(--suave); font-size:.85rem; }
  .rejilla { display:grid; gap:14px; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); }
  .tarjeta { background:var(--tarjeta); border:1px solid var(--borde); border-radius:10px; padding:14px; }
  .tarjeta header { display:flex; justify-content:space-between; gap:10px; margin-bottom:6px; }
  .tarjeta.pasada { opacity:.5; }
  .etiqueta { display:inline-block; font-size:.75rem; font-weight:600; text-transform:uppercase;
              letter-spacing:.04em; padding:3px 8px; border-radius:999px; margin-bottom:8px;
              background:var(--acento); color:#fff; }
  .etiqueta.pendiente { background:var(--aviso); }
  .notas { color:var(--aviso); font-size:.9rem; margin-top:4px; }
  a { color:var(--acento); }
  .vacio { color:var(--suave); }
</style>
</head>
<body>
  <h1>${escapar(negocio.nombre)}</h1>
  <div class="sub">${reservas.length} reserva${reservas.length === 1 ? "" : "s"} · ${recados.length} recado${recados.length === 1 ? "" : "s"} · se actualiza solo cada 15 s</div>
  <h2>Reservas</h2>
  <div class="rejilla">${ordenadas.map((r) => pintarReserva(r, hoy)).join("") || '<p class="vacio">Todavia no hay reservas.</p>'}</div>
  <h2>Recados (hay que llamarles)</h2>
  <div class="rejilla">${recados.map(pintarRecado).join("") || '<p class="vacio">No hay recados.</p>'}</div>
</body>
</html>`);
});
