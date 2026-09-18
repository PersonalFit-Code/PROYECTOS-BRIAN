# Bin & Cami Cakes · Brief de marca

Extraído del flyer impreso (foto) y contrastado con el `index.html` recibido.
Base para construir la web. Ourense.

---

## 1. Datos del negocio (NAP)

| Campo | Valor | Fuente |
|---|---|---|
| Nombre | Bin & Cami Cakes | flyer |
| Dirección | Rúa do Progreso 27, bajo 3 · Jardín do Posío, Ourense | flyer |
| Código postal | **32005 — por confirmar** | solo en el HTML, no aparece en el flyer |
| WhatsApp / teléfono | 656 584 027 → `+34656584027` | flyer |
| Instagram | @bin_camicakes | flyer |
| Horario | **por confirmar** | el flyer no lo indica |

El HTML declara martes a sábado, 10:00–20:00. No está en el flyer: hay que
confirmarlo con ellas antes de publicarlo, porque un horario erróneo en el
Schema y en Google Business genera llamadas a puerta cerrada.

---

## 2. Textos literales del flyer

Sirven tal cual para la web: son la voz real de la marca, mejor que cualquier
copy inventado.

- **Se realizan TARTAS Personalizadas** (titular)
- **Tú imaginas, nosotros lo hacemos** ← el mejor candidato a subtítulo del hero
- **La vida es más dulce con tartas**
- **Diseños únicos para momentos inolvidables**
- **Cuéntanos tu idea** ← CTA natural, ya es su forma de pedir contacto
- **Te esperamos**
- «Feliz Cumpleaños» (rótulo decorativo sobre una tarta)

La franja del pie del flyer queda cortada en la foto y no se puede leer.

### Categorías de servicio (iconos del flyer)

Cumpleaños · Bodas · Eventos especiales · Temáticas

### Especialidades (del HTML recibido, origen Instagram/Threads)

Memory Cakes · Cookies estilo NY y Crumbl · Postres tradicionales y venezolanos
· Mesas de dulces · Tartas con figuras en movimiento y luces

**Por confirmar con el negocio.** No están en el flyer y proceden de fuentes de
terceros; si alguna ya no se ofrece, sobra en la web.

---

## 3. Paleta

Tonos medidos sobre el flyer con corrección de balance de blancos. Saturación y
luminosidad reconstruidas a valores de imprenta (ver aviso en §5).

```css
:root{
  --frambuesa: #C13355;  /* titular, CTA principal      · 5,22:1 sobre crema */
  --rosa:      #E28399;  /* corazones, acentos, hover   · solo fondo         */
  --rosa-palo: #F8E2EA;  /* pastillas de servicio       · solo fondo         */
  --lila:      #DFC3D4;  /* badge festoneado, bloques   · solo fondo         */
  --oro:       #B17743;  /* scripts dorados, "Cakes"    · solo texto grande  */
  --tinta:     #39332D;  /* texto corrido               · 11,98:1            */
  --crema:     #FDFAF7;  /* fondo de página                                  */
}
```

Contraste comprobado: texto blanco sobre frambuesa 5,42:1 · tinta sobre
rosa-palo 10,12:1 · tinta sobre lila 7,65:1. Todo AA.
El oro se queda en 3,61:1 sobre crema: vale para titulares grandes y adornos,
no para texto pequeño.

## 4. Identidad visual

- **Logo**: cupcake kawaii con cara, guinda arriba, en pegatina con borde blanco.
  Lettering «Bin & Cami» en script rosa oscuro y «Cakes» en dorado.
- **Estilo**: pegatina — cada elemento lleva contorno blanco grueso y sombra
  suave. Es el rasgo más reconocible del flyer y conviene llevarlo a la web en
  las tarjetas y el logo.
- **Tipografía del flyer**: manuscrita redondeada para los textos y una display
  muy gruesa con relieve para «TARTAS». El `index.html` usa Playfair Display,
  que es elegante pero **no se parece**: Playfair es una serif de revista, el
  flyer es dulce y manuscrito. Alternativas más fieles en Google Fonts:
  *Baloo 2*, *Fredoka* o *Quicksand* para titulares, con *Plus Jakarta Sans*
  para el texto corrido.
- **Corazones** como elemento decorativo recurrente, en contorno.

## 5. Aviso sobre los colores

Los tonos (grados de matiz) son fiables: 346° en los rosas fuertes, 324–339° en
los rosas claros y lilas, 28° en el dorado. Sobreviven a la mala iluminación.

La saturación y la luminosidad **no** se pueden medir en esta foto: está tomada
con poca luz y dominante verdosa, y el papel impreso ya desvía respecto al
archivo original. Los hex de §3 son una reconstrucción coherente, no una medida.

Para clavarlos hace falta **el archivo digital original del flyer** (Canva, PDF
o PNG) o **el logo en vectorial**. Con eso los saco exactos en un minuto.

## 6. Pendiente antes de construir

- [ ] Fotos reales de sus tartas (las del HTML actual son de banco de imágenes)
- [ ] Logo en PNG con transparencia o SVG
- [ ] Horario confirmado
- [ ] Código postal confirmado
- [ ] Reseñas reales copiadas de su perfil de Google
- [ ] Confirmar qué especialidades siguen ofreciendo
- [ ] ¿Tienen dominio contratado? El HTML apunta a bincamicakesourense.com
