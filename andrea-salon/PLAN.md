# Andrea · Salón — Plan del proyecto

> Nombre provisional: "Andrea Mail Salón" (sale de la nota de voz). **Confirmar cómo se escribe** antes
> de comprar dominio o diseñar el logo; la carpeta se renombra sin problema.

## 0. De dónde partimos

- Reunión con Andrea (octubre 2026). Ahora está con **Elitica Solutions** (Ourense) y se siente
  desatendida: un cambio pequeño tarda **mes y medio**.
- Ella nos contactó a nosotros. Le gustaron **Tixola** y **Dos Puertas** como referencia visual.
- Lo que pide, por orden de lo que más le duele:
  1. Web nueva con **reserva online** (franjas visibles a ~45 días vista).
  2. **WhatsApp automático** el día antes: "¿vienes? Sí / No / Cambiar".
  3. **Panel de administración** "a nivel pro": facturación, reservas, clientes destacados,
     rendimiento de cada empleada, gráficas.
  4. **Bonos de sesiones** comprables en la web con pago online y código QR.

**La idea que vendemos:** que el salón trabaje por ella. Y lo contrario de lo que tiene ahora: un
cambio pedido el lunes está hecho esa semana.

---

## 1. Arquitectura: una sola app, tres enlaces

Una única aplicación Next.js en Vercel con una sola base de datos, y **tres entradas** (dominios o
subdominios) que apuntan a ella. Así no hay que sincronizar nada entre tres proyectos y un cambio en
un servicio o un precio se ve a la vez en la web, en la reserva y en el panel.

| Enlace | Para quién | Qué hay |
| --- | --- | --- |
| `andreasalon.es` (provisional) | Público | La web: portada, servicios y precios, equipo, galería, bonos, reseñas, contacto |
| `reservar.andreasalon.es` | Clientas | Solo el flujo de reserva, rápido, para la bio de Instagram, Google Maps y el WhatsApp |
| `panel.andreasalon.es` | Andrea y su equipo | Agenda, caja, clientes, empleadas, bonos, analítica. Con login |

Mientras no haya dominio: `andrea-salon.vercel.app`, `/reservar` y `/panel`. El `proxy.ts` (como en
Dos Puertas) decide qué sección sirve según el dominio de entrada.

```
            ┌───────────── Vercel (Next.js) ─────────────┐
 web ──────▶│  /(web)     /(reservar)     /(panel)       │
 reservar ─▶│        API routes + Vercel Cron            │◀── Webhooks: Stripe, WhatsApp
 panel ────▶│                                            │
            └──────────────────┬─────────────────────────┘
                               ▼
                 Supabase (Postgres + Auth, región UE)
                               │
     Stripe (pagos bonos/señal) · WhatsApp Cloud API (Meta) · Resend (emails)
```

### Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Front + back | **Next.js** (misma versión que Tixola), Tailwind, Framer Motion/GSAP | Lo dominamos y es el estilo que le gustó |
| Base de datos y login | **Supabase** (Postgres, Auth, RLS) en Frankfurt | Login de Andrea y empleadas, permisos por fila, datos en la UE (RGPD) |
| Pagos | **Stripe Checkout** (tarjeta, Apple Pay, Google Pay) | Sin pantallas de pago propias; webhooks fiables |
| WhatsApp | **WhatsApp Business Platform (Cloud API de Meta)** directo, sin intermediario | Plantillas con botones de respuesta; sin pagar cuota a terceros |
| Emails | **Resend** | Confirmación de reserva y envío del bono con el QR |
| Tareas programadas | **Vercel Cron** | Recordatorios del día antes, avisos de bonos a punto de caducar |
| Gráficas del panel | Recharts o Tremor | Panel con aspecto profesional sin dibujarlo todo a mano |

---

## 2. Módulo 1 — La web pública

Mismo nivel que Tixola/Dos Puertas, pero con la marca del salón (no reutilizar su estética tal
cual: sacar paleta y tipografía del local, el logo y las fotos de Andrea).

- **Portada:** frase de marca, CTA "Reservar cita" siempre visible (botón fijo en móvil), fotos
  del salón.
- **Servicios y precios:** por categorías (corte, color, mechas, tratamientos, uñas…), con
  duración y precio "desde". Cada servicio lleva directo a reservarlo.
- **Equipo:** cada empleada con foto y especialidades (y botón "reservar con ella").
- **Galería / trabajos:** antes y después; idealmente conectada a su Instagram.
- **Bonos:** la tienda de bonos (módulo 4).
- **Reseñas:** las de Google, con su nota.
- **Contacto y cómo llegar:** mapa con consentimiento de cookies (como en Dos Puertas), horario en
  vivo "abierto ahora".
- **SEO local:** ficha `HairSalon` en JSON-LD, títulos por servicio ("mechas balayage en Ourense"),
  enlace con su Perfil de Empresa de Google (el botón "Reservar" de Google apunta a nuestro enlace).
- **Legal:** aviso legal, privacidad, cookies, condiciones de reserva y de bonos.
- **Idiomas:** español (y gallego si ella quiere; lo tenemos ya montado en los otros proyectos).

## 3. Módulo 2 — Motor de reservas

El corazón del proyecto. Si esto falla, nada más importa.

### Cómo reserva una clienta (≤ 1 minuto, pensado para móvil)

1. Elige **servicio** (o varios: corte + color se encadenan y suman duración).
2. Elige **profesional** o "me da igual" (el sistema reparte).
3. Ve un **calendario de ~45 días** con los días libres marcados y, al tocar un día, las horas.
4. Deja **nombre, móvil y email**, acepta condiciones y el consentimiento de WhatsApp.
5. Confirmación en pantalla + WhatsApp/email con la cita, botón "añadir al calendario" y enlace
   para **cancelar o cambiar** ella misma (hasta X horas antes).

### Reglas que el motor tiene que conocer (las configura Andrea en el panel)

- Servicios: duración, precio, qué empleadas los hacen, tiempo de pausa (p. ej. el tinte actuando,
  en el que la empleada puede atender a otra clienta — **preguntar si lo trabajan así**).
- Horario de cada empleada por día de la semana, descansos, vacaciones y festivos de Ourense.
- Margen entre citas, antelación mínima (no reservar para dentro de 30 min) y horizonte (45 días).
- Política de cancelación y, opcional, **señal** con tarjeta para servicios largos o clientas con
  faltas previas.
- Bloqueos manuales desde el panel (formación, médico…).

### Detalles técnicos que evitan disgustos

- **Doble reserva imposible:** restricción de exclusión en Postgres por empleada y franja horaria; si
  dos personas pulsan a la vez, solo entra una y la otra ve "esa hora acaba de ocuparse".
- Reserva temporal de la franja mientras la clienta rellena sus datos (5 min).
- Verificación del móvil (código por WhatsApp o SMS) solo para clientas nuevas, para evitar
  reservas falsas. A decidir con Andrea si merece la fricción.
- Las citas que entran por teléfono o en mostrador se meten desde el panel en dos toques: **todas
  las citas viven en el mismo sitio**, si no la analítica miente.

## 4. Módulo 3 — WhatsApp automático

### Mensajes

| Cuándo | Mensaje | Botones |
| --- | --- | --- |
| Al reservar | Confirmación con fecha, hora, servicio y profesional | Cambiar · Cancelar |
| 24 h antes (hora configurable) | Recordatorio | **Sí, voy** · **No puedo** · Cambiar hora |
| Si responde "No puedo" | Se cancela, la franja se libera y se le ofrece otra fecha | Enlace a reservar |
| Si no responde (p. ej. 4 h antes) | Aviso a Andrea en el panel: "cita sin confirmar" | — |
| Tras la cita (opcional) | Gracias + enlace a reseña de Google | — |
| Clienta inactiva (opcional, fase 2) | "Hace 2 meses de tu último color…" | Reservar |
| Bonos | Compra, sesiones que quedan, aviso de caducidad | — |

Las respuestas llegan por webhook y **cambian el estado de la cita solas** (confirmada / cancelada).
En el panel cada cita lleva su semáforo: verde confirmada, ámbar sin respuesta, rojo cancelada.
Con el tiempo esto da la métrica más vendible del proyecto: **tasa de no-shows antes y después**.

### Lo que hay que preparar (lleva su tiempo, empezar pronto)

- Cuenta de **Meta Business** a nombre del salón y verificación de la empresa.
- **Número de teléfono:** o uno nuevo solo para el sistema, o su número actual usando la
  "coexistencia" (seguir usando la app WhatsApp Business en el móvil y que el sistema envíe desde el
  mismo número). **Decidir con ella** y comprobar al darlo de alta que su número lo admite.
- Aprobación de las **plantillas** por Meta (categoría "utilidad"; suele tardar de minutos a un día).
- Coste: Meta cobra por mensaje de plantilla (céntimos en España; tarifa exacta al dar de alta).
  Las respuestas dentro de la conversación abierta no cuestan.
- Plan B mientras Meta aprueba: recordatorio por email/SMS para no retrasar el lanzamiento.

## 5. Módulo 4 — Bonos de sesiones

- **Catálogo** en la web: p. ej. "Bono 5 tratamientos de hidratación", "Bono 10 manicuras",
  "Tarjeta regalo 50 €". Andrea crea, edita y desactiva bonos desde el panel.
- **Compra:** Stripe Checkout → al pagar, se crea el bono con **código único + QR**, y se envía por
  email y WhatsApp. Opción "es un regalo" con nombre y mensaje para otra persona.
- **Página del bono** (`/bono/CODIGO`): sesiones que quedan, caducidad, historial de uso, botón
  "reservar con mi bono".
- **Uso:** al reservar se puede pagar con el bono (se descuenta al completar la cita); en el salón
  la empleada **escanea el QR** desde el panel en el móvil y descuenta la sesión.
- **Contabilidad correcta:** el dinero de un bono se cobra el día de la compra, pero el servicio se
  presta después. El panel separa *cobrado* de *consumido* y muestra el **saldo pendiente de bonos**
  (lo que el salón "debe" en sesiones).
- **Decidir con Andrea:** caducidad (¿6 o 12 meses?), si son transferibles, devoluciones, si los
  bonos se pueden comprar también en el salón (sí: se crean desde el panel con cobro en TPV/efectivo).
- Bizum: Stripe no lo ofrece de forma general; si ella lo considera imprescindible, habría que
  usar Redsys a través de su banco. Empezar con tarjeta + Apple/Google Pay.

## 6. Módulo 5 — Panel de administración ("nivel pro")

Responsive: Andrea lo va a mirar sobre todo en el móvil. Dos roles:

- **Dueña (Andrea):** ve y configura todo.
- **Empleada:** ve su agenda, sus clientas del día, mete y cobra citas. No ve la facturación del
  resto ni la configuración. (A confirmar qué quiere que vean.)

### Pantallas

1. **Hoy** (pantalla de inicio): citas del día por empleada, semáforo de confirmaciones, huecos
   libres, lo facturado hoy, cumpleaños de clientas, alertas.
2. **Agenda:** vista día/semana con una columna por empleada, arrastrar para mover citas, crear cita
   rápida, bloqueos, lista de espera.
3. **Cobrar cita:** al terminar, la empleada marca la cita como hecha, ajusta lo realizado (si se
   añadió un tratamiento), método de pago (tarjeta, efectivo, bono, Bizum) y propina. **Este paso
   es lo que hace que la contabilidad sea real**, no una estimación a partir de las reservas.
4. **Clientes:** ficha con historial de visitas, gasto total, servicios favoritos, profesional
   habitual, notas (fórmula de color, alergias), consentimientos, faltas. Etiquetas automáticas:
   *VIP*, *nueva*, *en riesgo* (sin venir más de lo habitual), *dormida*.
5. **Equipo:** por empleada — facturación, número de servicios, ticket medio, ocupación de su agenda,
   % de clientas que repiten con ella, servicios que más hace, ranking del mes. Base para comisiones
   si las pagan.
6. **Servicios:** más vendidos, facturación por servicio y categoría, duración real vs. prevista.
7. **Bonos:** vendidos, cobrado, consumido, saldo pendiente, a punto de caducar.
8. **Analítica:**
   - Facturación por día/semana/mes y comparativa con el periodo anterior y el mismo mes del año
     pasado.
   - Ticket medio, ocupación (% de horas vendidas sobre horas disponibles), horas punta (mapa de
     calor día × hora).
   - Clientas nuevas vs. recurrentes, retención, frecuencia media entre visitas.
   - Top 10 clientas por gasto; canal de reserva (web, teléfono, mostrador, Google).
   - **No-shows y cancelaciones**, y dinero recuperado gracias a los recordatorios.
   - Métodos de pago.
9. **Configuración:** servicios y precios, horarios, festivos, políticas, plantillas de WhatsApp,
   textos de la web (horario, avisos) sin pedírnoslo.
10. **Exportar:** CSV/Excel mensual para la gestoría.

### Límite importante (dejarlo claro en la propuesta)

El panel es **contabilidad de gestión** (cuánto se factura, quién, qué), no un programa de
facturación legal. Las facturas/tickets con validez fiscal siguen saliendo de su TPV o programa
actual, que tendrá que cumplir **Verifactu** cuando le toque (prevista su obligatoriedad en 2027).
Si más adelante quiere que salgan del panel, se integra con un software homologado; no lo
construimos nosotros.

## 7. Datos: lo que hay que traer de su sistema actual

- **Pedir a Elitica la exportación** de clientas (nombre, teléfono, email, historial si es posible)
  y de las citas futuras ya reservadas. Los datos son de Andrea: tienen que dárselos (derecho de
  portabilidad, RGPD).
- Las citas futuras se importan antes del cambio para que nadie se quede sin su hora.
- **Cambio de sistema en un día tranquilo**, con las dos agendas en paralelo una semana si hace falta.
- Si no dan historial, la analítica arranca desde cero el día del lanzamiento (y la demo enseña
  cómo se verá con meses de datos).

## 8. Legal y RGPD

- Consentimiento expreso para recibir WhatsApp (casilla en la reserva; sin marcar por defecto para
  los mensajes de marketing).
- Política de privacidad que nombre a los encargados: Supabase (UE), Vercel, Stripe, Meta, Resend.
- Contrato de encargo de tratamiento entre nosotros y el salón.
- Notas de cliente sensibles (alergias, reacciones a productos) → acceso solo para el equipo.
- Condiciones de reserva (cancelación, señal) y de los bonos (caducidad, devoluciones) visibles
  antes de pagar.

## 9. Fases y entregas

| Fase | Qué | Resultado |
| --- | --- | --- |
| **0. Propuesta** | Documento PDF (como los de `comercial/`) + **demo navegable** con datos ficticios: web, reserva y panel con gráficas | Andrea ve el "nivel pro" antes de firmar |
| **1. Base** | Datos reales (servicios, equipo, horarios), web pública, motor de reservas, panel: Hoy + Agenda + Cobrar + Clientes, importación de Elitica, emails | Ya puede dejar Elitica |
| **2. WhatsApp** | Alta en Meta, plantillas, confirmación, recordatorio 24 h con botones, semáforo en el panel | Menos faltas |
| **3. Bonos y pagos** | Stripe, tienda de bonos, QR, canje, señal opcional | Venta online |
| **4. Analítica pro** | Equipo, servicios, bonos, mapa de calor, retención, exportación | El panel "de nivel máximo" |
| **5. Crecimiento** (opcional) | Reactivar clientas dormidas, reseñas en Google, lista de espera automática, cumpleaños | El negocio trabaja solo |

El trámite con Meta (fase 2) se arranca en la fase 1, en paralelo, para que no bloquee.

## 10. Costes de funcionamiento (los paga el salón o se incluyen en la cuota)

- **Vercel Pro** (~20 $/mes): el plan gratuito no permite uso comercial.
- **Supabase Pro** (~25 $/mes): copias de seguridad diarias y sin pausas del proyecto.
- **Stripe:** comisión por pago con tarjeta europea (~1,5 % + 0,25 €), sin cuota fija.
- **WhatsApp (Meta):** céntimos por recordatorio enviado.
- **Resend:** gratis al volumen de un salón.
- **Dominio:** ~10–15 €/año.

Comprobar las tarifas exactas el día de la propuesta. Precio de nuestro trabajo: lo fijas tú
(sugerencia de estructura: alta del proyecto + cuota mensual que incluya mantenimiento, cambios con
**plazo comprometido** —p. ej. respuesta en 24 h y cambios pequeños en la semana— y los costes de
arriba). Ese plazo es justo lo que Elitica no le da.

## 11. Preguntas para Andrea (antes de empezar la fase 1)

**Negocio**
- [ ] Nombre exacto y cómo se escribe, logo, dirección, teléfono, horario.
- [ ] ¿Cuántas empleadas? Nombre, foto, servicios que hace cada una, horarios.
- [ ] Lista completa de servicios con duración y precio. ¿Hay tiempos de pausa (tinte)?
- [ ] ¿Pagan comisiones a las empleadas? ¿Sobre qué?
- [ ] ¿Qué deben ver las empleadas en el panel?

**Reservas**
- [ ] ¿Se puede elegir profesional? ¿Hay servicios que no se reservan online (novias, color
      correctivo) y van con consulta?
- [ ] Política de cancelación. ¿Quiere cobrar señal? ¿En qué servicios?
- [ ] Horizonte de 45 días: ¿igual para todos los servicios?

**WhatsApp**
- [ ] ¿Qué número usa ahora con las clientas? ¿App WhatsApp normal o Business?
- [ ] ¿A qué hora quiere que salga el recordatorio?

**Bonos**
- [ ] Qué bonos vende hoy, a qué precio, caducidad, si se pueden regalar o transferir.
- [ ] ¿Necesita Bizum o le vale tarjeta + Apple/Google Pay?

**Sistema actual**
- [ ] ¿Qué programa le tiene puesto Elitica? ¿Contrato con permanencia? ¿Quién tiene el dominio
      actual (si lo hay) y a nombre de quién está?
- [ ] ¿Qué TPV usa y con qué emite tickets/facturas?

**Material**
- [ ] Fotos del salón y trabajos (si no, sesión de fotos: merece la pena), acceso a Instagram,
      enlace a su ficha de Google.

## 12. Siguiente paso

1. Revisar este plan contigo y cerrar alcance.
2. Montar la **demo** (web + reserva + panel con datos ficticios) — es lo que la va a convencer.
3. Preparar la **propuesta en PDF** en `comercial/andrea-salon/`, con el mismo formato que las otras.
