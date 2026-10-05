# 0025 · Tecnología de la película

**Estado:** aceptada (P0). Reemplaza el ADR 0009 (archivado) y reescribe lo que sigue vigente de él.
Reemplaza también los párrafos sobre el JavaScript del sitio de los ADR 0015 y 0017 (archivados).
Precisado por el ADR 0028: los KB de los presupuestos de peso son KiB, y los de fuentes y primera
carga valen en cada página. Precisado por el ADR 0030: la lista cerrada de las señales del sonido.

## Contexto

La película necesita cámara, luz continua, personajes que reaccionan y juegos. Montse permitió
librerías si se justifican, sin WebGL por ahora. El prototipo de la ronda 4 se hizo sin ninguna
librería (un motor de cámara de unas 150 líneas de TypeScript sobre SVG) y alcanzó.

## Decisión

### Lo que sigue del ADR 0009

- Astro con salida 100 % estática, TypeScript strict. Sin frameworks de UI ni Tailwind.
- La lógica en módulos puros con tests de Vitest.
- CSS propio con tokens (ADR 0027).
- `astro check` y `tsc --noEmit` en el pipeline.
- Versiones estables verificadas con las herramientas oficiales, nunca de memoria.

### Mejora progresiva

- **Astro genera primero un storyboard en HTML:** cada capítulo como un cuadro quieto (el SVG en su
  pose clave) con sus leyendas, en orden, y los resultados de cada juego en texto.
- **Después, el JavaScript convierte ese storyboard en película:** fija el escenario, mueve la
  cámara y activa los juegos.
- Así, sin JavaScript, con lector de pantalla, en un navegador viejo o al imprimir, la historia
  completa sigue ahí.

### El motor de escenas

- Es propio, en `src/lib/film/`, con funciones puras y tests:
  - pistas de animación por posición del scroll, con curvas de aceleración;
  - interpolación de números y colores;
  - la cámara, que calcula qué parte del mundo se ve según el ancho y el alto de la pantalla;
  - los tramos de cada capítulo.
- Un solo script cliente lee la posición del scroll y aplica el estado con `requestAnimationFrame`.
- **El scroll es el nativo:** sin ajuste a posiciones y sin capturar la rueda ni el dedo.
- No depende de las animaciones de CSS ligadas al scroll, así que funciona igual en los navegadores
  actuales.
- Solo se animan transformaciones, opacidad, `clip-path`, el encuadre del SVG y colores
  interpolados. Nada que obligue a recalcular el layout.

### Sonido

- Apagado por defecto, con un botón. Se enciende solo por decisión del visitante.
- Sintetizado con Web Audio (el dado, el sello, las burbujas, un tema corto al final): sin archivos
  de audio ni licencias.
- Todo lo que suena también se ve.

### Presupuestos

- JavaScript del home: ≤ 40 KB comprimido.
- Fuentes: ≤ 160 KB en la primera carga.
- Primera carga completa: ≤ 450 KB.
- LCP ≤ 2.5 s en un celular de gama media emulado con 4G.
- Un script después del build falla si se pasan los presupuestos de peso (P6). El LCP se mide con
  Lighthouse y se reporta en `/how-its-built`.

### Dependencias

- **Nueva, solo de desarrollo:** `@resvg/resvg-js`. Convierte a PNG los pósteres de vista previa de
  cada página, que se dibujan en SVG con la misma paleta. LinkedIn y otras redes no aceptan SVG en
  Open Graph. Al visitante le cuesta 0 bytes. Entra en P6, con su versión verificada al instalar.
- **Descartadas:**
  - GSAP: unos 40 KB más en el celular, y el motor propio alcanza.
  - Lottie, PixiJS y WebGPU.
  - Canvas y WebGL: WebGL descartado por ahora.
  - Librerías de gráficas: la curva sigue siendo SVG propio.
  - Frameworks de UI.

### Detalles

- **El título de la pestaña:** si el visitante se va a otra pestaña, cambia a una línea sobre la
  promesa, y vuelve al regresar.
- **La consola:** un mensaje breve para quien abre las herramientas de desarrollador, que enlaza a
  `/how-its-built`.
- **Pósteres para compartir:** uno por página y por idioma.

### El JavaScript del sitio

Estos son todos los scripts del sitio:

- el de la película y sus juegos;
- el del control de la curva, solo con el candado abierto (ADR 0026);
- el del panel del cuaderno.

Todos están en la versión storyboard, que funciona sin ellos. `/dilemma` ya no tiene script propio
(ADR 0023).

## Consecuencias

- Entra `src/lib/film/`, con tests. Los componentes de la mesa y la escena de la versión anterior
  salen conforme los capítulos los reemplazan.
- Cualquier dependencia fuera de este ADR requiere preguntar antes.
- El motor de simulación de la investigación sigue sin importarse nunca (ADR 0010).
- Se construye en P1 (motor, storyboard) y P6 (sonido, pósteres, presupuestos).
