# «Llegar a todos», el juego de la huelga educativa

Es un juego para móvil en vertical, de unos 5 minutos y con un solo dedo. Está en `https://asambleaceipperu.github.io/juego/`. Es estático: HTML, CSS y JavaScript (módulos ES con Canvas 2D), sin librerías ni paso de compilación. Para publicarlo basta con subir la carpeta.

## Cómo es una partida

| Escena | Qué pasa | Qué cuenta de la huelga |
|---|---|---|
| Portada | Eliges profe. | — |
| Aula · lunes 13-O | Arrastras a tu profe hasta las manos levantadas. Hay 25 pupitres, papeles que caen en la mesa, calor en el barracón, ningún hueco en el horario y 3 alumnos repartidos de una clase sin sustituto. | Cómo es hoy: «no llego». |
| Sala de profes | Diálogo corto y objetos tocables (el tupper de 2019, la fotocopiadora, Raíces…). | Datos de horas lectivas y de rotación de plantilla. |
| Mani · 14-O | Guías la cabecera por Atocha y Neptuno. La gente se suma si pasas cerca. En cada glorieta eliges una de dos pancartas. | Que la huelga es colectiva. Cifras de la organización frente a las de la Comunidad. |
| Aula · «¿Y si…?» | La misma clase con las 2 reivindicaciones elegidas. | Cada reivindicación cambia el juego de forma visible. |
| Sala de profes | Reacciones según lo que elegiste. | «Inasumible», según la consejera. |
| Mani · 22-O | Cibeles y Alcalá hasta la Consejería. Termina con un momento rítmico: «Zarzalejo, reúnete ya». | Que la Consejería no negocia. |
| La clase que queremos | Las 4 reivindicaciones a la vez. | — |
| Final | «Hoy, esto todavía no ha pasado». La gente forma el corro del logo, salen los enlaces (tienda, caja, movilizaciones y queja) y la tarjeta para compartir. | Qué puedes hacer. |

Cómo se ve cada reivindicación al jugar (en `js/aula.js`, objeto `cfg`):

- **Ratios**: 25 o 15 pupitres.
- **Horas lectivas**: con ellas la profe tiene energía y material preparado. Sin ellas se cansa, va más lenta y bosteza.
- **Burocracia**: los papeles se apilan en la mesa y, si no los despachas, se caen al suelo y frenan. Con la reivindicación, entra alguien de administración y se los lleva.
- **Apoyos**: dos alumnos necesitan más tiempo (una recién llegada y un niño con tablero de pictogramas). Con la reivindicación entra una profe de apoyo.
- **Infraestructuras**: barracón de chapa, calor que adormece y obras «por fases» por la ventana. Con la reivindicación, aula fresca y sin uralita.
- **Sueldo**: los equipos no se quedan; a media clase llegan 3 alumnos repartidos y en la sala de profes hay una silla vacía. Con la reivindicación no hay reparto y Laura vuelve.

## Dónde se cambia cada cosa

- **Textos y cifras**: `js/datos.js`. Ahí están las 6 reivindicaciones (lema de la pancarta, dato y frases), el guion de la sala de profes, los huevos de pascua, los enlaces finales y el texto para compartir.
- **Cifras de la situación actual pendientes de confirmar** (están en `ACTUAL`, dentro de `js/datos.js`):
  - 25 periodos lectivos en Primaria y 19 en Secundaria (prensa, 22-10-2026);
  - el 7,9 % de seguimiento que dio la Comunidad, que se usa en el chiste «según la Comunidad».
- Dificultad del aula: `js/aula.js`, funciones `tasaMano` y `levantarManos` y los tiempos de ayuda.
- Ruta y grupos de la mani: `js/mani.js`, al principio (los tramos).

## Música: cómo meter la grabación del cántico

Ahora suena una versión chiptune provisional de «Educación pública y de calidad» y de «Zarzalejo, reúnete ya», definida como notas en `js/cantico.js`. Hay dos maneras de cambiarla:

1. **Con la grabación.**
   - Guardad el audio en `audio/` (por ejemplo, `audio/cantico.mp3`) y poned el nombre del archivo en `archivo`, dentro de `js/cantico.js`. Desde ese momento, el juego lo usa en la mani y en el final.
   - Grabad las frases en este orden: «educación pública y de calidad» dos veces y «Zarzalejo, reúnete ya» dos veces.
   - Usad un tempo constante. Poned ese tempo en `bpm` dentro de `js/cantico.js` y, en `inicio`, los segundos de silencio que haya antes de la primera sílaba.
   - Cada frase dura dos compases de 4/4. Las sílabas fuertes (marcadas con `true`) son las que se tocan en el momento rítmico.
2. **Con notas.** Cambiad las notas de `js/cantico.js` (`'G4'`, `'A4'`…; cada número es una duración en corcheas).

## Pruebas

- `?debug` muestra los fps y activa el bot de pruebas. Tocar la barra de arriba del aula acaba la clase.
- `?escena=aula&dia=1&elegidas=ratios,horas&debug` salta a una escena. También vale `escena=` con `portada`, `sala&n=2`, `mani&n=1`, `mani&n=2` y `final`.
- `herramientas/imagen-compartir.html` dibuja la imagen `compartir-juego.png` (1200×630) que se ve al compartir el enlace. Abridla en el navegador y haced una captura de 1200×630.

## Créditos y licencias

- Tipografías: Bricolage Grotesque y Atkinson Hyperlegible Next (las de la web) y Permanent Marker (Apache 2.0, en `fuentes/`).
- El código y los dibujos son de la Asamblea Docente del CEIP Perú.
