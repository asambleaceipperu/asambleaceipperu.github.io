// Modo Aula (v2): «Traza el recorrido». Con el dedo dibujas en tiza el camino de tu profe; al soltar,
// lo recorre y ayuda a cada mano levantada por la que pasa. La tiza es tu tiempo: sin horas para
// preparar, se acaba enseguida. Lo que pide la huelga cambia el aula: cuántos pupitres hay, cuánta tiza
// tienes, si los papeles se amontonan, si hay apoyos, si hace calor y si te reparten alumnado.
import { TAU, clamp, lerp, damp, ease, rr, circulo, elipse, sombra, fuentes, azar, alfa, mezcla } from './util.js';
import { dibujaPersona, personaAzar, PROFES, conCamisetaVerde } from './personajes.js';
import { icono, NECESIDADES } from './iconos.js';
import { C, crearParticulas, aparece } from './ui.js';
import { crearPolvo, etalonar, crearSacudida, destello } from './fx.js';
import { REIVINDICACIONES, ACTUAL } from './datos.js';

const DIAS = [
  { titulo: 'LUNES 13-O', sub: '5.ª hora seguida · 2.º de Primaria', dur: 42 },
  { titulo: '¿Y SI…?', sub: 'La misma clase, con lo que llevaste a la mani', dur: 38 },
  { titulo: 'LA CLASE QUE QUEREMOS', sub: 'Todo lo que has llevado, a la vez', dur: 34 },
];
const RADIO_AYUDA = 36; // en unidades de suelo
const FONDO = 360; // profundidad del aula
const PROF = 1.4; // cuánto más lejos está el fondo que la primera fila

export function escenaAula(juego, { dia = 0 }) {
  const { W } = juego;
  const est = juego.estado;
  const r = azar(1234 + dia * 77);
  const part = crearParticulas();
  const sacudida = crearSacudida(juego.reducido);
  const elegidas = dia === 0 ? [] : dia === 1 ? est.elegidas.slice(0, 2) : est.elegidas.slice(0, 4);
  const cfg = Object.fromEntries(['ratios', 'horas', 'burocracia', 'apoyos', 'infra', 'sueldo'].map(id => [id, elegidas.includes(id)]));
  const D = DIAS[dia];
  let H = juego.H;

  // ---------- Perspectiva del aula ----------
  // Suelo en coordenadas (fx lateral, fy profundidad: 0 primera fila, 360 pared del fondo).
  const P = {};
  function disponer() {
    H = juego.H;
    P.yFrente = H - 150; P.yFondo = 226;
    P.K = (P.yFrente - P.yFondo) / (1 - 1 / PROF);
    P.yh = P.yFrente - P.K;
    P.kx = (W / 2 - 4) / 190;
    P.techo = 66;
  }
  disponer();
  const zDe = fy => 1 + (fy / FONDO) * (PROF - 1);
  const aPantalla = (fx, fy) => { const z = zDe(fy); return [W / 2 + (fx * P.kx) / z, P.yh + P.K / z, 1.22 / z]; };
  const aSuelo = (sx, sy) => { const z = P.K / Math.max(1, sy - P.yh); return [((sx - W / 2) * z) / P.kx, ((z - 1) / (PROF - 1)) * FONDO]; };
  const LIM = { x0: -182, x1: 182, y0: -80, y1: FONDO - 18 };
  const MESA = { fx: -126, fy: -52 };
  const PUERTA = { fx: 150, fy: FONDO - 10 };

  // ---------- Alumnado ----------
  const ninos = [];
  function nuevoNino(fx, fy, extra = {}) {
    const p = personaAzar(r, 'niño');
    p.semilla = r() * 3;
    const n = { fx, fy, p, estado: 'quieto', t: r() * 2, cool: 1.5 + r() * 4, paciencia: 0, prog: 0, necesidad: null, encendido: false, brillo: 0, especial: null, reparto: false, entra: 1, ...extra };
    ninos.push(n);
    return n;
  }
  {
    const cols = [-152, -76, 0, 76, 152];
    const filas = cfg.ratios ? [55, 170, 285] : [35, 105, 175, 245, 315];
    for (const fy of filas) for (const fx of cols) nuevoNino(fx + (cfg.ratios ? 0 : r() * 6 - 3), fy);
    const a = ninos[6], b = ninos[7];
    a.especial = 'enlace'; a.p = { ...a.p, piel: '#b47a55', peinado: 'largo', pelo: '#2a1c14', ropa: '#e9a23b' };
    b.especial = 'pictos';
  }

  // ---------- Profe, tiza y camino ----------
  const persona = PROFES[est.profe || 0];
  const profe = { p: dia === 0 ? persona : conCamisetaVerde(persona), fx: 0, fy: -45, paso: 0, vx: 0, vy: 0, quieta: 0, bostezo: 0, proxBostezo: 8, ayudando: null, mira: 0 };
  const TIZA_MAX = cfg.horas ? 980 : 520;
  const RECARGA = cfg.horas ? 300 : 100;
  const VEL = cfg.horas ? 520 : 340;
  let tiza = TIZA_MAX;
  let camino = []; // puntos de suelo que la profe recorrerá
  let trazando = null; // camino en construcción
  let combo = 0, mejorCombo = 0, comboT = 0;
  let destellos = [];

  // ---------- Papeles, calor, visitas ----------
  const papeles = { pila: cfg.burocracia ? 0 : 2, suelo: [], vuelan: [], prox: 3.5, total: 0, proceso: 0 };
  let temp = cfg.infra ? 23 : 27.5;
  const visitas = [];
  let adminProx = 3;
  const polvo = crearPolvo(40, { x: 0, y: 70, w: W * 0.8, h: H - 200 });

  // ---------- Eventos de la clase ----------
  const eventos = [];
  if (dia === 0) eventos.push({ t: 9, id: 'burocracia' }, { t: 17, id: 'sueldo' }, { t: 25, id: 'infra' });
  else {
    const malos = ['burocracia', 'sueldo', 'infra'].filter(id => !cfg[id]);
    malos.forEach((id, i) => eventos.push({ t: 10 + i * 9, id }));
    if (cfg.apoyos) eventos.push({ t: 1.5, id: 'apoyosBien' });
    if (cfg.infra && dia === 1) eventos.push({ t: 4, id: 'infraBien' });
  }
  let rotuloActual = null;
  const decir = (txt, sub, color = C.amarillo) => { rotuloActual = { t: 0, txt, sub, color }; };
  function lanzarEvento(e) {
    if (e.id === 'burocracia') { papeles.pila += 3; papeles.total += 3; decir('RAÍCES: 3 FORMULARIOS URGENTES', 'Llévalos a la mesa o el montón se caerá', '#ffb3b3'); juego.audio.sfx('papel'); sacudida.golpe(3); }
    if (e.id === 'sueldo') { iniciarReparto(); decir('TE REPARTEN 3 DE 4.º B', 'Su tutora se fue y no hay sustituto', '#ffb3b3'); sacudida.golpe(5); }
    if (e.id === 'infra') { temp = Math.max(temp, 32); decir('¡OLA DE CALOR!', 'Barracón a 33 °C: hay quien se duerme', '#ffcf8a'); juego.audio.sfx('bostezo'); sacudida.golpe(4); }
    if (e.id === 'apoyosBien') { visitas.push(crearVisita('apoyo')); decir('¡ENTRA LA PROFE DE APOYO!', 'Para Amina y Leo', C.marea); juego.audio.sfx('puerta'); }
    if (e.id === 'infraBien') { visitas.push({ tipo: 'operarios', fx: -230, fy: FONDO - 30, t: 0 }); decir('ADIÓS, URALITA', 'Aula climatizada y sin amianto', C.marea); }
  }

  function crearVisita(tipo) {
    if (tipo === 'apoyo') {
      const a = ninos.find(n => n.especial === 'enlace'), b = ninos.find(n => n.especial === 'pictos');
      return { tipo, p: { edad: 'adulto', piel: '#d29a74', peinado: 'moño', pelo: '#6f4426', ropa: '#7fb7e8', pantalon: '#2f3e57', gafas: true, semilla: 1.3 }, fx: PUERTA.fx, fy: PUERTA.fy, dx: (a.fx + b.fx) / 2, dy: a.fy - 26, fase: 'llega', paso: 0, t: 0 };
    }
    return { tipo: 'admin', p: { edad: 'adulto', piel: '#f6d5bd', peinado: 'corto', pelo: '#46301f', ropa: '#c96f9e', pantalon: '#3b3b3b', semilla: 2.1 }, fx: PUERTA.fx, fy: PUERTA.fy, dx: MESA.fx + 40, dy: MESA.fy + 20, fase: 'llega', paso: 0, t: 0, carga: 0 };
  }
  function iniciarReparto() {
    juego.audio.sfx('puerta');
    for (const [fx, fy] of [[-186, 140], [186, 210], [-186, 280]]) {
      const n = nuevoNino(fx, fy, { reparto: true, entra: 0, desde: [PUERTA.fx, PUERTA.fy] });
      n.cool = 2;
    }
  }

  // ---------- Estado ----------
  let fase = 'intro'; // intro → juego → fin
  let tf = 0, reloj = 0;
  let llegados = 0, bombillas = 0, perdidas = 0;
  let resumen = null;
  let tutorial = dia === 0 ? 0 : 99;

  const invCalor = () => (cfg.infra ? 0 : clamp((temp - 28) / 5, 0, 1));
  const distSuelo = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  // ---------- Manos ----------
  // Las manos llegan en oleadas («¡profe!, ¡profe!»): para llegar a todas hay que encadenarlas en un trazo.
  let proxOla = 1.2;
  function levantar(n) {
    n.estado = 'mano'; n.t = 0; n.prog = 0;
    n.necesidad = n.especial === 'enlace' ? 'alfabeto' : n.especial === 'pictos' ? 'pictos' : r.uno(NECESIDADES);
    n.paciencia = n.paciencia0 = n.especial && !cfg.apoyos ? 11 : 5.6;
  }
  function levantarManos(dt) {
    proxOla -= dt;
    if (proxOla > 0) return;
    proxOla = 3.4 + r() * 1.2;
    const quietos = ninos.filter(n => n.estado === 'quieto' && n.cool <= 0 && n.entra >= 1);
    // Primero quien todavía no ha recibido ayuda.
    quietos.sort((a, b) => (a.encendido - b.encendido) || r() - 0.5);
    const tam = Math.max(3, Math.round(ninos.length * 0.19 + (r() - 0.5) * 1.5));
    quietos.slice(0, tam).forEach((n, i) => { n.retraso = i * 0.12; levantar(n); });
    juego.audio.sfx('toque');
  }
  function actualizarNinos(dt) {
    const calor = invCalor();
    for (const n of ninos) {
      n.t += dt;
      if (n.entra < 1) { n.entra = Math.min(1, n.entra + dt * 0.7); continue; }
      n.brillo = damp(n.brillo, n.encendido ? 1 : 0, 3, dt);
      if (n.estado === 'quieto') {
        n.cool -= dt;
        // El calor adormece, más cerca de las ventanas (a la izquierda).
        if (calor > 0 && r() < calor * 0.03 * dt * (1.3 - (n.fx + 190) / 380)) { n.estado = 'dormido'; n.t = 0; }
      } else if (n.estado === 'mano') {
        const atendido = profe.ayudando === n || (n.especial && cfg.apoyos && apoyoSentada());
        if (!atendido) n.paciencia -= dt;
        if (n.paciencia <= 0) { n.estado = 'triste'; n.t = 0; perdidas++; juego.audio.sfx('apaga'); }
      } else if (n.estado === 'feliz' && n.t > 1.6) { n.estado = 'quieto'; n.cool = 4 + r() * 5; }
      else if (n.estado === 'triste' && n.t > 3) { n.estado = 'quieto'; n.cool = 2 + r() * 3; }
      else if (n.estado === 'dormido' && n.t > 6) { n.estado = 'quieto'; n.cool = 0.5; }
    }
  }
  const apoyoSentada = () => visitas.some(v => v.tipo === 'apoyo' && v.fase === 'sentada');

  function encender(n, grande = false) {
    n.estado = 'feliz'; n.t = 0; n.prog = 0;
    if (!n.encendido) llegados++;
    n.encendido = true;
    bombillas++;
    combo++; comboT = 1.4;
    mejorCombo = Math.max(mejorCombo, combo);
    juego.audio.sfx(grande ? 'grande' : 'bombilla', { racha: Math.min(combo - 1, 7) });
    const [sx, sy, s] = aPantalla(n.fx, n.fy);
    const by = sy - 70 * s;
    part.añadir({
      vida: 0.8, grande,
      actualizar(p) { const k = ease.inOutCubic(p.t / p.vida); p.x = lerp(sx, W - 150, k); p.y = lerp(by, 30, k) - Math.sin(k * Math.PI) * 60; },
      dibujar(ctx, p) { icono(ctx, 'bombilla', p.x, p.y, (grande ? 30 : 20) * (1 + Math.sin((p.t / p.vida) * Math.PI) * 0.5)); },
    });
    destellos.push({ x: sx, y: by, t: 0, r: grande ? 50 : 32 });
    part.chispa(sx, by, grande ? 14 : 9);
    if (combo >= 2) part.texto(sx, by - 26, `x${combo}`, { color: combo >= 4 ? C.margen : C.pizarra, tam: 16 + Math.min(combo, 8) * 2.5, vida: 0.9 });
    if (combo >= 4) { sacudida.golpe(2 + combo); part.confeti(sx, by, 12 + combo * 2); }
    if (grande) part.confeti(sx, by, 26);
  }

  // ---------- Trazo ----------
  function largo(cam) { let l = 0; for (let i = 1; i < cam.length; i++) l += distSuelo(cam[i][0], cam[i][1], cam[i - 1][0], cam[i - 1][1]); return l; }
  function actualizarTrazo() {
    const e = juego.entrada;
    if (fase !== 'juego') return;
    if (e.abajo) {
      let [fx, fy] = aSuelo(e.x, e.y - 26);
      fx = clamp(fx, LIM.x0, LIM.x1); fy = clamp(fy, LIM.y0, LIM.y1);
      if (!trazando) { trazando = { puntos: [[profe.fx, profe.fy]], gasto: 0, base: tiza }; tutorial = Math.max(tutorial, 99); }
      const ult = trazando.puntos[trazando.puntos.length - 1];
      let d = distSuelo(fx, fy, ult[0], ult[1]);
      if (d > 7 && trazando.gasto < trazando.base) {
        // Si no llega la tiza, el trazo se corta donde se acaba.
        const queda = trazando.base - trazando.gasto;
        if (d > queda) { const k = queda / d; fx = ult[0] + (fx - ult[0]) * k; fy = ult[1] + (fy - ult[1]) * k; d = queda; }
        trazando.puntos.push([fx, fy]);
        trazando.gasto += d;
        if (Math.floor(trazando.gasto / 40) !== Math.floor((trazando.gasto - d) / 40)) juego.audio.sfx('ayuda', { k: 0.2 });
      }
    } else if (trazando) {
      if (trazando.puntos.length > 1) {
        camino = trazando.puntos.slice();
        tiza = Math.max(0, trazando.base - trazando.gasto);
        combo = 0;
        juego.audio.sfx('toque');
      }
      trazando = null;
    }
  }
  // Manos por las que pasa un camino (para la vista previa del combo).
  function manosEnCamino(pts) {
    const res = new Set();
    for (const n of ninos) {
      if (n.estado !== 'mano' || (n.especial && cfg.apoyos)) continue;
      for (let i = 1; i < pts.length; i++) {
        if (distSegmento(n.fx, n.fy, pts[i - 1], pts[i]) < RADIO_AYUDA) { if (!n.especial || i === pts.length - 1) res.add(n); break; }
      }
    }
    return res;
  }
  function distSegmento(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
    const t = clamp(((px - a[0]) * dx + (py - a[1]) * dy) / l2, 0, 1);
    return Math.hypot(px - (a[0] + dx * t), py - (a[1] + dy * t));
  }

  // ---------- Profe ----------
  function actualizarProfe(dt) {
    const energia = cfg.horas ? 1 : 1 - 0.35 * (reloj / D.dur);
    if (!trazando) tiza = Math.min(TIZA_MAX, tiza + RECARGA * energia * dt);
    if (profe.bostezo > 0) { profe.bostezo -= dt; return; }
    if (!cfg.horas && fase === 'juego' && camino.length) {
      profe.proxBostezo -= dt;
      if (profe.proxBostezo <= 0 && reloj > 12) { profe.bostezo = 0.9; profe.proxBostezo = 7 + r() * 4; juego.audio.sfx('bostezo'); return; }
    }
    profe.ayudando = null;
    // Quieta en un pupitre especial al final del camino: atención sostenida.
    if (!camino.length) {
      const esp = ninos.find(n => n.especial && !cfg.apoyos && n.estado === 'mano' && distSuelo(n.fx, n.fy - 30, profe.fx, profe.fy) < RADIO_AYUDA + 6);
      if (esp) { profe.ayudando = esp; esp.prog += dt / 2.2; if (esp.prog >= 1) { combo = 0; encender(esp, true); } }
      // En la mesa: se despachan papeles.
      if (distSuelo(profe.fx, profe.fy, MESA.fx, MESA.fy + 30) < 46 && (papeles.pila > 0 || papeles.suelo.length) && !cfg.burocracia) {
        papeles.proceso -= dt;
        if (papeles.proceso <= 0) { papeles.proceso = 0.3; papeles.pila = Math.max(0, papeles.pila - 1); juego.audio.sfx('papel'); const [sx, sy] = aPantalla(MESA.fx, MESA.fy); part.texto(sx, sy - 40, '¡sello!', { color: C.margen, tam: 12, vida: 0.5 }); }
      }
      profe.vx = damp(profe.vx, 0, 10, dt); profe.vy = damp(profe.vy, 0, 10, dt);
      return;
    }
    // Recorre el camino.
    let mover = VEL * (cfg.horas ? 1 : 0.85 + 0.15 * energia) * dt;
    for (const f of papeles.suelo) if (distSuelo(f.fx, f.fy, profe.fx, profe.fy) < 24) { mover *= 0.45; f.pisa = (f.pisa || 0) + dt; }
    papeles.suelo = papeles.suelo.filter(f => (f.pisa || 0) < 0.35 || (papeles.pila++, false));
    const x0 = profe.fx, y0 = profe.fy;
    while (mover > 0 && camino.length) {
      const [tx, ty] = camino[0];
      const d = distSuelo(tx, ty, profe.fx, profe.fy);
      if (d <= mover) { profe.fx = tx; profe.fy = ty; mover -= d; camino.shift(); }
      else { profe.fx += ((tx - profe.fx) / d) * mover; profe.fy += ((ty - profe.fy) / d) * mover; mover = 0; }
    }
    profe.vx = (profe.fx - x0) / dt; profe.vy = (profe.fy - y0) / dt;
    profe.paso += (Math.hypot(profe.vx, profe.vy) * dt) / 50;
    profe.mira = damp(profe.mira, clamp(profe.vx / 300, -1, 1), 8, dt);
    // Ayuda a quien tiene la mano levantada al pasar.
    for (const n of ninos) if (n.estado === 'mano' && !n.especial && distSuelo(n.fx, n.fy - 30, profe.fx, profe.fy) < RADIO_AYUDA) encender(n);
  }

  function actualizarPapeles(dt) {
    papeles.prox -= dt;
    if (papeles.prox <= 0) { papeles.prox = 3.8 + r() * 1.6; papeles.total++; papeles.vuelan.push({ t: 0, rot: r() * 3 }); juego.audio.sfx('papel'); }
    for (let i = papeles.vuelan.length - 1; i >= 0; i--) { const f = papeles.vuelan[i]; f.t += dt * 1.3; if (f.t >= 1) { papeles.vuelan.splice(i, 1); papeles.pila++; } }
    if (!cfg.burocracia && papeles.pila >= 8) {
      papeles.pila = 2;
      juego.audio.sfx('montonCae'); sacudida.golpe(6);
      decir('¡SE CAE EL MONTÓN!', 'Los folios del suelo te frenan', '#ffb3b3');
      for (let i = 0; i < 7; i++) papeles.suelo.push({ fx: clamp(MESA.fx + 30 + (r() - 0.2) * 260, -170, 170), fy: clamp(MESA.fy + 30 + r() * 170, -90, 200), rot: r() * TAU });
    }
    if (cfg.burocracia) {
      adminProx -= dt;
      if (adminProx <= 0 && papeles.pila >= 2 && !visitas.some(v => v.tipo === 'admin')) { visitas.push(crearVisita('admin')); juego.audio.sfx('puerta'); }
    }
  }
  function actualizarVisitas(dt) {
    for (let i = visitas.length - 1; i >= 0; i--) {
      const v = visitas[i];
      v.t += dt;
      if (v.tipo === 'operarios') { v.fx += 90 * dt; if (v.fx > 260) visitas.splice(i, 1); continue; }
      const ir = (x, y, vel = 150) => { const dx = x - v.fx, dy = y - v.fy, d = Math.hypot(dx, dy); if (d < 3) return true; v.fx += (dx / d) * Math.min(vel * dt, d); v.fy += (dy / d) * Math.min(vel * dt, d); v.paso += (vel * dt) / 50; return false; };
      if (v.tipo === 'apoyo') {
        if (v.fase === 'llega' && ir(v.dx, v.dy)) v.fase = 'sentada';
        if (v.fase === 'sentada') for (const n of ninos) if (n.especial && n.estado === 'mano') { n.prog += dt / 2.2; if (n.prog >= 1) { combo = 0; encender(n, true); } }
      } else if (v.tipo === 'admin') {
        if (v.fase === 'llega' && ir(v.dx, v.dy, 190)) { v.fase = 'recoge'; v.t = 0; }
        if (v.fase === 'recoge' && v.t > 0.4) { v.carga = papeles.pila; papeles.pila = 0; v.fase = 'vuelve'; juego.audio.sfx('papel'); }
        if (v.fase === 'vuelve' && ir(PUERTA.fx, PUERTA.fy, 190)) { visitas.splice(i, 1); adminProx = 4; }
      }
    }
  }

  function terminar() {
    fase = 'fin'; tf = 0;
    camino = []; trazando = null;
    juego.audio.sfx('timbre');
    juego.audio.pararMusica(1.2);
    const total = ninos.length;
    est.aulas[dia] = { llegados, total, bombillas, perdidas, combo: mejorCombo, papeles: papeles.total, temp: Math.round(temp), reparto: !cfg.sueldo, elegidas: [...elegidas] };
    est.mejorCombo = Math.max(est.mejorCombo || 0, mejorCombo);
    resumen = { llegados, total };
    for (const n of ninos) if (n.estado === 'mano') { n.estado = 'triste'; n.t = 0; }
    sacudida.golpe(5);
  }

  // ---------- Bot de pruebas ----------
  function rutaBot() {
    // Camino codicioso por las manos más cercanas mientras llegue la tiza.
    const pts = [[profe.fx, profe.fy]];
    let gasto = 0, x = profe.fx, y = profe.fy;
    const pend = ninos.filter(n => n.estado === 'mano' && !(n.especial && cfg.apoyos));
    while (pend.length) {
      pend.sort((a, b) => distSuelo(a.fx, a.fy - 30, x, y) - distSuelo(b.fx, b.fy - 30, x, y));
      const n = pend.shift();
      const d = distSuelo(n.fx, n.fy - 30, x, y);
      if (gasto + d > tiza) break;
      gasto += d; x = n.fx; y = n.fy - 30; pts.push([x, y]);
      if (n.especial) break;
    }
    if (pts.length === 1 && papeles.pila >= 5 && !cfg.burocracia) pts.push([MESA.fx, MESA.fy + 30]);
    return pts.length > 1 ? pts.slice(1).map(([fx, fy]) => { const [sx, sy] = aPantalla(fx, fy); return juego.aCss(sx, sy + 26); }) : null;
  }

  // ---------- Escena ----------
  return {
    fondo: '#2b2f33',
    redimensionar: disponer,
    info: () => ({ fase, tf, ocupada: camino.length > 0 || profe.ayudando != null, profe: [Math.round(profe.fx), Math.round(profe.fy)], camino: camino.length, tiza: Math.round(tiza), bostezo: profe.bostezo }),
    entrar() {
      juego.audio.musica('aula', { bpm: dia === 0 ? 132 : 118, tension: dia === 0, capas: { melodia: dia > 0 } });
      juego.audio.multitud(0);
      decir(D.titulo, D.sub, C.amarillo);
    },
    actualizar(dt) {
      tf += dt;
      part.actualizar(dt);
      sacudida.actualizar(dt);
      polvo.actualizar(dt, juego.t);
      destellos = destellos.filter(d => (d.t += dt * 2.2) < 1);
      if (rotuloActual) { rotuloActual.t += dt; if (rotuloActual.t > 2.6) rotuloActual = null; }
      if (comboT > 0) { comboT -= dt; if (comboT <= 0 && !camino.length) combo = 0; }
      if (juego.debug) { window.__bot = null; window.__botRuta = rutaBot; window.__stats = { llegados, bombillas, perdidas, total: ninos.length, combo: mejorCombo, pila: papeles.pila }; }
      for (const n of ninos) { if (n.entra < 1 && fase !== 'juego') n.entra = Math.min(1, n.entra + dt); }
      if (fase === 'intro') {
        for (const n of ninos) n.t += dt;
        tutorial += dt;
        if (tf > 1 && (juego.entrada.abajo || juego.entrada.toques.length)) { fase = 'juego'; tf = 0; }
        actualizarVisitas(dt);
        return;
      }
      if (fase === 'juego') {
        reloj += dt;
        for (const e of eventos) if (!e.hecho && reloj >= e.t) { e.hecho = true; lanzarEvento(e); }
        if (!cfg.infra) temp = Math.min(33, temp + dt * 0.04);
        actualizarTrazo();
        levantarManos(dt);
        actualizarNinos(dt);
        actualizarProfe(dt);
        actualizarPapeles(dt);
        actualizarVisitas(dt);
        if (juego.debug && juego.entrada.toques.some(t => t.y < 50)) reloj = D.dur;
        if (reloj >= D.dur) terminar();
        return;
      }
      for (const n of ninos) { n.t += dt; n.brillo = damp(n.brillo, n.encendido ? 1 : 0, 3, dt); }
      if (tf > 2.4 && juego.entrada.toques.length) juego.siguiente();
    },
    dibujar(ctx) {
      ctx.save();
      sacudida.aplicar(ctx, juego.t);
      dibujaParedes(ctx);
      dibujaSuelo(ctx);
      if (juego.calidad) dibujaLuz(ctx);
      dibujaCamino(ctx);
      const cosas = [];
      for (const n of ninos) cosas.push({ fy: n.fy, f: () => dibujaPupitre(ctx, n) });
      cosas.push({ fy: MESA.fy, f: () => dibujaMesa(ctx) });
      cosas.push({ fy: profe.fy - 2, f: () => dibujaProfe(ctx) });
      for (const v of visitas) cosas.push({ fy: v.fy, f: () => dibujaVisita(ctx, v) });
      cosas.sort((a, b) => b.fy - a.fy).forEach(c => c.f());
      dibujaFoliosSuelo(ctx);
      dibujaCalor(ctx);
      if (juego.calidad) polvo.dibujar(ctx, juego.t, (x, y) => (cfg.infra ? 0.4 : 1) * clamp(1 - Math.abs((x - (y - 80) * 0.45) - 90) / 90, 0, 1));
      for (const n of ninos) dibujaBocadillo(ctx, n);
      for (const d of destellos) destello(ctx, d.x, d.y, d.r, d.t);
      ctx.restore();
      etalonar(ctx, W, H, cfg.infra || dia === 2 ? { arriba: '#fff3d6', abajo: '#b9e2a0', fuerza: 0.2, vineta: 0.32 } : { arriba: '#ffcf8a', abajo: '#e0a060', fuerza: 0.25 + invCalor() * 0.25, vineta: 0.4 });
      part.dibujar(ctx);
      dibujaHUD(ctx);
      if (rotuloActual) dibujaRotulo(ctx);
      if (tutorial < 99 && fase !== 'fin' && !rotuloActual) dibujaTutorial(ctx);
      if (fase === 'fin') dibujaFin(ctx);
    },
  };

  // ======================= Dibujo =======================
  function poli(ctx, pts, color) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }

  function dibujaParedes(ctx) {
    const barracon = !cfg.infra;
    const [bx0, by] = aPantalla(-190, FONDO), [bx1] = aPantalla(190, FONDO);
    const techo = P.techo;
    // Pared del fondo.
    const pared = barracon ? '#c9cfcb' : '#f1ead6';
    poli(ctx, [[bx0, techo + 26], [bx1, techo + 26], [bx1, by], [bx0, by]], pared);
    // Paredes laterales en perspectiva.
    const [fx0, fyB] = aPantalla(-190, -110), [fx1] = aPantalla(190, -110);
    poli(ctx, [[0, 0], [bx0, techo + 26], [bx0, by], [fx0 - 30, fyB + 40], [0, fyB + 40]], barracon ? '#b8bfba' : '#e6dcc3');
    poli(ctx, [[W, 0], [bx1, techo + 26], [bx1, by], [fx1 + 30, fyB + 40], [W, fyB + 40]], barracon ? '#aeb5b0' : '#dcd1b6');
    // Techo.
    poli(ctx, [[0, 0], [W, 0], [bx1, techo + 26], [bx0, techo + 26]], barracon ? '#9aa39e' : '#f7f2e6');
    if (barracon) {
      // Chapa del barracón (techo de uralita, ondulado).
      ctx.strokeStyle = 'rgba(60,70,65,.25)'; ctx.lineWidth = 2;
      for (let i = 0; i <= 14; i++) { const t = i / 14; ctx.beginPath(); ctx.moveTo(lerp(0, W, t), 0); ctx.lineTo(lerp(bx0, bx1, t), techo + 26); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(60,70,65,.15)';
      for (let x = bx0 + 6; x < bx1; x += 9) { ctx.beginPath(); ctx.moveTo(x, techo + 26); ctx.lineTo(x, by); ctx.stroke(); }
    } else {
      // Fluorescentes encendidos y aire acondicionado.
      ctx.fillStyle = 'rgba(255,255,240,.9)'; for (const t of [0.3, 0.7]) { rr(ctx, lerp(bx0, bx1, t) - 30, techo + 8, 60, 6, 3); ctx.fill(); }
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5; rr(ctx, bx1 - 70, techo + 36, 56, 16, 5); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(127,183,232,.7)'; for (let i = 0; i < 3; i++) { const o = (juego.t * 18 + i * 8) % 22; ctx.beginPath(); ctx.moveTo(bx1 - 62 + i * 18, techo + 56 + o); ctx.lineTo(bx1 - 58 + i * 18, techo + 60 + o); ctx.stroke(); }
    }
    // Pizarrita del fondo (donde se escribe el resumen), corcho y reloj.
    const px = (bx0 + bx1) / 2;
    ctx.fillStyle = '#7d5a3c'; rr(ctx, px - 76, techo + 34, 152, 70, 4); ctx.fill();
    ctx.fillStyle = '#244f3a'; rr(ctx, px - 72, techo + 38, 144, 62, 3); ctx.fill();
    if (fase !== 'fin') { ctx.font = `400 11px ${fuentes.rotulador}`; ctx.fillStyle = 'rgba(247,248,243,.7)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(dia === 0 ? 'LUNES 13-10' : dia === 1 ? '¿Y SI…?' : 'LA CLASE', px, techo + 52); ctx.fillText(dia === 0 ? 'MATES · 2+3=5' : dia === 1 ? 'MATES · 2+3=5' : 'QUE QUEREMOS', px, techo + 74); }
    // Dibujos del alumnado.
    const cols = ['#ffcf33', '#86cd55', '#7fb7e8', '#e0566c', '#c9a7ef'];
    for (let i = 0; i < 4; i++) { const x = bx0 + 10 + i * 18; ctx.save(); ctx.translate(x, techo + 54 + (i % 2) * 8); ctx.rotate((i - 1.5) * 0.08); ctx.fillStyle = '#fff'; ctx.fillRect(-7, -9, 14, 18); ctx.fillStyle = cols[i]; circulo(ctx, 0, -2, 3.5); ctx.fill(); ctx.restore(); }
    // Reloj con el tiempo de la clase.
    const rx = bx1 - 26, ry = techo + 58;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2; circulo(ctx, rx, ry, 10); ctx.fill(); ctx.stroke();
    const prog = fase === 'juego' ? reloj / D.dur : fase === 'fin' ? 1 : 0;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.sin(prog * TAU) * 7, ry - Math.cos(prog * TAU) * 7); ctx.stroke();
    if (barracon) {
      // Termómetro.
      const tx = bx1 - 26, ty = techo + 76;
      ctx.fillStyle = '#fff'; rr(ctx, tx - 3, ty, 6, 24, 3); ctx.fill(); ctx.stroke();
      const k = clamp((temp - 20) / 15, 0, 1);
      ctx.fillStyle = mezcla('#ffcf33', '#e0566c', k); ctx.fillRect(tx - 1.2, ty + 22 - 20 * k, 2.4, 20 * k);
      circulo(ctx, tx, ty + 27, 4.5); ctx.fill(); ctx.stroke();
      ctx.font = `800 10px ${fuentes.display}`; ctx.fillStyle = invCalor() > 0.6 ? '#c0392b' : '#0f3522'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(temp)}°`, tx - 7, ty + 27);
    }
    // Ventanas en la pared izquierda (de ahí viene la luz) y puerta en la derecha.
    for (let i = 0; i < 3; i++) {
      const d0 = 30 + i * 110, d1 = d0 + 80;
      const a = aPantalla(-190, d0), b = aPantalla(-190, d1);
      const altoA = (a[1] - (techo + 26)) * 0.62, altoB = (b[1] - (techo + 26)) * 0.62;
      const q = [[a[0] - 30 * a[2], a[1] - altoA * 1.05], [b[0], b[1] - altoB * 1.05], [b[0], b[1] - altoB * 0.35], [a[0] - 30 * a[2], a[1] - altoA * 0.35]];
      poli(ctx, q, '#0f3522');
      const inner = q.map(([x, y], k) => [x + (k === 0 || k === 3 ? 3 : -2), y + (k < 2 ? 3 : -3)]);
      poli(ctx, inner, barracon ? '#a8d8ef' : '#c7e8f5');
      if (barracon && i === 1) { ctx.strokeStyle = '#f2b705'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(inner[1][0] - 6, inner[2][1]); ctx.lineTo(inner[1][0] - 6, inner[1][1] + 6); ctx.lineTo(inner[0][0] + 6, inner[0][1] + 10); ctx.stroke(); }
    }
    const pa = aPantalla(190, PUERTA.fy - 20), pb = aPantalla(190, PUERTA.fy - 70);
    poli(ctx, [[pa[0], pa[1]], [pb[0], pb[1]], [pb[0], pb[1] - 70 * pb[2]], [pa[0], pa[1] - 70 * pa[2]]], barracon ? '#7f8c86' : '#174d32');
    ctx.fillStyle = '#ffcf33'; circulo(ctx, pb[0] - 4, pb[1] - 34 * pb[2], 2.5); ctx.fill();
  }

  function dibujaSuelo(ctx) {
    const barracon = !cfg.infra;
    const esq = [aPantalla(-190, FONDO), aPantalla(190, FONDO), aPantalla(190, -110), aPantalla(-190, -110)];
    const g = ctx.createLinearGradient(0, esq[0][1], 0, H);
    g.addColorStop(0, barracon ? '#cdbf9f' : '#dfe6cf'); g.addColorStop(1, barracon ? '#bfae8a' : '#cdd9bb');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(esq[0][0], esq[0][1]); ctx.lineTo(esq[1][0], esq[1][1]); ctx.lineTo(W + 40, esq[2][1] + 30); ctx.lineTo(W + 40, H + 10); ctx.lineTo(-40, H + 10); ctx.lineTo(-40, esq[3][1] + 30); ctx.closePath(); ctx.fill();
    // Baldosas en perspectiva.
    ctx.strokeStyle = barracon ? 'rgba(110,90,50,.14)' : 'rgba(23,77,50,.08)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let fx = -190; fx <= 190; fx += 38) { const a = aPantalla(fx, FONDO), b = aPantalla(fx, -160); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (let fy = -150; fy <= FONDO; fy += 38) { const a = aPantalla(-260, fy), b = aPantalla(260, fy); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
    // Borde de la pizarra al pie de la pantalla.
    ctx.fillStyle = '#244f3a'; ctx.fillRect(0, H - 22, W, 22);
    ctx.fillStyle = '#7d5a3c'; ctx.fillRect(0, H - 28, W, 7);
  }

  function dibujaLuz(ctx) {
    // Haces de luz que entran por las ventanas de la izquierda y cruzan el suelo.
    const k = cfg.infra ? 0.05 : 0.07 + invCalor() * 0.1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const d0 = 30 + i * 110;
      const a = aPantalla(-190, d0), b = aPantalla(-190, d0 + 80);
      const c = aPantalla(40, d0 - 60), d = aPantalla(40, d0 - 140);
      const osc = 1 + Math.sin(juego.t * 0.7 + i) * 0.08;
      ctx.fillStyle = `rgba(255,214,140,${k * osc})`;
      ctx.beginPath(); ctx.moveTo(a[0], a[1] - 30); ctx.lineTo(b[0], b[1] - 30); ctx.lineTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function dibujaCamino(ctx) {
    // La tiza: el camino ya trazado (que la profe va borrando) y el que se está dibujando.
    const pinta = (pts, alfaBase, previa) => {
      if (pts.length < 2) return;
      const sc = pts.map(([fx, fy]) => aPantalla(fx, fy));
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(15,53,34,${0.25 * alfaBase})`; ctx.lineWidth = 9;
      ctx.beginPath(); sc.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + 2) : ctx.moveTo(x, y + 2))); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.95 * alfaBase})`; ctx.lineWidth = 6; ctx.setLineDash(previa ? [12, 6] : []); ctx.lineDashOffset = -juego.t * 40;
      ctx.beginPath(); sc.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(255,255,255,${0.4 * alfaBase})`; ctx.lineWidth = 2;
      ctx.beginPath(); sc.forEach(([x, y], i) => (i ? ctx.lineTo(x + 1.5, y - 1.5) : ctx.moveTo(x + 1.5, y - 1.5))); ctx.stroke();
      const [ux, uy] = sc[sc.length - 1];
      ctx.fillStyle = '#ffffff'; circulo(ctx, ux, uy, 6); ctx.fill();
      ctx.restore();
    };
    if (camino.length) pinta([[profe.fx, profe.fy], ...camino], 0.85, false);
    if (trazando) {
      pinta(trazando.puntos, 1, true);
      // Vista previa: cuántas manos alcanzará este trazo.
      const manos = manosEnCamino(trazando.puntos);
      for (const n of manos) { const [sx, sy, s] = aPantalla(n.fx, n.fy); ctx.strokeStyle = C.amarillo; ctx.lineWidth = 3; circulo(ctx, sx, sy - 74 * s, 20 * s + Math.sin(juego.t * 10) * 2); ctx.stroke(); }
      if (manos.size >= 2) {
        const e = juego.entrada;
        ctx.font = `400 ${22 + manos.size * 2}px ${fuentes.rotulador}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 5; ctx.strokeStyle = C.honda; ctx.strokeText(`x${manos.size}`, e.x + 30, e.y - 50); ctx.fillStyle = C.amarillo; ctx.fillText(`x${manos.size}`, e.x + 30, e.y - 50);
      }
      if (trazando.gasto >= trazando.base - 1) {
        const e = juego.entrada;
        ctx.font = `800 14px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = C.honda; ctx.strokeText('¡sin tiza!', e.x, e.y - 76); ctx.fillStyle = '#ffb3b3'; ctx.fillText('¡sin tiza!', e.x, e.y - 76);
      }
    }
  }

  function dibujaPupitre(ctx, n) {
    let fx = n.fx, fy = n.fy;
    if (n.reparto && n.entra < 1) { const k = ease.inOutCubic(n.entra); fx = lerp(n.desde[0], n.fx, k); fy = lerp(n.desde[1], n.fy, k); }
    const [x, y, s] = aPantalla(fx, fy);
    if (n.brillo > 0.02) {
      const g = ctx.createRadialGradient(x, y - 26 * s, 4, x, y - 26 * s, 52 * s);
      g.addColorStop(0, `rgba(255,207,51,${0.5 * n.brillo})`); g.addColorStop(1, 'rgba(255,207,51,0)');
      ctx.fillStyle = g; circulo(ctx, x, y - 26 * s, 52 * s); ctx.fill();
    }
    const expr = n.estado === 'feliz' ? 'feliz' : n.estado === 'triste' ? 'triste' : n.estado === 'dormido' ? 'dormido' : n.estado === 'mano' && n.paciencia < 2.5 ? 'triste' : fase === 'fin' && n.encendido ? 'feliz' : 'normal';
    let brazos = n.estado === 'mano' ? 'uno' : n.estado === 'feliz' || (fase === 'fin' && n.encendido) ? 'arriba' : 'escribe';
    if (n.estado === 'quieto' && invCalor() > 0.35 && (n.fx * 7 + n.fy) % 3 < 1) brazos = 'abanico';
    const salto = n.estado === 'feliz' ? Math.max(0, Math.sin(n.t * 9)) * 6 * (1 - n.t / 1.6) : fase === 'fin' && n.encendido ? Math.max(0, Math.sin(juego.t * 7 + n.fx)) * 4 : 0;
    const cabecea = n.estado === 'dormido' ? Math.sin(juego.t * 2) * 1.5 + 3 : 0;
    const esc = s * 1.05;
    // Silla.
    ctx.fillStyle = '#c28b54'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
    rr(ctx, x - 13 * esc, y - 44 * esc, 26 * esc, 12 * esc, 3); ctx.fill(); ctx.stroke();
    const sinTono = fase === 'fin' && !n.encendido;
    if (sinTono) ctx.globalAlpha = 0.75;
    dibujaPersona(ctx, n.p, { x, y: y - 4 * esc + cabecea, esc, sentado: true, brazos, expr, t: juego.t + n.p.semilla, salto, mira: clamp((profe.fx - fx) / 150, -1, 1), sinSombra: true, luz: 'rgba(255,230,170,.55)' });
    ctx.globalAlpha = 1;
    if (n.reparto) return; // sin pupitre: solo silla
    // Pupitre en perspectiva: tapa y frente.
    const w = 27 * esc, h = 9 * esc;
    sombra(ctx, x, y + 15 * esc, 28 * esc, 5 * esc, 0.16);
    ctx.fillStyle = '#e9c38f'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
    rr(ctx, x - w, y - 8 * esc, w * 2, h * 1.6, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c99a62'; rr(ctx, x - w, y + 5 * esc, w * 2, 8 * esc, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; rr(ctx, x - 13 * esc, y - 5 * esc, 15 * esc, 8 * esc, 1.5); ctx.fill();
    ctx.fillStyle = n.encendido ? '#ffcf33' : '#e0566c'; rr(ctx, x + 6 * esc, y - 3 * esc, 11 * esc, 2.6 * esc, 1.3); ctx.fill();
  }

  function dibujaBocadillo(ctx, n) {
    if (!['mano', 'triste', 'dormido'].includes(n.estado)) return;
    const [x, sy, s] = aPantalla(n.fx, n.fy);
    const y = sy - 78 * s;
    if (n.estado === 'dormido') { ctx.save(); ctx.globalAlpha = 0.8; icono(ctx, 'zzz', x + 14 * s, y + 14 - Math.sin(juego.t * 2) * 2, 16 * s); ctx.restore(); return; }
    if (n.estado === 'triste') {
      const a = 1 - n.t / 3;
      ctx.save(); ctx.globalAlpha = a * 0.8; ctx.fillStyle = '#9aa39e';
      for (const [dx, dy, r2] of [[-7, 2, 7], [0, -3, 9], [8, 2, 7]]) { circulo(ctx, x + dx * s, y + 8 + dy * s - n.t * 4, r2 * s); ctx.fill(); }
      ctx.restore();
      return;
    }
    const ap = ease.outBack(clamp(n.t / 0.3, 0, 1));
    const urg = 1 - clamp(n.paciencia / n.paciencia0, 0, 1);
    const largo = n.especial && !cfg.apoyos;
    const rB = (largo ? 18 : 15.5) * Math.max(0.8, s) * ap;
    const tiembla = urg > 0.65 ? Math.sin(juego.t * 30) * 1.3 : 0;
    ctx.save();
    ctx.translate(x + tiembla, y - Math.sin(juego.t * 3 + n.fx) * 1.5);
    ctx.fillStyle = 'rgba(15,53,34,.22)'; circulo(ctx, 1.5, 3, rB); ctx.fill();
    ctx.fillStyle = mezcla('#ffffff', '#ffd2d8', urg); circulo(ctx, 0, 0, rB); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, rB - 3); ctx.lineTo(0, rB + 7); ctx.lineTo(5, rB - 3); ctx.fill();
    ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.6; circulo(ctx, 0, 0, rB); ctx.stroke();
    ctx.strokeStyle = urg > 0.65 ? '#e0566c' : '#86cd55'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, rB + 4, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - urg)); ctx.stroke();
    if (n.prog > 0) { ctx.fillStyle = 'rgba(255,207,51,.6)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, rB - 1, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, n.prog)); ctx.closePath(); ctx.fill(); }
    icono(ctx, n.necesidad, 0, 0, rB * 1.15);
    if (largo) { ctx.font = `800 9px ${fuentes.display}`; ctx.fillStyle = C.honda; ctx.textAlign = 'center'; ctx.fillText('quédate', 0, rB + 16); }
    ctx.restore();
  }

  function dibujaMesa(ctx) {
    const [x, y, s] = aPantalla(MESA.fx, MESA.fy);
    const w = 52 * s, h = 26 * s;
    sombra(ctx, x, y + 18 * s, w * 1.1, 8 * s, 0.18);
    ctx.fillStyle = '#b98a5a'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.8;
    rr(ctx, x - w, y - h, w * 2, h * 1.5, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9b7148'; rr(ctx, x - w, y + 10 * s, w * 2, 12 * s, 3); ctx.fill(); ctx.stroke();
    // Portátil con Raíces.
    ctx.fillStyle = '#3b4a44'; rr(ctx, x + 10 * s, y - 22 * s, 32 * s, 20 * s, 2); ctx.fill();
    ctx.fillStyle = !cfg.burocracia && papeles.pila > 4 && Math.sin(juego.t * 8) > 0 ? '#e0566c' : '#9fd3f0'; rr(ctx, x + 12 * s, y - 20 * s, 28 * s, 15 * s, 1.5); ctx.fill();
    const n = Math.min(papeles.pila, 11);
    for (let i = 0; i < n; i++) {
      ctx.save(); ctx.translate(x - 22 * s, y - 8 * s - i * 3.4 * s);
      ctx.rotate(Math.sin(i * 1.7) * 0.12 + (n > 5 ? Math.sin(juego.t * 7 + i) * 0.025 * (n - 5) : 0));
      ctx.fillStyle = i % 3 === 2 ? '#fff6c9' : '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.lineWidth = 1;
      rr(ctx, -17 * s, -9 * s, 34 * s, 18 * s, 1.5); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    for (const f of papeles.vuelan) {
      const k = ease.inOutCubic(f.t);
      const [px, py] = aPantalla(PUERTA.fx, PUERTA.fy);
      const fxp = lerp(px, x - 22 * s, k), fyp = lerp(py - 60, y - 8 * s - n * 3.4 * s, k) - Math.sin(k * Math.PI) * 90;
      ctx.save(); ctx.translate(fxp, fyp); ctx.rotate(f.rot + k * 5);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.lineWidth = 1; rr(ctx, -10, -7, 20, 14, 1); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (!cfg.burocracia && papeles.pila >= 5) {
      ctx.strokeStyle = C.margen; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]); ctx.lineDashOffset = -juego.t * 20;
      rr(ctx, x - w - 8, y - h - 8 - n * 3, w * 2 + 16, h * 1.5 + 16 + n * 3, 10); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  function dibujaFoliosSuelo(ctx) {
    for (const f of papeles.suelo) {
      const [x, y, s] = aPantalla(f.fx, f.fy);
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.55); ctx.rotate(f.rot);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.5)'; ctx.lineWidth = 1;
      rr(ctx, -13 * s, -10 * s, 26 * s, 20 * s, 1.5); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  function dibujaProfe(ctx) {
    const [x, y, s] = aPantalla(profe.fx, profe.fy);
    const anda = Math.hypot(profe.vx, profe.vy) > 20;
    let brazos = 'abajo', expr = 'normal';
    if (profe.ayudando) { brazos = 'papel'; expr = 'feliz'; }
    else if (anda) { brazos = 'abajo'; expr = combo >= 2 ? 'feliz' : 'normal'; }
    else if (fase === 'intro' && dia === 0) brazos = 'cafe';
    if (profe.bostezo > 0) { expr = 'sorpresa'; }
    else if (!cfg.horas && reloj > D.dur * 0.6) expr = anda ? expr : 'cansado';
    if (fase === 'fin') { const ok = resumen && resumen.llegados >= resumen.total * 0.9; expr = ok ? 'feliz' : 'cansado'; brazos = ok ? 'arriba' : 'abajo'; }
    const deEspaldas = anda && profe.vy > 60;
    // Halo de combo.
    if (combo >= 3 && anda) { ctx.fillStyle = alfa('#ffcf33', 0.25); circulo(ctx, x, y - 34 * s, 40 * s); ctx.fill(); }
    dibujaPersona(ctx, profe.p, { x, y, esc: s * 1.2, vista: deEspaldas ? 'espalda' : 'frente', brazos, expr, t: juego.t, paso: anda ? profe.paso : 0, mira: profe.mira, luz: 'rgba(255,230,170,.6)' });
    if (cfg.horas && fase !== 'intro') {
      // Material preparado bajo el brazo.
      ctx.save(); ctx.translate(x - 18 * s, y - 40 * s); ctx.rotate(-0.3);
      ctx.fillStyle = '#ffcf33'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.3; rr(ctx, -7 * s, -9 * s, 14 * s, 18 * s, 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    if (profe.bostezo > 0) icono(ctx, 'zzz', x + 20 * s, y - 92 * s, 18);
  }

  function dibujaVisita(ctx, v) {
    if (v.tipo === 'operarios') {
      const [x, y, s] = aPantalla(v.fx, v.fy);
      const buzo = { edad: 'adulto', piel: '#d29a74', peinado: 'calvo', pelo: '#2a1c14', ropa: '#f7f8f3', pantalon: '#e9e9e9', semilla: 0.4 };
      ctx.fillStyle = '#b9bfbc'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
      rr(ctx, x - 40 * s, y - 70 * s, 80 * s, 12 * s, 2); ctx.fill(); ctx.stroke();
      dibujaPersona(ctx, buzo, { x: x - 30 * s, y, esc: s, brazos: 'pancarta', t: juego.t, paso: v.t * 1.6 });
      dibujaPersona(ctx, { ...buzo, piel: '#f6d5bd', peinado: 'corto', pelo: '#8e8e8e', gafas: true }, { x: x + 30 * s, y, esc: s, brazos: 'pancarta', expr: 'feliz', t: juego.t, paso: v.t * 1.6 + 0.5 });
      return;
    }
    const [x, y, s] = aPantalla(v.fx, v.fy);
    const anda = v.fase === 'llega' || v.fase === 'vuelve';
    dibujaPersona(ctx, v.p, { x, y, esc: s * 1.12, brazos: v.tipo === 'admin' && v.fase === 'vuelve' ? 'papel' : v.fase === 'sentada' ? 'papel' : 'saluda', expr: 'feliz', t: juego.t, paso: anda ? v.paso : 0, sentado: v.fase === 'sentada' });
    if (v.tipo === 'admin' && v.fase === 'vuelve') for (let i = 0; i < Math.min(v.carga, 6); i++) { ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.lineWidth = 1; rr(ctx, x - 13 * s, y - (54 + i * 3.4) * s, 26 * s, 14 * s, 1.5); ctx.fill(); ctx.stroke(); }
  }

  function dibujaCalor(ctx) {
    const k = invCalor();
    if (k <= 0.01) return;
    ctx.save();
    ctx.strokeStyle = `rgba(255,170,90,${k * 0.35})`; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const x = (i * 53 + 20) % W, off = (juego.t * 24 + i * 37) % (H - 200), y = H - 60 - off;
      ctx.beginPath(); for (let j = 0; j < 5; j++) ctx.lineTo(x + Math.sin(juego.t * 3 + j + i) * 4, y - j * 8); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Interfaz ----------
  function dibujaHUD(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 70);
    g.addColorStop(0, 'rgba(15,53,34,.95)'); g.addColorStop(1, 'rgba(15,53,34,.82)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 62);
    ctx.font = `400 15px ${fuentes.rotulador}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(dia === 0 ? 'Lunes 13-O' : dia === 1 ? '¿Y si…?' : 'La que queremos', 14, 18);
    // La tiza: una barra con forma de tiza que se gasta.
    const tx = 14, ty = 32, tw = 150, th = 14;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; rr(ctx, tx, ty, tw, th, 7); ctx.fill();
    const k = clamp((trazando ? trazando.base - trazando.gasto : tiza) / TIZA_MAX, 0, 1);
    const anchoT = (tw * TIZA_MAX) / 980;
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, tx, ty, anchoT, th, 7); ctx.fill();
    ctx.fillStyle = k < 0.2 ? '#ffb3b3' : '#f7f8f3'; rr(ctx, tx, ty, Math.max(th, anchoT * k), th, 7); ctx.fill();
    ctx.fillStyle = 'rgba(15,53,34,.25)'; for (let i = 1; i < 6; i++) ctx.fillRect(tx + (anchoT * k * i) / 6, ty + 3, 1, th - 6);
    ctx.font = `700 10px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
    ctx.fillText(cfg.horas ? 'TIZA = TU TIEMPO · con horas para preparar' : 'TIZA = TU TIEMPO · sin un hueco libre', tx, ty + th + 9);
    // Contador de alumnado alcanzado.
    const total = ninos.length;
    icono(ctx, 'bombilla', W - 150, 26, 24);
    ctx.font = `800 28px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'left';
    ctx.fillText(`${llegados}`, W - 134, 28);
    const wN = ctx.measureText(`${llegados}`).width;
    ctx.font = `700 15px ${fuentes.display}`; ctx.fillStyle = 'rgba(247,248,243,.7)'; ctx.fillText(`/${total}`, W - 132 + wN, 31);
    const prog = fase === 'juego' ? reloj / D.dur : fase === 'fin' ? 1 : 0;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, 60, W, 3);
    ctx.fillStyle = prog > 0.85 ? C.margen : C.amarillo; ctx.fillRect(0, 60, W * prog, 3);
    if (combo >= 2 && comboT > 0) {
      ctx.save(); ctx.translate(W - 150, 80); ctx.rotate(-0.06);
      ctx.font = `400 ${18 + Math.min(combo, 8) * 2}px ${fuentes.rotulador}`; ctx.textAlign = 'left';
      ctx.lineWidth = 4; ctx.strokeStyle = C.honda; ctx.strokeText(`COMBO x${combo}`, 0, 0); ctx.fillStyle = C.amarillo; ctx.fillText(`COMBO x${combo}`, 0, 0);
      ctx.restore();
    }
  }

  function dibujaRotulo(ctx) {
    const o = rotuloActual;
    const k = ease.outBack(clamp(o.t / 0.35, 0, 1));
    const fuera = clamp((o.t - 2.2) / 0.4, 0, 1);
    ctx.save();
    ctx.globalAlpha = 1 - fuera;
    ctx.translate(W / 2, 104 - fuera * 20);
    ctx.scale(0.55 + 0.35 * k, 0.55 + 0.35 * k);
    ctx.rotate(-0.04);
    ctx.font = `400 26px ${fuentes.rotulador}`;
    const w = Math.min(W - 24, ctx.measureText(o.txt).width + 40);
    ctx.fillStyle = 'rgba(15,53,34,.93)';
    ctx.beginPath(); ctx.moveTo(-w / 2, -23); ctx.lineTo(w / 2 + 6, -27); ctx.lineTo(w / 2, 21); ctx.lineTo(-w / 2 - 6, 25); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.txt, 0, 0, w - 24);
    if (o.sub) {
      ctx.rotate(0.04);
      ctx.font = `700 13.5px ${fuentes.texto}`;
      const ws = Math.min(W - 30, ctx.measureText(o.sub).width + 24);
      ctx.fillStyle = 'rgba(247,248,243,.96)'; rr(ctx, -ws / 2, 30, ws, 26, 13); ctx.fill();
      ctx.fillStyle = C.honda; ctx.fillText(o.sub, 0, 43.5, ws - 16);
    }
    ctx.restore();
  }

  function dibujaTutorial(ctx) {
    // Un dedo fantasma traza un camino por dos manos de ejemplo.
    const k = (juego.t % 2.2) / 2.2;
    const pts = [[profe.fx, profe.fy], [-40, 60], [70, 140]].map(([a, b]) => aPantalla(a, b));
    const seg = k < 0.5 ? 0 : 1, kk = (k % 0.5) / 0.5;
    const x = lerp(pts[seg][0], pts[seg + 1][0], ease.inOutCubic(kk)), y = lerp(pts[seg][1], pts[seg + 1][1], ease.inOutCubic(kk));
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    if (seg === 1) ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2; circulo(ctx, x, y + 26, 15); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(15,53,34,.9)'; rr(ctx, W / 2 - 165, 72, 330, 56, 18); ctx.fill();
    ctx.font = `700 14px ${fuentes.texto}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Dibuja con el dedo el camino de tu profe', W / 2, 90);
    ctx.fillText('por las manos levantadas. La tiza es tu tiempo.', W / 2, 110);
    ctx.restore();
  }

  function dibujaFin(ctx) {
    // La pizarra del fondo resume la clase y un sello marca cuántos has alcanzado.
    const [bx0, by] = aPantalla(-190, FONDO), [bx1] = aPantalla(190, FONDO);
    const px = (bx0 + bx1) / 2, py = P.techo + 38;
    const escrito = clamp(tf / 1.6, 0, 1);
    const frase = dia === 0 ? [`${resumen.total} EN CLASE.`, 'PEDIMOS: 15.'] : [elegidas.map(id => REIVINDICACIONES[id].titulo.toUpperCase()).slice(0, 2).join(' + '), `${resumen.llegados} DE ${resumen.total}`];
    ctx.save(); ctx.beginPath(); ctx.rect(px - 72, py, 144 * escrito, 62); ctx.clip();
    ctx.fillStyle = '#244f3a'; rr(ctx, px - 72, py, 144, 62, 3); ctx.fill();
    ctx.font = `400 12px ${fuentes.rotulador}`; ctx.fillStyle = '#f7f8f3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(frase[0], px, py + 20, 136); ctx.fillText(frase[1], px, py + 42, 136);
    ctx.restore();
    if (tf < 0.6) return;
    const k = ease.outBack(clamp((tf - 0.6) / 0.4, 0, 1));
    const todos = resumen.llegados === resumen.total;
    ctx.save(); ctx.translate(W / 2, H * 0.5); ctx.rotate(-0.08); ctx.scale(2 - k, 2 - k); ctx.globalAlpha = clamp(k * 1.5, 0, 1);
    ctx.fillStyle = 'rgba(15,53,34,.9)'; rr(ctx, -130, -64, 260, 128, 14); ctx.fill();
    ctx.strokeStyle = todos ? C.amarillo : C.papel; ctx.lineWidth = 4; rr(ctx, -136, -70, 272, 140, 18); ctx.stroke();
    ctx.font = `400 18px ${fuentes.rotulador}`; ctx.fillStyle = todos ? C.amarillo : C.papel; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(todos ? '¡A TODO EL MUNDO!' : '¡RIIIING!', 0, -40);
    ctx.font = `800 54px ${fuentes.display}`; ctx.fillStyle = C.amarillo;
    ctx.fillText(`${resumen.llegados}/${resumen.total}`, 0, 6);
    ctx.font = `600 13px ${fuentes.texto}`; ctx.fillStyle = C.papel;
    ctx.fillText(mejorCombo >= 2 ? `alumnado alcanzado · mejor combo x${mejorCombo}` : 'alumnado alcanzado', 0, 44);
    ctx.restore();
    if (tf > 1.4) {
      const lineaInfo = dia === 0 ? `No es por ti: ${resumen.total} en clase, ${papeles.total} papeles, ${Math.round(temp)} °C y ni un hueco libre.` : dia === 1 ? `El lunes: ${est.aulas[0]?.llegados ?? '?'} de ${est.aulas[0]?.total ?? '?'}. ${elegidas.map(id => REIVINDICACIONES[id].efecto).join(' ')}` : 'Así sería un aula con lo que pide la huelga. Todavía no es así.';
      ctx.save(); ctx.globalAlpha = clamp((tf - 1.4) * 3, 0, 1);
      ctx.font = `700 14px ${fuentes.texto}`;
      const lineas = partir(ctx, lineaInfo, W - 64);
      const alto = lineas.length * 19 + 20;
      ctx.fillStyle = 'rgba(247,248,243,.96)'; rr(ctx, 24, H * 0.5 + 92, W - 48, alto, 14); ctx.fill();
      ctx.fillStyle = C.honda; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      lineas.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.5 + 102 + i * 19));
      ctx.restore();
      if (tf > 2.4) {
        ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
        ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = C.honda; ctx.strokeText('Toca para seguir', W / 2, H - 50); ctx.fillText('Toca para seguir', W / 2, H - 50);
        ctx.globalAlpha = 1;
      }
    }
  }
  function partir(ctx, t, ancho) {
    const out = []; let l = '';
    for (const p of t.split(' ')) { const pr = l ? l + ' ' + p : p; if (ctx.measureText(pr).width > ancho && l) { out.push(l); l = p; } else l = pr; }
    if (l) out.push(l);
    return out;
  }
}
