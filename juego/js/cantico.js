// La melodía del cántico, en un formato fácil de editar.
//
// ⚠️ MARCADOR PROVISIONAL. Cuando grabéis la melodía de verdad, hay dos maneras de meterla:
//   1. Grabación: guardad el audio en juego/audio/ (por ejemplo cantico.mp3) y poned su nombre
//      en `archivo` aquí abajo. El juego la usará en la mani y en el final en lugar del chiptune.
//      Grabadla a BPM (pulsos por minuto) constantes y ajustad `bpm` y `inicio` aquí abajo
//      para que los toques del momento rítmico caigan en las sílabas fuertes.
//   2. Notas: cambiad las notas de abajo (nombre de nota + octava: 'C4' = do central).
//
// Cada sílaba es [texto, nota, duración en corcheas, fuerte]. `fuerte: true` marca las sílabas
// que hay que tocar en el momento rítmico ante la Consejería. Una sílaba `null` es un silencio.
// Cada frase dura 16 corcheas (dos compases de 4/4).

export const CANTICO = {
  bpm: 112,
  // Archivo de la grabación dentro de juego/audio/ (vacío = se usa la versión chiptune).
  archivo: '',
  // Segundos desde el principio de la grabación hasta la primera sílaba (solo si usáis grabación).
  inicio: 0,
  frases: {
    educacion: [
      ['e', 'G4', 1], ['du', 'G4', 1], ['ca', 'A4', 1], ['CIÓN', 'B4', 2, true], [null, null, 1],
      ['PÚ', 'D5', 1, true], ['bli', 'B4', 1], ['ca', 'G4', 1], [null, null, 1],
      ['y', 'A4', 1], ['de', 'A4', 1], ['ca', 'B4', 1], ['li', 'C5', 1], ['DAD', 'B4', 2, true],
    ],
    zarzalejo: [
      ['zar', 'E4', 1], ['za', 'G4', 1], ['le', 'G4', 1], ['JO', 'A4', 2, true], [null, null, 1],
      ['re', 'B4', 1], ['Ú', 'D5', 1, true],
      ['ne', 'B4', 1], ['te', 'A4', 1], ['YA', 'G4', 3, true], [null, null, 3],
    ],
  },
  // Orden en el que suenan las frases en la mani y ante la Consejería.
  orden: ['educacion', 'educacion', 'zarzalejo', 'zarzalejo'],
  // Acordes de acompañamiento (uno por compás) para la versión chiptune.
  acordes: [['G2', 'D3'], ['E2', 'B2'], ['C3', 'G3'], ['D3', 'A3']],
};

// Convierte una frase en una lista de eventos { corchea, nota, dur, texto, fuerte }.
export function eventosFrase(nombre, desde = 0) {
  const out = [];
  let c = desde;
  for (const [texto, nota, dur, fuerte] of CANTICO.frases[nombre]) {
    if (texto) out.push({ corchea: c, nota, dur, texto, fuerte: !!fuerte });
    c += dur;
  }
  return out;
}
