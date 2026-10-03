# La revisión externa (origen de P7)

Copia de la revisión externa del sitio, hecha al terminar P6 sobre `main` (commit `9b3efda`,
2026-10-01). **No es una regla ni un plan:** es la evidencia de la que sale P7. Qué se hace con cada
punto, qué se descartó y por qué está en `docs/p7-review-plan.md`; las decisiones, en los ADR. Los
números de línea son de ese commit y dejan de valer cuando el código cambia (por ejemplo, al partir
`film.ts` en 7.1).

---

Revisé el sitio usándolo de verdad: build de producción con `npm run preview` y Chromium (Playwright) con clics y toques reales, a 1440 px, 360 px, 320 px y en celular horizontal, en inglés y español, con teclado, con movimiento reducido, sin JavaScript y con el script bloqueado. También pasé axe 4.13 por las 14 páginas en claro y oscuro, medí los cuadros por segundo al hacer scroll y leí el código y los tests.

`check`, `test` (1021 en verde), `build`, `verify:dist` y `budgets` pasan. No modifiqué nada del repo; las capturas y scripts quedaron solo en el scratchpad.

Límites honestos de la revisión: no tuve un teléfono real, ni Safari, ni Firefox, ni un lector de pantalla real. Lo de rendimiento lo medí en Chromium sin GPU, así que señala un riesgo, no da el número de un teléfono.

---

## Recomendaciones, de más a menos importante

### 1. Si el script de la película falla, la página queda rota
- **Qué:** la clase `html.js` se pone siempre, antes de saber si el script de la película va a correr. Bloqueé el JS y quedan personajes estirados, una escena congelada, boletos que no responden y ningún aviso.
- **Dónde:** `src/layouts/BaseLayout.astro:62`. El mundo vivo usa `preserveAspectRatio="none"`, por eso se deforma.
- **Por qué:** pasa con un navegador viejo que no corre módulos, un error de red, un bloqueador o una excepción en `start()`. Es justo el caso que el storyboard debía cubrir, y hoy no lo cubre.
- **Propuesta:**
  - El script en línea revisa antes si hay soporte (`'noModule' in HTMLScriptElement.prototype`).
  - `film.ts` marca `data-film-ready` al arrancar y envuelve `start()` en `try/catch`; si algo falla, quita `js`.
  - Un temporizador de unos 4 s quita `js` si la película nunca arrancó.
- **Impacto:** alto · **Esfuerzo:** S · **Choca con:** nada. Es lo que pide el ADR 0025.

### 2. Al volver de una lupa o del cuaderno, la película olvida todo
- **Qué:** prometí, jugué el dilema, abrí «The dilemma, in depth» y volví con Atrás. El scroll volvió al mismo punto, pero el carrete dice «No promise» y los resultados se borraron. Lo mismo pasa con «← Back to "Two rooms"» y al recargar.
- **Dónde:** las lupas (`src/components/film/Magnifier.astro:29`, `MAGNIFIERS`) y el estado en memoria de `src/components/film/film.ts`.
- **Por qué:** las lupas invitan a salir a la mitad de la película. Si Atrás no usa la caché del navegador (pasa seguido en el navegador interno de LinkedIn, justo donde te van a abrir los reclutadores), el hilo de la historia se rompe. Por ejemplo, el capítulo 3 dirá «You didn't answer the other» a quien sí prometió.
- **Propuesta:**
  - (a) Guardar el estado en `history.replaceState()` y restaurarlo en `pageshow`/carga. Vive solo en esa pestaña y no se envía a ningún lado.
  - (b) Si no quieres tocar ADR: que las lupas abran en otra pestaña (`target="_blank" rel="noopener"`).

  Recomiendo (a).
- **Impacto:** alto · **Esfuerzo:** M · **Choca con:** (a) el ADR 0023, «Nada se guarda ni se envía». Valdría un ADR que lo precise como «nada sale de la pestaña ni persiste al cerrarla», que conserva la intención. (b) No choca con nada.

### 3. Rendimiento: las sombras con filtro SVG son lo que más cuesta al hacer scroll
- **Qué:** casi todo el escenario lleva `filter` con desenfoque, incluidas las colinas, que son trazos de miles de px. La cámara cambia el `viewBox` en cada cuadro, así que todo se vuelve a pintar con sus filtros.
- **Dónde:** `src/components/film/World.astro:73-75` (el filtro), `:91`, `:94`, `:102`, `:163`, `:171`; también `Character.astro:27`, `Board.astro:35` y `Engine.astro:22`.
- **Por qué:** medí lo mismo cambiando solo los filtros:

  | Prueba (Chromium sin GPU) | p50 por cuadro | cuadros > 50 ms |
  | --- | --- | --- |
  | Tal cual | 33 ms | 97 |
  | Sin filtros | 16.7 ms | 3 |

  El hilo principal está bien (unos 0.17 s de script en 14 s de scroll); el costo es pintar. Lighthouse no mide esto: el LCP de 2.1 s no dice nada de la fluidez.
- **Propuesta:**
  - Primero, medir en un Android de gama media y un iPhone reales (DevTools → Rendering → Frame rendering stats).
  - Si se confirma: cambiar el desenfoque por sombras planas desplazadas, una copia en tinta translúcida con `translate`. En papel recortado se ven aún más «de papel».
  - Como mínimo, quitar el filtro de las colinas.
- **Impacto:** alto (es un riesgo) · **Esfuerzo:** M · **Choca con:** nada. Una sombra plana sigue siendo «sombra real» (ADR 0027).

### 4. Ninguna página tiene `description` ni `og:description`
- **Qué:** las 14 páginas tienen título, póster, canonical y hreflang (bien), pero no tienen descripción.
- **Dónde:** `src/layouts/BaseLayout.astro:49-61`.
- **Por qué:** LinkedIn, WhatsApp y Google mostrarán solo el título o un texto cualquiera. Además, F5 lo exige: «Open Graph y descripción por página e idioma».
- **Propuesta:**
  - Una clave `meta.description.<ruta>` por idioma en `src/i18n/*.json`, emitida como `<meta name="description">` y `og:description`.
  - De paso: `og:locale` y `og:locale:alternate`, y `og:site_name` («I promise» / «Te lo prometo»).
  - La de `/finding` cerrado no dice nada del hallazgo; basta con el título del sitio.
- **Impacto:** alto · **Esfuerzo:** S · **Choca con:** nada. Aplica la regla (b) a lo que diga `/finding`.

### 5. El README dice «Work in progress. Nothing here is final.»
- **Qué:** también dice «It is being rebuilt…». Es lo primero que ve un reclutador técnico al abrir el repo.
- **Dónde:** `README.md:6-9` y `README.es.md`.
- **Por qué:** un repo de portafolio que se presenta como inacabado le quita valor a un trabajo que sí está muy cuidado.
- **Propuesta:**
  - Una captura o GIF y el enlace al sitio.
  - Tres o cuatro líneas sobre lo notable: storyboard sin JS, motor de escenas propio y probado, candado fuera del build con `verify:dist`, presupuestos en CI, 1000+ tests.
  - Un enlace a `/how-its-built`.
  - Puede quedar como `TODO(launch)` para el paso 8 del checklist.
- **Impacto:** alto (para el portafolio) · **Esfuerzo:** S · **Choca con:** nada.

### 6. Datos pendientes antes del deploy (recordatorio)
- **Qué:** tres cosas ya registradas que siguen abiertas:
  - Las páginas de Axelrod (1984) por verificar (`data-unverified`; `deploy.yml` se detiene por eso).
  - El `PENDIENTE(datos)` de cotejar 70/68 contra `switch.dat`.
  - Las cifras de `/how-its-built`: dicen 15.6 KiB y 211.1 KiB, y el build de hoy da 15.8 KiB y 208.7 KiB.
- **Dónde:** `docs/tasks.md` (P3), `src/lib/sources.ts` y `src/data/lighthouse.json`.
- **Por qué:** quien corra `npm run budgets` verá números distintos a los de la página.
- **Propuesta:** volver a correr Lighthouse sobre el commit de lanzamiento y agregarlo como paso del checklist.
- **Impacto:** medio · **Esfuerzo:** S · **Choca con:** nada.

### 7. El chat del capítulo 2 se lee al revés
- **Qué:** al elegir un mensaje, la tarjeta muestra la pregunta del otro, luego **su respuesta** («Me too. I promise.») y hasta abajo tu mensaje, como boleto oscuro. La respuesta queda arriba de lo que la provoca, y las dos burbujas tienen el borde del otro.
- **Dónde:** `src/components/film/chapters/Talk.astro:45-49` y `:118-119` (con JS, `.bubble--you` se oculta siempre); `film.ts:490`.
- **Por qué:** es el único momento «conversación» de la película y su orden confunde. El storyboard sin JS ya lo hace bien: tu burbuja azul a la derecha, entre las dos.
- **Propuesta:** al elegir, mostrar `.bubble--you` (quitar la regla de `:119`) y ocultar los tres boletos, o mover la respuesta debajo de los boletos. El foco pasa al `aria-live` o se queda en la burbuja.
- **Impacto:** medio · **Esfuerzo:** S · **Choca con:** nada.

### 8. Sonido: al encenderlo no pasa nada, y luego hay mucho silencio
- **Qué:** solo hay cinco señales:
  - burbujas, en el capítulo 2, si eliges un mensaje;
  - dado al lanzarse y al caer, en el capítulo 3, **solo si tiras**;
  - sello, en el capítulo 7;
  - tema final.

  Entre el capítulo 3 y el 7 (las dos voces, el apagón, el mazo, adivinar) no suena nada. Quien enciende el sonido al llegar y elige «Keep the 14» no oye nada hasta el capítulo 7.
- **Dónde:** `src/lib/film/sound.ts:9` (`CUES`) y `film.ts:177`.
- **Propuesta:**
  - Un acorde breve al encender (las dos notas del hilo).
  - Señales cortas, cada una con lo que se ve: monedas que se apilan (capítulos 1 y 3), el interruptor del apagón, la carta que vuela, el letrero que se voltea en el capítulo 6, el hilo que se rompe.
  - No subiría el volumen ni alargaría nada.
- **Impacto:** medio · **Esfuerzo:** S–M · **Choca con:** roza el ADR 0025: su lista entre paréntesis puede leerse como cerrada. Cumple «todo lo que suena también se ve»; si Montse la lee cerrada, basta un ADR corto.

### 9. No hay nada que diga cuánto falta
- **Qué:** la película mide unas 38 pantallas y en el celular el único indicador es la barra de scroll, que casi no se ve.
- **Por qué:** el capítulo 0 promete «your next few minutes». Saber que vas en el capítulo 5 de 9 ayuda a no abandonar, y también ayuda a cumplir esa promesa.
- **Propuesta:** un hilo fino de 9 cuentas junto al carrete, que se llena con el scroll. Pasivo, sin clic, `aria-hidden`, o con el texto «Capítulo 5 de 9» para lectores de pantalla.
- **Impacto:** medio · **Esfuerzo:** S · **Choca con:** nada, si no se puede pulsar. El ADR 0024 prohíbe menús de pestañas en la película; si se volviera navegable, sí haría falta un ADR.

### 10. Los primeros 10 segundos en el celular: la escena está quieta
- **Qué:** todo depende del scroll. En la computadora los ojos siguen al puntero; en el celular, hasta que deslizas, es una ilustración fija.
- **Por qué:** el plan pide sorprender en 10 segundos aunque el visitante no juegue.
- **Propuesta:**
  - Vida en reposo, solo sin movimiento reducido: un parpadeo cada pocos segundos y un leve balanceo del dado.
  - El cuadrado mira al círculo y luego al boleto mientras espera la respuesta.
  - Revisar también el primer tramo: dura 3 pantallas con la misma tarjeta (`src/lib/chapters.ts:65`). Lo acortaría a unas 2, o haría que algo cambie a la mitad.
- **Impacto:** medio · **Esfuerzo:** M · **Choca con:** nada. Son transformaciones (ADR 0025); cuidando el punto 3, que el parpadeo no fuerce a repintar los filtros.

### 11. El final se apaga: la escena se va vacía y el pie es mínimo
- **Qué:** después de «The end», la película se queda una pantalla y luego se va hacia arriba. Queda una franja de suelo vacío y un pie con seis enlaces. No hay forma de volver a empezar.
- **Dónde:** `film__hold` en `Film.astro:112`, `NotebookFooter.astro` y los créditos en `Closing.astro`.
- **Propuesta:**
  - Un «Ver de nuevo / Volver a empezar» al pie de los créditos: un enlace simple a `href('/')`, que recarga arriba y sin estado.
  - Fundir la escena al papel del pie en vez de dejar el suelo vacío.
- **Impacto:** medio · **Esfuerzo:** S · **Choca con:** nada. Es navegación, no una interacción de juego; el ADR 0024 ya deja que los créditos enlacen.

### 12. Celular en horizontal: la tarjeta tapa la película
- **Qué:** a 740×360 la tarjeta cubre casi todo el escenario. El título se encima con las cabezas, y la tarjeta de la apuesta tapa el carrete.
- **Propuesta:** con `@media (max-height: 480px) and (orientation: landscape)`, la tarjeta va al costado (unos 45 % de ancho, altura máxima con scroll interno) y la cámara se encuadra en el resto.
- **Impacto:** medio-bajo · **Esfuerzo:** M · **Choca con:** nada. El ADR 0027 habla de celular (abajo) y computadora (centrada), no de horizontal.

### 13. SEO y detalles al compartir
- **Qué y propuesta:**
  - **404 propia:** `src/pages/404.astro`, con el escenario y «Volver a la película». Hoy GitHub Pages mostrará la suya, genérica.
  - **`noindex` en `/finding`** mientras esté cerrado: es una página de una línea que no conviene indexar ahora.
  - **Sitemap con hreflang**, generado con un endpoint propio (`src/pages/sitemap.xml.ts`), sin dependencias. Ojo: un `robots.txt` en un sitio de proyecto no sirve, porque los buscadores lo leen en la raíz del dominio.
  - **`theme-color` y un `apple-touch-icon` PNG**, que resvg ya puede generar.
- **Impacto:** bajo-medio · **Esfuerzo:** S · **Choca con:** nada. Usar `@astrojs/sitemap` sí sería una dependencia nueva (ADR 0025).

### 14. Pruebas de navegador con clics reales en CI
- **Qué:** los 1021 tests son unitarios. El bug del botón de sonido, que `element.click()` escondía, es justo lo que solo atrapa un test de navegador.
- **Propuesta:** una prueba de humo con Playwright: recorrer la película con clics y toques, el panel con teclado, sin JS y con el script bloqueado (punto 1). Unas 100 líneas.
- **Impacto:** medio (solidez, y lo que ve un reclutador) · **Esfuerzo:** M · **Choca con:** el ADR 0025 (dependencias): hay que preguntar o hacer un ADR. Es solo de desarrollo y no pesa nada al visitante.

### 15. Transiciones en el cuaderno
- **Qué:** el panel ya entra con animación (`notebook-in`, `Notebook.astro:212`), pero se cierra de golpe, y el paso entre páginas es un corte.
- **Propuesta:** View Transitions entre documentos, solo con CSS: `@view-transition { navigation: auto; }` dentro de `prefers-reduced-motion: no-preference`, y `view-transition-name` en la viñeta y el título. Entre las páginas del cuaderno; dejaría fuera el home por su tamaño. Y una salida simétrica al cerrar el panel.
- **Impacto:** bajo · **Esfuerzo:** S · **Choca con:** nada (sin JS nuevo).

### 16. Opcionales de código y diseño
- **DOM del home:** son 10 copias completas del mundo (9 cuadros quietos y el vivo), unos 460 de 540 KB del HTML y 4 985 nodos, que se analizan aunque haya JS. Cada cuadro podría llevar solo lo visible en su pose. Bajo · M · nada.
- **`film.ts`:** 711 líneas en un solo `start()`. Partirlo en un controlador por capítulo, como los componentes, se leería mejor en una revisión de código. Bajo · M · nada.
- **Escritorio:** al pasar, las tarjetas cruzan por el centro y tapan a los personajes justo cuando reaccionan. Una tarjeta lateral a 1440 px lo evitaría. Bajo · L · **choca con el ADR 0027** («centradas en la computadora»). Solo lo reabriría si Montse lo ve como problema.
- **Idioma:** pasado el título, el EN/ES desaparece de la esquina, y el panel no lo tiene. Un enlace EN/ES dentro del panel no rompe nada. Que conserve el capítulo (`/es/#blackout`) necesitaría JS: **choca con el ADR 0013**.
- **Capítulo 4:** las citas en línea («Charness and Dufwenberg (2006) and Battigalli and Dufwenberg (2007) call it guilt aversion») pesan para un público general. Pasarlas a una línea de cita más pequeña bajo el párrafo. Bajo · S · regla (k): las citas se quedan, solo cambia dónde.
- **Póster:** podría llevar la autora como firma pequeña. Bajo · S · **choca con el ADR 0021** (el nombre va en el capítulo 7 y los créditos).

---

## Agrupadas

**Antes de publicar:** 1 (respaldo si el script falla), 2 (estado al volver), 3 (medir y, si se confirma, aligerar los filtros), 4 (descripciones), 5 (README), 6 (pendientes de datos y Lighthouse final).

**Vale la pena:** 7 (orden del chat), 8 (sonido), 9 (progreso), 10 (vida en reposo y llegada), 11 (final y «ver de nuevo»), 12 (horizontal), 13 (404, `noindex`, sitemap), 14 (pruebas de navegador).

**Opcional:** 15 (transiciones), 16 (DOM, `film.ts`, tarjeta lateral, idioma en el panel, citas, póster).

## Lo que no cambiaría

- **El storyboard sin JS.** Es de lo mejor del proyecto: cada capítulo es un cuadro con su texto, los pagos en tabla y el chat en el orden correcto. Se lee como un libro ilustrado.
- **El candado fuera del build** con `verify:dist` y su test de marcas. Es ingeniería seria, y se cuenta bien en `/how-its-built`.
- **Accesibilidad:**
  - Cero violaciones de axe en las 14 páginas, en claro y oscuro.
  - El orden de tabulación es exactamente el de la historia, con foco visible en todo.
  - El panel es un `<dialog>` que devuelve el foco.
  - Los resultados se anuncian en `aria-live`, y el carrete los dice también en palabras.
- **Movimiento reducido:** cortes limpios, y todos los juegos siguen ahí.
- **Los boletos con la consecuencia**, «Roll the die · You 10 · the other 12, unless a 1 comes up». Cada decisión se entiende sin tabla, y la retroalimentación es inmediata: monedas, caras, el hilo que aguanta o se rompe.
- **La luz continua del día** y los personajes con cara. Tienen identidad propia, y los pósteres la llevan bien.
- **Los números salen del código**, con su registro de cifras, y hay paridad EN/ES verificada.
- **Los presupuestos:** 15.8 de 40 KiB de JS, y CI que falla si se pasan.
- **Deslizar en el mazo:** funciona con el dedo (`touch-action: pan-y`) sin robar el scroll vertical.
- **El historial de ADRs y los commits Conventional.** Un revisor técnico ve criterio.

## Las cuatro ideas de Montse

1. **Que suene algo al encender el sonido: sí, claramente.** Hoy el botón cambia de ícono, pero el primer sonido puede llegar muchas pantallas después, o nunca si te quedas los 14 y no eliges mensaje. Un acorde corto, con el motivo del tema final, confirma que funciona y te deja ajustar el volumen del teléfono a tiempo. Cumple el ADR 0025: lo que se ve con él es el ícono del botón cambiando. Ver punto 8.

2. **Música de fondo durante toda la película: mejor no.**
   - Choca con «todo lo que suena también se ve» (ADR 0025): un fondo continuo no corresponde a nada en pantalla.
   - Cada quien se queda un tiempo distinto en cada tarjeta, así que un bucle se vuelve repetitivo en 5 a 10 minutos.
   - Compite con el lector de pantalla.
   - Mantiene Web Audio activo todo el tiempo en celulares modestos.
   - Les quita fuerza a las señales que ya existen.

   Si quieres atmósfera, mejor rellenar los huecos de los capítulos 4 a 6 con señales que acompañan lo que pasa (punto 8).

3. **Un botón para rehacer cada decisión: no.**
   - El peso de las decisiones es la tesis de la película: una promesa no se deshace.
   - El capítulo 0 ya puede cambiarse hasta el capítulo 3.
   - Agregar «deshacer» es una interacción nueva, fuera de la lista cerrada del ADR 0023.

   Lo que sí hace falta: un **«Ver de nuevo»** al final de los créditos (punto 11), que es navegación y no un juego. Y sobre todo que **salir a una lupa no borre lo que hiciste** (punto 2): ese es el problema real detrás de «hay que recargar».

4. **Transiciones en el cuaderno: sí, pero baratas y al final de la fila.** El panel ya entra animado; falta la salida. Entre páginas, View Transitions solo con CSS da un paso suave sin JS y sin tocar ningún ADR, y con movimiento reducido se apaga sola. No haría nada más elaborado: el cuaderno es para leer, y su valor está en el contenido. Ver punto 15.
