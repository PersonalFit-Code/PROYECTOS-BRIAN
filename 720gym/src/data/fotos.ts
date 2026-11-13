/**
 * Fotos reales de 720 (su Instagram / Google). Para la demo; para publicar, permiso y originales en
 * alta calidad. Las originales medían 680 px; están reescaladas con IA (EDSR ×4): 1200 px las
 * normales y 1920 px las «-grande» de los fondos.
 */
export const fotos = {
  sala: { src: "/fotos/sala-general.webp", grande: "/fotos/sala-general-grande.webp", alt: "Sala de 720 GYM: racks, máquinas rojas y suelo negro" },
  racks: { src: "/fotos/zona-racks.webp", grande: "/fotos/zona-racks-grande.webp", alt: "Zona de racks y peso libre con discos de colores" },
  funcional: { src: "/fotos/zona-funcional.webp", grande: "/fotos/zona-funcional-grande.webp", alt: "Zona funcional con cuerda, kettlebells, césped y tapiz rojo" },
  maquinas: { src: "/fotos/maquinas-guiadas.webp", grande: "/fotos/maquinas-guiadas-grande.webp", alt: "Máquinas guiadas y multiestación en rojo y negro" },
  /* Generadas con IA (ilustrativas, para la maqueta): fondos y detalles, no la sala real. */
  iaDiscos: { src: "/fotos/ia-discos.webp", grande: "/fotos/ia-discos.webp", alt: "Discos de colores en un soporte" },
  iaBarra: { src: "/fotos/ia-barra.webp", grande: "/fotos/ia-barra.webp", alt: "Barra con discos en un rack y mancuernas rojas al fondo" },
  entrada: { src: "/fotos/entrada-720gym.webp", grande: "/fotos/entrada-720gym.webp", alt: "Rótulo 720GYM sobre la puerta de la sala de peso libre" },
  pista: { src: "/fotos/pista-funcional.webp", grande: "/fotos/pista-funcional-grande.webp", alt: "Pista de tartán rojo y césped con el logo 720 GYM CLUB en la pared y la zona de 720 Pilates al fondo" },
} as const;
