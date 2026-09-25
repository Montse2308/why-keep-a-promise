import { describe, expect, it } from 'vitest';
import config from '../src/config.ts?raw';
import curveComponent from '../src/components/curve/Curve.astro?raw';
import curveController from '../src/components/curve/controller.ts?raw';
import actEn from '../src/content/acts/en/05-finding.md?raw';
import actEs from '../src/content/acts/es/05-finding.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import homeView from '../src/views/HomeView.astro?raw';
import { findMarks, MARKERS, readStatus, UNLOCKED_MARKERS } from '../scripts/verify-dist.mjs';

const curveKeys = (dictionary: Record<string, string>) =>
  Object.entries(dictionary)
    .filter(([key]) => key.startsWith('curve.'))
    .map(([, value]) => value)
    .join('\n');

// What act 5 puts on the page once unlocked.
const lockedSources = [actEn, actEs, curveKeys(en), curveKeys(es), curveComponent, curveController, homeView].join('\n');

describe('verify:dist (ADR 0015)', () => {
  it('looks for marks that act 5 really carries, so the list cannot go stale', () => {
    expect(findMarks(lockedSources)).toEqual(MARKERS);
    for (const mark of UNLOCKED_MARKERS) expect(MARKERS).toContain(mark);
  });

  it('matches across line breaks and case', () => {
    expect(findMarks('<p>…from Kawagoe and\nNarita. Personal\n  guilt weighs…</p>')).toEqual(['Kawagoe', 'personal guilt']);
  });

  it('finds nothing in act 5 as it renders while locked', () => {
    const locked = `<section id="finding" class="act"><h2 id="finding-title">${en['act.finding.title']}</h2><p class="act__status">${en['manuscript.status.in-preparation']}</p></section>`;
    const lockedEs = `<h2>${es['act.finding.title']}</h2><p>${es['manuscript.status.in-preparation']}</p>`;
    expect(findMarks(locked + lockedEs)).toEqual([]);
  });

  it('reads the manuscript status from src/config.ts', () => {
    expect(['in-preparation', 'under-review']).toContain(readStatus(config));
    expect(readStatus("export const MANUSCRIPT_STATUS: 'in-preparation' | 'under-review' = 'under-review';")).toBe('under-review');
    expect(() => readStatus('export const OTHER = 1;')).toThrow();
  });
});
