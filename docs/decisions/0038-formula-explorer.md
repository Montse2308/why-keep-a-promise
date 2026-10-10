# 0038 · Un explorador de la fórmula en `/finding`

**Estado:** aceptada (P9, paso 9.1). Enmienda el ADR 0001 («no deja al visitante explorar
parámetros») y la lista de scripts del ADR 0025 («El JavaScript del sitio»), y suma un techo a sus
presupuestos (con las unidades del ADR 0028). Precisa la lista cerrada de interacciones del ADR 0023
y el punto 2 del candado del ADR 0034. Decisión de Montse (2026-10-10, D6).

## Contexto

La sección «Tres mundos» de `/finding` (ADR 0037) muestra tres valores fijos de la confianza de
fondo. Quien lee puede sospechar que la loma sale de haber elegido bien los números. La fórmula de
la culpa disponible es corta y exacta: dejar que el visitante la mueva enseña que la loma sale de la
fórmula.

Tres ADR lo impedían:

- el 0001: la página «no deja al visitante explorar parámetros»;
- el 0023: sus interacciones son «estas y solo estas», y una nueva necesita otro ADR;
- el 0025: lista todos los scripts del sitio, y ninguno es de `/finding`.

## Decisión

### Qué es

Un explorador **de la fórmula de la culpa disponible**, y nada más, en `/finding`, encima de las
tarjetas de los tres mundos. Tres controles deslizantes:

| Control | Rango | Paso | Valor inicial |
| ------- | ----- | ---- | ------------- |
| La confianza de fondo, *a* | 0 a *b* | 1 | 38 |
| La creencia de que la promesa se cumplirá, *b* | 40 a 100 | 1 | 76 |
| θ, cuánto pesa la culpa | 0 a 1.5 | 0.01 | 0.6 |

Muestra:

1. la curva de la culpa disponible, `a · (b − a) / 100`, para *a* de 0 a *b*, y la línea del
   umbral, `4 / θ`;
2. la ventana donde la culpa personal tira, sombreada, con sus extremos: las raíces de
   `a · (b − a) / 100 = 4 / θ`;
3. un punto en el valor actual de *a*, con si la culpa personal tira o no;
4. el pico, en `a = b / 2`, donde la culpa vale `b² / 400`;
5. un aviso cuando la ventana no existe, con `θmin = 1600 / b²` (0.277 con *b* = 76).

### Lo que no hace

- **No corre el motor** ni lo importa (ADR 0010). No muestra poblaciones, agentes ni dinámicas: la
  regla (d) sigue intacta.
- **No toca** la tasa con que una promesa deja de atar, la probabilidad de que el otro vea qué
  razón te mueve, φ ni c.
- **No dice nada de pagos** fuera de la figura de la sección 4 (ADR 0037). Es la fórmula de la
  sección 5, nada más.

### Cómo se leen los ADR 0001, 0023 y 0034

- **En el 0001**, «no deja al visitante explorar parámetros» se lee: salvo el explorador de la
  fórmula de la culpa disponible en `/finding`, detrás del candado. La página sigue sin ser un
  simulador ni el instrumento del paper.
- **En el 0023**, la lista de interacciones suma una, la 11: en `/finding`, solo con el candado
  abierto, el visitante mueve los tres controles del explorador; su lógica, `src/lib/finding/`. Las
  demás reglas del 0023 valen igual: es opcional, no visualiza una población, no es evidencia sobre
  el visitante, no calcula nada que no esté en un módulo puro y nada sale de la pestaña. La gráfica
  de culpa de `/finding` sigue siendo estática.
- **En el 0034**, punto 2, `/finding` puede mostrar además, en el explorador, *b* (la creencia de que
  la promesa se cumplirá, el 76 de siempre) movida por el visitante. No lee otro parámetro del
  archivo: el explorador no lee `curve.json`.

### Cómo se toca

- Controles nativos `input type="range"`, cada uno con su `label` y su valor visible, con teclado y
  con toque.
- Una región viva cortés (`aria-live="polite"`) dice el estado: «Background trust 38: personal guilt
  rolls» / «Confianza de fondo 38: la culpa personal tira».
- Con movimiento reducido, la curva cambia sin animarse.
- **Sin JavaScript no aparece**, ni su texto: quedan las tarjetas de los tres mundos, que dicen lo
  mismo con tres valores fijos (ADR 0025, mejora progresiva).

### Cómo se prueba

- La lógica vive en un módulo puro, `src/lib/finding/explorer.ts`, con su test.
- Los números que calcula en vivo no van uno por uno al registro de cifras (regla (a)): son
  infinitos. **Un test fija la función pura en los valores del registro:** con *b* = 76 y θ = 0.6,
  la ventana va de 10.1 a 65.9 (a un decimal) y el pico vale 14.44 en 38; `θmin(76)` = 0.277 (a tres
  decimales); y `θmin(80)` = 0.25, como dice el working paper (sección 5).
- El 0.277 que dice la prosa está en el registro, como cualquier cifra.

### El JavaScript del sitio (enmienda el ADR 0025)

La lista de scripts del ADR 0025 suma uno:

- el de la película y sus juegos;
- el del control de la curva, solo con el candado abierto;
- el del panel del cuaderno;
- **el del explorador de la fórmula, solo en `/finding` y solo con el candado abierto.**

Todos están en la versión sin JS, que funciona sin ellos.

### Su presupuesto

- **JavaScript de `/finding`: ≤ 8 KiB comprimido** (8 192 bytes), en sus dos idiomas, contado como
  el del home (ADR 0028): todo el JavaScript que la página carga, el del panel del cuaderno incluido.
- `npm run budgets` lo pesa en cada build y falla si se pasa.
- Los demás techos no cambian: fuentes y primera carga valen también en `/finding`.

## Consecuencias

- Entran `src/lib/finding/explorer.ts` (puro, con su test), el componente y su script, y las claves
  `finding.explorer.*` en los dos idiomas.
- `src/lib/budgets.ts` y `scripts/budgets.mjs` suman el techo de `/finding`.
- `astro.config.mjs` cierra el componente con el candado, como la gráfica de culpa.
- La línea de estado de los ADR 0001, 0023, 0025 y 0034 nombra este ADR.
