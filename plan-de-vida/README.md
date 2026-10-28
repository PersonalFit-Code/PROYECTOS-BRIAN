# Noah.ai (plan de vida)

App personal para llevar la vida en un solo sitio, al estilo de Notion: **metas, finanzas, hábitos y diario**, con un **coach IA** en el Inicio. Es una web (PWA): se abre en el ordenador y en el móvil se añade a la pantalla de inicio como si fuera una app.

| Módulo | Qué hace |
| --- | --- |
| **Inicio** | Chat con el coach sobre un fondo animado. Apunta gastos, marca hábitos, crea tareas y escribe en el diario a partir de lo que le cuentas (o dictas por voz) y responde con tus datos reales. |
| **Hoy** | Check-in de ánimo y energía, rutinas de mañana, día y noche con casillas, tareas del día y cómo va el dinero del mes. |
| **Hábitos** | Casillas diarias en vista de semana o de mes, rachas, hábitos de sí/no, con cantidad (vasos, minutos) y "a dejar". **Informe mensual**: lo que más fallas, lo que mejor se te da, el cumplimiento por día de la semana, la relación con tu ánimo e ideas de mejora del coach. |
| **Metas** | Visión en presente por área (salud, dinero, crecimiento, relaciones), metas anuales, trimestrales o mensuales medibles y tareas ligadas. |
| **Finanzas** | Movimientos con presupuesto por categoría, fijos y suscripciones que se apuntan solos, huchas con el ritmo de ahorro necesario y patrimonio neto con su gráfica. |
| **Inversión** | Informe cada día laborable con recomendaciones explicables (núcleo indexado más satélite), puntuadas a 7, 30 y 90 días frente al benchmark. El sistema **aprende**: sube o baja cuánto se fía de cada señal según sus aciertos y tus 👍/👎. |
| **Diario y Revisiones** | Diario con ánimo, revisión semanal (domingo) y mensual con números automáticos. Se puede hacer guiada por el coach. |

> ⚠️ La parte de inversión es un análisis automático informativo, no asesoramiento financiero. La app no compra ni vende nada.

## Stack

Next.js 16 (App Router) · Tailwind 4 · Supabase (Postgres + Auth + RLS) · Claude API · Vercel (hosting y cron) · Web Push.

## Puesta en marcha (una vez, unos 20 minutos)

### 1. Supabase (base de datos y login)

1. Crea un proyecto en [supabase.com](https://supabase.com) en la región **Frankfurt (eu-central-1)**.
2. **SQL Editor** → pega y ejecuta, en este orden, `supabase/migrations/0001_esquema.sql` y `supabase/migrations/0002_rls.sql`.
3. **Authentication → Users → Add user**: tu email y una contraseña. Esa es tu cuenta.
4. **Authentication → Sign In / Providers**: desactiva *Allow new users to sign up* para que nadie más pueda registrarse.
5. **Project Settings → API**: copia la URL, la `anon key` y la `service_role key`.

Al entrar por primera vez, la app crea sola tus áreas de vida, las categorías de gasto y una cartera de partida.

### 2. Vercel (publicarla)

1. *Add New → Project* → importa este repositorio y pon **Root Directory = `plan-de-vida`**.
2. En **Environment Variables**, pon las de `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - `ANTHROPIC_API_KEY` (de [console.anthropic.com](https://console.anthropic.com)). Sin ella el coach funciona en **modo básico**: entiende «gasté 12 € en gasolina», «hecho: gimnasio» y «¿cuánto he gastado?».
   - `CRON_SECRET`: cualquier cadena larga (`openssl rand -hex 32`).
   - Avisos en el móvil (opcional): genera las claves con `npx web-push generate-vapid-keys` y pon `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT=mailto:tu@email`.
3. Despliega. Los dos crons (`vercel.json`) se activan solos:
   - `/api/cron/diario` (~18:40 en Madrid): apunta los fijos, actualiza cotizaciones, puntúa las recomendaciones pasadas y genera el informe de inversión. Los lunes recalcula lo aprendido. El día 1 guarda la foto del patrimonio y genera el informe de hábitos del mes cerrado.
   - `/api/cron/tarde` (~20:10 en Madrid): avisa de los hábitos que te quedan por marcar. Los domingos recuerda la revisión semanal.

### 3. Instalarla en el móvil

- **iPhone**: abre el enlace en Safari → Compartir → *Añadir a pantalla de inicio*. Las notificaciones solo funcionan abriéndola desde ese icono (iOS 16.4 o posterior); se activan en Ajustes.
- **Android**: Chrome → ⋮ → *Instalar aplicación*.

## Inversión: cómo funciona el motor

- **Reparto objetivo** (Finanzas → Inversión): de serie es 80 % núcleo (MSCI World, emergentes, bonos a corto y Letras) y 20 % satélite (S&P 500, Europa). Los tickers son de Yahoo Finance; **compruébalos y cámbialos por los ETF que uses tú**.
- **Tu cartera real**: en Patrimonio, pon a tus cuentas de inversión el mismo ticker (por ejemplo `IWDA.AS`) y la app calcula los pesos reales.
- **Señales** (`src/lib/inversion/senales.ts`): aportación mensual hacia lo que está por debajo de su peso, comprar caídas del núcleo, tendencia o debilidad del satélite (medias de 50 y 200 sesiones), posiciones con sobrepeso y liquidez frente a la inflación.
- **Bucle de automejora** (`src/lib/inversion/aprendizaje.ts`): cada recomendación guarda el precio y el benchmark del día. A los 7, 30 y 90 días se puntúa con precios reales. Cada lunes, el peso de cada señal pasa a ser 0,5 + su % de acierto (con al menos 5 evaluaciones), ±0,15 según tu feedback. Por debajo de 0,6 la señal queda «en observación»: sigue midiéndose, pero ya no recomienda. Lo aprendido se ve en «Qué ha aprendido el sistema».
- **Cotizaciones**: Yahoo Finance sin clave. Si un día falla, se trabaja con el último dato guardado. Con `TWELVEDATA_API_KEY` se usa Twelve Data.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # métricas de hábitos, fechas, finanzas, motor de inversión
```

Para probar sin Supabase Auth: `APP_SIN_LOGIN=1` + `APP_USER_ID=<uuid>` en `.env.local` (solo funciona en desarrollo).

## Si un día la abres a más gente

La base de datos ya es multiusuario: cada fila lleva `user_id` y las políticas RLS impiden ver datos ajenos. Faltaría:

1. Pantalla de registro (Supabase Auth) y activar los registros.
2. El nombre del usuario al registrarse (el coach ya lo toma de Ajustes).
3. Planes de pago (Stripe), límites de uso del coach por usuario y textos legales (RGPD).
