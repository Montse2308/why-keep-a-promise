# Reglas de contenido

Aplican a todo archivo del repo: prosa, claves de i18n, comentarios de código, tests, mensajes de
commit y documentación. Ante la duda, no se escribe y se pregunta.

Las letras (a)–(k) son las mismas de las versiones anteriores, para que las pruebas y los commits que
las citan sigan valiendo. Las reglas de integridad no cambiaron. (g), (j) y (k) se reescribieron
para la película (ADR 0021). La versión anterior está en `docs/archivo/reglas-anteriores.md`.

## (a) Literatura citable en cualquier momento

Se puede citar en cualquier fase:

- El dilema del prisionero.
- El diseño y los resultados publicados de Vanberg (2008).

Cada cifra que aparezca en la página lleva su cita en `docs/sources.md` y su entrada en el registro
de cifras (`src/content/figures.ts`). Una cifra nueva no entra hasta tener las dos.

## (b) Estado del manuscrito: dos textos, nada más

El sello del capítulo 7, la entrada «El hallazgo» del cuaderno y `/finding` tienen exactamente dos
estados de texto (ADR 0026):

| Estado           | EN                                  | ES                                    |
| ---------------- | ----------------------------------- | ------------------------------------- |
| `in-preparation` | "A manuscript is in preparation."   | "Hay un manuscrito en preparación."   |
| `under-review`   | "The manuscript is under review."   | "El manuscrito está en revisión."     |

- Los textos viven en las claves `manuscript.status.*` de `src/i18n/`; el estado activo está en
  `MANUSCRIPT_STATUS` de `src/config.ts`.
- Se pasa a `under-review` solo en el paso 4 de `docs/launch-checklist.md`.
- La frase se puede mostrar grande, como sello, pero no se reescribe ni se le agrega nada: ni
  revista, ni PDF, ni parámetros, ni fechas. La autora va aparte.
- En la página de inicio la frase sale exactamente dos veces: el sello del capítulo 7 y la entrada
  del cuaderno.
- No se escribe "coming soon", "not yet approved" ni equivalentes, en ningún idioma. El sobre sellado
  no dice nada más que la frase.

## (c) Sin revista, sin PDF

- Ningún archivo dice a qué revista se sometió el manuscrito.
- Las referencias bibliográficas de terceros llevan su revista, como cualquier bibliografía
  (ADR 0016).
- No se publica PDF del manuscrito salvo decisión explícita de Montse en F6.

## (d) Lo que no se dice ni se muestra

- Sin bi-estabilidad, saltos ni volteos de población.
- No se visualizan poblaciones ni dinámicas: ni agentes, ni rejillas, ni un punto por persona
  (ADR 0023).
- No se presenta el modelo como si reprodujera tasas de experimentos. Las cifras publicadas de
  Vanberg (2008), con cita, sí se muestran (regla (a)).
- Sin cuatro paneles: los cuatro cuadros de protocolo por emparejamiento. Los cuadros quietos del
  storyboard de cada capítulo (ADR 0025) no caen en esta regla.
- Sin "universalism/particularism".

## (e) La curva es una comparación entre mundos

La curva del capítulo 7 (detrás del candado) compara mundos con la confianza de fondo fijada, y la
página lo dice explícitamente. No se presenta como una trayectoria en el tiempo ni como la dinámica
de una población.

## (f) El dilema iterado

- Para el dilema iterado se enlaza a *The Evolution of Trust* (Nicky Case), sin competir con ella.
  La página no construye su propia versión jugable.
- El dilema del capítulo 1 se juega una sola vez.
- El mazo del capítulo 5 no es un dilema repetido: es el juego de Vanberg, y cada carta es una
  persona distinta, sin memoria de las anteriores (ADR 0023).

## (g) El juego de Vanberg no es el dilema del prisionero

- Roll/Don't Roll es el juego de Vanberg, no la matriz del dilema del prisionero. La página nunca los
  presenta como el mismo juego.
- El dilema aparece en el capítulo 1 como un tablero de 2×2 ilustrado, con sus pagos, y en
  `/dilemma`.
- El paso al juego de Vanberg (capítulo 3, «La matriz se dobla») dice en pantalla que es otro juego
  con la misma tensión.

## (h) Las subpáginas solo agregan

Una página del cuaderno no repite las leyendas de la película: solo agrega.

## (i) Frases prohibidas

- Estas cadenas no aparecen en ningún archivo del sitio ni en su código, en ningún idioma y sin
  importar mayúsculas: "bi-stab", "bistab", "biestab", "bi-estab", "universalis", "particularis",
  "coming soon", "próximamente", "not yet approved", "aún no se aprueba", "está por lanzarse".
- `tests/forbidden-phrases.test.ts` las busca en `src/` y en los README, y es el único archivo de
  código que las lista.
- La lista no incluye nombres de revistas (regla (c)).

## (j) «Aquí entro yo» y «Quién es»

- **El capítulo 7** se ve en los dos estados del candado. Su parte abierta dice solo:
  - la pregunta, presentada como la pregunta de la investigación de Montse;
  - que ella construyó un motor de simulación en TypeScript;
  - el sello con la frase de estado.
- **Lo que no dice**, fuera del candado:
  - nada de tests del motor, semilla, generaciones, imitación ni procedencia;
  - ni el hallazgo, la curva, los parámetros o qué motivo paga dónde.
- La aritmética exacta y los tests que detienen el build son de la página, y se cuentan en
  `/how-its-built`.
- Los enlaces al hallazgo, a `/finding` y al repositorio del motor existen solo con el candado
  abierto (ADR 0026).
- **`/about`** lleva el nombre completo de la autora, GitHub y LinkedIn, y nada más: sin escuela,
  trabajo, ciudad ni biografía (decisión de Montse, ADR 0024).

## (k) La película

- **Ilustrativo, no citado.** Los mensajes de los personajes son ilustrativos y no se presentan como
  cita de ningún participante.
- **Los pagos salen del código:** los del dilema, de `src/lib/pd/`; los del juego de Vanberg, de
  `PAYOFFS`. Quien decide recibe 14 o 10; a quien recibe le tocan 12 salvo que salga 1, es decir, 10
  esperado. La cara del dado no es un pago.
- **Los resultados del experimento** (73 % contra 54 %, 70 contra 68) aparecen solo en los capítulos
  5 y 6, con su cita.
- **Las dos voces** presentan las dos razones con la lectura de Vanberg (2008) y las citas de la
  aversión a la culpa ya registradas.
- **El cambio de pareja de la película** usa el caso fijo ilustrativo (la pareja nueva recibió una
  promesa de otra persona que decide), y la página dice que es un caso fijo.
- **Las elecciones del visitante** nunca son evidencia ni un veredicto sobre él: la página no le dice
  qué razón lo mueve (ADR 0023).
- **Ningún personaje** es la caricatura de una persona real.

## Además (de `AGENTS.md`)

- No se publica el resultado: ni datos de la curva, ni parámetros del modelo, ni qué motivo paga
  dónde, fuera del candado (ADR 0026).
- Los parámetros del modelo no se muestran nunca, salvo θ, c, la culpa disponible y la variante de
  robustez en `/finding`, y solo detrás del candado.
- Sin fechas de sumisión ni correspondencia con autores en ningún archivo (ADR 0011).
