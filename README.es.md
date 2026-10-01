# ¿Por qué cumplir una promesa que ya no conviene?

[English](README.md)

La página de divulgación de un proyecto personal de investigación sobre por qué la gente cumple
promesas que ya no le convienen. Se está reconstruyendo como una película corta ligada al scroll,
en nueve capítulos, del dilema del prisionero al juego de cambio de pareja de Vanberg (2008), con
un cuaderno para la profundidad técnica.

**Trabajo en curso.** Nada de lo que hay aquí es definitivo.

## Correrlo en local

Requiere la versión de Node.js de [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev      # http://localhost:4321/why-keep-a-promise/
npm run check    # astro check + tsc
npm test         # vitest
npm run build    # sitio estático en dist/
npm run verify:dist  # nada bloqueado llegó a dist/
npm run budgets      # cada página dentro de su presupuesto de peso
```

Hecho con Astro, TypeScript y SVG. Inglés en `/`, español en `/es/`.

## Licencia

[MIT](LICENSE)
