# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test`, `build` y
`verify:dist` en verde. Las listas de F0–F4 y R0–R4 están en `docs/archivo/tareas-anteriores.md`.

**Fase activa:** P7, los ajustes de la revisión externa (`docs/p7-review-plan.md`), en pasos
chicos, uno por sesión, empezando por P7.0. P0 a P6 cerradas: Montse las revisó (PR #1 a PR #9).
P4 se cerró sin videos, como ella lo pidió: dio por hecho el de la película entera.

**Fase siguiente:** F5, la QA, cuando se cierre P7.

**Estado del código:** la película cuenta sus nueve capítulos y termina en los créditos del
capítulo 8, con su sonido, apagado hasta que el visitante lo enciende; el cuaderno tiene sus seis
páginas, su panel en todas las páginas, sus lupas en la película y su pie. Cada página tiene su
póster para compartir, y cada build se pesa contra los presupuestos. De la versión anterior ya no
queda nada en el sitio.

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
- [x] El papel del cuaderno en `palette.ts` y `tokens.css`, con sus tests: se hizo con el cuaderno, en
      P5 (abajo).
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
- Transición, resuelta en P5: `/dilemma` conservaba su ejercicio de mejor respuesta (`BestResponse`). Pasa
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
      tarjetas altas piden tramos largos. El capítulo 5 mide 7 pantallas, el 6 mide 4.4 y la película
      36.75; cada punto de luz sigue en su capítulo, y un test deja la lámpara justo donde empieza el
      capítulo 7 (antes, un test fijaba 35 pantallas). El capítulo 7 queda planeado en 4.35.
- [x] La película recorta su desborde horizontal: una carta que sale volando ya no aleja la vista en
      el celular.
- [x] Tests: la regla (f) sobre el mazo (una persona distinta por carta, una decisión por carta y
      nada más, y un conteo de promesas, nunca de pagos); la regla (k) (las cifras del experimento
      solo en los capítulos 5 y 6 y con su cita, el caso fijo dicho en pantalla, las voces con sus
      citas, y ninguna línea que siga a una elección del visitante le nombra una razón ni juzga lo
      que adivinó); el registro de cifras; la coreografía de cada tramo, también con movimiento
      reducido; cada cuadro quieto y cada corte en su propio tramo.
- [x] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS), con el recorrido de
      los capítulos 4 a 6 en dos caminos: compu en inglés (promete, tira el dado; en el mazo tira,
      tira, se queda, se queda, tira, tira; apuesta «probablemente tira»; adivina 60 y 45) y celular
      en español (no promete, se queda los 14; en el mazo se queda, se queda, tira, tira, se queda,
      se queda; apuesta «probablemente no tira»; adivina 85 y 80). En `scratch/p3-review/` (local,
      no se versiona).
- [x] Revisión de P3 por Montse (PR #4, mergeado).
- PENDIENTE(datos): el código guarda las sumas exactas de 70 y 68 (215 / 309 y 200.5 / 294), que
  salen de las medias verificadas y del total verificado; falta cotejarlas contra `switch.dat`
  (`docs/sources.md`, `vanberg-beliefs`).
- Transición, resuelta en P4: el acto 6 del home decía que el navegador corre «el código de la mesa,
  en sus tres momentos». Salió con el acto.
- Transición, resuelta en P5: la prosa de `/vanberg` todavía hablaba de «la mesa» («lo que la mesa deja
  fuera»). La reescribe el cuaderno (ADR 0024).

## P4 · Capítulos 7 y 8, y el candado

- [x] Capítulo 7, «Aquí entro yo», la parte abierta (regla (j)): cae la noche, los letreros del
      capítulo 6 suben, la lámpara de la hoja de personajes baja sobre la mesa y salen las estrellas.
      La pregunta de la página como la pregunta de la investigación de Montse, con su nombre en
      primera persona (`author.name`); el motor de simulación en TypeScript, un motorcito de papel
      con dos engranes que giran con el scroll y que toma el lugar del dado; y el sobre sellado: la
      tarjeta misma es el sobre, con el sello del hilo y la frase de estado estampada, sin nada más
      (ADR 0026).
- [x] Capítulo 7, el hallazgo detrás del candado: el contenido del acto 5, repartido en siete
      leyendas sin ampliarse (la tercera razón, por qué el laboratorio no la distingue, la confianza de
      fondo, pesa más en el medio, un mundo para cada valor, lo que gana cada razón con la curva y su
      control, y la comparación entre mundos de la regla (e)), el enlace a `/finding` y el
      `TODO(launch)` del repo del motor. Con el candado abierto, el sobre se abre antes del hallazgo.
      Sus cifras salen de `src/data/curve.json` y de las celdas de Vanberg
      (`src/lib/curve/values.ts`), nunca de las leyendas.
- [x] La curva, rehecha sobre la paleta de la película (ADR 0027): la culpa personal en tinta, el
      compromiso en el oro del hilo y el control en el lila de la voz de lo que el otro espera, con
      casco de tinta en las líneas claras (`src/lib/curve/film.ts`, con tests de contraste y
      daltonismo). La gráfica de culpa de `/finding` sigue en la paleta del cuaderno hasta P5.
- [x] El candado, fuera del build: el plugin `lockFinding` cambia por su stub la curva, el componente
      del hallazgo (`Finding.astro`) y los tiempos de sus tarjetas (`src/lib/film/finding.ts`), así
      que una película cerrada ni siquiera sabe que hay tarjetas después del sobre.
- [x] La luz, igual en los dos estados: el hallazgo alarga el capítulo 7 solo con el candado abierto,
      así que la luz del día lleva el reloj de la película abierta (`lightAt` en
      `src/lib/film/timeline.ts`) y se queda quieta durante el hallazgo, que empieza después del
      anochecer. La película abierta sigue midiendo 36.75 pantallas: el capítulo 7 mide 3.4 abierto
      (13.4 con el hallazgo) y el capítulo 8 queda planeado en 3.95, así que la lámpara sigue justo
      donde empieza el capítulo 7 (test).
- [x] `verify:dist` en la estructura nueva, verde en los dos estados (probado con `under-review` en
      local, sin commit): marcas del hallazgo (`data-finding` y el id de su primera tarjeta, que solo
      nombra un reloj abierto), páginas desbloqueadas y el sello del capítulo 7. Tests: cada marca está
      en las fuentes bloqueadas, ninguna en la parte abierta (leyendas, componentes y claves), y el
      plugin cambia justo esos tres módulos por stubs vacíos.
- [x] Sale lo que el capítulo 7 reemplaza: el acto 5 y «La investigación» del home, con sus archivos,
      su ranura `research-links` y sus claves `section.research.*`. `/finding` vuelve al capítulo 7.
      `docs/sources.md` dice dónde se usa cada cifra de la curva.
- [x] Tests de la regla (j) sobre el capítulo 7: la parte abierta dice la pregunta como la de la
      investigación de Montse y el motor en TypeScript, y nada más (ni pruebas, semilla, generaciones,
      imitación o procedencia, ni el hallazgo, la curva, cifras o marcas del candado); la autora en
      primera persona; el sobre sin leyenda; el hallazgo, su cita y el `TODO(launch)` solo detrás del
      candado; la regla (e) dicha en pantalla. También la coreografía del capítulo (con movimiento
      reducido) y la luz quieta durante el hallazgo.
- [x] Capturas para Montse, sin video (así lo pidió): 1440 y 360 px, EN y ES, con el candado cerrado
      (el build) y abierto (el servidor de desarrollo), con movimiento reducido y sin JS. En
      `scratch/p4-review/` (local, no se versiona).
- [x] Capítulo 8, «Cierre», la promesa cobrada: de vuelta en la primera mesa, bajo la lámpara, el
      motorcito sube y el dado vuelve a flotar como en el capítulo 0. El otro pregunta una última
      vez, según lo que el visitante contestó al principio (prometió, no prometió o no contestó), y
      el visitante contesta con dos boletos, «Lo tiraría» o «Me quedaría los 14», con sus pagos de
      `PAYOFFS`. Es solo una respuesta (ADR 0023): no paga nada, no cambia el hilo, que se queda como
      lo dejó el capítulo 3, y nadie llora; la línea que sigue dice qué haría y cómo lo toma el otro,
      nunca por qué (`nowLine` en `src/lib/film/lines.ts`). La leyenda deja el porqué al visitante.
- [x] Capítulo 8, «¿Cumplí?»: la página pregunta si cumplió la promesa del capítulo 0 (valer los
      próximos minutos), con dos boletos, «Cumpliste» o «No del todo»; los dos esperan un poco
      nerviosos y después se alegran o se calman. En pantalla dice que las respuestas no se guardan
      ni se envían.
- [x] Capítulo 8, los créditos: una tarjeta que sube con el scroll como los créditos de una película
      (`roll` en `Beat.astro`), con el título, la autora (`author.name`, sin perfiles), el reparto
      (cada forma con su papel, `src/lib/film/credits.ts`), «Basada en el experimento de Vanberg
      (2008)», la tipografía, los enlaces al cuaderno (a `/finding` solo con el candado abierto,
      `creditPages`) y «Fin». Durante los créditos el triángulo vuelve a la otra mesa para saludar,
      y al final la película se queda quieta una pantalla en ese último cuadro (`film__hold` en
      `Film.astro`) antes de seguir con la página.
- [x] Largo: los tramos del capítulo 8 suman 3.95 pantallas (1.3, 1.1 y 1.55), así que la película
      abierta sigue en 36.75 y la lámpara justo donde empieza el capítulo 7 (test). Los cortes con
      movimiento reducido salen ahora de la lista de tramos, en el orden de la película, así que
      caen después del hallazgo sin nombrarlo.
- [x] Tests: los tramos del capítulo 8; la vuelta a la primera mesa, la noche hasta el final, las
      caras de cada respuesta, el hilo que no cambia, el saludo del triángulo (la nube sigue mirando
      al cuadrado), todo a la vista en cuatro pantallas y los cortes (`stage.test.ts`); ninguna línea
      tras una respuesta nombra una razón ni paga nada (`lines.test.ts`); los créditos, su reparto y
      sus enlaces según el candado (`credits.test.ts`); la pregunta de la página, las tres preguntas
      del otro, la cita y la autora solo por su clave (`tests/film-captions.test.ts`); el capítulo 8
      entre las fuentes abiertas del candado (`tests/verify-dist.test.ts`).
- [x] Capturas para Montse del capítulo 8, sin video (así lo pidió): 1440 px en inglés y 360 px en
      español, con el candado cerrado (el build) y abierto (el servidor de desarrollo), con
      movimiento reducido y sin JS, y 320 px sin scroll horizontal. En `scratch/p4-review/ch8/`
      (local, no se versiona).
- [x] La frase de estado, exactamente dos veces en `/` y en `/es/` (criterio de salida de P4): el
      sello del capítulo 7 y la entrada «El hallazgo» del cuaderno, que se adelanta al pie de la
      versión anterior hasta que llegue el panel (así lo decidió Montse en esta sesión). Con el
      candado cerrado, la entrada muestra su título y la frase, sin enlace (ADR 0024); abierto,
      enlaza a `/finding` y dice «El manuscrito está en revisión.» (ADR 0026). `STATUS_ON_HOME = 2`.
- [x] `verify:dist`: con el candado cerrado, también falla si alguna página enlaza a `/finding`
      (salvo el cambio de idioma de la propia `/finding`), porque los enlaces al hallazgo son parte
      del candado. Verde en los dos estados (probado con `under-review` en local, sin commit).
      Tests: la entrada del pie (la frase sola en su elemento, el enlace solo con el candado
      abierto), el conteo de dos y los enlaces a `/finding`.
- [x] Sale el acto 6 y «Quién es» del home: su prosa, sus colecciones (`acts` y `sections`), `Act`,
      `HomeSection`, `SectionSegments`, `sections.ts`, la ranura `author-links`, sus claves
      (`section.about.*`, `deeper.link`, `author.github`, `author.linkedin`) y sus tests. Cada acto
      nombra el capítulo que lo representa (`film` en `src/lib/acts.ts`): `/how-its-built` vuelve al
      capítulo 8, cuyos créditos lo enlazan. La regla (h) compara cada página del cuaderno con la
      película entera. `AUTHOR` sigue en `src/config.ts` para `/about` (P5).
- [x] Capturas para Montse, sin video (así lo pidió): el final del home a 1440 px en inglés y a
      360 px en español, con el candado cerrado y abierto (build local con `under-review`), y
      `/finding` cerrado; a 320 px, sin scroll horizontal en los dos estados. En
      `scratch/p4-review/lock/` (local, no se versiona).
- [x] La película entera en un video: Montse lo dio por hecho al revisar P4, sin grabarlo (así lo
      pidió).
- [x] Revisión de P4 por Montse (PR #5, PR #6 y PR #7).
- Transición, resuelta en P4: debajo de «Fin» seguían el acto 6 y «Quién es»; salieron.
- Transición, resuelta en P4: el pie de la versión anterior enlazaba a `/finding` también con el
  candado cerrado; ahora su entrada no enlaza, y `verify:dist` lo comprueba.
- Transición, resuelta en P5: los créditos enlazaban a las páginas del cuaderno que ya existían (`/dilemma`,
  `/vanberg`, `/how-its-built` y, con el candado abierto, `/finding`), con los títulos de los actos.
  `/sources` y `/about` se suman con el panel (`TODO(P5)` en `Closing.astro`).
- Transición, resuelta en P5: la entrada «El hallazgo» vivía en el pie de la versión anterior
  (`SiteFooter.astro`), así que sale en todas las páginas; en `/finding` cerrado la frase se lee dos
  veces (la página y el pie). En P5 pasa al panel, y el pie nuevo del cuaderno no la repite en el
  home, para que siga saliendo dos veces.
- Transición, resuelta en P5: GitHub y LinkedIn no estaban en el sitio; salieron con «Quién es» y vuelven
  con `/about` (ADR 0024).

## P5 · El cuaderno

- [x] El papel del cuaderno (la tarea pendiente de P1), en `palette.ts` y `tokens.css`, de la tinta, el
      papel y el hilo de la película: papel de día (`#f9f0e1`, con un resplandor arriba como el del
      amanecer) y papel de noche (la tinta, `#1d1b3a`), las dos con el grano del papel encima. Tests de
      contraste AA de cada par en los dos temas, de que el papel tiene color y de que sale de la
      película. Los tokens de la versión anterior (los roles, la promesa, las series) salieron con
      sus usos; las distancias de daltonismo de la curva viven ahora junto a sus colores
      (`src/lib/curve/film.ts`).
- [x] Las tipografías: el cuaderno pasa a Fraunces (títulos) y Nunito (texto e interfaz), así que
      Newsreader e Inter salen del sitio con sus archivos y licencias (ADR 0027). Todas las páginas
      cargan los mismos tres archivos (121 404 bytes); JetBrains Mono, solo `/how-its-built`.
- [x] El panel (`src/components/notebook/Notebook.astro` y `notebook.ts`): el botón «Cuaderno», en
      todas las páginas, abre un `<dialog>` modal nativo con las seis entradas, cada una con su línea.
      Esc, el botón de cerrar o un clic fuera lo cierran, y el foco vuelve al botón. En la película el
      botón se queda fijo en la esquina, a un toque de cualquier cuadro; en el celular es solo el
      dibujo del cuaderno, con su nombre para los lectores de pantalla. Sin JavaScript (o sin
      `<dialog>`), el botón es un enlace a la lista del pie.
- [x] La entrada «El hallazgo» pasa del pie al panel: con el candado cerrado, su título y la frase de
      estado, sin enlace; abierto, enlaza a `/finding`, dice «El manuscrito está en revisión.» y lleva
      el `TODO(launch)` del repo del motor (paso 8 del checklist). En el home la frase sigue saliendo
      dos veces: el sello del capítulo 7 y el panel (`STATUS_ON_HOME = 2`).
- [x] El pie del cuaderno (`NotebookFooter.astro`), en todas las páginas, también en el home: las páginas
      del cuaderno (sin `/finding` con el candado cerrado), el enlace EN/ES y, en las páginas del
      cuaderno, «Volver a la película». No lleva la frase de estado. Sale el pie de la versión anterior
      (`SiteFooter.astro`). Las páginas del cuaderno llevan arriba el ícono del hilo, que vuelve a la
      película, el EN/ES y el botón.
- [x] Las lupas (`src/components/film/Magnifier.astro`, `MAGNIFIERS` en `src/lib/notebook.ts`): «El dilema,
      a fondo» en la trampa del capítulo 1, «El experimento de Vanberg, a fondo» en las cifras del
      capítulo 6 y «El hallazgo, a fondo» en la última tarjeta del hallazgo, solo con el candado
      abierto. Una lupa en una tarjeta que la lista no nombra rompe el build.
- [x] Los créditos enlazan a las seis páginas, con `/finding` solo con el candado abierto; sale el
      `TODO(P5)` de `Closing.astro`.
- [x] El cuaderno en código: `src/lib/notebook.ts` (las seis entradas, su orden, sus títulos y líneas, el
      capítulo al que vuelve cada una y qué se puede enlazar según el candado) reemplaza a
      `src/lib/acts.ts`, que sale con las claves `act.*` y `footer.*`. Rutas nuevas: `/sources`,
      `/about`, `/es/sources` y `/es/about`.
- [x] Las seis páginas:
  - `/dilemma`, sin interacción (ADR 0023): la matriz estática (`src/components/pd/Matrix.astro`, de
    `src/lib/pd/game.ts`) marca la mejor respuesta de cada columna, el equilibrio y la celda donde los
    dos estarían mejor. Salen `BestResponse`, su script, `pd/strings.ts`, `pd/text.ts` y 16 claves
    `pd.*`; la mejor respuesta se juega en el capítulo 1.
  - `/vanberg`, sin «la mesa»: la tabla de celdas muestra cada cuenta exacta junto a su tasa, y una
    sección nueva cuenta cómo se volvieron a contar los datos públicos, en fracciones.
  - `/finding`, con el mismo contenido. Su gráfica de culpa sale de `Curve.astro` a un componente propio,
    estático y sin script (`GuiltChart.astro`), en el papel del cuaderno (la culpa personal en tinta,
    como en la curva de la película) y detrás del candado (`LOCKED_MODULES`). Así `/finding` ya no
    carga el script del control de la curva: se cierra la pregunta abierta que venía de F5.
  - `/how-its-built`, un caso de estudio: el storyboard, el motor de escenas con una demostración
    pequeña (`Day.astro` y `src/lib/film/day.ts`: el cielo de la película como lo pinta el motor, y el
    amanecer directo a la mañana mezclado canal por canal, que pasa por gris, contra girando el tono,
    que pasa por rosa: por eso el día tiene una salida del sol), el candado, las fracciones, las
    revisiones que detienen el build, la accesibilidad, el peso y la bitácora de decisiones. Los
    presupuestos medidos y Lighthouse quedan en `TODO(P6)`. La parte del motor de simulación sigue
    detrás del candado, igual.
  - `/sources`, nueva: cada obra con su referencia completa y, debajo, cada clave del registro con sus
    cifras, dónde está en la fuente y dónde se usa, con enlaces a los capítulos y a las páginas
    (`src/lib/sources.ts`, `Sources.astro`). No tiene candado (ADR 0024), así que se ve igual en los
    dos estados (ADR 0026): no lista las fuentes del hallazgo (Kawagoe y Narita, 2014; la creencia que
    la curva deja fija; la curva; las cifras de `/finding`), que el capítulo 7 y `/finding` citan
    donde las usan, ni las cifras retiradas (1/2 y el chat). Donde iría la página de Axelrod (1984)
    dice «Páginas por verificar.», marcado `data-unverified` (`UNVERIFIED` en `src/lib/sources.ts`, atado
    por un test a lo que `docs/sources.md` marca «por verificar»), hasta que se verifique.
  - `/about`, nueva: el nombre, GitHub y LinkedIn (`AUTHOR`), nada más.
  - Cada página lleva arriba una viñeta de la familia de la película (`Vignette.astro`); `/finding`
    cerrado, no.
- [x] La película, a 320 px: el texto del carrete se parte en dos líneas en un celular angosto, así que
      ya no se encima con el enlace de idioma (pasaba desde antes, al prometer) ni con el botón.
- [x] Tests: la paridad de páginas con las rutas nuevas; el cuaderno, sus enlaces según el candado y las
      lupas en las tarjetas que nombra la lista (`src/lib/notebook.test.ts`); el panel (`<dialog>` modal,
      el foco de vuelta al botón al cerrar por cualquier vía, el respaldo sin JavaScript); `/sources`
      (cada clave del registro en un solo lugar, las cifras del registro, descripciones sin cifras,
      nada del hallazgo, `src/lib/sources.test.ts`); la demostración del motor (`day.test.ts`); el papel;
      el título de cada página igual a su entrada; la regla (h) sobre las seis páginas y además sobre
      las líneas del panel, de `/sources` y de la demostración; `verify:dist` (la gráfica de culpa entre
      los módulos bloqueados, la entrada del panel, y ni el pie ni `/sources` llevan la frase).
- [x] Revisado con el build: el panel solo con el teclado, en inglés a 1440 px y en español a 360 px
      (Tab llega al botón, Enter abre con el foco en «Cerrar», Tab se queda dentro, y Esc, cerrar o un
      clic fuera lo cierran con el foco de vuelta en el botón); 320 px sin scroll horizontal en las 14
      páginas; `verify:dist` en verde en los dos estados (con `under-review` en local, sin commit), y el
      artículo de `/sources` igual byte a byte en los dos.
- [x] Capturas para Montse: cada página a 1440 px en inglés y a 360 px en español, en claro y oscuro,
      con el candado cerrado (el build) y abierto (build local con `under-review`); el panel abierto;
      las lupas de los capítulos 1, 6 y 7; los créditos; sin JavaScript; el carrete a 320 px. En
      `scratch/p5-review/` (local, no se versiona).
- [x] De la revisión de Montse, antes del PR: el paso 3b del checklist (decidir con un ADR, antes de
      abrir el candado, si `/sources` lista las cifras del hallazgo); «Páginas por verificar.» para
      Axelrod en `/sources`; y `deploy.yml` se detiene si `dist/` todavía lleva un `TODO(` (como el
      `TODO(P6)` de `/how-its-built`) o una fuente `data-unverified` (`tests/launch.test.ts`). Hasta
      ahora eso lo pedía solo el checklist, a mano (pasos 3 y 8). De paso, `deploy.yml` decía que era
      el paso 8 (es el 9), y los dos workflows nombraban el ADR 0015, archivado.
- [x] Revisión de P5 por Montse (PR #8, mergeado).

## P6 · Pulido

- [x] **El sonido** (ADR 0025): apagado por defecto, con un botón «Sonido» en la esquina de la
      película, junto al carrete, que dice su estado (`aria-pressed`) y solo aparece donde hay Web
      Audio; sin JavaScript no está. En el celular es solo el dibujo, y aparece cuando el título del
      primer cuadro se desvanece (el título ocupa el ancho y la fila de arriba es del idioma). La
      partitura es pura y con tests (`src/lib/film/sound.ts`): el dado al lanzarse y al caer, las dos
      burbujas del chat, el sello del sobre y un tema corto al final de los créditos, en do mayor
      pentatónico. Cada señal va con algo que se ve (`CUE_SIGHT`), ninguna satura (un test suma sus
      voces) y nada se guarda: cada visita empieza en silencio. La reproduce
      `src/components/film/sound.ts`, sin archivos de audio. Con movimiento reducido el dado no gira,
      así que solo suena al caer.
- [x] **El título de la pestaña:** al irse a otra pestaña cambia a una línea sobre la promesa, según
      el hilo de la película (sin promesa, atada, cumplida o rota), y vuelve al regresar; en las
      páginas del cuaderno, la línea sin promesa. **La consola:** una nota breve con el enlace a
      `/how-its-built` en el idioma de la página. Las dos van en el script del panel del cuaderno, que
      carga cada página, así que el sitio sigue con los tres scripts que lista el ADR 0025
      (`src/lib/details.ts`, `src/components/notebook/details.ts`).
- [x] **Los pósteres de Open Graph:** uno por página y por idioma (14), de 1200 × 630, dibujados en
      SVG con la paleta de la película: una tarjeta de papel con «I promise» / «Te lo prometo» y el
      título de la página (y la pregunta del sitio bajo el de una página del cuaderno), y el círculo y
      el cuadrado unidos por el mismo hilo de la película, en una hora del día distinta por página. No
      llevan la frase de estado ni nada del candado. `@resvg/resvg-js` 2.6.2 (verificada con
      `npm view`), solo de desarrollo, los pasa a PNG en el build (`src/pages/posters/`). Como resvg no
      lee woff2 ni ejes variables, los pósteres tienen sus propios cortes estáticos TrueType de
      Fraunces y Nunito, de Fontsource 5.3.0, con su procedencia y su SHA-256
      (`src/assets/fonts/posters/`); nunca llegan a `dist/`. Los títulos se parten en renglones
      medidos con los anchos de la fuente, y equilibrados. Cada página lleva `og:title`, `og:url`,
      `og:image` (con tamaño, tipo y texto alternativo) y `twitter:card`. La descripción de cada
      página queda para F5 (`TODO(F5)` en `BaseLayout.astro`).
- [x] **Los presupuestos de peso** con su script: `npm run budgets` (`scripts/budgets.mjs` y
      `src/lib/budgets.ts`) pesa cada página de `dist/` como la pediría un navegador (el HTML, los
      scripts con sus imports, las hojas de estilo, las fuentes que la página necesita según su
      `unicode-range` y el ícono; el texto en gzip, las fuentes tal cual) y falla si una se pasa.
      Corre en CI y en `deploy.yml`, después de `verify:dist`. Los techos se leen en KiB, el del JS
      en los dos home y los otros dos en cada página (ADR 0028, que precisa el 0025, decidido con
      Montse en la revisión de P6). Hoy: el JS del home, 14.3 KiB de 40;
      las fuentes, 118.6 KiB de 160 (158.0 en `/how-its-built`, con JetBrains Mono); la primera carga
      del home, 207 KiB de 450.
- [x] **Lighthouse** 13.5.0 en celular emulado (moto g power, 4G lenta simulada, CPU 4×), tres
      corridas por home contra `npm run preview`: LCP de 2.11 s en `/` y en `/es/` (techo: 2.5 s),
      rendimiento 0.98. `scripts/lighthouse.mjs` toma la mediana y escribe `src/data/lighthouse.json`
      con su procedencia; `/how-its-built` lo cita en una tabla nueva (en «Peso y velocidad», cada
      techo junto a lo medido), que reemplaza el `TODO(P6)`. Las cifras viven en la tabla, no en la
      prosa. Lighthouse no es dependencia: se corre aparte, con la versión fijada (el comando está en
      el script). Los informes completos, en `scratch/p6-review/lighthouse/`.
- [x] Tests: la partitura (señales, envolventes, tono, sin saturar, el tema), su conexión con la
      película y el botón; la pestaña y la consola; los presupuestos (qué pide una página, imports,
      `unicode-range`, un sitio de prueba en `tests/fixtures/budgets-dist/`, CI y deploy); los pósteres
      (que cada título cabe, que cada carácter tiene glifo, la paleta, el dibujo igual al de
      `Character.astro`, el PNG de 1200 × 630, las etiquetas); la medición de Lighthouse (la mediana,
      la procedencia, el LCP y los pesos dentro de los techos).
- [x] Revisado con el build, con el candado cerrado y abierto (`under-review` en local, sin commit):
      `verify:dist` y `budgets` en verde en los dos; en Chrome, cada señal arranca exactamente sus
      voces (el sello y el tema, solo la primera vez que se ven con el sonido encendido), el título de
      la pestaña cambia y vuelve, la consola muestra su nota y la página no da errores. A 320 px, sin
      choques en la esquina.
- [x] De la revisión de Montse: el botón de sonido no respondía a un clic real. Encima de él
      estaban la franja de la esquina (`.corner--film`, de todo el ancho) y los capítulos
      (`.film__chapters`, sobre todo el escenario); las pruebas y el video lo encendían con
      `.click()` por script, que se salta esa comprobación. Las dos capas dejan pasar ahora los clics
      y los toques (`pointer-events: none`), y solo los toman las tarjetas, como ya hacían sus beats,
      y los enlaces, botones y el panel de la esquina. Probado con un clic de mouse real
      (`Input.dispatchMouseEvent`) a 1440 px y con un toque real (`Input.dispatchTouchEvent`) a
      360 px, en EN y ES, en dev y en el build, a lo largo de la película; cuando una tarjeta pasa
      encima del botón lo tapa a la vista, y el toque es de la tarjeta. Con clics reales también: el
      boleto del capítulo 0, el botón del cuaderno, cerrar el panel por su botón y por el fondo, un
      enlace del panel y el enlace de idioma. Un test fija la cadena de capas.
- [x] Video con sonido para Montse: la película en compu (EN, 1440 px) y en celular (ES, 360 px),
      con el sonido encendido y las cinco señales; capturas del botón (apagado, encendido, celular,
      320 px, movimiento reducido, sin JavaScript), los 14 pósteres y la tabla de `/how-its-built` en
      claro y oscuro. En `scratch/p6-review/` (local, no se versiona).
- [x] Revisión de P6 por Montse (el PR #9, mergeado).

## P7 · Ajustes de la revisión externa

El porqué de cada paso está en `docs/p7-review-plan.md`; la evidencia (archivos, líneas y
mediciones), en `docs/p7-external-review.md`. Cada paso cabe en una sesión corta,
termina en verde (`check`, `test`, `build`, `verify:dist` y `budgets`) y deja el sitio entero: se
puede parar después de cualquiera. El número del paso (`7.1.3`) va en el commit. Un paso
**(Montse)** es una decisión o aprobación suya: el agente prepara borradores, capturas u opciones,
pero no decide. «Dep.» dice de qué depende un paso, si depende de algo más que el anterior.

### P7.0 · Decisiones y documentos (no toca `src/`)

- [x] **7.0.1** El plan en el repo: `docs/p7-review-plan.md`, la revisión copiada en
      `docs/p7-external-review.md`, P7 en `phases.md` y en este archivo, y `AGENTS.md` al día.
- [x] **7.0.2** Borradores en EN y ES de los cuatro textos nuevos: la descripción del home, «Ver de
      nuevo», el progreso para lectores de pantalla («Capítulo 5 de 9») y la frase nueva del
      capítulo 8 (reemplaza a `film.closing.private`). En `scratch/`, para Montse.
- [x] **7.0.3 (Montse)** Aprueba o corrige los cuatro textos. Aprobó la opción A de cada uno
      (`scratch/p7-0/textos.md`):
      - la descripción del home: «An illustrated film you scroll through: why people keep promises
        that no longer pay, from the prisoner’s dilemma to Vanberg’s experiment (2008).» / «Una
        película ilustrada que avanza con el scroll: por qué la gente cumple promesas que ya no le
        convienen, del dilema del prisionero al experimento de Vanberg (2008).»;
      - «Watch again» / «Ver de nuevo»;
      - el progreso, con el número de la tarjeta sobre 8, no «de 9» (la película cuenta desde 0):
        «Chapter {n} of 8» / «Capítulo {n} de 8»;
      - la frase del capítulo 8: «Everything you chose stays in this tab: nothing is sent
        anywhere.» / «Todo lo que elegiste se queda en esta pestaña: nada se envía a ningún lado.»
        No promete que se borre al cerrar la pestaña: el navegador puede devolver `history.state`
        al reabrirla o al restaurar la sesión, y el ADR 0029 lo dice con ese matiz.
- [x] **7.0.4 (Montse)** Decide sí o no: la tarjeta al costado también en la compu; el enlace EN/ES
      que conserva el capítulo; la autora en los pósteres. Decidió:
      - la tarjeta al costado en la compu: **no** (sigue centrada, ADR 0027; 7.5.4 no se hace);
      - el enlace EN/ES que conserva el capítulo: **no** (ADR 0013 sin cambios; 7.6.8 no se hace).
        Necesitaba JS, y al cambiar de idioma se abre otra entrada del historial, sin lo jugado;
      - la autora en los pósteres: **sí**, una firma pequeña con `author.name` y nada más (precisa
        el ADR 0021; 7.6.9).
- [x] **7.0.5 (Montse)** Elige la opción de Axelrod (1984): B (recomendada), A o C. Con B, comprueba
      en el artículo de 1981 que los pagos, `2R > T + S` y la figura están ahí. Eligió **B**. Montse no
      tenía acceso al artículo; el agente lo cotejó contra la copia de JSTOR en el sitio de Axelrod
      (<https://websites.umich.edu/~axe/research/Axelrod%20and%20Hamilton%20EC%201981.pdf>):
      - Axelrod, R. y Hamilton, W. D. (1981). The Evolution of Cooperation. *Science*, 211(4489),
        1390–1396;
      - la figura 1 (p. 1392) da R = 3, S = 0, T = 5 y P = 1, solo el pago del jugador A (los pares
        del sitio salen por simetría), y su pie define el juego por T > R > P > S y R > (S + T)/2;
      - la condición está escrita como R > (S + T)/2, la misma que `2R > T + S`; la nota 17 (p. 1396)
        dice que descarta que turnarse para explotarse sea mejor que cooperar;
      - el torneo y Tit-for-Tat, que ganó las dos rondas: p. 1393;
      - «la sombra del futuro» no está: el artículo habla de la probabilidad *w* de volver a
        encontrarse. Por eso esa oración de `/dilemma` cambia (7.2.8), con el texto que Montse
        aprobó: «Axelrod and Hamilton (1981) model it as the chance that the same two meet again.
        Axelrod invited programs…» / «Axelrod y Hamilton (1981) lo miden como la probabilidad de que
        los mismos dos vuelvan a encontrarse. Axelrod invitó a programas…», y «The condition comes
        from Axelrod and Hamilton (1981).» / «La condición viene de Axelrod y Hamilton (1981).».
- [x] **7.0.6** ADR 0029, la memoria de la película en la pestaña (precisa el 0023), con la frase del
      capítulo 8 aprobada en 7.0.3.
- [x] **7.0.7** Borrador de la lista cerrada de señales del sonido, cada una con lo que se ve.
- [x] **7.0.8 (Montse)** Aprueba la lista de señales. Aprobó completa la de 7.0.7
      (`scratch/p7-0/senales.md`): las cinco de P6 y ocho nuevas, cada una con lo que se ve:
      - `on`: el acorde al encender el sonido;
      - `coins`: las monedas, en los capítulos 1 y 3;
      - `snap`: el hilo que se rompe en el capítulo 3, antes de las monedas, no encima;
      - `switch`: el interruptor del apagón y del parpadeo;
      - `card`: la carta que vuela, salvo con movimiento reducido;
      - `sign`: el letrero que enciende su cifra; se enciende, no se voltea, y no juzga la adivinanza;
      - `voices`: las dos voces que llegan en el capítulo 4;
      - `lights-on`: la luz que vuelve después del apagón.
- [x] **7.0.9** ADR 0030, las señales del sonido (precisa el 0025).
- [x] **7.0.10** ADR 0031, la tarjeta al costado (precisa el 0027 si va en la compu), con el porqué de
      no bloquear la rotación (WCAG 1.3.4).
- [x] **7.0.11** Lo que 7.0.4 aprobó lleva su ADR (el número que siga); lo que no, pasa a «Preguntas
      cerradas». 7.0.5 eligió B: el mismo ADR, u otro, precisa la línea del ADR 0021 que nombra «los
      pagos del dilema de Axelrod (1984)». Hecho: ADR 0032 (la autora en los pósteres) y ADR 0033 (la
      fuente del dilema); la tarjeta en la compu y el enlace EN/ES con el capítulo, a «Preguntas
      cerradas».
- [x] **7.0.12** `docs/decisions/README.md` al día; revisar que ningún documento vigente contradiga a
      otro.
- [x] **7.0.13 (Montse)** Revisión de P7.0 (el PR #10, mergeado).

### P7.1 · Cimientos: robustez y refactor (puntos 16 `film.ts`, 1 y 2A)

Partir `film.ts` (7.1.1 a 7.1.4) y el respaldo (7.1.5 y 7.1.6) no chocan con ningún ADR: pueden
empezar en cuanto se cierre P6, sin esperar a P7.0.

- [x] **7.1.1** Referencia «antes»: recorrer la película entera con clics reales a 360 y 1440 px,
      con las capturas y la lista de pasos en `scratch/p7-1/` (no se versiona).
- [x] **7.1.2** Sacar de `film.ts` los controladores de los capítulos 0 a 2 (`arrival`, `two-rooms`,
      `talk`) a `src/components/film/chapters/*.ts`, junto a su `.astro`. El ciclo de
      `requestAnimationFrame` y el estado se quedan en `film.ts`. Comportamiento idéntico.
- [x] **7.1.3** Lo mismo con los capítulos 3 a 5 (`fold`, `two-voices`, `blackout`). El capítulo 4 no
      tiene elecciones: no lleva controlador.
- [x] **7.1.4** Lo mismo con los capítulos 6 a 8 (`real-people`, `my-research`, `closing`). Recorrido
      «después» igual a la referencia de 7.1.1: los 21 pasos con el mismo estado a 1440 y 360 px, y con
      movimiento reducido las mismas capturas, byte a byte.
- [x] **7.1.5** Respaldo, parte 1: `BaseLayout.astro` pone la clase `js` solo si el navegador corre
      módulos.
- [x] **7.1.6** Respaldo, parte 2: `start()` marca `data-film-ready` y, si lanza un error, quita
      `js`; un temporizador de unos 4 s quita `js` si la película nunca arrancó. Verificar
      bloqueando el script del build: se ve el storyboard, no la escena rota. También se revisa al
      terminar de leer la página (`DOMContentLoaded`, cuando el módulo ya corrió o falló), así que un
      script bloqueado cae al storyboard enseguida; y si el script llega después de los 4 s, la
      película no arranca encima del storyboard. Verificado bloqueado, roto y tardío.
- [x] **7.1.7** `src/lib/film/memory.ts`, puro y con tests: el registro de acciones (prometer, la
      ronda, cada columna, el mensaje, la decisión con su cara del dado, cada carta, la apuesta, las
      dos adivinanzas y las dos respuestas finales), con versión y validación al leer (lo raro se
      ignora). Todavía sin conectar. Dep.: ADR 0029 (7.0.6).
- [x] **7.1.8** Cada controlador anota su acción con `history.replaceState`.
- [x] **7.1.9** Al cargar, las acciones guardadas se reproducen sin animación por el mismo camino
      de código que un clic: boletos, salidas `aria-live`, carrete, mazo y escala quedan igual.
- [x] **7.1.10** En las páginas del cuaderno, si el visitante llegó desde la película, «Volver a la
      película» y «← Volver a …» hacen `history.back()`. Va en el script del panel (sin script
      nuevo, ADR 0025); sin JS siguen siendo enlaces normales.
- [x] **7.1.11** El capítulo 8 con la frase nueva del ADR 0029, en EN y ES.
- [x] **7.1.12** Verificación de salida (los tres caminos de vuelta, pestaña nueva vacía, sin JS,
      script bloqueado, peso del JS) y capturas para Montse. Con clics y toques reales, a 1440 px (EN)
      y 360 px (ES): recargar, Atrás (sin la caché del navegador) y «← Volver a …» devuelven el estado
      jugado completo; una pestaña nueva empieza vacía; sin JS, con el script bloqueado, con error o
      tardío se ve el storyboard; el JS del home pesa 17.7 KiB de 40. Capturas en `scratch/p7-1/review/`
      (local, no se versiona).
- [x] **7.1.13 (Montse)** Revisión de P7.1 (el PR #11, mergeado).

### P7.2 · Metadatos, SEO y datos (puntos 4, 13 y 6)

Dep.: P7.0. Puede ir en paralelo a P7.1.

- [x] **7.2.1** `<meta name="description">` y `og:description` por página e idioma: las del cuaderno
      salen de su línea del panel; la del home, de la clave nueva (7.0.3); `/finding` cerrado lleva
      la pregunta del sitio, no la frase de estado. Quita el `TODO(F5)` de `BaseLayout.astro`.
      Hecho en `src/lib/meta.ts`, con la clave `site.description`. `/finding` lleva la pregunta del
      sitio también con el candado abierto: no hay texto aprobado que hable del hallazgo.
- [x] **7.2.2** `og:locale`, `og:locale:alternate` y `og:site_name`. El nombre es el de los
      pósteres («I promise» / «Te lo prometo»); los idiomas, `en_US` y `es_MX` (Open Graph pide
      idioma y territorio; Montse lo confirma en 7.2.11).
- [x] **7.2.3** Test: las 14 páginas llevan descripción, en paridad y sin frases prohibidas;
      `verify:dist` revisa que la descripción no filtre el candado. `tests/meta.test.ts`; `verify:dist`
      exige en los dos estados una descripción en cada página, igual en `og:description` y sin la
      frase de estado, y con el candado cerrado sin sus marcas.
- [x] **7.2.4** `src/pages/404.astro`, bilingüe en una sola página (GitHub Pages sirve un único
      `404.html`), con el escenario y los dos enlaces de vuelta. El escenario al amanecer con el
      círculo y el cuadrado preocupados; el título y una línea en cada idioma, con su `lang`
      (`notfound.*`, textos nuevos que Montse revisa en 7.2.11), y «Volver a la película» en cada uno.
      Lleva `noindex`, y `verify:dist` no le pide descripción.
- [x] **7.2.5** `noindex` en `/finding` según `findingUnlocked()`; `verify:dist` lo exige con el
      candado cerrado y lo prohíbe con el candado abierto. También exige `noindex` en la 404 y lo
      prohíbe en cualquier otra página.
- [x] **7.2.6** `src/pages/sitemap.xml.ts`, propio y sin dependencias, con las alternativas de
      idioma; con el candado cerrado no lista `/finding`, y `verify:dist` lo comprueba. Sin
      `robots.txt` (un sitio de proyecto no está en la raíz del dominio). El XML sale de
      `src/lib/sitemap.ts`; `verify:dist` revisa además que cada URL sea una página del build, que no
      falte ninguna y que la 404 no esté.
- [x] **7.2.7** `theme-color` y `apple-touch-icon` en PNG de 180 px, con el mismo proceso de resvg que
      los pósteres. `theme-color`: sobre la película, su cielo del amanecer; en el cuaderno y la 404,
      el brillo de arriba del papel, de día o de noche según el tema. El ícono es el de la pestaña,
      forma por forma (un test lo compara con `public/favicon.svg`), sobre el cielo del amanecer.
- [x] **7.2.8** Axelrod según 7.0.5 (B): Axelrod y Hamilton (1981) reemplaza al libro de 1984 en
      `docs/sources.md` (verificada, con sus páginas), `src/content/figures.ts`, `src/lib/sources.ts`
      (sale de `UNVERIFIED`), la clave `sources.*` de los dos idiomas, los comentarios de
      `src/lib/pd/` y `src/lib/film/values.ts`, la prosa de `/dilemma` en EN y ES (las oraciones
      aprobadas en 7.0.5) y sus tests, como dice el ADR 0033; el paso 9 de
      `docs/launch-checklist.md` deja de nombrar a Axelrod (1984). El candado de `deploy.yml`
      contra `data-unverified` se queda.
      Hecho con la clave `axelrod-hamilton-1981` y su DOI (cotejado en Crossref). `sources.at.*`
      dice dónde está cada cosa en el artículo, con las páginas impresas en *Science*: la figura 1,
      su pie y *w* (la probabilidad de volver a encontrarse), p. 1392; el torneo, p. 1393; la nota
      17, p. 1396. La página de *w* no estaba en el ADR 0033: se tomó de la misma copia de JSTOR.
- [ ] **7.2.9 (Montse)** Coteja 70 y 68 contra `switch.dat` (el `PENDIENTE(datos)` de P3). Si no se
      puede, decide cómo queda registrado. Lo que hay que ver: la suma de lo que apostaron los
      receptores con una promesa, en la escala de 0 a 1 en cuartos, da 215 sobre 309 sin cambio de
      pareja y 200.5 sobre 294 con cambio (`docs/sources.md`, `vanberg-beliefs`). No bloquea el PR
      de P7.2: si coincide, sale el `PENDIENTE(datos)` de `docs/sources.md` y de P3.
- [x] **7.2.10** Prueba en los dos estados del candado (`under-review` en local, sin commit),
      revisión de las 14 cabeceras y capturas para Montse. En los dos estados pasan `check`, `test`,
      `build`, `verify:dist` y `budgets`; abierto, `/finding` pierde el `noindex` y entra al sitemap
      (14 entradas; cerrado, 12). Las 15 cabeceras (las 14 y la 404) y las capturas a 360 y 1440 px,
      en `scratch/p7-2/review/` (local, no se versiona), con un README.
- [ ] **7.2.11 (Montse)** Revisión de P7.2 (el PR). Además de las capturas, confirma o corrige:
      - los textos nuevos de la 404: «Page not found» / «Página no encontrada» y «There is nothing
        at this address.» / «En esta dirección no hay nada.»;
      - `es_MX` como el español de Open Graph (o `es_ES`, u otro: es una línea de `src/lib/meta.ts`);
      - la línea «En la fuente» de Axelrod y Hamilton (1981): «La figura 1 y su pie, y la
        probabilidad de volver a encontrarse, p. 1392; el torneo, p. 1393; la nota 17, p. 1396.»

### P7.3 · La película: experiencia (puntos 7, 9, 10 y 11)

Dep.: P7.1 (los controladores por capítulo; 7.3.7 también la memoria).

- [x] **7.3.1** El chat en orden: al elegir aparece tu burbuja azul a la derecha y los boletos se van
      (sale la regla de `Talk.astro` que esconde `.bubble--you` con JS). Orden: pregunta, tu
      mensaje, respuesta, como en el storyboard.
      Se van también los tres boletos y «No te cuesta nada»; el foco pasa a tu burbuja (que no entra
      en el orden de tabulación), y la respuesta llega un momento después, sin animación con
      movimiento reducido.
- [x] **7.3.2** El progreso, la lógica: función pura sobre los tramos de `timeline.ts` (capítulo y
      cuánto se llenó cada cuenta), con test.
      `progressAt()` en `src/lib/film/progress.ts`: el capítulo cambia cuando sube su primera
      tarjeta, igual que el tiempo del escenario (`LEAD`), y en ese momento la cuenta anterior está
      llena. Las cuentas solo se llenan en orden y nunca se vacían al avanzar.
- [x] **7.3.3** El progreso, a la vista: un hilo fino con 9 cuentas que se llenan con el scroll.
      Pasivo y sin foco (ADR 0024); texto oculto «Capítulo 5 de 9» para lectores de pantalla.
      Revisado a 320 px junto al carrete, el sonido y el cuaderno.
      Va dentro de la pastilla del carrete, bajo sus palabras: a 320 px la esquina no tiene lugar al
      lado, y así la pastilla no crece. El texto oculto es el aprobado en 7.0.3, «Chapter {n} of 8» /
      «Capítulo {n} de 8» (clave `film.progress`, con el 8 salido del código); queda fuera de la región
      `aria-live` del carrete, para que no se anuncie a cada capítulo.
- [x] **7.3.4** Vida en reposo, el mecanismo: sin un ciclo siempre encendido; se pausa durante el
      scroll, con la pestaña oculta y con movimiento reducido, y no obliga a repintar los filtros
      SVG del escenario (riesgo del punto 3). Primero el parpadeo cada pocos segundos.
      `src/lib/film/idle.ts`, puro y con test: no corre solo; el ciclo de cuadros de la película, que
      ya corría mientras se ve, le pregunta qué mostrar según cuánto lleva quieto el scroll (1.2 s de
      espera). El scroll, un cambio de tamaño o volver a la pestaña lo reinician; con la pestaña oculta
      no hay cuadros. Solo mueve los ojos, que no llevan filtro. Cada personaje parpadea con su propio
      reloj (cada 3 a 5 s, nunca dos a la vez). Además, con movimiento reducido el ciclo ya no pide
      cuadros si nada se mueve (antes corría siempre): 0 cuadros en 9 s quieto, y las pupilas dejan de
      seguir al puntero.
- [x] **7.3.5** El leve balanceo del dado, y la mirada del cuadrado mientras espera: al círculo y
      luego al boleto.
      En el capítulo 0 el dado ya flotaba y giraba; el que se quedaba quieto era el que espera sobre
      la mesa la decisión del capítulo 3: ese se balancea, cada 3.6 s, dos vaivenes que se apagan, a lo
      más 7°, sobre la esquina de abajo hacia la que se inclina. El cuadrado, mientras el capítulo 0
      espera la respuesta, mira al círculo, luego a los boletos y vuelve, en un ciclo de 7.2 s. Los
      dos, solo en reposo y nunca con movimiento reducido.
- [x] **7.3.6** La llegada: algo cambia a la mitad del tramo, sin cambiar su largo de 3 pantallas
      (el reloj de la luz, ADR 0027).
      Si el visitante no ha contestado, cuando la cámara termina de acercarse (1.8 a 2.05 pantallas)
      sube la burbuja del cuadrado con sus tres puntos: sigue esperando la respuesta. Se va cuando
      llegan los cuartos, y no sale si ya contestó. Con movimiento reducido llega con un corte propio.
      Sin texto nuevo; el cuadro del storyboard (con la promesa hecha) no cambia.
- [x] **7.3.7** «Ver de nuevo» al pie de los créditos: un enlace simple que también borra la memoria.
      Bajo «Fin», a `href('/')`, con el texto aprobado en 7.0.3 (`film.closing.again`). Con un clic
      normal, antes de irse deja la memoria vacía en la entrada de la pestaña: hacía falta, porque
      Chrome conserva `history.state` al navegar a la misma URL. Con Ctrl, Mayús o la rueda (otra
      pestaña), esta pestaña conserva lo jugado. Probado con clic y toque reales: vuelve arriba, sin
      promesa, en el capítulo 0, y reemplaza la entrada en vez de sumar otra.
- [x] **7.3.8** La escena se funde con el papel del pie, en vez de irse y dejar el suelo vacío.
      En los últimos 0.6 pantallas antes de que el escenario se vaya, el suelo se funde, de debajo de
      los personajes hacia abajo, con el papel de la página (su color y su grano, de día o de noche).
      Cuando el escenario sube, su borde ya es el papel del pie. Solo cambia la opacidad de una capa
      propia, bajo las tarjetas y la esquina: no obliga a repintar el escenario. Sale el degradado
      `film__fade` con JS, que quedaba tapado por el escenario; sin JS se queda.
- [x] **7.3.9** Verificación de salida (teclado, movimiento reducido, tests de la coreografía) y
      video del recorrido a 360 y 1440 px.
      Teclado solo (1440 EN, 360 ES y 1440 con movimiento reducido): 17 boletos jugados con Enter, el
      foco nunca entra al progreso, nunca se pierde y siempre queda en pantalla; «Ver de nuevo» se
      alcanza con Tab. Con clics y toques reales, la película entera se juega y la memoria vuelve igual
      al recargar, con Atrás y con «Volver a la película» (como carga nueva, sin la caché del
      navegador). Con movimiento reducido no hay parpadeo, mirada ni balanceo, y 0 cuadros en reposo.
      Los tests de la coreografía y del reloj de la luz, en verde; las cinco puertas, también con el
      candado abierto (`under-review` en local, sin commit). Sin scroll horizontal a 320 px. Videos y
      capturas en `scratch/p7-3/review/` (local, no se versiona), con un README.
- [ ] **7.3.10 (Montse)** Revisión de P7.3 (el PR).
      Montse aprobó las capturas, los videos y las tres elecciones del README: el progreso dentro de
      la pastilla del carrete, la burbuja de tres puntos a la mitad de la llegada y el balanceo en el
      dado del capítulo 3. Queda que mergee el PR.

### P7.4 · Sonido (punto 8)

Dep.: P7.1 y ADR 0030 (7.0.9). Cada señal nueva lleva su entrada en `CUE_SIGHT`, y siguen los tests
de que ninguna satura y de que todas suman a lo más 1.

- [x] **7.4.1** El acorde corto al encender, con las dos notas del motivo del tema final.
      `on`: sol y do (`ON_NOTES`, las dos primeras del tema), juntas, con la campana del tema, en
      menos de un segundo. Suena cada vez que se enciende, al pulsar el botón; al apagarlo, nada. El
      test lee la lista cerrada de la tabla del ADR 0030 y comprueba que solo suenen señales de ella,
      y que todas menos el tema duren menos de un segundo.
- [x] **7.4.2** Las monedas (capítulos 1 y 3).
      `coins`: cuatro tintineos en lo que dura la cuenta, iguales con 0 que con 14. En el capítulo 1
      suenan al jugar la ronda; en el 3, al caer la decisión, y si tiró el dado, cuando termina su
      golpe (`foldCues`). El reproductor programa una señal con retraso en el reloj de Web Audio
      (`play(cue, after)`), sin temporizadores.
- [x] **7.4.3** El interruptor del apagón y del parpadeo, la luz que vuelve y la carta que vuela
      (capítulo 5: `switch`, `lights-on` y `card`).
      `switch` es el clic del interruptor y su palanca; `lights-on`, una subida suave de mi a sol;
      `card`, el aire de la carta mientras vuela (los 320 ms de `Blackout.astro`). Lo que trae el
      scroll vive en `src/lib/film/sights.ts`: cada tramo es el del escenario (`stage.ts`), y el
      cuadro suena lo que acaba de entrar a la vista con el sonido encendido, una vez por visita. Los
      tramos no se enciman, y un test comprueba en toda la película, con y sin movimiento reducido,
      que mientras suena cada uno el escenario lo muestra. Con movimiento reducido los cortes saltan
      el apagón y el parpadeo (no se ven), así que no suenan; la carta tampoco, porque no vuela. Otro
      test: cada señal llega a menos de la mitad de la escala, así que ni dos juntas saturan.
- [x] **7.4.4** El letrero que enciende su cifra (capítulo 6, `sign`) y el hilo que se rompe
      (capítulo 3, `snap`, antes de las monedas).
      `sign`: el chasquido del filamento y una nota clara que brilla con la cifra; suena cada vez que
      el visitante pide ver una cifra, y con el scroll una sola vez (`signs` en `sights.ts`) si llega
      a las cifras con alguna sin adivinar: las dos se encienden juntas. Con las dos adivinadas, el
      scroll no enciende nada y no suena. `snap`: el chasquido del hilo y sus dos puntas que se
      recogen. `foldCues` pone en fila las señales del capítulo 3: el golpe del dado o el hilo, y
      después las monedas.
- [x] **7.4.5** Las dos voces que llegan (capítulo 4, `voices`), y el test de que las señales del
      capítulo 3 no se encimen.
      `voices`: una nota suave que sube por cada voz, la nube y luego el pergamino, con el aire en
      que flotan; suena con el scroll, una vez (`voices` en `sights.ts`). Con movimiento reducido
      tampoco suena `lights-on`: los cortes saltan el apagón, así que la luz nunca se fue (un test
      comprueba que el escenario reducido nunca oscurece). El test del capítulo 3 recorre las cuatro
      combinaciones de dado e hilo: el giro acaba antes de `ROLL_MS`, y cada señal de `foldCues`
      empieza cuando acaba la anterior. `CUES` es ya la lista cerrada del ADR 0030, las trece, y
      quien solo hace scroll oye algo en los capítulos 4, 5 y 6 antes del sello del 7.
- [x] **7.4.6** Video con sonido para Montse: sin silencios largos entre los capítulos 3 y 7, y nada
      suena sin encenderlo.
      Montse la dio por hecha sin video. La prueba fue un recorrido en Chrome headless
      (`scratch/tools/cues-probe.mjs`, local) que nombra cada señal por sus frecuencias. A 1440 px EN
      y a 360 px ES suenan `voices` (14.7 pantallas), el apagón (17.4), la luz (18.25), las cartas,
      el parpadeo (22.75), el letrero (26.9), el sello (31.1) y el tema (35.3). `snap` va en 0 s y
      las monedas a +0.27 s; de las seis cartas suenan cinco, y al volver con el scroll nada se
      repite. Sin encender el sonido no suena nada, y no hubo errores de JS.
- [x] **7.4.7 (Montse)** Revisión de P7.4 (el PR).
      Montse aprobó las señales y que con movimiento reducido no suenen `switch`, `lights-on` ni
      `card`: los cortes saltan el apagón, la luz nunca se va y la carta no vuela. Queda que mergee
      el PR.

### P7.5 · Horizontal y transiciones (puntos 12 y 15)

Dep.: P7.3 y ADR 0031 (7.0.10). 7.5.5 y 7.5.6 no dependen de la película y pueden ir antes.

- [x] **7.5.1** `camera.ts` recibe el área libre en vez de la pantalla entera, con test del encuadre.
      `frame(shot, viewport, free)`: el ancho del plano llena el área libre, su centro queda en el
      ancla de esa área, y el resto de la pantalla (lo que hay detrás de una tarjeta al costado)
      muestra más mundo a la misma escala. Si el plano es el vertical lo dice la forma del área
      libre, no la de la pantalla. Sin área, es la pantalla entera y el encuadre es el de antes
      (un test lo compara).
- [x] **7.5.2** La tarjeta al costado con `(orientation: landscape) and (max-height: 500px)`: a la
      izquierda, ≈ 44 % del ancho, con scroll interno si no cabe; la cámara encuadra el resto.
      La tarjeta va a la izquierda con `--side-card: 44vw`, bajo la fila del carrete y el sonido
      (`--side-top`), y si no cabe tiene scroll interno (`Beat.astro`). El área libre es un elemento
      invisible del escenario (`.film__free`, en `Film.astro`): a la derecha de la tarjeta y debajo
      de la fila de arriba, donde está el botón del cuaderno; `film.ts` lee dónde quedó al cambiar la
      pantalla y se la da a la cámara. El CSS es el único que sabe medidas. Al lado de una tarjeta el
      área es casi cuadrada: la cámara usa el plano cercano del celular, 1.3 veces más ancho para que
      quepan el tablero y el elenco, centrado en su alto (`beside`), y el escenario usa su
      acomodo vertical (`isClose`). Las cartas del mazo (capítulo 5) dejan sus iconos según el ancho
      de la carta y no el de la pantalla (una consulta de contenedor), así que de lado no se aprietan.
      Recorrido completo con toques reales a 740 × 360: las 21 acciones se alcanzan, la del capítulo 6
      después de bajar dentro de su tarjeta.
- [x] **7.5.3** El título del capítulo 0 deja de encimarse con las cabezas en horizontal.
      De lado, el título va sobre el área libre, a la derecha de la tarjeta, más chico
      (`clamp(1.35rem, 3.6vw, 2.1rem)`), entre la fila de arriba y las cabezas; sigue pegado y se
      desvanece igual al acercarse la cámara. Probado a 568 × 320, 667 × 375, 740 × 360, 844 × 390 y
      932 × 430, en EN y ES (el título en español ocupa tres líneas y tampoco toca las cabezas). Para
      que la fila de arriba quepa con el enlace de idioma, el botón de sonido va solo con su dibujo,
      su nombre para lectores de pantalla, como en el celular vertical.
- ~~**7.5.4** Solo si el ADR 0031 lo aprobó: el mismo mecanismo en la compu, con su punto de
  corte.~~ No se hace: en la compu las tarjetas siguen centradas (7.0.4, ADR 0031).
- [x] **7.5.5** Transiciones entre las páginas del cuaderno, solo con CSS:
      `@view-transition { navigation: auto; }` bajo `prefers-reduced-motion: no-preference`, y
      `view-transition-name` en la viñeta y el título. El home queda fuera.
      La transición es CSS, en `SubpageView.astro`: la viñeta y el título pasan a los de la página
      nueva y lo demás se funde, en `--duration-slow`. Como el home no la pide, no hay transición
      hacia ni desde la película. Una sola cosa necesitó JS: si una página del cuaderno pide la
      transición y la siguiente no (la película), Chrome la aborta y deja un error rojo en la
      consola. `transitions.ts` (en el script del cuaderno, que ya cargaba cada página) la suelta en
      `pageswap` cuando el destino no es una página del cuaderno; `routeOf` (en `routes.ts`, con
      tests) dice qué página es una URL. Sin JS el error vuelve, solo en la consola. Probado con
      clics reales en Chrome (`pagereveal`): entre páginas del cuaderno, desde el panel y al cambiar
      de idioma, sí; del home y hacia él y con movimiento reducido, no; sin errores en la consola.
- [x] **7.5.6** Salida animada al cerrar el panel, simétrica a la entrada.
      La entrada y la salida son ahora la misma transición de CSS (`Notebook.astro`): la hoja entra
      desde el borde derecho mientras el fondo se oscurece, y sale igual mientras se aclara, en
      `--duration-slow`. Al cerrar, el diálogo sigue en la capa superior hasta que termina de salir
      (`@starting-style` y `allow-discrete` en `overlay` y `display`); un navegador sin `overlay`
      (Firefox) lo cierra de golpe, como antes. Sin JS nuevo. Probado con clics reales a 1440 y
      360 px, en una página del cuaderno y en el home: por el botón de cerrar, el fondo y Esc, sale
      deslizándose y el foco vuelve al botón; con movimiento reducido abre y cierra sin moverse.
- [x] **7.5.7** Capturas a 740×360, 844×390, 1024×768 y 1440×900; sin scroll horizontal a 320 px;
      presupuestos en verde.
      En `scratch/p7-5/review/` (local), con un README que termina con lo que Montse decide al
      revisar: la película entera en los cuatro tamaños (más 844 × 390 en español y 740 × 360 con
      movimiento reducido), el panel a mitad de entrar y de salir, la transición entre páginas a
      mitad, y las salidas de las pruebas con clics reales. A 1024 × 768 y 1440 × 900 la película no
      cambia. Sin scroll horizontal en las 14 páginas a 320 × 700, 568 × 320 y 740 × 360. Los
      presupuestos: JS del home 20.1 KiB (≤ 40), fuentes 118.6 KiB (158.0 en /how-its-built, ≤ 160) y
      primera carga del home 214.4 KiB (≤ 450).
- [x] **7.5.8 (Montse)** Revisión de P7.5 (el PR).
      Montse la dio por hecha. Queda que mergee el PR.

### P7.6 · Contenido, peso y pintura (el resto del punto 16 y el mínimo del 3)

Dep.: P7.0. Puede ir en paralelo a P7.1. 7.6.1 no depende de nada: puede ir en cualquier momento.

- [x] **7.6.1** Punto 3, solo el mínimo: quitar el filtro de sombra (`filter`) de las dos colinas en
      `World.astro` (`hill-far` y `hill-near`), que son los trazos más grandes que se repintan al
      mover la cámara. El sol, las nubes, la pared, la lámpara y los personajes conservan su
      sombra. Capturas antes y después (con JS y sin JS, 360 y 1440 px) para Montse. Sin medir en
      teléfonos reales y sin cambiar las demás sombras. Hecho: los 9 cuadros quietos cambian solo
      en el borde de las colinas (delta máximo 7 de 255); las capturas están en
      `scratch/p7-6/review/7.6.1-*`.

- [x] **7.6.2** Referencia: medir el HTML del home y los nodos de cada cuadro quieto (hoy unos 460 de
      los 540 KB del HTML y 4 985 nodos) y sacar capturas sin JS de los 9 cuadros, en `scratch/`.
      Medido después de 7.6.1, con el candado cerrado: el home en inglés pesa 544 497 B (68 176 B
      con gzip) y tiene 5 013 nodos; los 9 cuadros quietos suman 418 087 B y 3 672 nodos, 408 cada
      uno, porque cada cuadro dibuja el mundo entero. En español, 545 138 B (69 256 con gzip). Con
      el candado abierto, 565 731 B y 5 248 nodos, con los mismos cuadros. Las capturas (EN y ES,
      360 y 1440 px, los dos estados del candado) están en `scratch/p7-6/ref/`.
- [x] **7.6.3** Cuadros quietos 0 a 2 con solo lo que se ve en su pose; capturas iguales a la
      referencia. Hecho: `World.astro` dibuja en un cuadro quieto solo las partes con opacidad
      mayor que 0 (el escenario vivo las sigue dibujando todas, para que el script las muestre), y
      en este paso lo aplican las piezas que llegan en los capítulos 0 a 2: el hilo, la pared, los
      focos, los globos, la mesa, el dado y sus puntos, las monedas, el tablero con sus marcas y lo
      que la cara de cada personaje esconde. Los 9 cuadros pasan de 3 672 a 2 396 nodos y el home,
      de 544 497 a 380 367 B (de 68 176 a 41 093 con gzip). El SVG de cada cuadro, dibujado aparte,
      es idéntico a la referencia en los 36 casos (EN y ES, los dos estados del candado), y la
      película con JS (movimiento reducido, 360 y 1440 px) también. En la página, Chrome cambia el
      suavizado de los bordes de algunas figuras al quitar un texto invisible del cuadro (delta de
      hasta 100 en píxeles de borde): no se ve, y el dibujo es el mismo.
- [ ] **7.6.4** Lo mismo con los cuadros 3 a 5.
- [ ] **7.6.5** Lo mismo con los cuadros 6 a 8.
- [ ] **7.6.6** Capítulo 4: las citas de la aversión a la culpa a una línea de cita más pequeña. La
      regla (k) se cumple igual: las citas se quedan, solo cambia dónde.
- [ ] **7.6.7** El enlace EN/ES entra al panel del cuaderno.
- ~~**7.6.8** Solo si se aprobó en 7.0.4: el enlace EN/ES conserva el capítulo.~~ No se hace
  (7.0.4).
- [ ] **7.6.9** La autora en los pósteres, como firma (ADR 0032).
- [ ] **7.6.10** Verificación de salida (storyboard igual, primera carga menor, regla (h) y paridad) y
      capturas para Montse.
- [ ] **7.6.11 (Montse)** Revisión de P7.6 (el PR).

### P7.7 · Cierre y entrega a F5 (punto 5 y el resto del 6)

Dep.: todas las subfases anteriores.

- [ ] **7.7.1** `README.md`: sin «Work in progress»; tres o cuatro puntos fuertes (el storyboard, el
      motor propio, el candado con `verify:dist`, los presupuestos y los tests); el enlace a
      `/how-its-built`; el enlace al sitio como `TODO(launch)`. `README.es.md`, su copia.
- [ ] **7.7.2** Una captura o un GIF ligero para los dos README.
- [ ] **7.7.3** Lighthouse otra vez sobre el commit final; regenerar `src/data/lighthouse.json` para
      que `/how-its-built` coincida con `npm run budgets`.
- [ ] **7.7.4** Revisión completa, parte 1: 1440, 360 y 320 px, horizontal, EN/ES.
- [ ] **7.7.5** Revisión completa, parte 2: teclado, movimiento reducido, sin JS y script bloqueado.
- [ ] **7.7.6** Revisión completa, parte 3: axe en las 14 páginas, en claro y oscuro.
- [ ] **7.7.7 (Montse)** Revisión de P7 (el PR). Al cerrarse, empieza F5.

## Preguntas abiertas

- **La forma de las dos voces:** se decide con la hoja de personajes (P1).
- **El color del triángulo:** el que pase los tests de daltonismo frente a los dos roles (P1).
- **`/sources` y el hallazgo.** El ADR 0024 le da a `/sources` «Candado: —» y el ADR 0026 dice que
  todo lo que no cubre se ve igual en los dos estados, así que `/sources` no lista las fuentes del
  hallazgo, tampoco con el candado abierto, y el «cada cifra de la página» del 0024 queda con ese
  hueco. Montse lo confirmó en la revisión de P5 y no quiso el ADR todavía: se decide en el paso 3b
  del checklist, antes de abrir el candado.

## Preguntas cerradas

- ~~Axelrod (1984): ¿en qué páginas están los pagos, `2R > T + S`, la sombra del futuro y el
  torneo?~~ No se pudo revisar el libro. Montse eligió en 7.0.5 citar el artículo de Axelrod y
  Hamilton (1981), cotejado (ADR 0033); se aplicó en 7.2.8, y `/sources` ya no dice «Páginas por
  verificar.».
- ~~¿La tarjeta al costado también en la compu?~~ No: en la computadora las tarjetas siguen
  centradas, como dice el ADR 0027 (decisión de Montse en 7.0.4; el ADR 0031 lo registra).
- ~~¿El enlace EN/ES conserva el capítulo?~~ No: necesitaba JavaScript y precisar el ADR 0013, y al
  cambiar de idioma se abre otra entrada del historial, sin lo jugado (ADR 0029). El enlace sigue
  siendo simple (decisión de Montse en 7.0.4).
- ~~¿Los KB de los presupuestos son de 1000 o de 1024 bytes?~~ KiB, 1024 bytes, como Lighthouse; el
  techo de JS vale en los dos home y los de fuentes y primera carga en cada página (ADR 0028,
  decisión de Montse en la revisión de P6).

- ~~¿Otro repo o el mismo?~~ El mismo, con archivo (P0).
- ~~¿Se abre el candado en revisión o al aceptar?~~ En revisión, después de revisar la política de
  la revista (paso 1b del checklist, ADR 0026).
- ~~Dirección de arte.~~ Papel (ADR 0022, hoy en el ADR 0027).
- ~~«Quién es».~~ Solo nombre, GitHub y LinkedIn, en `/about` (ADR 0024).
- ~~«Cómo está hecho».~~ Sale del home y se queda como caso de estudio en el cuaderno (ADR 0024).
- ~~¿Dos frases de estado en P4?~~ Sí: la entrada «El hallazgo» del cuaderno se adelanta al pie de
  la versión anterior, con su título y la frase, y enlaza a `/finding` solo con el candado abierto;
  en P5 pasa al panel (decisión de Montse, P4).
