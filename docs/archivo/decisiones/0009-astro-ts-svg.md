# 0009 · Astro + TypeScript + SVG

> **Archivada (P0).** Reemplazada por el ADR 0025 (tecnología), que reescribe lo que sigue vigente
> de aquí. Se conserva como registro; no rige. Sus referencias a otros ADR y a rutas del repo son de
> su momento.

**Estado:** aceptada (F0)

## Contexto

La página es mayormente texto con una pieza interactiva pequeña. Se busca poco JavaScript, tipos
estrictos y lógica testeable.

## Decisión

- Astro con salida 100 % estática, TypeScript strict.
- Interactividad con TypeScript + SVG; la lógica en módulos puros con tests de Vitest.
- CSS propio con tokens, claro/oscuro y `prefers-reduced-motion`. Fuentes autoalojadas.
- `astro check` + `tsc --noEmit` forman parte del pipeline.
- Versiones: las estables vigentes al crear el proyecto, verificadas con las herramientas oficiales.

**Descartado:**

- Frameworks de UI (React, Svelte, Vue…): una sola pieza interactiva no los justifica.
- Tailwind: los tokens CSS bastan y mantienen un solo sistema visual.
- Canvas, PixiJS, WebGPU: pensados para muchas entidades animadas, justo lo que la página evita
  (ADR 0003).
- Librerías de gráficas: la curva del momento 3 es un SVG propio.

## Consecuencias

- Cualquier dependencia fuera de este stack requiere preguntar antes.
- La mesa se renderiza como SVG accesible, con estados en el DOM y anuncios `aria-live`.
