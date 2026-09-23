# Bin & Cami Cakes · web

Landing de una página. Datos verificados con el cliente; ver
`../MARCA-BIN-CAMI-CAKES.md` para el brief completo de marca.

## Añadir las fotos

Busca `FOTO:` en `index.html`. Hay **9 huecos**, cada uno con un comentario
encima que dice qué imagen va ahí. Se sustituye el `<div>` por un `<img>`:

```html
<!-- antes -->
<div class="foto-pendiente h-full w-full"><span>Tarta de cumpleaños</span></div>

<!-- después -->
<img src="assets/tarta-cumpleanos.jpg" alt="Tarta de cumpleaños con figuras"
     class="h-full w-full object-cover" loading="lazy">
```

Huecos, por orden: foto principal del hero (horizontal, 1600 px o más de ancho)
y ocho cuadradas para la galería (1000×1000 basta).

El `alt` no es decorativo: descríbelo de verdad («tarta de unicornio con cuerno
dorado»), que es lo que lee Google y quien usa lector de pantalla.

Antes de subirlas, pásalas a un ancho razonable y comprime. Una foto de móvil
son 4 MB y hace que la web tarde en cargar en datos móviles.

## Falta todavía

- [ ] Las 9 fotos
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
