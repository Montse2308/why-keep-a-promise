// Checks the built site against act 5's lock (ADR 0015). Run after `npm run build`.
//
// While MANUSCRIPT_STATUS in src/config.ts is 'in-preparation', it fails if any file in dist/
// carries a mark of act 5's locked content: its data attribute, the chart's id, moment 3's hook or
// a key phrase of its prose and chart. Once the status is 'under-review', it fails if act 5's full
// content is missing from either home page instead, so a broken unlock is caught too.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Marks of act 5's locked content, matched without regard to case or line breaks. */
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
];

/** What the unlocked home pages must carry. */
export const UNLOCKED_MARKERS = ['data-locked-content', 'finding-curve'];

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

  if (status === 'in-preparation') {
    const leaks = files.flatMap((file) => findMarks(readFileSync(file, 'utf8')).map((mark) => `${relative(root, file)}: ${mark}`));
    if (leaks.length > 0) {
      console.error(`verify:dist: act 5 is locked ('in-preparation'), but dist/ carries its content:\n  ${leaks.join('\n  ')}`);
      process.exit(1);
    }
    console.log(`verify:dist: act 5 locked; ${files.length} files in dist/ carry none of its ${MARKERS.length} marks.`);
    return;
  }

  const homes = [join(dist, 'index.html'), join(dist, 'es', 'index.html')];
  const missing = homes.flatMap((file) => {
    const found = findMarks(readFileSync(file, 'utf8'), UNLOCKED_MARKERS);
    return UNLOCKED_MARKERS.filter((mark) => !found.includes(mark)).map((mark) => `${relative(root, file)}: ${mark}`);
  });
  if (missing.length > 0) {
    console.error(`verify:dist: the manuscript is under review, but act 5 did not unlock:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }
  console.log("verify:dist: act 5 unlocked ('under-review') on both home pages.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
