// La frase: completar una cita o un artículo eligiendo las palabras que faltan. Dos oportunidades.
import { h, barajar } from '../dom.js';

export function montar(raiz, datos, { semilla, progreso, alProgreso, alTerminar }) {
  // datos.texto con huecos marcados así: «Un niño, un [profesor], un [libro]…»
  const partes = datos.texto.split(/(\[[^\]]+\])/).filter(Boolean);
  const huecos = partes.filter(p => p.startsWith('[')).map(p => p.slice(1, -1));
  const fichas = barajar([...huecos, ...(datos.distractores || [])], semilla);
  let puestas = huecos.map(() => null);
  let rondas = progreso?.rondas || 0;
  const historial = progreso?.historial ? [...progreso.historial] : [];
  let marcas = null, fin = false;

  const cita = h('blockquote.cita');
  const caja = h('div.fichas-palabra');
  const boton = h('button.boton', { type: 'button', onclick: comprobar, disabled: true }, 'Comprobar');
  const borrar = h('button.boton.claro', { type: 'button', onclick: () => { puestas = huecos.map(() => null); marcas = null; pinta(); } }, 'Borrar');
  raiz.append(h('p.enunciado', {}, datos.enunciado || 'Toca las palabras en orden para rellenar los huecos. Tienes dos oportunidades.'), cita, caja, h('div.botones', {}, borrar, boton));

  function pinta() {
    let k = 0;
    const siguiente = puestas.findIndex(v => v === null);
    cita.replaceChildren(...partes.map(p => {
      if (!p.startsWith('[')) return document.createTextNode(p);
      const i = k++;
      const txt = fin ? huecos[i] : puestas[i] ?? ' ';
      const cls = marcas ? (marcas[i] ? '.bien' : '.mal') : i === siguiente && !fin ? '.activo' : '';
      return h(`button.hueco${cls}`, { type: 'button', style: { background: 'none', border: 0, borderBottom: '3px solid', font: 'inherit' }, disabled: fin, onclick: () => { puestas[i] = null; marcas = null; pinta(); } }, txt);
    }), datos.autor ? h('cite', {}, datos.autor) : null);
    const usadas = [...puestas];
    caja.replaceChildren(...fichas.map(f => {
      const j = usadas.indexOf(f);
      if (j >= 0) usadas[j] = undefined;
      return h('button', { type: 'button', disabled: fin || j >= 0, onclick: () => { const s = puestas.findIndex(v => v === null); if (s >= 0) { puestas[s] = f; marcas = null; pinta(); } } }, f);
    }));
    boton.disabled = fin || puestas.some(v => v === null);
  }
  function comprobar() {
    marcas = puestas.map((v, i) => v === huecos[i]);
    rondas++; historial.push(marcas);
    alProgreso({ rondas, historial });
    const gana = marcas.every(Boolean);
    if (gana || rondas >= 2) return terminar(gana);
    puestas = puestas.map((v, i) => (marcas[i] ? v : null));
    marcas = null;
    pinta();
  }
  function terminar(gana) {
    fin = true; marcas = null; boton.hidden = true; borrar.hidden = true; pinta();
    alTerminar({ resuelto: gana, emoji: historial.map(m => m.map(b => (b ? '🟩' : '🟥')).join('')).join('\n'), marcador: gana ? `${historial.length}/2` : 'X/2', solucion: huecos.join(', ') });
  }
  pinta();
  const ult = historial[historial.length - 1];
  if (ult && (ult.every(Boolean) || historial.length >= 2)) terminar(ult.every(Boolean));
}
