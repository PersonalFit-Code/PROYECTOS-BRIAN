# Andrea · Salón — Lo legal

> **Documento interno.** No se le enseña a Andrea.
>
> Esto es orientación, no es un abogado. Antes de firmar, media hora con una gestoría de Ourense
> te cuesta 50 € y te ahorra todo esto. Lo que sigue es para que vayas sabiendo qué preguntar.
>
> Última revisión: octubre de 2026.

---

## El resumen

**El proyecto es legal y se puede vender entero.** Nada de lo que hay en la propuesta (web,
reservas, bonos con pago online, panel, WhatsApp) está prohibido ni necesita licencias raras.

Lo que no se sostiene es **cobrarlo sin factura**. Y el problema no es moral ni teórico: es que
este encargo concreto, por cómo está montado, **te va a obligar a aparecer con nombre y apellidos
en sitios donde no puedes aparecer si no existes fiscalmente**. Lo desarrollo abajo.

Hay además tres cosas que, si se hacen mal, dan problemas de verdad: **el dinero de los bonos**,
**los datos de sus clientas** y **las métricas de sus trabajadoras**. Las tres tienen solución
fácil si se piensan antes.

---

## 1. Facturar: el que bloquea el resto

### Lo que le va a pedir su gestoría

Andrea es un negocio y tiene gestoría. Esa gestoría, cuando vea 1.200 € y luego 80 € todos los
meses saliendo de la cuenta del salón, va a pedir **la factura**. No por fastidiar: sin factura,
ese gasto **no se lo puede deducir**, ni el IVA ni en el impuesto que pague. Para ella eso
significa que los 1.200 € le cuestan en la práctica bastante más que 1.200 €.

Una factura tuya tendría que llevar: tu nombre y apellidos, tu NIF, tu dirección, los datos de
ella, número correlativo, fecha, descripción del servicio, base imponible, **IVA al 21 %** y, según
cómo te des de alta, **retención de IRPF** (si te das de alta como actividad profesional, ella te
retiene; si es empresarial, no). Eso te lo concreta la gestoría: depende del epígrafe.

La consecuencia de esto es la que importa: **ella tiene un incentivo económico real para pedirte
factura**, y tarde o temprano te la va a pedir, aunque hoy te diga que no hay problema. Cuando
llegue ese día, o te das de alta o pierdes el cliente a mitad del proyecto.

### Lo que arriesgas tú

- **Sin contrato no tienes nada.** Sin estar dado de alta, firmar un contrato de servicios es
  raro y débil. Si ella deja de pagar a mitad, o decide que el código es suyo, no tienes dónde
  agarrarte.
- **Respondes con tu patrimonio personal.** Si hay una fuga de datos de sus clientas, o se pierde
  la agenda, o los bonos cobrados se van al limbo, respondes tú, con lo tuyo, sin seguro y sin
  sociedad detrás.
- **No puedes firmar lo que el RGPD te obliga a firmar** (apartado 2). El contrato de encargado
  de tratamiento identifica a las partes. Firmarlo como particular te deja expuesto a título
  personal.
- **Y hay un problema de fontanería:** varias piezas de este proyecto (la pasarela de pagos, el
  alta de WhatsApp con Meta) piden datos fiscales de una empresa. Van a nombre de ella, así que
  técnicamente se resuelve, pero tú vas a estar operando cuentas a nombre de un negocio que no es
  tuyo, sin ninguna relación contractual que lo justifique. Eso es un lío si algún día hay que
  explicarlo.

### Lo que cuesta arreglarlo

Darte de alta como autónomo: alta en Hacienda (modelo 036 o 037) y alta en el RETA. Para nuevos
autónomos sigue existiendo la **tarifa plana de 80 €/mes el primer año**, y se puede prorrogar
otros doce meses si los rendimientos quedan por debajo del salario mínimo. Ojo: las fuentes no se
ponen de acuerdo en si el MEI va dentro o se suma aparte (saldría sobre 85-88 €), y desde 2026 la
cuantía la fija cada año la Ley de Presupuestos. **Confírmalo en la Seguridad Social o con la
gestoría el día del alta**, no te fíes de esta cifra.

Con los 80 €/mes de Andrea ya cubres prácticamente la cuota del primer año. Y a partir de ahí todo
lo que factures es limpio y declarable.

**Alternativa intermedia, si todavía no quieres dar el paso:** cobrar los 1.200 € ahora como un
trabajo puntual y empezar la cuota mensual cuando estés de alta. Una entrega puntual es mucho menos
problemática que una relación continuada de años. Pero la cuota mensual sin factura, durante años,
con acceso a los datos de sus clientas, no se sostiene.

---

## 2. RGPD: lo más serio del proyecto

Vas a manejar nombre, teléfono, email, historial de visitas y **notas** de todas las clientas de
Andrea. Eso es tratamiento de datos personales en toda regla.

### El contrato de encargado de tratamiento (obligatorio)

Ella es la **responsable** de esos datos. Tú, que accedes a ellos para prestarle el servicio, eres
el **encargado del tratamiento**. El artículo 28 del RGPD **obliga** a que esa relación esté por
escrito. No es opcional ni es papeleo: es el documento que delimita qué puedes hacer con esos datos
y que, si pasa algo, dice quién responde de qué.

La AEPD publica modelos de cláusulas, así que no hay que inventar nada. Tiene que llevar dos anexos:
uno describiendo qué datos, de quién y para qué; otro con las medidas de seguridad (control de
accesos, cifrado, gestión de incidentes).

### Los subencargados

Tú no guardas los datos en tu portátil: los guardas en servicios de terceros. **Todos ellos son
subencargados y tienen que estar autorizados por ella y listados por nombre**: Vercel (la web),
Supabase (la base de datos), Stripe (los pagos), Resend (los correos) y Meta, si al final se activa
el WhatsApp.

Dos cosas prácticas:
- **Que la base de datos esté en la Unión Europea** (Supabase tiene región en Fráncfort). Simplifica
  muchísimo: fuera de la UE hay que justificar la transferencia internacional.
- Esa lista va también en la política de privacidad de la web.

### Las notas de las clientas: cuidado

En un salón de uñas, las notas acaban incluyendo **alergias, reacciones a productos, problemas de
piel o de uñas**. Eso puede ser dato de salud, que es categoría especial y tiene protección
reforzada. No lo prohíbe nada, pero obliga a ser más estricto: esas notas solo las ve el equipo, no
salen en ningún listado exportable sin motivo, y se dice en la política de privacidad que se
guardan.

### Las trabajadoras: esto se suele pasar por alto

El panel enseña **cuánto factura cada empleada, su ocupación y un ranking del mes**. Eso es
control laboral y datos personales de las trabajadoras, no solo "métricas del negocio".

- Hay que **informarlas** de que existe ese seguimiento, de qué se mide y para qué.
- Si Andrea lo usa para pagar comisiones o para tomar decisiones sobre ellas, con más razón.
- Un ranking visible para todo el equipo puede generar un problema laboral. Recomendación: que el
  ranking y las cifras de facturación **solo los vea Andrea**, y que cada empleada vea las suyas.
  Ya está así en la propuesta (cada una ve su agenda); mantenlo también para los números.

### Lo que el sistema tiene que saber hacer

- **Exportar y borrar** los datos de una clienta que lo pida (derechos de acceso y supresión).
- **Registro de quién entra y qué toca**, por si hay que demostrar algo.
- Si hay una **brecha de seguridad**, hay 72 horas para notificarla. Conviene tener escrito de
  antemano quién avisa a quién.

---

## 3. Los bonos: donde más fácil es meterse en un lío

### El dinero NO puede pasar por ti. Nunca.

**La cuenta de Stripe tiene que estar a nombre del salón, con los datos fiscales de Andrea, y el
dinero tiene que caer directo en su banco.** Esto no es una preferencia, es la línea roja del
proyecto.

Si ese dinero entrase en una cuenta tuya:
- Estarías cobrando dinero de terceros por cuenta de otro, que es actividad regulada.
- Ese dinero, entrando en tu cuenta, parece ingreso tuyo y habría que explicarlo.
- Y con un volumen que crece, entras en territorio de prevención de blanqueo.

Está bien puesto en la propuesta ("el dinero de los bonos entra directo en tu banco") y tiene que
seguir así pase lo que pase, aunque ella te diga que le da igual o que es más cómodo.

### La caducidad: el punto flojo

Aquí no hay una norma española específica de tarjetas regalo, y las fuentes no coinciden. Lo que sí
está claro:

- Los organismos de consumo autonómicos sostienen que **los vales y bonos no deberían caducar**, y
  consideran que limitar su uso va contra la normativa de consumidores. Para tarjetas con valor
  monetario se suele aceptar un plazo, pero largo (se citan tres años como mínimo razonable).
- Lo que decide en la práctica es la **transparencia**: un plazo anunciado con claridad **antes de
  pagar** se defiende; uno escondido en la letra pequeña es cláusula abusiva.
- Hay resoluciones arbitrales en los dos sentidos, así que no hay respuesta cerrada.

**Recomendación:** que los bonos de sesiones no caduquen, o que caduquen a un plazo largo (un año
como mínimo) y escrito en grande en la propia página del bono, antes del botón de pagar. Si Andrea
insiste en seis meses, díselo: es justo el caso que pierden.

### Lo demás de vender online

- **Derecho de desistimiento de 14 días** en compras a distancia. Con matices cuando el servicio ya
  se ha empezado a prestar, pero el bono sin usar se devuelve.
- **Condiciones de venta visibles antes de pagar**, con casilla de aceptación sin marcar por defecto.
- **Confirmación por escrito** de la compra, en soporte duradero (el email del bono ya lo cumple).
- **Los bonos vendidos son una deuda del salón.** Si un día cierra o traspasa, debe esas sesiones.
  Por eso el panel separa lo cobrado de lo consumido: que ella lo entienda, porque el dinero del
  bono no es beneficio hasta que da el servicio.

---

## 4. La web

- **Aviso legal (LSSI):** nombre o razón social del titular, NIF, domicilio y contacto. El titular
  es el salón, no tú. Necesitas sus datos reales antes de publicar.
- **Cookies:** nada que instale cookies no necesarias puede cargarse antes de que el visitante
  acepte. El mapa de Google entra ahí. Ya tenemos el sistema hecho en Dos Puertas, se reutiliza.
- **Política de privacidad** que nombre a los proveedores de la lista de arriba.
- **Fotos:** si salen clientas (manos, uñas, caras), hace falta su consentimiento por escrito, y
  más si se van a usar en publicidad. Lo mismo con las fotos de las trabajadoras en la página de
  equipo: consentimiento, y hay que poder quitarlas si alguna se va y lo pide.
- **Fotos de banco:** con licencia. Nada de Google Imágenes.
- **Reseñas:** se pueden mostrar las reales de Google citando la fuente. Inventar reseñas o
  maquillar la nota es práctica desleal y está sancionado.

---

## 5. El WhatsApp (si se activa)

- El alta en Meta Business va **a nombre del salón**, con sus datos fiscales y su número.
- El recordatorio de una cita que la clienta ha pedido es **comunicación de servicio**, y es lo
  menos problemático. Pero conviene recoger el consentimiento igual, con una casilla en la reserva.
- Lo que sí exige consentimiento expreso y separado es **el marketing** (promociones, "vuelve que
  hace dos meses que no vienes", felicitaciones con oferta). Casilla aparte, sin marcar por defecto,
  y con forma fácil de darse de baja.
- Hay que respetar la **Lista Robinson** si algún día se hacen envíos comerciales masivos.

---

## 6. Facturación: una trampa técnica que conviene esquivar

Esto es sutil pero importante.

El panel registra cobros: cuánto ha pagado cada clienta, con qué método. **Eso es contabilidad de
gestión interna, y así tiene que quedarse.** Si el panel empezara a emitir tickets o facturas con
validez fiscal, el programa pasaría a ser **software de facturación**, y entonces entras tú, como
quien lo hace, en las obligaciones de los fabricantes: requisitos técnicos, registros inalterables,
declaración responsable. Es un mundo en el que no te quieres meter por 1.200 €.

**Dónde está la raya:** el panel apunta lo que se ha cobrado, para que ella sepa cómo va el mes.
Las facturas y tickets con validez fiscal siguen saliendo de su TPV o de su programa actual.
Déjalo dicho por escrito en el contrato, con esas palabras.

Sobre **Verifactu**: las fechas se han movido varias veces. Ahora mismo el calendario vigente es
**1 de enero de 2027 para sociedades y 1 de julio de 2027 para autónomos**, pero en octubre de 2026
Hacienda anunció un nuevo aplazamiento (se habla de octubre de 2028, para juntarlo con la factura
electrónica obligatoria) que **todavía no se ha publicado como norma**. O sea: está en el aire.
Eso es problema del TPV de Andrea, no tuyo, pero te lo apunto porque te lo va a preguntar, y porque
te afecta a ti también el día que te des de alta y tengas que facturar con un programa.

---

## 7. El contrato con Andrea: lo que tiene que decir

Ni hace falta que sea largo. Dos folios bien escritos:

1. **Qué entra** — exactamente lo del apartado 1 de `OFERTA.md`. Y que todo lo demás es presupuesto
   aparte.
2. **Qué necesitas de ella y cuándo** — servicios, precios, horarios, fotos. **El plazo empieza a
   contar desde que entrega todo eso**, no desde la firma.
3. **El plazo** — entre el 15 y el 25 de noviembre, con esa condición.
4. **El precio y los plazos de pago, con fechas concretas.** Nada de "ya te lo iré pagando".
5. **El mantenimiento**: qué incluye, qué no, y que se cancela avisando con un mes.
6. **El código es tuyo**, con licencia de uso para ella mientras dure la cuota. Y que sus datos son
   suyos y se los llevas si se va.
7. **El panel no emite facturas fiscales** (apartado 6).
8. **Anexo: el contrato de encargado de tratamiento** (apartado 2).

Y una cláusula que a ti te interesa más de lo que parece: **qué pasa si ella no entrega el material
o no contesta**. Con el enlace de Vercel abierto y ella pidiendo cambios, el riesgo es que el
proyecto no termine nunca. Pon un tope: los cambios de diseño y textos son ilimitados hasta la
entrega; a partir de la entrega, entran en el mantenimiento.

---

## 8. ¿Se puede vender todo esto? Sí

Repasado el PDF hoja por hoja:

| Hoja | ¿Problema legal? |
| --- | --- |
| 1 · Portada | No |
| 2 · Lo que vas a tener | No |
| 3 · Las cinco piezas | No |
| 4 · El recorrido de la clienta | No. Confirmación por correo, sin prometer WhatsApp |
| 5 · El WhatsApp | No, y está bien puesto como opción. Consentimiento al reservar |
| 6 · Los bonos | **Sí, el único con filo.** Pasarela a nombre de ella + caducidad + desistimiento |
| 7 · El panel | Cuidado con las métricas de las trabajadoras y con no emitir facturas |
| 8 · Cómo trabajamos | No |
| 9 · Precio y cierre | Dice "el dominio a tu nombre" y "te entregamos tus datos": cúmplelo |

No hay nada en la propuesta que haya que quitar. Lo que hay que hacer es montarlo bien.

---

## 9. Antes de empezar

- [ ] **Decidir lo del alta de autónomo.** Es lo que condiciona todo lo demás.
- [ ] Media hora con una gestoría de Ourense: alta, epígrafe, si lleva retención, y qué le va a
      pedir la gestoría de ella.
- [ ] Contrato de servicios de dos folios + anexo de encargado de tratamiento (modelo de la AEPD).
- [ ] Stripe a nombre del salón, con sus datos fiscales. Verificado antes de vender un solo bono.
- [ ] Supabase en región de la Unión Europea.
- [ ] Datos del titular para el aviso legal.
- [ ] Decidir con Andrea la caducidad de los bonos y escribir las condiciones de venta.
- [ ] Consentimientos: clientas (WhatsApp y fotos) y trabajadoras (fotos y métricas).
- [ ] Preguntarle qué TPV usa y confirmarle que las facturas siguen saliendo de ahí.

---

## Fuentes consultadas (octubre de 2026)

- [AEPD — modelo de cláusulas para contratos de encargado del tratamiento](https://www.aepd.es/sites/default/files/2019-09/clausulas-contratos-encargado-tratamiento.pdf)
- [AEPD — guía de directrices para contratos](https://www.aepd.es/guias/guia-directrices-contratos.pdf)
- [INCIBE — qué debe contener un contrato de tratamiento de datos](https://www.incibe.es/empresas/blog/debe-contener-contrato-tratamiento-datos-personales)
- [Consumo Responde (Junta de Andalucía) — las tarjetas regalo y vales no caducan](https://www.consumoresponde.es/actualidad/noticias/consumo-recuerda-tarjeta-regalo-otros-vales-ofrecen-algunos-establecimientos-devoluciones-no-caducan)
- [Infoautónomos — Verifactu: cuándo es obligatorio y a quién afecta](https://www.infoautonomos.com/blog/verifactu-cuando-es-obligatorio-a-quien-afecta/)
- [ESECE — Verifactu 2027 y el anuncio de aplazamiento de octubre de 2026](https://esece.es/blog/verifactu-2027-guia-empresas-autonomos/)
- [Mutua Fácil — tarifa plana de autónomos 2026](https://mutuafacil.es/guias-y-recursos/autonomo-tarifa-plana/)
- [Wolters Kluwer — cuotas de autónomos 2026](https://www.wolterskluwer.com/es-es/expert-insights/cuotas-autonomos-2026)

Las fuentes sobre caducidad de bonos y sobre la cuota de autónomos **no coinciden entre sí**; están
marcadas como tales en el texto. Verifactu está pendiente de una norma que todavía no se ha
publicado. Confírmalo todo con la gestoría antes de firmar nada.
