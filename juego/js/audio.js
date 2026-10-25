// Sonido: un pequeño sintetizador chiptune con WebAudio (sin archivos ni librerías)
// y un secuenciador por pasos para la música de cada escena.
import { CANTICO, eventosFrase } from './cantico.js';

const NOTAS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
export function frecuencia(n) {
  if (typeof n === 'number') return n;
  const m = /^([A-G]#?)(-?\d)$/.exec(n);
  if (!m) return 440;
  const midi = NOTAS[m[1]] + (+m[2] + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
}
const transponer = (n, semitonos) => frecuencia(n) * 2 ** (semitonos / 12);

let ac = null, master, busMusica, busSfx, ruido, pulso25, salida;
let grabacion = null; // AudioBuffer del cántico grabado, si existe
const leerMudo = () => { try { return localStorage.getItem('llegar-mudo') === '1'; } catch { return false; } };

export const audio = {
  mudo: leerMudo(),
  listo: false,
  iniciar() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = this.mudo ? 0 : 0.9;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ac.destination);
    salida = comp;
    busMusica = ac.createGain(); busMusica.gain.value = 0.62; busMusica.connect(master);
    busSfx = ac.createGain(); busSfx.gain.value = 0.7; busSfx.connect(master);
    // Ruido blanco para percusión.
    ruido = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // Onda de pulso al 25 % (el sonido «NES»).
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    pulso25 = ac.createPeriodicWave(re, im);
    this.listo = true;
    cargarGrabacion();
    if (pendiente) { const p = pendiente; pendiente = null; this.musica(p.nombre, p.opc); }
  },
  silenciar(m) {
    this.mudo = m;
    try { localStorage.setItem('llegar-mudo', m ? '1' : '0'); } catch { /* sin almacenamiento */ }
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.05);
  },
  suspender() { if (ac && ac.state === 'running') ac.suspend(); },
  reanudar() { if (ac && ac.state === 'suspended') ac.resume(); },
  tiempo() { return ac ? ac.currentTime : performance.now() / 1000; },
  hayGrabacion() { return !!grabacion; },
  sfx(nombre, opc = {}) { if (ac && SFX[nombre]) SFX[nombre](ac.currentTime + 0.005, opc); },
  musica(nombre, opc = {}) {
    if (!ac) { pendiente = { nombre, opc }; return; }
    secuenciador.poner(nombre, opc);
  },
  capa(nombre, activa) { secuenciador.capas[nombre] = activa; },
  tempo(bpm) { secuenciador.bpm = bpm; },
  pararMusica(fundido = 0.6) { secuenciador.parar(fundido); },
  // Solo para pruebas: graba la salida durante `ms` milisegundos y devuelve los datos en base64.
  async grabar(ms) {
    const dest = ac.createMediaStreamDestination(); salida.connect(dest);
    const rec = new MediaRecorder(dest.stream); const trozos = [];
    rec.ondataavailable = e => trozos.push(e.data);
    rec.start(); await new Promise(r => setTimeout(r, ms)); rec.stop(); await new Promise(r => { rec.onstop = r; });
    const buf = new Uint8Array(await new Blob(trozos).arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
    return btoa(s);
  },
  // Para el momento rítmico: cuándo empieza el compás en curso.
  reloj() { return { inicio: secuenciador.inicio, bpm: secuenciador.bpm, corriendo: !!secuenciador.pieza }; },
};
let pendiente = null;

async function cargarGrabacion() {
  if (!CANTICO.archivo) return;
  try {
    const r = await fetch(`audio/${CANTICO.archivo}`, { cache: 'force-cache' });
    if (r.ok) grabacion = await ac.decodeAudioData(await r.arrayBuffer());
  } catch { /* sin grabación: suena la versión chiptune */ }
}

// ---------- Instrumentos ----------
function env(g, t, a, d, s, r, dur, pico = 1) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(pico, t + a);
  g.gain.linearRampToValueAtTime(pico * s, t + a + d);
  g.gain.setValueAtTime(pico * s, t + Math.max(a + d, dur));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + d, dur) + r);
}
function tono(t, f, dur, { tipo = 'square', vol = 0.2, a = 0.004, d = 0.06, s = 0.5, r = 0.08, bus = busMusica, desliz = 0, vibrato = 0 } = {}) {
  const o = ac.createOscillator();
  if (tipo === 'pulso') o.setPeriodicWave(pulso25); else o.type = tipo;
  o.frequency.setValueAtTime(f, t);
  if (desliz) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * desliz), t + dur);
  if (vibrato) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = f * vibrato; l.connect(lg).connect(o.frequency); l.start(t + 0.12); l.stop(t + dur + r + 0.05); }
  const g = ac.createGain();
  env(g, t, a, d, s, r, dur, vol);
  o.connect(g).connect(bus);
  o.start(t); o.stop(t + dur + r + 0.05);
}
function golpeRuido(t, { dur = 0.08, vol = 0.3, filtro = 'highpass', f = 6000, q = 0.8, bus = busMusica } = {}) {
  const s = ac.createBufferSource(); s.buffer = ruido;
  const fl = ac.createBiquadFilter(); fl.type = filtro; fl.frequency.value = f; fl.Q.value = q;
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl).connect(g).connect(bus);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
function bombo(t, vol = 0.9, f = 120, bus = busMusica) {
  const o = ac.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g).connect(bus); o.start(t); o.stop(t + 0.35);
}
const caja = (t, vol = 0.32, bus) => { golpeRuido(t, { dur: 0.12, vol, filtro: 'bandpass', f: 1900, q: 0.7, bus }); tono(t, 190, 0.05, { tipo: 'triangle', vol: vol * 0.6, d: 0.04, s: 0.1, r: 0.04, bus: bus || busMusica }); };
const hat = (t, vol = 0.12) => golpeRuido(t, { dur: 0.035, vol, f: 8000 });
const agogo = (t, alto, vol = 0.13) => { tono(t, alto ? 1320 : 990, 0.06, { tipo: 'square', vol, d: 0.05, s: 0.15, r: 0.1 }); };
const castanuela = (t, vol = 0.22) => { golpeRuido(t, { dur: 0.025, vol, filtro: 'bandpass', f: 3500, q: 3 }); golpeRuido(t + 0.03, { dur: 0.02, vol: vol * 0.7, filtro: 'bandpass', f: 4200, q: 3 }); };

// ---------- Efectos ----------
const SFX = {
  toque: t => tono(t, 880, 0.04, { tipo: 'pulso', vol: 0.12, bus: busSfx, s: 0.2, r: 0.05 }),
  ayuda: (t, o) => tono(t, 520 + (o.k || 0) * 260, 0.03, { tipo: 'triangle', vol: 0.08, bus: busSfx, s: 0.2, r: 0.03 }),
  bombilla: (t, o) => {
    const base = 523.25 * 2 ** ((o.racha || 0) * 2 / 12);
    [0, 4, 7, 12].forEach((s, i) => tono(t + i * 0.055, base * 2 ** (s / 12), 0.07, { tipo: 'pulso', vol: 0.13, bus: busSfx, s: 0.4, r: 0.12 }));
  },
  grande: t => { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tono(t + i * 0.06, 392 * 2 ** (s / 12), 0.1, { tipo: 'pulso', vol: 0.13, bus: busSfx, s: 0.5, r: 0.2 })); },
  apaga: t => tono(t, 330, 0.28, { tipo: 'triangle', vol: 0.13, bus: busSfx, desliz: 0.6, s: 0.6, r: 0.1 }),
  papel: t => golpeRuido(t, { dur: 0.18, vol: 0.16, filtro: 'bandpass', f: 2600, q: 0.6, bus: busSfx }),
  montonCae: t => { for (let i = 0; i < 6; i++) golpeRuido(t + i * 0.05, { dur: 0.16, vol: 0.14, filtro: 'bandpass', f: 2000 + i * 300, q: 0.7, bus: busSfx }); },
  timbre: t => { for (let i = 0; i < 14; i++) tono(t + i * 0.07, i % 2 ? 1180 : 1250, 0.06, { tipo: 'square', vol: 0.05, bus: busSfx, s: 0.6, r: 0.02 }); },
  suma: (t, o) => tono(t, 660 * 2 ** (((o.n || 0) % 8) / 12), 0.05, { tipo: 'pulso', vol: 0.06, bus: busSfx, s: 0.3, r: 0.05 }),
  pancarta: t => { [0, 7, 12].forEach((s, i) => tono(t + i * 0.09, 392 * 2 ** (s / 12), 0.12, { tipo: 'square', vol: 0.12, bus: busSfx, s: 0.6, r: 0.18 })); bombo(t, 0.6, 120, busSfx); },
  acierto: (t, o) => { bombo(t, 0.9, 130, busSfx); caja(t, 0.25, busSfx); tono(t, (o.f || 784), 0.08, { tipo: 'pulso', vol: 0.1, bus: busSfx, s: 0.4, r: 0.1 }); },
  fallo: t => tono(t, 200, 0.1, { tipo: 'triangle', vol: 0.08, bus: busSfx, desliz: 0.8 }),
  silbato: t => { tono(t, 2600, 0.18, { tipo: 'sine', vol: 0.12, bus: busSfx, vibrato: 0.03, s: 0.9 }); tono(t + 0.24, 2600, 0.35, { tipo: 'sine', vol: 0.12, bus: busSfx, vibrato: 0.03, s: 0.9 }); },
  bostezo: t => tono(t, 260, 0.6, { tipo: 'triangle', vol: 0.07, bus: busSfx, desliz: 0.6, a: 0.15, s: 0.8 }),
  puerta: t => { tono(t, 140, 0.12, { tipo: 'triangle', vol: 0.15, bus: busSfx, desliz: 0.7 }); golpeRuido(t, { dur: 0.06, vol: 0.1, filtro: 'lowpass', f: 600, bus: busSfx }); },
  huevo: t => { [12, 7, 16].forEach((s, i) => tono(t + i * 0.07, 523 * 2 ** (s / 12), 0.06, { tipo: 'pulso', vol: 0.1, bus: busSfx, s: 0.3, r: 0.08 })); },
};

// ---------- Música: piezas por pasos (corcheas) ----------
const PIEZAS = {
  // Aula: pizzicato alegre en do mayor; más rápido cuanto peor está el aula.
  aula: {
    bpm: 128, pasos: 32,
    tocar(t, paso, capas, cfg) {
      const prog = [['C3', 'E4', 'G4'], ['A2', 'C4', 'E4'], ['F2', 'A3', 'C4'], ['G2', 'B3', 'D4']];
      const c = prog[Math.floor(paso / 8) % 4];
      const nota = paso % 8;
      if (nota % 4 === 0) tono(t, frecuencia(c[0]), 0.18, { tipo: 'triangle', vol: 0.32, s: 0.4, r: 0.06 });
      if (nota % 2 === 1) tono(t, frecuencia(c[1 + (nota >> 1) % 2]) * 2, 0.05, { tipo: 'pulso', vol: 0.07, s: 0.2, r: 0.04 });
      if (cfg.tension) hat(t, 0.05 + (nota % 2) * 0.04);
      if (capas.melodia && [0, 3, 6].includes(nota)) tono(t, frecuencia(c[(nota / 3) | 0]) * 4, 0.08, { tipo: 'square', vol: 0.045, s: 0.3, r: 0.08 });
    },
  },
  // Sala de profes: tranquila, en la menor.
  sala: {
    bpm: 84, pasos: 32,
    tocar(t, paso) {
      const prog = [['A2', 'C4', 'E4', 'A4'], ['F2', 'A3', 'C4', 'F4'], ['C3', 'E4', 'G4', 'C5'], ['G2', 'B3', 'D4', 'G4']];
      const c = prog[Math.floor(paso / 8) % 4];
      const n = paso % 8;
      if (n === 0) tono(t, frecuencia(c[0]), 1.4, { tipo: 'triangle', vol: 0.28, a: 0.02, s: 0.6, r: 0.4 });
      tono(t, frecuencia(c[1 + (n % 3)]), 0.12, { tipo: 'sine', vol: 0.09, a: 0.01, s: 0.4, r: 0.2 });
      if (n === 4) hat(t, 0.04);
    },
  },
  // Mani: batucada + la melodía del cántico. Capas: batucada, coro (castañuelas), canto.
  mani: {
    bpm: CANTICO.bpm, pasos: 64,
    tocar(t, paso, capas) {
      const n = paso % 8;
      // Surdo en los pulsos 2 y 4, con respuesta.
      if (n === 0) bombo(t, 0.5, 90);
      if (n === 4) bombo(t, 0.85, 110);
      if (n === 2 || n === 6) caja(t, 0.12);
      hat(t, n % 2 ? 0.05 : 0.09);
      if (capas.batucada) { if ([0, 3, 6].includes(n)) caja(t, 0.18); if (n === 7) bombo(t, 0.4, 150); agogo(t, n === 2 || n === 3, n === 2 || n === 3 || n === 6 ? 0.12 : 0); }
      if (capas.coro && n % 2 === 0) castanuela(t, 0.18);
      const compas = Math.floor(paso / 8) % CANTICO.acordes.length;
      if (n === 0 || n === 4) tono(t, frecuencia(CANTICO.acordes[compas][n ? 1 : 0]), 0.22, { tipo: 'triangle', vol: 0.3, s: 0.5, r: 0.05 });
      if (capas.canto !== false) tocarCantico(t, paso, 1);
    },
  },
  // Final: el cántico con más calma y acordes largos.
  final: {
    bpm: CANTICO.bpm - 8, pasos: 64,
    tocar(t, paso) {
      const n = paso % 8;
      const compas = Math.floor(paso / 8) % CANTICO.acordes.length;
      if (n === 0) CANTICO.acordes[compas].forEach(no => tono(t, frecuencia(no) * 2, 1.9, { tipo: 'triangle', vol: 0.12, a: 0.06, s: 0.7, r: 0.5 }));
      if (n === 0) bombo(t, 0.4, 80);
      if (n === 4) caja(t, 0.08);
      tocarCantico(t, paso, 0.8);
    },
  },
};

// Melodía del cántico (si hay grabación, se lanza el audio en el paso 0 y se omite la versión chiptune).
let eventosCantico = null;
function tocarCantico(t, paso, vol) {
  if (grabacion) {
    if (paso % (CANTICO.orden.length * 16) === 0) { const s = ac.createBufferSource(); s.buffer = grabacion; const g = ac.createGain(); g.gain.value = vol; s.connect(g).connect(busMusica); s.start(t, CANTICO.inicio); secuenciador.fuentes.push(s); }
    return;
  }
  if (!eventosCantico) {
    eventosCantico = new Map();
    let c = 0;
    for (const f of CANTICO.orden) { for (const ev of eventosFrase(f, c)) eventosCantico.set(ev.corchea, ev); c += 16; }
  }
  const ev = eventosCantico.get(paso % (CANTICO.orden.length * 16));
  if (!ev) return;
  const dur = (ev.dur * 60) / (secuenciador.bpm * 2);
  tono(t, frecuencia(ev.nota), dur * 0.85, { tipo: 'pulso', vol: 0.16 * vol, a: 0.005, d: 0.05, s: 0.7, r: 0.06, vibrato: ev.dur > 1 ? 0.012 : 0 });
  tono(t, transponer(ev.nota, -12), dur * 0.85, { tipo: 'square', vol: 0.04 * vol, s: 0.5, r: 0.05 });
}

const secuenciador = {
  pieza: null, cfg: {}, capas: {}, bpm: 120, paso: 0, siguiente: 0, t0: 0, temporizador: null, fuentes: [],
  poner(nombre, cfg = {}) {
    const p = PIEZAS[nombre];
    if (!p) return;
    if (this.pieza === p && !cfg.reiniciar) { this.cfg = cfg; if (cfg.bpm) this.bpm = cfg.bpm; return; }
    this.cortarFuentes();
    this.pieza = p; this.cfg = cfg; this.capas = { ...(cfg.capas || {}) };
    this.bpm = cfg.bpm || p.bpm;
    this.paso = 0;
    this.t0 = ac.currentTime + 0.08;
    this.inicio = this.t0;
    this.siguiente = this.t0;
    busMusica.gain.cancelScheduledValues(ac.currentTime);
    busMusica.gain.setTargetAtTime(0.62, ac.currentTime, 0.05);
    if (!this.temporizador) this.temporizador = setInterval(() => this.programar(), 25);
  },
  programar() {
    if (!this.pieza || !ac) return;
    const corchea = 60 / this.bpm / 2;
    while (this.siguiente < ac.currentTime + 0.12) {
      this.pieza.tocar(this.siguiente, this.paso, this.capas, this.cfg);
      this.paso++;
      this.siguiente += corchea;
      if (this.paso % (this.pieza.pasos) === 0) this.t0 = this.siguiente;
    }
  },
  parar(fundido) {
    if (!ac) return;
    busMusica.gain.setTargetAtTime(0.0001, ac.currentTime, fundido / 3);
    const p = this.pieza;
    setTimeout(() => { if (this.pieza === p) { this.pieza = null; this.cortarFuentes(); } }, fundido * 1000);
  },
  cortarFuentes() { this.fuentes.forEach(s => { try { s.stop(); } catch { /* ya parada */ } }); this.fuentes = []; },
};
