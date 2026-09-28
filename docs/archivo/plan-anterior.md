# Plan

Qué es la página. Todo lo de este documento está decidido; no se rediscute. Un cambio entra solo
con un ADR nuevo en `docs/decisions/`.

## Propósito

Página de divulgación para portafolio sobre una pregunta: por qué la gente cumple promesas que ya
no le convienen. No es un simulador ni el instrumento de un paper (ADR 0001).

## Estructura

Un solo hilo en scroll: seis actos y dos secciones que no son actos (ADR 0019).

| # | id en `/`       | Bloque                                       | Subpágina        |
| - | --------------- | -------------------------------------------- | ---------------- |
| 1 | `question`      | La pregunta: primera pantalla, escena y mesa | —                |
| 2 | `dilemma`       | El dilema                                    | `/dilemma`       |
| 3 | `two-reasons`   | Dos razones                                  | —                |
| 4 | `vanberg`       | Vanberg                                      | `/vanberg`       |
| — | `research`      | La investigación                             | —                |
| 5 | `finding`       | El hallazgo                                  | `/finding`       |
| 6 | `how-its-built` | Cómo está hecho                              | `/how-its-built` |
| — | `about`         | Quién es                                     | —                |

- **Primera pantalla (acto 1):** la pregunta "Why keep a promise that no longer pays?", la
  escena en su golpe 0 (ADR 0020), el sello con la frase de estado del manuscrito, el nombre de
  la autora (clave `author.name`, completo, sin prefijo) en una línea aparte, el enlace EN/ES en
  la esquina (no se queda fijo) y el ancla «La investigación ↓».
- **Sin franja fija.** GitHub y LinkedIn (`AUTHOR` en `src/config.ts`) van en «Quién es».
- **La frase del manuscrito** sale dos veces: la estampa y el acto 5 (regla (b)).
- **La investigación:** la pregunta y que Montse construyó un motor de simulación en TypeScript,
  en los dos estados del candado. Con el candado abierto, enlaza al acto 5, a `/finding` y al
  repositorio del motor (regla (j)).
- **Quién es:** GitHub, LinkedIn y solo los hechos que Montse dé (regla (j)).
- **Los actos, cortos:** ninguno vuelve a contar la escena. El acto 4 se queda con la decisión
  del visitante y las cifras citadas; el acto 6, con cómo está hecha la página.
- **Footer:** enlaces a las subpáginas y el enlace EN/ES.

## La pieza visual: la mesa

Una sola pieza visual, "la mesa": el juego de cambio de pareja de Vanberg (2008). En código se
llama `GameTable` (`src/components/table/`, lógica en `src/lib/table/`). Sin visuales de
población (ADR 0003).

**La escena del acto 1** (ADR 0020) es la mesa antes del momento 1, no un cuarto momento: A, B y
C, en tinta neutra, hablan, se sortean los roles, cambia la pareja y el dado rueda, atado al
scroll y solo con CSS. En el golpe 6 el asiento pasa a ser "tú" y empieza el momento 1. Con
movimiento reducido se ve quieta.

| Momento | Dónde      | Qué hace el visitante                                                                                                                                                   | Fase |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1       | Acto 1     | Al terminar la escena, elige Roll o Don't Roll sin promesa y ve su pago contra el del otro.                                                                              | F1   |
| 2       | Acto 4     | Promete o no → sorteo de cambio de pareja → Roll o Don't. Ve que lo que espera el otro no cambia con el sorteo, y después lo que hicieron los participantes reales. | F1   |
| 3       | Acto 5     | Un slider mueve un cursor sobre datos precalculados (`src/data/curve.json`).                                                                                            | F3   |

El acto 3 es estático.

El acto 2 incluye la matriz 2×2 del dilema del prisionero como tabla estática de texto (regla (g)).
No es una pieza visual ni interactiva; la única pieza sigue siendo la mesa.

## Dirección visual

Dos superficies de un mismo sistema (ADR 0018): el **escenario**, siempre oscuro, para la escena
y las dos mesas; el **papel**, para todo lo demás, incluida la prosa de las subpáginas.

## Subpáginas (v1)

Cada una profundiza un acto. Se llega desde "Go deeper →" al final de ese acto y desde el footer.
No hay menú de pestañas. Reutilizan la mesa o la curva; no hay un segundo estilo visual (ADR 0004,
ADR 0018).

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
- La prosa de los actos va en Markdown por idioma, desde F2; la de «La investigación» y «Quién
  es», en `src/content/sections/{en,es}/` (ADR 0019).
- El botón EN/ES es un enlace a la misma ruta en el otro idioma; no guarda preferencia ni
  redirige, así que un enlace compartido abre siempre el idioma de su URL (ADR 0013). Va en la
  esquina de la primera pantalla y en el footer (ADR 0019).
- Idioma de los artefactos: ADR 0006.

## Hosting

GitHub Pages en `https://montse2308.github.io/why-keep-a-promise/`. El repo es privado hasta el
lanzamiento (F6); un solo lanzamiento, sin deploy parcial. Presupuesto cero (ADR 0007, ADR 0008).
