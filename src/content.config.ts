import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SUBPAGES } from './lib/routes';

/** Act prose, one Markdown file per act and locale: src/content/acts/{en,es}/<nn>-<slug>.md */
const acts = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/acts' }),
  schema: z.object({
    act: z.number().int().min(1).max(6),
    title: z.string().min(1),
    /** The subpage its "Go deeper →" link leads to, or null. */
    deeper: z.enum(SUBPAGES).nullable(),
  }),
});

/**
 * Subpage prose, one Markdown file per subpage and locale: src/content/subpages/{en,es}/<slug>.md.
 * Each deepens one act and only adds to it (docs/content-rules.md, rule (h)). HTML comments mark
 * where a component goes (`<!-- slot:<name> -->`) and where act 5's lock begins (`<!-- lock -->`),
 * see src/lib/subpages.ts.
 */
const subpages = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/subpages' }),
  schema: z.object({
    /** The act this subpage deepens; its "Go deeper →" link leads here. */
    act: z.number().int().min(1).max(6),
    title: z.string().min(1),
  }),
});

/**
 * The home page's two sections that are not acts (ADR 0019): src/content/sections/{en,es}/<id>.md,
 * `research` and `about`. They use the subpages' markers: `<!-- slot:… -->` for a component and
 * `<!-- lock -->` for what renders only behind act 5's lock (docs/content-rules.md, rule (j)).
 */
const sections = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/sections' }),
  schema: z.object({
    title: z.string().min(1),
  }),
});

export const collections = { acts, subpages, sections };
