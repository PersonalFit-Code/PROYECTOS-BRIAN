/**
 * Fotos reales de 720. Las de la carpeta de Drive «720 brais» (23/11/2026) son originales en alta
 * calidad (1600 px): máquinas, racks, zona funcional, entrada, pista en vertical, Pilates y
 * vestuarios. «sala» y «pista» (horizontal) siguen siendo las de Instagram reescaladas con IA.
 */
export const fotos = {
  sala: { src: "/fotos/sala-general.webp", grande: "/fotos/sala-general-grande.webp", alt: "Sala de 720 GYM: racks, máquinas rojas y suelo negro" },
  racks: { src: "/fotos/zona-racks.webp", grande: "/fotos/zona-racks-grande.webp", alt: "Zona de racks y peso libre con discos de colores" },
  funcional: { src: "/fotos/zona-funcional.webp", grande: "/fotos/zona-funcional-grande.webp", alt: "Zona funcional con cuerda, kettlebells, césped y tapiz rojo" },
  maquinas: { src: "/fotos/maquinas-guiadas.webp", grande: "/fotos/maquinas-guiadas-grande.webp", alt: "Máquinas guiadas y multiestación en rojo y negro" },
  /* Generadas con IA (ilustrativas): fondos y detalles, no la sala real. */
  iaDiscos: { src: "/fotos/ia-discos.webp", grande: "/fotos/ia-discos.webp", alt: "Discos de colores en un soporte" },
  iaBarra: { src: "/fotos/ia-barra.webp", grande: "/fotos/ia-barra.webp", alt: "Barra con discos en un rack y mancuernas rojas al fondo" },
  entrada: { src: "/fotos/entrada-720gym.webp", grande: "/fotos/entrada-720gym-grande.webp", alt: "Rótulo 720GYM sobre la puerta de la sala de peso libre" },
  pista: { src: "/fotos/pista-funcional.webp", grande: "/fotos/pista-funcional-grande.webp", alt: "Pista de tartán rojo y césped con el logo 720 GYM CLUB en la pared y la zona de 720 Pilates al fondo" },
  pistaVertical: { src: "/fotos/pista-vertical.webp", grande: "/fotos/pista-vertical-grande.webp", alt: "Pista de tartán rojo y césped con el logo 720 GYM CLUB en la pared" },
  pistaPilates: { src: "/fotos/pista-pilates.webp", grande: "/fotos/pista-pilates-grande.webp", alt: "Pista con el rótulo de 720 Pilates, el tatami azul y la bandera de Capoeira" },
  pilatesReformer: { src: "/fotos/pilates-reformer.webp", grande: "/fotos/pilates-reformer-grande.webp", alt: "Sala de 720 Pilates con las máquinas Reformer de madera" },
  pilatesWallUnit: { src: "/fotos/pilates-wall-unit.webp", grande: "/fotos/pilates-wall-unit-grande.webp", alt: "Sala de Pilates Mat y Wall Unit con colchonetas y unidades de pared" },
  vestuarioBancos: { src: "/fotos/vestuario-bancos.webp", grande: "/fotos/vestuario-bancos-grande.webp", alt: "Vestuario con bancos, percheros y duchas al fondo" },
  vestuarioLavabos: { src: "/fotos/vestuario-lavabos.webp", grande: "/fotos/vestuario-lavabos-grande.webp", alt: "Vestuario con lavabos, espejo y cabinas" },
  vestuarioCabinas: { src: "/fotos/vestuario-cabinas.webp", grande: "/fotos/vestuario-cabinas-grande.webp", alt: "Cabinas del vestuario" },
  vestuarioDuchas: { src: "/fotos/vestuario-duchas.webp", grande: "/fotos/vestuario-duchas-grande.webp", alt: "Duchas del vestuario" },
  vestuarioPuerta: { src: "/fotos/vestuario-puerta.webp", grande: "/fotos/vestuario-puerta-grande.webp", alt: "Puerta del vestuario de hombres" },
  /* Fotos del 23/11/2026 (segunda tanda de Drive): clases de Pilates y competiciones de 720 Powerlifting. */
  pilatesClaseReformer: { src: "/fotos/pilates-clase-reformer.webp", grande: "/fotos/pilates-clase-reformer-grande.webp", alt: "Clase de Pilates Reformer en 720 Pilates" },
  pilatesClaseWallUnit: { src: "/fotos/pilates-clase-wall-unit.webp", grande: "/fotos/pilates-clase-wall-unit-grande.webp", alt: "Clase de Pilates en la Wall Unit" },
  pilatesClaseFitball: { src: "/fotos/pilates-clase-fitball.webp", grande: "/fotos/pilates-clase-fitball-grande.webp", alt: "Clase de Pilates Mat con fitball" },
  powerPortada: { src: "/fotos/powerlifting-portada.webp", grande: "/fotos/powerlifting-sentadilla-grande.webp", alt: "Levantador de 720 Powerlifting con la barra en la espalda en una competición" },
  powerSentadilla: { src: "/fotos/powerlifting-sentadilla.webp", grande: "/fotos/powerlifting-sentadilla-grande.webp", alt: "Levantador de 720 Powerlifting preparando una sentadilla en competición", vertical: true },
  powerPesoMuerto: { src: "/fotos/powerlifting-peso-muerto.webp", grande: "/fotos/powerlifting-peso-muerto-grande.webp", alt: "Levantador de 720 Powerlifting antes de un peso muerto en competición", vertical: true },
  powerSeleccion: { src: "/fotos/powerlifting-seleccion.webp", grande: "/fotos/powerlifting-seleccion-grande.webp", alt: "Levantadora con el equipaje de España celebrando una sentadilla en competición", vertical: true },
} as const;
