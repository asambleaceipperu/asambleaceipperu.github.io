// La palabra: adivinar una palabra en seis intentos (verde: en su sitio; amarillo: está, pero en otro).
import { h, normaliza } from '../dom.js';

const FILAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', '↵ZXCVBNM⌫'];

export function evaluar(intento, objetivo) {
  const res = Array(objetivo.length).fill('fallo');
  const quedan = {};
  [...objetivo].forEach((c, i) => { if (intento[i] === c) res[i] = 'acierto'; else quedan[c] = (quedan[c] || 0) + 1; });
  [...intento].forEach((c, i) => { if (res[i] !== 'acierto' && quedan[c]) { res[i] = 'casi'; quedan[c]--; } });
  return res;
}

export function montar(raiz, datos, { progreso, alProgreso, alTerminar }) {
  const objetivo = normaliza(datos.palabra);
  const L = objetivo.length, MAX = 6;
  const intentos = progreso?.intentos ? [...progreso.intentos] : [];
  let actual = '';
  let fin = false;

  const filas = Array.from({ length: MAX }, () => h('div.fila', { style: { gridTemplateColumns: `repeat(${L}, auto)` } }, Array.from({ length: L }, () => h('div.casilla'))));
  const rejilla = h('div.rejilla', { role: 'grid', 'aria-label': `Palabra de ${L} letras` }, filas);
  const teclas = {};
  const teclado = h('div.teclado', {}, FILAS.map(f => h('div.teclado-fila', {}, [...f].map(c => {
    const esp = c === '↵' || c === '⌫';
    const b = h(`button.tecla${esp ? '.ancha' : ''}`, { type: 'button', 'aria-label': c === '↵' ? 'Enviar' : c === '⌫' ? 'Borrar' : c, onclick: () => pulsa(c) }, c === '↵' ? 'ENVIAR' : c);
    teclas[c] = b;
    return b;
  }))));
  const pista = datos.pista ? h('p.enunciado', {}, datos.pista) : null;
  raiz.append(...[h('p.enunciado', {}, `Una palabra de ${L} letras relacionada con la huelga o con la escuela. Tienes 6 intentos.`), pista, rejilla, teclado].filter(Boolean));

  const pintaFila = (i, palabra, res) => {
    [...filas[i].children].forEach((c, k) => {
      c.textContent = palabra[k] || '';
      c.className = 'casilla' + (palabra[k] ? ' llena' : '') + (res ? ' ' + res[k] : '');
      if (res) c.style.animationDelay = `${k * 0.12}s`;
    });
  };
  const pintaTeclas = () => {
    const mejor = {};
    const rango = { fallo: 0, casi: 1, acierto: 2 };
    for (const p of intentos) evaluar(p, objetivo).forEach((r, k) => { const c = p[k]; if (!(c in mejor) || rango[r] > rango[mejor[c]]) mejor[c] = r; });
    for (const [c, r] of Object.entries(mejor)) if (teclas[c]) teclas[c].className = `tecla ${r}`;
  };
  intentos.forEach((p, i) => pintaFila(i, p, evaluar(p, objetivo)));
  pintaTeclas();

  function pulsa(c) {
    if (fin) return;
    if (c === '⌫') actual = actual.slice(0, -1);
    else if (c === '↵') return enviar();
    else if (actual.length < L) actual += c;
    pintaFila(intentos.length, actual);
  }
  function enviar() {
    if (actual.length < L) { filas[intentos.length].classList.remove('sacudir'); void filas[intentos.length].offsetWidth; filas[intentos.length].classList.add('sacudir'); return; }
    intentos.push(actual);
    const res = evaluar(actual, objetivo);
    pintaFila(intentos.length - 1, actual, res);
    setTimeout(pintaTeclas, L * 120 + 300);
    alProgreso({ intentos });
    const gana = actual === objetivo;
    actual = '';
    if (gana || intentos.length >= MAX) terminar(gana);
  }
  function terminar(gana) {
    fin = true;
    teclado.hidden = true;
    const emoji = intentos.map(p => evaluar(p, objetivo).map(r => (r === 'acierto' ? '🟩' : r === 'casi' ? '🟨' : '⬜')).join('')).join('\n');
    setTimeout(() => alTerminar({ resuelto: gana, emoji, marcador: `${gana ? intentos.length : 'X'}/${MAX}`, solucion: datos.palabra }), L * 120 + 500);
  }
  const teclaFisica = e => {
    if (fin || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') pulsa('↵');
    else if (e.key === 'Backspace') pulsa('⌫');
    else if (/^[a-zñ]$/i.test(e.key)) pulsa(normaliza(e.key));
  };
  document.addEventListener('keydown', teclaFisica);
  if (intentos.length && (intentos.includes(objetivo) || intentos.length >= MAX)) terminar(intentos.includes(objetivo));
  return () => document.removeEventListener('keydown', teclaFisica);
}
