/**
 * Catálogo de la maqueta, sacado de hungceed.es el 3/11/2026 (portada, /productos/, /maquinas-gimnasio/
 * y /pesas-gimnasio/). Las fotos se cargan de su web.
 *
 * Qué se ha cambiado respecto a su tienda, que es justo lo que se le enseña a Jose:
 *  · `nombre` es CORTO. El texto largo para Google («… | Power Cage Rack … | Hungceed») va en
 *    `nombreSeo`, que en WooCommerce iría al campo de SEO y no al nombre del producto.
 *  · Las categorías siguen el catálogo de verdad (la Attachment Series tiene la suya).
 *  · `precio` solo cuando su tienda lo publica. `null` = la ficha actual no enseña precio
 *    (en la maqueta sale «Consultar precio» con WhatsApp). Ninguno es inventado.
 */
export type Serie = "elite" | "pro" | "prelude" | "attachment";

export interface Producto {
  slug: string;
  nombre: string;
  nombreSeo: string;
  categoria: CategoriaSlug;
  serie?: Serie;
  /** Precio publicado en hungceed.es. `desde` = tiene variantes y empieza ahí. */
  precio: { valor: number; desde?: boolean } | null;
  imagen: string;
  /** La ficha actual en hungceed.es. */
  original: string;
  /** Sale en «Lo más elegido» de la portada. Solo productos CON precio publicado. */
  destacado?: boolean;
  /** Una frase corta (≤ 55 caracteres): cabe entera en dos líneas de la tarjeta, sin «…». */
  resumen: string;
}

export type CategoriaSlug = "racks" | "maquinas" | "attachment" | "bancos-barras" | "pesas" | "poleas";

export interface Categoria {
  slug: CategoriaSlug;
  nombre: string;
  descripcion: string;
  imagen: string;
}

const U = "https://hungceed.es/wp-content/uploads";

export const SERIES: Record<Serie, { nombre: string; lema: string }> = {
  elite: { nombre: "Elite Series", lema: "Máquinas selectorizadas de uso comercial" },
  pro: { nombre: "Pro Series", lema: "Plate loaded, para gimnasio y box" },
  prelude: { nombre: "Prelude Series", lema: "Resistencia variable, tamaño home gym" },
  attachment: { nombre: "Attachment Series", lema: "Accesorios que convierten tu rack en un gimnasio" },
};

export const CATEGORIAS: Categoria[] = [
  {
    slug: "racks",
    nombre: "Racks y jaulas",
    descripcion: "Jaulas de potencia, half racks y racks plegables de pared. El centro de cualquier home gym.",
    imagen: `${U}/2026/04/163.png`,
  },
  {
    slug: "maquinas",
    nombre: "Máquinas",
    descripcion: "Elite, Pro y Prelude Series: selectorizadas, de discos y de resistencia variable.",
    imagen: `${U}/2026/03/a98734b6-7992-4d1e-bb03-24a0b4512545-1024x731.jpg`,
  },
  {
    slug: "attachment",
    nombre: "Attachment Series",
    descripcion: "Accesorios para rack: extensión de cuádriceps, elevación lateral, hip thrust, ganchos y más.",
    imagen: `${U}/2026/03/image-Photoroom-3-1024x1024.png`,
  },
  {
    slug: "bancos-barras",
    nombre: "Bancos y barras",
    descripcion: "Bancos regulables y barras olímpicas de diseño propio.",
    imagen: `${U}/2026/03/H80b34419bb9f405ab033c3542256a2cak.jpg`,
  },
  {
    slug: "pesas",
    nombre: "Pesas",
    descripcion: "Mancuernas, discos, clubbells y almacenaje.",
    imagen: `${U}/2026/01/1-3-1024x683.jpg`,
  },
  {
    slug: "poleas",
    nombre: "Poleas y recambios",
    descripcion: "Cables, agarres y enganches para tus máquinas y tu rack.",
    imagen: `${U}/2026/03/Ha724bc7f101b4eb687d8c1145fac56615-Photoroom.png`,
  },
];

export const PRODUCTOS: Producto[] = [
  // Racks y jaulas
  {
    slug: "jaula-potencia-polea",
    nombre: "Jaula de potencia con polea",
    nombreSeo: "Jaula de Potencia con Polea Integrada | Power Cage Rack con Polea Alta y Baja | Hungceed",
    categoria: "racks",
    precio: { valor: 499 },
    imagen: `${U}/2026/04/163.png`,
    original: "https://hungceed.es/jaula-rack-con-polea-central/",
    destacado: true,
    resumen: "Barra libre y polea alta y baja en un solo rack.",
  },
  {
    slug: "half-rack",
    nombre: "Half rack con dominadas",
    nombreSeo: "Half Rack Musculación | Medio Rack con Barra Dominadas | Hungceed",
    categoria: "racks",
    precio: null,
    imagen: `${U}/2026/04/c94de42a67fc2e960007c61538f16f0a.jpeg`,
    original: "https://hungceed.es/half-rack/",
    resumen: "Medio rack compacto con barra de dominadas.",
  },
  {
    slug: "rack-abatible-pared",
    nombre: "Rack abatible de pared",
    nombreSeo: "Rack Abatible de Pared | Rack Plegable Wall Mount con Dominadas | Hungceed",
    categoria: "racks",
    precio: { valor: 550 },
    imagen: `${U}/2026/03/161-300x300.png`,
    original: "https://hungceed.es/rack-abatible-pared-palasi-series/",
    destacado: true,
    resumen: "Se pliega contra la pared. Con dominadas.",
  },
  {
    slug: "rack-plegable-frontal",
    nombre: "Rack plegable frontal",
    nombreSeo: "Rack Plegable Pared Frontal | Fold Back Wall Rack con Dominadas | Hungceed",
    categoria: "racks",
    precio: { valor: 550 },
    imagen: `${U}/2026/03/160-300x300.png`,
    original: "https://hungceed.es/rack-plegable-pared-frontal-palasi-series/",
    destacado: true,
    resumen: "Plegado frontal para garajes y salas pequeñas.",
  },
  // Máquinas
  {
    slug: "cruce-poleas-elite",
    nombre: "Cruce de poleas",
    nombreSeo: "Estación Cruce de Poleas Cable Crossover | Functional Trainer Doble Polea Ajustable | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/a98734b6-7992-4d1e-bb03-24a0b4512545-1024x731.jpg`,
    original: "https://hungceed.es/estacion-cruce-de-poleas-elite-serie/",
    resumen: "Doble polea ajustable de uso comercial.",
  },
  {
    slug: "aperturas-pecho-elite",
    nombre: "Aperturas de pecho (pec fly)",
    nombreSeo: "Máquina Aperturas de Pecho Contractora | Pec Fly Iso-Lateral | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/80ad5b61-e976-40db-a25a-fff263e94e19-1024x639.jpg`,
    original: "https://hungceed.es/maquina-aperturas-de-pecho-elite-serie/",
    resumen: "Contractora iso-lateral, cada lado por separado.",
  },
  {
    slug: "curl-femoral-elite",
    nombre: "Curl femoral tumbado",
    nombreSeo: "Máquina Curl Femoral Tumbado | Prone Leg Curl Selectorizada | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/4b4dd3e4-3351-4de7-9c88-c514e61b568a-1024x639.jpg`,
    original: "https://hungceed.es/maquina-curl-femoral-tumbado-elite-serie/",
    resumen: "Selectorizada, para isquios con recorrido completo.",
  },
  {
    slug: "deltoides-posterior-elite",
    nombre: "Deltoides posterior",
    nombreSeo: "Máquina Deltoides Posterior | Rear Delt Fly Machine Iso-Lateral | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/477f666d-e227-45a5-a106-99a3fb6b70d5-1024x731.jpg`,
    original: "https://hungceed.es/maquina-deltoides-posterior-elite-serie/",
    resumen: "Rear delt fly iso-lateral para hombro y espalda.",
  },
  {
    slug: "curl-scott-triceps-elite",
    nombre: "Curl Scott y extensión de tríceps",
    nombreSeo: "Máquina Curl Bíceps Scott y Extensión Tríceps | Dual Selectorizada | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/5b7a0b83-cb87-4813-9588-0b097d80ee6e-1024x640.jpg`,
    original: "https://hungceed.es/maquina-curl-de-biceps-scott-elite-serie/",
    resumen: "Bíceps y tríceps en el mismo puesto.",
  },
  {
    slug: "abductores-elite",
    nombre: "Abductores sentado",
    nombreSeo: "Máquina Abductores Sentado Selectorizada | Hip Abductor Machine Comercial | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/9f29d277-d666-4c63-80af-1afded918dd2-1024x640.jpg`,
    original: "https://hungceed.es/maquina-abductores-elite-serie/",
    resumen: "Selectorizada de uso comercial para glúteo medio.",
  },
  {
    slug: "aductores-elite",
    nombre: "Aductores sentado",
    nombreSeo: "Máquina Aductores Sentado Selectorizada | Hip Adductor Machine Comercial | Hungceed Elite Series",
    categoria: "maquinas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/02574082-5773-48ca-9ffb-fe763b1ea00e-1024x731.jpg`,
    original: "https://hungceed.es/maquina-adductores-elite-serie/",
    resumen: "Selectorizada de uso comercial para aductores.",
  },
  {
    slug: "curl-predicador-pro",
    nombre: "Curl predicador sentado",
    nombreSeo: "Curl Predicador Bíceps Sentado Plate Loaded | Preacher Curl Machine Pro | Hungceed Pro Series",
    categoria: "maquinas",
    serie: "pro",
    precio: null,
    imagen: `${U}/2026/01/Captura-de-pantalla-2025-04-29-a-las-16.36.37-1024x1024.jpg`,
    original: "https://hungceed.es/curl-predicador-biceps-sentado-hungceed-pro-series/",
    resumen: "Carga con discos, sin pila de placas.",
  },
  {
    slug: "aperturas-inclinada-pro",
    nombre: "Aperturas inclinada",
    nombreSeo: "Máquina Aperturas Pecho Inclinada Plate Loaded | Incline Fly Machine Pro | Hungceed Pro Series",
    categoria: "maquinas",
    serie: "pro",
    precio: null,
    imagen: `${U}/2026/01/Captura-de-pantalla-2025-04-29-a-las-16.28.17-1024x1024.jpg`,
    original: "https://hungceed.es/maquina-aperturas-inclinada-hungceed-pro-series/",
    resumen: "Pecho superior con carga de discos.",
  },
  {
    slug: "curl-isquios-pro",
    nombre: "Curl de isquios",
    nombreSeo: "MÁQUINA CURL ISQUIOS FEMORALES – HUNGCEED PRO SERIES",
    categoria: "maquinas",
    serie: "pro",
    precio: null,
    imagen: `${U}/2026/01/Captura-de-pantalla-2025-04-29-a-las-16.26.36-1024x829.jpg`,
    original: "https://hungceed.es/maquina-curl-isquios-femorales-hungceed-pro-series/",
    resumen: "Femoral de discos con recorrido largo.",
  },
  {
    slug: "gemelos-pro",
    nombre: "Elevación de gemelos",
    nombreSeo: "MAQUINA DE ELEVACIÓN DE GEMELOS – HUNGCEED PRO SERIES",
    categoria: "maquinas",
    serie: "pro",
    precio: null,
    imagen: `${U}/2026/01/Captura-de-pantalla-2025-04-29-a-las-23.06.52-1024x831.jpg`,
    original: "https://hungceed.es/maquina-de-elevacion-de-gemelos-hungceed-pro-series/",
    resumen: "Gemelo de pie con carga de discos.",
  },
  {
    slug: "jalon-lateral-prelude",
    nombre: "Jalón lateral",
    nombreSeo: "Jalón Lateral con Perfil de Resistencia Variable | Lat Pulldown Plate Loaded | Hungceed Prelude Series",
    categoria: "maquinas",
    serie: "prelude",
    precio: null,
    imagen: `${U}/2026/03/IMG_0139-Photoroom-774x1024.png`,
    original: "https://hungceed.es/jalon-lateral-prelude-series/",
    resumen: "Resistencia variable que acompaña al músculo.",
  },
  // Attachment Series
  {
    slug: "elevacion-lateral-rack",
    nombre: "Elevación lateral para rack",
    nombreSeo: "Elevación Lateral de Hombros para Rack | Accesorio para Jaula | Hungceed Attachment Series",
    categoria: "attachment",
    serie: "attachment",
    precio: { valor: 229.99 },
    imagen: `${U}/2026/03/image-Photoroom-3-1024x1024.png`,
    original: "https://hungceed.es/elevacion-lateral-de-hombros-para-rack-attachement-series/",
    destacado: true,
    resumen: "Convierte tu jaula en una máquina de hombro.",
  },
  {
    slug: "extension-cuadriceps-rack",
    nombre: "Extensión de cuádriceps para rack",
    nombreSeo: "Extensión de Cuádriceps Sin Asiento para Power Rack | Leg Extension Attachment Universal | Hungceed Attachment Series",
    categoria: "attachment",
    serie: "attachment",
    precio: { valor: 184.99 },
    imagen: `${U}/2026/03/H431434da9c07438398ed23c96443187aw.jpg`,
    original: "https://hungceed.es/extension-de-cuadriceps-rack-attach-series/",
    destacado: true,
    resumen: "Leg extension universal para cualquier rack.",
  },
  {
    slug: "extension-cuadriceps-asiento",
    nombre: "Extensión de cuádriceps con asiento",
    nombreSeo: "Extensión de Cuádriceps con Asiento para Rack | Leg Extension Attachment | Hungceed",
    categoria: "attachment",
    serie: "attachment",
    precio: null,
    imagen: `${U}/2026/03/Hf3cd6b0cc58545a2bd5e4cbe09cde0c40.jpg`,
    original: "https://hungceed.es/accesorio-extension-de-cuadriceps-rack-attach-series/",
    resumen: "Con asiento propio, sin necesidad de banco.",
  },
  {
    slug: "asiento-hip-thrust",
    nombre: "Asiento hip thrust para rack",
    nombreSeo: "Asiento Hip Thrust para Rack | Respaldo Giratorio | Hungceed Attachment Series",
    categoria: "attachment",
    serie: "attachment",
    precio: null,
    imagen: `${U}/2026/03/H04cf7da2ea3f4fabba87b72c46da9ff90.jpg`,
    original: "https://hungceed.es/respaldo-almohadilla-asiento-hip-thrust-para-rack-attachement-series/",
    resumen: "Respaldo giratorio para hip thrust estable.",
  },
  {
    slug: "doble-gancho-barra",
    nombre: "Doble gancho para barra",
    nombreSeo: "Doble Soporte Gancho para Barra de Pesas | Accesorio Power Rack Universal | Hungceed Attachment Series",
    categoria: "attachment",
    serie: "attachment",
    precio: null,
    imagen: `${U}/2026/03/image-Photoroom-8-823x1024.png`,
    original: "https://hungceed.es/doble-soporte-gancho-barra-de-pesas-attachement-series/",
    resumen: "Guarda la barra en el propio rack.",
  },
  {
    slug: "enganche-polea-suspension",
    nombre: "Enganche de polea en suspensión",
    nombreSeo: "Enganche Polea Suspensión para Rack | Abrazadera Universal con Mosquetón | Hungceed Attachment Series",
    categoria: "attachment",
    serie: "attachment",
    precio: null,
    imagen: `${U}/2026/03/H92b9b21e59c04608a46fdefd3939f8aci.jpg`,
    original: "https://hungceed.es/enganches-polea-en-suspension-rack/",
    resumen: "Abrazadera con mosquetón para colgar poleas.",
  },
  {
    slug: "multipower-smith",
    nombre: "Adaptadores multipower Smith 2.0",
    nombreSeo: "Adaptadores Multipower Smith 2.0 + Sistema de Poleas para Rack",
    categoria: "attachment",
    serie: "attachment",
    /* En su web sale «0,00 € – 274,99 €» (una variante sin precio). Hasta que lo corrija: consultar. */
    precio: null,
    imagen: `${U}/2026/03/Pau-Hungceed-49-683x1024.jpg`,
    original: "https://hungceed.es/multipower-personalizable/",
    resumen: "Multipower y poleas para tu rack, por piezas.",
  },
  {
    slug: "almacenamiento-barras",
    nombre: "Almacenaje rotativo de barras",
    nombreSeo: "Almacenamiento Rotativo Barras Olímpicas | Soporte Giratorio 10 Barras Suelo | Hungceed",
    categoria: "attachment",
    serie: "attachment",
    precio: null,
    imagen: `${U}/2026/03/76.png`,
    original: "https://hungceed.es/almacenamiento-rotativo-barras-attach-series/",
    resumen: "Soporte giratorio de suelo para 10 barras.",
  },
  // Bancos y barras
  {
    slug: "banco-triple-ajuste-elite",
    nombre: "Banco triple ajuste Elite",
    nombreSeo: "Banco Regulable Triple Ajuste ELITE | Banco Home Gym Multiposición con Cabezal Abatible | Hungceed",
    categoria: "bancos-barras",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/03/Hb92c83a2e7b94be6b24b97794dd926dfb.jpg`,
    original: "https://hungceed.es/banco-con-triple-ajuste-de-musculacion-pro/",
    resumen: "Multiposición con cabezal abatible.",
  },
  {
    slug: "banco-triple-ajuste-pro",
    nombre: "Banco triple ajuste Pro",
    nombreSeo: "Banco Regulable Triple Ajuste PRO | Banco Multiposición con Cabezal Abatible | Hungceed",
    categoria: "bancos-barras",
    serie: "pro",
    precio: null,
    imagen: `${U}/2026/03/H5455a9e0a3344d888c1e88e9013f1a55T-1024x1024.jpg`,
    original: "https://hungceed.es/banco-con-triple-ajuste-de-musculacion-elite/",
    resumen: "Respaldo, asiento y cabezal regulables.",
  },
  {
    slug: "barra-olimpica",
    nombre: "Barra olímpica 50 mm",
    nombreSeo: "Barra Olímpica 50mm | 1,8m y 2,20m | Diseño Exclusivo | Hungceed",
    categoria: "bancos-barras",
    precio: null,
    imagen: `${U}/2026/03/H80b34419bb9f405ab033c3542256a2cak.jpg`,
    original: "https://hungceed.es/barras-gimnasio/",
    resumen: "1,8 m y 2,20 m. Diseño exclusivo Hungceed.",
  },
  {
    slug: "pad-curl-hip-thrust",
    nombre: "Pad de curl y hip thrust",
    nombreSeo: "Pad Apoyo Curl Bíceps y Hip Thrust | Cojín Predicador Portátil | Hungceed",
    categoria: "bancos-barras",
    precio: null,
    imagen: `${U}/2026/03/AmazonSession-September_2022-34_1600x-1024x1024.jpg`,
    original: "https://hungceed.es/apoyo-curl-biceps-y-hip-thrust/",
    resumen: "Cojín predicador portátil, también hip thrust.",
  },
  // Pesas
  {
    slug: "mancuernas-ajustables",
    nombre: "Mancuernas ajustables 5–40 kg",
    nombreSeo: "Mancuernas Ajustables 5-40kg | Par Mancuernas Regulables Dial | Hungceed",
    categoria: "pesas",
    precio: { valor: 194.99, desde: true },
    imagen: `${U}/2026/05/ChatGPT-Image-6-may-2026-18_13_07-1024x1024.png`,
    original: "https://hungceed.es/mancuernas-regulables-ajustables/",
    destacado: true,
    resumen: "Un mancuernero entero en dos mancuernas.",
  },
  {
    slug: "mancuernas-hexagonales",
    nombre: "Mancuernas hexagonales",
    nombreSeo: "Mancuernas Hexagonales",
    categoria: "pesas",
    precio: null,
    imagen: `${U}/2026/01/1-3-1024x683.jpg`,
    original: "https://hungceed.es/mancuernas-hexagonales/",
    resumen: "No ruedan y aguantan el uso diario.",
  },
  {
    slug: "mancuernas-boxeo",
    nombre: "Mancuernas de boxeo",
    nombreSeo: "Mancuernas boxeo",
    categoria: "pesas",
    precio: null,
    imagen: `${U}/2026/01/1-23_d8d17a8e-6564-44bf-81d5-c035095549b6-1024x683.jpg`,
    original: "https://hungceed.es/mancuernas-boxeo/",
    resumen: "Ligeras, para golpeo y cardio.",
  },
  {
    slug: "discos-fraccionales",
    nombre: "Discos fraccionales Pack-Man",
    nombreSeo: "Discos Pack-Man fraccionales",
    categoria: "pesas",
    precio: null,
    imagen: `${U}/2026/01/Rodri-Hungceed-39-1024x683.jpg`,
    original: "https://hungceed.es/discos-pack-man-fraccionales-05-kg/",
    resumen: "Subidas pequeñas de carga para no estancarte.",
  },
  {
    slug: "clubbell",
    nombre: "Clubbell",
    nombreSeo: "Clubbell",
    categoria: "pesas",
    precio: { valor: 14.99, desde: true },
    imagen: `${U}/2026/01/c60e7a42-72b7-4b17-9941-9653aaa94247-683x1024.jpg`,
    original: "https://hungceed.es/clubbell/",
    resumen: "Mazas para movilidad y fuerza rotacional.",
  },
  {
    slug: "mancuernero-bandeja",
    nombre: "Mancuernero con bandeja",
    nombreSeo: "Mancuernero con Bandeja Deslizante | Rack Mancuernas Profesional Alta Capacidad | Hungceed",
    categoria: "pesas",
    serie: "prelude",
    precio: null,
    imagen: `${U}/2026/03/H9976c6173a44451bb64eb35a7125ab32L-1.jpg`,
    original: "https://hungceed.es/mancuernero-desplegable-prelude-series/",
    resumen: "Rack de mancuernas con bandeja deslizante.",
  },
  // Poleas y recambios
  {
    slug: "polea-doble-elite",
    nombre: "Polea doble ajustable",
    nombreSeo: "Polea Doble Ajustable | Functional Trainer Dual Cable | Hungceed Elite Series",
    categoria: "poleas",
    serie: "elite",
    precio: null,
    imagen: `${U}/2026/02/340a812d-39ac-4788-ba2e-43b3e0606023-300x300.jpg`,
    original: "https://hungceed.es/polea-doble-ajustable-elite-serie/",
    resumen: "Functional trainer de doble cable.",
  },
  {
    slug: "cables-polea",
    nombre: "Cables de polea",
    nombreSeo: "Cables de Polea para Máquinas de Gimnasio | Acero Recubierto con Bola y Arandela | Hungceed | 1,3m · 2,6m · 3m",
    categoria: "poleas",
    precio: null,
    imagen: `${U}/2026/03/Ha724bc7f101b4eb687d8c1145fac56615-Photoroom.png`,
    original: "https://hungceed.es/cables-de-polea/",
    resumen: "Acero recubierto. 1,3 · 2,6 · 3 m.",
  },
  {
    slug: "agarres-conicos",
    nombre: "Agarres cónicos para polea",
    nombreSeo: "Agarres Cónicos para Polea | Aluminio o Nylon | Par con Mosquetón | Hungceed",
    categoria: "poleas",
    precio: null,
    imagen: `${U}/2026/03/Hbb6b33e593a8457c945a4b153712b225L.png`,
    original: "https://hungceed.es/ganchos-iberadores-de-peso/",
    resumen: "Par con mosquetón, en aluminio o nylon.",
  },
];

export const categoriaPorSlug = (slug: string) => CATEGORIAS.find((c) => c.slug === slug);
export const productoPorSlug = (slug: string) => PRODUCTOS.find((p) => p.slug === slug);
export const productosDe = (slug: CategoriaSlug) => PRODUCTOS.filter((p) => p.categoria === slug);

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export function precioTexto(p: Producto["precio"]): string {
  if (!p) return "Consultar precio";
  return `${p.desde ? "Desde " : ""}${EUR.format(p.valor)}`;
}
