// Ilustraciones vectoriales para «Lo que hay detrás». Cada tema es una composición con la paleta de la web
// y un texto pintado a rotulador. Devuelven un SVG en texto (600×340).
const C = { papel: '#f7f8f3', pizarra: '#174d32', honda: '#0f3522', marea: '#86cd55', suave: '#e4eed8', amarillo: '#ffcf33', margen: '#e0566c', azul: '#7fb7e8', piel: ['#f6d5bd', '#d29a74', '#8a5a3c', '#eab996', '#b47a55'] };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function rotulo(texto, x, y, tam = 46, color = C.amarillo, rot = -3, sombra = C.honda) {
  return `<g transform="rotate(${rot} ${x} ${y})" font-family="Marker, Bricolage, sans-serif" font-size="${tam}" text-anchor="middle">
    <text x="${x + 3}" y="${y + 3}" fill="${sombra}" opacity=".55">${esc(texto)}</text><text x="${x}" y="${y}" fill="${color}">${esc(texto)}</text></g>`;
}
// Persona sencilla (cabeza, cuerpo-píldora y brazo en alto).
function persona(x, y, s, ropa, piel, brazo = true) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${C.honda}" stroke-width="2.2" stroke-linejoin="round">
    ${brazo ? `<path d="M7 -34 L15 -62" stroke-width="8" stroke-linecap="round"/><path d="M7 -34 L15 -62" stroke="${piel}" stroke-width="5.2" stroke-linecap="round"/>` : ''}
    <rect x="-12" y="-40" width="24" height="38" rx="11" fill="${ropa}"/>
    <circle cx="0" cy="-52" r="12" fill="${piel}"/>
    <path d="M-12 -54 A12 12 0 0 1 12 -54 Q4 -60 -4 -58 Q-9 -57 -12 -54Z" fill="${C.honda}" stroke="none"/>
    <circle cx="-4" cy="-50" r="1.6" fill="${C.honda}" stroke="none"/><circle cx="4" cy="-50" r="1.6" fill="${C.honda}" stroke="none"/>
  </g>`;
}
const fondo = (color, extra = '') => `<rect width="600" height="340" fill="${color}"/>${extra}`;
let nPatron = 0;
const puntos = (color, op = .12) => { const id = `pt${++nPatron}`; return `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="${color}" opacity="${op}"/></pattern><rect width="600" height="340" fill="url(#${id})"/>`; };

const TEMAS = {
  multitud(t) {
    let gente = '';
    for (let fila = 0; fila < 3; fila++) for (let i = 0; i < 9; i++) {
      const x = 30 + i * 68 + (fila % 2) * 30, y = 250 + fila * 46;
      gente += persona(x, y, 1.1 + fila * 0.18, [C.marea, '#5fb84a', C.amarillo, C.papel][(i + fila) % 4], C.piel[(i * 3 + fila) % 5], (i + fila) % 3 !== 1);
    }
    return fondo(C.pizarra, puntos(C.papel)) +
      `<circle cx="480" cy="80" r="48" fill="${C.amarillo}" opacity=".9"/>` +
      `<g transform="rotate(-2 300 120)"><rect x="110" y="70" width="380" height="96" fill="${C.papel}" stroke="${C.honda}" stroke-width="3"/>
       <line x1="118" y1="70" x2="118" y2="240" stroke="#7d5a3c" stroke-width="8"/><line x1="482" y1="70" x2="482" y2="240" stroke="#7d5a3c" stroke-width="8"/></g>` +
      rotulo(t.texto || 'SEGUIMOS', 300, 135, Math.min(44, 500 / Math.max(6, (t.texto || '').length)), C.honda, -2, C.marea) + gente;
  },
  cine(t) {
    let agujeros = '';
    for (let i = 0; i < 14; i++) agujeros += `<rect x="${12 + i * 44}" y="22" width="22" height="14" rx="3" fill="${C.papel}" opacity=".85"/><rect x="${12 + i * 44}" y="304" width="22" height="14" rx="3" fill="${C.papel}" opacity=".85"/>`;
    return fondo('#1d2a26') + `<rect y="10" width="600" height="36" fill="#0b1411"/><rect y="294" width="600" height="36" fill="#0b1411"/>` + agujeros +
      `<g transform="translate(70 120) rotate(-8)"><rect width="150" height="110" rx="8" fill="${C.papel}" stroke="${C.honda}" stroke-width="3"/><rect y="-34" width="150" height="34" fill="${C.honda}"/>
       <path d="M0 -34 L30 0 M40 -34 L70 0 M80 -34 L110 0 M120 -34 L150 0" stroke="${C.papel}" stroke-width="8"/>
       <text x="75" y="64" font-family="Marker, sans-serif" font-size="30" text-anchor="middle" fill="${C.pizarra}">${esc(t.anio || '')}</text></g>` +
      rotulo(t.texto || '', 395, 165, Math.min(46, 620 / Math.max(6, (t.texto || '').length)), C.amarillo, -3) +
      `<circle cx="520" cy="250" r="26" fill="${C.amarillo}" opacity=".25"/><circle cx="470" cy="270" r="14" fill="${C.amarillo}" opacity=".18"/>`;
  },
  aula(t) {
    let pupitres = '';
    // Dos filas al tresbolillo: la de atrás, más pequeña, asoma entre las cabezas de la de delante.
    for (let f = 0; f < 2; f++) for (let i = 0; i < 4 + f; i++) {
      const s = f ? 1.12 : 0.9, x = f ? 80 + i * 110 : 135 + i * 110, y = f ? 332 : 262;
      pupitres = (f ? pupitres : '') + persona(x, y - 6 * s, s, [C.margen, C.azul, C.amarillo, C.marea, '#c9a7ef'][(i + f * 2) % 5], C.piel[(i * 2 + f) % 5], (i + f) % 3 === 0) +
        `<rect x="${x - 36 * s}" y="${y - 10 * s}" width="${72 * s}" height="${18 * s}" rx="4" fill="#e9c38f" stroke="${C.honda}" stroke-width="2.2"/>` + (f ? '' : pupitres);
    }
    return fondo('#efe5cf') + `<rect x="60" y="24" width="480" height="140" rx="8" fill="#7d5a3c"/><rect x="70" y="32" width="460" height="124" rx="4" fill="${C.pizarra}"/>` +
      `<g font-family="Marker, sans-serif" fill="${C.papel}" text-anchor="middle"><text x="300" y="${t.sub ? 92 : 110}" font-size="${Math.min(44, 700 / Math.max(8, (t.texto || '').length))}">${esc(t.texto || '')}</text>${t.sub ? `<text x="300" y="134" font-size="${Math.min(22, 760 / Math.max(10, t.sub.length))}" fill="${C.amarillo}">${esc(t.sub)}</text>` : ''}</g>` + pupitres;
  },
  cifra(t) {
    return fondo(C.amarillo, puntos(C.honda, 0.08)) + `<circle cx="80" cy="60" r="110" fill="${C.marea}" opacity=".35"/><circle cx="540" cy="300" r="120" fill="${C.papel}" opacity=".45"/>` +
      rotulo(t.texto || '', 300, 205, Math.min(170, 900 / Math.max(2, String(t.texto || '').length)), C.honda, -4, C.papel) +
      (t.sub ? `<text x="300" y="288" font-family="Bricolage, sans-serif" font-weight="800" font-size="${Math.min(26, 1040 / Math.max(10, t.sub.length))}" text-anchor="middle" fill="${C.honda}">${esc(t.sub)}</text>` : '');
  },
  fabrica(t) {
    let ventanas = '';
    for (let i = 0; i < 6; i++) ventanas += `<rect x="${110 + i * 62}" y="200" width="34" height="40" rx="3" fill="${C.amarillo}" opacity="${i % 2 ? .9 : .5}"/>`;
    return fondo('#2e3d55', `<circle cx="80" cy="60" r="34" fill="${C.papel}" opacity=".9"/>`) +
      `<path d="M60 340 V170 L140 120 V170 L220 120 V170 L300 120 V170 L380 120 V170 L460 120 V340Z" fill="#1d2738"/>` +
      `<rect x="500" y="150" width="34" height="190" fill="#1d2738"/><circle cx="517" cy="132" r="16" fill="#c9cfc9" opacity=".35"/><circle cx="538" cy="112" r="20" fill="#c9cfc9" opacity=".25"/>` + ventanas +
      rotulo(t.texto || '', 300, 82, Math.min(46, 700 / Math.max(6, (t.texto || '').length)), C.amarillo, -3) +
      (t.sub ? `<text x="300" y="300" font-family="Bricolage, sans-serif" font-weight="800" font-size="24" text-anchor="middle" fill="${C.papel}">${esc(t.sub)}</text>` : '');
  },
  libro(t) {
    return fondo(C.suave, puntos(C.pizarra)) +
      `<path d="M300 300 Q200 270 90 285 V75 Q200 60 300 95 Q400 60 510 75 V285 Q400 270 300 300Z" fill="${C.papel}" stroke="${C.honda}" stroke-width="4"/><path d="M300 95 V300" stroke="${C.honda}" stroke-width="3"/>` +
      `<g stroke="#cfd8cb" stroke-width="5" stroke-linecap="round"><path d="M120 130h140M120 160h120M120 190h140M120 220h100M340 130h140M340 160h120M340 190h140M340 220h90"/></g>` +
      rotulo(t.texto || '', 300, 60, Math.min(44, 700 / Math.max(6, (t.texto || '').length)), C.pizarra, -2, C.amarillo);
  },
  atril(t) {
    return fondo(C.honda, puntos(C.amarillo, 0.08)) + `<path d="M180 340 L250 40 H350 L420 340Z" fill="${C.amarillo}" opacity=".12"/>` +
      `<rect x="245" y="200" width="110" height="140" rx="6" fill="#7d5a3c"/><rect x="225" y="186" width="150" height="24" rx="4" fill="#5a3c27"/>` +
      `<path d="M300 186 V150" stroke="#cfcfcf" stroke-width="5"/><rect x="290" y="128" width="20" height="30" rx="10" fill="#3b3b3b"/>` +
      rotulo(t.texto || '', 300, 92, Math.min(42, 760 / Math.max(6, (t.texto || '').length)), C.papel, -2, C.pizarra) +
      (t.sub ? `<text x="300" y="276" font-family="Bricolage, sans-serif" font-weight="800" font-size="22" text-anchor="middle" fill="${C.papel}">${esc(t.sub)}</text>` : '');
  },
  calendario(t) {
    return fondo(C.margen, puntos(C.papel, 0.15)) +
      `<g transform="rotate(-4 300 170)"><rect x="180" y="50" width="240" height="250" rx="16" fill="${C.papel}" stroke="${C.honda}" stroke-width="4"/><rect x="180" y="50" width="240" height="60" rx="16" fill="${C.honda}"/><rect x="180" y="90" width="240" height="20" fill="${C.honda}"/>
       <text x="300" y="92" font-family="Bricolage, sans-serif" font-weight="800" font-size="28" text-anchor="middle" fill="${C.papel}">${esc(t.sub || '')}</text>
       <text x="300" y="250" font-family="Marker, sans-serif" font-size="${Math.min(120, 480 / Math.max(2, String(t.texto || '').length))}" text-anchor="middle" fill="${C.pizarra}">${esc(t.texto || '')}</text></g>`;
  },
};

export function ilustracion(tema = 'multitud', datos = {}) {
  const f = TEMAS[tema] || TEMAS.multitud;
  return `<svg class="ilustracion" viewBox="0 0 600 340" role="img" aria-label="${esc(datos.alt || datos.texto || '')}" xmlns="http://www.w3.org/2000/svg">${f(datos)}</svg>`;
}
export const TEMAS_DISPONIBLES = Object.keys(TEMAS);
