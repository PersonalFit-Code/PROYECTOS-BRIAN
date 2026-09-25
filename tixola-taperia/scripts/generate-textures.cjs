/* Genera texturas procedurales (hierro, pizarra, piedra, brasas), la imagen OG y recorta la fachada.
   Uso: NODE_PATH=/opt/node22/lib/node_modules node scripts/generate-textures.cjs */
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "public");
const SIZE = 1024;

const svgs = {
  iron: `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="rough" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="6" seed="7" result="n"/>
      <feDiffuseLighting in="n" lighting-color="#d9cfc2" surfaceScale="7" diffuseConstant="1.25" result="lit">
        <feDistantLight azimuth="235" elevation="38"/>
      </feDiffuseLighting>
      <feColorMatrix in="lit" type="matrix" values="0.22 0 0 0 0.02  0 0.2 0 0 0.02  0 0 0.2 0 0.02  0 0 0 1 0"/>
    </filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/></filter>
    <filter id="rust" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="4" seed="11" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.11  0 0 0 0 0.07  0 0 0 2.6 -1.1"/>
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
    <filter id="scratch" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.004" numOctaves="2" seed="21" result="s"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.86  0 0 0 0 0.8  0 0 0 1.8 -1.2"/>
    </filter>
    <radialGradient id="vig" cx="55%" cy="45%" r="75%"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></radialGradient>
    <radialGradient id="hot" cx="18%" cy="52%" r="45%"><stop offset="0" stop-color="#7a1f16" stop-opacity="0.55"/><stop offset="1" stop-color="#7a1f16" stop-opacity="0"/></radialGradient>
    <radialGradient id="sheen" cx="58%" cy="40%" r="30%"><stop offset="0" stop-color="#cfc6ba" stop-opacity="0.22"/><stop offset="1" stop-color="#cfc6ba" stop-opacity="0"/></radialGradient>
    <filter id="pitsI" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="3" seed="29" result="p"/>
      <feColorMatrix in="p" type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.01  0 0 0 0 0.01  0 0 0 3 -1.9"/>
    </filter>
    <filter id="speck" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="33" result="p"/>
      <feColorMatrix in="p" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.16  0 0 0 0 0.1  0 0 0 4 -2.9"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#141212"/>
  <rect width="100%" height="100%" filter="url(#rough)" opacity="0.95"/>
  <rect width="100%" height="100%" filter="url(#rust)" opacity="0.6"/>
  <rect width="100%" height="100%" fill="url(#hot)"/>
  <rect width="100%" height="100%" fill="url(#sheen)"/>
  <rect width="100%" height="100%" filter="url(#scratch)" opacity="0.22" transform="rotate(-28 512 512) scale(1.5)"/>
  <rect width="100%" height="100%" filter="url(#pitsI)" opacity="0.7"/>
  <rect width="100%" height="100%" filter="url(#speck)" opacity="0.8"/>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.16" style="mix-blend-mode:overlay"/>
  <rect width="100%" height="100%" fill="url(#vig)"/>
</svg>`,
  slate: `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="chalk" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="5" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.75  0 0 0 0 0.78  0 0 0 0.9 -0.35"/>
      <feGaussianBlur stdDeviation="0.6"/>
    </filter>
    <filter id="smudge" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="3" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0 0.82  0 0 0 1.4 -0.75"/>
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <filter id="scr" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7 0.003" numOctaves="2" seed="31" result="s"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 2.2 -1.5"/>
    </filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></radialGradient>
    <radialGradient id="red" cx="85%" cy="90%" r="50%"><stop offset="0" stop-color="#8a2a22" stop-opacity="0.35"/><stop offset="1" stop-color="#8a2a22" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#16171a"/>
  <rect width="100%" height="100%" filter="url(#chalk)" opacity="0.16"/>
  <rect width="100%" height="100%" filter="url(#smudge)" opacity="0.22"/>
  <rect width="100%" height="100%" filter="url(#scr)" opacity="0.14" transform="rotate(12 512 512) scale(1.4)"/>
  <rect width="100%" height="100%" filter="url(#scr)" opacity="0.1" transform="rotate(-70 512 512) scale(1.4)"/>
  <rect width="100%" height="100%" fill="url(#red)"/>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.12" style="mix-blend-mode:overlay"/>
  <rect width="100%" height="100%" fill="url(#vig)"/>
</svg>`,
  stone: `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="rock" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="6" seed="17" result="n"/>
      <feDiffuseLighting in="n" lighting-color="#f1d9a8" surfaceScale="5" diffuseConstant="1.2" result="lit">
        <feDistantLight azimuth="210" elevation="42"/>
      </feDiffuseLighting>
      <feColorMatrix in="lit" type="matrix" values="0.78 0 0 0 0.05  0 0.56 0 0 0.03  0 0 0.32 0 0.01  0 0 0 1 0"/>
    </filter>
    <filter id="pits" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" seed="23" result="p"/>
      <feColorMatrix in="p" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 2.4 -1.4"/>
    </filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8"/><feColorMatrix type="saturate" values="0"/></filter>
    <linearGradient id="light" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#ffd48a" stop-opacity="0.45"/><stop offset="0.55" stop-color="#7a4a1e" stop-opacity="0.1"/><stop offset="1" stop-color="#0b0507" stop-opacity="0.92"/></linearGradient>
    <linearGradient id="redglow" x1="1" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#5a0f14" stop-opacity="0.55"/><stop offset="1" stop-color="#5a0f14" stop-opacity="0"/></linearGradient>
    <pattern id="arches" x="0" y="0" width="256" height="1024" patternUnits="userSpaceOnUse">
      <path d="M20 700 V 420 A 108 108 0 0 1 236 420 V 700" fill="none" stroke="#2a1608" stroke-opacity="0.55" stroke-width="18"/>
      <path d="M44 700 V 430 A 84 84 0 0 1 212 430 V 700" fill="none" stroke="#ffe0a8" stroke-opacity="0.18" stroke-width="6"/>
      <path d="M70 700 V 445 A 58 58 0 0 1 186 445 V 700" fill="none" stroke="#2a1608" stroke-opacity="0.4" stroke-width="10"/>
      <rect x="0" y="700" width="256" height="14" fill="#2a1608" fill-opacity="0.45"/>
      <rect x="0" y="714" width="256" height="4" fill="#ffe0a8" fill-opacity="0.2"/>
    </pattern>
    <pattern id="blocks" x="0" y="0" width="300" height="180" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="300" height="180" fill="none" stroke="#1d0f05" stroke-opacity="0.5" stroke-width="5"/>
      <rect x="150" y="90" width="150" height="90" fill="none" stroke="#1d0f05" stroke-opacity="0.35" stroke-width="4"/>
      <line x1="150" y1="0" x2="150" y2="90" stroke="#1d0f05" stroke-opacity="0.35" stroke-width="4"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#7d5a33"/>
  <rect width="100%" height="100%" filter="url(#rock)" opacity="0.95"/>
  <rect width="100%" height="100%" fill="url(#blocks)" opacity="0.55"/>
  <rect width="100%" height="100%" fill="url(#arches)" opacity="0.55"/>
  <rect width="100%" height="100%" filter="url(#pits)" opacity="0.5"/>
  <rect width="100%" height="100%" fill="url(#light)"/>
  <rect width="100%" height="100%" fill="url(#redglow)"/>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.12" style="mix-blend-mode:overlay"/>
</svg>`,
};

function embersSvg() {
  // Chispas y brasas: partículas pseudoaleatorias (semilla fija) concentradas abajo
  let seed = 1337;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const parts = [];
  for (let i = 0; i < 900; i++) {
    const t = rnd();
    const cx = 512 + (rnd() - 0.5) * (240 + t * 520) * (0.6 + rnd() * 0.8);
    const cy = 880 - Math.pow(rnd(), 1.7) * 820;
    const r = 0.8 + Math.pow(rnd(), 3) * 4.2;
    const hot = rnd();
    const color = hot > 0.82 ? "#fff1b0" : hot > 0.5 ? "#ffb347" : "#ff5a2a";
    const op = 0.35 + rnd() * 0.65;
    const blur = rnd() > 0.7 ? ' filter="url(#soft)"' : "";
    const streak = rnd() > 0.8;
    if (streak) {
      const len = 6 + rnd() * 26;
      const ang = -90 + (rnd() - 0.5) * 60;
      parts.push(`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - len}" stroke="${color}" stroke-opacity="${op}" stroke-width="${r * 0.9}" stroke-linecap="round" transform="rotate(${ang} ${cx} ${cy})"${blur}/>`);
    } else {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="${op}"${blur}/>`);
    }
  }
  // brasas grandes (carbón) en la base
  const coals = [];
  for (let i = 0; i < 46; i++) {
    const cx = 512 + (rnd() - 0.5) * 560;
    const cy = 860 + (rnd() - 0.5) * 90;
    const w = 40 + rnd() * 110;
    const h = 22 + rnd() * 48;
    const rot = (rnd() - 0.5) * 60;
    coals.push(`<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 3}" fill="#1a0b08" transform="rotate(${rot} ${cx} ${cy})"/>
      <rect x="${cx - w / 2 + 6}" y="${cy - h / 2 + 6}" width="${w - 12}" height="${h - 12}" rx="${h / 3}" fill="url(#coalglow)" transform="rotate(${rot} ${cx} ${cy})" opacity="${0.5 + rnd() * 0.5}"/>`);
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="bigblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
    <filter id="smoke" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="4" seed="41" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 1.3 -0.7"/>
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <radialGradient id="coalglow" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#ffb347"/><stop offset="0.5" stop-color="#ff4d1c"/><stop offset="1" stop-color="#5a0f08" stop-opacity="0.2"/></radialGradient>
    <radialGradient id="base" cx="50%" cy="86%" r="45%"><stop offset="0" stop-color="#ff5a1f" stop-opacity="0.85"/><stop offset="0.5" stop-color="#8a1a10" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx="50%" cy="60%" r="80%"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.9"/></radialGradient>
    <linearGradient id="smokemask" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <mask id="sm"><rect width="100%" height="100%" fill="url(#smokemask)"/></mask>
  </defs>
  <rect width="100%" height="100%" fill="#070404"/>
  <rect width="100%" height="100%" fill="url(#base)"/>
  <ellipse cx="512" cy="860" rx="330" ry="120" fill="#ff5a1f" opacity="0.55" filter="url(#bigblur)"/>
  <g mask="url(#sm)"><rect x="300" y="80" width="424" height="820" filter="url(#smoke)" opacity="0.28"/></g>
  <g>${coals.join("\n")}</g>
  <g>${parts.join("\n")}</g>
  <rect width="100%" height="100%" fill="url(#vig)"/>
</svg>`;
}

async function renderSvg(page, svg, file, quality = 82) {
  await page.setViewportSize({ width: SIZE, height: SIZE });
  await page.setContent(`<html><body style="margin:0;background:#000">${svg}</body></html>`);
  const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  await sharp(png).webp({ quality }).toFile(file);
  console.log("✓", path.relative(OUT, file));
}

async function renderOg(page) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Manrope:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body{margin:0;width:1200px;height:630px;background:#121212;color:#F9F6F0;font-family:Manrope,system-ui;position:relative;overflow:hidden}
    .bg{position:absolute;inset:0;background:url('file://${path.join(OUT, "textures", "iron.webp")}') center/cover;opacity:.9}
    .grad{position:absolute;inset:0;background:linear-gradient(100deg,rgba(18,18,18,.92) 35%,rgba(18,18,18,.35) 70%,rgba(178,30,39,.35))}
    .glow{position:absolute;right:-120px;top:-120px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(216,50,60,.55),transparent 65%);filter:blur(20px)}
    .pan{position:absolute;right:120px;top:150px;width:330px;height:330px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3a3a3a,#141414 60%,#0a0a0a);box-shadow:0 40px 80px rgba(0,0,0,.8),inset 0 0 0 18px #1c1c1c,inset 0 0 0 22px #0d0d0d,0 0 80px rgba(178,30,39,.35)}
    .pan:after{content:"";position:absolute;right:-150px;top:140px;width:190px;height:44px;border-radius:22px;background:linear-gradient(#2a2a2a,#0e0e0e);box-shadow:0 20px 40px rgba(0,0,0,.6)}
    .zamb{position:absolute;width:90px;height:90px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 40% 30%,#ffe3b3,#e39a55 60%,#8a4b1f);box-shadow:0 10px 20px rgba(0,0,0,.6)}
    .wrap{position:absolute;left:80px;top:90px;width:640px}
    .kicker{font-size:18px;letter-spacing:.35em;text-transform:uppercase;color:#D8323C;font-weight:700}
    h1{font-family:'Playfair Display',serif;font-size:74px;line-height:1.02;margin:18px 0 22px;font-weight:700}
    h1 em{font-style:italic;color:#E8C27A}
    p{font-size:24px;line-height:1.4;color:rgba(249,246,240,.78);margin:0 0 34px}
    .row{display:flex;gap:18px;align-items:center}
    .pill{display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:999px;border:1px solid rgba(249,246,240,.2);background:rgba(249,246,240,.06);font-weight:700;font-size:20px}
    .star{color:#E8C27A}
    .addr{position:absolute;left:80px;bottom:56px;font-size:20px;color:rgba(249,246,240,.7);letter-spacing:.04em}
  </style></head><body>
  <div class="bg"></div><div class="grad"></div><div class="glow"></div>
  <div class="pan"><div class="zamb" style="left:110px;top:70px;transform:rotate(-12deg)"></div><div class="zamb" style="left:150px;top:160px;transform:rotate(18deg)"></div><div class="zamb" style="left:60px;top:170px;transform:rotate(-30deg)"></div></div>
  <div class="wrap">
    <div class="kicker">Tixola Tapería · Ourense</div>
    <h1>El Arte del Tapeo en el <em>Corazón</em> de Ourense</h1>
    <p>Zamburiñas a la plancha, pulpo tradicional y los mejores vinos junto a la Catedral.</p>
    <div class="row"><span class="pill"><span class="star">★</span> 4,4 · 858 reseñas Google</span><span class="pill">10 € – 20 €</span></div>
  </div>
  <div class="addr">Rúa Juan de Austria, 7 · 646 45 72 74</div>
  </body></html>`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).jpeg({ quality: 86 }).toFile(path.join(OUT, "og.jpg"));
  console.log("✓ og.jpg");
}

(async () => {
  fs.mkdirSync(path.join(OUT, "textures"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await renderSvg(page, svgs.iron, path.join(OUT, "textures", "iron.webp"));
  await renderSvg(page, svgs.slate, path.join(OUT, "textures", "slate.webp"));
  await renderSvg(page, svgs.stone, path.join(OUT, "textures", "stone.webp"));
  await renderSvg(page, embersSvg(), path.join(OUT, "textures", "embers.webp"), 86);
  await renderOg(page);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
