// La tarjeta para compartir: una imagen cuadrada con el día, el resultado en cuadraditos y una frase de reto.
// Se dibuja en un canvas y se comparte como archivo donde el móvil lo permite.
const C = { pizarra: '#174d32', honda: '#0f3522', marea: '#86cd55', amarillo: '#ffcf33', papel: '#f7f8f3', acierto: '#5fb84a', casi: '#ffcf33', fallo: '#9aa59c', rojo: '#e0566c', azul: '#7fb7e8', morado: '#c9a7ef' };
const CASILLAS = { '🟩': C.acierto, '🟨': C.casi, '⬜': C.fallo, '🟥': C.rojo, '🟦': C.azul, '🟪': C.morado };

// Frase de reto según cómo ha ido.
export function fraseReto(res) {
  const m = /^(\d+)\//.exec(res.marcador || '');
  if (!res.resuelto) return '¿Lo sacas tú?';
  if (m && +m[1] === 1) return '¡A la primera! ¿Te atreves?';
  const f = /^(\d+) fallos?/.exec(res.marcador || '');
  if (f) return +f[1] === 0 ? 'Sin un fallo. ¿Lo igualas?' : `Con ${f[1]} ${+f[1] === 1 ? 'fallo' : 'fallos'}. ¿Lo mejoras?`;
  if (m) return `En ${m[1]} intentos. ¿Lo mejoras?`;
  return '¿Lo mejoras?';
}

function corro(ctx, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 50, r / 50);
  for (let i = 0; i < 8; i++) {
    ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillStyle = i % 2 ? C.marea : C.papel;
    ctx.beginPath(); ctx.roundRect(-5.5, -47, 11, 20.8, 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5.5, -24); ctx.lineTo(5.5, -24); ctx.lineTo(0, -13); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = C.marea; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Cada línea del resultado, en casillas de color (o flechas, para «¿Cuántos?»).
function filas(emoji) {
  return emoji.split('\n').map(l => l.match(/🟩|🟨|⬜|🟥|🟦|🟪|⬆️|⬇️/gu) || []).filter(f => f.length);
}

export async function dibujarTarjeta({ dia, tipo, res }) {
  const L = 1080;
  const cv = document.createElement('canvas');
  cv.width = cv.height = L;
  const ctx = cv.getContext('2d');
  try { await Promise.all(['400 80px Marker', '800 40px Bricolage', '700 30px Atkinson'].map(f => document.fonts.load(f))); } catch { /* sin fuentes, con las del sistema */ }

  // Fondo: pizarra con puntos de cuaderno.
  ctx.fillStyle = C.pizarra; ctx.fillRect(0, 0, L, L);
  ctx.fillStyle = '#ffffff14';
  for (let x = 18; x < L; x += 36) for (let y = 18; y < L; y += 36) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); }
  // El sol amarillo con el día de huelga.
  ctx.fillStyle = C.amarillo; ctx.beginPath(); ctx.arc(900, 200, 130, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = C.honda;
  ctx.font = '800 30px Bricolage, sans-serif'; ctx.fillText('DÍA', 900, 140);
  ctx.font = `400 ${dia > 99 ? 96 : 128}px Marker, sans-serif`; ctx.fillText(String(dia), 900, 262);
  ctx.textAlign = 'left';

  // Cabecera.
  corro(ctx, 110, 112, 54);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.marea; ctx.font = '800 34px Bricolage, sans-serif';
  ctx.fillText('ASAMBLEA DOCENTE CEIP PERÚ', 190, 104);
  ctx.fillStyle = C.papel; ctx.font = '700 25px Atkinson, sans-serif';
  ctx.fillText('Huelga indefinida de la educación madrileña', 190, 144);

  // «SEGUIMOS · DÍA N»
  ctx.save(); ctx.translate(80, 330); ctx.rotate(-0.04);
  ctx.font = '400 130px Marker, sans-serif';
  ctx.fillStyle = C.honda; ctx.fillText('Seguimos', 8, 8);
  ctx.fillStyle = C.amarillo; ctx.fillText('Seguimos', 0, 0);
  ctx.restore();
  ctx.fillStyle = C.papel; ctx.font = '800 54px Bricolage, sans-serif';
  ctx.fillText(`${tipo.nombre} · ${res.marcador}`, 84, 420);

  // Resultado en casillas.
  const fs = filas(res.emoji);
  const ancho = Math.max(1, ...fs.map(f => f.length));
  const lado = Math.min(84, Math.floor(820 / ancho) - 12, Math.floor(330 / Math.max(1, fs.length)) - 12);
  const hueco = Math.round(lado * 0.16);
  const x0 = (L - (ancho * lado + (ancho - 1) * hueco)) / 2;
  let y = 480 + Math.max(0, (330 - fs.length * (lado + hueco)) / 2);
  for (const f of fs) {
    f.forEach((c, i) => {
      const x = x0 + i * (lado + hueco);
      if (c === '⬆️' || c === '⬇️') {
        ctx.fillStyle = '#ffffff22'; ctx.beginPath(); ctx.roundRect(x, y, lado, lado, lado * .18); ctx.fill();
        ctx.fillStyle = c === '⬆️' ? C.marea : C.rojo; ctx.font = `800 ${lado * .7}px Bricolage, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(c === '⬆️' ? '↑' : '↓', x + lado / 2, y + lado * .74); ctx.textAlign = 'left';
        return;
      }
      ctx.fillStyle = CASILLAS[c] || C.fallo; ctx.beginPath(); ctx.roundRect(x, y, lado, lado, lado * .18); ctx.fill();
    });
    y += lado + hueco;
  }

  // Frase de reto y dirección.
  ctx.textAlign = 'center';
  let tam = 74;
  do { ctx.font = `400 ${tam}px Marker, sans-serif`; tam -= 4; } while (ctx.measureText(fraseReto(res)).width > 960 && tam > 30);
  ctx.fillStyle = C.honda; ctx.fillText(fraseReto(res), L / 2 + 5, 925);
  ctx.fillStyle = C.amarillo; ctx.fillText(fraseReto(res), L / 2, 920);
  ctx.fillStyle = C.papel; ctx.font = '700 32px Atkinson, sans-serif';
  ctx.fillText('asambleaceipperu.github.io/juego', L / 2, 1010);
  ctx.textAlign = 'left';
  return cv;
}

// Comparte la imagen con el texto si el navegador sabe; si no, solo el texto.
export async function compartirTarjeta(cv, texto, nombre) {
  try {
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png'));
    const archivo = blob && new File([blob], nombre, { type: 'image/png' });
    if (archivo && navigator.canShare?.({ files: [archivo] })) { await navigator.share({ files: [archivo], text: texto }); return true; }
  } catch (e) { if (e?.name === 'AbortError') return true; }
  return false;
}
