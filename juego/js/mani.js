// Modo Mani: arrastra la cabecera. La gente de las aceras se suma si pasas cerca, y en cada glorieta
// eliges qué pancarta llevar (solo cabe una de cada par). La mani 2 acaba ante la Consejería con un
// momento rítmico: «Zarzalejo, reúnete ya» y «Educación pública y de calidad».
import { TAU, clamp, lerp, damp, ease, rr, circulo, elipse, sombra, fuentes, azar, alfa, formatoNum, mezcla } from './util.js';
import { dibujaPersona, personaAzar, PROFES, conCamisetaVerde, spritePersona, pintaSprite, PAL } from './personajes.js';
import { icono } from './iconos.js';
import { C, hoja, parrafo, rotulo, crearParticulas, pancarta, cartel, aparece } from './ui.js';
import { REIVINDICACIONES, IDS, ACTUAL } from './datos.js';
import { CANTICO, eventosFrase } from './cantico.js';

const V = 92; // velocidad de la mani (px/s)
const CALLE = { x0: 52, x1: 348 }; // zona por la que se puede andar (calzada + aceras)
const SEP = 21; // separación entre manifestantes

export function escenaMani(juego, { n = 1 }) {
  const { W } = juego;
  const est = juego.estado;
  const r = azar(900 + n * 31 + (est.inicio % 1000));
  const part = crearParticulas();
  let H = juego.H;
  const yLider = () => H * 0.64;

  // ---------- Pares de reivindicaciones de esta mani ----------
  if (!est.ofrecidas.length) {
    const b = r.barajar(IDS);
    est.ofrecidas = [[b[0], b[1]], [b[2], b[3]], [b[4], b[5]]];
  }
  let pares;
  if (n === 1) pares = [est.ofrecidas[0], est.ofrecidas[1]];
  else {
    // En la segunda: el par que no salió y las dos que dejaste atrás en la primera.
    const dejadas = [...est.ofrecidas[0], ...est.ofrecidas[1]].filter(id => !est.elegidas.includes(id));
    pares = [est.ofrecidas[2], dejadas.length >= 2 ? dejadas.slice(0, 2) : est.ofrecidas[2]];
  }

  // ---------- Ruta ----------
  // Cada tramo: { tipo, desde, hasta, ... } en «metros» de recorrido (y crece hacia delante).
  const tramos = [];
  let y = 0;
  const tramo = (tipo, largo, extra = {}) => { tramos.push({ tipo, desde: y, hasta: y + largo, ...extra }); y += largo; };
  if (n === 1) {
    tramo('salida', 260, { lugar: 'atocha' });
    tramo('calle', 520);
    tramo('glorieta', 420, { lugar: 'atocha-glorieta', par: 0, radio: 74 });
    tramo('calle', 380, { obras: true });
    tramo('calle', 420);
    tramo('glorieta', 420, { lugar: 'neptuno', par: 1, radio: 70 });
    tramo('calle', 300);
    tramo('meta', 420, { lugar: 'neptuno-fin' });
  } else {
    tramo('salida', 200, { lugar: 'prado' });
    tramo('calle', 520);
    tramo('glorieta', 420, { lugar: 'cibeles', par: 0, radio: 78 });
    tramo('calle', 360, { lugar: 'metropolis' });
    tramo('obrasMedio', 420, { par: 1 });
    tramo('calle', 300);
    tramo('meta', 520, { lugar: 'consejeria' });
  }
  const largoTotal = y;
  const meta = tramos[tramos.length - 1];
  const tramoEn = yy => tramos.find(t => yy >= t.desde && yy < t.hasta) || tramos[tramos.length - 1];

  // Límites de la zona transitable a una altura dada.
  function limites(yy) {
    const t = tramoEn(yy);
    if (t.obras) {
      const k = Math.sin(clamp((yy - t.desde) / (t.hasta - t.desde), 0, 1) * Math.PI);
      return { x0: CALLE.x0 + 70 * clamp(k * 1.6, 0, 1), x1: CALLE.x1 - 70 * clamp(k * 1.6, 0, 1) };
    }
    if (t.tipo === 'meta' && t.lugar === 'consejeria') return { x0: 30, x1: W - 30 };
    return { ...CALLE };
  }
  // Obstáculos centrales (fuentes de las glorietas y obras en medio).
  function isla(yy) {
    const t = tramoEn(yy);
    const cy = (t.desde + t.hasta) / 2;
    if (t.tipo === 'glorieta') return { tipo: 'circulo', x: W / 2, y: cy, r: t.radio };
    if (t.tipo === 'obrasMedio') return { tipo: 'rect', x0: W / 2 - 62, x1: W / 2 + 62, y0: t.desde + 70, y1: t.hasta - 70 };
    return null;
  }
  function restringir(o) {
    const l = limites(o.y);
    o.x = clamp(o.x, l.x0 + 6, l.x1 - 6);
    const is = isla(o.y);
    if (is?.tipo === 'circulo') {
      const dx = o.x - is.x, dy = o.y - is.y, d = Math.hypot(dx, dy), min = is.r + 10;
      if (d < min) { const s = dx === 0 ? (o.x < W / 2 ? -1 : 1) : 1; o.x = is.x + (dx / (d || 1)) * min * s; o.y = is.y + (dy / (d || 1)) * min; }
    } else if (is?.tipo === 'rect' && o.y > is.y0 - 8 && o.y < is.y1 + 8 && o.x > is.x0 - 8 && o.x < is.x1 + 8) {
      o.x = o.x < W / 2 ? is.x0 - 8 : is.x1 + 8;
    }
  }

  // ---------- Gente ----------
  const profeP = conCamisetaVerde(PROFES[est.profe || 0]);
  const lider = { x: W / 2, y: 40, vx: 0, paso: 0 };
  const miembros = [];
  // Variantes de persona para la multitud (para la caché de sprites).
  const VARIANTES = [];
  for (let i = 0; i < 40; i++) {
    const base = personaAzar(azar(500 + i), i % 7 === 0 ? 'mayor' : i % 5 === 1 ? 'niño' : 'adulto');
    const p = i < 26 ? conCamisetaVerde(base) : base;
    if (i < 26 && i % 5 === 3) p.ropa = PAL.amarillo; // algunas camisetas amarillas
    if (i < 26 && i % 6 === 4) { p.ropa = '#f7f8f3'; p.marea = true; }
    VARIANTES.push(p);
  }
  // Al darse la vuelta, cada persona pasa a dibujarse con el sprite más parecido (mucho más rápido).
  function varianteParecida(p) {
    let mejor = 0, mp = -1;
    VARIANTES.forEach((v, i) => {
      const pt = (v.peinado === p.peinado ? 2 : 0) + (v.pelo === p.pelo ? 2 : 0) + (v.edad === p.edad ? 1.5 : 0) + (v.ropa === p.ropa ? 1 : 0) + r() * 0.8;
      if (pt > mp) { mp = pt; mejor = i; }
    });
    return mejor;
  }
  function nuevoMiembro(x, yy, extra = {}) {
    const m = { x, y: yy, var: r.entero(0, VARIANTES.length - 1), fase: r(), puño: r() < 0.35, slot: miembros.length, salto: 0, vj: 0, ...extra };
    miembros.push(m);
    return m;
  }
  const inicial = n === 1 ? 6 : Math.max(10, Math.min(150, est.mani.miembros || 40));
  for (let i = 0; i < inicial; i++) nuevoMiembro(W / 2 + (r() - 0.5) * 60, 40 - 30 - i * 3);
  const especiales = new Set(est.especiales);
  const perro = { activo: especiales.has('perro'), x: W / 2 + 30, y: 30, paso: 0 };

  // Grupos que esperan en las aceras.
  const grupos = [];
  function grupo(yy, lado, tipo = 'gente', tam = null) {
    const x = lado < 0 ? CALLE.x0 + 26 : CALLE.x1 - 26;
    const g = { x, y: yy, lado, tipo, gente: [], unido: false, t: r() * 3 };
    const cuantos = tam || (tipo === 'gente' ? r.entero(4, 8) : 6);
    for (let i = 0; i < cuantos; i++) {
      let p;
      if (tipo === 'familias') p = personaAzar(r, i % 2 ? 'niño' : 'adulto');
      else if (tipo === 'coro') p = { ...personaAzar(r, 'adulto'), peineta: true, ropa: i % 2 ? '#e0566c' : '#0f3522', pantalon: '#16221b' };
      else if (tipo === 'batucada') p = { ...conCamisetaVerde(personaAzar(r, 'adulto')), tambor: true };
      else if (tipo === 'abuela') p = personaAzar(r, 'mayor');
      else p = r() < 0.25 ? personaAzar(r, 'niño') : r() < 0.2 ? personaAzar(r, 'mayor') : personaAzar(r, 'adulto');
      if (tipo === 'gente' && r() < 0.6) p = conCamisetaVerde(p);
      p.semilla = r() * 3;
      g.gente.push({ p, dx: (i % 3) * 15 * -lado + r() * 6, dy: Math.floor(i / 3) * 16 - 16 + r() * 6, brazos: r.uno(['saluda', 'puño', 'arriba', 'saluda']) });
    }
    grupos.push(g);
    return g;
  }
  // Grupos de pancarta en cada carril de las bifurcaciones.
  const opciones = []; // { id, par, lado, g, x, y }
  function prepararRuta() {
    for (const t of tramos) {
      if (t.tipo === 'calle' || t.tipo === 'salida') {
        for (let yy = t.desde + 120; yy < t.hasta - 60; yy += 150 + r() * 60) grupo(yy, r() < 0.5 ? -1 : 1);
      }
      if ((t.tipo === 'glorieta' || t.tipo === 'obrasMedio') && t.par != null) {
        const ids = pares[t.par];
        const cy = t.tipo === 'glorieta' ? (t.desde + t.hasta) / 2 - t.radio - 34 : t.desde + 40;
        ids.forEach((id, i) => {
          const lado = i === 0 ? -1 : 1;
          const x = lado < 0 ? (t.tipo === 'glorieta' ? (CALLE.x0 + W / 2 - t.radio) / 2 : (CALLE.x0 + W / 2 - 62) / 2) : (t.tipo === 'glorieta' ? (CALLE.x1 + W / 2 + t.radio) / 2 : (CALLE.x1 + W / 2 + 62) / 2);
          const g = { x, y: cy, lado, tipo: 'pancarta', id, gente: [], unido: false, t: 0 };
          for (let k = 0; k < 8; k++) {
            const p = REIVINDICACIONES[id].grupo === 'familias' && k % 2 ? personaAzar(r, 'niño') : personaAzar(r, k === 3 ? 'mayor' : 'adulto');
            p.semilla = r() * 3;
            if (k % 3 !== 1) Object.assign(p, conCamisetaVerde(p));
            g.gente.push({ p, dx: ((k % 4) - 1.5) * 15, dy: Math.floor(k / 4) * 15 + 8, brazos: k % 2 ? 'puño' : 'cartel' });
          }
          grupos.push(g);
          opciones.push({ id, par: t.par, lado, g, yDecision: t.tipo === 'glorieta' ? (t.desde + t.hasta) / 2 : (t.desde + t.hasta) / 2 });
        });
      }
    }
    // Grupos especiales repartidos por la ruta.
    const calles = tramos.filter(t => t.tipo === 'calle');
    const especialesRuta = n === 1 ? ['batucada', 'abuela', 'perro', 'familias'] : ['coro', 'familias', 'abuela', 'batucada'];
    especialesRuta.forEach((tipo, i) => {
      const t = calles[i % calles.length];
      const yy = t.desde + 60 + ((i * 97) % Math.max(60, t.hasta - t.desde - 120));
      if (tipo === 'perro') grupos.push({ x: CALLE.x1 - 24, y: yy, lado: 1, tipo: 'perro', gente: [], unido: false, t: 0 });
      else grupo(yy, i % 2 ? 1 : -1, tipo);
    });
  }
  prepararRuta();

  // ---------- Estado ----------
  let fase = 'intro'; // intro → marcha → llegada → (ritmo → cierre) → fin
  let tf = 0;
  const elegidasAqui = [];
  let pancartasFrente = est.elegidas.slice(); // las que ya lleva la mani
  let contador = 0; // «según la organización»
  let ritmo = null;
  let ventanas = 0;

  const personasReales = () => Math.round(miembros.length * 14.3 + elegidasAqui.length * 40);

  function unirGrupo(g) {
    g.unido = true;
    if (g.tipo === 'perro') { perro.activo = true; perro.x = g.x; perro.y = g.y; especiales.add('perro'); juego.audio.sfx('huevo'); part.texto(g.x, pantallaY(g.y) - 40, '¡guau!', { tam: 16 }); return; }
    g.gente.forEach((q, i) => {
      const m = nuevoMiembro(g.x + q.dx, g.y + q.dy, { p: q.p, entrando: 1 });
      m.unido = juego.t + i * 0.05;
    });
    juego.audio.sfx('suma', { n: miembros.length });
    part.texto(g.x, pantallaY(g.y) - 50, `+${Math.round(g.gente.length * 14.3)}`, { color: C.pizarra, tam: 18 });
    if (g.tipo === 'batucada' || g.tipo === 'coro') { especiales.add(g.tipo); juego.audio.capa(g.tipo, true); part.texto(W / 2, yLider() - 140, g.tipo === 'batucada' ? '¡Se suma la batucada!' : '¡Se suma el coro rociero!', { color: C.margen, tam: 20, vida: 1.8, vy: -20 }); }
    if (g.tipo === 'abuela') part.texto(g.x, pantallaY(g.y) - 76, '«40 años de maestra»', { color: C.honda, tam: 14, vida: 1.8 });
  }
  function elegir(op) {
    if (elegidasAqui.some(e => opciones.find(o => o.id === e)?.par === op.par)) return;
    elegidasAqui.push(op.id);
    est.elegidas.push(op.id);
    pancartasFrente.push(op.id);
    unirGrupo(op.g);
    juego.audio.sfx('pancarta');
    part.confeti(op.g.x, pantallaY(op.g.y) - 30, 26);
    // El otro grupo se despide (y se queda esperando su momento).
    const otra = opciones.find(o => o.par === op.par && o !== op);
    if (otra) otra.g.despide = true;
    const R = REIVINDICACIONES[op.id];
    banner = { t: 0, id: op.id, texto: R.titulo };
  }
  let banner = null;

  const pantallaY = yy => yLider() - (yy - lider.y);

  // ---------- Actualización ----------
  function actualizarMarcha(dt) {
    const e = juego.entrada;
    // La cabecera sigue el dedo en horizontal; avanza sola.
    let tx = lider.x;
    if (e.abajo) tx = e.x;
    const l = limites(lider.y);
    tx = clamp(tx, l.x0 + 10, l.x1 - 10);
    lider.vx = damp(lider.vx, clamp((tx - lider.x) * 8, -380, 380), 12, dt);
    lider.x += lider.vx * dt;
    const avance = fase === 'marcha' ? V : 0;
    lider.y += avance * dt;
    restringir(lider);
    lider.paso += (avance + Math.abs(lider.vx) * 0.5) * dt / 44;
    if (fase === 'marcha' && lider.y >= meta.desde + (meta.lugar === 'consejeria' ? 160 : 200)) llegar();
    // Unirse: grupos cercanos a la cabecera o a los costados de la mani.
    for (const g of grupos) {
      if (g.unido || g.tipo === 'pancarta') continue;
      const dy = Math.abs(g.y - lider.y);
      if (dy < 26 && Math.abs(g.x - lider.x) < 104) unirGrupo(g);
    }
    // Elegir pancarta: el carril por el que pasas.
    for (const op of opciones) {
      if (op.g.unido || op.g.despide) continue;
      if (Math.abs(op.g.y - lider.y) < 28 && Math.abs(op.g.x - lider.x) < 70) elegir(op);
      else if (lider.y > op.yDecision && !elegidasAqui.some(id => opciones.find(o => o.id === id)?.par === op.par)) {
        // Si nadie eligió (pasó por en medio), se elige la del lado más cercano.
        const delPar = opciones.filter(o => o.par === op.par);
        delPar.sort((a, b) => Math.abs(a.g.x - lider.x) - Math.abs(b.g.x - lider.x));
        elegir(delPar[0]);
      }
    }
  }

  function actualizarMiembros(dt) {
    // Colocación en filas detrás de la cabecera, apretándose en los estrechamientos.
    const filasFrente = pancartasFrente.length; // filas reservadas a pancartas
    let i = 0;
    for (const m of miembros) {
      const idx = i++;
      let fila = 0, col = 0, nFila = 1;
      // Filas de 9 como mucho.
      const porFila = 9;
      fila = Math.floor(idx / porFila) + 1 + filasFrente * 1.9;
      col = idx % porFila;
      nFila = Math.min(porFila, miembros.length - Math.floor(idx / porFila) * porFila);
      const ty = lider.y - 20 - fila * 17;
      const l = limites(ty);
      const ancho = Math.min((l.x1 - l.x0) - 24, nFila * SEP);
      const cx = clamp(lider.x * 0.55 + W / 2 * 0.45, l.x0 + ancho / 2 + 12, l.x1 - ancho / 2 - 12);
      let tx = cx + (nFila > 1 ? (col / (nFila - 1) - 0.5) * ancho : 0) + Math.sin(m.fase * 9) * 4;
      const tyy = ty + Math.cos(m.fase * 7) * 3;
      const vel = m.entrando ? 260 : 220;
      const dx = tx - m.x, dy = tyy - m.y, d = Math.hypot(dx, dy);
      if (d > 0.5) { const s = Math.min(vel * dt, d * 6 * dt + 0.1); m.x += (dx / d) * s; m.y += (dy / d) * s; }
      if (m.entrando && d < 30) { m.entrando = 0; if (m.p) { m.var = varianteParecida(m.p); m.puño = m.p.edad !== 'niño' && r() < 0.4; delete m.p; } }
      restringir(m);
      m.paso = (m.paso || m.fase) + (V * dt) / 40;
      // Saltitos de alegría.
      if (m.salto > 0 || m.vj) { m.vj -= 900 * dt; m.salto = Math.max(0, m.salto + m.vj * dt); if (m.salto === 0) m.vj = 0; }
    }
    if (perro.activo) {
      const tx = lider.x + 26, ty = lider.y + 6;
      perro.x = damp(perro.x, tx, 4, dt); perro.y = damp(perro.y, ty, 4, dt);
      perro.paso += dt * 6;
    }
  }
  const saltar = (prob = 0.4, fuerza = 220) => { for (const m of miembros) if (r() < prob && m.salto === 0) { m.vj = fuerza * (0.7 + r() * 0.5); m.salto = 0.01; } };

  function llegar() {
    fase = 'llegada'; tf = 0;
    est.mani.max = Math.max(est.mani.max, personasReales());
    est.mani.miembros = miembros.length;
    est.especiales = [...especiales];
    if (n === 1) est.mani.n1 = personasReales();
    juego.audio.sfx('silbato');
    saltar(0.8, 260);
    part.confeti(W / 2, yLider() - 60, 40);
  }

  // ---------- Momento rítmico ----------
  function iniciarRitmo() {
    fase = 'ritmo'; tf = 0;
    const reloj = juego.audio.reloj();
    const ahora = juego.audio.tiempo();
    const corchea = 60 / (reloj.corriendo ? reloj.bpm : CANTICO.bpm) / 2;
    const frase = corchea * 16;
    // Arranca en la próxima frase de «educación…» o de «zarzalejo…» según el orden del cántico.
    let inicio, k;
    if (reloj.corriendo) { k = Math.ceil((ahora - reloj.inicio + 0.35) / frase); inicio = reloj.inicio + k * frase; }
    else { k = 0; inicio = ahora + 1.2; }
    const notas = [];
    const frases = 4;
    for (let f = 0; f < frases; f++) {
      const nombre = CANTICO.orden[(k + f) % CANTICO.orden.length];
      for (const ev of eventosFrase(nombre, 0)) notas.push({ t: inicio + f * frase + ev.corchea * corchea, texto: ev.texto, fuerte: ev.fuerte, frase: f, nombre, estado: 'espera' });
    }
    ritmo = { inicio, frase, corchea, notas, aciertos: 0, total: notas.filter(n => n.fuerte).length, fin: inicio + frases * frase, racha: 0, ultimoGolpe: -9, propio: !reloj.corriendo };
  }
  function actualizarRitmo() {
    const ahora = juego.audio.tiempo();
    const VENT = 0.17;
    // Toques: el más cercano dentro de la ventana.
    for (const p of juego.entrada.pulsaciones) {
      const tAudio = p.teclado ? ahora : ahora - (performance.now() - p.t) / 1000;
      let mejor = null, md = VENT;
      for (const no of ritmo.notas) { if (!no.fuerte || no.estado !== 'espera') continue; const d = Math.abs(no.t - tAudio); if (d < md) { md = d; mejor = no; } }
      if (mejor) {
        mejor.estado = md < 0.085 ? 'perfecto' : 'bien';
        ritmo.aciertos++; ritmo.racha++;
        juego.audio.sfx('acierto', { f: 523 * 2 ** ((ritmo.racha % 5) * 2 / 12) });
        saltar(0.35, 240);
        ventanas = Math.min(12, ventanas + 1);
        ritmo.ultimoGolpe = juego.t;
        // Más gente que llega por las calles laterales.
        for (let i = 0; i < 2; i++) nuevoMiembro(r() < 0.5 ? 20 : W - 20, lider.y - 120 - r() * 100, { entrando: 1 });
        part.texto(W / 2 + (r() - 0.5) * 120, H - 170, mejor.estado === 'perfecto' ? '¡PERFECTO!' : '¡BIEN!', { color: mejor.estado === 'perfecto' ? C.margen : C.pizarra, tam: 18, vida: 0.7 });
      } else { ritmo.racha = 0; juego.audio.sfx('fallo'); }
    }
    for (const no of ritmo.notas) if (no.fuerte && no.estado === 'espera' && ahora - no.t > VENT) { no.estado = 'fallo'; ritmo.racha = 0; }
    if (ahora > ritmo.fin + 0.6) {
      fase = 'cierre'; tf = 0;
      est.ritmo = { aciertos: ritmo.aciertos, total: ritmo.total };
      est.mani.max = Math.max(est.mani.max, personasReales());
      est.mani.miembros = miembros.length;
    }
  }

  // ---------- Escena ----------
  return {
    fondo: '#cfd6d2',
    redimensionar() { H = juego.H; },
    info: () => ({ fase, tf, notas: ritmo ? ritmo.notas.filter(x => x.fuerte).map(x => x.t) : null }),
    entrar() {
      juego.audio.musica('mani', { reiniciar: true, capas: { batucada: especiales.has('batucada'), coro: especiales.has('coro'), canto: true } });
    },
    actualizar(dt) {
      tf += dt;
      part.actualizar(dt);
      if (banner) { banner.t += dt; if (banner.t > 2.6) banner = null; }
      if (juego.debug) window.__bot = () => {
        // Bot: va hacia el grupo pendiente más cercano por delante.
        const delante = grupos.filter(g => !g.unido && !g.despide && g.y > lider.y && g.y - lider.y < 260).sort((a, b) => a.y - b.y);
        const g = delante.find(g => g.tipo === 'pancarta') || delante[0];
        window.__stats = { miembros: miembros.length, personas: personasReales(), elegidas: est.elegidas, fase };
        if (fase === 'ritmo') return null;
        return g ? juego.aCss(g.x, yLider() + 30) : null;
      };
      if (fase === 'intro') {
        actualizarMiembros(dt);
        if (tf > 1.1 && (juego.entrada.toques.length || juego.entrada.abajo)) { fase = 'marcha'; tf = 0; juego.audio.sfx('silbato'); }
        return;
      }
      if (fase === 'marcha') actualizarMarcha(dt);
      else { lider.vx = 0; if (n === 2) lider.x = damp(lider.x, W / 2, 2, dt); }
      actualizarMiembros(dt);
      contador = damp(contador, personasReales(), 3, dt);
      if (fase === 'llegada') {
        if (tf > 0.6 && r() < dt * 2) saltar(0.15, 200);
        if (n === 2 && tf > 2.2) iniciarRitmo();
        else if (n === 1 && tf > 2.2 && juego.entrada.toques.length) juego.siguiente();
        return;
      }
      if (fase === 'ritmo') { if (juego.debug) window.__ritmoInfo = () => ritmo; actualizarRitmo(); return; }
      if (fase === 'cierre') {
        if (tf > 4.5 && juego.entrada.toques.length) juego.siguiente();
      }
    },
    dibujar(ctx) {
      dibujaMundo(ctx);
      dibujaGente(ctx);
      part.dibujar(ctx);
      dibujaHUD(ctx);
      if (banner) dibujaBanner(ctx);
      if (fase === 'intro') dibujaIntro(ctx);
      if (fase === 'llegada' && n === 1 && tf > 1.2) dibujaFinMani1(ctx);
      if (fase === 'ritmo') dibujaRitmo(ctx);
      if (fase === 'cierre') dibujaCierre(ctx);
    },
  };

  // ======================= Dibujo =======================
  function dibujaMundo(ctx) {
    const yTop = lider.y + yLider() + 40; // y de mundo en lo alto de la pantalla
    const yBot = lider.y - (H - yLider()) - 40;
    // Asfalto.
    ctx.fillStyle = '#8e9a96';
    ctx.fillRect(0, 0, W, H);
    for (const t of tramos) {
      if (t.hasta < yBot || t.desde > yTop) continue;
      const sy0 = pantallaY(t.hasta), sy1 = pantallaY(t.desde);
      dibujaTramo(ctx, t, sy0, sy1);
    }
    // Grupos en las aceras (de frente).
    for (const g of grupos) {
      if (g.unido) continue;
      const sy = pantallaY(g.y);
      if (sy < -80 || sy > H + 60) continue;
      dibujaGrupo(ctx, g, sy);
    }
  }

  function dibujaTramo(ctx, t, sy0, sy1) {
    const h = sy1 - sy0;
    // Aceras y edificios a los lados.
    ctx.fillStyle = '#d8d2c4'; ctx.fillRect(0, sy0, CALLE.x0 + 34, h); ctx.fillRect(CALLE.x1 - 34, sy0, W - CALLE.x1 + 34, h);
    ctx.fillStyle = 'rgba(15,53,34,.08)';
    for (let yy = Math.floor(sy0 / 22) * 22; yy < sy1; yy += 22) { ctx.fillRect(0, yy, CALLE.x0 + 34, 1); ctx.fillRect(CALLE.x1 - 34, yy, W, 1); }
    // Bordillo.
    ctx.fillStyle = '#b9b2a2'; ctx.fillRect(CALLE.x0 + 32, sy0, 4, h); ctx.fillRect(CALLE.x1 - 36, sy0, 4, h);
    // Tejados madrileños en los bordes.
    dibujaTejados(ctx, t, sy0, sy1);
    // Líneas de carril.
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.setLineDash([22, 26]);
    ctx.lineDashOffset = -(lider.y % 48);
    if (t.tipo === 'calle' || t.tipo === 'salida') { ctx.beginPath(); ctx.moveTo(W / 2, sy0); ctx.lineTo(W / 2, sy1); ctx.stroke(); }
    ctx.setLineDash([]);
    // Árboles en las aceras (copas vistas desde arriba).
    if (t.tipo === 'calle' || t.tipo === 'salida') {
      for (let k = Math.ceil(t.desde / 90) * 90; k < t.hasta; k += 90) {
        const sy = pantallaY(k);
        if (sy < sy0 - 30 || sy > sy1 + 30) continue;
        arbol(ctx, CALLE.x0 + 14, sy, 20 + (k % 7)); arbol(ctx, CALLE.x1 - 14, sy - 40, 19 + (k % 5));
      }
    }
    if (t.obras) dibujaVallas(ctx, t);
    if (t.tipo === 'glorieta') dibujaGlorieta(ctx, t);
    if (t.tipo === 'obrasMedio') dibujaObrasMedio(ctx, t);
    if (t.tipo === 'salida') dibujaSalida(ctx, t, sy0, sy1);
    if (t.lugar === 'metropolis') dibujaMetropolis(ctx, t);
    if (t.tipo === 'meta') dibujaMeta(ctx, t, sy0, sy1);
    // Pasos de cebra al empezar cada tramo.
    if (t.tipo !== 'meta') {
      const sy = pantallaY(t.desde);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for (let x = CALLE.x0 + 40; x < CALLE.x1 - 40; x += 16) ctx.fillRect(x, sy - 22, 9, 20);
    }
  }

  function dibujaTejados(ctx, t, sy0, sy1) {
    const colores = ['#c8754e', '#b9654a', '#a9a39a', '#d08b5c', '#9c968c'];
    for (const lado of [0, 1]) {
      let k = Math.floor(t.desde / 110) * 110;
      for (; k < t.hasta; k += 110) {
        const a = pantallaY(k + 110), b = pantallaY(k);
        if (b < sy0 || a > sy1) continue;
        const x = lado ? W - 22 : 0;
        const c = colores[(k / 110 + lado * 2) % colores.length | 0];
        ctx.fillStyle = c; ctx.fillRect(x, Math.max(a, sy0) + 3, 22, Math.min(b, sy1) - Math.max(a, sy0) - 6);
        ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(lado ? x : x + 16, Math.max(a, sy0) + 3, 6, Math.min(b, sy1) - Math.max(a, sy0) - 6);
        // Balcón con vecina que aplaude (y alguna cacerolada).
        if ((k / 110) % 3 === lado) {
          const by = (a + b) / 2;
          ctx.fillStyle = '#0f3522'; ctx.fillRect(lado ? W - 26 : 18, by - 10, 8, 20);
          if ((k / 110) % 2) { const dy = Math.sin(juego.t * 14 + k) * 2; ctx.fillStyle = '#c0c6c4'; circulo(ctx, lado ? W - 31 : 31, by + dy, 4.5); ctx.fill(); }
        }
      }
    }
  }
  function arbol(ctx, x, y, r0) {
    sombra(ctx, x + 5, y + 6, r0 * 0.9, r0 * 0.5, 0.15);
    ctx.fillStyle = '#4f9a3f'; circulo(ctx, x, y, r0); ctx.fill();
    ctx.fillStyle = '#62ad4c'; circulo(ctx, x - r0 * 0.25, y - r0 * 0.25, r0 * 0.7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; circulo(ctx, x - r0 * 0.35, y - r0 * 0.4, r0 * 0.3); ctx.fill();
  }
  function dibujaVallas(ctx, t) {
    // Obras con vallas amarillas: la calle se estrecha.
    for (let k = t.desde; k < t.hasta; k += 12) {
      const l = limites(k);
      const sy = pantallaY(k);
      if (sy < -20 || sy > H + 20) continue;
      if (l.x0 > CALLE.x0 + 4) {
        ctx.fillStyle = (k / 12) % 2 ? '#f2b705' : '#16221b'; ctx.fillRect(l.x0 - 6, sy - 6, 7, 12); ctx.fillRect(l.x1 - 1, sy - 6, 7, 12);
        ctx.fillStyle = '#c9b79a'; ctx.fillRect(CALLE.x0, sy - 6, l.x0 - CALLE.x0 - 6, 12); ctx.fillRect(l.x1 + 6, sy - 6, CALLE.x1 - l.x1 - 6, 12);
      }
    }
    const mid = (t.desde + t.hasta) / 2;
    const sy = pantallaY(mid);
    cartel(ctx, ['OBRAS', 'FASE 1 DE 9'], CALLE.x0 + 30, sy, 56, 30, { t: juego.t, color: '#f2b705' });
    // Grúa.
    ctx.strokeStyle = '#f2b705'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(CALLE.x1 - 10, sy + 30); ctx.lineTo(CALLE.x1 - 10, sy - 70); ctx.lineTo(CALLE.x1 - 110, sy - 70); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(CALLE.x1 - 80, sy - 70); ctx.lineTo(CALLE.x1 - 80, sy - 40 + Math.sin(juego.t) * 4); ctx.stroke();
  }
  function dibujaGlorieta(ctx, t) {
    const cy = pantallaY((t.desde + t.hasta) / 2);
    const R = t.radio;
    // Calzada circular más clara y jardín o fuente en el centro.
    ctx.fillStyle = 'rgba(255,255,255,.08)'; circulo(ctx, W / 2, cy, R + 60); ctx.fill();
    sombra(ctx, W / 2 + 6, cy + 8, R, R * 0.9, 0.2);
    if (t.lugar === 'atocha-glorieta') {
      ctx.fillStyle = '#62ad4c'; circulo(ctx, W / 2, cy, R); ctx.fill();
      ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 6; circulo(ctx, W / 2, cy, R - 3); ctx.stroke();
      ctx.fillStyle = '#4f9a3f'; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; circulo(ctx, W / 2 + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55, 12); ctx.fill(); }
      ctx.fillStyle = '#ffcf33'; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; circulo(ctx, W / 2 + Math.cos(a) * R * 0.85, cy + Math.sin(a) * R * 0.85, 2.4); ctx.fill(); }
    } else {
      // Fuente: pilón, agua y estatua.
      ctx.fillStyle = '#e8e2d4'; circulo(ctx, W / 2, cy, R); ctx.fill();
      ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5; circulo(ctx, W / 2, cy, R); ctx.stroke();
      ctx.fillStyle = '#6fb7d6'; circulo(ctx, W / 2, cy, R - 9); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { const rr2 = ((juego.t * 14 + i * 18) % (R - 14)) + 6; ctx.globalAlpha = 1 - rr2 / R; circulo(ctx, W / 2, cy, rr2); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e8e2d4'; circulo(ctx, W / 2, cy, 18); ctx.fill(); ctx.strokeStyle = '#0f3522'; ctx.stroke();
      if (t.lugar === 'neptuno') estatuaNeptuno(ctx, W / 2, cy);
      else estatuaCibeles(ctx, W / 2, cy);
    }
    // Rótulo del lugar.
    const nombre = { 'atocha-glorieta': 'Glorieta de Atocha', neptuno: 'Plaza de Neptuno', cibeles: 'Plaza de Cibeles' }[t.lugar];
    if (nombre) placa(ctx, nombre, W / 2, cy - R - 18);
  }
  function placa(ctx, txt, x, y) {
    ctx.font = `700 11px ${fuentes.texto}`;
    const w = ctx.measureText(txt).width + 16;
    ctx.fillStyle = '#244f3a'; rr(ctx, x - w / 2, y - 9, w, 18, 3); ctx.fill();
    ctx.strokeStyle = '#f7f8f3'; ctx.lineWidth = 1; rr(ctx, x - w / 2 + 2, y - 7, w - 4, 14, 2); ctx.stroke();
    ctx.fillStyle = '#f7f8f3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 0.5);
  }
  function estatuaNeptuno(ctx, x, y) {
    ctx.fillStyle = '#d9d4c6'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
    elipse(ctx, x, y + 2, 13, 8); ctx.fill(); ctx.stroke();
    circulo(ctx, x, y - 14, 6); ctx.fill(); ctx.stroke();
    rr(ctx, x - 6, y - 9, 12, 12, 4); ctx.fill(); ctx.stroke();
    // Tridente.
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 9, y + 2); ctx.lineTo(x + 9, y - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, y - 26); ctx.lineTo(x + 4, y - 32); ctx.moveTo(x + 14, y - 26); ctx.lineTo(x + 14, y - 32); ctx.moveTo(x + 4, y - 26); ctx.lineTo(x + 14, y - 26); ctx.stroke();
  }
  function estatuaCibeles(ctx, x, y) {
    ctx.fillStyle = '#d9d4c6'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
    // Carro con dos leones.
    rr(ctx, x - 12, y - 6, 24, 14, 4); ctx.fill(); ctx.stroke();
    for (const l of [-1, 1]) { elipse(ctx, x + l * 7, y + 14, 5, 8); ctx.fill(); ctx.stroke(); circulo(ctx, x + l * 7, y + 22, 4); ctx.fill(); ctx.stroke(); }
    circulo(ctx, x, y - 16, 6); ctx.fill(); ctx.stroke();
    rr(ctx, x - 5, y - 12, 10, 10, 3); ctx.fill(); ctx.stroke();
  }
  function dibujaObrasMedio(ctx, t) {
    const is = { x0: W / 2 - 62, x1: W / 2 + 62 };
    const a = pantallaY(t.hasta - 70), b = pantallaY(t.desde + 70);
    ctx.fillStyle = '#c9b79a'; ctx.fillRect(is.x0, a, is.x1 - is.x0, b - a);
    ctx.fillStyle = 'rgba(120,90,50,.25)'; for (let i = 0; i < 6; i++) { elipse(ctx, is.x0 + 20 + (i * 37) % 90, a + 20 + (i * 53) % Math.max(20, b - a - 40), 12, 6); ctx.fill(); }
    for (let yy = a; yy < b; yy += 12) { ctx.fillStyle = ((yy - a) / 12) % 2 < 1 ? '#f2b705' : '#16221b'; ctx.fillRect(is.x0 - 4, yy, 5, 12); ctx.fillRect(is.x1 - 1, yy, 5, 12); }
    for (let xx = is.x0; xx < is.x1; xx += 12) { ctx.fillStyle = ((xx - is.x0) / 12) % 2 < 1 ? '#f2b705' : '#16221b'; ctx.fillRect(xx, a - 4, 12, 5); ctx.fillRect(xx, b - 1, 12, 5); }
    // Hormigonera y cartel: la construcción por fases, en medio de Alcalá.
    ctx.fillStyle = '#e0566c'; circulo(ctx, W / 2 - 20, (a + b) / 2 + 30, 14); ctx.fill(); ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5; ctx.stroke();
    cartel(ctx, ['OBRAS', 'FASE 3 DE 12', 'DESDE 2015'], W / 2 + 6, (a + b) / 2 - 6, 84, 44, { t: juego.t, color: '#f2b705' });
  }
  function dibujaSalida(ctx, t, sy0, sy1) {
    if (t.lugar === 'atocha') {
      // La estación de Atocha: bóveda de hierro y cristal a la izquierda.
      const y0 = pantallaY(t.desde + 200), y1 = pantallaY(t.desde - 60);
      ctx.fillStyle = '#b3543f'; ctx.fillRect(0, y0, CALLE.x0 + 22, y1 - y0);
      ctx.fillStyle = '#9fc7d6'; rr(ctx, 4, y0 + 10, CALLE.x0 + 10, y1 - y0 - 20, 10); ctx.fill();
      ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.2;
      for (let yy = y0 + 18; yy < y1 - 10; yy += 10) { ctx.beginPath(); ctx.moveTo(4, yy); ctx.lineTo(CALLE.x0 + 14, yy); ctx.stroke(); }
      placa(ctx, 'Atocha', CALLE.x0 + 70, pantallaY(t.desde + 60));
    } else placa(ctx, 'Paseo del Prado', CALLE.x0 + 84, pantallaY(t.desde + 60));
  }
  function dibujaMetropolis(ctx, t) {
    // El edificio Metrópolis: cúpula negra con la Victoria alada dorada.
    const sy = pantallaY((t.desde + t.hasta) / 2);
    ctx.fillStyle = '#efe6d2'; ctx.fillRect(W - 46, sy - 70, 46, 140);
    ctx.fillStyle = '#1d2a33'; circulo(ctx, W - 22, sy, 26); ctx.fill();
    ctx.strokeStyle = '#d6a93a'; ctx.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(W - 22, sy - 26); ctx.lineTo(W - 22 + i * 10, sy + 26); ctx.stroke(); }
    ctx.fillStyle = '#d6a93a'; circulo(ctx, W - 22, sy, 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W - 22, sy - 4); ctx.lineTo(W - 36, sy - 12); ctx.lineTo(W - 24, sy); ctx.lineTo(W - 8, sy - 12); ctx.closePath(); ctx.fill();
    placa(ctx, 'Calle de Alcalá', CALLE.x0 + 80, sy + 40);
  }
  function dibujaMeta(ctx, t, sy0, sy1) {
    if (t.lugar === 'consejeria') {
      // Fachada de la Consejería al fondo de la calle.
      const fy = pantallaY(t.hasta - 40);
      const base = pantallaY(t.desde + 300);
      ctx.fillStyle = '#c9c0ad'; ctx.fillRect(20, base - 4, W - 40, 8);
      ctx.fillStyle = '#e9dfc9'; ctx.fillRect(20, fy, W - 40, base - fy);
      ctx.fillStyle = '#d7cbb1'; ctx.fillRect(20, fy, W - 40, 20);
      ctx.fillStyle = '#b9ad93'; ctx.fillRect(20, fy + 20, W - 40, 4);
      // Ventanas: se encienden con cada acierto del cántico.
      const filas = 3, cols = 6;
      for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
        const wx = 44 + c * ((W - 88) / (cols - 1)) - 14, wy = fy + 38 + f * ((base - fy - 120) / filas);
        const i = f * cols + c;
        const encendida = i < ventanas * 1.5;
        ctx.fillStyle = '#0f3522'; rr(ctx, wx - 2, wy - 2, 32, 40, 3); ctx.fill();
        ctx.fillStyle = encendida ? '#ffe28a' : '#58707a'; rr(ctx, wx, wy, 28, 36, 2); ctx.fill();
        // Persiana.
        const bajada = fase === 'cierre' && i === 8 ? clamp(tf / 2.5 - 0.4, 0, 1) : (encendida ? 0.35 : 0.6);
        ctx.fillStyle = '#cbbd9e'; ctx.fillRect(wx, wy, 28, 36 * bajada);
        ctx.strokeStyle = 'rgba(15,53,34,.2)'; ctx.lineWidth = 1; for (let k = 4; k < 36 * bajada; k += 4) { ctx.beginPath(); ctx.moveTo(wx, wy + k); ctx.lineTo(wx + 28, wy + k); ctx.stroke(); }
        // Una silueta que se asoma y vuelve a esconderse.
        if (fase === 'cierre' && i === 8 && tf > 0.6 && tf < 1.6) { ctx.fillStyle = 'rgba(15,53,34,.6)'; circulo(ctx, wx + 14, wy + 26, 6); ctx.fill(); }
      }
      // Puerta cerrada y bandera.
      const px = W / 2 - 34, py = base - 92;
      ctx.fillStyle = '#5a3c27'; rr(ctx, px, py, 68, 88, 30); ctx.fill();
      ctx.strokeStyle = '#3e2818'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2, py + 10); ctx.lineTo(W / 2, py + 88); ctx.stroke();
      ctx.fillStyle = '#d6a93a'; circulo(ctx, W / 2 - 6, py + 52, 3); ctx.fill(); circulo(ctx, W / 2 + 6, py + 52, 3); ctx.fill();
      ctx.fillStyle = '#f7f8f3'; rr(ctx, W / 2 - 80, fy + 6, 160, 12, 2); ctx.fill();
      ctx.font = `700 9px ${fuentes.texto}`; ctx.fillStyle = '#4a594f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CONSEJERÍA DE EDUCACIÓN', W / 2, fy + 12.5);
    } else {
      placa(ctx, 'Plaza de Cánovas del Castillo', W / 2, pantallaY(t.desde + 120));
    }
  }

  function dibujaGrupo(ctx, g, sy) {
    g.t += juego.dt;
    if (g.tipo === 'perro') { dibujaPerro(ctx, g.x, sy, juego.t * 3, true); return; }
    const gente = [...g.gente].sort((a, b) => a.dy - b.dy);
    if (g.tipo === 'pancarta') {
      const R = REIVINDICACIONES[g.id];
      for (const q of gente) {
        const qx = g.x + q.dx, qy = sy + q.dy;
        if (q.brazos === 'cartel') cartel(ctx, '', qx + 9, qy - 46, 18, 16, { t: juego.t + q.dx, color: '#f7f8f3' }), icono(ctx, R.icono, qx + 9, qy - 54, 12);
        dibujaPersona(ctx, q.p, { x: qx, y: qy, esc: 0.86, brazos: g.despide ? 'saluda' : q.brazos === 'cartel' ? 'uno' : 'puño', expr: g.despide ? 'normal' : 'gritando', t: juego.t + q.p.semilla, paso: Math.sin(juego.t * 4 + q.dx) * 0.2 });
      }
      // La pancarta delante del grupo.
      pancarta(ctx, R.pancarta, g.x, sy - 30, 116, 36, { t: juego.t, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(g.id) + 1 });
      if (!g.despide) {
        // Flecha que invita a elegir.
        const k = (Math.sin(juego.t * 5) + 1) / 2;
        ctx.fillStyle = alfa('#0f3522', 0.8);
        ctx.beginPath(); ctx.moveTo(g.x - 9, sy + 46 + k * 6); ctx.lineTo(g.x + 9, sy + 46 + k * 6); ctx.lineTo(g.x, sy + 36 + k * 6); ctx.closePath(); ctx.fill();
      }
      return;
    }
    for (const q of gente) {
      const qx = g.x + q.dx, qy = sy + q.dy;
      const p = q.p;
      dibujaPersona(ctx, p, { x: qx, y: qy, esc: p.edad === 'niño' ? 0.92 : 0.86, brazos: p.tambor ? 'abajo' : q.brazos, expr: 'feliz', t: juego.t + p.semilla, salto: Math.max(0, Math.sin(juego.t * 6 + q.dx)) * 3 });
      if (p.tambor) { ctx.fillStyle = '#e0566c'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.3; rr(ctx, qx - 9, qy - 30, 18, 14, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#f7f8f3'; elipse(ctx, qx, qy - 30, 9, 3); ctx.fill(); ctx.stroke(); }
      if (p.peineta) { ctx.fillStyle = '#16221b'; ctx.beginPath(); ctx.arc(qx, qy - 53, 9, Math.PI, TAU); ctx.fill(); ctx.fillStyle = '#e0566c'; circulo(ctx, qx + 7, qy - 48, 3); ctx.fill(); }
    }
    if (g.tipo === 'abuela') cartel(ctx, ['FUI MAESTRA', '40 AÑOS'], g.x - g.lado * 4, sy - 52, 52, 26, { t: juego.t });
    if (g.tipo === 'familias') cartel(ctx, ['AMPA', 'CON LA PÚBLICA'], g.x + g.lado * 8, sy - 54, 56, 26, { t: juego.t + 1, color: '#ffcf33' });
  }
  function dibujaPerro(ctx, x, y, t, deFrente) {
    sombra(ctx, x, y + 2, 12, 4);
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#b07a48'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.4;
    for (const l of [-6, 6]) { rr(ctx, l - 2, -6 + Math.sin(t * 8 + l) * 1.5, 4, 8, 2); ctx.fill(); ctx.stroke(); }
    elipse(ctx, 0, -10, 11, 7); ctx.fill(); ctx.stroke();
    circulo(ctx, deFrente ? 0 : 0, -19, 6.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a5a3c'; elipse(ctx, -6, -21, 2.6, 4.5, 0.4); ctx.fill(); elipse(ctx, 6, -21, 2.6, 4.5, -0.4); ctx.fill();
    ctx.fillStyle = '#5fb84a'; ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(6, -14); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b07a48'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(10, -12); ctx.quadraticCurveTo(15, -16 + Math.sin(t * 12) * 4, 14, -22); ctx.stroke();
    if (deFrente) { ctx.fillStyle = '#0f3522'; circulo(ctx, -2.2, -20, 1); ctx.fill(); circulo(ctx, 2.2, -20, 1); ctx.fill(); circulo(ctx, 0, -17, 1.4); ctx.fill(); }
    ctx.restore();
  }

  function dibujaGente(ctx) {
    // Multitud de espaldas, ordenada por profundidad. Los que acaban de unirse aún van de frente un instante.
    const lista = [];
    for (const m of miembros) lista.push(m);
    lista.sort((a, b) => b.y - a.y);
    const filasFrente = pancartasFrente.length;
    // Pancartas que lleva la cabecera (detrás de la profe).
    const dibujarPancartas = () => {
      pancartasFrente.forEach((id, i) => {
        const R = REIVINDICACIONES[id];
        const yy = lider.y - 24 - i * 32;
        const sy = pantallaY(yy);
        const l = limites(yy);
        const w = Math.min(150, l.x1 - l.x0 - 20);
        const cx = clamp(lider.x * 0.6 + W / 2 * 0.4, l.x0 + w / 2 + 8, l.x1 - w / 2 - 8);
        pancarta(ctx, R.pancarta, cx, sy - 58, w, 32, { t: juego.t + i, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1 });
      });
    };
    let pancartasHechas = false;
    for (const m of lista) {
      const sy = pantallaY(m.y);
      if (sy < -60 || sy > H + 80) continue;
      if (!pancartasHechas && m.y < lider.y - 24 - filasFrente * 32) { dibujarPancartas(); pancartasHechas = true; }
      if (m.p) {
        dibujaPersona(ctx, m.p, { x: m.x, y: sy, esc: 0.82, vista: m.entrando ? 'frente' : 'espalda', brazos: m.puño && fase !== 'marcha' ? 'puño' : m.puño ? 'puño' : 'abajo', expr: 'feliz', t: juego.t + m.fase * 5, paso: m.paso, salto: m.salto });
      } else {
        const frame = Math.floor(((m.paso || 0) * 4) % 4);
        const pr = VARIANTES[m.var];
        const s = spritePersona(pr, `m${m.var}f${frame}${m.puño ? 'p' : ''}`, { vista: 'espalda', brazos: m.puño ? 'puño' : 'abajo', paso: frame / 4, t: m.fase * 3, expr: 'feliz' }, 0.82);
        pintaSprite(ctx, s, m.x, sy - m.salto);
      }
    }
    if (!pancartasHechas) dibujarPancartas();
    // La profe en cabeza, con megáfono en la mano levantada.
    if (perro.activo) dibujaPerro(ctx, perro.x, pantallaY(perro.y), perro.paso, false);
    const syL = pantallaY(lider.y);
    dibujaPersona(ctx, profeP, { x: lider.x, y: syL, esc: 1.05, vista: 'espalda', brazos: 'puño', t: juego.t, paso: lider.paso, salto: fase === 'llegada' ? Math.max(0, Math.sin(tf * 8)) * 8 : 0 });
    // Marcador de la cabecera.
    ctx.strokeStyle = alfa('#ffcf33', 0.9); ctx.lineWidth = 2.5;
    elipse(ctx, lider.x, syL + 2, 20, 7); ctx.stroke();
  }

  function dibujaHUD(ctx) {
    // Contador doble: «según la organización» y «según la Comunidad».
    const g = ctx.createLinearGradient(0, 0, 0, 74);
    g.addColorStop(0, 'rgba(15,53,34,.94)'); g.addColorStop(1, 'rgba(15,53,34,.82)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 72);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = `600 12px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
    ctx.fillText('Según la organización', 14, 22);
    ctx.font = `800 30px ${fuentes.display}`; ctx.fillStyle = C.amarillo;
    ctx.fillText(formatoNum(contador), 14, 54);
    ctx.font = `600 12px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.6)';
    ctx.fillText('Según la Comunidad', 200, 22);
    ctx.font = `800 18px ${fuentes.display}`; ctx.fillStyle = 'rgba(247,248,243,.6)';
    ctx.fillText(formatoNum(Math.floor(contador * ACTUAL.factorComunidad.valor)), 200, 46);
    // Barra de recorrido.
    const prog = clamp(lider.y / (meta.desde + 200), 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,.15)'; rr(ctx, 200, 54, 130, 6, 3); ctx.fill();
    ctx.fillStyle = C.marea; rr(ctx, 200, 54, 130 * prog, 6, 3); ctx.fill();
    for (const t of tramos) if (t.tipo === 'glorieta' || t.tipo === 'obrasMedio') { const k = ((t.desde + t.hasta) / 2) / (meta.desde + 200); ctx.fillStyle = elegidasAqui.length > t.par ? C.amarillo : C.papel; circulo(ctx, 200 + 130 * k, 57, 4); ctx.fill(); }
  }

  function dibujaBanner(ctx) {
    const k = aparece(banner.t, 0, 0.4) * (banner.t > 2.2 ? 1 - (banner.t - 2.2) / 0.4 : 1);
    if (k <= 0) return;
    const R = REIVINDICACIONES[banner.id];
    ctx.save(); ctx.globalAlpha = clamp(k, 0, 1);
    ctx.translate(W / 2, 112); ctx.scale(0.8 + k * 0.2, 0.8 + k * 0.2);
    ctx.fillStyle = 'rgba(15,53,34,.9)'; rr(ctx, -160, -26, 320, 58, 14); ctx.fill();
    icono(ctx, R.icono, -128, 3, 26, { linea: '#f7f8f3', relleno: '#f7f8f3' });
    ctx.font = `800 17px ${fuentes.display}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`Pancarta: ${R.titulo}`, -104, -8);
    ctx.font = `600 13px ${fuentes.texto}`; ctx.fillStyle = C.papel;
    ctx.fillText(R.ysi, -104, 14, 256);
    ctx.restore();
  }

  function dibujaIntro(ctx) {
    const k = aparece(tf, 0.05, 0.55);
    ctx.fillStyle = `rgba(15,53,34,${0.45 * Math.min(1, tf * 3)})`; ctx.fillRect(0, 0, W, H);
    const w = 330, h = 330;
    const x = (W - w) / 2, y = H / 2 - h / 2 + (1 - k) * 60;
    ctx.save(); ctx.globalAlpha = Math.min(1, tf * 4);
    hoja(ctx, x, y, w, h, { rot: 0.015 });
    rotulo(ctx, n === 1 ? 'MIÉRCOLES 14-O' : 'JUEVES 22-O', W / 2 + 8, y + 48, { tam: 30 });
    ctx.font = `600 15px ${fuentes.texto}`; ctx.fillStyle = C.gris; ctx.textAlign = 'center';
    ctx.fillText(n === 1 ? 'Primer día de huelga indefinida' : 'Manifestación hasta la Consejería', W / 2 + 10, y + 84);
    let yy = y + 108;
    yy += parrafo(ctx, 'Arrastra a izquierda y derecha para guiar la mani. Pasa cerca de la gente y se sumará.', x + 44, yy, w - 64, { tam: 15 }) + 10;
    parrafo(ctx, n === 1 ? 'En cada glorieta te esperan dos pancartas. Solo puedes llevar una: elige por qué lado pasas.' : 'Al final, la Consejería. A ver si nos abren.', x + 44, yy, w - 64, { tam: 15, peso: 700, color: C.pizarra });
    if (tf > 1.1) {
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.pizarra; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
      ctx.fillText('Toca para salir a la calle', W / 2 + 8, y + h - 28);
    }
    ctx.restore();
  }

  function dibujaFinMani1(ctx) {
    const t = tf - 1.2;
    const k = aparece(t, 0, 0.5);
    ctx.fillStyle = `rgba(15,53,34,${0.45 * Math.min(1, t * 3)})`; ctx.fillRect(0, 0, W, H);
    const w = 340, h = 340;
    const x = (W - w) / 2, y = H / 2 - h / 2 + (1 - k) * 50;
    hoja(ctx, x, y, w, h, { rot: -0.012 });
    rotulo(ctx, '¡PRIMER DÍA!', W / 2 + 8, y + 44, { tam: 30 });
    ctx.font = `800 26px ${fuentes.display}`; ctx.fillStyle = C.honda; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${formatoNum(personasReales())} personas`, W / 2 + 10, y + 88);
    ctx.font = `600 13px ${fuentes.texto}`; ctx.fillStyle = C.gris;
    ctx.fillText(`(${formatoNum(Math.floor(personasReales() * ACTUAL.factorComunidad.valor))} según la Comunidad)`, W / 2 + 10, y + 112);
    let yy = y + 134;
    ctx.font = `700 14px ${fuentes.texto}`; ctx.fillStyle = C.tinta; ctx.textAlign = 'left';
    ctx.fillText('Te llevas estas pancartas:', x + 44, yy); yy += 14;
    elegidasAqui.forEach((id, i) => {
      const R = REIVINDICACIONES[id];
      pancarta(ctx, R.pancarta, W / 2 + 10, yy + 8 + i * 52, 220, 40, { t: juego.t + i, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1, palos: false });
    });
    yy += elegidasAqui.length * 52 + 22;
    parrafo(ctx, 'Mañana, en clase: ¿y si se consiguieran?', x + 44, yy, w - 64, { tam: 15, peso: 700, color: C.pizarra });
    if (t > 1) {
      ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.pizarra; ctx.textAlign = 'center';
      ctx.fillText('Toca para seguir', W / 2 + 8, y + h - 24);
      ctx.globalAlpha = 1;
    }
  }

  function dibujaRitmo(ctx) {
    const ahora = juego.audio.tiempo();
    // Letra del cántico en la parte de abajo.
    ctx.fillStyle = 'rgba(15,53,34,.88)'; ctx.fillRect(0, H - 190, W, 190);
    const frase = Math.floor(clamp((ahora - ritmo.inicio) / ritmo.frase, 0, 3.999));
    const notasFrase = ritmo.notas.filter(no => no.frase === frase);
    // Sílabas centradas.
    ctx.textBaseline = 'middle';
    let total = 0;
    const tam = 22;
    ctx.font = `400 ${tam}px ${fuentes.rotulador}`;
    const anchos = notasFrase.map(no => ctx.measureText(no.texto.toUpperCase()).width + 8);
    total = anchos.reduce((a, b) => a + b, 0);
    let x = W / 2 - total / 2;
    notasFrase.forEach((no, i) => {
      const activo = ahora >= no.t - 0.02;
      ctx.fillStyle = no.fuerte ? (no.estado === 'fallo' ? '#e0566c' : activo ? C.amarillo : '#f7f8f3') : activo ? '#86cd55' : 'rgba(247,248,243,.55)';
      ctx.textAlign = 'left';
      const sy = H - 150 - (activo && ahora - no.t < 0.15 ? 4 : 0);
      ctx.fillText(no.texto.toUpperCase(), x, sy);
      x += anchos[i];
    });
    // Diana: los círculos se cierran hacia el anillo al ritmo de las sílabas fuertes.
    const cx = W / 2, cy = H - 82;
    ctx.strokeStyle = 'rgba(247,248,243,.9)'; ctx.lineWidth = 4; circulo(ctx, cx, cy, 30); ctx.stroke();
    const golpe = clamp(1 - (juego.t - ritmo.ultimoGolpe) / 0.25, 0, 1);
    ctx.fillStyle = alfa('#ffcf33', 0.25 + golpe * 0.6); circulo(ctx, cx, cy, 30 + golpe * 6); ctx.fill();
    for (const no of ritmo.notas) {
      if (!no.fuerte || no.estado !== 'espera') continue;
      const dt = no.t - ahora;
      if (dt > 1.2 || dt < -0.2) continue;
      const rr2 = 30 + Math.max(0, dt) * 110;
      ctx.strokeStyle = alfa('#ffcf33', clamp(1 - dt / 1.2, 0, 1)); ctx.lineWidth = 5;
      circulo(ctx, cx, cy, rr2); ctx.stroke();
    }
    ctx.font = `800 14px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center';
    ctx.fillText('Toca cuando el círculo llegue al anillo', cx, H - 30);
    ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.amarillo;
    ctx.fillText(`${ritmo.aciertos} / ${ritmo.total}`, cx, cy + 1);
    if (ahora < ritmo.inicio) {
      const cuenta = Math.ceil(ritmo.inicio - ahora);
      rotulo(ctx, cuenta > 1 ? '¡TODAS Y TODOS!' : '¡YA!', W / 2, H / 2 - 40, { tam: 30, color: C.papel, sombra: C.honda });
    }
  }

  function dibujaCierre(ctx) {
    if (tf < 2.2) return;
    const t = tf - 2.2;
    const k = aparece(t, 0, 0.5);
    ctx.fillStyle = `rgba(15,53,34,${0.5 * Math.min(1, t * 3)})`; ctx.fillRect(0, 0, W, H);
    const w = 340, h = 330;
    const x = (W - w) / 2, y = H / 2 - h / 2 + (1 - k) * 50;
    hoja(ctx, x, y, w, h, { rot: 0.012 });
    rotulo(ctx, 'LA PUERTA, CERRADA', W / 2 + 8, y + 44, { tam: 25 });
    ctx.font = `800 24px ${fuentes.display}`; ctx.fillStyle = C.honda; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${formatoNum(personasReales())} personas`, W / 2 + 10, y + 86);
    ctx.font = `600 13px ${fuentes.texto}`; ctx.fillStyle = C.gris;
    ctx.fillText(`Cántico: ${ritmo.aciertos} de ${ritmo.total} a tiempo`, W / 2 + 10, y + 110);
    let yy = y + 134;
    yy += parrafo(ctx, 'La consejera llama «inasumible» a lo que pedís y el comité de huelga denuncia que no se reúne con él.', x + 44, yy, w - 64, { tam: 15 }) + 12;
    parrafo(ctx, 'Por eso la huelga sigue. Mientras tanto, imagina la clase con todo lo que has llevado en la mani.', x + 44, yy, w - 64, { tam: 15, peso: 700, color: C.pizarra });
    if (t > 1.6) {
      ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.pizarra; ctx.textAlign = 'center';
      ctx.fillText('Toca para seguir', W / 2 + 8, y + h - 24);
      ctx.globalAlpha = 1;
    }
  }
}
