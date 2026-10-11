# 0043 · El código del motor en la página

**Estado:** aceptada (P10, paso 10.1). Enmienda el ADR 0010 («el motor nunca se importa») y suma una
dependencia a las del ADR 0025. Decisión de Montse (2026-10-10 y 2026-10-11).

## Contexto

El ADR 0010 dejó el motor fuera de este repo: su salida llega solo como `src/data/curve.json`, con su
procedencia, y la página no calcula nada del modelo. Así la página no se acoplaba al motor ni lo
exponía.

El ADR 0042 pide que el motor corra en `/finding`, en tres mundos fijos y con las semillas del paper.
Para eso la página necesita el código del motor, no una copia de su salida. Desde el lanzamiento el
repo del motor es público y su `v1.0.0` está archivada con un DOI (ADR 0034), así que la versión que
corre en la página se puede fijar y comprobar.

## Decisión

### La dependencia

- `package.json` suma el motor como dependencia, **fijada al commit de su tag `v1.0.0`**:

  ```json
  "dilema-prisionero": "github:Montse2308/Dilema-del-Prisionero#4e59df734c29915439c51d948bda6ac1360dc38b"
  ```

  `package-lock.json` guarda ese commit en `resolved`, y un test lo comprueba, junto con que la
  versión del motor es `ENGINE.version` de `src/config.ts`. El `package.json` del motor no declara
  versión: la que se compara es la de su `CITATION.cff` (`version: 1.0.0`), que viaja con él.
- **Se importa solo lo necesario**, desde el punto de entrada del motor (`src/index.ts`): `step`,
  `census`, `makeRng`, `uniformPopulation`, `openingCells`, `CAP_OFF`, `TRUST` y los tipos
  `MoranParams` y `MoranState`. Un solo módulo de este repo los importa,
  `src/lib/finding/population.ts`; el worker del navegador y el build usan ese módulo.
- **Del motor solo se usa lo que trae la dependencia**, en `node_modules`. No se abre otro clon, no se
  agrega como submódulo ni alias, no se edita y no se copian sus archivos al repo, salvo la copia de
  respaldo de abajo.
- Si la dependencia no funciona en alguna de las cuatro herramientas (Vite en el cliente y en el
  worker, Vitest, el build de Astro y `astro check`) y no se arregla con configuración, se copia
  `src/` del motor, sin cambios, a `vendor/engine-v1.0.0/`, con un `README.md` de procedencia (repo,
  tag y commit) y un test que compara los archivos de la copia con un hash registrado. Lo que se hizo
  se escribe abajo, en «Cómo quedó».

### Lo que sigue del ADR 0010

- **La curva** sigue llegando precalculada, como `src/data/curve.json`, con su bloque de procedencia;
  nunca se edita, y regenerarla sigue siendo un paso manual con su propio commit. La curva del
  capítulo 7, las tarjetas de los tres mundos, la figura de dos paneles y el explorador siguen leyendo
  ese archivo o la fórmula, no el motor.
- **El motor corre solo en la sección del ADR 0042**, en sus tres mundos y con sus semillas. Ninguna
  otra parte de la página lo importa.
- `curve.json` sigue validando su procedencia con su test.

### Cómo se prueba

Un test de Vitest corre los tres mundos completos con `src/lib/finding/population.ts` y compara la
cuenta final de cada semilla con las corridas del paper, en
`node_modules/dilema-prisionero/results/r6-curve-illustration.json`:

- 5, contra la serie `q9` en 0.05;
- 38, contra la serie `q9b` en 0.38;
- 70, contra la serie `q9` en 0.74: en la sesión de contexto se comprobó que las 20 corridas de 0.70
  son idénticas, generación por generación, a las de 0.74.

Además fija los conteos finales (38: sin culpa personal 15, solo culpa personal 14 y todavía
mezcladas 11, de 40; 5 y 70: sin culpa personal 20 de 20) y la media final de culpa personal en 38,
94.45 de 200, la de `r6`. Si algo no coincide, el test falla y la página no se construye.

### Si cambia la versión

Cambiar la versión del motor es un paso manual y explícito, con su propio commit: se cambia el commit
de `package.json`, se vuelve a correr la prueba contra las corridas del paper (las de la versión
nueva, si cambiaron, con un ADR que lo diga) y se pone al día `ENGINE.version` en `src/config.ts`,
que la línea del motor muestra y que el test compara con la del `CITATION.cff` del motor, y
`ENGINE_COMMIT` en `src/lib/finding/population.ts`. Sin la prueba en
verde, la versión no cambia.

### Cómo quedó

**La dependencia, sin copia en `vendor/`** (paso 10.2). Funciona sin configuración en las cuatro:

- **Vitest:** `src/lib/finding/population.test.ts` corre los tres mundos completos y los compara con
  `r6`; Vite resuelve los `.js` del motor a sus `.ts`.
- **`astro check` y `tsc --noEmit`:** sin errores; revisan también el código del motor, que compila
  con las opciones estrictas de este repo.
- **El build de Astro:** el motor corre en el build (una página de prueba, que no se guardó, mostró
  los conteos finales de 5).
- **Vite, en el cliente y en un worker:** el worker (`new Worker(new URL(…), { type: 'module' })`) se
  empaqueta en un solo archivo y corre el motor, en el build servido con `npm run preview` y en
  `npm run dev`, sin errores en la consola.

`package-lock.json` guarda la dirección del repo como `git+ssh://`; `npm ci` la baja igual sin
llaves SSH (por HTTPS), como en el CI: se probó con `GIT_SSH_COMMAND=false` y una caché vacía.

## Consecuencias

- `package.json` y `package-lock.json` suman `dilema-prisionero`; las dependencias del ADR 0025 suman
  esta, sin preguntar otra vez.
- Entran `src/lib/finding/population.ts` y su test contra `r6`, y el test de la versión fijada.
- La prohibición de `AGENTS.md` de importar el motor dice esta excepción, y la fila del ADR 0010 en
  `docs/decisions/README.md` nombra este ADR.
- La línea de estado de los ADR 0010 y 0025 nombra este ADR.
