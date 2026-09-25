# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test` y `build`
en verde.

**Fase activa:** F4, en revisión de Montse. F2, F2.1, F3 y F3.1 en revisión de Montse. F0, F0.1,
F1 y F1.1 cerradas.

## F0 · Esqueleto

- [x] Revisar versiones de Node, npm, git y gh.
- [x] Crear el proyecto Astro (plantilla mínima, TypeScript strict) con `create-astro`.
- [x] `astro.config.mjs`: `site`, `base`, salida estática, i18n `en`/`es` sin prefijo para `en`.
- [x] Configuración del repo: `.gitattributes`, `.gitignore`, `.editorconfig`, `.nvmrc`, `tsconfig` strict.
- [x] Scripts `dev`, `build`, `preview`, `check`, `test`.
- [x] Helper de enlaces que respeta `base` (`src/lib/routes.ts`) con tests.
- [x] `src/lib/i18n.ts` tipado que falla en `check` y en `build` ante claves desbalanceadas, con test.
- [x] Layout base: franja de autora, switch EN/ES que cambia de ruta, footer con subpáginas,
      `hreflang`. (La memoria de la elección se quitó en F0.1, ADR 0013.)
- [x] Rutas placeholder: `/`, `/dilemma`, `/vanberg`, `/finding`, `/how-its-built` y sus pares en
      `/es/`; `/` con seis secciones con id por acto. Test de paridad de páginas.
- [x] Lugar de la mesa en el árbol (`src/components/table/GameTable.astro`, `src/lib/table/`), sin
      implementar.
- [x] `src/styles/tokens.css` con tokens base, claro/oscuro y `prefers-reduced-motion`.
- [x] `ci.yml` (install → check → test → build) y `deploy.yml` (solo `workflow_dispatch`).
- [x] `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `README.md`, `README.es.md`,
      `LICENSE`.
- [x] `docs/`: plan, phases, tasks, content-rules, launch-checklist, sources, ADR 0001–0012.

## F0.1 · Correcciones de auditoría

- [x] `content-rules.md`: regla (d) aclarada; reglas (g) y (h) nuevas.
- [x] `phases.md`: F2 (matriz del PD ≠ juego de Vanberg), F3 (series encimadas y etiquetadas),
      F4 (dónde se pospone una subpágina).
- [x] Nombre visible en `author.name` (EN y ES).
- [x] `AGENTS.md`: prohibido inventar datos personales.
- [x] Switch EN/ES como enlace simple: fuera la redirección, el almacenamiento, sus tests y el
      `<script>`. ADR 0013; `AGENTS.md`, mapa y plan actualizados.
- [x] URL de LinkedIn en `AUTHOR.linkedin`.

## F1 · Sistema visual + mesa (momentos 1–2)

- [x] Resolver las preguntas abiertas de abajo que bloquean F1 (tipografía: ADR 0014).
- [x] Sistema visual: paleta final en `tokens.css` (claro/oscuro, contraste AA), escala tipográfica.
      Valores en `src/lib/design/palette.ts`; tests de contraste, daltonismo y paridad con
      `tokens.css`.
- [x] Fuentes autoalojadas (Newsreader + Inter variables) en `src/assets/fonts/`, con la API de
      fuentes de Astro (proveedor `local`), `font-display: swap`, fallbacks métricos y precarga
      del texto. JetBrains Mono, diferida a F4.
- [x] Favicon propio: cara de dado con los dos colores de rol (el de Astro, fuera).
- [x] Verificar en Vanberg (2008) los pagos y el diseño del juego, con página (F1.1: Suppl. A,
      p. 2; Suppl. B, p. 1).
- [x] Lógica pura de la mesa en `src/lib/table/` (pagos con aritmética exacta, RNG inyectable,
      máquinas de estado de los momentos 1 y 2, expectativa del receptor) con tests.
- [x] Momento 1 en el acto 1: Roll / Don't Roll sin promesa, pago propio contra el del otro,
      esperado y realizado.
- [x] Momento 2 en el acto 4: promesa → sorteo → Roll / Don't; lo que espera el otro no cambia con
      el sorteo (test del invariante).
- [x] Momento 2: lo que hicieron los participantes reales, con cita (F1.1: titular 73 % contra
      54 % y las cuatro celdas, con la del visitante resaltada).
- [x] Medidor con niveles numéricos de expectativa (F1.1: 69 / 100 y 48 / 100, creencia de primer
      orden del receptor).
- [x] Teclado completo y foco visible en la mesa; el foco pasa al primer control del paso
      siguiente.
- [x] Resultados anunciados en una región `aria-live`.
- [x] Movimiento reducido: sin animación que cargue información sola.
- [x] Textos de interfaz de la mesa en `en.json` / `es.json`.
- [x] `<noscript>`: tabla estática de pagos.
- [x] ADR 0014: dirección visual, roles de color y movimiento.

## F1.1 · Cifras de Vanberg desde el material suplementario

- [x] Pagos y dado (Suppl. A, p. 2): coinciden con `PAYOFFS`; cerrado `verify-vanberg`.
- [x] Sorteo de cambio de pareja con probabilidad ½ (Suppl. A, p. 2, Step 3; Suppl. B, p. 1).
- [x] Medidor con la creencia de primer orden del receptor, en fracciones exactas; cerrado
      `vanberg-beliefs`.
- [x] Reveal con las tasas de Roll de los dictadores, en cuentas exactas; cerrado `vanberg-rates`.
- [x] `docs/sources.md`: cada cifra con su fuente, marcada verificada (suplementos).
- [ ] PENDIENTE(pdf), no bloquea: cotejar contra las Tablas I–III impresas y agregar su página
      cuando esté el PDF del artículo.

## F2 · Prosa de los actos 1–4 y 6

- [x] Colección de contenido `acts` (`src/content.config.ts`): `src/content/acts/{en,es}/<nn>-<slug>.md`,
      frontmatter `act`, `title`, `deeper` validado con schema. `HomeView` renderiza cada acto desde
      su archivo; la mesa sigue en los actos 1 y 4.
- [x] Prosa EN/ES de los actos 1, 2, 3, 4 y 6, dentro del presupuesto de palabras (test).
- [x] Acto 2: matriz del dilema del prisionero como tabla estática; la mesa es otro juego con la
      misma tensión (regla (g)); una frase con enlace a *The Evolution of Trust* (regla (f)).
- [x] Acto 3: las dos razones y la tabla de predicciones.
- [x] Acto 4: diseño en el orden del momento 2, resultados y conclusión atribuida a Vanberg (2008).
      Cierre: el marcador de la transición al acto 5, que F3 resolvió.
- [x] Acto 6: cómo está hecho. Enlace al motor: `TODO(launch)`, paso 8 del checklist.
- [x] Registro de cifras y citas (`src/content/figures.ts`) con test de números, citas, paridad
      EN/ES y claves de `docs/sources.md`.
- [x] Lint de frases prohibidas (regla (i) de `content-rules.md`).
- [ ] Revisión de la prosa por Montse.
- [x] Revisión explícita contra cada regla de `content-rules.md` (criterio de salida de F2), en el
      reporte de la sesión F2.

## F2.1 · Correcciones de precisión

- [x] Acto 4: escala de cinco puntos de las apuestas, leída de 0 a 100; nota del medidor
      (`table.meter.note`) con la misma descripción.
- [x] Acto 4: las tasas de Roll cuentan rondas, no personas.
- [x] Acto 4: 192 participantes solo en el tratamiento con cambio de pareja.
- [x] Acto 3: atribución a Vanberg ("en su planteamiento") y tabla en términos de tirar el dado.
- [x] Acto 2: traicionar conviene si el juego se juega una sola vez.
- [x] Acto 6: sin "no da detalles"; pagos de las instrucciones, tasas y apuestas de los datos.
- [x] `docs/sources.md`: Charness y Dufwenberg (2006), Battigalli y Dufwenberg (2007), la ficha de
      Vanberg (2008) y Case (2017), verificadas.

## F3 · Acto 5 + momento 3

- [x] `src/data/curve.json` copiado del motor por Montse (commit `68bc4ba…`), sin cambios. Test de
      procedencia (ADR 0010): `schemaVersion` 1, commit de 40 hex, 18 filas ordenadas por confianza
      de fondo con denominador 100, pagos enteros, series `PGA`, `MC-b` y `GA`.
- [x] Lectura pura de la curva en `src/lib/curve/` (`curve.ts`, `chart.ts`, `moment3.ts`), con
      tests. La página no recalcula el modelo ni interpola; el cliente no importa el JSON.
- [x] Cifras de la curva en la prosa (ventana 15–65, pagos 5 y 10, eje de 0 a 76, pico en 38)
      comprobadas contra el JSON en `tests/curve.test.ts`.
- [x] Candado del acto 5 (ADR 0015): contenido completo solo con `'under-review'` o en `dev`; si no,
      título y frase de estado. Plugin `lockFinding` en `astro.config.mjs`.
- [x] `npm run verify:dist` en `ci.yml` y `deploy.yml`, después de `build`.
- [x] Acto 4 termina en la conclusión de Vanberg; la transición es la primera frase del acto 5.
- [x] Prosa EN/ES del acto 5 (312 y 332 palabras, tope 350), con las seis afirmaciones en orden.
- [x] Gráfica escalonada en SVG estático, sin JS: tres series, etiquetas directas, pico en 38,
      `role="img"` con `aria-label` y tabla oculta con las 18 filas.
- [x] Tres colores nuevos (`series-1` … `series-3`) en `palette.ts` y `tokens.css`, con tests de
      contraste y de daltonismo.
- [x] Momento 3: control deslizante sobre las 18 filas, `aria-valuetext`, cursor, pago de cada
      razón, si la culpa personal tira, anuncio en `aria-live`.
- [x] ADR 0015 (candado y `verify:dist`), ADR 0016 (regla (c)); `content-rules.md`,
      `launch-checklist.md` (paso 4), `sources.md` y `AGENTS.md`.
- [ ] Revisión de la prosa del acto 5 por Montse.
- [x] Decidir la frase del acto 6 "Your browser runs a single script… and it is the table's": con
      el candado abierto hay dos scripts, los dos de la mesa (momentos 1–2 y momento 3).
      Resuelta en F3.1.

## F3.1 · Correcciones de fondo del acto 5 y del acto 6

- [x] Acto 5, tercer párrafo: la culpa personal como producto de dos cantidades, según la
      especificación de Kawagoe y Narita (2014).
- [x] Acto 5, cuarto párrafo: regla de entrada (el otro ve tu tipo y solo entra si vas a tirar;
      fuera, 5 y 5), "medido en pasos de 5" y la culpa general como la razón de «lo que el otro
      espera». Cierre en EN: "Tracing it".
- [x] Presupuesto del acto 5: ≤ 420 palabras por idioma (decisión de Montse; queda en EN 385 y
      ES 415).
- [x] `sources.md`: regla de entrada con su fuente (`params.game`, `params.p`, `TRUST.outside` a
      través del JSON) y el paso de 5; test contra el JSON de que tirar paga 10 y no tirar, 5.
- [x] Acto 6: "Your browser only runs the table's code, in its three moments; the rest is text and
      drawing." / "Tu navegador solo corre el código de la mesa, en sus tres momentos; lo demás es
      texto y dibujo."
- [x] `AGENTS.md`: nombre del repo del motor en GitHub y su carpeta local.
- [ ] Revisión de la prosa del acto 5 por Montse.

## F4 · Subpáginas

- [x] Acto 5, dos pulidos: "There, the other person sees…" / "Ahí, la otra persona ve…" (cuarto
      párrafo) y "así que quien siente culpa personal también tira menos" (ES, segundo párrafo).
- [x] Colección `subpages` (`src/content/subpages/{en,es}/<slug>.md`, frontmatter `act` y
      `title`) y `SubpageView`: la prosa, los componentes de sus marcas `<!-- slot:… -->`, lo que
      sigue a `<!-- lock -->` solo detrás del candado, y un enlace de vuelta al acto
      (`src/lib/subpages.ts`, con tests).
- [x] Mismo registro de cifras, lint de frases prohibidas, paridad EN/ES y presupuesto por idioma
      que los actos (`tests/prose.test.ts`): `/dilemma` ≤ 600, `/vanberg` ≤ 700, `/finding` ≤ 700,
      `/how-its-built` ≤ 600, sin tablas ni código. Quedan en EN/ES: 343/355, 403/436, 352/377 y
      430/453.
- [x] Regla (h): un test falla si una subpágina comparte una oración completa con su acto.
- [x] `/dilemma`: estrategia dominante, equilibrio de Nash, ineficiencia, `2R > T + S`, el dilema
      repetido en un párrafo que termina con *The Evolution of Trust*, y *cheap talk* con el abstract
      de Vanberg (2008) (ES: traducción propia).
- [x] `/dilemma`, mejor respuesta: lógica pura en `src/lib/pd/` con tests; `BestResponse.astro`
      con botones nativos, teclado, `aria-live` y la matriz estática sin JavaScript. Probada solo con
      teclado y a 360 px en Edge sin interfaz (reporte de la sesión F4).
- [x] `/vanberg`: diseño completo con su pantalla o página, las seis celdas del tratamiento con
      cambio de pareja (`src/lib/vanberg/cells.ts`, cuentas exactas) y los tratamientos base.
- [x] `/finding`, completa bajo el candado: cuatro razones y dos pares, la fórmula, la segunda
      gráfica (`Curve.astro`, `variant="guilt"`), robustez, límites, estado y `TODO(launch)`.
      Cifras contra `curve.json` y corte analítico con la cuadrática en enteros
      (`tests/finding.test.ts`).
- [x] `/how-its-built`: la ingeniería de la página, dos fragmentos del código del sitio (un test
      exige que coincidan con `src/`), y la parte del motor bajo el candado. Test que falla si
      `curve.json` cambia.
- [x] JetBrains Mono autoalojada, `latin` y `latin-ext`, sin precarga, solo en los bloques de
      código de `/how-its-built`: 55 600 bytes (40 404 + 15 196). Sin resaltado de sintaxis.
- [x] `verify:dist`: marcas de `/finding` y del motor; con `'under-review'`, el contenido en las seis
      páginas que lo llevan. Build probado en los dos estados.
- [x] `sources.md` (cifras nuevas, verificadas contra los suplementos y los datos públicos; Axelrod
      sigue por verificar), ADR 0017, `AGENTS.md`, `content-rules.md` y `launch-checklist.md`
      (pasos 4 y 8).
- [ ] Revisión de la prosa de las cuatro subpáginas por Montse.
- [ ] Confirmar las cifras nuevas de `/vanberg` (`sources.md`, "Cifras de `/vanberg` (F4)").
- [ ] F5: con el candado abierto, la tabla oculta de la gráfica del acto 5 ensancha la página de
      inicio a 360 px (653 px). La de `/finding` se corrigió envolviéndola en un `div` oculto; la
      del acto 5 es del momento 3 y queda para F5.

## Preguntas abiertas

- Verificar antes del lanzamiento Axelrod (1984), con la página de los pagos del dilema, de la
  condición `2R > T + S`, de la sombra del futuro y del torneo: la prosa ya lo usa (acto 2 y
  `/dilemma`) y sigue "por verificar" en `docs/sources.md`.

## Preguntas cerradas

- ~~Pagos, sorteo, creencias y tasas de Vanberg (2008) con página.~~ Resuelta en F1.1 con el
  material suplementario (`docs/sources.md`).
- ~~Tipografía para autoalojar en F1.~~ Resuelta en F1: Newsreader + Inter variables, JetBrains
  Mono diferida a F4 (ADR 0014).
- ~~URL del perfil de LinkedIn.~~ Resuelta en F0.1: está en `AUTHOR.linkedin`.
- ~~Título en español.~~ Confirmado en F0.1: "¿Por qué cumplir una promesa que ya no conviene?".
- ~~Regla (d) frente al momento 2 y la regla (a).~~ Resuelta en F0.1: el modelo no se presenta
  como si reprodujera tasas de experimentos; las cifras publicadas de Vanberg (2008), con cita, sí
  se muestran.
