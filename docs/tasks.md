# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test`, `build` y
`verify:dist` en verde. Las listas de F0–F4 y R0–R4 están en `docs/archivo/tareas-anteriores.md`.

**Fase activa:** P3 (capítulos 4 a 6). P0, P1 y P2 cerradas: Montse las revisó y las mergeó (PR #1,
PR #2 y PR #3).

**Estado del código:** la película cuenta los capítulos 0 a 6; debajo sigue la versión anterior (los
actos 5 y 6 y las secciones del home). La película la reemplaza por capítulos (ADR 0021).

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
- Transición, resuelta en P2: el acto 2 y su «mesa que jugaste arriba» salieron con los capítulos 1
  a 3, y el archivo `01-question.md` del acto 1 salió con ellos (antes de lo previsto: ya no se
  mostraba). `acts.ts` sigue hasta P4, con el capítulo que cuenta cada acto retirado.
- [x] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS), con el PR #2.
- [x] Revisión de P1 por Montse (PR #2, mergeado).

## P2 · Capítulos 1 a 3

- [x] Los capítulos en tramos (`src/lib/chapters.ts`, `src/lib/film/timeline.ts`): cada capítulo es
      una serie de tarjetas en el flujo normal de la página, cada una con su largo en pantallas, y la
      tarjeta se queda abajo mientras su tramo pasa. El teclado recorre la película en orden y el
      scroll sigue siendo el nativo. La película sigue midiendo 35 pantallas, así que cada punto de
      luz cae en el capítulo que le da el ADR 0027 (test).
- [x] Capítulo 1, «Dos cuartos»: los cuartos, la pared y los focos; una ronda del dilema (el otro
      traiciona siempre, `src/lib/pd/round.ts`); las dos columnas con la mejor respuesta de
      `src/lib/pd/bestReply.ts`; el tablero de 2×2 ilustrado, con una nota en cada celda marcada; la
      trampa; el enlace a *The Evolution of Trust*.
- [x] Capítulo 2, «¿Y si pudieran hablar?»: el chat con tres mensajes escritos
      (`src/lib/film/talk.ts`), la respuesta del otro, los globos sobre la pared y el *cheap talk*.
      Sin segunda ronda del dilema.
- [x] Capítulo 3, «La matriz se dobla»: el tablero se dobla en el dado, «otro juego, la misma
      tensión» (regla (g)), la decisión con `PAYOFFS` (`src/lib/table/decision.ts`, antes el
      momento 1), el dado que gira y cae en su cara, las monedas, y el hilo que aguanta o se rompe
      (con el carrete de la esquina). Decidir cierra la respuesta del capítulo 0.
- [x] Todo número de la película sale del código: las leyendas y las claves `film.*` no llevan
      cifras escritas a mano, solo marcadores que se llenan con `src/lib/film/values.ts` (`src/lib/pd/`
      y `PAYOFFS`). Cada resultado posible se resuelve en el build (`src/lib/film/lines.ts`).
- [x] Sale la versión anterior de lo que estos capítulos reemplazan: el acto 2, el archivo del acto 1
      y el modo del momento 1 de la mesa, con su clave. El enlace de vuelta de `/dilemma` lleva al
      capítulo 1. `docs/sources.md` dice dónde se usa cada cifra ahora.
- [x] Tests: el dilema se juega una vez, las dos columnas muestran que traicionar paga más, los pagos
      de la decisión salen de `PAYOFFS`, el capítulo 3 dice que es otro juego, las cifras y citas de
      las leyendas registradas y en paridad, la regla (h) de `/dilemma` contra las leyendas, la
      coreografía de cada tramo (también con movimiento reducido) y la luz del ADR 0027.
- [x] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS), jugando todas las
      opciones en tres recorridos: compu en inglés (promete, coopera, promete en el chat, tira el
      dado), celular en español (no promete, traiciona, «no te prometo nada», se queda los 14) y
      celular en inglés (promete, no juega la ronda, «confía en mí», se queda los 14 y el hilo se
      rompe). En `scratch/p2-review/` (local, no se versiona).
- [x] Revisión de P2 por Montse (PR #3, mergeado).
- Transición, hasta P5: `/dilemma` conserva su ejercicio de mejor respuesta (`BestResponse`). Pasa
  al capítulo 1 (ADR 0023), pero quitarlo de `/dilemma` pide reescribir su prosa con la matriz
  estática, que es trabajo del cuaderno (P5, ADR 0024).
- Transición, hasta P3: el acto 3 abre con «Dos razones podrían explicar por qué», que ahora sigue
  al capítulo 3. El capítulo 4 lo reemplaza.

## P3 · Capítulos 4 a 6

- [x] Capítulo 4, «Dos voces»: la nube (lo que el otro espera, con la cara de quien espera en su
      globo) y el pergamino (mi palabra, con el sello del hilo) llegan sobre el círculo
      (`src/lib/film/voices.ts`, `Voices.astro`); las dos razones, con las citas de la aversión a
      la culpa; casi siempre dicen lo mismo; el truco de Vanberg (2008), cambiar a la persona, con lo
      que predice cada voz. Las voces miran al otro, y en el truco se miran entre ellas.
- [x] Capítulo 5, «El apagón»: se va la luz y a oscuras solo se ven los ojos; el cuadrado se va a
      otra mesa, todavía atado por el hilo, y el triángulo se sienta sin hilo (ADR 0027). El caso
      fijo ilustrativo se dice en pantalla dos veces (regla (k)). La nube mira a quien se sienta y el
      pergamino al cuadrado a quien se le dio la palabra. El mazo (`src/lib/film/deck.ts`): seis
      cartas, una persona distinta en cada una, con su mensaje; boletos o deslizar (quedarse a la
      izquierda, tirar a la derecha); la persona de cada carta se sienta en el escenario; al final,
      cuántas promesas cumplió, sin puntaje de pagos. Después, como quien recibe, la apuesta en la
      escala de cinco puntos (`src/lib/film/bet.ts`), la luz que parpadea para mostrar el cambio y
      la escala con lo que apostaron los receptores reales, 70 contra 68
      (`PROMISED_RECIPIENT_BELIEFS`).
- [x] Capítulo 6, «La gente real»: adivinar antes de ver con una barra (`src/lib/film/guess.ts`), dos
      letreros de papel que bajan sobre la mesa con 73 % y 54 % (`ROLL_COUNTS`) y, en su nube, 70 y 68;
      las 192 personas y las 8 rondas (`SWITCH_DESIGN`, con test contra las celdas); la conclusión de
      Vanberg (2008), con el pergamino encendido.
- [x] Todo número de la película sale del código, como en P2 (`src/lib/film/values.ts`).
- [x] Sale la versión anterior de lo que estos capítulos reemplazan: la mesa del momento 2 (su
      componente, su script, `RoleMark`, `moment2.ts`, `strings.ts`, `drawWith` y 40 claves
      `table.*`; quedan las 6 que usa la tabla de `/vanberg`), el escenario oscuro que la envolvía
      (`.stage` en `tokens.css` y `base.css`, `STAGE` en `palette.ts` y sus tests) y los actos 3
      y 4. `/vanberg` vuelve al capítulo 6. `docs/sources.md` dice dónde se usa cada cifra, y cuáles
      ya no se muestran (1/2, el chat, el medidor 69/48).
- [x] Largo: una tarjeta se queda abajo solo lo que dura su tramo menos su hueco y su alto, así que las
      tarjetas altas piden tramos largos. El capítulo 5 mide 7 pantallas y la película 36.25; cada
      punto de luz sigue en su capítulo, y un test deja la lámpara justo donde empieza el capítulo 7
      (antes, un test fijaba 35 pantallas). El capítulo 7 queda planeado en 4.25.
- [x] La película recorta su desborde horizontal: una carta que sale volando ya no aleja la vista en
      el celular.
- [x] Tests: la regla (f) sobre el mazo (una persona distinta por carta, una decisión por carta y
      nada más, y un conteo de promesas, nunca de pagos); la regla (k) (las cifras del experimento
      solo en los capítulos 5 y 6 y con su cita, el caso fijo dicho en pantalla, las voces con sus
      citas, y ninguna línea que siga a una elección del visitante le nombra una razón ni juzga lo
      que adivinó); el registro de cifras; la coreografía de cada tramo, también con movimiento
      reducido; cada cuadro quieto y cada corte en su propio tramo.
- [ ] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS), con el recorrido de
      los capítulos 4 a 6.
- [ ] Revisión de P3 por Montse.
- PENDIENTE(datos): el código guarda las sumas exactas de 70 y 68 (215 / 309 y 200.5 / 294), que
  salen de las medias verificadas y del total verificado; falta cotejarlas contra `switch.dat`
  (`docs/sources.md`, `vanberg-beliefs`).
- Transición, hasta P4: el acto 6 del home todavía dice que el navegador corre «el código de la mesa,
  en sus tres momentos». Sale con el acto en P4.
- Transición, hasta P5: la prosa de `/vanberg` todavía habla de «la mesa» («lo que la mesa deja
  fuera»). La reescribe el cuaderno (ADR 0024).

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
