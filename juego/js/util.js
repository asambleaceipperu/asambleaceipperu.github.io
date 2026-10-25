// Utilidades compartidas: matemáticas, azar con semilla, easing y dibujo básico.

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
// Aproximación exponencial independiente de los fps.
export const damp = (a, b, rapidez, dt) => lerp(a, b, 1 - Math.exp(-rapidez * dt));

export const ease = {
  outCubic: t => 1 - (1 - t) ** 3,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outBack: t => { const c = 1.70158; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
  outElastic: t => (t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  inCubic: t => t * t * t,
};

// Generador pseudoaleatorio con semilla (mulberry32).
export function azar(semilla = 1) {
  let s = semilla >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.entre = (a, b) => a + r() * (b - a);
  r.entero = (a, b) => Math.floor(a + r() * (b - a + 1));
  r.uno = lista => lista[Math.floor(r() * lista.length)];
  r.barajar = lista => { const l = [...lista]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
  return r;
}
export const rnd = azar((Date.now() ^ 0x5eed) >>> 0);

// Colores: mezcla y oscurecido en hexadecimal.
function hexArgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbHex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
export function mezcla(a, b, t) { const A = hexArgb(a), B = hexArgb(b); return rgbHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
export const oscuro = (c, t = 0.2) => mezcla(c, '#0f1a14', t);
export const claro = (c, t = 0.2) => mezcla(c, '#ffffff', t);
export function alfa(c, a) { const [r, g, b] = hexArgb(c); return `rgba(${r},${g},${b},${a})`; }

// Rectángulo redondeado (compatible con navegadores sin ctx.roundRect).
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function circulo(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
export function elipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }

// Sombra de contacto suave bajo personajes y muebles.
export function sombra(ctx, x, y, rx, ry, a = 0.18) {
  ctx.fillStyle = `rgba(15,53,34,${a})`;
  elipse(ctx, x, y, rx, ry);
  ctx.fill();
}

export const fuentes = {
  display: '"Bricolage","Arial Narrow",Arial,sans-serif',
  texto: '"Atkinson",Verdana,Arial,sans-serif',
  rotulador: '"Marker","Bricolage",Arial,sans-serif',
};

export function texto(ctx, t, x, y, { tam = 16, fuente = fuentes.texto, peso = 400, color = '#16221b', alin = 'center', base = 'middle', ancho } = {}) {
  ctx.font = `${peso} ${tam}px ${fuente}`;
  ctx.fillStyle = color;
  ctx.textAlign = alin;
  ctx.textBaseline = base;
  if (ancho) ctx.fillText(t, x, y, ancho); else ctx.fillText(t, x, y);
}

// Parte un texto en líneas que caben en un ancho dado.
export function lineas(ctx, t, ancho) {
  const palabras = t.split(' ');
  const out = [];
  let linea = '';
  for (const p of palabras) {
    const prueba = linea ? linea + ' ' + p : p;
    if (ctx.measureText(prueba).width > ancho && linea) { out.push(linea); linea = p; } else linea = prueba;
  }
  if (linea) out.push(linea);
  return out;
}

export const formatoNum = n => Math.round(n).toLocaleString('es-ES');

// Lienzo fuera de pantalla (OffscreenCanvas si existe).
export function lienzo(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return c;
}
