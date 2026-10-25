// Entrada de un solo dedo: posición, arrastre, toque y pulsación mantenida, en coordenadas lógicas.

export function crearEntrada(lienzo, aLogico) {
  const e = {
    abajo: false, x: 200, y: 400, x0: 0, y0: 0, t0: 0, movido: 0,
    toques: [], // toques completos pendientes de leer en este fotograma
    pulsaciones: [], // inicios de pulsación (para ritmo: se registran al bajar el dedo)
    activo: false,
  };
  let id = null;
  const pos = ev => aLogico(ev.clientX, ev.clientY);
  lienzo.addEventListener('pointerdown', ev => {
    if (id !== null) return;
    id = ev.pointerId;
    try { lienzo.setPointerCapture(id); } catch { /* sin captura */ }
    const [x, y] = pos(ev);
    Object.assign(e, { abajo: true, x, y, x0: x, y0: y, t0: performance.now(), movido: 0, activo: true });
    e.pulsaciones.push({ x, y, t: performance.now() });
    ev.preventDefault();
  });
  lienzo.addEventListener('pointermove', ev => {
    if (ev.pointerId !== id && id !== null) return;
    const [x, y] = pos(ev);
    if (e.abajo) e.movido = Math.max(e.movido, Math.hypot(x - e.x0, y - e.y0));
    e.x = x; e.y = y;
  });
  const fin = ev => {
    if (ev.pointerId !== id) return;
    id = null;
    const [x, y] = pos(ev);
    e.x = x; e.y = y;
    if (e.abajo && e.movido < 14 && performance.now() - e.t0 < 450) e.toques.push({ x, y });
    e.abajo = false;
  };
  lienzo.addEventListener('pointerup', fin);
  lienzo.addEventListener('pointercancel', fin);
  // Teclado como ayuda en escritorio: espacio o intro equivalen a un toque en el centro.
  window.addEventListener('keydown', ev => {
    if (ev.repeat) return;
    if (ev.key === ' ' || ev.key === 'Enter') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON' || document.activeElement?.tagName === 'A') return;
      e.toques.push({ x: e.x, y: e.y, teclado: true });
      e.pulsaciones.push({ x: e.x, y: e.y, t: performance.now(), teclado: true });
      ev.preventDefault();
    }
  });
  e.vaciar = () => { e.toques.length = 0; e.pulsaciones.length = 0; };
  return e;
}
