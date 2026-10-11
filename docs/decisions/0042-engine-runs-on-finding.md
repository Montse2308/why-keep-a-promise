# 0042 · El motor corre en `/finding`

**Estado:** aceptada (P10, paso 10.1). Enmienda el ADR 0001 (la página no es un simulador), la regla
(d) de `docs/content-rules.md` (no se visualizan poblaciones ni dinámicas), la lista de interacciones
del ADR 0023 y la lista de scripts y los presupuestos del ADR 0025 (con las unidades del ADR 0028).
Precisa la regla de los parámetros del ADR 0039. Decisión de Montse (2026-10-10 y 2026-10-11), con
maquetas y con los textos que ella aprobó el 11-oct, en inglés y en español.

## Contexto

`/finding` dice que la culpa personal gana mucho en el medio de la confianza de fondo y poco en los
extremos, y que el compromiso específico a la pareja gana igual en todas partes (ADR 0037). Lo que no
muestra es qué pasa cuando las dos razones **compiten dentro de una población**: si la que gana más
se queda, y qué pasa donde las dos ganan lo mismo.

El motor de simulación del paper responde eso, y es público, con su release archivada. Mostrarlo
corriendo, en los mismos tres mundos de las tarjetas y con las semillas del paper, enseña que el
resultado sale del motor y no de una figura hecha a mano. Cuatro reglas lo impedían:

- el ADR 0001: la página «no es un simulador» y «no expone el motor»;
- la regla (d) y el ADR 0023: no se visualizan poblaciones ni dinámicas;
- el ADR 0023: las interacciones son «estas y solo estas»;
- el ADR 0025: la lista cerrada de scripts y sus techos de peso.

El código del motor en la página lo decide el ADR 0043, que enmienda el ADR 0010.

## Decisión

### La sección «When the reasons compete» / «Cuando las razones compiten»

Una sección de `/finding`, después de «Lo que gana cada razón» y antes de «Para quien quiera la
cuenta», detrás del candado (ADR 0034), como toda la página. Lleva:

1. **Una entrada en prosa**, en el Markdown: lo que la figura de arriba muestra y lo que esta agrega.
2. **La figura fija**, «Dónde terminó cada corrida, después de 400 generaciones»: tres filas (5, 38 y
   70) y **un punto por corrida**, colocado según la parte final de la población con culpa personal,
   de 0 a 100 %, con su leyenda, una descripción accesible y una tabla oculta con los conteos. Se
   calcula **en el build**, con el mismo módulo que usa el navegador, y es lo que se ve al cargar la
   página y sin JavaScript.
3. **El motor en vivo**, solo con JavaScript: los tres mundos para elegir, el texto de cada mundo, la
   línea del motor, el botón «Correr el motor» y, al pulsarlo, una gráfica con **una línea por
   corrida** (la parte de la población con culpa personal contra las generaciones), una corrida
   resaltada en el color del hilo, sus controles, el conteo y la leyenda de la regla (e).

### Los mundos, las corridas y sus ajustes

Son los de la ilustración de la curva del motor (`scripts/reproduce/r6-curve-illustration.ts` en su
`v1.0.0`), sin cambios:

| Ajuste | Valor |
| ------ | ----- |
| Población | `uniformPopulation(200, ["PGA", "MC-b"])`: mitad culpa personal, mitad compromiso específico a la pareja |
| Generaciones | 400 |
| Parámetros | `{ game: TRUST, size: 200, phi: 1, s: 0, p: 1, w: 0.5, sens: { theta: 0.6, c: 5 }, encounters: 4, cap: CAP_OFF, observation: "rational", beta1Kind: "entered" }` |
| Estado inicial | `{ population, beliefs: { beta0, beta1: 0.76 }, cells: openingCells(0.76, beta0), generation: 0 }`, con `rng = makeRng(seed)` |
| Cada generación | `result = step(state, PARAMS, rng)`; luego `state = { ...result.state, beliefs: { beta0, beta1: 0.76 } }` |
| Mundos | β₀ = 0.05, 0.38 y 0.70: los tres de las tarjetas (5, 38 y 70) |
| Semillas | 5 y 70: `q9-0` … `q9-19` (20 corridas). 38: `q9b-0` … `q9b-39` (40 corridas) |
| La cuenta | `census(state.population).PGA` |

La confianza de fondo se vuelve a fijar después de cada generación: cada mundo sigue siendo el que
es, y la sección compara mundos (regla (e)). Las corridas de 0.70 son, generación por generación, las
mismas que las de 0.74 de `r6`; el test del ADR 0043 lo usa.

### Cómo funciona

- **En reposo no corre nada.** Al cargar se ve la figura fija.
- **Al pulsar «Correr el motor»** se descarga, solo entonces, el código del motor en vivo: la gráfica,
  sus controles y un **Web Worker** con el motor. El worker corre el mundo elegido y manda cada
  generación; la página dibuja a un ritmo fijo, unas 30 generaciones por segundo, sin adelantarse a
  lo que ya llegó.
- **Al cambiar de mundo** se corre ese mundo; su texto, su conteo y su línea resaltada cambian con él.
  Lo ya corrido se queda en memoria mientras la página está abierta: volver a un mundo no lo
  recalcula.
- **El conteo** («Sin culpa personal · Solo culpa personal · Todavía mezcladas») está siempre a la
  vista y al día con la generación que se muestra.
- **La región viva** (`aria-live="polite"`) habla solo cuando un mundo termina, no en cada
  generación.
- **Con movimiento reducido** el motor corre igual, pero la gráfica aparece completa al terminar, sin
  animarse.
- **Si el worker falla** (un navegador sin workers, por ejemplo), la figura fija se queda y un aviso
  corto en el texto del estado dice que no se pudo correr. Nada se rompe.
- **Sin JavaScript**, solo la figura fija y su texto: ni controles ni huecos (ADR 0025).

### Lo que no hace

- **No deja ajustar nada:** ni `s`, `p`, φ, θ, c, el tamaño, las semillas o las generaciones. Solo se
  elige uno de tres mundos.
- **No dibuja agentes:** una línea por corrida en la gráfica y un punto por corrida en la figura fija.
- **No cambia la confianza de fondo** durante una corrida, ni conecta un mundo con otro.
- **No corre nada** si nadie pulsa el botón.
- **No guarda nada en el navegador** ni envía nada (ADR 0029).
- **No toca** la curva, el explorador, las tarjetas de los tres mundos ni la figura de dos paneles.

### Cómo se leen los ADR 0001, 0023, 0025 y 0039, y la regla (d)

- **ADR 0001.** La página sigue sin ser un simulador ni el instrumento del paper. Corre el motor en
  `/finding`, en tres escenarios fijos, sin parámetros: el visitante elige un mundo y nada más.
- **Regla (d).** No se visualizan poblaciones ni dinámicas, **salvo en esta sección y solo aquí**: se
  muestra la parte de una población con culpa personal, **una línea por corrida** (y, en la figura
  fija, un punto por corrida), sin agentes, puntos por persona ni rejillas. Lo demás de la regla (d)
  sigue igual, también «sin bi-estabilidad, saltos ni volteos de población».
- **ADR 0023.** La lista de interacciones suma una, la **12**: en `/finding`, solo con el candado
  abierto, el visitante elige uno de los tres mundos (`radio` nativos, con 38 al cargar), corre, pausa
  y sigue el motor con un solo botón, vuelve a empezar, mueve el deslizador de generación (`input
  type="range"`, activo cuando el mundo terminó) y resalta otra corrida. Su lógica,
  `src/lib/finding/population.ts`. Las demás reglas del 0023 valen igual: es opcional, no es evidencia
  sobre el visitante y nada sale de la pestaña. «El cliente no simula el modelo» se lee: salvo el
  motor de esta sección, que corre el código del paper sin cambios (ADR 0043).
- **ADR 0025.** La lista de scripts suma uno: **el del motor en vivo, solo en `/finding` y solo con el
  candado abierto.** Un arranque mínimo, en la primera carga, muestra los controles y espera el
  botón; la gráfica, los controles y el worker con el motor se descargan solo al pulsar. Sin
  JavaScript, la figura fija dice lo mismo.
- **ADR 0039.** Los parámetros del modelo siguen sin mostrarse. En esta sección, y solo aquí, se
  dicen **las generaciones (400) y el número de corridas (20 y 40)**, y nada más: ni `s`, φ, N, `p`,
  `w`, el tamaño ni las semillas por nombre. «Las semillas del paper» no nombra ninguna. La versión
  del motor, 1.0.0, sale de `ENGINE.version` (`src/config.ts`). Los ajustes viven en el código
  (`src/lib/finding/population.ts`) y en el del motor, no en la página.

### Su presupuesto

- **La primera carga de `/finding` no cambia de techo:** JavaScript de `/finding` ≤ 8 KiB
  comprimido (ADR 0038), contado igual, con el arranque del motor en vivo incluido.
- **Lo que se carga al pulsar «Correr el motor»: ≤ 7 KiB comprimido** (7 168 bytes), en sus dos
  idiomas: el módulo del motor en vivo, su worker con el motor y lo que importan, contados como el
  resto (ADR 0028). `npm run budgets` lo pesa en cada build (`finding-press`) y falla si se pasa: busca
  en los scripts de la página los `import()` y los `new URL(…, import.meta.url)` de los workers, que la
  primera carga no cuenta.
- **Medido en los pasos 10.4 y 10.7:** la primera carga de JavaScript de `/finding` pasa de 2.8 a
  3.4 KiB, bajo su techo de 8 KiB; lo que se carga al pulsar pesa 5.3 KiB (1.8 el módulo, 3.5 el
  worker con el motor). El techo de 7 KiB deja un margen chico.
- **Cómo se carga, para que la primera carga no empeore:** el arranque no importa nada ni tiene un
  `import()`, así que Astro lo mete en el HTML y `/finding` no pide ningún script más que antes. Con
  el arranque como archivo aparte, Lighthouse 13.5.0 medía el LCP de `/finding` en 1.96 s; en línea,
  1.81 s, el mismo que `main` (tres corridas por idioma). El build escribe en el bloque las URL de lo
  que se carga al pulsar (`data-later-module` y `data-later-worker`, con `?worker&url` de Vite, que
  los empaqueta aparte); al pulsar, el arranque agrega el módulo con un elemento `<script>` y el
  módulo arranca el worker. `npm run budgets` pesa lo que nombran esos atributos.
- Los demás techos no cambian.

### El tope de palabras

Con la entrada de la sección, la prosa de `/finding` mide 1 418 palabras en inglés y 1 561 en
español, contadas como `tests/prose.test.ts`. No pasa del tope de 1 600 (ADR 0037), que no cambia.

### Los textos

Los de Montse, aprobados el 11-oct, tal cual: el título, la entrada, los nombres de los mundos (los de
las tarjetas, con su número), el texto de cada mundo, la línea del motor, la leyenda de la gráfica,
el título y la leyenda de la figura fija, y los controles, el conteo, el anuncio al terminar y el
aviso de fallo. La entrada va en el Markdown; lo demás, en `src/i18n/`.

## Consecuencias

- **Código nuevo:** `src/lib/finding/population.ts` (puro, con su test contra las corridas del paper,
  ADR 0043), el componente de la sección con la figura fija, su arranque, el módulo del motor en vivo
  y su worker, las claves `finding.compete.*` en los dos idiomas y un slot nuevo en
  `src/lib/subpages.ts`.
- `astro.config.mjs` cierra el componente con el candado, como las demás piezas de `/finding`, y
  `verify:dist` busca su marca.
- `src/lib/budgets.ts` y `scripts/budgets.mjs` pesan lo que se carga al pulsar.
- El registro de cifras suma 400, 20 y 40, con su fuente; los conteos que se calculan en vivo no van
  uno por uno al registro: el test del ADR 0043 los fija contra las corridas del paper, como el ADR
  0038 hizo con el explorador.
- `docs/content-rules.md` (regla (d) y la de los parámetros) y `AGENTS.md` lo dicen. La línea de
  estado de los ADR 0001, 0023, 0025 y 0039 nombra este ADR.
