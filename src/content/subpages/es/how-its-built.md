---
title: Cómo está hecho
---

## Primero, un storyboard

Astro construye cada página de antemano, en HTML y CSS simples. El
home es primero un storyboard: cada capítulo un cuadro quieto, sus tarjetas en orden, cada resultado
por escrito. Un script lo anima con el scroll; sin él, la historia completa sigue ahí. La lógica
vive en módulos puros con sus pruebas, y JavaScript corre solo en la historia y el panel del
cuaderno.

## Un motor de escenas propio

La historia se mueve con un motor de escenas escrito para ella, en TypeScript. Las pistas guardan
valores ligados al scroll; el motor suaviza el paso entre ellos, para que nada arranque ni pare
de golpe, y encuadra la cámara para cada pantalla. Un ciclo lee el scroll
nativo y pinta lo que dicen las pistas: nada captura la rueda ni el dedo, y solo cambian
transformaciones, opacidad y colores.

```ts
/** Quadratic ease-in-out: starts and ends at rest, so no move begins or stops with a jolt. */
export function easeInOut(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}
```

Mezcla los colores por tono, en OKLCH, nunca canal por canal. Por eso el día de la historia tiene
una salida del sol:

<!-- slot:day -->

Una prueba falla si el cielo se vuelve gris, o si alguna superficie cambia demasiado rápido para
verse suave.

## El candado

Una parte del sitio sigue cerrada hasta que el documento de trabajo sea público en SSRN. Esa parte
se queda fuera del build, no escondida: un plugin cambia cada componente bloqueado por un stub vacío,
y un script lee cada archivo construido y falla si se coló algún rastro. La regla es una línea:

```ts
export function findingUnlocked(ssrn: string, dev: boolean): boolean {
  return !isPending(ssrn) || dev;
}
```

## Fracciones, no decimales

Los pagos y las probabilidades se guardan como fracciones de enteros: 5/6 sigue siendo 5/6 en cada
paso. Solo se redondea al final, al mostrar una proporción sobre 100, y aun eso con enteros:

```ts
/** A non-negative fraction on a 0–100 scale, rounded half up to an integer, in integer arithmetic. */
export function outOf100(f: Fraction): number {
  if (f.num < 0) throw new RangeError('outOf100 takes a non-negative fraction');
  return Math.floor((200 * f.num + f.den) / (2 * f.den));
}
```

## Revisiones que detienen el build

**Dos idiomas, un solo juego de claves.** Una clave que falta en un idioma hace que el verificador
de tipos rechace el código:

```ts
const esCoversEn: Record<keyof typeof en, string> = es;
const enCoversEs: Record<keyof typeof es, string> = en;
```

**Un registro de cifras.** Cada número que la página puede decir está en una lista con su fuente;
las leyendas de la historia no llevan ninguno, solo nombres que el build llena desde el código. Una
prueba falla con cualquier otro número o con una cita sin fuente.

**Solo agregar.** Una prueba falla si este cuaderno repite una oración de la historia.

**Frases prohibidas.** Otra prueba falla con una lista corta de frases que la página nunca debe
decir.

## Accesibilidad

Cada elección es un botón nativo que funciona con el teclado, y cada resultado se anuncia en una
región en vivo. Con movimiento reducido, la historia corta entre cuadros quietos y todos los juegos
funcionan. El contraste se prueba en cada punto de la luz del día, y el elenco se distingue
con los dos daltonismos más comunes.

## Peso y velocidad

El script del home, sus tipografías y su primera carga tienen un techo, fijado antes de escribir
la historia; un script revisa cada build.

<!-- slot:weight -->

## Una bitácora de decisiones

Cada decisión que le dio forma a la página está escrita en un registro corto: qué, por qué y qué
reemplazó. Una decisión cambia solo con un registro nuevo; el anterior se archiva, nunca se
reescribe.

<!-- lock -->

## El motor

La curva sale de un motor de simulación propio, escrito en TypeScript y sin dependencias en tiempo
de ejecución. Cuatro decisiones le dan forma:

- **La selección ve dinero, no sentimientos.** La culpa cambia lo que un agente elige; lo que se
  propaga es lo que gana.
- **Un sorteo, un número.** Cada sorteo toma exactamente un número de un generador con semilla,
  aunque su resultado sea seguro. Dos corridas que difieren en un ajuste se mantienen alineadas, así
  que una diferencia entre ellas viene del ajuste, no de los dados.
- **Solo cuenta lo que se pudo ver.** La creencia de que la promesa se cumplirá se actualiza solo
  con los encuentros en los que el otro entró.
- **Cada resultado lleva su origen.** Los scripts que regeneran las corridas del paper se niegan a
  correr mientras el código tenga cambios sin commitear, y escriben el commit, las semillas y cada
  ajuste junto a cada resultado.

```ts
/** Rolls only if it is strictly better. At a tie, Don't. */
export function choose(spec, sens, match, cap) {
  const roll = utility(spec, "roll", sens, match, cap);
  const dont = utility(spec, "dont", sens, match, cap);
  return roll > dont ? "roll" : "dont";
}
```

El motor exporta la curva con su procedencia; de este lado, un test falla si la curva cambia o si
falta el archivo. {engine}
