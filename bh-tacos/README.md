# BH Tacos · web

Web de **BH Tacos**, French tacos en Rúa Pena Trevinca, 12 Bajo (32005 Ourense). Next.js 16 +
Tailwind CSS 4 + TypeScript estricto, el mismo stack que `dos-puertas/`. Todo es estático: no hay
servidor ni base de datos. Los pedidos se derivan a WhatsApp, al teléfono o a Just Eat y Uber Eats.

**En vivo:** https://bh-tacos.vercel.app (proyecto `bh-tacos` en el equipo BRIAN de Vercel, carpeta raíz
`bh-tacos/`). Igual que `dos-puertas`, la app de GitHub de Vercel no tiene acceso de escritura al
repositorio, así que **no se redespliega sola con cada push**: cada versión se lanza a producción desde
su commit de GitHub (API de Vercel con `gitSource`). Para que sea automático, dar acceso a la app de
Vercel en GitHub y conectar el repositorio en Settings → Git del proyecto.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

## Rutas

| Ruta | Qué hay |
| --- | --- |
| `/` | Hero con estado abierto/cerrado en vivo, diagrama de capas del taco, tamaños M/L/XL, salsas, favoritos y combos, zona gaming PS5, reseñas, FAQ (con JSON-LD FAQPage) y CTA final |
| `/carta` | Carta completa con pestañas fijas: haz tu taco, rebozados, entrantes y bebidas. Cada taco lleva a «Personalizar» |
| `/monta-tu-taco` | Configurador en 6 pasos (estilo, tamaño, carnes, salsas, extras y resumen) con vista previa SVG en vivo. Pedido por WhatsApp o llamada |
| `/contacto` | Cómo pedir, horario con el día de hoy marcado, mapa (solo con permiso de cookies), formulario `mailto:` y redes |
| `/sobre-nosotros` | Historia, Patricia y Hassan (La Voz de Galicia), valores y CTA |
| `/aviso-legal` · `/privacidad` · `/cookies` | Textos legales **placeholder** (noindex) |
| `/robots.txt` · `/sitemap.xml` · `/opengraph-image` | SEO, generados desde `src/app/` |

## Dónde se cambia cada cosa

### La carta: `src/data/menu.json`
Es la única fuente de la carta: los componentes no tienen ni un precio escrito.
- **Precios de los tacos**: `tacoStyles[].prices` (por estilo y tamaño) y `categories[].items[].price` (lo que se ve en la carta). Si cambias uno, cambia el otro.
- **Carnes**: `meats` (el `color` es el del trozo en el dibujo).
- **Salsas**: `sauces`, con `spice` (1–3), `profile`, `origin`, `pairing` y `color`. La que lleva `"default": true` sale marcada. `maxFreeSauces` es el límite de salsas gratis.
- **Extras**: `extras` (`price` en euros).
- **Tamaños**: `tacoSizes`. `meats` es el límite de carnes y `scale` el tamaño del dibujo.
- **Combos**: `combos[].items` son los `id` de los productos. El precio se suma solo.
- Lo que lleva `"todo": true` está por confirmar con el local.

### Datos del local, textos y horario: `src/content.ts`
- **Teléfono, WhatsApp, email, dirección y redes**: `BUSINESS`. El WhatsApp va sin `+` (formato wa.me: `34600111222`).
- **Horario**: `HOURS`. Un día sin tramos está cerrado, y un cierre `"00:00"` es medianoche. El estado abierto/cerrado, el widget de contacto y el JSON-LD salen de ahí. El resumen del pie es `HOURS_SUMMARY`.
- **Textos** de todas las páginas, reseñas (`REVIEWS`), FAQ, textos legales (`LEGAL`, `LEGAL_OWNER`) y SEO (`SEO`).
- **Dominio**: `BUSINESS.siteUrl` (lo usan el sitemap, el robots, las canónicas y el JSON-LD).

### Colores y tipografías: `src/app/globals.css`
Los tokens de la paleta, los dos temas (oscuro por defecto y claro) y las curvas de animación. Las
fuentes (Anton e Inter) están en `src/app/fonts.ts`.

## Decisiones

- **Datos reales, no los del brief**: el teléfono 988 601 723, el Instagram @bhtacos y el horario (lunes cerrado; de martes a domingo 12:30–16:30 y 20:00–00:00) salen de Páxinas Galegas. Los textos que en el brief daban horas fijas («cierra a las 16:00») se calculan con el horario real.
- **Carta del local**: tamaños, precios (M 6,99 €, L 7,99 €, XL 9,99 €), carnes, las 9 salsas y los gratinados salen del cartel «Hazte un taco» del local (`fotos/originales/cartel-hazte-un-taco.png`). Entrantes y bebidas, de Uber Eats y Just Eat. En las apps los tacos cuestan más (8,99 / 9,99 / 11,99 €) y la carta lo avisa.
- **Marca real**: el logo (`src/components/common/Logo.tsx`) está redibujado en SVG a partir de su insignia redonda. La paleta (naranja, amarillo, marrón y crema sobre carbón) sale del logo y del cartel. Sobre el naranja el texto va en tinta oscura, porque el blanco no llega al contraste AA.
- **Fotos**: van en `src/data/photos.ts` por huecos. Donde aún no hay foto se ve un bloque de marca (crema, plancha y el taco del logo), nunca un dibujo de comida. Para añadir una: original en `fotos/originales/`, `python3 scripts/fotos.py`, importarla en `photos.ts` y asignarla a su hueco.
- **Historia**: se mantiene el copy de marca (Lyon) y se añade la historia real de La Voz de Galicia (26-05-2025). Hassan aprendió la receta en Marruecos, donde su familia tiene varios locales de tacos, y abrió el local con su pareja, Patricia da Silva.
- **Cookies**: la web solo guarda datos técnicos en `localStorage` (`bh_theme`, `bh_taco_draft` y `bh_cookie_consent`). El mapa de Google sí pone cookies de terceros, así que hay banner (Aceptar / Rechazar / Más info) y el mapa no se carga sin permiso. Rechazar es tan fácil como aceptar, como exige la AEPD.
- **Animación**: sigue las pautas de Emil Kowalski ([emilkowalski/skills](https://github.com/emilkowalski/skills)): curvas propias, UI por debajo de 300 ms, solo `transform`/`opacity`, `scale(0.97)` al pulsar, hover solo con puntero fino, nunca desde `scale(0)`, stagger de 60 ms, confeti solo al terminar el taco y movimiento reducido respetado. Sin librerías de animación.
- **Peso**: el JS inicial ronda los 186–192 KB gzip. Unos 155 KB son React 19 + el runtime de Next 16, que una página vacía de Next ya carga. El código propio son unos 30 KB. El objetivo de 150 KB del brief no se alcanza con Next; habría que pasar a una SPA sin framework de servidor y se perdería el HTML prerenderizado que da el SEO.
- **Mínimo una carne**: el configurador no deja pasar del paso de carnes sin elegir al menos una.

## Desplegar

**Vercel**: ya está creado (ver «En vivo» arriba). Para montarlo de cero: New Project → este
repositorio → *Root Directory* `bh-tacos`. El framework se detecta solo y no hace falta ninguna
variable de entorno. Con un dominio propio, cambiar también `BUSINESS.siteUrl`.

**Netlify**: New site → este repositorio, *Base directory* `bh-tacos`, *Build command*
`npm run build`. El runtime de Next de Netlify se instala solo.

## Antes de publicar: lo que tiene que rellenar el cliente

- [ ] Número de **WhatsApp** real (`BUSINESS.whatsapp`, hoy `34988000000`).
- [ ] **Email** real (`BUSINESS.email`, hoy `hola@bhtacos.es`).
- [ ] Perfil de **TikTok** (`BUSINESS.social.tiktok`).
- [ ] **Dominio** (`BUSINESS.siteUrl`) y las coordenadas exactas (`BUSINESS.geo`).
- [ ] **Textos legales reales** redactados o revisados por un profesional (`LEGAL`), con **NIF**, razón social y datos fiscales (`LEGAL_OWNER`). Después, quitar el `noindex` de las tres páginas legales y meterlas en `src/app/sitemap.ts`.
- [ ] **Permiso del local** para usar sus fotos (hoy: imagen promocional con el logo y el interior del local, de Google).
- [ ] **Fotos de producto en buena resolución**: taco cortado, clásico, rebozado, entrantes y la zona de la PS5. Los huecos están en `src/data/photos.ts`; hoy enseñan el bloque de marca.
- [ ] **Testimonios reales**, con permiso (`REVIEWS`).
- [ ] **Logos oficiales** de Just Eat y Uber Eats (hoy son botones con sus colores).
- [ ] Confirmar con el local (`menu.json`, marcados con `todo`): los precios de los **gratinados** y toppings (en la foto del cartel no se leen), el precio del **rebozado** (el cartel no lo trae; hoy +3 €), si los **tenders** llevan suplemento, las descripciones de las **salsas** y la lista de **bebidas francesas importadas**.
- [ ] Confirmar el **horario** y los precios del local (los de la web son los de las apps de reparto).
- [ ] Confirmar la frase «A 5 min andando de la Plaza Mayor. Junto a la estación de tren.» (`CONTACT.mapExtra`).
