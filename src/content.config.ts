import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CHAPTER_IDS } from './lib/chapters';
import { SUBPAGES } from './lib/routes';

/**
 * The film's captions (ADR 0021): one Markdown file per chapter and locale,
 * src/content/chapters/{en,es}/<nn>-<id>.md, split into beats by `<!-- beat:<id> -->` marks
 * (src/lib/film/captions.ts). Short text only; dialogue and ticket labels are UI keys. A number is a
 * `{name}` placeholder the build fills from the code (src/lib/film/values.ts), never a figure.
 * Chapter 7's finding follows a `<!-- lock -->` mark and renders only behind the lock (ADR 0026); its
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

/** Previous version: act prose, one Markdown file per act and locale: src/content/acts/{en,es}/<nn>-<slug>.md */
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
 * where a component goes (`<!-- slot:<name> -->`) and where the lock begins (`<!-- lock -->`),
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
 * The home page's section that is not an act (ADR 0019): src/content/sections/{en,es}/about.md. It
 * uses the subpages' slot markers (`<!-- slot:… -->`) and has nothing behind the lock.
 */
const sections = defineCollection({
  loader: glob({ pattern: '{en,es}/*.md', base: './src/content/sections' }),
  schema: z.object({
    title: z.string().min(1),
  }),
});

export const collections = { chapters, acts, subpages, sections };
