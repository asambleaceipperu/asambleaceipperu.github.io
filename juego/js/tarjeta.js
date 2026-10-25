// Tarjeta de resultado para compartir (PNG 1080×1350, formato vertical de móvil).
import { TAU, rr, circulo, fuentes, formatoNum, lineas } from './util.js';
import { dibujaPersona, PROFES, conCamisetaVerde, dibujaCorroMini } from './personajes.js';
import { pancarta } from './ui.js';
import { REIVINDICACIONES, IDS, ACTUAL, tituloTarjeta, URL_JUEGO } from './datos.js';

export const ANCHO = 1080, ALTO = 1350;

export function textoCompartir(est) {
  const a0 = est.aulas[0], a2 = est.aulas[2];
  const antes = a0 ? `Un lunes cualquiera llegué a ${a0.llegados} de ${a0.total} alumnos` : 'He jugado a «Llegar a todos»';
  const despues = a2 ? `; en la clase que pide la huelga educativa, a ${a2.llegados} de ${a2.total}` : '';
  return `${antes}${despues}. ¿Llegas tú? 🟢 ${URL_JUEGO}`;
}

export function dibujaTarjeta(ctx, est, t = 0) {
  const W = ANCHO, H = ALTO;
  ctx.save();
  // Fondo de pizarra con cuadrícula.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#174d32'); g.addColorStop(1, '#0f3522');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(247,248,243,.05)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 30; x < W; x += 54) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 30; y < H; y += 54) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();

  // Cabecera.
  dibujaCorroMini(ctx, 96, 96, 40, '#f7f8f3', '#86cd55');
  ctx.font = `800 38px ${fuentes.display}`; ctx.fillStyle = '#f7f8f3'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Asamblea Docente', 156, 80);
  ctx.font = `500 30px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.7)';
  ctx.fillText('del CEIP Perú · Madrid', 156, 118);
  pancarta(ctx, ['LLEGAR A TODOS'], W / 2, 180, 880, 120, { t, color: '#f7f8f3', semilla: 3, palos: false, tamMax: 96 });

  // Título según cómo has jugado.
  const titulo = tituloTarjeta(est);
  ctx.save(); ctx.translate(W / 2, 360); ctx.rotate(-0.025);
  ctx.font = `400 50px ${fuentes.rotulador}`;
  const tw = ctx.measureText(titulo).width + 70;
  ctx.fillStyle = '#ffcf33'; rr(ctx, -tw / 2, -44, tw, 88, 18); ctx.fill();
  ctx.fillStyle = '#0f3522'; ctx.textAlign = 'center'; ctx.fillText(titulo, 0, 4);
  ctx.restore();

  // Tu profe, con la camiseta verde y los brazos en alto.
  const profe = conCamisetaVerde(PROFES[est.profe || 0]);
  ctx.save();
  ctx.fillStyle = 'rgba(255,207,51,.16)'; circulo(ctx, 230, 690, 190); ctx.fill();
  dibujaPersona(ctx, profe, { x: 230, y: 860, esc: 4.6, brazos: 'arriba', expr: 'feliz', t: 0.4, lw: 1.6 });
  ctx.restore();

  // Cifras.
  const a0 = est.aulas[0], a2 = est.aulas[2];
  let y = 480;
  const x = 450;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (a0) {
    ctx.font = `600 30px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
    ctx.fillText('Un lunes de hoy, llegué a', x, y);
    ctx.font = `800 88px ${fuentes.display}`; ctx.fillStyle = '#f7f8f3';
    ctx.fillText(`${a0.llegados}`, x, y + 86);
    const w0 = ctx.measureText(`${a0.llegados}`).width;
    ctx.font = `700 40px ${fuentes.display}`; ctx.fillStyle = 'rgba(247,248,243,.7)';
    ctx.fillText(` de ${a0.total}`, x + w0, y + 84);
    y += 140;
  }
  if (a2) {
    ctx.font = `600 30px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
    ctx.fillText('En la clase que pedimos, a', x, y);
    ctx.font = `800 88px ${fuentes.display}`; ctx.fillStyle = '#ffcf33';
    ctx.fillText(`${a2.llegados}`, x, y + 86);
    const w2 = ctx.measureText(`${a2.llegados}`).width;
    ctx.font = `700 40px ${fuentes.display}`; ctx.fillStyle = 'rgba(255,207,51,.8)';
    ctx.fillText(` de ${a2.total}`, x + w2, y + 84);
    y += 140;
  }
  if (est.mani.max) {
    ctx.font = `600 30px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.75)';
    ctx.fillText('Llevé a la Consejería a', x, y);
    ctx.font = `800 56px ${fuentes.display}`; ctx.fillStyle = '#86cd55';
    ctx.fillText(`${formatoNum(est.mani.max)} personas`, x, y + 62);
    ctx.font = `500 26px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.55)';
    ctx.fillText(`(${formatoNum(Math.floor(est.mani.max * ACTUAL.factorComunidad.valor))} según la Comunidad)`, x, y + 100);
  }

  // Pancartas que llevaste.
  const elegidas = est.elegidas.slice(0, 4);
  ctx.font = `700 30px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.8)'; ctx.textAlign = 'left';
  ctx.fillText('Mis pancartas:', 70, 960);
  elegidas.forEach((id, i) => {
    const R = REIVINDICACIONES[id];
    const px = 70 + (i % 2) * 480 + 225, py = 990 + Math.floor(i / 2) * 120;
    pancarta(ctx, R.pancarta, px, py, 450, 96, { t: t + i, color: R.color === '#f3efe6' ? '#ffffff' : R.color, icono: R.icono, semilla: IDS.indexOf(id) + 1, palos: false, tamMax: 44 });
  });

  // Pie.
  ctx.fillStyle = '#86cd55'; ctx.fillRect(0, H - 104, W, 104);
  ctx.font = `800 40px ${fuentes.display}`; ctx.fillStyle = '#0f3522'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('¿Llegas tú?  asambleaceipperu.github.io/juego', W / 2, H - 52);
  ctx.restore();
}

export async function generarTarjeta(est) {
  const c = document.createElement('canvas');
  c.width = ANCHO; c.height = ALTO;
  dibujaTarjeta(c.getContext('2d'), est, 0.6);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  return { blob, url: URL.createObjectURL(blob) };
}
