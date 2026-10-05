/**
 * What each page says of itself in its head, for search engines and shared links: its description.
 * The notebook's pages reuse their line in the panel (src/lib/notebook.ts); the home has its own.
 * /finding has no line: it carries the site's question, in both states of the lock, so its
 * description says nothing of the finding and never repeats the status sentence (rule (b)).
 */
import { t, type Locale, type UiKey } from './i18n';
import { notebookPage } from './notebook';
import type { Route } from './routes';

/** The key of a page's description. */
export function descriptionKey(route: Route): UiKey {
  if (route === 'home') return 'site.description';
  return notebookPage(route).lineKey ?? 'site.title';
}

/** A page's description, as `<meta name="description">` and `og:description` carry it. */
export function description(locale: Locale, route: Route): string {
  return t(locale, descriptionKey(route));
}
