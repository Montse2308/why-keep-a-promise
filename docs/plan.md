# Plan

Qué es la página. Todo lo de este documento está decidido y no se rediscute: un cambio entra solo
con un ADR nuevo en `docs/decisions/` (índice en `docs/decisions/README.md`). El plan anterior está
en `docs/archivo/plan-anterior.md`.

## Propósito

Página de divulgación para el portafolio de Montse sobre una pregunta: por qué la gente cumple
promesas que ya no le convienen. No es un simulador ni el instrumento de un paper (ADR 0001).

Tiene que:

- sorprender en los primeros 10 segundos, aunque el visitante no juegue;
- dejar que alguien que nunca oyó del dilema del prisionero lo entienda y sepa, al terminar, de qué
  va la investigación (sin el hallazgo mientras el candado esté cerrado);
- tener en cada capítulo algo a lo que alguien le tomaría captura para enseñárselo a otro;
- mostrar oficio, técnico y de diseño, para puestos fullstack.

## Dos capas

| Capa | Qué es | Rutas (EN y ES) | ADR |
| ---- | ------ | --------------- | --- |
| **La película** | El home: la historia en nueve capítulos, ligada al scroll, sobre un solo escenario de papel que cambia de luz. | `/`, `/es/` | 0021 |
| **El cuaderno** | La profundidad técnica y académica, a un toque desde cualquier punto. | `/dilemma`, `/vanberg`, `/finding`, `/how-its-built`, `/sources`, `/about` | 0024 |

- Nombre interno: «Te lo prometo» / «I promise».
- Título visible: «Why keep a promise that no longer pays?» / «¿Por qué cumplir una promesa que ya
  no conviene?».

## La película

| # | id | Capítulo | En pocas palabras | Juego (ADR 0023) |
| - | -- | -------- | ----------------- | ---------------- |
| 0 | `arrival` | Llegada | El otro pide una promesa. La página promete que esto vale unos minutos. | Prometer o no. |
| 1 | `two-rooms` | Dos cuartos | El dilema del prisionero desde cero: traicionar paga más y los dos terminan peor. El dilema repetido queda en *The Evolution of Trust*. | Una ronda; las dos columnas. |
| 2 | `talk` | ¿Y si pudieran hablar? | *Cheap talk*: hablar no obliga, y aun así la gente cumple. | Elegir un mensaje. |
| 3 | `fold` | La matriz se dobla | Otro juego, la misma tensión: el de Vanberg (2008). | Quedarse 14 o tirar el dado. |
| 4 | `two-voices` | Dos voces | Lo que el otro espera y la palabra dada. El truco: cambiar a la persona. | — |
| 5 | `blackout` | El apagón | El cambio de pareja: solo quien decide lo sabe. | El mazo; ser quien recibe. |
| 6 | `real-people` | La gente real | 73 % contra 54 %; lo que esperaban, 70 contra 68. La conclusión de Vanberg. | Adivinar antes de ver. |
| 7 | `my-research` | Aquí entro yo | La pregunta de Montse, el motor en TypeScript y el sello. El hallazgo, detrás del candado. | El control de la curva (con el candado abierto). |
| 8 | `closing` | Cierre | La promesa cobrada, «¿Cumplí?» y los créditos. | Contestar. |

- **Personajes:** tú (círculo), el otro (cuadrado), la pareja nueva (triángulo) y las dos voces.
- **Dos hilos:** la promesa del visitante (el hilo dorado) y la promesa de la página.
- **Cifras:** solo las de `docs/sources.md` (regla (a)).
- **La autora:** su nombre va en el capítulo 7 y en los créditos. GitHub y LinkedIn, en `/about`.
- **La prosa:** leyendas y diálogos en `src/content/chapters/{en,es}/`, con paridad EN/ES.

## El cuaderno

- Un botón «Cuaderno» en todas las páginas abre un panel con las seis entradas.
- Las lupas de la película abren la página que toca, y los créditos enlazan a todas.
- Cada página solo agrega a la película (regla (h)).
- `/how-its-built` es un caso de estudio de ingeniería.
- `/sources` lista cada cifra con su referencia.
- `/about` lleva solo el nombre, GitHub y LinkedIn.

## Dirección de arte (ADR 0027)

- **El escenario:** un diorama de papel recortado, con luz continua que va del amanecer al
  anochecer y sin cortes de color.
- **Los personajes:** formas con cara que reaccionan: el círculo (tú), el cuadrado (el otro) y el
  triángulo (la pareja nueva), con doble borde de tinta y papel. La promesa es un hilo dorado que te
  une al otro, y las decisiones se toman con boletos que dicen la consecuencia.
- **Tipografía:** Fraunces y Nunito, autoalojadas. JetBrains Mono solo para el código.
- **Luz y tema:** la película tiene su propia luz; el cuaderno sigue el tema claro u oscuro del
  sistema.
- **Referencia visual:** el prototipo de los capítulos 0 a 3, en `docs/prototipo/te-lo-prometo.html`.
  Ábrelo en un navegador y elige «Papel».

## Tecnología (ADR 0025)

- Astro estático, TypeScript strict y lógica pura con tests.
- **Mejora progresiva:** un storyboard en HTML que el JavaScript convierte en película.
- Motor de escenas propio en `src/lib/film/`, con el scroll nativo.
- Sonido opcional con Web Audio.
- **Presupuestos:** JS del home ≤ 40 KB comprimido, primera carga ≤ 450 KB, LCP ≤ 2.5 s.
- **La única dependencia nueva:** `@resvg/resvg-js`, solo de desarrollo, para los pósteres de
  Open Graph.

## Accesibilidad y respaldo

- Las leyendas están en el HTML, en orden.
- Botones nativos, teclado completo, foco visible y anuncios en `aria-live`.
- Contraste AA, objetivos táctiles de 44 px o más, y 320 px sin scroll horizontal.
- **Sin JavaScript** o en navegadores viejos: el storyboard.
- **Con movimiento reducido:** cortes limpios entre cuadros quietos, con todos los juegos.

## El candado (ADR 0026)

- Cubre el hallazgo del capítulo 7, `/finding`, la parte del motor de `/how-its-built` y sus
  enlaces.
- Cerrado, se ve un sobre sellado con la frase de estado.
- Se abre en el paso 4 del checklist, después de revisar la política de la revista (paso 1b).

## Idiomas

- Inglés en `/` y español en `/es/`, con paridad completa (ADR 0005).
- El enlace EN/ES es un enlace simple a la misma ruta en el otro idioma (ADR 0013).

## Hosting

- GitHub Pages en `https://montse2308.github.io/why-keep-a-promise/`.
- El repo es privado hasta el lanzamiento (F6), con un solo lanzamiento, sin deploy parcial.
- Presupuesto cero (ADR 0007, ADR 0008).
