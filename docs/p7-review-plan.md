# P7 · Los ajustes de la revisión externa

El plan de P7: de dónde sale, qué entra, qué cambió del orden original y por qué. Las subfases y sus
criterios de salida están en `docs/phases.md` (P7); los pasos, uno por sesión, en `docs/tasks.md`
(P7). Este archivo guarda el razonamiento, para que un agente que llegue a mitad de P7 no lo vuelva
a abrir.

## De dónde sale

Al terminar P6 se hizo una revisión externa del sitio, con 16 puntos numerados, usándolo con clics
y toques reales en Chromium (1440, 360 y 320 px y horizontal, EN/ES, teclado, movimiento reducido,
sin JS y con el script bloqueado), axe en las 14 páginas y una lectura del código. Está copiada en
`docs/p7-external-review.md`: ahí están la evidencia de cada punto, con sus archivos y líneas, y las
mediciones. Montse eligió los puntos 1, 2 (en su variante A), 4 a 13, 15 y 16, y del 3 solo su
mínimo. Lo que quedó fuera y por qué está abajo, en «Lo que no entra».

Los números de los puntos se usan en `phases.md`, `tasks.md` y los commits de P7, así que se
conservan.

| Punto | Qué pide | Dónde va |
| ----- | -------- | -------- |
| 1 | Respaldo si el script de la película falla: que se vea el storyboard, no la escena rota | P7.1 |
| 2A | La memoria de la película en la pestaña: Atrás, recargar o volver del cuaderno no borra lo jugado | P7.0 (ADR 0029), P7.1 |
| 3 | Rendimiento: las sombras con filtro SVG. Solo el mínimo: quitar el filtro de las colinas | P7.6 |
| 4 | Descripción por página e idioma (`description`, `og:description`) y metadatos de idioma | P7.2 |
| 5 | README en EN y ES como pieza de portafolio | P7.7 |
| 6 | Datos: Axelrod (1984) sin páginas verificadas, el `PENDIENTE(datos)` de 70 y 68, Lighthouse al día | P7.0, P7.2, P7.7 |
| 7 | El chat del capítulo 2 en orden: pregunta, tu mensaje, respuesta | P7.3 |
| 8 | Sonido: acorde al encender y señales nuevas, sin silencios largos entre los capítulos 3 y 7 | P7.0 (ADR 0030), P7.4 |
| 9 | El progreso de la película, pasivo | P7.3 |
| 10 | Vida en reposo de los personajes; que la llegada no se sienta vacía | P7.3 |
| 11 | El final: «Ver de nuevo» y la escena que se funde con el pie | P7.3 |
| 12 | La película con el teléfono en horizontal | P7.0 (ADR 0031), P7.5 |
| 13 | Página 404, `noindex` en `/finding` cerrado, sitemap, `theme-color` y `apple-touch-icon` | P7.2 |
| 14 | Una prueba de humo con Playwright en CI | fuera (abajo) |
| 15 | Transiciones entre páginas del cuaderno y salida animada del panel | P7.5 |
| 16 | Varios: partir `film.ts`, la tarjeta al costado en la compu, cuadros quietos más ligeros, las citas del capítulo 4, el enlace EN/ES en el panel y que conserve el capítulo, la autora en los pósteres | P7.1, P7.5, P7.6 |

## Lo que no entra

Montse dejó fuera estas propuestas. No se trabajan en P7 ni se reabren sin que ella lo pida.

- **Punto 3, salvo su mínimo.** El escenario lleva `filter` con desenfoque, y como la cámara cambia
  el `viewBox` en cada cuadro, todo se vuelve a pintar con sus filtros. En Chromium sin GPU, con
  filtros: 33 ms por cuadro (p50) y 97 cuadros de más de 50 ms; sin filtros: 16.7 ms y 3. La
  revisión proponía medir en un Android y un iPhone reales y, si se confirmaba, cambiar el
  desenfoque por sombras planas desplazadas; «como mínimo, quitar el filtro de las colinas». Montse
  eligió solo ese mínimo (paso 7.6.1): las colinas son los trazos más grandes, de miles de px. Quedan
  fuera la medición en teléfonos reales y el cambio de las demás sombras. No choca con el ADR 0027:
  el diorama sigue con «sombras reales» en el sol, las nubes, la pared, la lámpara y los personajes.
  El resto del riesgo sigue ahí; P7 no lo agrava (ver «Riesgos a vigilar»).
- **Punto 2, variante B: abrir las lupas en otra pestaña** (`target="_blank"`). No tocaba ningún
  ADR, pero solo cubría las lupas, no Atrás ni la recarga. Se eligió la A, la memoria en la pestaña.
- **Punto 14, una prueba de humo con Playwright en CI** (la película con clics y toques, el panel con
  teclado, sin JS y con el script bloqueado). Sería una dependencia nueva fuera del ADR 0025. En su
  lugar, cada subfase se verifica a mano con clics reales, con scripts que se quedan en `scratch/`.
- **Música de fondo durante toda la película** (idea de Montse). Choca con «todo lo que suena
  también se ve» (ADR 0025), un bucle se vuelve repetitivo, compite con el lector de pantalla y
  mantiene Web Audio activo. La atmósfera llega con las señales nuevas del punto 8.
- **Un botón para rehacer cada decisión** (idea de Montse). El peso de las decisiones es la tesis de
  la película (una promesa no se deshace), el capítulo 0 ya se puede cambiar hasta el capítulo 3, y
  «deshacer» sería una interacción fuera de la lista del ADR 0023. Lo que sí entra: «Ver de nuevo»
  (punto 11) y que salir a una lupa no borre lo jugado (punto 2).

Las otras dos ideas de Montse sí entran: que suene algo al encender el sonido (punto 8, el acorde) y
las transiciones del cuaderno (punto 15).

## Lo que la revisión pide conservar

Ningún paso de P7 debe empeorar esto; si uno lo toca, se revisa antes de cerrarlo:

- **El storyboard sin JS:** cada capítulo es un cuadro con su texto, los pagos en tabla y el chat en
  el orden correcto (el modelo que sigue 7.3.1).
- **El candado fuera del build** con `verify:dist` y su test de marcas.
- **La accesibilidad:** cero violaciones de axe en las 14 páginas, en claro y oscuro; el orden de
  tabulación es el de la historia, con foco visible; el panel es un `<dialog>` que devuelve el foco;
  los resultados se anuncian en `aria-live` y el carrete los dice en palabras.
- **El movimiento reducido:** cortes limpios, y todos los juegos siguen ahí.
- **Los boletos con su consecuencia**, la luz continua del día y los personajes con cara.
- **Los números salen del código**, con su registro de cifras y la paridad EN/ES.
- **Deslizar en el mazo** con el dedo (`touch-action: pan-y`) sin robar el scroll vertical.

## Lo que la revisión no cubrió

No hubo teléfono real, Safari, Firefox ni lector de pantalla real, y el rendimiento se midió en
Chromium sin GPU. Eso queda para F5, que ya pide lector de pantalla y los juegos al tacto.

## Cómo encaja en el proyecto

- **P7 va entre P6 y F5.** Empieza cuando Montse cierre la revisión de P6. Así F5 (QA) revisa el
  sitio ya ajustado.
- **Varias propuestas chocan con un ADR.** Por eso P7.0 solo escribe documentos y decisiones, sin
  tocar `src/`, como piden `AGENTS.md` y `docs/decisions/README.md`. Lo que no choca con ningún ADR
  (partir `film.ts` y el respaldo del punto 1) puede empezar antes de que P7.0 termine.
- **Cada commit** pasa `check`, `test`, `build`, `verify:dist` y `budgets`, como siempre.
- **Cada subfase** termina con capturas o video a 360 y 1440 px para Montse. Nada se sube sin que
  ella lo pida.
- **Sin pruebas de navegador en CI** (el punto 14 queda fuera). Cada subfase se verifica a mano con
  clics reales en un navegador; los scripts de esa verificación viven en `scratch/`, no entran al
  repo ni agregan dependencias.

## Cómo se avanza: pasos chicos

Montse avanza P7 de a poco, en sesiones cortas. Por eso cada subfase está partida en pasos
(`docs/tasks.md`), y cada paso:

- cabe en una sesión corta y termina en un commit (o unos pocos), con todo en verde;
- deja el sitio entero: se puede parar después de cualquier paso sin dejar nada a medias en `main`;
- tiene un número fijo (`7.1.3`), que se cita en el commit y en la conversación con el agente
  («sigue con 7.1.3»);
- dice de qué depende, si depende de algo más que el paso anterior.

Un paso marcado **(Montse)** no es de código: es una decisión o una aprobación suya, y el agente
prepara lo que necesita para tomarla (borradores, capturas, opciones), pero no la toma.

Una subfase se puede trabajar en una rama propia con varios pasos; el PR se abre cuando la subfase
está completa, con sus capturas.

## Lo que cambió del orden original

1. **El 16 se reparte entre subfases, no va al final.** Partir `film.ts` en un archivo por capítulo
   va *primero* (P7.1). Los puntos 2, 8, 9, 10 y 11 meten código nuevo justo ahí; si se parte
   después, se escribe dos veces.
2. **La memoria (2A) necesita un ajuste.** `history.state` se queda en la entrada del historial:
   cubre el botón Atrás y la recarga, pero **no** los enlaces «← Volver a "Dos cuartos"» y «Volver a
   la película», que abren una entrada nueva, vacía. La solución: si el visitante llegó desde la
   película, esos enlaces hacen `history.back()`. Sin JS siguen siendo enlaces normales.
3. **El capítulo 8 dice «nada se guarda ni se envía»** (`film.closing.private`). Con la memoria en
   la pestaña, la frase deja de ser exacta. El ADR 0029 decide el texto nuevo, por ejemplo «nada
   sale de esta pestaña».
4. **La llegada (punto 10) conserva su largo de 3 pantallas.** Acortarla movería el reloj de la luz
   del día (ADR 0027 y sus tests). En su lugar, algo cambia a la mitad del tramo.
5. **Las descripciones (punto 4) reusan textos que ya existen.** Las seis páginas del cuaderno ya
   tienen su línea en el panel; solo falta escribir la del home, en EN y ES. `/finding` cerrado no
   usa la frase de estado (la regla (b) la cuenta exactamente dos veces en el home): lleva la
   pregunta del sitio.

## Punto 12: adaptar, no bloquear

Se adapta el diseño en horizontal; no se bloquea la rotación:

- **En la web no se puede bloquear de verdad.** `screen.orientation.lock()` solo funciona en
  pantalla completa o en apps instaladas, y Safari en iPhone no lo soporta. «Bloquear» sería tapar
  la página con un aviso de «gira tu teléfono».
- **Rompe la accesibilidad.** La WCAG 2.1, criterio 1.3.4 (nivel AA), prohíbe limitar el contenido a
  una orientación salvo que sea esencial, y aquí no lo es. El sitio apunta a AA.
- **Es hostil con el público del sitio.** En el navegador interno de LinkedIn, alguien con el
  teléfono de lado se encontraría un muro.
- **El problema es pequeño.** Solo la película sufre en horizontal: el storyboard y el cuaderno se
  ven bien. `camera.ts` ya encuadra según la forma de la pantalla; solo falta darle el área que la
  tarjeta deja libre.

**Propuesta (ADR 0031):** con `(orientation: landscape) and (max-height: 500px)`, la tarjeta va a la
izquierda (≈ 44 % del ancho, con scroll interno si no cabe) y la cámara encuadra el resto. Si Montse
quiere también la tarjeta al costado en la compu (punto 16), se usa el mismo mecanismo con su propio
punto de corte. Montse no lo quiso (7.0.4): en la compu siguen centradas.

## Decisiones que P7.0 dejó escritas

Montse las tomó en 7.0.3 a 7.0.8; los textos y las listas aprobados están en `tasks.md` (P7.0).

| ADR | Decide | Precisa |
| --- | ------ | ------- |
| 0029 | La memoria de la película en la pestaña: qué recuerda (las acciones y sus resultados, incluida la cara del dado), dónde (`history.state`, en la entrada de la película), cómo vuelve (por el mismo camino que un clic, sin animación ni sonido), cuándo se va (una pestaña nueva, «Ver de nuevo»; al cerrar la pestaña, con el matiz de la sesión restaurada), que nada sale de la pestaña, y la frase nueva del capítulo 8 | 0023 y 0021 |
| 0030 | Las señales del sonido: la lista cerrada de trece (las cinco de P6 y ocho nuevas), cada una con lo que se ve, y sus reglas | 0025 |
| 0031 | La tarjeta al costado con el celular en horizontal; en la compu siguen centradas. Por qué no se bloquea la rotación | 0027 |
| 0032 | La autora en los pósteres, como firma con su nombre y nada más | 0021 |
| 0033 | La fuente del dilema: Axelrod y Hamilton (1981) en lugar del libro de 1984 (la opción B del punto 6), cotejada, con sus páginas; «la sombra del futuro» sale de `/dilemma` | 0021 |

**Lo que Montse no aprobó** (7.0.4), en «Preguntas cerradas» de `tasks.md`:

- la tarjeta al costado en la compu (choca con el ADR 0027);
- que el enlace EN/ES conserve el capítulo (precisaba el ADR 0013 y necesitaba JS; además, al cambiar
  de idioma se abre otra entrada del historial, sin lo jugado).

**Axelrod, punto 6.** Montse eligió la B. No tenía acceso al artículo, así que el agente lo cotejó
contra la copia de JSTOR en el sitio de Axelrod. Ahí están los pagos, T > R > P > S, la condición
(escrita como R > (S + T)/2) y el torneo, pero no «la sombra del futuro». Por eso esa oración de
`/dilemma` se reescribe (ADR 0033). La A y la C quedaron descartadas.

**Los textos nuevos**, aprobados en EN y ES: la descripción del home, «Watch again» / «Ver de nuevo»,
el progreso como «Chapter {n} of 8» / «Capítulo {n} de 8» (con el número de la tarjeta, porque la
película cuenta desde 0) y la frase nueva del capítulo 8.

## Orden y dependencias

| Subfase | Puntos | Depende de | Tamaño |
| ------- | ------ | ---------- | ------ |
| P7.0 · Decisiones | ADR, 6 (decisión), textos | revisión de P6 | S |
| P7.1 · Cimientos | 16 (`film.ts`), 1, 2A | P7.0 (solo la memoria) | M–L |
| P7.2 · Metadatos y datos | 4, 13, 6 | P7.0 | M |
| P7.3 · Experiencia | 7, 9, 10, 11 | P7.1 | M |
| P7.4 · Sonido | 8 | P7.1 y ADR 0030 | S–M |
| P7.5 · Horizontal y transiciones | 12, 15 | P7.3 y ADR 0031 | M–L |
| P7.6 · Contenido, peso y pintura | resto del 16, mínimo del 3 | P7.0 | M |
| P7.7 · Cierre | 5, 6 (Lighthouse), revisión | todas | S |

P7.2 y P7.6 pueden ir en paralelo a P7.1: no tocan los mismos archivos.

## Riesgos a vigilar

- **El reloj de la luz.** No cambiar el largo de los capítulos sin volver a cuadrar los tests del
  ADR 0027.
- **Las fuentes de `/how-its-built`** van a 158.0 de 160 KiB: ninguna subfase agrega fuentes.
- **`verify:dist`.** El sitemap, el `noindex` y las descripciones son lugares nuevos por donde el
  candado podría filtrarse; el script tiene que revisarlos.
- **La memoria** reproduce las acciones por el mismo camino de código que un clic. Un camino aparte
  terminaría mostrando estados que no existen.
- **Los filtros SVG** (punto 3: en P7 solo salen los de las colinas). Lo nuevo que se mueve en la escena (la vida en reposo,
  el progreso, el final) no debe obligar a repintar el escenario con sus filtros: animar con
  `transform` y `opacity` sobre elementos sin filtro, y nada que corra sin pausa.
