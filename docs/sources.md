# Fuentes

Toda cifra que aparezca en la página tiene aquí su entrada: referencia, página o tabla exacta y
dónde se usa. Una referencia no se usa en la página hasta que está marcada como verificada contra
la fuente original.

Una línea `PENDIENTE(...)` marca una comprobación extra que no bloquea el lanzamiento, a diferencia
de un TODO, que sí lo bloquea.

Cada entrada lleva una **clave** (línea `Clave:`). `src/content/figures.ts` registra cada cifra y
cada cita permitidas en la prosa de los actos con la clave de su entrada, y `tests/prose.test.ts`
falla si la prosa usa un número o una cita que no están registrados, o si una clave no existe aquí.

Una referencia que ya se usa en la página y sigue "por verificar" bloquea el lanzamiento hasta que
Montse la verifique (`docs/tasks.md`, preguntas abiertas).

Mientras la película reemplaza la versión anterior (P1–P4, ADR 0021), las líneas «Usada en» describen
el código que hay en ese momento: los actos, la mesa y sus momentos. Cada fase las actualiza cuando
mueve una cifra a un capítulo, en el mismo commit.

## Referencias

### Vanberg (2008)

- **Referencia (verificada, ficha en EconPapers):** Vanberg, C. (2008). Why do people keep their
  promises? An experimental test of two explanations. *Econometrica*, 76(6), 1467–1480.
- **Material suplementario** (verificado por Montse):
  - **Suppl. A:** Vanberg (2008), *Supplement: Appendix C, Translation of Instructions*,
    DOI 10.3982/ECTA7673SUPPA.
  - **Suppl. B:** Vanberg (2008), *Supplement: Appendix D, Translation of z-Tree Screens*,
    DOI 10.3982/ECTA7673SUPPB.
  - **Datos:** Vanberg (2008), *Supplement: data and programs*, `switch.dat`, analizado con el
    método de `promises.do` (bloques TABLE I y TABLE III). Cálculo de Montse. Los archivos de
    datos, el `.do` y los PDF de los suplementos no están en el repo.
- **Clave:** `vanberg-2008` (la cita "Vanberg (2008)" en la prosa).
- **Abstract** (texto público, **verificado**): fuente de la conclusión que el acto 4 le atribuye,
  en paráfrasis: el efecto de las promesas no se explica por cambios en lo que el otro espera, y
  sugiere una preferencia por cumplir la palabra en sí.
  Usada en: acto 4 (`src/content/acts/{en,es}/04-vanberg.md`).
- **Uso:** diseño del juego de cambio de pareja (la mesa, momentos 1 y 2), pagos, creencias de los
  receptores y tasas de Roll (actos 2 y 4, `/vanberg`).
- **Verificada:** sí. Las cifras, con los suplementos; la ficha del artículo, en EconPapers.
- PENDIENTE(pdf): cotejar contra las Tablas I–III impresas y agregar su página cuando esté el PDF
  del artículo. Es lo único pendiente de esta referencia.
- **Cifras:**

- Cifra: Roll: el dictador (A) recibe 10; se tira un dado de 6 caras: con la cara 1 el receptor
  (B) recibe 0 y con las caras 2–6 recibe 12, es decir, 12 con probabilidad 5/6 y 0 con 1/6.
  Clave: `vanberg-payoffs`.
  Fuente: Suppl. A, p. 2, tabla "Payoffs From the Decision". **Verificada (suplementos).**
  Usada en: la mesa, momentos 1 y 2 (`src/lib/table/game.ts`, `PAYOFFS`); tabla `<noscript>` de
  `GameTable.astro`.
- Cifra: Don't Roll: A recibe 14 y B recibe 0.
  Clave: `vanberg-payoffs`.
  Fuente: Suppl. A, p. 2, tabla "Payoffs From the Decision". **Verificada (suplementos).**
  Usada en: igual que la anterior.
- Cifra: pago esperado de B con Roll, 10 (= 12 · 5/6), y costo de tirar para A, 4 (= 14 − 10). Se
  derivan de las dos anteriores; no son cifras nuevas.
  Clave: `vanberg-payoffs`.
  Usada en: la mesa, fila "Expected" (`expectedPayoffs`); acto 2 ("te cuesta 4 y al otro le da,
  en promedio, 10").
- Cifra: probabilidad de cambio de pareja, 1/2 ("en la mitad de las parejas" en el acto 4). El
  cambio ocurre después de asignar los roles, y solo A sabe si hubo cambio.
  Clave: `vanberg-switch`.
  Fuente: Suppl. A, p. 2, Step 3 ("with probability ½"); Suppl. B, p. 1, Screen 1.
  **Verificada (suplementos).**
  Usada en: la mesa, momento 2 (`src/lib/table/moment2.ts`, `SWITCH_PROBABILITY`); acto 4.
- Cifra: chat antes de conocer el rol, 2 mensajes por persona, de 90 caracteres como máximo.
  Clave: `vanberg-chat`.
  Fuente: Suppl. B, p. 1, Screen 1. **Verificada (suplementos).**
  Usada en: acto 4.
- Cifra: 192 participantes, en 8 rondas, en el tratamiento con cambio de pareja.
  Clave: `vanberg-design`.
  Fuente: 192 en `switch.dat` (sujetos 1–192), que corresponde solo al tratamiento con cambio de
  pareja; los participantes de los tratamientos base (`baseline.dat`) no se cuentan. 8 rondas en
  Suppl. A, p. 1.
  **Verificada (suplementos).**
  Usada en: acto 4.
- Cifra: lo que espera el otro, "69 / 100" si recibió una promesa y "48 / 100" si no. Es la
  creencia de primer orden de B (`pfob`): su apuesta a que A tira el dado, en una escala de 5
  puntos codificada de 0 a 1, promediada. Con promesa: 0.689 (415.5 / 603). Sin promesa: 0.483
  (79.75 / 165). La página la muestra sobre 100, nunca como porcentaje, con la nota "Average guess,
  on a five-point scale read from 0 to 100." / "Promedio de su apuesta, en una escala de cinco
  puntos leída de 0 a 100." (clave `table.meter.note`).
  Fuente: escala en Suppl. B, pp. 2–3, Screen 5B; valores de `switch.dat` con el método de
  `promises.do`. **Verificada (suplementos).**
  Clave: `vanberg-beliefs`.
  Usada en: el medidor del momento 2 (`src/lib/table/expectation.ts`, `RECIPIENT_BELIEFS`;
  claves `table.meter.*`).
- Cifra: lo que esperaban los receptores que recibieron una promesa, "70" sin cambio y "68" con
  cambio, leídas de 0 a 100 (acto 4). Es la misma creencia de primer orden de B, separada por celda:
  0.696 sin cambio (n = 309) y 0.682 con cambio (n = 294), redondeadas sobre 100. El 100 del acto 4
  es el tope de esa lectura, igual que en el medidor.
  La escala: cinco puntos, de "certainly rolls" («seguro tira») a "certainly doesn't roll" («seguro
  no tira»), codificados de 0 a 1 y leídos de 0 a 100. El acto 4 la describe así, con "five" /
  "cinco" escrito con letra.
  Clave: `vanberg-beliefs`.
  Fuente: `switch.dat` con el método de `promises.do`; escala en Suppl. B, pp. 2–3, Screen 5B.
  **Verificada (suplementos).**
  Usada en: acto 4.
- Cifra: lo que hicieron los dictadores reales, tasa de Roll por celda (la página redondea a
  entero; el código guarda las cuentas exactas). Se cuentan rondas, no personas: cada decisión de un
  dictador en una ronda es una observación. El acto 4 lo dice así ("in the rounds where…" / "en las
  rondas en que…").

  | Celda                                                      | Roll            |
  | ---------------------------------------------------------- | --------------- |
  | Prometió · misma pareja                                    | 227 / 309 (73 %) |
  | Prometió · cambio a una pareja a la que otro le prometió    | 129 / 238 (54 %) |
  | No prometió · misma pareja                                 | 39 / 75 (52 %)   |
  | No prometió · cambio a una pareja a la que otro le prometió | 30 / 56 (54 %)   |

  El titular del reveal es siempre el par 73 % contra 54 % (prometió, sin cambio contra con
  cambio). El acto 4 cita solo ese par.
  Clave: `vanberg-rates`.
  Fuente: `switch.dat` con el método de `promises.do`. **Verificada (suplementos).**
  Usada en: el paso final del momento 2 (`src/lib/table/results.ts`, `ROLL_COUNTS`; claves
  `table.reveal.*`); acto 4.

El caso ilustrativo del cambio de pareja ("tu nueva pareja recibió una promesa de otro dictador")
corresponde exactamente a las filas "cambio a una pareja a la que otro le prometió" de la tabla de
arriba. Por eso el camino con cambio del visitante siempre resalta una de esas dos celdas.

- Cifra: la creencia después de una promesa, "76" de 100, que la curva del acto 5 deja fija (acto 5
  y pie de la gráfica, clave `curve.caption`). Es la creencia de segundo orden de los dictadores sin
  cambio de pareja: lo que creían que su pareja esperaba. Media 0.7585 (n = 384), que redondea a 76.
  También es el extremo del eje de confianza de fondo (de 0 a 76).
  Clave: `vanberg-second-order`.
  Fuente: `switch.dat`, bloque TABLE I de `promises.do`, creencia de segundo orden de los dictadores
  sin cambio. **Verificada por Montse (F3).**
  Usada en: acto 5 (`src/content/acts/{en,es}/05-finding.md`); pie de la gráfica
  (`src/components/curve/Curve.astro`). El valor fijo de la curva se comprueba contra
  `src/data/curve.json` en `tests/curve.test.ts`. En F4, la suma de las dos celdas sin cambio de la
  tabla de `/vanberg` da exactamente este valor: 291.25 / 384 (`src/lib/vanberg/cells.test.ts`).

#### Cifras de `/vanberg` (F4)

Verificadas en F4 contra los PDF públicos de Suppl. A y Suppl. B y contra `switch.dat` y
`baseline.dat` del suplemento de datos, leídos fuera del repo con el método de `promises.do`. Los
archivos siguen fuera del repo. Montse confirmó en F4.1 los datos de diseño (las cuatro primeras
cifras, claves `vanberg-procedure` y `vanberg-guessing`) contra Suppl. A y Suppl. B.

- Cifra: el diseño completo. "8" rondas; en cada una, otra persona elegida al azar, nunca la misma
  dos veces; al final se sortea una de las 8 rondas y solo esa se paga; los roles se sortean de nuevo
  en cada ronda, con la misma probabilidad; en el chat los mensajes se alternan y un sorteo decide
  quién escribe primero.
  Clave: `vanberg-procedure`.
  Fuente: Suppl. A, p. 1 (rondas, parejas, pago, Step 1 y Step 2); Suppl. B, p. 1, Screen 1 (los
  mensajes se alternan). **Verificada por Montse (F4.1).**
  Usada en: `/vanberg` (`src/content/subpages/{en,es}/vanberg.md`).
- Cifra: el dictador con cambio de pareja puede leer los dos chats: el suyo y el de su nueva pareja
  con otra persona.
  Clave: `vanberg-procedure`.
  Fuente: Suppl. B, p. 2, Screen 3A–switch. **Verificada por Montse (F4.1).**
  Usada en: `/vanberg`.
- Cifra: al final de cada ronda, el receptor solo ve su propio pago.
  Clave: `vanberg-procedure`.
  Fuente: Suppl. A, p. 2, "Information at the end of a round"; Suppl. B, p. 3, Screen 7B.
  **Verificada por Montse (F4.1).**
  Usada en: `/vanberg`.
- Cifra: apuestas con incentivo. El receptor gana "65", "60", "50", "35" o "15" centavos según lo que
  apostó y lo que hizo el dictador: 65 / 60 / 50 / 35 / 15 si el dictador tira, y 15 / 35 / 50 / 60 / 65
  si no tira, de «seguro tira» a «seguro no tira». El dictador gana "50" centavos si adivina la
  apuesta del receptor. Las apuestas se pagan en las rondas no sorteadas para la decisión.
  Clave: `vanberg-guessing`.
  Fuente: Suppl. B, pp. 2–3, Screen 5B (receptor); Suppl. B, p. 3, Screen 6A (dictador); Suppl. A,
  p. 2, "Bonus: Guessing" (en qué rondas se pagan). **Verificada por Montse (F4.1).**
  Usada en: `/vanberg`.
- Cifra: las seis celdas del tratamiento con cambio de pareja. Decisiones de dictadores
  (`type == 1`), por promesa (`promise`), cambio (`switch`) y si la pareja nueva recibió una promesa
  (`pr_promise`). Tiró: `roll`. Creencia de segundo orden: `sob`, en la escala de cinco puntos
  codificada de 0 a 1 y leída de 0 a 100. La página muestra lo redondeado; el código guarda las
  cuentas exactas (`src/lib/vanberg/cells.ts`).

  | Celda                                                  | Tiró            | Creencia de 2.º orden (suma / n) |
  | ------------------------------------------------------ | --------------- | -------------------------------- |
  | Prometió · misma pareja                                | 227 / 309 (73 %) | 246.5 / 309 (80)                |
  | No prometió · misma pareja                             | 39 / 75 (52 %)   | 44.75 / 75 (60)                 |
  | Prometió · pareja nueva a la que otro le prometió      | 129 / 238 (54 %) | 180.75 / 238 (76)               |
  | No prometió · pareja nueva a la que otro le prometió   | 30 / 56 (54 %)   | 39 / 56 (70)                    |
  | Prometió · pareja nueva sin promesa                    | 29 / 56 (52 %)   | 34.75 / 56 (62)                 |
  | No prometió · pareja nueva sin promesa                 | 19 / 34 (56 %)   | 19.75 / 34 (58)                 |

  La prosa cita "73" y "54" (tiró) y "80" y "76" (creencia), atribuidos a Vanberg (2008) como su
  argumento, sin valores p ni significancia.
  Clave: `vanberg-cells`.
  Fuente: `switch.dat`, bloques TABLE I (`tabstat sob … by (switch)`), TABLE II (creencias por
  celda) y TABLE III (`tabulate roll promise …`) de `promises.do`.
  Usada en: `/vanberg` (tabla `src/components/vanberg/SwitchTable.astro` y prosa).
- Cifra: los tratamientos base, con y sin chat, sin cambio de pareja. Con chat se tiró en "92" de
  "128" decisiones; sin chat, en "67" de "128"; "32" personas en cada tratamiento, en "8" rondas.
  Clave: `vanberg-baseline`.
  Fuente: `baseline.dat` (`treat` 1 = con chat, 0 = sin chat; sujetos 33–64 y 1–32), bloque
  TABLE A1 de `promises.do` (`tabulate roll treat`); Vanberg (2008), Appendix A.
  Usada en: `/vanberg` (`src/lib/vanberg/cells.ts`, `BASELINE`, y prosa).
- Cifra: la primera oración del abstract, citada literal en EN y traducida en ES, marcada como
  traducción propia: "Numerous psychological and economic experiments have shown that the exchange
  of promises greatly enhances cooperative behavior in experimental games."
  Clave: `vanberg-abstract`.
  Fuente: abstract de Vanberg (2008), ficha en EconPapers. **Verificada (F4).**
  Usada en: `/dilemma` (sección *Cheap talk*).

### Machado, Oliveira y Fernandes (2009)

- **Referencia (por verificar):** Machado, G. M., Oliveira, M. M. y Fernandes, L. A. F. (2009). A
  physiologically-based model for simulation of color vision deficiency. *IEEE Transactions on
  Visualization and Computer Graphics*, 15(6), 1291–1298.
- **Uso:** matrices de simulación de protanopia y deuteranopia (severidad 1.0) en el test de la
  paleta (`src/lib/design/color.ts`). No aparece en la página.
- **Verificada:** no.
- **Cifras:** —

### Axelrod (1984)

- **Referencia (por verificar):** Axelrod, R. (1984). *The Evolution of Cooperation*. Basic Books.
- **Clave:** `axelrod-1984`.
- **Uso:** matriz del dilema del prisionero (acto 2); contexto del dilema iterado (`/dilemma`).
- **Verificada:** no.
- **Cifras:**

- Cifra: pagos del dilema del prisionero, (3, 3), (0, 5), (5, 0) y (1, 1), con T = 5, R = 3, P = 1
  y S = 0 (T > R > P > S).
  Clave: `axelrod-1984`.
  Fuente: Axelrod (1984), página por verificar. **Por verificar; bloquea el lanzamiento.**
  Usada en: acto 2 (`src/content/acts/{en,es}/02-dilemma.md`); `/dilemma` (la mejor respuesta,
  `src/lib/pd/game.ts`, `PAYOFFS`, y la prosa).
- Cifra: la condición 2R > T + S, leída por ronda como "3 > 2.5": cooperar siempre deja más que
  turnarse para traicionar ((T + S) / 2 = 2.5). El "2" es el de 2R.
  Clave: `axelrod-1984`.
  Fuente: Axelrod (1984), página por verificar. **Por verificar; bloquea el lanzamiento.**
  Usada en: `/dilemma` (`src/lib/pd/game.ts`, `alternation`, con test).
- Cifra: sin cifras, el contexto del dilema repetido en `/dilemma`: la "sombra del futuro", el
  torneo de programas y que ganó Tit-for-Tat (coopera primero y luego copia lo que hizo el otro).
  Clave: `axelrod-1984`.
  Fuente: Axelrod (1984), páginas por verificar. **Por verificar; bloquea el lanzamiento.**
  Usada en: `/dilemma` (un párrafo, que termina con el enlace a *The Evolution of Trust*).

### Charness y Dufwenberg (2006)

- **Referencia (verificada):** Charness, G. y Dufwenberg, M. (2006). Promises and Partnership.
  *Econometrica*, 74(6), 1579–1601. RePEc:
  <https://ideas.repec.org/a/ecm/emetrp/v74y2006i6p1579-1601.html>
- **Clave:** `charness-dufwenberg-2006`.
- **Uso:** aversión a la culpa (acto 3).
- **Verificada:** sí (Montse, F2.1).
- **Cifras:** —

### Battigalli y Dufwenberg (2007)

- **Referencia (verificada):** Battigalli, P. y Dufwenberg, M. (2007). Guilt in Games. *American
  Economic Review*, 97(2), 170–176. RePEc:
  <https://ideas.repec.org/a/aea/aecrev/v97y2007i2p170-176.html>
- **Clave:** `battigalli-dufwenberg-2007`.
- **Uso:** aversión a la culpa (acto 3).
- **Verificada:** sí (Montse, F2.1).
- **Cifras:** —

### Nicky Case (2017)

- **Referencia (verificada):** Case, N. (2017). *The Evolution of Trust*.
  <https://ncase.me/trust/>
- **Clave:** `case-2017`.
- **Uso:** enlace para el dilema iterado (regla (f) de `content-rules.md`), acto 2.
- **Verificada:** sí. El enlace responde (HTTP 200, título "The Evolution of Trust", comprobado en
  F2); confirmada por Montse en F2.1.
- **Cifras:** —

### Kawagoe y Narita (2014)

- **Referencia (verificada):** Kawagoe, T. y Narita, Y. (2014). Guilt aversion revisited: An
  experimental test of a new model. *Journal of Economic Behavior & Organization*, 102, 1–9. RePEc:
  <https://ideas.repec.org/a/eee/jeborg/v102y2014icp1-9.html>
- **Clave:** `kawagoe-narita-2014`.
- **Uso:** la culpa personal: te duele defraudar una expectativa solo si tú la creaste (acto 5). En
  su especificación, la culpa personal es el producto de dos cantidades: la expectativa que ya había
  y lo que tu promesa le agregó (tercer párrafo del acto 5, sin cifras). En `/finding`: que la culpa
  personal es cero con cambio de pareja lo derivan ellos mismos, citado como "Kawagoe and Narita
  (2014)", sin número de sección.
- **Verificada:** sí (Montse, F3). La derivación de culpa personal cero con cambio de pareja,
  **verificada** contra la lectura de Montse del working paper (SSRN 1704884), en F4.1. La numeración
  de secciones del working paper no se cita: no aplica a la versión publicada.
- **Cifras:** —

### Curva del motor (`src/data/curve.json`)

- **Archivo:** `src/data/curve.json`, generado por el motor de simulación y copiado sin cambios por
  Montse en F3 (ADR 0010). La página no recalcula el modelo ni interpola entre filas: solo lee el
  archivo (`src/lib/curve/`).
- **Procedencia** (bloque `provenance` del archivo):
  - Repo del motor: `Montse2308/Dilema-del-Prisionero`.
  - Commit del motor: `68bc4bac4502257aeffb195a8890f6901a980f7d`.
  - Semilla: `grilla`.
  - Comando: `npm run export:curve`.
  - Generado: 2026-09-25T21:42:48.667Z, con Node v24.11.0.
- **Clave:** `curve`.
- **Contenido que usa la página:** 18 filas de la grilla, una por valor de confianza de fondo (de 0 a
  76, fracciones de denominador 100); en cada una, el pago material de las tres razones y si la
  culpa personal tira. Es una comparación entre mundos, cada uno con su confianza de fondo fija
  (regla (e)). Desde F4, `/finding` lee además, solo detrás del candado, la culpa disponible de cada
  fila, θ y c (`params.sens`) y la variante de robustez (ADR 0026). Ningún otro parámetro ni valor
  intermedio del archivo se lee ni se muestra.
- **Verificada:** `tests/curve.test.ts` y `src/lib/curve/curve.test.ts` validan la procedencia
  (ADR 0010) y comprueban cada cifra de abajo contra el archivo. Ninguna se escribe a mano sin test.
- **Cifras:**

- Cifra: eje de confianza de fondo de "0" a "76", leída "de 100".
  Clave: `curve`.
  Fuente: `axis` de `curve.json`; el 76 es la creencia después de una promesa (`vanberg-second-order`).
  Usada en: acto 5; ejes y `aria-label` de la gráfica.
- Cifra: la culpa personal tira de "15" a "65": primera y última fila donde tira, "medido en pasos
  de 5": las filas vecinas de la ventana son 10 y 70, sin filas intermedias.
  Clave: `curve`.
  Fuente: `grid[].rolls.PGA` y `grid[].beta0` de `curve.json`.
  Usada en: acto 5; `aria-label` de la gráfica.
- Cifra: pagos "10" y "5": la culpa personal gana 10 dentro de esa ventana y 5 fuera; el compromiso
  específico a la pareja y la culpa general (control) ganan 10 en todo el recorrido.
  Clave: `curve`.
  Fuente: `grid[].payoff` de `curve.json`.
  Usada en: acto 5; gráfica, tabla oculta y momento 3.
- Cifra: la regla de entrada, "tirar paga 10 y no tirar paga 5". En la simulación, la otra persona
  ve tu tipo (cuál de las razones te mueve) antes de jugar y solo entra si vas a tirar; si no entra,
  cada quien se queda con "5".
  Clave: `curve`.
  Fuente: `curve.json`: `params.game = "trust"` y `params.p = 1` (el otro ve el tipo); el 5 de
  quedarse fuera es la opción externa del motor (`TRUST.outside`), que llega a este repo solo a
  través del JSON, como el pago de cada fila donde un tipo no tira. `tests/curve.test.ts` comprueba
  en cada fila y cada serie que tirar paga 10 y no tirar paga 5.
  Usada en: acto 5 (cuarto párrafo).
- Cifra: pico en "38", donde más pesa la culpa personal.
  Clave: `curve`.
  Fuente: `peak` de `curve.json`.
  Usada en: acto 5; marca del pico y valor inicial del control deslizante.

#### Cifras de `/finding` (F4, ADR 0026)

Solo en `/finding` y solo detrás del candado (ADR 0026). La página no
recalcula el modelo: la culpa, los pagos, θ y c se leen de `curve.json` (`src/lib/curve/finding.ts`).
La única cuenta es la cuadrática del corte analítico, y solo en un test, para verificar la prosa.
`tests/finding.test.ts` comprueba cada cifra de abajo contra el archivo.

- Cifra: la culpa disponible, `a · (76 − a) / 100`, con `a` la confianza de fondo y las creencias en
  centésimas; el "76" es la creencia después de una promesa (`vanberg-second-order`). Pico en "38",
  con culpa "14.44"; cero en 0 y en 76.
  Clave: `curve-finding`.
  Fuente: `grid[].guilt` y `peak` de `curve.json`.
  Usada en: `/finding` (prosa y segunda gráfica, `Curve.astro` con `variant="guilt"`).
- Cifra: la culpa personal tira si θ · culpa > "4", el costo de tirar ("14" − "10", de
  `vanberg-payoffs`), con θ = "0.6"; es decir, si la culpa pasa de "20/3", cerca de "6.67".
  Clave: `curve-finding`.
  Fuente: θ en `params.sens.theta`; la regla se comprueba contra `grid[].rolls.PGA` en cada fila.
  Usada en: `/finding`; línea del umbral de la segunda gráfica.
- Cifra: el corte analítico, entre cerca de "10.1" y cerca de "65.9": las raíces de
  3a² − 228a + 2000 = 0, que es `a · (76 − a) / 100 = 20/3`. En la grilla medida, de "15" a "65".
  Clave: `curve-finding`.
  Fuente: la cuadrática, resuelta en fracciones exactas en el test; la ventana, `grid[].rolls.PGA`.
  Usada en: `/finding`.
- Cifra: el compromiso específico tiene un costo fijo c = "5" > 4, así que siempre tira cuando la
  promesa lo ata; la culpa general tira en todo el recorrido, porque la expectativa después de la
  promesa no depende de la confianza de fondo.
  Clave: `curve-finding`.
  Fuente: c en `params.sens.c`; `grid[].rolls["MC-b"]` y `grid[].rolls.GA`, verdaderos en cada fila.
  Usada en: `/finding`.
- Cifra: robustez. En la variante en que la expectativa previa no puede valer más que lo que el otro
  obtiene sin jugar ("5"), de "70" en adelante la culpa personal sigue ganando "10". La variante se
  anunció antes de correr la medición (afirmación de Montse, sesión F4).
  Clave: `curve-finding`.
  Fuente: `params.capRobustness` (`enabled`, `outsideOption` = 5) y `grid[].robustness.payoffPgaCapOn`.
  Usada en: `/finding`.

## Formato de una cifra

```
- Cifra: <valor tal como aparece en la página>
  Fuente: <referencia>, <página / tabla / figura>
  Usada en: <acto o ruta, clave o archivo>
```
