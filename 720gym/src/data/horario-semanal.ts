/**
 * Horario semanal real del curso 2026-27 (PDF «HorarioGeneral_720_Gym_Club_2026-27» y fichas).
 * Cada sesión apunta a su actividad por `slug`; el nombre, el color y el logo salen de la ficha.
 * Pilates no trae hora de fin en el PDF. CrossGym de mañana son dos turnos entre las 09:00 y las 11:00.
 */
export const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
export type DiaSemana = (typeof diasSemana)[number];

export interface SesionSemana {
  dia: DiaSemana;
  inicio: string;
  fin?: string;
  slug: string;
  detalle?: string;
}

const L = "Lunes", M = "Martes", X = "Miércoles", J = "Jueves", V = "Viernes", S = "Sábado";
const varias = (dias: DiaSemana[], horas: (string | [string, string])[], slug: string, detalle?: string): SesionSemana[] =>
  dias.flatMap((dia) => horas.map((h) => (typeof h === "string" ? { dia, inicio: h, slug, detalle } : { dia, inicio: h[0], fin: h[1], slug, detalle })));

export const sesionesSemana: SesionSemana[] = [
  // 720 Pilates
  ...varias([M, J], ["09:00", "10:00", "17:00", "18:00", "19:00", "20:00"], "pilates"),
  ...varias([X], ["10:00", "18:00", "19:00", "20:00", "21:00"], "pilates"),
  ...varias([L], ["17:00", "18:00", "19:00", "20:00", "21:00"], "pilates"),
  // 720 Hipopresivos
  ...varias([M, J], [["16:30", "17:00"]], "hipopresivos"),
  // 720 Yoga
  ...varias([L, X], [["10:00", "11:00"], ["20:00", "21:00"]], "yoga"),
  // CrossGym
  ...varias([L, X, J], [["09:00", "11:00"]], "crossgym", "Dos turnos"),
  ...varias([L, X, J], [["16:30", "17:30"], ["17:30", "18:30"], ["18:30", "19:30"], ["19:30", "20:30"]], "crossgym"),
  // Brazilian Jiu-Jitsu
  ...varias([L], [["17:00", "18:00"]], "brazilian-jiu-jitsu", "Infantil · 4–12 años"),
  ...varias([M, J], [["17:00", "18:00"]], "brazilian-jiu-jitsu", "Infantil · 4–6 años"),
  ...varias([M, J], [["18:00", "19:00"]], "brazilian-jiu-jitsu", "Infantil · 6–12 años"),
  ...varias([L], [["18:00", "19:45"]], "brazilian-jiu-jitsu", "Adultos +16"),
  ...varias([M, J], [["10:30", "12:15"]], "brazilian-jiu-jitsu", "Adultos +16"),
  ...varias([X, V], [["19:15", "21:00"]], "brazilian-jiu-jitsu", "Adultos +16"),
  ...varias([S], [["11:30", "13:15"]], "brazilian-jiu-jitsu", "Adultos +16"),
  // Krav Maga
  ...varias([S], [["09:00", "10:30"]], "krav-maga", "Civil · Iniciación"),
  ...varias([S], [["10:30", "12:00"]], "krav-maga", "Operativo"),
  // Capoeira
  ...varias([L, J], [["19:30", "21:00"]], "capoeira", "Adolescentes y adultos"),
  ...varias([M], [["20:00", "21:30"]], "capoeira", "Adolescentes y adultos"),
  ...varias([X, V], [["10:00", "11:30"]], "capoeira", "Adolescentes y adultos"),
  // Gimnasia acrobática
  ...varias([L, J], [["17:00", "18:00"]], "gimnasia-acrobatica", "Psicomotricidad · 3 a 5 años"),
  ...varias([M], [["16:30", "18:30"]], "gimnasia-acrobatica", "Competición"),
  ...varias([X, V], [["16:30", "20:00"]], "gimnasia-acrobatica", "Competición"),
  ...varias([M, J], [["18:30", "19:30"]], "gimnasia-acrobatica", "Escuela de iniciación"),
  ...varias([L], [["18:30", "20:00"]], "gimnasia-acrobatica", "Acrobacia +12 años"),
  ...varias([L], [["21:00", "22:00"]], "gimnasia-acrobatica", "Adultos +18"),
  ...varias([M], [["19:30", "20:30"]], "gimnasia-acrobatica", "Adultos +18"),
];
