// Los retos, uno por día de huelga (posición 0 = Día 1 = 14 de octubre de 2026).
// Cada reto: { tipo, titulo?, datos, detras: { tema, ilus, titulo, texto: [párrafos], fuente } }.
// Tipos y sus datos:
//   palabra:    { palabra, pista? }
//   conexiones: { grupos: [{ nombre, fichas: [4] }] × 4 }   (del más fácil al más difícil)
//   cronologia: { enunciado?, momentos: [{ texto, anio }] }  (en orden correcto)
//   emojis:     { pistas: [{ emojis, alt } | { texto }], opciones: [...], respuesta }
//   cuantos:    { pregunta, cifra, unidad?, maximo? }
//   bulo:       { afirmaciones: [{ texto, cierto, explica }] }
//   frase:      { texto: 'con [huecos]', distractores: [...], autor }
// Temas de ilustración: multitud, cine, aula, cifra, fabrica, libro, atril, calendario.
// ⚠️ Pendiente de revisión por la asamblea (ver revision.html).

const WEB = '../huelga.html';
const wiki = (t, idioma = 'es') => `https://${idioma}.wikipedia.org/wiki/${t}`;

export const DIAS = [
  // Día 1 · miércoles 14-O
  {
    tipo: 'palabra', datos: { palabra: 'HUELGA' },
    detras: {
      tema: 'multitud', ilus: { texto: 'DÍA 1' },
      titulo: 'El 14 de octubre empezó la huelga indefinida',
      texto: [
        'La enseñanza pública madrileña está en huelga indefinida desde el 14 de octubre de 2026. Está llamado el profesorado de colegios, institutos y centros de FP.',
        'Se piden seis cosas: menos horas lectivas, menos alumnado por aula, menos burocracia, más apoyos y equidad, edificios dignos y una mejora salarial. Cada día de este reto te cuenta un poco más.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga', url: WEB },
    },
  },
  // Día 2 · jueves 15-O
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'En la sala de profes', fichas: ['TUPPER', 'FOTOCOPIADORA', 'CAFETERA', 'CORCHO'] },
      { nombre: 'Herramientas de una huelga', fichas: ['PIQUETE', 'ASAMBLEA', 'CAJA', 'PANCARTA'] },
      { nombre: 'Películas con aula', fichas: ['MATILDA', 'SER Y TENER', 'LOS CHICOS DEL CORO', 'ESCUELA DE ROCK'] },
      { nombre: 'Alumnado máximo por aula que pide la huelga', fichas: ['13', '15', '20', '23'] },
    ] },
    detras: {
      tema: 'aula', ilus: { texto: '15 POR AULA', sub: 'Infantil 13 · Primaria 15 · ESO 20 · Bach. 23' },
      titulo: 'Grupos donde cada niña y cada niño tenga su sitio',
      texto: [
        'La huelga pide como máximo 13 alumnos por aula en Infantil, 15 en Primaria, 20 en Secundaria, 23 en Bachillerato y 15 en FP. El alumnado con necesidades específicas de apoyo contaría doble.',
        'Con quince en clase da tiempo a escuchar a cada uno, a ver quién se está quedando atrás y a ayudarle antes de que sea tarde.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: ratios', url: `${WEB}#ratios` },
    },
  },
  // Día 3 · viernes 16-O
  {
    tipo: 'cronologia', titulo: 'Hitos de la escuela pública',
    datos: { momentos: [
      { texto: 'La Ley Moyano hace obligatoria la escuela primaria', anio: 1857 },
      { texto: 'Nace la Institución Libre de Enseñanza', anio: 1876 },
      { texto: 'Empiezan las Misiones Pedagógicas', anio: 1931 },
      { texto: 'La Ley General de Educación crea la EGB', anio: 1970 },
      { texto: 'La Marea Verde sale a la calle en Madrid', anio: 2011 },
    ] },
    detras: {
      tema: 'libro', ilus: { texto: 'MISIONES PEDAGÓGICAS' },
      titulo: 'Cuando la escuela fue a los pueblos',
      texto: [
        'En 1931 nacieron las Misiones Pedagógicas: maestras, maestros, estudiantes y artistas recorrieron pueblos de toda España con bibliotecas, cine, teatro, música y un museo ambulante con copias de cuadros del Prado.',
        'Para mucha gente fue la primera vez que veía una película. Las Misiones dejaron miles de pequeñas bibliotecas en escuelas rurales.',
      ],
      fuente: { nombre: 'Misiones Pedagógicas (Wikipedia)', url: wiki('Misiones_Pedagógicas') },
    },
  },
  // Día 4 · sábado 17-O
  {
    tipo: 'emojis', titulo: '¿Qué película es?',
    datos: {
      pistas: [
        { emojis: '🦋👅🏫', alt: 'mariposa, lengua, escuela' },
        { texto: 'Película española de 1999.' },
        { texto: 'Un maestro mayor enseña a un niño de un pueblo gallego a mirar el mundo.' },
        { texto: 'Verano de 1936. La dirigió José Luis Cuerda.' },
      ],
      opciones: ['La lengua de las mariposas', 'El laberinto del fauno', 'Los girasoles ciegos', 'El espíritu de la colmena', 'Las bicicletas son para el verano', 'Mientras dure la guerra'],
      respuesta: 'La lengua de las mariposas',
    },
    detras: {
      tema: 'cine', ilus: { texto: 'La lengua de las mariposas', anio: '1999' },
      titulo: 'Un maestro que enseñaba a mirar',
      texto: [
        'En «La lengua de las mariposas», don Gregorio (Fernando Fernán Gómez) enseña a Moncho, un niño gallego, a observar la naturaleza y a pensar por sí mismo. Es 1936.',
        'La película de José Luis Cuerda adapta relatos de Manuel Rivas y es un homenaje a las maestras y los maestros de la República.',
      ],
      fuente: { nombre: 'La lengua de las mariposas (Wikipedia)', url: wiki('La_lengua_de_las_mariposas') },
    },
  },
  // Día 5 · domingo 18-O
  {
    tipo: 'cuantos',
    datos: { pregunta: 'El 1 de diciembre de 1955, Rosa Parks no cedió su asiento en un autobús de Montgomery (Alabama). ¿Cuántos días duró el boicot a los autobuses que vino después?', cifra: 381, unidad: 'días', maximo: 1000 },
    detras: {
      tema: 'multitud', ilus: { texto: '381 DÍAS A PIE' },
      titulo: '381 días caminando',
      texto: [
        'Tras la detención de Rosa Parks, la población negra de Montgomery dejó de usar los autobuses. Durante 381 días fue andando, en coches compartidos o en taxis que cobraban lo mismo que el bus.',
        'El boicot terminó en diciembre de 1956, cuando el Tribunal Supremo de Estados Unidos declaró ilegal la segregación en los autobuses. Una huelga también es eso: aguantar juntas el tiempo que haga falta.',
      ],
      fuente: { nombre: 'Boicot de autobuses de Montgomery (Wikipedia)', url: wiki('Boicot_de_autobuses_de_Montgomery') },
    },
  },
  // Día 6 · lunes 19-O
  {
    tipo: 'bulo', titulo: 'Lo que pide (y no pide) la huelga',
    datos: { afirmaciones: [
      { texto: 'La huelga pide un máximo de 15 alumnos por aula en Primaria.', cierto: true, explica: 'Y 13 en Infantil, 20 en Secundaria, 23 en Bachillerato y 15 en FP.' },
      { texto: 'La huelga pide quitar las tutorías.', cierto: false, explica: 'Pide que la tutoría y la coordinación cuenten dentro del máximo de horas lectivas.' },
      { texto: 'La huelga pide 600 € más al mes en el complemento específico docente.', cierto: true, explica: 'Es una reivindicación, no una subida concedida.' },
      { texto: 'La huelga pide cerrar los colegios en junio por el calor.', cierto: false, explica: 'Pide un plan integral de climatización y retirar el amianto de los centros antiguos.' },
      { texto: 'La huelga pide al menos un administrativo a jornada completa en cada centro.', cierto: true, explica: 'Para que el papeleo deje de recaer en el profesorado.' },
    ] },
    detras: {
      tema: 'aula', ilus: { texto: '6 REIVINDICACIONES' },
      titulo: 'Lo que pide la huelga, en seis bloques',
      texto: [
        'Horario lectivo, ratios, lucha contra la segregación y equidad, mejora salarial, burocracia y participación, e infraestructuras.',
        'La mayoría se notan directamente en la clase: más tiempo para preparar, grupos más pequeños, apoyos para quien los necesita y aulas en las que se pueda estar en junio.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga', url: WEB },
    },
  },
  // Día 7 · martes 20-O
  {
    tipo: 'palabra', datos: { palabra: 'RATIO' },
    detras: {
      tema: 'cifra', ilus: { texto: '15', sub: 'alumnos por aula en Primaria, como máximo' },
      titulo: 'Ratio: cuántos por aula',
      texto: [
        'La ratio es el número de alumnas y alumnos por aula. La huelga pide 15 como máximo en Primaria.',
        'Además, el alumnado con necesidades específicas de apoyo contaría doble. Un aula con dos niños que necesitan más apoyo tendría como mucho 13 alumnos, porque esos dos cuentan por cuatro.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: ratios', url: `${WEB}#ratios` },
    },
  },
  // Día 8 · miércoles 21-O
  {
    tipo: 'cronologia', titulo: 'Huelgas que ganaron',
    datos: { momentos: [
      { texto: 'Huelga de las cerilleras de Londres', anio: 1888 },
      { texto: 'Huelga del «pan y rosas» en Lawrence (EE. UU.)', anio: 1912 },
      { texto: 'Huelga de La Canadiense en Barcelona', anio: 1919 },
      { texto: 'Huelga de las costureras de Ford en Dagenham', anio: 1968 },
      { texto: 'Día libre de las mujeres en Islandia', anio: 1975 },
    ] },
    detras: {
      tema: 'fabrica', ilus: { texto: 'PAN Y ROSAS', sub: 'Lawrence, 1912' },
      titulo: 'Queremos pan, pero también rosas',
      texto: [
        'En 1912, unas veinte mil personas de las fábricas textiles de Lawrence (Massachusetts) fueron a la huelga cuando les bajaron el sueldo. Muchas eran mujeres y migrantes de decenas de países.',
        'Tras dos meses de huelga lograron subidas salariales. Se la recuerda como la huelga del «pan y rosas»: salario digno, pero también una vida digna.',
      ],
      fuente: { nombre: '1912 Lawrence textile strike (Wikipedia)', url: wiki('1912_Lawrence_textile_strike', 'en') },
    },
  },
  // Día 9 · jueves 22-O
  {
    tipo: 'emojis', titulo: '¿Qué película es?',
    datos: {
      pistas: [
        { emojis: '🩰⛏️👦', alt: 'zapatillas de ballet, pico de minero, niño' },
        { texto: 'Película británica del año 2000.' },
        { texto: 'Un niño de un pueblo minero quiere ser bailarín.' },
        { texto: 'Transcurre durante la gran huelga minera de 1984-1985.' },
      ],
      opciones: ['Billy Elliot', 'Full Monty', 'Pride', 'Tocando el viento', 'Kes', 'Los lunes al sol'],
      respuesta: 'Billy Elliot',
    },
    detras: {
      tema: 'cine', ilus: { texto: 'Billy Elliot', anio: '2000' },
      titulo: 'Ballet en plena huelga minera',
      texto: [
        '«Billy Elliot» transcurre en un pueblo minero del norte de Inglaterra durante la huelga de 1984-1985 contra el cierre de minas, que duró casi un año.',
        'Mientras su padre y su hermano están en huelga, Billy descubre el ballet. La película habla de dignidad, del miedo a no llegar a fin de mes y de la solidaridad de un pueblo entero.',
      ],
      fuente: { nombre: 'Billy Elliot (Wikipedia)', url: wiki('Billy_Elliot') },
    },
  },
  // Día 10 · viernes 23-O
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
  // Día 11 · sábado 24-O
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
  // Día 12 · domingo 25-O
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Por dónde pasan las manis', fichas: ['ATOCHA', 'CIBELES', 'NEPTUNO', 'SOL'] },
      { nombre: 'Lo que pide la huelga', fichas: ['RATIOS', 'CLIMATIZACIÓN', 'ADMINISTRATIVO', 'APOYOS'] },
      { nombre: 'Películas de huelgas y trabajo', fichas: ['PRIDE', 'NORMA RAE', 'LOS LUNES AL SOL', 'PAGO JUSTO'] },
      { nombre: 'Maestras y maestros de película', fichas: ['DON GREGORIO', 'SEÑORITA HONEY', 'CLÉMENT MATHIEU', 'JOHN KEATING'] },
    ] },
    detras: {
      tema: 'cine', ilus: { texto: 'Pago justo', anio: '2010' },
      titulo: 'Las costureras que cambiaron una ley',
      texto: [
        '«Pago justo» («Made in Dagenham») cuenta la huelga de 1968 de las costureras de la fábrica de Ford en Dagenham, cerca de Londres. Cosían las tapicerías de los coches y cobraban menos que los hombres.',
        'Su huelga paró la producción y ayudó a que el Reino Unido aprobara en 1970 la ley de igualdad salarial.',
      ],
      fuente: { nombre: 'Made in Dagenham (Wikipedia)', url: wiki('Made_in_Dagenham', 'en') },
    },
  },
  // Día 13 · lunes 26-O
  {
    tipo: 'palabra', datos: { palabra: 'PIQUETE' },
    detras: {
      tema: 'multitud', ilus: { texto: 'PIQUETE INFORMATIVO' },
      titulo: 'Informar también es hacer huelga',
      texto: [
        'Un piquete es un grupo de personas en huelga que informa y anima a sumarse. La ley permite dar publicidad a la huelga de forma pacífica.',
        'La Constitución lo dice en su artículo 28: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses».',
      ],
      fuente: { nombre: 'Constitución española (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229' },
    },
  },
  // Día 14 · martes 27-O
  {
    tipo: 'bulo', titulo: 'El derecho de huelga',
    datos: { afirmaciones: [
      { texto: 'El derecho de huelga está en la Constitución española.', cierto: true, explica: 'En el artículo 28.2.' },
      { texto: 'El profesorado de la escuela pública no puede hacer huelga.', cierto: false, explica: 'Tiene derecho a hacerla, como cualquier persona trabajadora, respetando los servicios mínimos.' },
      { texto: 'Los días de huelga se descuentan del sueldo.', cierto: true, explica: 'Por eso existe la caja de resistencia.' },
      { texto: 'Informar de la huelga a las puertas del centro es ilegal.', cierto: false, explica: 'La ley permite hacer publicidad de la huelga de forma pacífica.' },
      { texto: 'Los servicios mínimos los fija la Administración.', cierto: true, explica: 'Y pueden recurrirse ante los tribunales si se consideran abusivos.' },
    ] },
    detras: {
      tema: 'libro', ilus: { texto: 'ARTÍCULO 28' },
      titulo: 'La huelga es un derecho, y cuesta',
      texto: [
        '«Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses», dice el artículo 28.2 de la Constitución.',
        'Hacer huelga tiene un precio: ese día no se cobra. Por eso las huelgas largas se sostienen con cajas de resistencia, que reparten el coste entre mucha gente.',
      ],
      fuente: { nombre: 'Caja de resistencia del CEIP Perú', url: '../caja-resistencia.html' },
    },
  },
  // Día 15 · miércoles 28-O
  {
    tipo: 'cronologia', titulo: 'El derecho a la educación',
    datos: { momentos: [
      { texto: 'Declaración Universal de los Derechos Humanos (artículo 26)', anio: 1948 },
      { texto: 'Constitución española (artículo 27)', anio: 1978 },
      { texto: 'Ley Orgánica del Derecho a la Educación (LODE)', anio: 1985 },
      { texto: 'Convención sobre los Derechos del Niño', anio: 1989 },
      { texto: 'Ley Orgánica de Educación vigente (LOMLOE)', anio: 2020 },
    ] },
    detras: {
      tema: 'libro', ilus: { texto: 'ARTÍCULO 27' },
      titulo: '«Todos tienen el derecho a la educación»',
      texto: [
        'Así empieza el artículo 27 de la Constitución. Más adelante añade que la enseñanza básica es obligatoria y gratuita, y que los poderes públicos garantizan ese derecho.',
        'Treinta años antes, la Declaración Universal de los Derechos Humanos ya decía en su artículo 26 que toda persona tiene derecho a la educación.',
      ],
      fuente: { nombre: 'Constitución española (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229' },
    },
  },
  // Día 16 · jueves 29-O
  {
    tipo: 'emojis', titulo: '¿Qué película es?',
    datos: {
      pistas: [
        { emojis: '🏳️‍🌈⛏️🤝', alt: 'bandera arcoíris, pico de minero, apretón de manos' },
        { texto: 'Película británica de 2014.' },
        { texto: 'Activistas de Londres recaudan dinero para las familias de unos mineros en huelga.' },
        { texto: 'Gales, 1984. El colectivo se llamaba LGSM.' },
      ],
      opciones: ['Pride', 'Billy Elliot', 'Full Monty', 'Tocando el viento', 'Pago justo', 'Kinky Boots'],
      respuesta: 'Pride',
    },
    detras: {
      tema: 'multitud', ilus: { texto: 'APOYO MUTUO' },
      titulo: 'Lesbianas y gais con los mineros',
      texto: [
        'En 1984, el colectivo londinense LGSM (Lesbianas y Gais en Apoyo a los Mineros) recaudó dinero para las familias de un valle minero galés en huelga. Al principio no todo el pueblo los recibió bien.',
        'En 1985, grupos de mineros encabezaron con sus estandartes la marcha del Orgullo de Londres. La solidaridad entre luchas distintas sostiene cualquier huelga.',
      ],
      fuente: { nombre: 'Pride (Wikipedia)', url: wiki('Pride_(película)') },
    },
  },
  // Día 17 · viernes 30-O
  {
    tipo: 'cuantos',
    datos: { pregunta: '¿Cuántos periodos lectivos a la semana, como máximo, pide la huelga para el profesorado de Primaria? (Con la tutoría y la coordinación dentro).', cifra: 22, unidad: 'periodos', maximo: 40 },
    detras: {
      tema: 'aula', ilus: { texto: '22 PERIODOS', sub: 'en Primaria · 17 en Secundaria y FP' },
      titulo: 'Una clase no empieza cuando suena el timbre',
      texto: [
        'Hay que prepararla, coordinarse con el equipo, hablar con las familias y seguir a cada alumno. Si casi todo el horario es lectivo, ese trabajo se hace a deshoras o no se hace.',
        'La huelga pide como máximo 22 periodos lectivos en Primaria y 17 en Secundaria y FP, con la tutoría y la coordinación dentro.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: horario lectivo', url: `${WEB}#tiempo` },
    },
  },
  // Día 18 · sábado 31-O
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
  // Día 19 · domingo 1-N
  {
    tipo: 'frase', titulo: 'Lo que dice la Constitución',
    datos: { texto: 'Todos tienen el derecho a la [educación]. […] La enseñanza básica es [obligatoria] y [gratuita].', distractores: ['privada', 'opcional', 'barata', 'religiosa'], autor: 'Constitución española, artículo 27' },
    detras: {
      tema: 'libro', ilus: { texto: 'OBLIGATORIA Y GRATUITA' },
      titulo: 'Un derecho que hay que garantizar',
      texto: [
        'El artículo 27.5 dice que los poderes públicos garantizan el derecho de todos a la educación «mediante una programación general de la enseñanza […] y la creación de centros docentes».',
        'Garantizarlo exige medios: profesorado suficiente, aulas en condiciones y tiempo para enseñar. Es lo que pide la huelga.',
      ],
      fuente: { nombre: 'Constitución española (BOE)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229' },
    },
  },
  // Día 20 · lunes 2-N
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Se oyen en una mani', fichas: ['MEGÁFONO', 'SILBATO', 'BOMBO', 'CACEROLA'] },
      { nombre: 'Formas de apoyar la huelga', fichas: ['CAJA', 'RIFA', 'CAMISETA', 'QUEJA'] },
      { nombre: 'Cosas de un barracón', fichas: ['URALITA', 'CHAPA', 'CALOR', 'MÓDULO'] },
      { nombre: 'Siglas que se oyen en un cole', fichas: ['AMPA', 'PT', 'AL', 'PGA'] },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'ENTRE TODAS' },
      titulo: 'Cómo se sostiene una huelga',
      texto: [
        'Una huelga indefinida se sostiene con mucha gente: quien para, quien aporta a la caja de resistencia, quien compra una camiseta, quien va a las concentraciones y quien pone una queja a la Consejería.',
        'Cada día de huelga es un día sin sueldo. La caja reparte ese coste entre muchas manos para que la huelga pueda seguir.',
      ],
      fuente: { nombre: 'Caja de resistencia del CEIP Perú', url: '../caja-resistencia.html' },
    },
  },
  // Día 21 · martes 3-N
  {
    tipo: 'cuantos',
    datos: { pregunta: '¿En qué año se aprobó la Ley Moyano, la primera gran ley de instrucción pública de España, que hizo obligatoria la escuela primaria?', cifra: 1857, unidad: '', maximo: 2026 },
    detras: {
      tema: 'libro', ilus: { texto: 'LEY MOYANO · 1857' },
      titulo: '«Pasar más hambre que un maestro de escuela»',
      texto: [
        'La Ley Moyano, de 1857, ordenó la enseñanza en España durante más de cien años. Hizo obligatoria la primera enseñanza, de los 6 a los 9 años, y gratuita para quien no pudiera pagarla.',
        'Pero una ley no basta: durante décadas faltaron escuelas y los sueldos de los maestros, que dependían de los ayuntamientos, llegaban tarde o no llegaban. De ahí viene el dicho.',
      ],
      fuente: { nombre: 'Ley Moyano (Wikipedia)', url: wiki('Ley_Moyano') },
    },
  },
  // Día 22 · miércoles 4-N
  {
    tipo: 'bulo', titulo: 'Huelgas y películas',
    datos: { afirmaciones: [
      { texto: 'La jornada de 8 horas llegó a España tras la huelga de La Canadiense, en 1919.', cierto: true, explica: 'Un decreto de abril de 1919 la estableció, después de 44 días de huelga en Barcelona.' },
      { texto: 'Rosa Parks era una costurera que nunca había participado en política.', cierto: false, explica: 'Era costurera, sí, pero también secretaria de la asociación por los derechos civiles NAACP en Montgomery.' },
      { texto: '«Billy Elliot» transcurre durante una huelga minera.', cierto: true, explica: 'La de 1984-1985 en el Reino Unido.' },
      { texto: 'La Marea Verde se llama así por el color de las camisetas.', cierto: true, explica: 'Desde 2011, el profesorado madrileño se reconoce en la calle por sus camisetas verdes.' },
      { texto: 'La huelga de mujeres de Islandia de 1975 la convocó el Gobierno.', cierto: false, explica: 'La organizaron las propias organizaciones de mujeres.' },
    ] },
    detras: {
      tema: 'fabrica', ilus: { texto: 'LA CANADIENSE', sub: 'Barcelona, 1919 · 44 días' },
      titulo: 'Cuarenta y cuatro días y una jornada de ocho horas',
      texto: [
        'En febrero de 1919, el despido de unos trabajadores de la compañía eléctrica conocida como La Canadiense desató una huelga que dejó Barcelona casi sin luz ni tranvías durante semanas.',
        'Tras 44 días, el Gobierno aprobó por decreto la jornada de ocho horas. España fue de los primeros países en establecerla por ley.',
      ],
      fuente: { nombre: 'Huelga de La Canadiense (Wikipedia)', url: wiki('Huelga_de_La_Canadiense') },
    },
  },
  // Día 23 · jueves 5-N
  {
    tipo: 'emojis', titulo: '¿Qué película es?',
    datos: {
      pistas: [
        { emojis: '🎶👦🏫', alt: 'notas musicales, niño, escuela' },
        { texto: 'Película francesa de 2004.' },
        { texto: 'Un vigilante llega en 1949 a un internado de niños donde todo se arregla con castigos.' },
        { texto: 'Lo cambia todo formando un coro.' },
      ],
      opciones: ['Los chicos del coro', 'La clase', 'Ser y tener', 'El club de los poetas muertos', 'Hoy empieza todo', 'Profesor Lazhar'],
      respuesta: 'Los chicos del coro',
    },
    detras: {
      tema: 'cine', ilus: { texto: 'Los chicos del coro', anio: '2004' },
      titulo: 'Lo que no consiguen los castigos',
      texto: [
        'En «Los chicos del coro», Clément Mathieu llega a un internado de la posguerra francesa donde manda el castigo. Él prueba otra cosa: escuchar a cada niño y formar un coro.',
        'La película recuerda algo que cualquier docente sabe: el vínculo con cada alumno necesita tiempo. Y el tiempo hay que tenerlo.',
      ],
      fuente: { nombre: 'Los chicos del coro (Wikipedia)', url: wiki('Los_chicos_del_coro') },
    },
  },
  // Día 24 · viernes 6-N
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
  // Día 25 · sábado 7-N
  {
    tipo: 'cronologia', titulo: 'Mujeres que cambiaron las cosas',
    datos: { momentos: [
      { texto: 'María Montessori abre su primera Casa de los Niños en Roma', anio: 1907 },
      { texto: 'Las Cortes aprueban el voto de las mujeres en España', anio: 1931 },
      { texto: 'Rosa Parks no cede su asiento en Montgomery', anio: 1955 },
      { texto: 'Las islandesas se toman el día libre', anio: 1975 },
      { texto: 'Malala Yousafzai recibe el Nobel de la Paz', anio: 2014 },
    ] },
    detras: {
      tema: 'atril', ilus: { texto: 'CLARA CAMPOAMOR', sub: 'Cortes, 1 de octubre de 1931' },
      titulo: 'El voto que se ganó con un discurso',
      texto: [
        'El 1 de octubre de 1931, las Cortes aprobaron el voto de las mujeres después de un debate en el que Clara Campoamor defendió que no se podía construir una república dejando fuera a la mitad del país.',
        'Las españolas votaron por primera vez en unas elecciones generales en 1933.',
      ],
      fuente: { nombre: 'Clara Campoamor (Wikipedia)', url: wiki('Clara_Campoamor') },
    },
  },
  // Día 26 · domingo 8-N
  {
    tipo: 'frase', titulo: 'Palabras que hicieron historia',
    datos: { texto: 'La educación no [cambia] el mundo: cambia a las [personas] que van a cambiar el [mundo].', distractores: ['leyes', 'escuela', 'paga', 'aprueba'], autor: 'Atribuida a Paulo Freire, pedagogo brasileño' },
    detras: {
      tema: 'atril', ilus: { texto: 'PAULO FREIRE', sub: '1921-1997' },
      titulo: 'Aprender a leer el mundo',
      texto: [
        'Paulo Freire fue un pedagogo brasileño que enseñó a leer y escribir a personas adultas partiendo de las palabras de su propia vida. Su libro más conocido es «Pedagogía del oprimido».',
        'Para Freire, educar no era llenar cabezas: era aprender a leer el mundo para poder cambiarlo.',
      ],
      fuente: { nombre: 'Paulo Freire (Wikipedia)', url: wiki('Paulo_Freire') },
    },
  },
  // Día 27 · lunes 9-N
  {
    tipo: 'cuantos',
    datos: { pregunta: 'La huelga pide al menos una orientadora u orientador por cada… ¿cuántos estudiantes?', cifra: 250, unidad: 'estudiantes', maximo: 2000 },
    detras: {
      tema: 'cifra', ilus: { texto: '1 / 250', sub: 'una persona de orientación por cada 250 estudiantes' },
      titulo: 'Alguien que acompañe',
      texto: [
        'La orientación ayuda a detectar dificultades, acompaña al alumnado en sus decisiones y apoya a las familias y al profesorado.',
        'Además de una persona de orientación por cada 250 estudiantes, la huelga pide recuperar las aulas de enlace y reforzar los apoyos en los centros con alumnado vulnerable.',
      ],
      fuente: { nombre: 'Por qué hacemos huelga: equidad', url: `${WEB}#segregacion` },
    },
  },
  // Día 28 · martes 10-N
  {
    tipo: 'conexiones',
    datos: { grupos: [
      { nombre: 'Lugares del cole', fichas: ['RECREO', 'COMEDOR', 'BIBLIOTECA', 'GIMNASIO'] },
      { nombre: 'Lo que se pide para los edificios', fichas: ['CLIMATIZACIÓN', 'SIN AMIANTO', 'ACCESIBILIDAD', 'MANTENIMIENTO'] },
      { nombre: 'Huelgas que ganaron', fichas: ['CANADIENSE', 'DAGENHAM', 'LAWRENCE', 'MONTGOMERY'] },
      { nombre: 'Colores de las mareas', fichas: ['VERDE', 'BLANCA', 'NARANJA', 'VIOLETA'] },
    ] },
    detras: {
      tema: 'multitud', ilus: { texto: 'MAREA VERDE' },
      titulo: 'Por qué las mareas tienen colores',
      texto: [
        'En 2011, contra los recortes, el profesorado madrileño empezó a salir a la calle con camisetas verdes y el lema «Escuela pública de tod@s para tod@s». Así nació la Marea Verde.',
        'Luego llegaron otras: la blanca de la sanidad, la naranja de los servicios sociales, la violeta del feminismo… Un color basta para reconocerse en la calle.',
      ],
      fuente: { nombre: 'Mareas ciudadanas (Wikipedia)', url: wiki('Mareas_ciudadanas') },
    },
  },
  // Día 29 · miércoles 11-N
  {
    tipo: 'emojis', titulo: '¿Qué libro es?',
    datos: {
      pistas: [
        { emojis: '📚👧🧠✨', alt: 'libros, niña, cerebro, brillo' },
        { texto: 'Novela de Roald Dahl (1988), llevada al cine en 1996.' },
        { texto: 'Una niña que lee sin parar y una maestra que cree en ella.' },
        { texto: 'La terrible directora se llama Trunchbull.' },
      ],
      opciones: ['Matilda', 'Charlie y la fábrica de chocolate', 'Las brujas', 'Mary Poppins', 'Coraline', 'James y el melocotón gigante'],
      respuesta: 'Matilda',
    },
    detras: {
      tema: 'libro', ilus: { texto: 'SEÑORITA HONEY' },
      titulo: 'Una maestra que se da cuenta',
      texto: [
        'En «Matilda», la señorita Honey es la primera adulta que se da cuenta de lo que vale Matilda. Lo consigue porque la mira de verdad.',
        'Mirar de verdad a cada alumna y alumno es más fácil con grupos pequeños. Por eso la huelga pide 15 por aula en Primaria.',
      ],
      fuente: { nombre: 'Matilda (Wikipedia)', url: wiki('Matilda_(novela)') },
    },
  },
  // Día 30 · jueves 12-N
  {
    tipo: 'palabra', datos: { palabra: 'MAREA' },
    detras: {
      tema: 'multitud', ilus: { texto: 'NINGUNA SE GANÓ SOLA' },
      titulo: '¿Por qué una huelga indefinida?',
      texto: [
        'Una huelga indefinida no tiene fecha de fin: sigue hasta que hay una negociación con resultados. Por eso pesa tanto la caja de resistencia: cada día cuesta un día de sueldo.',
        'El boicot de Montgomery duró 381 días; la huelga de La Canadiense, 44. Ninguna se ganó sola.',
      ],
      fuente: { nombre: 'Caja de resistencia del CEIP Perú', url: '../caja-resistencia.html' },
    },
  },
];
