// Los retos, uno por día de huelga (posición 0 = Día 1 = 14 de octubre de 2026).
// Cada reto: { tipo, titulo?, datos, detras: { tema, ilus, titulo, texto: [párrafos], fuente } }.
// Tipos y sus datos (las explicaciones salen al terminar, dentro del propio reto):
//   palabra:    { palabra, pista? }
//   conexiones: { grupos: [{ nombre, fichas: [4], explica }] × 4 }   (del más fácil al más difícil)
//   cronologia: { enunciado?, momentos: [{ texto, anio, explica }] }  (en orden correcto)
//   emojis:     { enunciado?, items: [{ emojis, alt, titulo, detalle, explica }] × 4, distractores: [2] }   (la «Cartelera»)
//   cuantos:    { pregunta, cifra, unidad?, maximo? }
//   frase:      { texto: 'con [huecos]', distractores: [...], autor }
// Temas de ilustración: multitud, cine, aula, cifra, fabrica, libro, atril, calendario.
// Títulos de películas y canciones: los de su estreno en España.
// ⚠️ Pendiente de revisión por la asamblea (ver revision.html).

const WEB = '../huelga.html';
const CAJA = { nombre: 'Caja de resistencia del CEIP Perú', url: '../caja-resistencia.html' };
const BOE_CE = { nombre: 'Constitución española (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229' };
const wiki = (t, idioma = 'es') => `https://${idioma}.wikipedia.org/wiki/${t}`;

export const DIAS = [
  // Día 1
  {
    tipo: 'palabra', datos: { palabra: 'HUELGA' },
    detras: {
      tema: 'multitud', ilus: { texto: 'DÍA 1' },
      titulo: 'El 14 de octubre empezó la huelga indefinida',
      texto: [
        'La enseñanza pública madrileña está en huelga indefinida desde el 14 de octubre de 2026. Está llamado el profesorado de colegios, institutos y centros de FP.',
        'Se piden seis cosas: menos horas lectivas, menos alumnado por aula, menos burocracia, más apoyos y equidad, edificios dignos y una mejora salarial. Cada día, este reto te cuenta un poco más.',
        '«Huelga» viene de «holgar», que significaba descansar, dejar de trabajar. Hoy es un derecho que está en la Constitución.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga', url: WEB },
    },
  },
  // Día 2
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'En la sala de profes', fichas: ['TUPPER', 'CAFETERA', 'CORCHO', 'FOTOCOPIADORA'], explica: 'El tupper, la cafetera, el corcho con los avisos y la fotocopiadora que siempre se atasca cuando más prisa hay.' },
      { nombre: 'Asignaturas', fichas: ['LENGUA', 'PLÁSTICA', 'INGLÉS', 'MATES'], explica: 'Ciencia y Música también lo son, pero hoy jugaban en otro equipo.' },
      { nombre: 'Caja de…', fichas: ['RESISTENCIA', 'AHORROS', 'CAMBIOS', 'MÚSICA'], explica: 'La que importa en una huelga es la de resistencia: el dinero que se junta entre mucha gente para que quien para pueda aguantar sin sueldo.' },
      { nombre: 'Esconden un número', fichas: ['TODOS', 'ESTRÉS', 'CIENCIA', 'FAMILIA'], explica: 'To-DOS, es-TRES, CIEN-cia y fa-MIL-ia.' },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'CAJA DE RESISTENCIA' },
      titulo: 'Cada día de huelga es un día sin sueldo',
      texto: [
        'Quien hace huelga no cobra ese día. En una huelga indefinida eso pesa mucho, y por eso existen las cajas de resistencia: dinero que aportan muchas personas para repartir el coste entre todas.',
        'La caja del CEIP Perú cubre primero lo que cuestan las actividades de la huelga. Lo demás se reparte entre las trabajadoras y los trabajadores del colegio que la secundan. La supervisa la asamblea, que informa en cada reunión de cuánto hay y en qué se ha usado.',
        'Se puede aportar en la hucha del cole, por Bizum o por transferencia, o comprando una camiseta, una sudadera o participaciones de la rifa.',
      ],
      fuente: CAJA,
    },
  },
  // Día 3
  {
    tipo: 'cronologia', titulo: 'Hitos de la escuela pública',
    datos: { momentos: [
      { texto: 'La Ley Moyano hace obligatoria la escuela primaria', anio: 1857, explica: 'De los 6 a los 9 años. Fue la primera gran ley de instrucción pública y ordenó la enseñanza en España durante más de un siglo.' },
      { texto: 'Nace la Institución Libre de Enseñanza', anio: 1876, explica: 'La fundaron Francisco Giner de los Ríos y otros profesores expulsados de la universidad por defender la libertad de cátedra. Apostaba por una escuela activa, laica y sin exámenes memorísticos.' },
      { texto: 'Empiezan las Misiones Pedagógicas', anio: 1931, explica: 'Llevaron bibliotecas, cine, teatro y música a los pueblos más aislados.' },
      { texto: 'La Ley General de Educación crea la EGB', anio: 1970, explica: 'La Educación General Básica, común para todo el alumnado de 6 a 14 años.' },
      { texto: 'La Marea Verde sale a la calle en Madrid', anio: 2011, explica: 'El profesorado madrileño se movilizó con camisetas verdes contra los recortes y contra el aumento de horas lectivas.' },
    ] },
    detras: {
      tema: 'libro', ilus: { texto: 'MISIONES PEDAGÓGICAS' },
      titulo: 'Cuando la escuela fue a los pueblos',
      texto: [
        'En 1931 nacieron las Misiones Pedagógicas: maestras, maestros, estudiantes y artistas recorrieron pueblos de toda España con bibliotecas, cine, teatro, música y un museo ambulante con copias de cuadros del Prado.',
        'Para mucha gente fue la primera vez que veía una película. En junio de 1936, más de cinco mil pueblos tenían una biblioteca de las Misiones.',
      ],
      fuente: { nombre: 'Misiones Pedagógicas (Wikipedia)', url: wiki('Misiones_Pedagógicas') },
    },
  },
  // Día 4
  {
    tipo: 'emojis', titulo: 'Profes de película',
    datos: {
      items: [
        { emojis: '🦋👅👴📖', alt: 'mariposa, lengua, maestro mayor, libro', titulo: 'La lengua de las mariposas', detalle: 'España, 1999 · José Luis Cuerda', explica: 'Don Gregorio enseña a Moncho, un niño gallego, a mirar la naturaleza y a pensar por sí mismo. Es 1936 y la guerra lo romperá todo.' },
        { emojis: '🎶👦👦🏚️', alt: 'notas musicales, niños, internado', titulo: 'Los chicos del coro', detalle: 'Francia, 2004 · Christophe Barratier', explica: 'Un vigilante llega a un internado donde todo se arregla con castigos. Él prueba otra cosa: escuchar a cada niño y formar un coro.' },
        { emojis: '📜🪑🧍✒️', alt: 'poema, pupitre, alguien de pie, pluma', titulo: 'El club de los poetas muertos', detalle: 'EE. UU., 1989 · Peter Weir', explica: 'El profesor Keating hace que su alumnado se suba a las mesas para mirar las cosas desde otro sitio. «¡Oh, capitán, mi capitán!».' },
        { emojis: '👧📚🧠✨', alt: 'niña, libros, cerebro, brillo', titulo: 'Matilda', detalle: 'EE. UU., 1996 · Danny DeVito', explica: 'La señorita Honey es la primera adulta que se da cuenta de lo que vale Matilda. Lo consigue porque la mira de verdad.' },
      ],
      distractores: ['La clase', 'Ser y tener'],
    },
    detras: {
      tema: 'cine', ilus: { texto: 'La lengua de las mariposas', anio: '1999' },
      titulo: 'Lo que tienen en común estos cuatro profes',
      texto: [
        'Don Gregorio, Clément Mathieu, John Keating y la señorita Honey son muy distintos, pero comparten una cosa: se paran a conocer a cada alumno.',
        'En la vida real eso necesita algo que en el cine no se ve: tiempo. Tiempo para preparar, para escuchar y para hablar con las familias. Es lo que pide la huelga cuando reclama menos horas lectivas y grupos más pequeños.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: horario lectivo', url: `${WEB}#tiempo` },
    },
  },
  // Día 5
  {
    tipo: 'cuantos',
    datos: { pregunta: 'El 1 de diciembre de 1955, Rosa Parks no cedió su asiento en un autobús de Montgomery (Alabama). ¿Cuántos días duró el boicot a los autobuses que vino después?', cifra: 381, unidad: 'días', maximo: 1000 },
    detras: {
      tema: 'multitud', ilus: { texto: '381 DÍAS A PIE' },
      titulo: '381 días caminando',
      texto: [
        'Tras la detención de Rosa Parks, la población negra de Montgomery dejó de usar los autobuses. Durante 381 días fue andando, en coches compartidos o en taxis que cobraban lo mismo que el bus.',
        'El boicot terminó en diciembre de 1956, cuando el Tribunal Supremo de Estados Unidos declaró ilegal la segregación en los autobuses. Una lucha larga también es eso: aguantar juntas el tiempo que haga falta.',
      ],
      fuente: { nombre: 'Boicot de autobuses de Montgomery (Wikipedia)', url: wiki('Boicot_de_autobuses_de_Montgomery') },
    },
  },
  // Día 6
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'Yo, si tuviera hambre y estuviera desvalido en la calle, no pediría un [pan]; sino que pediría [medio] pan y un [libro].', distractores: ['plato', 'cuaderno', 'trabajo', 'entero'], autor: 'Federico García Lorca, Fuente Vaqueros, septiembre de 1931' },
    detras: {
      tema: 'atril', ilus: { texto: 'MEDIO PAN Y UN LIBRO', sub: 'Lorca · 1931' },
      titulo: 'Una biblioteca para su pueblo',
      texto: [
        'Lorca dijo estas palabras al inaugurar la biblioteca de Fuente Vaqueros, el pueblo de Granada donde nació. Era septiembre de 1931 y la República estaba llenando el país de escuelas y bibliotecas.',
        'Ese mismo año fundó La Barraca, un teatro universitario que llevaba a Lope de Vega y a Calderón por los pueblos. Para Lorca, la cultura no era un lujo: era un derecho tan básico como el pan.',
      ],
      fuente: { nombre: 'Le Grand Continent: «Medio pan y un libro»', url: 'https://legrandcontinent.eu/es/2024/08/19/medio-pan-y-un-libro/' },
    },
  },
  // Día 7
  {
    tipo: 'palabra', datos: { palabra: 'RATIO' },
    detras: {
      tema: 'cifra', ilus: { texto: '25 → 15', sub: 'alumnos por aula en Primaria: lo que hay y lo que pedimos' },
      titulo: 'Ratio: cuántos niños por aula',
      texto: [
        'La ratio es el número de alumnas y alumnos por aula. En Primaria, la ley permite hasta 25, y la Administración puede subirlo hasta un 10 % para escolarizar a quien llega a mitad de curso. En Madrid se ha empezado a bajar a 20 en los primeros cursos, poco a poco.',
        'Con 25 se puede dar clase. Lo difícil es todo lo demás que hoy se pide a la escuela: atender a cada ritmo, detectar a tiempo una dificultad, acompañar a quien lo está pasando mal y hablar con cada familia. Una cuenta sencilla: en una clase de 45 minutos, con 25 alumnos toca a menos de 2 minutos por persona; con 15, a 3.',
        'Por eso la huelga pide 15 como máximo en Primaria (13 en Infantil, 20 en Secundaria, 23 en Bachillerato y 15 en FP), y que el alumnado con necesidades específicas de apoyo cuente doble.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: ratios', url: `${WEB}#ratios` },
    },
  },
  // Día 8
  {
    tipo: 'cronologia', titulo: 'Huelgas que ganaron',
    datos: { momentos: [
      { texto: 'Huelga de las cerilleras de Londres', anio: 1888, explica: 'Unas 1.400 obreras de la fábrica Bryant & May pararon contra las multas y el fósforo blanco, que les destrozaba la mandíbula. En tres semanas consiguieron casi todo lo que pedían.' },
      { texto: 'Huelga del «pan y rosas» en Lawrence (EE. UU.)', anio: 1912, explica: 'Unas veinte mil personas de las fábricas textiles, muchas mujeres migrantes, pararon dos meses cuando les bajaron el sueldo. Ganaron subidas salariales.' },
      { texto: 'Huelga de La Canadiense en Barcelona', anio: 1919, explica: 'Dejó la ciudad casi sin luz durante semanas. Tras 44 días, el Gobierno aprobó la jornada de ocho horas.' },
      { texto: 'Huelga de las costureras de Ford en Dagenham', anio: 1968, explica: 'Cosían las tapicerías de los coches y cobraban menos que los hombres. Su huelga ayudó a que el Reino Unido aprobara en 1970 la ley de igualdad salarial.' },
      { texto: 'Día libre de las mujeres en Islandia', anio: 1975, explica: 'Nueve de cada diez islandesas dejaron de trabajar, dentro y fuera de casa, durante un día. Al año siguiente llegó una ley de igualdad.' },
    ] },
    detras: {
      tema: 'fabrica', ilus: { texto: 'PAN Y ROSAS', sub: 'Lawrence, 1912' },
      titulo: 'Queremos pan, pero también rosas',
      texto: [
        'De la huelga de Lawrence queda un lema: «pan y rosas». Pan es un salario digno; rosas, una vida que merezca la pena, con tiempo, descanso y cultura.',
        'Ninguna de estas cinco huelgas se ganó en un día ni la ganó una persona sola. Todas se sostuvieron con organización, apoyo de fuera y mucha paciencia.',
      ],
      fuente: { nombre: '1912 Lawrence textile strike (Wikipedia)', url: wiki('1912_Lawrence_textile_strike', 'en') },
    },
  },
  // Día 9
  {
    tipo: 'emojis', titulo: 'Huelgas en el cine',
    datos: {
      items: [
        { emojis: '🩰⛏️👦🥊', alt: 'zapatillas de ballet, pico de minero, niño, guantes de boxeo', titulo: 'Billy Elliot (Quiero bailar)', detalle: 'Reino Unido, 2000 · Stephen Daldry', explica: 'Su padre lo apunta a boxeo, pero Billy descubre el ballet. Todo pasa en un pueblo minero durante la gran huelga de 1984-1985.' },
        { emojis: '🏳️‍🌈⛏️🤝🚐', alt: 'bandera arcoíris, pico de minero, apretón de manos, furgoneta', titulo: 'Pride', detalle: 'Reino Unido, 2014 · Matthew Warchus', explica: 'Un grupo de lesbianas y gais de Londres recauda dinero para las familias de un pueblo minero galés en huelga. Pasó de verdad, en 1984.' },
        { emojis: '🧵🚗👩‍🏭⚖️', alt: 'hilo, coche, obrera, balanza', titulo: 'Pago justo', detalle: 'Reino Unido, 2010 · Nigel Cole', explica: 'Las costureras de la fábrica de Ford en Dagenham paran en 1968 para cobrar lo mismo que los hombres.' },
        { emojis: '📅☀️🏗️⛴️', alt: 'calendario, sol, grúa de astillero, ferry', titulo: 'Los lunes al sol', detalle: 'España, 2002 · Fernando León de Aranoa', explica: 'Un grupo de amigos sigue adelante en Vigo después del cierre del astillero en el que trabajaban.' },
      ],
      distractores: ['Norma Rae', 'Tiempos modernos'],
    },
    detras: {
      tema: 'multitud', ilus: { texto: 'APOYO MUTUO' },
      titulo: 'Lesbianas y gais con los mineros',
      texto: [
        'En 1984, el colectivo londinense LGSM (Lesbianas y Gais en Apoyo a los Mineros) recaudó dinero para las familias de un valle minero galés en huelga. Al principio, no todo el pueblo los recibió bien.',
        'En 1985, grupos de mineros encabezaron con sus estandartes la marcha del Orgullo de Londres. La solidaridad entre luchas distintas sostiene cualquier huelga.',
      ],
      fuente: { nombre: 'Pride (Wikipedia)', url: wiki('Pride_(película)') },
    },
  },
  // Día 10
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'Un [niño], un [profesor], un [libro] y un [lápiz] pueden cambiar el mundo.', distractores: ['examen', 'móvil', 'sueldo', 'horario'], autor: 'Malala Yousafzai, ante la ONU, 12 de julio de 2013' },
    detras: {
      tema: 'atril', ilus: { texto: 'UN LIBRO Y UN LÁPIZ', sub: 'Malala Yousafzai · 2013' },
      titulo: 'Una niña que defendió la escuela',
      texto: [
        'Malala Yousafzai recibió un disparo en 2012, con 15 años, por defender que las niñas de su región de Pakistán pudieran ir a clase. Nueve meses después habló ante las Naciones Unidas, el día que cumplía 16.',
        'En 2014 recibió el Premio Nobel de la Paz. Es la persona más joven que lo ha conseguido.',
      ],
      fuente: { nombre: 'Malala Yousafzai (Wikipedia)', url: wiki('Malala_Yousafzai') },
    },
  },
  // Día 11
  {
    tipo: 'cuantos',
    datos: { pregunta: 'El 24 de octubre de 1975, las mujeres de Islandia se tomaron el día libre: ni trabajo pagado ni tareas de casa. ¿Qué porcentaje de islandesas participó?', cifra: 90, unidad: '%', maximo: 100 },
    detras: {
      tema: 'calendario', ilus: { texto: '24', sub: 'OCTUBRE 1975' },
      titulo: 'El día que Islandia se paró',
      texto: [
        'Aquel viernes, nueve de cada diez mujeres islandesas pararon para demostrar cuánto trabajo hacían, pagado y sin pagar. Bancos, fábricas, escuelas y periódicos tuvieron que cerrar o funcionar a medias.',
        'Al año siguiente, Islandia aprobó una ley de igualdad. En 1980 eligió a Vigdís Finnbogadóttir, la primera mujer del mundo elegida presidenta por votación popular.',
      ],
      fuente: { nombre: '1975 Icelandic women’s strike (Wikipedia)', url: wiki('1975_Icelandic_women%27s_strike', 'en') },
    },
  },
  // Día 12
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Por aquí pasan las manis de Madrid', fichas: ['ATOCHA', 'CALLAO', 'SOL', 'ALCALÁ'], explica: 'Cibeles y Neptuno también son plazas de mani, pero hoy tenían otro sitio.' },
      { nombre: 'Planetas', fichas: ['MARTE', 'SATURNO', 'JÚPITER', 'NEPTUNO'], explica: 'El Sol es una estrella, no un planeta. Y Venus… sigue leyendo.' },
      { nombre: 'Diosas romanas', fichas: ['CIBELES', 'MINERVA', 'DIANA', 'VENUS'], explica: 'Cibeles era la madre de los dioses; Minerva, la de la sabiduría; Diana, la de la caza, y Venus, la del amor. Júpiter y Neptuno son dioses, no diosas.' },
      { nombre: 'Colores de las mareas', fichas: ['VERDE', 'BLANCA', 'NARANJA', 'VIOLETA'], explica: 'Verde, la educación; blanca, la sanidad; naranja, los servicios sociales, y violeta, el feminismo.' },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'MAREA VERDE' },
      titulo: 'Por qué las mareas tienen colores',
      texto: [
        'En 2011, contra los recortes, el profesorado madrileño empezó a salir a la calle con camisetas verdes y el lema «Escuela pública de tod@s para tod@s». Así nació la Marea Verde.',
        'Luego llegaron otras: la blanca de la sanidad, la naranja de los servicios sociales, la violeta del feminismo… Un color basta para reconocerse en la calle. Quince años después, el verde sigue ahí.',
      ],
      fuente: { nombre: 'Mareas ciudadanas (Wikipedia)', url: wiki('Mareas_ciudadanas') },
    },
  },
  // Día 13
  {
    tipo: 'palabra', datos: { palabra: 'PIQUETE' },
    detras: {
      tema: 'multitud', ilus: { texto: 'PIQUETE INFORMATIVO' },
      titulo: 'Informar también es hacer huelga',
      texto: [
        'Un piquete es un grupo de personas en huelga que informa de ella y anima a sumarse. La ley permite dar publicidad a la huelga de forma pacífica.',
        'La Constitución lo recoge en su artículo 28: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». Ese derecho incluye explicar por qué se para.',
      ],
      fuente: BOE_CE,
    },
  },
  // Día 14
  {
    tipo: 'cronologia', titulo: 'Derechos que se ganaron',
    datos: { momentos: [
      { texto: 'Se prohíbe trabajar en fábricas y minas a menores de diez años', anio: 1873, explica: 'La Ley Benot fue la primera ley española sobre el trabajo infantil. Se cumplió poco, pero abrió el camino.' },
      { texto: 'Primera ley de accidentes de trabajo', anio: 1900, explica: 'Por primera vez, la empresa tenía que responder cuando alguien se lesionaba trabajando.' },
      { texto: 'Jornada de ocho horas por ley', anio: 1919, explica: 'Llegó por decreto después de los 44 días de huelga de La Canadiense en Barcelona.' },
      { texto: 'Primeras vacaciones pagadas para todos los asalariados', anio: 1931, explica: 'La Ley de Contrato de Trabajo de la República fijó siete días al año. Hoy son treinta.' },
      { texto: 'Se aprueba el Estatuto de los Trabajadores', anio: 1980, explica: 'La ley que ordena hoy los derechos laborales básicos: contratos, jornada, descansos y vacaciones.' },
    ] },
    detras: {
      tema: 'calendario', ilus: { texto: '8 HORAS', sub: 'decreto de abril de 1919' },
      titulo: 'Nada de esto vino solo',
      texto: [
        'Hoy parece normal tener vacaciones pagadas, una jornada máxima o un seguro si te lesionas trabajando. Cada uno de esos derechos se consiguió después de años de reclamarlo, y muchas veces después de una huelga.',
        'Los derechos de hoy los defendieron otras personas antes. Los de mañana dependen de lo que hagamos ahora.',
      ],
      fuente: { nombre: 'Historia de las vacaciones pagadas (elDiario.es)', url: 'https://www.eldiario.es/economia/vacaciones-pagadas-cumplen-90-anos-han-cambiado-siete-dias-segunda-republica_1_8223922.html' },
    },
  },
  // Día 15
  {
    tipo: 'cuantos',
    datos: { pregunta: 'En febrero de 1919, el despido de unos trabajadores de La Canadiense, la compañía eléctrica de Barcelona, desató una huelga que dejó la ciudad casi a oscuras. ¿Cuántos días duró?', cifra: 44, unidad: 'días', maximo: 365 },
    detras: {
      tema: 'fabrica', ilus: { texto: 'LA CANADIENSE', sub: 'Barcelona, 1919 · 44 días' },
      titulo: 'Cuarenta y cuatro días y una jornada de ocho horas',
      texto: [
        'La huelga empezó en la compañía eléctrica y se extendió a otros sectores. Barcelona se quedó semanas casi sin luz ni tranvías.',
        'Tras 44 días, el Gobierno aprobó por decreto la jornada de ocho horas. España fue de los primeros países en establecerla por ley.',
      ],
      fuente: { nombre: 'Huelga de La Canadiense (Wikipedia)', url: wiki('Huelga_de_La_Canadiense') },
    },
  },
  // Día 16
  {
    tipo: 'emojis', titulo: 'Canciones de lucha',
    datos: {
      enunciado: 'Cuatro canciones contadas con emojis. Toca un cartel y luego su título. Sobran dos títulos.',
      items: [
        { emojis: '🪵🪢👴👦', alt: 'estaca, cuerda, abuelo, niño', titulo: 'L’estaca', detalle: 'Lluís Llach, 1968', explica: 'El viejo Siset le explica a un niño que la estaca que los ata está podrida: si tiran todos a la vez, caerá. Se cantó contra la dictadura y se canta en luchas de todo el mundo.' },
        { emojis: '👋🌸⛰️🌅', alt: 'mano que saluda, flor, montaña, amanecer', titulo: 'Bella ciao', detalle: 'Canción partisana italiana', explica: 'La cantaban los partisanos que lucharon contra el fascismo en Italia. Una serie española la volvió a poner de moda en todo el mundo en 2017.' },
        { emojis: '📻🕛🌺🇵🇹', alt: 'radio, medianoche, flor, bandera de Portugal', titulo: 'Grândola, Vila Morena', detalle: 'Zeca Afonso, 1971', explica: 'Sonó por la radio la madrugada del 25 de abril de 1974: era la señal para empezar la Revolución de los Claveles, que acabó con la dictadura en Portugal.' },
        { emojis: '🧱🧱🏫🙅', alt: 'ladrillos, colegio, alguien que dice no', titulo: 'Another Brick in the Wall', detalle: 'Pink Floyd, 1979', explica: 'Una crítica a la escuela autoritaria que convierte a cada niño en un ladrillo más del muro. El coro lo cantan alumnas y alumnos de un colegio de Londres.' },
      ],
      distractores: ['Libertad sin ira', 'Al vent'],
    },
    detras: {
      tema: 'multitud', ilus: { texto: 'SI TIRAMOS TODOS…' },
      titulo: 'Una estaca que solo cae si tiran todos',
      texto: [
        'La idea de «L’estaca» es muy sencilla: lo que nos ata parece firme, pero está podrido; nadie lo tumba solo, pero si tiramos todos a la vez, cae.',
        'Es la misma idea de una huelga. Una persona sola que deja de trabajar no cambia nada. Miles a la vez, sí.',
      ],
      fuente: { nombre: 'L’Estaca (Wikipedia)', url: wiki('L%27Estaca') },
    },
  },
  // Día 17
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'Toda persona tiene derecho a la [educación]. La educación debe ser [gratuita], al menos en lo concerniente a la instrucción [elemental] y fundamental.', distractores: ['privada', 'opcional', 'barata', 'superior'], autor: 'Declaración Universal de los Derechos Humanos, artículo 26 (1948)' },
    detras: {
      tema: 'libro', ilus: { texto: 'ARTÍCULO 26' },
      titulo: 'Un derecho de todo el mundo',
      texto: [
        'La Asamblea General de las Naciones Unidas aprobó la Declaración Universal de los Derechos Humanos el 10 de diciembre de 1948, después de la Segunda Guerra Mundial.',
        'Su artículo 26 añade que la educación tendrá por objeto el pleno desarrollo de la personalidad humana. No habla de aprobar exámenes: habla de crecer como persona.',
      ],
      fuente: { nombre: 'Declaración Universal de los Derechos Humanos (ONU)', url: 'https://www.un.org/es/about-us/universal-declaration-of-human-rights' },
    },
  },
  // Día 18
  {
    tipo: 'palabra', datos: { palabra: 'TIZA' },
    detras: {
      tema: 'aula', ilus: { texto: 'LA TIZA NO BASTA' },
      titulo: 'Lo que no ha cambiado en un aula',
      texto: [
        'Pizarras digitales, plataformas, aplicaciones… y la tiza sigue ahí. Lo que tampoco ha cambiado es lo que más importa: tiempo y atención para cada alumna y cada alumno.',
        'Ese tiempo depende de cuántas horas de clase hay, de cuántos alumnos por aula y de cuánto papeleo cae encima. De eso va esta huelga.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga', url: WEB },
    },
  },
  // Día 19
  {
    tipo: 'cuantos',
    datos: { pregunta: '¿Cuántos periodos lectivos a la semana, como máximo, pide la huelga para el profesorado de Primaria? (Con la tutoría y la coordinación dentro).', cifra: 22, unidad: 'periodos', maximo: 40 },
    detras: {
      tema: 'aula', ilus: { texto: '22 PERIODOS', sub: 'en Primaria · 17 en Secundaria y FP' },
      titulo: 'Una clase no empieza cuando suena el timbre',
      texto: [
        'Hay que prepararla, coordinarse con el equipo, hablar con las familias y seguir a cada alumno. Si casi todo el horario es lectivo, ese trabajo se hace a deshoras o no se hace.',
        'La huelga pide como máximo 22 periodos lectivos en Primaria y 17 en Secundaria y FP, con la tutoría y la coordinación dentro. También pide bajar la interinidad al 8 %.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: horario lectivo', url: `${WEB}#tiempo` },
    },
  },
  // Día 20
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'En el estuche', fichas: ['SACAPUNTAS', 'TIJERAS', 'PEGAMENTO', 'ESTUCHE'], explica: 'La goma, el celo y la regla también, pero hoy tenían otros planes.' },
      { nombre: 'Juegos de patio', fichas: ['COMBA', 'RAYUELA', 'ESCONDITE', 'GOMA'], explica: 'Saltar a la goma: dos sujetan el elástico con las piernas y la tercera salta.' },
      { nombre: 'Tipos de huelga', fichas: ['GENERAL', 'INDEFINIDA', 'CELO', 'HAMBRE'], explica: 'La de celo consiste en cumplir las normas al pie de la letra para frenarlo todo. La nuestra es indefinida: no tiene fecha de fin.' },
      { nombre: '… de oro', fichas: ['REGLA', 'BODAS', 'BALÓN', 'SIGLO'], explica: 'Regla de oro, bodas de oro, Balón de Oro y Siglo de Oro.' },
    ] },
    detras: {
      tema: 'calendario', ilus: { texto: 'INDEFINIDA', sub: 'sin fecha de fin' },
      titulo: '¿Qué quiere decir «indefinida»?',
      texto: [
        'Una huelga indefinida no tiene fecha de fin: sigue hasta que hay una negociación con resultados. Por eso pesa tanto la caja de resistencia: cada día cuesta un día de sueldo.',
        'Hay otras: la general, que para a casi todos los sectores a la vez; la de celo, que cumple las normas al milímetro para frenarlo todo, o la de hambre, la más dura. Todas buscan lo mismo: que quien decide tenga que escuchar.',
      ],
      fuente: CAJA,
    },
  },
  // Día 21
  {
    tipo: 'cronologia', titulo: 'El derecho a la educación',
    datos: { momentos: [
      { texto: 'Declaración Universal de los Derechos Humanos', anio: 1948, explica: 'Su artículo 26 dice que toda persona tiene derecho a la educación.' },
      { texto: 'Constitución española', anio: 1978, explica: 'Su artículo 27 reconoce el derecho a la educación y hace la enseñanza básica obligatoria y gratuita.' },
      { texto: 'Ley Orgánica del Derecho a la Educación (LODE)', anio: 1985, explica: 'Creó los consejos escolares, donde participan profesorado, familias y alumnado.' },
      { texto: 'Convención sobre los Derechos del Niño', anio: 1989, explica: 'El tratado de derechos humanos más ratificado del mundo. Su artículo 28 trata del derecho a la educación.' },
      { texto: 'Ley de educación vigente (LOMLOE)', anio: 2020, explica: 'Reformó la LOE de 2006, que es la que fija los máximos de alumnado por aula: 25 en Primaria y 30 en la ESO.' },
    ] },
    detras: {
      tema: 'libro', ilus: { texto: 'ARTÍCULO 27' },
      titulo: '«Todos tienen el derecho a la educación»',
      texto: [
        'Así empieza el artículo 27 de la Constitución. Más adelante añade que la enseñanza básica es obligatoria y gratuita, y que los poderes públicos garantizan ese derecho.',
        'Garantizarlo exige medios: profesorado suficiente, aulas en condiciones y tiempo para enseñar. De eso va la huelga.',
      ],
      fuente: BOE_CE,
    },
  },
  // Día 22
  {
    tipo: 'frase', titulo: 'Lo que dice la Constitución',
    datos: { texto: 'Todos tienen el derecho a la [educación]. […] La enseñanza básica es [obligatoria] y [gratuita].', distractores: ['privada', 'opcional', 'barata', 'religiosa'], autor: 'Constitución española, artículo 27' },
    detras: {
      tema: 'libro', ilus: { texto: 'OBLIGATORIA Y GRATUITA' },
      titulo: 'Un derecho que hay que garantizar',
      texto: [
        'El artículo 27.5 dice que los poderes públicos garantizan el derecho de todos a la educación «mediante una programación general de la enseñanza […] y la creación de centros docentes».',
        'Crear centros: la huelga pide construir los colegios e institutos públicos que hacen falta y acabar con la construcción por fases, que deja a generaciones enteras estudiando en obras.',
      ],
      fuente: BOE_CE,
    },
  },
  // Día 23
  {
    tipo: 'emojis', titulo: 'Profes contra viento y marea',
    datos: {
      items: [
        { emojis: '📓✍️🏙️👩‍🏫', alt: 'cuaderno, mano que escribe, ciudad, profesora', titulo: 'Diarios de la calle', detalle: 'EE. UU., 2007 · Richard LaGravenese', explica: 'Erin Gruwell consigue que una clase que nadie quería escriba sus propios diarios. Basada en hechos reales.' },
        { emojis: '🪖➡️👩‍🏫📜', alt: 'casco militar, flecha, profesora, poema', titulo: 'Mentes peligrosas', detalle: 'EE. UU., 1995 · John N. Smith', explica: 'Una exmarine se hace profesora de Lengua en un instituto difícil y engancha a su clase con poemas y canciones.' },
        { emojis: '🧮📈✏️🏆', alt: 'ábaco, gráfica que sube, lápiz, trofeo', titulo: 'Lecciones inolvidables', detalle: 'EE. UU., 1988 · Ramón Menéndez', explica: 'Jaime Escalante, profesor de Matemáticas en un instituto de Los Ángeles, prepara a su alumnado para un examen de cálculo que nadie creía que pudieran aprobar.' },
        { emojis: '🛠️➡️👨‍🏫🇬🇧', alt: 'herramientas, flecha, profesor, bandera del Reino Unido', titulo: 'Rebelión en las aulas', detalle: 'Reino Unido, 1967 · James Clavell', explica: 'Un ingeniero sin trabajo acepta una plaza de profesor en un barrio obrero de Londres. Lo protagoniza Sidney Poitier.' },
      ],
      distractores: ['El profesor (Detachment)', 'Escuela de rock'],
    },
    detras: {
      tema: 'cine', ilus: { texto: 'Diarios de la calle', anio: '2007' },
      titulo: 'El cine y el profe héroe',
      texto: [
        'Al cine le encanta el profe que lo arregla todo solo, a base de horas que no cobra. En la vida real, ese modelo quema.',
        'Lo que hace que un aula funcione no es un héroe, sino un equipo con tiempo para coordinarse, grupos manejables, apoyos para quien los necesita y alguien que se encargue del papeleo.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga', url: WEB },
    },
  },
  // Día 24
  {
    tipo: 'palabra', datos: { palabra: 'CLAUSTRO' },
    detras: {
      tema: 'aula', ilus: { texto: 'CLAUSTRO' },
      titulo: 'Decidir en común',
      texto: [
        'El claustro es el órgano en el que todo el profesorado de un centro participa en la vida pedagógica del cole.',
        'La huelga pide más participación democrática en los centros y que las tareas administrativas dejen de recaer en el profesorado, para que haya tiempo de hablar de lo importante.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: burocracia y participación', url: `${WEB}#participacion` },
    },
  },
  // Día 25
  {
    tipo: 'cronologia', titulo: 'Mujeres que abrieron camino',
    datos: { momentos: [
      { texto: 'Concepción Arenal asiste a clases de Derecho vestida de hombre', anio: 1841, explica: 'Las mujeres no podían ir a la universidad. Ella fue como oyente, disfrazada. Después sería una gran reformadora de las cárceles.' },
      { texto: 'Las mujeres pueden matricularse en la universidad sin pedir permiso', anio: 1910, explica: 'Hasta entonces necesitaban una autorización especial de la Administración.' },
      { texto: 'Abre la Residencia de Señoritas en Madrid', anio: 1915, explica: 'La dirigió la pedagoga María de Maeztu. Fue el primer centro oficial para que las universitarias pudieran vivir y estudiar en Madrid.' },
      { texto: 'Las Cortes aprueban el voto de las mujeres', anio: 1931, explica: 'Tras el debate en el que Clara Campoamor defendió que no se podía construir una democracia dejando fuera a la mitad del país.' },
      { texto: 'Las mujeres votan por primera vez en unas elecciones generales', anio: 1933, explica: 'El 19 de noviembre de 1933.' },
    ] },
    detras: {
      tema: 'atril', ilus: { texto: 'CLARA CAMPOAMOR', sub: 'Cortes, 1 de octubre de 1931' },
      titulo: 'El voto que se ganó con un discurso',
      texto: [
        'El 1 de octubre de 1931, las Cortes aprobaron el voto de las mujeres por 161 votos a favor y 121 en contra. Clara Campoamor lo defendió casi sola frente a quienes decían que las mujeres «no estaban preparadas».',
        'Su respuesta se resume en una idea: la libertad se aprende ejerciéndola. Lo mismo vale para la escuela: la participación se aprende participando.',
      ],
      fuente: { nombre: 'Clara Campoamor (Wikipedia)', url: wiki('Clara_Campoamor') },
    },
  },
  // Día 26
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'Todos los usos de la [palabra] para todos. […] No para que todos sean [artistas], sino para que nadie sea [esclavo].', distractores: ['ricos', 'libro', 'pobre', 'famosos'], autor: 'Gianni Rodari, «Gramática de la fantasía» (1973)' },
    detras: {
      tema: 'libro', ilus: { texto: 'GIANNI RODARI' },
      titulo: 'El maestro que inventaba cuentos',
      texto: [
        'Gianni Rodari fue maestro de escuela antes que escritor. En «Gramática de la fantasía» explicó cómo inventar historias con niñas y niños: el binomio fantástico, qué pasaría si…, los cuentos al revés.',
        'Para Rodari, la imaginación no era un adorno: aprender a usar las palabras es aprender a defenderse. Recibió el Premio Hans Christian Andersen, el gran premio de la literatura infantil, en 1970.',
      ],
      fuente: { nombre: 'Gianni Rodari (Wikipedia)', url: wiki('Gianni_Rodari') },
    },
  },
  // Día 27
  {
    tipo: 'cuantos',
    datos: { pregunta: 'La huelga pide al menos una orientadora u orientador por cada… ¿cuántos estudiantes?', cifra: 250, unidad: 'estudiantes', maximo: 2000 },
    detras: {
      tema: 'cifra', ilus: { texto: '1 / 250', sub: 'una persona de orientación por cada 250 estudiantes' },
      titulo: 'Alguien que acompañe',
      texto: [
        'La orientación ayuda a detectar dificultades, acompaña al alumnado en sus decisiones y apoya a las familias y al profesorado.',
        'Además de una persona de orientación por cada 250 estudiantes, la huelga pide recuperar las aulas de enlace para el alumnado que llega sin hablar castellano y reforzar los apoyos en los centros con alumnado vulnerable.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: equidad', url: `${WEB}#segregacion` },
    },
  },
  // Día 28
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: '«Huelga» en otras lenguas', fichas: ['STRIKE', 'SCIOPERO', 'GREBA', 'GRÈVE'], explica: 'Inglés, italiano, euskera y francés. En gallego es «folga» y en catalán… mira el siguiente grupo.' },
      { nombre: 'Sinónimos de perezosa', fichas: ['GANDULA', 'HOLGAZANA', 'PEREZOSA', 'VAGA'], explica: 'Trampa: en catalán, «vaga» significa huelga. Y hacer huelga no tiene nada de vago: cuesta un día de sueldo.' },
      { nombre: 'En la bolera', fichas: ['BOLA', 'PISTA', 'BOLO', 'CANAL'], explica: 'Un «strike» también es tirar todos los bolos de una vez. Hoy iba con la huelga.' },
      { nombre: 'En un parlamento', fichas: ['PLENO', 'ESCAÑO', 'ATRIL', 'ENMIENDA'], explica: 'El 22 de octubre hubo una concentración de la huelga ante la Asamblea de Madrid. Un «pleno» también es un strike en los bolos.' },
    ] },
    detras: {
      tema: 'libro', ilus: { texto: 'GRÈVE · STRIKE · VAGA' },
      titulo: 'De dónde viene la palabra',
      texto: [
        '«Huelga» viene de «holgar», que significaba dejar de trabajar. En francés se dice «grève» por la plaza de la Grève de París, a orillas del Sena, donde se juntaba la gente sin trabajo.',
        'El inglés «strike» viene de golpear, y también de «arriar las velas»: en 1768, los marineros de Londres bajaron las velas de los barcos para no zarpar.',
      ],
      fuente: { nombre: 'Huelga (Wikipedia)', url: wiki('Huelga') },
    },
  },
  // Día 29
  {
    tipo: 'emojis', titulo: 'Mujeres que lucharon',
    datos: {
      items: [
        { emojis: '🗳️👩🪨🇬🇧', alt: 'urna, mujer, piedra, bandera del Reino Unido', titulo: 'Sufragistas', detalle: 'Reino Unido, 2015 · Sarah Gavron', explica: 'Una lavandera de Londres se une a la lucha por el voto de las mujeres a principios del siglo XX.' },
        { emojis: '🚀🧮👩🏾‍🔬✏️', alt: 'cohete, ábaco, científica, lápiz', titulo: 'Figuras ocultas', detalle: 'EE. UU., 2016 · Theodore Melfi', explica: 'Tres matemáticas negras de la NASA, imprescindibles para la carrera espacial, en un país que las segregaba.' },
        { emojis: '🧵🏭🪧☝️', alt: 'hilo, fábrica, cartel, dedo en alto', titulo: 'Norma Rae', detalle: 'EE. UU., 1979 · Martin Ritt', explica: 'Una obrera textil se sube a una mesa con un cartel que dice «UNION» y la fábrica entera para las máquinas.' },
        { emojis: '🍞🌹🧹🏢', alt: 'pan, rosa, escoba, edificio de oficinas', titulo: 'Pan y rosas', detalle: 'Reino Unido, 2000 · Ken Loach', explica: 'Las limpiadoras de las oficinas de Los Ángeles se organizan para pedir un sueldo digno.' },
      ],
      distractores: ['Mujercitas', 'Erin Brockovich'],
    },
    detras: {
      tema: 'cine', ilus: { texto: 'Norma Rae', anio: '1979' },
      titulo: 'Un cartel encima de una mesa',
      texto: [
        'La escena más famosa de «Norma Rae» es muda: ella escribe «UNION» en un cartón, se sube a una mesa y, una a una, sus compañeras paran las máquinas.',
        'Sally Field ganó el Óscar por ese papel. La historia se inspira en Crystal Lee Sutton, una obrera de Carolina del Norte a la que despidieron por intentar organizar un sindicato.',
      ],
      fuente: { nombre: 'Norma Rae (Wikipedia)', url: wiki('Norma_Rae') },
    },
  },
  // Día 30
  {
    tipo: 'palabra', datos: { palabra: 'MAREA' },
    detras: {
      tema: 'multitud', ilus: { texto: 'NINGUNA SE GANÓ SOLA' },
      titulo: 'Un mes de huelga',
      texto: [
        'Hoy hace treinta días que empezó la huelga. Un mes de asambleas, piquetes, concentraciones, cajas de resistencia y conversaciones a la puerta del cole.',
        'El boicot de Montgomery duró 381 días; la huelga de La Canadiense, 44. Ninguna se ganó sola, y todas se ganaron porque alguien decidió seguir.',
      ],
      fuente: CAJA,
    },
  },
  // Día 31
  {
    tipo: 'cuantos',
    datos: { pregunta: 'Las Misiones Pedagógicas (1931-1936) dejaron bibliotecas en pueblos pequeños de toda España. En junio de 1936, ¿en cuántos pueblos había una?', cifra: 5522, unidad: 'pueblos', maximo: 20000 },
    detras: {
      tema: 'libro', ilus: { texto: '5.522 BIBLIOTECAS' },
      titulo: 'Libros donde nunca había llegado uno',
      texto: [
        'Todos los pueblos con biblioteca tenían menos de 5.000 habitantes. Las bibliotecas se llevaban más de la mitad del presupuesto de las Misiones.',
        'En 1932 y 1933 se apuntaron casi medio millón de lectoras y lectores. El presupuesto de 1935 ya no les dio dinero, y la guerra acabó con el proyecto.',
      ],
      fuente: { nombre: 'Biblioteca Central del Ministerio de Educación: Misiones Pedagógicas', url: 'https://www.educacionfpydeportes.gob.es/biblioteca-central/blog/2025/mayo/misiones-pedagogicas.html' },
    },
  },
  // Día 32
  {
    tipo: 'cronologia', titulo: 'Escuelas que se atrevieron',
    datos: { momentos: [
      { texto: 'Francisco Ferrer i Guàrdia abre la Escuela Moderna en Barcelona', anio: 1901, explica: 'Mixta, laica y sin premios ni castigos. Ferrer fue fusilado en 1909.' },
      { texto: 'María Montessori abre su primera Casa de los Niños en Roma', anio: 1907, explica: 'En un barrio obrero. Materiales a la medida de la infancia y libertad para elegir.' },
      { texto: 'Célestin Freinet lleva una imprenta a su aula', anio: 1924, explica: 'Su alumnado escribía textos libres, los imprimía y se los mandaba a otras escuelas.' },
      { texto: 'Loris Malaguzzi impulsa las escuelas infantiles municipales de Reggio Emilia', anio: 1963, explica: 'La idea de que la infancia tiene «cien lenguajes» para expresarse.' },
      { texto: 'El alumnado de Barbiana publica «Carta a una maestra»', anio: 1967, explica: 'Los chicos de la escuela de Lorenzo Milani, en un pueblo de montaña, denuncian una escuela que suspende siempre a los pobres.' },
    ] },
    detras: {
      tema: 'aula', ilus: { texto: 'APRENDER HACIENDO' },
      titulo: 'Lo nuevo no siempre es nuevo',
      texto: [
        'Trabajar por proyectos, escribir para que te lean de verdad, aprender manipulando… Muchas ideas que hoy parecen modernas tienen más de cien años.',
        'Todas estas escuelas tenían algo en común: grupos en los que se podía conocer a cada niño. Sin tiempo y sin ratios razonables, cualquier pedagogía se queda en el papel.',
      ],
      fuente: { nombre: 'Escuela Moderna (Wikipedia)', url: wiki('Escuela_Moderna') },
    },
  },
  // Día 33
  {
    tipo: 'palabra', datos: { palabra: 'AMIANTO' },
    detras: {
      tema: 'cifra', ilus: { texto: 'SIN AMIANTO', sub: 'retirarlo de los centros antiguos' },
      titulo: 'Un material que no debería seguir ahí',
      texto: [
        'El amianto se usó durante décadas en tejados, tuberías y paneles, también en colegios. Respirar sus fibras puede causar enfermedades graves, y en España está prohibido desde 2002.',
        'Muchos centros antiguos lo siguen teniendo. La huelga pide un plan de mantenimiento de los edificios con retirada del amianto y un plan integral de climatización, para que en junio se pueda estar en clase.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: infraestructuras', url: `${WEB}#infraestructuras` },
    },
  },
  // Día 34
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'La escuela tiene un solo [problema]: los [chicos] que [pierde].', distractores: ['libros', 'gana', 'examen', 'suspende'], autor: 'Escuela de Barbiana, «Carta a una maestra» (1967)' },
    detras: {
      tema: 'libro', ilus: { texto: 'CARTA A UNA MAESTRA' },
      titulo: 'Una escuela en lo alto de un monte',
      texto: [
        'Lorenzo Milani era un cura al que mandaron a Barbiana, una aldea perdida de la Toscana. Allí montó una escuela para los hijos de campesinos que la escuela oficial había suspendido.',
        'Se daba clase todos los días del año y nadie se quedaba atrás: quien sabía más enseñaba a quien sabía menos. En «Carta a una maestra», los propios chicos explican por qué la escuela de su tiempo dejaba fuera a los pobres.',
      ],
      fuente: { nombre: 'Lorenzo Milani (Wikipedia)', url: wiki('Lorenzo_Milani') },
    },
  },
  // Día 35
  {
    tipo: 'emojis', titulo: 'Más canciones de lucha',
    datos: {
      enunciado: 'Cuatro canciones contadas con emojis. Toca un cartel y luego su título. Sobran dos títulos.',
      items: [
        { emojis: '🙌🕊️🗓️🇺🇸', alt: 'manos en alto, paloma, calendario, bandera de EE. UU.', titulo: 'We Shall Overcome', detalle: 'Himno de los derechos civiles', explica: '«Venceremos algún día». La cantaba el movimiento por los derechos civiles en Estados Unidos en los años sesenta.' },
        { emojis: '👥🔗✊🚫', alt: 'personas, eslabones, puño, prohibido', titulo: 'El pueblo unido jamás será vencido', detalle: 'Quilapayún y Sergio Ortega, 1973', explica: 'Se compuso en Chile meses antes del golpe de Estado de 1973 y se convirtió en un grito de todo el mundo.' },
        { emojis: '✂️〰️🌾🧑‍🌾', alt: 'tijeras, alambre, trigo, campesino', titulo: 'A desalambrar', detalle: 'Daniel Viglietti, 1968', explica: 'Una canción uruguaya contra los latifundios: la tierra es de quien la trabaja.' },
        { emojis: '🕊️😌🚫😠', alt: 'paloma, cara tranquila, prohibido, cara enfadada', titulo: 'Libertad sin ira', detalle: 'Jarcha, 1976', explica: 'Sonó en todas partes durante la Transición: libertad, pero sin rencor.' },
      ],
      distractores: ['Gracias a la vida', 'Resistiré'],
    },
    detras: {
      tema: 'multitud', ilus: { texto: 'JAMÁS SERÁ VENCIDO' },
      titulo: 'Por qué en las manis se canta',
      texto: [
        'Cantar juntos hace que una multitud se sienta una sola cosa. Por eso casi todas las luchas tienen su canción.',
        'En nuestras manis suena «¡Educación pública y de calidad!». No es un himno famoso, pero cumple la misma función: que quien está a tu lado sepa que no está sola.',
      ],
      fuente: { nombre: 'El pueblo unido jamás será vencido (Wikipedia)', url: wiki('El_pueblo_unido_jamás_será_vencido') },
    },
  },
  // Día 36
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Dedos de la mano', fichas: ['PULGAR', 'CORAZÓN', 'ANULAR', 'MEÑIQUE'], explica: 'El índice también es un dedo, pero hoy estaba en un libro.' },
      { nombre: 'Partes de un libro', fichas: ['LOMO', 'ÍNDICE', 'PORTADA', 'SOLAPA'], explica: 'Lomo, índice, portada y solapa.' },
      { nombre: 'En una rifa', fichas: ['BOMBO', 'PAPELETA', 'PREMIO', 'NÚMERO'], explica: 'Como la rifa solidaria por la caja de resistencia: participaciones a 5 € y una cesta de 100 €.' },
      { nombre: 'Instrumentos de una batucada', fichas: ['SURDO', 'CAJA', 'AGOGÓ', 'REPIQUE'], explica: 'El surdo es el tambor grave que marca el pulso; la caja, el redoble; el repique, las llamadas, y el agogó, la campana doble. El bombo también suena en las manis, pero hoy estaba en la rifa.' },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'VÍSTETE DE HUELGA' },
      titulo: 'Comprar una camiseta también suma',
      texto: [
        'Camisetas, sudaderas, tote bags, chapas y la rifa: todo lo que se recauda va a la caja de resistencia del CEIP Perú.',
        'Llevar la camiseta verde por la calle también es una forma de apoyar la huelga: cada persona que la ve sabe que el cole de su barrio está en lucha.',
      ],
      fuente: { nombre: 'Pedidos de la asamblea', url: '../pedidos.html' },
    },
  },
  // Día 37
  {
    tipo: 'cuantos',
    datos: { pregunta: 'En 2001, la plantilla de Sintel, una empresa de telefonía, acampó en el paseo de la Castellana de Madrid para reclamar sus sueldos y sus empleos. ¿Cuántos días duró el «Campamento de la Esperanza»?', cifra: 187, unidad: 'días', maximo: 1000 },
    detras: {
      tema: 'multitud', ilus: { texto: 'CAMPAMENTO DE LA ESPERANZA' },
      titulo: 'Medio año en tiendas de campaña',
      texto: [
        'Del 29 de enero al 3 de agosto de 2001, cientos de trabajadores de Sintel vivieron en tiendas de campaña en plena Castellana. La empresa les debía varias nóminas y estaba a punto de cerrar.',
        'Vecinas y vecinos les llevaban comida y mantas. Al final consiguieron un acuerdo con el Gobierno para recolocar a buena parte de la plantilla.',
      ],
      fuente: { nombre: 'El Salto: el Campamento de la Esperanza cumple 25 años', url: 'https://www.elsaltodiario.com/laboral/campamento-trabajadores-sintel-paseo-castellana-madrid-privatizacion-despidos-quiebra' },
    },
  },
  // Día 38
  {
    tipo: 'palabra', datos: { palabra: 'PANCARTA' },
    detras: {
      tema: 'multitud', ilus: { texto: 'EDUCACIÓN PÚBLICA' },
      titulo: 'Una sábana, dos palos y mucha letra',
      texto: [
        'Muchas pancartas de esta huelga se han pintado en patios de colegio, con sábanas viejas, cartones y rotuladores. Las hacen profes, familias y, a veces, el propio alumnado.',
        'Una buena pancarta se lee de lejos: pocas palabras, letras grandes y un mensaje claro. Como «15 por aula» o «Menos papeles, más escuela».',
      ],
      fuente: { nombre: 'Actualidad de la asamblea', url: '../actualidad.html' },
    },
  },
  // Día 39
  {
    tipo: 'cronologia', titulo: 'Huelgas docentes',
    datos: { momentos: [
      { texto: 'La Marea Verde en Madrid', anio: 2011, explica: 'Contra la subida de horas lectivas en Secundaria, de 18 a 20, y el recorte de miles de interinos.' },
      { texto: 'El profesorado de Chicago para siete días', anio: 2012, explica: 'Fue su primera huelga en 25 años. Defendía sus condiciones y las de las escuelas de los barrios pobres.' },
      { texto: 'Tres semanas de huelga indefinida en Baleares', anio: 2013, explica: 'Contra la imposición de un modelo lingüístico. La sostuvo una caja de resistencia de más de 350.000 euros.' },
      { texto: 'Nueve días de huelga en Virginia Occidental', anio: 2018, explica: 'El profesorado consiguió una subida del 5 % y que se aplicara también al resto del personal público del estado.' },
      { texto: 'Seis días de huelga en Los Ángeles', anio: 2019, explica: 'Lograron bajar el número de alumnos por aula y una enfermera en cada colegio y un bibliotecario en cada instituto.' },
    ] },
    detras: {
      tema: 'aula', ilus: { texto: 'MENOS ALUMNOS POR AULA', sub: 'Los Ángeles, 2019' },
      titulo: 'Lo que ganaron en Los Ángeles',
      texto: [
        'En enero de 2019, más de 30.000 docentes de Los Ángeles hicieron huelga seis días bajo la lluvia. Pedían algo muy parecido a lo que se pide aquí: menos alumnos por aula y más personal de apoyo.',
        'El acuerdo bajó las ratios, quitó al distrito el poder de subirlas a su antojo y puso una enfermera en cada colegio y un bibliotecario en cada instituto.',
      ],
      fuente: { nombre: 'NEA Today: UTLA strike ends with historic agreement', url: 'https://neatoday.org/2019/01/23/utla-strike-ends-with-historic-agreement/' },
    },
  },
  // Día 40
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'La [educación] es el arma más [poderosa] que puedes usar para cambiar el [mundo].', distractores: ['dinero', 'barata', 'país', 'cara'], autor: 'Nelson Mandela, 2003' },
    detras: {
      tema: 'atril', ilus: { texto: 'NELSON MANDELA', sub: '1918-2013' },
      titulo: 'De la cárcel a la presidencia',
      texto: [
        'Nelson Mandela pasó 27 años en prisión por luchar contra el apartheid, el sistema que separaba por el color de la piel en Sudáfrica. En la cárcel siguió estudiando y enseñando a otros presos.',
        'En 1994 fue el primer presidente elegido por toda la población de Sudáfrica. La escuela también había estado segregada: acabar con eso era empezar a cambiar el país.',
      ],
      fuente: { nombre: 'Nelson Mandela (Wikipedia)', url: wiki('Nelson_Mandela') },
    },
  },
  // Día 41
  {
    tipo: 'cuantos',
    datos: { pregunta: 'En julio de 1888, las obreras de la fábrica de cerillas Bryant & May de Londres se pusieron en huelga. ¿Cuántas eran, aproximadamente?', cifra: 1400, unidad: 'obreras', maximo: 10000 },
    detras: {
      tema: 'fabrica', ilus: { texto: 'LAS CERILLERAS', sub: 'Londres, 1888' },
      titulo: 'Las cerilleras de Londres',
      texto: [
        'Trabajaban más de diez horas al día, les ponían multas por cualquier cosa y el fósforo blanco les causaba una enfermedad terrible en la mandíbula. Cuando despidieron a una compañera, salieron todas.',
        'En unas tres semanas consiguieron que se acabaran las multas y crearon su propio sindicato. Su huelga animó a muchos otros trabajadores sin cualificar a organizarse.',
      ],
      fuente: { nombre: 'Huelga de las cerilleras de 1888 (Wikipedia)', url: wiki('Matchgirls%27_strike', 'en') },
    },
  },
  // Día 42
  {
    tipo: 'emojis', titulo: 'Escuelas en la pantalla',
    datos: {
      items: [
        { emojis: '🏡❄️🐄👨‍🏫', alt: 'casa, nieve, vaca, maestro', titulo: 'Ser y tener', detalle: 'Francia, 2002 · Nicolas Philibert (documental)', explica: 'Un curso entero en una escuela unitaria de montaña: un solo maestro y niños de todas las edades en la misma aula.' },
        { emojis: '🚶‍♀️🐘🐎🏫', alt: 'niña caminando, elefante, caballo, colegio', titulo: 'Camino a la escuela', detalle: 'Francia, 2013 · Pascal Plisson (documental)', explica: 'Cuatro niños de Kenia, Argentina, Marruecos e India que recorren kilómetros cada día para llegar a clase.' },
        { emojis: '🗣️🧱🏫🇫🇷', alt: 'persona hablando, muro, colegio, bandera de Francia', titulo: 'La clase', detalle: 'Francia, 2008 · Laurent Cantet', explica: 'Un curso en un instituto de un barrio de París. El protagonista era profesor de verdad. Ganó la Palma de Oro de Cannes.' },
        { emojis: '🌅⛏️🏫🧒', alt: 'amanecer, pico de minero, colegio, niño', titulo: 'Hoy empieza todo', detalle: 'Francia, 1999 · Bertrand Tavernier', explica: 'El director de una escuela infantil de una cuenca minera en crisis se enfrenta a la pobreza de las familias de su alumnado.' },
      ],
      distractores: ['Profesor Lazhar', 'La ola'],
    },
    detras: {
      tema: 'cine', ilus: { texto: 'Ser y tener', anio: '2002' },
      titulo: 'Un aula, todas las edades',
      texto: [
        'En «Ser y tener», el maestro Georges Lopez da clase a la vez a niños de cuatro a once años en un pueblo de Auvernia. Conoce a cada uno, y a su familia, por su nombre.',
        'Las escuelas rurales unitarias existen también en España. Funcionan porque son pequeñas: lo que importa no es el edificio, sino cuántos niños le tocan a cada adulto.',
      ],
      fuente: { nombre: 'Ser y tener (Wikipedia)', url: wiki('Ser_y_tener') },
    },
  },
  // Día 43
  {
    tipo: 'palabra', datos: { palabra: 'RECREO' },
    detras: {
      tema: 'aula', ilus: { texto: 'RECREO' },
      titulo: 'El recreo también se trabaja',
      texto: [
        'El recreo parece tiempo libre, pero alguien tiene que vigilarlo, mediar en los conflictos, curar las rodillas y fijarse en quién se queda siempre solo.',
        'Esas guardias también son horas del profesorado. Cuando el horario va al límite, el patio se cubre con lo justo. Con más tiempo, el recreo puede ser también un espacio para aprender a convivir.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: horario lectivo', url: `${WEB}#tiempo` },
    },
  },
  // Día 44
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Pedagogos y pedagogas', fichas: ['FREIRE', 'FREINET', 'MONTESSORI', 'MALAGUZZI'], explica: 'Paulo Freire (Brasil), Célestin Freinet (Francia), María Montessori y Loris Malaguzzi (Italia). Milani también, pero hoy iba con la música.' },
      { nombre: 'Huelgas y boicots que ganaron', fichas: ['DAGENHAM', 'MONTGOMERY', 'ISLANDIA', 'BARCELONA'], explica: 'Las costureras de Ford, el boicot a los autobuses, el día libre de las islandesas y La Canadiense.' },
      { nombre: 'Se reparten en una mani', fichas: ['OCTAVILLA', 'SILBATO', 'PEGATINA', 'CHAPA'], explica: 'Y si sobran, a la caja de resistencia.' },
      { nombre: 'Empiezan por una nota musical', fichas: ['MILANI', 'LAWRENCE', 'SOLIDARIDAD', 'REIVINDICACIÓN'], explica: 'MI-lani, LA-wrence, SOL-idaridad y RE-ivindicación.' },
    ] },
    detras: {
      tema: 'aula', ilus: { texto: 'LA IMPRENTA DE FREINET' },
      titulo: 'Escribir para que te lean',
      texto: [
        'Célestin Freinet, maestro rural francés, llevó una pequeña imprenta al aula. Su alumnado escribía textos libres, los componía letra a letra y los mandaba a otras escuelas.',
        'En España, muchos maestros de la República usaron sus técnicas. Uno de ellos, Antoni Benaiges, prometió a sus alumnos de un pueblo de Burgos que los llevaría a ver el mar. Lo fusilaron en 1936, antes de que pudiera cumplirlo.',
      ],
      fuente: { nombre: 'Célestin Freinet (Wikipedia)', url: wiki('Célestin_Freinet') },
    },
  },
  // Día 45
  {
    tipo: 'cronologia', titulo: 'Canciones con historia',
    datos: { momentos: [
      { texto: '«Which Side Are You On?» («¿De qué lado estás?»)', anio: 1931, explica: 'La escribió Florence Reece, mujer de un minero de Kentucky, durante una huelga muy dura.' },
      { texto: '«L’estaca»', anio: 1968, explica: 'Lluís Llach: si tiramos todos, la estaca caerá.' },
      { texto: '«El pueblo unido jamás será vencido»', anio: 1973, explica: 'Quilapayún y Sergio Ortega, en Chile, meses antes del golpe de Estado.' },
      { texto: '«Libertad sin ira»', anio: 1976, explica: 'Jarcha, en plena Transición.' },
      { texto: '«Another Brick in the Wall»', anio: 1979, explica: 'Pink Floyd, contra la escuela que convierte a cada niño en un ladrillo más.' },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: '¿DE QUÉ LADO ESTÁS?' },
      titulo: 'Una canción escrita en un calendario',
      texto: [
        'Florence Reece escribió «Which Side Are You On?» en 1931, cuando los matones de la empresa minera registraban su casa buscando a su marido, que estaba en huelga. Según contó, la escribió en la hoja de un calendario de pared.',
        'La pregunta de la canción sigue siendo la de cualquier huelga: ¿de qué lado estás?',
      ],
      fuente: { nombre: 'Which Side Are You On? (Wikipedia)', url: wiki('Which_Side_Are_You_On%3F', 'en') },
    },
  },
  // Día 46
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'Tengo un [sueño]: que mis cuatro hijos pequeños vivirán un día en una nación donde no serán [juzgados] por el color de su [piel], sino por el contenido de su carácter.', distractores: ['plan', 'ropa', 'premiados', 'nombre'], autor: 'Martin Luther King, Washington, 28 de agosto de 1963' },
    detras: {
      tema: 'multitud', ilus: { texto: 'TENGO UN SUEÑO' },
      titulo: 'Una marcha por el trabajo y la libertad',
      texto: [
        'El discurso de Martin Luther King cerró la Marcha sobre Washington por el Trabajo y la Libertad, en la que participaron unas 250.000 personas. Pedía derechos civiles, pero también empleo y salarios dignos.',
        'Al año siguiente se aprobó la Ley de Derechos Civiles, que prohibía la discriminación por raza, color, religión, sexo u origen.',
      ],
      fuente: { nombre: 'Tengo un sueño (Wikipedia)', url: wiki('I_Have_a_Dream') },
    },
  },
  // Día 47
  {
    tipo: 'cuantos',
    datos: { pregunta: 'El 1 de octubre de 1931, las Cortes votaron el derecho al voto de las mujeres. ¿Cuántos diputados votaron a favor?', cifra: 161, unidad: 'votos', maximo: 500 },
    detras: {
      tema: 'atril', ilus: { texto: '161 A 121', sub: '1 de octubre de 1931' },
      titulo: 'Cuarenta votos de diferencia',
      texto: [
        'Votaron 161 a favor y 121 en contra. Las dos diputadas que intervinieron en el debate no estaban de acuerdo: Clara Campoamor defendió el voto de las mujeres; Victoria Kent pidió aplazarlo.',
        'Las españolas votaron por primera vez en unas elecciones generales el 19 de noviembre de 1933.',
      ],
      fuente: { nombre: 'Sufragio femenino en España (Wikipedia)', url: wiki('Sufragio_femenino_en_España') },
    },
  },
  // Día 48
  {
    tipo: 'palabra', datos: { palabra: 'TUTORÍA' },
    detras: {
      tema: 'aula', ilus: { texto: 'TUTORÍA' },
      titulo: 'La tutora o el tutor',
      texto: [
        'Cada grupo tiene una tutora o un tutor: la persona que coordina al equipo que le da clase, sigue a cada alumno y habla con las familias.',
        'Todo eso lleva horas. La huelga pide que la tutoría y la coordinación cuenten dentro del máximo de horas lectivas, y que en Primaria no se use a especialistas como tutores para tapar huecos.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: horario lectivo', url: `${WEB}#tiempo` },
    },
  },
  // Día 49
  {
    tipo: 'emojis', titulo: 'Ken Loach',
    datos: {
      enunciado: 'Cuatro películas de Ken Loach, el gran director del cine sobre el trabajo. Toca un cartel y luego su título. Sobran dos.',
      items: [
        { emojis: '🌾🗽🇪🇸🎒', alt: 'trigo, estatua de la libertad, bandera de España, mochila', titulo: 'Tierra y libertad', detalle: '1995', explica: 'Un joven parado de Liverpool viaja a España en 1936 para luchar en la guerra civil.' },
        { emojis: '🪚📝💻😤', alt: 'serrucho, formulario, ordenador, cara enfadada', titulo: 'Yo, Daniel Blake', detalle: '2016 · Palma de Oro en Cannes', explica: 'Un carpintero enfermo se pierde en una burocracia que le exige rellenar formularios por internet que no sabe usar.' },
        { emojis: '📦🚚⏱️👨‍👩‍👧', alt: 'paquete, furgoneta, cronómetro, familia', titulo: 'Sorry We Missed You', detalle: '2019', explica: 'Un repartidor «autónomo» y una cuidadora a domicilio trabajan sin parar y apenas ven a sus hijos.' },
        { emojis: '🦅👦🏫⛏️', alt: 'ave rapaz, niño, colegio, pico de minero', titulo: 'Kes', detalle: '1969', explica: 'Un niño de un pueblo minero al que la escuela ha dado por perdido encuentra un cernícalo y aprende a adiestrarlo.' },
      ],
      distractores: ['Full Monty', 'Billy Elliot (Quiero bailar)'],
    },
    detras: {
      tema: 'cine', ilus: { texto: 'Yo, Daniel Blake', anio: '2016' },
      titulo: 'Papeles que se comen a las personas',
      texto: [
        'En «Yo, Daniel Blake», un carpintero que no puede trabajar se queda atrapado entre formularios, citas por internet y llamadas que nunca se contestan.',
        'En las escuelas también hay papeles que se comen horas. La huelga pide al menos un administrativo a jornada completa en cada centro, para que las tareas administrativas dejen de recaer en el profesorado.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: burocracia y participación', url: `${WEB}#participacion` },
    },
  },
  // Día 50
  {
    tipo: 'cronologia', titulo: 'Hasta qué edad hay que ir al cole',
    datos: { momentos: [
      { texto: 'Escuela obligatoria de los 6 a los 9 años', anio: 1857, explica: 'Lo fijó la Ley Moyano. Muchas familias necesitaban que sus hijos trabajaran, y la ley se cumplía poco.' },
      { texto: 'La escuela obligatoria se amplía hasta los 12 años', anio: 1909, explica: 'Una ley de junio de 1909, que también creó una escuela superior para formar al magisterio.' },
      { texto: 'La Constitución de la República declara la enseñanza primaria gratuita y obligatoria', anio: 1931, explica: 'Su artículo 48 también decía que el magisterio sería funcionario público.' },
      { texto: 'La EGB lleva la escuela obligatoria hasta los 14 años', anio: 1970, explica: 'Con la Ley General de Educación.' },
      { texto: 'La LOGSE la lleva hasta los 16 y crea la ESO', anio: 1990, explica: 'Desde entonces, toda la población estudia al menos hasta los 16 años.' },
    ] },
    detras: {
      tema: 'cifra', ilus: { texto: '9 → 16', sub: 'años de escuela obligatoria, de 1857 a 1990' },
      titulo: 'Cada ampliación fue una pelea',
      texto: [
        'En 1900, más de la mitad de la población española no sabía leer ni escribir. Ampliar la escuela obligatoria fue una pelea constante contra la pobreza y el trabajo infantil.',
        'Hoy toda la infancia está escolarizada. El reto ya no es que estén en el aula, sino que cada uno aprenda de verdad. Y eso depende de los medios.',
      ],
      fuente: { nombre: 'Historia de la educación en España (Wikipedia)', url: wiki('Historia_de_la_educación_en_España') },
    },
  },
  // Día 51
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'La [poesía] es un arma cargada de [futuro].', distractores: ['escuela', 'pasado', 'huelga', 'balas'], autor: 'Gabriel Celaya, «Cantos íberos» (1955)' },
    detras: {
      tema: 'libro', ilus: { texto: 'CARGADA DE FUTURO' },
      titulo: 'Un poema que se hizo canción',
      texto: [
        'Gabriel Celaya escribió que la poesía no podía ser un adorno, sino algo útil para cambiar las cosas. Paco Ibáñez le puso música, y el poema se cantó en recitales y manifestaciones durante la dictadura.',
        'Lo mismo pasa con la escuela: no es un lugar neutro. Lo que se aprende en ella prepara el futuro de todo un país.',
      ],
      fuente: { nombre: 'Gabriel Celaya (Wikipedia)', url: wiki('Gabriel_Celaya') },
    },
  },
  // Día 52
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'En el tupper de la sala de profes', fichas: ['LENTEJAS', 'MACARRONES', 'TORTILLA', 'ENSALADA'], explica: 'Comer en veinte minutos entre una clase y una reunión también forma parte del oficio.' },
      { nombre: 'Juegos de mesa', fichas: ['PARCHÍS', 'DOMINÓ', 'AJEDREZ', 'OCA'], explica: 'De oca a oca y tiro porque me toca. La oca también es un ave, pero no la única de hoy.' },
      { nombre: 'Aves', fichas: ['URRACA', 'GORRIÓN', 'CIGÜEÑA', 'PALOMA'], explica: 'La paloma también es un símbolo, pero hoy volaba con las aves.' },
      { nombre: 'Símbolos de lucha', fichas: ['PUÑO', 'CLAVEL', 'ARCOÍRIS', 'LAZO'], explica: 'El puño en alto, el clavel de la revolución portuguesa, el arcoíris de la diversidad y el lazo de tantas causas.' },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'UN CLAVEL EN UN FUSIL' },
      titulo: 'Símbolos que se entienden sin palabras',
      texto: [
        'El 25 de abril de 1974, en Lisboa, la gente puso claveles en los fusiles de los soldados que acababan con la dictadura. Desde entonces se llama la Revolución de los Claveles.',
        'La paloma de la paz la dibujó Picasso para un congreso por la paz en 1949. La bandera arcoíris la diseñó Gilbert Baker en San Francisco en 1978. Y la camiseta verde es ya el símbolo de la escuela pública madrileña.',
      ],
      fuente: { nombre: 'Revolución de los Claveles (Wikipedia)', url: wiki('Revolución_de_los_Claveles') },
    },
  },
  // Día 53
  {
    tipo: 'cuantos',
    datos: { pregunta: '¿En qué año se aprobó la Ley Moyano, la primera gran ley de instrucción pública de España, que hizo obligatoria la escuela primaria?', cifra: 1857, unidad: '', maximo: 2026 },
    detras: {
      tema: 'libro', ilus: { texto: 'LEY MOYANO · 1857' },
      titulo: '«Pasar más hambre que un maestro de escuela»',
      texto: [
        'La Ley Moyano, de 1857, ordenó la enseñanza en España durante más de cien años. Hizo obligatoria la primera enseñanza, de los 6 a los 9 años, y gratuita para quien no pudiera pagarla.',
        'Pero una ley no basta: durante décadas faltaron escuelas, y los sueldos de los maestros, que dependían de los ayuntamientos, llegaban tarde o no llegaban. De ahí viene el dicho.',
      ],
      fuente: { nombre: 'Ley Moyano (Wikipedia)', url: wiki('Ley_Moyano') },
    },
  },
  // Día 54
  {
    tipo: 'palabra', datos: { palabra: 'ASAMBLEA' },
    detras: {
      tema: 'multitud', ilus: { texto: 'ASAMBLEA' },
      titulo: 'Decidir entre todas',
      texto: [
        'Esta huelga se organiza en asambleas: reuniones en las que quien está en huelga habla, escucha y vota qué hacer. La Asamblea Docente del CEIP Perú es una de ellas.',
        'La asamblea también supervisa la caja de resistencia y explica en cada reunión cuánto dinero hay y en qué se ha usado. Nadie decide por los demás.',
      ],
      fuente: { nombre: 'Quiénes somos', url: '../quienes-somos.html' },
    },
  },
  // Día 55
  {
    tipo: 'emojis', titulo: 'Cine español con memoria',
    datos: {
      items: [
        { emojis: '🌊🖨️👨‍🏫🏔️', alt: 'ola, imprenta, maestro, montaña', titulo: 'El maestro que prometió el mar', detalle: 'España, 2023 · Patricia Font', explica: 'La historia real de Antoni Benaiges, maestro republicano en un pueblo de Burgos.' },
        { emojis: '👩‍🏫👩‍🏫📚⏳', alt: 'dos maestras, libros, reloj de arena', titulo: 'Las maestras de la República', detalle: 'España, 2013 · Pilar Pérez Solano (documental)', explica: 'Recupera la memoria de las maestras que llevaron la escuela pública y la coeducación a toda España.' },
        { emojis: '🚲☀️💣🏠', alt: 'bicicleta, sol, bomba, casa', titulo: 'Las bicicletas son para el verano', detalle: 'España, 1984 · Jaime Chávarri', explica: 'Una familia de Madrid durante la guerra civil. A Luisito le habían prometido una bici si aprobaba.' },
        { emojis: '🐝🎞️👧🧟', alt: 'abeja, película, niña, monstruo', titulo: 'El espíritu de la colmena', detalle: 'España, 1973 · Víctor Erice', explica: 'En un pueblo castellano de posguerra, una niña ve «Frankenstein» en el cine ambulante y sale a buscar al monstruo.' },
      ],
      distractores: ['Mientras dure la guerra', 'La trinchera infinita'],
    },
    detras: {
      tema: 'cine', ilus: { texto: 'El maestro que prometió el mar', anio: '2023' },
      titulo: 'Un maestro y una imprenta',
      texto: [
        'Antoni Benaiges llegó en 1934 a la escuela de Bañuelos de Bureba (Burgos). Con su dinero compró una imprenta y un gramófono, y sus alumnos empezaron a publicar sus propios cuadernos.',
        'Les prometió llevarlos a ver el mar, que no habían visto nunca. En julio de 1936 lo asesinaron. Sus restos se encontraron en una fosa común en 2010.',
      ],
      fuente: { nombre: 'Antoni Benaiges (Wikipedia)', url: wiki('Antoni_Benaiges') },
    },
  },
  // Día 56
  {
    tipo: 'cronologia', titulo: 'Huelgas que pararon España',
    datos: { momentos: [
      { texto: 'Huelga general de agosto', anio: 1917, explica: 'La convocaron UGT y CNT para pedir un cambio de régimen, en plena subida de precios. El Gobierno la reprimió con el ejército.' },
      { texto: 'La «huelgona» de la minería asturiana', anio: 1962, explica: 'En plena dictadura, se extendió desde los pozos de Asturias a otras regiones. Inspiró la canción «Hay una lumbre en Asturias».' },
      { texto: 'Huelga general del 14-D', anio: 1988, explica: 'A medianoche, la única televisión que había se fue a negro. Según los sindicatos, pararon más de siete millones de personas.' },
      { texto: 'El Campamento de la Esperanza de Sintel', anio: 2001, explica: '187 días acampados en la Castellana para defender sus empleos.' },
      { texto: 'Huelga feminista del 8 de marzo', anio: 2018, explica: 'Millones de mujeres pararon en el trabajo, en los cuidados y en el consumo.' },
    ] },
    detras: {
      tema: 'calendario', ilus: { texto: '14-D', sub: 'diciembre de 1988' },
      titulo: 'El día que la tele se fue a negro',
      texto: [
        'Diez segundos antes de la medianoche del 14 de diciembre de 1988, el personal de Televisión Española empezó una cuenta atrás. A las doce en punto, la pantalla se fue a negro.',
        'Al día siguiente España se paró. La huelga general se convocó contra un plan de empleo juvenil con contratos precarios, y el Gobierno acabó retirándolo.',
      ],
      fuente: { nombre: 'Público: el arquitecto del 14-D', url: 'https://www.publico.es/politica/apolinar-rodriguez-arquitecto-14d.html' },
    },
  },
  // Día 57
  {
    tipo: 'cuantos',
    datos: { pregunta: '¿Con cuántos años recibió Malala Yousafzai el Premio Nobel de la Paz, en 2014?', cifra: 17, unidad: 'años', maximo: 100 },
    detras: {
      tema: 'cifra', ilus: { texto: '17', sub: 'años tenía Malala al recibir el Nobel de la Paz' },
      titulo: 'La persona más joven con un Nobel',
      texto: [
        'Malala compartió el premio con Kailash Satyarthi, un activista indio que lleva décadas luchando contra el trabajo infantil.',
        'El jurado los premió juntos por su lucha contra la opresión de la infancia y por el derecho de todos los niños a la educación. La escuela y el trabajo infantil siempre han ido de la mano: donde entra una, sale el otro.',
      ],
      fuente: { nombre: 'Malala Yousafzai (Wikipedia)', url: wiki('Malala_Yousafzai') },
    },
  },
  // Día 58
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'Abrid [escuelas] y se cerrarán [cárceles].', distractores: ['puertas', 'fábricas', 'bancos', 'ventanas'], autor: 'Atribuida a Concepción Arenal (y a Victor Hugo)' },
    detras: {
      tema: 'atril', ilus: { texto: 'CONCEPCIÓN ARENAL', sub: '1820-1893' },
      titulo: 'Una mujer que entró donde no la dejaban',
      texto: [
        'Concepción Arenal fue a clases de Derecho vestida de hombre, porque a las mujeres no se les permitía. Después fue visitadora de cárceles de mujeres y escribió mucho sobre cómo reformar las prisiones.',
        'Defendía que el castigo no arregla nada si no hay educación. La frase de hoy se le atribuye a ella y también a Victor Hugo; no está claro quién la dijo primero.',
      ],
      fuente: { nombre: 'Concepción Arenal (Wikipedia)', url: wiki('Concepción_Arenal') },
    },
  },
  // Día 59
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Colores de las mareas', fichas: ['VERDE', 'BLANCA', 'NARANJA', 'VIOLETA'], explica: 'Educación, sanidad, servicios sociales y feminismo.' },
      { nombre: 'Canciones de lucha', fichas: ['RESISTIRÉ', 'L’ESTACA', 'GRÂNDOLA', 'BELLA CIAO'], explica: '«Resistiré», del Dúo Dinámico, se cantó en los balcones en la pandemia.' },
      { nombre: 'Verbos para no rendirse', fichas: ['CONTINUAR', 'AGUANTAR', 'PERSISTIR', 'INSISTIR'], explica: 'Resistir también lo era, pero hoy cantaba.' },
      { nombre: '… de resistencia', fichas: ['CAJA', 'CARRERA', 'PRUEBA', 'SÍMBOLO'], explica: 'La que de verdad sostiene una huelga es la caja de resistencia.' },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'SEGUIMOS' },
      titulo: 'Resistir es seguir',
      texto: [
        'Una huelga larga no se gana con un gran día, sino con muchos días normales en los que la gente sigue: sigue en la asamblea, sigue aportando a la caja, sigue explicando a las familias por qué se para.',
        'Si has llegado hasta aquí, tú también has seguido. Compártelo con alguien que todavía no sepa por qué está en huelga la escuela pública madrileña.',
      ],
      fuente: CAJA,
    },
  },
  // Día 60
  {
    tipo: 'palabra', datos: { palabra: 'SEGUIMOS' },
    detras: {
      tema: 'multitud', ilus: { texto: 'DÍA 60' },
      titulo: 'Sesenta días después',
      texto: [
        'Dos meses de huelga. Sesenta retos con historias de maestras, mineros, costureras, cerilleras, canciones y leyes que alguien peleó antes que nosotras.',
        'Todas ellas tienen algo en común: nadie regaló nada. La escuela pública que tenemos la defendieron otros antes, y la que queremos la defendemos ahora, en común.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga', url: WEB },
    },
  },
];
