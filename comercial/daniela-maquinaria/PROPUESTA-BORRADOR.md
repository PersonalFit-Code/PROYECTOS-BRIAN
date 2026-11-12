# Daniela · Venta de maquinaria de gimnasio — Borrador de propuesta (Neuronode)

> Borrador para revisar con Nico antes de enviar. La parte de **notas internas** no se envía al cliente.

---

## NOTAS INTERNAS (no enviar)

### Quiénes son
- **Equipo de 3 personas:**
  - **Daniela:** ventas, presupuestos y la mayor parte de las restauraciones;
  - **Dani:** transporte; no toca reparaciones;
  - **Ramón:** lleva la importación y el transporte.
- **Qué venden:**
  - maquinaria nueva importada de China;
  - maquinaria de segunda mano de gimnasios que cierran;
  - servicios de transporte, envíos a toda España y fuera, montaje, restauración, reparación y servicio técnico.
- **Más de 300 máquinas** en inventario.
- **Clientes:** de todo, desde gimnasios y particulares hasta ayuntamientos y hoteles.
- **Canal de venta:** sobre todo boca a boca, además de WhatsApp y Wallapop.
- **Tienen logo, dominio o redes:** sí.
- **Cómo se organizan hoy:** Ramón lleva un Excel de la importación, Dani una libreta y Daniela otra libreta. No hay nada compartido.

### Sus dolores (en sus palabras)
1. No tienen web ni escaparate de su inventario.
2. No tienen control de coste, precio ideal y notas privadas por máquina.
3. **Venden máquinas reservadas o ya vendidas («vender algo dos veces»).** Es su punto más flaco.
4. Se les pasan los presupuestos y pierden ventas: «hace una semana que te lo he pedido».
5. Los servicios (transporte, montaje, restauración) no se ven en ningún sitio.
6. Quiere **tarifa clara para implantarlo**.

### Lo que pidió en la llamada
- Una web para mostrar las máquinas disponibles.
- Una aplicación web para llevar toda la gestión cómodamente y que no se vendan máquinas dos veces.
- Automatizar mensajes de WhatsApp.

### Precios orientativos (decidir con Nico)
| Opción | Pago único | Cuota mensual | Plazo |
|---|---|---|---|
| A · Esencial | 1.900–2.400 € | 79–99 €/mes | 4-5 semanas |
| B · Completa (recomendada) | 3.200–3.900 € | 129–149 €/mes | 6-8 semanas |

**Por qué estos rangos:**
- Es una aplicación a medida para 3 usuarios, con más de 300 máquinas y una migración de datos desde Excel y libretas.
- Les resuelve pérdidas de ventas reales.
- Es mucho más que una web de gimnasio de 500-700 €.

**Costes que cubre la cuota:**
- alojamiento, base de datos y almacenamiento de fotos y vídeos;
- API de WhatsApp (responder es gratis, pero los avisos que inicias tú tienen un pequeño coste por mensaje);
- copias de seguridad, soporte y cambios.

**Decidir antes de enviar:**
- **Forma de pago:** 50 % al empezar y 50 % a la entrega, o por fases.
- **Si hay 30 días gratis:** aquí no lo recomiendo en el desarrollo, porque es mucho trabajo a medida. Mejor 30 días de cuota gratis tras la entrega.
- **Quién factura:** Neuronode, o Brian o Nico como autónomos. Hay que estar dados de alta antes de cobrar.
- **Reparto del trabajo entre Brian y Nico.**

### Cómo lo construiríamos (técnico)
- **Web pública y aplicación interna en el mismo proyecto:** Next.js + Supabase (base de datos, usuarios y almacenamiento de fotos y vídeos), como en la plantilla de Andrea Salón.
- **Una única base de datos de máquinas.** La web pública solo muestra las disponibles y nunca los costes, las notas ni los datos privados. Para eso, permisos por fila (RLS).
- **Estados de cada máquina:** disponible → reservada (con cliente, señal y fecha límite) → financiada → vendida. Una máquina reservada o vendida desaparece de la web y no se puede volver a reservar.
- **WhatsApp:** API oficial de Meta, o Make como puente, para:
  - confirmar la reserva al cliente;
  - recordar la fecha límite de una reserva;
  - avisar a Daniela de los presupuestos pendientes;
  - avisar cuando una máquina está lista para entrega.
- **Migración de datos:** importar el Excel de Ramón y pasar las libretas en una sesión con ellos. Las fotos las suben desde el móvil.

---

## PROPUESTA PARA DANIELA (lo que se envía)

### Lo que nos contaste
Vendéis maquinaria de gimnasio nueva y de segunda mano, con más de 300 máquinas, a gimnasios, particulares, hoteles y ayuntamientos, y además hacéis transporte, montaje, restauración y servicio técnico. Todo funciona por boca a boca y WhatsApp, y la información está repartida entre un Excel y dos libretas.

Eso provoca tres problemas que os cuestan dinero:
1. **Máquinas que se venden dos veces** o reservas que se olvidan.
2. **Presupuestos que se retrasan** y clientes que acaban comprando en otro sitio.
3. **Un inventario que nadie ve:** sin web, solo os encuentra quien ya os conoce.

### Nuestra solución: dos piezas conectadas

**1 · Web catálogo**
- Todo vuestro inventario disponible, nuevo y de segunda mano, con fotos y vídeos.
- Filtros por tipo de máquina, marca, estado (nueva o segunda mano) y precio.
- Página de servicios: transporte y envíos, montaje, restauración, reparación y servicio técnico.
- En cada máquina, un botón para pedir información o presupuesto por WhatsApp.
- Cuando una máquina se reserva o se vende, desaparece sola de la web.

**2 · Aplicación de gestión (solo para vosotros tres)**
- **Inventario único y compartido:** adiós al Excel y las libretas. Desde el móvil o el ordenador.
- **Ficha de cada máquina:** fotos, vídeos, estado, ubicación, **precio de coste, precio de venta ideal, margen y notas privadas**, que nunca se ven en la web.
- **Reservas sin errores:** cada máquina está disponible, reservada, financiada o vendida. Si está reservada, nadie puede venderla, y se ve a quién, con qué señal y hasta cuándo.
- **Financiaciones:** seguimiento de las cuotas pagadas y pendientes de cada cliente.
- **Presupuestos:** se crean en un minuto con máquinas, transporte y montaje, y se envían por WhatsApp o en PDF. La app te recuerda los pendientes para que no pase ni un día.
- **Avisos automáticos por WhatsApp:**
  - al cliente cuando reserva;
  - antes de que caduque su reserva;
  - a vosotros cuando hay un presupuesto pendiente o una entrega programada.
- **Agenda de transportes y montajes:** quién, cuándo y dónde.

### Dos opciones
| | **A · Esencial** | **B · Completa** (recomendada) |
|---|---|---|
| Web catálogo con inventario, fotos, vídeos y servicios | ✓ | ✓ |
| Aplicación de inventario con costes, márgenes y notas privadas | ✓ | ✓ |
| Reservas y ventas sin duplicados | ✓ | ✓ |
| Carga inicial del inventario desde vuestro Excel y libretas | ✓ | ✓ |
| Financiaciones | — | ✓ |
| Presupuestos con recordatorio | — | ✓ |
| Avisos automáticos por WhatsApp | — | ✓ |
| Agenda de transportes y montajes | — | ✓ |
| Pago único | **[XXXX] €** | **[XXXX] €** |
| Mantenimiento mensual (alojamiento, copias, soporte y mejoras) | **[XX] €/mes** | **[XXX] €/mes** |
| Plazo | ~4-5 semanas | ~6-8 semanas |

### Cómo trabajamos
1. **Sesión de arranque (1 h):** repasamos cómo trabajáis y qué datos lleva cada máquina.
2. **Primera entrega en 2 semanas:** el inventario y las reservas funcionando. Lo primero que resolvemos es que no se os escape ninguna máquina.
3. **Web y resto de funciones**, con revisiones semanales con vosotros.
4. **Formación de 1 h** a los tres y **30 días de mantenimiento gratis** desde la entrega.

**Pago:** 50 % al empezar y 50 % a la entrega.
**Todo es vuestro:** la web, los datos y el dominio.

Neuronode · Brian Carbajal y Nico
