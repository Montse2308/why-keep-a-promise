# Checklist de lanzamiento (F6)

Se sigue en orden. Ningún paso se salta ni se adelanta. El repo sigue privado y sin Pages hasta
el paso 6.

- [ ] **1. Sumisión.** Confirmar con Montse que la sumisión del manuscrito ocurrió.
- [ ] **2. Motor público.** Confirmar que el repo del motor ya es público.
- [ ] **3. Auditoría del historial.** Revisar todo el historial (`git log -p --all`) buscando
      nombres de revista, correos, rutas de Drive y datos personales. Si aparece algo, se limpia
      el historial antes de seguir. Revisar también `dist/` (`grep -r "TODO(" dist/` vacío salvo
      `TODO(launch)`, que se resuelve en el paso 8).
- [ ] **4. Estado del manuscrito.** Pasar `MANUSCRIPT_STATUS` en `src/config.ts` a
      `'under-review'` ("The manuscript is under review." / "El manuscrito está en revisión.").
- [ ] **5. PDF.** Decisión explícita de Montse sobre publicar o no el PDF. Sin decisión, no hay PDF.
- [ ] **6. Visibilidad.** Hacer público el repo.
- [ ] **7. Pages.** Activar GitHub Pages con *Source = GitHub Actions*.
- [ ] **8. Enlace al motor.** Reemplazar `TODO(launch): enlace al repo del motor` en el acto 6
      (`src/content/acts/{en,es}/06-how-its-built.md`) por el enlace al repo del motor, público desde
      el paso 2. Después, `npm run build` y `grep -r "TODO(" dist/` vacío.
- [ ] **9. Deploy.** Correr `deploy.yml` a mano (`workflow_dispatch`, `confirm = launch`).
- [ ] **10. Verificación.** Comprobar `/` y `/es/` en línea en
      `https://montse2308.github.io/why-keep-a-promise/`, incluido el switch EN/ES y `hreflang`.
