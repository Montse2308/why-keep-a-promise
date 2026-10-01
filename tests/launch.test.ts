import { describe, expect, it } from 'vitest';
import deploy from '../.github/workflows/deploy.yml?raw';
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
});
