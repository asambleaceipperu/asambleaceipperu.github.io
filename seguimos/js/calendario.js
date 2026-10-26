// Días de huelga: se cuentan todos los días naturales desde el 14 de octubre de 2026 (Día 1),
// según la fecha de Madrid, aunque el móvil esté en otra zona horaria.

export const INICIO = { y: 2026, m: 10, d: 14 };

// Fecha de hoy en Madrid como { y, m, d }.
export function hoyEnMadrid(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(ahora);
  const v = t => +partes.find(p => p.type === t).value;
  return { y: v('year'), m: v('month'), d: v('day') };
}

const aDias = ({ y, m, d }) => Math.round(Date.UTC(y, m - 1, d) / 86400000);

export function diaDeHuelga(fecha = hoyEnMadrid()) {
  return aDias(fecha) - aDias(INICIO) + 1;
}

export function fechaDelDia(n) {
  const t = new Date((aDias(INICIO) + n - 1) * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function fechaLarga({ y, m, d }) {
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DIAS[dow]}, ${d} de ${MESES[m - 1]}`;
}
export const claveFecha = ({ y, m, d }) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Milisegundos que faltan hasta la medianoche de Madrid.
export function msHastaManana(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(ahora);
  const v = t => +partes.find(p => p.type === t).value;
  return ((24 - v('hour') - 1) * 3600 + (59 - v('minute')) * 60 + (60 - v('second'))) * 1000;
}
