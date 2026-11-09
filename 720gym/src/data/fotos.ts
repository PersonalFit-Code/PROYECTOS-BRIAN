/**
 * Fotos reales de 720 (su Instagram / Google). Para la demo; para publicar, permiso y originales en
 * alta calidad (estas miden 680 px: las «-grande» son ampliadas con enfoque para los fondos).
 */
export const fotos = {
  sala: { src: "/fotos/sala-general.webp", grande: "/fotos/sala-general-grande.webp", alt: "Sala de 720 GYM: racks, máquinas rojas y suelo negro" },
  racks: { src: "/fotos/zona-racks.webp", grande: "/fotos/zona-racks-grande.webp", alt: "Zona de racks y peso libre con discos de colores" },
  funcional: { src: "/fotos/zona-funcional.webp", grande: "/fotos/zona-funcional-grande.webp", alt: "Zona funcional con cuerda, kettlebells, césped y tapiz rojo" },
  maquinas: { src: "/fotos/maquinas-guiadas.webp", grande: "/fotos/maquinas-guiadas-grande.webp", alt: "Máquinas guiadas y multiestación en rojo y negro" },
  entrada: { src: "/fotos/entrada-720gym.webp", grande: "/fotos/entrada-720gym.webp", alt: "Rótulo 720GYM sobre la puerta de la sala" },
} as const;
