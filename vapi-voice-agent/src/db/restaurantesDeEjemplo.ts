/**
 * Restaurantes de demostracion que viven en el codigo.
 *
 * Se sirven por su id (?business=hilderwin) aunque no esten en Firestore, para
 * poder ensenarlos sin un paso de "subir la ficha". Si algun dia se guarda uno
 * en Firestore con el mismo id, manda el de Firestore.
 *
 * Los textos que lee el agente van en ingles con los nombres de los platos en
 * neerlandes: el agente habla neerlandes, frances, ingles o aleman segun quien
 * llame, y un prompt en castellano le colaba palabras en castellano.
 */

import type { Restaurante } from "./restaurante";

/** Abierto lunes, jueves, viernes, sabado y domingo. Martes y miercoles cierra. */
const DIAS_ABIERTO = [1, 4, 5, 6, 7];

const cadaDia = (desde: string, hasta: string, dias = DIAS_ABIERTO) =>
  dias.map((dia) => ({ dia, desde, hasta }));

/**
 * Restaurant Hilderwin, Westende (Flandes Occidental). Datos de su web,
 * hilderwin.be, del 23-11-2026: ver comercial/hilderwin/CONTEXTO.md en la rama
 * claude/life-plan-app-design-mtq0cw. Nada de aqui lo ha confirmado todavia
 * el restaurante: es una demo.
 */
export const HILDERWIN: Restaurante = {
  modo: "reservas",
  id: "hilderwin",
  nombre: "Restaurant Hilderwin",
  ciudad: "Westende",
  direccion: "Priorijlaan 14, 8434 Westende (Middelkerke), Belgium",
  telefono: "059 31 04 94",
  web: "hilderwin.be",
  zonaHoraria: "Europe/Brussels",
  tipoLabel: "classic Belgian coastal restaurant (fresh fish, meat, mussels in season)",

  idiomas: ["nl", "fr", "en", "de"],
  saludo:
    "Goeiedag, restaurant Hilderwin in Westende. U spreekt met de automatische assistent. " +
    "Waarmee kan ik u helpen? Vous pouvez aussi parler en français.",

  // "Hans Claesen - Conversational - Vlaams", de la Voice Library de
  // ElevenLabs: voz masculina flamenca, pensada para conversacion, la mas usada
  // de las flamencas. flash v2.5 habla neerlandes, frances, ingles y aleman y
  // va rapido, que en telefono es lo que importa. Sin idioma fijado: si el
  // cliente habla frances, la voz lee el frances como frances.
  voz: {
    proveedor: "11labs",
    voiceId: "FpLGR2n1CcG1v7SHJFsa",
    modelo: "eleven_flash_v2_5",
    velocidad: 1,
  },

  horario: {
    apertura: [...cadaDia("12:00", "15:00"), ...cadaDia("18:00", "22:00")],
    cocina: [...cadaDia("12:00", "14:00"), ...cadaDia("18:00", "21:00")],
    diasCierre: [2, 3],
  },

  reservas: {
    // Lunes, jueves, viernes y domingo: de 12:00 a 13:30 y de 18:00 a 20:00.
    // Sabado: de 12:00 a 13:30, y por la noche solo los turnos de las 18:00 y
    // las 20:00.
    franjas: [...cadaDia("12:00", "13:30"), ...cadaDia("18:00", "20:00", [1, 4, 5, 7])],
    turnos: [{ dia: 6, horas: ["18:00", "20:00"] }],
    pasoMinutos: 15,
    // En su web se reserva de 1 a 8 personas; mas de 8 tienen que llamar.
    maxPersonas: 8,
    antelacionMinimaMinutos: 60,
    diasVista: 120,
    notas: [
      "During Flemish school holidays the restaurant works with two fixed evening sittings, at 18:00 and 20:00, on every open day. You do not know the holiday dates: if the caller mentions the holidays, suggest 18:00 or 20:00 for the evening.",
      "Reservations can also be made on the website hilderwin.be, for 1 to 8 people. Groups of more than 8 people always have to call: that is exactly what you are for.",
    ],
  },

  informacion: [
    {
      titulo: "Menu (de kaart)",
      texto: [
        "Set menus: house menu (huismenu) 37 euro, gourmet menu 45 euro, sole menu (tongmenu) 60 euro, and the daily suggestions.",
        "Starters: soup of the day, frog legs (kikkerbilletjes), cheese croquettes (kaaskroketten), grey shrimp croquettes (garnaalkroketten), 6 scampi (with garlic or house style), carpaccio, grilled gambas, shrimp cocktail.",
        "Fish: the chef's fish casserole (vispannetje) 30 euro, salmon with béarnaise, cod loin with mustard sauce, sole (daily price), scampi skewer, fish skewer, gambas, tomato stuffed with grey shrimp (tomaat garnaal), gratinated sole rolls, royal fish soup.",
        "Meat: steak and entrecôte with a sauce of choice (pepper, béarnaise, mushroom, house sauce, garlic butter), mixed skewer, pork knuckle with mustard sauce, chicken vol-au-vent, steak tartare.",
        "Mussels in season (daily price): natural, with white wine, with garlic, with garlic and cream.",
        "Also: pasta and lasagne (also vegetarian), salads, ice cream coupes and homemade desserts.",
        "Meat and mussel dishes come with fries, bread, croquettes or mashed potatoes.",
        "Only the prices written here are known. For any other dish say you do not have the exact price and that the full menu with prices is on hilderwin.be.",
      ].join("\n"),
    },
    {
      titulo: "Daily suggestions and fresh fish",
      texto:
        "There are daily suggestions (suggesties van de dag) that change. The fish is fresh, so fish dishes depend on the day: some may not be available and some prices vary (sole and mussels are at the daily price). You do NOT know today's suggestions, today's fish or today's prices: say so honestly, explain that it depends on the day, and offer to leave a message so the restaurant can call back.",
    },
    {
      titulo: "Location and parking",
      texto:
        "Priorijlaan 14, 8434 Westende, next to the 'tennisput', about 200 metres from the seafront (de zeedijk). There is parking nearby. You do not know more about parking (paid or free, number of places): do not make it up.",
    },
    {
      titulo: "Gift vouchers (cadeaubonnen)",
      texto:
        "Gift vouchers are sold online on hilderwin.be (you receive them as a PDF, valid for 2 years) or at the restaurant.",
    },
    {
      titulo: "House rules",
      texto: [
        "One table, one bill: the bill is not split per person.",
        "Large groups: better to book in advance; the restaurant may ask a group to choose from a limited selection.",
        "If guests arrive more than 15 minutes late, the table is not guaranteed.",
      ].join("\n"),
    },
    {
      titulo: "Allergies and diets",
      texto:
        "You have no allergen information. There are vegetarian options (vegetarian pasta and lasagne, salads). For allergies or special diets: never guess. Add it to the notes of the reservation, or take a message so the kitchen can call back.",
    },
    {
      titulo: "Contact",
      texto:
        "Phone 059 31 04 94, e-mail info@hilderwin.be, website hilderwin.be (in Dutch, French, English and German). The restaurant is run by Stefanie, Jonas, Nora and Olivia.",
    },
  ],

  palabrasClave: [
    "Hilderwin",
    "Westende",
    "Middelkerke",
    "Priorijlaan",
    "tennisput",
    "zeedijk",
    "reservatie",
    "cadeaubon",
    "vispannetje",
    "scampi",
    "tong",
    "tongmenu",
    "mosselen",
    "kikkerbilletjes",
    "garnaalkroketten",
    "kaaskroketten",
    "tomaat garnaal",
    "vol-au-vent",
    "entrecote",
    "bearnaise",
    "steak tartaar",
    "lasagne",
  ],
};

export const RESTAURANTES_DE_EJEMPLO: Record<string, Restaurante> = {
  hilderwin: HILDERWIN,
};
