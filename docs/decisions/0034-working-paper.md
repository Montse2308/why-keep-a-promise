# 0034 · Working paper en vez de sometimiento a revista

**Estado:** aceptada (preparación de F6). Reemplaza los ADR 0007, 0011 y 0026 (archivados) y
reescribe lo que sigue vigente de ellos. Precisa el ADR 0001 (la página se lanza sin que el texto
esté publicado en una revista), el 0012 (el historial se revisó y se deja como está), el 0016 (que
ahora precisa el punto sobre revistas de este ADR) y el 0024 (su «frase de estado del manuscrito» es
la frase de estado de aquí).

## Contexto

El plan era lanzar la página cuando el manuscrito se sometiera a una revista: el estado pasaba de
«en preparación» a «en revisión», y ese cambio abría el candado (ADR 0026). El checklist tenía
además un paso para revisar la política de la revista sobre versiones previas y otro para decidir
si se publicaba el PDF.

Ese plan ya no existe. El texto no se somete a ninguna revista: se publica como *working paper* en
SSRN, sin revisión por pares. El repo del motor se hace público el mismo día, con una release
archivada en Zenodo, con su DOI. No hay revisión, así que el estado «en revisión» desaparece, y con
él el paso de la política de la revista y la decisión del PDF.

## Decisión

### El disparador del lanzamiento

- La página se lanza cuando **el working paper ya es público en SSRN y el repo del motor ya es
  público**, con su release `v1.0.0` y su DOI de Zenodo. Los dos los confirma Montse; ninguna fecha
  los dispara.
- Hasta entonces el repo de la página sigue privado (lo que regía del ADR 0007, abajo).

### Un solo texto de estado

- Hay un solo texto de estado, el mismo en los dos estados del candado. El título va en inglés en
  los dos idiomas, porque el documento está en inglés, y enlaza a la página de SSRN:

  | Idioma | Texto |
  | ------ | ----- |
  | EN | Working paper: *Promises to whom: Identifying personal guilt and partner-specific commitment across populations* (SSRN). |
  | ES | Documento de trabajo: *Promises to whom: Identifying personal guilt and partner-specific commitment across populations* (SSRN). |

- Los estados «in preparation» / «en preparación» y «under review» / «en revisión» se eliminan.
- La frase vive en la clave `paper.status` de `src/i18n/`, con `{title}` en lugar del título; el
  título y el enlace, en `WORKING_PAPER` de `src/config.ts`. La pone
  `src/components/PaperStatus.astro`.
- No se reescribe ni se le agrega nada (regla (b) de `docs/content-rules.md`).

### El PDF se enlaza, no se aloja

- El PDF del working paper no se aloja en este repo: se enlaza la página de SSRN. Así hay una sola
  versión, y SSRN lleva el versionado.

### Los enlaces salen de un solo lugar

- `src/config.ts` tiene los dos: `WORKING_PAPER.ssrn` (la página de SSRN) y `ENGINE` (el repo del
  motor y el DOI de su release en Zenodo). `src/lib/engine.ts` arma el enlace al motor que la prosa
  bloqueada pone donde dice `{engine}`, y el panel del cuaderno.
- Mientras no se conozcan, son los placeholders literales `SSRN_URL_PENDING` y
  `ENGINE_DOI_PENDING`. Los README enlazan al working paper con el mismo placeholder.
- `npm run check:launch` construye el sitio y falla si queda algún `*_PENDING` en `dist/`, en
  `src/` (sin sus tests) o en los README. No corre en `ci.yml`, para que el CI siga verde hasta el
  lanzamiento; `deploy.yml` sí lo corre.

### Lo que sigue vigente del ADR 0007: privado hasta el lanzamiento

- El repo es privado hasta F6. Hay un solo lanzamiento, sin deploy parcial ni vistas previas
  públicas.
- `deploy.yml` solo corre con `workflow_dispatch` y una confirmación explícita, y no se corre hasta
  F6.
- Hasta F6 no se cambia la visibilidad del repo, no se activa Pages y no se corre `deploy.yml`.
- El lanzamiento sigue `docs/launch-checklist.md` en orden, empezando por confirmar que el working
  paper es público.
- La auditoría del historial antes de hacerlo público es obligatoria (ADR 0012).
- El historial se revisó y se deja como está: no se reescribe. El correo de los commits ya es
  público en el motor y en el working paper, y las líneas de Claude en los commits son coherentes
  con la declaración de uso de IA del working paper. Montse borra la rama remota
  `claude/nifty-hopper-xagnu9` en el paso 4 del checklist.

### Lo que sigue vigente del ADR 0011: reglas de contenido y fechas

- Las reglas de `docs/content-rules.md` aplican a todo archivo del repo, incluidos comentarios,
  tests y commits.
- No se escriben fechas de sometimiento, de revisión ni de publicación esperada, ni correspondencia
  con otros autores. Las únicas fechas permitidas son los años de las citas y la fecha de generación
  de `curve.json` en su procedencia.
- No se nombra ninguna revista para el texto de Montse. Las referencias bibliográficas de terceros
  llevan su revista, como cualquier bibliografía (ADR 0016).
- Ningún texto dice «coming soon», «under review», «accepted», «peer-reviewed», «published in»,
  «not yet approved» ni equivalentes, en ningún idioma.

### El candado (lo que sigue vigente del ADR 0026, con la regla nueva)

El hallazgo no llega a la página publicada antes que el working paper. Ocultarlo con CSS, difuminar
la gráfica o dejar un hueco con su forma no basta: la forma ya es el resultado, y el HTML, el CSS o
el JavaScript de `dist/` lo publicarían igual.

**La regla.**

- El contenido bloqueado se renderiza solo si el enlace del working paper ya no es un placeholder,
  o en el servidor de desarrollo (`import.meta.env.DEV`). Reemplazar `SSRN_URL_PENDING` en el paso 3
  del checklist abre el candado: el hallazgo se publica junto con el working paper. Es un solo
  interruptor, y no se puede olvidar.
- La regla vive en `findingUnlocked()` de `src/lib/lock.ts`, con test; el enlace, en
  `WORKING_PAPER.ssrn` de `src/config.ts`.

**Qué cubre.**

1. **El hallazgo del capítulo 7:** su prosa, la curva y su control, en leyendas, sin ampliarse.
2. **`/finding` completo.** Detrás del candado, y solo ahí, puede mostrar θ, c, la culpa
   disponible, el costo de tirar y la variante de robustez. Ningún otro parámetro del archivo se lee
   ni se muestra.
3. **La parte del motor de simulación en `/how-its-built`.**
4. **Los enlaces** al hallazgo del capítulo 7, a `/finding` y al repositorio del motor (con el DOI
   de su release), desde el capítulo 7, el panel del cuaderno, `/finding`, `/how-its-built` y los
   créditos.

Todo lo demás se ve en los dos estados.

**Cerrado.**

- El capítulo 7 termina en un sobre sellado con el sello de la frase de estado. El sobre no tiene la
  forma de la curva ni la insinúa, no lleva ejes ni hueco, y no dice nada más que la frase.
- `/finding` muestra su título y la frase de estado, y pide no ser indexado.
- La entrada «El hallazgo» del cuaderno muestra su título y la frase de estado, sin enlace.
- Cerrado ya no se publica nunca: el candado solo está cerrado mientras el enlace de SSRN es un
  placeholder, y `check:launch` impide desplegar así. El estado cerrado es el del CI y el de los
  builds locales antes del lanzamiento.

**Abierto.**

- El sobre se abre y aparece el hallazgo.
- La frase de estado es la misma; la entrada del cuaderno enlaza ahora a `/finding`.

**Fuera del build.**

- No renderizar un componente no alcanza: Astro empaqueta el script de todo componente importado.
- En un build con el candado cerrado, el plugin `lockFinding` de `astro.config.mjs` resuelve cada
  componente bloqueado a un stub vacío. Su estilo, su script y los datos de la curva no entran al
  build.
- Los valores de `/finding` se leen en `src/lib/curve/finding.ts`, que solo importan componentes
  bloqueados.
- El cliente no lee `curve.json`. El componente pasa al script solo las filas que la página muestra.
  La procedencia del archivo nunca llega al cliente (ADR 0010).
- La prosa bloqueada va después de una marca `<!-- lock -->` en su Markdown (`src/lib/subpages.ts`).

**`npm run verify:dist`.**

- Corre después de `build`, en `ci.yml` y en `deploy.yml` (`scripts/verify-dist.mjs`). Lee el
  estado del candado de `WORKING_PAPER.ssrn` en `src/config.ts`.
- **Cerrado,** falla si cualquier archivo de texto de `dist/` trae una marca del contenido
  bloqueado: sus atributos `data-*`, los ids de las gráficas, el gancho del control, el repo del
  motor y frases clave de su prosa en los dos idiomas. El título del working paper queda fuera de
  esa búsqueda: es parte de la frase de estado, que se ve en los dos estados, aunque nombre la culpa
  personal y el compromiso específico a la pareja.
- **Abierto,** falla si falta el contenido bloqueado en alguna página que lo lleva.
- **En los dos estados** exige la frase de estado exactamente dos veces, como texto propio de un
  elemento, en `/` y en `/es/` (el sello del capítulo 7 y la entrada del cuaderno), cada una con su
  enlace a SSRN. El enlace y la cursiva del título cuentan como texto de la frase.
- Un test comprueba que cada marca aparece de verdad en las fuentes bloqueadas y que la parte
  abierta no lleva ninguna.
- Una marca nueva del contenido bloqueado se agrega a `MARKERS` en `scripts/verify-dist.mjs`.

**Antes de abrirlo.** Antes de reemplazar `SSRN_URL_PENDING`, un ADR nuevo decide si `/sources`
lista también las cifras del hallazgo con el candado abierto (paso 3 del checklist, antes el 3b).

## Consecuencias

- `npm run dev` muestra siempre el contenido completo; `npm run build` con `SSRN_URL_PENDING`,
  nunca.
- El checklist se reescribe con el disparador nuevo. Los pasos que citan los ADR vigentes cambian de
  número: el repo del motor público sigue siendo el paso 2 (ADR 0010); la auditoría del historial,
  que los ADR 0012, 0016 y 0021 llaman paso 3, es ahora el paso 4.
- `docs/content-rules.md` reescribe la regla (b) (un solo estado) y la (c) (sin revista; el PDF se
  enlaza a SSRN y no se aloja aquí).
- Las citas al ADR 0026 en el código, los tests y los documentos vigentes pasan a este ADR; las del
  archivo y las de tareas cerradas quedan como registro.
