# 0016 · Regla (c): la revista del manuscrito, no las de la bibliografía

**Estado:** aceptada (F3). Precisa la regla (c) de `docs/content-rules.md` y el punto "No se
nombra la revista" del ADR 0011.

## Contexto

La regla (c) decía "No se nombra la revista a la que va el manuscrito, en ningún archivo". Leída
de forma amplia, chocaba con citar bien a terceros: toda referencia bibliográfica lleva su revista
(*Econometrica*, *American Economic Review* y, desde F3, *Journal of Economic Behavior &
Organization* para Kawagoe y Narita, 2014).

## Decisión

- Ningún archivo dice a qué revista se sometió el manuscrito.
- Las referencias bibliográficas de terceros llevan su revista, como cualquier bibliografía.

La regla (c) de `docs/content-rules.md` queda con ese texto.

## Consecuencias

- `docs/sources.md` cita cada referencia completa, con su revista.
- Ninguna revista entra en la lista de frases prohibidas de `tests/forbidden-phrases.test.ts`: la
  regla no se puede comprobar con una lista sin nombrar la revista que protege.
- La auditoría del historial en F6 (paso 3 del checklist) sigue buscando la revista del manuscrito.
