/** Días ISO (1 = lunes … 7 = domingo), como `staff_hours.weekday`. Módulo neutro: lo usan cliente y servidor. */
export const NOMBRES_DIA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const DIAS_ISO = NOMBRES_DIA.map((nombre, i) => ({ clave: String(i + 1), nombre }));
