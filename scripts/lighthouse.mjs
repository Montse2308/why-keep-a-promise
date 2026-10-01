// Summarises Lighthouse reports of the two home pages into src/data/lighthouse.json, the measurement
// /how-its-built cites (ADR 0025: LCP ≤ 2.5 s on a mid-range phone emulated over 4G). Lighthouse is
// not a dependency: it runs apart, pinned, against `npm run preview`, three times per page:
//
//   npx lighthouse@13.5.0 http://localhost:4322/why-keep-a-promise/ --only-categories=performance \
//     --output=json --output-path=<report.json> --chrome-flags="--headless=new"
//
// node scripts/lighthouse.mjs en=<run1.json>,<run2.json>,<run3.json> es=<...>
// Of each page's runs it keeps the median by LCP, whole, so every figure comes from one run.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * @typedef {{ lighthouseVersion: string, fetchTime: string, requestedUrl: string,
 *   configSettings: { formFactor: string, throttlingMethod: string,
 *     throttling: { rttMs: number, throughputKbps: number, cpuSlowdownMultiplier: number } },
 *   environment: { networkUserAgent: string },
 *   categories: { performance: { score: number } },
 *   audits: Record<string, { numericValue?: number, details?: { items?: { resourceType?: string, transferSize?: number }[] } }> }} Report
 */

/**
 * The median run, by LCP: the middle one of an odd number of runs.
 * @param {Report[]} runs
 */
export function medianRun(runs) {
  if (runs.length % 2 === 0) throw new Error('Take an odd number of runs, so the median is one of them');
  const lcp = (/** @type {Report} */ r) => r.audits['largest-contentful-paint']?.numericValue ?? Infinity;
  return [...runs].sort((a, b) => lcp(a) - lcp(b))[(runs.length - 1) / 2];
}

/**
 * What /how-its-built shows of one run.
 * @param {Report} report
 * @param {string} locale
 */
export function pageSummary(report, locale) {
  const value = (/** @type {string} */ id) => {
    const v = report.audits[id]?.numericValue;
    if (v === undefined) throw new Error(`The report has no ${id}`);
    return v;
  };
  const items = report.audits['resource-summary']?.details?.items ?? [];
  const bytes = (/** @type {string} */ type) => items.find((item) => item.resourceType === type)?.transferSize ?? 0;
  return {
    locale,
    route: 'home',
    lcpMs: Math.round(value('largest-contentful-paint')),
    fcpMs: Math.round(value('first-contentful-paint')),
    tbtMs: Math.round(value('total-blocking-time')),
    cls: Math.round(value('cumulative-layout-shift') * 1000) / 1000,
    score: report.categories.performance.score,
    bytes: { script: bytes('script'), font: bytes('font'), total: bytes('total') },
  };
}

/**
 * @param {Record<string, Report[]>} runsByLocale
 */
export function summarise(runsByLocale) {
  const pages = Object.entries(runsByLocale).map(([locale, runs]) => ({ report: medianRun(runs), locale, runs: runs.length }));
  const first = pages[0]?.report;
  if (!first) throw new Error('No reports');
  for (const { report } of pages) {
    if (report.lighthouseVersion !== first.lighthouseVersion) throw new Error('The reports come from different versions of Lighthouse');
    if (report.configSettings.formFactor !== 'mobile' || report.configSettings.throttlingMethod !== 'simulate') throw new Error('Measure on an emulated phone, with simulated throttling');
  }
  const { throttling } = first.configSettings;
  return {
    provenance: {
      tool: 'Lighthouse',
      version: first.lighthouseVersion,
      measured: first.fetchTime.slice(0, 10),
      served: 'npm run preview',
      formFactor: first.configSettings.formFactor,
      device: /Android [^;]+;\s*(.+?)\)\s*AppleWebKit/.exec(first.environment.networkUserAgent)?.[1]?.trim() ?? 'emulated phone',
      throttlingMethod: first.configSettings.throttlingMethod,
      rttMs: throttling.rttMs,
      throughputKbps: throttling.throughputKbps,
      cpuSlowdownMultiplier: throttling.cpuSlowdownMultiplier,
      runs: Math.min(...pages.map((p) => p.runs)),
      statistic: 'median run by LCP',
    },
    pages: pages.map(({ report, locale }) => pageSummary(report, locale)),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  /** @type {Record<string, Report[]>} */
  const runs = {};
  for (const arg of process.argv.slice(2)) {
    const [locale, files] = arg.split('=');
    if (!locale || !files) throw new Error(`Expected locale=report.json,…, got ${arg}`);
    runs[locale] = files.split(',').map((file) => JSON.parse(readFileSync(file, 'utf8')));
  }
  const out = fileURLToPath(new URL('../src/data/lighthouse.json', import.meta.url));
  writeFileSync(out, `${JSON.stringify(summarise(runs), null, 2)}\n`);
  console.log(`wrote ${out}`);
}
