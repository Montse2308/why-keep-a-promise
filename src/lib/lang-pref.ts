import { isLocale, type Locale } from './i18n';

export const LANG_PREF_KEY = 'wkap:locale';

/** Reads the stored locale; storage can be missing or throw (private mode, blocked). */
export function readLangPref(storage: Pick<Storage, 'getItem'> | undefined): Locale | null {
  try {
    const value = storage?.getItem(LANG_PREF_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeLangPref(storage: Pick<Storage, 'setItem'> | undefined, locale: Locale): void {
  try {
    storage?.setItem(LANG_PREF_KEY, locale);
  } catch {
    // The preference is a convenience; ignore storage failures.
  }
}

/**
 * Redirects to the preferred locale only on entry from outside the site, so
 * in-site navigation and explicit language choices are never overridden.
 */
export function shouldRedirect(
  preferred: Locale | null,
  current: Locale,
  referrer: string,
  origin: string,
): boolean {
  if (preferred === null || preferred === current) return false;
  if (referrer === '') return true;
  try {
    return new URL(referrer).origin !== origin;
  } catch {
    return true;
  }
}
