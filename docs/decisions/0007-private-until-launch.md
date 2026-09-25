# 0007 · Repo privado hasta el lanzamiento, un solo lanzamiento

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
