// Cartelera: cuatro películas (o canciones) contadas con emojis y seis títulos, dos de ellos de sobra.
// Hay que emparejarlas. Tres intentos: lo acertado se queda fijo y lo demás vuelve a la mesa.
import { h, barajar } from '../dom.js';

const MAX = 3;

export function montar(raiz, datos, { semilla, progreso, alProgreso, alTerminar }) {
  const items = datos.items; // [{ emojis, alt, titulo, detalle?, explica }]
  const titulos = barajar([...items.map(it => it.titulo), ...(datos.distractores || [])], semilla);
  const historial = progreso?.historial ? [...progreso.historial] : []; // [{ puestas, marcas: [bool] }]
  const fijas = items.map((it, i) => (historial.some(r => r.marcas[i]) ? it.titulo : null));
  let puestas = [...fijas];
  let activa = puestas.findIndex(v => v === null);
  let fin = false;

  const tablero = h('div.cartelera');
  const caja = h('div.fichas-palabra');
  const puntos = h('span.puntos', { 'aria-label': 'intentos' });
  const intentosEl = h('p.intentos', {}, 'Intentos', puntos);
  const boton = h('button.boton', { type: 'button', onclick: comprobar, disabled: true }, 'Comprobar');
  const borrar = h('button.boton.claro', { type: 'button', onclick: () => { puestas = [...fijas]; activa = puestas.findIndex(v => v === null); pinta(); } }, 'Borrar');
  raiz.append(h('p.enunciado', {}, datos.enunciado || 'Cuatro películas contadas con emojis. Toca un cartel y luego su título. Sobran dos títulos.'), tablero, caja, intentosEl, h('div.botones', {}, borrar, boton));

  function pinta() {
    const ultima = historial[historial.length - 1];
    tablero.classList.toggle('terminada', fin);
    tablero.replaceChildren(...items.map((it, i) => {
      const estado = fin ? (puestas[i] === it.titulo || fijas[i] ? '.bien' : '.mal') : fijas[i] ? '.bien' : i === activa ? '.activa' : '';
      return h(`button.cartel${estado}`, {
        type: 'button', disabled: fin || !!fijas[i], 'aria-label': `Película ${i + 1}: ${it.alt || it.emojis}`,
        onclick: () => { if (puestas[i] && !fijas[i]) puestas[i] = null; activa = i; pinta(); },
      },
      h('span.cartel-emojis', { 'aria-hidden': 'true' }, it.emojis),
      h('span.cartel-titulo', {}, fin ? it.titulo : puestas[i] || (ultima && !ultima.marcas[i] ? 'Prueba otro' : '¿Cuál es?')),
      fin && it.detalle ? h('span.cartel-detalle', {}, it.detalle) : null,
      fin && it.explica ? h('span.explica', {}, it.explica) : null);
    }));
    const usadas = new Set(puestas);
    const descartadas = new Set(historial.flatMap(r => r.puestas.filter((t, i) => !r.marcas[i])));
    caja.hidden = fin;
    caja.replaceChildren(...titulos.map(t => h(`button${descartadas.has(t) && !usadas.has(t) ? '.fallo' : ''}`, {
      type: 'button', disabled: fin || usadas.has(t),
      onclick: () => {
        const destino = activa >= 0 && !puestas[activa] ? activa : puestas.findIndex(v => v === null);
        if (destino < 0) return;
        puestas[destino] = t;
        activa = puestas.findIndex(v => v === null);
        pinta();
      },
    }, t)));
    puntos.replaceChildren(...Array.from({ length: MAX }, (_, i) => h(`i${i < historial.length ? '.gastado' : ''}`)));
    boton.disabled = fin || puestas.some(v => v === null);
  }
  function comprobar() {
    const marcas = items.map((it, i) => puestas[i] === it.titulo);
    historial.push({ puestas: [...puestas], marcas });
    alProgreso({ historial });
    marcas.forEach((m, i) => { if (m) fijas[i] = items[i].titulo; });
    const gana = marcas.every(Boolean);
    if (gana || historial.length >= MAX) return terminar(gana);
    // Un momento en rojo lo que no era, y vuelve a la mesa.
    tablero.querySelectorAll('.cartel').forEach((c, i) => c.classList.add(marcas[i] ? 'bien' : 'mal'));
    puntos.replaceChildren(...Array.from({ length: MAX }, (_, i) => h(`i${i < historial.length ? '.gastado' : ''}`)));
    boton.disabled = true;
    setTimeout(() => { puestas = [...fijas]; activa = puestas.findIndex(v => v === null); pinta(); }, 1100);
  }
  function terminar(gana) {
    fin = true; boton.hidden = true; borrar.hidden = true; intentosEl.hidden = true; pinta();
    alTerminar({
      resuelto: gana,
      emoji: historial.map(r => r.marcas.map(b => (b ? '🟩' : '🟥')).join('')).join('\n'),
      marcador: `${gana ? historial.length : 'X'}/${MAX}`,
      solucion: items.map(it => it.titulo).join(' · '),
    });
  }
  pinta();
  const ult = historial[historial.length - 1];
  if (ult && (ult.marcas.every(Boolean) || historial.length >= MAX)) terminar(ult.marcas.every(Boolean));
}
