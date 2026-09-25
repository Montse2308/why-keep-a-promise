# 0004 · Subpáginas en v1, scroll primero

**Estado:** aceptada (F0). Las interacciones de las subpáginas (la mejor respuesta de `/dilemma`
y la segunda gráfica de `/finding`) están en el ADR 0017.

## Contexto

Algunos actos necesitan más detalle del que cabe en el hilo principal sin romper su ritmo.

## Decisión

v1 incluye cuatro subpáginas: `/dilemma`, `/vanberg`, `/finding` y `/how-its-built`. Cada una
profundiza un acto. Se llega desde "Go deeper →" al final de ese acto y desde el footer. No hay menú
de pestañas. El scroll principal se diseña y se escribe primero; las subpáginas vienen en F4.

## Consecuencias

- El scroll principal se entiende completo sin visitar ninguna subpágina.
- Cada subpágina reutiliza la mesa o la curva, sin un segundo estilo visual.
- `/finding` sigue las mismas reglas de estado que el acto 5 (`content-rules.md`, regla (b)).
