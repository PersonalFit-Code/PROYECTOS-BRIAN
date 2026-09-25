/* QA por secciones: navega, hace scroll natural a cada ancla y captura el VIEWPORT (no fullPage),
   que es lo que ve un usuario real. Detecta contenido que queda invisible (opacity 0) por
   animaciones de revelado que no disparan. */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "screenshots", "sections");
const PORT = process.env.PORT || 3124;
const BASE = `http://127.0.0.1:${PORT}`;

function waitForServer(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const tick = async (n) => {
      try { const r = await fetch(url); if (r.ok) return resolve(); } catch {}
      if (n <= 0) return reject(new Error("server did not start"));
      setTimeout(() => tick(n - 1), 500);
    };
    tick(tries);
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: path.join(__dirname, ".."), stdio: "pipe" });
  server.stderr.on("data", (d) => process.stderr.write("[next] " + d));
  try {
    await waitForServer(BASE);
    const browser = await chromium.launch({
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    });
    for (const device of [
      { name: "desktop", viewport: { width: 1440, height: 900 }, mobile: false },
      { name: "mobile", viewport: { width: 390, height: 844 }, mobile: true },
    ]) {
      const ctx = await browser.newContext({
        viewport: device.viewport, isMobile: device.mobile, hasTouch: device.mobile, deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
      page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
      await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(2000);

      for (const id of ["platos", "experiencia", "opiniones", "footer"]) {
        const found = await page.evaluate((sid) => {
          const el = document.getElementById(sid);
          if (!el) return null;
          el.scrollIntoView({ behavior: "instant", block: "start" });
          return true;
        }, id);
        if (!found) { console.log(`  !! #${id} NOT FOUND (${device.name})`); continue; }
        await page.waitForTimeout(1800);
        await page.screenshot({ path: path.join(OUT, `${device.name}-${id}.png`) });
        // ¿hay elementos visibles pero con opacidad 0 dentro del viewport?
        const invisible = await page.evaluate(() => {
          const out = [];
          for (const el of document.querySelectorAll("section, h2, h3, article, [data-reveal]")) {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight || r.width === 0) continue;
            const cs = getComputedStyle(el);
            if (parseFloat(cs.opacity) < 0.05 || cs.visibility === "hidden") {
              out.push((el.tagName + "." + (el.className || "").toString().slice(0, 40)).slice(0, 80));
            }
          }
          return out.slice(0, 8);
        });
        console.log(`✓ ${device.name}/${id}` + (invisible.length ? `  INVISIBLE: ${JSON.stringify(invisible)}` : ""));
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      console.log(`${device.name}: horizontal overflow = ${overflow}px, JS errors = ${errors.length}`);
      errors.slice(0, 8).forEach((e) => console.log("   ", e));
      await ctx.close();
    }
    await browser.close();
  } finally { server.kill("SIGTERM"); }
})().catch((e) => { console.error(e); process.exit(1); });
