import "server-only";

import { cache } from "react";
import { getAjustes } from "@/lib/datos/consultas";
import { nombreCoach } from "@/lib/marca";
import { getSesion } from "@/lib/sesion";

/** Nombre del coach del usuario (Ajustes → Coach), leído una vez por petición. */
export const getCoach = cache(async (): Promise<string> => nombreCoach(await getAjustes(await getSesion())));
