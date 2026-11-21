import { AtSign, ArrowLeft, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaTexto, Boton, Card, EtiquetaEstado } from "@/components/ui";
import { enlaceSeguro, fechaHora, telefonoBonito, webCorta } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { CANAL_TXT, ESTADO_TXT, SECTOR_TXT, type Contacto, type Diagnostico, type Negocio, type Propuesta } from "@/lib/tipos";
import { FormContacto } from "./FormContacto";
import { guardarNotas } from "./acciones";

export const metadata: Metadata = { title: "Ficha" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-lg font-bold">{titulo}</h2>
      {children}
    </Card>
  );
}

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { db } = await getSesion();

  const [{ data: negocio }, { data: dolores }, { data: propuesta }, { data: contactos }, { count: permisos }] = await Promise.all([
    db.from("negocios").select("*").eq("id", id).maybeSingle(),
    db.from("diagnosticos").select("*").eq("negocio_id", id).order("creado"),
    db.from("propuestas").select("*").eq("negocio_id", id).maybeSingle(),
    db.from("contactos").select("*").eq("negocio_id", id).order("creado", { ascending: false }),
    db.from("consentimientos").select("id", { count: "exact", head: true }).eq("negocio_id", id),
  ]);
  if (!negocio) notFound();
  const n = negocio as Negocio;
  const p = propuesta as Propuesta | null;
  const web = enlaceSeguro(n.web);
  const ig = enlaceSeguro(n.instagram);
  const fuente = enlaceSeguro(n.fuente_url);

  return (
    <>
      <Link href={n.dia ? `/?dia=${n.dia}` : "/negocios"} className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold text-muted hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden />
        {n.dia ? `Día ${n.dia}` : "Negocios"}
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight break-words sm:text-3xl">{n.nombre}</h1>
          <EtiquetaEstado estado={n.estado} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-muted">
          <span>{n.subsector ?? SECTOR_TXT[n.sector]}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden />
            {[n.direccion, n.localidad, n.provincia, n.comunidad].filter(Boolean).join(", ")}
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2 font-bold">
          {n.telefono && (
            <a href={`tel:+34${n.telefono}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-white hover:brightness-110">
              <Phone className="size-4" aria-hidden />
              Llamar al {telefonoBonito(n.telefono)}
            </a>
          )}
          {web && (
            <a href={web} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 hover:bg-soft">
              <Globe className="size-4" aria-hidden />
              {webCorta(web)}
            </a>
          )}
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 hover:bg-soft">
              <AtSign className="size-4" aria-hidden />
              Instagram
            </a>
          )}
        </div>
        {n.email_generico && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Mail className="size-4 text-muted" aria-hidden />
            <span>{n.email_generico}</span>
            {permisos ? (
              <span className="tono-verde inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold">
                <ShieldCheck className="size-3.5" aria-hidden />
                Ha pedido el correo
              </span>
            ) : (
              <span className="tono-gris rounded-full px-2.5 py-0.5 text-xs font-bold">No escribir hasta que lo pida</span>
            )}
          </p>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Lo que hemos visto">
          {(dolores ?? []).length === 0 ? (
            <p className="text-muted">Todavía no hay diagnóstico de este negocio.</p>
          ) : (
            <ul className="space-y-3">
              {(dolores as Diagnostico[]).map((d) => {
                const prueba = enlaceSeguro(d.prueba_url);
                return (
                  <li key={d.id} className="border-l-4 border-brand pl-3">
                    <p className="font-bold">{d.dolor}</p>
                    <p className="text-sm text-muted">{d.prueba}</p>
                    {prueba && (
                      <a href={prueba} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand underline">
                        Ver la prueba
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {fuente && (
            <p className="mt-4 text-sm text-muted">
              Fuente de los datos:{" "}
              <a href={fuente} target="_blank" rel="noopener noreferrer" className="font-bold text-brand underline">
                {webCorta(fuente).slice(0, 50)}
              </a>
            </p>
          )}
        </Bloque>

        <Bloque titulo="Qué decirle">
          {p?.guion_llamada || p?.mensaje_corto ? (
            <div className="space-y-4">
              {p.guion_llamada && (
                <div>
                  <h3 className="text-sm font-bold text-muted">Guion de llamada</h3>
                  <p className="whitespace-pre-line">{p.guion_llamada}</p>
                </div>
              )}
              {p.mensaje_corto && (
                <div>
                  <h3 className="text-sm font-bold text-muted">Mensaje corto</h3>
                  <p className="whitespace-pre-line">{p.mensaje_corto}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted">Todavía no hay guion para este negocio.</p>
          )}
        </Bloque>

        <Bloque titulo="Apuntar un contacto">
          <FormContacto negocioId={n.id} />
        </Bloque>

        <Bloque titulo="Historial">
          {(contactos ?? []).length === 0 ? (
            <p className="text-muted">Aún no se le ha contactado.</p>
          ) : (
            <ol className="space-y-3">
              {(contactos as Contacto[]).map((c) => (
                <li key={c.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-bold">
                      {CANAL_TXT[c.canal]} · {ESTADO_TXT[c.resultado]}
                    </span>
                    <time dateTime={c.creado} className="text-sm text-muted">
                      {fechaHora(c.creado)}
                    </time>
                  </p>
                  {c.nota && <p className="text-sm">{c.nota}</p>}
                  {c.proxima_fecha && <p className="text-sm text-warn">Volver a llamar el {c.proxima_fecha.split("-").reverse().join("/")}</p>}
                </li>
              ))}
            </ol>
          )}
        </Bloque>

        <div className="lg:col-span-2">
          <Bloque titulo="Notas">
            <form action={guardarNotas} className="space-y-3">
              <input type="hidden" name="negocio_id" value={n.id} />
              <AreaTexto etiqueta="Notas del negocio" name="notas" defaultValue={n.notas ?? ""} maxLength={600} />
              <Boton>Guardar notas</Boton>
            </form>
          </Bloque>
        </div>
      </div>
    </>
  );
}
