/**
 * Panel de pedidos: una pagina para que en el restaurante vean lo que va
 * entrando sin tener que abrir la consola de Firebase.
 *
 * Es HTML servido desde aqui, sin framework ni compilacion: una pagina que se
 * refresca sola cada 15 segundos y se lee bien en el movil, que es donde la
 * va a mirar quien este en la cocina.
 *
 * ACCESO: la pagina muestra direcciones y telefonos de clientes. Si
 * PANEL_PASSWORD esta definida, pide usuario y contrasena. Si no lo esta,
 * solo responde a peticiones desde el propio ordenador. Nunca queda abierta
 * en internet por olvidar configurarla.
 */

import { Router, type Request, type Response } from "express";

import { config } from "../config";
import { getBusiness } from "../db/businesses";
import { listarPedidos, marcarAtendido } from "../db/orders";
import type { PedidoConId } from "../db/types";
import { formatearEuros } from "../util/format";

export const panelRouter = Router();

const USUARIO = "cocina";

/** Las peticiones de la propia maquina, para el modo de desarrollo sin clave. */
function esLocal(req: Request): boolean {
  const ip = req.ip ?? "";
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("127.")
  );
}

function credencialesCorrectas(req: Request): boolean {
  const cabecera = req.header("authorization") ?? "";
  if (!cabecera.startsWith("Basic ")) return false;

  const descifrado = Buffer.from(cabecera.slice(6), "base64").toString("utf8");
  const separador = descifrado.indexOf(":");
  if (separador < 0) return false;

  return (
    descifrado.slice(0, separador) === USUARIO &&
    descifrado.slice(separador + 1) === config.panelPassword
  );
}

/**
 * Deja pasar o corta. Se aplica igual a ver el panel y a marcar un pedido:
 * si una cosa esta protegida, la otra tambien.
 */
function permitido(req: Request, res: Response): boolean {
  if (config.panelPassword) {
    if (credencialesCorrectas(req)) return true;
    res
      .status(401)
      .set("WWW-Authenticate", 'Basic realm="Panel de pedidos"')
      .send("Acceso restringido.");
    return false;
  }

  if (esLocal(req)) return true;
  res
    .status(403)
    .send(
      "El panel esta cerrado: define PANEL_PASSWORD para abrirlo fuera de este ordenador.",
    );
  return false;
}

/** El negocio al que se refiere la peticion, del query o del por defecto. */
function leerBusinessId(valor: unknown): string {
  return typeof valor === "string" && valor.trim() !== ""
    ? valor.trim()
    : config.defaultBusinessId;
}

/** Escapa el texto antes de meterlo en el HTML: viene de una llamada real. */
function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function horaCorta(iso: string, zonaHoraria: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zonaHoraria,
  }).format(fecha);
}

function pintarPedido(
  pedido: PedidoConId,
  zonaHoraria: string,
  businessId: string,
  verTodo: boolean,
): string {
  const lineas = pedido.lineas
    .map(
      (linea) =>
        `<li>${linea.cantidad} x ${escapar(linea.nombre)} <span class="importe">${formatearEuros(linea.importeCentimos)}</span></li>`,
    )
    .join("");

  const entrega =
    pedido.tipoEntrega === "reparto"
      ? `<div class="entrega reparto">A domicilio</div>
         <div class="dato"><b>Direccion:</b> ${escapar(pedido.direccion)}</div>`
      : `<div class="entrega recogida">Recoge en el local</div>`;

  const telefono = pedido.telefono
    ? `<div class="dato"><b>Telefono:</b> ${escapar(pedido.telefono)}</div>`
    : "";

  const notas = pedido.notas
    ? `<div class="notas"><b>Notas:</b> ${escapar(pedido.notas)}</div>`
    : "";

  const envio =
    pedido.gastosEnvioCentimos > 0
      ? `<span class="envio">+ ${formatearEuros(pedido.gastosEnvioCentimos)} envio</span>`
      : "";

  const atendido = pedido.estado === "atendido";

  // Formulario normal en vez de javascript: funciona siempre, tambien en un
  // movil viejo o con la conexion a medias.
  const boton = atendido
    ? `<div class="hecho">Atendido</div>`
    : `<form method="post" action="/pedidos/atendido">
         <input type="hidden" name="business" value="${escapar(businessId)}">
         <input type="hidden" name="docId" value="${escapar(pedido.docId)}">
         <input type="hidden" name="verTodo" value="${verTodo ? "1" : ""}">
         <button type="submit">Marcar atendido</button>
       </form>`;

  return `
    <article class="pedido${atendido ? " atendido" : ""}">
      <header>
        <span class="codigo">${escapar(pedido.codigo)}</span>
        <span class="hora">${horaCorta(pedido.creadoEnIso, zonaHoraria)}</span>
      </header>
      ${entrega}
      <ul class="lineas">${lineas}</ul>
      <div class="total">${formatearEuros(pedido.totalCentimos)} ${envio}</div>
      ${telefono}
      ${notas}
      ${boton}
    </article>`;
}

function pintarPagina(
  nombreNegocio: string,
  businessId: string,
  pedidos: PedidoConId[],
  zonaHoraria: string,
  verTodo: boolean,
): string {
  // Los pendientes primero: son los que hay que sacar.
  const ordenados = [...pedidos].sort((a, b) => {
    if (a.estado === b.estado) return 0;
    return a.estado === "pendiente" ? -1 : 1;
  });

  const pendientes = pedidos.filter((p) => p.estado === "pendiente").length;

  const contenido = ordenados.length
    ? ordenados
        .map((pedido) => pintarPedido(pedido, zonaHoraria, businessId, verTodo))
        .join("")
    : `<p class="vacio">${verTodo ? "Todavia no hay pedidos." : "Hoy no ha entrado ningun pedido."}</p>`;

  const enlace = verTodo
    ? `<a href="/pedidos?business=${encodeURIComponent(businessId)}">Ver solo los de hoy</a>`
    : `<a href="/pedidos?business=${encodeURIComponent(businessId)}&amp;ver=todo">Ver todos</a>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="15">
<title>Pedidos · ${escapar(nombreNegocio)}</title>
<style>
  :root { color-scheme: light dark; --fondo:#f6f6f7; --tarjeta:#fff; --texto:#1a1a1a;
          --suave:#6b6b70; --borde:#e2e2e5; --acento:#b5431a; }
  @media (prefers-color-scheme: dark) {
    :root { --fondo:#16161a; --tarjeta:#1f1f24; --texto:#f2f2f3;
            --suave:#a0a0a8; --borde:#2e2e36; --acento:#ff8a5c; }
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:16px; background:var(--fondo); color:var(--texto);
         font:16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  h1 { font-size:1.25rem; margin:0 0 2px; }
  .sub { color:var(--suave); font-size:.85rem; margin-bottom:18px; }
  .rejilla { display:grid; gap:14px; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); }
  .pedido { background:var(--tarjeta); border:1px solid var(--borde); border-radius:10px; padding:14px; }
  .pedido header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
  .codigo { font:700 1.3rem/1 ui-monospace, "SF Mono", Consolas, monospace; letter-spacing:.12em; }
  .hora { color:var(--suave); font-size:.85rem; }
  .entrega { display:inline-block; font-size:.75rem; font-weight:600; text-transform:uppercase;
             letter-spacing:.04em; padding:3px 8px; border-radius:999px; margin-bottom:10px; }
  .reparto { background:var(--acento); color:#fff; }
  .recogida { background:var(--borde); color:var(--texto); }
  .lineas { list-style:none; margin:0 0 10px; padding:0; }
  .lineas li { display:flex; justify-content:space-between; gap:12px; padding:2px 0; }
  .importe { color:var(--suave); white-space:nowrap; }
  .total { font-weight:700; font-size:1.1rem; border-top:1px solid var(--borde); padding-top:8px; }
  .envio { font-weight:400; font-size:.8rem; color:var(--suave); }
  .dato, .notas { font-size:.9rem; margin-top:6px; }
  .notas { color:var(--acento); }
  .vacio { color:var(--suave); }
  .pedido.atendido { opacity:.5; }
  .pedido form { margin-top:10px; }
  .pedido button { width:100%; padding:9px; border:0; border-radius:8px; cursor:pointer;
                   background:var(--acento); color:#fff; font:inherit; font-weight:600; }
  .pedido button:hover { filter:brightness(1.1); }
  .hecho { margin-top:10px; text-align:center; font-size:.8rem; font-weight:600;
           text-transform:uppercase; letter-spacing:.04em; color:var(--suave); }
  .sub a { color:var(--acento); }
</style>
</head>
<body>
  <h1>${escapar(nombreNegocio)}</h1>
  <div class="sub">
    <b>${pendientes} pendiente${pendientes === 1 ? "" : "s"}</b>
    de ${pedidos.length} ${verTodo ? "en total" : "hoy"} ·
    ${escapar(businessId)} · se actualiza solo cada 15 s · ${enlace}
  </div>
  <div class="rejilla">${contenido}</div>
</body>
</html>`;
}

panelRouter.get("/pedidos", async (req: Request, res: Response) => {
  if (!permitido(req, res)) return;

  const businessId = leerBusinessId(req.query.business);
  const verTodo = req.query.ver === "todo";

  const business = await getBusiness(businessId);
  // Los pedidos se guardaron bajo el id del negocio resuelto, no el pedido.
  const pedidos = await listarPedidos(business.id, {
    soloHoy: !verTodo,
    zonaHoraria: business.zonaHoraria,
  });

  res
    .type("html")
    .send(
      pintarPagina(
        business.nombre,
        business.id,
        pedidos,
        business.zonaHoraria,
        verTodo,
      ),
    );
});

/**
 * Marcar un pedido como atendido. Responde con una redireccion de vuelta al
 * panel para que al recargar no se repita el envio del formulario.
 */
panelRouter.post("/pedidos/atendido", async (req: Request, res: Response) => {
  if (!permitido(req, res)) return;

  const cuerpo = req.body as Record<string, unknown> | undefined;
  const businessId = leerBusinessId(cuerpo?.business);
  const docId = typeof cuerpo?.docId === "string" ? cuerpo.docId : "";
  const verTodo = Boolean(cuerpo?.verTodo);

  const business = await getBusiness(businessId);
  const hecho = await marcarAtendido(business.id, docId);

  if (!hecho) {
    res.status(500).send("No se ha podido marcar el pedido. Vuelve atras y reintenta.");
    return;
  }

  const destino =
    `/pedidos?business=${encodeURIComponent(business.id)}` +
    (verTodo ? "&ver=todo" : "");
  res.redirect(303, destino);
});
