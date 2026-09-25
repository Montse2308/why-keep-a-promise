import { describe, expect, it } from 'vitest';
import { LANG_PREF_KEY, readLangPref, shouldRedirect, writeLangPref } from './lang-pref';

const ORIGIN = 'https://montse2308.github.io';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe('language preference storage', () => {
  it('round-trips a locale', () => {
    const storage = memoryStorage();
    writeLangPref(storage, 'es');
    expect(readLangPref(storage)).toBe('es');
  });

  it('ignores unknown values, missing storage and throwing storage', () => {
    expect(readLangPref(memoryStorage({ [LANG_PREF_KEY]: 'fr' }))).toBeNull();
    expect(readLangPref(undefined)).toBeNull();
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readLangPref(throwing)).toBeNull();
    expect(() => writeLangPref(throwing, 'en')).not.toThrow();
  });
});

describe('shouldRedirect', () => {
  it('does nothing without a preference or when it matches', () => {
    expect(shouldRedirect(null, 'en', '', ORIGIN)).toBe(false);
    expect(shouldRedirect('es', 'es', '', ORIGIN)).toBe(false);
  });

  it('redirects on direct or external entry', () => {
    expect(shouldRedirect('es', 'en', '', ORIGIN)).toBe(true);
    expect(shouldRedirect('es', 'en', 'https://www.linkedin.com/', ORIGIN)).toBe(true);
  });

  it('never overrides in-site navigation', () => {
    expect(shouldRedirect('es', 'en', `${ORIGIN}/why-keep-a-promise/es/`, ORIGIN)).toBe(false);
  });
});
