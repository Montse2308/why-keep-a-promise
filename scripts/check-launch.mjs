// The launch's own check (ADR 0034, step 3 of docs/launch-checklist.md). Run after `npm run build`;
// `npm run check:launch` builds first.
//
// It fails while any placeholder for a link that is not known yet is left: the working paper's page
// on SSRN and the DOI of the engine's release on Zenodo, written in src/config.ts until launch as
// literal names ending in `_PENDING`. It reads every text file of dist/, src/ (its tests aside, which
// name the placeholders on purpose) and the two READMEs. Not part of CI, which builds before launch
// and must stay green; deploy.yml runs it before anything is uploaded.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** A placeholder: a name in capitals that ends in `_PENDING`, such as the SSRN link's. */
const PLACEHOLDER = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_PENDING\b/g;

const TEXT_FILES = new Set(['.html', '.js', '.mjs', '.ts', '.astro', '.css', '.svg', '.xml', '.txt', '.json', '.md', '.webmanifest']);

/**
 * The placeholders left in a text, with their line numbers.
 * @param {string} text
 * @returns {{ line: number, name: string }[]}
 */
export function placeholdersIn(text) {
  return text.split('\n').flatMap((line, i) => [...line.matchAll(PLACEHOLDER)].map((match) => ({ line: i + 1, name: match[0] })));
}

/**
 * Whether a file is one this check reads: text, and not a test.
 * @param {string} path
 */
export function isChecked(path) {
  return TEXT_FILES.has(extname(path)) && !/\.test\.[cm]?[jt]s$/.test(path);
}

/**
 * Every file this check reads under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return isChecked(path) ? [path] : [];
  });
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  let built;
  try {
    built = files(join(root, 'dist'));
  } catch {
    console.error('check:launch: no dist/ directory; run `npm run build` first.');
    process.exit(1);
  }
  const read = [...built, ...files(join(root, 'src')), join(root, 'README.md'), join(root, 'README.es.md')];
  const left = read.flatMap((file) => placeholdersIn(readFileSync(file, 'utf8')).map(({ line, name }) => `${relative(root, file).split('\\').join('/')}:${line}: ${name}`));
  if (left.length > 0) {
    console.error(`check:launch: ${left.length} placeholders are left; replace them at step 3 of docs/launch-checklist.md:\n  ${left.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`check:launch: no placeholder left in ${read.length} files of dist/, src/ and the READMEs.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
