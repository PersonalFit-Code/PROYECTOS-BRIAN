import "server-only";

import type { CatalogoReserva } from "@/components/reservar/tipos";
import { getAjustes } from "./ajustes";
import { getCatalogoFresco } from "./catalogo";

/**
 * El catálogo tal como lo necesita el asistente (solo lo reservable online y nada interno). Si la
 * base de datos no responde devuelve null y la página enseña el teléfono: la reserva cae, la web no.
 */
export async function catalogoReserva(): Promise<CatalogoReserva | null> {
  try {
    const [c, ajustes] = await Promise.all([getCatalogoFresco(), getAjustes()]);
    const reservables = c.servicios.filter((s) => s.bookable_online && (c.quienHace[s.id]?.length ?? 0) > 0);
    return {
      categorias: c.categorias.map((cat) => ({ id: cat.id, nombre: cat.name })),
      servicios: reservables.map((s) => ({
        id: s.id,
        slug: s.slug,
        nombre: s.name,
        descripcion: s.description,
        duracionMin: s.duration_min,
        precioCents: s.price_cents,
        precioDesde: s.price_is_from,
        categoriaId: s.category_id,
      })),
      equipo: c.equipo
        .filter((p) => p.bookable_online)
        .map((p) => ({ id: p.id, slug: p.slug, nombre: p.name, foto: p.photo_path, especialidades: p.specialties })),
      quienHace: c.quienHace,
      horasCancelacion: ajustes.cancelHours,
      holdMinutos: ajustes.holdMinutes,
    };
  } catch (e) {
    console.error("[reservar] catálogo:", e);
    return null;
  }
}
