// Textos en galego. Mesma estrutura que es.mjs.

export default {
  lang: 'gl',
  locale: 'gl_ES',
  prefijo: '/gl',
  otroIdioma: { codigo: 'es', etiqueta: 'Castellano', corto: 'ES' },

  rutas: {
    inicio: '/gl/',
    catalogo: '/gl/recambios/',
    aviso: '/gl/aviso-legal/',
    privacidad: '/gl/privacidade/',
    cookies: '/gl/cookies/',
    servicio: (slug) => `/gl/servizos/${slug}/`,
    zona: (slug) => `/gl/zonas/${slug}/`
  },

  ui: {
    saltar: 'Saltar ao contido',
    menu: 'Menú',
    cerrar: 'Pechar',
    abrirMenu: 'Abrir o menú',
    cerrarMenu: 'Pechar o menú',
    navegacion: 'Navegación',
    inicioAria: 'Persianas López, volver ao inicio',
    llamar: 'Chamar',
    llamarAria: 'Chamar a Persianas López ao 657 97 13 13',
    whatsapp: 'WhatsApp',
    whatsappAria: 'Escribir por WhatsApp a Persianas López (ábrese nunha lapela nova)',
    escribirWa: 'Escribir por WhatsApp',
    presupuesto: 'Orzamento',
    pedirPresupuesto: 'Pedir Orzamento Sen Compromiso',
    verServicios: 'Ver Servizos',
    atascada: 'Persiana atascada?',
    atascadaTexto: 'Atendémoste por teléfono, por WhatsApp ou na tenda.',
    direccion: 'Enderezo',
    telefonoWa: 'Teléfono e WhatsApp',
    comoLlegar: 'Como chegar',
    comoLlegarAria: 'Como chegar a Persianas López con Google Maps (ábrese nunha lapela nova)',
    horario: 'Horario',
    horarioTexto: 'Luns a venres, ata as 20:00',
    horarioNota: 'Chámanos para confirmar o horario da tenda.',
    volverArriba: 'Volver arriba',
    leerResenas: 'Ler as recensións en Google',
    leerResenasAria: 'Ver as recensións de Persianas López en Google Maps (ábrese nunha lapela nova)',
    resenasGoogle: 'recensións en Google Maps',
    valoracionAria: 'Valoración de 4,4 sobre 5 estrelas',
    mapaTitulo: 'Mapa da localización de Persianas López na Rúa Bonhome, 10, Ourense',
    mapaBoton: 'Ver o mapa',
    mapaAviso: 'O mapa sérveo Google e pode usar as súas propias cookies. Só se carga se premes o botón.',
    cookiesAviso: 'Esta web non usa cookies de seguimento. O mapa de Google só se carga se o pides.',
    cookiesEntendido: 'Entendido',
    cookiesMas: 'Máis información',
    legal: 'Información legal',
    avisoLegal: 'Aviso legal',
    privacidad: 'Política de privacidade',
    cookies: 'Política de cookies',
    dondeEstamos: 'Onde estamos',
    servicios: 'Servizos',
    zonas: 'Zonas de Ourense',
    derechos: 'Todos os dereitos reservados.',
    pie: 'Reparación, venda e colocación de persianas, mosquiteiras, estores, mamparas e recambios en Ourense.',
    migas: 'Estás en',
    inicio: 'Inicio',
    preguntasFrecuentes: 'Preguntas frecuentes',
    otrosServicios: 'Outros servizos',
    otrasZonas: 'Tamén traballamos en',
    comoTrabajamos: 'Como traballamos?',
    pasos: [
      ['Cóntasnos o problema', 'Por teléfono, WhatsApp ou pasando pola tenda.'],
      ['Orzamento sen compromiso', 'Explicámosche a solución e o prezo antes de comezar.'],
      ['Reparación ou instalación', 'Traballo limpo, rápido e con material de calidade.']
    ],
    preguntarWa: 'Preguntar por WhatsApp',
    abrirAsistente: 'Calcular orzamento',
    noEncontrado: 'Páxina non atopada',
    noEncontradoTexto: 'A páxina que buscas non existe ou cambiou de sitio.',
    volverInicio: 'Volver ao inicio'
  },

  nav: [
    { id: 'inicio', ancla: '#inicio', etiqueta: 'Inicio', desc: 'Volve á portada' },
    { id: 'servicios', ancla: '#servicios', etiqueta: 'Servizos', desc: 'Persianas, mosquiteiras, estores e mamparas' },
    { id: 'repuestos', ancla: '#repuestos', etiqueta: 'Recambios', desc: 'Cintas, lamas, eixes e accesorios na tenda' },
    { id: 'ubicacion', ancla: '#ubicacion', etiqueta: 'Localización', desc: 'Rúa Bonhome, 10 · Ourense' },
    { id: 'contacto', ancla: '#contacto', etiqueta: 'Contacto', desc: 'Chámanos ou escríbenos por WhatsApp' }
  ],

  home: {
    title: 'Persianas en Ourense | Instalación e Reparación | Persianas López',
    description: 'Reparación, venda e colocación de persianas de aluminio e PVC en Ourense. Mosquiteiras, estores, venecianas, mamparas de baño e recambios. Rúa Bonhome, 10. Chama ao 657 97 13 13.',
    chip: 'Tenda e taller na Rúa Bonhome, Ourense',
    h1: 'Instalación e Reparación de Persianas en Ourense',
    subtitulo: 'Especialistas en persianas, mosquiteiras, estores e peches. Rapidez, calidade e recambios directos na Rúa Bonhome.',
    aviso: 'Desliza para subir a persiana',
    tarjetas: [
      ['Recambios na tenda', 'Lévaa peza no momento'],
      ['Reparacións rápidas', 'Aluminio e PVC']
    ],
    cinta: ['Persianas de aluminio', 'Persianas de PVC', 'Mosquiteiras', 'Estores', 'Venecianas', 'Mamparas de baño', 'Portas pregables', 'Recambios'],
    servicios: {
      chip: 'Os nosos servizos',
      titulo: 'Todo para as túas fiestras, nun só sitio',
      texto: 'Medimos, fabricamos, instalamos e reparamos. Se a túa persiana non sobe, se soltou a cinta ou queres cambiala por unha nova, en Persianas López solucionámoscho.',
      verMas: 'Ver servizo',
      fotoTitulo: 'Non sabes que necesitas?',
      fotoTexto: 'Mándanos unha foto da túa persiana ou fiestra por WhatsApp e dicímosche como arranxala e canto custa.',
      fotoBoton: 'Enviar foto',
      fotoWa: 'Ola, envíovos unha foto da miña persiana.'
    },
    repuestos: {
      chip: 'Recambios directos',
      titulo: 'A peza que buscas, sen esperas',
      texto: 'Temos na tenda os recambios máis habituais para persianas de aluminio e PVC. Trae a peza vella ou unha foto e dámosche a correcta no momento.',
      lista: [
        ['Cintas e recolledores', 'De varios anchos e modelos'],
        ['Lamas soltas', 'Aluminio e PVC, varias cores'],
        ['Eixes, poleas e rolamentos', 'Para caixóns de persiana'],
        ['Topes, guías e tapas', 'E pequenos accesorios']
      ],
      boton: 'Ver catálogo e cores'
    },
    confianza: {
      titulo: 'Por que nos escollen en Ourense',
      nota: '/ 5 en Google Maps',
      basado: 'Baseado en',
      resenas: 'recensións de clientes',
      razones: [
        ['rayo', 'Rapidez nas reparacións', 'Unha persiana que non sobe non pode agardar semanas. Damos prioridade ás avarías para que recuperes a normalidade na casa canto antes.'],
        ['personas', 'Trato próximo e honesto', 'Negocio de barrio: atendémoste en persoa, explicámosche que ten a túa persiana e non che vendemos o que non necesitas.'],
        ['tienda', 'Tenda física con recambios', 'Estamos na Rúa Bonhome, 10. Podes vir coa peza na man e levar o recambio axeitado ese mesmo día.']
      ]
    },
    asistente: {
      chip: 'Orzamento nun minuto',
      titulo: 'Preparámosche o orzamento',
      texto: 'O noso asistente faiche catro preguntas rápidas e mándanos a túa solicitude por WhatsApp con todo listo. Sen rexistros nin formularios longos.',
      puntos: [
        ['escudo', 'Sen compromiso'],
        ['camara', 'Podes achegar fotos no chat de WhatsApp'],
        ['regla', 'Se tes as medidas, mellor; se non, axudámosche']
      ],
      boton: 'Comezar orzamento'
    },
    zonas: {
      chip: 'Por toda a cidade',
      titulo: 'Persianas no teu barrio de Ourense',
      texto: 'Dende a tenda da Rúa Bonhome atendemos veciños de toda a cidade.'
    },
    faq: [
      ['O orzamento ten algún compromiso?', 'Non. Explicámosche que lle pasa á túa persiana e canto custa arranxala antes de comezar, sen compromiso.'],
      ['Podo mercar só o recambio e arranxala eu?', 'Si. Na tenda da Rúa Bonhome, 10 vendemos cintas, lamas, recolledores, eixes e demais accesorios. Trae a peza vella ou unha foto e dámosche a correcta.'],
      ['Traballades persianas de aluminio e de PVC?', 'Si, reparamos, vendemos e colocamos persianas de aluminio e de PVC.'],
      ['A miña persiana non sobe, que fago?', 'Non a forces tirando da cinta. Mándanos unha foto ou un vídeo por WhatsApp ao 657 97 13 13 e dicímosche como solucionalo.'],
      ['Que tipos de mosquiteiras facedes?', 'Mosquiteiras enrolables, plisadas e fixas, á medida para fiestras e portas.']
    ],
    faqChip: 'Dúbidas frecuentes',
    faqTitulo: 'Preguntas rápidas',
    contacto: {
      chip: 'Contacto',
      titulo: 'Ven vernos ou chámanos',
      texto: 'Atendemos na tenda, por teléfono e por WhatsApp. Pide o teu orzamento sen compromiso.',
      ctaTitulo: 'A túa persiana atascouse?',
      ctaTexto: 'Chámanos agora e dicímosche como o solucionamos.'
    }
  },

  servicios: [
    {
      id: 'reparacion', slug: 'reparacion-persianas', icono: 'llave',
      titulo: 'Persianas de aluminio e PVC',
      corto: 'Reparación, venda e colocación de todo tipo de persianas: cambio de cinta, lamas rotas, eixes e recolledores. Persianas novas á medida para a túa vivenda ou local.',
      metaTitle: 'Reparación de Persianas en Ourense | Aluminio e PVC | Persianas López',
      metaDesc: 'Reparamos persianas de aluminio e PVC en Ourense: cinta rota, lamas soltas, persiana atascada ou caída. Orzamento sen compromiso. Tel. 657 97 13 13.',
      h1: 'Reparación de persianas en Ourense',
      intro: 'Se a túa persiana non sobe, baixa torta, rompeu a cinta ou caeu dentro do caixón, arranxámola. Traballamos persianas de aluminio e de PVC e, se non paga a pena reparala, facémosche unha nova á medida.',
      puntos: ['Cambio de cinta e recolledor', 'Lamas rotas, soltas ou dobradas', 'Eixes, poleas e rolamentos', 'Guías, topes e lama final', 'Persianas novas á medida', 'Aluminio e PVC'],
      problemasTitulo: 'Avarías máis habituais',
      problemas: [
        ['A cinta rompeu ou está esfiañada', 'É a avaría máis común. Cambiamos a cinta e, se fai falla, o recolledor.'],
        ['A persiana non sobe ou queda a medias', 'Adoita ser un problema do eixe, dunha lama descolgada ou do recolledor. Revisámolo e dicímosche que ten antes de tocar nada.'],
        ['Caeu dentro do caixón', 'Recolocamos a persiana no eixe e cambiamos as pezas que se danasen.'],
        ['Lamas rotas ou que deixan pasar a luz', 'Substituímos as lamas danadas por outras do mesmo material e, se as hai, da mesma cor.']
      ],
      faq: [
        ['Canto custa arranxar unha persiana?', 'Depende da avaría e das pezas. Mándanos unha foto ou un vídeo por WhatsApp e dámosche o prezo antes de comezar.'],
        ['Convenme reparar ou cambiar a persiana?', 'Se o resto da persiana está ben, case sempre compensa reparar. Se as lamas están moi deterioradas, dicímoscho e orzamentámosche unha nova.']
      ],
      wa: 'Ola, quero arranxar unha persiana.'
    },
    {
      id: 'mosquiteras', slug: 'mosquiteiras', icono: 'mosquitera',
      titulo: 'Mosquiteiras',
      corto: 'Mosquiteiras enrolables, plisadas e fixas, fabricadas á medida para fiestras e portas. Goza do aire fresco sen insectos na casa.',
      metaTitle: 'Mosquiteiras á Medida en Ourense | Enrolables, Plisadas e Fixas | Persianas López',
      metaDesc: 'Mosquiteiras á medida en Ourense para fiestras e portas: enrolables, plisadas e fixas. Asesorámoste sobre o tipo que mellor che vai. Tel. 657 97 13 13.',
      h1: 'Mosquiteiras á medida en Ourense',
      intro: 'Abre as fiestras no verán sen que che entren mosquitos. Facemos mosquiteiras á medida para fiestras e portas e axudámosche a escoller o sistema que mellor encaixa coa túa casa.',
      puntos: ['Mosquiteiras enrolables', 'Mosquiteiras plisadas', 'Mosquiteiras fixas', 'Para fiestras e portas', 'Fabricadas á medida', 'Asesoramento na tenda'],
      problemasTitulo: 'Que tipo che convén?',
      problemas: [
        ['Enrolable', 'Recóllese nun caixón pequeno cando non a usas. Moi práctica para fiestras.'],
        ['Plisada', 'Prégase coma un acordeón e apenas ocupa. Ideal para portas e saídas a terraza.'],
        ['Fixa', 'A opción máis sinxela para fiestras que non precisas abrir cara a fóra.']
      ],
      faq: [
        ['Teño que darvos as medidas?', 'Se as tes, mellor. Se non, explicámosche como tomalas ou vémolo contigo.'],
        ['Serven para a porta da terraza?', 'Si, para portas adoita recomendarse a plisada porque se pasa por ela con facilidade.']
      ],
      wa: 'Ola, quero información sobre mosquiteiras.'
    },
    {
      id: 'estores', slug: 'estores-venecianas', icono: 'sol',
      titulo: 'Estores, venecianas e cortinas',
      corto: 'Controla a luz e gaña intimidade con estores enrolables, venecianas e cortinas. Asesorámoste sobre tecidos, cores e sistemas de accionamento.',
      metaTitle: 'Estores e Venecianas en Ourense | Persianas López',
      metaDesc: 'Estores enrolables, venecianas e cortinas en Ourense. Asesorámoste sobre tecidos, cores e accionamentos. Orzamento sen compromiso. Tel. 657 97 13 13.',
      h1: 'Estores, venecianas e cortinas en Ourense',
      intro: 'Para regular a luz e gañar intimidade sen renunciar á decoración. Ensinámosche opcións de estores, venecianas e cortinas e aconsellámoste segundo a estancia.',
      puntos: ['Estores enrolables', 'Venecianas', 'Cortinas', 'Asesoramento de tecidos e cores', 'Sistemas de accionamento', 'Instalación'],
      problemasTitulo: 'Para cada estancia',
      problemas: [
        ['Salón', 'Estores ou cortinas que filtran a luz sen deixarte ás escuras.'],
        ['Dormitorio', 'Opcións máis opacas para descansar mellor.'],
        ['Cociña e baño', 'Venecianas, doadas de limpar e de orientar.']
      ],
      faq: [
        ['Podo ver os tecidos?', 'Si, pasa pola tenda e ensinámosche as opcións.'],
        ['Instaládelos vós?', 'Si, colocámolos para que queden ben axustados.']
      ],
      wa: 'Ola, quero información sobre estores ou venecianas.'
    },
    {
      id: 'mamparas', slug: 'mamparas-portas-pregables', icono: 'ducha',
      titulo: 'Mamparas e portas pregables',
      corto: 'Mamparas de baño para ducha e bañeira, e portas pregables que aforran espazo. Instalación limpa e acabado profesional.',
      metaTitle: 'Mamparas de Baño e Portas Pregables en Ourense | Persianas López',
      metaDesc: 'Mamparas de baño para ducha e bañeira e portas pregables en Ourense. Instalación limpa. Orzamento sen compromiso. Tel. 657 97 13 13.',
      h1: 'Mamparas de baño e portas pregables en Ourense',
      intro: 'Cambia a cortina da ducha por unha mampara e gaña en limpeza e comodidade. Tamén colocamos portas pregables para aproveitar o espazo en corredores, armarios ou cociñas.',
      puntos: ['Mamparas de ducha', 'Mamparas de bañeira', 'Portas pregables', 'Toma de medidas', 'Instalación limpa', 'Acabado profesional'],
      problemasTitulo: 'Cando paga a pena?',
      problemas: [
        ['Baños pequenos', 'Unha mampara ben escollida evita salpicaduras e dá sensación de amplitude.'],
        ['Corredores e armarios', 'Unha porta pregable non precisa espazo de apertura coma unha batente.']
      ],
      faq: [
        ['Hai que facer obra?', 'Normalmente non. Confirmámoscho ao ver o baño ou con unhas fotos.'],
        ['Medides vós?', 'Si, tomamos as medidas para que a mampara encaixe ben.']
      ],
      wa: 'Ola, quero información sobre mamparas ou portas pregables.'
    }
  ],

  catalogo: {
    title: 'Recambios de Persianas en Ourense | Cintas, Lamas e Accesorios | Persianas López',
    description: 'Recambios de persianas en Ourense: cintas, recolledores, lamas de aluminio e PVC, eixes, poleas, topes e guías. Tenda na Rúa Bonhome, 10. Tel. 657 97 13 13.',
    h1: 'Recambios e accesorios para persianas',
    intro: 'Temos na tenda os recambios máis habituais. Trae a peza vella ou mándanos unha foto por WhatsApp e dicímosche se a temos.',
    notaImagenes: 'Imaxes ilustrativas. Consulta dispoñibilidade, medidas e modelos na tenda.',
    pedir: 'Preguntar por WhatsApp',
    piezas: [
      { id: 'cinta', nombre: 'Cinta de persiana', texto: 'En varios anchos e cores. A avaría máis común: cámbiaa antes de que rompa de todo.' },
      { id: 'recogedor', nombre: 'Recolledor de cinta', texto: 'O mecanismo que enrola a cinta na parede. De superficie ou empotrado.' },
      { id: 'lama-aluminio', nombre: 'Lama de aluminio', texto: 'Lamas soltas para substituír as danadas sen cambiar toda a persiana.' },
      { id: 'lama-pvc', nombre: 'Lama de PVC', texto: 'Lixeira e económica. Varias cores habituais.' },
      { id: 'eje', nombre: 'Eixe ou tubo', texto: 'O tubo do caixón onde se enrola a persiana.' },
      { id: 'polea', nombre: 'Polea e rolamentos', texto: 'Para que a persiana suba suave e sen ruídos.' },
      { id: 'topes', nombre: 'Topes', texto: 'Evitan que a persiana se meta de todo no caixón.' },
      { id: 'guias', nombre: 'Guías', texto: 'Os carrís laterais polos que baixa a persiana.' }
    ],
    coloresTitulo: 'Cores de lama',
    coloresTexto: 'Mostrario orientativo de cores habituais. As cores dispoñibles poden variar: confírmaas na tenda.',
    probar: 'Preme unha cor para vela na persiana',
    preguntarColor: 'Preguntar por esta cor',
    colores: [
      ['blanco', 'Branco', '#F4F6F8', '#D5DBE1'],
      ['crema', 'Crema', '#EFE6CF', '#D6C8A6'],
      ['plata', 'Gris prata', '#C9CED3', '#9AA2AA'],
      ['antracita', 'Gris antracita', '#4A5058', '#2E3238'],
      ['marron', 'Marrón', '#6B4A33', '#4A3020'],
      ['bronce', 'Bronce', '#8C6A45', '#664A2C'],
      ['madera', 'Imitación madeira', '#A87B4F', '#7A5432'],
      ['verde', 'Verde', '#3F6B4E', '#2A4A35']
    ]
  },

  zonas: [
    { id: 'o-couto', slug: 'o-couto', nombre: 'O Couto', intro: 'Se vives no Couto e a túa persiana atascouse ou queres cambiala, estamos moi preto: tenda e taller na Rúa Bonhome, 10.' },
    { id: 'a-ponte', slug: 'a-ponte', nombre: 'A Ponte', intro: 'Veciños da Ponte: reparamos persianas, poñemos mosquiteiras e temos recambios para que non teñas que agardar.' },
    { id: 'o-vinteun', slug: 'o-vinteun', nombre: 'O Vinteún', intro: 'No Vinteún hai moitos pisos con persianas de aluminio e PVC de hai anos. Arranxámolas ou cambiámolas por outras novas á medida.' },
    { id: 'marinamansa', slug: 'marinamansa', nombre: 'Mariñamansa', intro: 'Se estás en Mariñamansa, chámanos ou mándanos unha foto por WhatsApp e dicímosche como solucionar o da túa persiana.' },
    { id: 'o-polvorin', slug: 'o-polvorin', nombre: 'O Polvorín', intro: 'No Polvorín axudámoste con persianas, mosquiteiras, estores e mamparas, e cos recambios para que o arranxes ti se o prefires.' }
  ],
  zonaTextos: {
    title: (n) => `Persianas en ${n} (Ourense) | Reparación e Instalación | Persianas López`,
    description: (n) => `Reparación e instalación de persianas, mosquiteiras e estores en ${n}, Ourense. Recambios na Rúa Bonhome, 10. Orzamento sen compromiso: 657 97 13 13.`,
    h1: (n) => `Persianas en ${n}, Ourense`,
    queHacemos: (n) => `Que facemos en ${n}`
  },

  legal: {
    aviso: {
      title: 'Aviso legal | Persianas López',
      h1: 'Aviso legal',
      secciones: (s) => [
        ['Titular da web', `<p>En cumprimento da Lei 34/2002, de servizos da sociedade da información e de comercio electrónico (LSSI-CE), infórmase dos datos do titular deste sitio web:</p><ul><li>Titular: ${s.titular.nombre}</li><li>NIF: ${s.titular.nif}</li><li>Domicilio: ${s.direccion}, ${s.cp} ${s.ciudad}</li><li>Teléfono: ${s.telefonoVisible}</li><li>Correo electrónico: ${s.titular.email}</li></ul>`],
        ['Obxecto', '<p>Esta web informa sobre os servizos de reparación, venda e colocación de persianas, mosquiteiras, estores, mamparas e recambios de Persianas López, e facilita o contacto por teléfono e WhatsApp.</p>'],
        ['Propiedade intelectual', '<p>Os textos, o deseño e os elementos gráficos desta web pertencen ao seu titular ou úsanse con licenza. Non se permite a súa reprodución sen autorización.</p>'],
        ['Responsabilidade', '<p>A información da web é orientativa. Os prezos e a dispoñibilidade confírmanse sempre de forma persoal antes de calquera traballo. O titular non se fai responsable do contido de webs de terceiros ligadas, como Google Maps ou WhatsApp.</p>'],
        ['Lexislación aplicable', '<p>Esta web réxese pola lexislación española.</p>']
      ]
    },
    privacidad: {
      title: 'Política de privacidade | Persianas López',
      h1: 'Política de privacidade',
      secciones: (s) => [
        ['Responsable do tratamento', `<p>${s.titular.nombre} (NIF ${s.titular.nif}), ${s.direccion}, ${s.cp} ${s.ciudad}. Correo: ${s.titular.email}.</p>`],
        ['Que datos tratamos', '<p>Esta web non ten formularios que garden datos nin áreas de usuario. Cando usas o asistente de orzamento, a mensaxe compónse no teu propio navegador e ábrese WhatsApp: os datos só nos chegan se ti decides enviar esa mensaxe. Se nos chamas ou nos escribes, tratamos o teu nome, o teu teléfono e o que nos contes para atender a túa consulta e darche orzamento.</p>'],
        ['Para que e con que base', '<p>Usamos eses datos para responderche, preparar o orzamento e, se o aceptas, realizar o traballo. A base é a aplicación de medidas precontractuais por petición túa e, se é o caso, a execución do contrato.</p>'],
        ['Canto tempo', '<p>Conservamos os datos mentres dure a relación e, despois, durante os prazos que esixa a lei (por exemplo, obrigas fiscais).</p>'],
        ['Con quen se comparten', '<p>Non cedemos os teus datos a terceiros salvo obriga legal. Se nos escribes por WhatsApp, ese servizo préstao Meta Platforms coas súas propias condicións. A web alóxase en Vercel, que rexistra datos técnicos de acceso (como o enderezo IP) por motivos de seguridade.</p>'],
        ['Estatísticas', '<p>Para saber cantas visitas, chamadas e mensaxes chegan dende a web usamos, se está activada, unha ferramenta de estatísticas sen cookies que non identifica as persoas.</p>'],
        ['Os teus dereitos', '<p>Podes pedir o acceso, a rectificación, a supresión, a oposición, a limitación ou a portabilidade dos teus datos escribindo ao correo indicado arriba. Se cres que non atendemos ben a túa solicitude, podes reclamar ante a Axencia Española de Protección de Datos (aepd.es).</p>']
      ]
    },
    cookies: {
      title: 'Política de cookies | Persianas López',
      h1: 'Política de cookies',
      secciones: () => [
        ['Usa cookies esta web?', '<p>Non. Esta web non instala cookies propias nin de seguimento, e non usa publicidade.</p>'],
        ['Almacenamento no teu navegador', '<p>Gardamos no teu navegador (almacenamento local) só dúas preferencias técnicas: que xa viches o aviso de cookies e, se o pides, que queres ver o mapa. Non serven para identificarte e podes borralas dende o teu navegador.</p>'],
        ['Mapa de Google', '<p>O mapa da sección de contacto sérveo Google e pode instalar as súas propias cookies. Por iso non se carga ata que premes «Ver o mapa». Máis información na política de privacidade de Google.</p>'],
        ['Estatísticas sen cookies', '<p>Se están activadas, as estatísticas de visitas mídense sen cookies e sen identificar a ninguén.</p>'],
        ['Cambios', '<p>Se no futuro engadimos cookies que precisen o teu permiso, pedirémolo antes de usalas.</p>']
      ]
    }
  },

  chat: {
    titulo: 'Asistente de orzamento',
    subtitulo: 'Resposta por WhatsApp',
    abrir: 'Abrir o asistente de orzamento',
    cerrar: 'Pechar o asistente',
    escribiendo: 'Escribindo…',
    saltar: 'Saltar',
    enviarTexto: 'Enviar',
    placeholder: 'Escribe aquí…',
    hola: 'Ola! 👋 Son o asistente de Persianas López. Prepárote a solicitude de orzamento nun minuto e mandámoslla ao equipo por WhatsApp.',
    queNecesitas: 'Que necesitas?',
    servicios: {
      reparar: {
        etiqueta: 'Arranxar unha persiana',
        pasos: [
          ['averia', 'Que lle pasa?', ['Non sobe ou non baixa', 'Cinta rota', 'Lamas rotas ou soltas', 'Caeu', 'Fai ruído', 'Outra cousa']],
          ['material', 'De que material é?', ['Aluminio', 'PVC', 'Non o sei']],
          ['accionamiento', 'Como se acciona?', ['Con cinta', 'Con motor', 'Non o sei']]
        ]
      },
      nueva: {
        etiqueta: 'Persiana nova',
        pasos: [
          ['material', 'De que material a queres?', ['Aluminio', 'PVC', 'Aconselládeme']],
          ['cantidad', 'Cantas persianas?', ['1', '2', '3 a 5', 'Máis de 5']],
          ['medidas', 'Se tes as medidas aproximadas (ancho × alto), escríbeas. Se non, preme «Saltar».', null]
        ]
      },
      mosquitera: {
        etiqueta: 'Mosquiteira',
        pasos: [
          ['tipo', 'Que tipo prefires?', ['Enrolable', 'Plisada', 'Fixa', 'Aconselládeme']],
          ['donde', 'Onde vai?', ['Fiestra', 'Porta', 'Varias']],
          ['cantidad', 'Cantas?', ['1', '2', '3 a 5', 'Máis de 5']]
        ]
      },
      estor: {
        etiqueta: 'Estor ou veneciana',
        pasos: [
          ['tipo', 'Que che interesa?', ['Estor enrolable', 'Veneciana', 'Cortina', 'Aconselládeme']],
          ['cantidad', 'Para cantas fiestras?', ['1', '2', '3 a 5', 'Máis de 5']]
        ]
      },
      mampara: {
        etiqueta: 'Mampara ou porta pregable',
        pasos: [
          ['tipo', 'Que necesitas?', ['Mampara de ducha', 'Mampara de bañeira', 'Porta pregable']],
          ['medidas', 'Se tes as medidas aproximadas, escríbeas. Se non, preme «Saltar».', null]
        ]
      },
      repuesto: {
        etiqueta: 'Un recambio',
        pasos: [
          ['pieza', 'Que peza buscas?', ['Cinta', 'Recolledor', 'Lama', 'Eixe ou polea', 'Outra']],
          ['material', 'A persiana é de aluminio ou PVC?', ['Aluminio', 'PVC', 'Non o sei']]
        ]
      }
    },
    comunes: [
      ['cuando', 'Para cando o necesitas?', ['É urxente', 'Esta semana', 'Sen présa']],
      ['zona', 'En que barrio ou zona estás?', null],
      ['nombre', 'Como te chamas?', null]
    ],
    etiquetas: { servicio: 'Servizo', averia: 'Avaría', material: 'Material', accionamiento: 'Accionamento', cantidad: 'Cantidade', medidas: 'Medidas', tipo: 'Tipo', donde: 'Onde', pieza: 'Peza', cuando: 'Para cando', zona: 'Zona', nombre: 'Nome' },
    resumen: 'Perfecto, este é o resumo da túa solicitude:',
    precio: 'Prezo orientativo',
    sinPrecio: 'O prezo exacto dámoscho por WhatsApp. Se nos mandas unha foto ou un vídeo, mellor aínda.',
    enviar: 'Enviar por WhatsApp',
    reiniciar: 'Comezar de novo',
    llamarMejor: 'Prefiro chamar',
    gracias: 'Listo! Abriuse WhatsApp coa túa solicitude. Só tes que premer enviar.',
    mensaje: 'Ola, quero pedir orzamento (dende a web):'
  }
};
