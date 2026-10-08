// Checks the built site against the lock (ADR 0034). Run after `npm run build`.
//
// The lock covers chapter 7's finding (its prose, the curve and its control, its links), all of
// /finding, the engine part of /how-its-built and the finding's sources on /sources (ADR 0035).
// While the working paper's link in src/config.ts (WORKING_PAPER.ssrn) is still a placeholder, the
// lock is closed, and this fails if any file in
// dist/ carries a mark of that content: its data attributes, the charts' ids, the control's hook, the
// finding's first beat (which only the film's timeline names) or a key phrase of its prose and
// charts. The working paper's title is left out of that search: it is part of the status sentence,
// which shows in both states. Once the link is real, the lock is open, and this fails if the locked
// content is missing from any page that carries it, so a broken unlock is caught too. While locked,
// no page links to /finding either: chapter 7, the notebook's panel, its footer, the credits and
// /sources link to it only behind the lock; and /finding asks not to be indexed, which it stops asking once
// unlocked. The sitemap lists every page but the 404, and /finding only once unlocked.
//
// In both states it also checks the status sentence (docs/content-rules.md, rule (b)): it stands
// alone exactly `STATUS_ON_HOME` times on each home page, each time linked to the working paper. And
// every page has its description, the same in Open Graph, without the status sentence and, while
// locked, without a mark of the locked content.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Marks of the locked content, matched without regard to case or line breaks. */
export const MARKERS = [
  'data-locked-content',
  'finding-curve',
  'data-curve',
  'Kawagoe',
  'personal guilt',
  'culpa personal',
  'partner-specific commitment',
  'compromiso específico a la pareja',
  'background trust',
  'confianza de fondo',
  // /finding: its chart and its prose.
  'finding-guilt',
  'θ',
  'identification result',
  'resultado de identificación',
  // /how-its-built: the engine.
  'seeded generator',
  'generador con semilla',
  'by imitation',
  'por imitación',
  // The engine's repository (src/config.ts), linked only behind the lock (src/lib/engine.ts).
  'Montse2308/Dilema-del-Prisionero',
  // Chapter 7's finding: the cards the envelope holds, and the timeline's first beat past it.
  'data-finding',
  'third-reason',
];

/** What each unlocked page must carry, by its path in dist/. */
export const UNLOCKED_PAGES = {
  'index.html': ['data-locked-content', 'finding-curve', 'data-finding', 'third-reason', 'Montse2308/Dilema-del-Prisionero'],
  'es/index.html': ['data-locked-content', 'finding-curve', 'data-finding', 'third-reason', 'Montse2308/Dilema-del-Prisionero'],
  'finding/index.html': ['data-locked-content', 'finding-guilt', 'identification result', 'Montse2308/Dilema-del-Prisionero'],
  'es/finding/index.html': ['data-locked-content', 'finding-guilt', 'resultado de identificación', 'Montse2308/Dilema-del-Prisionero'],
  'how-its-built/index.html': ['data-locked-content', 'by imitation', 'Montse2308/Dilema-del-Prisionero'],
  'es/how-its-built/index.html': ['data-locked-content', 'por imitación', 'Montse2308/Dilema-del-Prisionero'],
  // /sources lists the finding's sources only behind the lock (ADR 0035).
  'sources/index.html': ['data-locked-content', 'Kawagoe', 'Montse2308/Dilema-del-Prisionero'],
  'es/sources/index.html': ['data-locked-content', 'Kawagoe', 'Montse2308/Dilema-del-Prisionero'],
};

/** Every mark some unlocked page must carry. */
export const UNLOCKED_MARKERS = [...new Set(Object.values(UNLOCKED_PAGES).flat())];

/** The home pages, by their path in dist/, with their locale. */
export const HOME_PAGES = { 'index.html': 'en', 'es/index.html': 'es' };

/**
 * The status sentence on each home page: the stamp on chapter 7's envelope, and the notebook's entry
 * for the finding, in its panel (ADR 0024, ADR 0034).
 */
export const STATUS_ON_HOME = 2;

/** /finding itself, in both languages: the only pages that may link to it while locked (its language switch). */
export const FINDING_PAGES = ['finding/index.html', 'es/finding/index.html'];

/** The page GitHub Pages serves for a missing address (src/pages/404.astro): it has no description, since nothing indexes it. */
export const NOT_FOUND_PAGE = '404.html';

const TEXT_FILES = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.xml', '.txt', '.json', '.webmanifest']);

/** @param {string} text */
function normalize(text) {
  return text.replace(/\s+/g, ' ').toLocaleLowerCase('und');
}

/**
 * The markers found in a text.
 * @param {string} text
 * @param {readonly string[]} [markers]
 * @returns {string[]}
 */
export function findMarks(text, markers = MARKERS) {
  const haystack = normalize(text);
  return markers.filter((marker) => haystack.includes(normalize(marker)));
}

/**
 * The marks of the locked content in a text, leaving out the working paper's title: it is part of the
 * status sentence, which shows in both states of the lock (ADR 0034), though it names two of the
 * finding's reasons.
 * @param {string} text
 * @param {string} title
 * @returns {string[]}
 */
export function lockedMarks(text, title) {
  const needle = normalize(title).trim();
  if (needle === '') throw new Error('lockedMarks needs the working paper’s title');
  return findMarks(normalize(text).split(needle).join(' '));
}

/**
 * The working paper as src/config.ts declares it: its title and its link on SSRN.
 * @param {string} source
 * @returns {{ title: string, ssrn: string }}
 */
export function readPaper(source) {
  const block = /WORKING_PAPER\s*=\s*\{([\s\S]*?)\}/.exec(source)?.[1] ?? '';
  const title = /\btitle:\s*'([^']+)'/.exec(block)?.[1];
  const ssrn = /\bssrn:\s*'([^']+)'/.exec(block)?.[1];
  if (!title || !ssrn) throw new Error('Cannot read WORKING_PAPER (title, ssrn) from src/config.ts');
  return { title, ssrn };
}

/**
 * Whether a link is still a placeholder for step 3 of docs/launch-checklist.md, such as
 * `SSRN_URL_PENDING`: the rule of `isPending` in src/lib/lock.ts, which a test keeps the same.
 * @param {string} link
 */
export function isPendingLink(link) {
  return link.endsWith('_PENDING');
}

/**
 * The status sentence in one language, as its elements read: the working paper's title in its place.
 * @param {Record<string, string>} dictionary the UI strings of the language
 * @param {string} title
 */
export function statusSentence(dictionary, title) {
  const sentence = dictionary['paper.status'];
  if (!sentence || sentence.split('{title}').length !== 2) throw new Error('No status sentence with one {title} (paper.status)');
  return sentence.replace('{title}', title);
}

/**
 * An HTML text without the tags that may sit inside the status sentence: the link to the working
 * paper and the italics of its title. What is left of its element is the sentence alone.
 * @param {string} html
 */
export function withoutInlineTags(html) {
  return html.replace(/<\/?(?:a|cite|em|i)\b[^>]*>/gi, '');
}

/**
 * How many elements of an HTML text hold exactly this sentence and nothing else: the way chapter 7's
 * stamp, the notebook's entry and /finding render the status sentence. The same words inside a longer
 * sentence of prose do not count.
 * @param {string} html
 * @param {string} sentence
 * @returns {number}
 */
export function countStandalone(html, sentence) {
  const needle = normalize(sentence).trim();
  if (needle === '') throw new Error('countStandalone needs a sentence');
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...normalize(withoutInlineTags(html)).matchAll(new RegExp(`>\\s*${escaped}\\s*<`, 'g'))].length;
}

/**
 * How many links an HTML text has to this address.
 * @param {string} html
 * @param {string} url
 */
export function linksTo(html, url) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)].filter((match) => decodeAttribute(match[1]) === url).length;
}

/**
 * Problems with the status sentence (rule (b), ADR 0034): it must stand alone exactly
 * `STATUS_ON_HOME` times on each home page, each time linked to the working paper on SSRN.
 * @param {{ title: string, ssrn: string }} paper
 * @param {Record<string, Record<string, string>>} dictionaries the UI strings, by locale
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string[]}
 */
export function statusProblems(paper, dictionaries, pages) {
  const problems = [];
  for (const [page, locale] of Object.entries(HOME_PAGES)) {
    const text = pages[page];
    const dictionary = dictionaries[locale];
    if (text === undefined) {
      problems.push(`${page}: missing`);
      continue;
    }
    if (!dictionary) throw new Error(`No UI strings for ${locale}`);
    const count = countStandalone(text, statusSentence(dictionary, paper.title));
    if (count !== STATUS_ON_HOME) problems.push(`${page}: the status sentence appears ${count} times, not ${STATUS_ON_HOME}`);
    const links = linksTo(text, paper.ssrn);
    if (links !== STATUS_ON_HOME) problems.push(`${page}: links to the working paper ${links} times, not ${STATUS_ON_HOME}`);
  }
  return problems;
}

/**
 * How many links an HTML text has to /finding, in either language.
 * @param {string} html
 * @returns {number}
 */
export function findingLinks(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="[^"]*\/finding\/(?:#[^"]*)?"/gi)].length;
}

/**
 * Pages that link to /finding while the lock is closed (ADR 0034). /finding shows its title and the
 * status sentence then, and only its own language switch leads to it.
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string[]}
 */
export function lockedLinkProblems(pages) {
  return Object.entries(pages)
    .filter(([page]) => !FINDING_PAGES.includes(page))
    .flatMap(([page, text]) => {
      const count = findingLinks(text);
      return count > 0 ? [`${page}: links to /finding ${count === 1 ? 'once' : `${count} times`}`] : [];
    });
}

/** @param {string} text an attribute's value as HTML writes it */
function decodeAttribute(text) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
    if (name[0] !== '#') return named[/** @type {keyof typeof named} */ (name.toLowerCase())] ?? entity;
    return String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
  });
}

/**
 * A page's description and its Open Graph copy (src/lib/meta.ts), as its head carries them; `null`
 * for one that is missing.
 * @param {string} html
 * @returns {{ name: string | null, og: string | null }}
 */
export function descriptionsOf(html) {
  /** @param {RegExp} pattern */
  const read = (pattern) => {
    const value = pattern.exec(html)?.[1];
    return value === undefined ? null : decodeAttribute(value);
  };
  return {
    name: read(/<meta\s+name="description"\s+content="([^"]*)"/i),
    og: read(/<meta\s+property="og:description"\s+content="([^"]*)"/i),
  };
}

/**
 * Problems with the pages' descriptions, a new place for the lock to leak through (point 4 of the
 * external review): every page has one, the same in `og:description`; none repeats a status sentence
 * (rule (b): the home says it exactly twice, /finding carries the site's question), and while the
 * lock is closed, none carries a mark of the locked content.
 * @param {{ title: string, ssrn: string }} paper the lock is closed while its link is a placeholder
 * @param {Record<string, Record<string, string>>} dictionaries the UI strings, by locale
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string[]}
 */
export function descriptionProblems(paper, dictionaries, pages) {
  const locked = isPendingLink(paper.ssrn);
  const sentences = Object.values(dictionaries).map((dictionary) => statusSentence(dictionary, paper.title));
  return Object.entries(pages).flatMap(([page, html]) => {
    if (page === NOT_FOUND_PAGE) return [];
    const { name, og } = descriptionsOf(html);
    if (!name?.trim()) return [`${page}: no description`];
    if (og !== name) return [`${page}: og:description is not its description`];
    const problems = [];
    if (sentences.some((sentence) => normalize(name).includes(normalize(sentence)))) problems.push(`${page}: the description repeats the status sentence`);
    if (locked) problems.push(...lockedMarks(name, paper.title).map((mark) => `${page}: the description carries locked content: ${mark}`));
    return problems;
  });
}

/**
 * Whether a page asks search engines not to index it.
 * @param {string} html
 */
export function isNoindex(html) {
  return /<meta\s+name="robots"\s+content="[^"]*\bnoindex\b[^"]*"/i.test(html);
}

/**
 * Problems with `noindex` (point 13 of the external review): while the lock is closed, /finding is a
 * title and the status sentence and carries it; once open, /finding is indexed like any page. The
 * 404 page always carries it, and no other page ever does.
 * @param {boolean} locked whether the lock is closed
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string[]}
 */
export function noindexProblems(locked, pages) {
  const state = locked ? 'closed' : 'open';
  const hidden = [NOT_FOUND_PAGE, ...(locked ? FINDING_PAGES : [])];
  const problems = hidden.filter((page) => pages[page] !== undefined && !isNoindex(pages[page])).map((page) => `${page}: no noindex while the lock is ${state}`);
  for (const [page, html] of Object.entries(pages)) {
    if (!hidden.includes(page) && isNoindex(html)) problems.push(`${page}: noindex while the lock is ${state}`);
  }
  for (const page of FINDING_PAGES.filter((page) => pages[page] === undefined)) problems.push(`${page}: missing`);
  return problems;
}

/** The sitemap's path in dist/ (src/pages/sitemap.xml.ts). */
export const SITEMAP = 'sitemap.xml';

/**
 * The site's root URL, base included, as the English home names itself in its canonical link.
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string | null}
 */
export function siteRoot(pages) {
  const value = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(pages['index.html'] ?? '')?.[1];
  return value === undefined ? null : decodeAttribute(value);
}

/**
 * Problems with the sitemap, a new place for the lock to leak through: every URL it names is a page
 * of dist/ under the site's root, not the 404 page; it lists every page; and while the lock is
 * closed it leaves /finding out, in either language and as an alternate too.
 * @param {boolean} locked whether the lock is closed
 * @param {string | undefined} xml the sitemap
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string[]}
 */
export function sitemapProblems(locked, xml, pages) {
  if (xml === undefined) return [`${SITEMAP}: missing`];
  const root = siteRoot(pages);
  if (!root) return ['index.html: no canonical link to read the site from'];
  const listed = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => decodeAttribute(match[1]));
  const named = [...listed, ...[...xml.matchAll(/<xhtml:link\b[^>]*\bhref="([^"]*)"/g)].map((match) => decodeAttribute(match[1]))];
  /** @param {string} url */
  const pageOf = (url) => (url.startsWith(root) ? `${url.slice(root.length)}index.html` : null);
  const problems = [...new Set(named)].flatMap((url) => {
    const page = pageOf(url);
    if (page === null || page === NOT_FOUND_PAGE || pages[page] === undefined) return [`${SITEMAP}: ${url} is not a page of the site`];
    if (locked && FINDING_PAGES.includes(page)) return [`${SITEMAP}: names ${url} while the lock is closed`];
    return [];
  });
  const expected = Object.keys(pages).filter((page) => page !== NOT_FOUND_PAGE && !(locked && FINDING_PAGES.includes(page)));
  const pagesListed = new Set(listed.map(pageOf));
  for (const page of expected) if (!pagesListed.has(page)) problems.push(`${SITEMAP}: leaves out ${page}`);
  return problems;
}

/**
 * Every text file under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function textFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return textFiles(path);
    return TEXT_FILES.has(extname(name)) ? [path] : [];
  });
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const dist = join(root, 'dist');
  const paper = readPaper(readFileSync(join(root, 'src', 'config.ts'), 'utf8'));
  const locked = isPendingLink(paper.ssrn);
  let files;
  try {
    files = textFiles(dist);
  } catch {
    console.error('verify:dist: no dist/ directory; run `npm run build` first.');
    process.exit(1);
  }

  const dictionaries = Object.fromEntries(
    Object.values(HOME_PAGES).map((locale) => [locale, JSON.parse(readFileSync(join(root, 'src', 'i18n', `${locale}.json`), 'utf8'))]),
  );
  const pages = Object.fromEntries(
    files.filter((file) => extname(file) === '.html').map((file) => [relative(dist, file).split('\\').join('/'), readFileSync(file, 'utf8')]),
  );
  const problems = statusProblems(paper, dictionaries, pages);
  if (problems.length > 0) {
    console.error(`verify:dist: the status sentence is off (rule (b)):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  const descriptions = descriptionProblems(paper, dictionaries, pages);
  if (descriptions.length > 0) {
    console.error(`verify:dist: the pages' descriptions are off:\n  ${descriptions.join('\n  ')}`);
    process.exit(1);
  }
  const described = Object.keys(pages).filter((page) => page !== NOT_FOUND_PAGE).length;
  const indexing = noindexProblems(locked, pages);
  if (indexing.length > 0) {
    console.error(`verify:dist: noindex is off:\n  ${indexing.join('\n  ')}`);
    process.exit(1);
  }
  const sitemapFile = join(dist, SITEMAP);
  const sitemap = files.includes(sitemapFile) ? readFileSync(sitemapFile, 'utf8') : undefined;
  const mapping = sitemapProblems(locked, sitemap, pages);
  if (mapping.length > 0) {
    console.error(`verify:dist: the sitemap is off:\n  ${mapping.join('\n  ')}`);
    process.exit(1);
  }

  if (locked) {
    const leaks = files.flatMap((file) => lockedMarks(readFileSync(file, 'utf8'), paper.title).map((mark) => `${relative(root, file)}: ${mark}`));
    if (leaks.length > 0) {
      console.error(`verify:dist: the lock is closed (the working paper's link is still ${paper.ssrn}), but dist/ carries locked content:\n  ${leaks.join('\n  ')}`);
      process.exit(1);
    }
    const links = lockedLinkProblems(pages);
    if (links.length > 0) {
      console.error(`verify:dist: the lock is closed (the working paper's link is still ${paper.ssrn}), but pages link to /finding:\n  ${links.join('\n  ')}`);
      process.exit(1);
    }
    console.log(
      `verify:dist: locked (the working paper's link is still ${paper.ssrn}); ${files.length} files in dist/ carry none of its ${MARKERS.length} marks, no page or the sitemap links to /finding and it is noindex, the status sentence appears ${STATUS_ON_HOME} times on each home page with its link, and all ${described} pages have a clean description.`,
    );
    return;
  }

  const missing = Object.entries(UNLOCKED_PAGES).flatMap(([page, marks]) => {
    const file = join(dist, ...page.split('/'));
    const found = findMarks(readFileSync(file, 'utf8'), marks);
    return marks.filter((mark) => !found.includes(mark)).map((mark) => `${relative(root, file)}: ${mark}`);
  });
  if (missing.length > 0) {
    console.error(`verify:dist: the working paper is public, but the locked content did not unlock:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }
  console.log(
    `verify:dist: unlocked (the working paper is public) on all ${Object.keys(UNLOCKED_PAGES).length} pages that carry locked content and /finding is indexed and in the sitemap, the status sentence appears ${STATUS_ON_HOME} times on each home page with its link, and all ${described} pages have a clean description.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
