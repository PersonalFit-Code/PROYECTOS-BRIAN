import Boton from "@/components/ui/Boton";

export default function NoEncontrado() {
  return (
    <section className="border-b border-linea bg-white pt-[var(--header-h)] text-negro">
      <div className="container-page py-24">
        <p className="etiqueta text-gris">Error 404</p>
        <h1 className="titular mt-4 text-5xl sm:text-7xl">Esta página no existe</h1>
        <div className="mt-10">
          <Boton href="/">Volver al inicio</Boton>
        </div>
      </div>
    </section>
  );
}
