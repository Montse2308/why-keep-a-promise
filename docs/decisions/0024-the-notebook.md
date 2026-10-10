# 0024 · El cuaderno: profundidad y navegación

**Estado:** aceptada (P0). Reemplaza el ADR 0004 (archivado). Precisa el ADR 0005: suma `/sources` y
`/about`. La regla (h) no cambia. Precisada por el ADR 0034: la «frase de estado del manuscrito» es
la frase de estado del working paper, y el candado del cuaderno está en el 0034 (antes, el 0026).
Precisada por el ADR 0036: al cuaderno también se llega desde la portada del home, por sus cinco
páginas, sin `/finding`.

## Contexto

La película cuenta la historia, pero Montse quiere que lo técnico tenga dónde vivir: poder explorar
a fondo el dilema, el experimento, los datos y la ingeniería de la página. Para puestos fullstack,
esa profundidad es tan importante como la sorpresa del home.

El ADR 0004 daba cuatro subpáginas, a las que se llegaba con un «Go deeper →» al final de cada
acto, sin menú. Montse propuso un menú. La solución es un panel propio, el cuaderno, que es parte
de la dirección de arte.

## Decisión

### Las páginas del cuaderno

Todas en EN y ES, con el mismo slug en los dos idiomas.

| Ruta | Qué agrega | Candado |
| ---- | ---------- | ------- |
| `/dilemma` | Estrategia dominante, equilibrio de Nash, ineficiencia, `2R > T + S`, el dilema repetido (con *The Evolution of Trust*) y *cheap talk*. Sin interacción: la mejor respuesta pasó al capítulo 1 (ADR 0023). | — |
| `/vanberg` | El diseño completo, las seis celdas del tratamiento con cambio de pareja, los tratamientos base y cómo se recalcularon los datos públicos con aritmética exacta. | — |
| `/finding` | El hallazgo completo, con la gráfica de culpa. | Todo (ADR 0026) |
| `/how-its-built` | Un caso de estudio de ingeniería: la arquitectura, el motor de escenas (con una demostración pequeña), el candado y `verify:dist`, las pruebas y la aritmética exacta, la paridad EN/ES, la accesibilidad, el rendimiento medido y los ADR como bitácora de decisiones. | Solo la parte del motor de simulación (ADR 0026) |
| `/sources` | Cada cifra de la página, con su referencia completa y dónde se usa. Sale del registro de cifras (`src/content/figures.ts`). | — |
| `/about` | El nombre completo de la autora, GitHub y LinkedIn (`AUTHOR`). Nada más: sin biografía ni hechos (decisión de Montse). | — |

- Cada página solo agrega a la película; no repite sus leyendas (regla (h)).
- El scroll principal se entiende completo sin abrir el cuaderno (esto se hereda del ADR 0004).

### Cómo se llega

- **El botón «Cuaderno»**, en todas las páginas, abre un panel con las seis entradas, cada una con
  una línea que dice qué hay. Es un `<dialog>` nativo, modal, que se cierra con Esc y devuelve el
  foco al botón.
- **Las lupas.** En la película, un enlace pequeño («🔍 El dilema, a fondo») aparece justo donde
  nace la curiosidad y abre esa página. No interrumpen el scroll.
- **Los créditos del capítulo 8** enlazan a todas.
- **Las páginas del cuaderno** llevan un pie con los enlaces a las demás, el enlace EN/ES (ADR 0013) y
  un enlace de vuelta a la película.
- No hay menú de pestañas ni secciones desplegables en la película.

### El candado en el cuaderno

- Con el candado cerrado, la entrada «El hallazgo» del panel muestra su título y la frase de estado
  del manuscrito, nada más. `/finding` muestra su título y la frase.
- Mientras el candado esté cerrado, el panel no enlaza al repositorio del motor (ADR 0026, regla
  (j)).

## Consecuencias

- Rutas nuevas: `/sources`, `/about`, `/es/sources`, `/es/about`. El test de paridad de páginas las
  incluye.
- Salen los «Go deeper →» del final de cada acto y el footer de la versión anterior.
- «Quién es» deja de tener `TODO(F5)`: su contenido está decidido.
- La prosa de `/dilemma` y `/how-its-built` se reescribe para su papel nuevo, con los mismos
  presupuestos de palabras y el mismo registro de cifras.
- Se construye en P5 (`docs/phases.md`).
