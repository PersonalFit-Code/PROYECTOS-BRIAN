# Bin & Cami Cakes · web

Landing de una página. Datos verificados con el cliente; ver
`../MARCA-BIN-CAMI-CAKES.md` para el brief completo de marca.

## Añadir las fotos

Son 9 motivos (7 se repiten entre la portada y la galería, así que no hacen
falta 16 fotos distintas). **5 ya están puestas**, generadas con IA como
maqueta mientras llegan las reales:

| Motivo | Archivo | Estado |
|---|---|---|
| Tarta de cumpleaños | `assets/tarta-cumpleanos.jpg` | ✅ puesta (IA) |
| Tarta de boda | `assets/tarta-boda.jpg` | ✅ puesta (IA) |
| Tarta temática | `assets/tarta-tematica.jpg` | ✅ puesta (IA) — lleva un rótulo "Feliz Cumpleaños" horneado en la propia foto; conviene regenerarla sin texto |
| Porción de tres leches | `assets/tres-leches.jpg` | ✅ puesta (IA) |
| Golfeados | `assets/golfeados.jpg` | ✅ puesta (IA) |
| Cookies estilo NY | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |
| Mesa de dulces | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |
| Piñitas (sólo portada) | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |
| El obrador (sólo galería) | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |

Las 4 pendientes comparten un único `placeholder-tarta.jpg` (el mismo degradado
rosa de siempre, sin texto encima) — así en el carrusel de la galería se ve
consistente hasta que llegue cada una. Para sustituir cualquiera cuando llegue
la foto real, hay que cambiarle el `src` en `index.html` a un archivo propio
(por ejemplo `assets/cookies.jpg`) y añadir ese archivo — a diferencia de las
5 ya puestas, éstas SÍ requieren tocar el HTML porque hoy apuntan todas al
mismo placeholder compartido.
Formato: vertical, relación 4:5 (1000×1250 o más).

**Son maqueta con IA, no fotos reales del obrador.** Mientras estén puestas,
la web sigue con `noindex` (ver más abajo) precisamente para que Google no
las indexe como si fueran tartas reales de un negocio real. En cuanto lleguen
las fotos de verdad, sustituir y quitar el `noindex`.

El `alt` no es decorativo: descríbelo de verdad («tarta de unicornio con cuerno
dorado»), que es lo que lee Google y quien usa lector de pantalla.

Antes de subirlas, pásalas a un ancho razonable y comprime. Una foto de móvil
son 4 MB y hace que la web tarde en cargar en datos móviles.

## El carrusel de la galería es un coverflow 3D

La sección «Nuestras tartas» ya no es un scroll horizontal plano: es un
coverflow (tarjeta central grande, las de al lado encogidas y giradas en
perspectiva), adaptado a mano de un componente de React a JS normal — sin
librerías, sin build, igual que el resto de la página. Autoplay cada 5 s en
pausa con el ratón encima, el foco dentro, la pestaña oculta o fuera de
pantalla. Con `prefers-reduced-motion` no hay perspectiva ni autoplay: rejilla
plana con las 8 a la vista, todas las captions visibles de una vez.

Cada tarjeta lleva su propio enlace de WhatsApp con el mensaje ya escrito
("Pregúntanos por esta"), salvo «El obrador», que no vende nada.

Va sobre el blanco de la sección, sin caja oscura detrás. Eso cambia cómo se
finge la profundidad: nada de `brightness()` en las laterales (sobre blanco se
ven grises), el velo oscuro sólo bajo la tarjeta central —la única con texto
encima— y el corte de los lados se funde con una máscara, como en el ticker.

## Falta todavía

- [ ] Las 4 fotos que faltan (cookies, mesa de dulces, piñitas, obrador) + regenerar la de "tarta temática" sin texto horneado
- [ ] Imagen de compartir `assets/og-image.png` (1200×630)
- [ ] Denominación social y NIF para el aviso legal
- [ ] Confirmar el horario del martes (la ficha de Google pone «10:00–2:00»)
- [ ] Dominio: ahora el canonical apunta a `bincamicakes.es`, que hay que ajustar
      al dominio real antes de publicar

## Despliegue

Proyecto en Vercel, equipo **BRIAN** (`centropersonalfit`).

| | |
|---|---|
| URL de producción | https://bin-cami-cakes-centropersonalfit.vercel.app *(sin verificar)* |
| Project ID | `prj_cYpupFUqwiUhVJFiEXSKHNrWj6uG` |
| Team ID | `team_NO14SkEOGredEikP1xjacWZu` |

La URL está sin verificar a propósito: desde aquí no se puede abrir (el proxy
bloquea `*.vercel.app`) ni consultar por la API, así que no se afirma que esté
en pie. Ábrela tú para saberlo.

### Ahora mismo no se puede desplegar desde aquí

Los dos caminos están cerrados, y los dos se abren desde tu cuenta:

1. **GitHub.** `git push` devuelve 403: «Claude doesn't have GitHub access to
   PersonalFit-Code/PROYECTOS-BRIAN for your organization». Falta instalar la
   app de Claude en la organización, desde https://claude.ai/connect-github.
2. **Vercel.** La conexión de Vercel de esta sesión sólo alcanza los proyectos
   `personalfit` y `personalfit-xi.vercel.app`. El proyecto `bin-cami-cakes`
   existe (crearlo devuelve «already exists») pero no se ve ni se puede
   desplegar: producción y preview devuelven 403. Hay que volver a autorizar
   la conexión de Vercel incluyendo `bin-cami-cakes`, o darle acceso a todos
   los proyectos.

Con lo primero arreglado, lo segundo sobra: se conecta el repo a Vercel y cada
push publica solo. Poner `bin-cami-cakes` como *Root Directory* del proyecto.

La web está con `noindex` a propósito hasta que lleguen las fotos y el dominio
real; hasta entonces se puede compartir el enlace sin que Google la indexe.

## Publicar en Vercel (alternativas)

Es estático, no necesita build:

```bash
npx vercel --prod          # desde esta carpeta
```

Si se conecta el repositorio, en la configuración del proyecto hay que poner
`bin-cami-cakes` como *Root Directory* para que no despliegue la raíz.

## Nota sobre Tailwind

Usa el CDN de Tailwind, que compila en el navegador: cómodo para enseñar, pero
añade unos 400 KB de JavaScript y provoca un parpadeo al cargar. Para producción
conviene compilar el CSS (en esta página ocupa **20 KB**):

```bash
npx tailwindcss@3.4.16 -i entrada.css -o estilos.css --content index.html --minify
```

Después, en `index.html`: quitar el `<script src="https://cdn.tailwindcss.com...">`
y el `<script>` con `tailwind.config`, y poner `<link rel="stylesheet" href="estilos.css">`.
Los valores del config están en ese mismo `<script>` para pasarlos a un
`tailwind.config.js`.
