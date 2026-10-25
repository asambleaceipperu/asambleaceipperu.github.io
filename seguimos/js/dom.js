// Ayudas pequeñas para construir la interfaz sin librerías.

// h('button.boton.claro', { onclick }, 'Texto', hijo...)
export function h(etiqueta, props = {}, ...hijos) {
  hijos = hijos.flat().filter(c => c != null && c !== false);
  const [nombre, ...clases] = etiqueta.split('.');
  const el = document.createElement(nombre || 'div');
  if (clases.length) el.className = clases.join(' ');
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

export const barajar = (lista, r = Math.random) => { const l = [...lista]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };

// Azar con semilla: el mismo día baraja igual para todo el mundo.
export function azar(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Quita tildes y pasa a mayúsculas (para comparar palabras), respetando la Ñ.
export const normaliza = s => s.toUpperCase().replace(/Ñ/g, '\u0001').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'Ñ');

export function avisar(texto) {
  const el = document.getElementById('aviso');
  el.textContent = texto;
  el.classList.add('visible');
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => el.classList.remove('visible'), 2600);
}

// Confeti con física sencilla, en un lienzo encima de todo.
export function confeti(n = 120) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = h('canvas.confeti'); document.body.append(c);
  const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const colores = ['#86cd55', '#ffcf33', '#174d32', '#e0566c', '#7fb7e8'];
  const p = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 80, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 520, vy: -Math.random() * 620 - 180, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, w: 5 + Math.random() * 5, h: 8 + Math.random() * 6, c: colores[Math.floor(Math.random() * colores.length)] }));
  let t0 = performance.now(), ultimo = t0;
  const paso = ahora => {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const q of p) { q.vy += 900 * dt; q.vx *= 0.99; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.c; ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h * Math.abs(Math.cos(q.r))); ctx.restore(); }
    if (ahora - t0 < 3200) requestAnimationFrame(paso); else c.remove();
  };
  requestAnimationFrame(paso);
}
