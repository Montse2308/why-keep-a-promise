# Fuentes

Toda cifra que aparezca en la página tiene aquí su entrada: referencia, página o tabla exacta y
dónde se usa. Una referencia no se usa en la página hasta que está marcada como verificada contra
la fuente original.

Desde F1 están los pagos del juego. Mientras una cifra tenga un `TODO(...)`, bloquea el lanzamiento:
la página es privada hasta F6 y la regla de arriba se cumple antes de publicarla.

## Referencias

### Vanberg (2008)

- **Referencia (por verificar):** Vanberg, C. (2008). Why do people keep their promises? An
  experimental test of two explanations. *Econometrica*, 76(6), 1467–1480.
- **Uso previsto:** diseño del juego de cambio de pareja (la mesa, momentos 1 y 2), pagos y
  resultados publicados (acto 4, `/vanberg`).
- **Verificada:** no.
- **Cifras:**

- Cifra: Roll: el dictador recibe 10; el receptor recibe 12 con probabilidad 5/6 y 0 con 1/6 (el
  dado de seis caras: la cara 1 da 0).
  Fuente: Vanberg (2008), TODO(verify-vanberg): página o tabla, por confirmar por Montse.
  Usada en: la mesa, momentos 1 y 2 (`src/lib/table/game.ts`, `PAYOFFS`); tabla `<noscript>` de
  `GameTable.astro`.
- Cifra: Don't Roll: el dictador recibe 14 y el receptor 0.
  Fuente: Vanberg (2008), TODO(verify-vanberg): página o tabla, por confirmar por Montse.
  Usada en: igual que la anterior.
- Cifra: pago esperado del receptor con Roll, 10 (= 12 · 5/6). Se deriva de las dos anteriores; no
  es una cifra nueva.
  Usada en: la mesa, fila "Expected" (`expectedPayoffs`).
- Cifra: probabilidad de cambio de pareja, 1/2.
  Fuente: Vanberg (2008), TODO(verify-vanberg): confirmar el diseño del sorteo y su página.
  Usada en: la mesa, momento 2 (`src/lib/table/moment2.ts`, `SWITCH_PROBABILITY`).
- Cifra: expectativa del receptor con y sin promesa. **Pendiente, sin cifra.**
  Fuente: Vanberg (2008), TODO(vanberg-beliefs): niveles numéricos, dirección y página.
  Usada en: el medidor del momento 2, que mientras tanto solo muestra dos niveles cualitativos
  ("más baja" / "más alta") en posiciones visuales, no en datos
  (`src/lib/table/expectation.ts`).
- Cifra: lo que hicieron los participantes reales (tasas de Roll por condición). **Pendiente, sin
  cifra.**
  Fuente: Vanberg (2008), TODO(vanberg-rates): tasas publicadas y página.
  Usada en: el paso final del momento 2, hoy un placeholder `TODO(vanberg-rates)` visible en la
  página.

El caso del cambio de pareja ("tu nueva pareja recibió una promesa de otro dictador") es un caso
ilustrativo fijo de la página, no una cifra, y la interfaz lo dice.

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
