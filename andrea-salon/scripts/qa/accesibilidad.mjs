#!/usr/bin/env node
/**
 * Revisión automática de accesibilidad (axe-core, WCAG 2.1 A/AA) a ancho de móvil, de la web, el
 * asistente de reserva paso a paso, el chat y todas las pantallas del panel.
 *
 * Además de axe, apunta lo que axe no mira y aquí importa:
 *  · objetivos táctiles de menos de 24 × 24 px (WCAG 2.2, 2.5.8) que no estén dentro de un texto;
 *  · errores de consola y excepciones de la página (una pantalla del panel que revienta con datos);
 *  · desbordamiento horizontal (la página más ancha que el móvil).
 *
 * Requisitos: el Supabase falso (`node scripts/qa/supabase-falso.mjs`) y la app en dev apuntando a
 * él en BASE (por defecto http://localhost:3100). Ver `scripts/qa/README.md`.
 *
 *   node scripts/qa/accesibilidad.mjs [--solo panel|web|reserva] [--capturas <dir>]
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { cookieSesion } from "./supabase-falso.mjs";

const require = createRequire(import.meta.url);
function cargarPlaywright() {
  for (const ruta of ["playwright", "/opt/node22/lib/node_modules/playwright", "/opt/node-tools/node_modules/playwright"]) {
    try {
      return require(ruta);
    } catch {
      /* siguiente */
    }
  }
  throw new Error("No encuentro Playwright. Instálalo (npm i -D playwright) o usa el del entorno.");
}
const { chromium } = cargarPlaywright();
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = process.env.BASE ?? "http://localhost:3100";
const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : null;
};
const SOLO = arg("--solo");
const CAPTURAS = arg("--capturas");
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });

const informe = [];

async function revisar(page, nombre) {
  await page.waitForTimeout(300);
  // Que acaben las animaciones finitas (entradas, fundidos): a medio fundido axe mide colores mezclados.
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))),
      new Promise((r) => setTimeout(r, 3000)),
    ]),
  );
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const res = await axe.run(
      { exclude: [["nextjs-portal"]] },
      { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, resultTypes: ["violations"] },
    );
    const violaciones = res.violations.map((v) => ({
      id: v.id,
      impacto: v.impact,
      ayuda: v.help,
      nodos: v.nodes.slice(0, 6).map((n) => ({ sel: n.target.join(" "), html: n.html.slice(0, 160), resumen: n.failureSummary?.split("\n").slice(1, 3).join(" ") })),
      total: v.nodes.length,
    }));
    /* Objetivos táctiles pequeños: controles visibles de menos de 24 px que no van dentro de un párrafo. */
    const pequenos = [];
    for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], [tabindex='0']")) {
      const b = el.getBoundingClientRect();
      if (b.width <= 1 || b.height <= 1) continue; // invisibles (p. ej. «Saltar al contenido» hasta recibir foco)
      const estilo = getComputedStyle(el);
      if (estilo.visibility === "hidden" || el.closest("[inert],[aria-hidden=true]")) continue;
      if (el.getAttribute("role") === "img") continue; // marcas de gráfica: enfocables por el tooltip, no son controles
      const enLinea = el.tagName === "A" && el.closest("p, li > span, label") && estilo.display === "inline";
      if (enLinea) continue;
      if (el.matches("input[type=checkbox], input[type=radio]") && el.closest("label")) continue;
      if (b.width < 24 || b.height < 24) pequenos.push(`${el.tagName.toLowerCase()} ${Math.round(b.width)}×${Math.round(b.height)} «${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40)}»`);
    }
    const desborde = document.documentElement.scrollWidth - window.innerWidth;
    return { violaciones, pequenos: pequenos.slice(0, 12), desborde };
  });
  if (CAPTURAS) await page.screenshot({ path: `${CAPTURAS}/${nombre.replace(/[^a-z0-9]+/gi, "-")}.png`, fullPage: true });
  informe.push({ nombre, url: page.url(), ...r });
}

async function nuevaPagina(ctx) {
  const page = await ctx.newPage();
  page.errores = [];
  page.on("pageerror", (e) => page.errores.push(`excepción: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Download the React DevTools|favicon|\[HMR\]|Failed to load resource: the server responded with a status of 404/.test(m.text())) page.errores.push(`consola: ${m.text().slice(0, 200)}`);
  });
  return page;
}

async function visitar(ctx, ruta, nombre = ruta) {
  const page = await nuevaPagina(ctx);
  const res = await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 90_000 });
  await revisar(page, nombre);
  informe.at(-1).estado = res?.status();
  informe.at(-1).errores = [...page.errores];
  return page;
}

const navegador = await chromium.launch();
const movil = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "es-ES", timezoneId: "Europe/Madrid" };

try {
  if (!SOLO || SOLO === "web") {
    const ctx = await navegador.newContext(movil);
    for (const r of ["/es", "/es/servicios", "/es/bonos", "/es/contacto", "/gl"]) await (await visitar(ctx, r)).close();
    const p = await visitar(ctx, "/es", "chat abierto");
    informe.pop();
    // El aviso de cookies tapa el lanzador hasta que se contesta (y el lanzador se aparta mientras).
    await p.getByRole("button", { name: "Rechazar" }).click();
    await p.waitForTimeout(600);
    // Arriba del todo el disco se aparta (tiene un botón del hero debajo): se pulsa por código.
    await p.evaluate(() => document.getElementById("as-chat-launcher")?.click());
    await p.waitForSelector("#as-chat-widget");
    await p.locator("#as-chat-widget form button[type=submit]").waitFor();
    await revisar(p, "/es · chat abierto");
    await p.fill("#as-chat-input", "¿Qué horario tenéis?");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(1500);
    await revisar(p, "/es · chat con respuesta");
    informe.at(-1).errores = p.errores;
    await ctx.close();
  }

  if (!SOLO || SOLO === "reserva") {
    const ctx = await navegador.newContext(movil);
    const p = await visitar(ctx, "/es/reservar", "reserva · 1 servicios");
    await p.getByRole("button", { name: /Manicura completa/ }).click();
    await p.getByRole("button", { name: "Continuar" }).click();
    await p.getByRole("heading", { name: "¿Con quién?" }).waitFor();
    await revisar(p, "reserva · 2 profesional");
    await p.getByRole("button", { name: /Me da igual/ }).click();
    await p.locator("button[aria-pressed]:not([disabled])").first().waitFor({ timeout: 30_000 });
    await revisar(p, "reserva · 3 día");
    await p.locator("button[aria-pressed]:not([disabled])").first().click();
    await p.getByRole("heading", { name: "¿A qué hora?" }).waitFor();
    await p.locator("ul button:not([disabled])").first().waitFor({ timeout: 30_000 });
    await revisar(p, "reserva · 4 hora");
    await p.locator("ul button:not([disabled])").first().click();
    await p.getByRole("heading", { name: "Tus datos" }).waitFor({ timeout: 30_000 });
    await revisar(p, "reserva · 5 datos");
    // Con HOLD_SEGUNDOS corto en el Supabase falso, el aviso de tiempo ya está fuera.
    const masTiempo = p.getByRole("button", { name: "Necesito más tiempo" });
    if (await masTiempo.isVisible()) {
      await masTiempo.click();
      await p.getByText(/Hecho: tienes otros \d+ minutos/).waitFor({ timeout: 15_000 });
      await revisar(p, "reserva · 5 datos tras pedir más tiempo");
    } else informe.at(-1).pequenos.push("(sin aviso de tiempo: arranca el Supabase falso con HOLD_SEGUNDOS=100 para probarlo)");
    await p.getByRole("button", { name: "Confirmar cita" }).click();
    await revisar(p, "reserva · 5 datos con errores");
    await p.getByLabel("Nombre").fill("Prueba Accesible");
    await p.getByLabel("Móvil").fill("123");
    await p.getByLabel("Correo").fill("prueba@ejemplo.es");
    await p.locator("input[name=condiciones]").check();
    await p.locator("input[name=privacidad]").check();
    await p.getByRole("button", { name: "Confirmar cita" }).click();
    // Teléfono mal: el campo queda marcado, con el foco y el error enlazado.
    await p.locator("input[name=telefono][aria-invalid=true]").waitFor({ timeout: 15_000 });
    const foco = await p.evaluate(() => document.activeElement?.getAttribute("name"));
    await revisar(p, "reserva · 5 datos con teléfono mal");
    if (foco !== "telefono") informe.at(-1).errores = [`el foco no fue al teléfono (está en ${foco})`];
    // El 400 de ese envío es el que se buscaba: no cuenta como error de la página.
    p.errores = p.errores.filter((e) => !e.includes("status of 400"));
    await p.getByLabel("Móvil").fill("612345678");
    await p.getByRole("button", { name: "Confirmar cita" }).click();
    await p.getByRole("heading", { name: "¡Cita confirmada!" }).waitFor({ timeout: 30_000 });
    await revisar(p, "reserva · 6 confirmada");
    const enlace = await p.getByRole("link", { name: "Ver mi cita" }).getAttribute("href");
    informe.at(-1).errores = p.errores;
    if (enlace) await (await visitar(ctx, enlace.replace(/^https?:\/\/[^/]+/, ""), "reserva · página de la cita")).close();
    await ctx.close();
  }

  if (!SOLO || SOLO === "panel") {
    const anon = await navegador.newContext(movil);
    await (await visitar(anon, "/panel/login")).close();
    await anon.close();

    const ctx = await navegador.newContext(movil);
    const c = cookieSesion();
    await ctx.addCookies([{ name: c.name, value: c.value, url: BASE }]);
    const hoy = await visitar(ctx, "/panel", "/panel (Hoy)");
    const mas = hoy.getByRole("button", { name: /^Más/ });
    if (await mas.isVisible()) {
      await mas.click();
      await hoy.locator("#panel-mas a").first().waitFor();
      await revisar(hoy, "/panel · menú Más abierto");
      await hoy.keyboard.press("Escape");
    }
    const cita = await hoy.locator("a[href^='/panel/citas/']:not([href$='nueva'])").first().getAttribute("href").catch(() => null);
    await hoy.close();
    const rutas = [
      "/panel/agenda",
      "/panel/agenda?vista=semana",
      "/panel/citas/nueva",
      ...(cita ? [cita] : []),
      "/panel/clientas",
      "/panel/bonos",
      "/panel/bonos/nuevo",
      "/panel/bonos/escanear",
      "/panel/bonos/AS-7K3M-Q9ZD",
      "/panel/servicios",
      "/panel/bonos-catalogo",
      "/panel/equipo",
      "/panel/analitica",
      "/panel/exportar",
      "/panel/configuracion",
    ];
    for (const r of rutas) {
      const p = await visitar(ctx, r);
      if (r === "/panel/clientas") {
        const ficha = await p.locator("a[href^='/panel/clientas/']").first().getAttribute("href").catch(() => null);
        if (ficha) await (await visitar(ctx, ficha, "/panel/clientas/[id]")).close();
      }
      await p.close();
    }
    await ctx.close();
  }
} finally {
  await navegador.close();
}

let problemas = 0;
for (const r of informe) {
  const malas = r.violaciones.length + (r.errores?.length ?? 0) + (r.desborde > 1 ? 1 : 0) + r.pequenos.length;
  problemas += malas;
  console.log(`\n■ ${r.nombre}  [${r.estado ?? "—"}] ${malas === 0 ? "✓" : ""}`);
  for (const v of r.violaciones) {
    console.log(`  ✗ ${v.id} (${v.impacto}, ${v.total}): ${v.ayuda}`);
    for (const n of v.nodos) console.log(`      ${n.sel}  ${n.resumen ?? ""}\n        ${n.html}`);
  }
  for (const e of r.errores ?? []) console.log(`  ! ${e}`);
  if (r.desborde > 1) console.log(`  ↔ desborda ${r.desborde}px en horizontal`);
  for (const t of r.pequenos) console.log(`  · objetivo pequeño: ${t}`);
}
console.log(`\n${informe.length} pantallas, ${problemas} avisos.`);
process.exit(problemas > 0 ? 1 : 0);
