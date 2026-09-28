# Fases

Cada sesión de trabajo autoriza una fase. Las fases anteriores (F0–F4 y el rediseño R0–R4) están en
`docs/archivo/fases-anteriores.md`. F5 (QA) y F6 (lanzamiento) conservan su nombre porque el
checklist y varios ADR los citan.

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
  diamante, las monedas, los gestos y la paleta Papel con sus puntos de luz. Va como página de
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
- `grep -r "TODO(" dist/` vacío, salvo `TODO(launch)` (paso 8 de `docs/launch-checklist.md`).

## F6 · Lanzamiento

Un solo lanzamiento, sin deploy parcial. Se sigue `docs/launch-checklist.md` en orden.

**Criterio de salida**

- Todos los pasos del checklist marcados.
- `/` y `/es/` en línea en `https://montse2308.github.io/why-keep-a-promise/`.
