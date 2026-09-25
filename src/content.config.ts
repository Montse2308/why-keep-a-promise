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

export const collections = { acts };
