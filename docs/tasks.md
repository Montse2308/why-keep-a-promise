# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test` y `build`
en verde.

**Fase activa:** F0 y F0.1 cerradas; F1 pendiente de autorización.

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

- [ ] Resolver las preguntas abiertas de abajo que bloquean F1.
- [ ] Sistema visual: paleta final en `tokens.css` (claro/oscuro, contraste AA), escala tipográfica.
- [ ] Fuentes autoalojadas en `public/fonts/` con `@font-face` y `font-display: swap`.
- [ ] Favicon propio (hoy es el de la plantilla de Astro).
- [ ] Verificar en Vanberg (2008) los pagos y el diseño del juego; registrarlos en `docs/sources.md`.
- [ ] Lógica pura de la mesa en `src/lib/table/` (pagos, promesa, sorteo de cambio de pareja,
      expectativas del otro) con tests.
- [ ] Momento 1 en los actos 1–2: Roll / Don't Roll sin promesa, pago propio contra el del otro.
- [ ] Momento 2 en el acto 4: promesa → sorteo → Roll / Don't; lo que espera el otro no cambia con
      el sorteo; después, lo que hicieron los participantes reales (con cita).
- [ ] Teclado completo y foco visible en la mesa.
- [ ] Resultados anunciados en una región `aria-live`.
- [ ] Movimiento reducido: sin animación que cargue información sola.
- [ ] Textos de interfaz de la mesa en `en.json` / `es.json`.

## Preguntas abiertas

- Tipografía para autoalojar en F1.

## Preguntas cerradas

- ~~URL del perfil de LinkedIn.~~ Resuelta en F0.1: está en `AUTHOR.linkedin`.
- ~~Título en español.~~ Confirmado en F0.1: "¿Por qué cumplir una promesa que ya no conviene?".
- ~~Regla (d) frente al momento 2 y la regla (a).~~ Resuelta en F0.1: el modelo no se presenta
  como si reprodujera tasas de experimentos; las cifras publicadas de Vanberg (2008), con cita, sí
  se muestran.
