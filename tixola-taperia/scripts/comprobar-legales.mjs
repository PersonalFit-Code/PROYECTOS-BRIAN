/**
 * COMPARA LA ESTRUCTURA DE LOS CUATRO FICHEROS LEGALES.
 *
 * `src/i18n/messages/<idioma>/legal.ts` se tipa con una interfaz escrita a mano (`LegalMessages`)
 * en la que las listas son `readonly T[]`, SIN longitud fija. Eso quiere decir que una traducción a
 * la que le falte un apartado, una fila de la tabla de cookies o un elemento de una lista COMPILA
 * limpia y se publica: en castellano la política declara una cookie que en gallego no aparece, y
 * nadie se entera. Es el mismo fallo que ya pasó una vez con las preguntas frecuentes.
 *
 * Esto lo comprueba. No mira el contenido —eso es cosa de quien traduce— sino el esqueleto:
 * apartados, ids, orden, tipos de bloque, número de filas y de columnas, número de elementos.
 *
 *   npm run check:legal
 *
 * Se ejecuta a mano y en cada revisión de los textos legales. No está enganchado al build a
 * propósito: romper un despliegue de la web de un bar por una fila de tabla no compensa, y el aviso
 * aquí llega igual de claro.
 */
import { argv, exit } from "node:process";

const IDIOMAS = ["gl", "en", "pt"];
const base = new URL("../src/i18n/messages/", import.meta.url);

/** Esqueleto de un bloque: tipo + tamaños, sin texto. */
function formaBloque(b) {
  switch (b.type) {
    case "table":
      return `table(filas=${b.rows.length}, columnas=${b.head.length}, anchos=[${b.rows.map((r) => r.length).join(",")}])`;
    case "ul":
    case "ol":
      return `${b.type}(${b.items.length})`;
    case "dl":
      return `dl(${b.items.length})`;
    default:
      return b.type;
  }
}

function formaDoc(doc) {
  return doc.sections.map((s) => ({ id: s.id, bloques: s.blocks.map(formaBloque) }));
}

function formaLegal(legal) {
  return {
    docs: Object.fromEntries(Object.entries(legal.docs).map(([k, v]) => [k, formaDoc(v)])),
    faq: legal.faq.items.length,
  };
}

const es = formaLegal((await import(new URL("es/legal.ts", base))).default);
const fallos = [];

for (const idioma of IDIOMAS) {
  const otro = formaLegal((await import(new URL(`${idioma}/legal.ts`, base))).default);

  if (otro.faq !== es.faq) fallos.push(`[${idioma}] faq.items tiene ${otro.faq} preguntas y el castellano ${es.faq}`);

  for (const [clave, seccionesEs] of Object.entries(es.docs)) {
    const seccionesOtro = otro.docs[clave];
    if (!seccionesOtro) {
      fallos.push(`[${idioma}] falta el documento "${clave}"`);
      continue;
    }
    if (seccionesOtro.length !== seccionesEs.length) {
      fallos.push(
        `[${idioma}] ${clave}: ${seccionesOtro.length} apartados y el castellano ${seccionesEs.length}` +
          ` (castellano: ${seccionesEs.map((s) => s.id).join(", ")} | ${idioma}: ${seccionesOtro.map((s) => s.id).join(", ")})`,
      );
      continue;
    }
    seccionesEs.forEach((secEs, i) => {
      const secOtro = seccionesOtro[i];
      if (secOtro.id !== secEs.id) {
        fallos.push(`[${idioma}] ${clave}, apartado ${i + 1}: el id es "${secOtro.id}" y en castellano "${secEs.id}"`);
        return;
      }
      if (secOtro.bloques.join("|") !== secEs.bloques.join("|")) {
        fallos.push(
          `[${idioma}] ${clave} #${secEs.id}: los bloques no cuadran\n` +
            `      castellano: ${secEs.bloques.join(" · ")}\n` +
            `      ${idioma}:${" ".repeat(Math.max(1, 10 - idioma.length))}${secOtro.bloques.join(" · ")}`,
        );
      }
    });
  }
}

if (fallos.length) {
  console.error(`\nTextos legales descuadrados (${fallos.length}):\n`);
  for (const f of fallos) console.error(`  · ${f}`);
  console.error("");
  exit(1);
}
console.log(`Textos legales: ${IDIOMAS.length} idiomas con la misma estructura que el castellano.`);
if (argv.includes("--detalle")) console.log(JSON.stringify(es, null, 2));
