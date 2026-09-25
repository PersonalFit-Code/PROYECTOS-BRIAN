/**
 * Compatibilidad con la iteración 1.
 *
 * El carrusel de opiniones fue sustituido por las columnas en marquee de `ReviewMarquee`
 * (cliente: "muy básico; quiero un buen carrusel; reseñas reales; mejor las de 5 estrellas").
 * Este módulo solo conserva las piezas compartidas que otros módulos (Footer) importaban de aquí.
 *
 * Código nuevo: importa directamente desde "@/components/ui/ReviewCard". Cuando Footer haya
 * migrado su import, este fichero puede borrarse.
 */
export { PlatformGlyph, Stars, formatReviewDate, type ReviewSource } from "@/components/ui/ReviewCard";
