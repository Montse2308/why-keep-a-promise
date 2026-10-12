# 0044 · La página en `whykeepapromise.org`

**Estado:** aceptada (M3, paso M3.1). Enmienda el ADR 0008 (la dirección del sitio, su `site` y su
`base`). Decisión de Montse (2026-10-12).

## Contexto

La página vive desde el lanzamiento en `https://montse2308.github.io/why-keep-a-promise/`, una
subcarpeta del dominio de GitHub. Montse compró un dominio propio, `whykeepapromise.org`, para que la
dirección que comparte sea la de la página y no la de su hosting, y para que la página quede en la
raíz de su dominio.

## Decisión

- **La dirección.** La página vive en `https://whykeepapromise.org`, en la raíz: `/`, `/es/`,
  `/finding/`… Astro usa `site: 'https://whykeepapromise.org'` y la `base` en la raíz.
- **El hosting sigue en GitHub Pages**, publicado con GitHub Actions y el mismo `deploy.yml`. El
  dominio se pone en *Settings → Pages* y no con un archivo `CNAME`, que el deploy por Actions
  ignora. *Enforce HTTPS* se marca cuando GitHub emite el certificado.
- **El DNS, en Cloudflare**, donde se compró el dominio, con **todos los registros en «DNS only»**:
  sin proxy. La página promete no tener analítica ni cookies (ADR 0023 y 0029), así que nada de
  Cloudflare se interpone entre el visitante y GitHub: ni proxy, ni Web Analytics, ni ninguna
  función que inyecte scripts o cookies en las páginas.
- **`www` redirige al dominio.** `www.whykeepapromise.org` apunta a GitHub y GitHub lo lleva a
  `whykeepapromise.org`.
- **La dirección `github.io` redirige sola.** GitHub lleva
  `https://montse2308.github.io/why-keep-a-promise/…` a la misma ruta en el dominio, así que los
  enlaces ya compartidos siguen llegando.

### Lo que sigue del ADR 0008

- Hosting en GitHub Pages, publicado con GitHub Actions (`actions/upload-pages-artifact` +
  `actions/deploy-pages`).
- Todo enlace interno pasa por el helper de `src/lib/routes.ts`, aunque la `base` sea la raíz.
- `trailingSlash: 'always'` y `build.format: 'directory'`, para que las URLs coincidan con lo que
  sirve Pages.
- Sin servidor: nada de SSR, formularios propios ni analítica de pago.

## Consecuencias

- `astro.config.mjs`, los valores por defecto que repetían la dirección vieja, los scripts que leen
  `dist/` y sus pruebas usan el dominio y la raíz.
- En la raíz de su dominio, un `robots.txt` sí se lee: `public/robots.txt` nombra el sitemap. El
  404 sigue con `noindex`.
- `verify:dist` comprueba que la canónica, `og:url` y `og:image` de cada página están en el dominio
  y que ninguna página lleva la dirección vieja.
- Los README, `AGENTS.md` y los documentos que describen el estado actual dan la dirección nueva;
  la historia (los ADR, `docs/archivo/`, `docs/launch-checklist.md` y lo cerrado de
  `docs/tasks.md`) conserva la vieja.
- La línea de estado del ADR 0008 nombra este ADR.
