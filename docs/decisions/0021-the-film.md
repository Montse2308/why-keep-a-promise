# 0021 · La película «Te lo prometo»

**Estado:** aceptada (P0). Reemplaza los ADR 0019 y 0020 (archivados). Precisa el ADR 0001 y el
0012. El candado de la película está en el ADR 0026. Precisado por el ADR 0027: la promesa del
visitante se ve como un hilo dorado, no como un diamante, y la dirección de arte es la del 0027.

## Contexto

Montse rechazó dos versiones de la página. La primera (F0–F4) era un ensayo de seis actos sobre
papel cálido con una sola mesa interactiva. La segunda (R0–R4) le puso un escenario oscuro, una
escena ligada al scroll, un sello y prosa más corta. En sus palabras, las dos eran aburridas y
básicas, con cortes de color abruptos y un beige plano, y sin nada que llamara la atención.

El contenido también fallaba. El hero arrancaba con el juego de Vanberg, y quien no conoce el
dilema del prisionero no lo entendía. Casi todo era prosa en una columna, con tablas de libro de
texto. Jugar se sentía como llenar un formulario, y el final se desinflaba.

El propósito es que la página llame la atención en su portafolio (puestos fullstack y, después,
liderar), con un producto que sorprenda. También tiene que entenderla alguien de fuera, que al
terminar sepa de qué va la investigación.

Este ADR sale de una sesión de cinco rondas con Montse:

1. Contexto y referencias.
2. Una lluvia de unas 75 ideas, que ella votó.
3. Un concepto completo.
4. Un prototipo navegable en dos direcciones de arte, del que eligió Papel.
5. El plan.

El prototipo de los capítulos 0 a 3 quedó en `docs/prototipo/te-lo-prometo.html` como referencia
visual. No es código del sitio.

## Decisión

### Dos capas

- **La película.** El home (`/`, `/es/`) es una película corta ligada al scroll, en nueve capítulos,
  sobre un solo escenario que cambia de luz poco a poco (ADR 0027).
- **El cuaderno.** Lo técnico y lo académico, a fondo, a un toque desde cualquier punto (ADR 0024).

### El título y el nombre

- El título visible sigue siendo la pregunta: «Why keep a promise that no longer pays?» / «¿Por
  qué cumplir una promesa que ya no conviene?».
- «Te lo prometo» / «I promise» es el nombre interno del proyecto y de los pósteres para compartir.

### Los capítulos

Los ids son estables e iguales en los dos idiomas. Un test fija su orden.

| # | id | Capítulo | Qué dice | Qué hace el visitante |
| - | -- | -------- | -------- | --------------------- |
| 0 | `arrival` | Llegada | El otro pregunta «¿Me prometes que vas a tirar el dado?». Arriba está la pregunta, y la página promete que esto vale unos minutos. | Promete o no. Si promete, nace su diamante. |
| 1 | `two-rooms` | Dos cuartos | El dilema del prisionero desde cero: dos personas, cuartos separados, cooperar o traicionar. Traicionar paga más hagas lo que hagas, y los dos terminan peor. Para el dilema repetido, enlace a *The Evolution of Trust*. | Juega una vez y prueba las dos columnas. |
| 2 | `talk` | ¿Y si pudieran hablar? | Hablar es gratis y no obliga a nadie (*cheap talk*), y aun así la gente cumple. | Elige un mensaje en un chat. |
| 3 | `fold` | La matriz se dobla | «Otro juego, la misma tensión»: el juego de Vanberg (2008). Solo uno decide: quedarse 14, o recibir 10 y tirar un dado que le da al otro 12 salvo que salga 1. | Decide si cumple su promesa. |
| 4 | `two-voices` | Dos voces | Dos razones: lo que el otro espera y la palabra dada. Casi siempre van juntas. El truco de Vanberg para separarlas es cambiar a la persona. | Mira el truco. |
| 5 | `blackout` | El apagón | Se va la luz y en el asiento hay otra persona. Solo quien decide lo sabe. | Decide en un mazo corto de cartas, cada una con una pareja distinta. Después es quien recibe y descubre que la promesa no era para él. |
| 6 | `real-people` | La gente real | Lo que hicieron las personas del experimento: 73 % contra 54 %. Lo que esperaban casi no cambió: 70 contra 68. La conclusión de Vanberg (2008). | Adivina antes de ver cada cifra. |
| 7 | `my-research` | Aquí entro yo | La pregunta, presentada como la de la investigación de Montse, y que ella construyó un motor de simulación en TypeScript. El sello con la frase de estado. Después, el hallazgo, detrás del candado (ADR 0026). | Mira. Con el candado abierto, mueve el control de la curva. |
| 8 | `closing` | Cierre | Vuelve a la primera mesa: el otro le cobra su promesa. La página pregunta si cumplió la suya. Créditos de película. | Contesta y, si quiere, va al cuaderno. |

- **Cifras.** Solo las que ya están registradas en `docs/sources.md`: los pagos del dilema de
  Axelrod (1984), y los pagos, las tasas y las creencias de Vanberg (2008). Toda cifra nueva
  necesita su entrada ahí antes de aparecer (regla (a)).
- **Los juegos** de cada capítulo y sus límites están en el ADR 0023.

### Personajes

- **Tú**, un círculo, en el color del rol «tú».
- **El otro**, un cuadrado, en el color del rol «el otro».
- **La pareja nueva**, un triángulo, en un tercer color.
- **Las dos voces**, lo que el otro espera y la palabra dada, acompañan al visitante desde el
  capítulo 4. Su forma se decide con la hoja de personajes (P1).
- Los personajes tienen ojos, cejas y boca, y reaccionan a lo que pasa.
- Ningún personaje es la caricatura de una persona real. Si aparece quien dirige el experimento, no
  tiene cara.

### Dos hilos

- **La promesa del visitante.** El diamante nace en el capítulo 0, lo acompaña y se agrieta si la
  rompe. En el capítulo 8 el otro se la cobra.
- **La promesa de la página.** En el capítulo 0 promete que esto vale unos minutos, y en el
  capítulo 8 pregunta si cumplió. Nada de lo que el visitante contesta se guarda ni se envía.

### La autora

- Su nombre completo (clave `author.name`) va en el capítulo 7, en primera persona, y en los
  créditos del final.
- No hay créditos de apertura ni perfiles en la película. GitHub y LinkedIn van en `/about`
  (ADR 0024).

### La prosa

- Leyendas y diálogos cortos, en Markdown por idioma, un archivo por capítulo:
  `src/content/chapters/{en,es}/`.
- Paridad EN/ES completa (ADR 0005).
- La prosa de los actos (`src/content/acts/`) y las secciones del home (`src/content/sections/`) se
  retiran conforme los capítulos las reemplazan.

### Lo que ya no rige de las versiones anteriores

- Los seis actos con sus ids (`question` … `how-its-built`) y las secciones `research` y `about`
  dentro del home.
- La primera pantalla con sello y línea de autora.
- La escena del acto 1 y sus golpes.
- «Cómo está hecho» y «Quién es» salen del home: pasan al cuaderno.

### El archivo de documentos

- Lo que está en `docs/decisions/` rige completo. Un ADR que deja de regir, aunque sea en parte, se
  mueve a `docs/archivo/decisiones/` con una línea que dice qué lo reemplaza. Lo que sigue valiendo
  de él se escribe otra vez en el ADR nuevo.
- `docs/archivo/` también guarda el plan, las reglas, las fases y las tareas anteriores. Se
  versiona y entra en la auditoría del paso 3 del checklist (ADR 0012).
- Los números de ADR no se reutilizan.

## Consecuencias

- Un test fija el orden y los ids de los capítulos, que sustituye al de los actos.
- La regla (k) pasa a ser la de la película. Las reglas (b), (g) y (j) se precisan
  (`docs/content-rules.md`).
- El código de la versión anterior (la escena, la mesa en su caja, la primera pantalla, las
  secciones del home) se retira por fases. Cada capítulo reemplaza lo suyo en el mismo commit que
  sus pruebas, así el build nunca queda roto a la mitad.
- Se construye en las fases P1 a P4 (`docs/phases.md`).
