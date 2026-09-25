import { describe, expect, it } from 'vitest';

/** /how-its-built quotes code from this site; each block must match the source it quotes, word for word. */
const pages = import.meta.glob('../src/content/subpages/*/how-its-built.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const code = import.meta.glob(['../src/**/*.{ts,astro,mjs}', '!**/*.test.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const normalize = (text: string) => text.replace(/\r\n/g, '\n');
const blocks = (markdown: string) => [...normalize(markdown).matchAll(/^```\w*\n([\s\S]*?)^```/gm)].map((m) => m[1] ?? '');

describe('code blocks on /how-its-built', () => {
  const entries = Object.entries(pages);

  it('exist in both languages, the same blocks in each', () => {
    expect(entries).toHaveLength(2);
    const [a, b] = entries.map(([, markdown]) => blocks(markdown));
    expect(a?.length).toBeGreaterThan(0);
    expect(b).toEqual(a);
  });

  it.each(entries.flatMap(([path, markdown]) => blocks(markdown).map((block, i) => [`${path.replace(/^.*subpages\//, '')} #${i + 1}`, block] as const)))(
    '%s is quoted verbatim from src/',
    (_name, block) => {
      expect(Object.values(code).some((source) => normalize(source).includes(block))).toBe(true);
    },
  );
});
