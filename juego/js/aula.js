// Modo Aula: arrastra a tu profe hasta las manos levantadas. Lo que pide la huelga se nota en cómo se juega:
// cuántos pupitres hay, cuánta energía tienes, cuántos papeles caen en la mesa, si hay apoyos, si hace calor
// y si te reparten alumnado de otra clase por falta de sustituto.
import { TAU, clamp, lerp, damp, dist, ease, rr, circulo, elipse, sombra, fuentes, azar, alfa, mezcla, rnd } from './util.js';
import { dibujaPersona, personaAzar, PROFES, conCamisetaVerde, PAL } from './personajes.js';
import { icono, NECESIDADES } from './iconos.js';
import { C, hoja, parrafo, rotulo, crearParticulas, boton, dentro, aparece, pancarta } from './ui.js';
import { REIVINDICACIONES, ACTUAL } from './datos.js';

const DIAS = [
  { titulo: 'LUNES 13 DE OCTUBRE', sub: '5.ª hora seguida · 2.º de Primaria', dur: 45 },
  { titulo: '¿Y SI…?', sub: 'La misma clase, otro día', dur: 40 },
  { titulo: 'LA CLASE QUE QUEREMOS', sub: 'Lo que pide la huelga, todo a la vez', dur: 32 },
];

export function escenaAula(juego, { dia = 0 }) {
  const { W } = juego;
  const est = juego.estado;
  const r = azar(1234 + dia * 77);
  const part = crearParticulas();
  const elegidas = dia === 0 ? [] : dia === 1 ? est.elegidas.slice(0, 2) : est.elegidas.slice(0, 4);
  const bien = id => elegidas.includes(id);
  const cfg = {
    ratios: bien('ratios'), horas: bien('horas'), burocracia: bien('burocracia'),
    apoyos: bien('apoyos'), infra: bien('infra'), sueldo: bien('sueldo'),
  };
  const D = DIAS[dia];
  let H = juego.H;

  // ---------- Disposición ----------
  const L = {};
  function disponer() {
    H = juego.H;
    L.paredY = 74; L.paredH = 64;
    L.sueloY = L.paredY + L.paredH;
    L.pizarraY = H - 54;
    L.mesa = { x: 74, y: H - 112, w: 96, h: 42 };
    L.puerta = { x: 30, y: L.sueloY - 4 };
    L.zona = { x0: 16, x1: W - 16, y0: L.sueloY + 26, y1: H - 70 };
  }
  disponer();

  // ---------- Alumnado ----------
  const ninos = [];
  function crearAlumnado() {
    const n = cfg.ratios ? 15 : 25;
    const cols = 5, filas = n / cols;
    const y0 = L.sueloY + 62, y1 = H - 168;
    for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
      const x = 52 + c * 74 + (cfg.ratios ? 0 : (f % 2 ? 3 : -3));
      const y = filas === 1 ? y0 : lerp(y0, y1, f / (filas - 1));
      ninos.push(nuevoNino(x, y));
    }
    // Dos alumnos que necesitan más apoyo, juntos en la segunda fila.
    const a = ninos[cols + 1], b = ninos[cols + 2];
    a.especial = 'enlace'; a.nombre = 'Amina'; a.p = { ...a.p, piel: '#b47a55', peinado: 'largo', pelo: '#2a1c14', ropa: '#e9a23b' };
    b.especial = 'pictos'; b.nombre = 'Leo';
  }
  function nuevoNino(x, y, reparto = false) {
    const p = personaAzar(r, 'niño');
    p.semilla = r() * 3;
    return { x, y, p, estado: 'quieto', t: r() * 2, cool: 1 + r() * 4, paciencia: 0, progreso: 0, necesidad: null, encendido: false, brillo: 0, especial: null, reparto, entra: reparto ? 0 : 1, sueno: 0, fila: y };
  }
  crearAlumnado();

  // ---------- Profe ----------
  const persona = PROFES[est.profe || 0];
  const profe = {
    p: dia === 0 ? persona : conCamisetaVerde(persona),
    x: 163, y: H - 96, vx: 0, vy: 0, paso: 0, energia: cfg.horas ? 1 : 0.72,
    bostezo: 0, proxBostezo: 7, ayudando: null, enMesa: false, sello: 0, mira: 0,
  };
  const prepara = cfg.horas; // material preparado: ayudas más rápidas

  // ---------- Papeles, calor, visitas ----------
  const papeles = { pila: cfg.burocracia ? 0 : 2, suelo: [], vuelan: [], prox: 3, total: 0 };
  let temp = cfg.infra ? 23 : 28;
  const visitas = []; // administrativo, profe de apoyo, operarios, reparto
  if (cfg.apoyos) visitas.push(crearVisita('apoyo'));
  if (cfg.infra && dia === 1) visitas.push(crearVisita('operarios'));
  let repartoHecho = cfg.sueldo;
  let adminProx = 4;

  function crearVisita(tipo) {
    if (tipo === 'apoyo') {
      const a = ninos.find(n => n.especial === 'enlace'), b = ninos.find(n => n.especial === 'pictos');
      return { tipo, p: { edad: 'adulto', piel: '#d29a74', peinado: 'moño', pelo: '#6f4426', ropa: '#7fb7e8', pantalon: '#2f3e57', gafas: true, semilla: 1.3 }, x: L.puerta.x, y: L.puerta.y + 10, dx: (a.x + b.x) / 2, dy: a.y + 30, fase: 'llega', t: 0, paso: 0 };
    }
    if (tipo === 'admin') return { tipo, p: { edad: 'adulto', piel: '#f6d5bd', peinado: 'corto', pelo: '#46301f', ropa: '#c96f9e', pantalon: '#3b3b3b', gafas: false, semilla: 2.1 }, x: L.puerta.x, y: L.puerta.y + 10, dx: L.mesa.x + 50, dy: L.mesa.y - 8, fase: 'llega', t: 0, paso: 0, carga: 0 };
    if (tipo === 'operarios') return { tipo, x: -40, y: L.sueloY + 30, t: 0 };
    return { tipo };
  }

  // ---------- Estado de la escena ----------
  let fase = 'intro'; // intro → juego → fin
  let tf = 0; // tiempo en la fase
  let reloj = 0;
  let llegados = 0, bombillas = 0, perdidas = 0, racha = 0, ultimaAyuda = -9;
  let resumen = null;
  const tutorial = { mostrado: dia === 0, t: 0 };

  function totalAlumnado() { return ninos.length; }

  // ---------- Lógica ----------
  function elegirNecesidad(n) {
    if (n.especial === 'enlace') return 'alfabeto';
    if (n.especial === 'pictos') return 'pictos';
    return r.uno(NECESIDADES);
  }
  function tasaMano() {
    // Manos por segundo en toda la clase. Con 25 se juntan muchas; con 15, da tiempo.
    const base = 0.027;
    return base;
  }
  function levantarManos(dt) {
    const quietos = ninos.filter(n => n.estado === 'quieto' && n.cool <= 0 && n.entra >= 1);
    const enMano = ninos.filter(n => n.estado === 'mano').length;
    for (const n of quietos) {
      // Quien todavía no ha recibido ayuda levanta la mano antes: así nadie se queda sin pedirla.
      const peso = n.encendido ? 0.3 : 2.1 + 5 * (reloj / D.dur) ** 2;
      if (enMano < 9 && r() < tasaMano() * peso * dt * (n.especial ? 1.3 : 1)) {
        n.estado = 'mano'; n.t = 0; n.progreso = 0;
        n.necesidad = elegirNecesidad(n);
        const largo = n.especial && !cfg.apoyos;
        n.paciencia = largo ? 13 : cfg.ratios ? 8.5 : 7.5;
        n.tiempoAyuda = n.especial ? (cfg.apoyos ? 9e9 : 3.2) : prepara ? 0.62 : 0.95;
      }
    }
  }

  function actualizarNinos(dt) {
    const calor = invCalor();
    for (const n of ninos) {
      n.t += dt;
      if (n.entra < 1) { n.entra = Math.min(1, n.entra + dt * 0.8); continue; }
      n.brillo = damp(n.brillo, n.encendido ? 1 : 0, 3, dt);
      switch (n.estado) {
        case 'quieto': {
          n.cool -= dt;
          // Con calor, quien está cerca de las ventanas se adormece y deja de participar.
          if (calor > 0 && r() < calor * 0.022 * dt * (1.4 - (n.y - L.sueloY) / (H - L.sueloY))) { n.estado = 'dormido'; n.t = 0; }
          break;
        }
        case 'mano': {
          const ayudado = profe.ayudando === n || (n.especial && cfg.apoyos && apoyoSentada());
          if (!ayudado) n.paciencia -= dt;
          if (n.paciencia <= 0) {
            n.estado = 'triste'; n.t = 0; perdidas++; racha = 0;
            juego.audio.sfx('apaga');
          }
          break;
        }
        case 'feliz': if (n.t > 1.6) { n.estado = 'quieto'; n.cool = 4 + r() * 5; } break;
        case 'triste': if (n.t > 3) { n.estado = 'quieto'; n.cool = 2 + r() * 3; } break;
        case 'dormido': if (n.t > 6 + r() * 0.5) { n.estado = 'quieto'; n.cool = 0.5; } break;
      }
    }
  }
  function apoyoSentada() { const v = visitas.find(v => v.tipo === 'apoyo'); return v && v.fase === 'sentada'; }

  function encender(n, { grande = false } = {}) {
    n.estado = 'feliz'; n.t = 0; n.progreso = 0;
    const nuevo = !n.encendido;
    n.encendido = true;
    bombillas++;
    if (nuevo) llegados++;
    racha = juego.t - ultimaAyuda < 2.6 ? racha + 1 : 0;
    ultimaAyuda = juego.t;
    juego.audio.sfx(grande ? 'grande' : 'bombilla', { racha: Math.min(racha, 6) });
    // La bombilla vuela al contador.
    const bx = n.x, by = n.y - 62;
    part.añadir({
      vida: 0.75, x: bx, y: by, grande,
      actualizar(p, dt) { const k = ease.inOutCubic(p.t / p.vida); p.x = lerp(bx, W - 148, k); p.y = lerp(by, 34, k) - Math.sin(k * Math.PI) * 50; },
      dibujar(ctx, p) { icono(ctx, 'bombilla', p.x, p.y, (grande ? 30 : 20) * (1 + Math.sin((p.t / p.vida) * Math.PI) * 0.4)); },
    });
    part.chispa(n.x, n.y - 54, grande ? 14 : 8);
    if (grande) part.confeti(n.x, n.y - 50, 22);
    if (racha >= 2) part.texto(n.x, n.y - 80, `¡racha x${racha + 1}!`, { color: C.pizarra, tam: 15 });
  }

  function actualizarProfe(dt) {
    const e = juego.entrada;
    // Energía: sin horas para preparar, se agota durante la clase.
    if (!cfg.horas) profe.energia = Math.max(0.32, profe.energia - dt * 0.0085);
    const vmax = lerp(150, 330, profe.energia) * (profe.bostezo > 0 ? 0 : 1);
    if (profe.bostezo > 0) profe.bostezo -= dt;
    else if (!cfg.horas && fase === 'juego') {
      profe.proxBostezo -= dt;
      if (profe.proxBostezo <= 0 && profe.energia < 0.62) { profe.bostezo = 0.9; profe.proxBostezo = 7 + r() * 4; juego.audio.sfx('bostezo'); }
    }
    let tx = profe.x, ty = profe.y;
    if (e.abajo) { tx = e.x; ty = e.y - 34; }
    tx = clamp(tx, L.zona.x0, L.zona.x1);
    ty = clamp(ty, L.zona.y0, L.zona.y1);
    // Folios por el suelo: frenan.
    let freno = 1;
    for (const f of papeles.suelo) if (dist(f.x, f.y, profe.x, profe.y) < 22) freno = 0.5;
    const dx = tx - profe.x, dy = ty - profe.y, d = Math.hypot(dx, dy);
    const v = Math.min(vmax * freno, d * 9);
    const wx = d > 0.5 ? (dx / d) * v : 0, wy = d > 0.5 ? (dy / d) * v : 0;
    profe.vx = damp(profe.vx, wx, 14, dt);
    profe.vy = damp(profe.vy, wy, 14, dt);
    profe.x += profe.vx * dt; profe.y += profe.vy * dt;
    const rapidez = Math.hypot(profe.vx, profe.vy);
    profe.paso += rapidez * dt / 46;
    profe.mira = damp(profe.mira, clamp(profe.vx / 200, -1, 1), 8, dt);

    // ¿En la mesa? Allí se despacha el papeleo.
    const m = L.mesa;
    profe.enMesa = !cfg.burocracia && Math.abs(profe.x - (m.x + m.w / 2)) < m.w / 2 + 14 && profe.y > m.y - 30 && profe.y < m.y + m.h + 30;

    // Ayudar a quien esté cerca.
    profe.ayudando = null;
    if (rapidez < 160 && profe.bostezo <= 0) {
      let mejor = null, md = 54;
      for (const n of ninos) {
        if (n.estado !== 'mano' || (n.especial && cfg.apoyos)) continue;
        const dd = dist(profe.x, profe.y, n.x, n.y + 6);
        if (dd < md) { md = dd; mejor = n; }
      }
      if (mejor) {
        profe.ayudando = mejor;
        mejor.progreso += dt / mejor.tiempoAyuda;
        if (Math.floor(mejor.progreso * 6) !== Math.floor((mejor.progreso - dt / mejor.tiempoAyuda) * 6)) juego.audio.sfx('ayuda', { k: mejor.progreso });
        if (mejor.progreso >= 1) encender(mejor, { grande: !!mejor.especial });
      }
    }
    if (profe.enMesa && !profe.ayudando && rapidez < 120 && (papeles.pila > 0 || papeles.suelo.length)) {
      profe.sello -= dt;
      if (profe.sello <= 0) {
        profe.sello = 0.32;
        if (papeles.suelo.length) papeles.suelo.pop(); else papeles.pila--;
        juego.audio.sfx('papel');
        part.texto(m.x + m.w / 2, m.y - 20, '¡sello!', { color: C.margen, tam: 12, vida: 0.6 });
      }
    }
  }

  function actualizarPapeles(dt) {
    papeles.prox -= dt;
    if (papeles.prox <= 0) {
      papeles.prox = 3.6 + r() * 1.6;
      papeles.total++;
      // Un folio entra volando desde la puerta hasta la mesa.
      papeles.vuelan.push({ t: 0, x0: L.puerta.x + 8, y0: L.puerta.y + 8, rot: r() * 3 });
      juego.audio.sfx('papel');
    }
    for (let i = papeles.vuelan.length - 1; i >= 0; i--) {
      const f = papeles.vuelan[i];
      f.t += dt * 1.4;
      if (f.t >= 1) { papeles.vuelan.splice(i, 1); papeles.pila++; }
    }
    // Si el montón crece demasiado, se cae y lo llena todo de folios.
    if (!cfg.burocracia && papeles.pila >= 8) {
      papeles.pila = 2;
      juego.audio.sfx('montonCae');
      for (let i = 0; i < 7; i++) {
        papeles.suelo.push({ x: clamp(L.mesa.x + 40 + (r() - 0.3) * 240, 20, W - 20), y: clamp(L.mesa.y - 40 - r() * 200, L.zona.y0, L.zona.y1), rot: r() * TAU });
      }
    }
    // Con personal de administración, alguien viene a por el montón.
    if (cfg.burocracia) {
      adminProx -= dt;
      if (adminProx <= 0 && papeles.pila >= 2 && !visitas.some(v => v.tipo === 'admin')) { visitas.push(crearVisita('admin')); juego.audio.sfx('puerta'); }
    }
  }

  function actualizarVisitas(dt) {
    for (let i = visitas.length - 1; i >= 0; i--) {
      const v = visitas[i];
      v.t += dt;
      if (v.tipo === 'operarios') { v.x += 60 * dt; if (v.x > W + 80) visitas.splice(i, 1); continue; }
      if (v.tipo === 'reparto') { actualizarReparto(v, dt); if (v.fin) visitas.splice(i, 1); continue; }
      const ir = (x, y, vel = 110) => { const dx = x - v.x, dy = y - v.y, d = Math.hypot(dx, dy); if (d < 3) return true; v.x += (dx / d) * Math.min(vel * dt, d); v.y += (dy / d) * Math.min(vel * dt, d); v.paso += (vel * dt) / 40; return false; };
      if (v.tipo === 'apoyo') {
        if (v.fase === 'llega' && ir(v.dx, v.dy)) v.fase = 'sentada';
        if (v.fase === 'sentada') {
          for (const n of ninos) if (n.especial && n.estado === 'mano') { n.progreso += dt / 2.4; if (n.progreso >= 1) encender(n, { grande: true }); }
        }
      }
      if (v.tipo === 'admin') {
        if (v.fase === 'llega' && ir(v.dx, v.dy, 140)) { v.fase = 'recoge'; v.t = 0; }
        if (v.fase === 'recoge' && v.t > 0.5) { v.carga = papeles.pila; papeles.pila = 0; v.fase = 'vuelve'; juego.audio.sfx('papel'); }
        if (v.fase === 'vuelve' && ir(L.puerta.x, L.puerta.y + 10, 140)) { visitas.splice(i, 1); adminProx = 5; }
      }
    }
  }

  // Sin sustituto en la clase de al lado: te reparten a tres.
  function iniciarReparto() {
    repartoHecho = true;
    juego.audio.sfx('puerta');
    const sitios = [[20, L.sueloY + 120], [W - 20, L.sueloY + 200], [W - 20, H - 220]];
    const nuevos = sitios.map(([x, y]) => { const n = nuevoNino(x, y, true); n.desdeX = L.puerta.x; n.desdeY = L.puerta.y; return n; });
    ninos.push(...nuevos);
    visitas.push({ tipo: 'reparto', t: 0, nuevos });
    part.texto(W / 2, L.sueloY + 30, '+3 de la clase de al lado', { color: C.margen, tam: 15, vida: 2.4, vy: -8 });
  }
  function actualizarReparto(v) { if (v.t > 3) v.fin = true; }

  function invCalor() { return cfg.infra ? 0 : clamp((temp - 27) / 6, 0, 1); }

  // ---------- Ciclo de la escena ----------
  function terminar() {
    fase = 'fin'; tf = 0;
    juego.audio.sfx('timbre');
    juego.audio.pararMusica(1.2);
    const total = totalAlumnado();
    est.aulas[dia] = { llegados, total, bombillas, perdidas, papeles: papeles.total, temp: Math.round(temp), reparto: !cfg.sueldo, elegidas: [...elegidas] };
    resumen = { llegados, total };
    // Rescate: quien no ha recibido ayuda se queda con la cabeza gacha; quien sí, brilla.
    for (const n of ninos) if (n.estado === 'mano') { n.estado = 'triste'; n.t = 0; }
  }

  return {
    fondo: '#e7dfcc',
    redimensionar: disponer,
    info: () => ({ fase, tf }),
    entrar() {
      juego.audio.musica('aula', { bpm: dia === 0 ? 132 : 118, tension: dia === 0, capas: { melodia: dia > 0 } });
    },
    actualizar(dt) {
      tf += dt;
      part.actualizar(dt);
      if (juego.debug) window.__bot = () => {
        // Jugador automático para pruebas: va a la mano alcanzable más cercana.
        const v = lerp(150, 330, profe.energia);
        const manos = ninos.filter(n => n.estado === 'mano' && !(n.especial && cfg.apoyos)).map(n => ({ n, t: dist(profe.x, profe.y, n.x, n.y + 6) / v })).filter(o => o.t + o.n.tiempoAyuda * (1 - o.n.progreso) < o.n.paciencia).sort((a, b) => a.t - b.t);
        const objetivo = manos[0]?.n || (papeles.pila > 4 || papeles.suelo.length > 2 ? { x: L.mesa.x + 40, y: L.mesa.y - 10 } : null);
        window.__stats = { llegados, bombillas, perdidas, total: ninos.length, pila: papeles.pila };
        return objetivo ? juego.aCss(objetivo.x, objetivo.y + 6 + 34) : null;
      };
      if (fase === 'intro') {
        // Animaciones de ambiente aunque no se juegue todavía.
        for (const n of ninos) { n.t += dt; if (n.entra < 1) n.entra = Math.min(1, n.entra + dt); }
        actualizarVisitas(dt);
        if (tf > 1.1 && (juego.entrada.toques.length || juego.entrada.abajo)) { fase = 'juego'; tf = 0; juego.audio.sfx('toque'); }
        return;
      }
      if (fase === 'juego') {
        reloj += dt;
        tutorial.t += dt;
        if (!cfg.infra) temp = Math.min(33, 28 + reloj * 0.13);
        if (!repartoHecho && reloj > D.dur * 0.38) iniciarReparto();
        levantarManos(dt);
        actualizarNinos(dt);
        actualizarProfe(dt);
        actualizarPapeles(dt);
        actualizarVisitas(dt);
        if (juego.debug && juego.entrada.toques.some(t => t.y < 60)) reloj = D.dur;
        if (reloj >= D.dur) terminar();
        return;
      }
      // fin
      for (const n of ninos) { n.t += dt; n.brillo = damp(n.brillo, n.encendido ? 1 : 0, 3, dt); }
      actualizarProfe(dt);
      if (tf > 2.2 && juego.entrada.toques.length) juego.siguiente();
    },
    dibujar(ctx) {
      dibujaSuelo(ctx);
      dibujaPared(ctx);
      dibujaPizarra(ctx);
      // Entidades ordenadas por profundidad.
      const cosas = [];
      for (const n of ninos) cosas.push({ y: n.y, f: () => dibujaPupitre(ctx, n) });
      cosas.push({ y: L.mesa.y + 6, f: () => dibujaMesa(ctx) });
      cosas.push({ y: profe.y, f: () => dibujaProfe(ctx) });
      for (const v of visitas) if (v.p) cosas.push({ y: v.y, f: () => dibujaVisita(ctx, v) });
      cosas.sort((a, b) => a.y - b.y).forEach(c => c.f());
      for (const v of visitas) if (v.tipo === 'operarios') dibujaOperarios(ctx, v);
      dibujaFoliosSuelo(ctx);
      dibujaCalor(ctx);
      for (const n of ninos) dibujaBocadillo(ctx, n);
      if (profe.bostezo > 0) { ctx.save(); ctx.globalAlpha = 0.9; icono(ctx, 'zzz', profe.x + 18, profe.y - 82, 18); ctx.restore(); }
      part.dibujar(ctx);
      dibujaHUD(ctx);
      if (fase === 'juego' && tutorial.mostrado && tutorial.t < 6 && !juego.entrada.abajo) dibujaTutorial(ctx);
      if (fase === 'intro') dibujaIntro(ctx);
      if (fase === 'fin') dibujaResumen(ctx);
    },
  };

  // ======================= Dibujo =======================
  function dibujaSuelo(ctx) {
    const barracon = !cfg.infra;
    // Linóleo con baldosas; en el barracón, más gastado.
    const g = ctx.createLinearGradient(0, L.sueloY, 0, H);
    g.addColorStop(0, barracon ? '#d9cfb8' : '#e4ebd9');
    g.addColorStop(1, barracon ? '#cfc4aa' : '#d7e3cb');
    ctx.fillStyle = g;
    ctx.fillRect(0, L.sueloY, W, H - L.sueloY);
    ctx.strokeStyle = barracon ? 'rgba(120,100,60,.12)' : 'rgba(23,77,50,.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 40) { ctx.moveTo(x, L.sueloY); ctx.lineTo(x, H); }
    for (let y = L.sueloY; y <= H; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    if (barracon) {
      // Marcas de patas de silla.
      ctx.strokeStyle = 'rgba(120,90,50,.10)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) { const x = (i * 97) % W, y = L.sueloY + 40 + ((i * 173) % (H - L.sueloY - 80)); ctx.beginPath(); ctx.arc(x, y, 14 + (i % 3) * 5, 0.2, 1.3); ctx.stroke(); }
    }
    // Rayos de sol de las ventanas: más fuertes cuanto más calor.
    const k = barracon ? 0.1 + invCalor() * 0.16 : 0.06;
    ctx.save();
    ctx.fillStyle = `rgba(255,214,120,${k})`;
    for (const wx of [210, 300]) {
      ctx.beginPath();
      ctx.moveTo(wx, L.sueloY); ctx.lineTo(wx + 70, L.sueloY);
      ctx.lineTo(wx - 40, H * 0.75); ctx.lineTo(wx - 130, H * 0.75);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // Alfombra de asamblea.
    ctx.fillStyle = cfg.ratios ? 'rgba(134,205,85,.28)' : 'rgba(134,205,85,.0)';
    rr(ctx, W - 150, H - 140, 130, 60, 26); ctx.fill();
  }

  function dibujaPared(ctx) {
    const y = L.paredY, h = L.paredH;
    const barracon = !cfg.infra;
    ctx.fillStyle = barracon ? '#cdd2cf' : '#f3efe2';
    ctx.fillRect(0, 0, W, y + h);
    if (barracon) {
      // Paneles prefabricados de chapa: el barracón.
      ctx.strokeStyle = 'rgba(70,80,75,.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let x = 6; x < W; x += 9) { ctx.moveTo(x, 0); ctx.lineTo(x, y + h); } ctx.stroke();
      ctx.fillStyle = 'rgba(70,80,75,.2)';
      for (let x = 0; x < W; x += 100) ctx.fillRect(x, 0, 3, y + h);
      // Grieta y parche de cinta.
      ctx.strokeStyle = 'rgba(40,40,40,.4)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(150, y + 8); ctx.lineTo(156, y + 18); ctx.lineTo(152, y + 26); ctx.lineTo(160, y + 38); ctx.stroke();
      ctx.save(); ctx.translate(166, y + 20); ctx.rotate(0.5); ctx.fillStyle = 'rgba(230,200,120,.85)'; ctx.fillRect(-12, -3, 24, 6); ctx.restore();
    } else {
      // Pared pintada con dibujos del alumnado.
      const cols = ['#ffcf33', '#86cd55', '#7fb7e8', '#e0566c', '#c9a7ef'];
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.translate(108 + i * 22, y + 26 + (i % 2) * 6); ctx.rotate((i - 2) * 0.06);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-8, -10, 16, 20);
        ctx.fillStyle = cols[i]; circulo(ctx, 0, -2, 4); ctx.fill(); ctx.fillRect(-5, 4, 10, 2);
        ctx.restore();
      }
    }
    // Zócalo.
    ctx.fillStyle = barracon ? '#9aa39e' : '#86cd55';
    ctx.fillRect(0, y + h - 6, W, 6);
    // Puerta (arriba a la izquierda).
    ctx.fillStyle = barracon ? '#8c9a93' : '#174d32';
    rr(ctx, 12, y + 2, 40, h - 6, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(ctx, 20, y + 9, 24, 16, 2); ctx.fill();
    ctx.fillStyle = '#ffcf33'; circulo(ctx, 45, y + 36, 2.4); ctx.fill();
    // Ventanas con el cole «en obras» al fondo: la construcción por fases.
    for (const wx of [196, 288]) {
      ctx.fillStyle = '#0f3522'; rr(ctx, wx - 2, y + 4, 80, 40, 4); ctx.fill();
      const cielo = ctx.createLinearGradient(0, y + 6, 0, y + 42);
      cielo.addColorStop(0, barracon ? '#9fd3f0' : '#b9e2f5'); cielo.addColorStop(1, '#e8f6fb');
      ctx.fillStyle = cielo; rr(ctx, wx, y + 6, 76, 36, 3); ctx.fill();
      ctx.save(); rr(ctx, wx, y + 6, 76, 36, 3); ctx.clip();
      if (barracon) {
        // Sol y edificio a medio construir con grúa.
        ctx.fillStyle = '#ffd36b'; circulo(ctx, wx + 62, y + 14, 8 + Math.sin(juego.t * 2) * 0.6); ctx.fill();
        if (wx === 196) {
          ctx.fillStyle = '#c9b79a'; ctx.fillRect(wx + 10, y + 26, 34, 18);
          ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(wx + 10 + i * 11, y + 26); ctx.lineTo(wx + 10 + i * 11, y + 20); ctx.stroke(); }
          ctx.strokeStyle = '#f2b705'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx + 54, y + 44); ctx.lineTo(wx + 54, y + 12); ctx.lineTo(wx + 22, y + 12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(wx + 30, y + 12); ctx.lineTo(wx + 30, y + 18 + Math.sin(juego.t) * 2); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#86cd55'; circulo(ctx, wx + 20, y + 44, 16); ctx.fill(); circulo(ctx, wx + 50, y + 46, 14); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = '#0f3522'; ctx.fillRect(wx + 36, y + 6, 3, 36);
    }
    // Reloj de pared.
    const cx = 92, cy = y + 24;
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2;
    circulo(ctx, cx, cy, 11); ctx.fill(); ctx.stroke();
    const prog = fase === 'juego' ? reloj / D.dur : fase === 'fin' ? 1 : 0;
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(prog * TAU) * 8, cy - Math.cos(prog * TAU) * 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 4, cy + 3); ctx.stroke();
    // Termómetro (calor) o aire acondicionado.
    if (barracon) {
      const tx = 380, ty = y + 6;
      ctx.fillStyle = '#ffffff'; rr(ctx, tx - 4, ty, 8, 34, 4); ctx.fill(); ctx.stroke();
      const k = clamp((temp - 20) / 16, 0, 1);
      ctx.fillStyle = mezcla('#ffcf33', '#e0566c', k);
      ctx.fillRect(tx - 1.5, ty + 32 - 30 * k, 3, 30 * k);
      circulo(ctx, tx, ty + 38, 5.5); ctx.fill(); ctx.stroke();
      ctx.font = `800 10px ${fuentes.display}`; ctx.fillStyle = '#0f3522'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(temp)}°`, tx - 8, ty + 38);
    } else {
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
      rr(ctx, 340, y + 8, 50, 16, 5); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(127,183,232,.7)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { const o = (juego.t * 18 + i * 8) % 24; ctx.beginPath(); ctx.moveTo(348 + i * 14, y + 28 + o); ctx.lineTo(352 + i * 14, y + 32 + o); ctx.stroke(); }
    }
  }

  function dibujaPizarra(ctx) {
    const y = L.pizarraY;
    ctx.fillStyle = '#7d5a3c'; ctx.fillRect(0, y - 6, W, 8);
    ctx.fillStyle = '#244f3a'; ctx.fillRect(0, y + 2, W, H - y);
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.fillRect(0, y + 2, W, 3);
    // Tizas y borrador.
    ctx.fillStyle = '#f7f8f3'; rr(ctx, 260, y - 9, 14, 4, 2); ctx.fill();
    ctx.fillStyle = '#ffcf33'; rr(ctx, 280, y - 9, 10, 4, 2); ctx.fill();
    ctx.fillStyle = '#5b4636'; rr(ctx, 300, y - 12, 26, 8, 2); ctx.fill();
  }

  function dibujaPupitre(ctx, n) {
    const k = n.entra;
    let x = n.x, y = n.y;
    if (n.reparto && k < 1) { x = lerp(n.desdeX, n.x, ease.inOutCubic(k)); y = lerp(n.desdeY, n.y, ease.inOutCubic(k)); }
    // Halo de quien ya ha recibido ayuda: la clase se va encendiendo.
    if (n.brillo > 0.02) {
      const g = ctx.createRadialGradient(x, y - 18, 4, x, y - 18, 44);
      g.addColorStop(0, `rgba(255,207,51,${0.42 * n.brillo})`); g.addColorStop(1, 'rgba(255,207,51,0)');
      ctx.fillStyle = g; circulo(ctx, x, y - 18, 44); ctx.fill();
    }
    const triste = n.estado === 'triste';
    const expr = n.estado === 'feliz' ? 'feliz' : triste ? 'triste' : n.estado === 'dormido' ? 'dormido' : n.estado === 'mano' ? (n.paciencia < 2.5 ? 'triste' : 'normal') : 'normal';
    const calor = invCalor();
    let brazos = n.estado === 'mano' ? 'uno' : n.estado === 'feliz' ? 'arriba' : 'escribe';
    if (n.estado === 'quieto' && calor > 0.35 && (n.x * 7 + n.y) % 3 < 1) brazos = 'abanico';
    if (n.reparto) {
      // Sin pupitre: solo con su silla.
      ctx.fillStyle = '#c28b54'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
      rr(ctx, x - 11, y - 28, 22, 8, 2); ctx.fill(); ctx.stroke();
      dibujaPersona(ctx, n.p, { x, y: y - 4, esc: 0.95, sentado: true, brazos: n.estado === 'mano' ? 'uno' : 'abajo', expr, t: juego.t + n.p.semilla, mira: 0 });
      return;
    }
    // Silla detrás.
    ctx.fillStyle = '#c28b54'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
    rr(ctx, x - 12, y - 40, 24, 10, 3); ctx.fill(); ctx.stroke();
    // Niño o niña.
    const salto = n.estado === 'feliz' ? Math.max(0, Math.sin(n.t * 9)) * 5 * (1 - n.t / 1.6) : 0;
    const cabecea = n.estado === 'dormido' ? Math.sin(juego.t * 2) * 1.5 + 3 : 0;
    dibujaPersona(ctx, n.p, { x, y: y - 4 + cabecea, esc: 1.0, sentado: true, brazos, expr, t: juego.t + n.p.semilla, salto, mira: clamp((profe.x - x) / 150, -1, 1), sinSombra: true });
    // Pupitre delante.
    sombra(ctx, x, y + 14, 26, 5, 0.14);
    ctx.fillStyle = '#e9c38f'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.6;
    rr(ctx, x - 25, y - 6, 50, 18, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d4a86e'; ctx.fillRect(x - 23, y + 7, 46, 3);
    // Cuaderno y lápiz.
    ctx.fillStyle = '#ffffff'; rr(ctx, x - 12, y - 3, 16, 10, 1.5); ctx.fill();
    ctx.strokeStyle = 'rgba(15,53,34,.25)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - 4, y - 3); ctx.lineTo(x - 4, y + 7); ctx.stroke();
    ctx.fillStyle = n.encendido ? '#ffcf33' : '#e0566c'; rr(ctx, x + 8, y - 1, 10, 2.6, 1.3); ctx.fill();
  }

  function dibujaBocadillo(ctx, n) {
    if (n.estado !== 'mano' && n.estado !== 'triste' && n.estado !== 'dormido') return;
    const x = n.x, y = n.y - 64;
    if (n.estado === 'dormido') { ctx.save(); ctx.globalAlpha = 0.75; icono(ctx, 'zzz', x + 12, n.y - 52 - Math.sin(juego.t * 2) * 2, 15); ctx.restore(); return; }
    if (n.estado === 'triste') {
      // Una nube gris que se desvanece: «no han llegado a tiempo».
      const a = 1 - n.t / 3;
      ctx.save(); ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = '#9aa39e';
      for (const [dx, dy, rr2] of [[-7, 2, 7], [0, -3, 9], [8, 2, 7]]) { circulo(ctx, x + dx, y + 8 + dy - n.t * 4, rr2); ctx.fill(); }
      ctx.restore();
      return;
    }
    const aparicion = ease.outBack(clamp(n.t / 0.3, 0, 1));
    const urgencia = 1 - clamp(n.paciencia / 7.5, 0, 1);
    const largo = n.especial && !cfg.apoyos;
    const rB = (largo ? 17 : 15) * aparicion;
    const tiembla = urgencia > 0.65 ? Math.sin(juego.t * 30) * 1.2 : 0;
    ctx.save();
    ctx.translate(x + tiembla, y - Math.sin(juego.t * 3 + n.x) * 1.5);
    // Burbuja.
    ctx.fillStyle = 'rgba(15,53,34,.2)'; circulo(ctx, 1.5, 3, rB); ctx.fill();
    ctx.fillStyle = mezcla('#ffffff', '#ffd2d8', urgencia);
    circulo(ctx, 0, 0, rB); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, rB - 3); ctx.lineTo(0, rB + 7); ctx.lineTo(5, rB - 3); ctx.fill();
    ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.6; circulo(ctx, 0, 0, rB); ctx.stroke();
    // Anillo de paciencia que se va gastando.
    ctx.strokeStyle = urgencia > 0.65 ? '#e0566c' : '#86cd55'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, rB + 4, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - urgencia)); ctx.stroke();
    // Progreso de la ayuda.
    if (n.progreso > 0) {
      ctx.fillStyle = 'rgba(255,207,51,.55)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, rB - 1, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, n.progreso)); ctx.closePath(); ctx.fill();
    }
    icono(ctx, n.necesidad, 0, 0, rB * 1.15);
    ctx.restore();
  }

  function dibujaMesa(ctx) {
    const m = L.mesa;
    sombra(ctx, m.x + m.w / 2, m.y + m.h + 4, m.w * 0.55, 7, 0.16);
    ctx.fillStyle = '#b98a5a'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.8;
    rr(ctx, m.x, m.y, m.w, m.h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a77a4c'; ctx.fillRect(m.x + 3, m.y + m.h - 8, m.w - 6, 4);
    // Portátil con notificaciones.
    ctx.fillStyle = '#3b4a44'; rr(ctx, m.x + 56, m.y + 6, 30, 20, 2); ctx.fill();
    ctx.fillStyle = cfg.burocracia ? '#9fd3f0' : (Math.sin(juego.t * 8) > 0 && papeles.pila > 3 ? '#e0566c' : '#9fd3f0');
    rr(ctx, m.x + 58, m.y + 8, 26, 15, 1.5); ctx.fill();
    // Montón de papeles.
    const n = Math.min(papeles.pila, 10);
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.translate(m.x + 26, m.y + 22 - i * 3.2);
      ctx.rotate(Math.sin(i * 1.7) * 0.12 + (n > 5 ? Math.sin(juego.t * 6 + i) * 0.02 * (n - 5) : 0));
      ctx.fillStyle = i % 3 === 2 ? '#fff6c9' : '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.lineWidth = 1;
      rr(ctx, -15, -9, 30, 18, 1.5); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // Folios volando hacia la mesa.
    for (const f of papeles.vuelan) {
      const k = ease.inOutCubic(f.t);
      const fx = lerp(f.x0, m.x + 26, k), fy = lerp(f.y0, m.y + 22 - n * 3, k) - Math.sin(k * Math.PI) * 60;
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(f.rot + k * 4);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.lineWidth = 1;
      rr(ctx, -9, -6, 18, 12, 1); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    // Indicador de «aquí se despacha el papeleo».
    if (profe.enMesa && (papeles.pila > 0 || papeles.suelo.length)) {
      ctx.strokeStyle = C.margen; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]); ctx.lineDashOffset = -juego.t * 20;
      rr(ctx, m.x - 6, m.y - 6, m.w + 12, m.h + 12, 9); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  function dibujaFoliosSuelo(ctx) {
    for (const f of papeles.suelo) {
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.5)'; ctx.lineWidth = 1;
      rr(ctx, -11, -8, 22, 16, 1.5); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(15,53,34,.25)'; ctx.beginPath(); ctx.moveTo(-7, -3); ctx.lineTo(6, -3); ctx.moveTo(-7, 1); ctx.lineTo(4, 1); ctx.stroke();
      ctx.restore();
    }
  }

  function dibujaProfe(ctx) {
    const rapido = Math.hypot(profe.vx, profe.vy) > 20;
    let brazos = 'abajo', expr = 'normal';
    if (profe.ayudando) { brazos = 'papel'; expr = 'feliz'; }
    else if (profe.enMesa && (papeles.pila > 0 || papeles.suelo.length)) { brazos = 'papel'; expr = 'cansado'; }
    else if (profe.bostezo > 0) { expr = 'sorpresa'; brazos = 'abajo'; }
    else if (profe.energia < 0.5) expr = 'cansado';
    if (fase === 'intro' && dia === 0) brazos = 'cafe';
    if (fase === 'fin') { const ok = resumen && resumen.llegados === resumen.total; expr = ok ? 'feliz' : 'cansado'; brazos = ok ? 'arriba' : 'abajo'; }
    dibujaPersona(ctx, profe.p, { x: profe.x, y: profe.y, esc: 1.22, brazos, expr, t: juego.t, paso: rapido ? profe.paso : 0, mira: profe.mira, estira: profe.bostezo > 0 ? 0.06 : 0 });
    // Material preparado: una cartulina de colores bajo el brazo.
    if (prepara && fase !== 'intro') {
      ctx.save(); ctx.translate(profe.x - 16, profe.y - 34); ctx.rotate(-0.3);
      ctx.fillStyle = '#ffcf33'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.3; rr(ctx, -7, -9, 14, 18, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0566c'; circulo(ctx, 0, -2, 3); ctx.fill(); ctx.fillStyle = '#86cd55'; ctx.fillRect(-4, 4, 8, 2);
      ctx.restore();
    }
  }

  function dibujaVisita(ctx, v) {
    const anda = v.fase === 'llega' || v.fase === 'vuelve';
    if (v.tipo === 'apoyo') {
      dibujaPersona(ctx, v.p, { x: v.x, y: v.y, esc: 1.1, brazos: v.fase === 'sentada' ? 'papel' : 'saluda', expr: 'feliz', t: juego.t, paso: anda ? v.paso : 0, sentado: v.fase === 'sentada' });
    } else if (v.tipo === 'admin') {
      dibujaPersona(ctx, v.p, { x: v.x, y: v.y, esc: 1.15, brazos: v.fase === 'vuelve' ? 'papel' : 'saluda', expr: 'feliz', t: juego.t, paso: anda ? v.paso : 0 });
      if (v.fase === 'vuelve') for (let i = 0; i < Math.min(v.carga, 6); i++) { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(15,53,34,.6)'; ctx.lineWidth = 1; rr(ctx, v.x - 12, v.y - 48 - i * 3, 24, 14, 1.5); ctx.fill(); ctx.stroke(); }
    }
  }

  function dibujaOperarios(ctx, v) {
    // Dos operarios con buzo blanco se llevan una placa de uralita.
    const y = v.y + 20;
    const buzo = { edad: 'adulto', piel: '#d29a74', peinado: 'calvo', pelo: '#2a1c14', ropa: '#f7f8f3', pantalon: '#e9e9e9', semilla: 0.4 };
    const buzo2 = { ...buzo, piel: '#f6d5bd', peinado: 'corto', pelo: '#8e8e8e', gafas: true };
    ctx.save();
    ctx.fillStyle = '#b9bfbc'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
    rr(ctx, v.x - 46, y - 62, 92, 12, 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(15,53,34,.3)'; ctx.beginPath(); for (let i = -40; i < 46; i += 7) { ctx.moveTo(v.x + i, y - 62); ctx.lineTo(v.x + i, y - 50); } ctx.stroke();
    ctx.restore();
    dibujaPersona(ctx, buzo, { x: v.x - 34, y, esc: 1.05, brazos: 'pancarta', expr: 'normal', t: juego.t, paso: v.t * 1.6 });
    dibujaPersona(ctx, buzo2, { x: v.x + 34, y, esc: 1.05, brazos: 'pancarta', expr: 'feliz', t: juego.t, paso: v.t * 1.6 + 0.5 });
  }

  function dibujaCalor(ctx) {
    const k = invCalor();
    if (k <= 0.01) return;
    // Tinte cálido y ondas de calima que suben.
    ctx.save();
    ctx.fillStyle = `rgba(255,150,60,${k * 0.1})`;
    ctx.fillRect(0, L.sueloY, W, H - L.sueloY);
    ctx.strokeStyle = `rgba(255,170,90,${k * 0.35})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const x = (i * 53 + 20) % W;
      const off = (juego.t * 22 + i * 37) % (H - L.sueloY);
      const y = H - off;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) ctx.lineTo(x + Math.sin(juego.t * 3 + j + i) * 4, y - j * 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function dibujaHUD(ctx) {
    // Barra superior: cuadros de periodos del día (como en la web), día y contador.
    const g = ctx.createLinearGradient(0, 0, 0, 70);
    g.addColorStop(0, 'rgba(15,53,34,.92)'); g.addColorStop(1, 'rgba(15,53,34,.86)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 64);
    ctx.font = `400 15px ${fuentes.rotulador}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(dia === 0 ? 'Lunes 13-O' : dia === 1 ? '¿Y si…?' : 'La que queremos', 14, 20);
    // Periodos del día: sin horas, todo lleno; con horas, un hueco de preparación.
    const celdas = 6;
    for (let i = 0; i < celdas; i++) {
      const x = 14 + i * 19, y = 34;
      const hueco = cfg.horas && i === 3;
      const actual = i === 4;
      ctx.fillStyle = hueco ? 'rgba(255,255,255,.1)' : actual ? C.amarillo : C.marea;
      rr(ctx, x, y, 15, 15, 3); ctx.fill();
      if (hueco) { ctx.strokeStyle = C.marea; ctx.setLineDash([3, 2]); ctx.lineWidth = 1.2; rr(ctx, x + 0.5, y + 0.5, 14, 14, 3); ctx.stroke(); ctx.setLineDash([]); }
    }
    ctx.font = `400 11px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.7)';
    ctx.fillText(cfg.horas ? 'con hueco para preparar' : 'clases seguidas, sin hueco', 132, 42);
    // Contador de alumnado alcanzado.
    const total = totalAlumnado();
    icono(ctx, 'bombilla', W - 148, 30, 22);
    ctx.font = `800 26px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'left';
    ctx.fillText(`${llegados}`, W - 132, 30);
    const wN = ctx.measureText(`${llegados}`).width;
    ctx.font = `600 15px ${fuentes.display}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
    ctx.fillText(`/ ${total}`, W - 130 + wN, 32);
    // Tiempo de clase.
    const prog = fase === 'juego' ? reloj / D.dur : fase === 'fin' ? 1 : 0;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, 62, W, 4);
    ctx.fillStyle = prog > 0.85 ? C.margen : C.amarillo; ctx.fillRect(0, 62, W * prog, 4);
  }

  function dibujaTutorial(ctx) {
    const objetivo = ninos.find(n => n.estado === 'mano');
    if (!objetivo) return;
    const a = clamp(1 - (tutorial.t - 4.5) / 1.5, 0, 1);
    const k = (juego.t % 1.4) / 1.4;
    const x = lerp(profe.x, objetivo.x, ease.inOutCubic(Math.min(1, k * 1.3)));
    const y = lerp(profe.y + 30, objetivo.y + 40, ease.inOutCubic(Math.min(1, k * 1.3)));
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(15,53,34,.85)'; rr(ctx, W / 2 - 150, H - 46, 300, 32, 16); ctx.fill();
    ctx.font = `700 14px ${fuentes.texto}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Arrastra a tu profe hasta las manos levantadas', W / 2, H - 30);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2;
    circulo(ctx, x, y, 13); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function dibujaIntro(ctx) {
    const k = aparece(tf, 0.05, 0.55);
    ctx.fillStyle = `rgba(15,53,34,${0.45 * Math.min(1, tf * 3)})`;
    ctx.fillRect(0, 0, W, H);
    const w = 330, h = dia === 0 ? 300 : 360;
    const x = (W - w) / 2, y = H / 2 - h / 2 - 10 + (1 - k) * 60;
    ctx.save(); ctx.globalAlpha = Math.min(1, tf * 4);
    hoja(ctx, x, y, w, h, { rot: -0.015 });
    rotulo(ctx, D.titulo, W / 2 + 6, y + 50, { tam: dia === 1 ? 46 : 25 });
    ctx.font = `600 15px ${fuentes.texto}`; ctx.fillStyle = C.gris; ctx.textAlign = 'center';
    ctx.fillText(D.sub, W / 2 + 8, y + 86);
    if (dia === 0) {
      parrafo(ctx, 'Cada mano levantada es alguien que necesita a su profe: una duda, un lápiz roto, un mal día.', x + 44, y + 112, w - 64, { tam: 16 });
      parrafo(ctx, '¿Llegarás a todo el mundo?', x + 44, y + 192, w - 64, { tam: 18, peso: 800, fuente: fuentes.display, color: C.pizarra });
    } else {
      let yy = y + 112;
      elegidas.slice(dia === 1 ? 0 : 0).forEach((id, i) => {
        const R = REIVINDICACIONES[id];
        icono(ctx, R.icono, x + 56, yy + 12, 24);
        parrafo(ctx, R.ysi, x + 76, yy, w - 92, { tam: 15, peso: 700, max: 2 });
        yy += dia === 1 ? 54 : 46;
      });
      if (dia === 2) {
        const faltan = Object.keys(REIVINDICACIONES).filter(id => !elegidas.includes(id));
        if (faltan.length) parrafo(ctx, `Y siguen pendientes: ${faltan.map(f => REIVINDICACIONES[f].titulo.toLowerCase()).join(' y ')}.`, x + 44, yy + 2, w - 64, { tam: 13, color: C.gris });
      }
    }
    if (tf > 1.1) {
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.pizarra; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
      ctx.fillText('Toca para empezar la clase', W / 2, y + h - 30);
    }
    ctx.restore();
  }

  function dibujaResumen(ctx) {
    if (tf < 0.9) return;
    const t = tf - 0.9;
    const k = aparece(t, 0, 0.5);
    ctx.fillStyle = `rgba(15,53,34,${0.5 * Math.min(1, t * 3)})`;
    ctx.fillRect(0, 0, W, H);
    const total = resumen.total;
    const cols = 7, filas = Math.ceil(total / cols);
    const w = 340, h = 250 + filas * 30 + (dia > 0 ? 70 : 40);
    const x = (W - w) / 2, y = H / 2 - h / 2 + (1 - k) * 50;
    hoja(ctx, x, y, w, h, { rot: 0.012 });
    const todos = resumen.llegados === total;
    rotulo(ctx, todos ? '¡A TODO EL MUNDO!' : '¡RIIIING!', W / 2 + 6, y + 40, { tam: 27 });
    ctx.font = `800 22px ${fuentes.display}`; ctx.fillStyle = C.honda; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`Has llegado a ${resumen.llegados} de ${total}`, W / 2 + 10, y + 82);
    // Caritas: encendidas o apagadas.
    const ordenados = [...ninos].sort((a, b) => b.encendido - a.encendido);
    ordenados.forEach((n, i) => {
      const cx = x + 56 + (i % cols) * 38, cy = y + 120 + Math.floor(i / cols) * 30;
      const ap = aparece(t, 0.3 + i * 0.03, 0.3);
      if (ap <= 0) return;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(ap, ap);
      if (n.encendido) { ctx.fillStyle = 'rgba(255,207,51,.5)'; circulo(ctx, 0, 0, 13); ctx.fill(); }
      ctx.fillStyle = n.encendido ? n.p.piel : '#c9c4b8'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
      circulo(ctx, 0, 0, 9); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0f3522'; circulo(ctx, -3, -1, 1.2); ctx.fill(); circulo(ctx, 3, -1, 1.2); ctx.fill();
      ctx.beginPath(); ctx.lineWidth = 1.2;
      if (n.encendido) ctx.arc(0, 1.5, 3, 0.2, Math.PI - 0.2); else { ctx.moveTo(-2.5, 4); ctx.lineTo(2.5, 4); }
      ctx.stroke();
      ctx.restore();
    });
    let yy = y + 120 + filas * 30 + 6;
    const motivo = dia === 0 ? motivoDia0() : textoMejora();
    const alto = parrafo(ctx, motivo, x + 44, yy, w - 64, { tam: 14.5, color: C.tinta });
    yy += alto + 10;
    if (tf > 2.2) {
      ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.pizarra; ctx.textAlign = 'center';
      ctx.fillText('Toca para seguir', W / 2 + 8, y + h - 24);
      ctx.globalAlpha = 1;
    }
  }
  function motivoDia0() {
    const partes = [`${resumen.total} en clase`];
    partes.push(`${papeles.total} papeles que rellenar`);
    partes.push(`${Math.round(temp)} °C en el barracón`);
    return `No es por ti: ${partes.join(', ')}, cinco horas seguidas sin un hueco y tres alumnos repartidos de una clase sin sustituto.`;
  }
  function textoMejora() {
    const a = est.aulas[0];
    const antes = a ? `El lunes: ${a.llegados} de ${a.total}. ` : '';
    if (dia === 1) return antes + elegidas.map(id => REIVINDICACIONES[id].efecto).join(' ');
    return antes + 'Así sería un aula con lo que pide la huelga. Todavía no es así.';
  }
}
