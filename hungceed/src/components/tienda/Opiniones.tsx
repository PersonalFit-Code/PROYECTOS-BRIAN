import { Star } from "lucide-react";

/**
 * Hueco de opiniones. Su web no tiene ninguna publicada, así que aquí NO hay reseñas inventadas: son
 * tres marcos de ejemplo, rotulados como tales, para enseñar dónde y cómo irán las reales (de Google
 * o de los pedidos de WooCommerce, con su nombre y su fecha).
 */
export default function Opiniones() {
  return (
    <section aria-labelledby="opiniones-titulo" className="bg-hueso">
      <div className="container-page py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="etiqueta text-rojo">Opiniones</p>
            <h2 id="opiniones-titulo" className="titular mt-3 text-4xl sm:text-5xl">
              Lo que dicen
              <br />
              quienes entrenan
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-gris">
            Ejemplo de diseño. Aquí irán las reseñas reales de Google o de los pedidos, con nombre y fecha, sin retocar.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="relative flex flex-col border border-dashed border-gris-claro bg-white p-7">
              <span className="absolute top-4 right-4 bg-hueso px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-gris uppercase">Ejemplo</span>
              <div className="flex gap-0.5 text-rojo" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-gris italic">Aquí va el texto literal de una reseña real de un cliente.</p>
              <p className="mt-6 text-[12px] font-semibold tracking-[0.12em] text-negro uppercase">Nombre del cliente · Producto comprado</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
