---
act: 6
title: Cómo está hecho
---

## La página

Todo se construye una sola vez, de antemano, con Astro, en archivos HTML y CSS que cualquier
servidor puede entregar tal cual. JavaScript corre solo en dos lugares: la mesa y el ejercicio de
mejor respuesta de la página del dilema. Sin él, los dos siguen mostrando sus pagos en una tabla
simple.

## Fracciones, no decimales

Los pagos y las probabilidades se guardan como fracciones de números enteros: una probabilidad de
5/6 sigue siendo 5/6 en cada paso. El único redondeo ocurre al final, cuando una proporción se
muestra sobre 100, y aun ese usa números enteros:

```ts
/** A non-negative fraction on a 0–100 scale, rounded half up to an integer, in integer arithmetic. */
export function outOf100(f: Fraction): number {
  if (f.num < 0) throw new RangeError('outOf100 takes a non-negative fraction');
  return Math.floor((200 * f.num + f.den) / (2 * f.den));
}
```

## Revisiones que detienen el build

**Dos idiomas, un solo juego de claves.** Cada texto de la interfaz tiene una clave en inglés y en
español. Si una clave existe solo en uno de los dos, el verificador de tipos rechaza el código y el
build se detiene:

```ts
const esCoversEn: Record<keyof typeof en, string> = es;
const enCoversEs: Record<keyof typeof es, string> = en;
```

**Un registro de cifras.** Cada número que puede aparecer en la prosa está en una lista, con la
fuente de la que viene. Un test lee la prosa de cada sección y falla si encuentra un número que no
está en la lista o una cita que no corresponde a una fuente.

**Frases prohibidas.** Otro test busca en las fuentes una lista corta de frases que la página nunca
debe decir, en ningún idioma.

**El candado.** Una parte del sitio sigue cerrada hasta que el manuscrito esté en revisión.
Mientras está cerrada, esa parte se queda fuera del build, no escondida, y un script lee los
archivos construidos y falla si se coló cualquier rastro de ella.

## Tipografías

Las tres tipografías se sirven desde el propio sitio: Newsreader para leer, Inter para lo que se
toca y JetBrains Mono para el código, como los bloques de esta página. Cada una se copió sin cambios
de su paquete publicado, con su licencia y su procedencia anotadas junto a los archivos.

## Accesibilidad

Todo lo interactivo funciona con el teclado, y el foco pasa al paso siguiente. Cada resultado
también se anuncia a los lectores de pantalla en una región en vivo. Cada gráfica lleva una tabla
oculta con sus valores. Si tu sistema pide movimiento reducido, nada se mueve.

<!-- lock -->

## El motor

La curva viene de un motor de simulación escrito en TypeScript. Sus números aleatorios salen de un
generador con semilla, así que la misma semilla repite la misma corrida. Las razones se propagan por
imitación: de una generación a la siguiente, las razones que ganan más se copian más. El motor
exporta la curva con su procedencia: el commit del motor, la semilla y el comando que la produjo.
De este lado, un test falla si la curva cambia o si falta el archivo.

El repositorio del motor: <span class="todo">TODO(launch): enlace al repo del motor</span>.
