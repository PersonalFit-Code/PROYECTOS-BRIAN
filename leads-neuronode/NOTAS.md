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
