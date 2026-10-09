/**
 * Poner un limite de tiempo a algo que puede tardar.
 *
 * En una llamada de telefono no se puede esperar indefinidamente: Vapi corta
 * la peticion a los pocos segundos y el cliente se queda oyendo silencio. Mas
 * vale responder con datos de respaldo que no responder.
 */

/**
 * Devuelve lo que resuelva la promesa, o null si tarda mas de `ms`.
 *
 * Si la promesa falla antes del limite, el error se propaga. Si falla despues,
 * ya no le importa a nadie y se descarta sin dejar un rechazo sin atender.
 */
export function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return new Promise<T | null>((resolve, reject) => {
    let terminado = false;

    const temporizador = setTimeout(() => {
      if (terminado) return;
      terminado = true;
      resolve(null);
    }, ms);

    promesa.then(
      (valor) => {
        if (terminado) return;
        terminado = true;
        clearTimeout(temporizador);
        resolve(valor);
      },
      (error: unknown) => {
        if (terminado) return;
        terminado = true;
        clearTimeout(temporizador);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}
