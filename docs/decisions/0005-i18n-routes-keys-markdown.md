# 0005 · i18n por rutas + claves + Markdown

**Estado:** aceptada (F0)

## Contexto

La página existe en inglés y español con paridad completa. Hay que evitar que un idioma se quede
atrás sin que nadie lo note.

## Decisión

- **Rutas:** inglés en `/`, español en `/es/`, con i18n de Astro (`defaultLocale: 'en'`, sin prefijo
  para el idioma por defecto).
- **Claves:** el texto de interfaz vive en `src/i18n/en.json` y `es.json`. `src/lib/i18n.ts` falla en
  `astro check`/`tsc` (tipos) y en `astro build` (aserción al cargar) si una clave existe en un
  idioma y no en el otro, o si un valor está vacío.
- **Prosa:** Markdown por idioma, desde F2.
- **Switch EN/ES:** lleva a la misma ruta en el otro idioma y guarda la elección en `localStorage`.
  Al entrar desde fuera del sitio (sin referrer del mismo origen) con una preferencia distinta a la
  de la página, redirige una vez; la navegación interna nunca se sobrescribe.
- `hreflang` para `en`, `es` y `x-default` (→ `en`) en cada página.

## Consecuencias

- Un test comprueba que cada ruta existe en ambos idiomas (`tests/pages.test.ts`).
- Los slugs de las subpáginas son iguales en ambos idiomas (`/es/vanberg/`).
- Si el almacenamiento no está disponible, el switch sigue funcionando; solo no recuerda.
