/* QA visual multilingüe: portada y carta en es/gl/en/pt, desktop y móvil.
   Captura el viewport real por sección y reporta desbordamiento horizontal y errores de JS. */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "screenshots", "i18n");
const PORT = process.env.PORT || 3130;
const BASE = `http://127.0.0.1:${PORT}`;
const LOCALES = (process.env.LOCALES || "es,en").split(",");

const wait = (u, n = 90) =>
  new Promise((res, rej) => {
    const t = async (k) => {
      try {
        const r = await fetch(u);
        if (r.ok || r.status === 307) return res();
      } catch {}
      if (k <= 0) return rej(new Error("server did not start"));
      setTimeout(() => t(k - 1), 500);
    };
    t(n);
  });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  /* `detached`: el servidor arranca en su propio grupo de procesos para poder matar al grupo entero al
     acabar. Con `srv.kill()` a secas moría `npx` pero el `next start` hijo seguía vivo con la tubería de
     stdout heredada, y este proceso se quedaba colgado esperando a que se cerrara (se vio: el informe
     completo y el node sin salir durante 20 minutos). */
  const srv = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: path.join(__dirname, ".."), stdio: "pipe", detached: true });
  srv.stderr.on("data", (d) => process.stderr.write("[next] " + d));
  /* Consumir stdout aunque no se pinte: si nadie lee la tubería, el hijo se bloquea al llenarla. */
  srv.stdout.on("data", () => {});
  const lines = [];
  const say = (s) => { lines.push(s); process.stdout.write(s + "\n"); fs.writeFileSync(path.join(OUT, "report.txt"), lines.join("\n")); };
  try {
    await wait(BASE + "/es");
    const browser = await chromium.launch({
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    });
    for (const locale of LOCALES) {
      for (const dev of [
        { n: "desktop", vp: { width: 1440, height: 900 }, m: false },
        { n: "mobile", vp: { width: 390, height: 844 }, m: true },
      ]) {
        const ctx = await browser.newContext({ viewport: dev.vp, isMobile: dev.m, hasTouch: dev.m, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        const errs = [];
        page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
        page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160)); });

        // HOME
        await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle", timeout: 90000 });
        await page.waitForTimeout(2600);
        await page.screenshot({ path: path.join(OUT, `${locale}-${dev.n}-home-fold.png`) });
        for (const id of ["platos", "experiencia", "opiniones"]) {
          const ok = await page.evaluate((s) => {
            const el = document.getElementById(s);
            if (!el) return false;
            el.scrollIntoView({ block: "start" });
            return true;
          }, id);
          await page.waitForTimeout(1600);
          if (ok) await page.screenshot({ path: path.join(OUT, `${locale}-${dev.n}-${id}.png`) });
          else say(`  !! #${id} missing (${locale}/${dev.n})`);
        }
        let ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        const h1s = await page.evaluate(() => document.querySelectorAll("h1").length);
        const lang = await page.evaluate(() => document.documentElement.lang);
        say(`${locale}/${dev.n} HOME  overflow=${ov}px  h1=${h1s}  lang=${lang}  errors=${errs.length}`);

        // CARTA
        await page.goto(`${BASE}/${locale}/carta`, { waitUntil: "networkidle", timeout: 90000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUT, `${locale}-${dev.n}-carta.png`) });
        ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        const chips = await page.evaluate(() => document.querySelectorAll('[aria-pressed]').length);
        say(`${locale}/${dev.n} CARTA overflow=${ov}px  filterChips=${chips}  errors=${errs.length}`);
        errs.slice(0, 5).forEach((e) => say("    " + e));
        await ctx.close();
      }
    }
    await browser.close();
  } finally {
    /* Matar al grupo (pid negativo) y no solo a `npx`; si el grupo ya no existe, al proceso suelto. */
    try { process.kill(-srv.pid, "SIGTERM"); } catch { srv.kill("SIGTERM"); }
  }
  /* Salida explícita: aunque quedara algún manejador abierto (tubería, temporizador del navegador), el
     trabajo ya está hecho y el informe escrito. */
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
