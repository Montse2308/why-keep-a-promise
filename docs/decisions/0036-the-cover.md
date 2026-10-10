# 0036 · La portada del home: el mapa de la página

**Estado:** aceptada (P8, paso 8.5). Precisa el ADR 0021 (qué abre el home, dónde va la pregunta y
cómo se llama la página ante quien la lee) y el ADR 0024 (una entrada más al cuaderno). Decisiones de
Montse en el paso 8.4 y al revisar el 8.5.
Enmendado por el ADR 0040: con el candado abierto, la puerta de la investigación también enlaza a
`/finding`.

## Contexto

Desde P1 el home entraba directo a la película: la primera pantalla era el capítulo 0, con la
pregunta arriba, el círculo y el cuadrado en la mesa y la tarjeta con los dos boletos. Antes de
publicar, Montse dudó si hacía falta un hero que dijera, desde que se entra, qué es la página.

En el paso 8.4 vio cinco maquetas en `scratch/p8/hero/`, con la película real debajo:

- **A:** una portada con el cielo del amanecer.
- **B:** una más atrevida, con la noche y el elenco asomándose.
- **C:** la película como estaba, con un subtítulo.
- **D y E:** «el mapa», con el fondo de A y de B.

Descartó C porque no decía bastante. Pidió dos cosas:

- **No llamar «película» a la página:** se lee y se juega, y avanza al ritmo de quien baja.
- **Que la portada diga todo lo que es la página:** sobre todo una historia, pero también la
  investigación y la profundidad del cuaderno.

Eligió **D**: el mapa sobre el amanecer.

## Decisión

### Qué abre el home

- **Antes del capítulo 0 va una portada** a pantalla completa (`src/components/Hero.astro`). Después
  sigue la película, sin cambios en sus nueve capítulos.
- **La portada lleva el título visible**, que sigue siendo la pregunta: «Why keep a promise that no
  longer pays?» / «¿Por qué cumplir una promesa que ya no conviene?». Es el único `h1` del home.
- **Debajo, una línea:**

  | EN | ES |
  | -- | -- |
  | An illustrated story about this question, and the research that grew out of it. | Una historia ilustrada sobre esta pregunta, y la investigación que salió de ella. |

- **Y tres puertas, una por cada parte de la página**, en este orden (`src/lib/hero.ts`):

  | Puerta | EN | ES | Lleva a |
  | ------ | -- | -- | ------- |
  | La historia | From the prisoner’s dilemma to Vanberg’s experiment (2008), playing along the way. | Del dilema del prisionero al experimento de Vanberg (2008), jugando por el camino. | «Start ↓» / «Empezar ↓»: el capítulo 0 |
  | La investigación | The question of my research, and the simulation engine I built in TypeScript to work on it. | La pregunta de mi investigación, y el motor de simulación que construí en TypeScript para trabajarla. | «Go to chapter 7» / «Ir al capítulo 7»: el capítulo 7 |
  | El cuaderno | In depth: the dilemma, Vanberg’s experiment, how this page is built, and every source. | A fondo: el dilema, el experimento de Vanberg, cómo está hecha la página y cada fuente. | Las cinco páginas del cuaderno, sin `/finding` |

- **«Historia», no «película»** (en inglés, «story», no «film»), en todo lo que el visitante lee:
  la portada, las claves de interfaz, la prosa de los capítulos y del cuaderno, y los README. Un
  test lo comprueba (`tests/story-name.test.ts`).

### Lo que dice de la investigación

- **La puerta de la investigación dice lo mismo que la parte abierta del capítulo 7 (regla (j)):** la
  pregunta, como la de la investigación de Montse, y que ella construyó un motor de simulación en
  TypeScript. Nada del hallazgo, ni de los tests, la semilla o la procedencia del motor.
- **No lleva la frase de estado.** La regla (b) la quiere exactamente dos veces en el home: el sello
  del capítulo 7 y la entrada del cuaderno.
- **Es igual en los dos estados del candado.** Lleva al capítulo 7, que los dos estados muestran, y
  no a `/finding`. Los enlaces del cuaderno son los mismos cinco en los dos estados.
- **«Mi investigación» va sin nombre**, en la primera persona en la que ya habla la página. El
  nombre de la autora sigue donde lo pone el ADR 0021: el capítulo 7, los créditos y los pósteres.
- **El costo, aceptado:** el capítulo 7, «Aquí entro yo», deja de ser sorpresa, porque la portada ya
  anuncia que llega una investigación.

### Cómo se ve

- **El cielo del amanecer de la película**, con su sol y dos de sus nubes, y las tres puertas como
  tarjetas de papel. No hay elenco: el círculo y el cuadrado aparecen en la mesa del capítulo 0, y el
  escenario sigue siendo uno solo (ADR 0027).
- **Sin corte de color:**
  - El cielo de la portada empieza en el `sky-top` del amanecer (`LIGHT_POINTS`).
  - Termina en el color con que empieza el escenario, calculado del mismo degradado que pinta el
    mundo (`dawnSkyAt`, `SKY`).
  - Un test comprueba que empata a menos de 1 ΔE\*ab en computadora, celular y de lado.
- **La portada es una hoja de papel sobre el escenario:** su borde proyecta una sombra cuando el
  escenario sube, así que el borde se lee como papel sobre papel y no como un corte.
- **El título en español cabe en dos renglones en computadora**, como pidió el paso 8.1 para el
  título del capítulo 0: una regla `:lang(es)`, más chica y más ancha.
- **En el celular** las puertas van una bajo otra y la portada mide más de una pantalla. **De lado
  (ADR 0031)**, el título se ajusta a la pantalla baja y las puertas van en tres columnas.
- **Contraste:** el texto de las puertas va en papel (tinta, 16:1; el gris de las tarjetas, 6.5:1)
  y la línea, en tinta sobre el amanecer. Los objetivos táctiles miden 44 px o más.

### Lo que cambia en la película

- **El capítulo 0 ya no lleva el título.** Conserva un encabezado oculto para el lector de pantalla,
  «Capítulo 0: Llegada», con el formato de los demás capítulos.
- **La cámara del capítulo 0 empieza en la mesa.** Ya no hay plano amplio para el título: el
  círculo, el cuadrado y el dado se ven más grandes desde el primer cuadro, y con movimiento
  reducido el capítulo 0 es un solo plano.
- **La primera tarjeta sube con el escenario.** Mientras la portada ocupa la parte de arriba de la
  pantalla, la tarjeta del capítulo 0 viaja con el escenario (`--lead`, `film.ts`), en vez de
  esperar abajo y tapar al elenco.
- **El botón del sonido ya no espera a que se vaya el título** en el celular: se ve desde el primer
  cuadro de la película.
- **Un enlace a un capítulo cae en su primer cuadro.** Pasa con las puertas y con la vuelta de una
  página del cuaderno: el `scroll-padding` de la página, que sirve para leer, ya no lo deja corto.

### Lo que no cambia

- **El JavaScript.** La portada es HTML y CSS, sin script. Se ve igual sin JS, con el storyboard
  debajo. Sus enlaces son enlaces normales y el scroll sigue siendo el nativo (ADR 0025).
- **La lista de interacciones del ADR 0023.** Las puertas navegan; no son un juego.
- **La memoria de la pestaña (ADR 0029).**
  - Al recargar o volver con Atrás a mitad de la película, el navegador devuelve el scroll al mismo
    punto y la película recuerda lo jugado. La portada queda arriba, fuera de vista.
  - «Ver de nuevo» y «Volver a la película», cuando no hay película en el historial, llevan al home
    sin memoria, como una visita nueva: empiezan en la portada.
- **Los nueve capítulos y su prosa**, la luz del día y el candado (ADR 0034).

### Cómo se leen los ADR 0021 y 0024

- **En el 0021, «el home es una película»** se lee: el home es la portada y, después, la película. En
  la tabla de capítulos, «Arriba está la pregunta» se lee: la pregunta está arriba, en la portada.
  Lo demás del 0021 rige completo, así que no va al archivo: las dos capas, los nueve capítulos, el
  título, el elenco, los dos hilos y la autora.
- **En el 0024**, al cuaderno también se llega desde la portada, además del botón, las lupas y los
  créditos.

### El nombre: «historia», en todo el sitio

Al revisar la portada, Montse decidió que el resto del sitio tampoco diga «película». Cambiaron 10
claves de interfaz en cada idioma y 13 lugares de la prosa (la línea del capítulo 5, `/how-its-built`,
`/sources` y `/vanberg`), y los README. Entre ellos:

- la descripción del home al compartir el enlace;
- «Volver a la historia»;
- el nombre de la sección para el lector de pantalla;
- los textos sin JavaScript de los capítulos 1 y 8;
- el texto alternativo de los pósteres.

Donde la frase ya decía «historia», se reescribió: «Un script lo anima con el scroll; sin
él, la historia completa sigue ahí.»

**Lo que no cambia:** el nombre interno de la capa. En el código (`src/lib/film/`, las claves
`film.*`) y en `docs/`, «la película» sigue nombrando la historia ligada al scroll, como en los ADR
anteriores. Nadie que visita la página lo lee.

## Consecuencias

- **Código nuevo:**
  - `src/lib/hero.ts`, puro y con su test: las puertas, las páginas del cuaderno que enlaza y el
    cielo.
  - `src/components/Hero.astro`.
  - Las claves `hero.*` y `film.arrival.name` en los dos idiomas.
- **Código que cambia:**
  - `stage.ts` pierde `titleGone` y el plano amplio del capítulo 0, y exporta `SKY`.
  - `film.ts` deja de mover el título y mueve la primera tarjeta con el escenario.
- **Pesos:** la primera carga de los dos home sube unos 1.3 KiB. El script baja 41 bytes.
  `src/data/weight.json` está al día; el LCP se mide otra vez en el paso 8.6.
- **Documentos:**
  - La línea de estado de los ADR 0021 y 0024 nombra este ADR.
  - `docs/plan.md` y la regla (j) de `docs/content-rules.md` nombran la portada.
