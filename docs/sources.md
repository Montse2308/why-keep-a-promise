# Fuentes

Toda cifra que aparezca en la página tiene aquí su entrada: referencia, página o tabla exacta y
dónde se usa. Una referencia no se usa en la página hasta que está marcada como verificada contra
la fuente original.

Una línea `PENDIENTE(...)` marca una comprobación extra que no bloquea el lanzamiento, a diferencia
de un TODO, que sí lo bloquea.

## Referencias

### Vanberg (2008)

- **Referencia (por verificar):** Vanberg, C. (2008). Why do people keep their promises? An
  experimental test of two explanations. *Econometrica*, 76(6), 1467–1480.
- **Material suplementario** (verificado por Montse):
  - **Suppl. A:** Vanberg (2008), *Supplement: Appendix C, Translation of Instructions*,
    DOI 10.3982/ECTA7673SUPPA.
  - **Suppl. B:** Vanberg (2008), *Supplement: Appendix D, Translation of z-Tree Screens*,
    DOI 10.3982/ECTA7673SUPPB.
  - **Datos:** Vanberg (2008), *Supplement: data and programs*, `switch.dat`, analizado con el
    método de `promises.do` (bloques TABLE I y TABLE III). Cálculo de Montse. Los archivos de
    datos, el `.do` y los PDF de los suplementos no están en el repo.
- **Uso:** diseño del juego de cambio de pareja (la mesa, momentos 1 y 2), pagos, creencias de los
  receptores y tasas de Roll (acto 4, `/vanberg`).
- **Verificada:** las cifras de la mesa, sí (suplementos). La referencia del artículo, todavía no.
- PENDIENTE(pdf): cotejar contra las Tablas I–III impresas y agregar su página cuando esté el PDF
  del artículo.
- **Cifras:**

- Cifra: Roll: el dictador (A) recibe 10; se tira un dado de 6 caras: con la cara 1 el receptor
  (B) recibe 0 y con las caras 2–6 recibe 12, es decir, 12 con probabilidad 5/6 y 0 con 1/6.
  Fuente: Suppl. A, p. 2, tabla "Payoffs From the Decision". **Verificada (suplementos).**
  Usada en: la mesa, momentos 1 y 2 (`src/lib/table/game.ts`, `PAYOFFS`); tabla `<noscript>` de
  `GameTable.astro`.
- Cifra: Don't Roll: A recibe 14 y B recibe 0.
  Fuente: Suppl. A, p. 2, tabla "Payoffs From the Decision". **Verificada (suplementos).**
  Usada en: igual que la anterior.
- Cifra: pago esperado de B con Roll, 10 (= 12 · 5/6). Se deriva de las dos anteriores; no es una
  cifra nueva.
  Usada en: la mesa, fila "Expected" (`expectedPayoffs`).
- Cifra: probabilidad de cambio de pareja, 1/2. El cambio ocurre después de asignar los roles, y
  solo A sabe si hubo cambio.
  Fuente: Suppl. A, p. 2, Step 3 ("with probability ½"); Suppl. B, p. 1, Screen 1.
  **Verificada (suplementos).**
  Usada en: la mesa, momento 2 (`src/lib/table/moment2.ts`, `SWITCH_PROBABILITY`).
- Cifra: lo que espera el otro, "69 / 100" si recibió una promesa y "48 / 100" si no. Es la
  creencia de primer orden de B (`pfob`): su apuesta a que A tira el dado, en una escala de 5
  puntos codificada de 0 a 1, promediada. Con promesa: 0.689 (415.5 / 603). Sin promesa: 0.483
  (79.75 / 165). La página la muestra sobre 100, nunca como porcentaje, con la nota "promedio de su
  apuesta, en una escala de 0 a 100".
  Fuente: escala en Suppl. B, pp. 2–3, Screen 5B; valores de `switch.dat` con el método de
  `promises.do`. **Verificada (suplementos).**
  Respaldo (no aparece en la página): con promesa, 0.696 sin cambio (n = 309) y 0.682 con cambio
  (n = 294).
  Usada en: el medidor del momento 2 (`src/lib/table/expectation.ts`, `RECIPIENT_BELIEFS`;
  claves `table.meter.*`).
- Cifra: lo que hicieron los dictadores reales, tasa de Roll por celda (la página redondea a
  entero; el código guarda las cuentas exactas):

  | Celda                                                      | Roll            |
  | ---------------------------------------------------------- | --------------- |
  | Prometió · misma pareja                                    | 227 / 309 (73 %) |
  | Prometió · cambio a una pareja a la que otro le prometió    | 129 / 238 (54 %) |
  | No prometió · misma pareja                                 | 39 / 75 (52 %)   |
  | No prometió · cambio a una pareja a la que otro le prometió | 30 / 56 (54 %)   |

  El titular del reveal es siempre el par 73 % contra 54 % (prometió, sin cambio contra con
  cambio).
  Fuente: `switch.dat` con el método de `promises.do`. **Verificada (suplementos).**
  Usada en: el paso final del momento 2 (`src/lib/table/results.ts`, `ROLL_COUNTS`; claves
  `table.reveal.*`).

El caso ilustrativo del cambio de pareja ("tu nueva pareja recibió una promesa de otro dictador")
corresponde exactamente a las filas "cambio a una pareja a la que otro le prometió" de la tabla de
arriba. Por eso el camino con cambio del visitante siempre resalta una de esas dos celdas.

### Machado, Oliveira y Fernandes (2009)

- **Referencia (por verificar):** Machado, G. M., Oliveira, M. M. y Fernandes, L. A. F. (2009). A
  physiologically-based model for simulation of color vision deficiency. *IEEE Transactions on
  Visualization and Computer Graphics*, 15(6), 1291–1298.
- **Uso:** matrices de simulación de protanopia y deuteranopia (severidad 1.0) en el test de la
  paleta (`src/lib/design/color.ts`). No aparece en la página.
- **Verificada:** no.
- **Cifras:** —

### Axelrod

- **Referencia (por verificar):** Axelrod, R. (1984). *The Evolution of Cooperation*. Basic Books.
- **Uso previsto:** contexto del dilema del prisionero y del dilema iterado (acto 2, `/dilemma`).
- **Verificada:** no.
- **Cifras:** —

### Nicky Case

- **Referencia (por verificar):** Case, N. (2017). *The Evolution of Trust*.
  <https://ncase.me/trust/>
- **Uso previsto:** enlace para el dilema iterado (regla (f) de `content-rules.md`).
- **Verificada:** no.
- **Cifras:** —

## Formato de una cifra

```
- Cifra: <valor tal como aparece en la página>
  Fuente: <referencia>, <página / tabla / figura>
  Usada en: <acto o ruta, clave o archivo>
```
