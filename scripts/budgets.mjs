// Weighs every page of the built site against the budgets of ADR 0025 (src/lib/budgets.ts). Run
// after `npm run build`: it prints each page's first load and fails if any page goes over a ceiling:
// the home's JavaScript, /finding's (ADR 0038), the fonts of a first load, or the whole first load. It also fails while the
// homes' weights /how-its-built cites (src/data/weight.json) differ from the build's;
// `npm run budgets -- --write` writes them from the build.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { BUDGETS, holdsOn, homeWeights, kilobytes, overruns, recordDrift, weigh } from '../src/lib/budgets.ts';
import { DEFAULT_LOCALE } from '../src/lib/locales.ts';

const BASE = '/why-keep-a-promise/';
const RECORD = fileURLToPath(new URL('../src/data/weight.json', import.meta.url));

/** @param {string} dir */
function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

/**
 * Weighs every page of a built site.
 * @param {string} dist the build's folder
 * @param {string} base the site's base path, as its URLs carry it
 * @returns {import('../src/lib/budgets.ts').PageWeight[]}
 */
export function weighSite(dist, base = BASE) {
  /** @param {string} url */
  const fileOf = (url) => {
    const path = decodeURIComponent(url.split(/[?#]/)[0] ?? '');
    if (!path.startsWith(base)) return null;
    const file = join(dist, path.slice(base.length));
    try {
      return statSync(file).isFile() ? file : null;
    } catch {
      return null;
    }
  };
  /** @type {import('../src/lib/budgets.ts').Reader} */
  const reader = {
    text: (url) => {
      const file = fileOf(url);
      return file ? readFileSync(file, 'utf8') : null;
    },
    bytes: (url, kind) => {
      const file = fileOf(url);
      if (!file) return null;
      const raw = readFileSync(file);
      return kind === 'font' || kind === 'image' ? raw.length : gzipSync(raw).length;
    },
    compressed: (text) => gzipSync(text).length,
  };
  return htmlFiles(dist).map((file) => {
    const path = relative(dist, file).split(sep).join('/');
    const page = `${base}${path.replace(/index\.html$/, '')}`;
    const html = readFileSync(file);
    const home = path === 'index.html' || /^[a-z]{2}\/index\.html$/.test(path);
    return weigh(page, html.toString('utf8'), gzipSync(html).length, home, reader);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url));
  const weights = weighSite(dist);
  const width = Math.max(...weights.map((w) => w.page.length));
  console.log(`${'page'.padEnd(width)}  ${BUDGETS.map((b) => `${b.id} (≤ ${kilobytes(b.bytes)})`.padStart(28)).join('')}`);
  for (const weight of weights.sort((a, b) => a.page.localeCompare(b.page))) {
    const cells = BUDGETS.map((b) => (holdsOn(b, weight) ? kilobytes(weight.totals[b.measure]) : '—').padStart(28));
    console.log(`${weight.page.padEnd(width)}  ${cells.join('')}`);
  }
  const over = overruns(weights);
  if (over.length > 0) {
    for (const o of over) console.error(`✗ ${o.page}: ${o.budget} is ${kilobytes(o.bytes)}, over its ceiling of ${kilobytes(o.ceiling)}`);
    process.exit(1);
  }
  console.log(`✓ ${weights.length} pages within every budget (ADR 0025).`);

  const homes = homeWeights(weights, BASE, DEFAULT_LOCALE);
  if (process.argv.includes('--write')) {
    writeFileSync(RECORD, `${JSON.stringify({ tool: 'npm run budgets', pages: homes }, null, 2)}\n`);
    console.log(`wrote ${RECORD}`);
  } else {
    const drift = recordDrift(JSON.parse(readFileSync(RECORD, 'utf8')).pages, homes);
    if (drift.length > 0) {
      for (const line of drift) console.error(`✗ src/data/weight.json: ${line}`);
      console.error('Run `npm run budgets -- --write` after the build, so /how-its-built cites what it weighs.');
      process.exit(1);
    }
    console.log('✓ /how-its-built cites the homes as they weigh (src/data/weight.json).');
  }
}
