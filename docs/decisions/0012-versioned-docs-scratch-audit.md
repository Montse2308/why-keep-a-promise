# 0012 · Docs versionados, `scratch/` ignorado, auditoría antes de hacerlo público

**Estado:** aceptada (F0). Precisada por el ADR 0021: lo que ya no rige se mueve a `docs/archivo/`,
que sigue versionado y entra en la misma auditoría.

## Contexto

La documentación de trabajo sirve a la autora y a los agentes, y se hará pública junto con el repo.
Las notas sueltas y el historial pueden contener lo que no debe publicarse.

## Decisión

- `docs/` se versiona: plan, fases, tareas, reglas, checklist, fuentes y ADR forman parte del repo.
- `scratch/` es el lugar para notas locales y está en `.gitignore`; nunca se commitea.
- Antes de hacer público el repo, se audita todo el historial (`git log -p --all`) buscando nombres
  de revista, correos, rutas de Drive y datos personales (paso 3 del checklist).

## Consecuencias

- Nada sensible se escribe en `docs/`: lo que no puede ser público va a `scratch/` o no se escribe.
- Si la auditoría encuentra algo, el historial se reescribe antes de seguir con el lanzamiento.
