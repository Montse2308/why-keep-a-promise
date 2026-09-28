# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test`, `build` y
`verify:dist` en verde. Las listas de F0–F4 y R0–R4 están en `docs/archivo/tareas-anteriores.md`.

**Fase activa:** P0 (documentos), en revisión de Montse. Sigue P1.

**Estado del código:** `src/` sigue siendo la versión anterior (los seis actos, la escena y la mesa).
La película la reemplaza por capítulos desde P1 (ADR 0021).

## P0 · Documentos

- [x] Plan cerrado con Montse en cinco rondas: contexto, lluvia de ideas votada, concepto,
      prototipo en dos direcciones (eligió Papel) y plan.
- [x] ADR 0021 (la película), 0022 (Papel), 0023 (juegos), 0024 (el cuaderno), 0025 (tecnología) y
      0026 (el candado).
- [x] Archivo: los ADR 0002, 0003, 0004, 0009, 0014, 0015, 0017, 0018, 0019 y 0020 en
      `docs/archivo/decisiones/`, cada uno con la línea de qué lo reemplaza. También el plan, las
      reglas, las fases y las tareas anteriores.
- [x] Líneas de estado de los ADR 0001, 0005 y 0012.
- [x] `docs/decisions/README.md`: el índice de los ADR vigentes.
- [x] `plan.md`, `content-rules.md` (con (b), (d), (f), (g), (j) y (k) precisadas), `phases.md` y
      este archivo.
- [x] `launch-checklist.md`: el paso 1b (política de la revista) y los pasos 4 y 8 con la estructura
      nueva.
- [x] `AGENTS.md` y los README.
- [x] El prototipo de los capítulos 0 a 3 en `docs/prototipo/te-lo-prometo.html`.
- [ ] Revisión de P0 por Montse.

## P1 · Cimientos y capítulo 0

- [ ] La hoja de personajes (formas, expresiones, las dos voces, el diamante, las monedas, los
      gestos, la paleta y los puntos de luz, el favicon), aprobada por Montse.
- [ ] Fraunces y Nunito autoalojadas (`woff2` de `@fontsource-variable/*`, versión verificada, OFL
      y procedencia).
- [ ] `palette.ts` y `tokens.css` de Papel; tests de contraste y de daltonismo sobre los puntos de
      luz y sobre el papel del cuaderno; test de luz continua.
- [ ] `src/lib/film/`: pistas, curvas, interpolación de colores, cámara según la pantalla y tramos,
      con tests.
- [ ] `src/lib/chapters.ts` (ids y orden, con test) y la colección `src/content/chapters/{en,es}/`.
- [ ] El storyboard en HTML y el script de la película encima; el scroll nativo.
- [ ] El capítulo 0 en EN y ES: la promesa, el diamante y la promesa de la página, con versión quieta
      y de movimiento reducido.
- [ ] Retirar la primera pantalla y la escena de la versión anterior; lo que aún no tiene capítulo
      sigue abajo.
- [ ] Video y capturas para Montse (360 y 1440 px, movimiento reducido, sin JS).

## Preguntas abiertas

- **Axelrod (1984):** verificar antes del lanzamiento la página de los pagos del dilema, de la
  condición `2R > T + S`, de la sombra del futuro y del torneo. La prosa ya la usa y sigue «por
  verificar» en `docs/sources.md`.
- **La forma de las dos voces:** se decide con la hoja de personajes (P1).
- **El color del triángulo:** el que pase los tests de daltonismo frente a los dos roles (P1).
- **Los pendientes de la versión anterior** (en `docs/archivo/tareas-anteriores.md`, sección F5)
  desaparecen con el código que reemplaza la película. Si alguno sobrevive a P4, vuelve aquí.

## Preguntas cerradas

- ~~¿Otro repo o el mismo?~~ El mismo, con archivo (P0).
- ~~¿Se abre el candado en revisión o al aceptar?~~ En revisión, después de revisar la política de
  la revista (paso 1b del checklist, ADR 0026).
- ~~Dirección de arte.~~ Papel (ADR 0022).
- ~~«Quién es».~~ Solo nombre, GitHub y LinkedIn, en `/about` (ADR 0024).
- ~~«Cómo está hecho».~~ Sale del home y se queda como caso de estudio en el cuaderno (ADR 0024).
