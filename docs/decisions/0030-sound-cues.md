# 0030 · Las señales del sonido

**Estado:** aceptada (P7.0). Precisa el ADR 0025 en qué suena: su lista entre paréntesis («el dado,
el sello, las burbujas, un tema corto al final») era la lista de P6, y este ADR la cierra con las
señales nuevas. Lo demás del sonido del 0025 sigue entero.

## Contexto

En P6 la película tenía cinco señales (`src/lib/film/sound.ts`): el dado al lanzarse y al caer, las
burbujas del chat, el sello y el tema del final. La revisión externa (punto 8,
`docs/p7-external-review.md`) encontró dos huecos:

- **Al encender el sonido no pasa nada.** El primer sonido puede llegar muchas pantallas después, o
  nunca, si el visitante se queda los 14 y no elige un mensaje.
- **Entre los capítulos 3 y 7 no suena nada:** las dos voces, el apagón, el mazo y las adivinanzas.
  Quien solo hace scroll no oye nada hasta el sello del capítulo 7.

Montse pidió que algo sonara al encender. La música de fondo quedó fuera: choca con «todo lo que
suena también se ve» (ADR 0025), se vuelve repetitiva y compite con el lector de pantalla
(`docs/p7-review-plan.md`). El 0025 nombra sus señales entre paréntesis, así que una señal nueva
necesita este ADR. Montse aprobó la lista en 7.0.8.

## Decisión

### Lo que no cambia (ADR 0025)

- Apagado por defecto. Se enciende solo con el botón, y cada visita empieza en silencio.
- Sintetizado con Web Audio, sin archivos de audio.
- Todo lo que suena también se ve. Cada señal tiene su entrada en `CUE_SIGHT`, que dice qué se ve
  mientras suena.
- Sin música de fondo ni bucles.

### La lista cerrada

Solo suenan estas trece señales:

| Señal | Qué se ve | Cuándo suena |
| ----- | --------- | ------------ |
| `on` | El botón «Sonido» pasa a encendido: cambian su ícono y `aria-pressed` | Cada vez que se enciende; al apagarlo, nada. Las dos primeras notas del tema final (sol y do), juntas |
| `coins` | Las monedas aparecen sobre cada personaje y se cuentan | Capítulo 1, al jugar la ronda; capítulo 3, al decidir. Si tiró el dado, cuando termina el golpe del dado |
| `snap` | El hilo dorado se rompe, sus puntas se enroscan y el carrete dice «rota» | Capítulo 3, si prometió y se quedó los 14. Antes de las monedas, no encima |
| `switch` | El escenario se oscurece y solo quedan los ojos; después, el parpadeo de la luz al descubrir el cambio de pareja | Capítulo 5, la primera vez que el scroll llega a cada uno |
| `lights-on` | La luz vuelve después del apagón, con el triángulo en el asiento | Capítulo 5, la primera vez |
| `card` | La carta sale volando a un lado y llega la persona siguiente | Capítulo 5, al decidir cada carta menos la última, que se queda |
| `voices` | Las dos voces, la nube y el pergamino, llegan a flotar sobre el círculo | Capítulo 4, la primera vez que se ven |
| `sign` | En el letrero, la cifra aparece en lugar del signo de interrogación: se enciende, no gira | Capítulo 6, al pulsar «Ver» en cada adivinanza, o cuando el scroll llega a las cifras sin haber adivinado. Si se encienden juntas, suena una vez |
| `roll` | El dado salta y gira en el aire | Capítulo 3, al tirarlo (P6) |
| `land` | El dado cae en la cara que salió | Capítulo 3 (P6) |
| `bubbles` | Sale el mensaje del visitante y aparece la respuesta del otro | Capítulo 2, al elegir el mensaje (P6) |
| `stamp` | El sello del sobre entra a la vista | Capítulo 7, la primera vez (P6) |
| `theme` | La última línea de los créditos entra a la vista | Capítulo 8, la primera vez (P6) |

Una señal más necesita un ADR que reemplace a este.

### Las reglas

1. **Lo que se juega suena cada vez que pasa. Lo que trae el scroll suena una vez por visita:** la
   primera que se ve con el sonido encendido, como el sello y el tema. Ir y volver con el scroll no
   la repite.
2. **Lo que va con un movimiento no suena si el movimiento no pasa.** Con movimiento reducido el
   dado no gira y la carta no vuela, así que `roll` y `card` no suenan. Lo que va con un cambio que
   se ve igual (la luz, las monedas, la cifra, el hilo) suena igual.
3. **Ninguna señal juzga.** Las monedas suenan igual con 0 que con 14, y el letrero igual cerca o
   lejos de la cifra real: las elecciones no son un veredicto (ADR 0023).
4. **Ninguna satura, tampoco cuando dos coinciden.** Cada señal suma a lo más 1, como en P6. Las que
   caen juntas en el capítulo 3 (el dado, el hilo y las monedas) van una detrás de otra.
5. **Cortas.** Cada señal nueva dura menos de un segundo. Solo el tema final es más largo.
6. **Restaurar la memoria no suena** (ADR 0029). El sonido encendido no se recuerda: al volver,
   empieza apagado.
7. **Lo bloqueado no suena en un build cerrado.** El sobre que se abre y la curva del capítulo 7 no
   tienen señal. Si algún día la tienen, se decide al abrir el candado, con un ADR.

### Lo que queda fuera

- **El hilo que se ata al prometer:** repetiría el motivo de `on`, y casi nadie tiene el sonido
  encendido tan pronto.
- **El hilo roto de cada carta del mazo:** ya suena la carta, y un chasquido por carta le quitaría
  peso al hilo del visitante.
- **La apuesta del capítulo 5 y las respuestas del capítulo 8:** el capítulo 5 ya tiene el apagón y
  las cartas, y el 8 termina con el tema.

## Consecuencias

- Se construye en P7.4: `on` (7.4.1), `coins` (7.4.2), `switch`, `lights-on` y `card` (7.4.3),
  `sign` y `snap` (7.4.4), `voices` (7.4.5).
- `CUES`, `SCORE` y `CUE_SIGHT` de `src/lib/film/sound.ts` crecen a las trece señales. Siguen los
  tests de P6 (cada señal suma a lo más 1, cada una con lo que se ve), y uno nuevo comprueba que las
  señales del capítulo 3 no se encimen.
- Con el sonido encendido, quien solo hace scroll oye algo en los capítulos 4, 5, 6 y 7.
- La línea de estado del ADR 0025 dice que este ADR lo precisa.
