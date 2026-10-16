/** Etiquetas calculadas en `v_clients` al leer (no se guardan): así nunca están desfasadas. */
export const ETIQUETAS: Record<string, { texto: string; clase: string; ayuda: string }> = {
  nueva: { texto: "Nueva", clase: "bg-sky-50 text-sky-800", ayuda: "Primera visita en los últimos 60 días" },
  vip: { texto: "VIP", clase: "bg-rosa-niebla text-carmin", ayuda: "Muchas visitas en el último año" },
  en_riesgo: { texto: "En riesgo", clase: "bg-amber-50 text-amber-800", ayuda: "Tarda más de lo normal en volver" },
  dormida: { texto: "Dormida", clase: "bg-zinc-100 text-zinc-700", ayuda: "Hace mucho que no viene" },
};
