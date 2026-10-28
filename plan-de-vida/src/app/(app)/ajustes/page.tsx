import type { Metadata } from "next";
import { ActivarAvisos } from "@/components/ajustes/ActivarAvisos";
import { Pagina } from "@/components/layout/Pagina";
import { Bell, Plus, Save, Settings, Smartphone, Sparkles, Tags, TrendingUp, User } from "lucide-react";
import { Boton, Campo, Etiqueta, Selector, Texto, Titulo } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Hoja } from "@/components/ui/Hoja";
import { Icono } from "@/components/ui/iconos";
import { SelectorIcono } from "@/components/ui/SelectorIcono";
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
      <Titulo icono={<Settings />} color="gray">
        Ajustes
      </Titulo>

      <FormAccion accion={guardarAjustes} resetear={false}>
        <Desplegable icono={<User />} color="blue" titulo="Tú" resumen={ajustes.display_name} abierto i={1}>
          <Etiqueta label="Cómo te llamas">
            <Campo name="display_name" defaultValue={ajustes.display_name} />
          </Etiqueta>
        </Desplegable>

        <Desplegable icono={<Sparkles />} color="purple" titulo="Coach" resumen={conIA ? "con IA" : "modo básico"} i={2}>
          <p className="mb-2 text-sm text-muted">
            Puedes reescribir su personalidad; déjalo vacío para usar la de serie. <code>{"{nombre}"}</code> se cambia por tu nombre.
          </p>
          <Texto name="coach_prompt" rows={10} defaultValue={ajustes.coach_prompt ?? ""} placeholder={PERSONALIDAD_DE_SERIE} className="font-mono text-xs" />
        </Desplegable>

        <Desplegable icono={<TrendingUp />} color="orange" titulo="Inversión" resumen={`${ajustes.monthly_investment} €/mes`} i={3}>
          <div className="grid grid-cols-2 gap-3">
            <Etiqueta label="Aportación mensual (€)">
              <Campo name="monthly_investment" inputMode="decimal" defaultValue={String(ajustes.monthly_investment)} />
            </Etiqueta>
            <Etiqueta label="Satélite (%)">
              <Campo name="satellite_pct" inputMode="decimal" defaultValue={String(ajustes.satellite_pct)} />
            </Etiqueta>
            <Etiqueta label="Inflación (%)">
              <Campo name="inflation_pct" inputMode="decimal" defaultValue={String(ajustes.inflation_pct)} />
            </Etiqueta>
            <Etiqueta label="Índice de referencia">
              <Campo name="benchmark_symbol" defaultValue={ajustes.benchmark_symbol} />
            </Etiqueta>
          </div>
          <p className="mt-2 text-xs text-muted">El reparto por activo y la lista de seguimiento se cambian en Finanzas, apartado Inversión.</p>
        </Desplegable>

        <div className="mb-3">
          <Boton variante="primario" className="w-full sm:w-auto">
            <Save className="size-4" /> Guardar ajustes
          </Boton>
        </div>
      </FormAccion>

      <Desplegable icono={<Bell />} color="yellow" titulo="Notificaciones" i={4}>
        <p className="mb-3 text-sm text-muted">Recordatorio de los hábitos que te quedan por la tarde, la revisión del domingo y el informe de fin de mes.</p>
        <ActivarAvisos clavePublica={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
      </Desplegable>

      <Desplegable icono={<Tags />} color="green" titulo="Categorías de gasto e ingreso" resumen={`${categorias.length}`} i={5}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {categorias.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm">
              <Icono nombre={c.emoji} className="size-3.5 text-muted" /> {c.name} <span className="text-xs text-muted">· {c.kind}</span>
            </span>
          ))}
        </div>
        <Hoja titulo="Nueva categoría" boton="Nueva categoría" icono={<Plus />} variante="suave">
          <FormAccion accion={crearCategoria} className="grid gap-3">
            <Etiqueta label="Nombre">
              <Campo name="name" placeholder="Mascotas, Gimnasio…" required />
            </Etiqueta>
            <Etiqueta label="Icono" grupo>
              <SelectorIcono name="emoji" inicial="circle" />
            </Etiqueta>
            <Etiqueta label="Tipo">
              <Selector name="kind" defaultValue="gasto">
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </Selector>
            </Etiqueta>
            <Boton variante="primario" className="w-full">
              Añadir categoría
            </Boton>
          </FormAccion>
        </Hoja>
      </Desplegable>

      <Desplegable icono={<Smartphone />} color="pink" titulo="Instalar en el móvil" i={6}>
        <ul className="space-y-2 text-sm text-muted">
          <li>
            <b className="text-fg">iPhone:</b> abre la web en Safari, botón Compartir y «Añadir a pantalla de inicio». Inicia sesión una vez dentro de la app instalada.
          </li>
          <li>
            <b className="text-fg">Android:</b> en Chrome, menú de los tres puntos y «Instalar aplicación».
          </li>
          <li>
            <b className="text-fg">Ordenador:</b> en Chrome o Edge, el icono de instalar de la barra de direcciones.
          </li>
        </ul>
      </Desplegable>
    </Pagina>
  );
}
