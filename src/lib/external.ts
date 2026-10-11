/**
 * Links that leave the site open in a new tab (step 8.3 of P8); links inside it stay in the tab, because
 * the film remembers what was played in its own tab entry (ADR 0029). An external link carries
 * `target="_blank"`, `rel="noopener noreferrer"` and a mark after its text: a small arrow, hidden from
 * a screen reader, and for a screen reader only, that it opens in a new tab, in the page's language.
 *
 * The mark never wraps onto a line of its own (step 9.10 of P9): it goes with the last characters of the
 * link's text in a span that does not wrap (`.link-end`, src/styles/base.css). A long address may still
 * break before them.
 *
 * The components write their links with `externalAttrs` and `externalText`; the prose's Markdown, the
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

/** How many characters of the link's last word, at most, keep the mark company. */
export const TAIL = 6;

/** One character of HTML text: a character reference counts as one. */
const CHARACTER = /&(?:#\d+|#x[\da-f]+|[a-z][\da-z]*);|[^&]|&/giu;

/** The closing tags that end an HTML text, with any space between them. */
const CLOSERS = /(?:<\/[a-z][\da-z-]*\s*>\s*)*$/i;

/**
 * A link's inner HTML ending in its mark, glued to its last characters: the last word, at most `TAIL`
 * characters of it, and the mark go in a span that does not wrap. When the text ends inside an element
 * (`<cite>`, `<em>`), the span goes inside it. A link inside the site is left as written.
 */
export function withMark(html: string, href: string, locale: Locale): string {
  const mark = externalMark(href, locale);
  if (mark === '') return html;
  const closers = CLOSERS.exec(html)?.[0] ?? '';
  const body = html.slice(0, html.length - closers.length);
  const characters = body.slice(body.lastIndexOf('>') + 1).match(CHARACTER) ?? [];
  const word = characters.slice(-TAIL);
  const tail = word.slice(word.findLastIndex((character) => /^\s$/.test(character)) + 1).join('');
  if (tail === '') return `${html}${mark}`;
  return `${body.slice(0, body.length - tail.length)}<span class="link-end">${tail}${mark}</span>${closers}`;
}

/** A component's link text, escaped, ending in its mark (`withMark`). */
export function externalText(text: string, href: string, locale: Locale): string {
  return withMark(escapeHtml(text), href, locale);
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
    return `<a${rest} target="${EXTERNAL_TARGET}" rel="${externalRel(rel ?? undefined)}">${withMark(inner, href, locale)}</a>`;
  });
}
