# Auditoría legal de la web — Tixola Tapería

**Fecha:** 14 de octubre de 2026 · **Alcance:** todo el contenido publicado en los cuatro idiomas
(portada, carta, vinos, páginas legales, camarero virtual, galería y pie).

> **Esto no es asesoramiento jurídico.** Es una revisión técnica del contenido y del código contra
> las normas que se citan, hecha leyendo el código línea a línea y comprobando el resultado en el
> navegador. Quien firma el cumplimiento es la titular del negocio, y las dudas de criterio
> (inscripción en registros, fiscalidad, contratos) las resuelve su gestoría. Las normas cambian:
> esta revisión vale para el texto vigente a la fecha de arriba.
>
> **Nota de método:** el contenedor donde se hizo esta revisión no tiene salida al BOE ni al DOG, así
> que los textos legales se consultaron a través de buscador. Lo que aquí se cita como artículo
> concreto está contrastado con al menos dos fuentes; donde no he podido verificar el literal, lo
> digo expresamente y queda marcado para la gestoría.

---

## Veredicto

**La web se puede publicar sin que yo vea en ella ninguna infracción que hoy acarree una sanción
automática**, con dos salvedades que ya estaban en la lista de lanzamiento y siguen abiertas:

1. **Falta el correo de contacto** (art. 10.1.a LSSI-CE). Es el único dato identificativo que falta y
   es también el canal para ejercer los derechos del RGPD. Mientras falte, las tres páginas legales
   se publican con `noindex` y fuera del sitemap, que es la forma de no difundir un aviso legal
   incompleto. **Bloquea el lanzamiento.**
2. **Los alérgenos no están firmados por la casa.** No es un problema de forma —la web informa y
   avisa correctamente— sino de fondo: el dato que se publica procede de la receta estándar, no de
   la cocina. Es el riesgo más serio de toda la web, y no es un riesgo de multa: es un riesgo
   sanitario. **Bloquea el lanzamiento.**

Lo demás está cubierto o es recomendación. El detalle, norma a norma:

---

## A · Identificación del prestador — Ley 34/2002 (LSSI-CE), art. 10

| Dato que exige el art. 10.1 | Estado |
|---|---|
| Nombre o denominación social | ✅ Tatiana González Ferreira (`src/data/legal.ts`) |
| NIF | ✅ 44450501B |
| Domicilio | ✅ Rúa Juan de Austria 7, 32005 Ourense |
| **Correo electrónico** | ❌ **`[EMAIL DE CONTACTO]`** |
| Datos registrales | ✅ No aplica: el art. 10.1.b los pide solo a quien esté inscrito en un registro mercantil, y una empresaria individual no lo está. El campo se deja vacío a propósito y la fila no se pinta. |
| Teléfono (no obligatorio, pero cuenta como medio de contacto directo) | ✅ 646 45 72 74, en cabecera, pie y dock móvil |

**Riesgo del punto que falta:** el incumplimiento del art. 10 es infracción **leve** (art. 38.4.a
LSSI), con multa de hasta 30.000 €. En la práctica se resuelve con requerimiento previo, pero no hay
razón para lanzarse sin un correo.

---

## B · Protección de datos — RGPD (UE) 2016/679 y LO 3/2018 (LOPDGDD)

| Punto | Estado |
|---|---|
| Política de privacidad propia, en página aparte y enlazada desde el pie | ✅ en los cuatro idiomas |
| Responsable del tratamiento identificado | ✅ (los mismos datos del aviso legal) |
| Finalidades y **base jurídica** de cada tratamiento | ✅ tabla por tratamiento |
| Encargados del tratamiento nombrados | ✅ Vercel (hosting y analítica) y Anthropic (camarero virtual) |
| Transferencias internacionales advertidas | ✅ EE. UU., con el plazo de conservación de Anthropic (30 días, hasta 2 años en los casos que su política prevé) |
| Plazos de conservación | ✅ |
| Derechos (acceso, rectificación, supresión, oposición, limitación, portabilidad) y reclamación ante la AEPD | ✅ |
| Canal para ejercerlos | ⚠️ depende del correo que falta |
| Menores | ✅ la web declara no dirigirse a menores de 14 años (art. 7 LOPDGDD) ni recabar sus datos |
| Datos de salud | ✅ el camarero virtual tiene prohibido pedirlos y el aviso pide no escribirlos; el servidor no guarda las conversaciones |
| Registro de actividades (art. 30) | ⚠️ **Lo lleva la gestoría, no la web.** Si no existe, conviene crearlo: con tratamientos tan simples es un folio. |

**No hay base de datos, ni cuentas, ni formularios**, lo que elimina de golpe la mayor parte del
riesgo típico: no hay nada que filtrar.

---

## C · Cookies — art. 22.2 LSSI y Guía de la AEPD

| Punto | Estado |
|---|---|
| Banner antes de instalar nada no imprescindible | ✅ |
| **Rechazar tan fácil como aceptar** | ✅ Medido en el navegador: «Aceptar todas» 161×48 px y «Solo necesarias» 173×48 px, mismo fondo, mismo color, misma letra (15 px) y mismo peso (600), uno al lado del otro. No está detrás de «Configurar». |
| Granularidad (aceptar unas sí y otras no) | ✅ panel de preferencias |
| Caducidad del consentimiento | ✅ 12 meses (la AEPD admite hasta 24) |
| Posibilidad de cambiar de opinión después | ✅ enlace permanente en el pie |
| Política de cookies con tabla de cookies, titular, finalidad y plazo | ✅ |
| Nada se carga antes del consentimiento | ✅ comprobado: el mapa de Google y la analítica no aparecen en el HTML hasta aceptar |
| Cookie técnica propia (`NEXT_LOCALE`, idioma) | ✅ exenta de consentimiento; va `Secure` y `SameSite=Lax` |

---

## D · Consumidores — RDL 1/2007 (TRLGDCU) y Ley 2/2012 gallega

| Punto | Estado |
|---|---|
| Precios finales **con impuestos** allí donde se muestran (art. 20.1.c y 60.2.c) | ✅ en la carta y en cada ficha de plato |
| Información veraz y no engañosa | ✅ ver el apartado F |
| **Hojas de reclamaciones** | ⚠️ El art. 32 de la Ley 2/2012 obliga a tenerlas **en el establecimiento**, junto con el cartel anunciador. No he encontrado ninguna norma que obligue a publicarlas en la web. **Recomendación:** comprobar que el cartel está puesto en el local; y, si se quiere, una línea en el pie («Tenemos hojas de reclamaciones a tu disposición») suma y no cuesta nada. |
| Resolución de litigios en línea (plataforma ODR) | ✅ No aplica: no hay contratación en línea. La obligación es de los comercios electrónicos. |
| Condiciones de contratación | ✅ No aplica: la web no vende ni reserva. |

---

## E · Alérgenos — Reglamento (UE) 1169/2011 y RD 126/2015

| Punto | Estado |
|---|---|
| Se informa de los 14 alérgenos plato a plato | ✅ 47 platos con sus alérgenos, filtro para excluirlos y leyenda con los 14 |
| Aviso visible de que la cocina manipula todos los alérgenos y de que se consulte al personal | ✅ **desde el 14-10-2026** va a la vista, antes de los platos; antes solo estaba dentro de la leyenda |
| La web declara **presencia**, nunca ausencia | ✅ decisión de diseño deliberada: una lista corta no se puede leer como «esto es seguro» |
| Lo que la carta de papel declara sin gluten | ✅ se respeta tal cual (croquetas y postre) |
| **Verificación por la cocina** | ❌ **Pendiente de la firma de Tatiana** (`docs/alergenos-para-revisar.md`) |

**Por qué esto es lo más serio de la web:** publicar un alérgeno de menos no es una infracción
formal, es alguien en urgencias. Hay además cuatro platos donde la foto enseña ingredientes que la
carta no nombra (nueces en la ensalada de cecina, melocotón y salsa en los fingers, salsa oscura en
la tosta de salmón) y que están marcados para revisión.

---

## F · Publicidad y competencia desleal — Ley 3/1991 y Ley 34/1988

| Punto | Estado |
|---|---|
| Afirmaciones de superioridad («el mejor», «nº 1») | ✅ **Retiradas** el 10-10-2026: una afirmación de superioridad hay que poder probarla (art. 5 y 10 Ley 3/1991) y ninguna salía de un estudio. |
| Datos de valoración | ✅ Solo los de Google, **atribuidos a Google** y con el número de reseñas. Las cifras de TripAdvisor se retiraron porque sus condiciones no permiten sacarlas de sus widgets. |
| Fotos que representen lo que se sirve | ✅ todas son del local y de sus platos |
| ⚠️ Cifras escritas a mano | Las de Google (4,4 · 858) están en el código. Si pasan meses sin tocarlas, dejan de ser ciertas y entonces sí son información engañosa. **Repasar cada pocos meses.** |

---

## G · Bebidas alcohólicas — Ley 6/2025 de Galicia

La **Ley 6/2025, de 23 de diciembre, de protección de la salud de las personas menores y prevención
de las conductas adictivas** (DOG del 7-1-2026) está **en vigor desde el 7 de marzo de 2026** y
sustituye en esta materia a la Ley 11/2010. Afecta a esta web porque `/vinos` es, legalmente,
publicidad de bebidas alcohólicas: 53 fichas con foto de botella, nota de cata y maridaje.

| Punto | Estado |
|---|---|
| Publicidad dirigida a menores | ✅ Nada en la página se dirige a menores: ni personajes, ni lenguaje, ni contexto juvenil. |
| Promociones que inciten al consumo excesivo (art. 20.5: «barra libre» y equivalentes) | ✅ No hay ninguna. Comprobado por búsqueda en todo el contenido: ni «barra libre», ni «2x1», ni «chupito», ni «gratis», ni «ilimitado». La banda de promociones está vacía (`PROMO = null`). |
| Asociar el alcohol con éxito social, rendimiento o conducción | ✅ No aparece |
| **Aviso de mayoría de edad y moderación** | ✅ **Añadido el 14-10-2026** al pie de la carta de vinos, en los cuatro idiomas. No lo exige expresamente ninguna norma para una web informativa, pero es lo que hace explícito que la página no se dirige a menores, lo lleva cualquier web de bodega y cuesta una línea. |
| Barrera de edad a la entrada | ❌ **No se pone a propósito.** Ninguna norma española la exige para la web de un restaurante, y poner una puerta de edad en una web que es sobre todo una carta sería desproporcionado. |

---

## H · Propiedad intelectual — RDL 1/1996 (TRLPI)

| Punto | Estado |
|---|---|
| Reseñas de terceros reproducidas | ✅ **Retiradas** el 13-10-2026 (texto, nombre y ciudad). El texto de una reseña es obra de quien la escribió y el derecho de cita del art. 32.1 solo cubre docencia e investigación. |
| Fotos | ✅ propias del negocio |
| Mapas | ✅ atribuidos: OpenStreetMap (Galicia) y Natural Earth (dominio público) |
| Tipografías | ✅ alojadas en el propio servidor, con licencia abierta |
| ⚠️ `public/images/fachada.jpg` | **Procedencia desconocida**: era una captura de un visor de fotos. Sustituir por una foto propia. |

---

## I · Derecho a la propia imagen — LO 1/1982

| Punto | Estado |
|---|---|
| Clientes reconocibles | ✅ se excluyeron dos fotos del comedor |
| ⚠️ **Camarero reconocible en la foto de la fachada** | **Riesgo abierto.** El art. 7.5 considera intromisión ilegítima captar o publicar la imagen de una persona en lugares de su vida privada, y el 7.6 usar su nombre o imagen con fines publicitarios sin consentimiento; el art. 9.3 **presume el perjuicio**. El consentimiento de un trabajador debe ser expreso y por escrito, y no se presume por la relación laboral. **Sustituir la foto o recabar su consentimiento firmado.** |

---

## J · Inteligencia artificial — Reglamento (UE) 2024/1689, art. 50

El art. 50 (transparencia) **es aplicable desde el 2 de agosto de 2026**, es decir, ya.

| Punto | Estado |
|---|---|
| Que la persona sepa que habla con una IA | ✅ El primer mensaje dice literalmente «asistente de inteligencia artificial (no una persona)», la etiqueta «Asistente con IA» va en el panel y el prompt del sistema le obliga a repetirlo si se lo preguntan. En los cuatro idiomas. |
| Quién procesa los mensajes y dónde | ✅ Anthropic (EE. UU.), dicho en el propio chat y en la política de privacidad |
| No pedir datos personales ni de salud | ✅ prohibido en el prompt; el aviso lo pide también a quien escribe |
| No guardar la conversación | ✅ vive solo en el navegador (`sessionStorage`), con botón para borrarla; el servidor no registra el contenido |

**Sanciones del art. 99 para incumplir el art. 50:** hasta 15 M€ o el 3 % del volumen de negocio
mundial, la mayor de las dos (para pymes, la menor). La web cumple el 50.1, pero conviene saber el
orden de magnitud: es la norma más cara de la lista.

**Dos puntos que la primera revisión no miró, añadidos el 14-10-2026:**

- ⚠️ **Art. 50.2 — marcado legible por máquina del texto generado.** Obliga a los **proveedores** de
  sistemas de IA generativa a marcar la salida para que una máquina pueda detectar que es sintética.
  Aquí el proveedor del modelo es **Anthropic**, y Tixola es responsable del despliegue (*deployer*),
  cuyas obligaciones son las del 50.1 —que se cumplen—. **Pregunta para la gestoría:** si poner el
  asistente en servicio con nombre y prompt propios convierte también a la titular en proveedora a
  efectos del art. 3.3. Mientras no se aclare, no se añade ningún marcado: para un chat de barra sería
  desproporcionado y nadie lo exige a un *deployer*. El plazo del paquete Ómnibus para los sistemas ya
  en servicio vence el **2-12-2026**, así que hay tiempo de resolver la duda.
- ✅ **Art. 4 — alfabetización en IA.** Este sí aplica a Tixola como responsable del despliegue, y es
  aplicable desde el **2-2-2025**: quien pone en servicio un sistema de IA debe procurar que su
  personal tenga un nivel suficiente de alfabetización sobre él. **Resuelto el 14-10-2026** con
  `docs/camarero-virtual-para-el-personal.md`: media cara para la barra con qué contesta el asistente,
  qué no contesta y qué hacer cuando un cliente llegue diciendo «me lo dijo el chat».

---

## K · Accesibilidad — Ley 11/2023 (Ley Europea de Accesibilidad)

**Probablemente no aplica**, por dos motivos independientes: (1) la ley obliga a los **servicios de
comercio electrónico**, definidos como los que se prestan para celebrar un contrato, y esta web no
vende ni reserva; (2) exime a las **microempresas** que prestan servicios (menos de 10 personas y
menos de 2 M€), que es el caso.

Aun así la web se construyó con criterios de accesibilidad: contraste ≥ 4,5:1 comprobado, navegación
por teclado, textos alternativos en todas las imágenes en los cuatro idiomas, `prefers-reduced-motion`
respetado y etiquetas accesibles en todos los controles. **Es una ventaja, no una obligación.**

---

## L · Turismo — Lei 7/2011 do turismo de Galicia

⚠️ **Trámite del negocio, no de la web.** La Lei 7/2011 encuadra las empresas de restauración
(restaurantes, cafeterías y bares) en su art. 77, y para iniciar la actividad Galicia pide una
**declaración responsable ante la Agencia de Turismo de Galicia** —procedimiento **TU984B**, «Inicio
de actividade de restaurantes ou cafetarías»—, con la que la oficina provincial **inscribe de oficio**
el establecimiento en el **REAT**. El art. 12 reconoce además al cliente el derecho a ver en lugar
visible los distintivos, la capacidad y los precios.

**Respuesta de la casa (14-10-2026): dice que NO está inscrita.** Hay que matizarlo antes de dar nada
por hecho: esa declaración responsable suele presentarla la gestoría junto con la licencia de
apertura, así que es muy posible que esté hecha y ella no lo recuerde. **Lo que procede es que la
gestoría confirme si el TU984B se presentó**, y si no, presentarlo: habilita desde el mismo día de
la presentación.

**Qué significa esto para la web: nada que arreglar.** La web no se presenta como establecimiento
inscrito, no exhibe distintivos turísticos ni número de registro, y no afirma nada que dependa de esa
inscripción — así que no hay texto que corregir ni que retirar. Si el número existe, ponerlo en el
aviso legal es una línea. El riesgo, si lo hubiera, sería administrativo y del establecimiento, no de
esta web.

---

## M · Seguridad — RGPD art. 32

| Punto | Estado |
|---|---|
| HTTPS forzado + HSTS (2 años) | ✅ comprobado en las cabeceras de producción |
| Content-Security-Policy, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP | ✅ comprobado en producción |
| Clave de IA solo en el servidor | ✅ marcada como sensible en Vercel; no viaja al navegador |
| Secretos en el historial de Git | ✅ revisado: ninguno |
| Límite de peticiones y de tamaño en la ruta de IA | ✅ 30 por IP cada 10 min, 403 si no viene de la propia web, 413 si el cuerpo pasa de 96 KB, 415 si no es JSON. ⚠️ **Matiz operativo, no legal:** el contador vive en la memoria de cada instancia de la función, y en Vercel puede haber varias a la vez, así que el tope efectivo es mayor que 30. Para la política de privacidad da igual —lo que promete es que se cuenta por IP durante diez minutos, y eso es exacto—, pero para proteger la factura de Anthropic conviene poner también un límite de tasa en el Firewall de Vercel, que se configura en el panel y no toca el código. |
| Dependencias | ✅ `npm audit` sin vulnerabilidades que lleguen al navegador |

---

## Lo que queda, por orden de urgencia

| # | Qué | De quién | Por qué |
|---|---|---|---|
| 1 | **Alérgenos firmados** | Tatiana | Riesgo sanitario, no de multa |
| 2 | **Correo de contacto** | Brian/Tatiana | Art. 10 LSSI y canal de derechos RGPD |
| 3 | **Sustituir la foto de la fachada** | Brian | Imagen de un trabajador + procedencia de la foto |
| 4 | Confirmar con la gestoría si se presentó el TU984B (declaración responsable de inicio de actividad, que inscribe en el REAT) | gestoría | Lei 7/2011, art. 77 · **no afecta a la web** |
| ~~5~~ | ~~Cartel de hojas de reclamaciones~~ · **confirmado el 14-10-2026: está puesto** | — | — |
| ~~6~~ | ~~Registro de actividades de tratamiento~~ · **confirmado el 14-10-2026: existe** | — | — |
| 7 | Repasar las cifras de Google cada pocos meses | quien mantenga la web | Que no envejezcan |

---

## Fuentes consultadas

- [Ley 34/2002 (LSSI-CE)](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758) · art. 10 y 22.2
- [Reglamento (UE) 2016/679 (RGPD)](https://eur-lex.europa.eu/eli/reg/2016/679/oj) y [LO 3/2018](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673)
- [Ley 6/2025, de 23 de diciembre, de protección de la salud de las personas menores y prevención de las conductas adictivas](https://www.xunta.gal/dog/Publicados/2026/20260107/AnuncioC3B0-231225-0003_es.html) ([BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2026-3386))
- [Ley 2/2012 gallega de protección general de las personas consumidoras y usuarias](https://www.boe.es/buscar/act.php?id=BOE-A-2012-5595) · art. 32
- [Lei 7/2011 do turismo de Galicia](https://www.boe.es/buscar/act.php?id=BOE-A-2011-19058) · arts. 12, 50 y 51
- [Reglamento (UE) 1169/2011](https://eur-lex.europa.eu/eli/reg/2011/1169/oj) y RD 126/2015
- [Reglamento (UE) 2024/1689 de IA](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) · arts. 50 y 99
- [Ley 11/2023 de accesibilidad](https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022)
- [RDL 1/2007 (TRLGDCU)](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555) · arts. 20 y 60
- [Ley 3/1991 de competencia desleal](https://www.boe.es/buscar/act.php?id=BOE-A-1991-628) · arts. 5 y 10
- [LO 1/1982](https://www.boe.es/buscar/act.php?id=BOE-A-1982-11196) · arts. 7 y 9
