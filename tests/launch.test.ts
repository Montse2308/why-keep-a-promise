import { describe, expect, it } from 'vitest';
import deploy from '../.github/workflows/deploy.yml?raw';
import checklist from '../docs/launch-checklist.md?raw';
import sourcesComponent from '../src/components/notebook/Sources.astro?raw';

/** The launch's own guards: what the deploy refuses, and the checklist steps that come before it. */
describe('the launch (docs/launch-checklist.md, ADR 0007)', () => {
  const step = (name: string) => deploy.indexOf(name);

  it('refuses to deploy a dist/ with anything left to write (a TODO marker) or to verify', () => {
    expect(deploy).toContain("grep -rl -e 'TODO(' -e 'data-unverified' dist/");
    // After the build and the lock's check, and before anything is uploaded.
    expect(step('Nothing left to write or to verify in dist/')).toBeGreaterThan(step('run: npm run verify:dist'));
    expect(step('Nothing left to write or to verify in dist/')).toBeLessThan(step('actions/upload-pages-artifact'));
    expect(step('run: npm run verify:dist')).toBeGreaterThan(step('run: npm run build'));
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
