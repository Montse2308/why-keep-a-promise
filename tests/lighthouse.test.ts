import { describe, expect, it } from 'vitest';
import lighthouse from '../src/data/lighthouse.json';
import script from '../scripts/lighthouse.mjs?raw';
import { medianRun, summarise } from '../scripts/lighthouse.mjs';
import { BUDGETS, LCP_CEILING_MS, type BudgetId } from '../src/lib/budgets';
import { LOCALES } from '../src/lib/locales';

const ceiling = (id: BudgetId) => BUDGETS.find((b) => b.id === id)?.bytes ?? 0;

/** A report as Lighthouse writes it, cut to what the summary reads. */
const report = (lcp: number, extra: Partial<{ version: string; formFactor: string }> = {}) => ({
  lighthouseVersion: extra.version ?? '13.5.0',
  fetchTime: '2026-10-01T21:26:06.047Z',
  requestedUrl: 'http://localhost:4322/why-keep-a-promise/',
  configSettings: { formFactor: extra.formFactor ?? 'mobile', throttlingMethod: 'simulate', throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 } },
  environment: { networkUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36' },
  categories: { performance: { score: 0.97 } },
  audits: {
    'largest-contentful-paint': { numericValue: lcp },
    'first-contentful-paint': { numericValue: 1800.4 },
    'total-blocking-time': { numericValue: 43.6 },
    'cumulative-layout-shift': { numericValue: 0 },
    'resource-summary': {
      details: {
        items: [
          { resourceType: 'total', transferSize: 216_167 },
          { resourceType: 'font', transferSize: 122_364 },
          { resourceType: 'script', transferSize: 15_986 },
        ],
      },
    },
  },
});

describe('summarising Lighthouse reports', () => {
  it('keeps the median run by LCP, whole, from an odd number of runs', () => {
    expect(medianRun([report(2300), report(2100), report(2200)])?.audits['largest-contentful-paint']?.numericValue).toBe(2200);
    expect(() => medianRun([report(1), report(2)])).toThrow(/odd/);
  });

  it('records where the figures come from, and the figures of one run', () => {
    const summary = summarise({ en: [report(2131.3)], es: [report(2147.2)] });
    expect(summary.provenance).toMatchObject({ tool: 'Lighthouse', version: '13.5.0', measured: '2026-10-01', device: 'moto g power (2022)', cpuSlowdownMultiplier: 4, runs: 1 });
    expect(summary.pages[0]).toEqual({ locale: 'en', route: 'home', lcpMs: 2131, fcpMs: 1800, tbtMs: 44, cls: 0, score: 0.97, bytes: { script: 15_986, font: 122_364, total: 216_167 } });
  });

  it('refuses reports of different versions, or not made on an emulated phone', () => {
    expect(() => summarise({ en: [report(1)], es: [report(1, { version: '12.0.0' })] })).toThrow(/versions/);
    expect(() => summarise({ en: [report(1, { formFactor: 'desktop' })] })).toThrow(/phone/);
  });
});

describe('the measurement /how-its-built cites', () => {
  it('measures the home in every language, with the Lighthouse the script pins', () => {
    expect(lighthouse.pages.map((p) => `${p.locale}/${p.route}`).sort()).toEqual(LOCALES.map((l) => `${l}/home`).sort());
    expect(script).toContain(`npx lighthouse@${lighthouse.provenance.version} `);
    expect(lighthouse.provenance).toMatchObject({ formFactor: 'mobile', throttlingMethod: 'simulate', cpuSlowdownMultiplier: 4 });
    expect(lighthouse.provenance.measured).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('is the median of three runs or more', () => {
    expect(lighthouse.provenance.runs).toBeGreaterThanOrEqual(3);
    expect(lighthouse.provenance.runs % 2).toBe(1);
  });

  it('meets ADR 0025: LCP within 2.5 s, and every weight within its ceiling', () => {
    for (const page of lighthouse.pages) {
      expect(page.lcpMs, page.locale).toBeLessThanOrEqual(LCP_CEILING_MS);
      expect(page.bytes.script).toBeLessThanOrEqual(ceiling('home-script'));
      expect(page.bytes.font).toBeLessThanOrEqual(ceiling('fonts'));
      expect(page.bytes.total).toBeLessThanOrEqual(ceiling('first-load'));
    }
  });
});
