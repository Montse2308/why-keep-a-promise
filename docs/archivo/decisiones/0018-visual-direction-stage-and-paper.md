# 0018 · Dirección visual: escenario y papel

> **Archivada (P0).** Reemplazada por el ADR 0022 (dirección de arte Papel). Se conserva como
> registro; no rige. Sus referencias a otros ADR y a rutas del repo son de su momento.

**Estado:** aceptada (R0). Reemplaza al ADR 0014.

## Contexto

Montse vio la página terminada y la rechazó por verse como un ensayo quieto. La causa principal es
el ADR 0014: su nombre era "ensayo de investigación" y todo su sistema estaba hecho para leer
(papel cálido, filetes, sin sombras, movimiento de 250 ms como máximo). La mesa quedaba como un
recuadro dentro de un texto. Un portafolio necesita una primera pantalla que se recuerde sin dejar
de ser accesible.

Este ADR reemplaza entero al 0014. Lo que el 0014 tenía y se conserva está escrito otra vez aquí,
para que el sistema visual viva en un solo documento.

## Decisión

### Dos superficies, un sistema

- **Escenario:** la escena del acto 1 (ADR 0020) y las dos mesas, la del acto 1 y la del momento 2
  en el acto 4. Si una subpágina llegara a mostrar la mesa, esa mesa también va sobre el escenario.
  El escenario es **siempre oscuro**, en tema claro y en tema oscuro, con un foco de luz sobre la
  mesa (degradado radial de CSS).
- **Papel:** todo lo demás. Los actos, «La investigación», «Quién es», el footer y la prosa de las
  subpáginas. También la mejor respuesta de `/dilemma` (la regla (g) dice que no es la mesa), la
  tabla de `/vanberg`, la curva del acto 5 y la gráfica de culpa de `/finding`.
- En tema claro, el papel es claro y el corte con el escenario se nota solo. En tema oscuro, la
  lectura usa una tinta cálida y el escenario es **más profundo** que esa tinta; si no, el corte
  desaparece.
- Dos superficies del mismo sistema no son un "segundo estilo visual": el ADR 0004 sigue como está.

### Tipografía

- **La serif es lo que se lee; la sans es lo que se toca.** Prosa y titulares en Newsreader
  variable (`wght`, `opsz`, con itálica) con `font-optical-sizing: auto`. La mesa, la interfaz, el
  footer, las etiquetas y los números en Inter variable (`wght`, `opsz`). Todo número de la mesa
  lleva `font-variant-numeric: tabular-nums`.
- **La pregunta del hero** va en Newsreader itálica, a tamaño display y en peso alto. En un peso
  fino, sobre el escenario oscuro, se ve débil.
- **El sello del manuscrito** va en Inter, en mayúsculas, con tracking amplio y borde doble, para
  que se lea como estampa.
- **JetBrains Mono** sigue solo en los bloques de código de `/how-its-built`, sin precarga
  (ADR 0017). No se carga en la página de inicio: pesaría 55 600 bytes en la portada y el sello
  aparecería primero en la fuente de respaldo.
- **Autoalojadas con la API de fuentes de Astro**, proveedor `local`. Los `woff2` viven en
  `src/assets/fonts/`, copiados sin cambios de `@fontsource-variable/newsreader@5.3.0`,
  `@fontsource-variable/inter@5.3.0` y `@fontsource-variable/jetbrains-mono@5.3.0`, con su licencia
  OFL y su procedencia en `src/assets/fonts/README.md`. Esos paquetes no son dependencias del
  proyecto. El build no depende de la red.
- Subsets `latin` y `latin-ext` con su `unicode-range`, `font-display: swap`, fallbacks métricos
  generados por Astro y precarga solo del archivo de texto: Newsreader normal, `latin`.
- **Escala fluida** con `clamp()` entre 360 px y 1280 px: texto base de 1.125 a 1.25 rem y razón
  de 1.2 a 1.25. La escala crece hasta `--step-7`, que es el tamaño de la pregunta del hero. La
  prosa va a 66 `ch`.

### Superficie, profundidad y layout

- **Volumen en los objetos, no en el texto.** El dado, los globos, los rombos, las fichas de pago
  y los asientos llevan sombra suave, volumen y radios de hasta 12 px. La prosa no lleva sombras
  ni cajas. Los controles conservan radios de 3 y 6 px.
- El escenario ocupa todo el ancho. La prosa sigue en una columna centrada; la mesa llega hasta
  56 rem.
- «La investigación» tiene una composición propia, más ancha que la columna de prosa: la pregunta
  grande de un lado y el motor del otro, en una sola columna a 360 px. Es del mismo sistema.
- Mobile-first: todo funciona a 360 px, y cada objetivo táctil mide 44 px o más.
- Los enlaces van en el color del texto, con subrayado fino. El azul queda reservado para el rol
  "tú".
- Favicon SVG propio: una cara de dado con un punto circular (tú) y uno cuadrado (el otro), en los
  colores de rol, sin letras.

### Color

- Fuente única de los valores: `src/lib/design/palette.ts`. `src/styles/tokens.css` lleva
  exactamente esos valores, y un test lo comprueba.
- Tokens semánticos de rol: `--color-you` (azul), `--color-other` (terracota) y `--color-promise`
  (un acento distinto de los dos roles). No hay rojo/verde.
- **El color nunca va solo.** Cada rol lleva etiqueta de texto y forma: círculo para "tú",
  cuadrado para "el otro"; la promesa lleva un rombo y su texto.
- **A, B y C, en la escena, van en tinta neutra**, sin los colores ni las formas de rol. Se
  distinguen por posición y por etiqueta (ADR 0020). El azul y el círculo aparecen cuando el
  visitante decide.
- **Más saturación, si los tests lo permiten.** Los colores de rol suben de saturación para el
  escenario. La promesa se distingue por luminosidad: clara sobre el escenario, oscura sobre
  papel. Si solo con la luminosidad no pasa los tests de daltonismo, recupera un tono. El test
  manda.
- Contraste mínimo: 4.5:1 para texto y 3:1 para gráficos e interfaz. Un test calcula el contraste
  WCAG de cada par que usa la página, en claro, en oscuro y **sobre el escenario**. Los filetes
  (`--color-border`) son decorativos y nunca son el único borde de un control; los controles usan
  `--color-control`.
- Un test simula protanopia y deuteranopia (Machado et al., 2009) y exige ΔE\*ab ≥ 40 entre los
  dos roles y ≥ 20 entre la promesa y cada rol, también sobre el escenario.
- Las series de la curva (`series-1` … `series-3`, F3) siguen como están, sobre papel.

### Movimiento

- Solo se animan `transform`, `opacity` y `clip-path`. Este último sirve para que la promesa se
  escriba.
- **La escena va atada al scroll**, sin duración propia (ADR 0020). El dado gira con el scroll, no
  con un reloj, así que al subir la página no se desfasa. Los 900 ms son solo el tope del giro
  cuando el scroll cruza ese golpe de prisa.
- Las transiciones que no dependen del scroll duran 600 ms como máximo.
- Con `prefers-reduced-motion: reduce`, todo cambio es instantáneo y la escena se ve en su versión
  quieta (ADR 0020).
- Ninguna animación transmite información por sí sola: el dado, el medidor, cada resultado y cada
  golpe de la escena también se muestran como texto. Los resultados de la mesa se anuncian en
  `aria-live`.

## Consecuencias

- Cambiar un color es editar `palette.ts` y `tokens.css` a la vez. Si no coinciden, o si un par
  pierde contraste o distancia de daltonismo en papel o sobre el escenario, los tests fallan.
- Los tests de contraste y de daltonismo suman los pares del escenario.
- Desaparece la franja fija y, con ella, su regla de dos filas por debajo de 40 rem (ADR 0019).
- Actualizar una fuente es copiar el `woff2` nuevo con su procedencia en
  `src/assets/fonts/README.md`.
- Se construye en R1 (`docs/phases.md`).
