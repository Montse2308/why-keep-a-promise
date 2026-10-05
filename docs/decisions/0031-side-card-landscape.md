# 0031 · La tarjeta al costado con el celular en horizontal

**Estado:** aceptada (P7.0). Precisa el ADR 0027 en un caso que no nombraba: el celular en
horizontal. En la computadora las tarjetas siguen centradas, como dice el 0027.

## Contexto

El ADR 0027 pone el texto de la película en tarjetas de papel, «abajo en el celular y centradas en
la computadora». No dice nada del celular en horizontal. La revisión externa (punto 12,
`docs/p7-external-review.md`) lo probó a 740 × 360:

- la tarjeta tapa casi todo el escenario;
- el título del capítulo 0 se encima con las cabezas;
- la tarjeta de la apuesta tapa el carrete.

Solo la película sufre en horizontal: el storyboard y el cuaderno se ven bien. `camera.ts` ya
encuadra según la forma de la pantalla; le falta saber qué parte deja libre la tarjeta.

La revisión también proponía la tarjeta al costado en la computadora (punto 16), para que no tape a
los personajes cuando reaccionan. Montse decidió que no (7.0.4).

Se pensó en bloquear la rotación, y se descartó (ver abajo).

## Decisión

### En horizontal en el celular

- **Cuándo:** `(orientation: landscape) and (max-height: 500px)`. El alto es lo que distingue un
  celular de lado de una computadora o una tableta.
- **La tarjeta** va a la izquierda, con cerca del 44 % del ancho. Si su texto no cabe en el alto,
  tiene scroll interno, y el foco del teclado sigue visible dentro de ella.
- **La cámara** encuadra el área que la tarjeta deja libre, no la pantalla entera. `camera.ts`
  recibe esa área.
- **El título del capítulo 0** deja de encimarse con las cabezas.
- **El carrete, el botón de sonido y el cuaderno** no quedan debajo de la tarjeta.
- Siguen las reglas del 0027: objetivos táctiles de 44 px o más y nada de scroll horizontal.

### En la computadora y con el celular vertical

Nada cambia: abajo en el celular vertical y centradas en la computadora (ADR 0027).

### Por qué no se bloquea la rotación

- **En la web no se puede de verdad.** `screen.orientation.lock()` solo funciona en pantalla
  completa o en una app instalada, y Safari en iPhone no lo soporta. «Bloquear» sería tapar la
  página con un aviso de «gira tu teléfono».
- **Rompe la accesibilidad.** WCAG 2.1, criterio 1.3.4 (Orientación, nivel AA): el contenido no se
  limita a una orientación salvo que sea esencial, y aquí no lo es. El sitio apunta a AA.
- **Es hostil con quien visita.** En el navegador interno de LinkedIn, alguien con el teléfono de
  lado se encontraría un muro.
- **El problema es pequeño.** Se arregla adaptando la película, sin quitarle nada a nadie.

## Consecuencias

- Se construye en P7.5: la cámara sobre el área libre (7.5.1), la tarjeta al costado (7.5.2) y el
  título del capítulo 0 (7.5.3). La tarjeta al costado en la compu (7.5.4) no se hace.
- Las capturas de salida de P7.5 incluyen 740 × 360, 844 × 390, 1024 × 768 y 1440 × 900.
- Un test fija el encuadre con el área libre.
- La línea de estado del ADR 0027 dice que este ADR lo precisa.
