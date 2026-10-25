// «Llegar a todos» — bucle principal, escalado y máquina de escenas.
import { clamp, ease, alfa } from './util.js';
import { crearEntrada } from './entrada.js';
import { audio } from './audio.js';
import { escenaPortada } from './portada.js';
import { escenaAula } from './aula.js';
import { escenaSala } from './sala.js';
import { escenaMani } from './mani.js';
import { escenaFinal } from './final.js';

const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const W = 400;
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');

export const juego = {
  W, H: 760, ctx, t: 0, dt: 0,
  estado: estadoInicial(),
  reducido: matchMedia('(prefers-reduced-motion: reduce)').matches,
  debug: DEBUG,
  audio,
};

function estadoInicial() {
  return { profe: 0, elegidas: [], ofrecidas: [], aulas: [], mani: { max: 0, n1: 0 }, ritmo: { aciertos: 0, total: 0 }, especiales: [], huevos: {}, inicio: Date.now() };
}

// ---------- Escalado ----------
let esc = 1, offY = 0, dpr = 1;
function redimensionar() {
  const r = lienzo.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  esc = r.width / W;
  const hReal = r.height / esc;
  juego.H = clamp(hReal, 600, 960);
  offY = (hReal - juego.H) / 2;
  lienzo.width = Math.round(r.width * dpr);
  lienzo.height = Math.round(r.height * dpr);
  juego.escala = esc * dpr;
  if (escena?.redimensionar) escena.redimensionar();
}
const aLogico = (cx, cy) => {
  const r = lienzo.getBoundingClientRect();
  return [(cx - r.left) / esc, (cy - r.top) / esc - offY];
};
juego.entrada = crearEntrada(lienzo, aLogico);
// De coordenadas lógicas a píxeles CSS (para pruebas automáticas).
juego.aCss = (x, y) => { const r = lienzo.getBoundingClientRect(); return [r.left + x * esc, r.top + (y + offY) * esc]; };

// ---------- Escenas ----------
const ESCENAS = { portada: escenaPortada, aula: escenaAula, sala: escenaSala, mani: escenaMani, final: escenaFinal };
const FLUJO = [
  ['portada'],
  ['aula', { dia: 0 }],
  ['sala', { n: 1 }],
  ['mani', { n: 1 }],
  ['aula', { dia: 1 }],
  ['sala', { n: 2 }],
  ['mani', { n: 2 }],
  ['aula', { dia: 2 }],
  ['final'],
];
let paso = 0;
let escena = null;
let transicion = null; // { fase: 'sale'|'entra', t, destino }

function montar(i) {
  paso = i;
  const [nombre, opc] = FLUJO[i];
  escena?.salir?.();
  escena = ESCENAS[nombre](juego, opc || {});
  juego.escenaActual = nombre;
  juego.entrada.vaciar();
  escena.entrar?.();
}
juego.info = () => ({ escena: juego.escenaActual, transicion: !!transicion, ...(escena?.info?.() || {}) });
juego.siguiente = () => {
  if (transicion) return;
  transicion = { fase: 'sale', t: 0, destino: paso + 1 };
};
juego.reiniciar = () => {
  juego.estado = estadoInicial();
  transicion = { fase: 'sale', t: 0, destino: 0 };
};

// ---------- Transición: una pincelada verde que barre la pantalla ----------
const DUR_T = 0.5;
function dibujaTransicion() {
  if (!transicion) return;
  const k = ease.inOutCubic(clamp(transicion.t / DUR_T, 0, 1));
  const H = juego.H;
  const cubre = transicion.fase === 'sale' ? k : 1 - k;
  if (cubre <= 0) return;
  ctx.save();
  // Bandas diagonales con bordes de brocha.
  const bandas = 5;
  for (let b = 0; b < bandas; b++) {
    const retraso = b * 0.08;
    const kb = clamp((cubre - retraso) / (1 - retraso * 1.2), 0, 1);
    if (kb <= 0) continue;
    const y0 = (b / bandas) * (H + 120) - 60;
    const h = (H + 120) / bandas + 4;
    const x1 = transicion.fase === 'sale' ? -40 : W + 40 - kb * (W + 80);
    const ancho = kb * (W + 80);
    ctx.fillStyle = b % 2 ? '#174d32' : '#0f3522';
    ctx.beginPath();
    ctx.moveTo(x1, y0);
    ctx.lineTo(x1 + ancho, y0 + 6);
    for (let i = 0; i <= 6; i++) ctx.lineTo(x1 + ancho + Math.sin(i * 2.1 + b) * 8, y0 + (h * i) / 6);
    ctx.lineTo(x1, y0 + h);
    ctx.closePath();
    ctx.fill();
  }
  if (cubre > 0.9) {
    ctx.globalAlpha = (cubre - 0.9) * 10;
    ctx.fillStyle = '#86cd55';
    ctx.font = '400 30px "Marker",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('· · ·', W / 2, H / 2);
  }
  ctx.restore();
}

// ---------- Bucle ----------
let ultimo = performance.now();
let pausado = false;
function fotograma(ahora) {
  requestAnimationFrame(fotograma);
  if (pausado) { ultimo = ahora; return; }
  const dt = Math.min(0.05, (ahora - ultimo) / 1000);
  ultimo = ahora;
  juego.dt = dt;
  juego.t += dt;

  if (transicion) {
    transicion.t += dt;
    if (transicion.fase === 'sale' && transicion.t >= DUR_T) {
      if (transicion.destino >= FLUJO.length) transicion.destino = 0;
      montar(transicion.destino);
      transicion = { fase: 'entra', t: 0 };
    } else if (transicion.fase === 'entra' && transicion.t >= DUR_T) transicion = null;
  }
  // Durante la salida no se procesa la entrada de la escena anterior.
  if (transicion?.fase === 'sale') juego.entrada.vaciar();
  escena.actualizar(dt);
  juego.entrada.toques.length = 0;
  juego.entrada.pulsaciones.length = 0;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = escena.fondo || '#f7f8f3';
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.setTransform(esc * dpr, 0, 0, esc * dpr, 0, offY * esc * dpr);
  escena.dibujar(ctx);
  dibujaTransicion();
  if (DEBUG) {
    ctx.fillStyle = alfa('#000000', 0.5); ctx.fillRect(0, juego.H - 18, 120, 18);
    ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(1 / Math.max(dt, 0.001))} fps · ${FLUJO[paso][0]}`, 4, juego.H - 9);
  }
}

// ---------- Arranque ----------
document.addEventListener('visibilitychange', () => {
  pausado = document.hidden;
  if (pausado) audio.suspender(); else audio.reanudar();
});
window.addEventListener('resize', redimensionar);
const botonSonido = document.getElementById('sonido');
botonSonido.addEventListener('click', () => {
  const mudo = !audio.mudo;
  audio.silenciar(mudo);
  botonSonido.setAttribute('aria-pressed', String(mudo));
  botonSonido.setAttribute('aria-label', mudo ? 'Activar el sonido' : 'Silenciar');
});
// El audio solo puede arrancar tras un gesto.
lienzo.addEventListener('pointerdown', () => audio.iniciar(), { once: false });

async function arrancar() {
  // El lienzo no espera a las fuentes: se cargan antes todas las variantes que se usan.
  const variantes = ['400 20px "Marker"', '800 20px "Bricolage"', '600 20px "Bricolage"', '400 16px "Atkinson"', '600 16px "Atkinson"', '700 16px "Atkinson"', '500 16px "Atkinson"'];
  try { await Promise.race([Promise.all(variantes.map(v => document.fonts.load(v))), new Promise(r => setTimeout(r, 2500))]); } catch { /* sin fuentes, seguimos */ }
  redimensionar();
  // Atajos de prueba: ?escena=mani&n=1, ?escena=aula&dia=1&elegidas=ratios,horas
  const destino = params.get('escena');
  if (destino) {
    const el = params.get('elegidas');
    if (el) juego.estado.elegidas = el.split(',');
    juego.estado.profe = +(params.get('profe') || 0);
    const i = FLUJO.findIndex(([n, o]) => n === destino && (!o || ((params.get('dia') ?? o.dia) == o.dia && (params.get('n') ?? o.n) == o.n)));
    if (DEBUG) {
      // Datos de ejemplo para probar escenas sueltas.
      juego.estado.aulas = [{ llegados: 12, total: 28, reparto: true }, { llegados: 14, total: 18 }, { llegados: 15, total: 15 }].slice(0, destino === 'final' ? 3 : destino === 'aula' ? i - 1 : 2);
      juego.estado.mani = { max: 2340, n1: 1100, miembros: 90 };
      if (!el && destino === 'final') juego.estado.elegidas = ['ratios', 'horas', 'burocracia', 'sueldo'];
      juego.estado.ritmo = { aciertos: 10, total: 12 };
    }
    montar(Math.max(0, i));
  } else montar(0);
  requestAnimationFrame(t => { ultimo = t; requestAnimationFrame(fotograma); });
}
arrancar();
if (DEBUG) window.__juego = juego;
