import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CHAPTER_IDS } from './lib/chapters';

/**
 * The film's captions (ADR 0021): one Markdown file per chapter and locale,
 * src/content/chapters/{en,es}/<nn>-<id>.md, split into beats by `<!-- beat:<id> -->` marks
 * (src/lib/film/captions.ts). Short text only; dialogue and ticket labels are UI keys. A number is a
 * `{name}` placeholder the build fills from the code (src/lib/film/values.ts), never a figure.
 * Chapter 7's finding follows a `<!-- lock -->` mark and renders only behind the lock (ADR 0034); its
 * placeholders are the curve's (src/lib/curve/values.ts).
 */
const chapters = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/chapters' }),
  schema: z.object({
    chapter: z.enum(CHAPTER_IDS),
    /** The chapter's heading; chapter 0's is the site's title. */
    title: z.string().min(1),
  }),
});

/**
 * The notebook's prose (ADR 0024), one Markdown file per page and locale:
 * src/content/subpages/{en,es}/<slug>.md. Each page only adds to the film (docs/content-rules.md,
 * rule (h)). HTML comments mark where a component goes (`<!-- slot:<name> -->`) and where the lock
 * begins (`<!-- lock -->`), see src/lib/subpages.ts.
 */
const subpages = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/subpages' }),
  schema: z.object({
    /** The page's title: its entry in the notebook (src/lib/notebook.ts), word for word. */
    title: z.string().min(1),
  }),
});

export const collections = { chapters, subpages };
