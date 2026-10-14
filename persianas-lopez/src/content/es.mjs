// Textos en castellano. La versión en gallego está en gl.mjs con la misma estructura.

export default {
  lang: 'es',
  locale: 'es_ES',
  prefijo: '',
  otroIdioma: { codigo: 'gl', etiqueta: 'Galego', corto: 'GL' },

  rutas: {
    inicio: '/',
    catalogo: '/repuestos/',
    aviso: '/aviso-legal/',
    privacidad: '/privacidad/',
    cookies: '/cookies/',
    servicio: (slug) => `/servicios/${slug}/`
  },

  ui: {
    saltar: 'Saltar al contenido',
    menu: 'Menú',
    cerrar: 'Cerrar',
    abrirMenu: 'Abrir menú',
    cerrarMenu: 'Cerrar menú',
    navegacion: 'Navegación',
    inicioAria: 'Persianas López, volver al inicio',
    llamar: 'Llamar',
    llamarAria: 'Llamar a Persianas López al 657 97 13 13',
    whatsapp: 'WhatsApp',
    whatsappAria: 'Escribir por WhatsApp a Persianas López (se abre en una pestaña nueva)',
    escribirWa: 'Escribir por WhatsApp',
    presupuesto: 'Presupuesto',
    pedirPresupuesto: 'Pedir Presupuesto Sin Compromiso',
    verServicios: 'Ver Servicios',
    atascada: '¿Persiana atascada?',
    atascadaTexto: 'Te atendemos por teléfono, por WhatsApp o en la tienda.',
    direccion: 'Dirección',
    telefonoWa: 'Teléfono y WhatsApp',
    comoLlegar: 'Cómo llegar',
    comoLlegarAria: 'Cómo llegar a Persianas López con Google Maps (se abre en una pestaña nueva)',
    horario: 'Horario',
    horarioTexto: 'Lunes a viernes, hasta las 20:00',
    horarioNota: 'Llámanos para confirmar el horario de tienda.',
    volverArriba: 'Volver arriba',
    leerResenas: 'Leer las reseñas en Google',
    leerResenasAria: 'Ver las reseñas de Persianas López en Google Maps (se abre en una pestaña nueva)',
    resenasGoogle: 'reseñas en Google Maps',
    valoracionAria: 'Valoración de 4,4 sobre 5 estrellas',
    mapaTitulo: 'Mapa de ubicación de Persianas López en Rúa Bonhome, 10, Ourense',
    mapaBoton: 'Ver el mapa',
    mapaAviso: 'El mapa lo sirve Google y puede usar sus propias cookies. Solo se carga si pulsas el botón.',
    cookiesAviso: 'Esta web no usa cookies de seguimiento. El mapa de Google solo se carga si lo pides.',
    cookiesEntendido: 'Entendido',
    cookiesMas: 'Más información',
    legal: 'Información legal',
    avisoLegal: 'Aviso legal',
    privacidad: 'Política de privacidad',
    cookies: 'Política de cookies',
    dondeEstamos: 'Dónde estamos',
    servicios: 'Servicios',
    derechos: 'Todos los derechos reservados.',
    pie: 'Reparaciones a domicilio, venta y colocación de persianas, mosquiteras, estores, mamparas y repuestos en Ourense.',
    migas: 'Estás en',
    inicio: 'Inicio',
    preguntasFrecuentes: 'Preguntas frecuentes',
    otrosServicios: 'Otros servicios',
    comoTrabajamos: '¿Cómo trabajamos?',
    pasos: [
      ['Nos cuentas el problema', 'Por teléfono, WhatsApp o pasándote por la tienda.'],
      ['Presupuesto sin compromiso', 'Te explicamos la solución y el precio antes de empezar.'],
      ['Reparación o instalación', 'Trabajo limpio, rápido y con material de calidad.']
    ],
    preguntarWa: 'Preguntar por WhatsApp',
    abrirAsistente: 'Calcular presupuesto',
    noEncontrado: 'Página no encontrada',
    noEncontradoTexto: 'La página que buscas no existe o ha cambiado de sitio.',
    volverInicio: 'Volver al inicio'
  },

  nav: [
    { id: 'inicio', ancla: '#inicio', etiqueta: 'Inicio', desc: 'Vuelve a la portada' },
    { id: 'servicios', ancla: '#servicios', etiqueta: 'Servicios', desc: 'Persianas, mosquiteras, estores y mamparas' },
    { id: 'galeria', ancla: '#galeria', etiqueta: 'Galería', desc: 'Persianas y estores que colocamos' },
    { id: 'repuestos', ancla: '#repuestos', etiqueta: 'Repuestos', desc: 'Cintas, lamas, ejes y accesorios en tienda' },
    { id: 'ubicacion', ancla: '#ubicacion', etiqueta: 'Ubicación', desc: 'Rúa Bonhome, 10 · Ourense' },
    { id: 'contacto', ancla: '#contacto', etiqueta: 'Contacto', desc: 'Llámanos o escríbenos por WhatsApp' }
  ],

  home: {
    title: 'Persianas en Ourense | Instalación y Reparación | Persianas López',
    description: 'Reparación, venta y colocación de persianas de aluminio y PVC en Ourense. Mosquiteras, estores, venecianas, mamparas de baño y repuestos. Rúa Bonhome, 10. Llama al 657 97 13 13.',
    h1: 'Instalación y Reparación de Persianas en Ourense',
    lema: 'Reparaciones a domicilio · Venta y colocación de todo tipo de persianas',
    bajar: 'Descubre lo que hacemos',
    cinta: ['Reparaciones a domicilio', 'Aluminio', 'PVC', 'Compactos', 'Accesorios y motores', 'Venecianas', 'Verticales', 'Estores', 'Fantasías', 'Velux', 'Rústicas', 'Mosquiteras', 'Mamparas de baño', 'Puertas plegables'],
    servicios: {
      chip: 'Nuestros servicios',
      titulo: 'Todo para tus ventanas, en un solo sitio',
      texto: 'Medimos, fabricamos, instalamos y reparamos. Si tu persiana no sube, se ha soltado la cinta o quieres cambiarla por una nueva, en Persianas López te lo solucionamos.',
      verMas: 'Ver servicio',
      fotoTitulo: '¿No sabes qué necesitas?',
      fotoTexto: 'Mándanos una foto de tu persiana o ventana por WhatsApp y te decimos cómo arreglarla y cuánto cuesta.',
      fotoBoton: 'Enviar foto',
      fotoWa: 'Hola, os envío una foto de mi persiana.'
    },
    galeria: {
      chip: 'Galería',
      titulo: 'Persianas y estores que colocamos',
      texto: 'Algunos de los modelos que vendemos e instalamos. Pregúntanos por cualquiera de ellos.',
      boton: 'Pedir presupuesto',
      items: [
        ['estor-noche-dia', 'Estores noche y día', 'Bandas opacas y translúcidas que regulan la luz sin tener que subir el estor.', 'Hola, quiero información sobre estores noche y día.'],
        ['venecianas', 'Venecianas de aluminio', 'Lamas orientables en muchos colores. Ideales para cocinas, baños y oficinas.', 'Hola, quiero información sobre venecianas.'],
        ['estores-enrollables', 'Estores enrollables', 'Tejidos que filtran el sol y dejan ver el exterior. A medida para cada ventana.', 'Hola, quiero información sobre estores enrollables.']
      ]
    },
    repuestos: {
      chip: 'Repuestos directos',
      titulo: 'La pieza que buscas, sin esperas',
      texto: 'Tenemos en tienda los repuestos más habituales para persianas de aluminio y PVC. Trae la pieza vieja o una foto y te damos la correcta en el momento.',
      lista: [
        ['Cintas y recogedores', 'De varios anchos y modelos'],
        ['Lamas sueltas', 'Aluminio y PVC, varios colores'],
        ['Ejes, poleas y rodamientos', 'Para cajones de persiana'],
        ['Topes, guías y tapas', 'Y pequeños accesorios']
      ],
      boton: 'Ver catálogo y colores'
    },
    confianza: {
      titulo: 'Por qué nos eligen en Ourense',
      nota: '/ 5 en Google Maps',
      basado: 'Basado en',
      resenas: 'reseñas de clientes',
      razones: [
        ['rayo', 'Rapidez en las reparaciones', 'Una persiana que no sube no puede esperar semanas. Damos prioridad a las averías para que recuperes la normalidad en casa cuanto antes.'],
        ['personas', 'Trato cercano y honesto', 'Negocio de barrio: te atendemos en persona, te explicamos qué tiene tu persiana y no te vendemos lo que no necesitas.'],
        ['tienda', 'Tienda física con repuestos', 'Estamos en Rúa Bonhome, 10. Puedes venir con la pieza en la mano y llevarte el repuesto adecuado ese mismo día.']
      ]
    },
    asistente: {
      chip: 'Presupuesto en 1 minuto',
      titulo: 'Te preparamos el presupuesto',
      texto: 'Nuestro asistente te hace cuatro preguntas rápidas y nos manda tu solicitud por WhatsApp con todo listo. Sin registros ni formularios largos.',
      puntos: [
        ['escudo', 'Sin compromiso'],
        ['camara', 'Puedes adjuntar fotos en el chat de WhatsApp'],
        ['regla', 'Si tienes las medidas, mejor; si no, te ayudamos']
      ],
      boton: 'Empezar presupuesto'
    },
    faq: [
      ['¿Hacéis reparaciones a domicilio?', 'Sí. Vamos a tu casa a reparar la persiana. Llámanos o escríbenos por WhatsApp al 657 97 13 13 y quedamos.'],
      ['¿Ponéis motores a las persianas?', 'Sí, vendemos y colocamos motores y accesorios para persianas. Pregúntanos por tu modelo.'],
      ['¿El presupuesto tiene algún compromiso?', 'No. Te explicamos qué le pasa a tu persiana y cuánto cuesta arreglarla antes de empezar, sin compromiso.'],
      ['¿Puedo comprar solo el repuesto y arreglarla yo?', 'Sí. En la tienda de Rúa Bonhome, 10 vendemos cintas, lamas, recogedores, ejes y demás accesorios. Trae la pieza vieja o una foto y te damos la correcta.'],
      ['¿Trabajáis persianas de aluminio y de PVC?', 'Sí, reparamos, vendemos y colocamos persianas de aluminio y de PVC.'],
      ['Mi persiana no sube, ¿qué hago?', 'No la fuerces tirando de la cinta. Mándanos una foto o un vídeo por WhatsApp al 657 97 13 13 y te decimos cómo solucionarlo.'],
      ['¿Qué tipos de mosquiteras hacéis?', 'Mosquiteras enrollables, plisadas y fijas, a medida para ventanas y puertas.']
    ],
    faqChip: 'Dudas frecuentes',
    faqTitulo: 'Preguntas rápidas',
    contacto: {
      chip: 'Contacto',
      titulo: 'Ven a vernos o llámanos',
      texto: 'Atendemos en tienda, por teléfono y por WhatsApp. Pide tu presupuesto sin compromiso.',
      ctaTitulo: '¿Tu persiana se ha atascado?',
      ctaTexto: 'Llámanos ahora y te decimos cómo lo solucionamos.'
    }
  },

  servicios: [
    {
      id: 'reparacion', slug: 'reparacion-persianas', icono: 'llave',
      titulo: 'Persianas de aluminio y PVC',
      corto: 'Reparación, venta y colocación de todo tipo de persianas: cambio de cinta, lamas rotas, ejes y recogedores. Persianas nuevas a medida para tu vivienda o local.',
      metaTitle: 'Reparación de Persianas en Ourense | Aluminio y PVC | Persianas López',
      metaDesc: 'Reparamos persianas de aluminio y PVC en Ourense: cinta rota, lamas sueltas, persiana atascada o caída. Presupuesto sin compromiso. Tel. 657 97 13 13.',
      h1: 'Reparación de persianas en Ourense',
      intro: 'Si tu persiana no sube, baja torcida, se ha roto la cinta o se ha caído dentro del cajón, vamos a tu casa y te la arreglamos. Trabajamos persianas de aluminio y de PVC y, si no merece la pena repararla, te hacemos una nueva a medida.',
      puntos: ['Reparaciones a domicilio', 'Cambio de cinta y recogedor', 'Lamas rotas, sueltas o dobladas', 'Ejes, poleas y rodamientos', 'Motores y accesorios', 'Aluminio, PVC, compactos y rústicas'],
      problemasTitulo: 'Averías más habituales',
      problemas: [
        ['La cinta se ha roto o está deshilachada', 'Es la avería más común. Cambiamos la cinta y, si hace falta, el recogedor.'],
        ['La persiana no sube o se queda a medias', 'Suele ser un problema del eje, de una lama descolgada o del recogedor. Lo revisamos y te decimos qué tiene antes de tocar nada.'],
        ['Se ha caído dentro del cajón', 'Recolocamos la persiana en el eje y cambiamos las piezas que se hayan dañado.'],
        ['Lamas rotas o que dejan pasar la luz', 'Sustituimos las lamas dañadas por otras del mismo material y, si las hay, del mismo color.']
      ],
      faq: [
        ['¿Cuánto cuesta arreglar una persiana?', 'Depende de la avería y de las piezas. Mándanos una foto o un vídeo por WhatsApp y te damos el precio antes de empezar.'],
        ['¿Me conviene reparar o cambiar la persiana?', 'Si el resto de la persiana está bien, casi siempre compensa reparar. Si las lamas están muy deterioradas, te lo decimos y te presupuestamos una nueva.']
      ],
      wa: 'Hola, quiero arreglar una persiana.'
    },
    {
      id: 'mosquiteras', slug: 'mosquiteras', icono: 'mosquitera',
      titulo: 'Mosquiteras',
      corto: 'Mosquiteras enrollables, plisadas y fijas, fabricadas a medida para ventanas y puertas. Disfruta del aire fresco sin insectos en casa.',
      metaTitle: 'Mosquiteras a Medida en Ourense | Enrollables, Plisadas y Fijas | Persianas López',
      metaDesc: 'Mosquiteras a medida en Ourense para ventanas y puertas: enrollables, plisadas y fijas. Te asesoramos sobre el tipo que mejor te va. Tel. 657 97 13 13.',
      h1: 'Mosquiteras a medida en Ourense',
      intro: 'Abre las ventanas en verano sin que te entren mosquitos. Hacemos mosquiteras a medida para ventanas y puertas y te ayudamos a elegir el sistema que mejor encaja con tu casa.',
      puntos: ['Mosquiteras enrollables', 'Mosquiteras plisadas', 'Mosquiteras fijas', 'Para ventanas y puertas', 'Fabricadas a medida', 'Asesoramiento en tienda'],
      problemasTitulo: '¿Qué tipo te conviene?',
      problemas: [
        ['Enrollable', 'Se recoge en un cajón pequeño cuando no la usas. Muy práctica para ventanas.'],
        ['Plisada', 'Se pliega como un acordeón y apenas ocupa. Ideal para puertas y salidas a terraza.'],
        ['Fija', 'La opción más sencilla para ventanas que no necesitas abrir hacia fuera.']
      ],
      faq: [
        ['¿Necesito darte las medidas?', 'Si las tienes, mejor. Si no, te explicamos cómo tomarlas o lo vemos contigo.'],
        ['¿Sirven para puerta de terraza?', 'Sí, para puertas suele recomendarse la plisada porque se pasa por ella con facilidad.']
      ],
      wa: 'Hola, quiero información sobre mosquiteras.'
    },
    {
      id: 'estores', slug: 'estores-venecianas', icono: 'sol',
      titulo: 'Estores, venecianas y cortinas',
      corto: 'Controla la luz y gana intimidad con estores enrollables, venecianas y cortinas. Te asesoramos sobre tejidos, colores y sistemas de accionamiento.',
      metaTitle: 'Estores y Venecianas en Ourense | Persianas López',
      metaDesc: 'Estores enrollables, venecianas y cortinas en Ourense. Te asesoramos sobre tejidos, colores y accionamientos. Presupuesto sin compromiso. Tel. 657 97 13 13.',
      h1: 'Estores, venecianas y cortinas en Ourense',
      intro: 'Para regular la luz y ganar intimidad sin renunciar a la decoración. Te enseñamos opciones de estores, venecianas y cortinas y te aconsejamos según la estancia.',
      puntos: ['Estores enrollables', 'Estores noche y día', 'Venecianas', 'Verticales', 'Fantasías', 'Estores para Velux', 'Cortinas', 'Instalación'],
      problemasTitulo: 'Para cada estancia',
      problemas: [
        ['Salón', 'Estores o cortinas que filtran la luz sin dejarte a oscuras.'],
        ['Dormitorio', 'Opciones más opacas para descansar mejor.'],
        ['Cocina y baño', 'Venecianas, fáciles de limpiar y de orientar.']
      ],
      faq: [
        ['¿Puedo ver los tejidos?', 'Sí, pásate por la tienda y te enseñamos las opciones.'],
        ['¿Los instaláis vosotros?', 'Sí, te los colocamos para que queden bien ajustados.']
      ],
      wa: 'Hola, quiero información sobre estores o venecianas.'
    },
    {
      id: 'mamparas', slug: 'mamparas-puertas-plegables', icono: 'ducha',
      titulo: 'Mamparas y puertas plegables',
      corto: 'Mamparas de baño para ducha y bañera, y puertas plegables que ahorran espacio. Instalación limpia y acabado profesional.',
      metaTitle: 'Mamparas de Baño y Puertas Plegables en Ourense | Persianas López',
      metaDesc: 'Mamparas de baño para ducha y bañera y puertas plegables en Ourense. Instalación limpia. Presupuesto sin compromiso. Tel. 657 97 13 13.',
      h1: 'Mamparas de baño y puertas plegables en Ourense',
      intro: 'Cambia la cortina de la ducha por una mampara y gana en limpieza y comodidad. También colocamos puertas plegables para aprovechar el espacio en pasillos, armarios o cocinas.',
      puntos: ['Mamparas de ducha', 'Mamparas de bañera', 'Puertas plegables', 'Toma de medidas', 'Instalación limpia', 'Acabado profesional'],
      problemasTitulo: '¿Cuándo merece la pena?',
      problemas: [
        ['Baños pequeños', 'Una mampara bien elegida evita salpicaduras y da sensación de amplitud.'],
        ['Pasillos y armarios', 'Una puerta plegable no necesita espacio de apertura como una batiente.']
      ],
      faq: [
        ['¿Hay que hacer obra?', 'Normalmente no. Te lo confirmamos al ver el baño o con unas fotos.'],
        ['¿Medís vosotros?', 'Sí, tomamos las medidas para que la mampara encaje bien.']
      ],
      wa: 'Hola, quiero información sobre mamparas o puertas plegables.'
    }
  ],

  catalogo: {
    title: 'Repuestos de Persianas en Ourense | Cintas, Lamas y Accesorios | Persianas López',
    description: 'Repuestos de persianas en Ourense: cintas, recogedores, lamas de aluminio y PVC, ejes, poleas, topes y guías. Tienda en Rúa Bonhome, 10. Tel. 657 97 13 13.',
    h1: 'Repuestos y accesorios para persianas',
    intro: 'Tenemos en tienda los repuestos más habituales. Trae la pieza vieja o mándanos una foto por WhatsApp y te decimos si la tenemos.',
    notaImagenes: 'Imágenes ilustrativas. Consulta disponibilidad, medidas y modelos en tienda.',
    pedir: 'Preguntar por WhatsApp',
    piezas: [
      { id: 'cinta', nombre: 'Cinta de persiana', texto: 'En varios anchos y colores. La avería más común: cámbiala antes de que se rompa del todo.' },
      { id: 'recogedor', nombre: 'Recogedor de cinta', texto: 'El mecanismo que enrolla la cinta en la pared. De superficie o empotrado.' },
      { id: 'lama-aluminio', nombre: 'Lama de aluminio', texto: 'Lamas sueltas para sustituir las dañadas sin cambiar toda la persiana.' },
      { id: 'lama-pvc', nombre: 'Lama de PVC', texto: 'Ligera y económica. Varios colores habituales.' },
      { id: 'eje', nombre: 'Eje o tubo', texto: 'El tubo del cajón donde se enrolla la persiana.' },
      { id: 'polea', nombre: 'Polea y rodamientos', texto: 'Para que la persiana suba suave y sin ruidos.' },
      { id: 'topes', nombre: 'Topes', texto: 'Evitan que la persiana se meta del todo en el cajón.' },
      { id: 'guias', nombre: 'Guías', texto: 'Los carriles laterales por los que baja la persiana.' }
    ],
    coloresTitulo: 'Colores de lama',
    coloresTexto: 'Muestrario orientativo de colores habituales. Los colores disponibles pueden variar: confírmalos en tienda.',
    probar: 'Pulsa un color para verlo en la persiana',
    preguntarColor: 'Preguntar por este color',
    colores: [
      ['blanco', 'Blanco', '#F4F6F8', '#D5DBE1'],
      ['crema', 'Crema', '#EFE6CF', '#D6C8A6'],
      ['plata', 'Gris plata', '#C9CED3', '#9AA2AA'],
      ['antracita', 'Gris antracita', '#4A5058', '#2E3238'],
      ['marron', 'Marrón', '#6B4A33', '#4A3020'],
      ['bronce', 'Bronce', '#8C6A45', '#664A2C'],
      ['madera', 'Imitación madera', '#A87B4F', '#7A5432'],
      ['verde', 'Verde', '#3F6B4E', '#2A4A35']
    ]
  },


  legal: {
    aviso: {
      title: 'Aviso legal | Persianas López',
      h1: 'Aviso legal',
      secciones: (s) => [
        ['Titular de la web', `<p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:</p><ul><li>Titular: ${s.titular.nombre}</li><li>NIF: ${s.titular.nif}</li><li>Domicilio: ${s.direccion}, ${s.cp} ${s.ciudad}</li><li>Teléfono: ${s.telefonoVisible}</li><li>Correo electrónico: ${s.titular.email}</li></ul>`],
        ['Objeto', '<p>Esta web informa sobre los servicios de reparación, venta y colocación de persianas, mosquiteras, estores, mamparas y repuestos de Persianas López, y facilita el contacto por teléfono y WhatsApp.</p>'],
        ['Propiedad intelectual', '<p>Los textos, el diseño y los elementos gráficos de esta web pertenecen a su titular o se usan con licencia. No se permite su reproducción sin autorización.</p>'],
        ['Responsabilidad', '<p>La información de la web es orientativa. Los precios y la disponibilidad se confirman siempre de forma personal antes de cualquier trabajo. El titular no se hace responsable del contenido de webs de terceros enlazadas, como Google Maps o WhatsApp.</p>'],
        ['Legislación aplicable', '<p>Esta web se rige por la legislación española.</p>']
      ]
    },
    privacidad: {
      title: 'Política de privacidad | Persianas López',
      h1: 'Política de privacidad',
      secciones: (s) => [
        ['Responsable del tratamiento', `<p>${s.titular.nombre} (NIF ${s.titular.nif}), ${s.direccion}, ${s.cp} ${s.ciudad}. Correo: ${s.titular.email}.</p>`],
        ['Qué datos tratamos', '<p>Esta web no tiene formularios que guarden datos ni áreas de usuario. Cuando usas el asistente de presupuesto, el mensaje se compone en tu propio navegador y se abre WhatsApp: los datos solo nos llegan si tú decides enviar ese mensaje. Si nos llamas o nos escribes, tratamos tu nombre, tu teléfono y lo que nos cuentes para atender tu consulta y darte presupuesto.</p>'],
        ['Para qué y con qué base', '<p>Usamos esos datos para responderte, preparar el presupuesto y, si lo aceptas, realizar el trabajo. La base es la aplicación de medidas precontractuales a petición tuya y, en su caso, la ejecución del contrato.</p>'],
        ['Cuánto tiempo', '<p>Conservamos los datos mientras dure la relación y, después, durante los plazos que exija la ley (por ejemplo, obligaciones fiscales).</p>'],
        ['Con quién se comparten', '<p>No cedemos tus datos a terceros salvo obligación legal. Si nos escribes por WhatsApp, ese servicio lo presta Meta Platforms con sus propias condiciones. La web se aloja en Vercel, que registra datos técnicos de acceso (como la dirección IP) por motivos de seguridad.</p>'],
        ['Estadísticas', '<p>Para saber cuántas visitas, llamadas y mensajes llegan desde la web usamos, si está activada, una herramienta de estadísticas sin cookies que no identifica a las personas.</p>'],
        ['Tus derechos', '<p>Puedes pedir el acceso, la rectificación, la supresión, la oposición, la limitación o la portabilidad de tus datos escribiendo al correo indicado arriba. Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>']
      ]
    },
    cookies: {
      title: 'Política de cookies | Persianas López',
      h1: 'Política de cookies',
      secciones: () => [
        ['¿Usa cookies esta web?', '<p>No. Esta web no instala cookies propias ni de seguimiento, y no usa publicidad.</p>'],
        ['Almacenamiento en tu navegador', '<p>Guardamos en tu navegador (almacenamiento local) solo dos preferencias técnicas: que ya has visto el aviso de cookies y, si lo pides, que quieres ver el mapa. No sirven para identificarte y puedes borrarlas desde tu navegador.</p>'],
        ['Mapa de Google', '<p>El mapa de la sección de contacto lo sirve Google y puede instalar sus propias cookies. Por eso no se carga hasta que pulsas «Ver el mapa». Más información en la política de privacidad de Google.</p>'],
        ['Estadísticas sin cookies', '<p>Si están activadas, las estadísticas de visitas se miden sin cookies y sin identificar a nadie.</p>'],
        ['Cambios', '<p>Si en el futuro añadimos cookies que necesiten tu permiso, te lo pediremos antes de usarlas.</p>']
      ]
    }
  },

  chat: {
    titulo: 'Asistente de presupuesto',
    subtitulo: 'Respuesta por WhatsApp',
    abrir: 'Abrir el asistente de presupuesto',
    cerrar: 'Cerrar el asistente',
    escribiendo: 'Escribiendo…',
    saltar: 'Saltar',
    enviarTexto: 'Enviar',
    placeholder: 'Escribe aquí…',
    hola: '¡Hola! 👋 Soy el asistente de Persianas López. Te preparo la solicitud de presupuesto en un minuto y se la mandamos al equipo por WhatsApp.',
    queNecesitas: '¿Qué necesitas?',
    servicios: {
      reparar: {
        etiqueta: 'Reparar una persiana',
        pasos: [
          ['averia', '¿Qué le pasa?', ['No sube o no baja', 'Cinta rota', 'Lamas rotas o sueltas', 'Se ha caído', 'Hace ruido', 'Otra cosa']],
          ['material', '¿De qué material es?', ['Aluminio', 'PVC', 'No lo sé']],
          ['accionamiento', '¿Cómo se acciona?', ['Con cinta', 'Con motor', 'No lo sé']]
        ]
      },
      nueva: {
        etiqueta: 'Persiana nueva',
        pasos: [
          ['material', '¿De qué material la quieres?', ['Aluminio', 'PVC', 'Aconsejadme']],
          ['cantidad', '¿Cuántas persianas?', ['1', '2', '3 a 5', 'Más de 5']],
          ['medidas', 'Si tienes las medidas aproximadas (ancho × alto), escríbelas. Si no, pulsa «Saltar».', null]
        ]
      },
      mosquitera: {
        etiqueta: 'Mosquitera',
        pasos: [
          ['tipo', '¿Qué tipo prefieres?', ['Enrollable', 'Plisada', 'Fija', 'Aconsejadme']],
          ['donde', '¿Dónde va?', ['Ventana', 'Puerta', 'Varias']],
          ['cantidad', '¿Cuántas?', ['1', '2', '3 a 5', 'Más de 5']]
        ]
      },
      estor: {
        etiqueta: 'Estor o veneciana',
        pasos: [
          ['tipo', '¿Qué te interesa?', ['Estor enrollable', 'Veneciana', 'Cortina', 'Aconsejadme']],
          ['cantidad', '¿Para cuántas ventanas?', ['1', '2', '3 a 5', 'Más de 5']]
        ]
      },
      mampara: {
        etiqueta: 'Mampara o puerta plegable',
        pasos: [
          ['tipo', '¿Qué necesitas?', ['Mampara de ducha', 'Mampara de bañera', 'Puerta plegable']],
          ['medidas', 'Si tienes las medidas aproximadas, escríbelas. Si no, pulsa «Saltar».', null]
        ]
      },
      repuesto: {
        etiqueta: 'Un repuesto',
        pasos: [
          ['pieza', '¿Qué pieza buscas?', ['Cinta', 'Recogedor', 'Lama', 'Eje o polea', 'Otra']],
          ['material', '¿La persiana es de aluminio o PVC?', ['Aluminio', 'PVC', 'No lo sé']]
        ]
      }
    },
    comunes: [
      ['cuando', '¿Para cuándo lo necesitas?', ['Es urgente', 'Esta semana', 'Sin prisa']],
      ['zona', '¿En qué barrio o zona estás?', null],
      ['nombre', '¿Cómo te llamas?', null]
    ],
    etiquetas: { servicio: 'Servicio', averia: 'Avería', material: 'Material', accionamiento: 'Accionamiento', cantidad: 'Cantidad', medidas: 'Medidas', tipo: 'Tipo', donde: 'Dónde', pieza: 'Pieza', cuando: 'Para cuándo', zona: 'Zona', nombre: 'Nombre' },
    resumen: 'Perfecto, este es el resumen de tu solicitud:',
    precio: 'Precio orientativo',
    sinPrecio: 'El precio exacto te lo damos por WhatsApp. Si nos mandas una foto o un vídeo, mejor todavía.',
    enviar: 'Enviar por WhatsApp',
    reiniciar: 'Empezar de nuevo',
    llamarMejor: 'Prefiero llamar',
    gracias: '¡Listo! Se ha abierto WhatsApp con tu solicitud. Solo tienes que pulsar enviar.',
    mensaje: 'Hola, quiero pedir presupuesto (desde la web):'
  }
};
