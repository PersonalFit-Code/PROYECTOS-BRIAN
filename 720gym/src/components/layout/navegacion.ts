import { conceptos } from "@/data/conceptos";

export const enlacesConceptos = conceptos.map((c) => ({ href: c.href, nombre: c.nombre, marca: c.marca, lineas: c.lineas, logo: c.logo }));

export const navegacion = [
  { href: "/#clubes", nombre: "Clubes asociados" },
  { href: "/horario", nombre: "Horarios" },
  { href: "/club", nombre: "El club" },
  { href: "/contacto", nombre: "Contacto" },
];

