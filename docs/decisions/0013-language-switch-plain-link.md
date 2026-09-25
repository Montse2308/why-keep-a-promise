# 0013 · El switch EN/ES es un enlace, sin memoria

**Estado:** aceptada (F0.1). Reemplaza la parte del ADR 0005 sobre recordar la elección.

## Contexto

El ADR 0005 hacía que el switch guardara la elección en `localStorage` y redirigiera al entrar
desde fuera del sitio. Eso implica que un enlace compartido a `/es/…` puede abrir en inglés para
quien lo recibe, un parpadeo mientras carga la página del idioma equivocado, y JavaScript en todas
las páginas solo para eso.

## Decisión

El switch EN/ES es un enlace simple a la misma ruta en el otro idioma. No guarda preferencia ni
redirige. Un enlace compartido abre siempre el idioma de su URL, sin parpadeo y sin JS.

## Consecuencias

- Se eliminan `src/lib/lang-pref.ts`, sus tests y el `<script>` de `LanguageSwitch.astro`.
- El sitio no envía JavaScript hasta que llegue la mesa (F1).
- Quien prefiera el otro idioma lo elige en cada visita que empiece desde un enlace en el idioma
  por defecto; `hreflang` sigue orientando a los buscadores.
