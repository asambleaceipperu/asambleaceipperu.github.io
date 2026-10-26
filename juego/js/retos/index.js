// Catálogo de tipos de reto: nombre, frase de presentación y módulo.
import * as palabra from './palabra.js';
import * as conexiones from './conexiones.js';
import * as cronologia from './cronologia.js';
import * as emojis from './emojis.js';
import * as cuantos from './cuantos.js';
import * as frase from './frase.js';

export const TIPOS = {
  palabra: { nombre: 'La palabra', lema: 'Seis intentos para dar con ella', emoji: '🔤', modulo: palabra },
  conexiones: { nombre: 'Conexiones', lema: 'Cuatro grupos escondidos en dieciséis fichas', emoji: '🧩', modulo: conexiones },
  cronologia: { nombre: 'Cronología', lema: 'Pon la historia en orden', emoji: '⏳', modulo: cronologia },
  emojis: { nombre: 'Cartelera', lema: 'Cuatro películas en emojis. ¿Cuál es cuál?', emoji: '🎬', modulo: emojis },
  cuantos: { nombre: '¿Cuántos?', lema: 'Una cifra, seis intentos, pistas de más o menos', emoji: '🔢', modulo: cuantos },
  frase: { nombre: 'La frase', lema: 'Completa unas palabras que hicieron historia', emoji: '🗣️', modulo: frase },
};
