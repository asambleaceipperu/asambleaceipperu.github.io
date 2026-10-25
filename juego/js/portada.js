// Portada: título en pancarta, elección de profe y una pequeña mani que cruza al fondo.
import { TAU, clamp, lerp, ease, rr, circulo, fuentes, azar, alfa } from './util.js';
import { dibujaPersona, personaAzar, PROFES, conCamisetaVerde, dibujaCorroMini } from './personajes.js';
import { C, pancarta, boton, dentro, aparece, cartel, rotulo } from './ui.js';

export function escenaPortada(juego) {
  const { W } = juego;
  let H = juego.H;
  let tf = 0;
  let elegida = juego.estado.profe || 0;
  let saltos = [0, 0, 0, 0];
  let botonEmpezar = null;
  const sitiosProfe = () => PROFES.map((_, i) => ({ x: 62 + i * 92, y: H * 0.64 }));
  // Una mani pequeña que cruza la parte baja, en bucle.
  const r = azar(77);
  const desfile = Array.from({ length: 16 }, (_, i) => ({ p: conCamisetaVerde(personaAzar(r, i % 5 === 2 ? 'niño' : i % 6 === 4 ? 'mayor' : 'adulto')), x: i * 36, fila: i % 2, cartel: i % 4 === 1 ? r.uno([['¡15 POR', 'AULA!'], ['+600 €'], ['MENOS', 'PAPELEO'], ['NI CALOR NI', 'AMIANTO'], ['APOYOS', 'YA'], ['TIEMPO PARA', 'ENSEÑAR']]) : null }));
  desfile.forEach(d => { d.p.semilla = r() * 3; });

  return {
    fondo: '#0f3522',
    redimensionar() { H = juego.H; },
    info: () => ({ fase: 'portada', tf, boton: botonEmpezar }),
    entrar() { juego.audio.musica('final'); },
    actualizar(dt) {
      tf += dt;
      saltos = saltos.map(s => Math.max(0, s - dt));
      for (const t of juego.entrada.toques) {
        if (botonEmpezar && dentro(t, botonEmpezar)) { juego.estado.profe = elegida; juego.audio.sfx('pancarta'); juego.siguiente(); return; }
        sitiosProfe().forEach((s, i) => {
          if (Math.abs(t.x - s.x) < 44 && t.y > s.y - 110 && t.y < s.y + 20) { elegida = i; saltos[i] = 0.6; juego.audio.sfx('bombilla', { racha: i }); }
        });
      }
    },
    dibujar(ctx) {
      // Pizarra con cuadrícula de tiza.
      const g = ctx.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H * 0.4, H * 0.8);
      g.addColorStop(0, '#1f5c3c'); g.addColorStop(1, '#0f3522');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(247,248,243,.045)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 10; x < W; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 10; y < H; y += 20) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      // Garabatos de tiza.
      ctx.strokeStyle = 'rgba(247,248,243,.13)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(52, 132, 18, 0.3, 5.6); ctx.stroke();
      ctx.font = `400 22px ${fuentes.rotulador}`; ctx.fillStyle = 'rgba(247,248,243,.12)'; ctx.textAlign = 'left';
      ctx.fillText('2+3=5', 300, 140); ctx.fillText('ABC', 24, H * 0.47);
      ctx.save(); ctx.translate(340, H * 0.46); ctx.rotate(-0.2); ctx.fillText('14-O', 0, 0); ctx.restore();

      // Logo y nombre de la asamblea.
      const kL = aparece(tf, 0, 0.5);
      ctx.save(); ctx.globalAlpha = clamp(tf * 3, 0, 1);
      dibujaCorroMini(ctx, W / 2 - 88, 44, 15 * kL, '#f7f8f3', '#86cd55');
      ctx.font = `800 15px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Asamblea Docente', W / 2 - 66, 37);
      ctx.font = `500 12px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.7)';
      ctx.fillText('del CEIP Perú · Madrid', W / 2 - 66, 54);
      ctx.restore();

      // Título en pancarta, sostenida por dos manifestantes.
      const kT = aparece(tf, 0.15, 0.7);
      const ty = H * 0.17 + (1 - kT) * -40;
      ctx.save(); ctx.globalAlpha = clamp((tf - 0.1) * 3, 0, 1);
      const pa = { edad: 'adulto', piel: '#d29a74', peinado: 'moño', pelo: '#2a1c14', ropa: '#5fb84a', marea: true, pantalon: '#2f3e57', semilla: 1 };
      const pb = { edad: 'adulto', piel: '#f6d5bd', peinado: 'corto', pelo: '#b0793f', ropa: '#ffcf33', pantalon: '#284a6e', gafas: true, semilla: 2 };
      dibujaPersona(ctx, pa, { x: 46, y: ty + 150, esc: 1.25, brazos: 'pancarta', expr: 'gritando', t: juego.t });
      dibujaPersona(ctx, pb, { x: W - 46, y: ty + 150, esc: 1.25, brazos: 'pancarta', expr: 'feliz', t: juego.t + 1 });
      pancarta(ctx, ['LLEGAR', 'A TODOS'], W / 2, ty, 300, 112, { t: juego.t, color: '#f7f8f3', semilla: 3, onda: 1.4, tamMax: 50 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp((tf - 0.5) * 3, 0, 1);
      ctx.font = `800 19px ${fuentes.display}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('El juego de la huelga educativa', W / 2, ty + 178);
      ctx.font = `500 14px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.8)';
      ctx.fillText('Da clase, sal a la calle y descubre qué pedimos.', W / 2, ty + 202);
      ctx.restore();

      // Elige a tu profe.
      const sitios = sitiosProfe();
      ctx.save(); ctx.globalAlpha = clamp((tf - 0.7) * 3, 0, 1);
      ctx.font = `400 16px ${fuentes.rotulador}`; ctx.fillStyle = C.marea; ctx.textAlign = 'center';
      ctx.fillText('Elige a tu profe', W / 2, sitios[0].y - 112);
      sitios.forEach((s, i) => {
        const sel = i === elegida;
        if (sel) {
          ctx.fillStyle = alfa('#ffcf33', 0.22); circulo(ctx, s.x, s.y - 34, 44); ctx.fill();
          ctx.strokeStyle = C.amarillo; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(s.x, s.y + 2, 30, 8, 0, 0, TAU); ctx.stroke();
        }
        const salto = saltos[i] > 0 ? Math.sin((0.6 - saltos[i]) / 0.6 * Math.PI) * 18 : 0;
        dibujaPersona(ctx, PROFES[i], { x: s.x, y: s.y, esc: 1.6, brazos: sel ? 'saluda' : 'abajo', expr: sel ? 'feliz' : 'normal', t: juego.t + i, salto, mira: (elegida - i) * 0.3 });
      });
      ctx.restore();

      // Botón.
      if (tf > 0.9) botonEmpezar = boton(ctx, '¡A clase!', W / 2, H * 0.64 + 58, { ancho: 210, alto: 54, fondo: C.amarillo, t: juego.t });
      ctx.font = `500 12.5px ${fuentes.texto}`; ctx.fillStyle = 'rgba(247,248,243,.65)'; ctx.textAlign = 'center';
      ctx.fillText('Unos 5 minutos · con un dedo · mejor con sonido', W / 2, H * 0.64 + 104);

      // Mini mani al fondo.
      const yB = H - 34;
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, yB - 6, W, 40);
      for (const d of desfile) {
        const x = ((d.x + juego.t * 28) % (W + 120)) - 60;
        const y = yB + d.fila * 10;
        if (d.cartel) cartel(ctx, d.cartel, x + 8, y - 54, 40, 22, { t: juego.t + d.x, color: '#f3e2c0' });
        dibujaPersona(ctx, d.p, { x, y, esc: 0.78, brazos: d.cartel ? 'uno' : 'puño', expr: 'gritando', t: juego.t + d.p.semilla, paso: juego.t * 1.4 + d.x * 0.1 });
      }
    },
  };
}
