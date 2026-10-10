# 0039 · El hallazgo nombra sus otros dos resultados

**Estado:** aceptada (P9, paso 9.1). Enmienda la regla de `AGENTS.md` y de `docs/content-rules.md`
sobre los parámetros del modelo («no se muestran nunca, salvo θ, c, la culpa disponible y la variante
de robustez en `/finding`»), y precisa el punto 2 del candado del ADR 0034. Decisión de Montse
(2026-10-10, D2).

## Contexto

El working paper tiene tres resultados: la curva (lo que gana cada razón según la confianza de
fondo), un resultado nulo sobre quién puede hablar y uno sobre la tasa con que una promesa deja de
atar a la pareja. `/finding` solo traía el primero. Los otros dos necesitan nombrar algo que la regla
de los parámetros no dejaba: la parte de las veces en que una promesa deja de atar, con su corte.

## Decisión

En `/finding`, la sección «Otros dos resultados» (ADR 0037) dice:

- **Quién habla no decide:** cuando quien decide promete con la misma frecuencia, una población donde
  pueden hablar los dos termina igual que una donde solo habla quien decide, en **60 corridas de
  60**.
- **Cuando una promesa puede dejar de atar:** nombra **con palabras** la parte de las veces en que
  una promesa deja de atar a esta pareja («a share of the time» / «una parte de las veces») y su
  corte en **la mitad** («one half» / «la mitad»).

### Lo que no dice

- Ni la letra `s`, ni φ, ni N, ni generaciones, ni semillas con nombre. «Semilla por semilla» no
  nombra ninguna.
- Ni las cifras 59 % y 43 % del laboratorio.
- Ni la frontera exacta de la franja estrecha bajo la mitad: se nombra como franja, sin cifra.
- Ningún otro valor de los ajustes de esos resultados: la página dice que son otros que los de la
  curva y que el paper los lista (sección 6 y Tabla 1).

### Cómo se lee la regla de los parámetros

Los parámetros del modelo no se muestran nunca, salvo θ, c, la culpa disponible y la variante de
robustez en `/finding`, y, también ahí, la parte de las veces en que una promesa deja de atar,
**solo con palabras**, con su corte en la mitad. Todo detrás del candado (ADR 0034). En el punto 2
del ADR 0034, «ningún otro parámetro del archivo» sigue igual: estos dos resultados no salen de
`curve.json`, sino del working paper.

## Consecuencias

- El registro de cifras suma el 60 de 60 y la mitad, con su fuente en `docs/sources.md` (el working
  paper, sección 6), y la cita nueva de Di Bartolomeo, Dufwenberg, Papa y Passarelli (2023), sin
  cifras.
- `AGENTS.md` y `docs/content-rules.md` precisan la regla de los parámetros.
- La línea de estado del ADR 0034 nombra este ADR.
