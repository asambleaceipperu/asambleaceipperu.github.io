// La frase: completar una cita eligiendo las palabras que faltan. Cuatro intentos y pistas como en Wordle:
// verde, en su sitio; amarillo, está en la frase pero en otro hueco; gris, sobra.
import { h, barajar } from '../dom.js';

const MAX = 4;

export function montar(raiz, datos, { semilla, progreso, alProgreso, alTerminar }) {
  // datos.texto con huecos marcados así: «Un niño, un [profesor], un [libro]…»
  const partes = datos.texto.split(/(\[[^\]]+\])/).filter(Boolean);
  const huecos = partes.filter(p => p.startsWith('[')).map(p => p.slice(1, -1));
  const fichas = barajar([...huecos, ...(datos.distractores || [])], semilla);
  // [{ puestas, marcas }]. Las partidas guardadas con la versión anterior traían solo aciertos (true/false).
  const historial = (progreso?.historial || []).map(r => (Array.isArray(r) ? { puestas: [], marcas: r.map(b => (b ? 'acierto' : 'fallo')) } : r));
  // Lo acertado se queda fijo entre intentos.
  const fijas = huecos.map((w, i) => historial.some(r => r.marcas[i] === 'acierto') ? w : null);
  let puestas = [...fijas];
  let fin = false;

  const cita = h('blockquote.cita');
  const caja = h('div.fichas-palabra');
  const puntos = h('span.puntos', { 'aria-label': 'intentos' });
  const intentosEl = h('p.intentos', {}, 'Intentos', puntos);
  const leyenda = h('p.leyenda', {}, h('i.acierto'), 'en su sitio ', h('i.casi'), 'va en otro hueco ', h('i.fallo'), 'no está');
  const boton = h('button.boton', { type: 'button', onclick: comprobar, disabled: true }, 'Comprobar');
  const borrar = h('button.boton.claro', { type: 'button', onclick: () => { puestas = [...fijas]; pinta(); } }, 'Borrar');
  raiz.append(h('p.enunciado', {}, datos.enunciado || 'Toca las palabras para rellenar los huecos, en orden. Tienes cuatro intentos y pistas de colores.'), cita, caja, leyenda, intentosEl, h('div.botones', {}, borrar, boton));

  // Cómo ha ido cada palabra del intento: acierto, casi o fallo (como en Wordle, sin contar dos veces).
  function evalua(intento) {
    const res = intento.map((w, i) => (w === huecos[i] ? 'acierto' : 'fallo'));
    const quedan = {};
    huecos.forEach((w, i) => { if (res[i] !== 'acierto') quedan[w] = (quedan[w] || 0) + 1; });
    intento.forEach((w, i) => { if (res[i] !== 'acierto' && quedan[w]) { res[i] = 'casi'; quedan[w]--; } });
    return res;
  }
  // La mejor pista que ha tenido cada ficha, para colorear las de abajo.
  const RANGO = { fallo: 0, casi: 1, acierto: 2 };
  function pistaDe(f) {
    let r = null;
    for (const { puestas: p, marcas } of historial) p.forEach((w, i) => { if (w === f && (r === null || RANGO[marcas[i]] > RANGO[r])) r = marcas[i]; });
    return r;
  }

  function pinta() {
    let k = 0;
    const siguiente = puestas.findIndex(v => v === null);
    cita.replaceChildren(...partes.map(p => {
      if (!p.startsWith('[')) return document.createTextNode(p);
      const i = k++;
      const txt = fin ? huecos[i] : puestas[i] ?? ' ';
      const cls = fin ? '.acierto' : fijas[i] ? '.acierto' : i === siguiente ? '.activo' : '';
      return h(`button.hueco${cls}`, { type: 'button', disabled: fin || !!fijas[i], onclick: () => { puestas[i] = null; pinta(); } }, txt);
    }), datos.autor ? h('cite', {}, datos.autor) : null);
    const usadas = [...puestas];
    caja.replaceChildren(...fichas.map(f => {
      const j = usadas.indexOf(f);
      if (j >= 0) usadas[j] = undefined;
      const pista = pistaDe(f);
      return h(`button${pista ? '.' + pista : ''}`, { type: 'button', disabled: fin || j >= 0, onclick: () => { const s = puestas.findIndex(v => v === null); if (s >= 0) { puestas[s] = f; pinta(); } } }, f);
    }));
    puntos.replaceChildren(...Array.from({ length: MAX }, (_, i) => h(`i${i < historial.length ? '.gastado' : ''}`)));
    boton.disabled = fin || puestas.some(v => v === null);
  }
  function comprobar() {
    const marcas = evalua(puestas);
    historial.push({ puestas: [...puestas], marcas });
    alProgreso({ historial });
    marcas.forEach((m, i) => { if (m === 'acierto') fijas[i] = huecos[i]; });
    const gana = marcas.every(m => m === 'acierto');
    if (gana || historial.length >= MAX) return terminar(gana);
    // Se enseña el intento coloreado un momento y se vacían los huecos que no estaban bien.
    let k = 0;
    cita.querySelectorAll('.hueco').forEach(b => { b.classList.add(marcas[k++]); b.classList.remove('activo'); });
    puntos.replaceChildren(...Array.from({ length: MAX }, (_, i) => h(`i${i < historial.length ? '.gastado' : ''}`)));
    boton.disabled = true;
    setTimeout(() => { puestas = [...fijas]; pinta(); }, 1100);
  }
  function terminar(gana) {
    fin = true; boton.hidden = true; borrar.hidden = true; leyenda.hidden = true; intentosEl.hidden = true; pinta();
    const color = { acierto: '🟩', casi: '🟨', fallo: '⬜' };
    alTerminar({ resuelto: gana, emoji: historial.map(r => r.marcas.map(m => color[m]).join('')).join('\n'), marcador: `${gana ? historial.length : 'X'}/${MAX}`, solucion: huecos.join(', ') });
  }
  pinta();
  const ult = historial[historial.length - 1];
  if (ult && (ult.marcas.every(m => m === 'acierto') || historial.length >= MAX)) terminar(ult.marcas.every(m => m === 'acierto'));
}
