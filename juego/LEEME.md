# «Llegar a todos», el juego de la huelga educativa

Es un juego para móvil en vertical, de unos 5 minutos y con un solo dedo. Está en `https://asambleaceipperu.github.io/juego/`. Es estático: HTML, CSS y JavaScript (módulos ES con Canvas 2D), sin librerías ni paso de compilación. Para publicarlo basta con subir la carpeta.

## Cómo es una partida

| Escena | Qué pasa | Qué cuenta de la huelga |
|---|---|---|
| Portada | Eliges profe. | — |
| Aula · lunes 13-O | **Traza el recorrido**: con el dedo dibujas en tiza el camino de tu profe y, al soltar, lo recorre ayudando a cada mano levantada por la que pasa. Encadenar manos da combo. La tiza es tu tiempo: sin horas para preparar, se acaba enseguida. Eventos: formularios de Raíces, reparto de alumnado y ola de calor. | Cómo es hoy: «no llego». |
| Sala de profes | 5 frases con voces «balbuceo» y objetos tocables (el tupper de 2019, la fotocopiadora, Raíces…). Se puede saltar. | Horas lectivas, rotación de plantilla y «inasumible». |
| Mani · 14-O | Corredor en perspectiva detrás de la multitud. Puertas que suman o multiplican, «día sin sueldo» (se baja gente salvo que hayas pasado por la caja de resistencia), obras que estrechan la calle y, en cada glorieta, dos pancartas: solo cabe una. | Que la huelga es colectiva y para qué sirve la caja. Organización frente a Comunidad. |
| Aula · «¿Y si…?» | La misma clase con las 2 reivindicaciones elegidas. | Cada reivindicación cambia el juego de forma visible. |
| Sala de profes | Reacciones según lo que elegiste. | — |
| Mani · 22-O | Al atardecer, Cibeles y Alcalá hasta la Consejería. Momento rítmico: «Zarzalejo, reúnete ya» y «Educación pública y de calidad». | Que la Consejería no negocia. |
| La clase que queremos | Las 4 reivindicaciones a la vez. | — |
| Final | «Hoy, esto todavía no ha pasado». La gente forma el corro del logo, salen los enlaces (tienda, caja, movilizaciones y queja) y la tarjeta 9:16 para compartir, con un enlace de reto. | Qué puedes hacer. |

Cómo se ve cada reivindicación al jugar (en `js/aula.js`, objeto `cfg`):

- **Ratios**: 25 o 15 pupitres, con pasillos más anchos.
- **Horas lectivas**: con ellas, la barra de tiza es casi el doble de larga, se recarga antes y la profe corre más. Sin ellas, se cansa y bosteza.
- **Burocracia**: los papeles se apilan en la mesa. Para despacharlos, el trazo tiene que acabar en ella; si no, el montón se cae y los folios del suelo frenan. Con la reivindicación, alguien de administración se los lleva.
- **Apoyos**: Amina (recién llegada) y Leo (tablero de pictogramas) necesitan que el trazo **acabe** en su pupitre y que la profe se quede. Con la reivindicación, entra una profe de apoyo.
- **Infraestructuras**: barracón de chapa con uralita, calor que adormece y obras «por fases» por la ventana. Con la reivindicación, aula fresca.
- **Sueldo**: los equipos no se quedan. A media clase te reparten 3 de otra clase, y en la sala de profes hay una silla vacía. Con la reivindicación no pasa.

## El reto

La tarjeta y el texto para compartir llevan un enlace con tu marca (`?reto=llegados-total-personas`). Quien lo abre ve en la portada «Te retan: 21 de 28…» y, al acabar, su tarjeta dice si lo ha superado.

## Dónde se cambia cada cosa

- **Textos y cifras**: `js/datos.js`. Ahí están las 6 reivindicaciones (lema de la pancarta, dato y frases), el guion de la sala de profes, los huevos de pascua, los enlaces finales y el texto para compartir.
- **Cifras de la situación actual pendientes de confirmar** (están en `ACTUAL`, dentro de `js/datos.js`):
  - 25 periodos lectivos en Primaria y 19 en Secundaria (prensa, 22-10-2026);
  - el 7,9 % de seguimiento que dio la Comunidad, que se usa en el chiste «según la Comunidad».
- Dificultad del aula: `js/aula.js`: `TIZA_MAX`, `RECARGA`, `VEL`, las oleadas de `levantarManos` y la paciencia de cada mano.
- Recorrido de la mani: `js/mani.js`, al principio (puertas, muros de «día sin sueldo», obras, glorietas y grupos).

## Música: cómo meter la grabación del cántico

Ahora suena una versión chiptune provisional de «Educación pública y de calidad» y de «Zarzalejo, reúnete ya», definida como notas en `js/cantico.js`. Hay dos maneras de cambiarla:

1. **Con la grabación.**
   - Guardad el audio en `audio/` (por ejemplo, `audio/cantico.mp3`) y poned el nombre del archivo en `archivo`, dentro de `js/cantico.js`. Desde ese momento, el juego lo usa en la mani y en el final.
   - Grabad las frases en este orden: «educación pública y de calidad» dos veces y «Zarzalejo, reúnete ya» dos veces.
   - Usad un tempo constante. Poned ese tempo en `bpm` dentro de `js/cantico.js` y, en `inicio`, los segundos de silencio que haya antes de la primera sílaba.
   - Cada frase dura dos compases de 4/4. Las sílabas fuertes (marcadas con `true`) son las que se tocan en el momento rítmico.
2. **Con notas.** Cambiad las notas de `js/cantico.js` (`'G4'`, `'A4'`…; cada número es una duración en corcheas).

## Pruebas

- `?debug` muestra los fps y activa los bots de pruebas. Tocar la barra de arriba del aula acaba la clase.
- `?baja` fuerza la calidad gráfica reducida (el juego la activa solo si el móvil va lento).
- `?escena=aula&dia=1&elegidas=ratios,horas&debug` salta a una escena. También vale `escena=` con `portada`, `sala&n=2`, `mani&n=1`, `mani&n=2` y `final`.
- `herramientas/imagen-compartir.html` dibuja la imagen `compartir-juego.png` (1200×630) que se ve al compartir el enlace. Abridla en el navegador y haced una captura de 1200×630.

## Créditos y licencias

- Tipografías: Bricolage Grotesque y Atkinson Hyperlegible Next (las de la web) y Permanent Marker (Apache 2.0, en `fuentes/`).
- El código y los dibujos son de la Asamblea Docente del CEIP Perú.
