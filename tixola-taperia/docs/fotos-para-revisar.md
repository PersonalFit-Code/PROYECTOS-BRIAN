# Fotos — lo que hace falta confirmar

De las **104 fotos** que subió Brian al Drive el 2 de octubre de 2026 están publicadas **50**:
11 platos, 6 del local y la vinoteca, y 33 botellas en las fichas de la carta de vinos.

Este documento es la lista de lo que **no se ha podido decidir desde la foto**. Nada de lo de aquí
abajo bloquea la web: todo está publicado de una forma que no afirma lo que no se sabe. Pero
conviene que Tatiana lo repase, porque son las únicas afirmaciones de esta tanda que dependen de un
ojo que estuvo en la cocina.

---

## 1 · Las croquetas: ¿cuáles son? — RESUELTO

**La decisión de la casa:** *"al final no se va a diferenciar por el exterior, sino por el interior,
así que si coges la misma foto nos vale"*. Así que `croquetas-tabla.webp` sale ahora en **las cuatro
croquetas de la carta** —jamón, grelos y chipirón, cecina y queso de cabra, y sin gluten— y en el
destacado de la portada.

**Por qué funciona.** Por fuera son la misma croqueta dorada, y quien la mira ya sabe cuál es porque
tiene el nombre del plato encima. La foto no afirma de qué está rellena: enseña cómo se sirven.

**Si algún día cambia**, es un sitio: el campo `dishIds` de la foto `croquetas-tabla` en
`src/data/photos.ts`. Quitando un id de ahí, esa croqueta se queda sin foto; poniendo otra foto con
ese id, la cambia.

La segunda foto de croquetas (`croquetas-racion.webp`, el plato alargado) sigue **solo en la
galería**, sin enlazar a ningún plato: con una ya basta para las cuatro tarjetas y dos fotos casi
iguales seguidas no aportan nada.

---

## 1b · Las zamburiñas: ¿a la plancha o rellenas?

La foto nueva de las zamburiñas está puesta en **"Zamburiñas a la plancha"** (y en el destacado de
la portada), porque es lo que se ve: la vieira al descubierto con la ajada de ajo y perejil por
encima. Si fueran las **rellenas** —sofrito y gratinado— tendrían otra pinta.

Brian la mandó dudando ("las zamburiñas rellenas o a la plancha"), así que **conviene confirmarlo**.
Moverla es cambiar un id en `dishIds` dentro de `src/data/photos.ts`.

De paso: la foto que había antes de este plato era de archivo, no de la casa. Esta es de la mesa de
Tixola, con la pared de botellas detrás, así que el cambio es ganancia en los dos sentidos.

---

## 1c · Los pimientos de Padrón no están en la carta

Brian mandó su foto y pidió integrarlos "aunque no los haya en la carta como tal". Está publicada
**en la galería**, que es donde una foto puede enseñar lo que hay en la casa sin afirmar que sea un
plato de carta.

**Para que entren en la carta solo falta una cosa: su precio.** Con el precio (y si se sirven por
ración, media ración o las dos) se dan de alta como un plato más, con su ficha y su enlace desde la
foto. Sin él no se pueden publicar: un precio inventado en una carta es el peor error posible.

---

## 2 · Platos enlazados a su entrada de la carta

Estos nueve sí se reconocen sin discusión y van enlazados a su plato. Si alguno no es lo que
parece, es cosa de una línea:

| Foto | Plato al que está enlazada |
|---|---|
| `patatas-alioli` | Patatas bravas, alioli o mixtas |
| `calamares-fritos` | Calamares fritos |
| `pulpo-tempura` | Pulpo en tempura |
| `tixola-raxo` | Tixola de raxo y Arzúa |
| `tixola-chistorra` | Tixola con chistorra |
| `tixola-gulas-langostinos` | Tixola con gulas, setas y langostinos |
| `revuelto-bacalao-grelos` | Revuelto de bacalao, grelos y langostinos |
| `ensalada-pollo-crujiente` | Ensalada de pollo crujiente, nueces y manzana |
| `ensalada-aguacate-bacalao` | Ensalada de aguacate y bacalao ahumado |

Las dos que más conviene mirar son **`pulpo-tempura`** (se ven tentáculos rebozados sobre patatas,
pero podría ser otra fritura) y **`revuelto-bacalao-grelos`** (se ve huevo, verde y langostino; el
bacalao se intuye pero no se ve entero).

---

## 3 · Lo que NO se ha publicado, y por qué

- **Las fotos del comedor lleno** (dos). Salían clientes con la cara perfectamente reconocible y
  nadie les ha pedido permiso. Una foto así no se puede retirar de Internet una vez publicada. Si
  interesa tener una foto de sala llena, lo limpio es repetirla con el local vacío, de espaldas, o
  con permiso firmado de quien salga.
- **El rótulo de la calle** sí está, pero recortado por encima de la gente que pasaba, por lo mismo.
- **Unas 50 fotos de botellas que no están en la carta** (Carmelo Rodero Crianza, A Torna dos Pasas,
  Valdamor, Setembro 25, Regina Dona, Marqués de Riscal, Ibizkus…). No se publican porque la carta
  de papel no las lleva. El día que entren en carta, la foto ya está hecha.

---

## 4 · Las botellas

33 de los 52 vinos de la carta tienen ya su foto en la ficha. Los **19 que siguen sin foto** son:

Condes de Albarei · Pazo Baión · Bot. Ribeiro · A Flor e a Abella · Eduardo Peña · Lagar do Meréns ·
Ramón do Casar · Régoa · La Lume · Manueleira (blanco) · Guitián · Guitián sobre lías ·
Pagos de Galir · Manueleira (tinto) · Castro de Lobarzán · Hito · Carmelo Rodero 9 meses ·
Carmelo Rodero Reserva · Bot. Rioja

Con una foto de cada una, en el mismo sitio y con la misma luz que las demás, quedan las 52.

**Lo que las fotos NO han cambiado.** De las etiquetas se leen añadas, bodegas y crianzas, y
**no se ha copiado ninguna**: la botella fotografiada es la de ese día, y publicar su añada sería
prometer que se sirve esa y no la siguiente. Eso sigue como estaba, pendiente de
`docs/vinos-para-revisar.md`.
