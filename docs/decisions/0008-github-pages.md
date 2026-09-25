# 0008 · GitHub Pages

**Estado:** aceptada (F0)

## Contexto

Presupuesto cero y un sitio 100 % estático. El código ya vive en GitHub.

## Decisión

Hosting en GitHub Pages, en `https://montse2308.github.io/why-keep-a-promise/`, publicado con
GitHub Actions (`actions/upload-pages-artifact` + `actions/deploy-pages`).

## Consecuencias

- Astro usa `site: 'https://montse2308.github.io'` y `base: '/why-keep-a-promise'`; todo enlace
  interno pasa por el helper de `src/lib/routes.ts`.
- `trailingSlash: 'always'` y `build.format: 'directory'`, para que las URLs coincidan con lo que
  sirve Pages.
- Sin servidor: nada de SSR, formularios propios ni analítica de pago.
- Pages en un repo privado requiere un plan de pago; por eso Pages se activa solo después de hacer
  público el repo (paso 7 del checklist).
