# 0017 · Subpáginas: mejor respuesta, segunda gráfica, parámetros tras el candado y JetBrains Mono

> **Archivada (P0).** Reemplazada por los ADR 0022 (JetBrains Mono), 0023 (la mejor respuesta pasa
> al capítulo 1), 0024 (las subpáginas) y 0026 (los parámetros detrás del candado). Se conserva como
> registro; no rige. Sus referencias a otros ADR y a rutas del repo son de su momento.

**Estado:** aceptada (F4). Precisa los ADR 0003, 0004, 0014 y 0015, y la frase sobre los
parámetros del modelo de `AGENTS.md` y de `docs/content-rules.md`. El ADR 0019 extiende el
candado a los enlaces de «La investigación». El ADR 0014 está reemplazado por el ADR 0018.

## Contexto

F4 escribe las cuatro subpáginas. Tres cosas chocaban con decisiones anteriores:

- `/dilemma` pide un ejercicio de mejor respuesta sobre la matriz 2×2 del dilema del prisionero,
  con su propio script. El ADR 0015 decía que el único JavaScript del sitio es el de la mesa, y la
  matriz no es la mesa (regla (g)).
- `/finding` pide una segunda gráfica (la culpa disponible contra la confianza de fondo), la
  fórmula con θ y c, y la variante de robustez. El ADR 0003 deja fuera las gráficas extra;
  `AGENTS.md` y `content-rules.md` decían que los parámetros del modelo no se muestran nunca, y el
  ADR 0015, que ni los parámetros ni los valores intermedios de `curve.json` llegan a `dist/`.
- `/how-its-built` muestra código, y el ADR 0014 había diferido JetBrains Mono a F4.

Montse decidió en la sesión F4 resolver los dos primeros con este ADR.

## Decisión

### La mejor respuesta de `/dilemma`

- Una tabla 2×2 con la matriz del acto 2. El visitante elige su jugada en cada columna ("el otro
  coopera", luego "el otro traiciona") y ve su pago contra la alternativa. Al terminar, ve que
  traicionar paga más en las dos columnas (estrategia dominante) y que, si los dos razonan así,
  terminan en (1, 1) en vez de (3, 3).
- Determinista, sin azar. Lógica pura en `src/lib/pd/`, con tests; el componente es
  `src/components/pd/BestResponse.astro`, con su script.
- No es la mesa ni un dilema repetido jugable (reglas (f) y (g)): es una sola jugada, sin rondas.
- Reutiliza el sistema visual: el marco, las etiquetas, los botones y la tabla de la mesa, con los
  mismos tokens, sin colores nuevos. La elección propia lleva el color del rol "tú" y siempre una
  etiqueta de texto.
- Botones nativos, teclado completo, foco que pasa al control siguiente, anuncios en `aria-live`.
  Sin JavaScript se ve la matriz estática.

### La segunda gráfica de `/finding`

- La culpa disponible en cada fila de la grilla, desde `grid[].guilt` de `curve.json`, sin
  interpolar: un punto por fila, lleno si la culpa personal tira y hueco si no (forma, no solo
  color), con la línea del umbral 20/3 y el pico marcado en 38.
- Es una variante (`variant="guilt"`) del mismo componente de la curva
  (`src/components/curve/Curve.astro`), con su marco, sus ejes, `series-1` y su tabla oculta. Solo
  existe en `/finding`.
- La excepción del ADR 0003 a "sin gráficas extra" es solo esta: la segunda gráfica de `/finding`.

### Parámetros del modelo, solo detrás del candado

- `/finding` completo va detrás del candado del ADR 0015: con `'in-preparation'` muestra solo su
  título y la frase de estado, sin enlace "Go deeper →" en el acto 5.
- Detrás del candado, `/finding` puede mostrar θ y c (`params.sens`), la culpa disponible de cada
  fila, el costo de tirar y la variante de robustez (`params.capRobustness`,
  `grid[].robustness`). Ningún otro parámetro del archivo se lee ni se muestra, y la procedencia no
  llega al cliente.
- Esos valores se leen en `src/lib/curve/finding.ts`, que solo importa `Curve.astro`; un build con
  el candado cerrado lo reemplaza por el stub vacío (plugin `lockFinding`), así que nada de eso
  entra a `dist/`.
- La página no recalcula el modelo. La única cuenta es la cuadrática del corte analítico
  (3a² − 228a + 2000 = 0), y solo en `tests/finding.test.ts`, para verificar la prosa.

### El candado en las subpáginas

- La prosa de una subpágina marca con `<!-- lock -->` dónde empieza lo bloqueado
  (`src/lib/subpages.ts`). `/finding` empieza con la marca; `/how-its-built` la pone antes de la
  parte del motor.
- `verify:dist` agrega las marcas de `/finding` (el id `finding-guilt` y frases clave) y del motor,
  y con `'under-review'` exige el contenido desbloqueado en las seis páginas que lo llevan.

### El JavaScript del sitio

"El único JavaScript del sitio es el de la mesa" (ADR 0015) pasa a ser: el JavaScript del sitio es
el de la mesa (un script para los momentos 1 y 2, otro para el momento 3, que solo existe con el
candado abierto) y el de la mejor respuesta de `/dilemma`. Con el candado abierto, `/finding`
también carga el script del momento 3, que no encuentra un control deslizante y no hace nada. La
frase del acto 6 no cambia: describe la página de inicio, y ahí sigue siendo cierta.

### JetBrains Mono

- Autoalojada con el proveedor `local`, como Newsreader e Inter: los `woff2` de
  `@fontsource-variable/jetbrains-mono@5.3.0` copiados sin cambios, con su licencia OFL y su
  procedencia en `src/assets/fonts/README.md`. El paquete no es dependencia del proyecto.
- Solo `latin` y `latin-ext`, eje `wght`, estilo normal: 40 404 + 15 196 = 55 600 bytes.
- Sin precarga. Solo se declara en `/how-its-built` y solo la usan los bloques de código
  (`--font-code`).
- Los bloques de código no llevan resaltado de sintaxis (`markdown.syntaxHighlight: false`): el
  resaltado traería colores fuera de la paleta.

## Consecuencias

- Una interacción nueva en una subpágina necesita otro ADR; esta no abre la puerta a más.
- Cambiar θ, c o la variante de robustez es regenerar `curve.json` (ADR 0010); los tests de
  `/finding` fallan si la prosa no coincide.
- La lista de marcas de `verify:dist` crece con cada frase clave nueva del contenido bloqueado; un
  test comprueba que cada marca aparece en las fuentes bloqueadas y que la parte abierta de cada
  subpágina no lleva ninguna.
