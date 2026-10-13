# Persianas López (Ourense)

Web estática en castellano y gallego. Se genera con `npm run build` en `dist/`.

## Estructura

- `src/config.mjs`: datos del negocio, analítica y precios orientativos del asistente. **Aquí van los datos pendientes** (NIF, correo, horario…).
- `src/content/es.mjs` y `src/content/gl.mjs`: todos los textos de la web.
- `src/templates/`: plantillas HTML (portada, servicios, catálogo, barrios, páginas legales).
- `src/assets/`: JavaScript (menú, persiana, asistente de presupuesto, catálogo de colores).
- `src/styles.css`: estilos (Tailwind compilado, sin CDN).
- `src/fotos/`: deja aquí fotos JPG o PNG y al compilar se publican en WebP en `/fotos/`.
- `build.mjs`: genera páginas, estilos, tipografías propias, `og.png`, `sitemap.xml` y `robots.txt`.

## Pendiente con el negocio

- Datos del titular para el aviso legal y la privacidad (`SITIO.titular` en `src/config.mjs`).
- Horario exacto y coordenadas de la tienda.
- Archivo original del logo (ahora es una recreación en SVG a partir del cartel).
- Fotos reales de trabajos y de repuestos.
- Precios orientativos para el asistente (`PRECIOS` en `src/config.mjs`), si quieren que dé cifras.
- Analítica: crear la cuenta de GoatCounter y poner el código en `ANALITICA.goatcounter`.
