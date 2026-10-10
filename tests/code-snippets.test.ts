import { describe, expect, it } from 'vitest';

/**
 * /how-its-built quotes code from this site; each block must match the source it quotes, word for word.
 * The engine's section, behind the lock, quotes the engine's `choose()` instead (ADR 0037, E4): the
 * engine is never opened from this repo (ADR 0010), so that block is checked only to be the same in
 * both languages and to be the function the page names.
 */
const pages = import.meta.glob('../src/content/subpages/*/how-its-built.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const code = import.meta.glob(['../src/**/*.{ts,astro,mjs}', '!**/*.test.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const normalize = (text: string) => text.replace(/\r\n/g, '\n');
const ENGINE_SECTION = '<!-- lock -->';
const siteBlocks = (markdown: string) => blocks(normalize(markdown).split(ENGINE_SECTION)[0] ?? '');
const engineBlocks = (markdown: string) => blocks(normalize(markdown).split(ENGINE_SECTION)[1] ?? '');
const blocks = (markdown: string) => [...normalize(markdown).matchAll(/^```\w*\n([\s\S]*?)^```/gm)].map((m) => m[1] ?? '');

describe('code blocks on /how-its-built', () => {
  const entries = Object.entries(pages);

  it('exist in both languages, the same blocks in each', () => {
    expect(entries).toHaveLength(2);
    const [a, b] = entries.map(([, markdown]) => blocks(markdown));
    expect(a?.length).toBeGreaterThan(0);
    expect(b).toEqual(a);
  });

  it.each(entries.flatMap(([path, markdown]) => siteBlocks(markdown).map((block, i) => [`${path.replace(/^.*subpages\//, '')} #${i + 1}`, block] as const)))(
    '%s is quoted verbatim from src/',
    (_name, block) => {
      expect(Object.values(code).some((source) => normalize(source).includes(block))).toBe(true);
    },
  );

  it("quotes the engine's choose() in its section, the same in both languages", () => {
    const [a, b] = entries.map(([, markdown]) => engineBlocks(markdown));
    expect(a).toHaveLength(1);
    expect(b).toEqual(a);
    expect(a?.[0]).toMatch(/^\/\*\* Rolls only if it is strictly better\. At a tie, Don't\. \*\/\nexport function choose\(/);
  });
});
