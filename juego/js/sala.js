// Sala de profes: un respiro entre clase y calle. Diálogo corto entre compis y objetos que se pueden tocar.
import { TAU, clamp, lerp, ease, rr, circulo, elipse, sombra, fuentes, mezcla, alfa } from './util.js';
import { dibujaPersona, PROFES, conCamisetaVerde, dibujaCorroMini } from './personajes.js';
import { icono } from './iconos.js';
import { C, parrafo, crearParticulas, boton, dentro, aparece, cartel } from './ui.js';
import { guionSala, HUEVOS, COMPIS } from './datos.js';

export function escenaSala(juego, { n = 1 }) {
  const { W } = juego;
  const est = juego.estado;
  let H = juego.H;
  const part = crearParticulas();
  const guion = guionSala(n, est);
  const elegidas = est.elegidas.slice(0, 2);
  const conSueldo = n === 2 && elegidas.includes('sueldo');
  const sinPapeles = n === 2 && elegidas.includes('burocracia');
  const fresca = n === 2 && elegidas.includes('infra');
  est.huevos = est.huevos || {};

  let linea = 0, tLinea = 0, tf = 0;
  let botonSeguir = null;
  const botonSaltar = { x: juego.W - 96, y: 64, w: 84, h: 30 };
  // Cada personaje balbucea con su propio tono.
  const TONOS = { 0: 0.8, 1: 1.25, 2: 1.1, p: 1 };
  function hablar() { const [q, txt] = guion[linea]; juego.audio.voz(TONOS[q] || 1, Math.min(14, Math.ceil(txt.length / 6))); }
  let aviso = null; // bocadillo de un objeto tocado
  const L = {};
  function disponer() {
    H = juego.H;
    L.pared = Math.round(H * 0.4);
    L.mesaY = H - 128;
    L.obj = {
      ventana: { x: 18, y: 86, w: 110, h: 104 },
      planta: { x: 54, y: 150, w: 44, h: 50 },
      corcho: { x: 150, y: 92, w: 128, h: 96 },
      cartel: { x: 158, y: 100, w: 70, h: 52 },
      calendario: { x: 234, y: 100, w: 38, h: 48 },
      reloj: { x: 300, y: 92, w: 40, h: 40 },
      fotocopiadora: { x: 300, y: L.pared - 96, w: 84, h: 96 },
      encimera: { x: 18, y: L.pared - 54, w: 262, h: 54 },
      micro: { x: 30, y: L.pared - 96, w: 70, h: 44 },
      tupper: { x: 194, y: L.pared - 82, w: 40, h: 28 },
      raices: { x: 120, y: L.pared - 84, w: 50, h: 32 },
    };
  }
  disponer();

  const persona = PROFES[est.profe || 0];
  const sitios = () => [
    { quien: 0, x: 66, y: L.mesaY + 4 },
    { quien: 'p', x: 156, y: L.mesaY + 4 },
    { quien: 1, x: 246, y: L.mesaY + 4 },
    { quien: 2, x: 336, y: L.mesaY + 4 },
  ];
  const quienP = q => (q === 'p' ? (n === 1 ? persona : conCamisetaVerde(persona)) : COMPIS[q]);

  function tocarObjeto(p) {
    const o = L.obj;
    const orden = ['tupper', 'cartel', 'calendario', 'fotocopiadora', 'micro', 'raices', 'planta'];
    for (const k of orden) {
      if (dentro(p, o[k], 4)) {
        const veces = (est.huevos[k] = (est.huevos[k] || 0) + 1);
        const textos = HUEVOS[k];
        aviso = { k, t: 0, texto: textos[Math.min(veces - 1, textos.length - 1)], x: o[k].x + o[k].w / 2, y: o[k].y };
        juego.audio.sfx('huevo');
        part.chispa(o[k].x + o[k].w / 2, o[k].y + o[k].h / 2, 8, '#ffcf33');
        return true;
      }
    }
    return false;
  }

  return {
    fondo: '#efe8d6',
    redimensionar: disponer,
    info: () => ({ fase: botonSeguir ? 'boton' : 'dialogo', tf }),
    entrar() { juego.audio.musica('sala'); juego.audio.multitud(0); hablar(); },
    actualizar(dt) {
      tf += dt; tLinea += dt;
      part.actualizar(dt);
      if (aviso) { aviso.t += dt; if (aviso.t > 2.6) aviso = null; }
      for (const t of juego.entrada.toques) {
        if ((botonSeguir && dentro(t, botonSeguir)) || dentro(t, botonSaltar)) { juego.audio.sfx('toque'); juego.siguiente(); return; }
        if (tocarObjeto(t)) continue;
        if (tf < 0.6) continue;
        // Avanzar el diálogo: primero completa la línea, luego pasa a la siguiente.
        const lleno = tLinea * 45 >= guion[linea][1].length;
        if (!lleno) tLinea = 99;
        else if (linea < guion.length - 1) { linea++; tLinea = 0; hablar(); }
      }
    },
    dibujar(ctx) {
      dibujaFondo(ctx);
      dibujaObjetos(ctx);
      dibujaGente(ctx);
      dibujaMesa(ctx);
      part.dibujar(ctx);
      dibujaDialogo(ctx);
      if (aviso) dibujaAviso(ctx);
      // Rótulo de la escena.
      ctx.fillStyle = 'rgba(15,53,34,.9)'; ctx.fillRect(0, 0, W, 54);
      ctx.font = `400 18px ${fuentes.rotulador}`; ctx.fillStyle = C.amarillo; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(n === 1 ? 'Sala de profes · lunes, 16:00' : 'Sala de profes · otro día', 14, 28);
      // Saltar la escena.
      ctx.fillStyle = 'rgba(15,53,34,.85)'; rr(ctx, botonSaltar.x, botonSaltar.y, botonSaltar.w, botonSaltar.h, 15); ctx.fill();
      ctx.font = `800 13px ${fuentes.display}`; ctx.fillStyle = C.papel; ctx.textAlign = 'center';
      ctx.fillText('Saltar ›', botonSaltar.x + botonSaltar.w / 2, botonSaltar.y + botonSaltar.h / 2 + 1);

    },
  };

  function dibujaFondo(ctx) {
    // Pared con zócalo y suelo de terrazo.
    ctx.fillStyle = fresca ? '#e8efe0' : '#efe5cf'; ctx.fillRect(0, 54, W, L.pared - 54);
    ctx.fillStyle = 'rgba(23,77,50,.05)';
    for (let x = 0; x < W; x += 24) ctx.fillRect(x, 54, 12, L.pared - 54);
    ctx.fillStyle = '#86cd55'; ctx.fillRect(0, L.pared - 8, W, 8);
    const g = ctx.createLinearGradient(0, L.pared, 0, H);
    g.addColorStop(0, '#d8cfbb'); g.addColorStop(1, '#cbc1aa');
    ctx.fillStyle = g; ctx.fillRect(0, L.pared, W, H - L.pared);
    ctx.fillStyle = 'rgba(15,53,34,.06)';
    for (let i = 0; i < 60; i++) { circulo(ctx, (i * 67) % W, L.pared + 10 + ((i * 131) % (H - L.pared - 10)), 1.5 + (i % 3)); ctx.fill(); }
  }

  function dibujaObjetos(ctx) {
    const o = L.obj;
    // Ventana con patio.
    const v = o.ventana;
    ctx.fillStyle = '#0f3522'; rr(ctx, v.x - 3, v.y - 3, v.w + 6, v.h + 6, 6); ctx.fill();
    const cielo = ctx.createLinearGradient(0, v.y, 0, v.y + v.h); cielo.addColorStop(0, '#9fd3f0'); cielo.addColorStop(1, '#e8f6fb');
    ctx.fillStyle = cielo; rr(ctx, v.x, v.y, v.w, v.h, 4); ctx.fill();
    ctx.fillStyle = '#86cd55'; elipse(ctx, v.x + 30, v.y + v.h, 40, 22); ctx.fill(); elipse(ctx, v.x + 90, v.y + v.h + 4, 34, 20); ctx.fill();
    ctx.fillStyle = '#ffffff'; elipse(ctx, v.x + 70 + Math.sin(juego.t * 0.3) * 8, v.y + 26, 16, 6); ctx.fill();
    ctx.fillStyle = '#0f3522'; ctx.fillRect(v.x + v.w / 2 - 1.5, v.y, 3, v.h); ctx.fillRect(v.x, v.y + v.h / 2 - 1.5, v.w, 3);
    // Repisa y planta mustia (nadie tiene horas para regarla).
    ctx.fillStyle = '#b98a5a'; ctx.fillRect(v.x - 6, v.y + v.h + 2, v.w + 12, 7);
    const pl = o.planta;
    ctx.fillStyle = '#c8754e'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pl.x + 8, pl.y + 28); ctx.lineTo(pl.x + 36, pl.y + 28); ctx.lineTo(pl.x + 32, pl.y + 48); ctx.lineTo(pl.x + 12, pl.y + 48); ctx.closePath(); ctx.fill(); ctx.stroke();
    const regada = (est.huevos.planta || 0) > 2;
    ctx.strokeStyle = regada ? '#4f9a3f' : '#9b8a4a'; ctx.lineWidth = 2.5;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(pl.x + 22, pl.y + 28); ctx.quadraticCurveTo(pl.x + 22 + i * 10, pl.y + 10, pl.x + 22 + i * (regada ? 12 : 18), pl.y + (regada ? 4 : 22)); ctx.stroke(); }
    // Corcho con cartel y calendario.
    const co = o.corcho;
    ctx.fillStyle = '#c99b63'; ctx.strokeStyle = '#7d5a3c'; ctx.lineWidth = 4; rr(ctx, co.x, co.y, co.w, co.h, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 30; i++) { circulo(ctx, co.x + 6 + (i * 37) % (co.w - 12), co.y + 6 + (i * 23) % (co.h - 12), 1); ctx.fill(); }
    const ca = o.cartel;
    ctx.save(); ctx.translate(ca.x + ca.w / 2, ca.y + ca.h / 2); ctx.rotate(-0.04);
    ctx.fillStyle = '#ffcf33'; ctx.fillRect(-ca.w / 2, -ca.h / 2, ca.w, ca.h);
    ctx.font = `400 10px ${fuentes.rotulador}`; ctx.fillStyle = '#0f3522'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ZARZALEJO,', 0, -12); ctx.font = `400 13px ${fuentes.rotulador}`; ctx.fillText('REÚNETE', 0, 2); ctx.fillText('YA', 0, 16);
    ctx.fillStyle = '#e0566c'; circulo(ctx, 0, -ca.h / 2 + 3, 2.5); ctx.fill();
    ctx.restore();
    const cl = o.calendario;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
    ctx.fillStyle = '#e0566c'; ctx.fillRect(cl.x, cl.y, cl.w, 10);
    ctx.font = `700 7px ${fuentes.texto}`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText('OCTUBRE', cl.x + cl.w / 2, cl.y + 5.5);
    ctx.fillStyle = '#4a594f'; ctx.font = `600 6px ${fuentes.texto}`;
    for (let d = 1; d <= 31; d++) { const c = (d + 2) % 7, f = Math.floor((d + 2) / 7); ctx.fillText(String(d), cl.x + 4 + c * 5, cl.y + 16 + f * 6.4); }
    ctx.strokeStyle = '#e0566c'; ctx.lineWidth = 1.5; circulo(ctx, cl.x + 4 + ((14 + 2) % 7) * 5, cl.y + 16 + Math.floor(16 / 7) * 6.4 - 0.5, 4); ctx.stroke();
    // Reloj de pared.
    const re = o.reloj;
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2.5; circulo(ctx, re.x + 20, re.y + 20, 17); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(re.x + 20, re.y + 20); ctx.lineTo(re.x + 20, re.y + 8); ctx.moveTo(re.x + 20, re.y + 20); ctx.lineTo(re.x + 28, re.y + 24); ctx.stroke();
    // Aire acondicionado o ventilador.
    if (fresca) { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5; rr(ctx, 300, 146, 80, 22, 6); ctx.fill(); ctx.stroke(); }
    else {
      ctx.save(); ctx.translate(360, 170); ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
      ctx.fillStyle = '#7fb7e8'; circulo(ctx, 0, 0, 16); ctx.fill(); ctx.stroke();
      ctx.rotate(juego.t * 14); ctx.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); elipse(ctx, 0, -8, 4, 7); ctx.fill(); }
      ctx.restore();
    }
    // Encimera, microondas, tupper, portátil con Raíces.
    const en = o.encimera;
    ctx.fillStyle = '#e9dfc7'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.8;
    rr(ctx, en.x, en.y, en.w, en.h, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b98a5a'; ctx.fillRect(en.x, en.y, en.w, 8); ctx.strokeRect(en.x, en.y, en.w, 8);
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(15,53,34,.4)'; rr(ctx, en.x + 10 + i * 86, en.y + 14, 76, 34, 3); ctx.stroke(); }
    const mi = o.micro;
    ctx.fillStyle = '#f7f8f3'; ctx.strokeStyle = '#0f3522'; rr(ctx, mi.x, mi.y, mi.w, mi.h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = (est.huevos.micro || 0) % 2 ? '#ffd36b' : '#3b4a44'; rr(ctx, mi.x + 6, mi.y + 6, 42, mi.h - 12, 3); ctx.fill();
    ctx.fillStyle = '#0f3522'; for (let i = 0; i < 3; i++) { circulo(ctx, mi.x + 58, mi.y + 12 + i * 10, 2.5); ctx.fill(); }
    // Cola de tuppers delante del micro.
    for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#e0566c', '#7fb7e8', '#ffcf33', '#86cd55'][i]; rr(ctx, mi.x - 2 + i * 0, mi.y - 10 - i * 7, 26, 7, 2); ctx.fill(); ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1; ctx.stroke(); }
    const tu = o.tupper;
    const moho = clamp(((est.huevos.tupper || 0) + n) / 4, 0, 1);
    ctx.save(); ctx.translate(tu.x + tu.w / 2, tu.y + tu.h / 2);
    if (aviso?.k === 'tupper') ctx.rotate(Math.sin(aviso.t * 30) * 0.08 * (1 - aviso.t / 2.6));
    ctx.fillStyle = mezcla('#d9b36c', '#7a8a3c', moho); ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.5;
    rr(ctx, -tu.w / 2, -tu.h / 2 + 6, tu.w, tu.h - 6, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0566c'; rr(ctx, -tu.w / 2 - 2, -tu.h / 2 + 2, tu.w + 4, 7, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-10, 1, 20, 9); ctx.font = `700 7px ${fuentes.texto}`; ctx.fillStyle = '#0f3522'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('2019', 0, 6);
    // Rayitas de olor.
    ctx.strokeStyle = alfa('#7a8a3c', 0.6 + moho * 0.4); ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); const ox = i * 9; for (let k = 0; k < 6; k++) ctx.lineTo(ox + Math.sin(juego.t * 3 + k + i) * 2.5, -tu.h / 2 - k * 4); ctx.stroke(); }
    ctx.restore();
    // Brillo para invitar a tocar el tupper.
    if (!est.huevos.tupper) { const k = (Math.sin(juego.t * 3) + 1) / 2; ctx.strokeStyle = alfa('#ffcf33', 0.3 + k * 0.5); ctx.lineWidth = 2.5; circulo(ctx, tu.x + tu.w / 2, tu.y + tu.h / 2, 26 + k * 3); ctx.stroke(); }
    const ra = o.raices;
    ctx.fillStyle = '#3b4a44'; rr(ctx, ra.x, ra.y, ra.w, ra.h, 3); ctx.fill();
    ctx.fillStyle = '#e8f6fb'; rr(ctx, ra.x + 3, ra.y + 3, ra.w - 6, ra.h - 6, 2); ctx.fill();
    ctx.strokeStyle = '#174d32'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ra.x + ra.w / 2, ra.y + ra.h / 2, 7, juego.t * 6, juego.t * 6 + 4.2); ctx.stroke();
    ctx.fillStyle = '#5b4636'; ctx.fillRect(ra.x - 4, ra.y + ra.h, ra.w + 8, 3);
    // Fotocopiadora con atasco.
    const fo = o.fotocopiadora;
    ctx.fillStyle = '#d6d9d4'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.8;
    rr(ctx, fo.x, fo.y + 18, fo.w, fo.h - 18, 6); ctx.fill(); ctx.stroke();
    rr(ctx, fo.x + 6, fo.y, fo.w - 12, 24, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = Math.sin(juego.t * 7) > 0 ? '#e0566c' : '#7a2d2d'; circulo(ctx, fo.x + fo.w - 16, fo.y + 34, 4); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.save(); ctx.translate(fo.x + 22, fo.y + 46); ctx.rotate(-0.4 + (aviso?.k === 'fotocopiadora' ? Math.sin(aviso.t * 20) * 0.2 : 0)); rr(ctx, -10, -6, 26, 14, 1); ctx.fill(); ctx.strokeStyle = 'rgba(15,53,34,.5)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    ctx.strokeStyle = 'rgba(15,53,34,.35)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(fo.x + 10, fo.y + 62 + i * 10); ctx.lineTo(fo.x + fo.w - 10, fo.y + 62 + i * 10); ctx.stroke(); }
  }

  function dibujaGente(ctx) {
    const habla = guion[linea][0];
    for (const s of sitios()) {
      if (s.quien === 2 && n === 1) {
        // La silla de Laura, vacía.
        silla(ctx, s.x, s.y, true);
        continue;
      }
      if (s.quien === 2 && n === 2 && !conSueldo) { silla(ctx, s.x, s.y, true); continue; }
      const p = s.quien === 2 ? { edad: 'adulto', piel: '#eab996', peinado: 'largo', pelo: '#6f4426', ropa: '#5fb84a', marea: true, pantalon: '#2f3e57', semilla: 2.9 } : quienP(s.quien);
      silla(ctx, s.x, s.y, false);
      const hablando = habla === s.quien;
      dibujaPersona(ctx, p, { x: s.x, y: s.y - 2, esc: 2.05, sentado: true, brazos: hablando ? 'saluda' : s.quien === 'p' ? 'cafe' : 'abajo', expr: hablando ? 'feliz' : 'normal', t: juego.t + (p.semilla || 0), mira: hablando ? 0 : 0.6 * (s.x < 200 ? 1 : -1), salto: hablando ? Math.abs(Math.sin(tLinea * 8)) * 1.5 * (tLinea < 1.2 ? 1 : 0) : 0 });
    }
  }
  function silla(ctx, x, y, vacia) {
    ctx.fillStyle = '#c28b54'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 1.6;
    rr(ctx, x - 28, y - 100, 56, 60, 8); ctx.fill(); ctx.stroke();
    if (vacia) {
      rr(ctx, x - 28, y - 40, 56, 12, 3); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(x + 2, y - 66); ctx.rotate(0.08); ctx.scale(1.4, 1.4);
      ctx.fillStyle = '#fff6c9'; ctx.fillRect(-16, -9, 32, 18); ctx.font = `400 7px ${fuentes.rotulador}`; ctx.fillStyle = '#0f3522'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n === 1 || !conSueldo ? 'LAURA:' : '', 0, -3); ctx.fillText(n === 1 || !conSueldo ? 'SE FUE' : '', 0, 5);
      ctx.restore();
    }
  }
  function dibujaMesa(ctx) {
    const y = L.mesaY;
    sombra(ctx, W / 2, y + 74, 190, 12, 0.18);
    ctx.fillStyle = '#b98a5a'; ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2;
    rr(ctx, 16, y - 20, W - 32, 70, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a77a4c'; ctx.fillRect(20, y + 38, W - 40, 8);
    // Tazas, galletas y (si no hay administrativo) montones de papeles.
    for (const [x, c] of [[86, '#e0566c'], [196, '#f7f8f3'], [276, '#7fb7e8']]) { ctx.fillStyle = c; rr(ctx, x, y - 8, 14, 14, 3); ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke(); }
    ctx.fillStyle = '#e9a23b'; for (let i = 0; i < 4; i++) { circulo(ctx, 118 + i * 9, y + 14, 5); ctx.fill(); ctx.stroke(); }
    if (!sinPapeles) for (let i = 0; i < 7; i++) { ctx.fillStyle = '#ffffff'; ctx.lineWidth = 1; rr(ctx, 300 + Math.sin(i) * 3, y + 8 - i * 3, 34, 20, 1.5); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = '#86cd55'; rr(ctx, 300, y + 6, 40, 16, 3); ctx.fill(); ctx.stroke(); dibujaCorroMini(ctx, 320, y + 14, 6, '#ffffff'); }
  }

  function dibujaDialogo(ctx) {
    const [q, txt] = guion[linea];
    const s = sitios().find(s => s.quien === q) || sitios()[1];
    const visibles = Math.floor(tLinea * 45);
    const t = txt.slice(0, visibles);
    const w = W - 36;
    ctx.font = `600 17px ${fuentes.texto}`;
    const alto = Math.max(1, Math.ceil(ctx.measureText(txt).width / (w - 32))) * 23 + 30;
    const x = 18, y = Math.max(L.pared + 14, L.mesaY - 168 - alto);
    const k = aparece(tLinea, 0, 0.25);
    ctx.save();
    ctx.translate(s.x, y + alto); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.translate(-s.x, -(y + alto));
    ctx.fillStyle = 'rgba(15,53,34,.25)'; rr(ctx, x + 2, y + 4, w, alto, 16); ctx.fill();
    ctx.fillStyle = q === 'p' ? '#fff6c9' : '#ffffff';
    rr(ctx, x, y, w, alto, 16); ctx.fill();
    ctx.beginPath(); ctx.moveTo(clamp(s.x - 12, x + 20, x + w - 40), y + alto - 1); ctx.lineTo(s.x, y + alto + 26); ctx.lineTo(clamp(s.x + 12, x + 40, x + w - 20), y + alto - 1); ctx.fill();
    ctx.strokeStyle = '#0f3522'; ctx.lineWidth = 2; rr(ctx, x, y, w, alto, 16); ctx.stroke();
    parrafo(ctx, t, x + 16, y + 14, w - 32, { tam: 17, alto: 1.35, peso: 600 });
    ctx.restore();
    // Indicador de avance o botón de seguir.
    const ultima = linea === guion.length - 1;
    if (ultima && visibles >= txt.length) {
      botonSeguir = boton(ctx, n === 1 ? '¡A la calle!' : '¡Otra vez a la calle!', W / 2, H - 46, { ancho: 240, t: juego.t, fondo: C.amarillo });
    } else {
      botonSeguir = null;
      ctx.fillStyle = alfa('#0f3522', 0.5 + Math.sin(juego.t * 6) * 0.3);
      ctx.beginPath(); ctx.moveTo(x + w - 26, y + alto - 16); ctx.lineTo(x + w - 14, y + alto - 16); ctx.lineTo(x + w - 20, y + alto - 9); ctx.closePath(); ctx.fill();
      ctx.font = `600 12px ${fuentes.texto}`; ctx.textAlign = 'center'; ctx.fillStyle = alfa('#0f3522', 0.6);
      ctx.fillText(`${linea + 1} / ${guion.length} · toca para seguir · prueba a tocar las cosas`, W / 2, H - 22);
    }
  }
  function dibujaAviso(ctx) {
    const k = aparece(aviso.t, 0, 0.3);
    const a = aviso.t > 2.2 ? 1 - (aviso.t - 2.2) / 0.4 : 1;
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
    ctx.font = `800 14px ${fuentes.display}`;
    const w = Math.min(W - 30, ctx.measureText(aviso.texto).width + 26);
    const x = clamp(aviso.x - w / 2, 14, W - w - 14), y = aviso.y - 40 - (1 - k) * 10;
    ctx.fillStyle = '#0f3522'; rr(ctx, x, y, w, 30, 15); ctx.fill();
    ctx.fillStyle = C.amarillo; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(aviso.texto, x + w / 2, y + 15.5, w - 16);
    ctx.restore();
  }
}
