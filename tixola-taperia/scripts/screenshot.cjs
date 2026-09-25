/* Captura de pantalla de la landing (desktop + móvil) con Chromium headless + WebGL por software.
   Requiere un build previo: npm run build. Uso: NODE_PATH=/opt/node22/lib/node_modules node scripts/screenshot.cjs [outDir] */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const OUT = process.argv[2] || path.join(__dirname, "..", "screenshots");
const PORT = process.env.PORT || 3123;
const BASE = `http://127.0.0.1:${PORT}`;

function waitForServer(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const tick = async (n) => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {}
      if (n <= 0) return reject(new Error("server did not start"));
      setTimeout(() => tick(n - 1), 500);
    };
    tick(tries);
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: path.join(__dirname, ".."), stdio: "pipe" });
  server.stdout.on("data", (d) => process.stdout.write("[next] " + d));
  server.stderr.on("data", (d) => process.stderr.write("[next] " + d));
  try {
    await waitForServer(BASE);
    const browser = await chromium.launch({
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    });
    const targets = [
      { name: "home-desktop", url: "/", viewport: { width: 1440, height: 900 }, mobile: false },
      { name: "home-mobile", url: "/", viewport: { width: 390, height: 844 }, mobile: true },
      { name: "carta-desktop", url: "/carta", viewport: { width: 1440, height: 900 }, mobile: false },
      { name: "carta-mobile", url: "/carta", viewport: { width: 390, height: 844 }, mobile: true },
    ];
    for (const t of targets) {
      const ctx = await browser.newContext({
        viewport: t.viewport,
        deviceScaleFactor: 1,
        isMobile: t.mobile,
        hasTouch: t.mobile,
        userAgent: t.mobile
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          : undefined,
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push("console: " + m.text());
      });
      await page.goto(BASE + t.url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(OUT, `${t.name}-fold.png`), fullPage: false });
      // scroll para disparar animaciones ScrollTrigger / whileInView
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT, `${t.name}-full.png`), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      console.log(`✓ ${t.name}  (horizontal overflow: ${overflow}px, errors: ${errors.length})`);
      errors.slice(0, 10).forEach((e) => console.log("   ", e));
      await ctx.close();
    }
    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
