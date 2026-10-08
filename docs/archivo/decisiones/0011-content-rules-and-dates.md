# 0011 · Reglas de contenido y fechas

> **Archivada (preparación de F6).** Reemplazada en parte por el ADR 0034 (working paper en vez de
> sometimiento a revista): hay un solo texto de estado. El 0034 reescribe lo que sigue vigente de
> aquí. Se conserva como registro; no rige. Sus referencias a otros ADR y a rutas del repo son de su
> momento.

**Estado:** aceptada (F0). El punto sobre la revista está precisado por el ADR 0016.

## Contexto

La página convive con un manuscrito que aún no está publicado. Una frase de más —la revista, una
fecha, una promesa de "pronto"— compromete a la autora o adelanta el resultado.

## Decisión

- Las reglas de `docs/content-rules.md` aplican a todo archivo del repo, incluidos comentarios,
  tests y commits.
- El estado del manuscrito tiene solo dos textos (en preparación / en revisión). El cambio de uno a
  otro lo dispara un hecho confirmado por Montse (paso 1 del checklist), no una fecha.
- No se escriben fechas de sumisión, de revisión ni de publicación esperada, ni correspondencia con
  autores. Las únicas fechas permitidas son los años de las citas y la fecha de generación de
  `curve.json` en su procedencia.
- No se nombra la revista.

## Consecuencias

- Ningún texto dice "coming soon", "not yet approved" ni equivalentes.
- La auditoría del historial en F6 busca, entre otras cosas, fechas y nombres de revista (ADR 0012).
