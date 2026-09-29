import { DISH_ICON_BY_KEY } from "@/components/icons/DishIcons";
import { STAR_DISHES } from "./dishes";
import { MENU_CATEGORIES, MENU_ITEM_IDS, MENU_ITEMS } from "./menu";

/**
 * COMPROBACIONES DE LA CARTA, en el arranque.
 *
 * La carta vive repartida en varios ficheros que se referencian por id: `menu.ts` tiene los platos,
 * `dishes.ts` repite el precio y los alérgenos de tres de ellos, `photos.ts` enlaza fotos con platos
 * y el camarero virtual lo lee todo. El tipo `MenuItemId` ya impide que un id no exista, pero hay
 * una familia de fallos que ningún tipo puede atrapar porque son de VALOR, no de forma:
 *
 *  · que el precio de un plato estrella no coincida con el de la carta (y la portada anuncie 14,50 €
 *    de algo que cuesta 19,00 € — exactamente lo que pasaba antes de esta revisión);
 *  · que una clave de icono no exista, porque `resolveDishIcon` cae a "cubertería" sin avisar y
 *    cuarenta y siete tenedores iguales no llaman la atención en una revisión rápida;
 *  · que una media ración cueste más que la entera;
 *  · que una traducción hable de un plato que ya no está, o declare un número distinto de variantes
 *    (se traducen por POSICIÓN, así que un descuadre ahí cambia las etiquetas de sitio en silencio).
 *
 * Se ejecuta al importar los datos, lo que en la práctica significa "durante `next build`", porque
 * el build prerenderiza la portada y la carta. Si algo no cuadra, **el despliegue no sale**. Con
 * datos estáticos eso es lo que se quiere: más vale un build roto que una carta que miente.
 *
 * ⚠️ LO QUE ESTO NO PUEDE VIGILAR, Y HAY QUE REVISAR A MANO AL TOCAR LA CARTA.
 * Hay prosa repartida por la web que NOMBRA platos, y ninguna comprobación automática puede saber
 * que "la tixola vegana de setas" dejó de existir, porque es texto libre. Pasó de verdad: al
 * sustituir la carta inventada por la real, las preguntas frecuentes siguieron anunciando durante
 * semanas una tixola vegana, una ensalada de quinoa, pimientos de Padrón y una tabla de quesos que
 * no existen — en los cuatro idiomas, en la portada y encima marcadas para Google como FAQPage.
 * Al cambiar la carta, repasar también:
 *   · `src/i18n/messages/{es,gl,en,pt}/legal.ts` → `faq.items` (va al HTML y al JSON-LD; los cuatro
 *     idiomas a mano, porque ese fichero NO tiene comprobación estricta de tipos);
 *   · `dishes.ctaNote`, `carta.search`, `carta.seoDescription`, `common.seoKeywords`;
 *   · `src/lib/waiter/systemPrompt.ts` y `src/lib/waiter/knowledge.ts`.
 * Los números SÍ se pueden enchufar a los datos, y es lo que se hizo con el recuento de platos de
 * `ctaNote` ({count} ← `MENU_ITEMS.length`). Haz lo mismo con cualquier cifra nueva.
 */

function fail(errors: string[]): never {
  throw new Error(`Carta inconsistente:\n  · ${errors.join("\n  · ")}`);
}

export function assertMenuIntegrity(): void {
  const errors: string[] = [];
  const byId = new Map(MENU_ITEMS.map((i) => [i.id, i]));

  /* La lista de ids y la carta tienen que decir lo mismo en las dos direcciones. */
  if (byId.size !== MENU_ITEMS.length) {
    const vistos = new Set<string>();
    for (const i of MENU_ITEMS) {
      if (vistos.has(i.id)) errors.push(`el id "${i.id}" está repetido en MENU_ITEMS`);
      vistos.add(i.id);
    }
  }
  for (const id of MENU_ITEM_IDS) {
    if (!byId.has(id)) errors.push(`MENU_ITEM_IDS declara "${id}", pero no hay ningún plato con ese id`);
  }

  const categorias = new Set(MENU_CATEGORIES.map((c) => c.id));
  for (const c of categorias) {
    if (!MENU_ITEMS.some((i) => i.category === c)) errors.push(`la categoría "${c}" no tiene ningún plato`);
  }

  for (const item of MENU_ITEMS) {
    if (!categorias.has(item.category)) errors.push(`"${item.id}" está en la categoría "${item.category}", que no existe`);
    if (!item.description.trim()) errors.push(`"${item.id}" no tiene descripción`);
    if (!(item.price > 0)) errors.push(`"${item.id}" tiene un precio inválido (${item.price})`);
    if (!DISH_ICON_BY_KEY[item.emoji]) errors.push(`"${item.id}" usa la clave de icono "${item.emoji}", que no existe (saldría cubertería)`);

    if (item.variants?.length) {
      const precios = item.variants.map((v) => v.price);
      for (let i = 1; i < precios.length; i++) {
        if (precios[i] <= precios[i - 1]) errors.push(`las variantes de "${item.id}" no van de menor a mayor precio`);
      }
      const mayor = precios[precios.length - 1];
      if (mayor !== item.price) errors.push(`"${item.id}": el precio base (${item.price}) no coincide con su variante mayor (${mayor})`);
    }
  }

  /* Los platos estrella duplican datos de la carta a mano: aquí se comprueba que no mienten. */
  const conEtiquetaEstrella = new Set(MENU_ITEMS.filter((i) => i.tags.includes("estrella")).map((i) => i.id));
  for (const star of STAR_DISHES) {
    const item = byId.get(star.menuId);
    if (!item) {
      errors.push(`el plato estrella "${star.id}" apunta a "${star.menuId}", que no está en la carta`);
      continue;
    }
    if (star.price !== item.price) errors.push(`"${star.id}" dice ${star.price} € y la carta dice ${item.price} € para "${item.id}"`);
    if (star.unit !== item.unit) errors.push(`"${star.id}" dice unidad "${star.unit}" y la carta dice "${item.unit}" para "${item.id}"`);
    const a = [...star.allergens].sort().join(",");
    const b = [...item.allergens].sort().join(",");
    if (a !== b) errors.push(`los alérgenos de "${star.id}" (${a || "ninguno"}) no coinciden con los de "${item.id}" (${b || "ninguno"})`);
    if (!conEtiquetaEstrella.has(star.menuId)) errors.push(`"${item.id}" sale en el carrusel de la portada pero no lleva la etiqueta "estrella" en la carta`);
  }
  /* La comprobación va en UN SOLO SENTIDO a propósito: todo lo que sale en el carrusel tiene que
     llevar la etiqueta, pero no al revés. El carrusel está limitado por las FOTOS —solo hay tres
     platos fotografiados— mientras que la etiqueta marca lo que la casa recomienda, que es más
     ancho y es de lo que tira el camarero virtual cuando le piden consejo. Exigir que coincidan
     obligaría a recortar las recomendaciones a tres por una limitación de fotografía. */

  if (errors.length) fail(errors);
}

/**
 * Lo mismo para las traducciones de los datos. Va aparte porque lo llama `i18n/data.ts`, que es
 * quien tiene los overrides a mano, y porque su fallo típico es distinto: no un dato que miente,
 * sino un plato que se queda sin traducir sin que nadie se entere.
 */
export function assertTranslationIntegrity(traducciones: Record<string, { menuItems?: Record<string, { variants?: readonly string[] }> }>): void {
  const errors: string[] = [];
  const byId = new Map(MENU_ITEMS.map((i) => [i.id, i]));

  for (const [idioma, datos] of Object.entries(traducciones)) {
    const items = datos.menuItems;
    if (!items) continue;
    for (const [id, override] of Object.entries(items)) {
      const item = byId.get(id as never);
      if (!item) {
        errors.push(`[${idioma}] traduce "${id}", que ya no está en la carta`);
        continue;
      }
      const propias = override.variants?.length ?? 0;
      const reales = item.variants?.length ?? 0;
      if (propias && propias !== reales) {
        errors.push(`[${idioma}] "${id}" declara ${propias} variantes y la carta tiene ${reales} (se traducen por posición: se descuadrarían)`);
      }
    }
  }

  if (errors.length) fail(errors);
}
