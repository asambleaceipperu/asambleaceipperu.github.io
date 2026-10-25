# Seguimos · el reto diario de la huelga

Cada día de huelga hay un reto distinto en <https://asambleaceipperu.github.io/seguimos/>. El contador cuenta los días naturales desde el 14 de octubre de 2026 (Día 1) con la hora de Madrid. El reto cambia a medianoche. Nadie sabe qué tipo de reto toca hasta que da la vuelta a la carta. Al resolverlo, sale «Lo que hay detrás»: dos párrafos con una historia, un dato o una reivindicación, con su fuente.

No hay servidor ni cuentas. Lo jugado, la racha y el progreso se guardan en el navegador de cada persona (`localStorage`). Lo que se comparte es solo el resultado en cuadraditos, sin la solución.

## Dónde está cada cosa

| Archivo | Qué es |
| --- | --- |
| `js/contenido.js` | **Los retos**, uno por día, en orden. Es lo que la asamblea toca. |
| `js/avisos.js` | La línea «Hoy, en la huelga» que sale al terminar: avisos por fecha y cinco fijos que rotan. |
| `revision.html` | Página sin enlazar para revisar todos los retos con sus soluciones y fuentes. |
| `js/retos/*.js` | Los seis tipos de reto. |
| `js/tarjeta.js` | La imagen que se comparte al terminar. |
| `js/ilustraciones.js` | Los dibujos de «Lo que hay detrás». |
| `compartir-seguimos.png` | La imagen que sale al pegar el enlace en WhatsApp. |

## Añadir días

`DIAS[0]` es el Día 1, `DIAS[1]` el Día 2 y así sucesivamente. Para el Día 61, se añade un elemento más al final de la lista. Si un día no tiene reto, la página dice «La asamblea está preparando el reto de hoy» y deja jugar los anteriores, así que conviene ir **al menos una semana por delante**.

Cada día lleva:

```js
{
  tipo: 'palabra',                    // uno de los seis tipos (abajo)
  titulo: 'Opcional, encima del reto',
  datos: { palabra: 'ASAMBLEA' },     // depende del tipo
  detras: {
    tema: 'multitud', ilus: { texto: 'DÍA 61' },
    titulo: 'Título de «Lo que hay detrás»',
    texto: ['Primer párrafo.', 'Segundo párrafo.'],
    fuente: { nombre: 'Por qué hacemos huelga', url: '../huelga.html' },
  },
},
```

### Los seis tipos

- **palabra** (tipo Wordle, 6 intentos): `{ palabra: 'TIZA', pista: 'opcional' }`. Entre 4 y 8 letras. La Ñ vale y las tildes se ignoran.
- **conexiones** (16 fichas, 4 grupos, 4 fallos): `{ grupos: [{ nombre, fichas: [4 textos], explica }, ×4] }`, ordenados del más fácil al más difícil. La `explica` de cada grupo sale al acertarlo. Funciona mejor con trampas: fichas que parezcan de un grupo y sean de otro, pero con una sola solución posible. Evita los grupos que se ven a la legua, como cuatro números. Las fichas tienen que ser cortas (hasta 14 letras) y no pueden repetirse.
- **cronologia** (ordenar 5 momentos, 3 intentos): `{ enunciado?, momentos: [{ texto, anio, explica }] }`, ya en el orden correcto (la página los desordena). Al terminar se ve el año y la explicación de cada momento.
- **emojis**, la «Cartelera» (emparejar 4 películas o canciones con su título, 3 intentos): `{ enunciado?, items: [{ emojis, alt, titulo, detalle, explica }, ×4], distractores: [2 títulos] }`. Los títulos tienen que ser los del estreno en España (compruébalo en FilmAffinity España).
- **cuantos** (adivinar una cifra; se dice «es más» o «es menos» y entre qué cifras está, 6 intentos): `{ pregunta, cifra, unidad?, maximo? }`. La cifra tiene que ser exacta y tener una fuente clara.
- **frase** (completar una cita, 4 intentos con pistas de colores): `{ texto: 'La educación es el [arma] más [poderosa]…', distractores: ['palabras', 'que', 'sobran'], autor }`. Lo que va entre corchetes son los huecos. Usa solo citas comprobadas; si la autoría está en duda, pon «atribuida a».

### Las ilustraciones

En `tema` puede ir `multitud` (pancarta: `{ texto }`), `cine` (`{ texto, anio }`), `aula` (pizarra: `{ texto, sub? }`), `cifra` (`{ texto, sub? }`), `fabrica` (`{ texto, sub? }`), `libro` (`{ texto }`), `atril` (`{ texto }`) o `calendario` (`{ texto }`). Los textos se ajustan de tamaño solos, pero mejor si son cortos.

## Avisos del día

En `js/avisos.js`, se añade una línea por fecha:

```js
'2026-11-05': { texto: 'Concentración en Sol a las 12:00.', enlace: '../actualidad.html', etiqueta: 'Ver la convocatoria' },
```

Los días sin aviso sale uno de los cinco fijos (caja, tienda, queja, convocatorias o reivindicaciones).

## Probar antes de publicar

Desde la carpeta raíz del repositorio:

```sh
python3 -m http.server 8000
```

- <http://localhost:8000/seguimos/?hoy=40> simula que hoy es el Día 40.
- <http://localhost:8000/seguimos/revision.html> muestra todos los retos con sus soluciones.
- Para empezar de cero en el navegador, borra los datos del sitio, o ejecuta en la consola `localStorage.removeItem('seguimos-v1')`.

## Criterios de contenido

- Los datos de la huelga salen de la web (`huelga.html`, `caja-resistencia.html`, `actualidad.html`), no de memoria.
- Cada «Lo que hay detrás» lleva una fuente que se pueda abrir.
- Hay que alternar los tipos para que nadie sepa qué toca, y mezclar temas: la huelga y sus reivindicaciones, la historia de la escuela pública, huelgas que se ganaron, cine, canciones, discursos y la vida en el cole.
- El alumnado nunca es el problema: el problema son las condiciones.
- En las películas y los discursos, solo el título, el autor y citas muy breves.
