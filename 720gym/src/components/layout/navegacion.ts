import { conceptos } from "@/data/conceptos";

export const enlacesConceptos = conceptos.map((c) => ({ href: c.href, nombre: c.nombre, marca: c.marca, lineas: c.lineas }));

export const navegacion = [
  { href: "/#horario", nombre: "Horario" },
  { href: "/#tarifas", nombre: "Tarifas" },
  { href: "/#club", nombre: "El club" },
  { href: "/#contacto", nombre: "Contacto" },
];

export const enlacePrueba = "/?tipo=prueba#apuntate";
