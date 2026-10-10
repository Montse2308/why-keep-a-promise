# Checklist de lanzamiento (F6)

Se sigue en orden. Ningún paso se salta ni se adelanta. El repo sigue privado y sin Pages hasta
el paso 5.

El lanzamiento lo dispara un hecho, no una fecha: el working paper ya es público en SSRN y el repo
del motor ya es público (ADR 0034).

- [x] **1. Working paper público.** Confirmar con Montse que el working paper ya es público en
      SSRN. Anotar la URL de su página y su DOI.
      Público:
      `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7580218`, DOI `10.2139/ssrn.7580218`.
- [x] **2. Motor público.** Confirmar que el repo del motor ya es público y que tiene la release
      `v1.0.0` con DOI de Zenodo. Anotar el DOI.
      `https://github.com/Montse2308/Dilema-del-Prisionero`, release `v1.0.0`, DOI de esa versión
      `10.5281/zenodo.23222610` (el que cita el working paper; no el DOI concepto).
- [x] **3. Placeholders.** Reemplazar `SSRN_URL_PENDING` y `ENGINE_DOI_PENDING`, y correr
      `npm run check:launch`, `npm run check`, `npm test` y `npm run build`.
      - **Antes de reemplazarlos,** decidir con un ADR nuevo si `/sources` lista también las cifras
        del hallazgo (las de `/finding` y las del capítulo 7) cuando el candado esté abierto. Hoy no
        las lista: el ADR 0024 le da a `/sources` «Candado: —» y el ADR 0034 hace que todo lo que el
        candado no cubre se vea igual en los dos estados, así que con el candado abierto el «cada
        cifra de la página» del ADR 0024 deja fuera las del hallazgo. Si el ADR dice que sí,
        `/sources` gana una parte bloqueada (θ y c siguen solo en `/finding`) y `verify:dist` la
        suma a las páginas que llevan contenido bloqueado; si dice que no, el ADR precisa el «cada
        cifra de la página» del 0024. Sin ese ADR no se reemplaza `SSRN_URL_PENDING`, porque
        reemplazarlo abre el candado.
        Decidido: sí (ADR 0035).
      - En `src/config.ts`: `WORKING_PAPER.ssrn` pasa a la URL del paso 1 y `ENGINE.doi`, al DOI
        del paso 2. En los dos README, el enlace al working paper pasa a la misma URL, y el
        `TODO(launch)` del principio se vuelve el enlace al sitio
        (`grep -n "_PENDING\|TODO(launch)" README*.md` los lista).
      - Con la URL real el candado se abre (ADR 0034): el hallazgo del capítulo 7 con su curva y su
        control, `/finding`, la parte del motor de `/how-its-built` y los enlaces a ellos y al repo
        del motor, con su DOI.
      - Después de los cuatro comandos, `npm run verify:dist` y `npm run budgets`. Abrir el candado
        cambia el peso de los home: si `budgets` dice que `src/data/weight.json` cita otro peso,
        `npm run budgets -- --write` y otro build. `grep -r "TODO(" dist/` vacío.
      - Revisar en `npm run preview`, en EN y ES: el capítulo 7 abierto, el cuaderno, `/finding` y
        `/how-its-built` completos, y los enlaces a SSRN y al motor.
      - El cambio se commitea y llega a `main` antes del paso 7.
      Hecho en la rama `launch/f5-qa` (ADR 0035, los placeholders, los pesos), con F5 sobre el
      build abierto; falta que llegue a `main`.
- [x] **4. Auditoría del historial.** Decisión tomada: el historial se revisó y se deja como está;
      ADR 0034. El correo de los commits ya es público en el motor y en el working paper, y las
      líneas de Claude en los commits son coherentes con la declaración de uso de IA del working
      paper. Lo que queda de este paso es de Montse: borrar la rama remota
      `claude/nifty-hopper-xagnu9`.
      Borrada: `git ls-remote origin` ya no la lista.
- [x] **5. Visibilidad.** Hacer público el repo.
      Público desde el 2026-09-25 (el `PublicEvent` de la API de GitHub), antes de los pasos 3 y 4;
      no se anotó entonces. `gh repo view Montse2308/why-keep-a-promise --json visibility` da
      `PUBLIC`.
- [x] **6. Pages.** Activar GitHub Pages con *Source = GitHub Actions*.
      Activo: `gh api repos/Montse2308/why-keep-a-promise/pages` da `build_type: workflow`,
      `https_enforced: true` y `html_url` `https://montse2308.github.io/why-keep-a-promise/`.
- [x] **7. Deploy.** Correr `deploy.yml` a mano (`workflow_dispatch`, `confirm = launch`). El
      workflow se detiene si `dist/` todavía lleva un `TODO(` o una fuente que `/sources` marca
      «por verificar» (`data-unverified`; hoy ninguna), si queda un placeholder (`check:launch`) o
      si una página se pasa de los presupuestos de peso (`npm run budgets`, ADR 0025): lo que piden
      los pasos 3 y 4, comprobado otra vez antes de publicar.
      Corrido el 2026-10-08: run
      [37860472991](https://github.com/Montse2308/why-keep-a-promise/actions/runs/37860472991),
      sobre `main` en `e74420a` (el merge del PR #19), `build` y `deploy` en verde.
- [x] **8. Verificación.** Comprobar `/` y `/es/` en línea en
      `https://montse2308.github.io/why-keep-a-promise/`, con los enlaces a SSRN y al motor (el
      repo y su DOI) funcionando, el switch EN/ES y `hreflang`.
      Comprobado el 2026-10-09 con `curl`: `/` y `/es/` responden 200, con `lang` en y es,
      canonical, `hreflang` en, es y `x-default` recíprocos, el switch EN/ES a la misma ruta, y los
      enlaces a SSRN (`abstract_id=7580218`), al repo del motor y a su DOI
      (`10.5281/zenodo.23222610`). El repo y el DOI responden; SSRN bloquea a los bots, y Montse
      abrió los enlaces a mano.

## Después del lanzamiento

El sitio en línea es lo que `main` tenía en el último deploy. Un cambio posterior (P8, por ejemplo)
llega al sitio cuando Montse hace el merge a `main` y vuelve a correr `deploy.yml` a mano, con
`confirm = launch` y las mismas comprobaciones del paso 7. Un agente no corre `deploy.yml`, ni
cambia la visibilidad del repo o la configuración de Pages.
