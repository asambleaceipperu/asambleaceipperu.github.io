// Piezas de interfaz dibujadas en el lienzo: hoja de cuaderno, pancartas pintadas a mano,
// partículas y textos con aparición.
import { TAU, rr, circulo, clamp, ease, fuentes, lineas, azar, alfa } from './util.js';
import { icono } from './iconos.js';

export const C = {
  papel: '#f7f8f3', pizarra: '#174d32', honda: '#0f3522', marea: '#86cd55', suave: '#e4eed8',
  margen: '#e0566c', tinta: '#16221b', gris: '#4a594f', amarillo: '#ffcf33', cuadricula: 'rgba(23,77,50,.08)',
};

// Hoja de cuaderno con cuadrícula y margen rojo, como la web de la asamblea.
export function hoja(ctx, x, y, w, h, { rot = 0, sombraY = 6, radio = 14 } = {}) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(15,53,34,.25)';
  rr(ctx, 2, sombraY, w, h, radio); ctx.fill();
  ctx.fillStyle = C.papel;
  rr(ctx, 0, 0, w, h, radio); ctx.fill();
  ctx.save();
  rr(ctx, 0, 0, w, h, radio); ctx.clip();
  ctx.strokeStyle = C.cuadricula; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = 14; gx < w; gx += 16) { ctx.moveTo(gx, 0); ctx.lineTo(gx, h); }
  for (let gy = 14; gy < h; gy += 16) { ctx.moveTo(0, gy); ctx.lineTo(w, gy); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(224,86,108,.75)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(26, h); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// Texto en párrafo (devuelve la altura usada).
export function parrafo(ctx, t, x, y, ancho, { tam = 16, alto = 1.35, fuente = fuentes.texto, peso = 400, color = C.tinta, alin = 'left', max = 99 } = {}) {
  ctx.font = `${peso} ${tam}px ${fuente}`;
  ctx.fillStyle = color;
  ctx.textAlign = alin;
  ctx.textBaseline = 'top';
  const ls = lineas(ctx, t, ancho).slice(0, max);
  ls.forEach((l, i) => ctx.fillText(l, x, y + i * tam * alto));
  return ls.length * tam * alto;
}

// Pancarta de tela pintada a mano: dos palos, tela con ondas y letras de rotulador con temblor.
export function pancarta(ctx, lineasTexto, x, y, w, h, { t = 0, color = '#f7f8f3', tinta = '#0f3522', icono: ico = null, semilla = 1, palos = true, onda = 1, tamMax = 26 } = {}) {
  const r = azar(semilla * 977);
  ctx.save();
  ctx.translate(x, y);
  if (palos) {
    ctx.fillStyle = '#9b6b43'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
    for (const px of [-w / 2 + 3, w / 2 - 7]) { rr(ctx, px, -h * 0.15, 4, h * 1.55, 2); ctx.fill(); ctx.stroke(); }
  }
  // Tela ondulada.
  const pasos = 14;
  const ondaY = i => Math.sin(t * 3 + i * 0.7 + semilla) * 2.2 * onda;
  ctx.beginPath();
  for (let i = 0; i <= pasos; i++) { const px = -w / 2 + (w * i) / pasos; ctx.lineTo(px, ondaY(i)); }
  for (let i = pasos; i >= 0; i--) { const px = -w / 2 + (w * i) / pasos; ctx.lineTo(px, h + ondaY(i) * 0.8); }
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.6; ctx.stroke();
  // Pliegues suaves.
  ctx.save(); ctx.clip();
  for (let i = 1; i < 4; i++) {
    const px = -w / 2 + (w * i) / 4 + Math.sin(t * 2 + i) * 3;
    const g = ctx.createLinearGradient(px - 10, 0, px + 10, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(15,53,34,.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(px - 10, -5, 20, h + 10);
  }
  ctx.restore();
  // Letras pintadas: dos pasadas con desplazamiento para que parezca brocha.
  const n = lineasTexto.length;
  const icoW = ico ? h * 0.62 : 0;
  const zonaW = w - 16 - icoW;
  let tam = Math.min(h / (n * 1.08), tamMax);
  ctx.font = `400 ${tam}px ${fuentes.rotulador}`;
  const anchoMax = Math.max(...lineasTexto.map(l => ctx.measureText(l).width));
  if (anchoMax > zonaW) tam *= zonaW / anchoMax;
  ctx.font = `400 ${tam}px ${fuentes.rotulador}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const cx = icoW / 2;
  lineasTexto.forEach((l, i) => {
    const ly = h / 2 + (i - (n - 1) / 2) * tam * 1.02 + ondaY(7) * 0.6;
    const rot = (r() - 0.5) * 0.06;
    ctx.save(); ctx.translate(cx, ly); ctx.rotate(rot);
    ctx.fillStyle = alfa(tinta, 0.35); ctx.fillText(l, 0.9, 0.8);
    ctx.fillStyle = tinta; ctx.fillText(l, 0, 0);
    ctx.restore();
  });
  // Gotas de pintura.
  ctx.fillStyle = tinta;
  for (let i = 0; i < 2; i++) {
    const gx = -w / 2 + 14 + r() * (w - 28), gy = h * (0.72 + r() * 0.12);
    const gl = 3 + r() * 5;
    rr(ctx, gx, gy, 1.6, gl, 0.8); ctx.fill(); circulo(ctx, gx + 0.8, gy + gl, 1.3); ctx.fill();
  }
  if (ico) icono(ctx, ico, -w / 2 + 8 + icoW / 2, h / 2, h * 0.5);
  ctx.restore();
}

// Cartel de cartón sostenido por una persona.
export function cartel(ctx, texto, x, y, w, h, { t = 0, color = '#f3e2c0', rot = 0, tinta = '#0f3522' } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot + Math.sin(t * 2.4) * 0.04);
  ctx.fillStyle = '#9b6b43'; rr(ctx, -1.5, 0, 3, h + 10, 1.5); ctx.fill();
  ctx.fillStyle = color; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.3;
  rr(ctx, -w / 2, -h, w, h, 2); ctx.fill(); ctx.stroke();
  const ls = Array.isArray(texto) ? texto : [texto];
  let tam = Math.min(h / (ls.length * 1.1), 12);
  ctx.font = `400 ${tam}px ${fuentes.rotulador}`;
  const am = Math.max(...ls.map(l => ctx.measureText(l).width));
  if (am > w - 6) { tam *= (w - 6) / am; ctx.font = `400 ${tam}px ${fuentes.rotulador}`; }
  ctx.fillStyle = tinta; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ls.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + (i - (ls.length - 1) / 2) * tam * 1.05));
  ctx.restore();
}

// Botón redondo dibujado en el lienzo. Devuelve su rectángulo para detectar toques.
export function boton(ctx, texto, cx, cy, { ancho = 200, alto = 50, fondo = C.marea, color = C.honda, t = 0, pulso = true } = {}) {
  const s = pulso ? 1 + Math.sin(t * 4) * 0.02 : 1;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(15,53,34,.35)'; rr(ctx, -ancho / 2, -alto / 2 + 4, ancho, alto, alto / 2); ctx.fill();
  ctx.fillStyle = fondo; rr(ctx, -ancho / 2, -alto / 2, ancho, alto, alto / 2); ctx.fill();
  ctx.font = `800 19px ${fuentes.display}`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 0, 1);
  ctx.restore();
  return { x: cx - ancho / 2, y: cy - alto / 2, w: ancho, h: alto };
}
export const dentro = (p, r, margen = 6) => r && p.x >= r.x - margen && p.x <= r.x + r.w + margen && p.y >= r.y - margen && p.y <= r.y + r.h + margen;

// Rótulo grande pintado (títulos de día).
export function rotulo(ctx, t, x, y, { tam = 34, color = C.honda, sombra = C.amarillo, rot = -0.03, alin = 'center' } = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `400 ${tam}px ${fuentes.rotulador}`;
  ctx.textAlign = alin; ctx.textBaseline = 'middle';
  if (sombra) { ctx.fillStyle = sombra; ctx.fillText(t, 2.5, 2.5); }
  ctx.fillStyle = color; ctx.fillText(t, 0, 0);
  ctx.restore();
}

// ---------- Partículas ----------
const REDUCIDO = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export function crearParticulas() {
  const lista = [];
  return {
    lista,
    confeti(x, y, n = 18, colores = ['#86cd55', '#ffcf33', '#f7f8f3', '#e0566c'], fuerza = 160) {
      if (REDUCIDO) n = Math.ceil(n / 4);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, v = fuerza * (0.4 + Math.random() * 0.8);
        lista.push({ tipo: 'confeti', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - fuerza * 0.6, vida: 1.2 + Math.random() * 0.6, t: 0, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 12, color: colores[i % colores.length], w: 3 + Math.random() * 3, h: 5 + Math.random() * 4 });
      }
    },
    chispa(x, y, n = 8, color = '#ffcf33') {
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU; lista.push({ tipo: 'chispa', x, y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, vida: 0.4, t: 0, color }); }
    },
    texto(x, y, txt, { color = C.honda, tam = 16, vida = 1.1, vy = -40 } = {}) { lista.push({ tipo: 'texto', x, y, vx: 0, vy, vida, t: 0, txt, color, tam }); },
    añadir(p) { lista.push({ t: 0, vx: 0, vy: 0, ...p }); },
    actualizar(dt) {
      for (let i = lista.length - 1; i >= 0; i--) {
        const p = lista[i];
        p.t += dt;
        if (p.t >= p.vida) { lista.splice(i, 1); continue; }
        if (p.actualizar) { p.actualizar(p, dt); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.tipo === 'confeti') { p.vy += 380 * dt; p.vx *= 0.98; p.rot += p.vr * dt; }
        if (p.tipo === 'chispa') { p.vx *= 0.9; p.vy *= 0.9; }
      }
    },
    dibujar(ctx) {
      for (const p of lista) {
        const k = 1 - p.t / p.vida;
        ctx.save();
        if (p.dibujar) { p.dibujar(ctx, p); ctx.restore(); continue; }
        ctx.globalAlpha = clamp(k * 2, 0, 1);
        if (p.tipo === 'confeti') { ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 1.3))); }
        else if (p.tipo === 'chispa') { ctx.strokeStyle = p.color; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.06, p.y - p.vy * 0.06); ctx.stroke(); }
        else if (p.tipo === 'texto') { ctx.font = `800 ${p.tam}px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = C.papel; ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.txt, p.x, p.y); }
        ctx.restore();
      }
    },
  };
}

// Animación de aparición de 0 a 1 con rebote.
export const aparece = (t, retraso = 0, dur = 0.5) => ease.outBack(clamp((t - retraso) / dur, 0, 1));
