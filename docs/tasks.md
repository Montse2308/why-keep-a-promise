# Tareas

Solo se trabaja en la fase activa. Una tarea se marca al cerrarse, con `check`, `test` y `build`
en verde.

**Fase activa:** F0 cerrada; F1 pendiente de autorización.

## F0 · Esqueleto

- [x] Revisar versiones de Node, npm, git y gh.
- [x] Crear el proyecto Astro (plantilla mínima, TypeScript strict) con `create-astro`.
- [x] `astro.config.mjs`: `site`, `base`, salida estática, i18n `en`/`es` sin prefijo para `en`.
- [x] Configuración del repo: `.gitattributes`, `.gitignore`, `.editorconfig`, `.nvmrc`, `tsconfig` strict.
- [x] Scripts `dev`, `build`, `preview`, `check`, `test`.
- [x] Helper de enlaces que respeta `base` (`src/lib/routes.ts`) con tests.
- [x] `src/lib/i18n.ts` tipado que falla en `check` y en `build` ante claves desbalanceadas, con test.
- [x] Layout base: franja de autora, switch EN/ES que cambia de ruta y recuerda la elección,
      footer con subpáginas, `hreflang`.
- [x] Rutas placeholder: `/`, `/dilemma`, `/vanberg`, `/finding`, `/how-its-built` y sus pares en
      `/es/`; `/` con seis secciones con id por acto. Test de paridad de páginas.
- [x] Lugar de la mesa en el árbol (`src/components/table/GameTable.astro`, `src/lib/table/`), sin
      implementar.
- [x] `src/styles/tokens.css` con tokens base, claro/oscuro y `prefers-reduced-motion`.
- [x] `ci.yml` (install → check → test → build) y `deploy.yml` (solo `workflow_dispatch`).
- [x] `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `README.md`, `README.es.md`,
      `LICENSE`.
- [x] `docs/`: plan, phases, tasks, content-rules, launch-checklist, sources, ADR 0001–0012.

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

- URL del perfil de LinkedIn (hoy el enlace está oculto: `AUTHOR.linkedin` en `src/config.ts`).
- Título en español: se usa "¿Por qué cumplir una promesa que ya no conviene?"; confirmar.
- Tipografía para autoalojar en F1.
- Regla (d) "sin reproducir tasas de experimentos" frente al momento 2 ("lo que hicieron los
  participantes reales") y la regla (a) ("resultados publicados de Vanberg"): confirmar que la
  regla (d) se refiere a no presentar el modelo como reproductor de tasas experimentales, y que
  mostrar las cifras publicadas de Vanberg con cita está permitido.
