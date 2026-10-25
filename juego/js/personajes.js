// Personas «cápsula»: un generador paramétrico de personajes (cuerpo-píldora, cabeza redonda,
// ojos de punto) y una caché de sprites para mover cientos de ellas en la mani.
import { TAU, rr, circulo, elipse, sombra, oscuro, claro, lienzo, azar } from './util.js';

export const PAL = {
  papel: '#f7f8f3', pizarra: '#174d32', honda: '#0f3522', marea: '#86cd55', suave: '#e4eed8',
  margen: '#e0566c', tinta: '#16221b', amarillo: '#ffcf33', amarilloHondo: '#f2b705', camiseta: '#5fb84a',
};
export const PIELES = ['#f6d5bd', '#eab996', '#d29a74', '#b47a55', '#8a5a3c', '#5e3d2b'];
export const PELOS = ['#2a1c14', '#46301f', '#6f4426', '#b0793f', '#d9b36c', '#141414', '#8e8e8e', '#a8432a', '#ece6dc'];
export const ROPA = ['#e8774f', '#5b8fd6', '#f4c542', '#a77fd6', '#4fb3a9', '#e45c7a', '#f3efe6', '#3d5a80', '#e9a23b', '#7fb7e8', '#c96f9e', '#8bbf63'];
const PEINADOS = ['corto', 'largo', 'moño', 'coletas', 'rizado', 'flequillo', 'calvo', 'cresta'];
const LINEA = PAL.honda;

// Persona aleatoria. `edad`: 'niño' | 'adulto' | 'mayor'.
export function personaAzar(r, edad = 'adulto', extra = {}) {
  const mayor = edad === 'mayor';
  const peinado = mayor ? r.uno(['corto', 'moño', 'calvo', 'rizado']) : edad === 'niño' ? r.uno(['corto', 'largo', 'coletas', 'rizado', 'flequillo', 'moño', 'cresta']) : r.uno(PEINADOS);
  return {
    edad,
    piel: r.uno(PIELES),
    peinado,
    pelo: mayor ? r.uno(['#cfcac2', '#e9e5dd', '#9c9a95']) : r.uno(PELOS.slice(0, 8)),
    ropa: r.uno(ROPA),
    pantalon: r.uno(['#2f3e57', '#4a4a52', '#5c4636', '#284a6e', '#3b3b3b']),
    gafas: r() < (mayor ? 0.6 : 0.18),
    barba: edad === 'adulto' && r() < 0.16,
    mochila: edad === 'niño' && r() < 0.5 ? r.uno(ROPA) : null,
    lazo: edad === 'niño' && (peinado === 'coletas' || peinado === 'moño') && r() < 0.6 ? r.uno(['#e0566c', '#ffcf33', '#5b8fd6']) : null,
    estampado: r() < 0.3 ? r.uno(['raya', 'punto']) : null,
    ...extra,
  };
}

// Medidas base (unidades locales; los pies en 0,0, hacia arriba es negativo).
function medidas(p) {
  if (p.edad === 'niño') return { hr: 11.5, cy: -35, bw: 20, bTop: -24, bBot: -6, piernas: 6, brazo: 11 };
  if (p.edad === 'mayor') return { hr: 11.5, cy: -50, bw: 24, bTop: -38, bBot: -10, piernas: 10, brazo: 14 };
  return { hr: 11.5, cy: -52, bw: 23, bTop: -40, bBot: -10, piernas: 10, brazo: 15 };
}

/**
 * Dibuja una persona.
 * o: { x, y, esc, vista: 'frente'|'espalda', brazos: 'abajo'|'uno'|'saluda'|'pancarta'|'arriba'|'cafe'|'abanico'|'papel',
 *      expr: 'normal'|'feliz'|'triste'|'dormido'|'sorpresa'|'cansado'|'gritando', t, paso, salto, sentado, mira (-1..1), parpadeo }
 */
export function dibujaPersona(ctx, p, o = {}) {
  const { x = 0, y = 0, esc = 1, vista = 'frente', brazos = 'abajo', expr = 'normal', t = 0, paso = 0, salto = 0, sentado = false, mira = 0, sinSombra = false, lw = 1.7 } = o;
  const m = medidas(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(esc, esc);
  if (!sinSombra) sombra(ctx, 0, 0, m.bw * 0.62, 4.2, 0.16 * (1 - Math.min(0.6, salto / 30)));
  ctx.translate(0, -salto);
  // Squash & stretch: al andar, un leve rebote.
  const rebote = sentado ? 0 : Math.abs(Math.sin(paso * Math.PI)) * 1.6;
  const sq = 1 + (o.estira || 0);
  ctx.translate(0, -rebote);
  ctx.scale(1 / Math.sqrt(sq), sq);
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = LINEA;

  const espalda = vista === 'espalda';
  const swing = Math.sin(paso * TAU);

  // Piernas.
  if (!sentado) {
    const pl = m.piernas;
    for (const lado of [-1, 1]) {
      const desp = espalda || vista === 'frente' ? swing * lado * 2.2 : 0;
      ctx.fillStyle = p.pantalon || '#2f3e57';
      rr(ctx, lado * 4.6 - 3.4, m.bBot - 2 + Math.max(0, -desp) * 0.4, 6.8, pl + 2 - Math.max(0, desp) * 0.5, 3.2);
      ctx.fill(); ctx.stroke();
    }
  }

  // Pelo largo por detrás de la cabeza (antes del cuerpo).
  const cy = m.cy;
  const hr = m.hr;
  if (!espalda && (p.peinado === 'largo')) {
    ctx.fillStyle = p.pelo;
    rr(ctx, -hr - 1.5, cy - hr * 0.3, hr * 2 + 3, hr * 2.1, hr * 0.9);
    ctx.fill(); ctx.stroke();
  }

  // Mochila (vista de espalda la vemos entera; de frente asoman las asas).
  if (p.mochila && espalda) {
    ctx.fillStyle = p.mochila;
    rr(ctx, -8, m.bTop + 3, 16, 16, 5); ctx.fill(); ctx.stroke();
  }

  // Brazos que van por detrás del cuerpo (los bajados).
  const brazosDetras = [];
  const brazosDelante = [];
  const piel = p.piel;
  const hombroY = m.bTop + 4;
  const hombroX = m.bw * 0.4 - 0.5;
  const bl = m.brazo;
  const planBrazo = (lado, ang, largo = bl, mano = true, objeto = null) => ({ lado, ang, largo, mano, objeto });
  switch (brazos) {
    case 'uno': brazosDetras.push(planBrazo(-1, 0.18 + swing * 0.05)); brazosDelante.push(planBrazo(1, Math.PI - 0.25 + Math.sin(t * 9) * 0.08, bl + 2)); break;
    case 'saluda': brazosDetras.push(planBrazo(-1, 0.2)); brazosDelante.push(planBrazo(1, Math.PI - 0.5 + Math.sin(t * 12) * 0.35, bl + 1)); break;
    case 'arriba': brazosDelante.push(planBrazo(-1, Math.PI - 0.35 + Math.sin(t * 10) * 0.1, bl + 1)); brazosDelante.push(planBrazo(1, Math.PI - 0.35 + Math.sin(t * 10 + 1) * 0.1, bl + 1)); break;
    case 'pancarta': brazosDelante.push(planBrazo(-1, Math.PI - 0.15, bl)); brazosDelante.push(planBrazo(1, Math.PI - 0.15, bl)); break;
    case 'puño': brazosDetras.push(planBrazo(-1, 0.18 + swing * 0.2)); brazosDelante.push(planBrazo(1, Math.PI - 0.1 + Math.sin(t * 8) * 0.12, bl + 2)); break;
    case 'cafe': brazosDetras.push(planBrazo(-1, 0.15 + swing * 0.12)); brazosDelante.push(planBrazo(1, 1.15, bl * 0.75, true, 'cafe')); break;
    case 'abanico': brazosDetras.push(planBrazo(-1, 0.15)); brazosDelante.push(planBrazo(1, 1.9 + Math.sin(t * 16) * 0.4, bl * 0.8, true, 'abanico')); break;
    case 'papel': brazosDelante.push(planBrazo(-1, 1.25, bl * 0.75, true)); brazosDelante.push(planBrazo(1, 1.25, bl * 0.75, true, 'papel')); break;
    case 'escribe': brazosDelante.push(planBrazo(-1, 1.0, bl * 0.65)); brazosDelante.push(planBrazo(1, 1.0 + Math.sin(t * 14) * 0.08, bl * 0.65)); break;
    default: brazosDetras.push(planBrazo(-1, 0.16 + swing * 0.28 * (sentado ? 0 : 1))); brazosDetras.push(planBrazo(1, 0.16 - swing * 0.28 * (sentado ? 0 : 1)));
  }
  const dibujaBrazo = b => {
    // ang: 0 = colgando hacia abajo, PI = hacia arriba. Se mide desde la vertical.
    const sx = b.lado * hombroX;
    const ex = sx + Math.sin(b.ang) * b.largo * b.lado;
    const ey = hombroY + Math.cos(b.ang) * b.largo;
    ctx.strokeStyle = LINEA;
    ctx.lineWidth = 6.4 + lw;
    ctx.beginPath(); ctx.moveTo(sx, hombroY); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = piel;
    ctx.lineWidth = 6.4;
    ctx.beginPath(); ctx.moveTo(sx, hombroY); ctx.lineTo(ex, ey); ctx.stroke();
    // Manga.
    ctx.strokeStyle = p.ropa;
    ctx.lineWidth = 7.2;
    const mx = sx + (ex - sx) * 0.38, my = hombroY + (ey - hombroY) * 0.38;
    ctx.beginPath(); ctx.moveTo(sx, hombroY); ctx.lineTo(mx, my); ctx.stroke();
    ctx.lineWidth = lw;
    ctx.strokeStyle = LINEA;
    if (b.mano) { ctx.fillStyle = piel; circulo(ctx, ex, ey, 3.6); ctx.fill(); ctx.stroke(); }
    if (b.objeto === 'cafe') {
      ctx.fillStyle = '#f3efe6'; rr(ctx, ex - 4, ey - 9, 8, 9, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e45c7a'; ctx.fillRect(ex - 3.2, ey - 6, 6.4, 2.4);
      ctx.strokeStyle = 'rgba(15,53,34,.35)'; ctx.beginPath(); ctx.moveTo(ex - 1, ey - 11); ctx.quadraticCurveTo(ex + 2, ey - 14, ex, ey - 17); ctx.stroke(); ctx.strokeStyle = LINEA;
    } else if (b.objeto === 'abanico') {
      ctx.fillStyle = '#ffcf33';
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.arc(ex, ey, 9, -Math.PI * 0.95, -Math.PI * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (b.objeto === 'papel') {
      ctx.fillStyle = '#ffffff'; ctx.save(); ctx.translate(ex - 6, ey - 6); ctx.rotate(-0.2); rr(ctx, -6, -7, 12, 14, 1.5); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  };
  brazosDetras.forEach(dibujaBrazo);

  // Cuerpo-píldora con camiseta.
  const bw = m.bw;
  const bh = m.bBot - m.bTop + (sentado ? 4 : 0);
  ctx.fillStyle = p.ropa;
  frijol(ctx, bw, m.bTop, bh);
  ctx.fill();
  // Volumen: sombra lateral y brillo suave.
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(15,40,25,.13)';
  ctx.fillRect(bw * 0.12, m.bTop, bw, bh);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.fillRect(-bw / 2, m.bTop, bw * 0.22, bh);
  if (p.estampado === 'raya') { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-bw / 2, m.bTop + bh * 0.42, bw, 3); }
  if (p.estampado === 'punto') { ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 3; i++) { circulo(ctx, -5 + i * 5, m.bTop + bh * 0.5 + (i % 2) * 3, 1.3); ctx.fill(); } }
  if (p.marea && !espalda) dibujaCorroMini(ctx, 0, m.bTop + bh * 0.42, 4.4, '#ffffff');
  if (p.marea && espalda) dibujaCorroMini(ctx, 0, m.bTop + bh * 0.4, 5.2, 'rgba(255,255,255,.8)');
  ctx.restore();
  frijol(ctx, bw, m.bTop, bh);
  ctx.stroke();
  // Cuello de la camiseta.
  if (!espalda) {
    ctx.fillStyle = piel;
    ctx.beginPath(); ctx.ellipse(0, m.bTop + 0.6, 4.3, 2.6, 0, 0, Math.PI); ctx.fill();
    if (p.mochila) { ctx.strokeStyle = oscuro(p.mochila, 0.15); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-bw / 2 + 4, m.bTop + 2); ctx.lineTo(-bw / 2 + 5, m.bTop + bh - 6); ctx.moveTo(bw / 2 - 4, m.bTop + 2); ctx.lineTo(bw / 2 - 5, m.bTop + bh - 6); ctx.stroke(); ctx.strokeStyle = LINEA; ctx.lineWidth = lw; }
  }

  // Cabeza.
  dibujaCabeza(ctx, p, 0, cy, hr, { espalda, expr, t, mira, lw, parpadeo: o.parpadeo });

  brazosDelante.forEach(dibujaBrazo);
  ctx.restore();
  return m;
}

// Torso en forma de judía: hombros algo más estrechos que la cadera, todo redondeado.
function frijol(ctx, bw, top, bh) {
  const w = bw / 2, hs = w * 0.8, bot = top + bh;
  ctx.beginPath();
  ctx.moveTo(-hs + 4, top);
  ctx.lineTo(hs - 4, top);
  ctx.quadraticCurveTo(hs + 1, top, hs + 1.2, top + 5);
  ctx.bezierCurveTo(w + 1, top + bh * 0.45, w + 1, bot - 2, w - 5, bot);
  ctx.lineTo(-w + 5, bot);
  ctx.bezierCurveTo(-w - 1, bot - 2, -w - 1, top + bh * 0.45, -hs - 1.2, top + 5);
  ctx.quadraticCurveTo(-hs - 1, top, -hs + 4, top);
  ctx.closePath();
}

export function dibujaCabeza(ctx, p, x, cy, hr, { espalda = false, expr = 'normal', t = 0, mira = 0, lw = 1.7, parpadeo } = {}) {
  ctx.lineWidth = lw;
  ctx.strokeStyle = LINEA;
  const piel = p.piel;
  const pelo = p.pelo;
  // Moño y coletas detrás.
  if (p.peinado === 'coletas') {
    ctx.fillStyle = pelo;
    for (const l of [-1, 1]) { circulo(ctx, x + l * (hr + 2.5), cy + 1.5, hr * 0.48); ctx.fill(); ctx.stroke(); }
    if (p.lazo) { ctx.fillStyle = p.lazo; for (const l of [-1, 1]) { circulo(ctx, x + l * (hr + 0.4), cy - 2.4, 2.2); ctx.fill(); } }
  }
  if (p.peinado === 'moño') {
    ctx.fillStyle = pelo; circulo(ctx, x, cy - hr - 2.6, hr * 0.52); ctx.fill(); ctx.stroke();
    if (p.lazo) { ctx.fillStyle = p.lazo; rr(ctx, x - 4, cy - hr - 0.6, 8, 2.6, 1.2); ctx.fill(); }
  }
  // Orejas.
  ctx.fillStyle = piel;
  for (const l of [-1, 1]) { circulo(ctx, x + l * hr * 0.98, cy + 1, 2.6); ctx.fill(); ctx.stroke(); }
  // Cara.
  ctx.fillStyle = piel;
  circulo(ctx, x, cy, hr);
  ctx.fill();
  ctx.save();
  circulo(ctx, x, cy, hr); ctx.clip();
  ctx.fillStyle = 'rgba(120,50,20,.10)';
  circulo(ctx, x + hr * 0.45, cy + hr * 0.25, hr); ctx.fill();
  ctx.restore();
  // Pelo (tapa superior).
  ctx.fillStyle = pelo;
  if (espalda) {
    if (p.peinado !== 'calvo') {
      // De espaldas el pelo cubre casi toda la cabeza; solo asoma la nuca.
      ctx.save(); circulo(ctx, x, cy, hr); ctx.clip();
      ctx.beginPath(); ctx.arc(x, cy + hr * 0.95, hr * 0.62, 0, TAU); ctx.rect(x - hr, cy - hr, hr * 2, hr * 2);
      ctx.fill('evenodd');
      ctx.restore();
      if (p.peinado === 'rizado') for (let i = 0; i < 7; i++) { const a = Math.PI * (0.9 + i * 0.2); circulo(ctx, x + Math.cos(a) * hr * 0.95, cy + Math.sin(a) * hr * 0.95, hr * 0.36); ctx.fill(); }
      if (p.peinado === 'largo') { rr(ctx, x - hr - 0.5, cy - 2, hr * 2 + 1, hr * 1.7, hr * 0.7); ctx.fill(); ctx.stroke(); }
      ctx.strokeStyle = claro(pelo, 0.22); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, cy - 1, hr * 0.6, Math.PI * 1.2, Math.PI * 1.6); ctx.stroke();
      ctx.strokeStyle = LINEA; ctx.lineWidth = lw;
    }
  } else {
    pintaPeinado(ctx, p, x, cy, hr);
  }
  circulo(ctx, x, cy, hr);
  ctx.stroke();
  if (espalda) return;

  // Rasgos.
  const ojoY = cy + 1.2;
  const sep = hr * 0.38;
  const mx = mira * 1.6;
  const cierra = parpadeo ?? (((t * 0.37 + (p.semilla || 0)) % 3.2) < 0.09);
  ctx.fillStyle = LINEA;
  ctx.strokeStyle = LINEA;
  if (expr === 'dormido' || expr === 'feliz' || cierra) {
    ctx.lineWidth = 1.5;
    for (const l of [-1, 1]) {
      ctx.beginPath();
      if (expr === 'feliz') ctx.arc(x + l * sep + mx, ojoY + 1, 2.1, Math.PI * 1.15, Math.PI * 1.85);
      else { ctx.moveTo(x + l * sep - 2 + mx, ojoY); ctx.lineTo(x + l * sep + 2 + mx, ojoY); }
      ctx.stroke();
    }
  } else {
    for (const l of [-1, 1]) { elipse(ctx, x + l * sep + mx, ojoY, 1.6, expr === 'sorpresa' ? 2.4 : 2.1); ctx.fill(); }
    // Brillo en los ojos.
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (const l of [-1, 1]) { circulo(ctx, x + l * sep + mx + 0.5, ojoY - 0.8, 0.55); ctx.fill(); }
  }
  // Cejas según la emoción.
  ctx.lineWidth = 1.3;
  if (expr === 'triste' || expr === 'cansado') {
    for (const l of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + l * (sep + 2.3) + mx, ojoY - 3.4); ctx.lineTo(x + l * (sep - 1.6) + mx, ojoY - 4.8); ctx.stroke(); }
  }
  // Mofletes.
  ctx.fillStyle = 'rgba(232,96,108,.28)';
  for (const l of [-1, 1]) { circulo(ctx, x + l * (sep + 2.2), cy + 4.3, 1.9); ctx.fill(); }
  // Boca.
  const by = cy + 5.4;
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = LINEA;
  ctx.beginPath();
  switch (expr) {
    case 'feliz': ctx.fillStyle = '#7a2d2d'; ctx.arc(x + mx * 0.5, by - 0.6, 2.8, 0.1, Math.PI - 0.1); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'gritando': ctx.fillStyle = '#7a2d2d'; elipse(ctx, x + mx * 0.5, by + 0.4, 2.4, 2.8 + Math.abs(Math.sin(t * 10)) * 0.8); ctx.fill(); ctx.stroke(); break;
    case 'sorpresa': elipse(ctx, x + mx * 0.5, by + 0.4, 1.4, 1.8); ctx.stroke(); break;
    case 'triste': ctx.arc(x + mx * 0.5, by + 2.4, 2.4, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); break;
    case 'dormido': elipse(ctx, x + mx * 0.5, by + 0.4, 1.1, 1.3); ctx.stroke(); break;
    case 'cansado': ctx.moveTo(x - 2 + mx * 0.5, by + 0.6); ctx.lineTo(x + 2 + mx * 0.5, by + 0.2); ctx.stroke(); break;
    default: ctx.arc(x + mx * 0.5, by - 1, 2.3, 0.35, Math.PI - 0.35); ctx.stroke();
  }
  // Gafas y barba.
  if (p.gafas) {
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = LINEA;
    for (const l of [-1, 1]) { circulo(ctx, x + l * sep + mx, ojoY, 3.1); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - sep + 3 + mx, ojoY); ctx.lineTo(x + sep - 3 + mx, ojoY); ctx.stroke();
  }
  if (p.barba) {
    ctx.fillStyle = pelo;
    ctx.beginPath(); ctx.arc(x, cy + 1, hr, 0.15, Math.PI - 0.15); ctx.arc(x, cy + 3.6, hr * 0.48, Math.PI - 0.25, 0.25, true); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = LINEA;
    ctx.beginPath(); ctx.arc(x + mx * 0.5, cy + 5, 1.8, 0.2, Math.PI - 0.2); ctx.stroke();
  }
}

function pintaPeinado(ctx, p, x, cy, hr) {
  const pelo = p.pelo;
  ctx.fillStyle = pelo;
  switch (p.peinado) {
    case 'calvo':
      ctx.beginPath(); ctx.arc(x - hr * 0.86, cy - 1, 3.4, 0, TAU); ctx.arc(x + hr * 0.86, cy - 1, 3.4, 0, TAU); ctx.fill();
      break;
    case 'rizado':
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.0 + i * (1 / 6)); circulo(ctx, x + Math.cos(a) * hr * 0.98, cy + Math.sin(a) * hr * 0.98 - 0.5, hr * 0.36); ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, cy, hr * 1.02, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(x, cy - hr * 0.45, x - hr * 1.02, cy); ctx.closePath(); ctx.fill();
      break;
    case 'flequillo':
      ctx.beginPath(); ctx.arc(x, cy, hr + 0.3, Math.PI * 0.95, Math.PI * 2.05); ctx.lineTo(x + hr, cy - 1.6); ctx.lineTo(x - hr, cy - 1.6); ctx.closePath(); ctx.fill();
      break;
    case 'cresta':
      ctx.beginPath(); ctx.arc(x, cy, hr + 0.3, Math.PI * 1.08, Math.PI * 1.92); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 4, cy - hr + 1); ctx.lineTo(x - 1, cy - hr - 6); ctx.lineTo(x + 1.5, cy - hr - 1.5); ctx.lineTo(x + 4, cy - hr - 5); ctx.lineTo(x + 5, cy - hr + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'largo':
    case 'moño':
    case 'coletas':
      ctx.beginPath(); ctx.arc(x, cy, hr + 0.4, Math.PI * 0.98, Math.PI * 2.02);
      ctx.quadraticCurveTo(x + hr * 0.2, cy - hr * 0.7, x - hr * 0.1, cy - hr * 0.25);
      ctx.quadraticCurveTo(x - hr * 0.6, cy - hr * 0.55, x - hr - 0.4, cy);
      ctx.closePath(); ctx.fill();
      break;
    default: // corto
      ctx.beginPath(); ctx.arc(x, cy, hr + 0.4, Math.PI * 1.0, Math.PI * 2.0);
      ctx.quadraticCurveTo(x + hr * 0.5, cy - hr * 0.62, x - hr * 0.2, cy - hr * 0.5);
      ctx.quadraticCurveTo(x - hr * 0.8, cy - hr * 0.35, x - hr - 0.4, cy);
      ctx.closePath(); ctx.fill();
  }
  // Brillo del pelo.
  if (p.peinado !== 'calvo') {
    ctx.strokeStyle = claro(pelo, 0.25);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(x - 1, cy - 1, hr * 0.72, Math.PI * 1.25, Math.PI * 1.45); ctx.stroke();
    ctx.strokeStyle = LINEA;
  }
}

// El «corro» del logo de la asamblea: ocho lápices hacia el mismo centro.
export function dibujaCorroMini(ctx, x, y, r, c1 = '#ffffff', c2 = null) {
  ctx.save();
  ctx.translate(x, y);
  const k = r / 47;
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.scale(k, k);
    ctx.fillStyle = i % 2 && c2 ? c2 : c1;
    ctx.beginPath();
    ctx.moveTo(-5.5, -26.2); ctx.lineTo(-5.5, -45); ctx.lineTo(5.5, -45); ctx.lineTo(5.5, -26.2); ctx.closePath();
    ctx.moveTo(-5.5, -24); ctx.lineTo(5.5, -24); ctx.lineTo(0, -13); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = c1;
  circulo(ctx, 0, 0, 7 * k); ctx.fill();
  ctx.restore();
}

// Lápiz del logo (para la animación final). Punta en (0,0) apuntando hacia arriba, largo en unidades.
export function dibujaLapiz(ctx, largo, ancho, color, colorPunta = PAL.honda) {
  const w = ancho / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w, ancho * 1.2); ctx.lineTo(0, 0); ctx.lineTo(w, ancho * 1.2); ctx.closePath(); ctx.fill();
  rr(ctx, -w, ancho * 1.4, ancho, Math.max(ancho, largo - ancho * 1.4), ancho * 0.2); ctx.fill();
  ctx.fillStyle = colorPunta;
  ctx.beginPath(); ctx.moveTo(-w * 0.36, ancho * 0.43); ctx.lineTo(0, 0); ctx.lineTo(w * 0.36, ancho * 0.43); ctx.closePath(); ctx.fill();
}

// ---------- Caché de sprites para la multitud ----------
const cache = new Map();
const ESC_CACHE = 2; // resolución extra para pantallas densas
export function spritePersona(p, clave, opciones, escala) {
  const k = clave + '|' + escala.toFixed(2);
  let s = cache.get(k);
  if (s) return s;
  const pad = 26;
  const w = 64, h = 96;
  const c = lienzo((w + pad) * escala * ESC_CACHE, (h + pad) * escala * ESC_CACHE);
  const cx = c.getContext('2d');
  cx.scale(escala * ESC_CACHE, escala * ESC_CACHE);
  dibujaPersona(cx, p, { ...opciones, x: (w + pad) / 2, y: h + pad / 2 - 6, esc: 1 });
  s = { lienzo: c, ox: ((w + pad) / 2) * escala, oy: (h + pad / 2 - 6) * escala, w: (w + pad) * escala, h: (h + pad) * escala };
  cache.set(k, s);
  return s;
}
export function pintaSprite(ctx, s, x, y, esc = 1) {
  ctx.drawImage(s.lienzo, x - s.ox * esc, y - s.oy * esc, s.w * esc, s.h * esc);
}

// Las cuatro profes que se pueden elegir.
export const PROFES = [
  { edad: 'adulto', piel: '#eab996', peinado: 'moño', pelo: '#46301f', ropa: '#e9a23b', pantalon: '#2f3e57', gafas: true, semilla: 0.3 },
  { edad: 'adulto', piel: '#8a5a3c', peinado: 'rizado', pelo: '#141414', ropa: '#a77fd6', pantalon: '#3b3b3b', gafas: false, semilla: 1.1 },
  { edad: 'adulto', piel: '#d29a74', peinado: 'corto', pelo: '#2a1c14', ropa: '#5b8fd6', pantalon: '#4a4a52', barba: true, semilla: 2.2 },
  { edad: 'adulto', piel: '#f6d5bd', peinado: 'largo', pelo: '#a8432a', ropa: '#4fb3a9', pantalon: '#284a6e', gafas: false, semilla: 0.7 },
];

export function conCamisetaVerde(p) { return { ...p, ropa: PAL.camiseta, marea: true }; }

export { azar };
