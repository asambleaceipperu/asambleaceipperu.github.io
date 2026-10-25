// Emojis: adivinar una película, canción o huelga. Cada fallo destapa una pista más (cuatro como mucho).
import { h, barajar } from '../dom.js';

export function montar(raiz, datos, { semilla, progreso, alProgreso, alTerminar }) {
  const pistas = datos.pistas; // [{ emojis } | { texto }] (la primera, emojis)
  const opciones = barajar(datos.opciones, semilla); // incluye la respuesta
  const falladas = progreso?.falladas ? [...progreso.falladas] : [];
  let fin = false;

  const cajaPistas = h('div.pistas');
  const cajaOpciones = h('div.opciones');
  const puntos = h('span.puntos');
  raiz.append(h('p.enunciado', {}, datos.enunciado || '¿Qué es? Cada fallo destapa una pista nueva.'), cajaPistas, cajaOpciones, h('p.intentos', {}, 'Pistas', puntos));

  function pinta() {
    const visibles = Math.min(pistas.length, falladas.length + 1);
    cajaPistas.replaceChildren(...pistas.slice(0, fin ? pistas.length : visibles).map(p => p.emojis ? h('div.pista.emojis', { role: 'img', 'aria-label': p.alt || 'pista con emojis' }, p.emojis) : h('div.pista.texto', {}, p.texto)));
    cajaOpciones.replaceChildren(...opciones.map(o => {
      const mal = falladas.includes(o), bien = fin && o === datos.respuesta;
      return h(`button.opcion${mal ? '.mal' : ''}${bien ? '.bien' : ''}`, { type: 'button', disabled: mal || fin, onclick: () => elegir(o) }, o);
    }));
    puntos.replaceChildren(...pistas.map((_, i) => h(`i${i < visibles ? '' : '.gastado'}`)));
  }
  function elegir(o) {
    if (fin) return;
    if (o === datos.respuesta) return terminar(true);
    falladas.push(o);
    alProgreso({ falladas });
    if (falladas.length >= pistas.length) return terminar(false);
    pinta();
  }
  function terminar(gana) {
    fin = true; pinta();
    alProgreso({ falladas, fin: true, gana });
    const usadas = falladas.length + (gana ? 1 : 0);
    const emoji = (pistas[0].emojis || '') + '\n' + pistas.map((_, i) => (i < falladas.length ? '🟥' : i === falladas.length && gana ? '🟩' : '⬜')).join('');
    alTerminar({ resuelto: gana, emoji, marcador: gana ? `a la ${usadas}.ª pista` : 'sin acertar', solucion: datos.respuesta });
  }
  pinta();
  if (progreso?.fin) terminar(progreso.gana);
}
