# NOTAS · Leads neuro·node

## Qué es
App para el reto de contactar 1.000 negocios en 10 días (100 al día) en Galicia, Andalucía, Castilla y León
y Extremadura. Next.js + Supabase, con la marca neuro·node. El plan completo está aprobado por Brian (21 nov 2026).

## Hecho
- App base: acceso con email y contraseña, y las pantallas Hoy, Negocios, Ficha, Panel e Importar.
- Base de datos en Supabase: proyecto «Leads neuro-node» (Frankfurt), con las migraciones 0001 y 0002 aplicadas.
  Solo ven los datos los usuarios que estén en la tabla `equipo`.
- **300 negocios cargados** (lote 1) y repartidos: día 1 con 100 de fitness, día 2 con 80 de fitness y 20
  más, día 3 con 100 de clínicas y hostelería. Los ficheros están en `comercial/neuronode/leads/lote1-*.csv`.
- Guiones de llamada por sector: `comercial/neuronode/leads/GUIONES.md`.
- Probado con Playwright el 21 nov 2026: entrar, importar (sin duplicar), repartir en días, apuntar un
  contacto con consentimiento y ver el panel. Sin errores de consola ni scroll horizontal a 375, 768 y 1440 px.

## Falta
- **Usuarios de Brian y Nico:** crearlos en Supabase (Authentication → Add user) y añadirlos a `equipo`.
- **Borrar el usuario de prueba** `prueba@leads-neuronode.test` (está en `equipo` como «Prueba (temporal)»).
- En Supabase: desactivar el registro libre y activar la protección de contraseñas filtradas.
- Diagnóstico y guion de cada negocio (hace falta Firecrawl; los créditos diarios se agotaron el 21 nov).
- Los 700 negocios restantes.
- Propuesta visual y envío de correo con consentimiento (fase 3).
- Desplegar en Vercel: solo cuando Brian lo diga.
- Logo real de neuro·node: ahora hay uno provisional en `public/logo.svg`.
- Correo @neuro-node.com del remitente: lo decide Nico.
- Calidad de los datos: Extremadura y Castilla y León salen en buena parte de Páginas Amarillas; conviene
  comprobar que los negocios siguen abiertos.

## Decisiones
- Canal mixto legal: primer contacto por llamada, formulario o Instagram. El correo solo a quien lo pida;
  la app guarda ese consentimiento.
- Sectores: fitness primero, además de clínicas y hostelería.
- Firma Brian, con correo de neuro·node. Sin precios hasta estar dado de alta.
- App de equipo: Brian y Nico ven y editan todo.
- Next.js en lugar de Vue para reutilizar lo ya hecho en `plan-de-vida` y `andrea-salon`.

## Cómo abrirla en local
1. Copiar `.env.example` a `.env.local` y rellenar las claves de Supabase.
2. `npm install`
3. `npm run dev` y abrir http://localhost:3000

## Publicación (21/11/2026)

- Publicada en **https://leads-neuronode.vercel.app** (proyecto `leads-neuronode`, equipo de Brian en Vercel, servidor en Frankfurt).
- Vercel no pudo enlazar el repositorio para publicar solo con cada cambio (`repo_no_access`). Cada versión nueva se publica a mano desde la rama `claude/life-plan-app-design-mtq0cw`.
- Variables puestas en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Se quitó la protección de Vercel (pedía cuenta de Vercel para ver la web): la app ya tiene su propio acceso.
- **Falta:** crear los usuarios de Brian y Nico y añadirlos a la tabla `equipo`; borrar el usuario de prueba; cerrar el registro público en Supabase.

## Oficina, guiones y acceso sin contraseña (21/11/2026)

- **Acceso:** ya no hay usuario ni contraseña. Se entra abriendo el enlace del equipo, `/entrar/<llave>`. La llave y la cuenta compartida están en las variables de Vercel (`ACCESO_LLAVE`, `ACCESO_EMAIL`, `ACCESO_CLAVE`), no en el código. Para cambiar el enlace basta con cambiar `ACCESO_LLAVE` y volver a publicar.
- `src/app/login/LoginForm.tsx` y `src/app/login/acciones.ts` ya no se usan. No se han borrado: falta el visto bueno de Brian.
- **Oficina** (`/oficina`): cinco puestos (Leo captación, Dora diagnóstico, Gus guion, Olga oferta, Dani diseño). Las cifras salen de la base de datos y el diario, de la tabla `actividad`. Los puestos no trabajan solos: el trabajo se hace en las sesiones con Claude y se apunta en `actividad`.
- **Guion por negocio** (`src/lib/guion.ts`): se monta con lo que sabemos (sin web, solo Instagram, reservas a mano…). Orden: entrada personalizada, una pregunta, caso real, tres mejoras gratis y cierre con dos opciones. A las clínicas, de usted. Si se escribe uno a medida, va en `propuestas.guion` y manda sobre el automático.
- El guion **promete tres mejoras gratis en una videollamada de 15 minutos**. Brian tiene que estar de acuerdo con cumplirlo.
- **Falta:** diagnóstico real de los 100 del día 1 (créditos de Firecrawl), guiones a medida, los 700 negocios que faltan y la fase de propuesta visual y correo.

- **Sector nuevo `infoproducto`** (infoproductores y coaches, para el setter con IA): guion propio, de tú y en singular, sin casos de cliente (no hay ninguno todavía) y con mensaje para Instagram. Comunidad «Toda España». Faltan los negocios: se buscan cuando vuelvan los créditos de Firecrawl.

## Oficina en 3D y tanda diaria (21/11/2026)

- `/oficina` es ahora una sala dibujada en diagonal (`src/components/OficinaIso.tsx`), con la librería `motion`. Seis mesas: los cinco puestos y la de Brian (llamadas). Las fichas que viajan y el número de cada tramo son los negocios que esperan para pasar a la mesa siguiente; salen de la base de datos.
- **Tanda diaria:** tarea programada «Oficina neuro·node: tanda diaria», todos los días a las 06:43 (hora de Madrid). Se ejecuta dentro de la misma sesión de Claude en la que se creó, porque es la que tiene las conexiones con Supabase y Firecrawl. Hace diagnóstico (25 negocios), guion a medida, captación (20) y lo apunta en `actividad`. Si esa sesión se archiva, la tanda deja de funcionar y hay que volver a programarla.
- La tanda no llama, no escribe a nadie, no borra y no publica.
