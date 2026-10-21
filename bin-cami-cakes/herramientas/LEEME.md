# Herramientas de construcción

**Esto vive aquí por una razón.** El 19/10 el contenedor de trabajo se recicló
y se llevó por delante todo el utillaje, que estaba fuera del repositorio: el
generador del mostrador, el de `dist/`, el de traducciones y las pruebas. La
web no se perdió —estaba publicada y en git— pero **dejó de poder
reconstruirse**, y sin el generador de `dist/` no se puede publicar nada,
porque los hashes de la CSP hay que recalcularlos en cada cambio.

Reescritos el 21/10 a partir de lo que ya estaba publicado, y cada uno trae un
`--comprueba` que exige reproducirlo **byte a byte** antes de fiarse.

## Qué hay

| Fichero | Para qué |
|---|---|
| `construye_mostrador.py` | `mostrador.html` = `index.html` + `catalogo-cuerpo.html` |
| `catalogo-cuerpo.html` | El `<main>` del catálogo. Es la fuente: `mostrador.html` se genera |
| `construye_dist.py` | `dist/` + `vercel.json` con los hashes sha256 de la CSP |
| `servidor_csp.py` | Sirve `dist/` con las cabeceras de verdad |
| `trad.py` | Añade claves al diccionario de idiomas |

## El orden importa

```sh
cd herramientas
BCC_RAIZ=.. python3 construye_mostrador.py   # 1º: el mostrador sale del index
BCC_RAIZ=.. python3 construye_dist.py        # 2º: dist sale de los dos
```

Al revés, `dist/` se queda con el mostrador viejo. Pasó: el generador del
mostrador llevaba días fallando, el error se mandaba a `/dev/null` y las
pruebas salían en verde contra un `mostrador.html` de hacía una semana.

## Lo que NO se toca a mano

- `mostrador.html` y `dist/` se generan. Lo que se edite ahí se pierde.
- Los hashes de la CSP en `vercel.json`. Si un script cambia y el hash no se
  recalcula, **el navegador lo bloquea en silencio**: la web carga pero media
  página deja de funcionar y no sale ningún error visible. Por eso se publica
  siempre pasando por `construye_dist.py` y mirando `dist/` con
  `servidor_csp.py` antes de subir.

## Lo que falta

Las ~40 pruebas de navegador (`todas.sh` y sus arneses) se perdieron y **no
están rehechas**. Mientras tanto, cada cambio se comprueba a mano en el
navegador. Rehacerlas es el siguiente trabajo pendiente de esta carpeta.
