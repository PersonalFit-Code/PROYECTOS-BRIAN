// Datos del negocio y ajustes del sitio. Lo que pone PENDIENTE hay que confirmarlo con el dueño.
export const SITIO = {
  url: 'https://persianas-lopez.vercel.app', // Cambiar por el dominio propio cuando lo haya
  nombre: 'Persianas López',
  telefono: '+34657971313',
  telefonoVisible: '657 97 13 13',
  whatsapp: '34657971313',
  direccion: 'Rúa Bonhome, 10',
  cp: '32005',
  ciudad: 'Ourense',
  provincia: 'Ourense',
  region: 'Galicia',
  geo: { lat: 42.3405, lng: -7.8645 }, // PENDIENTE: coordenadas exactas de la tienda
  valoracion: { nota: 4.4, resenas: 63 },
  // PENDIENTE: datos del titular para el aviso legal
  titular: {
    nombre: '[PENDIENTE: nombre o razón social del titular]',
    nif: '[PENDIENTE: NIF/CIF]',
    email: '[PENDIENTE: correo de contacto]'
  }
};

// Analítica sin cookies.
// GoatCounter: crea una cuenta gratis en goatcounter.com y pon aquí el código (p. ej. 'persianaslopez').
// Vercel Web Analytics: actívalo en el panel de Vercel (Analytics) y pon true.
export const ANALITICA = {
  goatcounter: '',
  vercel: false
};

// Precios orientativos para el asistente de presupuesto (euros). Mientras esté vacío, el asistente
// no da cifras: recoge los datos y los manda por WhatsApp para que el negocio dé el precio real.
// Ejemplo: { 'reparar': 'desde 40 €', 'mosquitera': 'desde 60 € por ventana' }
export const PRECIOS = {};

export const wa = (texto) => `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(texto)}`;
