# Reglas de contenido

Aplican a todo archivo del repo: prosa, claves de i18n, comentarios de código, tests, mensajes de
commit y documentación. Ante la duda, no se escribe y se pregunta.

## (a) Literatura citable en cualquier momento

Se puede citar en cualquier fase:

- El dilema del prisionero.
- El diseño y los resultados publicados de Vanberg (2008).

Cada cifra que aparezca en la página lleva su cita en `docs/sources.md`.

## (b) Estado del manuscrito: dos textos, nada más

El acto 5, `/finding` y la estampa de la primera pantalla (ADR 0019) tienen exactamente dos
estados de texto:

| Estado           | EN                                  | ES                                    |
| ---------------- | ----------------------------------- | ------------------------------------- |
| `in-preparation` | "A manuscript is in preparation."   | "Hay un manuscrito en preparación."   |
| `under-review`   | "The manuscript is under review."   | "El manuscrito está en revisión."     |

- Los textos viven en las claves `manuscript.status.*` de `src/i18n/`; el estado activo está en
  `MANUSCRIPT_STATUS` de `src/config.ts`.
- Se pasa a `under-review` solo en el paso 4 de `docs/launch-checklist.md`.
- La estampa sigue al mismo estado. La frase se puede mostrar grande, pero no se reescribe ni se
  le agrega nada: ni revista, ni PDF, ni parámetros, ni fechas. La línea de la autora va aparte.
- En la página de inicio la frase sale dos veces: la estampa y el acto 5. «La investigación» no
  lleva sello.
- No se escribe "coming soon", "not yet approved" ni equivalentes, en ningún idioma.

## (c) Sin revista, sin PDF

- Ningún archivo dice a qué revista se sometió el manuscrito.
- Las referencias bibliográficas de terceros llevan su revista, como cualquier bibliografía
  (ADR 0016).
- No se publica PDF del manuscrito salvo decisión explícita de Montse en F6.

## (d) Lo que no se dice ni se muestra

- Sin bi-estabilidad, saltos ni volteos de población.
- No se presenta el modelo como si reprodujera tasas de experimentos. Las cifras publicadas de
  Vanberg (2008), con cita, sí se muestran (regla (a)).
- Sin cuatro paneles: los cuatro cuadros de protocolo por emparejamiento. Una viñeta, como la
  versión quieta de la escena (ADR 0020), no cae en esta regla.
- Sin "universalism/particularism".

## (e) La curva es una comparación entre mundos

La curva del acto 5 compara mundos con la confianza de fondo fijada, y la página lo dice
explícitamente. No se presenta como una trayectoria en el tiempo ni como la dinámica de una
población.

## (f) El dilema iterado

Para el dilema iterado se enlaza a *The Evolution of Trust* (Nicky Case), sin competir con ella:
la página no construye su propia versión jugable.

## (g) La mesa no es el dilema del prisionero

Roll/Don't es el juego de Vanberg, no la matriz del dilema del prisionero. La página nunca los
presenta como el mismo juego. El acto 2 muestra la matriz 2×2 como tabla estática y dice que la
mesa es otro juego con la misma tensión.

## (h) Las subpáginas solo agregan

Una subpágina no repite la prosa de su acto: solo agrega.

## (i) Frases prohibidas

Estas cadenas no aparecen en ningún archivo del sitio ni en su código, en ningún idioma y sin
importar mayúsculas: "bi-stab", "bistab", "biestab", "bi-estab", "universalis", "particularis",
"coming soon", "próximamente", "not yet approved", "aún no se aprueba", "está por lanzarse".
`tests/forbidden-phrases.test.ts` las busca en `src/` y en los README; es el único archivo de código
que las lista. La lista no incluye nombres de revistas (regla (c)).

## (j) «La investigación» y «Quién es»

- «La investigación» (ADR 0019) se ve en los dos estados del candado. Con `'in-preparation'` dice
  solo la pregunta, presentada como la pregunta de la investigación de Montse, y que ella
  construyó un motor de simulación en TypeScript.
- No dice nada de tests del motor, semilla, generaciones, imitación ni procedencia, ni el
  hallazgo, la curva, los parámetros o qué motivo paga dónde. La aritmética exacta y los tests que
  detienen el build son de la página y se dicen en el acto 6.
- Con el candado abierto suma tres enlaces, al acto 5, a `/finding` y al repositorio del motor, y
  no repite nada de esas páginas. Esos enlaces no existen en un build con el candado cerrado.
- «Quién es» lleva solo hechos que Montse dé: hoy, GitHub y LinkedIn. Escuela, trabajo, ciudad o
  biografía no se escriben hasta que ella los dé; mientras tanto, `TODO(F5)`.

## (k) La escena del acto 1

- El mensaje de A es ilustrativo y no se presenta como cita de un participante.
- Los pagos son los de la mesa: quien decide recibe 10 en vez de 14, y a quien recibe le tocan 10
  esperado. La cara del dado no es un pago.
- La escena no afirma resultados del experimento. Que lo que espera quien está enfrente no cambió
  con el cambio de pareja (70 contra 68) vive en el acto 4, con su cita.
- Las leyendas no vuelven a aparecer en la prosa de los actos.

## Además (de `AGENTS.md`)

- No se publica el resultado: ni datos de la curva, ni parámetros del modelo, ni qué motivo paga
  dónde, hasta la fase que lo autorice y dentro de estas reglas. Desde F3, el acto 5 los muestra
  solo detrás de su candado (ADR 0015). Los parámetros del modelo no se muestran nunca, salvo θ, c,
  la culpa disponible y la variante de robustez en `/finding`, y solo detrás del mismo candado
  (ADR 0017). Los enlaces de «La investigación» a ese contenido también van detrás del candado
  (ADR 0019, regla (j)).
- Sin fechas de sumisión ni correspondencia con autores en ningún archivo (ADR 0011).
