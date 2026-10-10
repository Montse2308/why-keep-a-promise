---
title: El hallazgo
---

<!-- lock -->

<p class="lede">Una sesión de laboratorio no distingue la culpa personal del compromiso específico a la pareja. Comparar mundos con distinta confianza de fondo, sí.</p>

<section class="minute" aria-labelledby="en-un-minuto">

## En un minuto

- **La pregunta.** ¿Por qué cumplir una promesa que ya no conviene? Dos razones lo predicen. *La
  culpa personal*: duele defraudar una expectativa que tú creaste. *El compromiso específico a la
  pareja*: duele romper tu palabra a esta persona.
- **Lo que un laboratorio no puede separar.** Tras un cambio de pareja, las dos razones predicen
  que tiras menos. La pareja nueva no sabe del cambio, así que la confianza de fondo es la misma
  con y sin él.
- **Lo que sí las separa.** La confianza de fondo: lo que la gente espera de alguien antes de
  cualquier promesa. En una simulación, lo que gana la culpa personal es bajo en los dos extremos y
  alto en el medio. Lo que gana el compromiso específico no se mueve.
- **Lo que esto no es.** No dice qué razón siente la gente. Dice qué comparación podría
  distinguirlas. Los números del modelo no se calibraron contra ningún experimento.

<!-- slot:minute-links -->

</section>

<dl class="known wide">
<div class="known__column">
<dt>Lo que ya se sabía</dt>
<dd>Vanberg (2008) cambió a la pareja para separar lo que el otro espera de la palabra que diste. Las promesas se cumplieron menos tras el cambio, y él lo leyó como una preferencia por cumplir la palabra en sí misma.</dd>
<dd>Kawagoe y Narita (2014) propusieron la culpa personal y derivaron que, tras un cambio, es cero: la promesa que tiene la pareja nueva no la hizo quien decide.</dd>
</div>
<div class="known__column">
<dt>Lo que agrega este trabajo</dt>
<dd>La culpa personal y el compromiso específico a la pareja caen en el mismo par del diseño de Vanberg, así que su resultado le queda a las dos.</dd>
<dd>La variable que las separa: la confianza de fondo. La culpa personal depende de ella; el compromiso específico a la pareja, no.</dd>
<dd>Un modelo de población, en el que las razones se propagan según lo que ganan, y un motor de simulación abierto que lo mide.</dd>
<dd>Un resultado negativo: quién puede hablar no cambia quién sobrevive (<a href="#otros-dos-resultados">§6</a>).</dd>
</div>
</dl>

## Tres mundos

En cada mundo, la creencia de que la promesa se cumplirá es la misma, 76 de 100. Solo cambia la
confianza de fondo.

<div class="explorer-block" data-explorer-block hidden>

*Pruébalo.* La loma sale de la fórmula, no de haber elegido bien los números. Baja θ y la ventana se
estrecha, hasta que por debajo de 0.277 se cierra. Mueve la creencia de que la promesa se cumplirá y
el pico se mueve con ella: siempre está en la mitad.

<!-- slot:explorer -->

</div>

<!-- slot:three-worlds -->

- **Donde casi nadie cumple**, se esperaba poco desde el principio. La culpa es el producto de lo
  que se esperaba y lo que agregó tu promesa, y si se parte de casi nada, el producto se queda
  chico.
- **Donde casi todos cumplen**, tu promesa casi no agregó nada. El producto vuelve a ser chico.
- **En medio**, las dos cantidades son grandes, y la culpa está en su punto más alto.
- **El compromiso específico a la pareja** no mira nada de esto: tira siempre que la promesa lo ata.

## Lo que gana cada razón

En la simulación, el otro ve qué razón te mueve antes de jugar, y solo entra si vas a tirar. Si
entra y tiras, ganas 10; si se queda fuera, cada uno se queda con 5. Así que tirar es lo que paga.
La culpa personal gana 10 solo dentro de su ventana. El compromiso específico a la pareja y la
culpa general ganan 10 en todo el recorrido.

<!-- slot:result-figure -->

## Para quien quiera la cuenta

### Cuatro razones, dos pares

Cada razón del hilo principal tiene una versión general y una más estrecha. La culpa puede
responder a la expectativa de cualquiera, o solo a una que tú creaste. Tu palabra puede atarte a
cualquiera a quien le prometiste, o solo a esta persona. Salen cuatro. Con cambio de pareja, cada
una predice:

| Razón                             | Qué te pide                                             | Con cambio de pareja |
| --------------------------------- | ------------------------------------------------------- | -------------------- |
| Culpa general                     | no quedar por debajo de lo que cualquiera espera de ti  | tiras igual          |
| Compromiso general                | cumplir tu palabra, dada a quien sea                    | tiras igual          |
| Culpa personal                    | no defraudar una expectativa que tú creaste             | tiras menos          |
| Compromiso específico a la pareja | cumplir tu palabra a esta persona                       | tiras menos          |

El diseño de Vanberg separa los dos pares, pero no lo que hay dentro de cada par. Que la culpa
personal sea cero con cambio de pareja no es un supuesto de esta página: lo derivan los propios
Kawagoe y Narita (2014).

### La fórmula

Llama *a* a la confianza de fondo y escribe cada creencia en centésimas, de modo que 76 es la
creencia de que la promesa se cumplirá: el promedio de la creencia de segundo orden de los dictadores
sin cambio de pareja en Vanberg (2008, Tabla I). La culpa disponible es entonces *a* · (76 − *a*) / 100. La
culpa personal tira el dado si θ · culpa > 4, el costo de tirar (14 − 10), con θ = 0.6, cuánto pesa
una unidad de culpa frente a una unidad de dinero: es decir, si la culpa pasa de 20/3, cerca de
6.67.

Igualar *a* · (76 − *a*) / 100 = 20/3 da el corte analítico: la culpa personal tira entre cerca de
10.1 y cerca de 65.9. La grilla que mide la curva solo tiene filas en algunos valores, así que ahí
tira de 15 a 65. El pico está en 38, donde la culpa vale 14.44.

El compromiso específico a la pareja tiene un costo fijo, c = 5, por romper tu palabra. Como 5 > 4,
siempre tira cuando la promesa lo ata. La culpa general responde a la creencia de que la promesa se
cumplirá, que no depende de la confianza de fondo, así que su decisión tampoco.

## Otros dos resultados

**Quién habla no decide.** En el laboratorio, un acuerdo, en el que prometen los dos, se cumple más
que una promesa de un solo lado (Di Bartolomeo, Dufwenberg, Papa y Passarelli, 2023). En el modelo,
dejar hablar a los dos no reproduce eso. Si quien decide promete con la misma frecuencia, una
población donde pueden hablar los dos termina exactamente igual que una donde solo habla quien
decide: sobreviven las mismas razones, semilla por semilla, en 60 corridas de 60. Esto se sigue de
cómo empiezan las creencias: un acuerdo y una promesa de un solo lado abren con la misma
expectativa, y ninguna razón del modelo los trata distinto. No dice que los acuerdos no le importen
a la gente. Dice que, para producir esa diferencia, un modelo necesita algo más que estas cuatro
razones.

**Cuando una promesa puede dejar de atar.** Supón que una promesa deja de atar a esta pareja una
parte de las veces, y que el otro ve qué razón te mueve. Entonces el otro entra con alguien que solo
tira cuando está atado si esa parte es menor que la mitad. Entre cero y la mitad sobreviven la
culpa personal y el compromiso específico a la pareja. De la mitad en adelante, la culpa general y
el compromiso general. Es la división de Vanberg en dos pares, leída como quién gana. Dentro de cada
par, las dos razones terminan ganando lo mismo, así que esa parte no las distingue, salvo en una
franja estrecha justo debajo de la mitad, que pasa por el mismo canal de creencias (el paper,
sección 6). Lo que sí las distingue, en todo el recorrido, es la confianza de fondo.

*Estos dos resultados usan otros ajustes que la curva; el paper los lista (sección 6 y Tabla 1).*

## Qué lo resolvería

Otra sesión con cambio de pareja no: la confianza de fondo es la misma en sus dos condiciones, así
que ve un solo punto de la curva. En el modelo, la culpa personal cumple su palabra solo en el rango
medio de la confianza de fondo, y el compromiso específico a la pareja la cumple en todo el rango.
Distinguirlas exige comparar sesiones, o poblaciones, con distinta confianza de fondo.

## Una prueba de robustez

En una variante, la expectativa previa no puede valer más que lo que el otro obtiene sin jugar, 5.
La cola derecha no baja: de 70 en adelante, la culpa personal sigue ganando 10. La variante se
anunció antes de correr la medición.

## Límites

- El otro ve qué razón te mueve. Si no pudiera, no tirar pagaría más y el orden de los pagos se
  invertiría; esto no se varió.
- Es una comparación entre mundos con la confianza de fondo fijada. En una corrida normal del
  motor, la confianza de fondo se reescribe cada generación, y la población se queda en un solo
  punto de la curva.
- En el centro, donde dos razones ganan lo mismo, cuál queda es azar.
- θ y c no se calibraron contra los experimentos.
- Es un resultado de identificación, sobre qué se puede distinguir, no una afirmación de que la
  gente siente culpa personal.

## De dónde salen los números

De un motor de simulación que escribí en TypeScript. Es determinista: cada corrida tiene una
semilla explícita, y la misma semilla repite la misma corrida. Sus tests fijan la curva de esta
página, y un comando regenera todas las corridas del paper. Está archivado con un DOI. {engine}

<!-- slot:cite -->
