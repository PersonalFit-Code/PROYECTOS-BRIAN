# Landing Page Local · Plantilla de alta conversión

Plantilla de una sola página (`index.html`) para vender y desplegar landings a negocios
locales que aún no tienen web. Configurada de serie para **Ourense**, preparada para
clonar a otras ciudades.

Demo actual: `Reformas Auria` · reformas integrales · Ourense.

---

## 1. Adaptar a un cliente nuevo (8 buscar/reemplazar)

Abre `index.html` y reemplaza en todo el archivo:

| # | Busca | Reemplaza por | Apariciones |
|---|-------|---------------|-------------|
| 1 | `Reformas Auria` | Nombre del negocio | 26 |
| 2 | `Ourense` | Ciudad | 58 |
| 3 | `Rúa do Progreso 45` | Calle y número | 8 |
| 4 | `32003` | Código postal | 11 |
| 5 | `+34988000000` | Teléfono en formato `tel:` (sin espacios) | 11 |
| 6 | `988 000 000` | Teléfono como se lee en pantalla | 14 |
| 7 | `34600000000` | WhatsApp en formato `wa.me` (sin `+` ni espacios) | 7 |
| 8 | `reformasauria.es` | Dominio | 18 |

Después ajusta a mano, que no son reemplazos mecánicos:

- **`<title>` y `meta description`** — el patrón que funciona en SEO local es
  `[Servicio] en [Ciudad] | [Negocio]`.
- **`<h1>`** — mismo patrón. Un solo H1 por página, no lo dupliques.
- **Coordenadas** — `geo.position`, `ICBM` y el bloque `geo` del JSON-LD.
  Saca lat/long con clic derecho en Google Maps → la primera línea del menú.
- **6 tarjetas de servicio** — título, descripción, precio y plazo.
- **4 preguntas del FAQ** — deben coincidir palabra por palabra con el bloque
  `FAQPage` del JSON-LD, o Google descarta el rich snippet.
- **3 testimonios** — ver aviso en el punto 4.
- **Horarios** — la tabla visible y el `openingHoursSpecification` del JSON-LD.
- **Datos fiscales** — NIF y titular en el bloque de Aviso legal.

### Paleta

Un único sitio, al principio del `<style>`:

```css
:root{
  --brand:       #1E3A8A;   /* color principal            */
  --brand-light: #2E4FAE;   /* hover y degradados         */
  --brand-dark:  #152A63;   /* hover de botones           */
  --brand-tint:  #EEF3FF;   /* fondos suaves de iconos    */
  --accent:      #F59E0B;   /* CTA                        */
  --accent-dark: #B45309;   /* acento sobre blanco (AA)   */
}
```

Azul + ámbar es una combinación deliberada: azul transmite fiabilidad y el ámbar
destaca sobre él, así que el CTA gana el ojo. Si cambias `--accent` a un color
claro, comprueba el contraste del texto encima: `--accent-dark` existe justo
para eso, para el acento sobre fondo blanco.

### Expandir a otra ciudad

Duplica el archivo por ciudad (`ourense/index.html`, `vigo/index.html`…) en lugar de
meter varias ciudades en una sola página: Google posiciona mejor una URL por
localidad, y una página que menciona cinco ciudades no destaca en ninguna.
Por ciudad hay que cambiar: ciudad, dirección, coordenadas, `areaServed`,
canonical y las referencias de barrio del copy (en la demo: Centro, A Ponte,
As Lagoas, Barbadás).

---

## 2. Qué incluye

**SEO técnico**
- `LocalBusiness` (subtipo `HomeAndConstructionBusiness`) con NAP, `geo`,
  `openingHoursSpecification`, `areaServed`, `hasOfferCatalog` y `hasMap`.
- `FAQPage` para ocupar más espacio en la SERP.
- Open Graph + Twitter Card completos, `canonical`, `robots`, geo-meta,
  favicon SVG embebido (cero peticiones) y `assets/og-image.png` a 1200×630.

**Conversión**
- CTA de llamada siempre visible: botón ancho en escritorio, botón táctil de
  44×44 px en móvil.
- Doble CTA en el hero (formulario + WhatsApp) y CTA de cierre al final.
- Formulario que **no necesita backend**: valida y abre WhatsApp con los datos
  ya escritos. Funciona en hosting estático sin PHP ni servicios de formularios.
- Botón flotante de WhatsApp con animación de pulso.

**Accesibilidad (WCAG 2.1 AA)**
- Enlace de salto al contenido, `aria-expanded`/`aria-controls` en el menú,
  cierre con `Escape`, foco visible, `prefers-reduced-motion`, tabla de horarios
  con `<th scope="row">`, iframe con `title`.
- Contraste medido: entre 5,02:1 y 10,36:1. AA exige 4,5:1.

---

## 3. Publicar

Es un archivo estático: sirve cualquier hosting.

```bash
# Netlify
npx netlify-cli deploy --prod --dir .

# Vercel
npx vercel --prod

# GitHub Pages: Settings > Pages > Deploy from branch
```

Sube también la carpeta `assets/` o las vistas previas al compartir el enlace
por WhatsApp saldrán sin imagen.

### Sobre Tailwind por CDN

El archivo usa `cdn.tailwindcss.com`, que compila el CSS **en el navegador**.
Es cómodo para enseñar la maqueta a un cliente, pero conviene saber lo que cuesta:
añade unos 400 KB de JavaScript, provoca un parpadeo sin estilos al cargar y la
página deja de verse si el CDN falla. Tailwind lo documenta como build de
desarrollo.

Para una landing en producción que va a recibir tráfico de pago, compila el CSS.
Son dos comandos y en esta plantilla el resultado fueron **24 KB**:

```bash
npx tailwindcss@3.4.16 -i entrada.css -o estilos.css --content index.html --minify
# luego en index.html:
#   quita  <script src="https://cdn.tailwindcss.com/3.4.16"></script>  y el <script> de tailwind.config
#   pon    <link rel="stylesheet" href="estilos.css">
```

Necesitarás pasar el `tailwind.config` inline a un `tailwind.config.js`; los
valores están tal cual en el `<script>` del `<head>`.

---

## 4. Antes de publicar

- [ ] **Teléfonos reales.** Los de la demo (`988 000 000`, `600 000 000`) son
      rangos no asignados: no llaman a nadie. Es el fallo que más caro sale.
- [ ] **Testimonios reales.** Los tres de la plantilla son ejemplos de
      estructura. Cópialos literalmente del perfil de Google del cliente, con su
      nombre y fecha. Publicar reseñas inventadas es publicidad engañosa y Google
      puede penalizar el perfil de empresa.
- [ ] **`aggregateRating` sigue desactivado** en el JSON-LD, a propósito.
      Actívalo solo cuando haya reseñas verificadas y visibles en la página;
      marcarlo con datos inventados expone el dominio a una acción manual.
      El bloque comentado con la sintaxis está junto al JSON-LD.
- [ ] **El badge «4,9 · 87 reseñas» del bloque de opiniones es visual.** Pon las
      cifras reales del cliente o quita el badge.
- [ ] **Precios y plazos** confirmados con el cliente: figuran como orientativos
      en el aviso legal, pero conviene que sean ciertos.
- [ ] **Textos legales** revisados con el titular (NIF, denominación social).
- [ ] **Si añades Google Analytics o píxel de Meta**, hace falta banner de
      consentimiento previo. Tal como está ahora la web no instala cookies
      propias, solo las de Google Maps y Google Fonts.
- [ ] Comparte el enlace en WhatsApp para ver que la vista previa sale bien.

---

## 5. Verificación ejecutada

Comprobado con Chromium sobre el archivo real:

| Prueba | Resultado |
|---|---|
| Etiquetas HTML balanceadas, sin `id` duplicados | correcto |
| 10 anclas internas resuelven a un `id` existente | correcto |
| 2 bloques JSON-LD parsean como JSON válido | correcto |
| Menú móvil: abre, cierra al pulsar enlace, cierra con `Escape`, `aria-expanded` coherente | correcto |
| Sin scroll horizontal a 390 px | correcto |
| Formulario: 4 reglas de validación y URL de WhatsApp bien codificada | correcto |
| Anclas no quedan tapadas por el header fijo (88 px vs 73 px) | correcto |
| Contraste AA en 6 combinaciones medidas | 5,02:1 – 10,36:1 |
| Los 27 bloques animados acaban visibles al recorrer la página | correcto |
| 13 iconos Lucide hidratan con `aria-hidden` | correcto |
| Consola sin errores, sin peticiones fallidas | correcto |

Un matiz de honestidad: la verificación se hizo con Tailwind y Lucide servidos
en local, porque la política de red de este entorno bloquea `cdn.tailwindcss.com`,
`cdn.jsdelivr.net` y Google Fonts. El HTML entregado es idéntico y apunta a los
CDN; lo que no he podido comprobar desde aquí es la carga de esos tres dominios
ni el render con las tipografías Inter y Plus Jakarta Sans (en las capturas se ve
con la fuente de sistema de sustitución). El iframe de Google Maps tampoco carga
aquí por el mismo motivo — de ahí que le haya añadido un contenido de reserva con
la dirección y un enlace a Maps, que es lo que se ve si el mapa no llega a pintar.
