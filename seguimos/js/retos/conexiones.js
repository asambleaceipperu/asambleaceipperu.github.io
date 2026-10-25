// Conexiones: 16 fichas que hay que repartir en 4 grupos de 4. Se pueden cometer 4 fallos.
import { h, barajar } from '../dom.js';

export function montar(raiz, datos, { semilla, progreso, alProgreso, alTerminar }) {
  const grupos = datos.grupos; // [{ nombre, fichas: [4], explica }]: la explicación sale al acertar el grupo.
  const todas = grupos.flatMap((g, gi) => g.fichas.map(f => ({ f, gi })));
  let orden = barajar(todas, semilla);
  const resueltos = progreso?.resueltos ? [...progreso.resueltos] : [];
  const historial = progreso?.historial ? [...progreso.historial] : [];
  let fallos = progreso?.fallos || 0;
  let sel = new Set();
  let fin = false;

  const tablero = h('div.tablero');
  const puntos = h('span.puntos', { 'aria-label': 'fallos restantes' });
  const intentosEl = h('p.intentos', {}, 'Fallos que te quedan', puntos);
  const enviar = h('button.boton', { type: 'button', onclick: comprobar, disabled: true }, 'Comprobar');
  const mezclar = h('button.boton.claro', { type: 'button', onclick: () => { orden = barajar(orden); pinta(); } }, 'Mezclar');
  const quitar = h('button.boton.claro', { type: 'button', onclick: () => { sel.clear(); pinta(); } }, 'Quitar');
  raiz.append(h('p.enunciado', {}, 'Encuentra cuatro grupos de cuatro. Toca cuatro fichas que tengan algo en común y comprueba.'), tablero, intentosEl, h('div.botones', {}, mezclar, quitar, enviar));

  function pinta() {
    tablero.replaceChildren();
    resueltos.forEach(gi => tablero.append(h(`div.grupo.g${gi + 1}`, {}, h('b', {}, grupos[gi].nombre), h('span', {}, grupos[gi].fichas.join(' · ')), grupos[gi].explica ? h('p.explica', {}, grupos[gi].explica) : null)));
    for (const o of orden) {
      if (resueltos.includes(o.gi)) continue;
      const tam = o.f.length > 12 ? '10.5px' : o.f.length > 9 ? '12px' : o.f.length > 6 ? '13.5px' : null;
      const b = h(`button.ficha${sel.has(o.f) ? '.sel' : ''}`, { type: 'button', style: tam ? { fontSize: tam } : null, 'aria-pressed': String(sel.has(o.f)), onclick: () => { if (fin) return; if (sel.has(o.f)) sel.delete(o.f); else if (sel.size < 4) sel.add(o.f); pinta(); } }, o.f);
      tablero.append(b);
    }
    puntos.replaceChildren(...Array.from({ length: 4 }, (_, i) => h(`i${i < fallos ? '.gastado' : ''}`)));
    enviar.disabled = sel.size !== 4 || fin;
  }
  function comprobar() {
    const elegidas = todas.filter(o => sel.has(o.f));
    const cuenta = {};
    elegidas.forEach(o => (cuenta[o.gi] = (cuenta[o.gi] || 0) + 1));
    historial.push(elegidas.map(o => o.gi));
    const [gi, n] = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0];
    if (n === 4) { resueltos.push(+gi); sel.clear(); }
    else {
      fallos++;
      tablero.classList.remove('sacudir'); void tablero.offsetWidth; tablero.classList.add('sacudir');
      if (n === 3) avisaCasi();
    }
    alProgreso({ resueltos, fallos, historial });
    pinta();
    if (resueltos.length === 4) terminar(true);
    else if (fallos >= 4) { // Se muestran los grupos que faltaban.
      grupos.forEach((_, i) => { if (!resueltos.includes(i)) resueltos.push(i); });
      pinta(); terminar(false);
    }
  }
  function avisaCasi() { const a = h('p.intentos', { style: { color: 'var(--margen)' } }, '¡Casi! Te sobra una.'); raiz.append(a); setTimeout(() => a.remove(), 1800); }
  function terminar(gana) {
    fin = true; pinta();
    intentosEl.hidden = true; mezclar.parentElement.hidden = true;
    const colores = ['🟨', '🟩', '🟦', '🟪'];
    const emoji = historial.map(g => g.map(i => colores[i]).join('')).join('\n');
    alTerminar({ resuelto: gana, emoji, marcador: gana ? `${fallos} ${fallos === 1 ? 'fallo' : 'fallos'}` : 'sin resolver', solucion: grupos.map(g => g.nombre).join(' · ') });
  }
  pinta();
  if (resueltos.length === 4) terminar(true);
  else if (fallos >= 4) terminar(false);
}
