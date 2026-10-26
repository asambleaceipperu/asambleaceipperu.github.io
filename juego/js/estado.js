// Lo que cada persona ha jugado, guardado solo en su navegador.
const CLAVE = 'seguimos-v1';

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || { dias: {} }; } catch { return { dias: {} }; }
}
let datos = leer();
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin almacenamiento */ } }

export const estado = {
  dia: n => datos.dias[n] || null,
  guardarDia(n, registro) { datos.dias[n] = { ...registro, cuando: Date.now() }; guardar(); },
  // Progreso a medias de un reto (para no perderlo si se cierra la página).
  progreso: n => datos.dias[n]?.progreso || null,
  guardarProgreso(n, progreso) { datos.dias[n] = { ...(datos.dias[n] || {}), progreso }; guardar(); },
  // Racha: días seguidos jugados hasta hoy (o hasta ayer, si hoy aún no has jugado).
  racha(hoy) {
    let n = datos.dias[hoy]?.resultado ? hoy : hoy - 1, r = 0;
    while (n >= 1 && datos.dias[n]?.resultado) { r++; n--; }
    return r;
  },
  jugados: () => Object.values(datos.dias).filter(d => d.resultado).length,
  ganados: () => Object.values(datos.dias).filter(d => d.resultado === 'resuelto').length,
};
