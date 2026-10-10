# 0040 · La portada enlaza al hallazgo

**Estado:** aceptada (P9, paso 9.1). Enmienda el ADR 0036 (la tarjeta «La investigación» de la
portada) y precisa la regla (j) de `docs/content-rules.md`. Decisión de Montse (2026-10-10).

## Contexto

La portada del home (ADR 0036) tiene tres puertas. La de la investigación lleva al capítulo 7 y, a
propósito, no a `/finding`, para ser igual en los dos estados del candado. Ahora que `/finding` se
entiende sola (ADR 0037), quien llega al home buscando el resultado tiene que poder ir directo.

## Decisión

- **La tarjeta «La investigación» lleva un segundo enlace, a `/finding`**, debajo de «Go to chapter
  7» / «Ir al capítulo 7». Su texto es el título de la página en el cuaderno, la clave que ya
  existe: «The finding» / «El hallazgo».
- **No cambia lo que dice la tarjeta:** su título y su línea siguen siendo la pregunta y el motor en
  TypeScript (regla (j)). No lleva la frase de estado ni el nombre de la autora.
- **Solo con el candado abierto.** La regla (j) y el ADR 0034 dejan los enlaces a `/finding` solo
  con el candado abierto; cerrado, la tarjeta es la de antes, con un solo enlace, y `verify:dist`
  sigue fallando si un build cerrado enlaza a `/finding`.

### Cómo se lee el ADR 0036

- «Es igual en los dos estados del candado. Lleva al capítulo 7 […] y no a `/finding`» se lee: lleva
  al capítulo 7 en los dos estados y, con el candado abierto, también a `/finding`.
- Las páginas del cuaderno que enlaza la puerta del cuaderno siguen siendo las cinco, sin
  `/finding`, en los dos estados.
- Lo demás del 0036 rige completo.

## Consecuencias

- `src/lib/hero.ts` nombra el segundo enlace de la puerta de la investigación y cuándo existe, con
  su test; `Hero.astro` lo dibuja con el estilo de los enlaces de la portada.
- La primera carga de los dos home sube unos bytes; `src/data/weight.json` al día.
- La línea de estado del ADR 0036 nombra este ADR.
