#!/usr/bin/env python3
"""
Clipper: de directo de Twitch (o .mp4) a clips verticales 9:16 con gancho,
subtitulos palabra a palabra, zoom en el pico y barra de progreso.

Flujo en dos fases:
  1) scan   -> descarga (si es URL), detecta picos de emocion por audio,
               transcribe cada candidato y escribe candidates.json
  2) render -> lee candidates.json (con ganchos/titulos editados) y renderiza

Ejemplos:
  python clipper/clip.py latest ibai
  python clipper/clip.py scan https://www.twitch.tv/videos/123 --section 01:00:00-01:45:00 --n 8
  python clipper/clip.py render work/123/candidates.json
"""
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
FONTS = HERE / "fonts"
W, H, FPS = 1080, 1920, 30


def run(cmd, **kw):
    print("+", " ".join(str(c) for c in cmd)[:300], file=sys.stderr)
    return subprocess.run(cmd, check=True, **kw)


def ts(s):
    """'01:02:03' / '62:03' / '3723' -> segundos"""
    if isinstance(s, (int, float)):
        return float(s)
    parts = [float(p) for p in str(s).split(":")]
    v = 0.0
    for p in parts:
        v = v * 60 + p
    return v


def hms(sec):
    sec = max(0.0, sec)
    return f"{int(sec // 3600):02d}:{int(sec % 3600 // 60):02d}:{sec % 60:06.3f}"


def probe_duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
    )
    return float(out.strip())


# ---------------------------------------------------------------- descarga
def latest(channel):
    """Imprime los ultimos VODs (el primero suele ser el directo en curso)."""
    run(["yt-dlp", "--flat-playlist", "--playlist-end", "5", "--print",
         "%(url)s | %(title)s | %(duration_string)s",
         f"https://www.twitch.tv/{channel}/videos?filter=archives&sort=time"])


def hls_section(url, out, a=None, b=None, last=None, max_h=720, workers=12):
    """Baja solo los fragmentos HLS del tramo [a,b] (o los ultimos `last` s) de un VOD
    de Twitch -incluido un directo en curso- y los une. Evita el seek de ffmpeg."""
    import requests
    from concurrent.futures import ThreadPoolExecutor
    from urllib.parse import urljoin
    m3u8 = subprocess.check_output(
        ["yt-dlp", "-g", "-f", f"best[height<={max_h}]/best", url], text=True).strip().splitlines()[-1]
    lines = requests.get(m3u8, timeout=30).text.splitlines()
    init, segs, t, dur = None, [], 0.0, None
    for ln in lines:
        if ln.startswith("#EXT-X-MAP:"):
            init = urljoin(m3u8, re.search(r'URI="([^"]+)"', ln).group(1))
        elif ln.startswith("#EXTINF:"):
            dur = float(ln[8:].split(",")[0])
        elif ln and not ln.startswith("#") and dur is not None:
            segs.append((t, t + dur, urljoin(m3u8, ln)))
            t += dur
            dur = None
    total = t
    if last:
        a, b = max(0.0, total - last), total
    a = a or 0.0
    b = min(b or total, total)
    pick = [s for s in segs if s[1] > a and s[0] < b]
    print(f"VOD {total / 60:.1f} min -> bajando {a / 60:.1f}-{b / 60:.1f} min ({len(pick)} fragmentos)", file=sys.stderr)
    sess = requests.Session()

    def get(u):
        for _ in range(4):
            try:
                r = sess.get(u, timeout=60)
                r.raise_for_status()
                return r.content
            except Exception as e:      # reintentos ante cortes de red
                err = e
        raise err

    tmp = out.with_suffix(".part" + (".mp4" if init else ".ts"))
    with open(tmp, "wb") as f, ThreadPoolExecutor(workers) as ex:
        if init:
            f.write(get(init))
        for data in ex.map(get, [s[2] for s in pick]):
            f.write(data)
    run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-c", "copy", "-movflags", "+faststart", str(out)])
    tmp.unlink()
    return pick[0][0] if pick else 0.0


def download(url, workdir, section=None, max_h=720, last=None):
    workdir.mkdir(parents=True, exist_ok=True)
    out = workdir / "source.mp4"
    if out.exists():
        return out
    if "/videos/" in url or last:
        a = b = None
        if section:
            a, b = [ts(x) for x in section.split("-")]
        if "/videos/" not in url:     # canal: usar el VOD mas reciente (directo en curso)
            url = subprocess.check_output(
                ["yt-dlp", "--flat-playlist", "--playlist-end", "1", "--print", "%(url)s",
                 url.rstrip("/") + "/videos?filter=archives&sort=time"], text=True).strip()
        offset = hls_section(url, out, a, b, (last or 0) * 60 or None, max_h)
        (workdir / "offset.txt").write_text(f"{offset}\n{url}\n")   # minuto real en el VOD
        return out
    cmd = ["yt-dlp", "-f", f"best[height<={max_h}]/best", "--merge-output-format", "mp4",
           "-o", str(out), "--no-part", "--concurrent-fragments", "8"]
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if proxy:   # ffmpeg (usado en --download-sections) no lee HTTPS_PROXY por si solo
        cmd += ["--proxy", proxy]
    if section:
        a, b = section.split("-")
        cmd += ["--download-sections", f"*{hms(ts(a))}-{hms(ts(b))}"]
    run(cmd + [url])
    return out


# ---------------------------------------------------------------- deteccion
def loudness_curve(src, hop=0.5, sr=16000):
    """dB RMS cada `hop` segundos, leyendo el audio en streaming."""
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(src), "-vn", "-ac", "1",
                          "-ar", str(sr), "-f", "s16le", "-"], stdout=subprocess.PIPE)
    n = int(sr * hop)
    vals = []
    while True:
        buf = p.stdout.read(n * 2)
        if len(buf) < n * 2:
            break
        x = np.frombuffer(buf, dtype=np.int16).astype(np.float32) / 32768.0
        vals.append(20 * np.log10(np.sqrt(np.mean(x * x)) + 1e-6))
    p.wait()
    return np.array(vals), hop


def rolling(x, win, fn):
    half = win // 2
    pad = np.pad(x, half, mode="edge")
    return np.array([fn(pad[i:i + win]) for i in range(len(x))])


def find_peaks(db, hop, n, clip_len, min_gap=None):
    """Picos de 'emocion' = volumen por encima de la linea base local."""
    base = rolling(db, int(90 / hop) | 1, np.median)          # base ~90 s
    exc = db - base
    exc = rolling(exc, int(2 / hop) | 1, np.mean)              # suavizado 2 s
    # bonus por subidas bruscas (gritos, explosiones)
    rise = np.maximum(0, np.diff(db, prepend=db[0]))
    score = exc + 0.3 * rolling(rise, int(1 / hop) | 1, np.max)
    min_gap = min_gap or clip_len
    order = np.argsort(score)[::-1]
    picked = []
    for i in order:
        t = i * hop
        if all(abs(t - p[0]) >= min_gap for p in picked):
            picked.append((t, float(score[i])))
        if len(picked) >= n:
            break
    return sorted(picked)


# ---------------------------------------------------------------- transcripcion
_model = None


def transcribe(src, start, end, lang=None, model_size="small"):
    global _model
    from faster_whisper import WhisperModel
    if _model is None:
        _model = WhisperModel(model_size, device="cpu", compute_type="int8",
                              cpu_threads=os.cpu_count() or 4)
    # audio ya decodificado (evita incompatibilidades de PyAV)
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}",
                                   "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"])
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    segs, info = _model.transcribe(audio, language=lang, word_timestamps=True,
                                   vad_filter=True, beam_size=1)
    words = []
    for s in segs:
        for w in s.words or []:
            words.append({"w": w.word.strip(), "s": round(start + w.start, 3),
                          "e": round(start + w.end, 3)})
    return words, info.language


# ---------------------------------------------------------------- scan
def scan(args):
    src_arg = args.source
    if re.match(r"https?://", src_arg):
        vid = re.sub(r"\W+", "_", src_arg.rstrip("/").split("/")[-1])[:40]
        if args.section:
            vid += "_" + args.section.replace(":", "").replace("-", "_")
        if args.last:
            import time
            vid += f"_last{args.last}_{time.strftime('%H%M')}"
        work = Path(args.work) / vid
        src = download(src_arg, work, args.section, last=args.last)
    else:
        src = Path(src_arg).resolve()
        work = src.parent if src.name == "source.mp4" else Path(args.work) / src.stem
        work.mkdir(parents=True, exist_ok=True)
    dur = probe_duration(src)
    print(f"Fuente: {src} ({dur / 60:.1f} min)", file=sys.stderr)

    db, hop = loudness_curve(src)
    peaks = find_peaks(db, hop, args.n, args.len)
    cands = []
    for k, (t, score) in enumerate(peaks, 1):
        # el pico cae al ~65% del clip: hay contexto antes y el remate al final
        start = max(0.0, t - args.len * 0.65)
        end = min(dur, start + args.len)
        words, lang = transcribe(src, start, end, args.lang, args.model)
        text = " ".join(w["w"] for w in words)
        print(f"[{k}] {hms(t)} score={score:.1f} :: {text[:120]}", file=sys.stderr)
        cands.append({
            "id": k, "keep": True, "peak": round(t, 2), "score": round(score, 2),
            "start": round(start, 2), "end": round(end, 2),
            "teaser": True,            # abre con 1.5 s del pico (gancho visual)
            "hook": "",                # texto grande arriba (lo escribe el editor)
            "title": "", "description": "", "hashtags": [],
            "lang": lang, "words": words,
        })
    meta = {"source": str(src), "duration": dur, "layout": args.layout, "cam": args.cam,
            "candidates": cands}
    out = work / "candidates.json"
    out.write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    print(out)


# ---------------------------------------------------------------- render
def ass_time(t):
    t = max(0.0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def wrap(text, width):
    out, line = [], ""
    for word in text.split():
        if len(line) + len(word) + 1 > width and line:
            out.append(line)
            line = word
        else:
            line = (line + " " + word).strip()
    if line:
        out.append(line)
    return "\\N".join(out)


def chunk_words(words, max_words=2, max_chars=14, gap=0.4):
    """Trozos cortos (1-2 palabras): se leen de un vistazo en el movil."""
    chunks, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words
                    or sum(len(x["w"]) + 1 for x in cur) + len(w["w"]) > max_chars
                    or w["s"] - cur[-1]["e"] > gap
                    or cur[-1]["w"].rstrip()[-1:] in ".?!"):
            chunks.append(cur)
            cur = []
        cur.append(w)
    if cur:
        chunks.append(cur)
    return chunks


EMOJI = re.compile("[\U00010000-\U0010FFFF\u2600-\u27BF\uFE0F\u200D]")


def clean(t):
    t = EMOJI.sub("", t).strip()
    return t.replace("{", "(").replace("}", ")").replace("\\", "")


YELLOW, GREEN, RED, WHITE = "&H00E6FF&", "&H7AFF3D&", "&H2A2AF0&", "&HFFFFFF&"


def cap_text(t):
    """Texto de subtitulo: mayusculas, sin comas ni puntos finales (se conservan ? y !)."""
    return clean(t).upper().strip().rstrip(".,;:").lstrip("¿¡") or clean(t).upper()


def hook_text(hook, width=17):
    """Titular en caja blanca; *asi* (o cifras y dinero) se resalta en rojo."""
    lines, line, n, emph = [], [], 0, False
    for raw in clean(hook).upper().split():
        start, end = raw.startswith("*"), raw.endswith("*")
        word = raw.strip("*")
        if not word:
            continue
        hot = emph or start
        emph = (emph or start) and not end
        if line and n + len(word) + 1 > width:
            lines.append(" ".join(line))
            line, n = [], 0
        line.append(f"{{\\c{RED}}}{word}{{\\c&H101010&}}" if hot else word)
        n += len(word) + 1
    if line:
        lines.append(" ".join(line))
    return "\\N".join(lines)


def build_ass(words_out, hook, total, layout, path):
    cap_y = 1400                       # por encima de la zona de botones y texto de TikTok/Shorts
    hook_y = 300 if layout == "blur" else 770
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Anton,132,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,10,6,5,40,40,0,1
Style: Hook,Anton,90,&H00101010,&H00101010,&H00FFFFFF,&H00000000,0,0,0,0,100,100,1,0,3,22,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    if hook:
        ev.append(f"Dialogue: 1,{ass_time(0)},{ass_time(total)},Hook,,0,0,0,,"
                  f"{{\\pos(540,{hook_y})\\fscx70\\fscy70\\t(0,120,\\fscx106\\fscy106)\\t(120,220,\\fscx100\\fscy100)}}"
                  + hook_text(hook))
    chunks = chunk_words(sorted(words_out, key=lambda w: w["s"]))
    for k, ch in enumerate(chunks):
        ch_end = ch[-1]["e"] + 0.12
        if k + 1 < len(chunks):          # nunca dos subtitulos a la vez en pantalla
            ch_end = min(ch_end, chunks[k + 1][0]["s"])
        texts = [cap_text(x["w"]) for x in ch]
        for i, w in enumerate(ch):
            s = w["s"]
            e = min(ch[i + 1]["s"], ch_end) if i + 1 < len(ch) else ch_end
            if e <= s:
                continue
            parts = []
            for j, t in enumerate(texts):
                if j == i:      # palabra activa: color + rebote propio
                    col = GREEN if re.search(r"[\d$€]", t) else YELLOW
                    parts.append(f"{{\\c{col}\\fscx122\\fscy122\\t(0,110,\\fscx108\\fscy108)}}{t}"
                                 f"{{\\c{WHITE}\\fscx100\\fscy100}}")
                else:
                    parts.append(t)
            ev.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Cap,,0,0,0,,"
                      f"{{\\pos(540,{cap_y})\\blur0.6}}" + " ".join(parts))
    Path(path).write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


def map_words(words, pieces):
    """Pasa tiempos de la fuente a tiempos del clip final (piezas concatenadas)."""
    out, off = [], 0.0
    for a, b in pieces:
        for w in words:
            if w["s"] >= a and w["e"] <= b + 0.05:
                out.append({"w": w["w"], "s": w["s"] - a + off, "e": min(w["e"], b) - a + off})
        off += b - a
    return out


def even_words(segments):
    """Subtitulos traducidos sin tiempos por palabra: reparte cada frase."""
    out = []
    for seg in segments:
        toks = seg["text"].split()
        if not toks:
            continue
        step = (seg["e"] - seg["s"]) / len(toks)
        for i, t in enumerate(toks):
            out.append({"w": t, "s": seg["s"] + i * step, "e": seg["s"] + (i + 1) * step})
    return out


def render_clip(meta, c, outdir, lang_suffix=""):
    src = meta["source"]
    layout = meta.get("layout", "blur")
    pieces = []
    if c.get("teaser"):
        pieces.append((max(0.0, c["peak"] - 0.4), c["peak"] + 1.1))
    pieces.append((c["start"], c["end"]))
    total = sum(b - a for a, b in pieces)
    teaser_len = pieces[0][1] - pieces[0][0] if len(pieces) > 1 else 0.0
    peak_out = teaser_len + (c["peak"] - c["start"])   # momento del pico en el clip final

    if c.get("subs"):                 # traduccion: [{"s","e","text"}] en tiempo de fuente
        words = map_words(even_words(c["subs"]), pieces)
    else:
        words = map_words(c["words"], pieces)

    stem = f"{c['id']:02d}{lang_suffix}"
    ass = outdir / f"{stem}.ass"
    build_ass(words, c.get("hook", ""), total, layout, ass)

    cmd = ["ffmpeg", "-v", "error", "-y"]
    for a, b in pieces:
        cmd += ["-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", src]
    n = len(pieces)
    fc = "".join(f"[{i}:v]fps={FPS},setsar=1[v{i}];[{i}:a]aresample=48000[a{i}];" for i in range(n))
    fc += "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc][ac];"
    # zoom 'punch' durante el teaser y justo en el pico
    zexpr = f"if(lt(it\\,{teaser_len:.2f})+between(it\\,{peak_out:.2f}\\,{peak_out + 1.6:.2f})\\,1.18\\,1)"
    zp = f"zoompan=z='{zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:fps={FPS}"
    if layout == "split" and meta.get("cam"):
        cx, cy, cw, chh = [float(v) for v in meta["cam"].split(",")]
        fc += (f"[vc]split[c][g];"
               f"[c]crop=iw*{cw}:ih*{chh}:iw*{cx}:ih*{cy},scale=1080:640:force_original_aspect_ratio=increase,crop=1080:640[cam];"
               f"[g]scale=-2:1280,crop=1080:1280,{zp}:s=1080x1280[game];"
               f"[cam][game]vstack[v1];")
    else:
        fc += (f"[vc]split[a][b];"
               f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=24:2,eq=brightness=-0.18[bg];"
               f"[b]scale=1440:810,crop=1080:810,{zp}:s=1080x810[fg];"
               f"[bg][fg]overlay=0:(H-h)/2-80[v1];")
    fc += f"[v1]subtitles='{ass}':fontsdir='{FONTS}'[vout];"
    voice = c.get("voice")
    if voice and Path(voice).exists():   # voz en off al arrancar: baja el audio original mientras suena
        vd = probe_duration(voice) + 0.15
        cmd += ["-i", str(voice)]
        fc += (f"[ac]volume='if(lt(t,{vd:.2f}),0.22,1)':eval=frame[duck];"
               f"[{n}:a]aresample=48000,volume=1.8[vo];"
               f"[duck][vo]amix=inputs=2:duration=first:normalize=0[am];"
               f"[am]loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
    else:
        fc += "[ac]loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
    out = outdir / f"{stem}.mp4"
    cmd += ["-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{total:.3f}", str(out)]
    run(cmd)
    return out


def render(args):
    path = Path(args.candidates)
    meta = json.loads(path.read_text())
    if args.layout:
        meta["layout"] = args.layout
    if args.cam:
        meta["cam"] = args.cam
    outdir = path.parent / ("clips" if path.stem == "candidates" else path.stem)
    outdir.mkdir(exist_ok=True)
    for c in meta["candidates"]:
        if not c.get("keep", True) or (args.only and c["id"] not in args.only):
            continue
        out = render_clip(meta, c, outdir)
        print(out)
        for lang, tr in (c.get("translations") or {}).items():
            cc = dict(c, hook=tr.get("hook", c.get("hook", "")), subs=tr["subs"])
            print(render_clip(meta, cc, outdir, f"_{lang}"))

# ---------------------------------------------------------------- transcripcion completa + seleccion manual
def transcript(args):
    """Transcribe la fuente entera para elegir momentos leyendo (humor, frases, charla con el chat)."""
    src = Path(args.source).resolve()
    dur = probe_duration(src)
    words, lang = transcribe(src, 0, dur, args.lang, args.model)
    (src.parent / "transcript.json").write_text(json.dumps({"lang": lang, "words": words}, ensure_ascii=False))
    lines, cur, t0 = [], [], None
    for w in words:
        if t0 is None:
            t0 = w["s"]
        cur.append(w["w"])
        if w["e"] - t0 >= 10:
            lines.append(f"[{int(t0)}] " + " ".join(cur))
            cur, t0 = [], None
    if cur:
        lines.append(f"[{int(t0)}] " + " ".join(cur))
    out = src.parent / "transcript.txt"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(out)


def pick(args):
    """Crea candidates.json a partir de tramos elegidos a mano: inicio-fin@pico (segundos)."""
    src = Path(args.source).resolve()
    tr = json.loads((src.parent / "transcript.json").read_text())
    cands = []
    for k, spec in enumerate(args.clips, 1):
        rng, _, pk = spec.partition("@")
        a, b = [float(x) for x in rng.split("-")]
        peak = float(pk) if pk else a + (b - a) * 0.65
        cands.append({"id": k, "keep": True, "peak": peak, "score": 0, "start": a, "end": b,
                      "teaser": True, "hook": "", "title": "", "description": "", "hashtags": [],
                      "lang": tr["lang"],
                      "words": [w for w in tr["words"] if w["s"] >= a - 0.1 and w["e"] <= b + 0.1]})
    meta = {"source": str(src), "duration": probe_duration(src), "layout": "split", "cam": args.cam,
            "candidates": cands}
    out = src.parent / (args.name + ".json")
    out.write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    print(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("latest", help="ultimos VODs de un canal (el 1o suele ser el directo en curso)")
    p.add_argument("channel")
    p = sub.add_parser("scan", help="descarga + detecta momentos + transcribe")
    p.add_argument("source", help="URL de Twitch (canal, VOD o clip) o ruta a .mp4")
    p.add_argument("--section", help="tramo a bajar, p.ej. 01:00:00-01:45:00")
    p.add_argument("--last", type=float, help="bajar solo los ultimos N minutos (ideal en directo)")
    p.add_argument("--n", type=int, default=8, help="numero de clips candidatos")
    p.add_argument("--len", type=float, default=28, help="duracion de cada clip (s)")
    p.add_argument("--lang", default=None, help="idioma del audio (es, en...), auto si se omite")
    p.add_argument("--model", default="small", help="modelo whisper: base/small/medium")
    p.add_argument("--layout", choices=["blur", "split"], default="blur")
    p.add_argument("--cam", help="facecam como fracciones x,y,w,h (p.ej. 0.75,0.0,0.25,0.3) para layout split")
    p.add_argument("--work", default="work")
    p = sub.add_parser("render", help="renderiza los clips de un candidates.json")
    p.add_argument("candidates")
    p.add_argument("--only", type=int, nargs="*")
    p.add_argument("--layout", choices=["blur", "split"])
    p.add_argument("--cam", help="facecam x,y,w,h en fracciones (layout split)")
    p = sub.add_parser("transcript", help="transcribe la fuente entera (para elegir momentos de humor leyendo)")
    p.add_argument("source")
    p.add_argument("--lang", default=None)
    p.add_argument("--model", default="small")
    p = sub.add_parser("pick", help="crea candidatos a mano: inicio-fin@pico en segundos")
    p.add_argument("source")
    p.add_argument("clips", nargs="+")
    p.add_argument("--cam")
    p.add_argument("--name", default="picked")
    a = ap.parse_args()
    {"latest": lambda: latest(a.channel), "scan": lambda: scan(a), "render": lambda: render(a),
     "transcript": lambda: transcript(a), "pick": lambda: pick(a)}[a.cmd]()


if __name__ == "__main__":
    main()
