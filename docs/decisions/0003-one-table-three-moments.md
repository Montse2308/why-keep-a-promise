# 0003 · Una mesa, tres momentos, sin visuales de población

**Estado:** aceptada (F0)

## Contexto

El tema invita a visualizaciones de poblaciones de agentes, rejillas o paneles comparativos. Eso
tiende a sugerir dinámicas que la página no afirma y multiplica los estilos visuales.

## Decisión

Una sola pieza visual: "la mesa", el juego de cambio de pareja de Vanberg (2008), con tres
momentos interactivos:

1. Actos 1–2: Roll o Don't Roll sin promesa; pago propio contra el del otro.
2. Acto 4: promesa o no → sorteo de cambio de pareja → Roll o Don't; lo que espera el otro no cambia
   con el sorteo; después, lo que hicieron los participantes reales.
3. Acto 5: un slider mueve un cursor sobre datos precalculados (F3).

El acto 3 es estático.

El acto 2 incluye la matriz 2×2 del dilema del prisionero como tabla estática de texto (regla (g)).
No es una pieza visual ni interactiva; la única pieza sigue siendo la mesa.

## Consecuencias

- Quedan fuera: PixiJS, WebGPU, canvas de agentes, rejillas o animaciones de población, cuatro
  paneles, gráficas extra y un dilema jugable en el scroll principal.
- La mesa se construye con TypeScript + SVG (ADR 0009); su lógica, en módulos puros con tests.
- Las subpáginas reutilizan la mesa o la curva; no hay segundo estilo visual.
