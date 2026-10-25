// Todas las cifras y textos del juego, con su fuente, en un solo sitio.
// Las cifras de lo que se pide salen de huelga.html (tabla reivindicativa de la huelga del 14-O-2026).
// Las cifras de la situación actual vienen de prensa y están marcadas con `pendienteConfirmar`.

export const FUENTES = {
  web: { nombre: 'huelga.html (tabla reivindicativa)', url: '../huelga.html' },
  tabla: { nombre: 'Tabla reivindicativa (PDF)', url: 'https://cgtmadrid-ensenanza.org/wp-content/uploads/2026/08/TABLA-REIVINDICATIVA-HUELGA-INDEFINIDA-14-OCTUBRE-2026.pdf' },
  prensaHoras: { nombre: 'Infobae/EFE, 22-10-2026', url: 'https://www.infobae.com/espana/agencias/2026/10/22/miles-de-docentes-se-manifiestan-en-madrid-en-la-septima-jornada-de-huelga-indefinida/' },
  prensaInasumible: { nombre: 'Madridiario', url: 'https://www.madridiario.es/zarzalejo-considera-inasumibles-demandas-sindicatos-educativos' },
  prensaSeguimiento: { nombre: 'Prensa, octubre 2026', url: 'https://www.eldiariodemadrid.es/articulo/comunidad-de-madrid/huelga-educacion-publica-madrid-protestas-octubre-2026/20261024093920145191.html' },
};

// Situación actual (prensa). Revisar antes de publicar.
export const ACTUAL = {
  periodosPrimaria: { valor: 25, fuente: 'prensaHoras', pendienteConfirmar: true },
  periodosSecundaria: { valor: 19, fuente: 'prensaHoras', pendienteConfirmar: true },
  // La Comunidad dio un 7,9 % de seguimiento en la octava jornada; los sindicatos, en torno al 50 %.
  factorComunidad: { valor: 0.079, fuente: 'prensaSeguimiento', pendienteConfirmar: true },
};

// Las seis reivindicaciones. `pancarta`: lema pintado a mano. `grupo`: quién la lleva en la mani.
export const REIVINDICACIONES = {
  ratios: {
    ysi: '¿Y si fuerais 15 en clase?',
    titulo: 'Ratios', icono: 'ratio', color: '#ffcf33',
    pancarta: ['¡15 POR', 'AULA!'],
    grupo: 'familias',
    dato: 'Se piden como máximo 13 alumnos por aula en Infantil, 15 en Primaria, 20 en Secundaria, 23 en Bachillerato y 15 en FP. El alumnado con necesidades específicas contaría doble.',
    efecto: 'Quince pupitres con sitio entre ellos.',
    sala: '¡Con quince he podido escuchar a cada uno! Hasta a la que nunca levanta la mano.',
  },
  horas: {
    ysi: '¿Y si tuvieras tiempo para preparar la clase?',
    titulo: 'Horas lectivas', icono: 'reloj', color: '#86cd55',
    pancarta: ['TIEMPO PARA', 'ENSEÑAR'],
    grupo: 'despertadores',
    dato: 'Se piden 22 periodos lectivos a la semana en Primaria y 17 en Secundaria y FP, como máximo, con la tutoría y la coordinación dentro.',
    efecto: 'Huecos en el horario para preparar la clase.',
    sala: 'He tenido una hora para preparar la clase. Una hora entera. Casi lloro.',
  },
  burocracia: {
    ysi: '¿Y si alguien se ocupara del papeleo?',
    titulo: 'Burocracia', icono: 'papeles', color: '#f3efe6',
    pancarta: ['MENOS PAPELEO,', 'MÁS ESCUELA'],
    grupo: 'papeles',
    dato: 'Se pide al menos un administrativo a jornada completa en cada centro, para que el papeleo deje de recaer en el profesorado.',
    efecto: 'Alguien de administración se lleva los papeles.',
    sala: 'Hoy no he rellenado ni un formulario. Ni uno. Me siento rara.',
  },
  apoyos: {
    ysi: '¿Y si hubiera apoyos en el aula?',
    titulo: 'Apoyos y equidad', icono: 'manos', color: '#7fb7e8',
    pancarta: ['APOYOS PARA', 'TOD@S'],
    grupo: 'apoyos',
    dato: 'Se piden aulas de enlace, más profesorado en los centros con alumnado vulnerable, accesibilidad universal y un orientador u orientadora por cada 250 estudiantes.',
    efecto: 'Una profe de apoyo en el aula.',
    sala: 'Ha venido la profe de apoyo. Y Amina, que llegó en septiembre, ha leído su primera frase en voz alta.',
  },
  infra: {
    ysi: '¿Y si el aula no fuera un horno?',
    titulo: 'Infraestructuras', icono: 'termometro', color: '#e0566c',
    pancarta: ['NI CALOR', 'NI AMIANTO'],
    grupo: 'abanicos',
    dato: 'Se pide un plan integral de climatización, mantener los centros antiguos retirando el amianto y acabar con la construcción por fases como modelo habitual.',
    efecto: 'Un aula fresca y sin uralita.',
    sala: 'Han quitado la uralita del barracón. Y hoy no se ha dormido nadie de calor.',
  },
  sueldo: {
    ysi: '¿Y si los equipos se quedaran?',
    titulo: 'Sueldo', icono: 'euro', color: '#c9a7ef',
    pancarta: ['+600 €', 'Y QUE NOS QUEDEMOS'],
    grupo: 'maletas',
    dato: 'Se piden 600 € más al mes en el complemento específico docente, que es autonómico. Unas condiciones dignas ayudan a que los equipos se queden.',
    efecto: 'Los equipos se quedan: nadie reparte a tu alumnado por falta de sustituto.',
    sala: 'Laura se queda el curso que viene. Dice que, así, sí.',
  },
};
export const IDS = Object.keys(REIVINDICACIONES);

// Sala de profes. Cada interludio: frases en orden (quién habla: 0, 1, 2 son compis; 'p' es tu profe).
export function guionSala(n, estado) {
  const e = estado;
  const periodos = ACTUAL.periodosPrimaria.valor;
  if (n === 1) {
    return [
      [0, '¿Qué tal la clase? ¿Has llegado a todos?'],
      ['p', e.aulas[0] ? `A ${e.aulas[0].llegados} de ${e.aulas[0].total}. Y al café, frío.` : 'Al café. Frío.'],
      [1, `Es que en Primaria damos hasta ${periodos} periodos de clase a la semana. No da tiempo a preparar nada.`],
      [2, '¿Y Laura? No la he visto.'],
      [0, 'Se fue en septiembre. Ya van tres este curso.'],
      [1, 'Mañana es 14 de octubre. Empieza la huelga indefinida. ¿Vienes a la mani?'],
      ['p', 'Tengo la camiseta verde planchada desde septiembre.'],
    ];
  }
  const elegidas = e.elegidas.slice(0, 2);
  const lineas = [[0, '¿Qué tal hoy?']];
  elegidas.forEach((id, i) => lineas.push([i === 0 ? 'p' : 1, REIVINDICACIONES[id].sala]));
  if (!elegidas.includes('sueldo')) lineas.push([2, 'Pues a mí me han vuelto a repartir tres niños de la clase de al lado. Sigue sin sustituto.']);
  lineas.push([1, 'La consejera dice que lo que pedimos es «inasumible».']);
  lineas.push([2, 'Inasumible es esta fotocopiadora.']);
  lineas.push([0, 'Esto solo ha sido un «¿y si…?». Para que pase de verdad hay que volver a la calle.']);
  return lineas;
}

// Toques escondidos en la sala de profes.
export const HUEVOS = {
  tupper: ['Lentejas. Desde 2019.', 'Nadie se atreve a abrirlo.', 'Ha desarrollado conciencia de clase.'],
  fotocopiadora: ['ATASCO EN BANDEJA 2', 'Como cada día desde que la instalaron.'],
  calendario: ['Miércoles 14 de octubre de 2026: empieza la huelga indefinida.'],
  cartel: ['ZARZALEJO, REÚNETE YA'],
  micro: ['Cola del micro: cuatro tuppers y dos minutos de recreo.'],
  raices: ['Raíces: cargando…', 'Raíces: cargando… (sigue)'],
  planta: ['Nadie tiene una hora libre para regarla.'],
};

// Personajes de la sala (aspecto fijo).
export const COMPIS = [
  { edad: 'adulto', piel: '#f6d5bd', peinado: 'corto', pelo: '#8e8e8e', ropa: '#3d5a80', pantalon: '#3b3b3b', gafas: true, barba: true, semilla: 0.9 },
  { edad: 'adulto', piel: '#b47a55', peinado: 'coletas', pelo: '#2a1c14', ropa: '#e45c7a', pantalon: '#284a6e', semilla: 1.7 },
  { edad: 'adulto', piel: '#eab996', peinado: 'flequillo', pelo: '#d9b36c', ropa: '#8bbf63', pantalon: '#4a4a52', semilla: 2.5 },
];

// Títulos para la tarjeta final, según cómo hayas jugado.
export function tituloTarjeta(e) {
  if (e.huevos?.tupper >= 3) return 'Arqueología del tupper';
  if ((e.ritmo?.aciertos || 0) >= 0.8 * (e.ritmo?.total || 99)) return 'Megáfono de oro';
  if (e.especiales?.includes('batucada') && e.especiales?.includes('coro')) return 'Alma de la batucada';
  if ((e.mani?.max || 0) > 3000) return 'Marea imparable';
  const ultima = e.aulas?.[2];
  if (ultima && ultima.llegados === ultima.total) return 'Llega a todo el mundo';
  return 'Docente en lucha';
}

export const ENLACES = [
  { id: 'tienda', texto: 'Vístete de huelga', sub: 'Camisetas, sudaderas, chapas y rifa. Todo va a la caja.', url: '../pedidos.html', icono: 'camiseta' },
  { id: 'caja', texto: 'Caja de resistencia', sub: 'Cada día de huelga es un día sin sueldo. Repártelo.', url: '../caja-resistencia.html', icono: 'hucha' },
  { id: 'calle', texto: 'Ven a la próxima', sub: 'Concentraciones y manifestaciones.', url: '../actualidad.html', icono: 'megafono' },
  { id: 'queja', texto: 'Pon una queja', sub: 'Cinco minutos para pedir a la Consejería que negocie.', url: '../ayudar.html#queja', icono: 'carta' },
];

export const URL_JUEGO = 'https://asambleaceipperu.github.io/juego/';
