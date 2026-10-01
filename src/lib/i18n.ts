import en from '../i18n/en.json';
import es from '../i18n/es.json';

import type { Locale } from './locales';

export { DEFAULT_LOCALE, LOCALES, isLocale, otherLocale, type Locale } from './locales';

export type UiKey = keyof typeof en;
type Dictionary = Readonly<Record<string, unknown>>;

// Compile-time parity: `astro check` / `tsc` fail if either file lacks a key the other has.
const esCoversEn: Record<keyof typeof en, string> = es;
const enCoversEs: Record<keyof typeof es, string> = en;

const DICTIONARIES: Record<Locale, Record<UiKey, string>> = { en: enCoversEs, es: esCoversEn };

/**
 * Lists every problem that breaks parity between dictionaries: keys present in
 * one locale but not in another, and values that are not non-empty strings.
 */
export function findParityProblems(dictionaries: Readonly<Record<string, Dictionary>>): string[] {
  const locales = Object.keys(dictionaries);
  const allKeys = [...new Set(locales.flatMap((locale) => Object.keys(dictionaries[locale] ?? {})))].sort();
  const problems: string[] = [];

  for (const locale of locales) {
    const dictionary = dictionaries[locale] ?? {};
    for (const key of allKeys) {
      if (!Object.hasOwn(dictionary, key)) {
        problems.push(`${locale}: missing key "${key}"`);
        continue;
      }
      const value = dictionary[key];
      if (typeof value !== 'string' || value.trim() === '') {
        problems.push(`${locale}: key "${key}" must be a non-empty string`);
      }
    }
  }
  return problems;
}

export function assertParity(dictionaries: Readonly<Record<string, Dictionary>>): void {
  const problems = findParityProblems(dictionaries);
  if (problems.length > 0) {
    throw new Error(`i18n parity check failed:\n  ${problems.join('\n  ')}`);
  }
}

// Runtime parity: every page imports this module, so a mismatch fails `astro build`.
assertParity(DICTIONARIES);

/** Whether a key exists, for a component that shows a line only where one was written. */
export function hasKey(key: string): key is UiKey {
  return Object.hasOwn(DICTIONARIES.en, key);
}

export function t(locale: Locale, key: UiKey): string {
  return DICTIONARIES[locale][key];
}

export function useTranslations(locale: Locale): (key: UiKey) => string {
  return (key) => t(locale, key);
}
