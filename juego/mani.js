// Minijuego: acompaña a una profe a la próxima mani, de Atocha a la Consejería.
// Corre sola; un toque la hace saltar (si mantienes, salta más). Hay que esquivar la burocracia, la falta de
// tiempo y el agobio. Cada chapa verde suma una compañera que corre detrás y te cubre de un golpe.

// h('button.boton', { onclick }, 'Texto', hijo...): crea un elemento sin librerías.
function h(etiqueta, props = {}, ...hijos) {
  const [nombre, ...clases] = etiqueta.split('.');
  const el = document.createElement(nombre || 'div');
  if (clases.length) el.className = clases.join(' ');
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

const C = { papel: '#f7f8f3', honda: '#0f3522', pizarra: '#174d32', marea: '#86cd55', suave: '#e4eed8', amarillo: '#ffcf33', margen: '#e0566c', gris: '#9aa59c', cielo: '#eaf3e1', lejos: '#cddfc2', fachada: '#f0e6d2', fachada2: '#e8d9bd', ventana: '#9fc3b0', asfalto: '#d9dccf', bordillo: '#b9bfae', tronco: '#7d5a3c', copa: '#5fb84a', piel: ['#f6d5bd', '#d29a74', '#8a5a3c', '#eab996', '#b47a55'] };
const URL_JUEGO = 'https://asambleaceipperu.github.io/juego/';
const PX_M = 10;
const META = 2000; // metros hasta la Consejería
const RUTA = [
  { m: 0, nombre: 'Atocha' },
  { m: 500, nombre: 'Neptuno' },
  { m: 1000, nombre: 'Cibeles' },
  { m: 1500, nombre: 'Alcalá' },
  { m: META, nombre: 'Consejería' },
];
const H = 300, SUELO = H - 52;
const G = 2300, SALTO = 640; // gravedad y velocidad de salto (px/s)
const CHOQUES = {
  papeles: 'Te ha sepultado la burocracia.',
  reloj: 'Te has quedado sin tiempo.',
  nube: 'El agobio ha podido contigo.',
  avion: 'Un correo urgente a las once de la noche.',
  foto: 'La fotocopiadora se ha vuelto a atascar.',
};
const ASPECTOS = [
  { piel: C.piel[0], pelo: '#5a3a22', camiseta: C.marea, peinado: 'mono', gafas: true },
  { piel: C.piel[2], pelo: '#1d1d1d', camiseta: '#5fb84a', peinado: 'corto', gafas: false },
  { piel: C.piel[3], pelo: '#c98a3a', camiseta: C.amarillo, peinado: 'coleta', gafas: false },
  { piel: C.piel[1], pelo: '#2b2018', camiseta: C.marea, peinado: 'rizos', gafas: true },
  { piel: C.piel[4], pelo: '#8b8f86', camiseta: '#5fb84a', peinado: 'corto', gafas: true },
  { piel: C.piel[0], pelo: '#a3362f', camiseta: C.amarillo, peinado: 'mono', gafas: false },
];

const azar = (a, b) => a + Math.random() * (b - a);
const fmt = n => Math.round(n).toLocaleString('es-ES');
let record = 0;
try { record = +localStorage.getItem('seguimos-mani') || 0; } catch { /* sin almacenamiento */ }

// ---------- Personajes ----------
function extremidad(ctx, x, y, a1, a2, l1, l2, color, grosor) {
  const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1;
  const fx = kx + Math.sin(a2) * l2, fy = ky + Math.cos(a2) * l2;
  for (const [c, g] of [[C.honda, grosor + 3], [color, grosor]]) {
    ctx.strokeStyle = c; ctx.lineWidth = g;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
  }
  return [fx, fy];
}
// La profe, con los pies en (x, y). fase: ciclo de carrera; aire: está saltando; mareo: ha chocado.
function profe(ctx, x, y, fase, aire, asp, mareo = false) {
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const s = Math.sin(fase), c2 = Math.cos(fase);
  const bote = aire ? 0 : Math.abs(Math.sin(fase)) * 2.5;
  ctx.translate(0, -bote);
  // Pierna de atrás, brazo de atrás.
  const piernas = aire ? [[0.9, -0.2], [-0.5, -1.4]] : [[s * 0.75, s * 0.75 - Math.max(0, c2) * 1.1], [-s * 0.75, -s * 0.75 - Math.max(0, -c2) * 1.1]];
  const pie = (px, py) => { ctx.fillStyle = C.honda; ctx.beginPath(); ctx.ellipse(px + 2.5, py + 1, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); };
  pie(...extremidad(ctx, -2, -26, piernas[1][0], piernas[1][1], 12, 12, '#2e3d55', 5.5));
  extremidad(ctx, -1, -44, aire ? -2.4 : -s * 0.9, aire ? -2.0 : -s * 0.9 + 1.2, 9, 9, asp.piel, 4.2);
  // Bolsa de tela colgada del hombro.
  ctx.strokeStyle = C.honda; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(3, -46); ctx.lineTo(-10, -30); ctx.stroke();
  ctx.fillStyle = C.papel; ctx.beginPath(); ctx.roundRect(-17, -32, 12, 13, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.marea; ctx.beginPath(); ctx.arc(-11, -25.5, 2.6, 0, Math.PI * 2); ctx.fill();
  // Cuerpo: camiseta verde.
  ctx.fillStyle = asp.camiseta; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.roundRect(-9, -50, 18, 27, 7); ctx.fill(); ctx.stroke();
  // Pierna de delante.
  pie(...extremidad(ctx, 2, -26, piernas[0][0], piernas[0][1], 12, 12, '#34465f', 5.5));
  // Cabeza.
  ctx.fillStyle = asp.piel; ctx.beginPath(); ctx.arc(2, -60, 9.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = asp.pelo;
  if (asp.peinado === 'rizos') {
    for (const [a, b, r] of [[-6, -66, 5], [-1, -70, 5.5], [5, -69, 5], [-8, -60, 4.5], [-6, -54, 4]]) { ctx.beginPath(); ctx.arc(a, b, r, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.arc(1, -61, 10, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(6, -66, -2, -62); ctx.quadraticCurveTo(-6, -56, -8, -52); ctx.closePath(); ctx.fill();
    if (asp.peinado === 'mono') {
      ctx.beginPath(); ctx.arc(-7, -69, 5.5, 0, Math.PI * 2); ctx.fill();
      // El lápiz clavado en el moño.
      ctx.strokeStyle = C.amarillo; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-14, -74); ctx.lineTo(-1, -65); ctx.stroke();
      ctx.strokeStyle = C.margen; ctx.beginPath(); ctx.moveTo(-14, -74); ctx.lineTo(-12.5, -73); ctx.stroke();
      ctx.strokeStyle = C.honda;
    }
    if (asp.peinado === 'coleta') { ctx.beginPath(); ctx.ellipse(-11, -60 + s * 1.5, 6, 3.5, -0.4 + s * 0.3, 0, Math.PI * 2); ctx.fill(); }
  }
  // Cara.
  ctx.fillStyle = C.honda;
  if (mareo) {
    ctx.lineWidth = 1.4;
    for (const ox of [4, 9]) { ctx.beginPath(); ctx.moveTo(ox - 1.6, -62); ctx.lineTo(ox + 1.6, -59); ctx.moveTo(ox + 1.6, -62); ctx.lineTo(ox - 1.6, -59); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(7, -54.5, 1.8, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(8, -60.5, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(7, -56, 2.6, 0.2, Math.PI - 0.6); ctx.stroke();
    ctx.fillStyle = '#f19c9c'; ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(4, -55.5, 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  if (asp.gafas) { ctx.strokeStyle = C.honda; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(8.5, -60.5, 3.2, 0, Math.PI * 2); ctx.moveTo(5.3, -61); ctx.lineTo(1, -62); ctx.stroke(); }
  // Brazo de delante.
  ctx.lineWidth = 2.4;
  extremidad(ctx, 1, -45, aire ? 2.6 : s * 0.9, aire ? 2.2 : s * 0.9 + 1.3, 9, 9, asp.piel, 4.2);
  ctx.restore();
}

// ---------- Obstáculos ----------
function etiqueta(ctx, texto, x, y) {
  ctx.font = '400 13px Marker, sans-serif'; ctx.textAlign = 'center';
  const w = ctx.measureText(texto).width + 10;
  ctx.fillStyle = '#ffffffd9'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 13, w, 17, 5); ctx.fill();
  ctx.fillStyle = C.margen; ctx.fillText(texto, x, y); ctx.textAlign = 'left';
}
function dibujaObstaculo(ctx, o, t) {
  const x = o.x, base = SUELO - o.y;
  ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = C.honda; ctx.lineWidth = 2.2;
  if (o.tipo === 'papeles') {
    for (let k = 0; k < o.pilas; k++) {
      const px = x + k * 30;
      const alto = o.altos[k];
      for (let i = 0; i < alto; i += 6) {
        ctx.fillStyle = i % 12 ? C.papel : '#fffdf4';
        const d = Math.sin(i * 1.7 + k) * 2.5;
        ctx.beginPath(); ctx.rect(px + d, base - i - 6, 27, 6); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = C.margen; ctx.save(); ctx.translate(px + 14, base - alto - 2); ctx.rotate(-0.25);
      ctx.font = '800 7px Bricolage, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('URGENTE', 0, 0); ctx.restore();
    }
    etiqueta(ctx, 'Burocracia', x + o.w / 2, base - o.h - 20);
  } else if (o.tipo === 'reloj') {
    const tiembla = Math.sin(t * 40) * 1.5;
    ctx.translate(x + 15 + tiembla, base - 16);
    ctx.fillStyle = C.margen;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 9, -12, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(-11, 17); ctx.moveTo(8, 12); ctx.lineTo(11, 17); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.papel; ctx.beginPath(); ctx.arc(0, 0, 10.5, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 6) * 6, Math.sin(t * 6) * 6); ctx.stroke();
    ctx.restore(); ctx.save();
    etiqueta(ctx, 'Sin tiempo', x + 15, base - o.h - 14);
  } else if (o.tipo === 'nube') {
    const fy = base - o.h / 2 + Math.sin(t * 3 + o.x * 0.01) * 3;
    ctx.fillStyle = '#7c867f';
    for (const [dx, dy, r] of [[14, 2, 13], [30, -6, 16], [48, 1, 13], [60, 5, 10], [6, 8, 9]]) { ctx.beginPath(); ctx.arc(x + dx, fy + dy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#3d4741'; ctx.lineWidth = 1.6;
    ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(x + 18 + i * 13, fy + 1); ctx.bezierCurveTo(x + 24 + i * 13, fy - 8, x + 12 + i * 13, fy + 8, x + 22 + i * 13, fy - 2); } ctx.stroke();
    ctx.fillStyle = C.amarillo; ctx.strokeStyle = C.honda; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x + 34, fy + 14); ctx.lineTo(x + 28, fy + 26); ctx.lineTo(x + 33, fy + 25); ctx.lineTo(x + 29, fy + 36); ctx.lineTo(x + 40, fy + 21); ctx.lineTo(x + 35, fy + 22); ctx.closePath(); ctx.fill(); ctx.stroke();
    etiqueta(ctx, 'Agobio', x + 34, fy - 26);
  } else if (o.tipo === 'avion') {
    const fy = base - 8 + Math.sin(t * 9 + o.x) * 2;
    ctx.fillStyle = C.papel;
    ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(x + 34, fy - 9); ctx.lineTo(x + 8, fy + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#dfe6da'; ctx.beginPath(); ctx.moveTo(x + 8, fy + 2); ctx.lineTo(x + 34, fy - 9); ctx.lineTo(x + 12, fy + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#0f352255'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x + 36, fy - 6); ctx.lineTo(x + 60, fy - 4); ctx.stroke(); ctx.setLineDash([]);
    etiqueta(ctx, 'Correo urgente', x + 18, fy - 16);
  } else if (o.tipo === 'foto') {
    ctx.fillStyle = '#c9cfc9'; ctx.beginPath(); ctx.roundRect(x, base - 40, 58, 40, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8ece6'; ctx.beginPath(); ctx.roundRect(x - 3, base - 50, 64, 11, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.honda; ctx.fillRect(x + 8, base - 30, 22, 6);
    ctx.fillStyle = Math.sin(t * 10) > 0 ? C.margen : '#7a2734'; ctx.beginPath(); ctx.arc(x + 46, base - 27, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Folio arrugado asomando.
    ctx.fillStyle = C.papel; ctx.beginPath(); ctx.moveTo(x + 60, base - 22); ctx.lineTo(x + 70, base - 28); ctx.lineTo(x + 66, base - 16); ctx.lineTo(x + 72, base - 12); ctx.lineTo(x + 60, base - 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    etiqueta(ctx, 'Fotocopiadora', x + 29, base - 58);
  } else if (o.tipo === 'chapa') {
    const fy = base - 11 + Math.sin(t * 5 + o.x * 0.02) * 3;
    ctx.fillStyle = C.pizarra; ctx.beginPath(); ctx.arc(x + 11, fy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.translate(x + 11, fy);
    for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = i % 2 ? C.marea : C.papel; ctx.fillRect(-1.2, -9, 2.4, 4.5); }
    ctx.fillStyle = C.marea; ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// Cajas de choque (x, alto sobre el suelo, ancho, alto), algo más pequeñas que el dibujo.
function caja(o) {
  switch (o.tipo) {
    case 'papeles': return [o.x + 3, o.y, o.w - 6, o.h - 3];
    case 'reloj': return [o.x + 3, 0, 24, 30];
    case 'nube': return [o.x + 6, o.y + 4, 56, o.h - 10];
    case 'avion': return [o.x + 2, o.y, 30, 12];
    case 'foto': return [o.x + 3, 0, 56, 46];
    case 'chapa': return [o.x - 2, o.y - 2, 26, 26];
  }
}

// ---------- Fondo ----------
function capa(velocidad, generar) { return { velocidad, items: [], fin: 0, generar }; }
function avanzaCapa(cp, dx, ancho) {
  for (const it of cp.items) it.x -= dx * cp.velocidad;
  cp.items = cp.items.filter(it => it.x + it.w > -40);
  let ult = cp.items.length ? cp.items[cp.items.length - 1] : null;
  while (!ult || ult.x + ult.w < ancho + 60) { const it = cp.generar(ult ? ult.x + ult.w : -20); cp.items.push(it); ult = it; }
}
const lejanos = () => capa(0.12, x => {
  const r = Math.random();
  return { x: x + azar(0, 10), w: azar(40, 90), h: azar(60, 130), forma: r < 0.15 ? 'cupula' : r < 0.3 ? 'torre' : 'plano' };
});
const edificios = () => capa(0.35, x => ({ x: x + azar(4, 16), w: azar(70, 120), h: azar(110, 170), color: Math.random() < 0.5 ? C.fachada : C.fachada2, bandera: Math.random() < 0.45, plantas: 0 }));
const calle = () => capa(1, x => {
  const r = Math.random();
  return { x: x + azar(90, 220), w: 30, tipo: r < 0.55 ? 'arbol' : r < 0.85 ? 'farola' : 'banco' };
});

function dibujaFondo(ctx, W, mundo, t) {
  const cielo = ctx.createLinearGradient(0, 0, 0, SUELO);
  cielo.addColorStop(0, '#dcefd0'); cielo.addColorStop(1, C.papel);
  ctx.fillStyle = cielo; ctx.fillRect(0, 0, W, SUELO);
  ctx.fillStyle = C.amarillo; ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(W - 60, 58, 26, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  // Siluetas lejanas de Madrid.
  ctx.fillStyle = C.lejos;
  for (const b of mundo.lejos.items) {
    const y = SUELO - 30 - b.h;
    ctx.fillRect(b.x, y, b.w, b.h + 30);
    if (b.forma === 'cupula') { ctx.beginPath(); ctx.arc(b.x + b.w / 2, y, b.w * 0.32, Math.PI, 0); ctx.fill(); ctx.fillRect(b.x + b.w / 2 - 1.5, y - b.w * 0.32 - 14, 3, 14); }
    if (b.forma === 'torre') ctx.fillRect(b.x + b.w * 0.35, y - 26, b.w * 0.3, 26);
  }
  // Fachadas con balcones y banderas verdes.
  for (const b of mundo.cerca.items) {
    const y = SUELO - b.h;
    ctx.fillStyle = b.color; ctx.strokeStyle = '#0f352233'; ctx.lineWidth = 1;
    ctx.fillRect(b.x, y, b.w, b.h); ctx.strokeRect(b.x + .5, y + .5, b.w - 1, b.h);
    ctx.fillStyle = '#0f35221a'; ctx.fillRect(b.x - 2, y - 6, b.w + 4, 7);
    const cols = Math.max(2, Math.floor(b.w / 30));
    for (let fila = 0; fila < 4; fila++) for (let k = 0; k < cols; k++) {
      const wx = b.x + 10 + k * ((b.w - 20) / cols) + 2, wy = y + 14 + fila * 34;
      if (wy > SUELO - 30) continue;
      ctx.fillStyle = C.ventana; ctx.fillRect(wx, wy, 12, 18);
      ctx.fillStyle = '#0f352244'; ctx.fillRect(wx - 3, wy + 18, 18, 2.5);
      if (b.bandera && fila === 1 && k === 0) {
        const ond = Math.sin(t * 3 + b.x * 0.05) * 1.5;
        ctx.fillStyle = C.marea; ctx.beginPath(); ctx.moveTo(wx - 2, wy + 20); ctx.lineTo(wx + 16, wy + 20); ctx.lineTo(wx + 15 + ond, wy + 40); ctx.lineTo(wx - 1 + ond, wy + 40); ctx.closePath(); ctx.fill();
      }
    }
  }
  // Acera y calzada.
  ctx.fillStyle = C.asfalto; ctx.fillRect(0, SUELO, W, H - SUELO);
  ctx.fillStyle = C.bordillo; ctx.fillRect(0, SUELO + 30, W, 5);
  ctx.fillStyle = '#c3c8b8'; ctx.fillRect(0, SUELO + 35, W, H - SUELO - 35);
  ctx.strokeStyle = '#0f35221f'; ctx.lineWidth = 1;
  const off = mundo.dist % 34;
  ctx.beginPath();
  for (let x = -off; x < W; x += 34) { ctx.moveTo(x, SUELO); ctx.lineTo(x - 8, SUELO + 30); }
  ctx.moveTo(0, SUELO + 15); ctx.lineTo(W, SUELO + 15);
  ctx.stroke();
  ctx.strokeStyle = C.papel; ctx.lineWidth = 3; ctx.setLineDash([22, 18]); ctx.lineDashOffset = mundo.dist % 40;
  ctx.beginPath(); ctx.moveTo(0, SUELO + 44); ctx.lineTo(W, SUELO + 44); ctx.stroke(); ctx.setLineDash([]);
  // Árboles, farolas y bancos.
  for (const it of mundo.calle.items) {
    const x = it.x, y = SUELO + 2;
    if (it.tipo === 'arbol') {
      ctx.fillStyle = C.tronco; ctx.fillRect(x + 12, y - 44, 6, 44);
      ctx.fillStyle = C.copa; ctx.globalAlpha = .9;
      for (const [dx, dy, r] of [[15, -58, 20], [3, -50, 13], [27, -50, 13]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else if (it.tipo === 'farola') {
      ctx.fillStyle = C.honda; ctx.fillRect(x + 13, y - 74, 4, 74); ctx.fillRect(x + 9, y - 4, 12, 4);
      ctx.beginPath(); ctx.moveTo(x + 7, y - 74); ctx.lineTo(x + 23, y - 74); ctx.lineTo(x + 19, y - 84); ctx.lineTo(x + 11, y - 84); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = '#5a7a4c'; ctx.fillRect(x, y - 14, 32, 4); ctx.fillRect(x, y - 22, 32, 3);
      ctx.fillStyle = C.honda; ctx.fillRect(x + 3, y - 12, 3, 12); ctx.fillRect(x + 26, y - 12, 3, 12);
    }
  }
}
// Cartel de calle de cada sitio de la ruta.
function dibujaCartel(ctx, x, nombre, ultimo) {
  ctx.fillStyle = C.honda; ctx.fillRect(x - 2, SUELO - 96, 4, 96);
  ctx.font = '800 13px Bricolage, sans-serif';
  const w = Math.max(70, ctx.measureText(nombre).width + 18);
  ctx.fillStyle = ultimo ? C.margen : C.pizarra; ctx.strokeStyle = C.papel; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x - w / 2, SUELO - 126, w, 32, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.papel; ctx.textAlign = 'center';
  ctx.font = '700 9px Atkinson, sans-serif'; ctx.fillText(ultimo ? 'LA MANI ES AQUÍ' : 'MADRID', x, SUELO - 112);
  ctx.font = '800 13px Bricolage, sans-serif'; ctx.fillText(nombre, x, SUELO - 99);
  ctx.textAlign = 'left';
}
// La mani esperando en la Consejería.
function dibujaMani(ctx, x0, t) {
  for (let i = 0; i < 26; i++) {
    const x = x0 + i * 17 + (i % 2) * 6, y = SUELO + (i % 3) * 5 - 2;
    const asp = ASPECTOS[i % ASPECTOS.length];
    ctx.save(); ctx.translate(x, y); ctx.scale(-0.82, 0.82);
    profe(ctx, 0, 0, t * 6 + i, false, asp);
    ctx.restore();
  }
  ctx.save(); ctx.translate(x0 + 40, SUELO - 108 + Math.sin(t * 4) * 2); ctx.rotate(-0.03);
  ctx.fillStyle = C.honda; ctx.fillRect(4, 0, 4, 54); ctx.fillRect(176, 0, 4, 54);
  ctx.fillStyle = C.papel; ctx.strokeStyle = C.honda; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.rect(0, -6, 184, 32); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.pizarra; ctx.font = '400 15px Marker, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('EDUCACIÓN PÚBLICA', 92, 16); ctx.textAlign = 'left';
  ctx.restore();
}

// ---------- El juego ----------
// url: la dirección que se manda al retar a alguien; titulo: false para no pintar la cabecera (página propia).
export function minijuego({ url = URL_JUEGO, titulo = true } = {}) {
  const lienzo = h('canvas.mani-lienzo', { 'aria-label': 'Minijuego: una profe corre hacia la mani esquivando obstáculos. Toca para saltar.', role: 'img' });
  const capaTexto = h('div.mani-capa');
  const marco = h('div.mani-marco', { tabindex: '0' }, lienzo, capaTexto);
  const raiz = h('section.zona.mani-juego', titulo ? { 'aria-labelledby': 'mani-titulo' } : { 'aria-label': 'Minijuego' },
    titulo ? h('p.etiqueta', {}, 'Minijuego') : null,
    titulo ? h('h2', { id: 'mani-titulo' }, 'Acompaña a una profe a la próxima mani') : null,
    h('p.enunciado', {}, 'De Atocha a la Consejería. Toca para saltar; si mantienes el dedo, salta más alto. Esquiva la burocracia, la falta de tiempo y el agobio. Cada chapa verde suma una compañera que te cubre de un golpe.'),
    marco);
  const ctx = lienzo.getContext('2d');
  let W = 360, dpr = 1;
  let estado = 'inicio', ultimoT = 0, reloj = 0, raf = 0, visible = true;
  let mundo, jugadora, obstaculos, companeras, rastro, chispas, sacudida, mareada, finEn;

  function reinicia() {
    mundo = { dist: 0, vel: 320, sigObst: 500, lejos: lejanos(), cerca: edificios(), calle: calle() };
    for (const cp of [mundo.lejos, mundo.cerca, mundo.calle]) avanzaCapa(cp, 0, W);
    jugadora = { x: Math.min(124, W * 0.34), y: 0, vy: 0, aire: false, pulsa: false, tPulsa: 0, fase: 0, golpe: 0 };
    obstaculos = []; companeras = []; rastro = []; chispas = []; sacudida = 0; mareada = false; finEn = 0;
  }
  function mide() {
    W = Math.max(280, Math.round(marco.clientWidth || 360));
    dpr = Math.min(2.5, window.devicePixelRatio || 1);
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    lienzo.style.height = `${H}px`;
    if (estado !== 'jugando') { reinicia(); pinta(0); }
  }

  // ---- Entrada ----
  const empieza = () => {
    if (estado === 'jugando') return;
    reinicia(); estado = 'jugando'; capaTexto.hidden = true; ultimoT = performance.now(); bucle(ultimoT);
  };
  const salta = () => {
    if (estado !== 'jugando') return;
    jugadora.pulsa = true;
    if (!jugadora.aire) { jugadora.vy = SALTO; jugadora.aire = true; jugadora.tPulsa = 0; }
  };
  const suelta = () => { if (jugadora) jugadora.pulsa = false; };
  marco.addEventListener('pointerdown', e => { if (e.target.closest('button, a')) return; e.preventDefault(); if (estado === 'jugando') salta(); else if (estado === 'inicio') empieza(); });
  marco.addEventListener('pointerup', suelta); marco.addEventListener('pointercancel', suelta); marco.addEventListener('pointerleave', suelta);
  marco.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); if (estado === 'jugando') salta(); else if (!e.repeat) empieza(); }
  });
  marco.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') suelta(); });

  // ---- Lógica ----
  function nuevoObstaculo() {
    const m = mundo.dist / PX_M;
    const tipos = ['papeles', 'papeles', 'reloj'];
    if (m > 150) tipos.push('avion');
    if (m > 300) tipos.push('nube', 'nube');
    if (m > 600) tipos.push('foto', 'papeles');
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const x = W + 30;
    let o;
    if (tipo === 'papeles') {
      const pilas = m > 400 && Math.random() < 0.35 ? 2 : 1;
      const altos = Array.from({ length: pilas }, () => [24, 36, 48][Math.floor(Math.random() * (m > 250 ? 3 : 2))]);
      o = { tipo, x, y: 0, pilas, altos, w: pilas * 30, h: Math.max(...altos) };
    } else if (tipo === 'reloj') o = { tipo, x, y: 0, w: 30, h: 30 };
    else if (tipo === 'nube') o = { tipo, x, y: 74, w: 70, h: 36 };
    else if (tipo === 'avion') o = { tipo, x, y: 14, w: 34, h: 14, extra: 110 };
    else o = { tipo, x, y: 0, w: 60, h: 50 };
    obstaculos.push(o);
    // A veces, una chapa en el aire.
    if (Math.random() < 0.3 && companeras.length < 5) obstaculos.push({ tipo: 'chapa', x: x + o.w + azar(90, 160), y: Math.random() < 0.5 ? 92 : 20, w: 22, h: 22 });
    const airTime = 2 * SALTO / G;
    mundo.sigObst = mundo.vel * airTime + o.w + azar(110, 120 + mundo.vel * 0.9);
  }
  function choca(a, b) { return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1]; }
  function paso(dt) {
    reloj += dt;
    const llegando = mundo.dist / PX_M >= META;
    if (estado === 'jugando' && !llegando) mundo.vel = Math.min(780, mundo.vel + dt * 9);
    if (llegando) mundo.vel = Math.max(0, mundo.vel - dt * 420);
    const dx = mundo.vel * dt;
    mundo.dist += dx;
    for (const cp of [mundo.lejos, mundo.cerca, mundo.calle]) avanzaCapa(cp, dx, W);
    // Saltos con altura variable: mientras se mantiene, la gravedad tira menos.
    const j = jugadora;
    if (j.aire) {
      j.tPulsa += dt;
      const g = j.pulsa && j.tPulsa < 0.15 && j.vy > 0 ? G * 0.6 : G;
      j.vy -= g * dt; j.y += j.vy * dt;
      if (j.y <= 0) { j.y = 0; j.vy = 0; j.aire = false; }
    }
    j.fase += dt * (6 + mundo.vel / 60);
    if (j.golpe > 0) j.golpe -= dt;
    rastro.unshift(j.y); rastro.length = Math.min(rastro.length, 90);
    // Obstáculos.
    if (estado === 'jugando' && !llegando && mundo.dist / PX_M < META - 40) {
      mundo.sigObst -= dx;
      if (mundo.sigObst <= 0) nuevoObstaculo();
    }
    for (const o of obstaculos) o.x -= dx + (o.extra || 0) * dt;
    obstaculos = obstaculos.filter(o => o.x + o.w > -60 && !o.cogida);
    if (estado === 'jugando') {
      const cuerpo = [j.x - 9, j.y + 2, 20, 62];
      for (const o of obstaculos) {
        if (!choca(cuerpo, caja(o))) continue;
        if (o.tipo === 'chapa') { o.cogida = true; companeras.push({ asp: ASPECTOS[(companeras.length + 1) % ASPECTOS.length] }); estalla(o.x + 11, SUELO - o.y - 11, C.marea); continue; }
        if (j.golpe > 0) continue;
        if (companeras.length) {
          // Una compañera se lleva el golpe y la profe sigue.
          companeras.pop(); j.golpe = 1.2; sacudida = 0.25; estalla(j.x, SUELO - 40, C.amarillo); o.x = -999;
        } else { termina(o.tipo); return; }
      }
      if (llegando && mundo.vel === 0 && !finEn) { finEn = reloj + 1.1; estalla(j.x + 60, SUELO - 90, C.marea); estalla(j.x + 140, SUELO - 100, C.amarillo); }
      if (finEn && reloj > finEn) llega();
    }
    for (const p of chispas) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.vida -= dt; }
    chispas = chispas.filter(p => p.vida > 0);
    if (sacudida > 0) sacudida -= dt;
  }
  function estalla(x, y, color) {
    for (let i = 0; i < 14; i++) chispas.push({ x, y, vx: azar(-160, 160), vy: azar(-260, -60), vida: azar(0.4, 0.8), color: i % 2 ? color : C.papel });
  }

  // ---- Dibujo ----
  function pinta(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (sacudida > 0) ctx.translate(azar(-3, 3), azar(-3, 3));
    dibujaFondo(ctx, W, mundo, reloj);
    const j = jugadora;
    // Carteles de la ruta.
    RUTA.forEach((r, i) => {
      const x = r.m * PX_M - mundo.dist + j.x + (i === RUTA.length - 1 ? 30 : 0);
      if (x > -80 && x < W + 80 && r.m > 0) dibujaCartel(ctx, x, r.nombre, i === RUTA.length - 1);
    });
    const xMani = META * PX_M - mundo.dist + j.x + 80;
    if (xMani < W + 40) dibujaMani(ctx, xMani, reloj);
    for (const o of obstaculos) dibujaObstaculo(ctx, o, reloj);
    // Compañeras, que repiten los saltos de la profe con un poco de retraso.
    companeras.forEach((c, i) => {
      const y = rastro[Math.min(rastro.length - 1, (i + 1) * 7)] || 0;
      profe(ctx, j.x - 20 * (i + 1), SUELO - y, j.fase - (i + 1) * 0.9, y > 1, c.asp);
    });
    if (!(j.golpe > 0 && Math.floor(reloj * 14) % 2)) profe(ctx, j.x, SUELO - j.y, j.fase, j.aire, ASPECTOS[0], mareada);
    for (const p of chispas) { ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, p.vida * 2); ctx.fillRect(p.x, p.y, 4, 4); }
    ctx.globalAlpha = 1;
    // Marcador y ruta.
    const m = Math.min(META, mundo.dist / PX_M);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = C.honda; ctx.font = '800 15px Bricolage, sans-serif';
    ctx.fillText(`${fmt(m)} m`, 12, 24);
    ctx.font = '700 12px Atkinson, sans-serif'; ctx.fillStyle = '#0f3522aa';
    ctx.fillText(record ? `Récord: ${fmt(record)} m` : `Hasta la Consejería: ${fmt(META)} m`, 12, 40);
    const x0 = W * 0.42, x1 = W - 16, yb = 20;
    ctx.strokeStyle = '#0f352244'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
    ctx.strokeStyle = C.marea; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x0 + (x1 - x0) * m / META, yb); ctx.stroke();
    RUTA.forEach((r, i) => { const x = x0 + (x1 - x0) * r.m / META; ctx.fillStyle = m >= r.m ? C.pizarra : C.papel; ctx.strokeStyle = C.honda; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, yb, i === RUTA.length - 1 ? 5 : 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    const prox = RUTA.find(r => r.m > m);
    ctx.font = '700 11px Atkinson, sans-serif'; ctx.fillStyle = C.honda; ctx.textAlign = 'right';
    ctx.fillText(prox ? `Próxima parada: ${prox.nombre}` : '¡En la mani!', x1, yb + 18);
    ctx.textAlign = 'left';
    for (let i = 0; i < companeras.length; i++) { ctx.fillStyle = C.marea; ctx.strokeStyle = C.honda; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(18 + i * 15, 56, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  }
  function bucle(ahora) {
    cancelAnimationFrame(raf);
    const dt = Math.min(0.05, (ahora - ultimoT) / 1000 || 0);
    ultimoT = ahora;
    if (visible && estado === 'jugando') paso(dt);
    pinta(dt);
    if (estado === 'jugando' && raiz.isConnected) raf = requestAnimationFrame(bucle);
  }

  // ---- Pantallas ----
  function guardaRecord(m) {
    if (m > record) { record = m; try { localStorage.setItem('seguimos-mani', String(Math.round(m))); } catch { /* nada */ } return true; }
    return false;
  }
  function textoCompartir(m, llego) {
    return llego
      ? `He llevado a una profe de Atocha a la mani de la Consejería con ${companeras.length} ${companeras.length === 1 ? 'compañera' : 'compañeras'}. ¿Llegas tú? 👉 ${url}`
      : `He acompañado a una profe ${fmt(m)} metros camino de la mani, esquivando burocracia y agobio. ¿Llegas más lejos? 👉 ${url}`;
  }
  function pantalla(titulo, texto, extra, compartir) {
    capaTexto.replaceChildren(...[
      h('p.mani-titulo', {}, titulo),
      texto ? h('p', {}, texto) : null,
      extra ? h('p.mani-extra', {}, extra) : null,
      h('div.botones', {},
        h('button.boton', { type: 'button', onclick: e => { e.stopPropagation(); empieza(); marco.focus(); } }, estado === 'inicio' ? '¡A la mani!' : 'Otra vez'),
        compartir ? h('a.boton.amarillo', { href: `https://wa.me/?text=${encodeURIComponent(compartir)}`, target: '_blank', rel: 'noopener' }, 'Retar por WhatsApp') : null)].filter(Boolean));
    capaTexto.hidden = false;
  }
  function termina(tipo) {
    estado = 'fin'; sacudida = 0.3; mareada = true;
    const m = mundo.dist / PX_M;
    const nuevo = guardaRecord(m);
    pinta(0);
    const falta = META - m;
    pantalla(CHOQUES[tipo] || '¡Uf!', `Te has quedado a ${fmt(falta)} m de la Consejería.`, nuevo ? `¡Nuevo récord: ${fmt(m)} m! Pero mañana, seguimos.` : 'Pero mañana, seguimos.', textoCompartir(m, false));
  }
  function llega() {
    estado = 'fin';
    guardaRecord(META);
    pantalla('¡Has llegado a la mani!', `De Atocha a la Consejería con ${companeras.length} ${companeras.length === 1 ? 'compañera' : 'compañeras'}.`, companeras.length >= 3 ? 'Ninguna huelga se gana sola.' : 'La próxima vez, recoge más chapas: juntas se llega mejor.', textoCompartir(META, true));
  }

  // ---- Arranque ----
  if (new URLSearchParams(location.search).has('prueba')) window.__mani = () => ({ obstaculos, jugadora, mundo, estado, companeras: companeras.length });
  new ResizeObserver(() => mide()).observe(marco);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(marco);
  document.addEventListener('visibilitychange', () => { if (document.hidden && estado === 'jugando') visible = false; else visible = true; });
  reinicia();
  pantalla('¿Llegas a la mani?', 'Toca para saltar. Mantén para saltar más alto.', null, null);
  document.fonts?.ready.then(() => { if (estado !== 'jugando') pinta(0); });
  return raiz;
}
