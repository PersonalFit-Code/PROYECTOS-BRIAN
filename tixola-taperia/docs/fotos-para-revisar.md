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

## 1d · «Algo de bacalao»: está puesta en la ajada

Brian mandó la foto sin acordarse del nombre del plato ("van pasando muy rápido"). Está publicada en
**Ajada de bacalao**, porque es lo que se ve y lo que describe la carta: bacalao desmigado con la
ajada por encima —aceite, ajo y pimentón— y su cachelo al lado.

Descartados los otros dos bacalaos de la carta: los **tacos en tempura** van rebozados, y el
**revuelto** lleva huevo, grelos y langostinos. Aun así, **conviene que Tatiana lo confirme de un
vistazo**; moverlo a otro plato es cambiar un id en `dishIds`.

---

## 1e · El pulpo con grelos lleva la foto del pulpo á feira

Lo pidió Brian: la misma foto en las dos entradas de pulpo a la plancha. En **"Pulpo a la gallega o
a la plancha"** es literalmente el plato. En **"Pulpo a la plancha con grelos"** no lo es: ahí el
pulpo va sobre una cama de grelos salteados, y en la foto va sobre cachelos con pimentón.

Se publica igual porque enseña el mismo pulpo y la misma mano, que es lo que se busca en una
tarjeta. Pero **con una foto del plato con grelos, esa manda** — cambiarla es quitar un id de
`dishIds` en `src/data/photos.ts` y poner el nuevo.

Queda sin foto el **salteado de pulpo, salmón y langostinos**: ahí la diferencia ya no es el
acompañamiento, son otros dos ingredientes principales, y esa sí engañaría.

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

---

## 5 · La foto de la fachada (3-10-2026) — recortada, y conviene sustituirla

Al rehacer la galería como mural salió a la luz una cosa que en el carrusel pasaba desapercibida:
**`public/images/fachada.jpg` no era una foto, era una captura de pantalla de un visor de fotos.**
Traía las dos barras blancas del visor (arriba y abajo) y, sobre el muro del portal de al lado, su
botón de cerrar: un círculo blanco con una ×, bien visible. Esa imagen salía en dos sitios de la
web — la galería de la portada y la tarjeta de ubicación (el "ver la fachada" del mapa).

**Qué se ha hecho ya.** Recortarla: 806×490 → 712×454. Se van las barras y el botón, y no se
inventa un solo píxel —no hay retoque ninguno—; lo único que se pierde son unos 90 px del borde
derecho, que eran parte del portal rojo del vecino. El rótulo, los dos toldos y las dos pizarras
quedan enteros.

**Qué hace falta de Brian, y es lo importante.**

1. **Una foto propia de la fachada.** Entre las 104 del 2 de octubre no había ninguna de la calle.
   Con la misma cámara y a la misma hora que las de dentro, de frente y desde la acera de enfrente,
   queda mejor que esta y se acaba el problema.
2. **Saber de dónde salió esta.** Al ser una captura de un visor, lo más probable es que venga de
   una ficha de Google o de una reseña, y entonces la foto no es de la casa: publicarla en la web
   del negocio sería usar una foto ajena. Mientras no se confirme, se queda porque es la única que
   hay de la fachada, pero la sustitución del punto 1 cierra también esto.
3. **El camarero que sale en ella.** Se le reconoce, aunque lleve mascarilla. Si es de la casa,
   basta con que esté de acuerdo; si no, la foto nueva lo resuelve igual.

---

## Timbal vegetal (10-10-2026)

**Qué se ha hecho.** De las dos fotos que mandó Brian se publica la primera, la tomada de lado:
en ella se ven las capas, que es de lo que va un timbal. La segunda es cenital y con el plato ya
empezado (falta una seta y la ensalada está removida), así que se queda fuera. Recortes: 1800×1350
para la carta y la galería, y 1200×1800 para la columna de la ficha, los dos de la foto original
sin retoque de color.

**Qué hace falta de Tatiana: confirmar los ingredientes.** La carta solo dice "verduras montadas
en capas", así que el texto alternativo de la foto (el que leen los buscadores y quien usa lector
de pantalla) describe lo que SE VE: berenjena, calabacín, pimiento asado, base de patata, salsa
blanca y dos láminas de seta de cardo a la plancha. Si alguna no es lo que parece —sobre todo las
setas y la base— se corrige en una línea por idioma.

**Dos cosas más que convendría mirar.**
1. **El alérgeno.** El plato está marcado solo con lácteos, y encaja con la salsa blanca que se ve.
   Si esa base dorada lleva rebozado o si la salsa lleva huevo, faltarían alérgenos.
2. **La foto para la ficha.** Al recortarla en vertical entra la vinoteca del fondo, que queda bien,
   pero si algún día hay una toma de lado con fondo más limpio, mejora.

---

## Fingers de pollo (10-10-2026)

**Qué se ha hecho.** De las dos fotos de Brian se publica la cenital. La otra, en diagonal con la
vinoteca al fondo, tiene en los bordes una taza y otro plato de la mesa de al lado. Recortes:
1800×1350 para la carta y la galería (recorte corto: el plato ovalado no cabe entero en apaisado
sin que los fingers queden diminutos) y 1200×1800 para la ficha, donde sí se ve el plato completo
con su salsa. Sin retoque de color.

**Lo que hay que decidir, y no es cosa mía: la carta se queda corta.** La descripción dice "Tiras de
pollo empanadas y fritas" y en la foto hay dos cosas más que no se nombran:

1. **Un gajo de melocotón marcado a la plancha sobre cada pieza.** Es lo primero que ve el ojo en la
   foto. Si va siempre así, la descripción debería decirlo —vende el plato— y si fue un montaje de
   ese día, igual conviene otra foto. (Que sea melocotón y no mango es lectura mía de la foto:
   confírmalo, porque va en el texto que leen los buscadores.)
2. **Un cuenco de salsa blanca con perejil.** Tampoco se nombra. Y aquí hay algo más serio que el
   texto: **saber qué salsa es, por los alérgenos**. Hoy el plato está marcado con gluten, huevos y
   lácteos; si la salsa lleva mostaza, frutos secos o pescado (una alioli, una tártara…), faltaría
   declararlo.

Mientras no se confirme, la web no dice nada de esto en la descripción del plato: solo el texto
alternativo de la foto describe lo que se ve, que es lo que hay en la imagen.

---

## Tosta de salmón y queso (10-10-2026)

**Qué se ha hecho.** Se publica la cenital. La otra, en diagonal, lleva en el borde derecho el plato
de croquetas de la mesa. **La cenital traía un pie en el borde de abajo** —se tiró de pie sobre la
mesa—, así que los dos recortes van subidos para dejarlo fuera: no se retoca nada, se encuadra.
Recortes: 1800×1350 para la carta y la galería y 1200×1800 para la ficha. Sin retoque de color.

**Lo que hay que mirar: el hilo de salsa oscura.** La descripción dice "Salmón ahumado y queso
cremoso sobre pan tostado" y en la foto hay, además, un hilo de salsa oscura sobre las tostas y
dibujado en el plato. **Si es una reducción de vinagre balsámico o de Pedro Ximénez, lleva sulfitos
y habría que declararlos**: hoy la tosta está marcada con gluten, pescado y lácteos. La tosta de
cebolla, foie y rulo de cabra sí declara sulfitos, así que en la cocina se lleva la cuenta; es
cuestión de confirmar esta.

La ensalada que acompaña tampoco se nombra en la descripción. Eso no es un problema de alérgenos,
pero si va siempre, decirlo ayuda a vender la tosta.

---

## Ensalada de cecina (10-10-2026) — ⚠️ un alérgeno que no estaba declarado

**Lo primero, porque es lo serio: la ensalada lleva NUECES.** Se ven repartidas por todo el plato en
la foto que mandó Brian, y en la carta este plato solo declaraba **lácteos**. He añadido
`frutos-cascara` a la carta en los cuatro idiomas: declarar de más se corrige borrando una palabra;
declarar de menos se lo come alguien con alergia. **Que Tatiana lo confirme**, y de paso:

- ¿El **aliño** lleva mostaza, o un vinagre/reducción con sulfitos? Serían dos alérgenos más.
- ¿Las nueces van **siempre** o eran del día? Si van siempre, conviene nombrarlas en la descripción:
  venden, y además avisan.

Y ya que sale el tema: esta es la cuarta foto seguida en la que el plato trae algo que la carta no
nombra (el melocotón de los fingers, la salsa de los fingers, la salsa oscura de la tosta y ahora
las nueces). **No es casualidad: las descripciones de la carta se escribieron sin tener las fotos
delante.** Cuando Tatiana revise los alérgenos, merece la pena que mire los 47 platos con esta
pregunta: ¿lo que llega a la mesa tiene algo que la descripción no diga?

**Qué se ha hecho con la foto.** Se publica la primera de las dos, la más cercana: en la otra el
cuenco queda pequeño y entran la barra, las botellas y el brazo de un camarero. Recortes: 1800×1350
para la carta y la galería y 1200×1716 para la ficha, los dos encuadrados sobre el cuenco. Sin
retoque de color.
