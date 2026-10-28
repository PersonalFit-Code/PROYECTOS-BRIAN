import type { Metadata } from "next";
import { ActivarAvisos } from "@/components/ajustes/ActivarAvisos";
import { Pagina } from "@/components/layout/Pagina";
import { Boton, Campo, Card, Etiqueta, Seccion, Selector, Texto, Titulo } from "@/components/ui/basicos";
import { FormAccion } from "@/components/ui/FormAccion";
import { PERSONALIDAD_DE_SERIE } from "@/lib/coach/personalidad";
import { getAjustes, getCategorias } from "@/lib/datos/consultas";
import { getSesion } from "@/lib/sesion";
import { crearCategoria } from "../finanzas/acciones";
import { guardarAjustes } from "./acciones";

export const metadata: Metadata = { title: "Ajustes" };

export default async function AjustesPage() {
  const s = await getSesion();
  const [ajustes, categorias] = await Promise.all([getAjustes(s), getCategorias(s)]);
  const conIA = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <Pagina>
      <Titulo emoji="⚙️">Ajustes</Titulo>

      <FormAccion accion={guardarAjustes} resetear={false} className="space-y-8">
        <Seccion titulo="Tú">
          <Etiqueta label="Cómo te llamas">
            <Campo name="display_name" defaultValue={ajustes.display_name} className="max-w-xs" />
          </Etiqueta>
        </Seccion>

        <Seccion titulo="Coach">
          <p className="mb-2 text-sm text-muted">
            {conIA ? "El coach usa Claude (IA). " : "Sin ANTHROPIC_API_KEY el coach funciona en modo básico. "}
            Puedes reescribir su personalidad; déjalo vacío para usar la de serie. <code>{"{nombre}"}</code> se cambia por tu nombre.
          </p>
          <Texto name="coach_prompt" rows={10} defaultValue={ajustes.coach_prompt ?? ""} placeholder={PERSONALIDAD_DE_SERIE} className="font-mono text-xs" />
        </Seccion>

        <Seccion titulo="Inversión">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Etiqueta label="Aportación mensual (€)">
              <Campo name="monthly_investment" inputMode="decimal" defaultValue={String(ajustes.monthly_investment)} />
            </Etiqueta>
            <Etiqueta label="Satélite (%)">
              <Campo name="satellite_pct" inputMode="decimal" defaultValue={String(ajustes.satellite_pct)} />
            </Etiqueta>
            <Etiqueta label="Inflación (%)">
              <Campo name="inflation_pct" inputMode="decimal" defaultValue={String(ajustes.inflation_pct)} />
            </Etiqueta>
            <Etiqueta label="Benchmark">
              <Campo name="benchmark_symbol" defaultValue={ajustes.benchmark_symbol} />
            </Etiqueta>
          </div>
          <p className="mt-2 text-xs text-muted">El reparto por activo y la lista de seguimiento se cambian en Finanzas → Inversión.</p>
        </Seccion>

        <Boton variante="primario">Guardar ajustes</Boton>
      </FormAccion>

      <Seccion titulo="Notificaciones" className="mt-10">
        <p className="mb-3 text-sm text-muted">Recordatorio de los hábitos que te quedan por la tarde, la revisión del domingo y el informe de fin de mes.</p>
        <ActivarAvisos clavePublica={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
      </Seccion>

      <Seccion titulo="Categorías de gasto e ingreso">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {categorias.map((c) => (
            <span key={c.id} className="rounded-full border border-line px-2.5 py-1 text-sm">
              {c.emoji} {c.name} <span className="text-xs text-muted">· {c.kind}</span>
            </span>
          ))}
        </div>
        <Card>
          <FormAccion accion={crearCategoria} className="grid grid-cols-4 gap-2">
            <Campo name="emoji" placeholder="🙂" maxLength={8} className="text-center" />
            <Campo name="name" placeholder="Nueva categoría" required className="col-span-2" />
            <Selector name="kind" defaultValue="gasto">
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </Selector>
            <div className="col-span-4">
              <Boton>Añadir categoría</Boton>
            </div>
          </FormAccion>
        </Card>
      </Seccion>

      <Seccion titulo="Instalar en el móvil">
        <ul className="list-inside list-disc space-y-1 text-sm text-muted">
          <li>
            <b className="text-fg">iPhone:</b> abre la web en Safari → botón Compartir → «Añadir a pantalla de inicio».
          </li>
          <li>
            <b className="text-fg">Android:</b> en Chrome → menú ⋮ → «Instalar aplicación».
          </li>
          <li>
            <b className="text-fg">Ordenador:</b> en Chrome o Edge, el icono de instalar de la barra de direcciones.
          </li>
        </ul>
      </Seccion>
    </Pagina>
  );
}
