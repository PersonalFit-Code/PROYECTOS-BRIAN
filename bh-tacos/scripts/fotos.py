"""Convierte las fotos originales (bh-tacos/fotos/originales/) a WebP para la web (public/images/).

Uso:  python3 scripts/fotos.py      (desde bh-tacos/)

Nunca amplía: si el original es más pequeño que el ancho pedido, se queda a su tamaño. Para añadir una
foto: copiarla a fotos/originales/, añadirla a FOTOS y registrarla en src/data/photos.ts.
"""
from pathlib import Path
from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / "fotos" / "originales"
SALIDA = RAIZ / "public" / "images"

# nombre de salida: (fichero original, ancho máximo, recorte opcional (izq, arriba, der, abajo))
FOTOS = {
    "local-interior": ("local-interior.png", 1600, None),
    "promo-tacos": ("promo-tacos-logo.png", 1200, None),
}


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    for nombre, (fichero, ancho, recorte) in FOTOS.items():
        im = ImageOps.exif_transpose(Image.open(ORIG / fichero)).convert("RGB")
        if recorte:
            im = im.crop(recorte)
        if im.width > ancho:
            im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        destino = SALIDA / f"{nombre}.webp"
        im.save(destino, "WEBP", quality=82, method=6)
        print(f"{destino.relative_to(RAIZ)}  {im.width}x{im.height}  {destino.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
