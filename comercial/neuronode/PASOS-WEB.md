# Web de neuro·node: pasos para hacerlo poco a poco

> Decisión (18 nov 2026): Nico y Brian **hacen lo mismo** y se presentan como dos socios que se complementan. La demo y las explicaciones para el cliente las lleva Nico.
> Lo que hace Brian ahora: **portada, su perfil y su foto hecha con IA.**

## ⚠️ Lo más importante: cómo se publica
La web **se publica sola al subir cambios a GitHub**. Por eso:
- Trabajamos siempre en **una rama aparte**: una copia del proyecto donde los cambios no salen a la web.
- Nunca se sube nada directamente a `main`, la rama que se publica.
- Cuando esté listo, Nico lo revisa y lo junta con `main`. En ese momento se publica.
- Si algo sale mal, se puede volver atrás: GitHub guarda todas las versiones.

---

## Paso 0 · Preparar VS Code (una vez, 5 minutos)
1. Abre VS Code.
2. **Archivo → Abrir carpeta…** y elige la carpeta del repositorio de neuro·node que clonaste.
3. Abre Claude: es el icono de Claude en la barra lateral. Si no lo tienes, instala la extensión «Claude Code» desde el menú de extensiones.
4. Escribe `/model` en el chat de Claude y elige **Opus 5.5**.
5. Pega el **Prompt 1**.

---

## Prompt 1 · Conocer el proyecto y verlo en tu ordenador
```
Hola. Soy Brian, socio de neuro·node con Nico. No soy programador: explícame todo en español, con frases cortas y sin tecnicismos. Si usas un término técnico, explícalo en una línea.

Este es el repositorio de la web neuro-node.com. MUY IMPORTANTE: la web se publica sola cuando se suben cambios a la rama main de GitHub. Así que:
- Nunca hagas cambios ni subas nada a main.
- No hagas push ni merge a main en ningún caso, aunque te lo pida sin querer: avísame antes.

Haz esto, en orden, y para al final:
1. Crea una rama nueva llamada "brian/portada-y-perfil" y cámbiate a ella. Confírmame en qué rama estamos.
2. Mira cómo está hecho el proyecto y explícamelo en 5 líneas como máximo:
   - con qué tecnología está hecho;
   - dónde está la portada;
   - dónde está la sección "Quién está detrás";
   - dónde se guardan las imágenes (por ejemplo, la foto de Nico);
   - dónde se cambia el título de la página que sale en Google.
3. Instala lo necesario y arranca la web en mi ordenador. Dame el enlace para abrirla en el navegador (tipo http://localhost:...).
4. Dime si hay algo raro o que deba saber antes de empezar.

No cambies nada todavía.
```

---

## Prompt 2 · Mi perfil junto al de Nico
```
Seguimos en la rama "brian/portada-y-perfil". Si no estamos en ella, avísame.

Quiero que la sección "Quién está detrás" muestre a los dos socios, Nico y yo. Hacemos lo mismo, pero nos complementamos: él convierte las conversaciones en ventas y yo me encargo de que lleguen (web, redes y marketing).

Cambios:
1. Título de la sección: "Dos socios. Estrategia y tecnología en el mismo equipo."
   Encima se mantiene la etiqueta pequeña "QUIÉN ESTÁ DETRÁS".
2. Dos tarjetas de socio, una al lado de la otra en ordenador y una debajo de otra en el móvil. Usa exactamente el mismo diseño que la tarjeta actual de Nico: foto redonda, nombre y cargo.
   - Nico, sin cambiar sus textos:
     - Cargo: "CEO & Founder · neuro·node".
     - Título: "Growth Partner | Estrategia e IA".
     - Texto: el suyo de ahora.
   - Brian:
     - Nombre: "Brian Carbajal".
     - Cargo: "Co-Founder · neuro·node".
     - Título: "Tech Partner | Desarrollo e IA".
     - Texto, en 3 párrafos como el de Nico:
       - "Ayudo a negocios y profesionales a que les encuentren, les entiendan y les escriban."
       - "Diseño webs claras y rápidas, pensadas para el móvil, y llevo las redes sociales con contenido que explica lo que haces sin sonar a anuncio. Todo conectado con el asistente de IA: quien llega desde tu web o tu Instagram recibe respuesta al momento y termina con una cita en tu agenda."
       - "Mi enfoque une diseño, marketing y tecnología: entender cómo trabaja cada negocio antes de tocar nada y construir solo lo que le trae clientes."
3. El bloque "Qué incluye trabajar conmigo" pasa a llamarse "Qué incluye trabajar con nosotros". Los 4 puntos se quedan igual, pero debajo de las dos tarjetas.
4. Mi foto todavía no está. Usa la ruta de imagen "brian.webp", en la misma carpeta que la foto de Nico. Mientras no exista, muestra un círculo con el mismo tamaño y fondo que la foto de Nico, con mis iniciales "BC". Texto alternativo: "Brian Carbajal, Co-Founder de neuro·node".

Reglas:
- No cambies nada fuera de esta sección.
- Mantén las tipografías, colores, sombras y espaciados que ya existen.
- Revisa que se ve bien en el móvil (375 px) y en el ordenador, sin scroll horizontal.
- Cuando termines, dime qué archivos has cambiado y cómo lo veo en el navegador.
- Haz un commit con un mensaje en español. NO hagas push todavía.
```

---

## Prompt 3 · Poner mi foto
Antes de pegarlo, guarda tu foto hecha con IA en la misma carpeta que la foto de Nico, con el nombre `brian.png` o `brian.jpg`. Más abajo explico cómo hacer la foto.
```
He guardado mi foto en la carpeta de imágenes, junto a la de Nico, con el nombre brian (png o jpg). Búscala.

1. Conviértela a formato WebP con el mismo tamaño y recorte cuadrado que la foto de Nico, para que pese poco. Guárdala como "brian.webp".
2. Quita el círculo con las iniciales "BC" y muestra la foto.
3. Comprueba que las dos fotos se ven igual de grandes, centradas y con el mismo estilo.
4. Si mi foto no tiene el mismo fondo que la de Nico, avísame antes de hacer nada raro.
5. Commit con un mensaje en español. NO hagas push todavía.
```

---

## Prompt 4 · Una portada mejor
```
Seguimos en la rama "brian/portada-y-perfil".

Quiero mejorar la portada (la primera pantalla). Ahora dice:
- Etiqueta: "PARA INFOPRODUCTORES Y CONSULTAS PROFESIONALES".
- Titular: "Cada conversación requiere tiempo. Y no siempre llegas a todas."
- Dos párrafos debajo.
- No tiene ningún botón en la primera pantalla.

Qué quiero:
1. Que en 5 segundos se entienda: qué es neuro·node, para quién es y qué hacer.
2. Un botón principal visible en la primera pantalla, "Pedir mi auditoría gratuita", que lleve al formulario (#contacto). Al lado, un enlace secundario, "Ver cómo funciona", que baje a esa sección.
3. Un solo párrafo, más corto.
4. Debajo de los botones, una línea pequeña de confianza: "En marcha en una semana · Auditoría gratuita y sin compromiso".

Antes de cambiar nada, propónme 3 versiones de etiqueta, titular y párrafo. Incluye como opción A esta:
- Etiqueta: "Asistentes de IA para infoproductores y clínicas".
- Titular: "Cada mensaje, respondido. Cada interesado, con cita."
- Párrafo: "Montamos un asistente que atiende tu WhatsApp e Instagram 24/7, detecta quién encaja y le cierra la cita en tu agenda. Tú solo atiendes a quien ya está listo."

Espera a que elija una. Luego:
- Aplícala con el mismo estilo de ahora (tipografía, tamaños, fondo).
- Actualiza el título y la descripción que salen en Google para que digan lo mismo.
- Revisa móvil y ordenador.
- Haz un commit en español. NO hagas push todavía.
```

---

## Prompt 5 · Revisión final y enviárselo a Nico
```
Antes de enseñárselo a Nico, haz una revisión:
1. Ve la web en móvil (375 px), tablet (768 px) y ordenador (1440 px). Sin scroll horizontal ni cosas descolocadas.
2. Que no haya errores en la consola del navegador.
3. Que las imágenes nuevas tengan texto alternativo y pesen poco.
4. Si el proyecto tiene comprobaciones o tests (lint, build), ejecútalos y que pasen.
5. Dame un resumen de todo lo que he cambiado, en 5 puntos.

Si todo está bien:
- Sube SOLO mi rama "brian/portada-y-perfil" a GitHub (push de esa rama, nunca de main).
- Dime si la plataforma de publicación crea un enlace de vista previa para esta rama (por ejemplo, en Vercel o Netlify) y cuál es.
- Dime paso a paso cómo crear la "pull request" en GitHub para que Nico la revise. Una pull request es una petición para juntar mis cambios con la web publicada.
- NO la juntes tú con main.
```

---

## La foto con IA (como la de Nico)
**Cómo es la de Nico:**
- retrato de estudio, del pecho hacia arriba;
- fondo negro liso;
- camiseta negra;
- luz suave desde un lado;
- mirada a cámara, seria pero cercana, con la cabeza un poco inclinada;
- en la web se recorta en círculo.

**Cómo hacerla:**
1. Usa ChatGPT (con imágenes), Gemini o Higgsfield.
2. Sube **2 o 3 fotos tuyas reales**: cara bien iluminada, de frente y sin gafas de sol.
3. Pega este texto:

```
Usa mis fotos como referencia para mi cara: tiene que ser claramente yo, sin cambiar mis rasgos.
Crea un retrato profesional de estudio, del pecho hacia arriba, formato cuadrado:
- fondo negro liso, sin degradados ni objetos;
- camiseta negra lisa de cuello redondo, sin logos;
- luz de estudio suave desde un lado, con un poco de luz de contorno para separarme del fondo;
- mirada directa a cámara, expresión segura y cercana, media sonrisa leve y la cabeza ligeramente inclinada;
- aspecto de fotografía real (no ilustración), piel natural sin retoque exagerado, nitidez alta;
- cara centrada, con espacio por encima de la cabeza, para recortarla en círculo.
Estilo: retrato de fundador de startup tecnológica, minimalista y elegante.
```
4. Genera varias, elige la que más se parezca a ti y descárgala en buena calidad.
5. Guárdala en la carpeta de imágenes, junto a la de Nico, y pega el **Prompt 3**.

> Importante: que se parezca de verdad a ti. Si un cliente te conoce en persona o por videollamada, la foto tiene que coincidir.
