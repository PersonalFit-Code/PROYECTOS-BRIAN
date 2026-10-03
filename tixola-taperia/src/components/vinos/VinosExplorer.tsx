"use client";

import { useId } from "react";
import { MessageCircle, Wine } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import NeonButton from "@/components/ui/NeonButton";
import { BUSINESS } from "@/data/business";
import CartaDeVinos from "@/components/vinos/CartaDeVinos";
import Denominaciones from "@/components/vinos/Denominaciones";
import MapaDelMundo from "@/components/vinos/MapaDelMundo";
import { WINES_PENDING } from "@/data/wines";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * VinosExplorer — la vinoteca.
 *
 * Cuatro piezas, en el orden en que se recorren: la cabecera editorial, el mapa del MUNDO con los
 * países de los que viene el vino, el mapa de GALICIA con sus cinco denominaciones, y la carta con
 * su buscador. Mientras `WINES_PENDING` siga en pie no hay mapa del mundo —sin vinos no hay países
 * que enseñar— y en el sitio de la carta va el aviso de que todavía se está cerrando.
 */
export default function VinosExplorer() {
  return (
    <>
      <VinosHero />
      {/* Primero el mundo —de dónde vienen las dieciséis procedencias— y después Galicia en detalle.
          Las dos llevan al mismo sitio: a las botellas de abajo. */}
      {WINES_PENDING ? null : <MapaDelMundo />}
      {/* EL MAPA DE GALICIA VA ANTES QUE LA LISTA, y no al revés como estaba. Es el recorrido que describió el
          cliente: "me gustaría que la persona viera esto [el mapa] ... me apetece uno de Monterrei,
          pues pincho y que me salgan todos los de Monterrei con la foto". Con la lista delante, el
          mapa quedaba detrás de 52 botellas y no lo veía nadie; delante, es la puerta de entrada y
          cada denominación lleva a su sitio de la carta. */}
      <Denominaciones />
      {/* O la carta, o el aviso de que todavía no está. Nunca las dos, nunca ninguna. */}
      {WINES_PENDING ? <CartaEnCamino /> : <CartaDeVinos />}
    </>
  );
}

/** Cabecera editorial, hermana de la de /carta: kicker, titular con acento en cursiva y entradilla. */
function VinosHero() {
  const m = useMessages();
  return (
    /* `overflow-x-clip`: la brasa de abajo mide 420 px fijos y a 320 px de ancho asomaba 4 px por la
       derecha, lo justo para que la página entera se pudiera arrastrar en horizontal. `clip` la
       recorta sin crear contenedor de scroll (que sí rompería cualquier `sticky` de dentro). */
    <header className="container-page relative grid gap-8 overflow-x-clip py-10 md:py-14 lg:py-16">
      {/* Brasa de fondo tras el titular, horneada (sin `blur`, que rasterizaría 420² px al abrir). */}
      <span aria-hidden className="ember-glow absolute -left-24 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full [--ember-a1:0.3]" />
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-3 font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">
          <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
          {m.vinos.kicker}
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cream text-balance md:text-6xl lg:text-7xl">
          {m.vinos.title} <em className="text-gradient-ember font-script text-[1.26em] font-normal not-italic leading-[0.74]">{m.vinos.accent}</em>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-muted text-pretty md:text-lg">{m.vinos.description}</p>
      </div>
    </header>
  );
}

/**
 * El aviso de que la carta todavía no está. NO es un "próximamente" de relleno: dice por qué no
 * está, cuándo sirve de algo volver, y deja dos vías abiertas para resolverlo ahora mismo (el
 * camarero virtual y WhatsApp). Un cartel que solo dijera "próximamente" sería peor que nada.
 */
function CartaEnCamino() {
  const m = useMessages();
  const chat = useChat();
  const tituloId = useId();

  return (
    <section aria-labelledby={tituloId} className="container-page pb-16 md:pb-20">
      <div className="noise after:noise-after relative overflow-hidden rounded-3xl border border-pimenton-light/35 bg-[linear-gradient(160deg,rgba(90,20,24,0.85),rgba(59,22,19,0.92)_58%,rgba(58,13,16,0.9))] shadow-card">
        <span aria-hidden className="ember-glow absolute -right-16 -top-16 h-56 w-56 rounded-full [--ember-a1:0.45] [--ember-rgb:216_50_60]" />
        <span aria-hidden className="ember-glow absolute -bottom-20 -left-10 h-48 w-48 rounded-full [--ember-a1:0.18] [--ember-rgb:232_194_122]" />

        <div className="relative p-6 md:p-9">
          <p className="inline-flex items-center gap-2 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-pimenton-light/40 bg-pimenton/20 text-pimenton-light">
              <Wine size={16} aria-hidden />
            </span>
            {m.vinos.pendingKicker}
          </p>

          <h2 id={tituloId} className="mt-4 max-w-2xl font-display text-3xl font-medium leading-[0.98] text-cream text-balance md:text-4xl">
            {m.vinos.pendingTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-muted md:text-base">{m.vinos.pendingText}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-muted md:text-base">{m.vinos.pendingAction}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <NeonButton onClick={() => chat.open({ prefill: m.vinos.pendingAsk, page: "vinos" })}>
              <MessageCircle size={18} aria-hidden />
              {m.vinos.pendingCta}
            </NeonButton>
            <a
              href={BUSINESS.phone.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:border-cream/50 hover:bg-cream/5"
            >
              {m.vinos.pendingWhatsapp}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
