# Cómo publicar Andrea Salón

Guía para Brian. Cada paso dice qué se hace, dónde y por qué. Se hace una vez; después cada cambio es
un push y un despliegue.

## 1. Supabase (base de datos y usuarios del panel)

1. Crear el proyecto `andrea-salon` en **Frankfurt (eu-central-1)**. Los datos de clientas se quedan
   en la UE, que es lo que dice la política de privacidad.
2. **Authentication → Providers → Email**: desactivar *Allow new users to sign up* (y no activar
   *anonymous sign-ins*). Aunque un registro ya no da acceso a nada (los perfiles solo los crea
   el script del paso 5), cerrar la puerta es la primera defensa. Los usuarios del
   panel solo se crean con el script del paso 5; nadie puede registrarse desde fuera.
3. **SQL editor**: ejecutar, en orden, todos los ficheros de `supabase/migrations/` (0001 → 0010) y
   después `supabase/seed.sql` (ajustes por defecto y categorías).
   Con la CLI: `supabase link --project-ref <ref>` y `supabase db push`.
4. Comprobar la regla que impide la doble reserva: pegar `scripts/qa-exclusion.sql` en el SQL
   editor. El último insert tiene que fallar con `conflicting key value violates exclusion constraint`.
5. Crear los usuarios del panel (con las variables de Supabase en el entorno):

   ```bash
   npx tsx scripts/crear-usuario.ts --email <correo de Andrea> --nombre "Andrea" --rol owner --staff andrea
   npx tsx scripts/crear-usuario.ts --email <correo> --nombre "Carolina" --rol staff --staff carolina
   ```

   El script imprime una contraseña provisional. `--staff` vincula el usuario a su columna de agenda:
   requiere que la profesional exista (desde el panel → Equipo, o con el seed de pruebas).
6. Solo en desarrollo: `npm run seed` carga servicios y equipo de ejemplo para probar la reserva.
   En producción el catálogo real lo mete Andrea (o Brian con ella) desde el panel → Servicios.

## 2. Resend (correos de cita)

1. Crear la cuenta y una API key → `RESEND_API_KEY`.
2. Sin dominio verificado Resend **solo envía a tu propio correo**: vale para probar, no para clientas.
3. Con el dominio: Resend → Domains → añadir `andreasalon.es` y copiar sus registros DNS en Vercel
   (paso 4). Después `EMAIL_FROM="Andrea Salón <citas@andreasalon.es>"` y `EMAIL_REPLY_TO` con el
   correo del salón, para que las respuestas le lleguen a Andrea.

## 3. Variables en Vercel (proyecto `andreasalonnails`)

Settings → Environment Variables. Ver `.env.example` para la lista completa.

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ídem, marcada como **Sensitive** |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | paso 2 |
| `TOKEN_SECRET` | `openssl rand -hex 32`. Firma los enlaces de cita; cambiarlo invalida los enviados |
| `CRON_SECRET` | `openssl rand -hex 32`. Vercel lo manda en la llamada del cron diario |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_RESERVAR_URL`, `NEXT_PUBLIC_PANEL_URL` | vacías hasta tener dominio |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | fase 2, cuenta de Andrea |
| `ANTHROPIC_API_KEY` | opcional (chat); sin ella responde el modo sin conexión |

Sin las variables de Supabase la web pública funciona igual; la reserva y el panel enseñan el
teléfono del salón en vez de romperse.

## 4. Dominio (antes del 1 de noviembre)

1. Comprar el `.es` (Dondominio, OVH, Nominalia…) y poner los nameservers de Vercel:
   `ns1.vercel-dns.com`, `ns2.vercel-dns.com`.
2. Vercel → proyecto → Domains: añadir `andreasalon.es`, `www.andreasalon.es` (redirige al apex),
   `reservar.andreasalon.es`, `panel.andreasalon.es`, `equipo.andreasalon.es`.
3. Variables: `NEXT_PUBLIC_SITE_URL=https://andreasalon.es`,
   `NEXT_PUBLIC_RESERVAR_URL=https://reservar.andreasalon.es`,
   `NEXT_PUBLIC_PANEL_URL=https://panel.andreasalon.es` → redesplegar.
   Con las tres puestas, la web deja de pedir a Google que no la indexe (`SITE_URL_IS_PROVISIONAL`).
4. Registros de Resend en Vercel → Domains → DNS Records.

## 5. Desplegar

La app de Vercel no tiene acceso de escritura al repo, así que no se despliega sola con cada push
(igual que Dos Puertas). Cada versión se lanza desde el commit de GitHub (API de Vercel con
`gitSource`, rama `claude/…` o `main`). Para que sea automático: dar acceso a la app de Vercel en
GitHub y conectar el repo en Settings → Git, con *Root Directory* `andrea-salon`.

## 6. Comprobar después de cada despliegue

```bash
# Cron: dos veces seguidas → un solo recordatorio por cita (la segunda sale como "duplicados")
curl -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/cron/diario
```

- Reserva completa desde el móvil en `/es/reservar`: llega el correo con el .ics.
- La cita aparece en `/panel/agenda` tras entrar.
- Cancelar desde el enlace del correo libera la hora (vuelve a salir en la reserva).

## 7. Antes de abrir la reserva al público: CAPTCHA (recomendado)

La reserva ya limita repetidos, citas de más de 5 horas, tres citas futuras por teléfono y una cuota
por IP. Lo que no frena es a alguien con muchas IP que llene la agenda de reservas temporales. La
defensa es un CAPTCHA invisible: **Cloudflare Turnstile** (gratis). Crear el sitio en Cloudflare y
pasarme las dos claves; se añade en el paso de la hora y en el de confirmar.

