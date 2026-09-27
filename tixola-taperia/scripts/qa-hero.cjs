/* QA de los dos lienzos WebGL de la página: la portada y el visor del mapa.

   Guarda contra la regresión que dejó la portada en negro: el hero se compone de un lienzo WebGL y
   un fondo estático, ambos dentro de una capa que la transición de scroll anima. Cualquier fallo en
   esa capa (un filtro mal calculado, un velo que no vuelve a 0, una escena que no pinta) apaga la
   portada entera sin romper el build ni lanzar errores de JS: sólo se nota mirando los píxeles.

   La prueba mide el brillo medio de la zona donde vive la tixola y falla si es casi negra. Después
   baja hasta la tarjeta de ubicación y hace lo mismo con su visor 3D (`[data-map-viewport]`), que
   hasta ahora no tenía ninguna comprobación aunque es el segundo lienzo WebGL del sitio y está
   expuesto al mismo fallo: un `frameloop` que no repinta deja el visor en el último fotograma o
   directamente vacío, y eso no rompe el build ni lanza ningún error.

   Uso: PORT=3403 NODE_PATH=/opt/node22/lib/node_modules node scripts/qa-hero.cjs  (requiere build) */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "screenshots", "hero");
const PORT = process.env.PORT || 3403;
const BASE = `http://127.0.0.1:${PORT}`;
const LOCALES = (process.env.LOCALES || "es,gl,en,pt").split(",");

/* Umbral: una portada viva mide ~60 de rojo medio (el glow pimentón del shader de fondo); una
   apagada se queda en ~17, que es lo que dejan los degradados CSS que hay por encima del lienzo. */
const MIN_RED_MEAN = 32;

/* Umbrales del visor del mapa. Aquí no hay un canal que destaque (granito, piedra y noche), así que
   se miden DOS cosas y hacen falta las dos:
    · luminancia media > 6 — un lienzo con el contexto creado pero que nunca llega a pintar se queda
      en el negro opaco del búfer (`alpha: false`), es decir 0.
    · desviación típica > 4 — la media sola no basta: un lienzo que solo se limpia al color de fondo
      de la escena (#0c0b0d) ya daría luma 11 y pasaría. Un mapa de verdad —o la foto de la fachada,
      que es su fallback legítimo— tiene granito, tejados y ventanas doradas y desvía mucho más; un
      relleno plano, del color que sea, desvía cero.
   Es un guardia de "esto está pintando algo", NO una medida de calidad. Se informan los dos valores
   medidos para poder recalibrar en un equipo real. */
const MIN_MAP_LUMA = 6;
const MIN_MAP_CONTRAST = 4;

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

/* El decodificador de PNG lo pone el navegador: el contenedor no trae ninguno en Node. */
const meanOf = (page, buf, box) =>
  page.evaluate(
    async ({ b64, box }) => {
      const img = await createImageBitmap(await (await fetch("data:image/png;base64," + b64)).blob());
      const c = new OffscreenCanvas(img.width, img.height);
      c.getContext("2d").drawImage(img, 0, 0);
      const w = Math.min(box.w, img.width - box.x);
      const h = Math.min(box.h, img.height - box.y);
      const d = c.getContext("2d").getImageData(box.x, box.y, w, h).data;
      let r = 0, g = 0, b = 0;
      const n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      return [r / n, g / n, b / n].map((v) => +v.toFixed(1));
    },
    { b64: buf.toString("base64"), box },
  );

/* Luminancia media y desviación típica de una caja (Rec. 601, la ponderación que usa el ojo). */
const lumaStatsOf = (page, buf, box) =>
  page.evaluate(
    async ({ b64, box }) => {
      const img = await createImageBitmap(await (await fetch("data:image/png;base64," + b64)).blob());
      const c = new OffscreenCanvas(img.width, img.height);
      c.getContext("2d").drawImage(img, 0, 0);
      const w = Math.max(1, Math.min(box.w, img.width - box.x));
      const h = Math.max(1, Math.min(box.h, img.height - box.y));
      const d = c.getContext("2d").getImageData(box.x, box.y, w, h).data;
      let sum = 0;
      let sumSq = 0;
      const n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        sum += y;
        sumSq += y * y;
      }
      const mean = sum / n;
      return [+mean.toFixed(1), +Math.sqrt(Math.max(0, sumSq / n - mean * mean)).toFixed(1)];
    },
    { b64: buf.toString("base64"), box },
  );

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: path.join(__dirname, ".."), stdio: "pipe" });
  srv.stderr.on("data", (d) => process.stderr.write("[next] " + d));
  const lines = [];
  const say = (s) => {
    lines.push(s);
    process.stdout.write(s + "\n");
    fs.writeFileSync(path.join(OUT, "report.txt"), lines.join("\n"));
  };
  let failures = 0;
  try {
    await wait(BASE + "/es");
    const browser = await chromium.launch({
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    });
    for (const locale of LOCALES) {
      for (const dev of [
        /* Desktop: la tixola se ancla a la derecha (layout "split"). Móvil: arriba ("stacked"). */
        { n: "desktop", vp: { width: 1440, height: 900 }, m: false, box: { x: 780, y: 80, w: 640, h: 760 } },
        { n: "mobile", vp: { width: 390, height: 844, }, m: true, box: { x: 20, y: 90, w: 350, h: 330 } },
      ]) {
        const ctx = await browser.newContext({ viewport: dev.vp, isMobile: dev.m, hasTouch: dev.m, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle", timeout: 90000 });
        /* La escena entra con un fundido de 1 s tras su primer fotograma. */
        await page.waitForTimeout(5000);

        const state = await page.evaluate(() => {
          const wrap = document.querySelector("#hero [data-hero-canvas]");
          const veil = document.querySelector("#hero [data-hero-dim]");
          return {
            filter: wrap ? getComputedStyle(wrap).filter : "sin capa",
            opacity: wrap ? getComputedStyle(wrap).opacity : "-",
            veil: veil ? getComputedStyle(veil).opacity : "sin velo",
            canvas: !!document.querySelector("#hero canvas"),
          };
        });

        const shot = await page.screenshot({ type: "png" });
        fs.writeFileSync(path.join(OUT, `${locale}-${dev.n}.png`), shot);
        const mean = await meanOf(page, shot, dev.box);

        const lit = mean[0] >= MIN_RED_MEAN;
        if (!lit) failures++;
        say(
          `${lit ? "OK  " : "FALLO"} ${locale}/${dev.n}  rojo=${mean[0]} rgb=${mean.join(",")}  ` +
            `filtro=${state.filter} opacidad=${state.opacity} velo=${state.veil} lienzo=${state.canvas}`,
        );

        /* ── Visor del mapa ───────────────────────────────────────────────────────────────────
           Se baja hasta la tarjeta y se espera: el lienzo se monta con 260 px de margen (para que
           WebGL llegue caliente) pero su bucle de render no arranca hasta que la tarjeta está al
           menos medio visible Y el scroll lleva ~120 ms parado, así que hay que dejar de moverse. */
        const viewport = page.locator("[data-map-viewport]").first();
        if ((await viewport.count()) > 0) {
          await viewport.scrollIntoViewIfNeeded();
          await page.waitForTimeout(4000);
          const box = await viewport.boundingBox();
          if (box) {
            const mapShot = await page.screenshot({ type: "png" });
            fs.writeFileSync(path.join(OUT, `${locale}-${dev.n}-mapa.png`), mapShot);
            /* Zona central del visor: se dejan fuera los bordes, donde viven la viñeta, la leyenda
               y las etiquetas HTML, que darían luz aunque el lienzo estuviera muerto. */
            const inner = {
              x: Math.round(box.x + box.width * 0.2),
              y: Math.round(box.y + box.height * 0.2),
              w: Math.round(box.width * 0.6),
              h: Math.round(box.height * 0.6),
            };
            const [luma, contrast] = await lumaStatsOf(page, mapShot, inner);
            const mapCanvas = await page.evaluate(() => !!document.querySelector("[data-map-viewport] canvas"));
            const mapLit = luma >= MIN_MAP_LUMA && contrast >= MIN_MAP_CONTRAST;
            if (!mapLit) failures++;
            say(`${mapLit ? "OK  " : "FALLO"} ${locale}/${dev.n}/mapa  luma=${luma} contraste=${contrast} lienzo=${mapCanvas}`);
          }
        } else {
          say(`AVISO ${locale}/${dev.n}/mapa  no se encontró [data-map-viewport]`);
        }

        await ctx.close();
      }
    }
    await browser.close();
    say(
      failures
        ? `\n${failures} lienzo(s) apagado(s) — umbrales: rojo de portada ${MIN_RED_MEAN}, mapa luma ${MIN_MAP_LUMA} / contraste ${MIN_MAP_CONTRAST}`
        : `\nPortada y mapa visibles en ${LOCALES.length * 2} combinaciones`,
    );
  } finally {
    srv.kill("SIGKILL");
  }
  process.exit(failures ? 1 : 0);
})();
