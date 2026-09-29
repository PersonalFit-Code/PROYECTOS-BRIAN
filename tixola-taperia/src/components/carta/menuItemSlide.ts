"use client";

import { useCallback } from "react";
import type { DishSlide } from "@/components/ui/DishVisual";
import type { DishPhoto } from "@/components/ui/DishVisual";
import type { MenuItem } from "@/data/menu";
import { localizePhotos } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";

/**
 * Convierte un plato de la CARTA en la ficha que ya usa "Platos estrella" (`DishSpotlight`).
 *
 * El cliente lo pidió así: "poder pinchar en un plato y ver la descripción del producto"; y lo que
 * busca es el gancho visual — "que entre por el ojo, que dé ganas de probarlo". Esa ficha ya existe,
 * ya le gusta y ya está resuelta por dentro (portal, foco atrapado, scroll bloqueado, hoja que sube
 * desde abajo en móvil, foto que viaja con `layoutId`). Reutilizarla, en vez de montar otro modal,
 * da a la carta el mismo golpe de vista y deja UNA sola manera de ver un plato en toda la web.
 *
 * Lo que no encaja es el DATO: un plato estrella trae titular escrito a mano, despiece de
 * ingredientes y un maridaje con vino, D.O. y porqué; uno de la carta trae, como mucho, una línea de
 * maridaje. Se rellena lo que hay y se deja vacío lo que no: `DishSpotlight` oculta cada bloque que
 * llegue vacío, así que la ficha de un plato sencillo sale corta y limpia en vez de con rótulos
 * huérfanos. El `kicker` lo pone la categoría ("Lonja gallega", "La especialidad de la casa"…), que
 * es justo el pie de foto que le faltaba.
 */
export function useMenuItemSlide(): (item: MenuItem, kicker: string) => DishSlide {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();

  /* El `kicker` llega de fuera, ya traducido: quien pinta cada sección (`CategorySection`) recibe su
     categoría YA localizada por `localizeCategories(locale)`, así que volver a buscarla aquí sería
     repetir el trabajo y arriesgarse a servir el texto en castellano dentro de la carta en gallego. */
  return useCallback(
    (item: MenuItem, kicker: string): DishSlide => {
      /* La foto buena es la del manifiesto (trae `alt` traducido a los cuatro idiomas y el punto de
         interés del recorte). La del plato es el respaldo, con un `alt` de plantilla. */
      const fromManifest = localizePhotos(locale).find((p) => p.dishIds?.includes(item.id));
      let photo: DishPhoto | null = null;
      if (fromManifest) {
        photo = { src: fromManifest.src, alt: fromManifest.alt, focus: fromManifest.focus };
      } else if (item.image) {
        photo = { src: item.image, alt: t(m.carta.photoOf, { name: item.name }), focus: "50% 50%" };
      }

      return {
        dish: {
          id: item.id,
          menuId: item.id,
          name: item.name,
          kicker,
          /* Sin titular: la descripción del plato manda y `DishSpotlight` se salta este bloque. */
          headline: "",
          description: item.description,
          ingredients: [],
          price: item.price,
          unit: item.unit ?? "",
          /* La media ración viaja a la ficha: en móvil la ficha ES la carta, y un plato que se puede
             pedir a mitad de precio no puede quedarse sin decirlo. */
          variants: item.variants,
          allergens: item.allergens,
          /* Solo el vino; la D.O. y el porqué son cosecha de los platos estrella. */
          pairing: { wine: item.pairing ?? "", do: "", why: "" },
          accent: "#B21E27",
          emoji: item.emoji,
          image: item.image,
        },
        photo,
      };
    },
    [locale, m.carta.photoOf, t],
  );
}
