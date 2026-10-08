# 0026 · El candado

> **Archivada (preparación de F6).** Reemplazada en parte por el ADR 0034 (working paper en vez de
> sometimiento a revista): el candado se abre con el working paper público, no con el manuscrito en
> revisión. El 0034 reescribe el candado completo. Se conserva como registro; no rige. Sus
> referencias a otros ADR y a rutas del repo son de su momento.

**Estado:** aceptada (P0). Reemplaza el ADR 0015 (archivado) y las partes del candado de los ADR 0017
y 0019 (archivados). Junta en un solo lugar todo lo que el candado cubre, cómo se cierra en el build
y cómo se abre.

## Contexto

El hallazgo de la investigación no puede llegar a la página publicada mientras el manuscrito esté en
preparación. Ocultarlo con CSS, difuminar la gráfica o dejar un hueco con su forma no basta: la forma
ya es el resultado, y el HTML, el CSS o el JavaScript de `dist/` lo publicarían igual.

Con la película (ADR 0021), el candado se mueve de lugar: del acto 5 y «La investigación» al
capítulo 7 y al cuaderno. Antes estaba repartido en cuatro ADR. Aquí queda completo.

Montse decidió en P0 que el candado se abra cuando el manuscrito esté en revisión, como ya estaba
previsto, con un paso nuevo en el checklist para revisar antes la política de la revista.

## Decisión

### La regla

- El contenido bloqueado se renderiza solo si `MANUSCRIPT_STATUS === 'under-review'` o en el
  servidor de desarrollo (`import.meta.env.DEV`).
- La regla vive en `findingUnlocked()` de `src/lib/lock.ts`, con test. El estado activo está en
  `MANUSCRIPT_STATUS` de `src/config.ts`.

### Qué cubre

1. **El hallazgo del capítulo 7:** su prosa, la curva y su control. Su contenido es el del acto 5 de
   la versión anterior, repartido en leyendas, sin ampliarse.
2. **`/finding` completo.** Su contenido es el de hoy, sin ampliarse. Detrás del candado, y solo ahí,
   puede mostrar θ, c, la culpa disponible, el costo de tirar y la variante de robustez. Ningún otro
   parámetro del archivo se lee ni se muestra.
3. **La parte del motor de simulación en `/how-its-built`.**
4. **Los enlaces** al hallazgo del capítulo 7, a `/finding` y al repositorio del motor, desde el
   capítulo 7, el panel del cuaderno y los créditos.

Todo lo demás se ve en los dos estados.

### Cerrado

- **El capítulo 7** termina en un sobre sellado con el sello de la frase de estado. El sobre no
  tiene la forma de la curva ni la insinúa, no lleva ejes ni hueco, y no dice nada más que la frase:
  ni «pronto» ni ninguna promesa de fecha (regla (b)).
- **`/finding`** muestra su título y la frase de estado.
- **La entrada «El hallazgo» del cuaderno** muestra su título y la frase de estado, sin enlace.

### Abierto

- El sobre se abre y aparece el hallazgo.
- La frase de estado pasa a «The manuscript is under review.» / «El manuscrito está en revisión.»
  en el sello, en `/finding` y en la entrada del cuaderno, que ahora enlaza a `/finding`.

### Fuera del build

- No renderizar un componente no alcanza: Astro empaqueta el script de todo componente importado.
- En un build con el candado cerrado, el plugin `lockFinding` de `astro.config.mjs` resuelve cada
  componente bloqueado a un stub vacío. Su estilo, su script y los datos de la curva no entran al
  build.
- Los valores de `/finding` se leen en `src/lib/curve/finding.ts`, que solo importan componentes
  bloqueados.
- **El cliente no lee `curve.json`.** El componente pasa al script solo las filas que la página
  muestra. La procedencia del archivo nunca llega al cliente (ADR 0010).
- La prosa bloqueada va después de una marca `<!-- lock -->` en su Markdown (`src/lib/subpages.ts`).

### `npm run verify:dist`

- Corre después de `build`, en `ci.yml` y en `deploy.yml` (`scripts/verify-dist.mjs`).
- **Con `'in-preparation'`** falla si cualquier archivo de texto de `dist/` trae una marca del
  contenido bloqueado: sus atributos `data-*`, los ids de las gráficas, el gancho del control y
  frases clave de su prosa en los dos idiomas.
- **Con `'under-review'`** falla si falta el contenido bloqueado en alguna página que lo lleva.
- **En los dos estados** exige la frase de estado activa exactamente dos veces, como texto propio de
  un elemento, en `/` y en `/es/`: el sello del capítulo 7 y la entrada del cuaderno. La frase del
  otro estado no puede aparecer en ninguna página.
- Un test comprueba que cada marca aparece de verdad en las fuentes bloqueadas y que la parte
  abierta no lleva ninguna. Así la lista no se queda vieja cuando el candado se mueve al capítulo 7
  y al cuaderno (P4).

### Cómo se abre

- En el paso 4 de `docs/launch-checklist.md`, después del paso nuevo «Política de la revista».
- Si la política de la revista no permite versiones previas públicas, o si la revisión es doble ciega
  y la página revelaría la autoría, el candado sigue cerrado hasta la aceptación. En ese caso un ADR
  nuevo agrega esa condición.

## Consecuencias

- `npm run dev` muestra siempre el contenido completo; `npm run build` con `'in-preparation'`, nunca.
- Una marca nueva del contenido bloqueado se agrega a `MARKERS` en `scripts/verify-dist.mjs`.
- En P4, `verify:dist`, sus marcas, sus páginas desbloqueadas y el conteo de la frase se mueven a la
  estructura nueva. Hasta entonces el script sigue verificando la versión anterior, que sigue en el
  build.
