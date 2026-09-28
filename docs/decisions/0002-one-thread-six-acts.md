# 0002 · Un hilo, seis actos

**Estado:** reemplazada por el ADR 0019 (R0). Se conserva como registro; no rige.

## Contexto

Una página de divulgación compite por atención. Varias secciones independientes o pestañas
fragmentan el argumento.

## Decisión

Un solo hilo en scroll con seis actos, en este orden: (1) `question` · (2) `dilemma` ·
(3) `two-reasons` · (4) `vanberg` · (5) `finding` · (6) `how-its-built`. El hero es la pregunta
"Why keep a promise that no longer pays?" con la pieza visual. Una franja fija arriba lleva la
autora y los enlaces a GitHub y LinkedIn.

## Consecuencias

- Los ids de sección son estables e iguales en ambos idiomas (`src/lib/acts.ts`).
- El orden de los actos está fijado por un test.
- Profundizar va a subpáginas, no a pestañas ni a secciones desplegables (ADR 0004).
