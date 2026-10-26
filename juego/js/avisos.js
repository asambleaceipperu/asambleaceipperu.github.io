// «Hoy, en la huelga»: la línea que aparece al terminar cada reto.
// La asamblea puede añadir avisos por fecha (AAAA-MM-DD). Si un día no tiene aviso, sale uno de los fijos.
export const AVISOS = {
  '2026-10-22': { texto: 'Concentración ante la Asamblea de Madrid a las 10:00 y manifestación de Atocha a la Consejería a las 18:00.', enlace: '../actualidad.html', etiqueta: 'Ver la actualidad' },
  '2026-10-30': { texto: 'Hoy es el sorteo de la rifa solidaria de la caja de resistencia.', enlace: '../actualidad.html', etiqueta: 'Ver el resultado' },
};

const FIJOS = [
  { texto: 'Cada día de huelga es un día sin sueldo. La caja de resistencia reparte ese coste entre muchas manos.', enlace: '../caja-resistencia.html', etiqueta: 'Apoyar la caja' },
  { texto: 'Camisetas, sudaderas, tote bags y chapas: todo lo que recaudamos va a la caja.', enlace: '../pedidos.html', etiqueta: 'Hacer un pedido' },
  { texto: 'En cinco minutos puedes pedir a la Consejería que negocie con una queja formal.', enlace: '../ayudar.html#queja', etiqueta: 'Cómo poner la queja' },
  { texto: 'Concentraciones y manifestaciones, con fecha y lugar.', enlace: '../actualidad.html', etiqueta: 'Ver las convocatorias' },
  { texto: 'Seis reivindicaciones, explicadas con calma: qué pedimos y qué cambiaría en el aula.', enlace: '../huelga.html', etiqueta: 'Por qué hacemos huelga' },
];

export function avisoDelDia(fecha, n) {
  return AVISOS[fecha] || FIJOS[(n - 1) % FIJOS.length];
}
