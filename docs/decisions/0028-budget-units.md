# 0028 · Las unidades de los presupuestos de peso

**Estado:** aceptada (P6). Precisa el ADR 0025 en cómo se leen sus presupuestos de peso: en KiB, y
sobre qué páginas. No cambia ningún techo ni el del LCP.

## Contexto

El ADR 0025 fija tres techos de peso, «JavaScript del home: ≤ 40 KB comprimido», «Fuentes: ≤ 160 KB
en la primera carga» y «Primera carga completa: ≤ 450 KB», y pide un script que falle si se pasan
(P6). No dice si un KB son 1000 bytes o 1024, ni si los dos últimos techos valen solo en el home o
en cada página.

Al escribir el script (`npm run budgets`, P6) la diferencia importó en un solo lugar:
`/how-its-built` carga cuatro archivos de fuentes, las tres del sitio y JetBrains Mono para su
código (ADR 0027), 161 808 bytes. Caben en 160 KiB (163 840 bytes) y no en 160 000.

## Decisión

- **Un KB de los presupuestos es un KiB, 1024 bytes,** como cuenta Lighthouse sus presupuestos: la
  herramienta con la que el ADR 0025 mide el LCP. Los techos son, en bytes:

  | Techo | KiB | Bytes |
  | ----- | --- | ----- |
  | JavaScript del home, comprimido | 40 | 40 960 |
  | Fuentes de la primera carga | 160 | 163 840 |
  | Primera carga completa | 450 | 460 800 |

- **El del JavaScript vale en los dos home** (`/` y `/es/`), que son los que cargan la película.
- **Los de fuentes y primera carga valen en cada página,** en sus dos idiomas: cualquier página
  puede ser la primera de un visitante que llega por un enlace compartido.
- **Se pesa lo que viaja:** el texto (HTML, CSS y JavaScript) comprimido con gzip, y las fuentes
  tal cual, porque woff2 ya viene comprimido. Una fuente cuenta si la página la precarga o si su
  `@font-face` cubre algún carácter de la página. El script y la tabla de `/how-its-built` muestran
  los pesos en KiB.
- El techo del LCP (≤ 2.5 s, medido con Lighthouse) no cambia.

## Consecuencias

- `src/lib/budgets.ts` define `KB = 1024` y cita este ADR; `npm run budgets` falla con esa lectura,
  en CI y antes del deploy.
- `/how-its-built` queda a unos 2 KiB de su techo de fuentes. Una fuente más en esa página, o una
  más pesada para el código, no cabe: habría que aligerar antes, o decidirlo con un ADR nuevo.
- La línea de estado del ADR 0025 dice que este ADR lo precisa; lo que el 0025 decide sigue entero.
