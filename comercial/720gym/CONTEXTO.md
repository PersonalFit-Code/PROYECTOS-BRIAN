# Contexto: 720 GYM CLUB (Ourense) — web desde cero

Copia todo este archivo como primer mensaje del chat nuevo.

---

Hola. Soy Brian Carbajal, hago webs, IA y automatizaciones para negocios desde Ourense. Habla siempre en español.
En este chat vamos a crear **desde cero la web de 720 GYM CLUB**, un gimnasio de Ourense. El lunes a las 11:00 voy a verlo en persona y quiero llevar una maqueta publicada que sea **irrechazable**.

## Quién es el cliente
- **720 GYM CLUB**, «centro privado de entrenamiento»: Fuerza · Salud · Comunidad.
- **Dirección:** Rúa Río Bibei, 16, bajo, 32001 Ourense.
- **Teléfono:** 672 00 94 51.
- **Instagram:** @720gym. Facebook: 720gym.
- **Horario:** abierto los 365 días del año, de 08:00 a 22:30, festivos incluidos. Aforo limitado y acceso controlado.
- **Lemas que ya usan:**
  - «Entrena · Cuídate · Creciendo».
  - «Programa 720 = Progreso constante».
  - «Un gimnasio cercano, con aforo limitado y un ambiente donde cada persona pueda venir, entrenar y seguir avanzando a su ritmo».
  - «720 también es la gente que entrena aquí. Distintas edades…».
  - «AQUÍ NO HABÍA NADA»: tienen un vídeo de cómo montaron el local desde cero, buena historia para la web.
- **Equipo** (según reseñas públicas):
  - **Brais**, gerente y entrenador principal: empático y motivador, cuida la técnica.
  - **Bea**, instructora de Pilates muy valorada.
  - **Pablo**, entrenador.
- **Reseñas:** más de 100 reseñas muy positivas (un directorio muestra 111 con nota máxima). Se repiten estas ideas: ambiente familiar, grupos reducidos, atención personalizada, limpieza, sin competitividad tóxica, gente de todas las edades, pases temporales para quien viene de fuera y fácil aparcamiento.
  - Comprueba la nota y el número exactos en su ficha de Google antes de ponerlos en la web.
- **Qué ofrecen:**
  - Sala de musculación y peso libre.
  - **Pilates** en dos salas: **Reformer** y suelo.
  - **720 Yoga**.
  - **Powerlifting** (720 Powerlifting Ourense).
  - **CrossGym 720**: fuerza y acondicionamiento físico general.
  - Gimnasia acrobática (Clube Ximnasia Burgas).
  - **Capoeira** (Capoeira Ourense Andaruê).
  - **Brazilian Jiu-Jitsu** (BJJ Mambises).
  - **Entrada diaria y pases temporales.**
  - **Espacios para profesionales:** alquilan sala para que otros desarrollen su actividad.

## Cómo funcionan hoy (el problema que resolvemos)
No tienen web. Todo vive en un **enlace de Instagram (Beacons) con unos 15 botones sueltos**:
- **Inscripciones con Google Forms**, uno para cada cosa: inscripción general, entrada diaria, yoga y pilates.
- **Información en PDFs de Google Drive**, para el gimnasio y para pilates.
- **Un enlace de WhatsApp distinto para cada disciplina**: CrossGym, powerlifting, BJJ, capoeira, gimnasia y espacios para profesionales.
- Un grupo de WhatsApp de novedades.

Para quien no los conoce es un laberinto: no se ven horarios, tarifas ni fotos en un solo sitio, y Google no tiene una web que enseñar.

## Lo que queremos construir
Una **web única, rápida y preciosa** que lo reúna todo y convierta visitas en altas:
1. **Portada potente:**
   - foto o vídeo real de la sala;
   - titular con su esencia (por ejemplo «Entrena. Cuídate. Crece.»);
   - datos en grande: *365 días · 08:00–22:30 · aforo limitado*;
   - botones «Prueba una clase» y «Escríbenos por WhatsApp».
2. **Disciplinas:** una tarjeta por actividad (musculación, Pilates Reformer, Pilates suelo, Yoga, CrossGym, Powerlifting, Acrobacia, Capoeira, BJJ). Cada una con foto, para quién es, nivel y su propio botón de inscripción o WhatsApp.
3. **Horario semanal de clases** en cuadrícula, filtrable por disciplina. Dejar datos de ejemplo hasta que nos pasen el real.
4. **Tarifas** en tarjetas: cuota del gimnasio, bonos de clases, entrada diaria y pases temporales. Precios con «XX €» hasta que los tengamos.
5. **Inscripción y entrada diaria dentro de la web.** Sustituye a los Google Forms: un formulario único que pregunte la disciplina y envíe un aviso a su WhatsApp o email.
6. **Clase de prueba gratis:** eligen día y hora, y a ellos les llega un WhatsApp con nombre y teléfono.
7. **El equipo:** Brais, Bea y Pablo, con foto y una línea de cada uno.
8. **La historia «Aquí no había nada»:** el antes y el después del local. Genera mucha confianza.
9. **Comunidad y reseñas:** reseñas reales de Google con nombre y fecha, sin retocar, o un enlace a su ficha.
10. **Espacios para profesionales:** una sección para atraer a otros entrenadores o terapeutas que quieran alquilar sala.
11. **Contacto:** mapa, cómo llegar, aparcamiento, teléfono, WhatsApp e Instagram. Botón flotante de WhatsApp.
12. **Legal:** aviso legal, privacidad y cookies, marcados como pendientes de sus datos.

**Estilo:**
- Moderno, cercano y con energía, sin parecer una cadena de gimnasios low cost.
- Paleta oscura con un color de acento sacado de su logo e Instagram. Si no hay logo claro, propón uno: negro, blanco roto y un acento cálido.
- Tipografía condensada potente para titulares y una limpia para textos.
- Micro-animaciones suaves y perfecto en móvil, que es donde entra el 90 % de la gente desde Instagram.

## Referencias de nuestro propio trabajo (para el nivel de acabado)
- **Hungceed (maqueta):** https://hungceed-maqueta.vercel.app. Fíjate en la organización por categorías, la tipografía en mayúsculas y la barra de confianza.
- **Burdin Gym (Ander):** contexto y borrador en `comercial/burdin/` del repositorio `PROYECTOS-BRIAN`. Fíjate en:
  - las tarjetas de máquinas al estilo TDM;
  - las cifras grandes al estilo Blvckout;
  - el bloque de socio fundador;
  - las tarifas con botones de alta.
- **Plantilla base técnica:** `andrea-salon/` (Next.js + Supabase) si conviene reutilizar componentes: reservas, formularios, avisos.

## Fotos
- **Sus fotos están en su Instagram @720gym.** Las descargo yo y te las paso: sala, máquinas, clases de Pilates Reformer, gente entrenando y la fachada.
  - Mientras tanto, deja huecos con el tamaño y la proporción correctos y una descripción de qué foto va en cada uno.
- Para la maqueta que enseñamos el lunes vale usar sus fotos públicas de Instagram. **Para publicar la web definitiva hay que pedirles permiso** y las fotos originales en alta calidad.
- **No uses fotos de bancos de imágenes que parezcan de otro gimnasio.** Si falta alguna, mejor un hueco elegante que una foto falsa.

## Precios que le di por teléfono (para la propuesta, no para la web)
- Plan básico **500 €**, plan Clientes **700 €** y plan Pro **1.200 €**, más la cuota mensual de mantenimiento.
- Para 720 encaja el plan **Clientes** (web completa + inscripción y clase de prueba con aviso a WhatsApp).
- El **Pro** añadiría reservas de clases con plazas limitadas, asistente con IA para WhatsApp y panel de gestión.

## Qué quiero hacer en este chat
1. Montar la **maqueta completa** con todo lo de arriba, perfecta en móvil.
2. Publicarla en una **URL de prueba** para enseñarla el lunes a las 11:00 en el gimnasio.
3. Después, preparar la **propuesta en PDF** con el mismo estilo que mis tarifas.

Reglas:
- No me pidas permiso para cada paso.
- No subas contraseñas ni claves al repositorio.
- Trabaja en la rama que te indique la sesión.
- No inventes datos (precios, nota de Google, años de experiencia): si falta algo, déjalo marcado como «pendiente».
