# CRM propio — arquitectura (borrador)

Panel privado para ver, en un solo sitio, cómo funcionan los negocios de los clientes
de la marca (Tixola, Alex / centro de entrenamiento, Bin Cami), en vez de mirar enlaces
sueltos y preguntar en chats distintos.

## Decisiones tomadas

- **Un solo usuario** (el dueño de la marca). No hay acceso para clientes por ahora.
- **"Clientes" = los negocios con los que se trabaja**, no los comensales de Tixola ni los
  alumnos de Alex. El CRM guarda datos agregados de cada negocio, no listas de personas.
- **Sin agenda previa:** el CRM nace como fuente de verdad, no hay nada que importar.
- **Alex cobra en persona** (TPV con tarjeta o efectivo). No hay pasarela web, así que el
  dinero entra por un formulario manual, no por API.
- **Futuro posible:** aplicación para que los clientes vean sus propias métricas. Por eso
  cada tabla lleva `client_id` desde el primer día, aunque hoy solo haya un usuario.

## Fuera de alcance (por ahora)

- Datos personales de clientes finales (comensales, alumnos) y datos de salud.
- Acceso multiusuario, roles, facturación.
- Escritura por parte del agente de IA.

## Stack propuesto

| Pieza | Elección | Motivo |
|---|---|---|
| App | Next.js en `crm/` | Misma pila que `tixola-taperia` |
| Base de datos | Postgres (Supabase o Neon) + `pgvector` | Cifras exactas y búsqueda semántica en una sola base |
| Login | Un usuario, proveedor del servicio de base de datos | Suficiente para uso personal |
| Analíticas web | Umami o Plausible (sin cookies) | Mismo encaje legal que ya tiene Tixola |
| Agente | Claude con herramientas, usuario SQL **solo lectura** | Cifras por SQL, contexto por vectores |

## Modelo de datos (esquema inicial)

Importes en céntimos (enteros) para no arrastrar errores de redondeo.

```sql
create table clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text,                       -- restaurante, centro de entrenamiento...
  status      text not null default 'activo',
  monthly_fee_cents integer,
  started_on  date,
  notes       text
);

create table contacts (
  id        uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  name      text not null,
  role      text,
  phone     text,
  email     text
);

create table sites (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id),
  label         text not null,            -- "Web Tixola", "Instagram Alex"...
  url           text,
  analytics_ref text                      -- id del sitio en Umami/Plausible
);

-- Visitas, clics a WhatsApp, vistas de carta... una fila por métrica y día
create table metrics_daily (
  client_id uuid not null references clients(id),
  site_id   uuid references sites(id),
  day       date not null,
  source    text not null,
  metric    text not null,
  value     numeric not null,
  unique (client_id, site_id, day, source, metric)
);

-- Cierre diario manual (Alex): total de tarjeta (TPV) y de efectivo
create table revenue_daily (
  client_id   uuid not null references clients(id),
  day         date not null,
  card_cents  integer not null default 0,
  cash_cents  integer not null default 0,
  unique (client_id, day)
);

create table ad_spend_daily (
  client_id   uuid not null references clients(id),
  day         date not null,
  platform    text not null,              -- meta, google
  spend_cents integer not null,
  impressions integer,
  clicks      integer,
  conversions integer,
  unique (client_id, day, platform)
);

-- Fase 6: notas y conversaciones para el RAG
create table notes (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id),
  created_at timestamptz not null default now(),
  body       text not null
  -- embedding vector(N)  -- N depende del modelo de embeddings elegido
);
```

## Fases

1. **Cimientos:** carpeta `crm/`, base de datos, login, tablas anteriores.
   *Hecho cuando:* puedo entrar y dar de alta un cliente con su contacto y sus enlaces.
2. **Ficha por cliente:** pantalla con contacto, enlaces, cuota y notas.
   *Hecho cuando:* abro un cliente y tengo todo lo suyo en una pantalla.
3. **Cierre diario de Alex:** formulario de 10 segundos (tarjeta + efectivo).
   *Hecho cuando:* se ve el dinero por día, semana y mes.
4. **Analíticas web:** ingesta diaria de Tixola y Bin Cami.
   *Hecho cuando:* el panel muestra visitas y clics de ambas webs sin abrir otra pestaña.
5. **Publicidad:** Meta Ads y Google Ads.
   *Hecho cuando:* se ve gasto y clics por cliente junto al resto.
6. **Vectores y agente:** notas con embeddings y preguntas en lenguaje natural.
   *Hecho cuando:* puedo preguntar "¿cómo va Alex este mes?" y la cifra sale del SQL.

## Avisos a tener presentes

- **Las cifras salen siempre de SQL**, nunca de la búsqueda semántica.
- **El agente solo lee.** Todo texto que entre al RAG puede traer instrucciones ocultas.
- **Tokens de publicidad:** el token de desarrollador de Google Ads puede tardar semanas
  en aprobarse; conviene pedirlo antes de llegar a la fase 5.
- **Si algún día entran datos personales** (agenda de comensales o alumnos) o clientes con
  acceso propio: contrato de encargado del tratamiento (RGPD art. 28), aislamiento por
  `client_id` con reglas de acceso a nivel de fila y, para datos de entrenamiento,
  consentimiento explícito por tratarse de datos de salud. Consultar con un profesional.
- **Claves y secretos** solo en variables de entorno, nunca en el repositorio.

## Pendiente de decidir

- Supabase o Neon.
- Umami o Plausible (autoalojado o en la nube).
- Si el TPV de Alex permite exportar un CSV de cobros, para cuadrar el total de tarjeta.
