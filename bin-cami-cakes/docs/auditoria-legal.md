# Auditoría legal de la web · Bin & Cami Cakes

**Fecha:** 14 de octubre de 2026 · **Revisado:** `index.html`, `mostrador.html`, `dist/` y
`assets/`, más la web servida en el navegador.

---

## Descargo, y va en serio

No soy abogado. Esto es una **revisión técnica**: he leído el código, lo he ejecutado en el
navegador y he medido. Quien firma el cumplimiento es la titular del negocio, y las decisiones
de forma jurídica, registros y contratos son de la gestoría.

Y hay una limitación grande que condiciona todo lo que sigue, así que va la primera.

### No he podido verificar el texto de las normas

Desde la máquina donde se hace este trabajo **no se puede abrir ninguna fuente legal oficial**.
Comprobado uno a uno: `boe.es`, `eur-lex.europa.eu`, `aepd.es`, `xunta.gal`, `dog.xunta.gal` y
`lex.gal` no resuelven siquiera el DNS (bloqueo de la política de red del entorno).

De **63 artículos** que esta auditoría toca, se ha podido leer el literal en fuente oficial de
**2**. Los demás proceden de conocimiento previo y de fuentes secundarias.

**Qué significa esto en la práctica:**

| | Fiabilidad |
|---|---|
| Lo que dice el código y lo que hace la web en el navegador | **Verificado por mí.** Lo he abierto, ejecutado y medido. Es sólido. |
| Qué norma se aplica, qué artículo y qué sanción | **Orientativo. A confirmar con la gestoría.** No he leído el literal vigente. |

Por eso en las tablas de abajo la columna de la norma lleva el aviso «(sin verificar)». No es
falsa modestia: una norma puede haber sido modificada o derogada y yo no tendría forma de
saberlo desde aquí. **Lleva este informe a la gestoría para que valide la parte legal**; la
parte técnica no hace falta que la revise nadie, está comprobada.

---

## Veredicto, en tres líneas

1. **Sí se puede publicar**, y de hecho ya está publicada y cerrada a buscadores
   (`noindex, nofollow`), que es lo correcto mientras no tenga dominio propio.
2. **Nada de lo encontrado es un incumplimiento grave que obligue a bajarla.** Lo que había de
   código ya está arreglado y comprobado (14 arreglos, abajo).
3. **Lo que queda no es código: son permisos y datos que sólo tiene Luisa.** Lo más urgente, con
   diferencia, es el **permiso por escrito de la persona que sale de cara en dos fotos**, una de
   ellas la que se enseña al compartir el enlace en WhatsApp.

---

## El negocio, para situar

| | |
|---|---|
| Actividad | Obrador de repostería artesanal venezolana. Tartas por encargo y venta en mostrador. |
| Dónde | Rúa do Progreso 27, bajo 3 · 32005 Ourense · **Galicia** |
| Titular (según el aviso legal) | Luisa Rosa Chourio Aristizabal · NIF `Y8990764D` |
| Forma jurídica | **No consta en ninguna parte. Dato a confirmar.** |
| Qué hace la web | **Informativa.** No vende, no cobra, no hay carrito ni pasarela ni usuarios. Los encargos se cierran por WhatsApp, teléfono o en el local. |
| Idiomas | Castellano, galego, inglés y portugués |
| Dirección | https://bin-cami-cakes.vercel.app (cerrada a buscadores) |

Que la web **no venda online** es el dato que más cambia el resultado: deja fuera todo el bloque
de contratación a distancia, que es donde están las obligaciones más pesadas.

---

## Bloque 1 · Identificación del prestador

**Aplica.** Que no se venda online no libra: la obligación nace de prestar un servicio de la
sociedad de la información, y una web de empresa que capta encargos lo es.

| Punto exigido | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| Nombre y apellidos del titular | LSSI art. 10.1.a | ✅ | `index.html:3911+` — «Luisa Rosa Chourio Aristizabal» |
| Nombre comercial | — | ✅ | ídem — «Bin & Cami Cakes» |
| NIF | LSSI art. 10.1.c | ✅ | ídem — `Y8990764D` |
| Domicilio del establecimiento | LSSI art. 10.1.a | ✅ | ídem — Rúa do Progreso 27, bajo 3 |
| Correo electrónico (comunicación directa) | LSSI art. 10.1.b | ✅ | ídem — `binycamicakes2023@gmail.com` |
| Otro medio de contacto | LSSI art. 10.1.b | ✅ | ídem — teléfono 656 584 027 |
| Accesible desde toda la web, sin login | LSSI art. 10.1 | ✅ | Enlace en el pie de las dos páginas |
| Sin marcadores de relleno sin sustituir | — | ✅ | Comprobado: no hay `XXX`, `[...]` ni `lorem` |
| Datos registrales | LSSI art. 10.1.a | ✅ no aplica | Persona física: no procede Registro Mercantil |
| Colegio profesional | LSSI art. 10.1.d | ✅ no aplica | Actividad no colegiada |
| Precios con impuestos | LSSI art. 10.1.e | ✅ **arreglado** | Ver bloque 4 |

**Pendiente:** confirmar la forma jurídica. Si resultara ser sociedad y no persona física, habría
que añadir denominación social y datos registrales. El NIF empieza por `Y`, o sea que es un NIE:
conviene que la gestoría confirme que ese es el identificador fiscal correcto de la actividad.

---

## Bloque 2 · Protección de datos

**Aplica de lleno**, aunque el volumen sea pequeño.

| Punto exigido | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| Política de privacidad propia y enlazada | RGPD arts. 13-14 | ✅ | `index.html:3972+`, enlazada en el pie |
| Responsable identificado | RGPD art. 13.1.a | ✅ | Nombre, NIF, domicilio y contacto |
| Finalidad y base jurídica de cada tratamiento | RGPD arts. 13.1.c, 6 | ✅ | Tabla de tratamientos |
| Plazos de conservación | RGPD art. 13.2.a | ✅ | Columna de la tabla |
| Derechos y reclamación ante la AEPD | RGPD arts. 15-22, 77 | ✅ | Apartado «Tus derechos» |
| Canal real para ejercerlos | RGPD art. 12 | ✅ | Teléfono y correo |
| Encargados nombrados | RGPD art. 28 | ✅ | Meta, Vercel, Google — los tres que usa el código |
| Transferencias internacionales | RGPD arts. 44-49 | ✅ | Vercel, con cláusulas contractuales tipo |
| Sin analítica ni publicidad | — | ✅ **medido** | 0 peticiones a terceros al abrir la página |
| Casillas **no** premarcadas | RGPD art. 4.11 | ✅ **medido** | 0 `checked` en todo el documento |
| Consentimiento comercial **separado** de la privacidad | RGPD art. 6.1.a | ✅ | `index.html:3844` y `:3849`, dos casillas |
| Geolocalización en la tabla de tratamientos | RGPD art. 13 | ✅ **arreglado** | Faltaba; el código sí la pide |
| Que el alta al boletín pasa por Meta | RGPD art. 13.1.e | ✅ **arreglado** | Faltaba decirlo |
| El correo no viaja en la URL sin JavaScript | RGPD art. 5.1.f | ✅ **arreglado** | `index.html:3799` ahora `method="post"` |
| Doble consentimiento en el boletín | — | ⚠️ | No lo hay. Hoy no hay lista de correo (el `ENDPOINT` está vacío) |
| Mecanismo de baja | RGPD art. 7.3 | ⚠️ | Se prometía la baja sin dar el cómo. Se ha quitado la exigencia de acreditar identidad |
| Registro de actividades de tratamiento | RGPD art. 30 | ⚠️ falta dato | Depende de la gestoría |
| **Datos de salud por WhatsApp** | RGPD art. 9 | ⚠️ falta dato | Ver abajo |

**Lo que más me preocupa de este bloque:** cuando una clienta encarga una tarta y dice «mi hija
es celíaca» o «soy alérgica a los frutos secos», eso es un **dato de salud**, que el RGPD trata
como categoría especial. Llega por WhatsApp y se queda en el móvil del obrador. No es un fallo de
la web —la web no lo recoge—, pero es un tratamiento real que la política no menciona y que la
gestoría debería valorar.

---

## Bloque 3 · Cookies

**Aplica**, pero en su versión mínima: la web sólo tiene un tercero (el mapa) y dos
almacenamientos técnicos propios.

| Punto exigido | Norma (sin verificar) | Estado | Dónde está / medida |
|---|---|---|---|
| Nada de terceros antes de aceptar | LSSI art. 22.2 | ✅ **medido** | Con el almacenamiento limpio: **0 peticiones a Google** |
| Rechazar cuesta lo mismo que aceptar | Guía AEPD | ✅ **medido** | Mismo tamaño, misma posición, misma tipografía |
| …con la misma prominencia visual | Guía AEPD | ⚠️ | Aceptar es frambuesa `rgb(181,48,88)`; rechazar, rosa claro `rgb(249,235,241)`. Decisión de diseño |
| Configuración por categorías | Guía AEPD | ⚠️ | Sólo aceptar/rechazar. Hay **una** categoría de terceros, así que el granulado no aporta |
| El consentimiento caduca | Guía AEPD (24 meses máx.) | ✅ | **12 meses**, por debajo del techo |
| Se puede cambiar de idea | LSSI art. 22.2 | ✅ **medido** | «Preferencias de cookies» en el pie, funciona |
| Política de cookies con tabla completa | LSSI art. 22.2 | ✅ **arreglado** | Faltaba la familia `pista-…`. Ya está |
| Al rechazar, el mapa no carga | LSSI art. 22.2 | ✅ **medido** | 0 peticiones a Google, se ve la dirección y el enlace |
| **Al aceptar, el mapa sí carga** | — | ✅ **arreglado** | Estaba roto. Ver abajo |
| El enlace a más información se puede pulsar | WCAG 2.5.8 | ✅ **arreglado** | Medía 17 px de alto; ahora 24 |

**El fallo que estaba roto:** el código comprobaba si Google responde con un `fetch` a
`maps.google.com`, pero la CSP de producción lleva `connect-src 'self'`, así que el navegador
**bloqueaba siempre** ese `fetch` y el mapa se daba por muerto aunque hubiese cargado. Resultado:
quien aceptaba las cookies seguía sin ver el mapa. Quitado el sondeo y verificado contra la CSP
real: rechazando, 0 peticiones a Google; aceptando, el mapa se ve.

---

## Bloque 4 · Consumidores

**Aplica parcialmente.** Al no haber contratación a distancia por la web, **no aplican** el
derecho de desistimiento, la confirmación del pedido ni la información precontractual del art. 97
TRLGDCU. Sí aplica la obligación de información veraz y de precios finales.

| Punto exigido | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| Precio final con impuestos | TRLGDCU art. 60 | ✅ **arreglado** | Era «6 € / porción»; ahora «6 € / porción · IVA incluido», en los 4 idiomas |
| Información veraz | TRLGDCU art. 60 | ✅ **arreglado** | La descripción del mostrador prometía precios que no estaban |
| Precios orientativos advertidos | — | ✅ | Aviso legal, apartado «Precios, plazos y disponibilidad» |
| Desistimiento, confirmación, art. 97 | TRLGDCU arts. 97 y ss. | ✅ no aplica | No hay venta a distancia |
| Hojas de reclamaciones | Ley gallega 2/2012 | ⚠️ falta dato | Ver abajo |

**Pendiente, y es de Galicia:** la normativa gallega de consumo obliga a tener hojas de
reclamaciones y a anunciarlas con un cartel en el establecimiento. Si **hay que informar de ellas
también en la web** no lo he podido confirmar (DOG bloqueado). Es una pregunta directa para la
gestoría, y si la respuesta es que sí, se añade un párrafo y listo.

---

## Bloque 5 · Sector alimentario

**Aplica parcialmente.** La web **enseña** productos pero no los **vende** a distancia, así que
el art. 14 del Reglamento 1169/2011 (venta a distancia) no se activa en sentido estricto. Aun
así, la web ya declara alérgenos, que es lo correcto.

| Punto exigido | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| Los 14 alérgenos por producto | Rgto. UE 1169/2011 anexo II | ✅ | `index.html:5237+`, campo `alerg` de cada dulce |
| Advertencia honesta de trazas | RD 126/2015 | ✅ | Aviso legal: obrador pequeño, no se garantiza ausencia de trazas |
| Ingredientes marcados como orientativos | — | ✅ | Aviso en cada ficha de producto |
| Alérgenos en los 4 idiomas | — | ✅ | Comprobado: 0 claves sin traducir |
| Nº de registro sanitario en la web | Rgto. 1169/2011 / REGASA | ⚠️ falta dato | No figura. ¿Está inscrita? ¿Debe aparecer? |
| Marcas usadas como ingrediente | — | ⚠️ falta dato | «Kinder Bueno» y «Raffaello»: ¿los llevan de verdad? |

**Ojo con esto:** en agosto de 2025 Galicia cambió el registro sanitario de empresas alimentarias
(decreto del REGASA, según fuente secundaria que **no he podido verificar**). Es otra pregunta
para la gestoría.

---

## Bloque 6 · Publicidad y competencia desleal

**Aplica entero**, y es de los bloques que más aplica precisamente *porque* la web es publicidad.

| Punto exigido | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| Sin afirmaciones de superioridad propias | Ley 3/1991 art. 5 | ✅ **arreglado** | Decía «**el mejor** tres leches» en la descripción que sale en buscadores |
| Citas de reseñas literales | Ley 3/1991 art. 5 | ✅ **arreglado** | Una cita estaba recortada por dentro y seguía entre comillas |
| Superlativos dentro de reseñas citadas | Ley 3/1991 | ⚠️ | «El mejor tres leches…», «Luisa es la mejor en lo que hace». Son de terceros, pero al elegirlas funcionan como reclamo |
| Valoración media demostrable | Ley 3/1991 art. 5 | ⚠️ falta dato | Se declara 4,9 sobre **18** reseñas y se enseñan **16** |
| Enlace al origen de las reseñas | — | ⚠️ | Las 16 enlazan a la misma búsqueda de Google, no a cada reseña |
| Precios tachados / descuentos | Directiva Ómnibus | ✅ no aplica | No hay ningún descuento ni precio anterior en la web |

---

## Bloque 7 · Productos con publicidad restringida

**No aplica.** Comprobado producto a producto en `DULCES` (`index.html:5237+`) y en los textos de
los cuatro idiomas: no hay alcohol, tabaco, vapeadores, juego, productos sanitarios, suplementos
ni declaraciones nutricionales o de salud («sin azúcar», «saludable», «adelgaza»…). Es repostería
corriente. Si algún día entra una tarta con licor, este bloque se reabre.

---

## Bloque 8 · Contenido de terceros

| Punto | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| 16 reseñas de Google reproducidas | TRLPI art. 32 / condiciones de Google | ⚠️ | `index.html:4914-4930` |
| …con nombre y apellidos de 14 personas | RGPD | ✅ **resuelto (27/10)** | Ahora sólo el nombre de pila; los alias de Google, tal cual |
| …sin enlace a cada reseña | — | ⚠️ | `index.html:4931`, una sola URL genérica |
| Tipografías con licencia y propias | TRLPI | ✅ **medido** | Servidas desde el propio dominio, 0 peticiones a Google Fonts |
| Mapa atribuido | — | ✅ | Es el iframe oficial de Google Maps |
| Emblema de **Lamborghini** en una tarta | Ley 17/2001 de Marcas | ✅ **decidido por Luisa (27/10)** | `assets/tarta-tematica.*`, en portada y galería |
| **Totoro** (Studio Ghibli) y **ROBLOX** | TRLPI / Marcas | ✅ **decidido por Luisa (27/10)** | `assets/tarta-06.*` y `tarta-08.*` |
| **Nutella** y globos de **Nintendo** al fondo | Marcas | ✅ **decidido por Luisa (27/10)** | `assets/pastelera.*` y `assets/og-image.jpg` |
| **Dragon Ball**, escudo del **FC Barcelona**, casco **LS2** con el nombre «Efren 50» | Marcas / RGPD (nombre del cliente) | ✅ **aprobado por Luisa (27/10)** | `assets/tarta-20.*`, `tarta-21.*` (también en el carrusel) y `tarta-22.*` |

Dejo constancia de una matización honesta: fotografiar una tarta que una clienta encargó con un
personaje no es lo mismo que vender merchandising, y el riesgo real de que Ghibli o Lamborghini
reclamen a un obrador de Ourense es bajo. Pero es contenido de marca ajena usado como reclamo
comercial propio, y la decisión de dejarlo o no es de Luisa, no mía.

> **27/10/2026 — Brian confirma que todas las fotos se las pasó Luisa, con su consentimiento,
> para publicarlas.** Decisión tomada: se quedan. Es una decisión de riesgo asumido por ella,
> no una licencia de los titulares de las marcas.

---

## Bloque 9 · Imagen de personas

**Este es el bloque con más riesgo real de toda la web.**

| Punto | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| Cara reconocible en la web | LO 1/1982 arts. 2 y 7.5 | ✅ **concedido** | `assets/pastelera.webp`, en «Quiénes somos» |
| **La misma cara en la imagen que se comparte** | LO 1/1982 | ✅ **concedido** | `assets/og-image.jpg`: es lo que sale al pegar el enlace en WhatsApp |
| Nombres de criaturas en las tartas | RGPD / LO 1/1982 | ✅ **concedido** | `tarta-04` («Rita 4 años»), `tarta-05` («Jonathan»), `tarta-08` («Santiago») |

> **19/10/2026 — Brian comunica que todos los permisos están concedidos.** Las fotos se
> quedan como están; no hay cambio de código que hacer.
>
> Dos avisos que no son pegas, son para que esto aguante si algún día alguien pregunta:
>
> 1. **Lo que protege es el papel, no este apunte.** La LO 1/1982 pide consentimiento
>    expreso y, si la persona retratada es trabajadora, **por escrito**: no se presume por
>    la relación laboral. Conviene tener un documento firmado por la persona de las fotos y
>    uno por cada familia, diciendo qué foto es, dónde se publica (web **y** la imagen que
>    viaja al compartir el enlace) y que se puede revocar. Guardarlos con el resto de
>    papeles del negocio.
> 2. **Esto no alcanza a lo que no es de Luisa.** Quedan fuera, porque no son permisos que
>    ella pueda conceder: los **nombres y apellidos de 14 personas** en las reseñas
>    copiadas de Google (el permiso sería de cada una de ellas) y las **marcas de terceros**
>    de las fotos (Lamborghini, Totoro, ROBLOX, Nutella, Nintendo). Siguen como decisión de
>    riesgo asumido, no como permiso obtenido.

El art. 9.3 de la LO 1/1982 **presume el perjuicio**: quien reclama no tiene que demostrar daño.
Por eso esto va el primero de la lista de pendientes, aunque no sea un fallo de código.

---

## Bloque 10 · Inteligencia artificial

**No aplica, y conviene dejarlo escrito** porque a simple vista parece que sí.

La web tiene un «asistente» que ayuda a pedir presupuesto. **No es IA.** Es un árbol de preguntas
fijo escrito a mano: cada respuesta concatena texto y al final abre WhatsApp con el mensaje
redactado. No hay modelo, no hay inferencia, no hay llamada a ningún servicio. Verificado en el
código (`index.html`, módulo del asistente) y en el navegador: **cero peticiones de red** mientras
se usa.

El Reglamento (UE) 2024/1689 define «sistema de IA» como uno que **infiere** cómo generar
resultados. Esto no infiere nada, así que no hay obligación de transparencia del art. 50 porque no
hay objeto que regular. Si algún día se conecta un chatbot de verdad, este bloque se reabre entero.

---

## Bloque 11 · Accesibilidad

**Probablemente no obligatoria**, y lo he revisado igual.

La Ley 11/2023 alcanza a los servicios de comercio electrónico y exime a las microempresas. Esta
web no vende online y el negocio es, con casi total seguridad, microempresa. **Las dos cosas
apuntan a que está fuera del ámbito, pero ninguna la he podido confirmar** (ni el literal de la
ley ni el número de empleados). Como decía el encargo: si no es obligación, es ventaja.

| Punto | Estado | Medida |
|---|---|---|
| Indicador de foco en todo lo tabulable | ✅ **arreglado** | El campo de correo era el único de **128 paradas** sin foco visible. Ahora: `outline 3px frambuesa` |
| Área de pulsación ≥ 24 px | ✅ **arreglado** | «Más detalles» medía 17 px de alto |
| Textos alternativos que describan la foto | ✅ **arreglado** | Tres `alt` describían otra tarta |
| Navegación por teclado | ✅ medido | Se llega a todos los botones principales |
| Diálogos se cierran con Escape | ✅ medido | Ficha de producto y visor de fotos |
| Idioma declarado y actualizado | ✅ medido | `lang="es-ES"`, cambia al cambiar de idioma |
| Portugués detectado automáticamente | ✅ **arreglado** | Se ofrecía pero nunca se detectaba |
| Contraste del texto sobre cristal | ✅ medido | 87 textos, 0 por debajo de AA (auditoría del lavado de cara) |

---

## Bloque 12 · Seguridad

| Punto exigido | Norma (sin verificar) | Estado | Dónde está |
|---|---|---|---|
| HTTPS y HSTS | RGPD art. 32 | ✅ **medido en vivo** | `max-age=31536000; includeSubDomains` |
| CSP sin `unsafe-inline` en scripts | — | ✅ | `dist/vercel.json`, 22 hashes sha256 |
| `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | — | ✅ **medido en vivo** | Todas presentes |
| `unsafe-inline` en **estilos** | — | ⚠️ | Riesgo bajo, asumido: lo exige el diseño de un solo fichero |
| Claves sólo en servidor | RGPD art. 32 | ✅ | No hay API ni claves: la web es estática |
| Secretos fuera del historial de Git | RGPD art. 32 | ✅ | Barrido del historial completo: nada |
| Límites en rutas que cuestan dinero | — | ✅ no aplica | No hay rutas de servidor |
| Dependencias que llegan al navegador | — | ✅ | `dist/` no carga nada externo |
| Reproducibilidad de los hashes de la CSP | — | ⚠️ | `construye_dist.py` no está en el repositorio |

---

## Bloque 13 · Antes de publicar

| Punto | Estado | Dónde está |
|---|---|---|
| Cerrada a buscadores mientras no haya dominio | ✅ | `index.html:22`, `noindex, nofollow` |
| Canonical sin dominio real | ✅ | Está comentado, no llega al navegador |
| Datos estructurados con dominio real | ✅ **arreglado** | Declaraban `bincamicakes.es`, que no existe |
| Etiquetas de compartir con dominio real | ✅ **arreglado** | `mostrador.html` seguía con un dominio muerto |
| `robots.txt` y `sitemap.xml` | ✅ **26/10** | Los genera `construye_dist.py` con el dominio de su constante `DOMINIO`. `robots.txt` deja pasar a todos a propósito: con `Disallow`, Google no podría leer el `noindex` |
| Cuatro idiomas en una sola URL | ⚠️ | Sin `hreflang`. Al abrir a buscadores, sólo se indexaría el castellano |

---

## Lo que falta, por urgencia

| # | Qué | De quién depende | Qué pasa si no se hace |
|---|---|---|---|
| ~~1~~ | ~~Permiso de la persona que sale en `pastelera.jpg` y `og-image.jpg`~~ | Luisa | **Concedido (19/10).** Falta sólo tenerlo firmado y guardado |
| ~~2~~ | ~~Permiso de las familias por los nombres de criaturas en tres fotos~~ | Luisa | **Concedido (19/10).** Ídem |
| 3 | **Confirmar la forma jurídica** y que el NIE es el identificador fiscal correcto | Gestoría | Si fuera sociedad, faltarían denominación y datos registrales en el aviso legal |
| 4 | **Registro sanitario**: ¿está inscrita? ¿el número debe figurar en la web? | Gestoría | Galicia cambió el registro en agosto de 2025 |
| 5 | **Hojas de reclamaciones**: ¿hay que mencionarlas en la web? | Gestoría | Si la norma gallega lo exige, hoy no están |
| 6 | **Cuadrar la valoración**: ¿4,9 y cuántas reseñas hoy? | Luisa | Se declara 18 y se enseñan 16. Una cifra que no se sostiene es publicidad engañosa |
| 7 | **Decidir sobre las reseñas**: ~~nombres completos~~ y enlace | Luisa | **Nombres resueltos (27/10):** sólo el nombre de pila. Queda el enlace genérico |
| ~~8~~ | ~~Decidir sobre las marcas ajenas~~ (Lamborghini, Totoro, ROBLOX, Nutella, Nintendo, Dragon Ball, FC Barcelona, «Efren 50») | Luisa | **Decidido (27/10):** todas las fotos las mandó ella con su consentimiento para publicarlas. Se quedan |
| 9 | **Confirmar si Kinder Bueno y Raffaello van de verdad** en esas porciones | Luisa | Si no, hay que decir «estilo Kinder» |
| 10 | **Datos de salud por WhatsApp** (alergias): valorar cómo se guardan | Gestoría | Categoría especial del art. 9 RGPD |
| 11 | Registro de actividades de tratamiento | Gestoría | Obligación propia, no de la web |
| ~~12~~ | ~~Decidir si habrá lista de correo~~ | Luisa | **Resuelto el 26/10: se quitó la casilla de correo.** La web ya no recoge ningún correo, y sale de la política de privacidad la fila de «Comunicaciones comerciales» |
| ~~13~~ | ~~Guardar `construye_dist.py` en el repositorio~~ | Brian | **Hecho (21/10)**: está en `herramientas/` |
| 14 | Al poner dominio propio: canonical, `DOMINIO` en `construye_dist.py` (de ahí salen `robots.txt` y `sitemap.xml`), y las tres etiquetas de compartir | Brian | Están señalizados en el código con comentarios |

---

## Arreglos de código ya hechos

Catorce. Cada uno comprobado, y la batería entera (24 pruebas + 16 de `dist/`) en verde después.

| # | Qué estaba mal | Arreglo | Cómo lo comprobé |
|---|---|---|---|
| 1 | «El **mejor** tres leches» en la descripción que sale en buscadores | Descripción no comparativa | `grep`: 0 apariciones |
| 2 | Una reseña citada entre comillas pero recortada por dentro | Puesto el literal, con autora y origen | Cotejado con `RESENAS` en `index.html:4915` |
| 3 | Los datos estructurados declaraban `bincamicakes.es`, que no existe | Apuntan al dominio real | `grep`: 0 apariciones |
| 4 | `mostrador.html` con el dominio muerto en las etiquetas de compartir | Generador corregido | Regenerado y verificado |
| 5 | Tres `alt` describían una tarta distinta de la de la foto | Reescritos | Abiertas las imágenes |
| 6 | **El mapa no se veía nunca aunque aceptases las cookies** | Quitado el sondeo que la CSP bloqueaba | Medido contra la CSP real: rechazando 0 peticiones, aceptando el mapa carga |
| 7 | Sin JavaScript, el correo del boletín acababa en la barra de direcciones | `method="post"` y `required` en la casilla | Leído el formulario |
| 8 | El campo de correo era el único sin indicador de foco | Regla al final de la hoja | Medido antes y después: `outline 3px` |
| 9 | «Más detalles» del banner medía 17 px de alto | 24 px | Regla con `min-height` |
| 10 | La política no decía que pide la ubicación | Fila nueva en la tabla de tratamientos | Leída la política |
| 11 | La política no decía que el alta al boletín pasa por Meta | Dicho | ídem |
| 12 | La tabla de cookies no recogía las marcas `pista-…` | Fila nueva | ídem |
| 13 | Se exigía acreditar identidad para dejar de recibir publicidad | Quitado para la baja comercial | ídem |
| 14 | El precio no decía si llevaba impuestos | «IVA incluido» en los 4 idiomas | Prueba actualizada para **exigirlo** |

**Y un arreglo de proceso, que es el que más me preocupaba:** `todas.sh` mandaba los errores de
construcción a `/dev/null`. Por eso `construye_mostrador.py` llevaba días fallando sin que nadie
lo viera y las 24 pruebas salían en verde **contra un `mostrador.html` viejo**. Ahora la batería
se para si la construcción falla.

---

## Revisión con la lista de 20 de seguridad (26/10)

Brian pasó la lista de un vídeo («valida estas cosas antes de lanzar tu web o app»). Está
pensada para aplicaciones con usuarios, base de datos y pagos; esta web no tiene nada de eso,
así que la mayoría de puntos no tienen dónde aplicarse. Lo que sí aplica está comprobado:

| # | Punto | Aquí | Estado |
|---|---|---|---|
| 1, 2 | Permisos y panel de administración | No hay usuarios ni panel. El «panel» son las cuentas de **Vercel** y **GitHub** de Brian | ⚠️ ver 8 |
| 3, 4, 9 | Datos entre clientes, base de datos, inyección SQL | No hay base de datos ni se guarda nada de nadie | ✅ no aplica |
| 5 | Claves privadas | Barrido del código y del historial: ninguna clave, token ni contraseña | ✅ **medido** |
| 6, 7 | Inicio de sesión y sesiones | No hay inicio de sesión | ✅ no aplica |
| 8 | Doble factor | Aplica a las cuentas que mandan sobre la web: Vercel y GitHub (Brian) y Google y WhatsApp del negocio (Luisa) | ⚠️ **activarlo** |
| 10 | Código malicioso (XSS) | CSP estricta con hashes, ningún script de fuera y ningún texto de visitante que se pinte en la página (desde el 26/10 no hay ni un campo de texto) | ✅ **medido** |
| 11, 14, 15 | Acciones sensibles, webhooks, pagos | No hay compras ni pagos: todo se cierra por WhatsApp o en tienda | ✅ no aplica |
| 12 | Archivos subidos | Nadie puede subir archivos | ✅ no aplica |
| 13, 18 | Accesos internos y paneles expuestos | Vercel publica **sólo** `dist/`. Pedidos en vivo `README.md`, `docs/…`, `para-luisa/…`, `herramientas/…` y `vercel.json`: todos **404** | ✅ **medido** |
| 13 bis | El repositorio de GitHub | **Es público**: cualquiera lee las notas internas, esta auditoría y la carpeta de Luisa | ⚠️ **hacerlo privado** (ver abajo) |
| 16 | Limitar solicitudes | Web estática en la CDN de Vercel, con su protección; no hay formulario ni API que se puedan abusar | ✅ |
| 17 | Dependencias | La web publicada no carga ninguna librería: Tailwind va compilado dentro | ✅ |
| 19 | Accesos sospechosos | No hay cuentas en la web; lo que vigilar son los avisos de inicio de sesión de Vercel, GitHub y Google | ⚠️ ver 8 |
| 20 | Copias y restaurar | El código está en GitHub y Vercel guarda cada versión publicada (se puede volver a una anterior en un clic); las fotos originales, en el Drive de Luisa | ✅ |

**Sobre hacer privado el repositorio.** Se hace en GitHub → el repositorio → Settings →
General → «Change visibility». Ojo antes: la conexión de Vercel con GitHub nunca llegó a
autorizarse (`repo_no_access`) y los despliegues funcionan porque el repositorio es público.
Al hacerlo privado hay que conectar antes Vercel con GitHub (Vercel → Settings → Connections,
dando acceso a PersonalFit-Code / PROYECTOS-BRIAN), o dejarán de salir las publicaciones.

## Preguntas para la gestoría

Para copiar y mandar tal cual.

1. ¿Bajo qué forma jurídica se ejerce la actividad: autónoma o sociedad? Si es sociedad, ¿cuál es
   la denominación social y los datos del Registro Mercantil, para ponerlos en el aviso legal?
2. El NIF que figura en la web es `Y8990764D` (un NIE). ¿Es el identificador fiscal correcto de la
   actividad?
3. ¿El obrador está inscrito en el registro sanitario de empresas alimentarias? ¿Cuál es el número
   y hay obligación de que figure en la página web?
4. En Galicia, ¿hay obligación de informar en la web de la existencia de hojas de reclamaciones, o
   basta con el cartel en el establecimiento?
5. Una web que sólo informa y no vende (los encargos se cierran por WhatsApp o en tienda),
   ¿necesita condiciones de contratación y derecho de desistimiento, o queda fuera?
6. Por WhatsApp llegan alergias e intolerancias de clientes, que son datos de salud. ¿Hay que
   recoger ese tratamiento en algún sitio y cómo deben guardarse esas conversaciones?
7. ¿Hace falta llevar registro de actividades de tratamiento, con el tamaño que tiene el negocio?
8. ¿Se pueden reproducir en la web reseñas de Google con el nombre y apellidos de quien las
   escribió, o conviene dejar sólo el nombre de pila?
9. Para publicar la foto de una trabajadora en la web y en la imagen que se comparte en redes,
   ¿qué consentimiento hace falta y cómo debe documentarse?
10. ¿Hay algún problema en publicar fotos de tartas de encargo con marcas de terceros
    (un emblema de coche, un personaje de animación, un logotipo de videojuego)?
