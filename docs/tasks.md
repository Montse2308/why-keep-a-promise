# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test` y `build`
en verde.

**Fase activa:** F1.1 cerrada; F2 pendiente de autorización. F0, F0.1 y F1 cerradas.

## F0 · Esqueleto

- [x] Revisar versiones de Node, npm, git y gh.
- [x] Crear el proyecto Astro (plantilla mínima, TypeScript strict) con `create-astro`.
- [x] `astro.config.mjs`: `site`, `base`, salida estática, i18n `en`/`es` sin prefijo para `en`.
- [x] Configuración del repo: `.gitattributes`, `.gitignore`, `.editorconfig`, `.nvmrc`, `tsconfig` strict.
- [x] Scripts `dev`, `build`, `preview`, `check`, `test`.
- [x] Helper de enlaces que respeta `base` (`src/lib/routes.ts`) con tests.
- [x] `src/lib/i18n.ts` tipado que falla en `check` y en `build` ante claves desbalanceadas, con test.
- [x] Layout base: franja de autora, switch EN/ES que cambia de ruta, footer con subpáginas,
      `hreflang`. (La memoria de la elección se quitó en F0.1, ADR 0013.)
- [x] Rutas placeholder: `/`, `/dilemma`, `/vanberg`, `/finding`, `/how-its-built` y sus pares en
      `/es/`; `/` con seis secciones con id por acto. Test de paridad de páginas.
- [x] Lugar de la mesa en el árbol (`src/components/table/GameTable.astro`, `src/lib/table/`), sin
      implementar.
- [x] `src/styles/tokens.css` con tokens base, claro/oscuro y `prefers-reduced-motion`.
- [x] `ci.yml` (install → check → test → build) y `deploy.yml` (solo `workflow_dispatch`).
- [x] `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `README.md`, `README.es.md`,
      `LICENSE`.
- [x] `docs/`: plan, phases, tasks, content-rules, launch-checklist, sources, ADR 0001–0012.

## F0.1 · Correcciones de auditoría

- [x] `content-rules.md`: regla (d) aclarada; reglas (g) y (h) nuevas.
- [x] `phases.md`: F2 (matriz del PD ≠ juego de Vanberg), F3 (series encimadas y etiquetadas),
      F4 (dónde se pospone una subpágina).
- [x] Nombre visible en `author.name` (EN y ES).
- [x] `AGENTS.md`: prohibido inventar datos personales.
- [x] Switch EN/ES como enlace simple: fuera la redirección, el almacenamiento, sus tests y el
      `<script>`. ADR 0013; `AGENTS.md`, mapa y plan actualizados.
- [x] URL de LinkedIn en `AUTHOR.linkedin`.

## F1 · Sistema visual + mesa (momentos 1–2)

- [x] Resolver las preguntas abiertas de abajo que bloquean F1 (tipografía: ADR 0014).
- [x] Sistema visual: paleta final en `tokens.css` (claro/oscuro, contraste AA), escala tipográfica.
      Valores en `src/lib/design/palette.ts`; tests de contraste, daltonismo y paridad con
      `tokens.css`.
- [x] Fuentes autoalojadas (Newsreader + Inter variables) en `src/assets/fonts/`, con la API de
      fuentes de Astro (proveedor `local`), `font-display: swap`, fallbacks métricos y precarga
      del texto. JetBrains Mono, diferida a F4.
- [x] Favicon propio: cara de dado con los dos colores de rol (el de Astro, fuera).
- [x] Verificar en Vanberg (2008) los pagos y el diseño del juego, con página (F1.1: Suppl. A,
      p. 2; Suppl. B, p. 1).
- [x] Lógica pura de la mesa en `src/lib/table/` (pagos con aritmética exacta, RNG inyectable,
      máquinas de estado de los momentos 1 y 2, expectativa del receptor) con tests.
- [x] Momento 1 en el acto 1: Roll / Don't Roll sin promesa, pago propio contra el del otro,
      esperado y realizado.
- [x] Momento 2 en el acto 4: promesa → sorteo → Roll / Don't; lo que espera el otro no cambia con
      el sorteo (test del invariante).
- [x] Momento 2: lo que hicieron los participantes reales, con cita (F1.1: titular 73 % contra
      54 % y las cuatro celdas, con la del visitante resaltada).
- [x] Medidor con niveles numéricos de expectativa (F1.1: 69 / 100 y 48 / 100, creencia de primer
      orden del receptor).
- [x] Teclado completo y foco visible en la mesa; el foco pasa al primer control del paso
      siguiente.
- [x] Resultados anunciados en una región `aria-live`.
- [x] Movimiento reducido: sin animación que cargue información sola.
- [x] Textos de interfaz de la mesa en `en.json` / `es.json`.
- [x] `<noscript>`: tabla estática de pagos.
- [x] ADR 0014: dirección visual, roles de color y movimiento.

## F1.1 · Cifras de Vanberg desde el material suplementario

- [x] Pagos y dado (Suppl. A, p. 2): coinciden con `PAYOFFS`; cerrado `verify-vanberg`.
- [x] Sorteo de cambio de pareja con probabilidad ½ (Suppl. A, p. 2, Step 3; Suppl. B, p. 1).
- [x] Medidor con la creencia de primer orden del receptor, en fracciones exactas; cerrado
      `vanberg-beliefs`.
- [x] Reveal con las tasas de Roll de los dictadores, en cuentas exactas; cerrado `vanberg-rates`.
- [x] `docs/sources.md`: cada cifra con su fuente, marcada verificada (suplementos).
- [ ] PENDIENTE(pdf), no bloquea: cotejar contra las Tablas I–III impresas y agregar su página
      cuando esté el PDF del artículo.

## Preguntas abiertas

- Ninguna.

## Preguntas cerradas

- ~~Pagos, sorteo, creencias y tasas de Vanberg (2008) con página.~~ Resuelta en F1.1 con el
  material suplementario (`docs/sources.md`).
- ~~Tipografía para autoalojar en F1.~~ Resuelta en F1: Newsreader + Inter variables, JetBrains
  Mono diferida a F4 (ADR 0014).
- ~~URL del perfil de LinkedIn.~~ Resuelta en F0.1: está en `AUTHOR.linkedin`.
- ~~Título en español.~~ Confirmado en F0.1: "¿Por qué cumplir una promesa que ya no conviene?".
- ~~Regla (d) frente al momento 2 y la regla (a).~~ Resuelta en F0.1: el modelo no se presenta
  como si reprodujera tasas de experimentos; las cifras publicadas de Vanberg (2008), con cita, sí
  se muestran.
