/**
 * Links that leave the site open in a new tab (step 8.3 of P8); links inside it stay in the tab, because
 * the film remembers what was played in its own tab entry (ADR 0029). An external link carries
 * `target="_blank"`, `rel="noopener noreferrer"` and a mark after its text: a small arrow, hidden from
 * a screen reader, and for a screen reader only, that it opens in a new tab, in the page's language.
 *
 * The components write their links with `externalAttrs` and `externalMark`; the prose's Markdown, the
 * film's captions and the notebook's pages, goes through `externalLinks` once rendered.
 * `npm run verify:dist` checks every link of dist/ the same way (scripts/verify-dist.mjs).
 */
import { t, type Locale } from './i18n';

export const EXTERNAL_TARGET = '_blank';
export const EXTERNAL_REL = 'noopener noreferrer';
/** The arrow after an external link's text. */
export const EXTERNAL_ARROW = '↗';

/** Whether a link leaves the site: an absolute http(s) URL, or one relative to the scheme. */
export function isExternal(href: string): boolean {
  return /^(?:https?:)?\/\//i.test(href.trim());
}

/** A link's `rel` with `noopener noreferrer` added to what it already says, each token once. */
export function externalRel(rel?: string): string {
  const tokens = (rel ?? '').split(/\s+/).filter((token) => token !== '');
  return [...new Set([...tokens, ...EXTERNAL_REL.split(' ')])].join(' ');
}

/** The attributes an `<a>` of a component spreads: none for a link inside the site. */
export function externalAttrs(href: string, rel?: string): { target?: string; rel?: string } {
  if (!isExternal(href)) return rel ? { rel } : {};
  return { target: EXTERNAL_TARGET, rel: externalRel(rel) };
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * The mark that ends an external link's text, as HTML: empty for a link inside the site. The notice is
 * marked with the page's language, since it may sit in a reference marked English on a page in Spanish.
 */
export function externalMark(href: string, locale: Locale): string {
  if (!isExternal(href)) return '';
  const notice = escapeHtml(t(locale, 'link.newTab'));
  return `<span class="link-out"><span aria-hidden="true">${EXTERNAL_ARROW}</span><span class="visually-hidden" lang="${locale}"> ${notice}</span></span>`;
}

const ANCHOR = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

/** The value of an attribute in an HTML start tag's attributes, as written; `null` if it has none. */
function attribute(attributes: string, name: string): string | null {
  const found = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i').exec(attributes);
  return found ? (found[1] ?? found[2] ?? found[3] ?? '') : null;
}

/**
 * Rendered HTML with every external link opening in a new tab and ending in its mark. A link that
 * already says where it opens (`target`) is left as written, so the transform can run twice.
 */
export function externalLinks(html: string, locale: Locale): string {
  return html.replace(ANCHOR, (whole, attributes: string, inner: string) => {
    const href = attribute(attributes, 'href');
    if (href === null || !isExternal(href) || attribute(attributes, 'target') !== null) return whole;
    const rel = attribute(attributes, 'rel');
    const rest = rel === null ? attributes : attributes.replace(/\srel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+)/i, '');
    return `<a${rest} target="${EXTERNAL_TARGET}" rel="${externalRel(rel ?? undefined)}">${inner}${externalMark(href, locale)}</a>`;
  });
}
