# 0035 · `/sources` lista las cifras del hallazgo cuando el candado está abierto

**Estado:** aceptada (F6, paso 3 del checklist, antes de reemplazar `SSRN_URL_PENDING`). Precisa
el ADR 0024 (el «cada cifra de la página» de `/sources` y su «Candado: —») y el ADR 0034 (qué cubre
el candado, y dónde se muestran θ y c). Decisión de Montse.

## Contexto

El ADR 0024 dice que `/sources` lleva «cada cifra de la página, con su referencia completa y dónde
se usa», y le da «Candado: —». El ADR 0034 dice que todo lo que el candado no cubre se ve igual en
los dos estados. Juntos dejaban fuera de `/sources` las cifras del hallazgo (las del capítulo 7 y
las de `/finding`), también con el candado abierto: el «cada cifra» quedaba con ese hueco. Montse lo
confirmó en la revisión de P5 y dejó la decisión para el paso 3 del checklist, porque reemplazar
`SSRN_URL_PENDING` abre el candado.

## Decisión

**Sí.** Con el candado abierto, el «cada cifra de la página» del ADR 0024 incluye las del hallazgo.

- **Abierto,** `/sources` lista también las claves del hallazgo (`FINDING` en
  `src/lib/sources.ts`), con sus cifras, dónde está cada una en su fuente y dónde se usa, igual que
  las demás:
  - `vanberg-second-order` (el 76, la creencia de que la promesa se cumplirá), bajo Vanberg (2008);
  - `kawagoe-narita-2014`, bajo su propia obra, Kawagoe y Narita (2014), con su referencia completa;
  - `curve` y `curve-finding`, bajo una obra nueva: el working paper en SSRN (su referencia, con el
    título y el enlace de `WORKING_PAPER`) y, como su material, el motor de simulación (el repo y
    el DOI de su release, de `ENGINE` en `src/config.ts`).
  Se usan en el hallazgo del capítulo 7 y en `/finding`, y enlazan ahí.
- **Cerrado,** `/sources` se ve exactamente como antes de este ADR: no lista ninguna de esas claves
  ni enlaza a `/finding`.
- **θ y c siguen solo en `/finding`.** El ADR 0024 pide cada cifra; el ADR 0034 y la regla de
  `docs/content-rules.md` dejan θ y c solo en `/finding`. Las dos cosas se cumplen así: la entrada
  de `curve-finding` en `/sources` nombra θ y c y dice que se dan y se explican solo en `/finding`,
  sin sus valores y sin repetir su explicación. Las demás cifras de `/finding` (la culpa disponible
  en el pico, el umbral, el corte analítico y la variante de robustez) se listan como cualquier
  cifra del registro: el valor, sin explicación, y dónde se usa. En el registro de cifras
  (`src/content/figures.ts`) θ y c llevan `parameter: true`, y `/sources` no muestra sus valores.

### Implementación

- La parte de `/sources` del hallazgo entra en el mecanismo del candado que ya existe (ADR 0034):
  vive en un componente propio (`src/components/notebook/SourcesFinding.astro`), que el plugin
  `lockFinding` de `astro.config.mjs` resuelve al stub vacío (`Locked.astro`) en un build cerrado.
  Su marcado no entra al build cerrado.
- Cada entrada y cada obra del hallazgo llevan `data-locked-content`.
- `verify:dist` suma `/sources` y `/es/sources` a las páginas con contenido bloqueado
  (`UNLOCKED_PAGES`), con sus marcas: `data-locked-content`, `Kawagoe` y el repo del motor. Cerrado,
  la búsqueda de marcas de siempre falla si alguna llega a `/sources`.
- Las claves `sources.*` del hallazgo, en `src/i18n/`, son contenido bloqueado: solo las usa
  `SourcesFinding.astro`.
- Tests para los dos estados.

### Lo que sigue vigente

- `/sources` sigue sin candado propio: su parte abierta es la misma en los dos estados; lo que se
  suma es parte de lo que ya cubre el candado del ADR 0034 (el hallazgo y los enlaces a él).
- Las claves retiradas (`RETIRED`) siguen fuera de la página.

## Consecuencias

- El candado del ADR 0034 cubre además, en su punto 4 («Los enlaces»), la parte del hallazgo de
  `/sources` y sus enlaces al capítulo 7 y a `/finding`.
- `docs/content-rules.md` y `AGENTS.md` precisan la regla de los parámetros: θ y c, con sus valores,
  solo en `/finding`; `/sources` los nombra detrás del candado y lista las demás cifras de
  `/finding` del registro.
- `docs/sources.md` deja de decir que `/sources` no lista las claves del hallazgo.
- Se cierra la pregunta abierta de `docs/tasks.md` sobre `/sources` y el hallazgo.
