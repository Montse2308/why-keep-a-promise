import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import { findingUnlocked, statusKey } from './lock';

describe('act 5 lock (ADR 0015)', () => {
  it('opens once the manuscript is under review, or on the dev server', () => {
    expect(findingUnlocked('in-preparation', false)).toBe(false);
    expect(findingUnlocked('in-preparation', true)).toBe(true);
    expect(findingUnlocked('under-review', false)).toBe(true);
    expect(findingUnlocked('under-review', true)).toBe(true);
  });

  it('has a status sentence for both states, in both languages (rule (b))', () => {
    expect(en[statusKey('in-preparation')]).toBe('A manuscript is in preparation.');
    expect(es[statusKey('in-preparation')]).toBe('Hay un manuscrito en preparación.');
    expect(en[statusKey('under-review')]).toBe('The manuscript is under review.');
    expect(es[statusKey('under-review')]).toBe('El manuscrito está en revisión.');
  });
});
