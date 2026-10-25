// Pictogramas vectoriales: necesidades del alumnado, reivindicaciones y acciones finales.
// Todos se dibujan centrados en (x, y) dentro de una caja de tamaño `t`.
import { TAU, rr, circulo, elipse, fuentes } from './util.js';

const L = '#0f3522';

export function icono(ctx, nombre, x, y, t = 20, opc = {}) {
  const k = t / 20;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineWidth = opc.lw ?? 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = opc.linea || L;
  ctx.fillStyle = opc.relleno || L;
  const f = DIBUJOS[nombre];
  if (f) f(ctx, opc);
  ctx.restore();
}

const DIBUJOS = {
  pregunta(ctx) {
    ctx.font = `800 19px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);
  },
  lapiz(ctx) { // lápiz partido en dos
    ctx.save(); ctx.rotate(-0.6);
    ctx.fillStyle = '#ffcf33'; rr(ctx, -9, -3, 8, 6, 1); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f2d0b5'; ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(-13, 0); ctx.lineTo(-9, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.rotate(-0.25); ctx.translate(4, 2);
    ctx.fillStyle = '#ffcf33'; rr(ctx, 0, -3, 9, 6, 1); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0566c'; rr(ctx, 9, -3, 3, 6, 1); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-1, -7); ctx.lineTo(1, -4); ctx.moveTo(3, -8); ctx.lineTo(3, -5); ctx.stroke();
  },
  libro(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(-5, -8, -10, -6); ctx.lineTo(-10, 7); ctx.quadraticCurveTo(-5, 5, 0, 8); ctx.quadraticCurveTo(5, 5, 10, 7); ctx.lineTo(10, -6); ctx.quadraticCurveTo(5, -8, 0, -5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 8); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-3, -1); ctx.moveTo(-7, 1.5); ctx.lineTo(-3, 2.5); ctx.moveTo(3, -1); ctx.lineTo(7, -2); ctx.stroke();
  },
  triste(ctx) { // carita triste: «hoy no estoy bien»
    ctx.fillStyle = '#7fb7e8'; circulo(ctx, 0, 0, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = L; circulo(ctx, -3.2, -2, 1.3); ctx.fill(); circulo(ctx, 3.2, -2, 1.3); ctx.fill();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 5.5, 3.6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(4.5, 0); ctx.quadraticCurveTo(6, 3, 4.5, 4); ctx.quadraticCurveTo(3, 3, 4.5, 0); ctx.fill();
  },
  mates(ctx) {
    ctx.font = `800 13px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('2+3', 0, 0.5);
  },
  alfabeto(ctx) { // bocadillo en otro alfabeto: alumnado recién llegado
    ctx.font = `700 11px ${fuentes.texto}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Ж ب', 0, -3.5);
    ctx.font = `700 9px ${fuentes.texto}`; ctx.fillText('字 ?', 0, 6);
  },
  pictos(ctx) { // tablero de comunicación con pictogramas
    const c = ['#ffcf33', '#86cd55', '#7fb7e8', '#e0566c'];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = c[i]; rr(ctx, -9 + (i % 2) * 10, -9 + Math.floor(i / 2) * 10, 8, 8, 1.6); ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.fillStyle = L; circulo(ctx, -5, -5, 1.6); ctx.fill(); circulo(ctx, 5, 5, 1.6); ctx.fill();
  },
  zzz(ctx) {
    ctx.font = `800 10px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('z', -5, 4); ctx.font = `800 13px ${fuentes.display}`; ctx.fillText('z', 2, -1); ctx.font = `800 16px ${fuentes.display}`; ctx.fillText('Z', 8, -7);
  },
  bombilla(ctx, o) {
    const on = o.encendida !== false;
    if (on) { ctx.fillStyle = 'rgba(255,207,51,.35)'; circulo(ctx, 0, -2, 11); ctx.fill(); }
    ctx.fillStyle = on ? '#ffcf33' : '#e6e1d4';
    ctx.beginPath(); ctx.arc(0, -3, 7, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(3, 5); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b8b2a3'; rr(ctx, -3.4, 5, 6.8, 4.5, 1.2); ctx.fill(); ctx.stroke();
    if (on) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(-1, -4, 3.6, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke(); }
  },
  // ---- Reivindicaciones ----
  ratio(ctx) {
    for (let i = 0; i < 15; i++) { const cx = -8 + (i % 5) * 4, cy = -5 + Math.floor(i / 5) * 5; circulo(ctx, cx, cy, 1.5); ctx.fill(); }
  },
  reloj(ctx) {
    ctx.fillStyle = '#ffffff'; circulo(ctx, 0, 1, 8.5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(0, -4.5); ctx.moveTo(0, 1); ctx.lineTo(4, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-9, -5); ctx.moveTo(6, -8); ctx.lineTo(9, -5); ctx.stroke();
  },
  papeles(ctx) {
    ctx.fillStyle = '#ffffff';
    for (let i = 2; i >= 0; i--) { ctx.save(); ctx.translate(i * 2.5 - 2, -i * 2.5 + 2); ctx.rotate(i * 0.08); rr(ctx, -6, -7, 12, 15, 1.4); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(2, -2); ctx.moveTo(-5, 1.5); ctx.lineTo(2, 1.5); ctx.moveTo(-5, 5); ctx.lineTo(0, 5); ctx.stroke();
  },
  manos(ctx) {
    ctx.fillStyle = '#f2d0b5';
    for (const l of [-1, 1]) { ctx.save(); ctx.scale(l, 1); ctx.beginPath(); ctx.moveTo(1, 8); ctx.lineTo(1, -2); ctx.quadraticCurveTo(1, -8, 5, -8); ctx.quadraticCurveTo(9, -8, 9, -3); ctx.lineTo(9, 3); ctx.quadraticCurveTo(9, 8, 4, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = '#e0566c'; ctx.beginPath(); ctx.moveTo(0, -1); ctx.bezierCurveTo(-3, -5, -6, -1, 0, 3); ctx.bezierCurveTo(6, -1, 3, -5, 0, -1); ctx.fill();
  },
  termometro(ctx) {
    ctx.fillStyle = '#ffffff'; rr(ctx, -3, -10, 6, 15, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0566c'; circulo(ctx, 0, 6, 4.6); ctx.fill(); ctx.stroke(); ctx.fillRect(-1.3, -5, 2.6, 9);
    ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(4.5, -7); ctx.lineTo(7, -7); ctx.moveTo(4.5, -3); ctx.lineTo(7, -3); ctx.stroke();
  },
  euro(ctx) {
    ctx.font = `800 18px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('€', 0, 1);
  },
  // ---- Acciones finales ----
  camiseta(ctx) {
    ctx.fillStyle = '#5fb84a';
    ctx.beginPath(); ctx.moveTo(-4, -9); ctx.quadraticCurveTo(0, -6, 4, -9); ctx.lineTo(10, -6); ctx.lineTo(8, -1); ctx.lineTo(6, -2); ctx.lineTo(6, 9); ctx.lineTo(-6, 9); ctx.lineTo(-6, -2); ctx.lineTo(-8, -1); ctx.lineTo(-10, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
  },
  hucha(ctx) {
    ctx.fillStyle = '#ffb3c1'; elipse(ctx, 0, 2, 9, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, -4.6); ctx.lineTo(3, -4.6); ctx.stroke();
    ctx.fillStyle = '#ffcf33'; circulo(ctx, 0, -8, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = L; circulo(ctx, 4, 0, 1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, 8); ctx.lineTo(-4, 10); ctx.moveTo(4, 8); ctx.lineTo(4, 10); ctx.stroke();
  },
  megafono(ctx) {
    ctx.fillStyle = '#ffcf33';
    ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(4, -9); ctx.lineTo(4, 7); ctx.lineTo(-8, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; rr(ctx, -11, -3, 4, 6, 1); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -4); ctx.quadraticCurveTo(10, -1, 7, 2); ctx.moveTo(9, -7); ctx.quadraticCurveTo(14, -1, 9, 5); ctx.stroke();
  },
  carta(ctx) {
    ctx.fillStyle = '#ffffff'; rr(ctx, -10, -7, 20, 14, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(0, 1); ctx.lineTo(10, -6); ctx.stroke();
  },
  altavoz(ctx, o) {
    ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-4, -3); ctx.lineTo(1, -8); ctx.lineTo(1, 8); ctx.lineTo(-4, 3); ctx.lineTo(-8, 3); ctx.closePath(); ctx.fill();
    if (o.mudo) { ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(10, 4); ctx.moveTo(10, -4); ctx.lineTo(4, 4); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(1, 0, 5, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(1, 0, 9, -0.8, 0.8); ctx.stroke(); }
  },
};

export const NECESIDADES = ['pregunta', 'lapiz', 'libro', 'triste', 'mates'];
export { TAU };
