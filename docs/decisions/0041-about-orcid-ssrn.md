# 0041 · `/about` suma ORCID y SSRN

**Estado:** aceptada (P9, paso 9.1). Enmienda el ADR 0024 (la fila de `/about`: «el nombre completo
de la autora, GitHub y LinkedIn. Nada más») y precisa la regla (j) de `docs/content-rules.md`.
Decisión de Montse (2026-10-10).

## Contexto

Con el working paper en SSRN y el motor archivado en Zenodo, la autora tiene dos perfiles
académicos: su ORCID y su página de autora en SSRN. Quien llega desde `/finding` o desde un póster
y quiere saber quién es la autora los busca en `/about`.

## Decisión

- **`/about` lleva** el nombre completo de la autora, GitHub, LinkedIn, **ORCID** y **su página de
  autora en SSRN**, todos con `rel="me"`, y nada más: ni escuela, ni trabajo, ni ciudad, ni
  biografía.
- **Las direcciones** van en `AUTHOR` de `src/config.ts`, como las demás:
  - ORCID: `https://orcid.org/0009-0003-8778-0440`;
  - SSRN: `https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=13503109`.
- **Abren en otra pestaña**, con `rel="me noopener noreferrer"` y el aviso, como GitHub y LinkedIn
  (P8, 8.3).
- **La página de autora en SSRN, solo con el candado abierto.** Lista el working paper, así que se
  trata como los enlaces al hallazgo (ADR 0034): cerrado, `/about` lleva el nombre, GitHub, LinkedIn
  y ORCID. Hoy el candado está abierto.
- SSRN responde 403 a los bots: los enlaces de SSRN los abre Montse a mano en cada QA.

### Cómo se lee el ADR 0024

La fila de `/about` se lee: «El nombre completo de la autora, GitHub, LinkedIn, ORCID y su página de
autora en SSRN (`AUTHOR`). Nada más: sin biografía ni hechos». Lo demás del 0024 rige, con las
precisiones de los ADR 0034, 0035, 0036 y 0037.

## Consecuencias

- `AUTHOR` suma `orcid` y `ssrn`; `Author.astro` los dibuja junto a GitHub y LinkedIn, con sus
  claves en los dos idiomas.
- El JSON-LD de `/finding` (ADR 0037) usa el ORCID de `AUTHOR`.
- `docs/content-rules.md` (regla (j)), `docs/plan.md` y `AGENTS.md` dicen qué lleva `/about`.
- La línea de estado del ADR 0024 nombra este ADR.
