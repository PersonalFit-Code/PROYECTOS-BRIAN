# Clipper GTA 6: de un directo de Twitch a clips para TikTok y Shorts

Convierte un directo de Twitch (o un `.mp4`) en clips verticales 1080x1920 con:

- **Gancho visual**: abre con 1,5 s del momento fuerte y un texto grande en caja roja.
- **Subtítulos palabra a palabra** (Whisper), con la palabra activa en amarillo y un efecto pop.
- **Zoom** en el pico de emoción.
- **Barra de progreso** abajo, para que la gente aguante hasta el final.
- **Audio normalizado** a -14 LUFS, el volumen de referencia de TikTok y YouTube.
- Formato `split` (cámara arriba y juego abajo) o `blur` (juego centrado con fondo desenfocado).

## Uso

```bash
pip install -r clipper/requirements.txt

# 1) Ver los ultimos VODs de un canal (el primero es el directo en curso)
python clipper/clip.py latest rubius

# 2) Detectar momentos en los ultimos 25 min del directo y transcribirlos
python clipper/clip.py scan https://www.twitch.tv/rubius --last 25 --n 8 --lang es

#    o un tramo concreto de un VOD
python clipper/clip.py scan https://www.twitch.tv/videos/123 --section 01:00:00-01:40:00

# 3) Editar work/<id>/candidates.json: hook, title, keep=false para descartar,
#    "translations" para versiones en otros idiomas
# 4) Renderizar (split = facecam arriba; cam = x,y,w,h en fracciones del frame)
python clipper/clip.py render work/<id>/candidates.json --layout split --cam 0,0.437,0.22,0.252
```

### Versiones en otros idiomas

En cada candidato:

```json
"translations": {"en": {"hook": "...", "subs": [{"s": 812.3, "e": 815.0, "text": "..."}]}}
```

`s` y `e` son segundos en la fuente. El render genera `NN_en.mp4`.

## Cómo elige los momentos

Calcula el volumen cada 0,5 s y lo compara con la línea base de los últimos 90 s. Puntúa
alto los gritos, las risas y las explosiones por encima de lo normal, y las subidas
bruscas. Elige los N picos más separados entre sí. Cada clip empieza ~18 s antes del
pico, para que haya contexto antes y el remate llegue al final.

## Red (entorno cloud)

Twitch sirve los VOD desde varios hosts `*.cloudfront.net`. Si un canal nuevo falla con
"connect_rejected", hay que añadir su host a la lista de hosts permitidos del entorno.
El host se ve con `yt-dlp -g <url del VOD>`.
