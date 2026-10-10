# 0037 · `/finding` se entiende sola

**Estado:** aceptada (P9, paso 9.1). Precisa el ADR 0024 (qué agrega `/finding` y cómo se ve), la
regla (h) de `docs/content-rules.md` y el ADR 0025 (los pósteres para compartir). Decisión de
Montse (2026-10-10), con el texto que ella aprobó ese día, en inglés y en español.

## Contexto

`/finding` es la página que Montse va a compartir: en LinkedIn y en correos. Hasta P8 funcionaba
como apéndice del capítulo 7:

- empezaba con la tabla de las cuatro razones, sin decir la pregunta;
- su única gráfica era el mecanismo (la culpa disponible), no el resultado (lo que gana cada razón);
- no decía qué es nuevo;
- no traía dos de los tres resultados del working paper;
- terminaba en dos enlaces sueltos.

Quien llega por un enlace no vio la historia. La página tiene que entenderse sola, en tres lecturas:
en 1 minuto (quien recluta o programa), en 3 (quien tiene curiosidad) y en 5 (quien investiga).

## Decisión

### El orden: primero la intuición, después la fórmula

`/finding` lleva estas secciones, en este orden, con el texto aprobado:

| # | Sección | Qué es |
| - | ------- | ------ |
| 0 | La línea de abajo | Bajo el título, como subtítulo. |
| 1 | En un minuto | Un recuadro con cuatro puntos y tres botones: el paper (SSRN), el motor (el repositorio) y «Cómo citar» (`#cite`). |
| 2 | Qué se sabía y qué agrega | Dos columnas desde unos 768 px y una sola debajo: una lista de definiciones. |
| 3 | Tres mundos | Tres tarjetas fijas (confianza de fondo 5, 38 y 70), sin JS, con un medidor de la culpa disponible contra el umbral; encima, con JS, el explorador de la fórmula (ADR 0038). |
| 4 | Lo que gana cada razón | Una figura de dos paneles con el mismo eje horizontal: arriba, el mecanismo (la gráfica de culpa de siempre); abajo, lo que gana cada razón. |
| 5 | Para quien quiera la cuenta | Las secciones «Cuatro razones, dos pares» y «La fórmula», sin cambios de texto. |
| 6 | Otros dos resultados | Quién habla no decide; cuando una promesa puede dejar de atar (ADR 0039). |
| 7 | Qué lo resolvería | Qué comparación distingue las dos razones. |
| 8 | Robustez | La sección de siempre, sin cambios. |
| 9 | Límites | Los cuatro de siempre, más uno al principio: el otro ve qué razón te mueve. |
| 10 | De dónde salen los números | El motor, con sus enlaces (`{engine}`). |
| 11 | Cómo citar | Bloques `<pre>` seleccionables, sin JS: el working paper (APA y BibTeX) y el motor. |

Al final sigue la frase de estado (regla (b)), sin cambios, y el enlace de vuelta al capítulo 7.

### Lo que precisa de la regla (h)

- `/finding` **puede mostrar los mismos datos** que la curva del capítulo 7: el pago de cada razón
  en cada fila de la grilla. La regla (h) prohíbe repetir las *frases* de la película, no sus
  datos.
- Lo que la dice distinto: el panel de abajo de la figura lleva su propia leyenda, y ninguna frase
  de `/finding` es una frase de la película. `tests/prose.test.ts` lo sigue comprobando, frase por
  frase.

### Lo que precisa del ADR 0024

- La fila de `/finding` se lee: «El hallazgo completo, por sí solo: la pregunta, qué agrega, los
  tres mundos y el explorador, la figura de dos paneles, la cuenta, los otros dos resultados, los
  límites y cómo citar».
- Sigue entera detrás del candado (ADR 0034): con el candado cerrado muestra su título y la frase
  de estado, nada más.
- El tope de palabras de su prosa sube de 700 a **1 600**, sin contar tablas, código ni el texto de
  los componentes (las tarjetas, las figuras y los bloques para citar). El de `/how-its-built` sube
  de 600 a **700**, porque su sección del motor se reescribe con el texto que Montse aprobó con este
  (P9, E4: cuatro decisiones del motor y su `choose()`). Las demás páginas conservan el suyo.
- El bloque de código de la sección del motor de `/how-its-built` cita el `choose()` del motor, no
  código de este sitio: el test de los bloques citados lo comprueba aparte, igual en los dos idiomas,
  porque el motor no se abre desde aquí (ADR 0010).

### De dónde sale cada cosa

- **Los enlaces** al paper y al motor salen de `WORKING_PAPER` y `ENGINE` de `src/config.ts`, nunca
  escritos a mano. Los externos abren en otra pestaña, con `rel` y el aviso (P8, 8.3).
- **Las tarjetas y las figuras** salen de `src/data/curve.json` (ADR 0010), en el build. Las cifras
  que muestran están en el registro (regla (a)).
- **Los bloques para citar** se arman con los datos de `src/config.ts`. En español, el tipo del
  documento es «[Documento de trabajo]», como en `/sources`. El BibTeX usa `note`, no
  `howpublished`.

### Cómo se comparte

- **El póster de `/finding`** (1200 × 630, EN y ES) conserva el marco de los demás (la tarjeta, el
  nombre del proyecto, la firma del ADR 0032 y el elenco). Lleva la línea de la sección 0 en lugar
  de la pregunta del sitio y, a la derecha, una miniatura de la gráfica de pago: el escalón de la
  culpa personal y la línea plana del compromiso específico a la pareja, sin números en los ejes.
  Sin agentes ni poblaciones, y sin la frase de estado. Solo con el candado abierto; cerrado, el
  póster es el de antes.
- **JSON-LD en `/finding`**, solo con el candado abierto: un `ScholarlyArticle` (el título, la
  autora con su ORCID, `datePublished` 2026-10-08, el DOI y la página de SSRN, `publisher` SSRN e
  `inLanguage` en) y un `SoftwareSourceCode` (el repositorio, el DOI de Zenodo, TypeScript y la
  licencia MIT). De `src/config.ts`, sin cifras del hallazgo.

### Lo que no cambia

- El candado (ADR 0034): `/finding` sigue entera detrás de él, y `verify:dist` lo comprueba.
- Las reglas de integridad: (b), (c), (d), (e) y (i). La figura dice en su leyenda que compara
  mundos (regla (e)).
- Ninguna cifra, cita ni afirmación fuera del texto aprobado.

## Consecuencias

- **Código nuevo:** los componentes de los tres mundos, la figura de dos paneles, los botones de «En
  un minuto» y los bloques para citar, con sus slots en `src/lib/subpages.ts`; el póster y el JSON-LD
  de `/finding`.
- **Código que cambia:** `GuiltChart` pasa a ser el panel de arriba de la figura; el tope de palabras
  de `/finding` en `tests/prose.test.ts`.
- **`AGENTS.md`** permite, detrás del candado, las figuras de `/finding` de este ADR y del 0038,
  además de la curva del capítulo 7.
- La línea de estado del ADR 0024 nombra este ADR.
