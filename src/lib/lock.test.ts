import { describe, expect, it } from 'vitest';
import { ENGINE, WORKING_PAPER } from '../config';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import { findingUnlocked, isPending, statusParts } from './lock';

describe('the lock (ADR 0034)', () => {
  it('opens once the working paper’s link is no longer a placeholder, or on the dev server', () => {
    expect(findingUnlocked('SSRN_URL_PENDING', false)).toBe(false);
    expect(findingUnlocked('SSRN_URL_PENDING', true)).toBe(true);
    expect(findingUnlocked('https://ssrn.com/abstract=1', false)).toBe(true);
    expect(findingUnlocked('https://ssrn.com/abstract=1', true)).toBe(true);
  });

  it('knows a placeholder by its _PENDING ending', () => {
    expect(isPending('SSRN_URL_PENDING')).toBe(true);
    expect(isPending('ENGINE_DOI_PENDING')).toBe(true);
    expect(isPending('10.5281/zenodo.1')).toBe(false);
  });

  it('takes the working paper’s title as Montse gave it, the same in both languages', () => {
    expect(WORKING_PAPER.title).toBe('Promises to whom: Identifying personal guilt and partner-specific commitment across populations');
    // Links are literal placeholders until step 3 of docs/launch-checklist.md, or real addresses.
    for (const link of [WORKING_PAPER.ssrn, ENGINE.doi]) expect(isPending(link) || !/PENDING/.test(link)).toBe(true);
    expect(ENGINE.repository).toBe('https://github.com/Montse2308/Dilema-del-Prisionero');
  });
});

describe('the status sentence (docs/content-rules.md, rule (b))', () => {
  it('is one sentence in each language, with the title in its place', () => {
    expect(en['paper.status']).toBe('Working paper: {title} (SSRN).');
    expect(es['paper.status']).toBe('Documento de trabajo: {title} (SSRN).');
    expect(statusParts(en['paper.status'])).toEqual(['Working paper: ', ' (SSRN).']);
    expect(statusParts(es['paper.status'])).toEqual(['Documento de trabajo: ', ' (SSRN).']);
  });

  it('keeps no state of the old plan: no other status sentence', () => {
    for (const dictionary of [en, es]) {
      expect(Object.keys(dictionary).filter((key) => /status/.test(key))).toEqual(['paper.status']);
    }
  });

  it('fails on a sentence without its title, or with it twice', () => {
    expect(() => statusParts('Working paper.')).toThrow();
    expect(() => statusParts('{title} {title}')).toThrow();
  });
});
