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

## (b) Estado del texto: un solo texto, nada más

El sello del capítulo 7, la entrada «El hallazgo» del cuaderno y `/finding` muestran un solo texto
de estado, el mismo en los dos estados del candado (ADR 0034):

| Idioma | Texto                                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| EN     | "Working paper: *Promises to whom: Identifying personal guilt and partner-specific commitment across populations* (SSRN)."        |
| ES     | "Documento de trabajo: *Promises to whom: Identifying personal guilt and partner-specific commitment across populations* (SSRN)." |

- El título va en inglés en los dos idiomas, porque el documento está en inglés, en cursiva y con
  enlace a la página del working paper en SSRN.
- La frase vive en la clave `paper.status` de `src/i18n/`, con `{title}` en lugar del título; el
  título y el enlace están en `WORKING_PAPER` de `src/config.ts`. El enlace es `SSRN_URL_PENDING`
  hasta el paso 3 de `docs/launch-checklist.md`.
- La frase se puede mostrar grande, como sello, pero no se reescribe ni se le agrega nada: ni
  revista, ni parámetros, ni fechas. La autora va aparte.
- En la página de inicio la frase sale exactamente dos veces: el sello del capítulo 7 y la entrada
  del cuaderno.
- No hay otro estado. El texto es un working paper sin revisión por pares: no se presenta como
  publicado en una revista, revisado ni aprobado. No se escribe "coming soon", "under review",
  "accepted", "peer-reviewed", "published in", "not yet approved" ni equivalentes, en ningún idioma
  ("próximamente", "en revisión", "aceptado", "revisado por pares", "publicado en"…). El sobre sellado
  no dice nada más que la frase.

## (c) Sin revista; el PDF se enlaza a SSRN

- Ningún archivo nombra una revista para el texto de Montse.
- Las referencias bibliográficas de terceros llevan su revista, como cualquier bibliografía
  (ADR 0016).
- Se enlaza a SSRN; el PDF no se aloja aquí.

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

- Lo que no se repite son las *frases*. `/finding` puede mostrar los mismos datos que la curva del
  capítulo 7 (el pago de cada razón en cada fila), siempre con frases y leyendas distintas
  (ADR 0037).

## (i) Frases prohibidas

- Estas cadenas no aparecen en ningún archivo del sitio ni en su código, en ningún idioma y sin
  importar mayúsculas: "bi-stab", "bistab", "biestab", "bi-estab", "universalis", "particularis",
  "coming soon", "próximamente", "not yet approved", "aún no se aprueba", "está por lanzarse".
- Tampoco las que presentarían el working paper como algo que no es (regla (b)): "under review",
  "en revisión", "accepted", "aceptado", "aceptada", "peer-review" (también "peer-reviewed"),
  "peer review", "revisión por pares", "revisado por pares", "revisada por pares",
  "published in", "publicado en", "publicada en". El título del working paper no contiene ninguna.
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
- **La portada del home** (ADR 0036) dice de la investigación lo mismo que la parte abierta del
  capítulo 7: la pregunta y el motor en TypeScript. No lleva la frase de estado ni el nombre de la
  autora. Con el candado abierto, su tarjeta «La investigación» enlaza también a `/finding`, sin
  cambiar lo que dice (ADR 0040).
- La aritmética exacta y los tests que detienen el build son de la página, y se cuentan en
  `/how-its-built`.
- Los enlaces al hallazgo, a `/finding` y al repositorio del motor existen solo con el candado
  abierto (ADR 0034).
- **`/about`** lleva el nombre completo de la autora, GitHub, LinkedIn, ORCID y su página de autora
  en SSRN (esta, con el candado abierto), todos con `rel="me"`, y nada más: sin escuela, trabajo,
  ciudad ni biografía (decisiones de Montse, ADR 0024 y ADR 0041).

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
  dónde, fuera del candado (ADR 0034).
- Los parámetros del modelo no se muestran nunca, salvo θ, c, la culpa disponible y la variante de
  robustez en `/finding`, y solo detrás del candado. También ahí, la sección «Otros dos resultados»
  nombra **con palabras** la parte de las veces en que una promesa deja de atar y su corte en la
  mitad, y el 60 de 60 del nulo del protocolo: sin la letra `s`, φ, N, generaciones ni semillas con
  nombre, y sin el 59 % ni el 43 % del laboratorio (ADR 0039). El explorador de `/finding` mueve θ,
  la confianza de fondo y la creencia de que la promesa se cumplirá, y nada más (ADR 0038). Detrás del candado, `/sources` lista las cifras
  de `/finding` del registro y nombra θ y c, nunca sus valores (ADR 0035).
- Sin fechas de sometimiento ni correspondencia con otros autores en ningún archivo (ADR 0034).
