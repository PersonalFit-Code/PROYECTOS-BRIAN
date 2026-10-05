/**
 * Reseñas REALES de 4 y 5 estrellas, copiadas literalmente (solo se corrigen tildes y erratas
 * evidentes). Las que Google corta con «Más» se citan hasta donde se ven, con «…»; «[…]» marca un
 * corte nuestro (precios de hace años, que ya no valen, o una pega suelta dentro de una reseña buena).
 * Fuentes: Google (pasadas por Brian, 05/10/2026) y TripAdvisor (consultado el 05/10/2026).
 * Fuera a propósito, aunque tienen 4-5★: Turrueiro (critica el resto de pinchos), Andrés (dice que
 * abren a las 20:00), Génesis Torres (habla de una camarera por su nombre) e Iván Amorós (texto confuso).
 */
export interface Review {
  id: string;
  author: string;
  platform: "Google" | "TripAdvisor";
  rating: 4 | 5;
  text: string;
}

export const REVIEWS: readonly Review[] = [
  { id: "francisco-alvarez", author: "Francisco Álvarez", platform: "Google", rating: 5, text: "Totalmente recomendable. Es un clásico en la zona de los vinos. Los chicharrones y el de calamares son mis preferidos." },
  { id: "maria-a", author: "María A.", platform: "TripAdvisor", rating: 5, text: "Muy buena atención, fuimos con un perro y nos dejaron entrar dentro y nos dieron bebida para el perro y una chuchería. La atención exquisita y los pinchos de lujo, un diez para todas." },
  { id: "natalia-arias", author: "Natalia Arias Román", platform: "Google", rating: 5, text: "Pinchos ricos, ambiente relajado, es barato y la atención es buena y agradable. Destaco los calamares, la tortilla y las empanadillas por gusto personal…" },
  { id: "sergio-bartolome", author: "Sergio Bartolomé", platform: "Google", rating: 5, text: "Pinchos variados, bonitos y baratos (la tortilla está buenísima). Buen ambiente y amabilidad de los camareros. Visita obligada en Ourense." },
  { id: "iberica-iluminacion", author: "Ibérica de Iluminación", platform: "Google", rating: 5, text: "Estupenda la nueva imagen así como los propietarios. Da gusto la atención, así como los bocadillos: ¡son una maravilla! Lo mejor, la ración de calamares y el vino blanco que probamos, que no lo hay en ningún sitio salvo aquí. ¡Volveremos seguro!" },
  { id: "fany-sr", author: "Fany SR", platform: "Google", rating: 5, text: "Es un bar de tapas o pinchos bastante económico y variado en el centro de Ourense. Se puede comer «rixones», una especialidad gallega […]. Personal muy atento y agradable…" },
  { id: "anxo-selas", author: "Anxo Selas", platform: "Google", rating: 4, text: "Muy bueno todo, sobre todo los chicharrones." },
  { id: "javier-dmc", author: "Javier DMC", platform: "Google", rating: 5, text: "Buenísimos los chicharrones, acompañados de una buena cerveza. Hay mucha variedad de pinchos a elegir y barato. Además los camareros muy amables y buen ambiente." },
  { id: "don-juan", author: "Don Juan", platform: "TripAdvisor", rating: 5, text: "Sus pinchos de calamares son un auténtico «bocatto di cardinale», sus chicharrones una exquisitez y sus empanadillas me pirran. La calle de los Hornos no sería lo mismo sin este histórico que le lleva alegrando la vida a orensanos y visitantes desde 1974." },
  { id: "regatas-rio", author: "Regatas Río", platform: "Google", rating: 5, text: "Excelente atención y rapidez. Comida muy rica y recién elaborada. Muy económico. Fui varias veces…" },
  { id: "julio-villarino", author: "Julio E. Villarino", platform: "Google", rating: 5, text: "El local de los bocatas de calamares por excelencia. Tiene unos precios de locos para tomar un bocata o una pulga de tortilla, calamares…" },
  { id: "jose-angel-vazquez", author: "José Ángel Vázquez", platform: "Google", rating: 5, text: "Lugar mítico en Ourense, en la zona de vinos…" },
  { id: "o-pequeno-axouxere", author: "O pequeno axouxere", platform: "Google", rating: 5, text: "¡El de toda la vida! Gracias por mantenerlo y no venderos a la modernidad, quedáis pocos en vinos. Precios razonables, producto de alta calidad." },
  { id: "ivan-navarro", author: "Iván Navarro Amaya", platform: "Google", rating: 5, text: "Lugar típico de Ourense que no puedes pasar sin comerte un pincho de chicharrones. ¡Sin duda un bocadito especial y típico!" },
  { id: "lola-mandia", author: "Lola Mandiá Muñoz", platform: "Google", rating: 5, text: "Ponen unos pinchos variados en forma de pulguitas muy ricos, pero sobre todo los de calamares y los de chicharrones están buenísimos y con tres vas cenado." },
  { id: "michel", author: "michel5338", platform: "TripAdvisor", rating: 5, text: "Un sitio bien atendido, rápido y todo muy bueno. En hora punta se pone hasta arriba. Por algo será… Con dos pinchos y un par de cañas te vas cenado. Volveré." },
  { id: "miguel-pereira", author: "Miguel Pereira", platform: "Google", rating: 5, text: "Recuperó la esencia de antaño, está todo igual. Los pinchos, exquisitos, y las bebidas a buen precio. ¡Es visita obligada en los vinos! 👍" },
  { id: "google-anonimo", author: "Cliente de Google", platform: "Google", rating: 4, text: "Muy bueno el pincho de calamares y el de chicharrones, en general todos los pinchos están muy bien. Agradables en el trato. […]" },
  { id: "jorge-pazos", author: "Jorge Pazos", platform: "Google", rating: 5, text: "Excelentes los pinchos. Por eso siempre está lleno […]. Para tomar una bebida y un par de pinchos rápido…" },
  { id: "cesar-md", author: "César MD", platform: "Google", rating: 5, text: "Bar de toda la vida de Ourense. Algunos de los mejores pinchos de la ciudad…" },
  { id: "furia-75", author: "Furia 75", platform: "Google", rating: 5, text: "¡Tiene unos chicharrones espectaculares! Muy buen trato, siempre está a tope de gente. Hay que estar de pie, no tiene mesas." },
  { id: "nina-ucles", author: "Nina Ucles", platform: "Google", rating: 5, text: "Muy satisfecha, un bar para tomar un par de pinchos de pie. Tortilla exquisita y chicharrones ricos, nada aceitosos. El pan rico, precio barato ¡y buenos vinos!" },
  { id: "lili-ch", author: "Lili CH", platform: "TripAdvisor", rating: 5, text: "Pinchos de calamar y tortilla […]. Rápidos, bien de sabor, en el centro. Calidad-precio, ¡perfecto!" },
  { id: "eduardo-gonzalez", author: "Eduardo González", platform: "Google", rating: 4, text: "Estuvimos tomando una caña y unos bocatas. El tamaño de los bocatas muy bueno; quizás nos excedimos y debimos haber pedido el pincho, ya que con el bocata ya cenas." },
  { id: "montse-gonzalez", author: "Montse González", platform: "Google", rating: 4, text: "Bar de la zona de vinos de Ourense, situado muy cerca de la catedral. Lleva muchos años sirviendo tapas y pinchos. Especialmente famosos son los de calamares…" },
  { id: "ruben-montes", author: "Rubén Montes", platform: "Google", rating: 5, text: "Siempre que vamos de pinchos, es parada obligada. Sus pinchos de calamares, tortilla… están muy buenos." },
  { id: "ascanles365", author: "Ascanles365", platform: "Google", rating: 5, text: "Típico de vinos. ¡Genial! Bar de pinchos ricos y baratos." },
  { id: "carlos-carro", author: "Carlos Carro", platform: "Google", rating: 4, text: "Bueno, bonito y barato. Muy recomendable. Pinchos muy ricos." },
  { id: "jorge-rodriguez", author: "Jorge Rodríguez Pavón", platform: "Google", rating: 5, text: "Ambiente excelente, trabajadores súper majos y unos pinchos riquísimos y súper económicos. Como en los viejos tiempos. Si quieres algo rápido es el mejor lugar…" },
  { id: "jorge-m", author: "Jorge M", platform: "Google", rating: 5, text: "¡Cañas y pinchos buenísimos […]! Especialmente el de calamares… El mítico local «enxebre» (tradicional) para pinchar algo antes de cenar." },
  { id: "pirry", author: "Pirry", platform: "TripAdvisor", rating: 5, text: "Local perfecto para hacer una parada y tomar unos buenos pinchos en la zona de los vinos. Mucha variedad de pinchos y para toda la familia. Parada obligada en las tardes de paseo." },
  { id: "matilde", author: "MatildeVP", platform: "TripAdvisor", rating: 4, text: "Confirmado, como en el bar de toda la vida no se come en ningún sitio. ¡Fabuloso el pincho de calamares!" },
];
