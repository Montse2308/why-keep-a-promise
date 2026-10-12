# 0045 · El cuaderno, después del lanzamiento

**Estado:** aceptada (M4, paso M4.5). Enmienda el ADR 0024 (la fila de `/about`, el pie de las hojas
y el tope de palabras de `/how-its-built`, que el 0037 había dejado en 700) y el ADR 0041 (la fila
de `/about`: «nada más, sin biografía»). Precisa la regla (j) de `docs/content-rules.md`. Decisión
de Montse (2026-10-12).

## Contexto

El sitio ya está en línea y `/finding` se sostiene sola. Las otras hojas del cuaderno se quedaron
en lo que se decidió antes del lanzamiento: `/about` era solo el nombre y cuatro enlaces, y
`/how-its-built` no tenía el recuadro con el que `/finding` se entiende en un minuto. Quien llega
al cuaderno desde `/finding` no ve, en la misma voz, quién es la autora ni cómo está hecha la
página.

## Decisión

1. **`/about` lleva una bio corta, una foto y los enlaces al código.** La bio dice el puesto, la
   ciudad, la carrera y cómo empezó el proyecto, con el texto que Montse aprobó el 2026-10-12. La
   foto es suya. Los enlaces al código son el de esta página
   (`https://github.com/Montse2308/why-keep-a-promise`) y el del motor (`ENGINE.repository`).
   **Los cuatro enlaces personales** (GitHub, LinkedIn, ORCID y la página de autora en SSRN)
   **conservan `rel="me"`.** Este punto enmienda el ADR 0024, el ADR 0041 y la regla (j), que
   decían «sin escuela, trabajo, ciudad ni biografía».
2. **`/how-its-built` lleva un recuadro «En un minuto»**, como el de `/finding`, arriba: el stack
   (y dice que parte del código se escribió con asistentes de IA, bajo la dirección de Montse),
   las pruebas, «sin rastreo» y los enlaces al código. **Su tope de palabras sube de 700 a 800**,
   sin contar tablas, código ni el texto de los componentes, igual que antes.
3. **El repositorio de la página** se enlaza desde `/how-its-built` y desde `/about`. El del motor
   sigue solo con el candado abierto (ADR 0034).
4. **Cada hoja del cuaderno lleva un pie «Siguiente: …»**, en este orden: El dilema, El experimento
   de Vanberg, El hallazgo, Cómo está hecho, Fuentes, Quién es. Quién es no lleva «Siguiente». El
   título sale de la misma clave que el panel.

### Cómo se leen el ADR 0024 y el ADR 0041

- La fila de `/about` se lee: «El nombre completo de la autora, una bio corta, una foto, GitHub,
  LinkedIn, ORCID y su página de autora en SSRN (`AUTHOR`, los cuatro con `rel="me"`), y los
  enlaces al código de esta página y al del motor». Lo demás del 0024 rige, con las precisiones de
  los ADR 0034, 0035, 0036, 0037 y 0041.
- El pie de las hojas suma «Siguiente», junto al enlace de vuelta a la película que el 0024 ya
  pedía. Las demás hojas del pie no cambian.
- El tope de `/how-its-built` que fijó el ADR 0037 (700) se lee **800**.
- La página de autora en SSRN sigue solo con el candado abierto (ADR 0041). La foto y la bio no
  dependen del candado.

## Consecuencias

- La regla (j), `docs/plan.md` y `AGENTS.md` dicen qué lleva `/about`. No se inventan datos
  personales: los de la bio y la foto son los que Montse dio.
- El texto del recuadro y el de la bio son los que ella aprobó. Si una frase choca con una regla,
  un ADR o el código (en «sin rastreo», con la memoria de la pestaña del ADR 0029), el paso se
  detiene y se propone la forma más cercana: no se reescribe por cuenta propia.
- `tests/prose.test.ts` sube el tope de `/how-its-built` a 800.
- La línea de estado del ADR 0024 y la del ADR 0041 nombran este ADR.
