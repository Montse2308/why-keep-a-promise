# 0046 · La tarjeta en el celular vertical y el final del mazo

**Estado:** aceptada (M5, paso M5.1). Precisa los ADR 0027 y 0031 en qué pasa cuando una tarjeta
abajo en la pantalla no cabe en el alto de su tramo o bajo la esquina superior, y el ADR 0023 en
cómo cierra la última carta del mazo del capítulo 5.

## Contexto

En un teléfono vertical con pantalla corta o con el tamaño de letra del sistema agrandado, algunas
tarjetas de la película (sobre todo después de revelar el resultado en `.card__out`) pueden superar
el espacio útil de su tramo (`--screens * 100svh - 35svh`) e invadir el tramo siguiente, o subir
hasta tocar la fila del carrete y el sonido (`--side-top`).

Además, en el mazo del capítulo 5 (`blackout/deck`), las cartas 1 a 5 salen volando al decidir; la
carta 6 se queda en pantalla con el conteo final (`film.deck.tally`), pero dejaba visibles sus dos
boletos deshabilitados y la línea «O desliza la carta hacia tu elección.», dando la impresión de que
la última carta no había respondido. También las barras deslizantes (`input[type="range"]`) podían
capturar un gesto vertical del pulgar y frenar el scroll nativo.

## Decisión

1. **Tope de altura y scroll interno en pantallas angostas o táctiles bajas (`@media (max-width: 48rem), (max-height: 40rem) and (pointer: coarse)`).**
   Las tarjetas fijas abajo (salvo la de los créditos, que rueda con el scroll, y el sobre del
   capítulo 7, cuya solapa abre hacia arriba fuera de la tarjeta) limitan su alto al menor entre el
   espacio libre bajo la fila superior (`100svh - var(--side-top) - var(--space-4) - env(safe-area-inset-bottom, 0px)`)
   y el espacio útil de su propio tramo (`(var(--screens) * 100svh) - 35svh`), con `overflow-y: auto`,
   `overflow-x: hidden` (para que una carta que vuela hacia los costados no ensanche el área de
   scroll de la tarjeta) y `overscroll-behavior: auto`. En el celular en horizontal
   (`@media (orientation: landscape) and (max-height: 500px)`, ADR 0031), como `.beat .card` pesa
   más que `.card`, en el alto máximo manda también este tope de dos cotas (para que tampoco de
   lado se encimen dos tarjetas en un tramo corto), mientras que el ancho a la izquierda sigue
   siendo el del ADR 0031 (`--side-card`). Como en el ADR 0031, cuando la tarjeta puede hacer
   scroll interno el papel y la sombra van en la tarjeta entera para que acompañen al texto; en
   una computadora o portátil baja (`pointer: fine` y más de `48rem` de ancho) siguen en `::before`
   para que los títulos no pierdan nitidez con DPR 1 (8.2). Cuando el visitante toma una decisión
   en una tarjeta que rebasa su alto visible, la tarjeta hace scroll interno hasta su pie
   (`card.scrollTo({ top: card.scrollHeight, behavior: 'smooth' })`, nunca `scrollIntoView`) para
   mostrar el resultado en `.card__out` sin mover el scroll de la página. El total de pantallas de
   la película (`36.75`) y el `padding-top: 35svh` de los tramos no cambian.
2. **Cierre de la última carta del mazo (capítulo 5).**
   Al decidir la sexta carta, igual que en el chat del capítulo 2, se ocultan los boletos de esa
   carta (`.deck-card__tickets`) y el aviso de deslizar (`.deck__swipe`), y el foco pasa al conteo
   final (`[data-deck-out]`), dejando visible solo la carta decidida y el resumen del mazo.
3. **Barras deslizantes y scroll vertical.**
   Los controles `input[type="range"]` de la película llevan `touch-action: pan-y` para que un gesto
   vertical del pulgar sobre la barra no detenga el scroll nativo de la página.

## Consecuencias

- En el celular (vertical u horizontal), ninguna tarjeta se encima con la del tramo siguiente ni
  tapa el carrete, tampoco con texto al 137.5 %.
- En la carta 6 del capítulo 5 desaparecen los botones y el aviso de deslizar en cuanto se toma la
  decisión, y queda a la vista el resumen de promesas cumplidas.
- Las líneas de estado de los ADR 0023, 0027 y 0031 y `docs/decisions/README.md` nombran este ADR.
