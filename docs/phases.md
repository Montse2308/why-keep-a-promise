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

## F5 · QA

Revisión integral antes del lanzamiento.

**Criterio de salida**

- Móvil: sin scroll horizontal a 320 px; la mesa usable al tacto.
- Accesibilidad: teclado completo, lector de pantalla, contraste, `lang` correcto por página.
- Movimiento reducido verificado.
- `hreflang`, canonical y `x-default` correctos en las veinte combinaciones ruta/idioma.
- Sin enlaces rotos (internos con `base` y externos).
- Metadatos Open Graph y descripción por página e idioma.
- `grep -r "TODO(" dist/` vacío, salvo `TODO(launch)` (paso 8 de `docs/launch-checklist.md`).

## F6 · Lanzamiento

Un solo lanzamiento, sin deploy parcial. Se sigue `docs/launch-checklist.md` en orden.

**Criterio de salida**

- Los diez pasos del checklist marcados.
- `/` y `/es/` en línea en `https://montse2308.github.io/why-keep-a-promise/`.
