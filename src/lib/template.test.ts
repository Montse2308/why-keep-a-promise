import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import { fill } from './template';

describe('fill', () => {
  it('replaces every placeholder', () => {
    expect(fill('You: {you}. The other: {other}.', { you: 10, other: 12 })).toBe('You: 10. The other: 12.');
    expect(fill('no placeholders', {})).toBe('no placeholders');
  });

  it('fails on a missing value', () => {
    expect(() => fill('{face}', {})).toThrow('No value for {face}');
  });

  it('finds the same placeholders in both locales', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{([a-z]+)\}/gi)].map((m) => m[1]).sort();
    for (const key of Object.keys(en) as Array<keyof typeof en>) {
      expect(placeholders(es[key]), key).toEqual(placeholders(en[key]));
    }
  });
});
