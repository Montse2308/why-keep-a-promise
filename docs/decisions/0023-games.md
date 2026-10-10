# 0023 · Juegos e interacciones

**Estado:** aceptada (P0). Reemplaza el ADR 0003 (archivado) y la parte de interacciones del ADR
0017 (archivado). La regla (f) no cambia. Precisado por el ADR 0027: los botones son boletos de
papel con la consecuencia, no gestos de manos. Precisado por el ADR 0029: «Nada se guarda ni se
envía» se lee «nada sale de la pestaña ni se envía»; la película recuerda lo jugado en esa pestaña.
Precisado por el ADR 0038: la lista suma una interacción, la 11, el explorador de la fórmula en
`/finding`, con el candado abierto.

## Contexto

El ADR 0003 dejaba una sola pieza, la mesa, con tres momentos, y ningún dilema jugable en el home.
Montse encontró pobres los juegos de una sola ronda con un otro que no reacciona. Además, la página
tiene que enseñar el dilema del prisionero a quien nunca lo oyó, y eso pide jugarlo.

Tres cosas siguen fijas:

- La regla (f): no hay un dilema repetido jugable. Para eso se enlaza a *The Evolution of Trust*.
- La prohibición de visualizar poblaciones o dinámicas.
- La regla (d): el modelo no se presenta como si reprodujera tasas de laboratorio.

## Decisión

### Las interacciones permitidas

Estas y solo estas:

| # | Dónde | Qué hace el visitante | Lógica |
| - | ----- | --------------------- | ------ |
| 1 | Capítulo 0 | Promete o no que tirará el dado. | Estado de la película. |
| 2 | Capítulo 1 | Juega **una** ronda del dilema del prisionero: cooperar o traicionar. El otro traiciona, siempre, y la película dice por qué en el paso siguiente. | `src/lib/pd/` |
| 3 | Capítulo 1 | Prueba las dos columnas: elige su jugada si el otro coopera y si el otro traiciona, y ve que traicionar paga más en las dos. Es la mejor respuesta que antes vivía en `/dilemma`. | `src/lib/pd/` |
| 4 | Capítulo 2 | Elige un mensaje ya escrito en un chat. El otro contesta. No hay texto libre. | Estado de la película. |
| 5 | Capítulo 3 | Decide: quedarse 14 o tirar el dado. El dado gira y cae; aparecen las monedas. | `PAYOFFS` (`src/lib/table/game.ts`) |
| 6 | Capítulo 5 | Un mazo corto (ocho cartas como máximo), cada carta con una pareja distinta y su mensaje. En algunas hubo cambio de pareja, con el caso fijo ilustrativo (la pareja nueva recibió una promesa de otra persona). Decide deslizando o con botones. | `PAYOFFS` y el caso fijo del momento 2 |
| 7 | Capítulo 5 | Como quien recibe: apuesta qué hará quien decide en la escala de cinco puntos. Después descubre que hubo cambio de pareja, y ve lo que apostaron los receptores reales (70 contra 68). | `RECIPIENT_BELIEFS`, `vanberg-beliefs` |
| 8 | Capítulo 6 | Adivina antes de ver: mueve una barra y después aparece la cifra real (73 % y 54 %). | `ROLL_COUNTS` |
| 9 | Capítulo 7, solo con el candado abierto | Mueve el control de la curva sobre las filas precalculadas. | `src/lib/curve/` (ADR 0010, 0026) |
| 10 | Capítulo 8 | Contesta si cumpliría ahora y si la página cumplió la suya. | Estado de la película. |

La gráfica de culpa de `/finding`, detrás del candado, sigue siendo estática.

### Los límites

- **Ninguna es un dilema repetido.** El dilema se juega una vez. El mazo del capítulo 5 no es el
  dilema (regla (g)), y cada carta es una persona distinta, sin memoria de lo anterior. Al final
  muestra cuántas promesas cumplió el visitante, no un puntaje acumulado de pagos.
- **Nada visualiza una población ni una dinámica.** No hay puntos por persona, rejillas ni
  agentes.
- **Las elecciones del visitante nunca son evidencia ni un veredicto sobre él.** La página no le
  dice qué razón lo mueve, ni compara su conducta con la de nadie como prueba de algo. «Adivina
  antes de ver» compara su intuición con una cifra publicada, con su cita.
- **El cliente no simula el modelo** ni calcula nada que no esté ya en los módulos puros.
- **Cada interacción es opcional.** El scroll nunca se bloquea, y si el visitante sigue sin jugar,
  la película cuenta lo que habría pasado.
- **Nada se guarda ni se envía.** No hay almacenamiento, cookies ni analítica.

### Cómo se toca

- Botones nativos con forma de gesto, operables con teclado, con foco visible. El foco pasa al
  control siguiente, y cada resultado se anuncia en `aria-live`.
- Deslizar es un atajo, no la única forma: cada carta también tiene sus botones.
- Con movimiento reducido, el dado cae sin girar y las monedas aparecen sin moverse.
- Sin JavaScript, cada interacción se ve como su resultado en texto, con la tabla de pagos
  (ADR 0025).

## Consecuencias

- `/dilemma` pierde su interacción de mejor respuesta, que pasa al capítulo 1. Queda la matriz
  estática como parte de su prosa (ADR 0024).
- `GameTable`, `Scene` y los controladores de la mesa se sustituyen por los componentes de los
  capítulos. La lógica pura de `src/lib/table/`, `src/lib/pd/` y `src/lib/curve/` se conserva con
  sus tests.
- Una interacción nueva necesita otro ADR que reemplace este.
- Se construye en P1 (capítulo 0), P2 (1 a 3), P3 (4 a 6) y P4 (7 y 8).
