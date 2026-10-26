// ¿Cuántos?: adivinar una cifra. Tras cada intento se dice si es más o menos y entre qué cifras está. Seis intentos.
import { h } from '../dom.js';

export function montar(raiz, datos, { progreso, alProgreso, alTerminar }) {
  const objetivo = datos.cifra;
  const MAX = 6;
  const intentos = progreso?.intentos ? [...progreso.intentos] : [];
  let entrada = '';
  let fin = false;
  const maxDigitos = String(datos.maximo ?? objetivo * 10).length;

  const pregunta = h('p.cita', { style: { borderLeftColor: 'var(--amarillo)' } }, datos.pregunta);
  const pantalla = h('div.pantalla-num', { 'aria-live': 'polite' });
  const pista = h('p.pista-num', { 'aria-live': 'polite' });
  const historial = h('div.historial');
  const calor = h('div.calor', { 'aria-hidden': 'true' }, h('i'));
  const puntos = h('span.puntos');
  const teclas = h('div.teclado-num', {}, [...'123456789', '⌫', '0', '✓'].map(c => h(`button${c === '✓' ? '.' : ''}`, { type: 'button', 'aria-label': c === '⌫' ? 'Borrar' : c === '✓' ? 'Probar' : c, style: c === '✓' ? { background: 'var(--pizarra)', color: 'var(--papel)' } : null, onclick: () => pulsa(c) }, c === '✓' ? 'Probar' : c)));
  raiz.append(pregunta, h('p.enunciado', {}, 'Escribe una cifra y pulsa Probar. Te diremos si la respuesta es más o menos.'), pantalla, pista, calor, historial, h('p.intentos', {}, 'Intentos', puntos), teclas);

  function pinta() {
    pantalla.replaceChildren(entrada ? Number(entrada).toLocaleString('es-ES') : fin ? objetivo.toLocaleString('es-ES') : '—', datos.unidad ? h('small', {}, datos.unidad) : null);
    const f = n => n.toLocaleString('es-ES');
    historial.replaceChildren(...intentos.map(n => h(`span${n < objetivo ? '.arriba' : n > objetivo ? '.abajo' : ''}`, {}, f(n), n === objetivo ? ' ✓' : n < objetivo ? ' · es más' : ' · es menos')));
    // La pista en palabras: entre qué dos cifras está la respuesta.
    const bajos = intentos.filter(n => n < objetivo), altos = intentos.filter(n => n > objetivo);
    const desde = bajos.length ? Math.max(...bajos) : null, hasta = altos.length ? Math.min(...altos) : null;
    const ult = intentos[intentos.length - 1];
    pista.hidden = fin || ult == null;
    if (ult != null && !fin) pista.replaceChildren(
      h('b', {}, ult < objetivo ? `↑ Es MÁS de ${f(ult)}` : `↓ Es MENOS de ${f(ult)}`),
      desde != null && hasta != null ? h('span', {}, `Está entre ${f(desde)} y ${f(hasta)}`) : null);
    puntos.replaceChildren(...Array.from({ length: MAX }, (_, i) => h(`i${i < intentos.length ? '.gastado' : ''}`)));
    // Termómetro: lo cerca que estuvo el último intento.
    const k = ult == null ? 0 : 1 - Math.min(1, Math.abs(Math.log((ult || 1) / objetivo)) / 2.5);
    calor.firstChild.style.left = `calc(${k * 100}% - 2px)`;
  }
  function pulsa(c) {
    if (fin) return;
    if (c === '⌫') entrada = entrada.slice(0, -1);
    else if (c === '✓') return probar();
    else if (entrada.length < maxDigitos + 1) entrada = (entrada + c).replace(/^0+(?=\d)/, '');
    pinta();
  }
  function probar() {
    if (!entrada) return;
    const n = Number(entrada);
    intentos.push(n); entrada = '';
    alProgreso({ intentos });
    if (n === objetivo || intentos.length >= MAX) return terminar(n === objetivo);
    pantalla.classList.remove('sacudir'); void pantalla.offsetWidth; pantalla.classList.add('sacudir');
    pinta();
  }
  function terminar(gana) {
    fin = true; pinta();
    teclas.hidden = true;
    const emoji = intentos.map(n => (n === objetivo ? '🟩' : n < objetivo ? '⬆️' : '⬇️')).join(' ');
    alTerminar({ resuelto: gana, emoji, marcador: gana ? `${intentos.length}/${MAX}` : 'X/6', solucion: `${objetivo.toLocaleString('es-ES')}${datos.unidad ? ' ' + datos.unidad : ''}` });
  }
  pinta();
  if (intentos.length && (intentos.includes(objetivo) || intentos.length >= MAX)) terminar(intentos.includes(objetivo));
}
