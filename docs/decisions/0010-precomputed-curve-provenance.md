# 0010 · Curva precalculada con procedencia; el motor nunca se importa

**Estado:** aceptada (F0). Enmendada por el ADR 0043: además de `curve.json`, la página usa el código
del motor en su `v1.0.0`, como dependencia fijada a su commit, solo en la sección «Cuando las razones
compiten» de `/finding` (ADR 0042), y un test lo compara con las corridas del paper. La curva sigue
llegando precalculada, con procedencia.

## Contexto

El momento 3 muestra datos que produce el motor de simulación de la investigación. Importarlo
acoplaría ambos repos, expondría el modelo y convertiría la página en un simulador (ADR 0001).

## Decisión

- El motor (repo `dilema-prisionero`) nunca se abre desde aquí, no se agrega como dependencia,
  submódulo ni alias, y no se copian archivos suyos.
- En F3, el motor genera `src/data/curve.json` y ese archivo se copia a este repo con un bloque de
  procedencia: commit del motor, semilla y fecha de generación.
- La página solo lee ese JSON; no calcula nada del modelo.

## Consecuencias

- Un test valida en F3 que `curve.json` trae su procedencia completa.
- Regenerar la curva es un paso manual y explícito, registrado con un commit propio.
- El paso 2 del checklist exige que el repo del motor sea público antes del lanzamiento, para que
  la procedencia se pueda comprobar.
