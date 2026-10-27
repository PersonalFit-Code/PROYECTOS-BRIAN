// Quita los comentarios de unos scripts, para dist/. Lo llama construye_dist.py.
// Entrada (stdin): JSON con una lista de textos de <script>. Salida: la misma
// lista, sin comentarios. Usa acorn, que lee JavaScript de verdad: con
// expresiones regulares, un «//» dentro de una cadena o de una regex se
// tomaría por comentario y rompería el script sin avisar.
//   · Un comentario que ocupa líneas enteras se va con sus líneas.
//   · Uno detrás de código se quita y deja el código como estaba.
//   · Un /* */ que contiene un salto de línea se cambia por un salto de línea:
//     para la inserción automática de «;» ese salto cuenta.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const acorn = require(require.resolve('acorn', { paths: [process.cwd(), '/opt/node-tools/node_modules'] }));

function limpia(src) {
  const coms = [];
  acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true,
                     onComment: (bloque, texto, ini, fin) => coms.push({ bloque, ini, fin, texto }) });
  let out = '', pos = 0;
  for (const c of coms) {
    const iniLinea = src.lastIndexOf('\n', c.ini - 1) + 1;
    let finLinea = src.indexOf('\n', c.fin); if (finLinea < 0) finLinea = src.length;
    const antes = src.slice(Math.max(iniLinea, pos), c.ini), despues = src.slice(c.fin, finLinea);
    if (!antes.trim() && !despues.trim() && iniLinea >= pos) {
      // ocupa la línea entera (o varias): fuera, con su salto
      out += src.slice(pos, iniLinea);
      pos = Math.min(finLinea + 1, src.length);
    } else {
      out += src.slice(pos, c.ini);
      out += c.bloque && c.texto.includes('\n') ? '\n' : (c.bloque ? ' ' : '');
      pos = c.fin;
    }
  }
  out += src.slice(pos);
  // comprobación: lo que sale tiene que seguir siendo JavaScript válido
  acorn.parse(out, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true });
  return out;
}

let entrada = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => entrada += d);
process.stdin.on('end', () => process.stdout.write(JSON.stringify(JSON.parse(entrada).map(limpia))));
