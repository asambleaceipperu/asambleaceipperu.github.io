// Efectos de ambiente: humo de bengalas, polvo de tiza en la luz, etalonaje de color, viñeta y sacudida.
import { TAU, clamp, lerp, lienzo, rnd } from './util.js';

// Bocanada blanda pre-renderizada por color (mucho más barato que un degradado por partícula).
const bocanadas = new Map();
function bocanada(color) {
  let c = bocanadas.get(color);
  if (c) return c;
  c = lienzo(64, 64);
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, color); g.addColorStop(0.45, color.replace(/[\d.]+\)$/, m => String(parseFloat(m) * 0.55) + ')')); g.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  bocanadas.set(color, c);
  return c;
}

// Humo de bengala: emisores que sueltan bocanadas que suben, crecen y se desvanecen.
export function crearHumo(max = 260) {
  const puffs = [];
  return {
    puffs,
    emitir(x, y, color = 'rgba(134,205,85,.55)', n = 1, { vx = 0, vy = -40, tam = 10, vida = 2.4, esc = 1 } = {}) {
      for (let i = 0; i < n; i++) {
        if (puffs.length >= max) puffs.shift();
        puffs.push({ x: x + (rnd() - 0.5) * 6 * esc, y, vx: vx + (rnd() - 0.5) * 18 * esc, vy: vy * (0.7 + rnd() * 0.5) * esc, r: tam * esc * (0.8 + rnd() * 0.4), crece: 14 * esc, t: 0, vida: vida * (0.8 + rnd() * 0.4), color, giro: rnd() * TAU });
      }
    },
    actualizar(dt, viento = 8) {
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.t += dt;
        if (p.t > p.vida) { puffs.splice(i, 1); continue; }
        p.x += (p.vx + viento * (p.t / p.vida)) * dt; p.y += p.vy * dt;
        p.vx *= 0.99; p.vy *= 0.985;
        p.r += p.crece * dt;
      }
    },
    // Permite desplazar todo el humo (cuando la cámara avanza).
    mover(dx, dy) { for (const p of puffs) { p.x += dx; p.y += dy; } },
    dibujar(ctx) {
      for (const p of puffs) {
        const k = p.t / p.vida;
        ctx.globalAlpha = clamp((1 - k) * Math.min(1, p.t * 6), 0, 1);
        const img = bocanada(p.color);
        ctx.drawImage(img, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    },
  };
}

// Motas de polvo que flotan en los haces de luz.
export function crearPolvo(n, caja) {
  const motas = Array.from({ length: n }, () => ({ x: caja.x + rnd() * caja.w, y: caja.y + rnd() * caja.h, f: rnd() * TAU, v: 4 + rnd() * 8, r: 0.6 + rnd() * 1.4 }));
  return {
    actualizar(dt, t) { for (const m of motas) { m.y -= m.v * dt * 0.4; m.x += Math.sin(t * 0.6 + m.f) * 4 * dt; if (m.y < caja.y) { m.y = caja.y + caja.h; m.x = caja.x + rnd() * caja.w; } } },
    dibujar(ctx, t, dentro = () => 1) {
      for (const m of motas) {
        const a = dentro(m.x, m.y) * (0.35 + 0.35 * Math.sin(t * 2 + m.f));
        if (a <= 0.02) continue;
        ctx.fillStyle = `rgba(255,246,220,${a})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
      }
    },
  };
}

// Etalonaje: un degradado en «luz suave» por encima de la escena y una viñeta.
export function etalonar(ctx, W, H, { arriba, abajo, fuerza = 0.5, vineta = 0.35 } = {}) {
  ctx.save();
  if (arriba) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = fuerza;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, arriba); g.addColorStop(1, abajo || arriba);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (vineta > 0) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const v = ctx.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(10,30,20,0)'); v.addColorStop(1, `rgba(10,30,20,${vineta})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

// Sacudida de cámara con caída exponencial.
export function crearSacudida(reducido = false) {
  let fuerza = 0;
  return {
    golpe(f) { fuerza = Math.max(fuerza, reducido ? f * 0.2 : f); },
    actualizar(dt) { fuerza *= Math.exp(-dt * 9); if (fuerza < 0.05) fuerza = 0; },
    aplicar(ctx, t) { if (fuerza) ctx.translate(Math.sin(t * 91) * fuerza, Math.cos(t * 77) * fuerza); },
  };
}

// Destello: un brillo en cruz que se abre y se cierra.
export function destello(ctx, x, y, r, k, color = 'rgba(255,240,180,') {
  const a = Math.sin(clamp(k, 0, 1) * Math.PI);
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, color + (0.9 * a) + ')'); g.addColorStop(1, color + '0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = color + (0.8 * a) + ')';
  for (const rot of [0, Math.PI / 2]) { ctx.save(); ctx.rotate(rot + k); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.6 * a, r * 0.08, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.restore();
}

export { lerp };
