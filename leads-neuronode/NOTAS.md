# NOTAS · Leads neuro·node

## Qué es
App para el reto de contactar 1.000 negocios en 10 días (100 al día) en Galicia, Andalucía, Castilla y León
y Extremadura. Next.js + Supabase, con la marca neuro·node. El plan completo está aprobado por Brian (21 nov 2026).

## Hecho
- App base: acceso con email y contraseña, y cuatro pantallas:
  - **Hoy:** los negocios del día.
  - **Negocios:** lista con filtros.
  - **Ficha:** datos, lo que hemos visto, qué decirle, apuntar un contacto e historial.
  - **Panel:** avance del reto.
  - **Importar:** cargar un CSV y repartir en días.
- Esquema de la base de datos en `supabase/migrations/0001_esquema.sql` (sin aplicar todavía).
- Pruebas, tipos, lint y compilación en verde.
- Formato de los ficheros de negocios: `comercial/neuronode/leads/FORMATO.md`.

## Falta
- Crear el proyecto de Supabase, aplicar la migración y crear los usuarios de Brian y Nico.
- Primer lote de 300 negocios (4 búsquedas lanzadas, una por comunidad; guardan en `comercial/neuronode/leads/lote1-*.csv`).
- Diagnóstico y guion de los 100 del día 1.
- Propuesta visual y envío de correo con consentimiento (fase 3).
- Desplegar en Vercel: solo cuando Brian lo diga.
- Logo real de neuro·node: ahora hay uno provisional en `public/logo.svg`. El bueno está en el repositorio de la web (`web/public/marca/`).
- Correo @neuro-node.com del remitente: lo decide Nico.

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
