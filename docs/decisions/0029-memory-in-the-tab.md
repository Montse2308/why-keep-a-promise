# 0029 · La memoria de la película en la pestaña

**Estado:** aceptada (P7.0). Precisa el ADR 0023 en «Nada se guarda ni se envía» y el ADR 0021 en
«Nada de lo que el visitante contesta se guarda ni se envía»: la película recuerda lo jugado en la
pestaña, y nada sale de ella. Lo demás de los dos sigue entero.

## Contexto

La revisión externa de P6 (punto 2, `docs/p7-external-review.md`) encontró que la película olvida
todo al salir y volver. Prometer, jugar el dilema, abrir la lupa «El dilema, a fondo» y volver con
Atrás deja el scroll en su lugar, pero el carrete dice «Sin promesa» y los resultados se borran. Lo
mismo pasa al recargar y con los enlaces de vuelta del cuaderno. El capítulo 3 le dice entonces «No
le contestaste al otro» a quien sí prometió, y el hilo de la historia se rompe.

Las lupas invitan a salir a la mitad de la película, y el navegador interno de LinkedIn, donde la
abrirán muchos visitantes, a menudo no guarda la página en caché al volver.

La revisión daba dos salidas: recordar lo jugado en `history.state` (A) o abrir las lupas en otra
pestaña (B). Montse eligió la A: B solo cubría las lupas, no Atrás ni la recarga
(`docs/p7-review-plan.md`).

El ADR 0023 dice «Nada se guarda ni se envía. No hay almacenamiento, cookies ni analítica.», y el
0021, que nada de lo que el visitante contesta se guarda ni se envía. La intención de las dos
frases era que nada saliera del navegador ni lo siguiera después. La memoria en la pestaña conserva
esa intención, pero la letra de las frases deja de ser exacta. Por eso este ADR las precisa.

## Decisión

### Qué se recuerda

Las acciones del visitante en la película, en el orden en que las hizo, y nada más:

| Capítulo | Acción |
| -------- | ------ |
| 0 | Prometer o no |
| 1 | La ronda del dilema y cada una de las dos columnas |
| 2 | El mensaje elegido |
| 3 | La decisión, con su resultado y la cara del dado si lo tiró |
| 5 | Cada carta del mazo y la apuesta como quien recibe |
| 6 | Las dos adivinanzas |
| 8 | Las dos respuestas del final |

- **La cara del dado** se recuerda para que, al volver, el resultado sea el mismo y no otra tirada.
- **No se recuerda** la posición del scroll, porque el navegador ya la restaura. Tampoco el sonido,
  la hora ni nada que identifique al visitante.

### Dónde

- En `history.state` de la entrada del historial de la película, escrito con
  `history.replaceState` después de cada acción.
- **No se usa** `localStorage`, `sessionStorage`, IndexedDB ni cookies. Nada viaja por la red y no
  hay analítica.
- El registro lleva una versión y se valida al leerlo. Si algo no se reconoce, se ignora el registro
  entero, y la película empieza vacía.

### Cómo vuelve

- **Al cargar la película**, las acciones recordadas se repiten por el mismo camino de código que
  un clic, sin animación y sin sonido. Los boletos, las salidas `aria-live`, el carrete, el mazo y
  la escala quedan igual que si el visitante acabara de jugar. Nunca se muestra un estado al que no
  se pueda llegar jugando.
- **Desde el cuaderno.** Si la página anterior de esa pestaña fue la película, «Volver a la
  película» y «← Volver a …» hacen `history.back()`. Así se vuelve a la misma entrada, con su
  memoria. Va en el script del panel del cuaderno, sin un script nuevo (ADR 0025). Sin JavaScript
  siguen siendo enlaces normales.
- **El sonido** empieza apagado en cada carga, como toda visita (el navegador además pide un gesto
  del visitante para sonar). Restaurar la memoria no suena nunca (ADR 0030).

### Cuándo se va

- **Una pestaña nueva** empieza vacía, y también un enlace compartido.
- **«Ver de nuevo»**, al pie de los créditos, abre la película sin memoria.
- **Cerrar la pestaña** la deja atrás. Si después el navegador reabre esa pestaña o restaura la
  sesión, puede devolverla, porque la guarda con la entrada del historial. El sitio no la borra ni
  la controla. Aun así no sale del navegador ni llega a ningún servidor.
- **Sin JavaScript** no hay nada que recordar: el storyboard no tiene juegos.

### Lo que dice la página

El capítulo 8 cambia la frase de `film.closing.private` («Your answers stay on this page: nothing is
stored or sent.» / «Tus respuestas se quedan en esta página: nada se guarda ni se envía.») por la
que Montse aprobó en 7.0.3:

| EN | ES |
| -- | -- |
| Everything you chose stays in this tab: nothing is sent anywhere. | Todo lo que elegiste se queda en esta pestaña: nada se envía a ningún lado. |

No promete que lo jugado se borre al cerrar la pestaña, por lo dicho arriba.

### Cómo se leen los ADR 0021 y 0023

- En el 0023, «Nada se guarda ni se envía. No hay almacenamiento, cookies ni analítica.» se lee:
  **nada sale de la pestaña ni se envía.** La película recuerda lo jugado solo en la entrada del
  historial de esa pestaña (este ADR), y no hay almacenamiento del sitio, cookies ni analítica.
- En el 0021, «Nada de lo que el visitante contesta se guarda ni se envía» se lee igual.
- La memoria no es una interacción nueva: la lista del 0023 no cambia, y nada se deshace. Una
  promesa sigue sin poder deshacerse.
- Las elecciones recordadas siguen sin ser evidencia ni un veredicto sobre el visitante (ADR 0023).

## Consecuencias

- Entra `src/lib/film/memory.ts`, puro y con tests: el registro, su versión y su validación (paso
  7.1.7).
- Cada controlador de capítulo anota su acción (7.1.8). Al cargar, las acciones se reproducen (7.1.9),
  y el cuaderno vuelve con `history.back()` (7.1.10). El capítulo 8 lleva la frase nueva (7.1.11).
  Todo después de partir `film.ts` por capítulo (7.1.2 a 7.1.4).
- Un test comprueba que ni la memoria ni la película usan `localStorage`, `sessionStorage`,
  IndexedDB ni cookies, como el que ya cubre el sonido.
- Las líneas de estado de los ADR 0021 y 0023 dicen que este ADR los precisa.
