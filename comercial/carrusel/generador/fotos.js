// Saca una PNG de 1080x1350 por cada <section class="foto"> de carrusel.html.
//
//     node generador/fotos.js
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const raiz = path.resolve(__dirname, "..");
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
  await pagina.goto("file://" + path.join(raiz, "carrusel.html"));
  const fotos = await pagina.$$("section.foto");
  for (let i = 0; i < fotos.length; i++) {
    const destino = path.join(raiz, `noah-carrusel-${i + 1}.png`);
    await fotos[i].screenshot({ path: destino });
    console.log(destino);
  }
  await navegador.close();
})();
