# Checklist de lanzamiento (F6)

Se sigue en orden. Ningún paso se salta ni se adelanta. El repo sigue privado y sin Pages hasta
el paso 6.

- [ ] **1. Sumisión.** Confirmar con Montse que la sumisión del manuscrito ocurrió.
- [ ] **1b. Política de la revista.** Montse revisa, sin escribirlo en ningún archivo, la política de
      la revista a la que sometió el manuscrito: si permite versiones previas o *working papers*
      públicos, y si la revisión es doble ciega. Si no permite versiones previas, o si la página
      revelaría la autoría en una revisión doble ciega, el candado sigue cerrado hasta la aceptación
      y se escribe un ADR nuevo antes de seguir (ADR 0026). El repo del motor (paso 2) sigue la
      misma decisión.
- [ ] **2. Motor público.** Confirmar que el repo del motor ya es público.
- [ ] **3. Auditoría del historial.** Revisar todo el historial (`git log -p --all`) buscando
      nombres de revista, correos, rutas de Drive y datos personales. Si aparece algo, se limpia
      el historial antes de seguir. Revisar también `dist/` (`grep -r "TODO(" dist/` vacío salvo
      `TODO(launch)`, que se resuelve en el paso 8).
- [ ] **4. Estado del manuscrito.** Pasar `MANUSCRIPT_STATUS` en `src/config.ts` a
      `'under-review'` ("The manuscript is under review." / "El manuscrito está en revisión.").
      Cambiar el estado abre el candado (ADR 0026): el hallazgo del capítulo 7 con su curva y su
      control, `/finding`, la parte del motor de `/how-its-built` y los enlaces a ellos y al repo del
      motor. El sello del capítulo 7 y la entrada del cuaderno pasan al mismo texto. Luego se corren
      `npm run build` y `npm run verify:dist`, y se revisan en `npm run preview`, en EN y ES, antes
      del paso 6: el capítulo 7 abierto, el cuaderno, `/finding` y `/how-its-built` completos.
- [ ] **5. PDF.** Decisión explícita de Montse sobre publicar o no el PDF. Sin decisión, no hay PDF.
- [ ] **6. Visibilidad.** Hacer público el repo.
- [ ] **7. Pages.** Activar GitHub Pages con *Source = GitHub Actions*.
- [ ] **8. Enlace al motor.** Reemplazar cada `TODO(launch): enlace al repo del motor` por el
      enlace al repo del motor, público desde el paso 2: en el capítulo 7, en el panel del
      cuaderno, en `/finding` y en `/how-its-built` (`grep -rn "TODO(launch)" src/` los lista).
      Después, `npm run build` y `grep -r "TODO(" dist/` vacío.
- [ ] **9. Deploy.** Correr `deploy.yml` a mano (`workflow_dispatch`, `confirm = launch`).
- [ ] **10. Verificación.** Comprobar `/` y `/es/` en línea en
      `https://montse2308.github.io/why-keep-a-promise/`, incluido el switch EN/ES y `hreflang`.
