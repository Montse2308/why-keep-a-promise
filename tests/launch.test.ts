import { describe, expect, it } from 'vitest';
import ci from '../.github/workflows/ci.yml?raw';
import deploy from '../.github/workflows/deploy.yml?raw';
import checklist from '../docs/launch-checklist.md?raw';
import pkg from '../package.json';
import { isChecked, placeholdersIn } from '../scripts/check-launch.mjs';
import sourcesComponent from '../src/components/notebook/Sources.astro?raw';
import { ENGINE, WORKING_PAPER } from '../src/config';

/** The launch's own guards: what the deploy refuses, and the checklist steps that come before it. */
describe('the launch (docs/launch-checklist.md, ADR 0034)', () => {
  const step = (name: string) => deploy.indexOf(name);

  it('refuses to deploy a dist/ with anything left to write (a TODO marker) or to verify', () => {
    expect(deploy).toContain("grep -rl -e 'TODO(' -e 'data-unverified' dist/");
    // After the build and the lock's check, and before anything is uploaded.
    expect(step('Nothing left to write or to verify in dist/')).toBeGreaterThan(step('run: npm run verify:dist'));
    expect(step('Nothing left to write or to verify in dist/')).toBeLessThan(step('actions/upload-pages-artifact'));
    expect(step('run: npm run verify:dist')).toBeGreaterThan(step('run: npm run build'));
  });

  it('refuses to deploy while a link is still a placeholder, and leaves CI green until then', () => {
    expect(pkg.scripts['check:launch']).toBe('npm run build && node scripts/check-launch.mjs');
    expect(step('run: node scripts/check-launch.mjs')).toBeGreaterThan(step('run: npm run build'));
    expect(step('run: node scripts/check-launch.mjs')).toBeLessThan(step('actions/upload-pages-artifact'));
    expect(ci).not.toMatch(/check-launch|check:launch/);
  });

  it('finds every placeholder, with its line, and nothing else', () => {
    expect(placeholdersIn("a\n  ssrn: 'SSRN_URL_PENDING',\n  doi: 'ENGINE_DOI_PENDING' // X_PENDING")).toEqual([
      { line: 2, name: 'SSRN_URL_PENDING' },
      { line: 3, name: 'ENGINE_DOI_PENDING' },
      { line: 3, name: 'X_PENDING' },
    ]);
    expect(placeholdersIn("link.endsWith('_PENDING'); pending; https://ssrn.com/abstract=1")).toEqual([]);
    // Today's links in src/config.ts are the placeholders it looks for, until step 3.
    for (const link of [WORKING_PAPER.ssrn, ENGINE.doi]) {
      if (link.endsWith('_PENDING')) expect(placeholdersIn(link)).toEqual([{ line: 1, name: link }]);
    }
  });

  it('reads text files, and not the tests, which name the placeholders on purpose', () => {
    expect(isChecked('src/config.ts')).toBe(true);
    expect(isChecked('dist/index.html')).toBe(true);
    expect(isChecked('README.es.md')).toBe(true);
    expect(isChecked('src/lib/lock.test.ts')).toBe(false);
    expect(isChecked('dist/posters/en/home.png')).toBe(false);
  });

  it('marks on /sources, with the mark the deploy refuses, a source still to be verified', () => {
    expect(sourcesComponent).toMatch(/<p class="sources__row" data-unverified>/);
  });

  it('decides with an ADR, before the lock opens, whether /sources lists the finding’s figures', () => {
    const before = checklist.indexOf('**3b. Las cifras del hallazgo en `/sources`.**');
    const open = checklist.indexOf('**4. Estado del manuscrito.**');
    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThan(open);
    const text = checklist.slice(before, open).replace(/\s+/g, ' ');
    expect(text).toContain('decidir con un ADR nuevo');
    expect(text).toContain('El paso 4 no se da sin ese ADR.');
  });
});
