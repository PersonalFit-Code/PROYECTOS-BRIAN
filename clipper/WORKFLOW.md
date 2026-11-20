# Workflow ViceClips (GTA 6)

Página de clips de GTA 6 sin rostro. Objetivo: ser la página más rápida y fiable del nicho con momentos de streamers, mecánicas nuevas y humor, siempre con crédito al creador.

## 1. Perfil (configuración fija)

| Campo | Valor |
|---|---|
| Cuentas | TikTok (hollybrian), Instagram Reels `viceclipsgta_` (ViceClips, solo español), YouTube Shorts "Vice Clips" |
| Zona horaria | Europe/Madrid |
| Monetización | Content Rewards: "Kai Cenat - $10,000 GTA 6 Pool Campaign" (solo clips de Kai Cenat jugando GTA 6). Más adelante, TikTok Creator Rewards y YouTube Partner |
| Herramientas | `clipper/clip.py` (scan, transcript, pick, render), `mk.py` para clips elegidos a mano, tandas automáticas cada hora |
| Lo que NO se publica | cinemáticas de la historia, contenido sexual o desnudos, la palabra con n, sorteos o códigos, filtraciones, copias piratas, trucos para "jugar antes" y cualquier cosa que no se pueda confirmar como oficial o permitida |
| Canales vetados | zackrawrr (Asmongold), xQc, TimTheTatman |

## 2. Ángulos ganadores (nos adueñamos de dos, no de todo)

1. **"Streamers reaccionando a GTA 6"**: Kai Cenat como prioridad absoluta, porque se cobra, y en España AuronPlay, IlloJuan, Peereira7 y Rubius. Lo que funciona: reacciones auténticas, muertes absurdas, frases lapidarias y momentos de "solo en GTA".
2. **"Cosas que puedes hacer en GTA 6"**: mecánicas y secretos (pescar, baloncesto, tunear, quedarte coches robados…). Se descubren mucho en búsquedas, sirven igual de bien en carrusel (formato de 12 imágenes) y aguantan semanas.

Descartados por saturación o riesgo: noticias rápidas (compite con medios grandes), filtraciones y "trucos" sin confirmar.

**Bio IG/TikTok:**
```
🌴 Lo mejor de GTA 6 cada día
🎮 Streamers, secretos y momentos virales
🎥 Créditos siempre al creador
👇 Síguenos para no perderte nada
```

## 3. Radar diario (09:40, España)

Una tarea programada busca en la web los 5 mejores momentos nuevos de GTA 6 de las últimas 24 h, en publicaciones públicas y en los canales oficiales de Rockstar. Para cada uno da: qué pasa, por qué se va a compartir, el enlace y el creador al que dar crédito. Descarta filtraciones, piratería y lo que no sea oficial o permitido. Los ordena por probabilidad de hacerse viral y propone cuáles convertir en clip o carrusel.

## 4. Plan de edición por clip

- **Duración:** 15-30 s como objetivo. Máximo 40 s, y 45 s solo si es una persecución.
- **Segundo 0-2:** frena el scroll. Tiene que haber acción o una frase en ese momento. Nada de teaser ni de esperas.
- **Texto en pantalla:** el título en la caja blanca (gancho de 5-9 palabras que nombra al streamer y lo que se ve) y subtítulos palabra a palabra.
- **Crédito en pantalla:** siempre `twitch.tv/<canal>` (render `--credit`, o `"credit"` en la spec de mk.py).
- **Dato extra:** en la descripción, una línea con algo nuevo (la mecánica, dónde está, cuánto cuesta…).
- **Ganchos:** se queman 1 en el vídeo y se dan 2 alternativos en la ficha, para la primera línea del caption o para hacer pruebas A/B.

## 5. Caption y calendario

**Plantilla del caption:**
```
<Primera línea que provoque comentarios>
<Contexto corto 1>
<Contexto corto 2 / dato extra>
<Pregunta para responder en comentarios>
🎥 <Creador> (twitch.tv/<canal>)
#gta6 #... (3-5 hashtags; Kai: #kaicenat #gta6 + @kaicenat; en español: #españa)
```

**Horas de publicación (3 posts al día por red):**

| Contenido | Franja 1 | Franja 2 | Franja 3 |
|---|---|---|---|
| Kai Cenat / inglés (público de EE. UU.) | 12:00 ET = 18:00 ES | 17:00 ET = 23:00 ES | 21:00 ET = 03:00 ES (programado) |
| Streamers españoles (IG viceclipsgta_) | 14:00 ES | 19:00 ES | 22:00 ES |

Las franjas de madrugada se programan desde la app: TikTok tiene programador en la web e Instagram lo permite al publicar. Cada mañana el radar entrega la tabla del día con los clips pendientes ya asignados a cada franja.

## 6. Crecer con comentarios

- **Primera hora después de publicar:** responde a todos los comentarios, mejor con una pregunta para que sigan hablando, y fija el mejor.
- **Comentar en cuentas grandes de GTA 6** (Rockstar, páginas de noticias, clippers grandes y los streamers): 5-10 comentarios al día, útiles o graciosos y nunca "sígueme". Banco de respuestas en `clipper/RESPUESTAS.md`.
- **Preguntas que se repiten en tus comentarios:** cada una es un post. Apúntalas en el informe semanal.
- **Informe de los domingos (20:40):** tú pegas los números de la semana (visualizaciones, comentarios, compartidos y seguidores nuevos por post) y sale qué ha funcionado y por qué, qué publicar más y qué dejar de hacer.

## 7. Monetización (de la más rápida a la más grande)

| # | Vía | Cuándo | Cuánto | Primer paso |
|---|---|---|---|---|
| 1 | Content Rewards / Whop (campañas de clips: Kai Cenat y otras) | Ya | Pago por cada 1.000 visualizaciones, según la campaña | Enviar cada clip de Kai publicado y buscar 1-2 campañas más de GTA 6 o de streamers |
| 2 | Editar clips para streamers pequeños o medianos | Ya (el portfolio son nuestros clips) | 50-150 € al mes por 10-15 clips; más adelante paquetes de 300 € o más | DM a 5 streamers de GTA 6 de 1.000 a 20.000 seguidores con 2 clips de muestra hechos con su directo |
| 3 | Afiliados (Amazon Afiliados de mandos, auriculares y sillas; tarjetas PSN/Xbox en tiendas con programa de afiliados) | Desde unos 1.000 seguidores | Comisión del 3-10 % | Darte de alta y poner un enlace en la bio ("mi setup") |
| 4 | Menciones pagadas o marcas gaming | Desde 5.000-10.000 seguidores o 100.000 visualizaciones al mes | Orientativo: 10-20 € por cada 10.000 visualizaciones medias por post | Kit de medios con capturas de estadísticas y DM (plantilla abajo) |
| 5 | TikTok Creator Rewards y YouTube Partner | Requisitos de cada plataforma (TikTok: 10.000 seguidores, 100.000 visualizaciones en 30 días y vídeos de más de 1 minuto; YouTube: 1.000 suscriptores y 10 millones de visualizaciones de Shorts en 90 días) | Variable | Para Creator Rewards hay que hacer recopilatorios de más de 1 minuto ("Top 5 momentos de Kai en GTA 6") |

Requisitos y cifras orientativos: comprueba en cada programa los vigentes.
Evitar: vender "guías de trucos" con contenido no oficial y cualquier cosa que prometa jugar antes o versiones piratas.

**Plantilla de DM para una marca gaming:**
```
Hola, equipo de [marca] 👋
Soy el creador de ViceClips (@viceclipsgta_), una página de clips de GTA 6 en TikTok, Reels y Shorts.
Últimos 30 días: [X] visualizaciones, [Y] seguidores, [Z] % de audiencia de 18-34 años de España/LatAm.
Os propongo una mención integrada en un clip de GTA 6 (producto en pantalla y enlace en la bio 48 h) por [precio] €.
Si os encaja, os paso el kit de medios con estadísticas y ejemplos. ¡Gracias!
```
