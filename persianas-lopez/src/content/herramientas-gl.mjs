// Textos das ferramentas da portada e do catálogo en galego. Mesma estrutura que herramientas-es.mjs.

export default {
  diagnostico: {
    chip: 'Diagnóstico nun minuto',
    titulo: 'Que lle pasa á túa persiana?',
    texto: 'Contesta dúas preguntas e dicímosche a causa máis probable, se a podes arranxar ti e que peza precisas.',
    pregunta: 'Que notas?',
    volver: 'Volver',
    empezar: 'Comezar de novo',
    causa: 'Causa máis probable',
    solucion: 'Que facer',
    pieza: 'Peza que adoita facer falta',
    verPieza: 'Ver a peza',
    reservar: 'Reservar a peza',
    visita: 'Pedir visita a domicilio',
    urgente: 'É urxente: escribir agora',
    guia: 'Ver como se fai',
    aviso: 'É unha orientación: confirmamos a avaría ao vela.',
    dificultad: { tu: 'Podes arranxala ti', mana: 'Con algo de maña', pro: 'Mellor que vaiamos nós' },
    mensaje: 'Ola, fixen o diagnóstico da web.',
    mensajeUrgente: 'Ola, é urxente. Fixen o diagnóstico da web.',
    sintomas: [
      { id: 'nosube', etiqueta: 'Non sobe ou queda a medias', pregunta: 'Que pasa ao tirar da cinta?', opciones: [
        ['A cinta tira pero a persiana non se move', 'eje'],
        ['A cinta vai moi dura ou atáscase', 'guias'],
        ['Ten motor e non responde', 'motor']
      ] },
      { id: 'cinta', etiqueta: 'A cinta está rota ou gastada', pregunta: 'Como está a cinta?', opciones: [
        ['Rota de todo', 'cinta-rota'],
        ['Desfiada, pero aínda funciona', 'cinta-gastada'],
        ['Non se recolle, queda colgando', 'recogedor']
      ] },
      { id: 'caida', etiqueta: 'Caeu dentro do caixón', resultado: 'caida' },
      { id: 'lamas', etiqueta: 'Lamas rotas, soltas ou con ocos', pregunta: 'Cantas lamas están mal?', opciones: [
        ['Unha ou dúas', 'lamas-pocas'],
        ['Moitas ou toda a persiana', 'lamas-muchas']
      ] },
      { id: 'ruido', etiqueta: 'Fai ruído ou baixa torta', pregunta: 'Que notas exactamente?', opciones: [
        ['Renxe ou roza ao subir', 'ruido'],
        ['Baixa torta ou sáese da guía', 'torcida'],
        ['Métese de todo no caixón', 'topes']
      ] }
    ],
    resultados: {
      eje: { titulo: 'Persiana solta do eixe ou polea rota', causa: 'A cinta move a polea, pero a persiana soltouse do eixe ou hai unha peza rota dentro do caixón.', solucion: 'Hai que abrir o caixón, volver enganchar a persiana e cambiar a peza danada. Non sigas tirando da cinta.', dificultad: 'pro', pieza: 'eje', urgente: true },
      guias: { titulo: 'Guías sucias ou unha lama dobrada', causa: 'A sucidade nas guías ou unha lama dobrada frean a persiana.', solucion: 'Limpa as guías e ponlles silicona en spray. Se unha lama está dobrada, hai que cambiala.', dificultad: 'tu', pieza: 'guias', guia: 'guias' },
      motor: { titulo: 'Fallo do motor ou do mando', causa: 'Pode ser o mando, o interruptor, o axuste dos finais de carreira ou o propio motor.', solucion: 'Non forces a persiana. Revisamos a instalación e dicímosche se abonda con axustala ou hai que cambiar o motor.', dificultad: 'pro', urgente: true },
      'cinta-rota': { titulo: 'Cinta rota', causa: 'A cinta rompeu polo desgaste.', solucion: 'Cámbiase a cinta enteira. Se te manexas, podes facelo ti coa nosa guía; se non, imos á túa casa.', dificultad: 'mana', pieza: 'cinta', guia: 'cinta', urgente: true },
      'cinta-gastada': { titulo: 'Cinta desgastada', causa: 'O rozamento co pasacintas vaina desfiando.', solucion: 'Cámbiaa antes de que rompa e che deixe a persiana baixada.', dificultad: 'mana', pieza: 'cinta', guia: 'cinta' },
      recogedor: { titulo: 'Recolledor estragado', causa: 'O resorte do recolledor rompeu ou soltouse e xa non enrola a cinta.', solucion: 'Cámbiase o recolledor. É unha das reparacións máis sinxelas.', dificultad: 'tu', pieza: 'recogedor', guia: 'recogedor' },
      caida: { titulo: 'Persiana caída no caixón', causa: 'Soltáronse os enganches que unen a persiana ao eixe.', solucion: 'Hai que abrir o caixón, recolocar a persiana e cambiar os enganches. Non tires da cinta para non empeoralo.', dificultad: 'pro', pieza: 'eje', urgente: true },
      'lamas-pocas': { titulo: 'Algunha lama danada', causa: 'Un golpe ou o paso do tempo rompen ou soltan algunha lama.', solucion: 'Cámbianse só as lamas danadas por outras do mesmo material e, se as hai, da mesma cor.', dificultad: 'mana', pieza: 'lama-aluminio' },
      'lamas-muchas': { titulo: 'Persiana moi deteriorada', causa: 'Cando fallan moitas lamas, a persiana adoita estar ao final da súa vida.', solucion: 'Normalmente compensa unha persiana nova á medida. Facémosche o orzamento sen compromiso.', dificultad: 'pro' },
      ruido: { titulo: 'Guías secas ou rolamento gastado', causa: 'As guías sen limpar ou os rolamentos do eixe fan que roce e renxa.', solucion: 'Limpa as guías e ponlles silicona. Se o ruído vén do caixón, adoita ser o rolamento ou a polea.', dificultad: 'mana', pieza: 'polea', guia: 'guias' },
      torcida: { titulo: 'Persiana desaliñada', causa: 'Unha lama desprazada ou unha guía frouxa fan que baixe torta.', solucion: 'Hai que recolocar as lamas e fixar a guía. Se se sae da guía, non a forces.', dificultad: 'pro', pieza: 'guias' },
      topes: { titulo: 'Faltan os topes', causa: 'Os topes da lama final evitan que a persiana se meta enteira no caixón.', solucion: 'Póñense topes novos. Se xa se meteu dentro, hai que abrir o caixón.', dificultad: 'mana', pieza: 'topes' }
    }
  },

  probador: {
    chip: 'Próbaa na túa fiestra',
    titulo: 'Mira como queda antes de pedila',
    texto: 'Fai unha foto á túa fiestra e proba enriba persianas, estores e venecianas en distintas cores.',
    subir: 'Facer ou subir unha foto',
    privado: 'A foto non sae do teu móbil: non se envía a ningún sitio.',
    ayuda: 'Arrastra o modelo para colocalo e usa a esquina para axustar o tamaño.',
    modelo: 'Modelo',
    color: 'Cor',
    bajada: 'Baixada',
    pedir: 'Pedir orzamento deste modelo',
    mensaje: 'Ola, interésame {modelo} en cor {color}. Mándovos unha foto da fiestra.',
    ejemplo: 'Fiestra de exemplo',
    modelos: [
      { id: 'persiana', nombre: 'Persiana', colores: [['Branco', '#F4F6F8', '#D5DBE1'], ['Gris prata', '#C9CED3', '#9AA2AA'], ['Antracita', '#4A5058', '#2E3238'], ['Marrón', '#6B4A33', '#4A3020'], ['Imitación madeira', '#A87B4F', '#7A5432']] },
      { id: 'estor', nombre: 'Estor enrolable', colores: [['Branco', '#F7F5F0', '#E6E1D8'], ['Liño', '#E3D7C3', '#CDBEA4'], ['Gris', '#9CA3AB', '#7E868F'], ['Negro', '#2B2E33', '#1C1E22']] },
      { id: 'nochedia', nombre: 'Estor noite e día', colores: [['Branco', '#F4F2EE', '#F4F2EE'], ['Gris', '#8A9098', '#8A9098'], ['Negro', '#24272B', '#24272B']] },
      { id: 'veneciana', nombre: 'Veneciana', colores: [['Branco', '#F4F6F8', '#CDD3D9'], ['Prata', '#C2C8CE', '#959DA5'], ['Granate', '#7A2232', '#5A1622'], ['Madeira', '#9C7148', '#734F2E']] }
    ]
  },

  medir: {
    chip: 'Guía de medidas',
    titulo: 'Mide a túa fiestra en tres pasos',
    texto: 'Cunhas medidas aproximadas podemos darche un prezo moito máis axustado.',
    pasos: [
      ['Ancho', 'Mide o ancho do oco arriba, no centro e abaixo. Quédate coa medida máis pequena.'],
      ['Alto', 'Mide o alto dende o peitoril ata o caixón ou o teito do oco, nos dous lados. Anota a máis pequena.'],
      ['Caixón ou montaxe', 'Se é persiana, fainos unha foto coa tapa do caixón aberta. Se é estor ou veneciana, dinos se vai dentro do oco ou por fóra.']
    ],
    ancho: 'Ancho (cm)',
    alto: 'Alto (cm)',
    superficie: 'Superficie aproximada',
    usar: 'Usar estas medidas no meu orzamento',
    error: 'Pon medidas entre 20 e 400 cm.'
  },

  temporadas: [
    { meses: [3, 4, 5, 6], texto: 'Chega a calor: mosquiteiras á medida', servicio: 'mosquiteras' },
    { meses: [7, 8], texto: 'Verán: estores e venecianas para frear o sol', servicio: 'estores' },
    { meses: [9, 10, 11], texto: 'Antes do inverno: revisa cintas e lamas', servicio: 'reparacion' },
    { meses: [12, 1, 2], texto: 'Persiana atascada co frío? Imos á túa casa', servicio: 'reparacion' }
  ],

  horario: {
    abierto: 'Aberto agora',
    cierra: 'pecha ás',
    cerrado: 'Pechado agora',
    abre: 'abre',
    hoy: 'hoxe',
    manana: 'mañá',
    dias: ['domingo', 'luns', 'martes', 'mércores', 'xoves', 'venres', 'sábado'],
    urgencia: 'Persiana atascada hoxe? Escríbenos',
    urgenciaWa: 'Ola, teño unha persiana atascada e é urxente.'
  },

  antesDespues: {
    chip: 'Antes e despois',
    titulo: 'Traballos feitos en Ourense',
    texto: 'Desliza para comparar como estaba e como quedou.',
    antes: 'Antes',
    despues: 'Despois',
    deslizar: 'Desliza para comparar'
  },

  guias: {
    titulo: 'Arránxaa ti',
    texto: 'As reparacións máis sinxelas, paso a paso. Se non o ves claro, non te arrisques: imos nós.',
    tiempo: 'Tempo',
    necesitas: 'Precisas',
    video: 'Ver o vídeo',
    pedirPieza: 'Pedir a peza',
    lista: [
      { id: 'cinta', titulo: 'Cambiar a cinta', tiempo: '30–45 min', necesitas: 'Cinta nova, desaparafusador e unha pinza', pieza: 'cinta', pasos: [
        'Baixa a persiana de todo: así a cinta queda case enteira na polea e sen tensión.',
        'Abre a tapa do caixón e solta a cinta vella da polea.',
        'Quita a tapa do recolledor da parede e solta a cinta do seu eixe.',
        'Engancha a cinta nova na polea e enrólaa coas mesmas voltas que tiña a vella.',
        'Pásaa polo pasacintas, carga o resorte do recolledor xirándoo unhas voltas e engánchaa.',
        'Sobe e baixa a persiana para comprobala antes de pechar o caixón e o recolledor.'
      ], aviso: 'Se o caixón está moi alto ou a persiana é grande e pesada, mellor chámanos.' },
      { id: 'recogedor', titulo: 'Cambiar o recolledor', tiempo: '15–20 min', necesitas: 'Recolledor novo, desaparafusador e unha pinza', pieza: 'recogedor', pasos: [
        'Baixa a persiana de todo e suxeita a cinta cunha pinza para que non escape.',
        'Quita os parafusos e saca o recolledor da parede.',
        'Solta a cinta do recolledor vello.',
        'Carga o resorte do recolledor novo e engancha a cinta.',
        'Aparafusa o recolledor novo no seu sitio e proba a persiana.'
      ], aviso: 'Trae o recolledor vello á tenda e dámosche un igual.' },
      { id: 'guias', titulo: 'Limpar e engraxar as guías', tiempo: '10 min', necesitas: 'Cepillo ou trapo e silicona en spray', pieza: 'guias', pasos: [
        'Sobe a persiana de todo.',
        'Limpa o interior das guías cun cepillo ou un trapo.',
        'Pon silicona en spray por dentro das guías. Non uses aceite: acumula sucidade.',
        'Sobe e baixa a persiana varias veces para repartila.'
      ], aviso: 'Se segue dura despois de limpala, pode haber unha lama dobrada.' }
    ]
  },

  reservar: 'Reservar para recoller',
  reservarMensaje: 'Ola, quero reservar {pieza} para recollela na tenda. Tédela?'
};
