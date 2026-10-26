// «Seguimos»: un reto distinto cada día de huelga. El contador sale de la fecha de Madrid;
// el reto del día, de contenido.js; lo jugado se guarda en el navegador.
import { diaDeHuelga, fechaDelDia, fechaLarga, msHastaManana, claveFecha } from './calendario.js';
import { estado } from './estado.js';
import { h, azar, avisar, confeti } from './dom.js';
import { TIPOS } from './retos/index.js';
import { DIAS } from './contenido.js';
import { avisoDelDia } from './avisos.js';
import { ilustracion } from './ilustraciones.js';
import { dibujarTarjeta, compartirTarjeta, fraseReto } from './tarjeta.js';

const URL_JUEGO = 'https://asambleaceipperu.github.io/juego/';
const CAMISETA = '<svg viewBox="0 0 48 48" width="44" height="44"><path d="M17 6 6 12l4 10 5-2v22h18V20l5 2 4-10-11-6c-1 4-4 6-7 6s-6-2-7-6Z" fill="#86cd55" stroke="#0f3522" stroke-width="2.5" stroke-linejoin="round"/></svg>';
const params = new URLSearchParams(location.search);
// Para probar: ?hoy=20 simula que hoy es el día 20 de huelga.
const HOY = params.has('hoy') ? +params.get('hoy') : diaDeHuelga();
let limpiar = null;

// ---------- El logo (el corro: ocho lápices hacia el mismo centro) ----------
document.getElementById('corro').innerHTML = Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})" fill="${i % 2 ? '#86cd55' : '#f7f8f3'}"><path d="M-5.5 -26.2V-45q0-2 2-2H3.5q2 0 2 2V-26.2Z"/><path d="M-5.5 -24H5.5L0 -13Z"/></g>`).join('') + '<circle r="7" fill="#86cd55"/>';

// ---------- Contador ----------
function pintaContador(n, animar) {
  const el = document.getElementById('dia-num');
  const sub = document.getElementById('dia-sub');
  const fecha = fechaLarga(fechaDelDia(n));
  if (n === HOY) sub.replaceChildren('de huelga indefinida · ', h('b', {}, fecha));
  else sub.replaceChildren(`${fecha} · `, h('a', { href: '#', onclick: e => { e.preventDefault(); history.replaceState(null, '', location.pathname + location.search); abrir(HOY); } }, 'volver al reto de hoy'));
  if (!animar || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = n; return; }
  // Cuenta desde el día 1 hasta hoy: se ve cuánto lleva la huelga.
  let k = 1;
  const paso = () => { el.textContent = k; el.classList.remove('gira'); void el.offsetWidth; el.classList.add('gira'); if (k < n) { k++; setTimeout(paso, Math.max(40, 420 / n)); } };
  paso();
}

// ---------- Un día ----------
function abrir(n, animar = false) {
  limpiar?.(); limpiar = null;
  const dia = DIAS[n - 1];
  pintaContador(n, animar);
  const zonaReto = document.getElementById('reto');
  const zonaDetras = document.getElementById('detras');
  zonaDetras.hidden = true; zonaDetras.replaceChildren();
  zonaReto.replaceChildren();
  pintaArchivo(n);
  if (n < 1) { zonaReto.append(h('div.zona', {}, h('h2', { id: 'reto-titulo' }, 'La huelga empieza el 14 de octubre'), h('p.enunciado', {}, 'Vuelve ese día para el primer reto.'))); return; }
  if (!dia) {
    zonaReto.append(h('div.zona', {}, h('h2', { id: 'reto-titulo' }, 'La asamblea está preparando el reto de hoy'), h('p.enunciado', {}, 'Mientras tanto, juega los días que te hayas perdido.')));
    return;
  }
  const tipo = TIPOS[dia.tipo];
  const guardado = estado.dia(n);
  const yaVisto = guardado?.resultado || guardado?.progreso;
  const zona = h('div.zona', { hidden: !yaVisto }, h('h2', { id: 'reto-titulo' }, dia.titulo || tipo.nombre));
  const montar = () => {
    zona.hidden = false;
    limpiar = tipo.modulo.montar(zona, dia.datos, {
      semilla: azar(n * 7919 + 13),
      progreso: guardado?.progreso,
      alProgreso: p => estado.guardarProgreso(n, p),
      alTerminar: res => terminar(n, dia, tipo, res, !guardado?.resultado),
    }) || null;
  };
  if (yaVisto) { zonaReto.append(zona); montar(); return; }
  // La carta boca abajo: nadie sabe qué toca hasta tocarla.
  const carta = h('button.carta', { type: 'button', 'aria-label': 'Descubrir el reto de hoy' },
    h('div.carta-in', {},
      h('div.carta-cara.carta-frente', {}, h('div', {}, h('div.interrogacion', { 'aria-hidden': 'true' }, '?'), h('p', {}, n === HOY ? 'Toca para descubrir el reto de hoy' : `Toca para descubrir el reto del día ${n}`))),
      h('div.carta-cara.carta-dorso', {}, h('div', {}, h('div', { style: { fontSize: '44px' }, 'aria-hidden': 'true' }, tipo.emoji), h('div.tipo', {}, tipo.nombre), h('p', {}, tipo.lema)))));
  carta.addEventListener('click', () => {
    if (carta.classList.contains('vuelta')) return;
    carta.classList.add('vuelta');
    estado.guardarProgreso(n, {});
    setTimeout(() => { montar(); zona.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 900);
  }, { once: true });
  zonaReto.append(carta, zona);
}

// ---------- Al terminar: resultado y «Lo que hay detrás» ----------
function terminar(n, dia, tipo, res, nuevo) {
  if (nuevo) estado.guardarDia(n, { ...estado.dia(n), resultado: res.resuelto ? 'resuelto' : 'fallado', emoji: res.emoji, marcador: res.marcador });
  if (nuevo && res.resuelto) confeti();
  const zona = document.getElementById('detras');
  zona.replaceChildren();
  const d = dia.detras;
  const textoCompartir = `Seguimos · Día ${n} de huelga\n${tipo.emoji} ${tipo.nombre}: ${res.marcador}\n${res.emoji}\n${fraseReto(res)} 👉 ${URL_JUEGO}`;
  const miniatura = h('img.tarjeta', { alt: `Tarjeta del día ${n}: ${tipo.nombre}, ${res.marcador}`, width: 1080, height: 1080 });
  let lienzo = null;
  dibujarTarjeta({ dia: n, tipo, res }).then(cv => { lienzo = cv; miniatura.src = cv.toDataURL('image/png'); }).catch(() => miniatura.remove());
  const aviso = avisoDelDia(claveFecha(fechaDelDia(n)), n);
  const racha = estado.racha(HOY);

  zona.append(
    h('div.resultado', {},
      h(`p.sello${res.resuelto ? '' : '.perdido'}`, {}, res.resuelto ? ['¡Conseguido!', '¡Bien!', '¡Eso es!', '¡Hecho!'][n % 4] : 'Esta vez no'),
      res.solucion && !res.resuelto ? h('p', {}, 'La solución: ', h('b', {}, res.solucion)) : null),
    h('article.hoja', {},
      h('div', { html: ilustracion(d.tema, d.ilus) }),
      h('div.hoja-cuerpo', {},
        h('p.etiqueta', {}, 'Lo que hay detrás'),
        h('h2', { id: 'detras-titulo' }, d.titulo),
        ...d.texto.map(p => h('p', {}, p)),
        d.fuente ? h('p.fuente', {}, 'Fuente: ', h('a', { href: d.fuente.url, target: '_blank', rel: 'noopener' }, d.fuente.nombre)) : null)),
    h('aside.hoy', {}, h('b', {}, n === HOY ? 'Hoy, en la huelga' : 'Y hoy, en la huelga'), h('p', {}, aviso.texto, ' ', aviso.enlace ? h('a', { href: aviso.enlace }, aviso.etiqueta || 'Más información') : null)),
    h('a.vistete', { href: '../pedidos.html' },
      h('span', { 'aria-hidden': 'true', html: CAMISETA }),
      h('span', {}, h('b', {}, 'Vístete de huelga'), 'Camisetas, sudaderas y chapas. Todo va a la caja de resistencia.'),
      h('span.flecha', { 'aria-hidden': 'true' }, '→')),
    h('div.zona.compartir', {},
      h('h2', {}, 'Compártelo sin destripar nada'),
      miniatura,
      h('pre.vista-compartir', {}, textoCompartir),
      h('div.botones', {},
        h('button.boton', { type: 'button', onclick: async () => { if (!(lienzo && await compartirTarjeta(lienzo, textoCompartir, `seguimos-dia-${n}.png`))) compartir(textoCompartir); } }, 'Compartir'),
        h('a.boton.amarillo', { href: `https://wa.me/?text=${encodeURIComponent(textoCompartir)}`, target: '_blank', rel: 'noopener' }, 'WhatsApp'),
        h('button.boton.claro', { type: 'button', onclick: () => copiar(textoCompartir) }, 'Copiar')),
      racha > 1 ? h('p.racha', {}, h('b', {}, racha), racha === HOY ? 'días seguidos: ¡no te has perdido ni uno!' : 'días seguidos en huelga con nosotras') : null,
      n === HOY ? cuentaAtras() : null),
    minijuegoDiferido(),
  );
  zona.hidden = false;
  pintaArchivo(n);
  if (nuevo) setTimeout(() => zona.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
}

// El minijuego se carga solo cuando hace falta.
function minijuegoDiferido() {
  const hueco = h('div.mani-hueco');
  import('../mani.js').then(m => hueco.replaceWith(m.minijuego())).catch(() => hueco.remove());
  return hueco;
}

function cuentaAtras() {
  const el = h('p.manana');
  const pinta = () => {
    const ms = msHastaManana();
    const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000), ss = Math.floor((ms % 60000) / 1000);
    el.replaceChildren(h('b', {}, `Día ${HOY + 1} en ${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`), 'Mañana, otro reto. Nadie sabe cuál.');
    if (ms < 1500) setTimeout(() => location.reload(), 2000);
  };
  pinta();
  const t = setInterval(() => { if (!el.isConnected) clearInterval(t); else pinta(); }, 1000);
  return el;
}

async function compartir(texto) {
  try {
    if (navigator.share) await navigator.share({ text: texto });
    else copiar(texto);
  } catch { /* cancelado */ }
}
async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); avisar('Copiado. Pégalo en tu grupo.'); }
  catch { avisar('No se ha podido copiar. Selecciona el texto de arriba.'); }
}

// ---------- Archivo: todos los días ----------
function pintaArchivo(actual) {
  const zona = document.getElementById('archivo');
  const ultimo = Math.max(HOY, 1);
  const total = Math.ceil((ultimo + 3) / 7) * 7;
  const celdas = [];
  for (let n = 1; n <= total; n++) {
    const g = estado.dia(n);
    if (n > HOY) { celdas.push(h('span.futuro', { 'aria-label': `Día ${n}, todavía no` }, n)); continue; }
    const cls = [g?.resultado === 'resuelto' ? 'hecho' : g?.resultado === 'fallado' ? 'fallado' : '', n === HOY ? 'hoy-dia' : '', n === actual ? 'actual' : ''].filter(Boolean).join('.');
    celdas.push(h(`a${cls ? '.' + cls : ''}`, { href: `#dia-${n}`, 'aria-label': `Día ${n}${g?.resultado ? (g.resultado === 'resuelto' ? ', resuelto' : ', no resuelto') : ''}`, 'aria-current': n === actual ? 'true' : null }, n));
  }
  zona.replaceChildren(
    h('h2', { id: 'archivo-titulo' }, 'Todos los días de huelga'),
    h('p', {}, `Has jugado ${estado.jugados()} de ${HOY} días. Puedes jugar los que te perdiste.`),
    h('div.calendario', {}, celdas));
}

// ---------- Navegación ----------
function desdeHash() {
  const m = /^#dia-(\d+)$/.exec(location.hash);
  const n = m ? Math.min(HOY, Math.max(1, +m[1])) : HOY;
  abrir(n);
  if (m) scrollTo({ top: 0, behavior: 'smooth' });
}
addEventListener('hashchange', desdeHash);
document.fonts?.ready.finally(() => {
  const m = /^#dia-(\d+)$/.exec(location.hash);
  if (m) desdeHash(); else abrir(HOY, true);
});
