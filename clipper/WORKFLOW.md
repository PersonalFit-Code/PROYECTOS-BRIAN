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
