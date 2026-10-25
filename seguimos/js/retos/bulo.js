// ¿Bulo o dato?: cinco afirmaciones; marca cuáles son ciertas. Se corrige de una vez.
import { h } from '../dom.js';

export function montar(raiz, datos, { progreso, alProgreso, alTerminar }) {
  const af = datos.afirmaciones; // [{ texto, cierto, explica }]
  const eleccion = progreso?.eleccion ? [...progreso.eleccion] : af.map(() => null);
  let fin = false;
  const lista = h('ul.afirmaciones');
  const boton = h('button.boton', { type: 'button', onclick: comprobar, disabled: true }, 'Comprobar');
  raiz.append(h('p.enunciado', {}, datos.enunciado || 'Cinco frases. ¿Cuáles son dato y cuáles bulo?'), lista, h('div.botones', {}, boton));

  function pinta() {
    lista.replaceChildren(...af.map((a, i) => {
      const ok = fin ? eleccion[i] === a.cierto : null;
      return h(`li.afirmacion${fin ? (ok ? '.bien' : '.mal') : ''}`, {},
        h('p', {}, a.texto),
        h('div.eleccion', { role: 'group', 'aria-label': 'Tu respuesta' },
          h('button', { type: 'button', 'aria-pressed': String(eleccion[i] === true), disabled: fin, onclick: () => elige(i, true) }, 'Dato'),
          h('button', { type: 'button', 'aria-pressed': String(eleccion[i] === false), disabled: fin, onclick: () => elige(i, false) }, 'Bulo')),
        fin ? h('p.explica', {}, (a.cierto ? 'Dato. ' : 'Bulo. ') + a.explica) : null);
    }));
    boton.disabled = fin || eleccion.some(v => v === null);
  }
  function elige(i, v) { eleccion[i] = v; alProgreso({ eleccion }); pinta(); }
  function comprobar() { alProgreso({ eleccion, fin: true }); terminar(); }
  function terminar() {
    fin = true; boton.hidden = true; pinta();
    const aciertos = af.filter((a, i) => eleccion[i] === a.cierto).length;
    alTerminar({ resuelto: aciertos >= af.length - 1, emoji: af.map((a, i) => (eleccion[i] === a.cierto ? '🟩' : '🟥')).join(''), marcador: `${aciertos}/${af.length}`, solucion: '' });
  }
  pinta();
  if (progreso?.fin) terminar();
}
