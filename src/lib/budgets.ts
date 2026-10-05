/**
 * The weight budgets (ADR 0025) and how a built page is weighed against them. Pure: it reads HTML,
 * CSS and JavaScript as text and is handed the files' sizes, so the tests can weigh a page made up
 * for them, and `scripts/budgets.mjs` weighs every page of dist/ after the build.
 *
 * A page's first load is what a browser fetches to show it: the HTML, its stylesheets, its scripts
 * (inline, and each module with the modules it imports statically), and the fonts it needs. Text is
 * counted as it travels, compressed with gzip; fonts are counted as they are, since woff2 is already
 * compressed. A font counts when the page preloads it, or when its family's @font-face covers a
 * character the page holds (its `unicode-range`); every family the page declares is taken as used.
 * A kilobyte is 1024 bytes (a KiB), as Lighthouse counts its budgets, and the fonts and first-load
 * ceilings hold on every page (ADR 0028, which makes ADR 0025's budgets precise).
 */

export const KB = 1024;

export const BUDGET_IDS = ['home-script', 'fonts', 'first-load'] as const;
export type BudgetId = (typeof BUDGET_IDS)[number];

export interface Budget {
  readonly id: BudgetId;
  /** The ceiling, in bytes as they travel. */
  readonly bytes: number;
  /** Whether it holds on the home pages only (the film's script) or on every page. */
  readonly home: boolean;
}

/** ADR 0025, read as ADR 0028 says: the home's JavaScript, the fonts of a first load, and the whole first load. */
export const BUDGETS: readonly Budget[] = [
  { id: 'home-script', bytes: 40 * KB, home: true },
  { id: 'fonts', bytes: 160 * KB, home: false },
  { id: 'first-load', bytes: 450 * KB, home: false },
];

/** The other target of ADR 0025, measured with Lighthouse on an emulated mid-range phone over 4G. */
export const LCP_CEILING_MS = 2500;

export type ResourceKind = 'html' | 'script' | 'style' | 'font' | 'image';

export interface Resource {
  readonly kind: ResourceKind;
  /** The URL as the page writes it, or `inline` for a script inside the HTML. */
  readonly url: string;
  readonly bytes: number;
}

export interface PageWeight {
  readonly page: string;
  readonly home: boolean;
  readonly resources: readonly Resource[];
  readonly totals: Record<BudgetId, number>;
}

export interface Overrun {
  readonly page: string;
  readonly budget: BudgetId;
  readonly bytes: number;
  readonly ceiling: number;
}

/** What weighing needs from the built site: a file's text, and its size as it travels. */
export interface Reader {
  /** The text of a file, by its URL as a page writes it; null if dist/ has no such file. */
  text(url: string): string | null;
  /** Bytes as served: gzip for text, the raw size for fonts and images; null if missing. */
  bytes(url: string, kind: ResourceKind): number | null;
  /** Bytes of a piece of text as it travels, compressed: for the scripts inside a page. */
  compressed(text: string): number;
}

const ATTRIBUTE = (name: string) => new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');

/** The value of an attribute in a start tag, or null. */
export function attribute(tag: string, name: string): string | null {
  const match = ATTRIBUTE(name).exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : null;
}

export interface PageRefs {
  /** External module and classic scripts, in order. */
  readonly scripts: readonly string[];
  /** The text of each inline script. */
  readonly inlineScripts: readonly string[];
  readonly styles: readonly string[];
  /** Fonts the page preloads. */
  readonly preloads: readonly string[];
  /** Images the page fetches on load: <img src>, the tab's icon. */
  readonly images: readonly string[];
  /** The text of every inline <style>. */
  readonly inlineStyles: readonly string[];
}

/** What a page's HTML asks the browser for on its first load. */
export function refsOf(html: string): PageRefs {
  const scripts: string[] = [];
  const inlineScripts: string[] = [];
  const styles: string[] = [];
  const preloads: string[] = [];
  const images: string[] = [];
  const inlineStyles: string[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const tag = `<script${match[1] ?? ''}>`;
    const type = attribute(tag, 'type');
    // Data blocks (JSON and the like) are not run, and they are already counted with the HTML.
    if (type && !/^(module|text\/javascript|application\/javascript)$/i.test(type)) continue;
    const src = attribute(tag, 'src');
    if (src) scripts.push(src);
    else if ((match[2] ?? '').trim()) inlineScripts.push(match[2] ?? '');
  }
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = (attribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
    const url = attribute(tag, 'href');
    if (!url) continue;
    if (rel.includes('stylesheet')) styles.push(url);
    else if (rel.includes('preload') && attribute(tag, 'as') === 'font') preloads.push(url);
    else if (rel.includes('modulepreload')) scripts.push(url);
    else if (rel.includes('icon')) images.push(url);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = attribute(match[0], 'src');
    if (src && attribute(match[0], 'loading') !== 'lazy') images.push(src);
  }
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) inlineStyles.push(match[1] ?? '');
  return { scripts, inlineScripts, styles, preloads, images, inlineStyles };
}

/** The modules a script imports statically; dynamic `import()` loads later, so it is not counted. */
export function importsOf(js: string): string[] {
  const found = new Set<string>();
  for (const match of js.matchAll(/(?:^|[;}\s])import\s*(?:[\w$*{},\s]+?\s*from\s*)?["']([^"']+)["']/g)) {
    if (match[1]) found.add(match[1]);
  }
  for (const match of js.matchAll(/(?:^|[;}\s])export\s*(?:\*|\{[^}]*\})\s*from\s*["']([^"']+)["']/g)) {
    if (match[1]) found.add(match[1]);
  }
  return [...found];
}

/** A URL relative to the file that names it, kept as a path from the site's root. */
export function resolveUrl(url: string, from: string): string {
  if (/^[a-z]+:/i.test(url) || url.startsWith('//')) return url;
  return new URL(url, new URL(from, 'https://site.invalid/')).pathname;
}

export interface FontFace {
  readonly family: string;
  readonly url: string;
  /** Inclusive code point ranges; empty means every character. */
  readonly ranges: readonly (readonly [number, number])[];
}

/** Parses a `unicode-range` value: `U+0000-00FF,U+0131,U+02??`. */
export function parseRanges(value: string): [number, number][] {
  return value
    .split(',')
    .map((part) => part.trim().replace(/^U\+/i, ''))
    .filter(Boolean)
    .map((part): [number, number] => {
      if (part.includes('?')) return [parseInt(part.replace(/\?/g, '0'), 16), parseInt(part.replace(/\?/g, 'F'), 16)];
      const [from = '', to = from] = part.split('-');
      return [parseInt(from, 16), parseInt(to, 16)];
    });
}

/** Every @font-face of a stylesheet that loads a file. */
export function fontFacesOf(css: string): FontFace[] {
  const faces: FontFace[] = [];
  for (const match of css.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
    const body = match[1] ?? '';
    const url = /url\(\s*["']?([^"')]+)["']?\s*\)/i.exec(body)?.[1];
    if (!url) continue;
    const family = (/font-family\s*:\s*([^;]+)/i.exec(body)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
    const range = /unicode-range\s*:\s*([^;]+)/i.exec(body)?.[1];
    faces.push({ family, url, ranges: range ? parseRanges(range) : [] });
  }
  return faces;
}

/** The characters a page may draw: its markup without scripts and styles, attributes included. */
export function pageText(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

/** Whether any character of the text falls in the face's ranges (an empty range list covers all). */
export function covers(face: FontFace, codePoints: ReadonlySet<number>): boolean {
  if (face.ranges.length === 0) return true;
  for (const point of codePoints) if (face.ranges.some(([from, to]) => point >= from && point <= to)) return true;
  return false;
}

/** The code points of a text, once each; ASCII spaces and controls are left out. */
export function codePointsOf(text: string): Set<number> {
  const points = new Set<number>();
  for (const char of text) {
    const point = char.codePointAt(0) ?? 0;
    if (point > 0x20) points.add(point);
  }
  return points;
}

/** Weighs one page of the built site: `page` is its URL from the site's root, e.g. `/base/es/`. */
export function weigh(page: string, html: string, htmlBytes: number, home: boolean, read: Reader): PageWeight {
  const refs = refsOf(html);
  const resources: Resource[] = [{ kind: 'html', url: page, bytes: htmlBytes }];
  const seen = new Set<string>([page]);
  const add = (kind: ResourceKind, url: string): boolean => {
    if (seen.has(url) || /^(data|blob):/i.test(url)) return false;
    seen.add(url);
    const bytes = read.bytes(url, kind);
    if (bytes === null) throw new Error(`${page} asks for ${url}, which dist/ does not have`);
    resources.push({ kind, url, bytes });
    return true;
  };

  // Inline scripts travel inside the HTML; they are listed apart so the home's script is complete.
  const inlineBytes = refs.inlineScripts.map((js) => read.compressed(js));
  const queue = refs.scripts.map((src) => resolveUrl(src, page));
  for (const js of refs.inlineScripts) queue.push(...importsOf(js).map((url) => resolveUrl(url, page)));
  while (queue.length > 0) {
    const url = queue.shift() ?? '';
    if (!add('script', url)) continue;
    for (const imported of importsOf(read.text(url) ?? '')) queue.push(resolveUrl(imported, url));
  }

  const sheets: { css: string; from: string }[] = refs.inlineStyles.map((css) => ({ css, from: page }));
  for (const href of refs.styles) {
    const url = resolveUrl(href, page);
    if (add('style', url)) sheets.push({ css: read.text(url) ?? '', from: url });
  }

  const points = codePointsOf(pageText(html));
  for (const url of refs.preloads) add('font', resolveUrl(url, page));
  for (const { css, from } of sheets) {
    for (const face of fontFacesOf(css)) if (covers(face, points)) add('font', resolveUrl(face.url, from));
  }
  for (const url of refs.images) add('image', resolveUrl(url, page));

  const sum = (kinds: readonly ResourceKind[]) => resources.filter((r) => kinds.includes(r.kind)).reduce((total, r) => total + r.bytes, 0);
  const inline = inlineBytes.reduce((total, bytes) => total + bytes, 0);
  return {
    page,
    home,
    resources,
    totals: {
      'home-script': sum(['script']) + inline,
      fonts: sum(['font']),
      'first-load': sum(['html', 'script', 'style', 'font', 'image']),
    },
  };
}

/** Every budget a page goes over. */
export function overruns(weights: readonly PageWeight[], budgets: readonly Budget[] = BUDGETS): Overrun[] {
  return weights.flatMap((weight) =>
    budgets
      .filter((budget) => !budget.home || weight.home)
      .filter((budget) => weight.totals[budget.id] > budget.bytes)
      .map((budget) => ({ page: weight.page, budget: budget.id, bytes: weight.totals[budget.id], ceiling: budget.bytes })),
  );
}

/** Bytes in KiB, one decimal: `14.3 KiB`. */
export function kilobytes(bytes: number): string {
  return `${(bytes / KB).toFixed(1)} KiB`;
}

/**
 * A home's weights as /how-its-built cites them, from src/data/weight.json. `npm run budgets -- --write`
 * writes that record from the build; plain `npm run budgets` fails while it differs from the build.
 */
export interface HomeWeight {
  readonly locale: string;
  readonly route: 'home';
  readonly bytes: Record<BudgetId, number>;
}

/**
 * The language of a page by its URL: the default one at `/base/`, `es` at `/base/es/`. Kept free of
 * imports, since `scripts/budgets.mjs` loads this file in Node, so the default language is handed in.
 */
export function homeLocale(page: string, base: string, defaultLocale: string): string | null {
  if (page === base) return defaultLocale;
  const match = page.startsWith(base) ? /^([a-z]{2})\/$/.exec(page.slice(base.length)) : null;
  return match?.[1] ?? null;
}

/** Each home's weights, the default language first, then the others by name. */
export function homeWeights(weights: readonly PageWeight[], base: string, defaultLocale: string): HomeWeight[] {
  return weights
    .filter((w) => w.home)
    .map((w) => {
      const locale = homeLocale(w.page, base, defaultLocale);
      if (!locale) throw new Error(`${w.page} is not a home`);
      return { locale, route: 'home' as const, bytes: { ...w.totals } };
    })
    .sort((a, b) => Number(b.locale === defaultLocale) - Number(a.locale === defaultLocale) || a.locale.localeCompare(b.locale));
}

/** Where the record differs from the build, at the precision /how-its-built shows (0.1 KiB). */
export function recordDrift(record: readonly HomeWeight[], built: readonly HomeWeight[]): string[] {
  const extra = record.filter((r) => !built.some((home) => home.locale === r.locale)).map((r) => `the ${r.locale} home is cited and not built`);
  return built.flatMap((home) => {
    const cited = record.find((r) => r.locale === home.locale && r.route === home.route);
    if (!cited) return [`the ${home.locale} home is not cited`];
    return BUDGET_IDS.filter((id) => kilobytes(cited.bytes[id]) !== kilobytes(home.bytes[id])).map(
      (id) => `the ${home.locale} home's ${id} is cited as ${kilobytes(cited.bytes[id])} and weighs ${kilobytes(home.bytes[id])}`,
    );
  }).concat(extra);
}
