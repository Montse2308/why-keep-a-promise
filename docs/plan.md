# Plan

Qué es la página. Todo lo de este documento está decidido; no se rediscute. Un cambio entra solo
con un ADR nuevo en `docs/decisions/`.

## Propósito

Página de divulgación para portafolio sobre una pregunta: por qué la gente cumple promesas que ya
no le convienen. No es un simulador ni el instrumento de un paper (ADR 0001).

## Estructura

Un solo hilo en scroll, en seis actos (ADR 0002):

| # | id en `/`       | Acto            | Subpágina        |
| - | --------------- | --------------- | ---------------- |
| 1 | `question`      | La pregunta     | —                |
| 2 | `dilemma`       | El dilema       | `/dilemma`       |
| 3 | `two-reasons`   | Dos razones     | —                |
| 4 | `vanberg`       | Vanberg         | `/vanberg`       |
| 5 | `finding`       | El hallazgo     | `/finding`       |
| 6 | `how-its-built` | Cómo está hecho | `/how-its-built` |

- **Hero:** la pregunta "Why keep a promise that no longer pays?" y la pieza visual.
- **Franja fija arriba:** el nombre de la autora (clave `author.name`) y enlaces a GitHub y
  LinkedIn (`AUTHOR` en `src/config.ts`), más el switch EN/ES.
- **Footer:** enlaces a las subpáginas.

## La pieza visual: la mesa

Una sola pieza visual, "la mesa": el juego de cambio de pareja de Vanberg (2008). En código se
llama `GameTable` (`src/components/table/`, lógica en `src/lib/table/`). Sin visuales de
población (ADR 0003).

| Momento | Dónde      | Qué hace el visitante                                                                                                                                                   | Fase |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1       | Actos 1–2  | Elige Roll o Don't Roll sin promesa y ve su pago contra el del otro.                                                                                                    | F1   |
| 2       | Acto 4     | Promete o no → sorteo de cambio de pareja → Roll o Don't. Ve que lo que espera el otro no cambia con el sorteo, y después lo que hicieron los participantes reales. | F1   |
| 3       | Acto 5     | Un slider mueve un cursor sobre datos precalculados (`src/data/curve.json`).                                                                                            | F3   |

El acto 3 es estático. El momento 3 no existe hasta F3.

## Subpáginas (v1)

Cada una profundiza un acto. Se llega desde "Go deeper →" al final de ese acto y desde el footer.
No hay menú de pestañas. Reutilizan la mesa o la curva; no hay un segundo estilo visual (ADR 0004).

| Ruta             | Profundiza | Se llega desde                      | Fase |
| ---------------- | ---------- | ----------------------------------- | ---- |
| `/dilemma`       | Acto 2     | "Go deeper →" del acto 2 · footer   | F4   |
| `/vanberg`       | Acto 4     | "Go deeper →" del acto 4 · footer   | F4   |
| `/finding`       | Acto 5     | "Go deeper →" del acto 5 · footer   | F4   |
| `/how-its-built` | Acto 6     | "Go deeper →" del acto 6 · footer   | F4   |

Cada ruta existe también en `/es/` con paridad completa.

## Idiomas

- Inglés en `/`, español en `/es/`, con paridad completa (ADR 0005).
- Texto de interfaz en claves: `src/i18n/en.json` y `src/i18n/es.json`. Una clave que existe en un
  idioma y no en el otro rompe `npm run check` y `npm run build`.
- La prosa de los actos va en Markdown por idioma, desde F2.
- El botón EN/ES es un enlace a la misma ruta en el otro idioma; no guarda preferencia ni
  redirige, así que un enlace compartido abre siempre el idioma de su URL (ADR 0013).
- Idioma de los artefactos: ADR 0006.

## Hosting

GitHub Pages en `https://montse2308.github.io/why-keep-a-promise/`. El repo es privado hasta el
lanzamiento (F6); un solo lanzamiento, sin deploy parcial. Presupuesto cero (ADR 0007, ADR 0008).
