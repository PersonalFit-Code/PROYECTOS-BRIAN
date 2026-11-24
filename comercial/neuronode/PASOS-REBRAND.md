# Rebrand de neuro-node.com: prompts paso a paso

> Decisión (24 nov 2026): la web pasa a vender **una sola cosa**, el agente de IA de neuro·node, y **solo a infoproductores y coaches** que venden por mensajes y no dan abasto.
> Se pega un prompt cada vez en el chat de Claude dentro de VS Code, con el repositorio de la web abierto. No pases al siguiente hasta ver bien el anterior en tu ordenador.

## Qué vendemos ahora (para tenerlo claro)
Un **conector (MCP) de neuro·node** que se enchufa a la IA que el cliente ya paga (Claude, ChatGPT…) y le da **su propio agente**, que:
1. **Responde los mensajes de Instagram** como un setter: cualifica y agenda.
2. **Enseña sus métricas.**
3. **Programa publicaciones** en las 3 plataformas grandes, incluidos los *trial reels*.
4. **Radar de competencia:** analiza perfiles de su nicho.

La frase para entenderlo: **setter + métricas + programación + radar, en un solo agente.** Es lo que hoy se hace con tres herramientas distintas. En la web **no** se nombran ManyChat, Metricool ni Apify.

## Lo que hay hoy en neuro-node.com (visto el 24/11/2026)
- Portada: «Webs, automatizaciones y asistentes de IA para negocios», botón «Pedir auditoría gratuita».
- Franja de logos de clientes: Nutretuciklo, Alejandro, Laura, Personal Fit, Tixola y Bin & Cami.
- «El problema»: cuatro formas de perder un cliente (llamadas, citas, preguntas repetidas, datos repartidos).
- «Servicios y precios»: web 500 €, automatizaciones, asistentes de IA, software a medida y captación, con precios.
- «Proyectos en acción»: Personal Fit, Tixola y Bin & Cami, con vídeos.
- «Cómo trabajamos»: auditoría, propuesta, construcción y mejora.
- «Quién está detrás»: Nico (Data Architect | AI Specialist) y Brian (Growth Partner | Marketing & Digital Strategy).
- Preguntas frecuentes con precios y el formulario de auditoría.
- Páginas aparte: `/infoproductores` y `/consultas`.
- Subdominios que ya existen: `login.neuro-node.com` (botón «Acceder») y `app.neuro-node.com` (términos y privacidad).

## ⚠️ Reglas de siempre
- La web **se publica sola** al subir a `main`. Se trabaja en una **rama aparte** y Nico revisa antes de juntar.
- **Sin precios** hasta decidirlo con Nico (la web actual sí los tiene: se quitan), **sin cifras inventadas y sin testimonios inventados.** Lo que falte va como `[DATO PENDIENTE]`.
- Los casos de clientes solo con su permiso.
- **Antes de publicar, confirmar con Nico:** las 3 plataformas (¿Instagram, TikTok y YouTube?), el nombre del producto, qué está listo y qué no, y los subdominios.

---

## Paso 0 · Preparar VS Code
1. Abre la carpeta del repositorio de neuro·node en VS Code.
2. En la terminal: `git checkout main` y `git pull`, para partir de lo último.
3. Abre Claude, escribe `/model` y elige **Opus 5.5**.
4. Pega el Prompt 1.

---

## Prompt 1 · Rama nueva e inventario (no cambia nada)
```
Hola. Soy Brian, socio de neuro·node con Nico. No soy programador: explícame todo en español, con frases cortas y sin tecnicismos. Si usas un término técnico, explícalo en una línea.

MUY IMPORTANTE: esta web se publica sola al subir cambios a la rama main de GitHub.
- Nunca hagas cambios, push ni merge en main. Si algo lo requiere, para y avísame.
- No borres ramas ni archivos sin preguntarme.

Vamos a rehacer la web entera con un enfoque nuevo. Hoy solo quiero preparar y entender. Haz esto en orden y para al final:
1. Crea una rama nueva llamada "brian/rebrand-agente" a partir de main y cámbiate a ella. Si existe la rama "brian/portada-y-perfil", dime qué tiene que no esté en main: puede que queramos traer de ahí la sección de los dos socios y mi foto.
2. Explícame en 5 líneas con qué está hecha la web (tecnología), cómo se publica y dónde están los textos, las imágenes y los estilos.
3. Haz un inventario de la web actual, sección por sección, en una tabla: nombre de la sección, qué dice en una frase y archivo donde está.
4. Arranca la web en mi ordenador y dame el enlace (tipo http://localhost:...).
5. Dime qué librerías de animación o 3D tiene ya instaladas, si tiene alguna.

No cambies nada todavía.
```

---

## Prompt 2 · Retirar lo que ya no vendemos
```
Seguimos en la rama "brian/rebrand-agente". Si no estamos en ella, para y avísame.

A partir de ahora la web vende una sola cosa: el agente de IA de neuro·node, y solo para infoproductores y coaches que venden por mensajes de Instagram y tienen más mensajes de los que pueden contestar.

Retira de la web todo lo que no encaje con eso:
- la portada actual ("Webs, automatizaciones y asistentes de IA para negocios");
- "El problema" con las cuatro formas de perder un cliente (llamadas, citas, preguntas repetidas, datos repartidos);
- "Servicios y precios" entera (web, automatizaciones, asistentes, software a medida, captación) y sus precios;
- "Proyectos en acción" (Personal Fit, Tixola y Bin & Cami): son negocios locales y ya no son nuestro público. No borres sus vídeos ni logos, solo deja de mostrarlos;
- de la franja de logos, deja solo los clientes que venden por mensajes (Nutretuciklo, Alejandro y Laura) y quita Personal Fit, Tixola y Bin & Cami;
- "Cómo trabajamos" con las cuatro fases de auditoría;
- las preguntas frecuentes de precios de webs, software y automatizaciones;
- la página /consultas (clínicas): que deje de estar enlazada en el menú y el pie. No la borres;
- la página /infoproductores: dime qué tiene, porque puede servirnos de base;
- los textos de "consultora tecnológica para pymes y negocios locales" en los datos para Google.

Reglas:
- No borres archivos de imágenes ni componentes que puedan servir después: deja de usarlos y dime cuáles son.
- Mantén la cabecera, el pie, la marca, los avisos legales, el botón "Acceder" (login.neuro-node.com) y la sección de los socios.
- Donde quede un hueco, pon una sección vacía con el texto "[NUEVA SECCIÓN: nombre]" para rellenarla en los siguientes pasos.

Al terminar:
1. Enséñame una lista de lo que has quitado.
2. Comprueba que la web arranca sin errores.
3. Haz un commit con el mensaje "Retira los servicios que ya no vendemos".
```

---

## Prompt 3 · Base de diseño: marca, letras y movimiento
```
Seguimos en "brian/rebrand-agente".

Quiero que la web nueva sea brutal y profesional, nada de diseño genérico de IA: sin degradados por todas partes, sin efecto cristal en todo, sin tarjetas idénticas en fila y sin emojis como iconos.

Prepara la base de diseño, sin tocar todavía los textos:
1. Colores como variables (tokens):
   - principal #6447FA;
   - acento en el degradado oficial #36ADFB → #6447FA → #7F1EED, solo en detalles;
   - fondo blanco, texto casi negro y un violeta muy suave para fondos de sección.
   Modo claro.
2. Tipografías: Montserrat para títulos y Quicksand para texto, peso 500 o más. Que se carguen sin bloquear la página.
3. Iconos: un solo juego de iconos SVG, todos del mismo estilo de trazo.
4. Movimiento:
   - Elige la librería más ligera que encaje con la tecnología de la web para las animaciones al hacer scroll y para el 3D (por ejemplo Three.js o React Three Fiber si es React). Explícame por qué la eliges antes de instalarla, y espera mi OK.
   - Todo lo animado tiene que respetar "reducir movimiento": si el visitante lo tiene activado, se ve quieto.
   - En el móvil, el 3D tiene que ser más ligero o una imagen fija, para que no vaya lento.
5. Haz una página de prueba (que no se publique) con los colores, las letras, los botones y los iconos, para que yo la vea.

Commit: "Base de diseño nueva".
```

---

## Prompt 4 · Portada con 3D y el botón principal
```
Seguimos en "brian/rebrand-agente".

Haz la portada (lo primero que se ve). Tiene que entenderse en 5 segundos qué es, para quién es y qué hacer.

Textos:
- Etiqueta pequeña: "PARA INFOPRODUCTORES Y COACHES"
- Título: "Tu setter, tus métricas y tus publicaciones en un solo agente de IA."
- Subtítulo: "Lo conectas a tu ChatGPT o Claude y responde tus mensajes de Instagram, te enseña tus números, programa tu contenido y vigila a tu competencia."
- Botón principal (el único destacado): "Quiero probarlo en la beta"
- Enlace secundario, discreto: "Ver cómo funciona", que baja a la sección de los módulos.

3D:
- A un lado del texto, una escena 3D animada: un nodo central (el agente) del que salen cuatro conexiones que se iluminan por turnos. Cada una es un módulo: mensajes, métricas, publicaciones y radar. Con el violeta de la marca.
- Que reaccione suave al mover el ratón, sin marear.
- Carga diferida: el texto y el botón salen al instante y el 3D aparece después. Nunca puede retrasar la lectura.
- Con "reducir movimiento" o en móviles lentos: una imagen fija de la misma escena.

Comprueba que se ve bien a 375, 768 y 1440 píxeles de ancho, sin scroll horizontal.
Commit: "Portada nueva con escena 3D".
```

---

## Prompt 5 · El problema y los 4 módulos
```
Seguimos en "brian/rebrand-agente".

Sección "El problema" (justo después de la portada):
- Título: "Tienes más mensajes que horas para contestarlos."
- Tres puntos cortos, con icono:
  1. "Los mensajes se acumulan y los interesados se enfrían."
  2. "Pagas varias herramientas que no se hablan entre sí."
  3. "No sabes qué publica tu competencia ni qué le funciona."

Sección "Qué hace tu agente": cuatro módulos. Cada uno con icono SVG, título, una frase y una pequeña animación al aparecer en pantalla. Que no sean cuatro tarjetas idénticas en fila: alterna texto e ilustración a izquierda y derecha, o usa una composición distinta.
1. "Setter de Instagram": "Responde cada mensaje al momento, filtra a quien encaja y le agenda la llamada."
2. "Tus métricas": "Pregúntale a tu IA cómo va tu cuenta y te responde con tus números reales."
3. "Programación de contenido": "Programa tus publicaciones en las tres grandes plataformas, también los trial reels." [DATO PENDIENTE: confirmar con Nico cuáles son las tres plataformas]
4. "Radar de competencia": "Analiza los perfiles de tu nicho y te dice qué contenido les está funcionando."

Commit: "Secciones del problema y los módulos".
```

---

## Prompt 6 · Cómo se conecta y "3 herramientas en 1"
```
Seguimos en "brian/rebrand-agente".

Sección "Cómo funciona", en tres pasos con una línea que los une y se dibuja al hacer scroll:
1. "Conectas neuro·node a tu IA": "Funciona con la suscripción de Claude o ChatGPT que ya tienes."
2. "Configuras tu agente": "Le dices cómo hablas, qué vendes y a quién quieres atender."
3. "Tu agente trabaja": "Contesta, mide, publica y vigila. Tú decides y cierras."

Sección "Todo en un solo sitio":
- Título: "Deja de pagar tres herramientas distintas."
- Una comparativa visual: a la izquierda, "Antes": tres cajas separadas (una para automatizar mensajes, otra para métricas y programación, otra para el setter). A la derecha, "Con neuro·node": todo dentro de un solo agente. Animación: las tres cajas se juntan en una al hacer scroll.
- No nombres marcas de otras empresas.

Commit: "Cómo funciona y comparativa".
```

---

## Prompt 7 · Los dos socios
```
Seguimos en "brian/rebrand-agente".

La sección "Quién está detrás" ya existe con los dos. Mantén las fotos (marca/nico.jpg y marca/brian.jpg), los nombres y los cargos, y rediséñala con el estilo nuevo.

- Etiqueta: "QUIÉN ESTÁ DETRÁS"
- Título: "Dos socios. Estrategia y tecnología en el mismo equipo."
- Nico: "CEO & Founder · neuro·node" y "Data Architect | AI Specialist". Cambia su texto para que hable solo de infoproductores y coaches (quita "clínicas privadas") y del agente: él diseña la arquitectura de datos e IA que hay detrás. [DATO PENDIENTE: que Nico apruebe su texto].
- Brian: "Co-Founder · neuro·node" y "Growth Partner | Marketing & Digital Strategy". Texto nuevo: "Ayudo a infoproductores y coaches a que les encuentren y les escriban. Me encargo de la estrategia, el contenido y de que cada mensaje que llega tenga más opciones de acabar en venta." Quita las menciones a clínicas, negocios y webs.
- Mantén el "Leer más" si ya existe.
- Textos alternativos de las fotos: "Nicolás González, socio de neuro·node" y "Brian Carbajal, socio de neuro·node".
- Una animación sutil al aparecer, con las dos fotos unidas por una línea que se ilumina (el mismo lenguaje de "nodos" de la portada).
- Enlace a Instagram o LinkedIn de cada uno, si existe en la web actual.

Commit: "Sección de los socios".
```

---

## Prompt 8 · Beta, preguntas frecuentes y cierre
```
Seguimos en "brian/rebrand-agente".

Sección "Beta" (es el destino del botón principal):
- Título: "Buscamos a los primeros 10."
- Texto: "Abrimos la beta a 10 infoproductores y coaches. Lo pruebas gratis durante la beta y nos dices qué mejorar."
- Formulario con etiquetas visibles: nombre, correo, usuario de Instagram, "¿cuántos mensajes recibes al día?" (desplegable: menos de 20, 20-50, 50-100, más de 100) y "¿qué IA usas?" (Claude, ChatGPT, otra, ninguna).
- Casilla obligatoria de privacidad con enlace a la política. Validación después de escribir, no antes. Mensaje de "enviado" claro. Protección anti-spam sencilla (campo oculto).
- Si la web ya tiene un formulario que envía avisos (por correo o donde sea), reutiliza ese envío y dime a dónde llegan los datos.

Preguntas frecuentes (desplegables accesibles con teclado):
1. "¿Necesito saber programar?" — "No. Lo conectas en unos minutos y te acompañamos."
2. "¿Qué necesito tener?" — "Una cuenta de Instagram profesional y una suscripción de Claude o ChatGPT."
3. "¿Va a hablar como yo?" — "Sí. El guion es tuyo y lo cambias cuando quieras."
4. "¿Hay un límite de mensajes?" — [DATO PENDIENTE: confirmar con Nico]
5. "¿Mis datos están seguros?" — [DATO PENDIENTE: confirmar con Nico cómo se guardan]

Cierre final antes del pie: el mismo título de la portada en corto y el botón "Quiero probarlo en la beta".

Commit: "Beta, preguntas frecuentes y cierre".
```

---

## Prompt 9 · Subdominios (solo preparar, sin tocar el DNS)
```
Seguimos en "brian/rebrand-agente".

Quiero que la web tenga subdominios. No cambies el DNS ni Cloudflare: eso lo hace Nico. Solo prepara y explícame.

Ya existen dos: login.neuro-node.com (el botón "Acceder") y app.neuro-node.com (términos y privacidad). No los toques.

Propuesta de los nuevos (confírmame si tiene sentido con cómo está hecha la web):
- neuro-node.com: la web de venta.
- login.neuro-node.com: se queda como está, para que el cliente entre a su panel.
- docs.neuro-node.com: la guía para conectar neuro·node a Claude o ChatGPT, paso a paso.
- beta.neuro-node.com: una página solo con el formulario de la beta, para enlazar desde Instagram.

Haz esto:
1. En la cabecera deja "Acceder" (login.) y añade "Guía" (docs.). Pon todas las direcciones en un solo archivo de configuración para cambiarlas fácil. Si docs. todavía no existe, que "Guía" lleve a una página "Próximamente" dentro de esta web.
2. Explícame, en pasos para Nico, qué hay que crear en Cloudflare para cada subdominio.
3. Dime qué partes hay que construir aparte y cuáles puede servir esta misma web.

Commit: "Enlaces a subdominios".
```

---

## Prompt 10 · Revisión final de calidad
```
Seguimos en "brian/rebrand-agente". Revisa la web entera antes de enseñársela a Nico y arregla lo que falle:
1. Móvil primero: 375, 768 y 1440 píxeles, sin scroll horizontal. Comprueba también que el botón "↑" del móvil no tapa el texto (ya pasaba antes).
2. Rendimiento: la portada tiene que cargar rápido aunque haya 3D. Imágenes en WebP o AVIF, carga diferida fuera de pantalla y nada que mueva el diseño al cargar.
3. Accesibilidad: contraste suficiente, textos alternativos, títulos en orden, todo usable con teclado y foco visible, y "reducir movimiento" respetado en todas las animaciones.
4. SEO: título y descripción nuevos, idioma español, imagen para compartir en redes con el nuevo mensaje y datos para Google actualizados (que hablen del agente, no de servicios viejos).
5. Legal: política de privacidad y aviso legal enlazados, y la casilla del formulario.
6. Sin errores en la consola del navegador.
7. Busca textos viejos que hayan quedado sueltos: "clínica", "web a medida", "auditoría", etc.
8. Haz una lista de todos los [DATO PENDIENTE] que quedan.

Al terminar, dame un resumen de lo que has arreglado.
Commit: "Revisión final de calidad".
```

---

## Prompt 11 · Subir la rama para que Nico la revise
```
Seguimos en "brian/rebrand-agente".
- Sube SOLO esta rama a GitHub (push de "brian/rebrand-agente", nunca de main).
- Dime si se crea un enlace de vista previa para esta rama (por ejemplo en Cloudflare Pages) y cuál es, para pasárselo a Nico.
- Explícame paso a paso cómo crear la pull request en GitHub para que Nico la revise. Una pull request es la petición para juntar mis cambios con la web publicada.
- Escríbeme el texto de la pull request: qué cambia, la lista de [DATO PENDIENTE] y lo que Nico tiene que confirmar.
No juntes nada con main.
```

---

## Después de cada prompt
- Mira la web en el enlace de tu ordenador y en el móvil.
- Si algo no te gusta, díselo en el mismo chat antes de pasar al siguiente.
- Si se rompe algo: "deshaz el último commit y explícame qué ha pasado".
