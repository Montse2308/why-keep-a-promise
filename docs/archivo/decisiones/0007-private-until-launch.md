# 0007 · Repo privado hasta el lanzamiento, un solo lanzamiento

> **Archivada (preparación de F6).** Reemplazada en parte por el ADR 0034 (working paper en vez de
> sometimiento a revista): el lanzamiento ya no depende de un sometimiento. El 0034 reescribe lo que
> sigue vigente de aquí. Se conserva como registro; no rige. Sus referencias a otros ADR y a rutas
> del repo son de su momento.

**Estado:** aceptada (F0)

## Contexto

El resultado de la investigación no debe hacerse público antes de que el manuscrito se someta. Un
repo público o un deploy parcial lo expondrían, igual que su historial.

## Decisión

El repo es privado hasta F6. Hay un solo lanzamiento, sin deploy parcial ni vistas previas
públicas. `deploy.yml` solo corre con `workflow_dispatch` y una confirmación explícita, y no se
corre hasta F6.

## Consecuencias

- Hasta F6 no se cambia la visibilidad del repo, no se activa Pages y no se corre `deploy.yml`.
- El lanzamiento sigue `docs/launch-checklist.md` en orden, empezando por confirmar la sumisión.
- La auditoría del historial antes de hacerlo público es obligatoria (ADR 0012).
