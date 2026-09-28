# 0022 · Dirección de arte: Papel

**Estado:** aceptada (P0). Reemplaza el ADR 0018 (archivado). Recoge de él y del 0017 lo que sigue
vigente: los tests de color, el color que nunca va solo y JetBrains Mono.

## Contexto

Montse rechazó el papel beige plano (`#f6f1e7`), los cortes secos entre el escenario oscuro y el
papel, las siluetas grises, la mesa como un rectángulo y los botones con cara de formulario. En la
ronda 4 comparó dos direcciones de arte en un prototipo navegable, Papel y Teatro, y eligió Papel.

## Decisión

### El escenario

- **Un diorama de papel recortado:** capas de cielo, colinas, sol y nubes, la mesa y los
  personajes. Los bordes son de papel, con sombras reales y un grano de papel encima.
- **Las capas del fondo se mueven más despacio** que el primer plano cuando la cámara se mueve
  (paralaje).
- **Un solo escenario para toda la película.** Nunca se cambia de superficie.

### La luz, continua

- La luz cambia poco a poco a lo largo del scroll, como un día: amanecer, mañana, mediodía, tarde
  lila, atardecer y anochecer al final.
- **No hay cortes de color.** Entre dos puntos de luz el color se interpola, y ningún cambio de
  fondo ocurre de golpe. Un test comprueba que dos puntos de luz consecutivos no están más cerca en
  el recorrido de lo que su diferencia de color permite. El umbral se fija en P1.
- **La película tiene su propia luz, como un film.** No sigue el tema claro u oscuro del sistema.
  El contraste se garantiza en cada punto de luz.
- **El cuaderno sí sigue el tema del sistema** (ADR 0024): papel de día en claro, papel de noche en
  oscuro. Es papel con color y textura, no beige plano.

### Personajes y objetos

- **Tú:** círculo azul. **El otro:** cuadrado naranja. **La pareja nueva:** triángulo, en un tercer
  color que pase los tests. Los tres tienen ojos, cejas y boca expresivos.
- **La promesa:** un diamante dorado que brilla y se agrieta si se rompe.
- **Las monedas** se apilan y se mueven de un lado a otro. Sustituyen las tablas de pagos.
- **Los gestos sustituyen los botones de formulario:** mano abierta para cooperar o tirar el dado,
  puño cerrado para traicionar o quedarse el dinero. Siguen siendo botones nativos (ADR 0023).
- **La hoja de personajes** (formas, expresiones, las dos voces y la paleta final) se aprueba con
  Montse en P1, antes de construir el capítulo 1.

### Tipografía

- **Fraunces** para los títulos y **Nunito** para el texto y la interfaz, las dos variables.
- **JetBrains Mono** solo en los bloques de código de `/how-its-built`, sin precarga y sin
  resaltado de sintaxis.
- **Autoalojadas** con la API de fuentes de Astro, proveedor `local`. Los `woff2` se copian sin
  cambios de los paquetes `@fontsource-variable/*` a `src/assets/fonts/`, con su licencia OFL y su
  procedencia en el README de esa carpeta. Esos paquetes no son dependencias del proyecto, y el
  build no depende de la red.
- Subsets `latin` y `latin-ext`, `font-display: swap`, fallbacks métricos y precarga solo del texto.
- Las versiones se verifican con las herramientas oficiales al copiar, no de memoria.
- Newsreader e Inter salen cuando ya ningún componente las use.

### Color

- **Una sola fuente de valores:** `src/lib/design/palette.ts`. `src/styles/tokens.css` lleva
  exactamente esos valores, y un test lo comprueba. Los puntos de luz de la película también viven
  en `palette.ts`.
- **El color nunca va solo.** Cada rol lleva forma y etiqueta: círculo para «tú», cuadrado para «el
  otro», triángulo para la pareja nueva; la promesa lleva el diamante y su texto.
- **Contraste mínimo:** 4.5:1 para texto y 3:1 para gráficos e interfaz. Se mide sobre cada punto
  de luz de la película y sobre el papel del cuaderno en los dos temas.
- **Daltonismo:** un test simula protanopia y deuteranopia (Machado et al., 2009). Exige ΔE\*ab ≥ 40
  entre los dos roles y ≥ 20 entre la promesa y cada rol. El triángulo cumple lo mismo que un rol.
- **No hay rojo contra verde.** Los enlaces van en el color del texto; el azul queda para «tú».
- Las series de la curva y de la gráfica de culpa (detrás del candado) se rehacen sobre la paleta
  Papel con los mismos tests.

### Layout

- **Mobile-first:** todo funciona a 320 px sin scroll horizontal, y cada objetivo táctil mide 44 px
  o más.
- **En la película, el texto va en tarjetas de papel** (leyendas, diálogos, chat) abajo en el
  celular y centradas en la compu. Nunca hay una columna larga de prosa.
- **El cuaderno sí es lectura:** una columna cómoda, con ilustraciones de la misma familia.
- Favicon propio de la familia Papel (el diamante o el dado), que se decide con la hoja de
  personajes.

## Consecuencias

- Los tests de contraste y de daltonismo cambian de pares: los puntos de luz de la película y el
  papel del cuaderno en claro y oscuro.
- Sale el bloque `.stage` y los tokens del escenario oscuro.
- Cambiar un color es editar `palette.ts` y `tokens.css` a la vez; los tests fallan si no coinciden.
- Se construye en P1, con la hoja de personajes; los capítulos la aplican desde P2.
