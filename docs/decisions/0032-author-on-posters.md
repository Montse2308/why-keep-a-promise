# 0032 · La autora en los pósteres

**Estado:** aceptada (P7.0). Precisa el ADR 0021, que pone el nombre de la autora en el capítulo 7 y
en los créditos: también va, como firma, en los pósteres para compartir.

## Contexto

Desde P6 cada página tiene su póster de Open Graph, en EN y ES (14): una tarjeta de papel con «I
promise» / «Te lo prometo», el título de la página y el círculo y el cuadrado unidos por el hilo. No
llevan el nombre de nadie.

Cuando alguien comparte un enlace en LinkedIn o WhatsApp, el póster suele ser lo único que se ve de
la página. La revisión externa (punto 16, `docs/p7-external-review.md`) propuso una firma pequeña
con la autora. Choca con el ADR 0021, que dice dónde va su nombre. Montse lo aprobó en 7.0.4.

## Decisión

- **Cada póster lleva una firma pequeña** con el nombre completo de la autora, el de la clave
  `author.name`, igual en los 14.
- **Solo el nombre.** Ni GitHub, ni LinkedIn, ni foto, escuela, trabajo o ciudad: eso sigue siendo
  de `/about` (ADR 0024), y la regla (j) no cambia.
- **No expone nada nuevo.** El nombre ya está en el capítulo 7, en los créditos y en `/about`, en
  los dos estados del candado. El póster sigue sin la frase de estado y sin nada del candado
  (ADR 0026).
- **No le quita lugar al título.** La firma va aparte del título de la página, que sigue partido en
  renglones medidos y equilibrados.
- **El texto alternativo** del póster (`poster.alt`) la nombra, para que diga lo mismo que se ve.

## Consecuencias

- Se construye en 7.6.9: `src/lib/posters/poster.ts` y sus tests. El nombre tiene acentos, así que
  el test de que cada carácter tiene glifo en los cortes TrueType de los pósteres lo cubre; otro
  test exige la firma en los 14.
- La línea de estado del ADR 0021 dice que este ADR lo precisa.
