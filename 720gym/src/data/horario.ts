/**
 * HORARIO DE EJEMPLO. No es el real: su formulario de Pilates menciona un horario que aún no
 * tenemos (pedirlo el lunes). La web lo rotula como ejemplo en pantalla hasta cambiarlo aquí.
 */
export const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
export type Dia = (typeof dias)[number];

export const clasesHorario = [
  { id: "reformer", nombre: "Pilates Reformer", color: "#f6a33b", gris: "#ffffff" },
  { id: "mat", nombre: "Pilates Mat", color: "#3fbf9b", gris: "#d9d9db" },
  { id: "hipopresivos", nombre: "Hipopresivos", color: "#9ad8c4", gris: "#b9b9bd" },
  { id: "yoga", nombre: "Yoga", color: "#b7a1e0", gris: "#9d9da2" },
  { id: "crossgym", nombre: "CrossGym", color: "var(--acento)", gris: "#ffffff" },
  { id: "powerlifting", nombre: "Powerlifting", color: "#e6e6e8", gris: "#8c8c90" },
  { id: "acrobacia", nombre: "Acrobacia", color: "#6aa7ff", gris: "#cfcfd2" },
  { id: "capoeira", nombre: "Capoeira", color: "#e8d36a", gris: "#a9a9ad" },
  { id: "bjj", nombre: "BJJ", color: "#ff7a7a", gris: "#77777c" },
] as const;
export type ClaseId = (typeof clasesHorario)[number]["id"];

export interface Sesion {
  dia: Dia;
  hora: string;
  clase: ClaseId;
  duracion: string;
}

const s = (dia: Dia, hora: string, clase: ClaseId, duracion = "50 min"): Sesion => ({ dia, hora, clase, duracion });

export const sesiones: Sesion[] = [
  s("Lunes", "09:30", "reformer"), s("Lunes", "10:30", "mat"), s("Lunes", "17:30", "acrobacia", "1 h"), s("Lunes", "18:30", "reformer"), s("Lunes", "19:00", "crossgym", "1 h"), s("Lunes", "20:00", "yoga", "1 h"), s("Lunes", "20:30", "bjj", "1 h 30"),
  s("Martes", "09:30", "mat"), s("Martes", "10:30", "hipopresivos", "30 min"), s("Martes", "18:00", "capoeira", "1 h"), s("Martes", "19:00", "reformer"), s("Martes", "19:30", "powerlifting", "1 h 30"), s("Martes", "20:00", "mat"),
  s("Miércoles", "09:30", "reformer"), s("Miércoles", "10:30", "mat"), s("Miércoles", "17:30", "acrobacia", "1 h"), s("Miércoles", "18:30", "reformer"), s("Miércoles", "19:00", "crossgym", "1 h"), s("Miércoles", "20:00", "yoga", "1 h"), s("Miércoles", "20:30", "bjj", "1 h 30"),
  s("Jueves", "09:30", "mat"), s("Jueves", "10:30", "hipopresivos", "30 min"), s("Jueves", "18:00", "capoeira", "1 h"), s("Jueves", "19:00", "reformer"), s("Jueves", "19:30", "powerlifting", "1 h 30"), s("Jueves", "20:00", "mat"),
  s("Viernes", "09:30", "reformer"), s("Viernes", "17:30", "acrobacia", "1 h"), s("Viernes", "18:30", "crossgym", "1 h"), s("Viernes", "19:30", "yoga", "1 h"),
  s("Sábado", "10:00", "reformer"), s("Sábado", "11:00", "crossgym", "1 h"), s("Sábado", "11:30", "powerlifting", "2 h"),
  s("Domingo", "10:30", "yoga", "1 h"),
];
