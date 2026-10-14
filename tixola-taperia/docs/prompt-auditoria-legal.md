# Prompt: auditoría legal de una web (España · con bloque autonómico)

Copia **todo lo que hay debajo de la línea** y pégalo en Claude Code, dentro del proyecto de la web
que quieras auditar. Lo que va entre ‹ › lo rellenas tú antes de enviarlo.

---

Actúa como el abogado que revisa esta web antes de publicarla, especializado en derecho digital y de
consumo español. No quiero una lista de buenas prácticas: quiero saber **por dónde pueden multarme,
denunciarme o tumbarme la web**, con la norma en la mano y el artículo concreto.

## Lo que es esta web

- Negocio: ‹qué es y a qué se dedica›
- Dónde está: ‹municipio y comunidad autónoma› — esto importa, porque la normativa autonómica de
  consumo, sanidad, turismo y publicidad cambia de una comunidad a otra.
- Forma jurídica: ‹autónomo / S.L. / … — si no lo sabes, dilo y márcalo como dato a confirmar›
- Qué hace la web: ‹informativa / vende online / reservas / formularios / chat / zona de usuarios›
- Idiomas: ‹…›

## Cómo quiero que trabajes

1. **Lee el código antes de opinar.** Cada afirmación tuya («esto cumple», «esto falta») tiene que
   salir de un fichero concreto que hayas abierto, y lo citas con su ruta. Si algo solo se ve al
   ejecutarlo —el banner de cookies, lo que carga antes de aceptar, el contraste— levanta la web y
   **compruébalo en el navegador**, no lo deduzcas del código.
2. **Busca las normas, no las recuerdes.** La normativa cambia y tu memoria tiene fecha de caducidad.
   Busca el texto vigente de cada norma que vayas a citar, y comprueba especialmente:
   - si la norma que recuerdas sigue vigente o la ha derogado otra más nueva,
   - desde cuándo es aplicable cada obligación (hay normas en vigor con obligaciones aplazadas),
   - si hay norma autonómica que se superponga a la estatal.
   Cita la fuente de cada norma con enlace. **Si no has podido verificar el literal de un artículo,
   dilo** y márcalo como «a confirmar con la gestoría» en vez de darlo por bueno.
3. **No inventes datos del negocio.** Si para saber si algo cumple hace falta un dato que no está en
   el código (si está inscrito en un registro, cuántos empleados tiene, si tiene el cartel de hojas
   de reclamaciones), no lo supongas: ponlo en la lista de lo que hay que preguntar.
4. **Distingue tres cosas** y no las mezcles: lo que **infringe** una norma concreta (con artículo y
   sanción), lo que es **riesgo** aunque no haya norma que lo prohíba expresamente, y lo que es
   **recomendación**. Un informe donde todo es «crítico» no sirve para decidir.
5. **Arregla lo que sea código.** Si un hallazgo se resuelve con un texto, un enlace, una etiqueta o
   una cabecera, hazlo tú, compruébalo y dilo. Lo que depende de una decisión del negocio o de un
   dato que no tienes, lo dejas listado. No cambies el modelo de negocio ni añadas barreras (puertas
   de edad, consentimientos extra) sin justificar la norma que las exige.

## Qué revisar, bloque a bloque

Para cada bloque: dime si aplica a esta web, qué exige, qué hay hoy en el código y qué falta.
**Si un bloque no aplica, dilo y explica por qué** — eso también es parte del informe.

1. **Identificación del prestador.** Ley 34/2002 (LSSI-CE), art. 10: nombre o razón social, NIF,
   domicilio, correo electrónico, datos registrales si procede, y los datos del colegio profesional
   si es actividad colegiada. Comprueba uno a uno que están y que no hay marcadores de relleno sin
   sustituir. Dime la sanción del art. 38 si falta alguno.
2. **Protección de datos.** RGPD y LO 3/2018: política de privacidad propia y enlazada, responsable
   identificado, finalidad y **base jurídica** de cada tratamiento, encargados nombrados (hosting,
   analítica, IA, correo, reservas), transferencias internacionales, plazos de conservación,
   derechos y reclamación ante la AEPD, y un canal real para ejercerlos. Si hay formularios: casilla
   de consentimiento **no premarcada** y finalidad por separado. Si hay registro de usuarios o
   newsletter, revisa también el doble consentimiento y la baja.
3. **Cookies.** Art. 22.2 LSSI y la Guía de cookies de la AEPD vigente. Comprueba **en el navegador**:
   que no se instala ni se carga nada no imprescindible antes de aceptar (mira las peticiones de red
   y el HTML servido), que **rechazar cuesta exactamente lo mismo que aceptar** —mide los dos botones:
   tamaño, color, posición y jerarquía, y dime los números—, que se puede configurar por categorías,
   que el consentimiento caduca (24 meses como máximo) y que se puede cambiar después. Revisa la
   política de cookies: tabla con cada cookie, titular, finalidad y plazo.
4. **Consumidores.** RDL 1/2007 (TRLGDCU): precios finales con impuestos allí donde se muestren,
   información veraz, y —si la web vende o reserva— condiciones de contratación, derecho de
   desistimiento, confirmación del pedido y la información precontractual del art. 97. Añade la
   **ley autonómica de consumo** que corresponda: hojas de reclamaciones, cartel anunciador y si hay
   obligación de informar de ellas en la web.
5. **Sector.** Lo que regule específicamente esta actividad. Busca activamente, no te quedes en lo
   genérico. Por ejemplo: alérgenos e información alimentaria si hay carta (Reglamento UE 1169/2011
   y RD 126/2015); registro de empresas turísticas si es alojamiento o restauración; publicidad
   sanitaria si es salud o estética; normativa de centros deportivos; colegios profesionales.
6. **Publicidad y competencia desleal.** Ley 3/1991 y Ley 34/1988: afirmaciones de superioridad
   («el mejor», «el nº 1», «líder») que no se puedan probar documentalmente, comparaciones,
   testimonios, cifras y valoraciones escritas a mano que envejecen, precios tachados y descuentos
   (Directiva Ómnibus: precio anterior más bajo de los últimos 30 días).
7. **Productos con publicidad restringida.** Si la web enseña alcohol, tabaco, vapeadores, juego,
   productos sanitarios, suplementos o alimentos con declaraciones de salud: busca la norma estatal
   **y la autonómica**, que suele ser más estricta. Mira sobre todo si hay promociones que inciten al
   consumo excesivo, si algo puede leerse como dirigido a menores y si falta el aviso que el sector
   pone siempre.
8. **Contenido de terceros.** Reseñas copiadas de Google o TripAdvisor (sus condiciones lo prohíben
   y además el texto es obra de quien lo escribió), fotos de bancos de imágenes sin licencia, fotos
   de procedencia desconocida, mapas sin atribuir, tipografías sin licencia, logos de marcas ajenas.
9. **Imagen de personas.** LO 1/1982: clientes, empleados o terceros reconocibles en fotos y vídeos.
   El consentimiento tiene que ser expreso y, para un trabajador, por escrito: no se presume por la
   relación laboral. El art. 9.3 **presume el perjuicio**, así que no hace falta que nadie demuestre
   daño para reclamar.
10. **Inteligencia artificial.** Si hay chatbot, asistente o contenido generado: Reglamento (UE)
    2024/1689, art. 50. Comprueba que se dice **desde el primer mensaje** que es una IA y no una
    persona, que se dice quién procesa los mensajes y dónde, que no se piden datos personales ni
    especialmente protegidos, y qué se guarda. Mira también el coste: si la IA se paga por uso,
    comprueba que hay límite por IP, tope de tamaño y filtro de origen en la ruta del servidor.
11. **Accesibilidad.** Ley 11/2023: mira si esta web entra en su ámbito (servicios de comercio
    electrónico) y si el negocio es microempresa, que está exenta. Dime si aplica o no **y por qué**,
    y comprueba de todas formas el contraste, la navegación por teclado y los textos alternativos:
    si no es obligación, es ventaja.
12. **Seguridad.** Art. 32 RGPD: HTTPS y HSTS, cabeceras de seguridad (CSP, X-Frame-Options, nosniff,
    Referrer-Policy, Permissions-Policy), claves solo en el servidor y nunca en el bundle, secretos
    fuera de todo el historial de Git, límites en las rutas que cuestan dinero, y dependencias sin
    vulnerabilidades que lleguen al navegador.
13. **Antes de publicar.** Si la web aún vive en el subdominio del proveedor (`*.vercel.app`,
    `*.netlify.app`…), comprueba si se está indexando con los textos legales a medias, y si conviene
    cerrarla a buscadores hasta que tenga dominio propio.

## Qué quiero de vuelta

1. **Un veredicto en tres líneas**: ¿se puede publicar? Si no, qué lo impide exactamente.
2. **El informe por bloques**, en un fichero `docs/auditoria-legal.md` del propio repositorio, con una
   tabla por bloque (punto exigido · estado · dónde está en el código) y la norma y el artículo en
   cada fila. Marca con ✅ lo que cumple, ⚠️ lo que es riesgo o depende de un dato que falta y ❌ lo
   que incumple.
3. **La lista de lo que falta ordenada por urgencia**, diciendo en cada línea **de quién depende**
   (del código, del dueño del negocio, de la gestoría) y **qué pasa si no se hace**.
4. **Los arreglos de código ya hechos**, con lo que has comprobado de cada uno.
5. **Las preguntas para la gestoría**, cortas y concretas, para que el dueño pueda copiarlas y
   mandarlas tal cual.

Empieza con un descargo honesto: no eres abogado, esto es una revisión técnica contra las normas que
citas, y quien firma el cumplimiento es el titular del negocio.
