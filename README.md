# Why keep a promise that no longer pays?

[Español](README.es.md)

The outreach page of a personal research project on why people keep promises that no longer pay
them. It is being rebuilt as a short scroll-driven film in nine chapters, from the prisoner's
dilemma to the partner-switching game of Vanberg (2008), with a notebook for the technical depth.

**Work in progress.** Nothing here is final.

## Run it locally

Requires the Node.js version in [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev      # http://localhost:4321/why-keep-a-promise/
npm run check    # astro check + tsc
npm test         # vitest
npm run build    # static site in dist/
npm run verify:dist  # nothing locked reached dist/
```

Built with Astro, TypeScript and SVG. English at `/`, Spanish at `/es/`.

## License

[MIT](LICENSE)
