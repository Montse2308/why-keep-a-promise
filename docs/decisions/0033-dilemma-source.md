# 0033 · La fuente del dilema: Axelrod y Hamilton (1981)

**Estado:** aceptada (P7.0). Precisa el ADR 0021, que nombra «los pagos del dilema de Axelrod
(1984)» entre las cifras de la película: su fuente pasa a ser Axelrod y Hamilton (1981). Las cifras
no cambian.

## Contexto

Los pagos del dilema del prisionero (T = 5, R = 3, P = 1, S = 0), la condición `2R > T + S` y el
contexto del dilema repetido de `/dilemma` (la sombra del futuro, el torneo y Tit-for-Tat) se
citaban del libro de Axelrod (1984), con las páginas por verificar. Mientras sigan así, `/sources`
dice «Páginas por verificar.» y `deploy.yml` no publica (`docs/sources.md`).

Nadie pudo revisar el libro. La revisión externa (punto 6, `docs/p7-external-review.md`) dio tres
salidas:

- **B:** citar el artículo de Axelrod y Hamilton (1981);
- **A:** citar el capítulo del libro, verificado con el índice publicado;
- **C:** citar el libro sin decir dónde.

Montse eligió la B en 7.0.5. Ella no tenía acceso al artículo. El agente lo cotejó contra la copia
de JSTOR que Axelrod tiene en su sitio de la Universidad de Michigan
(<https://websites.umich.edu/~axe/research/Axelrod%20and%20Hamilton%20EC%201981.pdf>).

## Decisión

### La referencia

Axelrod, R. y Hamilton, W. D. (1981). The Evolution of Cooperation. *Science*, 211(4489),
1390–1396.

Una referencia de terceros lleva su revista, como cualquier bibliografía (ADR 0016).

### Qué se cita de ella

| Lo que usa el sitio | Dónde está en el artículo |
| ------------------- | ------------------------- |
| Los pagos T = 5, R = 3, P = 1, S = 0 | Figura 1, p. 1392. Da solo el pago del jugador A; los pares del sitio, como (0, 5), salen por simetría |
| T > R > P > S | El pie de la figura 1, p. 1392 |
| La condición `2R > T + S` («3 > 2.5» por ronda en `/dilemma`) | Escrita como R > (S + T)/2, la misma condición: pie de la figura 1 (p. 1392) y nota 17 (p. 1396), que dice que descarta que turnarse para explotarse sea mejor que cooperar |
| El torneo de programas y que ganó Tit-for-Tat | p. 1393, en las dos rondas |

### Lo que sale

- **«La sombra del futuro».** No está en el artículo, que habla de la probabilidad *w* de que los
  mismos dos vuelvan a encontrarse. La frase era del libro.
- **El libro de 1984** sale del sitio: ninguna cifra ni oración lo cita ya.

### La prosa de `/dilemma`

Cambian dos oraciones, en los dos idiomas, con el texto que Montse aprobó en 7.0.5:

| EN | ES |
| -- | -- |
| The condition comes from Axelrod and Hamilton (1981). | La condición viene de Axelrod y Hamilton (1981). |
| Axelrod and Hamilton (1981) model it as the chance that the same two meet again. Axelrod invited programs… | Axelrod y Hamilton (1981) lo miden como la probabilidad de que los mismos dos vuelvan a encontrarse. Axelrod invitó a programas… |

## Consecuencias

- Se aplica en 7.2.8:
  - `docs/sources.md` lleva la obra nueva, verificada y con sus páginas;
  - `src/content/figures.ts` y `src/lib/sources.ts` cambian de clave, y `UNVERIFIED` queda vacía;
  - cambian la clave `sources.*` de los dos idiomas, los comentarios de `src/lib/pd/` y
    `src/lib/film/values.ts`, la prosa de `/dilemma` y sus tests.
- Con `UNVERIFIED` vacía, `/sources` ya no dice «Páginas por verificar.», y `deploy.yml` deja de
  detenerse por eso. El candado de `deploy.yml` contra `data-unverified` se queda, para la próxima
  fuente.
- El paso 9 de `docs/launch-checklist.md` deja de nombrar a Axelrod (1984) como ejemplo.
- La línea de estado del ADR 0021 dice que este ADR lo precisa.
