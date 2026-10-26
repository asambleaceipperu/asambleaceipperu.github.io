// Cronología: ordenar cinco momentos del más antiguo al más reciente. Tres intentos.
// Se ordena arrastrando o con las flechas de cada fila.
import { h, barajar } from '../dom.js';

export function montar(raiz, datos, { semilla, progreso, alProgreso, alTerminar }) {
  const momentos = datos.momentos; // [{ texto, anio, explica }] en orden correcto; la explicación sale al terminar.
  let orden = progreso?.orden || barajar(momentos.map((_, i) => i), semilla);
  if (orden.every((v, i) => v === i)) orden = [...orden.slice(1), orden[0]];
  const historial = progreso?.historial ? [...progreso.historial] : [];
  const MAX = 3;
  let fin = false;

  const lista = h('ol.lista-orden', { 'aria-label': 'Momentos para ordenar' });
  const puntos = h('span.puntos');
  const intentosEl = h('p.intentos', {}, 'Intentos', puntos);
  const boton = h('button.boton', { type: 'button', onclick: comprobar }, 'Comprobar');
  raiz.append(h('p.enunciado', {}, datos.enunciado || 'Ordena del más antiguo (arriba) al más reciente (abajo). Arrastra o usa las flechas.'), lista, intentosEl, h('div.botones', {}, boton));

  let marcas = null; // resultado del último intento
  function pinta() {
    lista.replaceChildren(...orden.map((mi, pos) => {
      const m = momentos[mi];
      const li = h(`li.momento${marcas ? (marcas[pos] ? '.bien' : '.mal') : ''}`, { 'data-pos': pos },
        fin ? h('span.anio', {}, m.anio) : h('span.asa', { 'aria-hidden': 'true' }, '⋮⋮'),
        h('span', {}, m.texto, fin && m.explica ? h('span.explica', {}, m.explica) : null),
        fin ? null : h('span.flechas', {},
          h('button', { type: 'button', 'aria-label': 'Subir', disabled: pos === 0, onclick: () => mover(pos, pos - 1) }, '↑'),
          h('button', { type: 'button', 'aria-label': 'Bajar', disabled: pos === orden.length - 1, onclick: () => mover(pos, pos + 1) }, '↓')));
      if (!fin) li.addEventListener('pointerdown', e => arrastrar(e, li, pos));
      return li;
    }));
    puntos.replaceChildren(...Array.from({ length: MAX }, (_, i) => h(`i${i < historial.length ? '.gastado' : ''}`)));
  }
  function mover(a, b) { if (b < 0 || b >= orden.length) return; const [x] = orden.splice(a, 1); orden.splice(b, 0, x); marcas = null; alProgreso({ orden, historial }); pinta(); }
  function arrastrar(e, li, pos) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    const y0 = e.clientY, alto = li.getBoundingClientRect().height + 8;
    li.classList.add('arrastrando'); li.setPointerCapture(e.pointerId);
    let destino = pos;
    const mueve = ev => { const dy = ev.clientY - y0; li.style.transform = `translateY(${dy}px)`; destino = Math.max(0, Math.min(orden.length - 1, pos + Math.round(dy / alto))); };
    const suelta = () => { li.removeEventListener('pointermove', mueve); li.style.transform = ''; li.classList.remove('arrastrando'); if (destino !== pos) mover(pos, destino); };
    li.addEventListener('pointermove', mueve);
    li.addEventListener('pointerup', suelta, { once: true });
    li.addEventListener('pointercancel', suelta, { once: true });
  }
  function comprobar() {
    marcas = orden.map((mi, pos) => mi === pos);
    historial.push(marcas);
    alProgreso({ orden, historial });
    const gana = marcas.every(Boolean);
    if (gana || historial.length >= MAX) { terminar(gana); return; }
    pinta();
  }
  function terminar(gana) {
    fin = true;
    if (!gana) { orden = momentos.map((_, i) => i); marcas = orden.map(() => true); }
    lista.classList.add('terminada'); pinta(); boton.hidden = true; intentosEl.hidden = true;
    const emoji = historial.map(m => m.map(b => (b ? '🟩' : '🟥')).join('')).join('\n');
    alTerminar({ resuelto: gana, emoji, marcador: gana ? `${historial.length}/${MAX}` : 'X/3', solucion: momentos.map(m => m.anio).join(' → ') });
  }
  pinta();
  const ultimo = historial[historial.length - 1];
  if (ultimo && (ultimo.every(Boolean) || historial.length >= MAX)) terminar(ultimo.every(Boolean));
}
