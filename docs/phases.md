# Fases

Cada sesión de trabajo autoriza una fase. Una fase se cierra cuando cumple su criterio de salida
y `npm run check`, `npm test` y `npm run build` están en verde.

## F0 · Esqueleto

Proyecto Astro estático con i18n por rutas, layout base, rutas placeholder en EN/ES, tokens CSS
base, CI y documentación de arranque. Sin prosa, sin mesa.

**Criterio de salida**

- Las diez rutas (`/`, `/dilemma`, `/vanberg`, `/finding`, `/how-its-built` y sus pares en `/es/`)
  compilan y solo llevan título y `TODO(Fx)`. `/` tiene seis secciones con id por acto.
- Una clave de UI presente en un idioma y ausente en el otro rompe `check` y `build`, y un test lo
  comprueba.
- Todo enlace interno pasa por el helper de `src/lib/routes.ts` y respeta `base`.
- `ci.yml` corre en push y PR; `deploy.yml` existe, solo con `workflow_dispatch`.
- `AGENTS.md`, `docs/` y los ADR 0001–0012 escritos.

## F1 · Sistema visual + mesa (momentos 1–2)

Sistema visual definitivo (paleta, tipografía autoalojada, escala) y la mesa con sus momentos 1 y 2.
La lógica del juego vive en módulos puros de `src/lib/table/` con tests. Los pagos del juego se
toman del diseño publicado de Vanberg (2008), cada cifra citada en `docs/sources.md`.

**Criterio de salida**

- Momento 1 (actos 1–2) y momento 2 (acto 4) funcionan en EN y ES.
- Todo se opera con teclado, con foco visible; cada resultado se anuncia en una región
  `aria-live`.
- Con `prefers-reduced-motion` no hay animación que transmita información por sí sola.
- Claro y oscuro con contraste AA.
- Tests de la lógica de la mesa en verde.

## F2 · Prosa de los actos 1–4 y 6

Prosa en Markdown por idioma para los actos 1, 2, 3, 4 y 6, en EN y ES. El acto 2 distingue la
matriz del dilema del prisionero del juego de Vanberg (regla (g)).

**Criterio de salida**

- Paridad EN/ES completa de la prosa.
- El acto 2 muestra la matriz 2×2 del dilema del prisionero como tabla estática y dice que la mesa
  es otro juego con la misma tensión; nunca los presenta como el mismo juego.
- Cada cifra citada en el texto tiene su entrada en `docs/sources.md`.
- Cumple `docs/content-rules.md` (revisión explícita contra cada regla).
- Donde el texto toque el dilema iterado, enlaza a *The Evolution of Trust* (regla (f)).

## F3 · Acto 5 + momento 3

El acto 5 y el momento 3 de la mesa: un slider que mueve un cursor sobre `src/data/curve.json`.
Ese archivo lo genera el motor y se copia aquí con su procedencia: commit del motor, semilla y
fecha. El motor nunca se importa (ADR 0010).

**Criterio de salida**

- `src/data/curve.json` incluye su bloque de procedencia completo, y un test lo valida.
- Dos de las tres series coinciden en todo el recorrido: se muestran encimadas, con una etiqueta
  que lo diga, sin separarlas.
- El texto del acto 5 cumple las reglas (b), (d) y (e) de `docs/content-rules.md`.
- El slider se opera con teclado y anuncia su valor.

## F4 · Subpáginas

`/dilemma`, `/vanberg`, `/finding` y `/how-its-built` en EN y ES. Reutilizan la mesa o la curva;
no hay un segundo estilo visual. Cada subpágina solo agrega a su acto (regla (h)).

Si las horas no alcanzan, aquí se decide qué subpágina se pospone.

**Criterio de salida**

- Las cuatro subpáginas con contenido y paridad EN/ES, o la decisión explícita de cuál se pospone.
- Ninguna subpágina repite la prosa de su acto.
- Cada una enlazada desde "Go deeper →" de su acto y desde el footer.
- `/finding` cumple las reglas (b)–(e).

## R0–R4 · Rediseño

Montse vio la página terminada y la rechazó por verse como un ensayo quieto. El rediseño (ADR
0018, 0019 y 0020) va entre F4 y F5, sin renumerar: F5 y F6 conservan su nombre, porque el
checklist, `AGENTS.md` y varios ADR citan F6. Cada fase R se cierra, como las F, con `check`,
`test`, `build` y `verify:dist` en verde.

### R0 · Documentos

ADR 0018, 0019 y 0020; el 0002 y el 0014 marcados como reemplazados; la línea de estado del 0003
apunta al 0020. Reglas (b), (d), (j) y (k) en `content-rules.md`. `plan.md`, `phases.md`,
`tasks.md`, `launch-checklist.md` y `AGENTS.md`. No toca `src/`.

**Criterio de salida**

- Ningún documento contradice a otro, y todos citan los ADR nuevos donde aplica.

### R1 · Sistema visual (ADR 0018)

Tokens del escenario y del papel en `palette.ts` y `tokens.css`, `--step-7`, sombras de objeto y
topes de movimiento. Sale `AuthorStrip`; el enlace EN/ES pasa a la esquina de la primera pantalla
y al footer.

**Criterio de salida**

- La página actual, sin rehacer, se ve con el sistema nuevo: las dos mesas sobre el escenario, la
  prosa sobre papel.
- Los tests de contraste y de daltonismo cubren los pares del escenario y pasan con los colores
  nuevos, o la promesa recupera un tono.
- Sin franja fija.

### R2 · Estructura (ADR 0019)

Primera pantalla con el sello, la autora y el ancla «La investigación ↓». Las secciones `research`
(entre el acto 4 y el acto 5) y `about` (al final), con prosa EN/ES en
`src/content/sections/{en,es}/`. El párrafo del motor sale del acto 6. `verify:dist` suma la marca
de los enlaces de «La investigación».

**Criterio de salida**

- Con el candado cerrado, la frase del manuscrito sale dos veces (estampa y acto 5), la sección
  «La investigación» se ve y sus tres enlaces no están en `dist/`.
- Con el candado abierto, los tres enlaces están en `/` y en `/es/`.
- Tests del orden de las secciones, de paridad y de la regla (j).

### R3 · La escena (ADR 0020)

Los golpes 0–6 en el SVG de la mesa del acto 1, atados al scroll solo con CSS; la versión quieta;
el paso del asiento a "tú" en el golpe 6; las leyendas en claves de i18n.

**Criterio de salida**

- Una sola mesa en el acto 1; ningún script nuevo.
- La versión quieta con movimiento reducido y donde no hay animaciones ligadas al scroll.
- Teclado, lector de pantalla y 360 px; los controles del momento 1 no se enfocan antes del golpe
  6.
- Tests de la regla (k) y del orden de los golpes.

### R4 · Prosa corta

Los actos 1–4 y 6, reescritos más cortos contra la escena ya construida. Absorbe la revisión
pendiente de la prosa de F2.

**Criterio de salida**

- Paridad EN/ES y cada cifra en el registro y en `docs/sources.md`.
- Ningún acto vuelve a contar la escena; el acto 4 se queda con la decisión y las cifras citadas;
  el acto 6 habla solo de la página.
- Revisión explícita contra las reglas (a)–(k).

## F5 · QA

Revisión integral antes del lanzamiento.

**Criterio de salida**

- Móvil: sin scroll horizontal a 320 px; la mesa usable al tacto.
- La escena a 320 px, y su versión quieta en navegadores sin animaciones ligadas al scroll y con
  movimiento reducido.
- Accesibilidad: teclado completo, lector de pantalla, contraste, `lang` correcto por página.
- Movimiento reducido verificado.
- «Quién es» sin `TODO`: con los hechos que Montse haya dado o, si no hay, solo con GitHub y
  LinkedIn (regla (j)).
- `hreflang`, canonical y `x-default` correctos en las veinte combinaciones ruta/idioma.
- Sin enlaces rotos (internos con `base` y externos).
- Metadatos Open Graph y descripción por página e idioma.
- `grep -r "TODO(" dist/` vacío, salvo `TODO(launch)` (paso 8 de `docs/launch-checklist.md`).

## F6 · Lanzamiento

Un solo lanzamiento, sin deploy parcial. Se sigue `docs/launch-checklist.md` en orden.

**Criterio de salida**

- Los diez pasos del checklist marcados.
- `/` y `/es/` en línea en `https://montse2308.github.io/why-keep-a-promise/`.
