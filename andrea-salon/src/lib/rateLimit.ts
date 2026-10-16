/**
 * Cuota ligera por clave (normalmente la IP), en memoria.
 *
 * Extraído del cubo por IP de `tixola-taperia/src/app/api/chat/route.ts` para
 * usarlo también en el hold, la confirmación, el checkout de bonos y el login
 * del panel. En memoria y por proceso: suficiente para frenar a un script que
 * pruebe horas o contraseñas en bucle, que es la amenaza real de un salón; una
 * cuota compartida entre regiones sería otro producto.
 *
 * Puro en lo que importa: el reloj entra por parámetro (`ahora`), así que las
 * pruebas avanzan el tiempo sin esperar y nada aquí lee `Date.now()` salvo el
 * valor por defecto.
 */

export interface OpcionesLimitador {
  /** Peticiones permitidas por clave dentro de la ventana. */
  maximo: number;
  /** Duración de la ventana en milisegundos; empieza con la primera petición de la clave. */
  ventanaMs: number;
  /** Reloj; por defecto `Date.now`. */
  ahora?: () => number;
  /** Tope de claves vivas: por encima se barre aunque no toque. Por defecto 5000. */
  maxClaves?: number;
  /** Cada cuánto se barren las entradas caducadas, como mucho. Por defecto un minuto. */
  barridoMs?: number;
}

export type ResultadoLimitador =
  | { ok: true }
  | {
      ok: false;
      /** Milisegundos hasta que la clave vuelve a tener cuota (para `retry-after`, en segundos redondeando hacia arriba). */
      reintentarEnMs: number;
    };

export interface Limitador {
  /** Consume una petición de la cuota de esa clave. */
  permitir(clave: string): ResultadoLimitador;
  /** Borra las entradas caducadas y devuelve cuántas quitó. */
  barrer(): number;
  /** Claves que se están guardando ahora mismo. */
  readonly tamano: number;
}

interface Cubo {
  cuenta: number;
  reiniciaEn: number;
}

/**
 * Crea un limitador independiente. Cada ruta tiene el suyo, con su cuota:
 * treinta preguntas al chat en diez minutos no es lo mismo que cinco intentos
 * de login.
 *
 * EL BARRIDO ES LO QUE HACE VERDAD LO QUE DICE LA POLÍTICA. La dirección IP es
 * un dato personal (considerando 30 del RGPD y la sentencia Breyer del TJUE,
 * C-582/14), y la política de privacidad promete que solo se cuenta durante la
 * ventana. Si la limpieza dependiera de que el mapa pasara de 5.000 entradas
 * —es decir, nunca, en la web de un salón— una IP que entrara una vez se
 * quedaría ahí mientras viviera el proceso. Se barre cada minuto como mucho, y
 * la entrada caducada se borra antes de crear la nueva, así que el plazo
 * declarado y el real coinciden (art. 5.1.c y 5.1.e RGPD).
 */
export function crearLimitador(opciones: OpcionesLimitador): Limitador {
  const { maximo, ventanaMs } = opciones;
  if (!Number.isInteger(maximo) || maximo < 1) throw new Error(`El máximo tiene que ser un entero positivo, no ${maximo}.`);
  if (!(ventanaMs > 0)) throw new Error(`La ventana tiene que ser positiva, no ${ventanaMs}.`);
  const ahora = opciones.ahora ?? Date.now;
  const maxClaves = opciones.maxClaves ?? 5000;
  const barridoMs = opciones.barridoMs ?? 60_000;

  const cubos = new Map<string, Cubo>();
  let ultimoBarrido = -Infinity;

  function barrerEn(momento: number): number {
    ultimoBarrido = momento;
    let quitadas = 0;
    for (const [clave, cubo] of cubos) {
      if (cubo.reiniciaEn <= momento) {
        cubos.delete(clave);
        quitadas++;
      }
    }
    return quitadas;
  }

  return {
    permitir(clave: string): ResultadoLimitador {
      const momento = ahora();
      if (momento - ultimoBarrido > barridoMs || cubos.size > maxClaves) barrerEn(momento);

      const cubo = cubos.get(clave);
      if (!cubo || cubo.reiniciaEn <= momento) {
        // Si había una entrada caducada, fuera del mapa antes de poner la
        // nueva: así la clave no "revive" arrastrando el registro anterior.
        cubos.delete(clave);
        cubos.set(clave, { cuenta: 1, reiniciaEn: momento + ventanaMs });
        return { ok: true };
      }
      if (cubo.cuenta >= maximo) return { ok: false, reintentarEnMs: cubo.reiniciaEn - momento };
      cubo.cuenta++;
      return { ok: true };
    },
    barrer(): number {
      return barrerEn(ahora());
    },
    get tamano(): number {
      return cubos.size;
    },
  };
}

/**
 * La IP de quien hace la petición, como clave de cuota. En Vercel llega en
 * `x-forwarded-for` (la primera de la lista es el cliente); fuera de ahí se
 * miran las otras cabeceras habituales. Sin ninguna, todas las peticiones
 * comparten la clave "unknown": mejor una cuota común que ninguna.
 */
export function ipDePeticion(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const primera = forwarded.split(",")[0]?.trim();
    if (primera) return primera;
  }
  return req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
}
