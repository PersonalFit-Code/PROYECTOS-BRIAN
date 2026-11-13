/**
 * Reseñas REALES de la ficha de Google de 720 GYM CLUB, copiadas tal cual salvo erratas (las que Google corta,
 * con «…»). Nombre e inicial del apellido por privacidad. Sin estrellas por reseña: la nota que se
 * muestra es la media de la ficha (negocio.google). Revisar antes de publicar: cambian con el tiempo.
 */
export type Tema = "pilates" | "gimnasio" | "ambiente" | "fuerza" | "rehabilitacion";

export interface Resena {
  nombre: string;
  texto: string;
  temas: Tema[];
  guia?: boolean;
}

export const resenas: Resena[] = [
  { nombre: "Marta R.", texto: "Después de muchos años entrenando os aseguro que es primera vez que experimento un cambio físico tan radical... y lo que eso conlleva a nivel mental, mejor imposible... y todo gracias 720 gym y más en particular, a su dueño, mi entrenador! Muchas gracias, el mejor centro deportivo de Ourense!", temas: ["gimnasio", "fuerza"] },
  { nombre: "Oscar C.", texto: "Sin duda alguna el mejor gimnasio en el que he estado nunca, gente súper amable y comprensiva, nada masificado y entrenadores que realmente se preocupan por ti 10/10", temas: ["gimnasio", "ambiente"] },
  { nombre: "Alex X.", guia: true, texto: "He utilizado este gimnasio durante mis vacaciones para preparar la temporada de rugby en Alemania y continuar con mi rehabilitación tras una operación del ligamento cruzado anterior (ACL). La experiencia ha sido excelente…", temas: ["rehabilitacion", "fuerza"] },
  { nombre: "Héctor P.", texto: "El mejor gimnasio de la ciudad. En él se respira compañerismo y se fomenta el mismo, no hay envidias ni críticas hacia nadie, todo el mundo se ayuda y se apoya entre sí, la calidad humana es excepcional tanto de la gerencia como de los…", temas: ["ambiente"] },
  { nombre: "Maria F.", texto: "Si buscas un gimnasio en Ourense con grupos reducidos y atención personalizada 720 Gym Club cumplirá tus expectativas. Bea, instructora de pilates es maravillosa. Mi experiencia con ella en pilates Reformer es de 10. Lo recomiendo totalmente.", temas: ["pilates"] },
  { nombre: "Ainhoa R.", texto: "Lugar amplio y tranquilo. No tienes que esperar para poder usar una máquina y no hay aglomeraciones de gente. Lugar tranquilo y con un ambiente muy agradable. Además puedes ir hasta los domingos :)", temas: ["gimnasio"] },
  { nombre: "Fernán S.", texto: "El mejor gimnasio de Ourense para ponerte fuerte! Si te gusta el powerlifting este es tu sitio! 💪🏻", temas: ["fuerza"] },
  { nombre: "Esperanza V.", texto: "720 se ha convertido en mucho más que un lugar para entrenar. Aquí no solo he mejorado físicamente, sino que también he encontrado un ambiente excepcional rodeado de personas increíbles. Los entrenadores son profesionales, atentos y siempre…", temas: ["ambiente", "gimnasio"] },
  { nombre: "Susana M.", texto: "Llevaba tiempo buscando un gimnasio en Ourense donde hacer reformer en grupos reducidos y espacios amplios. Lo mejor, la atención personal de Bea y el buen ambiente que crea en todos los grupos..... Así se hacen las cosas. Mi puntuación es de 10!!!!", temas: ["pilates"] },
  { nombre: "Ruben M.", texto: "Buscaba un gimnasio no masificado, completo, con buen ambiente y lo encontré. Luego el trato con Brais y Pablo espectacular desde el primer momento. Recomendable 100x100", temas: ["gimnasio", "ambiente"] },
  { nombre: "Natalia G.", texto: "Este gimnasio es, sin duda, uno de los mejores de Ourense. Desde el primer día se nota el ambiente motivador y el trato cercano del equipo. Las instalaciones están siempre limpias, ordenadas y bien equipadas. La sala de máquinas cuenta con…", temas: ["gimnasio"] },
  { nombre: "Marina M.", guia: true, texto: "Mi experiencia en clase de pilates reformer con Bea es altamente positiva, las clases son reducidas, y la profe está en todo momento pendiente adaptando el ejercicio a tus capacidades si es necesario…", temas: ["pilates"] },
  { nombre: "Ana P.", texto: "Gimnasio de Ourense totalmente recomendable. Con instalaciones nuevas y personal muy profesional y amable. Ofrecen atención personalizada y con muy buen ambiente…", temas: ["gimnasio", "ambiente"] },
  { nombre: "Mabel A.", texto: "Para mí el mejor gimnasio de Ourense, instalaciones súper amplias, con una sala de máquinas impresionante, tienen actividades variadas algunas poco comunes pero lo que más me gusta es que en todas las actividades los grupos son reducidos así la atención es más personalizada.", temas: ["gimnasio"] },
  { nombre: "Jose Luis C.", texto: "¡Experiencia de 10! En 720 Club / Pilates se respira un ambiente increíble. Es como entrenar en casa pero con los mejores profesionales. La amabilidad del equipo es insuperable y, al trabajar con grupos tan reducidos, la atención es…", temas: ["pilates", "ambiente"] },
  { nombre: "Teresa C.", texto: "Es un gimnasio en Ourense donde Bea, Brais y Pablo han conseguido, con su buen hacer, que me encuentre muy a gusto y se genere un ambiente agradable. Bea es una gran profesional y gran persona, consigue que sus clases de pilates sean…", temas: ["pilates", "ambiente"] },
  { nombre: "Ana R.", guia: true, texto: "Excelente gimnasio en Ourense. Han creado un espacio único, con instalaciones de calidad, gran variedad de disciplinas y un ambiente lleno de energía positiva. El equipo es muy profesional y la atención es cercana y personalizada…", temas: ["gimnasio", "ambiente"] },
  { nombre: "Eli G.", texto: "Espacio creado con mucho cariño, la práctica al cuidado de la mejor profesora que nos hace estar en nuestro lugar seguro en cada práctica... Enseñándonos desde el respeto y el amor por nuestro cuerpo y nuestra mente... así es muy fácil…", temas: ["pilates"] },
  { nombre: "Clara F.", texto: "Para mí sin duda el mejor gimnasio de Ourense. Un lugar súper familiar donde tanto Bea como Brais son súper atentos y cercanos, sin dejar de lado la profesionalidad. Tienen un horario súper amplio, para facilitar que puedas ir a las clases…", temas: ["ambiente", "pilates"] },
  { nombre: "Cristina P.", texto: "Mi especialidad es el Pilates, aunque también he utilizado el gimnasio y es maravilloso. Sin duda, es uno de los mejores gimnasios de Ourense por su calidad y su atención exquisita…", temas: ["pilates", "gimnasio"] },
  { nombre: "Sonia C.", texto: "Recientemente he acudido a un nuevo gimnasio en Ourense donde imparten varias disciplinas entre ellas pilates que es a lo que yo asisto. Son grupos reducidos con muy buen ambiente y atención personalizada. Sin duda, un lugar ideal para cuidar del cuerpo y de la mente.", temas: ["pilates"] },
  { nombre: "Luis A.", texto: "Gimnasio increíble, buenas instalaciones y un personal increíble, totalmente recomendado si quieres entrenar con calma y buen rollo 💪🏻", temas: ["gimnasio", "ambiente"] },
  { nombre: "Franilena F.", guia: true, texto: "Excelente gimnasio. Espacio renovado, todo muy nuevo y limpio. Entrenadores amables y calificados. Recomendadas las clases de Capoeira, Pilates, Powerlifting, Gimnasia. Fácil aparcar en las inmediaciones", temas: ["gimnasio", "fuerza", "pilates"] },
  { nombre: "Sonia V.", texto: "El mejor gym en Ourense. Muy buen ambiente. Grupos reducidos. Pilates para todos los niveles, atención personalizada. No se puede pedir más", temas: ["pilates", "ambiente"] },
  { nombre: "Raquel M.", texto: "El nuevo gimnasio en Ourense 720gym club está genial. Unas instalaciones limpias y muy amplias. Hay grupos reducidos y el trato es increíble. 100% recomendado!", temas: ["gimnasio"] },
  { nombre: "Martin C.", texto: "Gimnasio totalmente acogedor, con increíbles instalaciones, amplia cantidad de diferentes espacios, y el propietario muy muy agradable.", temas: ["gimnasio", "ambiente"] },
  { nombre: "Cristina P.", texto: "720 GYM es un centro donde prima la honestidad y la profesionalidad, con un ambiente motivador que te invita a dar lo mejor de ti en cada entrenamiento. Bea es, sencillamente, la mejor instructora de Pilates. Sus clases son súper…", temas: ["pilates", "ambiente"] },
  { nombre: "María José F.", texto: "Este gimnasio en Ourense me ofrece lo que no había encontrado en otros. Atención personalizada, ambiente muy agradable y ganas de ir. Muy recomendable", temas: ["ambiente"] },
  { nombre: "Ana Belén R.", texto: "Es un centro súper dinámico, tiene un montón de salas y disciplinas diferentes, por otro lado las máquinas e instalaciones es todo súper nuevo. Además todos los profesionales que trabajan en ella, son súper agradables. Lo recomendaría sin ninguna duda.", temas: ["gimnasio"] },
  { nombre: "Natalia G.", guia: true, texto: "Excelentes profesionales! Enamorados de su trabajo y se nota. Cuidan con mimo a los clientes. Trabajan en grupos reducidos y destacan su atención personalizada y buen ambiente.", temas: ["ambiente"] },
  { nombre: "Jose F.", texto: "Buenas instalaciones, buenas actividades y muy buenos compañeros y sobre todo los 365 días del año. Inmejorable", temas: ["gimnasio"] },
  { nombre: "Milena O.", texto: "El gimnasio es muy completo y la atención es excelente. Instalaciones nuevas y todo muy bien ordenado.", temas: ["gimnasio"] },
  { nombre: "Alba G.", texto: "Más que un gimnasio es un centro deportivo. Atención personalizada en varias disciplinas. Buena gente y buenos profesionales. Acudo a clase de pilates y no cambiaría de instructora por nada del mundo. Se respira buen ambiente!", temas: ["pilates", "ambiente"] },
  { nombre: "Christian S.", texto: "Un gran centro de entrenamiento, muchas facilidades de horarios y un material de primera", temas: ["gimnasio", "fuerza"] },
  { nombre: "Claudio P.", texto: "Gimnasio en Ourense muy agradable, muy bien equipado, con grandes espacios y grandes profesionales al frente. Sin duda una gran elección.", temas: ["gimnasio"] },
];
