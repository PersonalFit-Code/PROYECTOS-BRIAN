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
