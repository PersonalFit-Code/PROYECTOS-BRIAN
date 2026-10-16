// FIXTURE: hasta conectar la DB (fase 1b)
/**
 * Datos de EJEMPLO del catálogo y del equipo para poder maquetar la web pública antes de que
 * exista la base de datos. En la fase 1b `servicios/page.tsx` y `equipo/page.tsx` pasan a leer de
 * Supabase (tablas `services` y `staff`, caché con tag `catalogo`) y este fichero se borra.
 *
 * Lo que se sabe de verdad (web antigua de Elitek, 15/10/2026): manicura completa 25 €, pedicura
 * completa 25 €, manicura personalizada 57 €. El resto de servicios están citados en esa web sin
 * precio. TODO va marcado `pendiente: true`: nada de esto lo ha confirmado Andrea, y la UI lo dice.
 * Las duraciones son estimaciones razonables de salón para que la agenda de pruebas tenga algo con
 * lo que calcular huecos; no se publican como ciertas.
 */
import type { Servicio } from "@/components/servicios/types";
import type { Profesional } from "@/components/equipo/types";

const PLACEHOLDER = "/images/placeholder.svg";

export const SERVICIOS_FIXTURE: readonly Servicio[] = [
  {
    id: "svc-manicura-completa",
    slug: "manicura-completa",
    nombre: "Manicura completa",
    descripcion: "Limado, cutícula, hidratación y esmaltado semipermanente. La de siempre, bien hecha.",
    categoria: "manos",
    duracionMin: 60,
    precioCents: 2500,
    precioDesde: false,
    reservableOnline: true,
    destacado: true,
    pendiente: true,
  },
  {
    id: "svc-manicura-rusa",
    slug: "manicura-rusa",
    nombre: "Manicura rusa",
    descripcion: "Trabajo de cutícula con torno y esmaltado al ras: dura más y crece limpia. Nuestra especialidad.",
    categoria: "manos",
    duracionMin: 75,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: true,
    pendiente: true,
  },
  {
    id: "svc-manicura-personalizada",
    slug: "manicura-personalizada",
    nombre: "Manicura personalizada",
    descripcion: "Manicura completa con diseño a tu gusto: nail art, francesas, efectos y detalles pintados a mano.",
    categoria: "manos",
    duracionMin: 90,
    precioCents: 5700,
    precioDesde: false,
    reservableOnline: true,
    destacado: true,
    pendiente: true,
  },
  {
    id: "svc-nivelacion",
    slug: "nivelacion",
    nombre: "Nivelación",
    descripcion: "Refuerzo con base de construcción para uñas débiles o que se rompen. Acabado natural.",
    categoria: "manos",
    duracionMin: 75,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: false,
    pendiente: true,
  },
  {
    id: "svc-gel-acrylgel",
    slug: "gel-acrylgel",
    nombre: "Uñas de gel y acrylgel",
    descripcion: "Extensión o refuerzo en gel o acrylgel, con la forma y el largo que quieras.",
    categoria: "manos",
    duracionMin: 120,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: true,
    pendiente: true,
  },
  {
    id: "svc-nail-art",
    slug: "nail-art",
    nombre: "Nail art",
    descripcion: "Diseños pintados a mano, pedrería, efectos y combinaciones. Se añade a cualquier manicura.",
    categoria: "manos",
    duracionMin: 30,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: true,
    pendiente: true,
  },
  {
    id: "svc-pedicura-completa",
    slug: "pedicura-completa",
    nombre: "Pedicura completa",
    descripcion: "Pies cuidados de arriba abajo: durezas, cutícula, hidratación y esmaltado semipermanente.",
    categoria: "pies",
    duracionMin: 60,
    precioCents: 2500,
    precioDesde: false,
    reservableOnline: true,
    destacado: true,
    pendiente: true,
  },
  {
    id: "svc-diseno-cejas",
    slug: "diseno-cejas",
    nombre: "Diseño de cejas",
    descripcion: "Estudiamos tu rostro y perfilamos la ceja que te va. Con depilación y, si quieres, tinte.",
    categoria: "mirada",
    duracionMin: 30,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: false,
    pendiente: true,
  },
  {
    id: "svc-laminado-cejas",
    slug: "laminado-cejas",
    nombre: "Laminado de cejas",
    descripcion: "Pelo a pelo en su sitio durante semanas, con efecto peinado y más volumen.",
    categoria: "mirada",
    duracionMin: 45,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: false,
    pendiente: true,
  },
  {
    id: "svc-lifting-pestanas",
    slug: "lifting-pestanas",
    nombre: "Lifting de pestañas",
    descripcion: "Curva y elevación de tus propias pestañas, con tinte. Sin extensiones, sin mantenimiento.",
    categoria: "mirada",
    duracionMin: 60,
    precioCents: null,
    precioDesde: true,
    reservableOnline: true,
    destacado: false,
    pendiente: true,
  },
];

export const EQUIPO_FIXTURE: readonly Profesional[] = [
  {
    id: "staff-andrea",
    slug: "andrea",
    nombre: "Andrea",
    rol: "Directora y manicurista",
    bio: "Lleva el salón desde el primer día. Especialista en manicura rusa y en que salgas con las manos que querías, no con las que tocaban.",
    especialidades: ["Manicura rusa", "Nivelación", "Nail art"],
    instagram: "https://www.instagram.com/andrea_salonnails/",
    foto: { src: PLACEHOLDER, alt: "Retrato de Andrea, directora del salón" },
    reservableOnline: true,
    pendiente: true,
  },
  {
    /* Nombrada en una reseña de Google (Sara Lino). Ni foto ni especialidades confirmadas. */
    id: "staff-carolina",
    slug: "carolina",
    nombre: "Carolina",
    rol: "Manicurista",
    bio: "Manos y pies con la misma paciencia. Las clientas repiten con ella por el trato y porque las uñas aguantan semanas.",
    especialidades: ["Manicura", "Pedicura", "Gel y acrylgel"],
    instagram: null,
    foto: { src: PLACEHOLDER, alt: "Retrato de Carolina, manicurista del salón" },
    reservableOnline: true,
    pendiente: true,
  },
];
