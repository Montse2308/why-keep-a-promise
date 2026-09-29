# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test`, `build` y
`verify:dist` en verde. Las listas de F0–F4 y R0–R4 están en `docs/archivo/tareas-anteriores.md`.

**Fase activa:** P2 (capítulos 1 a 3). P0 y P1 cerradas: Montse las revisó y las mergeó (PR #1 y
PR #2).

**Estado del código:** la película ya cuenta el capítulo 0; debajo sigue la versión anterior (los
actos 2 a 6, la mesa del momento 2 y las secciones del home). La película la reemplaza por capítulos
(ADR 0021).

## P0 · Documentos

- [x] Plan cerrado con Montse en cinco rondas: contexto, lluvia de ideas votada, concepto,
      prototipo en dos direcciones (eligió Papel) y plan.
- [x] ADR 0021 (la película), 0022 (Papel), 0023 (juegos), 0024 (el cuaderno), 0025 (tecnología) y
      0026 (el candado).
- [x] Archivo: los ADR 0002, 0003, 0004, 0009, 0014, 0015, 0017, 0018, 0019 y 0020 en
      `docs/archivo/decisiones/`, cada uno con la línea de qué lo reemplaza. También el plan, las
      reglas, las fases y las tareas anteriores.
- [x] Líneas de estado de los ADR 0001, 0005 y 0012.
- [x] `docs/decisions/README.md`: el índice de los ADR vigentes.
- [x] `plan.md`, `content-rules.md` (con (b), (d), (f), (g), (j) y (k) precisadas), `phases.md` y
      este archivo.
- [x] `launch-checklist.md`: el paso 1b (política de la revista) y los pasos 4 y 8 con la estructura
      nueva.
- [x] `AGENTS.md` y los README.
- [x] El prototipo de los capítulos 0 a 3 en `docs/prototipo/te-lo-prometo.html`.
- [x] Revisión de P0 por Montse (PR #1, mergeado).

## P1 · Cimientos y capítulo 0

- [x] La hoja de personajes, aprobada por Montse con tres cambios, que recoge el ADR 0027 (que
      reemplaza al 0022): el hilo dorado en lugar del diamante, los boletos en lugar de los gestos y
      el color «punto medio» entre Aciano y Aciano luminoso. De noche, la lámpara. Las hojas y
      barajas, en `docs/prototipo/`.
- [x] Fraunces y Nunito autoalojadas: `@fontsource-variable/*@5.3.0`, solo el eje de peso (121 404
      bytes en la primera carga), OFL y procedencia. Registradas; se cargan con el capítulo 0.
- [x] Colores de la película en `src/lib/design/film.ts` y `src/styles/film.css`: el elenco, el
      hilo, el papel, los seis puntos de luz y la lámpara; tests de contraste en cada punto de luz, de
      daltonismo (44 y 22), de luz continua (≤ 25 ΔE por pantalla) y de cielo que nunca pasa por gris
      (la luz se mezcla por tono, OKLCH, y hay una salida del sol entre el amanecer y la mañana).
- [ ] El papel del cuaderno en `palette.ts` y `tokens.css`, con sus tests (con el cuaderno, P5).
- [x] `src/lib/film/`: pistas, curvas, interpolación de colores, cámara según la pantalla y tramos,
      con tests.
- [x] `src/lib/chapters.ts`: los nueve ids, su orden, su largo en pantallas y su fase, con test.
- [x] La colección `src/content/chapters/{en,es}/`, con el texto del capítulo 0.
- [x] El storyboard en HTML y el script de la película encima (`src/components/film/`): el escenario
      se fija y los capítulos pasan encima, con el scroll nativo; `html.js` se marca antes de pintar.
      Sin JavaScript, cada capítulo es un cuadro quieto con su texto.
- [x] El capítulo 0 en EN y ES: la pregunta sobre el amanecer, el otro que pide la promesa, los dos
      boletos, el hilo dorado que se dibuja, el carrete de la esquina y la promesa de la página. Con
      movimiento reducido, la cámara corta entre dos planos y nada flota. Tests de la coreografía y
      de las caras (`src/lib/film/stage.test.ts`).
- [x] Retirados la primera pantalla (sello, autora y ancla), la escena del acto 1 y la mesa del
      momento 1, con sus tests y sus claves; también el modo hero de `Act`. Los actos 2 a 6 siguen
      abajo, tal cual, hasta P2–P4. El ícono de la pestaña es el del hilo.
- [x] `verify:dist`, durante la transición: la frase de estado sale una vez en el home (acto 5), porque
      el sello se fue con la primera pantalla. En P4 vuelven a ser dos: el sello del capítulo 7 y la
      entrada del cuaderno (ADR 0026).
- Transición, a resolver en P2: el acto 2 dice «la mesa que jugaste arriba», y esa mesa volverá como
  capítulo 3. El archivo `01-question.md` del acto 1 ya no se muestra; sale con `acts.ts` en P4.
- [x] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS), con el PR #2.
- [x] Revisión de P1 por Montse (PR #2, mergeado).

## P2 · Capítulos 1 a 3

- [ ] Los capítulos en tramos: cada capítulo es una serie de tarjetas en el flujo normal de la página,
      cada una con su largo en pantallas, y la tarjeta se queda abajo mientras su tramo pasa. El
      teclado recorre la película en orden y el scroll sigue siendo el nativo.
- [ ] Capítulo 1, «Dos cuartos»: los cuartos, la pared y los focos; una ronda del dilema (el otro
      traiciona siempre); las dos columnas con la mejor respuesta de `src/lib/pd/`; el tablero de 2×2
      ilustrado y la trampa; el enlace a *The Evolution of Trust*.
- [ ] Capítulo 2, «¿Y si pudieran hablar?»: el chat con tres mensajes escritos, la respuesta del otro
      y el *cheap talk*. Sin segunda ronda del dilema.
- [ ] Capítulo 3, «La matriz se dobla»: el tablero se dobla en el dado, «otro juego, la misma
      tensión» (regla (g)), la decisión con `PAYOFFS`, el dado que gira y cae, las monedas y el hilo
      que aguanta o se rompe.
- [ ] Todo número de la película sale del código: las leyendas y las claves `film.*` no llevan
      cifras escritas a mano, solo marcadores que se llenan con `src/lib/pd/` y `PAYOFFS`.
- [ ] Sale la versión anterior de lo que estos capítulos reemplazan: el acto 2 (y el archivo del
      acto 1, que ya no se mostraba) y la mesa del momento 1 con sus claves. `/dilemma` vuelve al
      capítulo 1.
- [ ] Tests: el dilema se juega una vez, las dos columnas muestran que traicionar paga más, los pagos
      de la decisión salen de `PAYOFFS`, el capítulo 3 dice que es otro juego, las cifras de las
      leyendas registradas, la coreografía de cada tramo y la luz del ADR 0027 en su capítulo.
- [ ] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS), jugando todas las
      opciones.

## Preguntas abiertas

- **Axelrod (1984):** verificar antes del lanzamiento la página de los pagos del dilema, de la
  condición `2R > T + S`, de la sombra del futuro y del torneo. La prosa ya la usa y sigue «por
  verificar» en `docs/sources.md`.
- **La forma de las dos voces:** se decide con la hoja de personajes (P1).
- **El color del triángulo:** el que pase los tests de daltonismo frente a los dos roles (P1).
- **Los pendientes de la versión anterior** (en `docs/archivo/tareas-anteriores.md`, sección F5)
  desaparecen con el código que reemplaza la película. Si alguno sobrevive a P4, vuelve aquí.

## Preguntas cerradas

- ~~¿Otro repo o el mismo?~~ El mismo, con archivo (P0).
- ~~¿Se abre el candado en revisión o al aceptar?~~ En revisión, después de revisar la política de
  la revista (paso 1b del checklist, ADR 0026).
- ~~Dirección de arte.~~ Papel (ADR 0022, hoy en el ADR 0027).
- ~~«Quién es».~~ Solo nombre, GitHub y LinkedIn, en `/about` (ADR 0024).
- ~~«Cómo está hecho».~~ Sale del home y se queda como caso de estudio en el cuaderno (ADR 0024).
