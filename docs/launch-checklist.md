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
- [ ] **3. Placeholders.** Reemplazar `SSRN_URL_PENDING` y `ENGINE_DOI_PENDING`, y correr
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
- [x] **4. Auditoría del historial.** Decisión tomada: el historial se revisó y se deja como está;
      ADR 0034. El correo de los commits ya es público en el motor y en el working paper, y las
      líneas de Claude en los commits son coherentes con la declaración de uso de IA del working
      paper. Lo que queda de este paso es de Montse: borrar la rama remota
      `claude/nifty-hopper-xagnu9`.
      Borrada: `git ls-remote origin` ya no la lista.
- [ ] **5. Visibilidad.** Hacer público el repo.
- [ ] **6. Pages.** Activar GitHub Pages con *Source = GitHub Actions*.
- [ ] **7. Deploy.** Correr `deploy.yml` a mano (`workflow_dispatch`, `confirm = launch`). El
      workflow se detiene si `dist/` todavía lleva un `TODO(` o una fuente que `/sources` marca
      «por verificar» (`data-unverified`; hoy ninguna), si queda un placeholder (`check:launch`) o
      si una página se pasa de los presupuestos de peso (`npm run budgets`, ADR 0025): lo que piden
      los pasos 3 y 4, comprobado otra vez antes de publicar.
- [ ] **8. Verificación.** Comprobar `/` y `/es/` en línea en
      `https://montse2308.github.io/why-keep-a-promise/`, con los enlaces a SSRN y al motor (el
      repo y su DOI) funcionando, el switch EN/ES y `hreflang`.
