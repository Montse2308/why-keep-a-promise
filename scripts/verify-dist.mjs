// Checks the built site against the lock (ADR 0026). Run after `npm run build`.
//
// The lock covers chapter 7's finding (its prose, the curve and its control, its links), all of
// /finding and the engine part of /how-its-built. While MANUSCRIPT_STATUS in src/config.ts is
// 'in-preparation', it fails if any file in dist/ carries a mark of that content: its data
// attributes, the charts' ids, the control's hook, the finding's first beat (which only the film's
// timeline names) or a key phrase of its prose and charts. Once the status is 'under-review', it
// fails if the locked content is missing from any page that carries it, so a broken unlock is caught
// too. While locked, no page links to /finding either: chapter 7, the notebook's entry and the credits
// link to it only behind the lock.
//
// In both states it also checks the status sentence (docs/content-rules.md, rule (b)): the active one
// appears exactly `STATUS_ON_HOME` times on each home page, and the other one appears nowhere.

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
  // Chapter 7's finding: the cards the envelope holds, and the timeline's first beat past it.
  'data-finding',
  'third-reason',
];

/** What each unlocked page must carry, by its path in dist/. */
export const UNLOCKED_PAGES = {
  'index.html': ['data-locked-content', 'finding-curve', 'data-finding', 'third-reason'],
  'es/index.html': ['data-locked-content', 'finding-curve', 'data-finding', 'third-reason'],
  'finding/index.html': ['data-locked-content', 'finding-guilt', 'identification result'],
  'es/finding/index.html': ['data-locked-content', 'finding-guilt', 'resultado de identificación'],
  'how-its-built/index.html': ['data-locked-content', 'by imitation'],
  'es/how-its-built/index.html': ['data-locked-content', 'por imitación'],
};

/** Every mark some unlocked page must carry. */
export const UNLOCKED_MARKERS = [...new Set(Object.values(UNLOCKED_PAGES).flat())];

/** The home pages, by their path in dist/, with their locale. */
export const HOME_PAGES = { 'index.html': 'en', 'es/index.html': 'es' };

/**
 * The active status sentence on each home page: the stamp on chapter 7's envelope, and the notebook's
 * entry for the finding (ADR 0026), which the footer carries until the panel comes (ADR 0024, P5).
 */
export const STATUS_ON_HOME = 2;

/** /finding itself, in both languages: the only pages that may link to it while locked (its language switch). */
export const FINDING_PAGES = ['finding/index.html', 'es/finding/index.html'];

/** The two manuscript states (docs/content-rules.md, rule (b)). */
export const STATUSES = /** @type {const} */ (['in-preparation', 'under-review']);

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
 * The manuscript status declared in src/config.ts.
 * @param {string} source
 * @returns {'in-preparation' | 'under-review'}
 */
export function readStatus(source) {
  const match = /MANUSCRIPT_STATUS\s*:[^=]*=\s*'([a-z-]+)'/.exec(source);
  const status = match?.[1];
  if (status !== 'in-preparation' && status !== 'under-review') {
    throw new Error(`Cannot read MANUSCRIPT_STATUS from src/config.ts (got ${String(status)})`);
  }
  return status;
}

/**
 * How many elements of an HTML text hold exactly this sentence and nothing else: the way chapter 7's
 * stamp, the notebook's entry and /finding render the status sentence. The same words inside a longer
 * sentence of prose do not count ("…until the manuscript is under review. While…" on /how-its-built).
 * @param {string} html
 * @param {string} sentence
 * @returns {number}
 */
export function countStandalone(html, sentence) {
  const needle = normalize(sentence).trim();
  if (needle === '') throw new Error('countStandalone needs a sentence');
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...normalize(html).matchAll(new RegExp(`>\\s*${escaped}\\s*<`, 'g'))].length;
}

/**
 * Problems with the status sentence (rule (b), ADR 0026): the active one must stand alone exactly
 * `STATUS_ON_HOME` times on each home page, and the inactive one on no page at all.
 * @param {'in-preparation' | 'under-review'} status
 * @param {Record<string, Record<string, string>>} dictionaries the UI strings, by locale
 * @param {Record<string, string>} pages the text of each HTML page, by its path in dist/
 * @returns {string[]}
 */
export function statusProblems(status, dictionaries, pages) {
  const sentence = (locale, state) => {
    const value = dictionaries[locale]?.[`manuscript.status.${state}`];
    if (!value) throw new Error(`No status sentence for ${locale}/${state}`);
    return value;
  };
  const problems = [];
  for (const [page, locale] of Object.entries(HOME_PAGES)) {
    const text = pages[page];
    if (text === undefined) {
      problems.push(`${page}: missing`);
      continue;
    }
    const count = countStandalone(text, sentence(locale, status));
    if (count !== STATUS_ON_HOME) problems.push(`${page}: the status sentence appears ${count} times, not ${STATUS_ON_HOME}`);
  }
  for (const other of STATUSES.filter((state) => state !== status)) {
    for (const [page, text] of Object.entries(pages)) {
      for (const locale of Object.keys(dictionaries)) {
        if (countStandalone(text, sentence(locale, other)) > 0) problems.push(`${page}: carries the '${other}' sentence while the status is '${status}'`);
      }
    }
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
 * Pages that link to /finding while the lock is closed (ADR 0026). /finding shows its title and the
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
  const status = readStatus(readFileSync(join(root, 'src', 'config.ts'), 'utf8'));
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
  const problems = statusProblems(status, dictionaries, pages);
  if (problems.length > 0) {
    console.error(`verify:dist: the manuscript status sentence is off (rule (b)):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }

  if (status === 'in-preparation') {
    const leaks = files.flatMap((file) => findMarks(readFileSync(file, 'utf8')).map((mark) => `${relative(root, file)}: ${mark}`));
    if (leaks.length > 0) {
      console.error(`verify:dist: the lock is closed ('in-preparation'), but dist/ carries locked content:\n  ${leaks.join('\n  ')}`);
      process.exit(1);
    }
    const links = lockedLinkProblems(pages);
    if (links.length > 0) {
      console.error(`verify:dist: the lock is closed ('in-preparation'), but pages link to /finding:\n  ${links.join('\n  ')}`);
      process.exit(1);
    }
    console.log(
      `verify:dist: locked; ${files.length} files in dist/ carry none of its ${MARKERS.length} marks, no page links to /finding, and the status sentence appears ${STATUS_ON_HOME} times on each home page.`,
    );
    return;
  }

  const missing = Object.entries(UNLOCKED_PAGES).flatMap(([page, marks]) => {
    const file = join(dist, ...page.split('/'));
    const found = findMarks(readFileSync(file, 'utf8'), marks);
    return marks.filter((mark) => !found.includes(mark)).map((mark) => `${relative(root, file)}: ${mark}`);
  });
  if (missing.length > 0) {
    console.error(`verify:dist: the manuscript is under review, but the locked content did not unlock:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }
  console.log(
    `verify:dist: unlocked ('under-review') on all ${Object.keys(UNLOCKED_PAGES).length} pages that carry locked content, and the status sentence appears ${STATUS_ON_HOME} times on each home page.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
