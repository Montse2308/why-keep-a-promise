# 0006 · Idioma de los artefactos

**Estado:** aceptada (F0)

## Contexto

El repo mezcla código, documentación de trabajo y un sitio bilingüe. Duplicar todo en dos idiomas
cuesta mantenimiento y abre la puerta a copias desincronizadas.

## Decisión

- Código, comentarios, mensajes de commit (Conventional Commits), nombres de archivo y `README.md`:
  inglés. `README.es.md` es su copia en español.
- `AGENTS.md`: inglés, como el resto de artefactos de la raíz del repo.
- Documentación de `docs/` (plan, fases, tareas, reglas, checklist, fuentes, ADR): español, una sola
  copia.
- El sitio: inglés y español con paridad completa (ADR 0005).

## Consecuencias

- Solo hay que sincronizar `README.md` ↔ `README.es.md` y los contenidos del sitio.
- Los nombres de la mesa en código van en inglés (`GameTable`, `src/lib/table/`).
