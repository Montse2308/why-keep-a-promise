# ¿Por qué cumplir una promesa que ya no conviene?

[English](README.md)

**[Abrir el sitio](https://montse2308.github.io/why-keep-a-promise/es/)**

![Cuatro cuadros de la página a lo largo del día: la portada al amanecer, con el título y sus tres puertas, el dilema del prisionero a mediodía, una pareja nueva en la mesa por la tarde mientras el hilo de la promesa sigue yendo a quien se fue, y otra vez la primera mesa de noche.](.github/readme/film-es.webp)

Una página ilustrada, en inglés y en español, sobre por qué la gente cumple promesas que ya no le
convienen, y la investigación que salió de esa pregunta. De Montserrat Ximena Hernández Gallegos.

## Lo que hay en el sitio

El home abre con una portada con tres puertas.

- **La historia.** Nueve capítulos ilustrados que avanzan con el scroll, del dilema del prisionero
  al experimento de cambio de pareja de Vanberg (2008). Juegas por el camino: prometes o no, juegas
  una ronda del dilema, decides si tirar el dado y adivinas el resultado del laboratorio antes de
  verlo.
- **La investigación.** [El hallazgo](https://montse2308.github.io/why-keep-a-promise/es/finding/),
  en una página que se entiende sola: la pregunta, qué se sabía y qué es nuevo, tres mundos, una
  fórmula que se puede mover, otros dos resultados, los límites y cómo citar. El capítulo 7 lo
  cuenta dentro de la historia.
- **El cuaderno**, a un toque: el dilema, el experimento de Vanberg, cómo está hecho, las fuentes y
  quién es la autora.

## La investigación

Una sesión de laboratorio no distingue la culpa personal del compromiso específico a la pareja.
Comparar mundos con distinta confianza de fondo, sí.

- **El documento de trabajo (*working paper*):** *Promises to whom: Identifying personal guilt and
  partner-specific commitment across populations*, en
  [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7580218), DOI
  [10.2139/ssrn.7580218](https://doi.org/10.2139/ssrn.7580218).
- **El motor de simulación** detrás de cada cifra:
  [Montse2308/Dilema-del-Prisionero](https://github.com/Montse2308/Dilema-del-Prisionero), versión
  v1.0.0, DOI [10.5281/zenodo.23222610](https://doi.org/10.5281/zenodo.23222610).

## Cómo está hecho

- **Primero, un storyboard.** Cada página es HTML estático. Sin JavaScript, el home es un
  storyboard: cada capítulo un cuadro quieto con sus textos, cada resultado por escrito. Un script
  lo pone a moverse con el scroll nativo, que nunca captura.
- **Un motor de escenas propio.** Pistas, suavizado, colores mezclados en OKLCH y una cámara que
  encuadra cada pantalla, escritos en TypeScript para esta historia: módulos puros con sus pruebas,
  sin librería de animación y sin canvas.
- **Una fórmula que se puede mover.** En /finding, la fórmula detrás del resultado corre en la
  página: mueve la confianza de fondo, la creencia de que la promesa se cumplirá o cuánto pesa la
  culpa, y la ventana donde la culpa personal cumple su palabra se abre, se mueve o se cierra. Su
  script se carga solo ahí.
- **El motor, en vivo.** En /finding, el motor de simulación del paper corre en tu navegador en tres
  mundos fijos, con las semillas del paper, y una prueba lo compara con las corridas del paper. Su
  código se carga solo al pulsar «Correr el motor».
- **Para todos, y privada.** Cada juego funciona con teclado y anuncia su resultado al lector de
  pantalla, y con movimiento reducido nada gira. Nada se guarda ni se envía: sin cookies, sin
  analítica, y lo que eliges en la historia se queda en la pestaña.
- **Un candado fuera del build.** Hasta que el documento de trabajo fue público en SSRN, el
  hallazgo se quedaba fuera del build, no escondido, y `npm run verify:dist` leía cada archivo
  construido y fallaba si se colaba algún rastro. Ahora el candado está abierto, y la comprobación
  sigue corriendo antes de cada despliegue.
- **Presupuestos y pruebas que detienen el build.** CI falla si el JavaScript del home pasa de
  40 KiB comprimido, las fuentes de 160 KiB o la primera carga de cualquier página de 450 KiB. Casi
  1400 pruebas mantienen los pagos como fracciones exactas, cada cifra atada a su fuente y el
  inglés y el español al día.

La página lo cuenta completo en
[Cómo está hecho](https://montse2308.github.io/why-keep-a-promise/es/how-its-built/).

## Correrlo en local

Requiere la versión de Node.js de [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev      # http://localhost:4321/why-keep-a-promise/
npm run check    # astro check + tsc
npm test         # vitest
npm run build    # sitio estático en dist/
npm run verify:dist  # las comprobaciones del candado sobre el build
npm run budgets      # cada página dentro de su presupuesto de peso
```

Hecho con Astro, TypeScript y SVG. Inglés en `/`, español en `/es/`.

## Cómo citar

Hernández Gallegos, M. X. (2026). *Promises to whom: Identifying personal guilt and
partner-specific commitment across populations* [Documento de trabajo]. SSRN.
https://doi.org/10.2139/ssrn.7580218

El motor tiene su propia cita en
[su repositorio](https://github.com/Montse2308/Dilema-del-Prisionero/blob/main/README.es.md#cómo-citar).

## Licencia

[MIT](LICENSE)
