/* QA de las dos piezas visuales grandes de la página: la portada y el visor del mapa.

   Guarda contra la regresión que dejó la portada en negro. Ese fallo se descubrió cuando la portada
   era un lienzo WebGL, pero la comprobación NO era sobre WebGL: la portada sigue siendo un dibujo
   dentro de una capa que la transición de scroll anima, y cualquier fallo en esa capa (un velo que no
   vuelve a 0, una opacidad que se queda a cero, unas animaciones que arrancan en reposo) la apaga
   entera sin romper el build ni lanzar un solo error de JS. Solo se nota mirando los píxeles, y por eso
   esta prueba se queda aunque el 3D se haya ido.

   Qué mide ahora:
    · Portada — brillo medio de la zona donde vive la tixola, que hoy se pinta con degradados CSS
      (hierro, brasas, aceite, pimentón) en lugar de una escena de three.js. Falla si es casi negra.
    · Mapa — luminancia y contraste del visor de ubicación (`[data-map-viewport]`), que hoy es un plano
      SVG estático del casco histórico en lugar de un segundo lienzo WebGL. Falla si sale plano o negro.

   Ya no se comprueba que exista un `<canvas>`: no hay ninguno en la página, y buscarlo solo informaba.
   A cambio se informa del estado de las animaciones de la portada (`reposo=`), que es el interruptor
   que sí podría dejarla congelada: `useHeroIdle` las pausa cuando la portada no se ve.

   Uso: PORT=3403 NODE_PATH=/opt/node22/lib/node_modules node scripts/qa-hero.cjs  (requiere build) */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "screenshots", "hero");
const PORT = process.env.PORT || 3403;
const BASE = `http://127.0.0.1:${PORT}`;
const LOCALES = (process.env.LOCALES || "es,gl,en,pt").split(",");

/* Umbral: una portada viva mide ~63 de rojo medio en escritorio y ~50 en móvil (los focos de parrilla y
   el pimentón del aceite, medidos con el dibujo CSS actual; la escena WebGL daba ~60 en la caja de
   escritorio). El móvil mide menos desde que el copy lleva su propio velo de legibilidad detrás
   (Hero.tsx): la caja que se mide aquí incluye la mitad baja de la tixola, que ese velo atenúa a
   propósito para que el titular se lea en un teléfono de viewport bajo. Una portada apagada se queda en
   ~17, que es lo que dejan por sí solos los degradados de legibilidad. El umbral se mantiene en 32, entre
   medias: lo bastante alto para cazar una portada negra y lo bastante bajo para no fallar porque el halo
   de calor esté en la fase floja de su respiración. */
const MIN_RED_MEAN = 32;

/* Umbrales del visor del mapa. Aquí no hay un canal que destaque (granito, piedra y noche), así que
   se miden DOS cosas y hacen falta las dos:
    · luminancia media > 6 — un visor que no pinta nada se queda en el negro del fondo, es decir 0.
    · desviación típica > 4 — la media sola no basta: un relleno liso del color de fondo del plano ya
      daría luma 11 y pasaría. Un plano de verdad tiene manzanas de granito, calles claras, la retícula
      grabada y los halos de Tixola y la Catedral, y desvía mucho más; un relleno plano, del color que
      sea, desvía cero. Sirve igual para el SVG de hoy que para el lienzo de ayer.
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
    /* Navegador tal cual: las banderas de SwiftShader (`--use-angle=swiftshader` y compañía) estaban
       para que el contenedor pudiera crear un contexto WebGL por software. Sin WebGL en la página,
       forzar un renderizador por software solo ralentizaba la composición de los degradados. */
    const browser = await chromium.launch();
    for (const locale of LOCALES) {
      for (const dev of [
        /* Desktop: la tixola se ancla a la derecha (layout "split"). Móvil: arriba ("stacked"). */
        { n: "desktop", vp: { width: 1440, height: 900 }, m: false, box: { x: 780, y: 80, w: 640, h: 760 } },
        { n: "mobile", vp: { width: 390, height: 844, }, m: true, box: { x: 20, y: 90, w: 350, h: 330 } },
      ]) {
        const ctx = await browser.newContext({ viewport: dev.vp, isMobile: dev.m, hasTouch: dev.m, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle", timeout: 90000 });
        /* Margen para la hidratación y para que GSAP coloque la transición de la portada. Ya no hay
           que esperar el primer fotograma de una escena ni su fundido de entrada: el dibujo llega
           pintado en el HTML, así que 1,5 s bastan (antes eran 5). */
        await page.waitForTimeout(1500);

        const state = await page.evaluate(() => {
          const wrap = document.querySelector("#hero [data-hero-canvas]");
          const veil = document.querySelector("#hero [data-hero-dim]");
          /* Estado de las animaciones propias de la portada (`tixola-heat` es el halo de calor).
             `useHeroIdle` las pausa cuando la portada no se ve; si apareciera "paused" con la portada
             en pantalla, el vaho y las brasas estarían congelados. Es informativo, no criterio de
             fallo: con `prefers-reduced-motion` la hoja global las apaga y eso es lo correcto. */
          const heat = [...document.querySelectorAll("#hero [data-hero-canvas] *")].find((el) =>
            getComputedStyle(el).animationName.includes("tixola-heat"),
          );
          return {
            filter: wrap ? getComputedStyle(wrap).filter : "sin capa",
            opacity: wrap ? getComputedStyle(wrap).opacity : "-",
            veil: veil ? getComputedStyle(veil).opacity : "sin velo",
            idle: heat ? getComputedStyle(heat).animationPlayState : "sin halo",
          };
        });

        const shot = await page.screenshot({ type: "png" });
        fs.writeFileSync(path.join(OUT, `${locale}-${dev.n}.png`), shot);
        const mean = await meanOf(page, shot, dev.box);

        const lit = mean[0] >= MIN_RED_MEAN;
        if (!lit) failures++;
        say(
          `${lit ? "OK  " : "FALLO"} ${locale}/${dev.n}  rojo=${mean[0]} rgb=${mean.join(",")}  ` +
            `filtro=${state.filter} opacidad=${state.opacity} velo=${state.veil} reposo=${state.idle}`,
        );

        /* ── Visor del mapa ───────────────────────────────────────────────────────────────────
           Se baja hasta la tarjeta y se espera un momento. El plano es SVG y llega dibujado en el
           HTML, así que no hay bucle de render que arrancar; la espera es solo para que el scroll
           pare y los revelados de la sección terminen (antes eran 4 s por el lienzo WebGL). */
        const viewport = page.locator("[data-map-viewport]").first();
        if ((await viewport.count()) > 0) {
          await viewport.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1200);
          const box = await viewport.boundingBox();
          if (box) {
            const mapShot = await page.screenshot({ type: "png" });
            fs.writeFileSync(path.join(OUT, `${locale}-${dev.n}-mapa.png`), mapShot);
            /* Zona central del visor: se dejan fuera los bordes, donde viven la viñeta, la leyenda
               y las etiquetas HTML, que darían luz aunque el plano no se hubiera pintado. */
            const inner = {
              x: Math.round(box.x + box.width * 0.2),
              y: Math.round(box.y + box.height * 0.2),
              w: Math.round(box.width * 0.6),
              h: Math.round(box.height * 0.6),
            };
            const [luma, contrast] = await lumaStatsOf(page, mapShot, inner);
            /* Se informa de que el plano existe como imagen accesible (`role="img"`): es el asidero
               que sustituye al viejo `lienzo=`, y además vigila que no se pierda la alternativa
               textual del plano al tocar MapCard. */
            const mapPlan = await page.evaluate(
              () => !!document.querySelector('[data-map-viewport] svg[role="img"]'),
            );
            const mapLit = luma >= MIN_MAP_LUMA && contrast >= MIN_MAP_CONTRAST;
            if (!mapLit) failures++;
            say(`${mapLit ? "OK  " : "FALLO"} ${locale}/${dev.n}/mapa  luma=${luma} contraste=${contrast} plano=${mapPlan}`);
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
        ? `\n${failures} zona(s) apagada(s) — umbrales: rojo de portada ${MIN_RED_MEAN}, mapa luma ${MIN_MAP_LUMA} / contraste ${MIN_MAP_CONTRAST}`
        : `\nPortada y mapa visibles en ${LOCALES.length * 2} combinaciones`,
    );
  } finally {
    srv.kill("SIGKILL");
  }
  process.exit(failures ? 1 : 0);
})();
