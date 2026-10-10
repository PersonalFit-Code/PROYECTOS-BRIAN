# Lista de lanzamiento — Tixola (revisión del 6-10-2026)

Revisión hecha leyendo el código y las condiciones actuales de Vercel (docs, actualizadas el
14-9-2026). No es asesoramiento jurídico: para lo que dependa de criterio legal, consultar con la
gestoría de Tatiana.

## A · Bloquean el lanzamiento

1. **Plan de Vercel.** El plan gratuito es "solo uso personal no comercial", y Vercel cuenta como
   comercial "anunciar la venta de un producto o servicio" (vercel.com/docs/limits/fair-use-guidelines).
   Una web de un bar lo es. Opciones: Pro (≈ 20 $/mes, a confirmar en su página de precios) o mover la
   web a otro proveedor que permita uso comercial gratis (hay que migrar y probar el camarero, que
   necesita servidor). Decidir quién es el titular de la cuenta que paga.
2. **Correo de contacto** en `src/data/legal.ts` (`email`). Obligatorio por el art. 10 LSSI y es el
   canal para ejercer derechos RGPD. Mientras sea `[EMAIL DE CONTACTO]`, las tres páginas legales van
   `noindex`. Al ponerlo, solas pasan a indexarse.
3. **Dirección de la web** (`NEXT_PUBLIC_SITE_URL` en Vercel). Hoy, sin definir, cae en
   `https://tixola.restaurantesourense.com`, que no es suya. Afecta a canonical, hreflang, sitemap y
   previsualizaciones. Definirla con el dominio comprado y redesplegar.
4. **Alérgenos revisados por Tatiana.** Son una deducción a partir de la receta, no un dato de la casa.
   La web avisa de que se consulten con el personal, pero publicar alérgenos sin verificar es el
   riesgo más serio (sanitario y de responsabilidad). Que los revise o firme `docs/alergenos-para-revisar.md`.

## B · Hay que decidir (riesgo real, pero depende de cómo lo quiera la casa)

5. **Reseñas reproducidas.** `src/data/reviews.ts` copia 40 reseñas de TripAdvisor y Google, literales y
   con el nombre de usuario. Las plataformas prohíben reutilizar su contenido fuera de sus herramientas
   oficiales y cada reseña tiene derechos de su autor. Opciones: (a) usar los widgets oficiales,
   (b) pedir permiso, (c) dejar solo la nota media y el enlace a cada plataforma, o (d) dejar solo
   frases muy cortas con enlace a la reseña original.
6. **"Nº 1 en zamburiñas de la zona".** Es una afirmación de superioridad: hay que poder demostrarla
   (de dónde sale). Si no, cambiarla por algo comprobable o quitarla. Publicidad comparativa/engañosa
   (Ley de Competencia Desleal).
7. **Cifras de TripAdvisor/Google** (4,2 · 233 reseñas · nº 19 de 496 · 4,4 · 858) escritas a mano en
   `business.ts`. Si se quedan antiguas, son datos engañosos. Actualizarlas de vez en cuando o poner la fecha.
8. **Foto de la fachada.** `public/images/fachada.jpg` era una captura de un visor de fotos (ya recortada),
   de procedencia desconocida, con un camarero reconocible. Sustituir por una foto propia.
9. **"Los mejores vinos junto a la Catedral"** (`business.ts`, `subtitle`). Es un superlativo; mejor
   "buenos vinos" o "vinos de la zona" si no se puede probar.

## C · Ya está bien (comprobado)

- Sin analíticas ni rastreadores: no hay Google Analytics, Vercel Analytics ni píxeles. Las tipografías
  van alojadas en el propio servidor (no llaman a Google Fonts). Google Maps solo carga tras aceptar.
- Banner de cookies con rechazar/configurar al mismo nivel; consentimiento caduca a los 12 meses.
- Política de privacidad: encargados (Vercel, Anthropic), transferencias a EE. UU., plazos, derechos, AEPD.
- El camarero virtual se identifica como IA ("Asistente con IA"), avisa de que lo escrito se envía al
  proveedor y no guarda conversaciones.
- Precios con IVA incluido. Atribución de OpenStreetMap (Galicia) y Natural Earth (mundo, dominio público).
- Sin fotos con clientes reconocibles (se excluyeron dos del comedor).
- Datos del titular (nombre, NIF, domicilio) puestos; el registro mercantil no aplica a una autónoma.

## D · Después de lanzar

- Mirar el consumo real del camarero en la consola de Anthropic a la semana; recarga automática
  desactivada y límite mensual puesto.
- Vigilar que no entren cambios de precios/alérgenos sin pasar por la lista de integridad (`menu.ts`).

## E · Auditoría del camarero virtual (9-10-2026)

Comprobado en el navegador y leyendo `src/app/api/chat/route.ts`:

- **Se sabe que es IA:** la bienvenida dice "asistente de inteligencia artificial (no una persona)", la
  etiqueta "Asistente con IA" va en el pie del panel y el prompt le obliga a decirlo si le preguntan.
- **No guarda datos:** el servidor no tiene base de datos ni escribe el contenido de los mensajes en los
  registros; solo cuenta peticiones por IP durante 10 minutos en memoria (contra abusos), y está dicho en
  la política. En el navegador la conversación vive en `sessionStorage` (se borra al cerrar la pestaña o
  con "Nueva conversación"); no pone cookies, no usa `localStorage` y no llama a ningún tercero.
- **Lo que sí ocurre y ahora se dice con claridad:** el texto sale hacia Anthropic (EE. UU.), que según su
  documentación (privacy.claude.com, 1-7-2026) lo elimina en 30 días como máximo, salvo ley o un uso que
  incumpla sus políticas (hasta 2 años). Antes el aviso decía solo "no lo guardamos".
- **Datos de salud:** preguntar por alérgenos invita a contar "soy celíaco". El aviso pide no escribir datos
  personales ni de salud, y el prompt le prohíbe pedirlos o repetirlos.
- **Pendiente de la casa:** el contrato con Anthropic (cuenta y facturación) debe estar a nombre de quien
  figure como responsable; si la cuenta es de Brian y la web de Tatiana, Brian actúa como encargado y
  conviene un acuerdo de tratamiento de datos entre ambos.
- **Nota:** la obligación de avisar de que se habla con una IA (Reglamento de IA, art. 50) es exigible
  desde agosto de 2026; confirmar con la gestoría el alcance exacto para un chat de un bar.

## F · Seguridad: las "20 cosas antes de lanzar" (9-10-2026)

La web no tiene base de datos, ni usuarios con contraseña, ni subida de archivos. Por eso la mitad de
la lista no aplica: no hay nada que filtrar por usuario ni contraseñas que proteger. Lo que sí aplica:

| # | Punto | Estado |
|---|---|---|
| 1 | Ocultar API keys | OK. `ANTHROPIC_API_KEY` solo en el servidor (Vercel, marcada como sensible); no aparece en el código que descarga el navegador. |
| 2 | Secretos fuera de Git | OK. Revisado todo el historial: ninguna clave. `.env` está en `.gitignore`. |
| 3–10 | Key de BD, RLS, cifrado, login, acceso a registros, campos, cookies de sesión, contraseñas | No aplica (sin BD ni login). La única cookie, `NEXT_LOCALE` (idioma), va ahora con `Secure` y `SameSite=Lax`. |
| 11 | Rate limiting | OK. 30 preguntas por IP cada 10 min en `/api/chat`. **Además: poner un tope de gasto mensual en la consola de Anthropic y desactivar la recarga automática.** |
| 12 | Protección contra bots | Añadido. `/api/chat` rechaza (403) peticiones que no vengan de la propia web, y (413) cuerpos de más de 96 KB. |
| 13 | Queries parametrizadas | No aplica (sin BD). |
| 14 | Validar inputs | OK. Máx. 20 mensajes × 1000 caracteres, roles válidos, idioma y página en lista cerrada. |
| 15 | Sanitizar contenido | OK. Las respuestas del chat se pintan como texto con React (nunca HTML) y solo con enlaces seguros; el JSON-LD escapa `<` `>` `&`. |
| 16 | Restringir archivos | No aplica (no se suben archivos). |
| 17 | Devolver solo lo necesario | OK. La API devuelve solo el texto de la respuesta; los errores no enseñan detalles internos. |
| 18 | Cabeceras de seguridad | Añadido en `next.config.ts`: CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP; quitado `X-Powered-By`. |
| 19 | Forzar HTTPS | OK. Vercel redirige a HTTPS y HSTS obliga al navegador a no usar http. |
| 20 | Escanear dependencias | Hecho. Next 16.4.0 y sharp 0.35.5 parcheados. Queda un aviso en `braces` (solo herramienta de lint, no llega a la web; el "arreglo" propuesto es bajar a una versión vieja). Repetir `npm audit` antes de cada cambio grande. |

## G · "20 cosas antes de lanzar tu web" (10-10-2026)

| # | Punto | Estado |
|---|---|---|
| 1–3 | Aviso legal, privacidad, cookies | Páginas y banner hechos en 4 idiomas. **Faltan los datos fiscales y el email** (ver A). |
| 4 | HTTPS | OK (Vercel + HSTS). |
| 5 | Títulos y descripciones | OK en las 24 páginas: títulos ≤ 60 caracteres, descripciones 127–171, únicas por idioma. |
| 6 | Datos estructurados | OK: Restaurant, Menu, FAQPage, BreadcrumbList. |
| 7 | Sitemap y robots.txt | **Arreglado**: apuntaban a `tixola.restaurantesourense.com`. Ahora usan el dominio de producción de Vercel, que cambia solo al dominio propio cuando se marque como principal. |
| 8 | Ficha de Google | **Tarea de la casa**: en Google Business Profile, poner como sitio web el dominio nuevo, revisar horario y fotos, y responder reseñas. |
| 9 | Favicon | **Añadido**: `favicon.ico`, icono de iPhone (180 px), manifiesto e iconos de Android (192/512). |
| 10 | Texto alternativo | OK: todas las imágenes tienen `alt` en los 4 idiomas. |
| 11 | Imágenes comprimidas | OK: todas pasan por `next/image`, que las sirve en AVIF/WebP al tamaño de cada pantalla. |
| 12 | Velocidad | OK: páginas estáticas, sin librerías pesadas fuera de la portada, medido en rondas anteriores. |
| 13 | Contraste | OK: revisado en la ronda Liquid Glass (≥ 4,5:1). |
| 14 | Móvil | OK: revisado a 4 anchos en todas las páginas. |
| 15 | 404 personalizada | OK, en los 4 idiomas. |
| 16 | Enlaces rotos | OK: 0 rotos. Limpiados además los enlaces de Google Maps (llevaban un `place_id` vacío). |
| 17 | Formularios contra spam | No hay formularios. El chat tiene filtro de origen, cuota por IP y tope de tamaño. |
| 18 | WhatsApp visible | OK: botón flotante en escritorio y en el dock del móvil. |
| 19 | Analítica | **Pendiente de decisión**: Vercel Web Analytics (sin cookies, no necesita banner). Se activa en el panel de Vercel y hay que mencionarla en la política de privacidad. |
| 20 | Una sola llamada a la acción | OK: en la portada, "Ver la carta" es la única acción principal; "Cómo llegar" va como secundaria. |
