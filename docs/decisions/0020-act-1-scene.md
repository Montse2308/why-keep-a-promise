# 0020 · La escena del acto 1

**Estado:** aceptada (R0). Precisa el ADR 0003: la escena es la mesa antes del momento 1, no un
cuarto momento ni una segunda pieza. Su contenido se rige por la regla (k) de
`docs/content-rules.md`.

## Contexto

La primera pantalla tiene que impresionar aunque no se juegue. El ADR 0003 deja una sola pieza
visual, la mesa, y excluye población, rejillas, canvas y gráficas extra. La escena cuenta el
diseño de Vanberg (2008) con esa misma mesa, mientras el visitante hace scroll, y termina donde
empieza a jugar.

## Decisión

### Una sola mesa

- La escena se dibuja en el SVG de la mesa del acto 1 (`GameTable`, momento 1). No hay un dibujo
  aparte para el hero.
- En el golpe 6, el asiento de quien decide pasa a ser "tú" (azul, círculo) y esa misma mesa
  habilita el momento 1.
- La mesa aparece solo donde ya aparecía: en el acto 1 y en el acto 4 (momento 2). La escena no
  suma una tercera.

### Los personajes

A es quien promete y decide; B, su pareja; C, la pareja nueva. Van en tinta neutra, sin los
colores ni las formas de rol, y se distinguen por posición y por etiqueta (ADR 0018). El visitante
los mira; no es ninguno de ellos.

### Los golpes

Sigue el orden de Vanberg: hablan sin saber quién decide, se sortean los roles, cambia la pareja y
solo quien decide se entera. Las leyendas de abajo son el texto base; la redacción final vive en
claves de i18n con paridad EN/ES.

| Golpe | Qué pasa | Leyenda |
| ----- | -------- | ------- |
| 0 · Llegada | La primera pantalla sin scroll: A y B frente a frente, el dado en medio, sin tirar. Arriba, la pregunta; el sello y la autora (ADR 0019); una señal pequeña de que hay que bajar. | — |
| 1 · El chat | A escribe; el globo se llena conforme se baja. Texto ilustrativo, no es cita de ningún participante: «I'll roll the die.» / «Voy a tirar el dado.». | Hablan antes de saber quién decide. |
| 2 · La promesa queda | El globo se cierra y deja un rombo de promesa del lado de B. | — |
| 3 · El sorteo de roles | A recibe la etiqueta «decide»; B queda como quien solo recibe. | — |
| 4 · El cambio de pareja | B sale con su rombo; entra C con el rombo que le dio otra persona que decide (el caso fijo de la mesa). Solo A ve el cambio. | C no sabe que lo cambiaron. La promesa de A no fue para C. |
| 5 · El dado rueda | A tira; el dado gira y cae en una cara fija, la misma en cada visita. La cara no se traduce en un pago. Aparecen los pagos de la mesa. | A recibe 10 en vez de 14; a C le tocan 10 esperado. Tirar le costó 4. |
| 6 · Salida | La escena deja de estar fija; A, B y C se van y el asiento pasa a "tú". | La primera decisión es tuya: en la mesa, sin promesa de por medio, tiras el dado o no, y ves tu pago contra el del otro. |

- Los pagos del golpe 5 salen de `PAYOFFS` de la mesa (`src/lib/table/game.ts`): 10 en lugar de
  14 para quien decide, y 10 esperado para quien recibe, con la palabra de `table.expected`. La
  primera pantalla y la mesa dicen lo mismo.
- La escena no afirma que lo que espera quien está enfrente no cambió. Eso es un resultado del
  experimento (70 contra 68) y vive en el acto 4.

### Cómo se mueve

- **Solo CSS ligado al scroll** (animaciones con línea de tiempo de scroll o de vista). No hay
  script nuevo. La frase del JavaScript del sitio (ADR 0015 y 0017) no cambia.
- **El scroll no se secuestra.** Es el scroll nativo, sin ajuste a posiciones ni captura de la
  rueda o del dedo. La escena se queda fija unas cinco pantallas y cada golpe avanza y retrocede
  con la posición del scroll.
- El dado gira atado al scroll (ADR 0018). Solo se animan `transform`, `opacity` y `clip-path`.
- Los controles del momento 1 no se pueden enfocar ni tocar antes del golpe 6.

### La versión quieta

- Se muestra con `prefers-reduced-motion: reduce`, en un navegador que no soporte las animaciones
  ligadas al scroll (`@supports`) y sin CSS de animación.
- Es una imagen de la mesa en el golpe 5 y, al lado, las leyendas como lista numerada. B aparece
  atenuado fuera de la mesa con la etiqueta «antes del cambio», C sentado, los dos rombos, el dado
  y los pagos.
- Debajo están los botones del momento 1. Al elegir, la mesa pasa al instante al estado del
  momento 1, y sigue siendo una sola mesa. Esa limpieza la hace el script que ya tiene la mesa.
- Sin JavaScript se ve la versión quieta y la tabla estática de pagos de la mesa.

### Acceso

- Las leyendas están en el HTML en orden, así que un lector de pantalla y una página sin CSS
  cuentan la misma historia.
- El dibujo de la escena es decorativo; la historia la cuentan las leyendas. Los anuncios en
  `aria-live` de la mesa empiezan con el momento 1.
- Funciona con teclado, a 360 px y al tacto.

## Consecuencias

- Tests de la regla (k): los pagos de la escena salen de `PAYOFFS`, y ninguna leyenda afirma que
  la expectativa no cambió.
- Un test fija el orden de los golpes.
- F5 suma tres criterios: la escena a 320 px, la versión quieta en navegadores sin animaciones
  ligadas al scroll, y la versión quieta con movimiento reducido.
- Qué navegadores soportan las animaciones ligadas al scroll se comprueba con los datos oficiales
  de compatibilidad al construir, no de memoria.
- Se construye en R3 (`docs/phases.md`).
