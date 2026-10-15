# Guía para las fotos de plato — Tixola

> **Actualizada el 10-10-2026.** De los 47 platos de la carta: **25 ya tienen foto**, **7 no la
> necesitan** y **quedan 15 por tirar**. Comprobado contra `src/data/menu.ts` y `src/data/photos.ts`,
> no a ojo.
>
> **Hechas el 10-10-2026:** timbal vegetal, fingers de pollo, tosta de salmón y queso y
> ensalada de cecina.
>
> **Los 7 que ya no cuentan**, por decisión de la casa: las cuatro tablas de embutidos y quesos
> (jamón serrano, queso del país, queso de oveja, queso de cabra) y, de varios, el postre sin gluten,
> la ración de pan y la de pan con tomate. El nombre ya dice lo que llega a la mesa, así que en la
> web esos platos se quedan solo con nombre, descripción y precio, sin el disco del icono: ya no es
> un hueco esperando foto. Del resto de varios se deja el postre del día con foto, de muestra. En el
> código es el campo `noPhotoNeeded` de `menu.ts`.
>
> La numeración de abajo NO se renumera a propósito: así se sigue sabiendo de qué foto hablábamos en
> cada conversación.

---

## Lo primero: qué platos, y en qué orden

Por categoría, con el precio al lado (lo que más vende primero dentro de cada una). Los que ya
estaban en la ronda anterior y siguen sin foto llevan una ⚠️.

### Tostas — 1 de 3

1. **Tosta de crema de cebolla, foie y rulo de cabra** (7,50 €)
2. **Tosta de trigueros, jamón y huevo de codorniz** (7,20 €)
3. ~~**Tosta de salmón y queso** (6,80 €)~~ — ✅ **hecha** (10-10-2026). Ojo: lleva un hilo de salsa
   oscura que la carta no nombra y que, si es reducción, llevaría sulfitos; ver
   `docs/fotos-para-revisar.md`.

### Embutidos y quesos — ~~0 de 4~~ · ya no hacen falta (10-10-2026)

~~4. Jamón serrano · 5. Queso de cabra · 6. Queso de oveja · 7. Queso del país~~ — la categoría
entera sale de la lista: un jamón serrano y tres quesos no necesitan que se los enseñemos.

### Pulpo — 1 de 4

8. **Salteado de pulpo, salmón y langostinos** (20,50 €) — el plato más caro de toda la carta sin
   foto. Si solo da tiempo a una de esta lista, esta.

### Especiales — 3 de 7 ⚠️

9. **Zamburiñas rellenas** (19,00 €) — ya estaba en la lista anterior. Tenemos la de plancha, no la
   de rellenas, y son platos distintos.
10. **Brocheta XXL** (13,90 €)
11. ~~**Timbal vegetal** (9,50 €)~~ — ✅ **hecha** (10-10-2026). De lado, no cenital: es un plato
    de capas y desde arriba no se entiende.
12. **Oreja a la plancha** (8,20 €) ⚠️

### Ensaladas — 4 de 5

13. ~~**Ensalada de cecina con helado de queso de oveja** (17,80 €)~~ — ✅ **hecha** (10-10-2026).
    La foto destapó que la ensalada lleva **nueces** y la carta no las declaraba; ver
    `docs/fotos-para-revisar.md`.
14. **Ensalada de ventresca** (13,90 €)

### Revueltos — 1 de 3

15. **Revuelto de algas y langostinos** (12,80 €)
16. **Revuelto de setas y oreja** (12,50 €)

### Cocina — 7 de 12

17. **Tacos de bacalao en tempura con pimientos** (15,60 €) — ya estaba en la lista anterior.
18. **Tortilla guisada con champiñones** (11,90 €)
19. **Salteado de verdura, arroz y setas** (11,50 €)
20. **Pastel de cabracho** (10,00 €) ⚠️
21. ~~**Fingers de pollo** (7,90 €)~~ — ✅ **hecha** (10-10-2026). Ojo: en la foto llevan melocotón
    a la plancha y una salsa que la carta no nombra; ver `docs/fotos-para-revisar.md`.

### Tixolas — 3 de 5

22. **Tixola de piquillos caramelizados y panceta** (12,50 €)
23. **Tixola de pisto de verduras** (11,50 €)

### Varios — 1 de 4 · los tres que faltaban ya no hacen falta (10-10-2026)

Queda el **postre del día**, que ya tiene foto y sirve de muestra de por dónde van los del día.

~~24. Postre sin gluten · 25. Ración de pan con tomate · 26. Ración de pan~~ — fuera de la lista.

### Y una que no es de plato, pero sigue siendo la más importante

**Las dos caras de la carta de papel, de cerca y enfocadas, sobre todo la columna de los alérgenos.**
Esto llevaba pendiente desde la ronda anterior y sigue pendiente: la que hay
(`public/images/carta-fisica.png`) es un sello de 336 px, ilegible. Con una foto buena se dejan de
**deducir** alérgenos de la receta y se publican los de verdad. Es lo único que falta para que las
tres páginas legales dejen de llevar el aviso de "faltan datos" y entren en el buscador.

---

## Cómo tirarlas

**Luz.** Junto a la ventana, con el plato entre tú y la luz o con la luz de lado. **Flash nunca**:
aplasta la comida, quema el queso fundido y saca el reflejo del plato. Si es de noche, apaga la luz
amarilla de encima y usa la de otra mesa lateral.

**Ángulo. CAMBIO DE CRITERIO (15-10-2026): manda el lado.** Tatiana lo dijo mirando la foto del
bacalao en tempura: «casi mejor de lado que desde arriba». Así que de ahora en adelante:
- **A 45° o de lado** por defecto, para casi todo: enseña el volumen, el crujiente y el corte, que
  es lo que da hambre. Obligado en lo que tiene altura (tostas, brocheta, timbal, pan) y en las
  frituras (tempura, croquetas, calamares).
- **Cenital (desde arriba, en vertical)** solo para lo que de verdad se lee «en planta» y desde el
  lado no se entiende: una tixola, una ensalada abierta, el pulpo á feira.

> Las 25 fotos que ya están hechas son cenitales y **se quedan**: rehacerlas es una tarde entera y
> funcionan. Esto vale para las 15 que faltan. La única que sí conviene repetir es la del **bacalao
> en tempura**, porque lo pidió ella por su nombre.

**Fondo.** La mesa de piedra del local va perfecta. Aparta lo que no sea del plato: servilletas
arrugadas, el móvil, el datáfono, un vaso a medias. Una copa o un trozo de pan **puestos a propósito**
sí ayudan.

**Encuadre.** Deja aire alrededor del plato, sobre todo arriba y abajo. La web recorta la foto a
varios formatos (cuadrado, 4:3, vertical en móvil) y si viene justa, se come el plato. **Mejor
alejarse un paso de más que de menos.**

**Cuándo.** Recién sacado de cocina. El queso fundido dura un minuto; la patata frita, dos.

**Cuántas.** Tres o cuatro de cada plato, moviéndote un poco entre ellas. Es gratis y desde aquí
elijo la buena.

---

## Lo técnico, en cuatro líneas

- Con el **móvil basta**. Cámara normal, sin modo retrato (desenfoca de mentira y se nota).
- **Limpia la lente** con la camiseta antes de empezar. Es el 90 % de las fotos borrosas.
- **No uses zoom**: acércate tú. El zoom del móvil es recorte, y pierdes resolución justo donde hace
  falta.
- Mándalas **como archivo o por Drive, no por WhatsApp normal**. WhatsApp las comprime a la mitad y
  luego se ve. Si va por WhatsApp, usa «Documento» en vez de «Galería».

---

## Lo que NO hace falta

- No hace falta que estén todos los platos: la web funciona igual con el dibujo y se le van añadiendo
  fotos cuando lleguen.
- No hace falta editarlas ni ponerles filtro. Los ajustes los hago yo, y desde el original salen
  mejor.
- No hace falta que salgan personas. Si sale una mano sirviendo, mejor que mejor, pero que no se
  reconozca a ningún cliente.

---

## Qué pasa después

Cada foto que llegue es una línea en el manifiesto de fotos y otra en la carta. El carrusel de platos
estrella de la portada ya tiene tres fotos de verdad (zamburiñas, raxo con Arzúa y croquetas de
grelos); con un par más de estos 15 puede crecer a cuatro o cinco sin que se note el hueco. La
galería del final de la portada ya enseña las 30 que hay hoy, con filtro por tema — cuantas más
lleguen, más grande se ve.
