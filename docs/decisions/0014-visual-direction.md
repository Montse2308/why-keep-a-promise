# 0014 · Dirección visual: ensayo de investigación

**Estado:** aceptada (F1). La consecuencia sobre el JavaScript del sitio está precisada por el
ADR 0015.

## Contexto

F1 fija el sistema visual definitivo. La página es un ensayo que se lee con una sola pieza que se
toca (la mesa, ADR 0003). El sistema tiene que distinguir las dos cosas sin agregar un segundo
estilo, funcionar a 360 px y ser accesible en claro y en oscuro.

## Decisión

### Tipografía

- **La serif es lo que se lee; la sans es lo que se toca.** Prosa y titulares en Newsreader
  variable (`wght`, `opsz`, con itálica) con `font-optical-sizing: auto`. La mesa, la interfaz, la
  franja, el footer, las etiquetas y los números en Inter variable (`wght`, `opsz`). Todo número
  de la mesa lleva `font-variant-numeric: tabular-nums`.
- **JetBrains Mono queda diferida a F4**, solo para `/how-its-built`. En F1 no se instala.
- **Autoalojadas con la API de fuentes de Astro** (estable desde Astro 6), con el proveedor
  `local`. Los `woff2` viven en `src/assets/fonts/` y se copiaron sin cambios de los tarballs
  `@fontsource-variable/newsreader@5.3.0` y `@fontsource-variable/inter@5.3.0`, con su licencia OFL
  y su procedencia en `src/assets/fonts/README.md`. Esos paquetes no son dependencias del proyecto.
  Se descartó el proveedor `fontsource`, que descarga de `api.fontsource.org` en cada build y usa
  URLs `@latest`: el build dependería de la red y no sería reproducible.
- Subsets `latin` y `latin-ext` con su `unicode-range`, `font-display: swap`, fallbacks métricos
  generados por Astro (Times New Roman ajustada para Newsreader, Arial para Inter) y precarga solo
  del archivo de texto: Newsreader normal, `latin`.
- **Escala fluida** con `clamp()` entre 360 px y 1280 px: texto base de 1.125 a 1.25 rem y razón de
  1.2 a 1.25 (`--step-n2` … `--step-5`). La prosa va a 66 `ch`.

### Superficie y layout

- Papel cálido en claro y tinta cálida en oscuro (no negro puro). Filetes finos, sin sombras,
  radios de 3 y 6 px.
- Columna de prosa centrada. La mesa sale de la columna hasta 56 rem. Mobile-first: todo funciona a
  360 px y cada objetivo táctil mide 44 px o más. Debajo de 40 rem la franja pasa a dos filas para
  que el nombre de la autora no se corte.
- Los enlaces van en el color del texto con subrayado fino: el azul queda reservado para el rol
  "tú".
- Favicon SVG propio: una cara de dado con un punto circular (tú) y uno cuadrado (el otro), en los
  colores de rol, sin letras.

### Color

- Fuente única de los valores: `src/lib/design/palette.ts`. `src/styles/tokens.css` lleva
  exactamente esos valores, y un test lo comprueba.
- Tokens semánticos de rol: `--color-you` (azul tinta), `--color-other` (terracota) y
  `--color-promise` (pizarra, un acento neutro distinto de los dos roles). No hay rojo/verde.
- **El color nunca va solo.** Cada rol lleva etiqueta de texto y forma: círculo para "tú",
  cuadrado para "el otro"; la promesa lleva un rombo y su texto.
- Contraste mínimo: 4.5:1 para texto y 3:1 para gráficos e interfaz. Un test calcula el contraste
  WCAG de cada par que usa la página, en claro y en oscuro. Los filetes (`--color-border`) son
  decorativos y nunca son el único borde de un control; los controles usan `--color-control`.
- Un test simula protanopia y deuteranopia (Machado et al., 2009) y exige ΔE\*ab ≥ 40 entre los
  dos roles y ≥ 20 entre la promesa y cada rol.
- Los colores de las series de la curva no se definen aquí; llegan con F3.

### Movimiento

- Solo `transform` y `opacity`, 250 ms como máximo.
- Con `prefers-reduced-motion: reduce`, todo cambio es instantáneo.
- Ninguna animación transmite información por sí sola: el dado, el medidor y cada resultado
  también se muestran como texto y se anuncian en `aria-live`.

## Consecuencias

- Cambiar un color es editar `palette.ts` y `tokens.css` a la vez; si no coinciden, o si un par
  pierde contraste, los tests fallan.
- El build no necesita red para las fuentes. Actualizar una fuente es copiar el `woff2` nuevo con
  su procedencia en `src/assets/fonts/README.md`.
- El único JavaScript del sitio es el script de la mesa (ADR 0013).
