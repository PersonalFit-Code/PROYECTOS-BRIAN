# Hungceed · maqueta de la web nueva

Maqueta para enseñar a Jose (Hungceed) en la llamada: portada, categorías con filtros, ficha de
producto, página del gimnasio con tarifas, envíos y garantía, y WhatsApp. **No es la web final**:
el rediseño de verdad se hace dentro de su WordPress/WooCommerce (ver el contexto del cliente).

- Next.js 16 + Tailwind 4. Sin base de datos, sin pagos, sin formularios.
- Catálogo, precios y tarifas reales sacados de hungceed.es el 3/11/2026 (`src/data/`). Donde su
  tienda no publica precio, sale «Consultar precio». Las fotos se cargan desde hungceed.es.
- Las opiniones son marcos de ejemplo rotulados como tales: no hay reseñas inventadas.
- `noindex` en todas las páginas.
- Recicla de la plantilla de Andrea Salón solo el diseño: botón con barrido, marquesina, menú
  curvo del móvil, cabecera de dos filas, listas numeradas y revelados al hacer scroll.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

## Pendiente de Jose
- Logo en vectorial (SVG). El de ahora es provisional, tipográfico con la flecha.
- Confirmar el número de WhatsApp (se usa el del gimnasio, 621 22 18 20).
- Gimnasio: horario, dirección, fotos de la sala y el enlace de Virtuagym de cada tarifa.
- Envíos: zonas, coste y si hay montaje.
