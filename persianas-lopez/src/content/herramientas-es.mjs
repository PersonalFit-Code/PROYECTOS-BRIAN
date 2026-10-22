// Textos de las herramientas de la portada y del catálogo: diagnóstico, probador, medidas,
// temporada, horario, antes y después, guías y reserva de repuestos.

export default {
  diagnostico: {
    chip: 'Diagnóstico en 1 minuto',
    titulo: '¿Qué le pasa a tu persiana?',
    texto: 'Contesta dos preguntas y te decimos la causa más probable, si la puedes arreglar tú y qué pieza necesitas.',
    pregunta: '¿Qué notas?',
    volver: 'Volver',
    empezar: 'Empezar de nuevo',
    causa: 'Causa más probable',
    solucion: 'Qué hacer',
    pieza: 'Pieza que suele hacer falta',
    verPieza: 'Ver la pieza',
    reservar: 'Reservar la pieza',
    visita: 'Pedir visita a domicilio',
    urgente: 'Es urgente: escribir ahora',
    guia: 'Ver cómo se hace',
    aviso: 'Es una orientación: confirmamos la avería al verla.',
    dificultad: { tu: 'Puedes arreglarla tú', mana: 'Con algo de maña', pro: 'Mejor que vayamos nosotros' },
    mensaje: 'Hola, he hecho el diagnóstico de la web.',
    mensajeUrgente: 'Hola, es urgente. He hecho el diagnóstico de la web.',
    sintomas: [
      { id: 'nosube', etiqueta: 'No sube o se queda a medias', pregunta: '¿Qué pasa al tirar de la cinta?', opciones: [
        ['La cinta tira pero la persiana no se mueve', 'eje'],
        ['La cinta va muy dura o se atasca', 'guias'],
        ['Tiene motor y no responde', 'motor']
      ] },
      { id: 'cinta', etiqueta: 'La cinta está rota o gastada', pregunta: '¿Cómo está la cinta?', opciones: [
        ['Rota del todo', 'cinta-rota'],
        ['Deshilachada, pero aún funciona', 'cinta-gastada'],
        ['No se recoge, queda colgando', 'recogedor']
      ] },
      { id: 'caida', etiqueta: 'Se ha caído dentro del cajón', resultado: 'caida' },
      { id: 'lamas', etiqueta: 'Lamas rotas, sueltas o con huecos', pregunta: '¿Cuántas lamas están mal?', opciones: [
        ['Una o dos', 'lamas-pocas'],
        ['Muchas o toda la persiana', 'lamas-muchas']
      ] },
      { id: 'ruido', etiqueta: 'Hace ruido o baja torcida', pregunta: '¿Qué notas exactamente?', opciones: [
        ['Chirría o roza al subir', 'ruido'],
        ['Baja torcida o se sale de la guía', 'torcida'],
        ['Se mete del todo en el cajón', 'topes']
      ] }
    ],
    resultados: {
      eje: { titulo: 'Persiana suelta del eje o polea rota', causa: 'La cinta mueve la polea, pero la persiana se ha soltado del eje o hay una pieza rota dentro del cajón.', solucion: 'Hay que abrir el cajón, volver a enganchar la persiana y cambiar la pieza dañada. No sigas tirando de la cinta.', dificultad: 'pro', pieza: 'eje', urgente: true },
      guias: { titulo: 'Guías sucias o una lama doblada', causa: 'La suciedad en las guías o una lama doblada frenan la persiana.', solucion: 'Limpia las guías y ponles silicona en spray. Si una lama está doblada, hay que cambiarla.', dificultad: 'tu', pieza: 'guias', guia: 'guias' },
      motor: { titulo: 'Fallo del motor o del mando', causa: 'Puede ser el mando, el interruptor, el ajuste de los finales de carrera o el propio motor.', solucion: 'No fuerces la persiana. Revisamos la instalación y te decimos si basta con ajustarla o hay que cambiar el motor.', dificultad: 'pro', urgente: true },
      'cinta-rota': { titulo: 'Cinta rota', causa: 'La cinta se ha roto por el desgaste.', solucion: 'Se cambia la cinta entera. Si te manejas, puedes hacerlo tú con nuestra guía; si no, vamos a tu casa.', dificultad: 'mana', pieza: 'cinta', guia: 'cinta', urgente: true },
      'cinta-gastada': { titulo: 'Cinta desgastada', causa: 'El roce con el pasacintas la va deshilachando.', solucion: 'Cámbiala antes de que se rompa y te deje la persiana bajada.', dificultad: 'mana', pieza: 'cinta', guia: 'cinta' },
      recogedor: { titulo: 'Recogedor estropeado', causa: 'El muelle del recogedor se ha roto o soltado y ya no enrolla la cinta.', solucion: 'Se cambia el recogedor. Es una de las reparaciones más sencillas.', dificultad: 'tu', pieza: 'recogedor', guia: 'recogedor' },
      caida: { titulo: 'Persiana caída en el cajón', causa: 'Se han soltado los enganches que unen la persiana al eje.', solucion: 'Hay que abrir el cajón, recolocar la persiana y cambiar los enganches. No tires de la cinta para no empeorarlo.', dificultad: 'pro', pieza: 'eje', urgente: true },
      'lamas-pocas': { titulo: 'Alguna lama dañada', causa: 'Un golpe o el paso del tiempo rompen o sueltan alguna lama.', solucion: 'Se cambian solo las lamas dañadas por otras del mismo material y, si las hay, del mismo color.', dificultad: 'mana', pieza: 'lama-aluminio' },
      'lamas-muchas': { titulo: 'Persiana muy deteriorada', causa: 'Cuando fallan muchas lamas, la persiana suele estar al final de su vida.', solucion: 'Normalmente compensa una persiana nueva a medida. Te hacemos el presupuesto sin compromiso.', dificultad: 'pro' },
      ruido: { titulo: 'Guías secas o rodamiento gastado', causa: 'Las guías sin limpiar o los rodamientos del eje hacen que roce y chirríe.', solucion: 'Limpia las guías y ponles silicona. Si el ruido viene del cajón, suele ser el rodamiento o la polea.', dificultad: 'mana', pieza: 'polea', guia: 'guias' },
      torcida: { titulo: 'Persiana desalineada', causa: 'Una lama desplazada o una guía floja hacen que baje torcida.', solucion: 'Hay que recolocar las lamas y fijar la guía. Si se sale de la guía, no la fuerces.', dificultad: 'pro', pieza: 'guias' },
      topes: { titulo: 'Faltan los topes', causa: 'Los topes de la lama final evitan que la persiana se meta entera en el cajón.', solucion: 'Se ponen topes nuevos. Si ya se ha metido dentro, hay que abrir el cajón.', dificultad: 'mana', pieza: 'topes' }
    }
  },

  probador: {
    chip: 'Pruébala en tu ventana',
    titulo: 'Mira cómo queda antes de pedirla',
    texto: 'Haz una foto a tu ventana y prueba encima persianas, estores y venecianas en distintos colores.',
    subir: 'Hacer o subir una foto',
    privado: 'La foto no sale de tu móvil: no se envía a ningún sitio.',
    ayuda: 'Arrastra el modelo para colocarlo y usa la esquina para ajustar el tamaño.',
    modelo: 'Modelo',
    color: 'Color',
    bajada: 'Bajada',
    pedir: 'Pedir presupuesto de este modelo',
    mensaje: 'Hola, me interesa {modelo} en color {color}. Os mando una foto de la ventana.',
    ejemplo: 'Ventana de ejemplo',
    modelos: [
      { id: 'persiana', nombre: 'Persiana', colores: [['Blanco', '#F4F6F8', '#D5DBE1'], ['Gris plata', '#C9CED3', '#9AA2AA'], ['Antracita', '#4A5058', '#2E3238'], ['Marrón', '#6B4A33', '#4A3020'], ['Imitación madera', '#A87B4F', '#7A5432']] },
      { id: 'estor', nombre: 'Estor enrollable', colores: [['Blanco', '#F7F5F0', '#E6E1D8'], ['Lino', '#E3D7C3', '#CDBEA4'], ['Gris', '#9CA3AB', '#7E868F'], ['Negro', '#2B2E33', '#1C1E22']] },
      { id: 'nochedia', nombre: 'Estor noche y día', colores: [['Blanco', '#F4F2EE', '#F4F2EE'], ['Gris', '#8A9098', '#8A9098'], ['Negro', '#24272B', '#24272B']] },
      { id: 'veneciana', nombre: 'Veneciana', colores: [['Blanco', '#F4F6F8', '#CDD3D9'], ['Plata', '#C2C8CE', '#959DA5'], ['Granate', '#7A2232', '#5A1622'], ['Madera', '#9C7148', '#734F2E']] }
    ]
  },

  medir: {
    chip: 'Guía de medidas',
    titulo: 'Mide tu ventana en tres pasos',
    texto: 'Con unas medidas aproximadas te podemos dar un precio mucho más ajustado.',
    pasos: [
      ['Ancho', 'Mide el ancho del hueco arriba, en el centro y abajo. Quédate con la medida más pequeña.'],
      ['Alto', 'Mide el alto desde el alféizar hasta el cajón o el techo del hueco, en los dos lados. Anota la más pequeña.'],
      ['Cajón o montaje', 'Si es persiana, haznos una foto con la tapa del cajón abierta. Si es estor o veneciana, dinos si va dentro del hueco o por fuera.']
    ],
    ancho: 'Ancho (cm)',
    alto: 'Alto (cm)',
    superficie: 'Superficie aproximada',
    usar: 'Usar estas medidas en mi presupuesto',
    error: 'Pon medidas entre 20 y 400 cm.'
  },

  temporadas: [
    { meses: [3, 4, 5, 6], texto: 'Llega el calor: mosquiteras a medida', servicio: 'mosquiteras' },
    { meses: [7, 8], texto: 'Verano: estores y venecianas para frenar el sol', servicio: 'estores' },
    { meses: [9, 10, 11], texto: 'Antes del invierno: revisa cintas y lamas', servicio: 'reparacion' },
    { meses: [12, 1, 2], texto: '¿Persiana atascada con el frío? Vamos a tu casa', servicio: 'reparacion' }
  ],

  horario: {
    abierto: 'Abierto ahora',
    cierra: 'cierra a las',
    cerrado: 'Cerrado ahora',
    abre: 'abre',
    hoy: 'hoy',
    manana: 'mañana',
    dias: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    urgencia: '¿Persiana atascada hoy? Escríbenos',
    urgenciaWa: 'Hola, tengo una persiana atascada y es urgente.'
  },

  antesDespues: {
    chip: 'Antes y después',
    titulo: 'Trabajos hechos en Ourense',
    texto: 'Desliza para comparar cómo estaba y cómo quedó.',
    antes: 'Antes',
    despues: 'Después',
    deslizar: 'Desliza para comparar'
  },

  guias: {
    titulo: 'Arréglala tú',
    texto: 'Las reparaciones más sencillas, paso a paso. Si no lo ves claro, no te arriesgues: vamos nosotros.',
    tiempo: 'Tiempo',
    necesitas: 'Necesitas',
    video: 'Ver el vídeo',
    pedirPieza: 'Pedir la pieza',
    lista: [
      { id: 'cinta', titulo: 'Cambiar la cinta', tiempo: '30–45 min', necesitas: 'Cinta nueva, destornillador y una pinza', pieza: 'cinta', pasos: [
        'Baja la persiana del todo: así la cinta queda casi entera en la polea y sin tensión.',
        'Abre la tapa del cajón y suelta la cinta vieja de la polea.',
        'Quita la tapa del recogedor de la pared y suelta la cinta de su eje.',
        'Engancha la cinta nueva en la polea y enróllala con las mismas vueltas que tenía la vieja.',
        'Pásala por el pasacintas, carga el muelle del recogedor girándolo unas vueltas y engánchala.',
        'Sube y baja la persiana para comprobarla antes de cerrar el cajón y el recogedor.'
      ], aviso: 'Si el cajón está muy alto o la persiana es grande y pesada, mejor llámanos.' },
      { id: 'recogedor', titulo: 'Cambiar el recogedor', tiempo: '15–20 min', necesitas: 'Recogedor nuevo, destornillador y una pinza', pieza: 'recogedor', pasos: [
        'Baja la persiana del todo y sujeta la cinta con una pinza para que no se escape.',
        'Quita los tornillos y saca el recogedor de la pared.',
        'Suelta la cinta del recogedor viejo.',
        'Carga el muelle del recogedor nuevo y engancha la cinta.',
        'Atornilla el recogedor nuevo en su sitio y prueba la persiana.'
      ], aviso: 'Trae el recogedor viejo a la tienda y te damos uno igual.' },
      { id: 'guias', titulo: 'Limpiar y engrasar las guías', tiempo: '10 min', necesitas: 'Cepillo o trapo y silicona en spray', pieza: 'guias', pasos: [
        'Sube la persiana del todo.',
        'Limpia el interior de las guías con un cepillo o un trapo.',
        'Pon silicona en spray por dentro de las guías. No uses aceite: acumula suciedad.',
        'Sube y baja la persiana varias veces para repartirla.'
      ], aviso: 'Si sigue dura después de limpiarla, puede haber una lama doblada.' }
    ]
  },

  reservar: 'Reservar para recoger',
  reservarMensaje: 'Hola, quiero reservar {pieza} para recogerla en la tienda. ¿La tenéis?'
};
