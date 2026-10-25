// Modo Mani (v2): corredor en perspectiva detrás de la multitud.
// Arrastra a izquierda y derecha. Puertas que suman o multiplican, «día sin sueldo» que hace que la gente
// se descuelgue (salvo que hayas pasado por la caja de resistencia), obras que estrechan la calle,
// grupos que se suman desde las aceras y, en cada glorieta, dos pancartas: solo cabe una.
// La mani 2 acaba al atardecer ante la Consejería con el cántico al ritmo.
import { TAU, clamp, lerp, damp, ease, rr, circulo, elipse, fuentes, azar, alfa, formatoNum, mezcla } from './util.js';
import { dibujaPersona, personaAzar, PROFES, conCamisetaVerde, spritePersona, pintaSprite, PAL, dibujaCorroMini } from './personajes.js';
import { icono } from './iconos.js';
import { C, rotulo, crearParticulas, pancarta, cartel } from './ui.js';
import { crearHumo, etalonar, crearSacudida } from './fx.js';
import { REIVINDICACIONES, IDS, ACTUAL } from './datos.js';
import { CANTICO, eventosFrase } from './cantico.js';

const V = 108; // avance de la mani (unidades de mundo por segundo)
const CALZADA = 125; // media anchura transitable
const FACHADA = 178; // donde empiezan los edificios
const FILA = 15, SEP = 21; // separación entre filas y entre personas
const VISIBLES_MAX = 230;
const POR_SPRITE = 6; // cada figura representa a unas cuantas personas
const ESC_SPRITE = 1.4; // resolución de la caché de figuras

export function escenaMani(juego, { n = 1 }) {
  const { W } = juego;
  const est = juego.estado;
  const r = azar(900 + n * 31 + (est.inicio % 1000));
  const part = crearParticulas();
  const humo = crearHumo(320);
  const sacudida = crearSacudida(juego.reducido);
  let H = juego.H;

  // ---------- Cámara en perspectiva ----------
  const cam = { d: 0, x: 0, horizonte: 0, F: 0, h: 0, zLider: 470, lleno: 0 };
  function disponerCamara() {
    H = juego.H;
    cam.horizonte = H * 0.2;
    // Con poca gente la cabecera va más abajo y la calle no se ve vacía; al crecer, la cámara se eleva.
    const yLider = H * lerp(0.64, 0.5, cam.lleno);
    cam.F = (W * 0.41 * cam.zLider) / CALZADA;
    cam.h = ((yLider - cam.horizonte) * cam.zLider) / cam.F;
  }
  disponerCamara();
  // Proyecta un punto del mundo (x lateral, d hacia delante, h altura) a la pantalla: [x, y, escala, z].
  function proy(x, d, h = 0) {
    const z = d - cam.d;
    if (z < 40) return null;
    const s = cam.F / z;
    return [W / 2 + (x - cam.x) * s, cam.horizonte + (cam.h - h) * s, s, z];
  }

  // ---------- Luz de la escena (la mani del 22-O es al atardecer) ----------
  const tarde = n === 2;
  const cielo = tarde ? ['#3b2a5c', '#c4517a', '#f6a35c', '#ffd79a'] : ['#7fc3e8', '#a9d8ef', '#f6e7c0', '#ffeec4'];
  const luzBorde = tarde ? 'rgba(255,170,90,.55)' : 'rgba(255,240,200,.45)';

  // ---------- Pares de reivindicaciones ----------
  if (!est.ofrecidas.length) {
    // Si ya hay elegidas (por ejemplo, al probar una escena suelta), los pares se construyen alrededor de ellas.
    const ya = est.elegidas.slice(0, 2);
    const b = [...ya, ...r.barajar(IDS.filter(id => !ya.includes(id)))];
    est.ofrecidas = ya.length === 2 ? [[b[0], b[2]], [b[1], b[3]], [b[4], b[5]]] : [[b[0], b[1]], [b[2], b[3]], [b[4], b[5]]];
  }
  let pares;
  if (n === 1) pares = [est.ofrecidas[0], est.ofrecidas[1]];
  else {
    const dejadas = [...est.ofrecidas[0], ...est.ofrecidas[1]].filter(id => !est.elegidas.includes(id));
    pares = [est.ofrecidas[2], dejadas.length >= 2 ? dejadas.slice(0, 2) : est.ofrecidas[2]];
  }

  // ---------- Recorrido: cosas a lo largo de la calle, por distancia `d` ----------
  const cosas = [];
  const puerta = (d, izq, der) => cosas.push({ tipo: 'puerta', d, izq, der, hecha: false });
  const muro = d => cosas.push({ tipo: 'sueldo', d, hecha: false });
  const obras = (d, lado) => cosas.push({ tipo: 'obras', d, largo: 220, lado, hecha: false });
  const glorieta = (d, par, lugar) => cosas.push({ tipo: 'glorieta', d, par, lugar, hecha: false });
  const especial = (d, x, que) => cosas.push({ tipo: 'especial', d, x, que, hecha: false });
  const grupo = (d, x, cuantos) => cosas.push({ tipo: 'grupo', d, x, cuantos, hecha: false, gente: Array.from({ length: 6 }, () => personaAzar(r, r() < 0.2 ? 'niño' : r() < 0.2 ? 'mayor' : 'adulto')) });
  let dMeta;
  if (n === 1) {
    puerta(520, { op: '+', v: 60, txt: 'VECINAS' }, { op: '×', v: 2, txt: 'CLAUSTRO' });
    grupo(760, -150, 40); especial(880, 150, 'batucada');
    glorieta(1150, 0, 'Glorieta de Atocha');
    puerta(1560, { op: 'caja' }, { op: '+', v: 120, txt: 'AMPA' });
    grupo(1760, 150, 50);
    muro(1980);
    especial(2180, -150, 'perro');
    obras(2330, 1);
    puerta(2700, { op: '×', v: 2, txt: 'INSTITUTO' }, { op: '+', v: 220, txt: 'FAMILIAS' });
    glorieta(3080, 1, 'Plaza de Neptuno');
    especial(3330, -150, 'maestra');
    dMeta = 3650;
  } else {
    especial(380, 150, 'coro');
    puerta(560, { op: '+', v: 250, txt: 'BARRIO' }, { op: '×', v: 1.5, txt: 'ESTUDIANTES' });
    glorieta(980, 0, 'Plaza de Cibeles');
    puerta(1380, { op: '+', v: 300, txt: 'AMPAS' }, { op: 'caja' });
    grupo(1580, -150, 60);
    muro(1820);
    obras(2080, -1);
    especial(2300, 150, 'batucada');
    puerta(2520, { op: '×', v: 2, txt: 'ASAMBLEAS' }, { op: '+', v: 500, txt: 'FAMILIAS' });
    glorieta(2900, 1, 'Calle de Alcalá');
    dMeta = 3300;
  }
  const dConsejeria = dMeta + 420;

  // ---------- Fachadas madrileñas ----------
  const COLORES_FACHADA = ['#e8c9a0', '#d9a77d', '#efdcbc', '#c98f6a', '#e6d3b3', '#d7b48f', '#cfa07c'];
  const ROPA_VECINA = ['#e0566c', '#5b8fd6', '#ffcf33', '#86cd55', '#a77fd6'];
  const bloques = [];
  for (const lado of [-1, 1]) {
    let d = -200;
    while (d < dConsejeria + 400) {
      const largo = 140 + r() * 150;
      bloques.push({ lado, d0: d, d1: d + largo, alto: 170 + r() * 120, color: r.uno(COLORES_FACHADA), pancarta: r() < 0.35, bandera: r() < 0.5, vecinos: r() < 0.6, semilla: Math.floor(r() * 100), ropa: r.uno(ROPA_VECINA) });
      d += largo + 24 + r() * 30; // calle lateral entre bloques
    }
  }

  // ---------- La multitud ----------
  const profeP = conCamisetaVerde(PROFES[est.profe || 0]);
  const lider = { x: 0, d: 0, paso: 0, vx: 0 };
  let personas = n === 1 ? 40 : Math.max(200, est.mani.ultima || 400);
  let contador = personas;
  let escudo = false; // caja de resistencia
  const VARIANTES = [];
  for (let i = 0; i < 40; i++) {
    const base = personaAzar(azar(500 + i), i % 7 === 0 ? 'mayor' : i % 5 === 1 ? 'niño' : 'adulto');
    const p = i < 28 ? conCamisetaVerde(base) : base;
    if (i < 28 && i % 5 === 3) p.ropa = PAL.amarillo;
    if (i < 28 && i % 6 === 4) { p.ropa = '#f7f8f3'; p.marea = true; }
    VARIANTES.push(p);
  }
  const BENGALAS = ['rgba(134,205,85,.38)', 'rgba(255,207,51,.34)'];
  const miembros = [];
  function nuevoMiembro(desde) {
    const m = { var: r.entero(0, VARIANTES.length - 1), fase: r(), puño: r() < 0.4, x: desde ? desde.x : lider.x + (r() - 0.5) * 60, d: desde ? desde.d : lider.d - 40 - r() * 80, salto: 0, vj: 0, sale: 0, bengala: r() < 0.06 ? r.uno(BENGALAS) : null };
    miembros.push(m);
    return m;
  }
  function sincronizarVisibles(desde) {
    const objetivo = Math.min(juego.calidad ? VISIBLES_MAX : 130, Math.max(4, Math.round(personas / POR_SPRITE)));
    let vivos = miembros.filter(m => !m.sale).length;
    while (vivos < objetivo) { nuevoMiembro(desde && { x: desde.x + (r() - 0.5) * 50, d: desde.d + (r() - 0.5) * 30 }); vivos++; }
    let sobran = vivos - objetivo;
    for (let i = miembros.length - 1; i >= 0 && sobran > 0; i--) if (!miembros[i].sale) { miembros[i].sale = 0.001; sobran--; }
  }
  sincronizarVisibles();
  for (const m of miembros) { m.d = lider.d - 30 - r() * 120; m.x = (r() - 0.5) * 160; }
  const especiales = new Set(est.especiales);
  const perro = { activo: especiales.has('perro'), x: 30, d: -10, paso: 0 };
  const pancartas = [...est.elegidas]; // las que ya lleva la cabecera
  const elegidasAqui = [];

  // ---------- Estado ----------
  let fase = 'intro'; // intro → marcha → llegada → (ritmo → cierre)
  let tf = 0;
  let rotuloActual = null;
  let ritmo = null;
  let ventanas = 0;
  let ola = []; // ondas de brazos en alto
  const total = () => Math.round(personas);
  const decir = (txt, sub = '', color = C.amarillo) => { rotuloActual = { t: 0, txt, sub, color }; };

  // ---------- Lógica ----------
  function cambiarPersonas(nuevo, origen) {
    const antes = personas;
    personas = Math.max(20, nuevo);
    const dif = Math.round(personas - antes);
    sincronizarVisibles(dif > 0 ? origen : null);
    if (dif > 0) juego.audio.sfx('suma', { n: miembros.length });
    return dif;
  }

  function pasarPuerta(c) {
    const izq = lider.x < 0;
    const lado = izq ? c.izq : c.der;
    c.hecha = true; c.elegido = izq ? 'izq' : 'der';
    if (lado.op === 'caja') {
      escudo = true;
      juego.audio.sfx('pancarta');
      decir('CAJA DE RESISTENCIA', 'Si descuentan el día, nadie se queda en casa', C.amarillo);
      sacudida.golpe(4);
      return;
    }
    const dif = cambiarPersonas(lado.op === '×' ? personas * lado.v : personas + lado.v, { x: lider.x, d: lider.d + 10 });
    juego.audio.sfx(lado.op === '×' ? 'grande' : 'bombilla', { racha: 3 });
    const p = proy(lider.x, lider.d + 30, 40);
    if (p) part.texto(p[0], p[1] - 40, `+${formatoNum(dif)}`, { color: C.amarillo, tam: 30, vida: 1.2, vy: -60 });
    sacudida.golpe(lado.op === '×' ? 7 : 4);
    if (lado.op === '×') for (const m of miembros) if (r() < 0.25) m.bengala = m.bengala || BENGALAS[0];
  }

  function pasarMuro(c) {
    c.hecha = true;
    if (escudo) {
      escudo = false;
      decir('¡LA CAJA AGUANTA!', 'La caja reparte el día perdido. No se baja nadie.', C.marea);
      juego.audio.sfx('pancarta');
      for (let i = 0; i < 3; i++) part.confeti(W / 2 + (i - 1) * 90, H * 0.45, 16);
      return;
    }
    const antes = personas;
    cambiarPersonas(personas * 0.65);
    decir('DÍA SIN SUELDO', `Cada día de huelga se descuenta: se bajan ${formatoNum(antes - personas)}`, '#ff9a9a');
    juego.audio.sfx('apaga');
    sacudida.golpe(10);
  }

  function pasarObras(c) {
    c.hecha = true;
    // Si la cabecera entra por el lado cerrado, se queda gente atrás.
    const malLado = c.lado > 0 ? lider.x > -10 : lider.x < 10;
    if (!malLado) { juego.audio.sfx('toque'); return; }
    const antes = personas;
    cambiarPersonas(personas * 0.8);
    decir('¡OBRAS!', `Fase 3 de 12. Se quedan atrás ${formatoNum(antes - personas)}`, '#ffb36b');
    juego.audio.sfx('montonCae'); sacudida.golpe(6);
  }

  function pasarGlorieta(c) {
    c.hecha = true;
    const ids = pares[c.par];
    const id = lider.x < 0 ? ids[0] : ids[1];
    elegidasAqui.push(id);
    est.elegidas.push(id);
    pancartas.push(id);
    c.elegida = id;
    cambiarPersonas(personas + 80, { x: lider.x, d: lider.d });
    const R = REIVINDICACIONES[id];
    decir(`PANCARTA: ${R.titulo.toUpperCase()}`, R.ysi, C.amarillo);
    juego.audio.sfx('pancarta');
    sacudida.golpe(5);
    for (let i = 0; i < 2; i++) part.confeti(W / 2 + (i ? 70 : -70), H * 0.42, 26);
  }

  function pasarEspecial(c) {
    c.hecha = true;
    if (Math.abs(lider.x - c.x) > 95) { c.perdido = true; return; }
    c.unido = true;
    if (c.que === 'perro') { perro.activo = true; especiales.add('perro'); decir('¡GUAU!', 'Se suma un perro con pañuelo verde', C.marea); juego.audio.sfx('huevo'); return; }
    if (c.que === 'maestra') { cambiarPersonas(personas + 30); decir('«40 AÑOS DE MAESTRA»', 'Se suma una maestra jubilada', C.amarillo); juego.audio.sfx('huevo'); return; }
    especiales.add(c.que);
    juego.audio.capa(c.que, true);
    cambiarPersonas(personas + 60, { x: c.x * 0.5, d: lider.d });
    decir(c.que === 'batucada' ? '¡SE SUMA LA BATUCADA!' : '¡SE SUMA EL CORO ROCIERO!', c.que === 'batucada' ? 'Escucha cómo suena ahora' : 'Con peinetas y castañuelas', C.amarillo);
    juego.audio.sfx('pancarta');
  }

  function pasarGrupo(c) {
    c.hecha = true;
    if (Math.abs(lider.x - c.x) > 100) { c.perdido = true; return; }
    c.unido = true;
    const dif = cambiarPersonas(personas + c.cuantos, { x: c.x, d: c.d });
    const p = proy(c.x, c.d + 40, 50);
    if (p) part.texto(p[0], p[1], `+${dif}`, { color: C.papel, tam: 22 });
  }

  function actualizarMarcha(dt) {
    const e = juego.entrada;
    const pl = proy(lider.x, lider.d);
    if (e.abajo && pl) {
      const tx = cam.x + (e.x - W / 2) / pl[2];
      lider.vx = damp(lider.vx, clamp((tx - lider.x) * 9, -420, 420), 14, dt);
    } else lider.vx = damp(lider.vx, 0, 8, dt);
    lider.x = clamp(lider.x + lider.vx * dt, -CALZADA + 14, CALZADA - 14);
    lider.d += V * dt;
    lider.paso += dt * 2.2;
    // Las fuentes de las glorietas no se pueden atravesar.
    for (const c of cosas) if (c.tipo === 'glorieta' && Math.abs(lider.d - c.d) < 70 && Math.abs(lider.x) < 66) lider.x = lider.x < 0 ? -66 : 66;
    for (const c of cosas) {
      if (c.hecha || lider.d < c.d) continue;
      if (c.tipo === 'puerta') pasarPuerta(c);
      else if (c.tipo === 'sueldo') pasarMuro(c);
      else if (c.tipo === 'obras') pasarObras(c);
      else if (c.tipo === 'glorieta') pasarGlorieta(c);
      else if (c.tipo === 'especial') pasarEspecial(c);
      else if (c.tipo === 'grupo') pasarGrupo(c);
    }
    if (lider.d >= dMeta) llegar();
  }

  function anchoEn(d) {
    for (const c of cosas) {
      if (c.tipo === 'obras' && d > c.d - 40 && d < c.d + c.largo) return c.lado > 0 ? [-CALZADA, -10] : [10, CALZADA];
      if (c.tipo === 'glorieta' && Math.abs(d - c.d) < 75) return lider.x < 0 ? [-CALZADA, -64] : [64, CALZADA];
    }
    if (fase !== 'marcha' && n === 2) return [-190, 190];
    return [-CALZADA, CALZADA];
  }

  function actualizarMiembros(dt) {
    const vivos = miembros.filter(m => !m.sale);
    const filasPancarta = pancartas.length * 2.2;
    const [a0, a1] = anchoEn(lider.d - 30);
    const porFila = clamp(Math.floor((a1 - a0 - 10) / SEP), 3, 11);
    vivos.forEach((m, idx) => {
      const fila = Math.floor(idx / porFila) + 1 + filasPancarta;
      const col = idx % porFila;
      const enFila = Math.min(porFila, vivos.length - Math.floor(idx / porFila) * porFila);
      const td = lider.d - 18 - fila * FILA + Math.sin(m.fase * 9) * 3;
      const [b0, b1] = anchoEn(td);
      const ancho = Math.min(b1 - b0 - 16, enFila * SEP);
      const centro = clamp(lider.x, b0 + ancho / 2 + 8, b1 - ancho / 2 - 8);
      const tx = centro + (enFila > 1 ? (col / (enFila - 1) - 0.5) * ancho : 0) + Math.cos(m.fase * 7) * 3;
      m.x = damp(m.x, tx, 5, dt);
      m.d = damp(m.d, td, 4, dt);
      m.paso = (m.paso || m.fase) + dt * 2.2;
      if (m.salto > 0 || m.vj) { m.vj -= 900 * dt; m.salto = Math.max(0, m.salto + m.vj * dt); if (m.salto === 0) m.vj = 0; }
    });
    // Quienes se descuelgan se paran y se van quedando atrás.
    for (let k = miembros.length - 1; k >= 0; k--) { const m = miembros[k]; if (m.sale) { m.sale += dt; m.x += (m.x < 0 ? -40 : 40) * dt; if (m.sale > 2.2) miembros.splice(k, 1); } }
    if (perro.activo) { perro.x = damp(perro.x, lider.x + 24, 4, dt); perro.d = damp(perro.d, lider.d - 4, 4, dt); perro.paso += dt * 6; }
    // Humo de las bengalas.
    for (const m of vivos) if (m.bengala && r() < dt * (juego.calidad ? 5 : 2)) { const p = proy(m.x + 6, m.d, 62); if (p && p[1] < H + 20 && p[1] > H * 0.25) humo.emitir(p[0], p[1], m.bengala, 1, { esc: p[2] * 0.6, vy: -55, tam: 8, vida: 1.8 }); }
    ola = ola.filter(o => (o.t += dt) < 1.6);
  }
  const saltar = (prob = 0.4, fuerza = 220) => { for (const m of miembros) if (!m.sale && r() < prob && m.salto === 0) { m.vj = fuerza * (0.7 + r() * 0.5); m.salto = 0.01; } };

  function llegar() {
    fase = 'llegada'; tf = 0;
    est.mani.max = Math.max(est.mani.max, total());
    est.mani.ultima = total();
    est.especiales = [...especiales];
    if (n === 1) est.mani.n1 = total();
    juego.audio.sfx('silbato');
    saltar(0.8, 260);
    for (const m of miembros) if (r() < 0.2) m.bengala = m.bengala || r.uno(BENGALAS);
  }

  // ---------- Momento rítmico ----------
  function iniciarRitmo() {
    fase = 'ritmo'; tf = 0;
    const reloj = juego.audio.reloj();
    const ahora = juego.audio.tiempo();
    const corchea = 60 / (reloj.corriendo ? reloj.bpm : CANTICO.bpm) / 2;
    const frase = corchea * 16;
    let inicio, k;
    if (reloj.corriendo) { k = Math.ceil((ahora - reloj.inicio + 0.35) / frase); inicio = reloj.inicio + k * frase; }
    else { k = 0; inicio = ahora + 1.2; }
    const notas = [];
    for (let f = 0; f < 4; f++) {
      const nombre = CANTICO.orden[(k + f) % CANTICO.orden.length];
      for (const ev of eventosFrase(nombre, 0)) notas.push({ t: inicio + f * frase + ev.corchea * corchea, texto: ev.texto, fuerte: ev.fuerte, frase: f, estado: 'espera' });
    }
    ritmo = { inicio, frase, notas, aciertos: 0, total: notas.filter(x => x.fuerte).length, fin: inicio + 4 * frase, racha: 0, ultimoGolpe: -9 };
  }
  function actualizarRitmo() {
    const ahora = juego.audio.tiempo();
    const VENT = 0.17;
    for (const p of juego.entrada.pulsaciones) {
      const tA = p.teclado ? ahora : ahora - (performance.now() - p.t) / 1000;
      let mejor = null, md = VENT;
      for (const no of ritmo.notas) { if (!no.fuerte || no.estado !== 'espera') continue; const d = Math.abs(no.t - tA); if (d < md) { md = d; mejor = no; } }
      if (mejor) {
        mejor.estado = md < 0.085 ? 'perfecto' : 'bien';
        ritmo.aciertos++; ritmo.racha++;
        juego.audio.sfx('acierto', { f: 523 * 2 ** ((ritmo.racha % 5) * 2 / 12) });
        ola.push({ t: 0 });
        ventanas = Math.min(24, ventanas + 2);
        ritmo.ultimoGolpe = juego.t;
        cambiarPersonas(personas + 40 + ritmo.racha * 10);
        sacudida.golpe(3 + Math.min(5, ritmo.racha));
        if (ritmo.racha % 4 === 0) for (const m of miembros) if (r() < 0.12) m.bengala = m.bengala || BENGALAS[1];
        part.texto(W / 2 + (r() - 0.5) * 140, H * 0.36, mejor.estado === 'perfecto' ? '¡PERFECTO!' : '¡BIEN!', { color: mejor.estado === 'perfecto' ? C.amarillo : C.papel, tam: 22, vida: 0.7 });
      } else { ritmo.racha = 0; juego.audio.sfx('fallo'); }
    }
    for (const no of ritmo.notas) if (no.fuerte && no.estado === 'espera' && ahora - no.t > VENT) { no.estado = 'fallo'; ritmo.racha = 0; }
    if (ahora > ritmo.fin + 0.6) {
      fase = 'cierre'; tf = 0;
      est.ritmo = { aciertos: ritmo.aciertos, total: ritmo.total };
      est.mani.max = Math.max(est.mani.max, total());
      est.mani.ultima = total();
      juego.audio.sfx('puerta');
    }
  }

  // ---------- Escena ----------
  return {
    fondo: cielo[0],
    redimensionar: disponerCamara,
    info: () => ({ fase, tf, notas: ritmo ? ritmo.notas.filter(x => x.fuerte).map(x => x.t) : null }),
    entrar() {
      juego.audio.musica('mani', { reiniciar: true, capas: { batucada: especiales.has('batucada'), coro: especiales.has('coro'), canto: true } });
      juego.audio.multitud(0.25);
      decir(n === 1 ? 'MIÉRCOLES 14-O' : 'JUEVES 22-O · 18:00', n === 1 ? 'Primer día de huelga indefinida' : 'De Atocha a la Consejería', C.amarillo);
    },
    actualizar(dt) {
      tf += dt;
      part.actualizar(dt);
      sacudida.actualizar(dt);
      if (rotuloActual) { rotuloActual.t += dt; if (rotuloActual.t > 2.6) rotuloActual = null; }
      if (juego.debug) window.__bot = () => {
        // Bot de pruebas: coge la caja si no la tiene, la mejor puerta, evita las obras.
        const sig = cosas.filter(c => !c.hecha && c.d > lider.d).sort((a, b) => a.d - b.d)[0];
        window.__stats = { personas: total(), elegidas: est.elegidas, fase, escudo };
        if (!sig || fase !== 'marcha') return null;
        let x = 0;
        if (sig.tipo === 'puerta') { const val = l => l.op === 'caja' ? (escudo ? -1 : personas * 0.45) : l.op === '×' ? personas * (l.v - 1) : l.v; x = val(sig.izq) >= val(sig.der) ? -70 : 70; }
        else if (sig.tipo === 'obras') x = sig.lado > 0 ? -70 : 70;
        else if (sig.tipo === 'glorieta') x = sig.d % 2 ? -90 : 90;
        else if (sig.tipo === 'especial' || sig.tipo === 'grupo') x = sig.x * 0.8;
        const p = proy(x, lider.d);
        return p ? juego.aCss(p[0], H * 0.75) : null;
      };
      if (fase === 'intro') {
        if (tf > 0.9 && (juego.entrada.toques.length || juego.entrada.abajo)) { fase = 'marcha'; tf = 0; juego.audio.sfx('silbato'); }
      }
      if (fase === 'marcha') actualizarMarcha(dt);
      else if (n === 2 && fase !== 'intro') lider.x = damp(lider.x, 0, 2, dt);
      // La cámara sigue a la cabecera (y en el final se aleja un poco).
      cam.zLider = damp(cam.zLider, fase === 'ritmo' || fase === 'cierre' ? 560 : 470, 1.5, dt);
      cam.lleno = damp(cam.lleno, clamp(miembros.length / 110, 0, 1), 1.2, dt);
      disponerCamara();
      const dAntes = cam.d;
      cam.d = lider.d - cam.zLider;
      cam.x = damp(cam.x, lider.x * 0.45, 3, dt);
      // El humo fluye con la perspectiva al avanzar la cámara.
      const avance = cam.d - dAntes;
      if (avance) for (const p of humo.puffs) { const k = (p.y - cam.horizonte) / (cam.h * cam.F); p.y += (p.y - cam.horizonte) * k * avance; p.x += (p.x - W / 2) * k * avance; }
      humo.actualizar(dt, tarde ? 14 : 8);
      actualizarMiembros(dt);
      contador = damp(contador, personas, 4, dt);
      if (Math.floor(juego.t * 2) !== Math.floor((juego.t - dt) * 2)) juego.audio.multitud(clamp(0.2 + personas / 3500, 0.2, 1));
      if (fase === 'llegada') {
        if (tf > 0.6 && r() < dt * 2) saltar(0.15, 200);
        if (n === 2 && tf > 2.2) iniciarRitmo();
        else if (n === 1 && tf > 2.6 && juego.entrada.toques.length) juego.siguiente();
      } else if (fase === 'ritmo') { if (juego.debug) window.__ritmoInfo = () => ritmo; actualizarRitmo(); }
      else if (fase === 'cierre' && tf > 4.4 && juego.entrada.toques.length) juego.siguiente();
    },
    dibujar(ctx) {
      ctx.save();
      sacudida.aplicar(ctx, juego.t);
      dibujaCielo(ctx);
      dibujaSuelo(ctx);
      dibujaEscena(ctx);
      humo.dibujar(ctx);
      ctx.restore();
      etalonar(ctx, W, H, tarde ? { arriba: '#ff9a5c', abajo: '#5a3c8a', fuerza: 0.35, vineta: 0.42 } : { arriba: '#ffe2a0', abajo: '#86cd55', fuerza: 0.22, vineta: 0.3 });
      part.dibujar(ctx);
      dibujaHUD(ctx);
      if (rotuloActual) dibujaRotulo(ctx);
      if (fase === 'intro' && tf > 0.6) dibujaIntro(ctx);
      if (fase === 'llegada' && n === 1 && tf > 1) dibujaFinMani1(ctx);
      if (fase === 'ritmo') dibujaRitmo(ctx);
      if (fase === 'cierre') dibujaCierre(ctx);
    },
  };

  // ======================= Dibujo =======================
  function dibujaCielo(ctx) {
    const g = ctx.createLinearGradient(0, -20, 0, cam.horizonte + 30);
    g.addColorStop(0, cielo[0]); g.addColorStop(0.45, cielo[1]); g.addColorStop(0.8, cielo[2]); g.addColorStop(1, cielo[3]);
    ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, cam.horizonte + 60);
    // Sol.
    const sx = W * (tarde ? 0.72 : 0.78), sy = cam.horizonte * (tarde ? 0.86 : 0.38);
    const gs = ctx.createRadialGradient(sx, sy, 4, sx, sy, tarde ? 120 : 70);
    gs.addColorStop(0, tarde ? 'rgba(255,230,160,1)' : 'rgba(255,250,220,1)'); gs.addColorStop(0.2, tarde ? 'rgba(255,200,120,.7)' : 'rgba(255,245,200,.5)'); gs.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gs; ctx.fillRect(sx - 130, sy - 130, 260, 260);
    // Nubes alargadas.
    ctx.fillStyle = tarde ? 'rgba(255,190,170,.35)' : 'rgba(255,255,255,.55)';
    for (let i = 0; i < 4; i++) {
      const x = ((i * 137 + juego.t * (4 + i)) % (W + 200)) - 100, y = 18 + i * cam.horizonte * 0.17;
      elipse(ctx, x, y, 60 + i * 12, 7 + (i % 2) * 3); ctx.fill(); elipse(ctx, x + 30, y - 5, 34, 7); ctx.fill();
    }
    // Perfil de Madrid al fondo (cúpulas y torres).
    ctx.fillStyle = tarde ? 'rgba(80,50,90,.55)' : 'rgba(110,140,150,.45)';
    const hz = cam.horizonte + 6;
    ctx.beginPath(); ctx.moveTo(0, hz);
    const perfil = [[0, 10], [40, 14], [62, 30], [70, 30], [74, 44], [78, 30], [96, 26], [150, 18], [168, 34], [172, 52], [176, 34], [196, 22], [236, 20], [250, 38], [262, 38], [262, 48], [270, 48], [276, 56], [282, 48], [290, 48], [290, 38], [302, 38], [314, 22], [360, 16], [400, 12]];
    for (const [x, h] of perfil) ctx.lineTo((x / 400) * W, hz - h);
    ctx.lineTo(W, hz); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.43, hz - 52, 7, Math.PI, TAU); ctx.fill();
  }

  function cuad(ctx, a, b, c, d, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
  }

  function dibujaSuelo(ctx) {
    const hz = cam.horizonte;
    const cerca = cam.d + 41, lejos = cam.d + 8000;
    ctx.fillStyle = tarde ? '#6b5a6e' : '#a8a99f'; ctx.fillRect(-20, hz, W + 40, H - hz + 20);
    const banda = (x0, x1, color) => cuad(ctx, proy(x0, cerca), proy(x1, cerca), proy(x1, lejos), proy(x0, lejos), color);
    banda(-FACHADA, FACHADA, tarde ? '#9d8a86' : '#d4cbb8');
    banda(-CALZADA - 4, CALZADA + 4, tarde ? '#5e5568' : '#8f9893');
    // Reflejo del sol en el asfalto.
    const gl = ctx.createLinearGradient(0, hz, 0, H);
    gl.addColorStop(0, tarde ? 'rgba(255,170,100,.35)' : 'rgba(255,250,220,.25)'); gl.addColorStop(1, 'rgba(255,170,100,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, hz, W, H - hz);
    // Línea central discontinua y juntas de las baldosas.
    const paso = 60;
    for (let d = Math.floor(cerca / paso) * paso; d < cam.d + 2600; d += paso) {
      if (d - cam.d < 41) continue;
      if (Math.floor(d / paso) % 2 === 0) {
        const a = proy(-3, d), b = proy(3, d), c = proy(3, d + paso * 0.6), e = proy(-3, d + paso * 0.6);
        if (a && c) cuad(ctx, a, b, c, e, 'rgba(255,255,255,.5)');
      }
      ctx.strokeStyle = 'rgba(80,60,40,.12)'; ctx.lineWidth = 1;
      for (const lado of [-1, 1]) { const a = proy(lado * (CALZADA + 4), d), b = proy(lado * FACHADA, d); if (a && b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } }
    }
    // Pasos de cebra antes de cada glorieta.
    for (const c of cosas) if (c.tipo === 'glorieta') {
      for (let x = -CALZADA + 8; x < CALZADA - 8; x += 20) {
        const a = proy(x, c.d - 150), b = proy(x + 11, c.d - 150), cc = proy(x + 11, c.d - 128), e = proy(x, c.d - 128);
        if (a && cc) cuad(ctx, a, b, cc, e, 'rgba(255,255,255,.6)');
      }
    }
  }

  // Todo lo que tiene profundidad, ordenado de lejos a cerca.
  function dibujaEscena(ctx) {
    const lista = [];
    for (const b of bloques) if (b.d1 > cam.d + 40 && b.d0 < cam.d + 3200) lista.push({ z: Math.max(b.d0, cam.d + 41) - cam.d + 0.5, dib: () => dibujaBloque(ctx, b) });
    // Lo que la cabecera ya ha dejado atrás desaparece (salvo las vallas, que son largas).
    for (const c of cosas) if (c.d < cam.d + 3200 && (c.tipo === 'obras' ? c.d + c.largo > lider.d - 60 : c.d > lider.d - 30)) lista.push({ z: c.d - cam.d, dib: () => dibujaCosa(ctx, c) });
    if (n === 2) lista.push({ z: dConsejeria - cam.d, dib: () => dibujaConsejeria(ctx) });
    for (const m of miembros) { const z = m.d - cam.d; if (z > 40) lista.push({ z, dib: () => dibujaMiembro(ctx, m) }); }
    lista.push({ z: lider.d - cam.d - 0.1, dib: () => dibujaLider(ctx) });
    if (perro.activo) lista.push({ z: perro.d - cam.d, dib: () => dibujaPerro(ctx) });
    pancartas.forEach((id, i) => { const d = lider.d - 18 - (i + 0.9) * FILA * 2.2; lista.push({ z: d - cam.d - 0.2, dib: () => dibujaPancartaCabecera(ctx, id, d, i) }); });
    lista.sort((a, b) => b.z - a.z);
    let bruma = false;
    for (const o of lista) {
      if (!bruma && o.z < 1100) { dibujaBruma(ctx); bruma = true; }
      o.dib();
    }
    if (!bruma) dibujaBruma(ctx);
  }
  function dibujaBruma(ctx) {
    // Perspectiva aérea: lo lejano se funde con el cielo.
    const y1 = cam.horizonte + (cam.h * cam.F) / 1100;
    const g = ctx.createLinearGradient(0, cam.horizonte - 40, 0, y1);
    g.addColorStop(0, alfa(cielo[3], 0.65)); g.addColorStop(1, alfa(cielo[3], 0));
    ctx.fillStyle = g; ctx.fillRect(-20, cam.horizonte - 40, W + 40, y1 - cam.horizonte + 40);
  }

  function poli(ctx, pts, color, borde) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function dibujaBloque(ctx, b) {
    const x = b.lado * FACHADA;
    const d0 = Math.max(b.d0, cam.d + 41), d1 = b.d1;
    const A = proy(x, d0, 0), B = proy(x, d1, 0), Cc = proy(x, d1, b.alto), D = proy(x, d0, b.alto);
    if (!A || !B) return;
    const lit = tarde ? mezcla(b.color, '#ff9a6a', 0.25) : b.color;
    poli(ctx, [A, B, Cc, D], b.lado < 0 ? mezcla(lit, '#ffffff', 0.08) : mezcla(lit, '#3a2a40', 0.12));
    const E = proy(x, d0, b.alto - 10), F = proy(x, d1, b.alto - 10);
    poli(ctx, [D, Cc, F, E], mezcla(lit, '#0f1a14', 0.18));
    const sMed = (A[2] + B[2]) / 2;
    if (sMed < (juego.calidad ? 0.22 : 0.4)) return;
    // Ventanas con contraventanas verdes y balcones de forja.
    const pisos = Math.floor((b.alto - 40) / 44);
    for (let p = 0; p < pisos; p++) {
      const h0 = 26 + p * 44, h1 = h0 + 26;
      for (let d = b.d0 + 14; d < b.d1 - 22; d += 38) {
        if (d < cam.d + 45) continue;
        const v = [proy(x, d, h0), proy(x, d + 18, h0), proy(x, d + 18, h1), proy(x, d, h1)];
        if (v.some(q => !q)) continue;
        const enc = tarde && ((d * 7 + p * 13 + b.semilla) % 5) < 2;
        poli(ctx, v, enc ? '#ffd98a' : tarde ? '#4a3f5e' : '#5b6f78');
        if (sMed > 0.32) { const cv = [proy(x, d - 5, h0), v[0], v[3], proy(x, d - 5, h1)]; if (!cv.some(q => !q)) poli(ctx, cv, '#3f6b4c'); }
        if (sMed > 0.36 && p > 0 && (p + Math.floor(d / 38)) % 2 === 0) {
          const bal = [proy(x - b.lado * 6, d - 6, h0 - 2), proy(x - b.lado * 6, d + 24, h0 - 2), proy(x - b.lado * 6, d + 24, h0 + 9), proy(x - b.lado * 6, d - 6, h0 + 9)];
          if (!bal.some(q => !q)) {
            ctx.strokeStyle = 'rgba(20,20,25,.75)'; ctx.lineWidth = Math.max(0.6, sMed * 1.1);
            ctx.beginPath(); ctx.moveTo(bal[0][0], bal[0][1]); ctx.lineTo(bal[1][0], bal[1][1]); ctx.moveTo(bal[3][0], bal[3][1]); ctx.lineTo(bal[2][0], bal[2][1]);
            for (let k = 0; k <= 4; k++) { const t = k / 4; ctx.moveTo(lerp(bal[0][0], bal[1][0], t), lerp(bal[0][1], bal[1][1], t)); ctx.lineTo(lerp(bal[3][0], bal[2][0], t), lerp(bal[3][1], bal[2][1], t)); }
            ctx.stroke();
          }
          // Vecina asomada que aplaude.
          if (b.vecinos && ((d + p * 31 + b.semilla) % 4) < 1) {
            const q = proy(x - b.lado * 4, d + 9, h0 + 12);
            if (q) {
              const s = q[2] * 0.5;
              ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
              ctx.fillStyle = '#eab996'; circulo(ctx, 0, -12, 7); ctx.fill();
              ctx.fillStyle = b.ropa; ctx.fillRect(-7, -6, 14, 10);
              const ap = Math.sin(juego.t * 14 + d) * 3;
              ctx.fillStyle = '#eab996'; circulo(ctx, -5 + ap, -20, 3); ctx.fill(); circulo(ctx, 5 - ap, -20, 3); ctx.fill();
              ctx.restore();
            }
          }
        }
      }
    }
    // Pancarta colgada del balcón.
    if (b.pancarta && sMed > 0.3) {
      const dm = (b.d0 + b.d1) / 2;
      const q = [proy(x - b.lado * 3, dm - 40, 70), proy(x - b.lado * 3, dm + 40, 70), proy(x - b.lado * 3, dm + 40, 108), proy(x - b.lado * 3, dm - 40, 108)];
      if (!q.some(z => !z)) {
        poli(ctx, q, '#f7f8f3', 'rgba(15,53,34,.6)');
        const s = (q[0][2] + q[1][2]) / 2;
        ctx.save(); ctx.translate((q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2);
        ctx.transform(1, (q[1][1] - q[0][1]) / (q[1][0] - q[0][0] || 1), 0, 1, 0, 0);
        ctx.font = `400 ${11 * s}px ${fuentes.rotulador}`; ctx.fillStyle = '#174d32'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('EDUCACIÓN', 0, -6 * s); ctx.fillText('PÚBLICA', 0, 7 * s);
        ctx.restore();
      }
    }
    // Bandera verde con el corro.
    if (b.bandera && sMed > 0.28) {
      const dm = b.d0 + 30;
      const base = proy(x, dm, b.alto - 40), punta = proy(x - b.lado * 30, dm, b.alto - 30);
      if (base && punta) {
        ctx.strokeStyle = '#3b3b3b'; ctx.lineWidth = Math.max(1, sMed * 1.5); ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(punta[0], punta[1]); ctx.stroke();
        const ond = Math.sin(juego.t * 4 + b.semilla) * 4 * sMed;
        ctx.fillStyle = PAL.camiseta; ctx.beginPath(); ctx.moveTo(punta[0], punta[1]); ctx.lineTo(punta[0], punta[1] + 22 * sMed); ctx.quadraticCurveTo(punta[0] + b.lado * 14 * sMed, punta[1] + 18 * sMed + ond, punta[0] + b.lado * 28 * sMed, punta[1] + 20 * sMed); ctx.lineTo(punta[0] + b.lado * 28 * sMed, punta[1]); ctx.closePath(); ctx.fill();
        dibujaCorroMini(ctx, punta[0] + b.lado * 13 * sMed, punta[1] + 10 * sMed, 5 * sMed, '#ffffff');
      }
    }
  }

  // Puerta de pancarta: dos postes y una tela entre ellos.
  function arco(ctx, d, x0, x1, alto, color, lineas, ico) {
    const pa = proy(x0, d, 0), pb = proy(x1, d, 0), qa = proy(x0, d, alto), qb = proy(x1, d, alto);
    if (!pa || !pb) return;
    const s = pa[2];
    ctx.strokeStyle = '#7d5a3c'; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(qa[0], qa[1] - 4 * s); ctx.moveTo(pb[0], pb[1]); ctx.lineTo(qb[0], qb[1] - 4 * s); ctx.stroke();
    pancarta(ctx, lineas, (pa[0] + pb[0]) / 2, qa[1], pb[0] - pa[0], 52 * s, { t: juego.t, color, palos: false, icono: ico, semilla: (d % 7) + 1, tamMax: 60 });
  }

  function dibujaCosa(ctx, c) {
    if (c.tipo === 'puerta') {
      for (const [lado, x0, x1, nombre] of [[c.izq, -CALZADA + 4, -4, 'izq'], [c.der, 4, CALZADA - 4, 'der']]) {
        if (c.hecha && c.elegido !== nombre) continue;
        const color = lado.op === 'caja' ? '#ffcf33' : lado.op === '×' ? '#86cd55' : '#f7f8f3';
        const txt = lado.op === 'caja' ? ['CAJA DE', 'RESISTENCIA'] : [`${lado.op}${String(lado.v).replace('.', ',')}`, lado.txt];
        ctx.save(); if (c.hecha) ctx.globalAlpha = 0.5;
        arco(ctx, c.d, x0, x1, 92, color, txt, lado.op === 'caja' ? 'hucha' : null);
        ctx.restore();
      }
    } else if (c.tipo === 'sueldo') {
      arco(ctx, c.d, -CALZADA + 4, CALZADA - 4, 92, '#e0566c', ['DÍA SIN SUELDO'], 'euro');
      const p = proy(0, c.d, 22);
      if (p && !c.hecha) {
        ctx.font = `800 ${12 * p[2]}px ${fuentes.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3 * p[2]; ctx.strokeStyle = '#0f3522'; ctx.fillStyle = escudo ? C.amarillo : '#ffffff';
        const t = escudo ? 'la caja te cubre' : '−35 %';
        ctx.strokeText(t, p[0], p[1]); ctx.fillText(t, p[0], p[1]);
      }
    } else if (c.tipo === 'obras') {
      const x0 = c.lado > 0 ? -6 : -CALZADA, x1 = c.lado > 0 ? CALZADA : 6;
      for (let d = c.d + c.largo; d >= c.d; d -= 22) {
        const a = proy(x0, d, 0), b = proy(x1, d, 0), e = proy(x1, d, 26), f = proy(x0, d, 26);
        if (!a || !b) continue;
        poli(ctx, [a, b, e, f], 'rgba(201,183,154,.92)');
        const s = a[2];
        const borde = c.lado > 0 ? a : b;
        ctx.fillStyle = ((d / 22) | 0) % 2 ? '#f2b705' : '#16221b'; ctx.fillRect(borde[0] - 3 * s, borde[1] - 26 * s, 6 * s, 26 * s);
      }
      const p = proy(c.lado > 0 ? 60 : -60, c.d - 6, 40);
      if (p) cartel(ctx, ['OBRAS', 'FASE 3 DE 12'], p[0], p[1] + 30 * p[2], 70 * p[2], 32 * p[2], { t: juego.t, color: '#f2b705' });
    } else if (c.tipo === 'glorieta') {
      dibujaFuente(ctx, c);
      if (!c.hecha) pares[c.par].forEach((id, i) => grupoPancarta(ctx, id, i ? 92 : -92, c.d - 40));
      else { const i = pares[c.par].indexOf(c.elegida); grupoPancarta(ctx, pares[c.par][1 - i], i ? -92 : 92, c.d - 40, true); }
    } else if (c.tipo === 'especial' && !c.unido) dibujaEspecial(ctx, c);
    else if (c.tipo === 'grupo' && !c.unido) {
      const p = proy(c.x, c.d, 0);
      if (!p) return;
      const s = p[2] * 0.6;
      c.gente.forEach((per, i) => dibujaPersona(ctx, per, { x: p[0] + (i - c.gente.length / 2) * 15 * s * -Math.sign(c.x), y: p[1] + (i % 2) * 8 * s, esc: s, brazos: i % 2 ? 'saluda' : 'puño', expr: 'gritando', t: juego.t + i, luz: luzBorde }));
      ctx.font = `800 ${16 * s}px ${fuentes.display}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'center';
      ctx.lineWidth = 4 * s; ctx.strokeStyle = '#0f3522'; ctx.strokeText(`+${c.cuantos}`, p[0], p[1] - 76 * s); ctx.fillText(`+${c.cuantos}`, p[0], p[1] - 76 * s);
    }
  }

  function dibujaFuente(ctx, c) {
    const p = proy(0, c.d, 0);
    if (!p) return;
    const s = p[2];
    ctx.fillStyle = 'rgba(15,53,34,.25)'; elipse(ctx, p[0] + 6 * s, p[1] + 4 * s, 66 * s, 16 * s); ctx.fill();
    ctx.fillStyle = '#e8e2d4'; elipse(ctx, p[0], p[1], 64 * s, 15 * s); ctx.fill();
    ctx.fillStyle = '#d4cdbd'; ctx.fillRect(p[0] - 64 * s, p[1] - 12 * s, 128 * s, 12 * s);
    ctx.fillStyle = '#e8e2d4'; elipse(ctx, p[0], p[1] - 12 * s, 64 * s, 15 * s); ctx.fill();
    ctx.fillStyle = '#6fb7d6'; elipse(ctx, p[0], p[1] - 12 * s, 56 * s, 12 * s); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = 0; i < 3; i++) { const k = (juego.t * 0.6 + i / 3) % 1; ctx.globalAlpha = 1 - k; elipse(ctx, p[0], p[1] - 12 * s, 54 * s * k, 11 * s * k); ctx.fill(); }
    ctx.globalAlpha = 1;
    // Estatua en silueta.
    ctx.fillStyle = tarde ? '#5d4a5a' : '#cfc8b6'; ctx.strokeStyle = 'rgba(15,53,34,.7)'; ctx.lineWidth = 1.2;
    rr(ctx, p[0] - 10 * s, p[1] - 60 * s, 20 * s, 48 * s, 4 * s); ctx.fill(); ctx.stroke();
    circulo(ctx, p[0], p[1] - 70 * s, 9 * s); ctx.fill(); ctx.stroke();
    if (c.lugar.includes('Neptuno')) {
      ctx.lineWidth = 2.5 * s; ctx.beginPath();
      ctx.moveTo(p[0] + 14 * s, p[1] - 30 * s); ctx.lineTo(p[0] + 14 * s, p[1] - 96 * s);
      ctx.moveTo(p[0] + 8 * s, p[1] - 98 * s); ctx.lineTo(p[0] + 8 * s, p[1] - 90 * s); ctx.lineTo(p[0] + 20 * s, p[1] - 90 * s); ctx.lineTo(p[0] + 20 * s, p[1] - 98 * s);
      ctx.stroke();
    }
    if (c.lugar.includes('Cibeles')) for (const l of [-1, 1]) { elipse(ctx, p[0] + l * 18 * s, p[1] - 22 * s, 9 * s, 12 * s); ctx.fill(); ctx.stroke(); }
    ctx.font = `700 ${11 * Math.min(1.2, s)}px ${fuentes.texto}`;
    const tw = ctx.measureText(c.lugar).width + 14;
    ctx.fillStyle = '#244f3a'; rr(ctx, p[0] - tw / 2, p[1] - 128 * s - 10, tw, 18, 3); ctx.fill();
    ctx.fillStyle = '#f7f8f3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.lugar, p[0], p[1] - 128 * s - 1);
  }

  function dibujaEspecial(ctx, c) {
    const p = proy(c.x, c.d, 0);
    if (!p) return;
    const s = p[2] * 0.62;
    if (c.que === 'perro') { dibujaPerroEn(ctx, p[0], p[1], s * 1.3, true); return; }
    const tipos = { batucada: { n: 5, tambor: true }, coro: { n: 4, peineta: true }, maestra: { n: 1 } }[c.que];
    for (let i = 0; i < tipos.n; i++) {
      const per = c.que === 'maestra' ? { ...personaAzar(azar(77), 'mayor'), gafas: true } : tipos.peineta ? { ...personaAzar(azar(10 + i), 'adulto'), ropa: i % 2 ? '#e0566c' : '#16221b' } : conCamisetaVerde(personaAzar(azar(30 + i), 'adulto'));
      const px = p[0] + (i - (tipos.n - 1) / 2) * 18 * s, py = p[1] + (i % 2) * 6 * s;
      dibujaPersona(ctx, per, { x: px, y: py, esc: s, brazos: tipos.tambor ? 'arriba' : 'saluda', expr: 'feliz', t: juego.t + i, salto: Math.max(0, Math.sin(juego.t * 8 + i)) * 4 * s, luz: luzBorde });
      if (tipos.tambor) { ctx.fillStyle = '#e0566c'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.2; rr(ctx, px - 8 * s, py - 30 * s, 16 * s, 13 * s, 3 * s); ctx.fill(); ctx.stroke(); }
      if (tipos.peineta) { ctx.fillStyle = '#16221b'; ctx.beginPath(); ctx.arc(px, py - 60 * s, 10 * s, Math.PI, TAU); ctx.fill(); }
    }
    if (c.que === 'maestra') cartel(ctx, ['40 AÑOS', 'DE MAESTRA'], p[0] + 20 * s, p[1] - 58 * s, 62 * s, 30 * s, { t: juego.t });
    if (c.que === 'batucada') cartel(ctx, ['BATUCADA'], p[0], p[1] - 84 * s, 70 * s, 18 * s, { t: juego.t, color: '#ffcf33' });
    if (c.que === 'coro') cartel(ctx, ['CORO', 'ROCIERO'], p[0], p[1] - 84 * s, 60 * s, 26 * s, { t: juego.t, color: '#ffcf33' });
  }

  function grupoPancarta(ctx, id, x, d, despide = false) {
    const p = proy(x, d, 0);
    if (!p) return;
    const s = p[2] * 0.6;
    const R = REIVINDICACIONES[id];
    for (let i = 0; i < 6; i++) {
      const per = conCamisetaVerde(personaAzar(azar(id.length * 13 + i), i === 2 ? 'niño' : 'adulto'));
      dibujaPersona(ctx, per, { x: p[0] + ((i % 3) - 1) * 20 * s, y: p[1] + Math.floor(i / 3) * 10 * s, esc: s, brazos: despide ? 'saluda' : 'puño', expr: despide ? 'normal' : 'gritando', t: juego.t + i, luz: luzBorde });
    }
    pancarta(ctx, R.pancarta, p[0], p[1] - 66 * s, 120 * s, 40 * s, { t: juego.t, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1, tamMax: 40 });
    if (!despide && !juego.reducido) {
      const k = (Math.sin(juego.t * 5) + 1) / 2;
      ctx.fillStyle = 'rgba(255,207,51,.95)';
      ctx.beginPath(); ctx.moveTo(p[0] - 9, p[1] + 26 * s + 8 + k * 6); ctx.lineTo(p[0] + 9, p[1] + 26 * s + 8 + k * 6); ctx.lineTo(p[0], p[1] + 26 * s - 2 + k * 6); ctx.fill();
    }
  }

  function dibujaPancartaCabecera(ctx, id, d, i) {
    const p = proy(lider.x * 0.8, d, 70);
    if (!p) return;
    const R = REIVINDICACIONES[id];
    const s = p[2];
    ctx.strokeStyle = '#7d5a3c'; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(p[0] - 62 * s, p[1]); ctx.lineTo(p[0] - 62 * s, p[1] + 60 * s); ctx.moveTo(p[0] + 62 * s, p[1]); ctx.lineTo(p[0] + 62 * s, p[1] + 60 * s); ctx.stroke();
    pancarta(ctx, R.pancarta, p[0], p[1], 130 * s, 34 * s, { t: juego.t + i, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1, tamMax: 40, palos: false });
  }

  function dibujaMiembro(ctx, m) {
    const p = proy(m.x, m.d, 0);
    if (!p || p[1] > H + 90) return;
    const s = p[2] * 0.6;
    const frame = Math.floor(((m.paso || 0) * 4) % 4);
    // En la ola del cántico, los brazos se levantan fila a fila.
    const filaZ = (lider.d - m.d) / 120;
    const enOla = ola.some(o => Math.abs(o.t * 1.6 - filaZ) < 0.25);
    const brazos = enOla || fase === 'llegada' ? 'arriba' : m.puño ? 'puño' : 'abajo';
    const sp = spritePersona(VARIANTES[m.var], `m${m.var}f${frame}${brazos}${tarde ? 't' : 'd'}`, { vista: 'espalda', brazos, paso: frame / 4, t: m.fase * 3, expr: 'feliz', luz: luzBorde }, ESC_SPRITE);
    if (m.sale) ctx.globalAlpha = clamp(1 - m.sale / 2.2, 0, 1);
    pintaSprite(ctx, sp, p[0], p[1] - (m.salto + (enOla ? 6 : 0)) * s, s / ESC_SPRITE);
    ctx.globalAlpha = 1;
  }

  function dibujaLider(ctx) {
    const p = proy(lider.x, lider.d, 0);
    if (!p) return;
    const s = p[2] * 0.66;
    const salto = fase === 'llegada' || fase === 'ritmo' ? Math.max(0, Math.sin(juego.t * 8)) * 8 : 0;
    ctx.strokeStyle = 'rgba(255,207,51,.95)'; ctx.lineWidth = 3;
    elipse(ctx, p[0], p[1] + 2, 26 * s, 8 * s); ctx.stroke();
    if (escudo) { ctx.fillStyle = 'rgba(255,207,51,.22)'; elipse(ctx, p[0], p[1] - 30 * s, 34 * s, 44 * s); ctx.fill(); icono(ctx, 'hucha', p[0] + 24 * s, p[1] - 80 * s, 20 * s); }
    dibujaPersona(ctx, profeP, { x: p[0], y: p[1], esc: s, vista: 'espalda', brazos: 'puño', t: juego.t, paso: lider.paso, salto, luz: luzBorde });
    // Megáfono.
    ctx.fillStyle = '#ffcf33'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.3;
    ctx.save(); ctx.translate(p[0] + 15 * s, p[1] - (72 + salto) * s); ctx.rotate(-0.6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12 * s, -6 * s); ctx.lineTo(12 * s, 6 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  function dibujaPerro(ctx) { const p = proy(perro.x, perro.d, 0); if (p) dibujaPerroEn(ctx, p[0], p[1], p[2] * 0.8, false); }
  function dibujaPerroEn(ctx, x, y, s, deFrente) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(15,53,34,.2)'; elipse(ctx, 0, 2, 12, 4); ctx.fill();
    ctx.fillStyle = '#b07a48'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
    for (const l of [-6, 6]) { rr(ctx, l - 2, -6 + Math.sin(juego.t * 10 + l) * 1.5, 4, 8, 2); ctx.fill(); ctx.stroke(); }
    elipse(ctx, 0, -10, 11, 7); ctx.fill(); ctx.stroke();
    circulo(ctx, 0, -19, 6.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a5a3c'; elipse(ctx, -6, -21, 2.6, 4.5, 0.4); ctx.fill(); elipse(ctx, 6, -21, 2.6, 4.5, -0.4); ctx.fill();
    ctx.fillStyle = '#5fb84a'; ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(6, -14); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b07a48'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(10, -12); ctx.quadraticCurveTo(15, -16 + Math.sin(juego.t * 14) * 4, 14, -22); ctx.stroke();
    if (deFrente) { ctx.fillStyle = '#0f3522'; circulo(ctx, -2.2, -20, 1); ctx.fill(); circulo(ctx, 2.2, -20, 1); ctx.fill(); circulo(ctx, 0, -17, 1.4); ctx.fill(); }
    ctx.restore();
  }

  function dibujaConsejeria(ctx) {
    // Fachada de frente al final de la calle; sus ventanas se encienden con cada acierto.
    const d = dConsejeria;
    const A = proy(-FACHADA - 40, d, 0), B = proy(FACHADA + 40, d, 0), Cc = proy(FACHADA + 40, d, 230), D = proy(-FACHADA - 40, d, 230);
    if (!A) return;
    const s = A[2];
    poli(ctx, [A, B, Cc, D], tarde ? '#e3b48f' : '#e9dfc9');
    ctx.fillStyle = 'rgba(80,40,60,.18)'; ctx.fillRect(D[0], D[1], Cc[0] - D[0], 24 * s);
    ctx.fillStyle = '#f7f8f3'; rr(ctx, (A[0] + B[0]) / 2 - 110 * s, D[1] + 4 * s, 220 * s, 16 * s, 2 * s); ctx.fill();
    ctx.font = `700 ${11 * s}px ${fuentes.texto}`; ctx.fillStyle = '#4a594f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CONSEJERÍA DE EDUCACIÓN', (A[0] + B[0]) / 2, D[1] + 12.5 * s);
    const cols = 8, filas = 3;
    for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
      const x = -FACHADA - 10 + c * ((2 * FACHADA + 20) / (cols - 1)) - 12, h = 70 + f * 52;
      const q = proy(x, d - 1, h + 36), w = 24 * s, hh = 36 * s;
      if (!q) continue;
      const i = f * cols + c;
      const encendida = i < ventanas;
      ctx.fillStyle = '#0f3522'; rr(ctx, q[0] - 2, q[1] - 2, w + 4, hh + 4, 2); ctx.fill();
      ctx.fillStyle = encendida ? '#ffe28a' : '#55606e'; rr(ctx, q[0], q[1], w, hh, 2); ctx.fill();
      const bajada = fase === 'cierre' && i === 11 ? clamp(tf / 2 - 0.3, 0, 1) : encendida ? 0.3 : 0.6;
      ctx.fillStyle = '#cbbd9e'; ctx.fillRect(q[0], q[1], w, hh * bajada);
      if (fase === 'cierre' && i === 11 && tf > 0.4 && tf < 1.5) { ctx.fillStyle = 'rgba(15,53,34,.6)'; circulo(ctx, q[0] + w / 2, q[1] + hh * 0.7, 6 * s); ctx.fill(); }
    }
    const pq = proy(-34, d - 1, 92);
    if (pq) {
      ctx.fillStyle = '#5a3c27'; rr(ctx, pq[0], pq[1], 68 * s, 92 * s, 30 * s); ctx.fill();
      ctx.strokeStyle = '#3e2818'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pq[0] + 34 * s, pq[1] + 10 * s); ctx.lineTo(pq[0] + 34 * s, pq[1] + 92 * s); ctx.stroke();
      ctx.fillStyle = '#d6a93a'; circulo(ctx, pq[0] + 28 * s, pq[1] + 52 * s, 3 * s); ctx.fill(); circulo(ctx, pq[0] + 40 * s, pq[1] + 52 * s, 3 * s); ctx.fill();
    }
  }

  // ---------- Interfaz ----------
  function dibujaHUD(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 86);
    g.addColorStop(0, 'rgba(15,53,34,.88)'); g.addColorStop(1, 'rgba(15,53,34,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 86);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `700 10.5px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.85)';
    ctx.fillText('SEGÚN LA ORGANIZACIÓN', 14, 20);
    ctx.font = `800 34px ${fuentes.display}`; ctx.fillStyle = C.amarillo;
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.strokeText(formatoNum(contador), 14, 54); ctx.fillText(formatoNum(contador), 14, 54);
    ctx.font = `700 10.5px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.6)';
    ctx.fillText('SEGÚN LA COMUNIDAD', 200, 20);
    ctx.font = `800 20px ${fuentes.display}`;
    ctx.fillText(formatoNum(Math.floor(contador * ACTUAL.factorComunidad.valor)), 200, 44);
    if (escudo) { icono(ctx, 'hucha', 290, 38, 20); ctx.font = `700 10px ${fuentes.texto}`; ctx.fillStyle = C.amarillo; ctx.fillText('caja', 302, 42); }
    if (fase === 'marcha') {
      const k = clamp(lider.d / dMeta, 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, 200, 54, 130, 5, 2.5); ctx.fill();
      ctx.fillStyle = C.marea; rr(ctx, 200, 54, 130 * k, 5, 2.5); ctx.fill();
      for (const c of cosas) if (c.tipo === 'glorieta') { ctx.fillStyle = c.hecha ? C.amarillo : C.papel; circulo(ctx, 200 + 130 * (c.d / dMeta), 56.5, 4); ctx.fill(); }
    }
  }

  function dibujaRotulo(ctx) {
    const o = rotuloActual;
    const k = ease.outBack(clamp(o.t / 0.35, 0, 1));
    const fuera = clamp((o.t - 2.2) / 0.4, 0, 1);
    ctx.save();
    ctx.globalAlpha = 1 - fuera;
    ctx.translate(W / 2, H * 0.29 - fuera * 20);
    ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    ctx.rotate(-0.04);
    ctx.font = `400 28px ${fuentes.rotulador}`;
    const w = Math.min(W - 24, ctx.measureText(o.txt).width + 40);
    ctx.fillStyle = 'rgba(15,53,34,.92)';
    ctx.beginPath(); ctx.moveTo(-w / 2, -24); ctx.lineTo(w / 2 + 6, -28); ctx.lineTo(w / 2, 22); ctx.lineTo(-w / 2 - 6, 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.txt, 0, 0, w - 24);
    if (o.sub) {
      ctx.rotate(0.04);
      ctx.font = `700 13.5px ${fuentes.texto}`;
      const ws = Math.min(W - 30, ctx.measureText(o.sub).width + 24);
      ctx.fillStyle = 'rgba(247,248,243,.95)'; rr(ctx, -ws / 2, 30, ws, 26, 13); ctx.fill();
      ctx.fillStyle = C.honda; ctx.fillText(o.sub, 0, 43.5, ws - 16);
    }
    ctx.restore();
  }

  function dibujaIntro(ctx) {
    // Mano fantasma que enseña a arrastrar.
    const k = (juego.t % 1.6) / 1.6;
    const x = W / 2 + Math.sin(k * TAU) * 80, y = H * 0.8;
    ctx.save();
    ctx.fillStyle = 'rgba(15,53,34,.85)'; rr(ctx, W / 2 - 160, H - 100, 320, 52, 18); ctx.fill();
    ctx.font = `700 14px ${fuentes.texto}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Arrastra para guiar la mani: suma gente', W / 2, H - 83);
    ctx.fillText('y elige pancarta en cada glorieta. ¡Toca!', W / 2, H - 64);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2; circulo(ctx, x, y, 15); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function sello(ctx, txt, sub, x, y, k) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(2 - k, 2 - k); ctx.globalAlpha = clamp(k * 1.4, 0, 1);
    ctx.font = `800 32px ${fuentes.display}`;
    const w = Math.max(240, ctx.measureText(txt).width + 50);
    ctx.fillStyle = 'rgba(15,53,34,.88)'; rr(ctx, -w / 2, -44, w, 88, 10); ctx.fill();
    ctx.strokeStyle = C.amarillo; ctx.lineWidth = 4; rr(ctx, -w / 2 - 4, -48, w + 8, 96, 12); ctx.stroke();
    ctx.fillStyle = C.amarillo; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, 0, -10);
    ctx.font = `600 13px ${fuentes.texto}`; ctx.fillStyle = C.papel; ctx.fillText(sub, 0, 23);
    ctx.restore();
  }

  function dibujaFinMani1(ctx) {
    const t = tf - 1;
    sello(ctx, `${formatoNum(total())} personas`, `${formatoNum(Math.floor(total() * ACTUAL.factorComunidad.valor))} según la Comunidad`, W / 2, H * 0.3, ease.outBack(clamp(t / 0.4, 0, 1)));
    elegidasAqui.forEach((id, i) => {
      const R = REIVINDICACIONES[id];
      const kk = ease.outBack(clamp((t - 0.4 - i * 0.25) / 0.4, 0, 1));
      if (kk <= 0) return;
      ctx.save(); ctx.translate(W / 2, H * 0.46 + i * 54); ctx.scale(kk, kk);
      pancarta(ctx, R.pancarta, 0, 0, 230, 42, { t: juego.t + i, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1, palos: false, tamMax: 32 });
      ctx.restore();
    });
    if (t > 1.6) {
      const y = H * 0.46 + elegidasAqui.length * 54 + 18;
      ctx.globalAlpha = 0.65 + Math.sin(juego.t * 5) * 0.35;
      ctx.font = `800 17px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(15,53,34,.8)';
      ctx.strokeText('Toca: mañana, en clase… ¿y si se consiguieran?', W / 2, y, W - 24);
      ctx.fillText('Toca: mañana, en clase… ¿y si se consiguieran?', W / 2, y, W - 24);
      ctx.globalAlpha = 1;
    }
  }

  function dibujaRitmo(ctx) {
    const ahora = juego.audio.tiempo();
    ctx.fillStyle = 'rgba(15,53,34,.82)'; ctx.fillRect(0, H - 180, W, 180);
    const frase = Math.floor(clamp((ahora - ritmo.inicio) / ritmo.frase, 0, 3.999));
    const nf = ritmo.notas.filter(x => x.frase === frase);
    let tamL = 23;
    ctx.font = `400 ${tamL}px ${fuentes.rotulador}`; ctx.textBaseline = 'middle';
    let anchos = nf.map(x => ctx.measureText(x.texto.toUpperCase()).width + 7);
    const totalL = anchos.reduce((a, b) => a + b, 0);
    if (totalL > W - 28) { tamL *= (W - 28) / totalL; ctx.font = `400 ${tamL}px ${fuentes.rotulador}`; anchos = nf.map(x => ctx.measureText(x.texto.toUpperCase()).width + 7 * tamL / 23); }
    let x = W / 2 - anchos.reduce((a, b) => a + b, 0) / 2;
    nf.forEach((no, i) => {
      const activo = ahora >= no.t - 0.02;
      ctx.fillStyle = no.fuerte ? (no.estado === 'fallo' ? '#ff8a8a' : activo ? C.amarillo : C.papel) : activo ? C.marea : 'rgba(247,248,243,.5)';
      ctx.textAlign = 'left';
      ctx.fillText(no.texto.toUpperCase(), x, H - 146 - (activo && ahora - no.t < 0.15 ? 5 : 0));
      x += anchos[i];
    });
    const cx = W / 2, cy = H - 76;
    const golpe = clamp(1 - (juego.t - ritmo.ultimoGolpe) / 0.25, 0, 1);
    ctx.fillStyle = alfa('#ffcf33', 0.2 + golpe * 0.6); circulo(ctx, cx, cy, 30 + golpe * 8); ctx.fill();
    ctx.strokeStyle = C.papel; ctx.lineWidth = 4; circulo(ctx, cx, cy, 30); ctx.stroke();
    for (const no of ritmo.notas) {
      if (!no.fuerte || no.estado !== 'espera') continue;
      const dt = no.t - ahora;
      if (dt > 1.2 || dt < -0.2) continue;
      ctx.strokeStyle = alfa('#ffcf33', clamp(1 - dt / 1.2, 0, 1)); ctx.lineWidth = 5;
      circulo(ctx, cx, cy, 30 + Math.max(0, dt) * 110); ctx.stroke();
    }
    ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'center';
    ctx.fillText(`${ritmo.aciertos}/${ritmo.total}`, cx, cy + 1);
    ctx.font = `700 13px ${fuentes.texto}`; ctx.fillStyle = C.papel;
    ctx.fillText('Toca cuando el círculo llegue al anillo', cx, H - 24);
    if (ahora < ritmo.inicio) rotulo(ctx, '¡TODAS Y TODOS!', W / 2, H * 0.36, { tam: 32, color: C.papel, sombra: C.honda });
    if (ritmo.racha >= 4) { ctx.font = `400 22px ${fuentes.rotulador}`; ctx.fillStyle = C.amarillo; ctx.fillText(`¡RACHA x${ritmo.racha}!`, cx, H - 198); }
  }

  function dibujaCierre(ctx) {
    if (tf < 1.6) return;
    const t = tf - 1.6;
    sello(ctx, 'PUERTA CERRADA', `${formatoNum(total())} personas · cántico ${ritmo.aciertos}/${ritmo.total}`, W / 2, H * 0.3, ease.outBack(clamp(t / 0.4, 0, 1)));
    if (t > 0.8) {
      ctx.save(); ctx.globalAlpha = clamp((t - 0.8) / 0.5, 0, 1);
      ctx.fillStyle = 'rgba(247,248,243,.95)'; rr(ctx, 24, H * 0.42, W - 48, 92, 14); ctx.fill();
      ctx.font = `700 15px ${fuentes.texto}`; ctx.fillStyle = C.honda; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('La consejera llama «inasumible»', W / 2, H * 0.42 + 24);
      ctx.fillText('a lo que pedís, y el comité denuncia', W / 2, H * 0.42 + 45);
      ctx.fillText('que no se reúne con él.', W / 2, H * 0.42 + 66);
      ctx.restore();
    }
    if (t > 2.6) {
      ctx.globalAlpha = 0.65 + Math.sin(juego.t * 5) * 0.35;
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(15,53,34,.8)';
      ctx.strokeText('Toca: imagina la clase con lo que has llevado', W / 2, H * 0.42 + 122, W - 24);
      ctx.fillText('Toca: imagina la clase con lo que has llevado', W / 2, H * 0.42 + 122, W - 24);
      ctx.globalAlpha = 1;
    }
  }
}
