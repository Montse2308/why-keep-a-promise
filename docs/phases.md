# Fases

Cada sesión de trabajo autoriza una fase. Las fases anteriores (F0–F4 y el rediseño R0–R4) están en
`docs/archivo/fases-anteriores.md`. F5 (QA) y F6 (lanzamiento) conservan su nombre porque el
checklist y varios ADR los citan. P7, los ajustes de la revisión externa, va entre P6 y F5, partida
en subfases (P7.0 a P7.7). P8, los retoques antes de publicar, va después de F5 y antes de los
pasos 5 a 8 del checklist de F6.

**Toda fase se cierra con:**

- `npm run check`, `npm test`, `npm run build` y `npm run verify:dist` en verde;
- paridad EN/ES de lo que entró;
- **un video o capturas para Montse**, a 360 y a 1440 px, que ella revisa antes de la fase
  siguiente. La pregunta de la revisión no es si pasan los tests, sino si esto sorprende.

## P0 · Documentos

Los ADR 0021–0026, el archivo de lo que ya no rige, `plan.md`, `content-rules.md`, `phases.md`,
`tasks.md`, `launch-checklist.md` (paso 1b), `AGENTS.md` y los README. El prototipo, en
`docs/prototipo/`. No toca `src/`.

**Criterio de salida**

- Ningún documento vigente contradice a otro, y lo que ya no rige está en `docs/archivo/`.
- `docs/decisions/README.md` lista exactamente los ADR que hay en `docs/decisions/`.

## P1 · Cimientos y capítulo 0

- **La hoja de personajes:** tú, el otro, la pareja nueva, las dos voces, sus expresiones, el
  hilo dorado, las monedas, los boletos y la paleta Papel con sus puntos de luz. Va como página de
  prueba fuera del sitio o como artifact, para que Montse la apruebe.
- **Los tokens de Papel** en `palette.ts` y `tokens.css`, con los tests de contraste y daltonismo
  sobre los puntos de luz.
- **Las fuentes:** Fraunces y Nunito autoalojadas.
- **El motor de escenas** (`src/lib/film/`), con tests: pistas, curvas de aceleración, interpolación
  de colores, cámara según la pantalla y tramos.
- **El storyboard:** la estructura de capítulos (ids, orden y test), la colección
  `src/content/chapters/` y el script de la película sobre el storyboard.
- **El capítulo 0 terminado**, en EN y ES, con la versión quieta y la de movimiento reducido.
- La película reemplaza la primera pantalla y la escena de la versión anterior. Lo que aún no tiene
  capítulo sigue abajo, tal cual.

**Criterio de salida**

- Montse aprueba la hoja de personajes antes de que empiece P2.
- Video del capítulo 0 en celular y en compu. Capturas con movimiento reducido y sin JavaScript.
- Tests del motor, de los ids y el orden de los capítulos, y de la luz continua (sin cortes).
- A 320 px, sin scroll horizontal.

## P2 · Capítulos 1 a 3

«Dos cuartos», «¿Y si pudieran hablar?» y «La matriz se dobla», con sus juegos (ADR 0023) y la
lógica de `src/lib/pd/` y `PAYOFFS`. Sale la mesa de la versión anterior del acto 1.

**Criterio de salida**

- Video del recorrido de los capítulos 0 a 3 jugando todas las opciones.
- Tests: el dilema se juega una vez, las dos columnas muestran que traicionar paga más, los pagos de
  la decisión salen de `PAYOFFS`, y el capítulo 3 dice que es otro juego (regla (g)).
- Teclado completo y anuncios en `aria-live`.

## P3 · Capítulos 4 a 6

«Dos voces», «El apagón» (el mazo y el receptor) y «La gente real» (adivinar antes de ver). Sale la
mesa del momento 2 de la versión anterior.

**Criterio de salida**

- Video del recorrido de los capítulos 4 a 6.
- El registro de cifras en verde, sin cifras nuevas (o con su entrada en `docs/sources.md`).
- Tests de la regla (f) sobre el mazo (una persona distinta por carta, sin puntaje de pagos
  acumulado) y de la regla (k).

## P4 · Capítulos 7 y 8, y el candado

- «Aquí entro yo»: el sello, el sobre y el hallazgo detrás del candado, con la curva y su control.
- «Cierre»: la promesa cobrada, «¿Cumplí?» y los créditos.
- `verify:dist` se mueve a la estructura nueva (ADR 0026). Salen los actos, «La investigación» y
  «Quién es» del home de la versión anterior.

**Criterio de salida**

- Video del capítulo 7 con el candado cerrado y con el candado abierto.
- `verify:dist` en verde en los dos estados. La frase de estado aparece exactamente dos veces en `/`
  y en `/es/`.
- Tests de la regla (j) sobre el capítulo 7.
- La película entera, de principio a fin, en un video.

## P5 · El cuaderno

El panel, las lupas y las seis páginas: `/dilemma`, `/vanberg`, `/finding`, `/how-its-built` (caso
de estudio), `/sources` y `/about` (ADR 0024).

**Criterio de salida**

- Capturas de cada página a 360 y 1440 px, en claro y oscuro.
- El panel operable con teclado, que devuelve el foco. Test de paridad de páginas con las rutas
  nuevas.
- Regla (h): ninguna página comparte una oración con las leyendas de la película (test).

## P6 · Pulido

El sonido, los detalles (el título de la pestaña y la consola), los pósteres de Open Graph con
`@resvg/resvg-js` y los presupuestos de peso con su script (ADR 0025).

**Criterio de salida**

- Video con sonido.
- El script de presupuestos en verde.
- Un informe de Lighthouse con LCP ≤ 2.5 s en celular emulado, citado en `/how-its-built`.

## P7 · Ajustes de la revisión externa

**Estado:** cerrada (PR #17).

Los puntos de la revisión externa que Montse eligió (1, 2A, 4–13, 15 y 16, y el mínimo del 3). El porqué, el orden y
los riesgos están en `docs/p7-review-plan.md`; los pasos, uno por sesión, en `docs/tasks.md`.
Empieza cuando se cierre la revisión de P6. Cada subfase se cierra como toda fase: en verde
(también `budgets`), con paridad EN/ES y con capturas o video a 360 y 1440 px para Montse.

### P7.0 · Decisiones y documentos

Los ADR 0029 (la memoria en la pestaña), 0030 (las señales del sonido), 0031 (la tarjeta al
costado), 0032 (la autora en los pósteres) y 0033 (la fuente del dilema: Axelrod y Hamilton, 1981);
las decisiones de Montse sobre la tarjeta en la compu y el enlace EN/ES que conserva el capítulo (las
dos, no); los textos nuevos aprobados. No toca `src/`.

**Criterio de salida**

- `docs/decisions/README.md` lista exactamente los ADR que hay en `docs/decisions/`.
- Ningún documento vigente contradice a otro.
- Montse aprobó los textos y las decisiones.

### P7.1 · Cimientos: robustez y refactor (puntos 16 `film.ts`, 1 y 2A)

`film.ts` partido en un controlador por capítulo, sin cambiar nada de lo que hace; el respaldo al
storyboard si el script falla; la memoria de la película en la pestaña (ADR 0029).

**Criterio de salida**

- Prometer, jugar y abrir una lupa; luego volver con Atrás, recargar y volver por el enlace: las
  10 interacciones siguen igual en los tres casos.
- Una pestaña nueva empieza vacía.
- Sin JS y con el script bloqueado se ve el storyboard.
- El JS del home sigue lejos de su techo de 40 KiB.

### P7.2 · Metadatos, SEO y datos (puntos 4, 13 y 6)

Descripción y metadatos de idioma por página, la 404, `noindex` en `/finding` cerrado, el sitemap,
`theme-color` y `apple-touch-icon`; Axelrod y Hamilton (1981) en lugar del libro de 1984 (ADR 0033) y
el cotejo de 70 y 68.

**Criterio de salida**

- `verify:dist` en verde en los dos estados del candado (`under-review` en local, sin commit), y
  revisa el sitemap, el `noindex` y las descripciones.
- Las cabeceras de las 14 páginas revisadas.
- `/sources` sin «por verificar».

### P7.3 · La película: experiencia (puntos 7, 9, 10 y 11)

El chat en orden, el progreso pasivo, la vida en reposo, «Ver de nuevo» y el final que se funde con
el pie.

**Criterio de salida**

- Video del recorrido a 360 y 1440 px.
- Teclado completo; el progreso no recibe el foco.
- Con movimiento reducido no hay balanceo ni parpadeo.
- Los tests de la coreografía en verde, incluido el reloj de la luz.

### P7.4 · Sonido (punto 8)

El acorde al encender y las señales nuevas del ADR 0030, cada una con su entrada en `CUE_SIGHT`.

**Criterio de salida**

- Video con sonido, sin silencios largos entre los capítulos 3 y 7.
- Nada suena sin que el visitante lo haya encendido. Ninguna señal satura y todas suman a lo más 1.

### P7.5 · Horizontal y transiciones (puntos 12 y 15)

La tarjeta al costado con el celular en horizontal (ADR 0031; en la compu siguen centradas), la
cámara sobre el área libre, las transiciones del cuaderno y la salida animada del panel.

**Criterio de salida**

- Capturas a 740×360, 844×390, 1024×768 y 1440×900.
- Sin scroll horizontal a 320 px.
- Los presupuestos de peso en verde.

### P7.6 · Contenido, peso y pintura (el resto del punto 16 y el mínimo del 3)

Las colinas sin filtro de sombra (el mínimo del punto 3), cuadros quietos más ligeros, las citas del capítulo 4 en su línea de cita, el enlace EN/ES en el
panel y la autora en los pósteres (ADR 0032).

**Criterio de salida**

- El storyboard sin JS se ve igual que antes, comparado con capturas, salvo la sombra de las
  colinas, que Montse aprobó por capturas.
- La primera carga del home pesa menos.
- La regla (h) y la paridad de idiomas siguen en verde.

### P7.7 · Cierre y entrega a F5 (punto 5 y el resto del 6)

Los README, Lighthouse otra vez sobre el commit final y una revisión completa.

**Criterio de salida**

- `src/data/lighthouse.json` medido sobre el commit final; `/how-its-built` coincide con
  `npm run budgets`.
- La revisión completa hecha: 1440, 360 y 320 px, horizontal, EN/ES, teclado, movimiento reducido,
  sin JS, script bloqueado y axe en las 14 páginas en claro y oscuro.
- El PR de P7 revisado por Montse. Al cerrarse, empieza F5.

## P8 · Retoques antes de publicar

**Estado:** activa (rama `polish/round-2`, sin push).

Una segunda ronda de pulido, con F5 cerrada y los pasos 1 a 4 de F6 hechos, antes de que el repo se
haga público: el título del home en español en la compu, la nitidez de los títulos de las tarjetas,
los enlaces externos en otra pestaña y un hero nuevo, que Montse elige entre prototipos y que entra
con su ADR (0036). Los pasos, uno por sesión, en `docs/tasks.md`. Los pasos 5 a 8 del checklist
esperan a que P8 llegue a `main`.

**Criterio de salida**

- Las cinco puertas en verde: `check`, `test`, `build`, `verify:dist` y `budgets`, con paridad
  EN/ES.
- El título del home en español cabe en la compu, y los títulos de las tarjetas de la película se
  ven nítidos ahí.
- Todo enlace externo abre en otra pestaña; los internos, en la misma, para no perder lo jugado
  (ADR 0029).
- El hero que Montse eligió, con su ADR 0036 en `docs/decisions/` y en su índice.
- La QA de lo que cambió, los pesos y Lighthouse otra vez (`src/data/weight.json` y
  `src/data/lighthouse.json` al día), y los documentos al día.
- Capturas o video a 360 y 1440 px, EN y ES, que Montse revisa; P8 llega a `main` con su PR.

## F5 · QA

Revisión integral antes del lanzamiento.

**Criterio de salida**

- **Móvil:** sin scroll horizontal a 320 px, y los juegos usables al tacto.
- **El storyboard** sin JavaScript, la película con movimiento reducido y en un navegador sin
  soporte.
- **Accesibilidad:** teclado completo, lector de pantalla, contraste y `lang` correcto por página.
- **Enlaces:** `hreflang`, canonical y `x-default` correctos en todas las combinaciones de ruta e
  idioma, y sin enlaces rotos (internos con `base` y externos).
- **Metadatos:** Open Graph y descripción por página e idioma.
- `grep -r "TODO(" dist/` vacío. Solo quedan los placeholders de los enlaces (`SSRN_URL_PENDING` y
  `ENGINE_DOI_PENDING`), que se reemplazan en el paso 3 de `docs/launch-checklist.md`.

## F6 · Lanzamiento

Un solo lanzamiento, sin deploy parcial. Lo dispara un hecho, no una fecha: el working paper ya es
público en SSRN y el repo del motor ya es público, con su release archivada en Zenodo (ADR 0034).
Se sigue `docs/launch-checklist.md` en orden.

**Criterio de salida**

- Todos los pasos del checklist marcados.
- `npm run check:launch` en verde: ningún placeholder en `dist/`, `src/` ni los README.
- `/` y `/es/` en línea en `https://montse2308.github.io/why-keep-a-promise/`.
- Los enlaces al working paper en SSRN y al motor (el repo y su DOI) funcionando en línea.
