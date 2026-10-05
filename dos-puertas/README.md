# Café Bar Dos Puertas · web

Propuesta de web para el Dos Puertas (rúa dos Fornos, 7 · Ourense). Mismo lenguaje visual que
`tixola-taperia`, con la marca sacada del rótulo real: tablero azul tinta, letras doradas
(Pirata One) y la luz ámbar que lo ilumina.

```bash
npm install
npm run dev        # http://localhost:3000 → redirige a /es
npm run typecheck && npm run lint && npm run build
```

## Rutas

| Ruta | Qué hay |
| --- | --- |
| `/es` | Portada: fachada ilustrada (la luz depende de si está abierto ahora), la barra, cómo funciona, historia, reseñas, visita |
| `/es/barra` | Toda la barra con filtros por categoría y ficha de cada pincho |
| `/es/historia` | Línea de tiempo 1950s → hoy y la anécdota de Amancio Ortega |
| `/es/visita` | Horario en vivo, dirección, pago y preguntas frecuentes |

## Dónde está cada cosa

- Datos: `src/data/business.ts`, `menu.ts`, `reviews.ts` (un dato = un fichero).
- Textos: `src/i18n/messages/es/index.ts` (nada de literales en componentes; para añadir gallego o
  inglés basta con un fichero más y una entrada en `src/i18n/config.ts`).
- Colores y tipografías: `src/app/globals.css` (`@theme`).
- Fuentes de los datos: `BRIEF.md`.

## Pendiente de confirmar con Marisa

- [ ] Fotos reales de los pinchos (hoy son ilustraciones) y del local.
- [ ] Precios: la pizarra de la fachada (2025) dice pinchos 2 € y bocadillos 4 €; el brief decía 1,50–2,50 €.
- [ ] Precios de las raciones y referencias de vinos.
- [ ] Alérgenos.
- [ ] Teléfono y horario: TripAdvisor publica otro número (988 22 11 16) y apertura a las 18:00.
- [ ] Coordenadas exactas, dominio y datos del titular para el aviso legal.
- [ ] Foto nítida del rótulo para afinar color y tipografía.
