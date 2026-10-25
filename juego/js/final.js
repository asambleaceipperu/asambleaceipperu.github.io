// Final: vuelta a hoy, la gente forma el «corro» del logo y los lápices señalan qué se puede hacer.
// Los enlaces y la tarjeta van en HTML real (accesibles y pulsables), sobre el lienzo.
import { TAU, clamp, lerp, ease, rr, circulo, fuentes, azar, alfa, formatoNum } from './util.js';
import { PAL, dibujaLapiz } from './personajes.js';
import { icono } from './iconos.js';
import { C, hoja, parrafo, rotulo, crearParticulas, aparece } from './ui.js';
import { REIVINDICACIONES, ENLACES, IDS } from './datos.js';
import { generarTarjeta, textoCompartir } from './tarjeta.js';

export function escenaFinal(juego) {
  const { W } = juego;
  const est = juego.estado;
  let H = juego.H;
  const part = crearParticulas();
  const r = azar(4242);
  let fase = 'hoy'; // hoy → corro → acciones
  let tf = 0;
  const capa = document.getElementById('capa-final');

  // Puntos (personas) que formarán los ocho lápices.
  const puntos = [];
  const N = 260;
  for (let i = 0; i < N; i++) {
    const lap = i % 8, k = Math.floor(i / 8) / (N / 8);
    puntos.push({ x: r() * W, y: H + 20 + r() * 300, lap, k, c: lap % 2 ? PAL.marea : PAL.papel, ret: r() * 0.6 });
  }
  function destino(p, cx, cy, R) {
    // Cada lápiz: desde 0.28 R hasta 0.95 R a lo largo de su radio, con algo de grosor.
    const ang = (p.lap * TAU) / 8 - Math.PI / 2;
    const d = lerp(0.3, 0.96, p.k) * R;
    const lado = ((p.k * 997) % 1 - 0.5) * R * 0.16 * (p.k < 0.12 ? p.k / 0.12 : 1);
    return [cx + Math.cos(ang) * d - Math.sin(ang) * lado, cy + Math.sin(ang) * d + Math.cos(ang) * lado];
  }

  function montarCapa() {
    const a0 = est.aulas[0], a2 = est.aulas[2];
    const faltan = IDS.filter(id => !est.elegidas.includes(id));
    capa.innerHTML = `
      <div class="hueco" style="height:${Math.round(H * 0.3 * (capa.clientWidth / W || 1))}px"></div>
      <h2 id="final-titulo">Que pase de verdad depende de cuántas seamos.</h2>
      <p class="entradilla">Lo que has jugado es lo que pide la huelga educativa de Madrid${faltan.length ? `, y aún faltan ${faltan.map(f => REIVINDICACIONES[f].titulo.toLowerCase()).join(' y ')}` : ''}. Puedes ayudar así:</p>
      <nav class="acciones" aria-label="Qué puedes hacer">
        ${ENLACES.map((e, i) => `<a class="accion" href="${e.url}" style="animation-delay:${0.1 + i * 0.12}s"><span class="ico" data-icono="${e.icono}"></span><span><b>${e.texto}</b><small>${e.sub}</small></span><span class="flecha" aria-hidden="true">›</span></a>`).join('')}
      </nav>
      <p class="enlaces-queja">Para la queja: <a href="https://www.confapamadrid.org/2026/10/informacion-huelga-indefinida-docentes.html">modelo de CONFAPA</a><a href="https://sede.comunidad.madrid/prestacion-social/formulario-solicitud-generica">sede electrónica</a></p>
      <div class="tarjeta-zona">
        <h2 style="font-size:24px;margin-top:10px">Tu tarjeta</h2>
        <label class="cole" for="cole">¿De qué cole eres? <small>(opcional, sale en tu tarjeta)</small>
          <input id="cole" name="cole" type="text" maxlength="40" autocomplete="off" placeholder="CEIP Perú">
        </label>
        <img id="tarjeta-img" alt="Tarjeta de resultado: ${a0 ? `el lunes llegué a ${a0.llegados} de ${a0.total}` : ''}${a2 ? `; en la clase que pedimos, a ${a2.llegados} de ${a2.total}` : ''}." width="1080" height="1920">
        <div class="botones">
          <button class="boton" id="b-compartir" type="button">Compartir</button>
          <a class="boton" id="b-whatsapp" href="#" target="_blank" rel="noopener">WhatsApp</a>
          <a class="boton secundario" id="b-guardar" href="#" download="llegar-a-todos.png">Guardar imagen</a>
        </div>
        <p class="nota-final">Quien abra tu enlace verá tu marca y podrá intentar superarla.</p>
      </div>
      <div class="botones" style="margin-top:6px">
        <button class="boton secundario" id="b-otra" type="button">Volver a jugar</button>
        <a class="boton secundario" href="../huelga.html">Por qué hacemos huelga</a>
      </div>
      <p class="nota-final">Las cifras del juego son las que pide la <a href="../huelga.html">tabla reivindicativa</a>, no medidas aprobadas. Juego de la Asamblea Docente del CEIP Perú, con música provisional.</p>`;
    capa.hidden = false;
    capa.scrollTop = 0;
    // Iconos de las acciones, dibujados con el mismo trazo que el juego.
    capa.querySelectorAll('[data-icono]').forEach(el => {
      const c = document.createElement('canvas');
      const d = Math.min(2, devicePixelRatio || 1);
      c.width = 34 * d; c.height = 34 * d;
      const cx = c.getContext('2d'); cx.scale(d, d);
      icono(cx, el.dataset.icono, 17, 17, 28);
      el.append(c);
    });
    const texto = textoCompartir(est);
    capa.querySelector('#b-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    capa.querySelector('#b-otra').addEventListener('click', () => { capa.hidden = true; capa.innerHTML = ''; juego.reiniciar(); });
    // La tarjeta se regenera si escribes tu cole.
    const entrada = capa.querySelector('#cole');
    try { entrada.value = localStorage.getItem('llegar-cole') || ''; } catch { /* sin almacenamiento */ }
    let archivo = null, urlAnterior = null, espera = null;
    const pintar = () => generarTarjeta(est, { cole: entrada.value.trim(), reto: juego.reto }).then(({ blob, url }) => {
      const img = capa.querySelector('#tarjeta-img');
      if (!img) return;
      if (urlAnterior) URL.revokeObjectURL(urlAnterior);
      urlAnterior = url;
      img.src = url;
      capa.querySelector('#b-guardar').href = url;
      archivo = new File([blob], 'llegar-a-todos.png', { type: 'image/png' });
    });
    entrada.addEventListener('input', () => {
      try { localStorage.setItem('llegar-cole', entrada.value.trim()); } catch { /* sin almacenamiento */ }
      clearTimeout(espera); espera = setTimeout(pintar, 400);
    });
    pintar();
    const b = capa.querySelector('#b-compartir');
    b.addEventListener('click', async () => {
      try {
        if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) await navigator.share({ files: [archivo], text: texto });
        else if (navigator.share) await navigator.share({ text: texto });
        else { await navigator.clipboard.writeText(texto); b.textContent = 'Texto copiado'; }
      } catch { /* compartir cancelado */ }
    });
  }

  return {
    fondo: '#0f3522',
    redimensionar() { H = juego.H; },
    info: () => ({ fase, tf }),
    entrar() { juego.audio.musica('final', { reiniciar: true }); juego.audio.multitud(0); },
    salir() { capa.hidden = true; capa.innerHTML = ''; },
    actualizar(dt) {
      tf += dt;
      part.actualizar(dt);
      if (fase === 'hoy' && tf > 2.4 && juego.entrada.toques.length) { fase = 'corro'; tf = 0; juego.audio.sfx('grande'); }
      if (fase === 'corro' && tf > 3.6) { fase = 'acciones'; tf = 0; montarCapa(); part.confeti(W / 2, H * 0.16, 50); }
      if (fase === 'acciones' && r() < dt * 0.8) part.confeti(r() * W, -10, 6, undefined, 60);
    },
    dibujar(ctx) {
      const g = ctx.createRadialGradient(W / 2, H * 0.3, 30, W / 2, H * 0.4, H);
      g.addColorStop(0, '#1f5c3c'); g.addColorStop(1, '#0f3522');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (fase === 'hoy') dibujaHoy(ctx);
      else dibujaCorro(ctx);
      part.dibujar(ctx);
    },
  };

  function dibujaHoy(ctx) {
    const a0 = est.aulas[0] || { llegados: 0, total: 28 }, a2 = est.aulas[2] || { llegados: 15, total: 15 };
    const k1 = aparece(tf, 0.1, 0.5), k2 = aparece(tf, 0.7, 0.5);
    const tarjetaAula = (y, k, titulo, a, encendida) => {
      if (k <= 0) return;
      ctx.save(); ctx.translate(W / 2, y); ctx.scale(k, k); ctx.translate(-W / 2, -y);
      hoja(ctx, 30, y - 100, W - 60, 200, { rot: encendida ? 0.012 : -0.012 });
      ctx.font = `400 16px ${fuentes.rotulador}`; ctx.fillStyle = C.honda; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(titulo, 70, y - 70);
      ctx.font = `800 22px ${fuentes.display}`; ctx.textAlign = 'right';
      ctx.fillText(`${a.llegados} de ${a.total}`, W - 52, y - 70);
      const cols = 10;
      for (let i = 0; i < a.total; i++) {
        const on = i < a.llegados;
        const cx = 72 + (i % cols) * 28, cy = y - 30 + Math.floor(i / cols) * 30;
        if (on) { ctx.fillStyle = 'rgba(255,207,51,.45)'; circulo(ctx, cx, cy, 12); ctx.fill(); }
        ctx.fillStyle = on ? '#f2c9a6' : '#c9c4b8'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.3;
        circulo(ctx, cx, cy, 9); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#0f3522'; circulo(ctx, cx - 3, cy - 1, 1.1); ctx.fill(); circulo(ctx, cx + 3, cy - 1, 1.1); ctx.fill();
        ctx.beginPath(); ctx.lineWidth = 1.1; if (on) ctx.arc(cx, cy + 1.5, 3, 0.2, Math.PI - 0.2); else { ctx.moveTo(cx - 2.5, cy + 4); ctx.lineTo(cx + 2.5, cy + 4); } ctx.stroke();
      }
      ctx.restore();
    };
    tarjetaAula(H * 0.24, k1, 'Un lunes de hoy', a0, false);
    tarjetaAula(H * 0.52, k2, 'La clase que pedimos', a2, true);
    if (tf > 1.4) {
      const k = aparece(tf, 1.4, 0.6);
      ctx.save(); ctx.globalAlpha = clamp((tf - 1.4) * 2, 0, 1);
      rotulo(ctx, 'HOY, ESTO TODAVÍA', W / 2, H * 0.75, { tam: 28 * k, color: C.papel, sombra: '#0f3522' });
      rotulo(ctx, 'NO HA PASADO.', W / 2, H * 0.75 + 38, { tam: 28 * k, color: C.amarillo, sombra: '#0f3522' });
      ctx.restore();
    }
    if (tf > 2.4) {
      ctx.globalAlpha = 0.6 + Math.sin(juego.t * 5) * 0.4;
      ctx.font = `800 16px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center';
      ctx.fillText('Toca para seguir', W / 2, H - 40);
      ctx.globalAlpha = 1;
    }
  }

  function dibujaCorro(ctx) {
    // Los puntos vuelan hasta formar el logo; luego el logo sube y gira despacio.
    const subir = fase === 'acciones' ? ease.inOutCubic(clamp(tf / 0.9, 0, 1)) : 0;
    const R = lerp(150, 70, subir);
    const cx = W / 2, cy = lerp(H * 0.42, H * 0.15, subir);
    const giro = fase === 'acciones' ? juego.t * 0.15 : 0;
    const t = fase === 'corro' ? tf : 9;
    for (const p of puntos) {
      const k = ease.inOutCubic(clamp((t - p.ret) / 1.8, 0, 1));
      let [dx, dy] = destino(p, 0, 0, R);
      const cs = Math.cos(giro), sn = Math.sin(giro);
      [dx, dy] = [dx * cs - dy * sn, dx * sn + dy * cs];
      const x = lerp(p.x, cx + dx, k), y = lerp(p.y, cy + dy, k);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 1 - clamp((t - 2.1) / 0.8, 0, 1) * 0.92;
      circulo(ctx, x, y, lerp(4, R / 30, k)); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Cuando ya están, se dibujan los lápices limpios encima.
    const kL = clamp((t - 2.1) / 0.8, 0, 1);
    if (kL > 0) {
      ctx.save(); ctx.globalAlpha = kL; ctx.translate(cx, cy); ctx.rotate(giro);
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate((i * TAU) / 8);
        ctx.translate(0, -R * 0.28);
        ctx.rotate(Math.PI);
        dibujaLapiz(ctx, R * 0.68, R * 0.24, i % 2 ? PAL.marea : PAL.papel, PAL.honda);
        ctx.restore();
      }
      ctx.fillStyle = PAL.marea; circulo(ctx, 0, 0, R * 0.15); ctx.fill();
      ctx.restore();
    }
    if (fase === 'corro' && tf > 2.4) {
      ctx.save(); ctx.globalAlpha = clamp((tf - 2.4) * 2, 0, 1);
      rotulo(ctx, 'LA PÚBLICA SE DEFIENDE', W / 2, H * 0.74, { tam: 26, color: C.papel, sombra: '#0f3522' });
      rotulo(ctx, 'EN COMÚN', W / 2, H * 0.74 + 36, { tam: 30, color: C.amarillo, sombra: '#0f3522' });
      ctx.restore();
    }
  }
}
