/**
 * La zona del salón para todo lo que se teclea en esta sección. Es la misma que `settings.timezone`
 * por defecto; si algún día el salón se mudara de zona habría que leerla de ahí.
 */
export const ZONA = "Europe/Madrid";

/** Claves de `settings.salon_hours`, en el orden en que se enseñan. */
export const DIAS_SALON = [
  { clave: "mon", nombre: "Lunes" },
  { clave: "tue", nombre: "Martes" },
  { clave: "wed", nombre: "Miércoles" },
  { clave: "thu", nombre: "Jueves" },
  { clave: "fri", nombre: "Viernes" },
  { clave: "sat", nombre: "Sábado" },
  { clave: "sun", nombre: "Domingo" },
] as const;

export const PASOS_HUECO = [5, 10, 15, 20, 30, 60] as const;
