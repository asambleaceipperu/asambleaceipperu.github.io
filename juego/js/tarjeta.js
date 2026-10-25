// Tarjeta de resultado para compartir: 1080×1920, el formato de los estados de WhatsApp y las historias.
import { rr, circulo, fuentes, formatoNum, azar, clamp } from './util.js';
import { dibujaPersona, PROFES, conCamisetaVerde, dibujaCorroMini } from './personajes.js';
import { pancarta } from './ui.js';
import { icono } from './iconos.js';
import { REIVINDICACIONES, IDS, ACTUAL, tituloTarjeta, URL_JUEGO } from './datos.js';

export const ANCHO = 1080, ALTO = 1920;

// Enlace con tu marca para retar a quien lo abra.
export function enlaceReto(est) {
  const a0 = est.aulas[0];
  if (!a0) return URL_JUEGO;
  return `${URL_JUEGO}?reto=${a0.llegados}-${a0.total}-${Math.round(est.mani.max || 0)}`;
}
export function leerReto(texto) {
  const m = /^(\d{1,3})-(\d{1,3})-(\d{1,7})$/.exec(texto || '');
  if (!m) return null;
  const [l, t, p] = m.slice(1).map(Number);
  return l <= t && t <= 40 ? { llegados: l, total: t, personas: p } : null;
}

export function textoCompartir(est) {
  const a0 = est.aulas[0], a2 = est.aulas[2];
  const antes = a0 ? `Un lunes cualquiera llegué a ${a0.llegados} de ${a0.total} alumnos` : 'He jugado a «Llegar a todos»';
  const despues = a2 ? `; en la clase que pide la huelga educativa, a ${a2.llegados} de ${a2.total}` : '';
  const mani = est.mani.max ? ` y llevé ${formatoNum(est.mani.max)} personas a la Consejería` : '';
  return `${antes}${despues}${mani}. ¿Me superas? ${enlaceReto(est)}`;
}

export function dibujaTarjeta(ctx, est, { cole = '', reto = null } = {}) {
  const W = ANCHO, H = ALTO;
  const r = azar(7);
  ctx.save();
  // Fondo: pizarra verde con cuadrícula de tiza y un resplandor amarillo detrás de la profe.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1d5a3a'); g.addColorStop(1, '#0f3522');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(247,248,243,.05)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 30; x < W; x += 54) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 30; y < H; y += 54) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  // Confeti.
  for (let i = 0; i < 70; i++) { ctx.save(); ctx.translate(r() * W, r() * 900); ctx.rotate(r() * 6); ctx.fillStyle = r.uno(['#86cd55', '#ffcf33', '#f7f8f3', '#e0566c']); ctx.fillRect(-6, -10, 12, 20); ctx.restore(); }

  // Cabecera.
  dibujaCorroMini(ctx, 110, 110, 46, '#f7f8f3', '#86cd55');
  ctx.font = `800 44px ${fuentes.display}`; ctx.fillStyle = '#f7f8f3'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Asamblea Docente', 178, 92);
  ctx.font = `500 34px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
  ctx.fillText('del CEIP Perú · Madrid', 178, 136);
  pancarta(ctx, ['LLEGAR', 'A TODOS'], W / 2, 210, 900, 230, { t: 0.4, color: '#f7f8f3', semilla: 3, palos: false, tamMax: 120 });

  // Título según cómo has jugado.
  const titulo = tituloTarjeta(est);
  ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.03);
  ctx.font = `400 64px ${fuentes.rotulador}`;
  const tw = ctx.measureText(titulo).width + 90;
  ctx.fillStyle = '#ffcf33'; rr(ctx, -tw / 2, -56, tw, 112, 22); ctx.fill();
  ctx.fillStyle = '#0f3522'; ctx.textAlign = 'center'; ctx.fillText(titulo, 0, 6);
  ctx.restore();

  // Tu profe, con la camiseta verde y los brazos en alto.
  const profe = conCamisetaVerde(PROFES[est.profe || 0]);
  const gr = ctx.createRadialGradient(W / 2, 830, 40, W / 2, 830, 300);
  gr.addColorStop(0, 'rgba(255,207,51,.35)'); gr.addColorStop(1, 'rgba(255,207,51,0)');
  ctx.fillStyle = gr; ctx.fillRect(W / 2 - 320, 520, 640, 620);
  dibujaPersona(ctx, profe, { x: W / 2, y: 1060, esc: 6.2, brazos: 'arriba', expr: 'feliz', t: 0.4, lw: 1.5, luz: 'rgba(255,230,170,.5)' });
  for (const [x, y, s] of [[250, 700, 70], [830, 660, 84], [880, 900, 54], [200, 940, 50]]) icono(ctx, 'bombilla', x, y, s);

  // Cifras: el lunes frente a la clase que pedimos.
  const a0 = est.aulas[0], a2 = est.aulas[2];
  const caja = (x, y, w, etiqueta, valor, total, color) => {
    ctx.fillStyle = 'rgba(247,248,243,.08)'; rr(ctx, x, y, w, 210, 26); ctx.fill();
    ctx.font = `700 32px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.8)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(etiqueta, x + 34, y + 58);
    ctx.font = `800 118px ${fuentes.display}`; ctx.fillStyle = color;
    ctx.fillText(`${valor}`, x + 30, y + 178);
    const vw = ctx.measureText(`${valor}`).width;
    ctx.font = `700 52px ${fuentes.display}`; ctx.fillStyle = 'rgba(247,248,243,.7)';
    ctx.fillText(`/${total}`, x + 38 + vw, y + 176);
  };
  if (a0) caja(60, 1120, 470, 'Un lunes de hoy', a0.llegados, a0.total, '#f7f8f3');
  if (a2) caja(550, 1120, 470, 'La clase que pedimos', a2.llegados, a2.total, '#ffcf33');
  // Mani y combo.
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (est.mani.max) {
    ctx.font = `800 60px ${fuentes.display}`; ctx.fillStyle = '#86cd55';
    ctx.fillText(`${formatoNum(est.mani.max)} personas en la mani`, W / 2, 1418);
    ctx.font = `600 32px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.6)';
    const extra = [`${formatoNum(Math.floor(est.mani.max * ACTUAL.factorComunidad.valor))} según la Comunidad`];
    if ((est.mejorCombo || 0) >= 2) extra.push(`mejor combo x${est.mejorCombo}`);
    ctx.fillText(extra.join(' · '), W / 2, 1466);
  }
  // Pancartas que llevaste.
  est.elegidas.slice(0, 4).forEach((id, i) => {
    const R = REIVINDICACIONES[id];
    pancarta(ctx, R.pancarta, 60 + (i % 2) * 490 + 225, 1510 + Math.floor(i / 2) * 112, 450, 96, { t: 0.6 + i, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1, palos: false, tamMax: 44 });
  });
  // Reto y cole.
  let yInfo = 1772;
  if (reto && a0) {
    const gana = a0.llegados > reto.llegados || (a0.llegados === reto.llegados && est.mani.max > reto.personas);
    ctx.font = `800 36px ${fuentes.display}`; ctx.fillStyle = gana ? '#ffcf33' : '#f7f8f3';
    ctx.fillText(gana ? `¡Reto superado! Mi compi llegó a ${reto.llegados}/${reto.total}` : `Mi compi llegó a ${reto.llegados}/${reto.total}. La próxima, la supero.`, W / 2, yInfo - 14);
  } else if (cole) {
    ctx.font = `700 36px ${fuentes.texto}`; ctx.fillStyle = '#f7f8f3';
    ctx.fillText(`Desde ${cole}`, W / 2, yInfo - 14);
  }
  // Pie.
  ctx.fillStyle = '#86cd55'; ctx.fillRect(0, H - 120, W, 120);
  ctx.font = `800 46px ${fuentes.display}`; ctx.fillStyle = '#0f3522'; ctx.textBaseline = 'middle';
  ctx.fillText('¿Llegas tú?  asambleaceipperu.github.io/juego', W / 2, H - 60);
  ctx.restore();
}

export async function generarTarjeta(est, opciones = {}) {
  const c = document.createElement('canvas');
  c.width = ANCHO; c.height = ALTO;
  dibujaTarjeta(c.getContext('2d'), est, opciones);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  return { blob, url: URL.createObjectURL(blob) };
}

export { clamp };
