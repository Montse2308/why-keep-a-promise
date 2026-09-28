# 0027 · Dirección de arte Papel y la hoja de personajes aprobada

**Estado:** aceptada (P1). Reemplaza el ADR 0022 (archivado) y reescribe lo que sigue vigente de él.
Precisa los ADR 0021 y 0023 en cómo se ven dos cosas: la promesa del visitante es un hilo dorado,
no un diamante, y las decisiones se toman con boletos, no con gestos de manos.

## Contexto

El ADR 0022 dejó para P1 la hoja de personajes, que Montse tenía que aprobar antes de construir el
capítulo 1. Al verla aprobó el elenco, las expresiones y las dos voces, con tres cambios:

1. **El diamante no le convenció.** En una baraja de seis opciones eligió el hilo dorado.
2. **Los gestos de manos no le parecieron intuitivos.** En cinco demostraciones eligió los boletos
   con la consecuencia.
3. **El azul del círculo le pareció chillante.** En dos vueltas de colores, siempre con las
   pruebas de daltonismo del repo, eligió el punto medio entre «Aciano» y «Aciano luminoso».

De noche los colores se veían apagados. Se resolvió con luz, no con más color: una lámpara sobre la
mesa en los capítulos de noche. Las hojas están en `docs/prototipo/`.

## Decisión

### El escenario

- **Un diorama de papel recortado:** capas de cielo, colinas, sol y nubes, la mesa y los
  personajes. Los bordes son de papel, con sombras reales y un grano de papel encima.
- **Las capas del fondo se mueven más despacio** que el primer plano cuando la cámara se mueve
  (paralaje).
- **Un solo escenario para toda la película.** Nunca se cambia de superficie.

### La luz del día, continua

- **La película dura un día.** Los seis puntos de luz y sus colores viven en `LIGHT_POINTS` de
  `src/lib/design/film.ts`:

  | Punto | En el scroll | Capítulo |
  | ----- | ------------ | -------- |
  | Amanecer | 0 | Llegada |
  | Mañana | 0.15 | Dos cuartos |
  | Mediodía | 0.34 | La matriz se dobla |
  | Tarde | 0.55 | El apagón |
  | Atardecer | 0.73 | La gente real |
  | Anochecer | 0.86 | Aquí entro yo · Cierre |

- **No hay cortes de color.** Entre dos puntos, el color se interpola con aceleración suave. Un test
  exige que ninguna superficie cambie más de 25 ΔE\*ab por pantalla de scroll
  (`MAX_LIGHT_CHANGE_PER_SCREEN`). Un corte daría cientos.
- **La lámpara.** Desde 0.8 (los capítulos 7 y 8), una lámpara ilumina la mesa con luz cálida, y los
  personajes no se apagan de noche.
- **La película tiene su propia luz, como un film.** No sigue el tema claro u oscuro del sistema.
- **El cuaderno sí sigue el tema del sistema** (ADR 0024): papel de día en claro, papel de noche en
  oscuro. Es papel con color y textura, no beige plano.

### El elenco

| Personaje | Forma | Color |
| --------- | ----- | ----- |
| Tú | Círculo | `#5d7ee0` |
| El otro | Cuadrado | `#ed6b41` |
| La pareja nueva | Triángulo | `#2ab2ac` |

- **Doble borde, tinta y papel:** una línea de tinta (`#1d1b3a`) por fuera y un filo de papel
  (`#fffaf0`) por dentro. De día separa la tinta; de noche, el papel. Un test exige al menos 3:1
  contra cada superficie en cada punto de luz.
- **Siete expresiones** para el círculo y el cuadrado: neutral, contento, cumplió, tentado,
  preocupado, sorprendido y traicionado. El triángulo tiene cuatro: neutral, contento, sorprendido y
  traicionado.
- **Ojos, cejas y boca en tinta.** Los ojos siguen el puntero donde lo hay.

### Las dos voces

- **Lo que el otro espera:** una nube lila (`#b9b6d8`) que no deja de mirar al otro. Arriba lleva
  un globo con la cara del otro esperando.
- **Mi palabra:** un pergamino (`#fff4d6`) con el sello del hilo. Es seria y tranquila.

### La promesa: el hilo dorado

- **Al prometer**, un hilo dorado (`#f3bd46`, con filo `#8a6500`) une al visitante con quien le
  pidió la promesa.
- **Tres estados:** atado (entero), roto (se rompe y sus puntas se enroscan) y sin hilo (si no
  prometió).
- **En el apagón (capítulo 5)**, el hilo sigue atado a quien se fue, y la pareja nueva llega sin
  hilo. Así el cambio de pareja se ve sin explicarlo.
- **En la esquina**, un carrete pequeño recuerda el estado del hilo durante toda la película, con
  su texto.
- **El ícono de la pestaña** es el mismo símbolo, dibujado para 16 px: el círculo y el cuadrado
  unidos por el hilo.

### Las decisiones: boletos con la consecuencia

- **Cada opción es un boleto de papel.** Del lado izquierdo, el objeto (el dado, la bolsa de
  monedas); del derecho, lo que el visitante hace y lo que pasa, con números. Por ejemplo, «Tirar el
  dado · tú 10, el otro 12 salvo que salga 1».
- **En el dilema** los boletos dicen lo mismo en sus términos: «Cooperar · 3 si coopera, 0 si
  traiciona».
- **Son botones nativos:** teclado, foco visible y lector de pantalla. Se hunden al tocarlos.
- **En el mazo del capítulo 5** también se puede deslizar la carta, como atajo. Los boletos siguen
  ahí.
- **Las monedas** se apilan y cambian de lado, y sustituyen las tablas de pagos.

### Tipografía

- **Fraunces** para los títulos y **Nunito** para el texto y la interfaz, las dos variables en el
  eje de peso (`wght`). Pesan 121 404 bytes en la primera carga.
- **JetBrains Mono** solo en los bloques de código de `/how-its-built`, sin precarga y sin resaltado
  de sintaxis.
- **Autoalojadas** con la API de fuentes de Astro, proveedor `local`, copiadas sin cambios de los
  paquetes `@fontsource-variable/*`, con su licencia OFL y su procedencia en
  `src/assets/fonts/README.md`. Esos paquetes no son dependencias del proyecto, y el build no depende
  de la red.
- Newsreader e Inter salen cuando ya ningún componente las use.

### Color

- **La fuente única de los colores de la película** es `src/lib/design/film.ts`, y
  `src/styles/film.css` la replica. La del cuaderno sigue siendo `palette.ts` con `tokens.css`. Un
  test comprueba cada par.
- **El color nunca va solo.** Cada rol lleva su forma y su etiqueta, y el hilo lleva su texto en la
  esquina.
- **Contraste:** 4.5:1 para texto y 3:1 para gráficos e interfaz.
  - El texto de la película va en tarjetas de papel (tinta sobre papel, 16:1).
  - El título del inicio va en tinta sobre el amanecer.
  - La tinta de caras y bordes contrasta al menos 3:1 con cada relleno.
- **Daltonismo** (Machado et al., 2009, protanopia y deuteranopia): ΔE\*ab ≥ 40 entre los tres
  personajes y ≥ 20 entre el hilo y cada uno. Con los valores de arriba: 44 y 22.
- **No hay rojo contra verde.** Los enlaces van en el color del texto.
- Las series de la curva y de la gráfica de culpa (detrás del candado) se rehacen sobre esta paleta,
  con los mismos tests.

### Layout

- **Mobile-first:** todo funciona a 320 px sin scroll horizontal, y cada objetivo táctil mide 44 px
  o más.
- **El texto de la película va en tarjetas de papel**, abajo en el celular y centradas en la
  computadora. Nunca hay una columna larga de prosa.
- **El cuaderno sí es lectura:** una columna cómoda, con ilustraciones de la misma familia.

## Consecuencias

- Entran `src/lib/design/film.ts`, `src/styles/film.css` y `film.test.ts`. Los tests de
  `palette.ts` siguen cubriendo el cuaderno y la versión anterior mientras exista.
- En los ADR 0021 y 0023, «diamante» se lee «hilo dorado», y «botones con forma de gesto» se lee
  «boletos». Se anota en su línea de estado; lo que deciden no cambia.
- El favicon de la versión anterior (el dado con los dos roles) se reemplaza por el del hilo cuando
  entra el capítulo 0.
