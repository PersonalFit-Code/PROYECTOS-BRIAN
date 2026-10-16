/**
 * Forma de un servicio tal y como lo consumen los componentes públicos (`ServiciosLista`,
 * la portada). Es la PROYECCIÓN de la tabla `services` de la base de datos (fase 1b):
 * los componentes solo saben de esto, no de Supabase, así que hoy se alimentan del fixture y mañana
 * de la consulta sin cambiar una línea de UI.
 */
export type CategoriaServicio = "manos" | "pies" | "mirada";

export interface Servicio {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaServicio;
  /** Duración en minutos (sin el margen de limpieza, que es interno). */
  duracionMin: number;
  /** Precio en CÉNTIMOS (como en la DB). `null` = precio solo en el salón. */
  precioCents: number | null;
  /** `true` = el precio es «desde»: depende del trabajo. */
  precioDesde: boolean;
  /** `false` = se pide en el salón, no entra en la reserva online. */
  reservableOnline: boolean;
  /** Destacado en la portada. */
  destacado: boolean;
  /** Dato sin confirmar con Andrea (precio, duración o nombre): la UI lo marca. */
  pendiente: boolean;
}
