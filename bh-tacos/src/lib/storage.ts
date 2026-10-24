/* localStorage puede no existir o lanzar (modo privado, cookies bloqueadas): nunca debe romper la web. */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: la web sigue funcionando, solo no recuerda */
  }
}
