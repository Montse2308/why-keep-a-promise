# 0019 · Estructura: el hero es el acto 1, «La investigación» y «Quién es»

**Estado:** aceptada (R0). Reemplaza al ADR 0002. Precisa los ADR 0015 y 0017: el candado se
extiende a los enlaces de «La investigación».

## Contexto

La página seguía el orden de un paper (pregunta → literatura → experimento → hallazgo → método) y
cinco de sus seis actos contaban trabajo de otros. Con el candado cerrado, lo único de la
investigación de Montse que se veía era una frase en el acto 5, al tamaño de la prosa. El
resultado parecía un resumen de Wikipedia. Faltaba además una parte sobre quién es la autora: solo
estaba su nombre en la franja fija.

## Decisión

### Los seis actos y las dos secciones

Los seis actos conservan sus ids y su orden, y el test que lo fija no cambia. Entre ellos entran
dos secciones que no son actos:

| Orden | id              | Bloque                                   |
| ----- | --------------- | ---------------------------------------- |
| 1     | `question`      | Acto 1: la primera pantalla, la escena y la mesa |
| 2     | `dilemma`       | Acto 2                                   |
| 3     | `two-reasons`   | Acto 3                                   |
| 4     | `vanberg`       | Acto 4                                   |
| —     | `research`      | La investigación                         |
| 5     | `finding`       | Acto 5                                   |
| 6     | `how-its-built` | Acto 6                                   |
| —     | `about`         | Quién es                                 |

Un test fija también el orden de las dos secciones.

### La primera pantalla

- **El hero es el acto 1.** Su título ya es la pregunta. La primera pantalla lleva:
  - la pregunta;
  - la escena (ADR 0020), en su golpe 0;
  - **el sello:** la frase de estado del manuscrito, grande, como estampa (ADR 0018). Sale de las
    claves `manuscript.status.*` y sigue a `MANUSCRIPT_STATUS`. Con `'in-preparation'` dice «A
    manuscript is in preparation.» / «Hay un manuscrito en preparación.». En el paso 4 de
    `docs/launch-checklist.md` pasa a «The manuscript is under review.» / «El manuscrito está en
    revisión.». La frase no se reescribe ni se le agrega nada (regla (b));
  - **la autora**, en una línea aparte debajo del sello: el nombre completo de `author.name`, sin
    prefijo. Si en la estampa se ve largo, se acorta solo con aprobación de Montse;
  - el enlace EN/ES, en la esquina, sin quedarse fijo;
  - un enlace de ancla, «La investigación ↓», a `#research`. Es un enlace simple, no un menú; el
    ADR 0004 no cambia.
- **Sin franja fija.** Sale `AuthorStrip`. GitHub y LinkedIn pasan a «Quién es».
- El enlace EN/ES sigue siendo un enlace simple a la misma ruta en el otro idioma (ADR 0013). Está
  en la esquina de la primera pantalla y otra vez en el footer.

### La frase del manuscrito, dos veces

La frase aparece dos veces en la página de inicio: la estampa de la primera pantalla y el acto 5.
El acto 5 cerrado sigue como lo fija el ADR 0015: su título y la frase, en el tamaño de hoy.
«La investigación» no lleva sello.

### «La investigación»

- Va entre el acto 4 y el acto 5: ahí termina lo que hicieron otros y empieza lo de Montse, justo
  antes del hallazgo.
- **Se ve siempre, en los dos estados del candado.** Dice la pregunta, presentada como la pregunta
  de la investigación de Montse, y que ella construyó un motor de simulación en TypeScript.
  Nada más (regla (j)).
- **Lo único detrás del candado son tres enlaces:** al acto 5 (`#finding`), a `/finding` y al
  repositorio del motor (`TODO(launch)`, paso 8 del checklist). Con el candado abierto, la sección
  enlaza y no repite nada de esas páginas.
- La prosa va en Markdown por idioma (ADR 0005), en `src/content/sections/{en,es}/research.md`.
  Los enlaces bloqueados siguen a una marca `<!-- lock -->`, como en las subpáginas (ADR 0017).
- **`verify:dist`** suma una marca propia de esos enlaces, el atributo `data-research-links`
  (fijado en R2). Con `'in-preparation'` falla si la marca está en `dist/`. Con `'under-review'`
  exige la marca en `/` y en `/es/`. La frase de estado no es una marca: se renderiza en los dos
  estados. En los dos estados, además, `verify:dist` exige la frase activa exactamente dos veces
  como texto propio de un elemento en `/` y en `/es/` (la estampa y el acto 5), y la frase del
  otro estado en ninguna página.
- El párrafo del motor sale del acto 6 y pasa aquí. La aritmética exacta y los tests que detienen
  el build son de la página: se quedan en el acto 6.

### «Quién es»

- Va al final, antes del footer, en `src/content/sections/{en,es}/about.md`.
- Lleva los enlaces a GitHub y LinkedIn (`AUTHOR` en `src/config.ts`) y solo los hechos que Montse
  dé. Lo que falte queda como `TODO(F5)`.
- Si al llegar a F5 no hay más hechos, la sección sale solo con GitHub y LinkedIn y el `TODO` se
  quita.

### Los actos, más cortos

- Ningún acto vuelve a contar la escena.
- El acto 1 queda con una entrada mínima y la mesa del momento 1. La situación ya la planteó la
  escena.
- El acto 4 se queda con la decisión del visitante (momento 2) y con las cifras, citadas. Ya no
  cuenta el cambio de pareja paso por paso.
- El acto 6 habla solo de cómo está hecha la página.
- Profundizar sigue yendo a subpáginas, no a pestañas ni a secciones desplegables (ADR 0004).

### Lo que sigue en el footer

El footer lleva los enlaces a las cuatro subpáginas y el enlace EN/ES.

## Consecuencias

- `src/lib/acts.ts` y su test de orden no cambian. Entra un test del orden de `research` y
  `about`.
- La regla (b) se precisa: la estampa también muestra los dos textos de estado. Entra la regla (j)
  (`docs/content-rules.md`).
- `scripts/verify-dist.mjs` suma la marca de los enlaces de «La investigación», y un test comprueba
  que la parte abierta de la sección no lleva ninguna marca del candado.
- El paso 8 del checklist incluye el enlace al motor de «La investigación».
- Se construye en R2 (`docs/phases.md`). La prosa corta de los actos, en R4.
