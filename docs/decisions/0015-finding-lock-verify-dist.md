# 0015 · Candado del acto 5 y `verify:dist`

**Estado:** aceptada (F3). Precisa el ADR 0014 sobre el JavaScript del sitio. El ADR 0017 extiende
el candado a `/finding` y a la parte del motor de `/how-its-built`, permite mostrar detrás del
candado θ, c, la culpa disponible y la variante de robustez en `/finding`, y precisa otra vez el
JavaScript del sitio. El ADR 0019 extiende el candado a los tres enlaces de «La investigación»
(la sección se ve en los dos estados) y lleva la frase de estado también a la estampa de la
primera pantalla. El ADR 0014 está reemplazado por el ADR 0018.

## Contexto

En F3 entran la prosa del acto 5, su gráfica y el momento 3 de la mesa. Ese contenido es el
resultado: no puede llegar a la página publicada mientras el manuscrito esté en preparación. Ocultar
el acto con CSS, difuminar la gráfica o dejar un hueco con su forma no basta: la forma ya es el
resultado, y el HTML, el CSS o el JavaScript en `dist/` lo publicarían igual.

## Decisión

- **El candado.** El contenido completo del acto 5 (prosa, gráfica y momento 3) se renderiza solo
  si `MANUSCRIPT_STATUS === 'under-review'` o en el servidor de desarrollo (`import.meta.env.DEV`).
  La regla vive en `findingUnlocked()` de `src/lib/lock.ts`, con test.
- **Cerrado**, el acto 5 muestra solo su título y la frase de estado ("A manuscript is in
  preparation." / "Hay un manuscrito en preparación."), sin ejes, sin gráfica difuminada, sin hueco
  con forma y sin el enlace "Go deeper →". La frase de estado se renderiza en los dos estados,
  desde las claves `manuscript.status.*`.
- **Fuera del build.** No renderizar el componente no alcanza: Astro empaqueta el script de todo
  componente importado. Por eso, en un build con el candado cerrado, el plugin `lockFinding` de
  `astro.config.mjs` resuelve `src/components/curve/Curve.astro` a un stub vacío (`Locked.astro`).
  El componente, su estilo, su script y los datos de la curva no entran al build.
- **El cliente no lee `curve.json`.** El componente pasa al script solo las filas que la página
  muestra (confianza de fondo, pago de cada razón, si la culpa personal tira). Los parámetros del
  modelo y los valores intermedios del archivo no llegan a `dist/` ni con el candado abierto.
- **`npm run verify:dist`** (`scripts/verify-dist.mjs`) corre después de `build`, en `ci.yml` y en
  `deploy.yml`. Con `'in-preparation'` falla si cualquier archivo de texto de `dist/` trae una marca
  del contenido bloqueado: el atributo `data-locked-content`, el id `finding-curve`, el gancho
  `data-curve` del momento 3 y las frases clave del acto 5 en los dos idiomas. Con `'under-review'`
  falla si el acto 5 completo no aparece en `/` y en `/es/`. Un test comprueba que cada marca
  aparece de verdad en las fuentes del acto 5, para que la lista no quede vieja.
- **Precisión del ADR 0014.** "El único JavaScript del sitio es el script de la mesa" pasa a ser:
  el único JavaScript del sitio es el de la mesa, un script para los momentos 1 y 2 y otro para el
  momento 3, que solo existe con el candado abierto.

## Consecuencias

- `npm run dev` muestra siempre el acto 5 completo; `npm run build` con `'in-preparation'`, nunca.
- Abrir el candado es el paso 4 de `docs/launch-checklist.md`: cambiar el estado desbloquea el acto
  5, y después se corren `build` y `verify:dist` y se revisa el acto 5 en `preview`, antes del paso
  6.
- Una marca nueva del contenido bloqueado (otra frase clave, otro id) se agrega a `MARKERS` en
  `scripts/verify-dist.mjs`.
- `/finding` (F4) queda bajo el mismo candado cuando reutilice la curva.
