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
    condiciones: '/gl/condicions/',
    servicio: (slug) => `/gl/servizos/${slug}/`
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
    mapaAviso: 'O mapa sérveo Google, que pode instalar as súas propias cookies. Ao premer o botón aceptas que se cargue.',
    cookiesAviso: 'Só usamos almacenamento técnico necesario. Co teu permiso cargamos contido de terceiros (o mapa de Google), que pode instalar cookies.',
    cookiesMas: 'Política de cookies',
    cookiesTitulo: 'A túa privacidade',
    cookiesAceptar: 'Aceptar',
    cookiesRechazar: 'Rexeitar',
    cookiesConfigurar: 'Configurar',
    cookiesGuardar: 'Gardar selección',
    cookiesTecnicas: 'Técnicas (necesarias, sempre activas)',
    cookiesMapas: 'Mapa de Google (cookies de terceiros)',
    cookiesAnalitica: 'Estatísticas de visitas',
    configurarCookies: 'Configurar cookies',
    condiciones: 'Condicións de contratación',
    proteccionDatos: 'Protección de datos: información básica',
    masInfoDatos: 'Máis información na política de privacidade',
    legal: 'Información legal',
    avisoLegal: 'Aviso legal',
    privacidad: 'Política de privacidade',
    cookies: 'Política de cookies',
    dondeEstamos: 'Onde estamos',
    servicios: 'Servizos',
    derechos: 'Todos os dereitos reservados.',
    pie: 'Reparacións a domicilio, venda e colocación de persianas, mosquiteiras, estores, mamparas e recambios en Ourense.',
    migas: 'Estás en',
    inicio: 'Inicio',
    preguntasFrecuentes: 'Preguntas frecuentes',
    otrosServicios: 'Outros servizos',
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
    { id: 'galeria', ancla: '#galeria', etiqueta: 'Galería', desc: 'Persianas e estores que colocamos' },
    { id: 'repuestos', ancla: '#repuestos', etiqueta: 'Recambios', desc: 'Cintas, lamas, eixes e accesorios na tenda' },
    { id: 'ubicacion', ancla: '#ubicacion', etiqueta: 'Localización', desc: 'Rúa Bonhome, 10 · Ourense' },
    { id: 'contacto', ancla: '#contacto', etiqueta: 'Contacto', desc: 'Chámanos ou escríbenos por WhatsApp' }
  ],

  home: {
    title: 'Persianas en Ourense | Instalación e Reparación | Persianas López',
    description: 'Reparación, venda e colocación de persianas de aluminio e PVC en Ourense. Mosquiteiras, estores, venecianas, mamparas de baño e recambios. Rúa Bonhome, 10. Chama ao 657 97 13 13.',
    h1: 'Instalación e Reparación de Persianas en Ourense',
    lema: 'Reparacións a domicilio · Venda e colocación de todo tipo de persianas',
    bajar: 'Descubre o que facemos',
    cinta: ['Reparacións a domicilio', 'Aluminio', 'PVC', 'Compactos', 'Accesorios e motores', 'Venecianas', 'Verticais', 'Estores', 'Fantasías', 'Velux', 'Rústicas', 'Mosquiteiras', 'Mamparas de baño', 'Portas pregables'],
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
    galeria: {
      chip: 'Galería',
      titulo: 'Persianas e estores que colocamos',
      texto: 'Algúns dos modelos que vendemos e instalamos. Pregúntanos por calquera deles.',
      boton: 'Pedir orzamento',
      items: [
        ['estor-noche-dia', 'Estores noite e día', 'Bandas opacas e translúcidas que regulan a luz sen ter que subir o estor.', 'Ola, quero información sobre estores noite e día.'],
        ['venecianas', 'Venecianas de aluminio', 'Lamas orientables en moitas cores. Ideais para cociñas, baños e oficinas.', 'Ola, quero información sobre venecianas.'],
        ['estores-enrollables', 'Estores enrolables', 'Tecidos que filtran o sol e deixan ver o exterior. Á medida para cada fiestra.', 'Ola, quero información sobre estores enrolables.']
      ]
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
    faq: [
      ['Facedes reparacións a domicilio?', 'Si. Imos á túa casa reparar a persiana. Chámanos ou escríbenos por WhatsApp ao 657 97 13 13 e quedamos.'],
      ['Poñedes motores ás persianas?', 'Si, vendemos e colocamos motores e accesorios para persianas. Pregúntanos polo teu modelo.'],
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
      intro: 'Se a túa persiana non sobe, baixa torta, rompeu a cinta ou caeu dentro do caixón, imos á túa casa e arranxámola. Traballamos persianas de aluminio e de PVC e, se non paga a pena reparala, facémosche unha nova á medida.',
      puntos: ['Reparacións a domicilio', 'Cambio de cinta e recolledor', 'Lamas rotas, soltas ou dobradas', 'Eixes, poleas e rolamentos', 'Motores e accesorios', 'Aluminio, PVC, compactos e rústicas'],
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
      puntos: ['Estores enrolables', 'Estores noite e día', 'Venecianas', 'Verticais', 'Fantasías', 'Estores para Velux', 'Cortinas', 'Instalación'],
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


  legal: {
    // Primeira capa de información sobre protección de datos (asistente e contacto)
    basica: (s) => [
      ['Responsable', `${s.titular.nombre} (Persianas López)`],
      ['Finalidade', 'Atender a túa consulta ou solicitude de orzamento e, se o aceptas, facer o traballo.'],
      ['Lexitimación', 'O teu consentimento e a aplicación de medidas precontractuais por petición túa.'],
      ['Destinatarios', 'Non cedemos datos a terceiros salvo obriga legal. As mensaxes de WhatsApp pasan por Meta Platforms.'],
      ['Dereitos', `Acceso, rectificación, supresión, oposición, limitación e portabilidade, escribindo a ${s.titular.email}.`]
    ],
    aviso: {
      title: 'Aviso legal | Persianas López',
      h1: 'Aviso legal',
      secciones: (s) => [
        ['Titular da web', `<p>En cumprimento da Lei 34/2002, de servizos da sociedade da información e de comercio electrónico (LSSI-CE), estes son os datos do titular deste sitio web:</p><ul><li>Titular: ${s.titular.nombre}</li><li>Nome comercial: Persianas López</li><li>NIF: ${s.titular.nif}</li><li>Domicilio: ${s.direccion}, ${s.cp} ${s.ciudad} (${s.provincia})</li><li>Teléfono: ${s.telefonoVisible}</li><li>Correo electrónico: ${s.titular.email}</li><li>Actividade: reparación, venda e colocación de persianas, mosquiteiras, estores, mamparas e recambios.</li></ul>`],
        ['Uso da web', '<p>O acceso a esta web é gratuíto e non esixe rexistro. Quen a usa comprométese a facelo de forma lícita e a non danar o seu funcionamento.</p>'],
        ['Propiedade intelectual e industrial', '<p>O nome comercial Persianas López, o seu logotipo, os textos e o deseño desta web pertencen ao seu titular. As fotografías de produto poden pertencer aos seus fabricantes e móstranse con fins ilustrativos. Non se permite reproducir, distribuír nin transformar estes contidos sen autorización.</p>'],
        ['Responsabilidade', '<p>A información da web é orientativa. Os prezos, prazos e dispoñibilidade confírmanse sempre antes de calquera traballo. O titular non responde do contido de webs de terceiros ligadas, como Google Maps ou WhatsApp.</p>'],
        ['Contratación e reclamacións', `<p>As condicións dos orzamentos, visitas a domicilio e traballos están nas <a href="${s.rutas.condiciones}">condicións de contratación</a>, onde tamén se explica como presentar unha reclamación.</p>`],
        ['Protección de datos e cookies', `<p>Consulta a <a href="${s.rutas.privacidad}">política de privacidade</a> e a <a href="${s.rutas.cookies}">política de cookies</a>.</p>`],
        ['Lexislación aplicable', '<p>Esta web réxese pola lexislación española. Nos conflitos con consumidores serán competentes os xulgados e tribunais que correspondan segundo a normativa de consumo.</p>']
      ]
    },
    privacidad: {
      title: 'Política de privacidade | Persianas López',
      h1: 'Política de privacidade',
      secciones: (s) => [
        ['Responsable do tratamento', `<ul><li>Responsable: ${s.titular.nombre} (Persianas López)</li><li>NIF: ${s.titular.nif}</li><li>Enderezo: ${s.direccion}, ${s.cp} ${s.ciudad}</li><li>Teléfono: ${s.telefonoVisible}</li><li>Correo para protección de datos: ${s.titular.email}</li></ul>`],
        ['Que datos tratamos', '<p>Só os que ti nos dás: o teu nome, o teu teléfono, o enderezo se imos ao teu domicilio, as fotos ou vídeos que nos envíes e os detalles do que precisas.</p><p>Esta web non ten formularios que garden datos nin áreas de usuario. O asistente de orzamento prepara a mensaxe no teu propio navegador e só nos chega se ti decides envialo por WhatsApp, despois de aceptar esta política.</p>'],
        ['Para que os usamos', '<ul><li>Responder ás túas consultas e preparar orzamentos.</li><li>Facer os traballos que nos encargues (visitas, reparacións, instalacións) e atender a garantía.</li><li>Cumprir obrigas legais, como a facturación.</li></ul><p>Non usamos os teus datos para enviarche publicidade nin tomamos decisións automatizadas sobre ti.</p>'],
        ['Base legal', '<ul><li>O teu consentimento, cando nos escribes ou envías a solicitude do asistente (artigo 6.1.a do RXPD). Podes retiralo cando queiras, sen que afecte ao feito antes.</li><li>A aplicación de medidas precontractuais por petición túa e a execución do contrato (artigo 6.1.b do RXPD).</li><li>O cumprimento de obrigas legais, como as fiscais (artigo 6.1.c do RXPD).</li></ul>'],
        ['Canto tempo os gardamos', '<p>As consultas e orzamentos que non rematen nun encargo, como máximo un ano dende o último contacto. Os datos de clientes, mentres dure a relación e, despois, durante os prazos que esixe a lei (por exemplo, seis anos para a documentación contable). Pasados eses prazos, bórranse.</p>'],
        ['Con quen se comparten', '<p>Non cedemos os teus datos a terceiros salvo obriga legal (por exemplo, á Axencia Tributaria). Usamos estes provedores:</p><ul><li>WhatsApp (Meta Platforms Ireland), se nos escribes por esa canle.</li><li>Vercel Inc., que aloxa a web e rexistra datos técnicos de conexión, como o enderezo IP, por seguridade.</li><li>Google, só se aceptas cargar o mapa.</li></ul><p>Algúns destes provedores poden tratar datos fóra do Espazo Económico Europeo coas garantías que esixe o RXPD, como o Marco de Privacidade de Datos UE-EUA ou cláusulas contractuais tipo.</p>'],
        ['Os teus dereitos', `<p>Podes exercer os teus dereitos de acceso, rectificación, supresión, oposición, limitación do tratamento e portabilidade, e retirar o teu consentimento, escribindo a ${s.titular.email} ou na tenda da ${s.direccion}. Indica que dereito queres exercer e acredita a túa identidade. Responderémosche no prazo dun mes.</p><p>Se cres que non atendemos ben a túa solicitude, podes reclamar ante a Axencia Española de Protección de Datos (www.aepd.es).</p>`],
        ['Menores', '<p>Non tratamos datos de menores de 14 anos sen o consentimento dos seus pais ou titores.</p>'],
        ['Seguridade', '<p>Aplicamos medidas técnicas e organizativas axeitadas para protexer os teus datos fronte a accesos non autorizados, perdas ou alteracións.</p>'],
        ['Cambios', '<p>Se cambiamos esta política, publicaremos aquí a nova versión coa súa data.</p>']
      ]
    },
    cookies: {
      title: 'Política de cookies | Persianas López',
      h1: 'Política de cookies',
      secciones: (s) => [
        ['Que son as cookies', '<p>Son pequenos arquivos ou datos que unha web garda no teu navegador para lembrar información sobre a túa visita.</p>'],
        ['Que usamos nesta web', '<ul><li><strong>Almacenamento técnico propio</strong> (consentimento): garda a túa elección sobre as cookies para non volver preguntarche. É necesario e non require consentimento. Gárdase 12 meses.</li><li>Non usamos cookies propias de análise nin de publicidade.</li></ul>'],
        ['Cookies de terceiros: mapa de Google', '<p>O mapa da sección de contacto sérveo Google. Se o cargas, Google pode instalar as súas propias cookies para que o mapa funcione, por seguridade e, segundo a súa política, para outros fins. Por iso só se carga se o aceptas no panel de cookies ou se premes «Ver o mapa». Máis información en policies.google.com/technologies/cookies.</p>'],
        ['Estatísticas', '<p>Se nalgún momento activamos unha ferramenta de estatísticas de visitas, só se cargará se a aceptas no panel de cookies.</p>'],
        ['Como aceptar, rexeitar ou cambiar a túa elección', '<p>Ao entrar por primeira vez mostrámosche un panel coas opcións «Aceptar», «Rexeitar» e «Configurar». Podes cambiar a túa elección cando queiras coa ligazón «Configurar cookies» do pé da páxina. Tamén podes borrar as cookies e o almacenamento dende a configuración do teu navegador.</p>'],
        ['Actualización', '<p>Revisamos esta política cando cambian as ferramentas que usa a web.</p>']
      ]
    },
    condiciones: {
      title: 'Condicións de contratación | Persianas López',
      h1: 'Condicións de contratación',
      secciones: (s) => [
        ['A que se aplican', `<p>Aos servizos de reparación, venda e colocación de persianas, mosquiteiras, estores, mamparas, portas pregables e recambios que prestamos ${s.titular.nombre} (Persianas López), xa os pidas na tenda, por teléfono, por WhatsApp ou dende esta web.</p>`],
        ['Como se contrata', '<ol><li><strong>Solicitude.</strong> Cóntasnos o que precisas por teléfono, WhatsApp, na tenda ou co asistente da web. Pedir información ou orzamento é gratis e non te compromete a nada.</li><li><strong>Orzamento.</strong> Dámosche un orzamento co traballo, o prezo con IVE incluído e o prazo aproximado. O asistente da web non dá prezos pechados nin serve para contratar: só prepara a túa solicitude.</li><li><strong>Aceptación.</strong> O traballo só se encarga cando aceptas expresamente o orzamento.</li><li><strong>Traballo e factura.</strong> Facemos o traballo e entregámosche a factura.</li></ol>'],
        ['Prezos e validez do orzamento', `<p>Os prezos inclúen IVE. O orzamento é válido durante ${s.condiciones.validez}. Se ao facer o traballo aparece algo que cambie o prezo, explicámoscho e precisamos a túa conformidade antes de seguir.</p>`],
        ['Visitas e desprazamentos a domicilio', `<p>${s.condiciones.desplazamiento} Sempre cho diremos antes de ir.</p>`],
        ['Cancelacións', `<p>Se non podes atender unha visita, avísanos canto antes por teléfono ou WhatsApp ao ${s.telefonoVisible}. ${s.condiciones.cancelacion}</p>`],
        ['Dereito de desistimento', '<p>Se contratas fóra da tenda (por exemplo, no teu domicilio), tes 14 días naturais para desistir sen dar explicacións, agás nos casos que exclúe o artigo 103 da Lei xeral para a defensa dos consumidores e usuarios: entre outros, os produtos fabricados á medida segundo as túas indicacións e as reparacións urxentes que nos pidas expresamente no teu domicilio. Nos contratos fóra da tenda entregarémosche o formulario de desistimento.</p>'],
        ['Garantías', `<p>Os produtos que vendemos teñen a garantía legal de tres anos que establece a Lei xeral para a defensa dos consumidores e usuarios. As reparacións teñen unha garantía de ${s.condiciones.garantiaReparacion}, que figurará na factura.</p>`],
        ['Follas de reclamación', `<p>Temos á túa disposición follas de reclamación oficiais da Xunta de Galicia na tenda da ${s.direccion}, ${s.cp} ${s.ciudad}. Tamén podes presentar unha reclamación ante o Instituto Galego de Consumo e da Competencia en consumo.xunta.gal, ou escribirnos antes a ${s.titular.email} para tentar resolvelo.</p>`],
        ['Datos persoais', `<p>Tratamos os teus datos segundo a <a href="${s.rutas.privacidad}">política de privacidade</a>.</p>`]
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
    casillaAntes: 'Lin e acepto a',
    casillaEnlace: 'política de privacidade',
    basicaTitulo: 'Información básica sobre protección de datos',
    marcaCasilla: 'Marca a caixa para poder enviar a túa solicitude.',
    noVinculante: 'É unha solicitude, non un orzamento pechado: confirmámosche o prezo antes de comezar.',
    verCondiciones: 'Condicións de contratación',
    precio: 'Prezo orientativo',
    sinPrecio: 'O prezo exacto dámoscho por WhatsApp. Se nos mandas unha foto ou un vídeo, mellor aínda.',
    enviar: 'Enviar por WhatsApp',
    reiniciar: 'Comezar de novo',
    llamarMejor: 'Prefiro chamar',
    gracias: 'Listo! Abriuse WhatsApp coa túa solicitude. Só tes que premer enviar.',
    mensaje: 'Ola, quero pedir orzamento (dende a web):'
  }
};
