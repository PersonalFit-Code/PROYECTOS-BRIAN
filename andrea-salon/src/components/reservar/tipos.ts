/** Lo que el servidor le pasa al asistente: solo datos públicos del catálogo. */
export interface ServicioPublico {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  duracionMin: number;
  precioCents: number;
  precioDesde: boolean;
  categoriaId: string | null;
}

export interface CategoriaPublica {
  id: string;
  nombre: string;
}

export interface ProfesionalPublica {
  id: string;
  slug: string;
  nombre: string;
  foto: string | null;
  especialidades: string[];
}

export interface CatalogoReserva {
  categorias: CategoriaPublica[];
  servicios: ServicioPublico[];
  equipo: ProfesionalPublica[];
  quienHace: Record<string, string[]>;
  horasCancelacion: number;
  holdMinutos: number;
}

/** Modo "cambiar": la cita que se mueve (sus servicios no cambian). */
export interface CitaACambiar {
  token: string;
  firma: string;
  servicios: string[];
  staffId: string;
  fecha: string;
  hora: string;
}

export interface Hueco {
  inicio: string;
  fin: string;
  staffId: string;
  candidatas: string[];
}

export interface DiaDisponible {
  fecha: string;
  hayHuecos: boolean;
}

/** La respuesta de error de la API: un código que se traduce en `messages.reservar.errores`. */
export interface ErrorApi {
  codigo: string;
  mensaje?: string;
}
